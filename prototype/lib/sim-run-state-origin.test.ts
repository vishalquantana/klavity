// A Sim started on one application runs on THAT application only — never on Klavity's own pages or another app (lib/sim-run-state.ts).
import { expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { runningSimIds, runSims, stopSims, clearSimRuns, lastRunOrigin, normOrigin } from "./sim-run-state"

const mk = () => createClient({ url: "file:" + join(tmpdir(), `klav-sim-origin-${Date.now()}-${randomUUID()}.db`) })
const P = "proj_1", ME = "me@t.local"
const PX4 = "http://px4mvp.local", KLAV = "https://klavity.in"
const ids = async (c: ReturnType<typeof mk>, origin?: string | null) => [...(await runningSimIds(c, P, ME, origin))].sort()

test("normOrigin: lower-cased web origin, anything else is ''", () => {
  expect(normOrigin("HTTP://PX4MVP.local:8080/some/page?x=1")).toBe("http://px4mvp.local:8080")
  expect(normOrigin("https://klavity.in/vishal/KD-1")).toBe("https://klavity.in")
  expect(normOrigin("")).toBe("")
  expect(normOrigin("not a url")).toBe("")
  expect(normOrigin("chrome-extension://abc/page.html")).toBe("")
})

test("a Sim run on px4 is NOT running on Klavity's own pages", async () => {
  const c = mk()
  await runSims(c, P, ME, ["a", "b"], Date.now(), PX4)
  expect(await ids(c, PX4)).toEqual(["a", "b"])
  expect(await ids(c, KLAV)).toEqual([])
  expect(await ids(c, "http://other-app.test")).toEqual([])
})

test("no origin = the Sims tab's status view: running anywhere counts", async () => {
  const c = mk()
  await runSims(c, P, ME, ["a"], Date.now(), PX4)
  expect(await ids(c)).toEqual(["a"])
  expect(await ids(c, null)).toEqual(["a"])
})

test("the same Sim can run on two applications independently", async () => {
  const c = mk()
  await runSims(c, P, ME, ["a"], Date.now(), PX4)
  await runSims(c, P, ME, ["a"], Date.now(), KLAV)
  await stopSims(c, P, ME, ["a"], PX4)
  expect(await ids(c, PX4)).toEqual([])
  expect(await ids(c, KLAV)).toEqual(["a"])
})

test("stop_all on one application leaves the others running; with no origin it stops everywhere", async () => {
  const c = mk()
  await runSims(c, P, ME, ["a"], Date.now(), PX4)
  await runSims(c, P, ME, ["b"], Date.now(), KLAV)
  await stopSims(c, P, ME, null, PX4)
  expect(await ids(c, PX4)).toEqual([])
  expect(await ids(c, KLAV)).toEqual(["b"])
  await runSims(c, P, ME, ["a"], Date.now(), PX4)
  await stopSims(c, P, ME, null)
  expect(await ids(c)).toEqual([])
})

test("Deactivate clears a Sim on every application", async () => {
  const c = mk()
  await runSims(c, P, ME, ["a"], Date.now(), PX4)
  await runSims(c, P, ME, ["a"], Date.now(), KLAV)
  await clearSimRuns(c, P, "a")
  expect(await ids(c)).toEqual([])
})

test("lastRunOrigin: the application most recently started on (used by Run from the Sims tab)", async () => {
  const c = mk()
  expect(await lastRunOrigin(c, P, ME)).toBe("")
  await runSims(c, P, ME, ["a"], 1000, KLAV)
  await runSims(c, P, ME, ["a"], 2000, PX4)
  expect(await lastRunOrigin(c, P, ME)).toBe("http://px4mvp.local")
  await runSims(c, P, ME, ["b"], 3000)               // no origin recorded → ignored
  expect(await lastRunOrigin(c, P, ME)).toBe("http://px4mvp.local")
})

test("rows from before origin scoping carry over once and match every application; stopping removes them", async () => {
  const c = mk()
  await c.execute("CREATE TABLE sim_run_state (project_id TEXT NOT NULL, user_email TEXT NOT NULL, sim_id TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (project_id, user_email, sim_id))")
  await c.execute({ sql: "INSERT INTO sim_run_state VALUES (?,?,?,?)", args: [P, ME, "old", 1] })
  expect(await ids(c, PX4)).toEqual(["old"])
  expect(await ids(c, KLAV)).toEqual(["old"])
  await stopSims(c, P, ME, ["old"], KLAV)
  expect(await ids(c, PX4)).toEqual([])               // stopped, and not resurrected from the old table on a later read
})
