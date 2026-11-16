// KD-2255: AutoSim Projects API — auth, validation, cross-project isolation, credential scoping,
// author test_case_id validation, and that secrets are never returned. Spins a real server subprocess
// against a fresh temp DB (same hermetic pattern as server.test-accounts.route.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const freePort = () => new Promise<number>((res, rej) => {
  const s = net.createServer(); s.on("error", rej)
  s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
})

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-asp-route-${ts}.db`)
const NOW = Date.now()
const ME = `me-${ts}@test.local`, MEMBER = `mem-${ts}@test.local`, STRANGER = `x-${ts}@test.local`
const P = `proj_asp_${ts}`, OTHER = `proj_asp_other_${ts}`

let BASE = "", proc: ReturnType<typeof Bun.spawn>
const raw = createClient({ url: "file:" + dbFile })

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir, stdout: "pipe", stderr: "pipe",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + dbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.alloc(32, 7).toString("base64"), KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key" },
  })
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(200)
  }
  await raw.execute("PRAGMA busy_timeout=5000")
  const x = (sql: string, args: any[]) => raw.execute({ sql, args })
  for (const e of [ME, MEMBER, STRANGER]) await x(`INSERT INTO users (email, created_at) VALUES (?,?)`, [e, NOW])
  await x(`INSERT INTO accounts (id,name,owner_email,plan,created_at) VALUES (?,?,?,?,?)`, ["acct_a" + ts, "A", ME, "free", NOW])
  await x(`INSERT INTO accounts (id,name,owner_email,plan,created_at) VALUES (?,?,?,?,?)`, ["acct_b" + ts, "B", STRANGER, "free", NOW])
  await x(`INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)`, [P, "acct_a" + ts, "Main", NOW, NOW])
  await x(`INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)`, [OTHER, "acct_b" + ts, "Other", NOW, NOW])
  await x(`INSERT INTO project_members (id,project_id,email,project_role,created_at) VALUES (?,?,?,?,?)`, ["pm1" + ts, P, ME, "admin", NOW])
  await x(`INSERT INTO project_members (id,project_id,email,project_role,created_at) VALUES (?,?,?,?,?)`, ["pm2" + ts, P, MEMBER, "member", NOW])
  await x(`INSERT INTO project_members (id,project_id,email,project_role,created_at) VALUES (?,?,?,?,?)`, ["pm3" + ts, OTHER, STRANGER, "admin", NOW])
  for (const [sid, e] of [["s_me" + ts, ME], ["s_mem" + ts, MEMBER], ["s_x" + ts, STRANGER]]) await x(`INSERT INTO sessions (id,email,created_at,expires_at) VALUES (?,?,?,?)`, [sid, e, NOW, NOW + 86400_000])
  await x(`INSERT INTO trails (id,project_id,name,base_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`, ["trl_legacy" + ts, P, "Legacy AutoSim", "https://x.test", "active", NOW, NOW])
}, 60_000)
afterAll(() => { proc?.kill(); raw.close() })

const as = (who: "me" | "mem" | "x") => `klav_session=s_${who}${ts}`
async function call(who: "me" | "mem" | "x" | null, method: string, path: string, body?: any, project = P) {
  const r = await fetch(`${BASE}${path}${path.includes("?") ? "&" : "?"}project=${project}`, {
    method, headers: { ...(who ? { cookie: as(who) } : {}), ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: r.status, body: await r.json().catch(() => ({})) as any }
}

test("full hierarchy over HTTP + validation", async () => {
  expect((await call(null, "GET", "/api/autosim-projects")).status).toBe(401)
  expect((await call("me", "POST", "/api/autosim-projects", { name: "  " })).status).toBe(400)
  expect((await call("me", "POST", "/api/autosim-projects", { name: "x".repeat(81) })).status).toBe(400)

  const ap = await call("mem", "POST", "/api/autosim-projects", { name: "Website", description: "Main site" })
  expect(ap.status).toBe(201)
  const apId = ap.body.project.id
  expect((await call("me", "POST", "/api/autosim-projects", { name: "Website" })).status).toBe(409)

  const g = await call("me", "POST", `/api/autosim-projects/${apId}/groups`, { name: "Login Scenarios" })
  expect(g.status).toBe(201)
  const tc = await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { start_url: "https://app.test/login", name: "Valid login", group_id: g.body.group.id })
  expect(tc.status).toBe(201)
  expect(tc.body.testCase.groupId).toBe(g.body.group.id)
  expect((await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { start_url: "https://app.test/login", name: "bad", status: "nope" })).status).toBe(400)
  expect((await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { start_url: "https://app.test/login", name: "bad", group_id: "atg_missing" })).status).toBe(400)

  // link the pre-existing (legacy, unassigned) AutoSim → appears under the test case
  const detail0 = await call("me", "GET", `/api/autosim-projects/${apId}`)
  expect(detail0.body.unassignedTrails.map((t: any) => t.id)).toContain("trl_legacy" + ts)
  const tcId = tc.body.testCase.id
  expect((await call("me", "PUT", `/api/autosim-projects/${apId}/test-cases/${tcId}/trails/trl_legacy${ts}`)).status).toBe(200)
  const detail = await call("me", "GET", `/api/autosim-projects/${apId}`)
  expect(detail.body.trails[0]).toMatchObject({ id: "trl_legacy" + ts, testCaseId: tcId })
  expect(detail.body.project).toMatchObject({ groupCount: 1, testCaseCount: 1, trailCount: 1 })

  // delete group → test case ungrouped, AutoSim link intact
  expect((await call("me", "DELETE", `/api/autosim-projects/${apId}/groups/${g.body.group.id}`)).status).toBe(200)
  const after = await call("me", "GET", `/api/autosim-projects/${apId}`)
  expect(after.body.testCases[0]).toMatchObject({ groupId: null, trailCount: 1 })
})

test("cross-project isolation: another tenant cannot see or touch this project's AutoSim projects", async () => {
  const ap = await call("me", "POST", "/api/autosim-projects", { name: "Private" })
  const apId = ap.body.project.id
  expect((await call("x", "GET", "/api/autosim-projects")).status).toBe(403)               // ?project=P not theirs
  const own = await call("x", "GET", `/api/autosim-projects/${apId}`, undefined, OTHER)    // their project, my id
  expect(own.status).toBe(404)
  expect((await call("x", "DELETE", `/api/autosim-projects/${apId}`, undefined, OTHER)).status).toBe(404)
  expect((await call("me", "GET", `/api/autosim-projects/${apId}`)).status).toBe(200)
})

test("credentials: scoped to an AutoSim project, secret never returned, admin-only writes", async () => {
  const apId = (await call("me", "POST", "/api/autosim-projects", { name: "Creds" })).body.project.id
  const otherAp = (await call("x", "POST", "/api/autosim-projects", { name: "Theirs" }, OTHER)).body.project.id
  const base = `/api/projects/${P}/test-accounts`
  // scoping to an AutoSim project from another tenant is rejected
  expect((await call("me", "POST", base, { name: "bad", login_email: "a@x.test", password: "pw", autosim_project_id: otherAp })).status).toBe(400)
  const c = await call("me", "POST", base, { name: "admin", login_email: "a@x.test", password: "s3cret-pw", autosim_project_id: apId })
  expect(c.status).toBe(201)
  expect(JSON.stringify(c.body)).not.toContain("s3cret-pw")
  expect(c.body.account.autosimProjectId).toBe(apId)
  const id = c.body.account.id
  // member cannot edit
  expect((await call("mem", "PATCH", `${base}/${id}`, { login_email: "b@x.test" })).status).toBe(403)
  // admin edits email + rotates password; list never leaks the secret
  expect((await call("me", "PATCH", `${base}/${id}`, { login_email: "b@x.test" })).status).toBe(200)
  expect((await call("me", "PATCH", `${base}/${id}`, { password: "new-pw-2" })).status).toBe(200)
  expect((await call("me", "PATCH", `${base}/${id}`, {})).status).toBe(400)   // original rotate-only contract
  const list = await call("me", "GET", base)
  const s = JSON.stringify(list.body)
  expect(s).not.toContain("new-pw-2"); expect(s).not.toContain("s3cret-pw")
  expect(list.body.accounts.find((a: any) => a.id === id)).toMatchObject({ loginEmail: "b@x.test", autosimProjectId: apId })
  // deleting the AutoSim project keeps the credential (now shared)
  expect((await call("me", "DELETE", `/api/autosim-projects/${apId}`)).status).toBe(200)
  const list2 = await call("me", "GET", base)
  expect(list2.body.accounts.find((a: any) => a.id === id).autosimProjectId).toBeNull()
})

test("authoring: test_case_id from another project is rejected before any drive starts", async () => {
  const otherAp = (await call("x", "POST", "/api/autosim-projects", { name: "T" }, OTHER)).body.project.id
  const foreignTc = (await call("x", "POST", `/api/autosim-projects/${otherAp}/test-cases`, { start_url: "https://app.test/login", name: "tc" }, OTHER)).body.testCase.id
  const r = await call("me", "POST", "/api/trails/author", { name: "n", objective: "log in and check the dashboard", base_url: "https://x.test", test_case_id: foreignTc })
  expect(r.status).toBe(400)
  expect(r.body.error).toBe("unknown test case")
})

test("test case execution mode: without credentials / with credentials (by reference name)", async () => {
  const apId = (await call("me", "POST", "/api/autosim-projects", { name: "Exec" })).body.project.id
  const otherApId = (await call("me", "POST", "/api/autosim-projects", { name: "Exec other" })).body.project.id
  const base = `/api/projects/${P}/test-accounts`
  const mk = async (name: string, ap: string | null) => (await call("me", "POST", base, { name, login_email: `${name}@x.test`, password: "pw-" + name, autosim_project_id: ap })).body.account.id
  const admin = await mk("exec-admin", apId), shared = await mk("exec-shared", null), foreign = await mk("exec-foreign", otherApId)

  // default = without credentials
  const plain = await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { start_url: "https://app.test/login", name: "Public pages" })
  expect(plain.body.testCase.testAccountId).toBeNull()
  // with credentials: own-project and shared allowed, another AutoSim project's credential rejected
  const withCreds = await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { start_url: "https://app.test/login", name: "Login flow", test_account_id: admin })
  expect(withCreds.body.testCase.testAccountId).toBe(admin)
  expect((await call("me", "PATCH", `/api/autosim-projects/${apId}/test-cases/${plain.body.testCase.id}`, { test_account_id: shared })).body.testCase.testAccountId).toBe(shared)
  expect((await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { start_url: "https://app.test/login", name: "x", test_account_id: foreign })).status).toBe(400)
  // switch back to without credentials
  expect((await call("me", "PATCH", `/api/autosim-projects/${apId}/test-cases/${plain.body.testCase.id}`, { test_account_id: null })).body.testCase.testAccountId).toBeNull()

  // credentials in use by a test case cannot be deleted
  const del = await call("me", "DELETE", `${base}/${admin}`)
  expect(del.status).toBe(409)
  expect(del.body.refs).toEqual(["Login flow"])

  // creating an AutoSim in the "with credentials" test case (no login picked) logs in with its credential
  const start = await call("me", "POST", "/api/trails/author", { name: "login sim", objective: "log in and open the dashboard", base_url: "https://x.test", test_case_id: withCreds.body.testCase.id })
  expect(start.status).toBe(202)
  const row = (await raw.execute({ sql: "SELECT test_account, test_case_id FROM author_sessions WHERE id=?", args: [start.body.sessionId] })).rows[0] as any
  expect(row.test_account).toBe("exec-admin")
  expect(row.test_case_id).toBe(withCreds.body.testCase.id)
})

test("one AutoSim per test case over HTTP; script export; results summary", async () => {
  const apId = (await call("me", "POST", "/api/autosim-projects", { name: "OnePer" })).body.project.id
  const tcId = (await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { name: "Checkout", start_url: "https://x.test/", description: "buy something and pay" })).body.testCase.id
  const base = `/api/autosim-projects/${apId}/test-cases/${tcId}`
  expect((await call("me", "GET", `${base}/script`)).status).toBe(404)
  await raw.execute({ sql: "INSERT INTO trails (id,project_id,name,base_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", args: ["trl_one" + ts, P, "One", "https://x.test/", "active", NOW, NOW] })
  await raw.execute({ sql: "INSERT INTO trails (id,project_id,name,base_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", args: ["trl_two" + ts, P, "Two", "https://x.test/", "active", NOW, NOW] })
  expect((await call("me", "PUT", `${base}/trails/trl_one${ts}`)).status).toBe(200)
  expect((await call("me", "PUT", `${base}/trails/trl_two${ts}`)).status).toBe(409)   // already has one
  // recording again without an explicit replace is refused; with replace it starts
  const again = await call("me", "POST", "/api/trails/author", { name: "Checkout", objective: "buy something and pay", base_url: "https://x.test/", test_case_id: tcId })
  expect(again.status).toBe(409)
  const replaced = await call("me", "POST", "/api/trails/author", { name: "Checkout", objective: "buy something and pay", base_url: "https://x.test/", test_case_id: tcId, replace: true })
  // passes the one-per-test-case gate: either starts (202) or only hits the single AutoSim slot (busy from an earlier test)
  expect(replaced.status === 202 || /already running/.test(replaced.body.error)).toBe(true)
  // script export of the current AutoSim
  const scr = await fetch(`${BASE}${base}/script?project=${P}`, { headers: { cookie: as("me") } })
  expect(scr.status).toBe(200)
  expect(scr.headers.get("content-disposition")).toContain("checkout.spec.ts")
  expect(await scr.text()).toContain("page.goto")
  // results summary
  await raw.execute({ sql: "INSERT INTO trail_runs (id,trail_id,project_id,trigger,status,llm_calls,started_at,finished_at) VALUES (?,?,?,'manual','green',0,?,?)", args: ["run_one" + ts, "trl_one" + ts, P, NOW, NOW + 3000] })
  const runs = await call("me", "GET", `${base}/runs`)
  expect(runs.status).toBe(200)
  expect(runs.body.runs[0]).toMatchObject({ runId: "run_one" + ts, status: "green", current: true, durationMs: 3000, aiCalls: 0 })
  expect((await call("x", "GET", `${base}/runs`, undefined, OTHER)).status).toBe(404)
  // step-by-step outcome of that run: recorded steps + this run's verdicts (unreached = null)
  const st = (id: string, idx: number, action: string, val: string | null, target: any) => raw.execute({ sql: "INSERT INTO trail_steps (id,trail_id,project_id,idx,action,action_value,target_json,created_at) VALUES (?,?,?,?,?,?,?,?)", args: [id + ts, "trl_one" + ts, P, idx, action, val, target ? JSON.stringify(target) : null, NOW] })
  await st("st_nav", 0, "navigate", "https://x.test/", null)
  await st("st_pw", 1, "type", "{{cred:exec-admin:password}}", { inputType: "password" })
  await st("st_go", 2, "click", null, { accessibleName: "Sign in" })
  await raw.execute({ sql: "INSERT INTO run_steps (id,run_id,trail_id,step_id,project_id,idx,verdict,healed,created_at) VALUES (?,?,?,?,?,?,?,?,?)", args: ["rs_nav" + ts, "run_one" + ts, "trl_one" + ts, "st_nav" + ts, P, 0, "green", 0, NOW] })
  await raw.execute({ sql: "INSERT INTO run_steps (id,run_id,trail_id,step_id,project_id,idx,verdict,healed,diagnosis,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)", args: ["rs_pw" + ts, "run_one" + ts, "trl_one" + ts, "st_pw" + ts, P, 1, "red", 0, "element_gone", NOW] })
  const steps = await call("me", "GET", `${base}/runs/run_one${ts}/steps`)
  expect(steps.status).toBe(200)
  expect(steps.body.steps).toEqual([
    { idx: 0, action: "navigate", value: "https://x.test/", target: null, checkpoint: null, verdict: "green", healed: false, diagnosis: null },
    { idx: 1, action: "type", value: "{{cred:exec-admin:password}}", target: "password field", checkpoint: null, verdict: "red", healed: false, diagnosis: "element_gone" },
    { idx: 2, action: "click", value: null, target: "Sign in", checkpoint: null, verdict: null, healed: false, diagnosis: null },
  ])
  // a run id that isn't this test case's → 404
  const otherTc = (await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { name: "Other", start_url: "https://x.test/" })).body.testCase.id
  expect((await call("me", "GET", `/api/autosim-projects/${apId}/test-cases/${otherTc}/runs/run_one${ts}/steps`)).status).toBe(404)
})

test("old /autosims/projects URLs redirect into the dashboard's AutoSims view", async () => {
  const anon = await fetch(`${BASE}/autosims/projects`, { redirect: "manual" })
  expect(anon.status).not.toBe(200)
  const r = await fetch(`${BASE}/autosims/projects/asp_x/test-cases/atc_y?project=${P}`, { headers: { cookie: as("me") }, redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toBe(`/dashboard?project=${P}&asp=asp_x&asp_tc=atc_y#autosims`)
  const js = await fetch(`${BASE}/vendor/autosim-projects.js`)
  expect(js.status).toBe(200)
  expect(await js.text()).toContain("window.klavAsp")
})

test("test case start_url: required on create, must be http(s), returned on read", async () => {
  const apId = (await call("me", "POST", "/api/autosim-projects", { name: "Urls" })).body.project.id
  expect((await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { name: "no url" })).status).toBe(400)
  expect((await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { name: "bad", start_url: "javascript:alert(1)" })).status).toBe(400)
  const ok = await call("me", "POST", `/api/autosim-projects/${apId}/test-cases`, { name: "Login", start_url: "https://qa2.example.com/", description: "1. Log in\n2. Choose the company" })
  expect(ok.status).toBe(201)
  expect(ok.body.testCase).toMatchObject({ startUrl: "https://qa2.example.com/", description: "1. Log in\n2. Choose the company" })
  // PATCH without start_url leaves it alone
  const p = await call("me", "PATCH", `/api/autosim-projects/${apId}/test-cases/${ok.body.testCase.id}`, { status: "draft" })
  expect(p.body.testCase.startUrl).toBe("https://qa2.example.com/")
})
