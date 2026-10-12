// projectAccessWithRow (ONE query) must make exactly the same access decision as projectAccess (three queries) for every combination of
// account role × project role, for unknown projects and for strangers — and hand back the project row it read.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-pawr-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
const dbm = await import("./db")
const { initDb, projectAccess, projectAccessWithRow } = dbm

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const ACCT = `acct_pa_${RUN}`, P = `proj_pa_${RUN}`
let raw: any
beforeAll(async () => {
  await initDb()
  raw = dbm.db
  const now = Date.now()
  await raw.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at,domain) VALUES (?,?,?,?,?)", args: [ACCT, "PA", `o_${RUN}@x.com`, now, null] })
  await raw.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at,modal_config_json,dedup_enabled) VALUES (?,?,?,?,?,?,?,?,?,?,?)", args: [P, ACCT, "PA", "active", "auto", 200, "named", now, now, JSON.stringify({ screenshots: { enabled: false } }), 0] })
})

const ACCT_ROLES = [null, "owner", "admin", "member"] as const
const PROJ_ROLES = [null, "admin", "member", "viewer", "contributor"] as const

test("every account-role × project-role combination decides identically (admin / member / none)", async () => {
  let n = 0
  for (const ar of ACCT_ROLES) for (const pr of PROJ_ROLES) {
    const email = `u${n++}_${RUN}@x.com`
    if (ar) await raw.execute({ sql: "INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", args: [`am_${n}_${RUN}`, ACCT, email, ar, Date.now()] })
    if (pr) await raw.execute({ sql: "INSERT INTO project_members (id,project_id,email,project_role,created_at) VALUES (?,?,?,?,?)", args: [`pm_${n}_${RUN}`, P, email, pr, Date.now()] })
    const old = await projectAccess(email, P)
    const neu = await projectAccessWithRow(email, P)
    expect(neu.access).toBe(old)
    expect(neu.proj?.id).toBe(P)
  }
  expect(n).toBe(ACCT_ROLES.length * PROJ_ROLES.length)
})
test("a stranger and an unknown project: no access, and no row for an unknown project", async () => {
  expect((await projectAccessWithRow(`nobody_${RUN}@x.com`, P)).access).toBeNull()
  const r = await projectAccessWithRow(`nobody_${RUN}@x.com`, "proj_missing_" + RUN)
  expect(r).toEqual({ proj: null, access: null }); expect(await projectAccess(`nobody_${RUN}@x.com`, "proj_missing_" + RUN)).toBeNull()
})
test("the row it returns carries what the submit path reuses: dedupe flag, screenshot settings (modalConfig), widget gate", async () => {
  const email = `owner_${RUN}@x.com`
  await raw.execute({ sql: "INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", args: [`am_o_${RUN}`, ACCT, email, "owner", Date.now()] })
  const { proj, access } = await projectAccessWithRow(email, P)
  expect(access).toBe("admin")
  expect(proj!.dedupEnabled).toBe(false)
  expect(proj!.modalConfig).toEqual({ screenshots: { enabled: false } })
  expect(dbm.widgetConfigFromProject(proj!).reportGate).toBe("anonymous")
  expect((await dbm.getWidgetConfig(P))!.reportGate).toBe(dbm.widgetConfigFromProject(proj!).reportGate)          // same answer as the old lookup
  expect(await dbm.getProjectModalConfig(P)).toEqual(proj!.modalConfig)
})
