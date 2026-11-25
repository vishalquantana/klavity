// WP-S2 — Sim Active / Deactivate (data layer).
//   personas.active INTEGER NOT NULL DEFAULT 1: every existing Sim stays active; an inactive Sim keeps its row/history but is
//   skipped wherever Sims run or are offered (callers opt in with { activeOnly: true }).
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const DB_FILE = join(tmpdir(), `klav-persona-active-${Date.now()}-${randomUUID()}.db`)
for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }
process.env.TURSO_DATABASE_URL = "file:" + DB_FILE
delete process.env.TURSO_AUTH_TOKEN

const dbMod = await import("./db")
const TS = Date.now()
const ACC = `acc_act_${TS}`, ACC2 = `acc_act2_${TS}`
const PA = `proj_act_a_${TS}`, PB = `proj_act_b_${TS}`, PC = `proj_act_c_${TS}`
const mk = (name: string) => ({ name, role: name + " role", type: "client", initials: "XX", accent: "#6366f1", summary: "s", insights: [], avatar: null, simClass: null, side: null, core: null })

let c: any
beforeAll(async () => {
  c = dbMod.reconnectDb("file:" + DB_FILE)
  await dbMod.applySchema(c)
  await dbMod.migrateV2(c)
  const now = Date.now()
  for (const [acc, owner] of [[ACC, "o@t.local"], [ACC2, "o2@t.local"]]) await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: [acc, acc, owner, now] })
  for (const [p, acc] of [[PA, ACC], [PB, ACC], [PC, ACC2]]) await c.execute({ sql: `INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`, args: [p, acc, p, "active", "auto", 200, "named", now, now] })
  await dbMod.upsertPersona("sim_a1", PA, mk("Alex"))
  await dbMod.upsertPersona("sim_a2", PA, mk("Blair"))
  await dbMod.upsertPersona("sim_c1", PC, mk("Casey"))
  // a global Sim homed in project A, visible in sibling project B
  await dbMod.upsertPersona("sim_g1", PA, mk("Global"))
  await dbMod.setPersonaGlobal("sim_g1", PA, true)
})

test("a NEW Sim starts Deactivated; editing a Sim never changes its Activated/Deactivated state", async () => {
  const all = await dbMod.listPersonas(PA)
  expect(all.length).toBe(3)
  for (const p of all) expect(p.active).toBe(false)   // the user turns on only the Sims they want, on the Sims tab
  // Activate one, then edit it (upsert on the same id) → still active.
  await dbMod.setPersonaActive("sim_a1", PA, true)
  await dbMod.upsertPersona("sim_a1", PA, { ...mk("Alex"), summary: "edited" })
  expect((await dbMod.listPersonas(PA)).find((p: any) => p.id === "sim_a1")?.active).toBe(true)
  // The rest of this file works with active Sims.
  for (const [id, p] of [["sim_a2", PA], ["sim_c1", PC], ["sim_g1", PA]] as const) await dbMod.setPersonaActive(id, p, true)
})

test("a Sim that existed before the active column (column default) stays active", async () => {
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO personas (id,project_id,name,role,type,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", args: ["sim_old", PC, "Old", "r", "client", now, now] })
  expect((await dbMod.listPersonas(PC)).find((p: any) => p.id === "sim_old")?.active).toBe(true)
  await c.execute({ sql: "DELETE FROM personas WHERE id=?", args: ["sim_old"] })
})

test("the migration is safe to run twice", async () => {
  await dbMod.applySchema(c)
  await dbMod.applySchema(c)
  const cols = (await c.execute("PRAGMA table_info(personas)")).rows.map((r: any) => String(r.name))
  expect(cols.filter((n: string) => n === "active").length).toBe(1)
})

test("setPersonaActive deactivates and reactivates; the row and its history stay", async () => {
  expect(await dbMod.setPersonaActive("sim_a1", PA, false)).toBe(true)
  const all = await dbMod.listPersonas(PA)
  expect(all.find((p: any) => p.id === "sim_a1")?.active).toBe(false)   // still listed (history, edit, reactivate)
  expect(all.length).toBe(3)
  expect(await dbMod.setPersonaActive("sim_a1", PA, true)).toBe(true)
  expect((await dbMod.listPersonas(PA)).find((p: any) => p.id === "sim_a1")?.active).toBe(true)
})

test("activeOnly skips inactive Sims; the default still returns everything", async () => {
  await dbMod.setPersonaActive("sim_a2", PA, false)
  expect((await dbMod.listPersonas(PA, { activeOnly: true })).map((p: any) => p.id).sort()).toEqual(["sim_a1", "sim_g1"])
  expect((await dbMod.listPersonas(PA)).length).toBe(3)
  expect((await dbMod.listPersonasForProject(PA, { activeOnly: true })).map((p: any) => p.id).sort()).toEqual(["sim_a1", "sim_g1"])
  expect((await dbMod.listPersonasForProject(PA)).length).toBe(3)
  await dbMod.setPersonaActive("sim_a2", PA, true)
})

test("deactivating a global Sim removes it from sibling projects' run lists, but not their plain list", async () => {
  expect((await dbMod.listPersonasForProject(PB, { activeOnly: true })).map((p: any) => p.id)).toEqual(["sim_g1"])
  await dbMod.setPersonaActive("sim_g1", PA, false)
  expect(await dbMod.listPersonasForProject(PB, { activeOnly: true })).toEqual([])
  expect((await dbMod.listPersonasForProject(PB)).map((p: any) => p.id)).toEqual(["sim_g1"])
  await dbMod.setPersonaActive("sim_g1", PA, true)
})

test("setPersonaActive is scoped to the project: another project cannot toggle the Sim", async () => {
  expect(await dbMod.setPersonaActive("sim_a1", PC, false)).toBe(false)
  expect((await dbMod.listPersonas(PA)).find((p: any) => p.id === "sim_a1")?.active).toBe(true)
  expect(await dbMod.setPersonaActive("sim_nope", PA, false)).toBe(false)
})

test("editing a Sim (upsert) does not reactivate a deactivated Sim", async () => {
  await dbMod.setPersonaActive("sim_a2", PA, false)
  await dbMod.upsertPersona("sim_a2", PA, { ...mk("Blair"), summary: "edited" })
  const p = (await dbMod.listPersonas(PA)).find((x: any) => x.id === "sim_a2")
  expect(p?.summary).toBe("edited")
  expect(p?.active).toBe(false)
})
