# Connector Field Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On first connect to Jira/Linear/Plane/GitHub, read the tracker's real issue types + workflow statuses, auto-align Klavity's report kinds and ticket statuses to them, surface mismatches, and let the user pick — inline in the connect flow.

**Architecture:** Add two optional metadata methods (`listIssueTypes`/`listStatuses`) + a `capabilities` descriptor to the shared `Connector` interface; implement per adapter. Persist the report kind on feedback so exports can pick an issue type per bug/feature. Auto-match runs server-side in a pure lib (`connector-automatch.ts`) behind a new `POST /api/connectors/meta` endpoint; the dashboard renders two mapping tables and saves `issue_type_map`/`status_map` into connector config.

**Tech Stack:** Bun + TypeScript (`prototype/`), libsql/Turso, vanilla-JS dashboard (`prototype/public/dashboard.html`), tests via `bun test`.

## Global Constraints

- Working dir: `/Users/vishalkumar/Downloads/qbug/klav-snap-wt-connector-mapping`, branch `feat/connector-mapping`. Do NOT touch master or version/CHANGELOG files.
- Back-compat is mandatory: a connector with no `issue_type_map`/`status_map` MUST behave exactly as today (single `issue_type`, default `"Task"` for Jira).
- All outbound HTTP goes through `safeFetch` with each adapter's existing third-arg options verbatim (Jira/Plane `{ allowLoopbackInTest: true }`; Linear `{ allowHosts: ["linear.app"] }`; GitHub `{ allowHosts: ["github.com"] }`).
- Errors must never leak upstream/guard text to clients: reuse `oops(e, "...")` for endpoints and the adapters' existing `throw new Error("tracker request failed (HTTP ${status})")` shape.
- New adapter methods are OPTIONAL on the interface (`?`), like `listIssues?`.
- `issue_type_map` and `status_map` are stored in connector config as **JSON strings** (config is `Record<string,string>`); parse defensively.
- Report kinds map FROM `"bug" | "feature"` (+ `default`); statuses map FROM `new | open | in_progress | done | dismissed`.
- Tests run from `prototype/`: `bun test <file>`. Use a local `Bun.serve({port:0})` receiver + `KLAV_TEST_ALLOW_LOOPBACK=1` for adapter/endpoint tests that hit a fake tracker (see existing `server.manual-ticket.test.ts`).

---

### Task 1: Persist report kind on feedback

**Files:**
- Modify: `prototype/lib/db.ts` (feedback insert + schema-ensure), `prototype/server.ts:3418` area (write `reportType` into the insert), `prototype/server.ts:9390` area (manual ticket → kind `"bug"`).
- Test: `prototype/lib/db.report-kind.test.ts`

**Interfaces:**
- Produces: `feedback.report_type` column (`"bug" | "feature" | null`); a feedback row read by `feedbackToTicketPayload` now exposes `fb.report_type`.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/db.report-kind.test.ts
import { test, expect, beforeAll } from "bun:test"
import { initSchema, insertFeedback, getFeedbackById, __rawDb } from "./db"
beforeAll(async () => { await initSchema() })
test("feedback persists report_type and reads it back", async () => {
  const id = `fb_${Math.random().toString(36).slice(2)}`
  await insertFeedback({ id, projectId: "p1", observation: "x", priority: "medium", status: "new", reportType: "feature" } as any)
  const fb = await getFeedbackById(id)
  expect((fb as any).report_type).toBe("feature")
})
```

- [ ] **Step 2: Run it — expect FAIL** (`bun test lib/db.report-kind.test.ts`) — fails: `insertFeedback` ignores `reportType` / column missing.

- [ ] **Step 3: Implement.** In `db.ts` schema-ensure for the feedback table, add a guarded column (match the file's existing `ALTER TABLE ... ADD COLUMN` idempotent pattern — grep `ADD COLUMN` in db.ts and copy the surrounding try/catch or `ensureColumn` helper):

```ts
// in the feedback table ensure block, alongside other ADD COLUMN guards:
try { await db.execute("ALTER TABLE feedback ADD COLUMN report_type TEXT") } catch { /* exists */ }
```

In `insertFeedback` add `report_type` to the column list + values (`args.reportType ?? null`). Confirm `getFeedbackById`/the feedback SELECT is `SELECT *` (it is) so `report_type` comes back automatically; if it uses an explicit column list, add `report_type`.

- [ ] **Step 4: Wire the writers.** In `server.ts` at the submit insert (near the `reportType` derivation at 3418), pass `reportType` into the `insertFeedback(...)` call. At the manual-ticket create (`POST /tickets`, ~9390, where `updateFeedbackMeta(proj.id, id, { status: "open" })` runs), set the row's kind to `"bug"` (a hand-written ticket is a bug report by default) — pass `reportType: "bug"` into that insert path.

- [ ] **Step 5: Run — expect PASS.**

- [ ] **Step 6: Commit** — `git commit -am "feat(feedback): persist report_type (bug/feature) for connector issue-type mapping"`

---

### Task 2: Shared capability interface + types + resolveIssueType

**Files:**
- Modify: `prototype/lib/connectors/index.ts`
- Test: `prototype/lib/connectors/resolve-type.test.ts`

**Interfaces:**
- Produces (all consumed by Tasks 4-9):
```ts
export type ConnectorMeta = { id?: string; name: string; category?: string }
export type ConnectorCapabilities = { issueTypes: boolean; statuses: boolean; typesAsLabels?: boolean }
// on interface Connector, after listIssues?:
capabilities?: ConnectorCapabilities
listIssueTypes?(cfg: Record<string,string>): Promise<ConnectorMeta[]>
listStatuses?(cfg: Record<string,string>): Promise<ConnectorMeta[]>
// on TicketPayload:
kind?: "bug" | "feature"
// exported helper:
export function resolveIssueType(cfg: Record<string,string>, kind: "bug"|"feature"|undefined, fallback: string): string
export function parseJsonMap(raw: unknown): Record<string,string> | null
```

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/connectors/resolve-type.test.ts
import { test, expect } from "bun:test"
import { resolveIssueType } from "./index"
test("kind-specific wins", () => {
  const cfg = { issue_type_map: JSON.stringify({ bug: "Bug", feature: "Story", default: "Task" }) }
  expect(resolveIssueType(cfg, "bug", "X")).toBe("Bug")
  expect(resolveIssueType(cfg, "feature", "X")).toBe("Story")
})
test("falls back to default then legacy issue_type then arg fallback", () => {
  expect(resolveIssueType({ issue_type_map: JSON.stringify({ default: "Task" }) }, undefined, "X")).toBe("Task")
  expect(resolveIssueType({ issue_type: "Legacy" }, "bug", "X")).toBe("Legacy")
  expect(resolveIssueType({}, "bug", "Task")).toBe("Task")
})
test("malformed map does not throw", () => {
  expect(resolveIssueType({ issue_type_map: "{not json" }, "bug", "Task")).toBe("Task")
})
```

- [ ] **Step 2: Run — expect FAIL** (`resolveIssueType` not exported).

- [ ] **Step 3: Implement in `index.ts`.** Add the two types above the `Connector` interface, add the three optional members to `Connector` (after `listIssues?`), add `kind?: "bug" | "feature"` to `TicketPayload`, and append:

```ts
export function parseJsonMap(raw: unknown): Record<string,string> | null {
  if (!raw) return null
  if (typeof raw === "object") return raw as Record<string,string>
  if (typeof raw !== "string") return null
  try { const o = JSON.parse(raw); return (o && typeof o === "object") ? o : null } catch { return null }
}
export function resolveIssueType(cfg: Record<string,string>, kind: "bug"|"feature"|undefined, fallback: string): string {
  const map = parseJsonMap((cfg as any).issue_type_map)
  if (map) {
    if (kind && map[kind]) return String(map[kind])
    if (map.default) return String(map.default)
  }
  return cfg.issue_type || fallback
}
```

- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(connectors): shared capabilities interface + resolveIssueType helper + payload.kind"`

---

### Task 3: Pure auto-match library

**Files:**
- Create: `prototype/lib/connector-automatch.ts`
- Test: `prototype/lib/connector-automatch.test.ts`

**Interfaces:**
- Produces (consumed by Task 8):
```ts
export type MatchStatus = "matched" | "ambiguous" | "unmatched"
export type MatchRow = { key: string; label: string; suggested: string | null; candidates: string[]; status: MatchStatus }
export function autoMatch(source: { key: string; label: string }, options: string[]): MatchRow
export const KIND_SYNONYMS: Record<string,string[]>
export const STATUS_SYNONYMS: Record<string,string[]>
```

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/connector-automatch.test.ts
import { test, expect } from "bun:test"
import { autoMatch } from "./connector-automatch"
test("exact case-insensitive match", () => {
  const r = autoMatch({ key: "bug", label: "Bug" }, ["Bug", "Story", "Task"])
  expect(r.status).toBe("matched"); expect(r.suggested).toBe("Bug")
})
test("single synonym match", () => {
  const r = autoMatch({ key: "feature", label: "Feature" }, ["Story", "Task", "Bug"])
  expect(r.status).toBe("matched"); expect(r.suggested).toBe("Story")
})
test("multiple synonym candidates -> ambiguous", () => {
  const r = autoMatch({ key: "done", label: "Done" }, ["Done", "Resolved"])
  // 'Done' is an exact match -> matched, so use a case where two synonyms hit and none is exact:
  const r2 = autoMatch({ key: "done", label: "Complete" }, ["Resolved", "Closed"])
  expect(r2.status).toBe("ambiguous"); expect(r2.candidates.sort()).toEqual(["Closed","Resolved"])
})
test("no candidate -> unmatched", () => {
  const r = autoMatch({ key: "dismissed", label: "Dismissed" }, ["To Do", "In Progress"])
  expect(r.status).toBe("unmatched"); expect(r.suggested).toBeNull()
})
```

- [ ] **Step 2: Run — expect FAIL** (module missing).

- [ ] **Step 3: Implement.**

```ts
// prototype/lib/connector-automatch.ts — pure, no IO
export type MatchStatus = "matched" | "ambiguous" | "unmatched"
export type MatchRow = { key: string; label: string; suggested: string | null; candidates: string[]; status: MatchStatus }
export const KIND_SYNONYMS: Record<string,string[]> = {
  bug: ["bug", "defect"],
  feature: ["feature", "story", "task", "improvement", "enhancement"],
}
export const STATUS_SYNONYMS: Record<string,string[]> = {
  new: ["new", "to do", "todo", "backlog", "triage", "open"],
  open: ["open", "in progress", "doing", "selected for development", "accepted"],
  in_progress: ["in progress", "doing", "started", "wip"],
  done: ["done", "closed", "complete", "completed", "resolved", "fixed"],
  dismissed: ["dismissed", "won't do", "wont do", "won't fix", "wont fix", "cancelled", "canceled", "rejected", "invalid", "not a bug"],
}
const norm = (s: string) => s.trim().toLowerCase()
export function autoMatch(source: { key: string; label: string }, options: string[]): MatchRow {
  const base: MatchRow = { key: source.key, label: source.label, suggested: null, candidates: [], status: "unmatched" }
  if (!options.length) return base
  // 1) exact label match
  const exact = options.find(o => norm(o) === norm(source.label))
  if (exact) return { ...base, suggested: exact, status: "matched" }
  // 2) synonym intersection
  const syns = (KIND_SYNONYMS[source.key] || STATUS_SYNONYMS[source.key] || [norm(source.label)])
  const hits = options.filter(o => syns.includes(norm(o)))
  if (hits.length === 1) return { ...base, suggested: hits[0], candidates: hits, status: "matched" }
  if (hits.length > 1) return { ...base, suggested: null, candidates: hits, status: "ambiguous" }
  return base
}
```

- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(connectors): pure auto-match lib for type/status mapping"`

---

### Task 4: Jira metadata + kind-aware createIssue

**Files:**
- Modify: `prototype/lib/connectors/jira.ts`
- Test: `prototype/lib/connectors/jira.mapping.test.ts`

**Interfaces:**
- Consumes: `ConnectorMeta`, `resolveIssueType` (Task 2).
- Produces: `jiraConnector.capabilities = { issueTypes: true, statuses: true }`, `listIssueTypes`, `listStatuses`, and a kind-aware `createIssue`.

- [ ] **Step 1: Write the failing test** (mock `safeFetch` via a local `Bun.serve({port:0})` receiver + set `KLAV_TEST_ALLOW_LOOPBACK=1`; point `host` at `http://127.0.0.1:${port}`):

```ts
// prototype/lib/connectors/jira.mapping.test.ts
import { test, expect, beforeAll, afterAll } from "bun:test"
import { jiraConnector } from "./jira"
process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"
let server: any, base = ""
beforeAll(() => {
  server = Bun.serve({ port: 0, fetch(req) {
    const u = new URL(req.url)
    if (u.pathname.endsWith("/issuetypes")) return Response.json([{ id: "1", name: "Bug" }, { id: "2", name: "Story" }, { id: "3", name: "Task" }])
    if (u.pathname.includes("/project/") && u.pathname.endsWith("/statuses")) return Response.json([{ name: "Task", statuses: [{ id: "10", name: "To Do" }, { id: "11", name: "In Progress" }, { id: "12", name: "Done" }] }])
    if (u.pathname.endsWith("/issue")) return Response.json({ key: "PROJ-1" })
    return new Response("no", { status: 404 })
  }})
  base = `http://127.0.0.1:${server.port}`
})
afterAll(() => server.stop(true))
const cfg = () => ({ host: base, email: "e@x.co", token: "t", project_key: "PROJ" })
test("listIssueTypes returns Jira types", async () => {
  const types = await jiraConnector.listIssueTypes!(cfg())
  expect(types.map(t => t.name)).toEqual(["Bug", "Story", "Task"])
})
test("listStatuses flattens + dedupes workflow statuses", async () => {
  const st = await jiraConnector.listStatuses!(cfg())
  expect(st.map(s => s.name)).toEqual(["To Do", "In Progress", "Done"])
})
test("createIssue picks issue type by kind from issue_type_map", async () => {
  let sent: any = null
  server.stop(true)
  server = Bun.serve({ port: server.port, fetch: async (req) => { sent = await req.json(); return Response.json({ key: "PROJ-9" }) } })
  const c = { ...cfg(), issue_type_map: JSON.stringify({ bug: "Bug", feature: "Story", default: "Task" }) }
  await jiraConnector.createIssue({ title: "t", body: "b", priority: null, url: null, simName: null, createdAt: Date.now(), klavityUrl: "k", kind: "feature" } as any, c)
  expect(sent.fields.issuetype.name).toBe("Story")
})
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement in `jira.ts`.** Add `capabilities: { issueTypes: true, statuses: true }` to the exported object. Change the issue-type line in `createIssue` (jira.ts:60) from `const issueType = cfg.issue_type || "Task"` to:

```ts
const issueType = resolveIssueType(cfg, (ticket as any).kind, "Task")
```
(import `resolveIssueType` from `"./index"`). Add the two methods, modelled on the existing `createIssue` auth/error shape:

```ts
async listIssueTypes(cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  const host = cfg.host.replace(/\/$/, "")
  const credentials = Buffer.from(`${cfg.email}:${cfg.token}`).toString("base64")
  const res = await safeFetch(
    `${host}/rest/api/3/issue/createmeta/${encodeURIComponent(cfg.project_key)}/issuetypes`,
    { method: "GET", headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" } },
    { allowLoopbackInTest: true },
  )
  if (!res.ok) { const t = (await res.text().catch(()=>"")).slice(0,200); console.error(`jira issuetypes error ${res.status}: ${t}`); throw new Error(`tracker request failed (HTTP ${res.status})`) }
  const json = await res.json()
  const arr: any[] = Array.isArray(json) ? json : (json?.values ?? json?.issueTypes ?? [])
  return arr.filter((x:any)=>!x.subtask).map((x:any)=>({ id: String(x.id ?? ""), name: String(x.name) }))
},
async listStatuses(cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  const host = cfg.host.replace(/\/$/, "")
  const credentials = Buffer.from(`${cfg.email}:${cfg.token}`).toString("base64")
  const res = await safeFetch(
    `${host}/rest/api/3/project/${encodeURIComponent(cfg.project_key)}/statuses`,
    { method: "GET", headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" } },
    { allowLoopbackInTest: true },
  )
  if (!res.ok) { const t = (await res.text().catch(()=>"")).slice(0,200); console.error(`jira statuses error ${res.status}: ${t}`); throw new Error(`tracker request failed (HTTP ${res.status})`) }
  const json = await res.json()
  const seen = new Set<string>(); const out: ConnectorMeta[] = []
  for (const group of (Array.isArray(json) ? json : [])) for (const s of (group.statuses ?? [])) {
    if (!seen.has(s.name)) { seen.add(s.name); out.push({ id: String(s.id ?? ""), name: String(s.name), category: s.statusCategory?.key }) }
  }
  return out
},
```

- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(jira): listIssueTypes/listStatuses + kind-aware createIssue"`

---

### Task 5: Linear metadata (types-as-labels) + kind-aware label

**Files:**
- Modify: `prototype/lib/connectors/linear.ts`
- Test: `prototype/lib/connectors/linear.mapping.test.ts`

**Interfaces:**
- Produces: `linearConnector.capabilities = { issueTypes: false, statuses: true, typesAsLabels: true }`, `listStatuses` (team workflow states), `listIssueTypes` (team labels), and `createIssue` adds the kind→label to the issue's labels.

- [ ] **Step 1: Write the failing test** (fake GraphQL receiver returning `data.team.states.nodes` and `data.team.labels.nodes`; `allowHosts` includes loopback only when `KLAV_TEST_ALLOW_LOOPBACK=1` — Linear pins `linear.app`, so the test must point `LINEAR_API` via a seam: add an internal `const LINEAR_API = process.env.KLAV_LINEAR_API || "https://api.linear.app/graphql"` so tests can override the host, and assert `listStatuses` maps `nodes[].name`).

```ts
import { test, expect, beforeAll, afterAll } from "bun:test"
process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"
let server:any, base=""
beforeAll(() => { server = Bun.serve({ port:0, fetch: async () => Response.json({ data: { team: { states: { nodes: [{ id:"s1", name:"Todo", type:"unstarted" }, { id:"s2", name:"In Progress", type:"started" }, { id:"s3", name:"Done", type:"completed" }] }, labels: { nodes: [{ id:"l1", name:"Bug" }, { id:"l2", name:"Feature" }] } } } }) }); base=`http://127.0.0.1:${server.port}`; process.env.KLAV_LINEAR_API = base })
afterAll(() => { server.stop(true); delete process.env.KLAV_LINEAR_API })
test("listStatuses returns team workflow states", async () => {
  const { linearConnector } = await import("./linear")
  const st = await linearConnector.listStatuses!({ api_key: "k", team_id: "T" })
  expect(st.map(s=>s.name)).toEqual(["Todo","In Progress","Done"])
})
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement in `linear.ts`.** Change `const LINEAR_API = "https://api.linear.app/graphql"` → `const LINEAR_API = process.env.KLAV_LINEAR_API || "https://api.linear.app/graphql"` and the safeFetch host option to `{ allowHosts: ["linear.app"], allowLoopbackInTest: true }` in the new methods (so tests reach loopback while prod still pins linear.app). Add `capabilities: { issueTypes: false, statuses: true, typesAsLabels: true }`. Add:

```ts
async listStatuses(cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  const res = await safeFetch(LINEAR_API, { method:"POST",
    headers: { Authorization: cfg.api_key, "Content-Type":"application/json" },
    body: JSON.stringify({ query: "query($tm:String!){ team(id:$tm){ states { nodes { id name type } } } }", variables: { tm: cfg.team_id } }) },
    { allowHosts: ["linear.app"], allowLoopbackInTest: true })
  const json = await res.json()
  if (json?.errors?.length) throw new Error("tracker request failed (GraphQL error)")
  return (json?.data?.team?.states?.nodes ?? []).map((s:any)=>({ id:String(s.id), name:String(s.name), category:s.type }))
},
async listIssueTypes(cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  const res = await safeFetch(LINEAR_API, { method:"POST",
    headers: { Authorization: cfg.api_key, "Content-Type":"application/json" },
    body: JSON.stringify({ query: "query($tm:String!){ team(id:$tm){ labels { nodes { id name } } } }", variables: { tm: cfg.team_id } }) },
    { allowHosts: ["linear.app"], allowLoopbackInTest: true })
  const json = await res.json()
  if (json?.errors?.length) throw new Error("tracker request failed (GraphQL error)")
  return (json?.data?.team?.labels?.nodes ?? []).map((l:any)=>({ id:String(l.id), name:String(l.name) }))
},
```
In `createIssue`, after computing the label list, add the kind→label: `const kindLabel = resolveIssueType(cfg, (ticket as any).kind, "")` and if non-empty append it to the labels applied to the issue (Linear applies labels by name→id lookup; if the existing createIssue already resolves label ids, add `kindLabel` to that set; otherwise pass it through the same label path the payload `labels` use). Keep it best-effort — an unmatched label name must not fail the create.

- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(linear): listStatuses/listIssueTypes (labels) + kind label on export"`

---

### Task 6: Plane metadata (types-as-labels)

**Files:**
- Modify: `prototype/lib/connectors/plane.ts`
- Test: `prototype/lib/connectors/plane.mapping.test.ts`

**Interfaces:**
- Produces: `planeConnector.capabilities = { issueTypes: false, statuses: true, typesAsLabels: true }`, `listStatuses` (project states), `listIssueTypes` (project labels), kind→label on export.

- [ ] **Step 1: Write the failing test** (fake receiver for `.../states/` returning `{ results: [{id,name},...] }` and `.../labels/`; `host` pointed at loopback, `KLAV_TEST_ALLOW_LOOPBACK=1`):

```ts
import { test, expect, beforeAll, afterAll } from "bun:test"
import { planeConnector } from "./plane"
process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"
let server:any, base=""
beforeAll(()=>{ server = Bun.serve({ port:0, fetch:(req)=>{ const u=new URL(req.url)
  if (u.pathname.endsWith("/states/")) return Response.json({ results: [{id:"a",name:"Backlog"},{id:"b",name:"In Progress"},{id:"c",name:"Done"}] })
  if (u.pathname.endsWith("/labels/")) return Response.json({ results: [{id:"l",name:"Bug"}] })
  return new Response("no",{status:404}) }}); base=`http://127.0.0.1:${server.port}` })
afterAll(()=>server.stop(true))
test("listStatuses returns project states", async () => {
  const st = await planeConnector.listStatuses!({ host: base, workspace: "ws", project_id: "pr", token: "t" })
  expect(st.map(s=>s.name)).toEqual(["Backlog","In Progress","Done"])
})
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement in `plane.ts`.** Add `capabilities: { issueTypes: false, statuses: true, typesAsLabels: true }`. Add methods reusing the `host`/`workspace`/`project_id`/`X-API-Key` + `Array.isArray(data)?data:data?.results ?? []` idiom:

```ts
async listStatuses(cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  const host = cfg.host?.replace(/\/$/, "") || "https://api.plane.so"
  const res = await safeFetch(`${host}/api/v1/workspaces/${cfg.workspace}/projects/${cfg.project_id}/states/`,
    { method:"GET", headers:{ "X-API-Key": cfg.token } }, { allowLoopbackInTest: true })
  if (!res.ok) { const t=(await res.text().catch(()=>"")).slice(0,200); console.error(`plane states error ${res.status}: ${t}`); throw new Error(`tracker request failed (HTTP ${res.status})`) }
  const data = await res.json(); const rows = Array.isArray(data)?data:(data?.results ?? [])
  return rows.map((s:any)=>({ id:String(s.id), name:String(s.name), category:s.group }))
},
async listIssueTypes(cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  const host = cfg.host?.replace(/\/$/, "") || "https://api.plane.so"
  const res = await safeFetch(`${host}/api/v1/workspaces/${cfg.workspace}/projects/${cfg.project_id}/labels/`,
    { method:"GET", headers:{ "X-API-Key": cfg.token } }, { allowLoopbackInTest: true })
  if (!res.ok) { const t=(await res.text().catch(()=>"")).slice(0,200); console.error(`plane labels error ${res.status}: ${t}`); throw new Error(`tracker request failed (HTTP ${res.status})`) }
  const data = await res.json(); const rows = Array.isArray(data)?data:(data?.results ?? [])
  return rows.map((l:any)=>({ id:String(l.id), name:String(l.name) }))
},
```
In `createIssue`, add `resolveIssueType(cfg, (ticket as any).kind, "")` to the labels applied (Plane surfaces labels; best-effort).

- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(plane): listStatuses/listIssueTypes + kind label on export"`

---

### Task 7: GitHub metadata (labels + open/closed)

**Files:**
- Modify: `prototype/lib/connectors/github.ts`
- Test: `prototype/lib/connectors/github.mapping.test.ts`

**Interfaces:**
- Produces: `githubConnector.capabilities = { issueTypes: false, statuses: true, typesAsLabels: true }`, `listIssueTypes` (repo labels), `listStatuses` returns the fixed `[{name:"open"},{name:"closed"}]`, kind→label on export.

- [ ] **Step 1: Write the failing test** (fake receiver for `/repos/o/r/labels` — but GitHub pins `github.com`; add the same `KLAV_GITHUB_API` seam: `const GITHUB_API = process.env.KLAV_GITHUB_API || "https://api.github.com"` and use it in the new methods, with `{ allowHosts:["github.com"], allowLoopbackInTest:true }`):

```ts
import { test, expect, beforeAll, afterAll } from "bun:test"
process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"
let server:any
beforeAll(()=>{ server = Bun.serve({ port:0, fetch:()=>Response.json([{ id:1, name:"bug" }, { id:2, name:"enhancement" }]) }); process.env.KLAV_GITHUB_API = `http://127.0.0.1:${server.port}` })
afterAll(()=>{ server.stop(true); delete process.env.KLAV_GITHUB_API })
test("listStatuses is open/closed", async () => {
  const { githubConnector } = await import("./github")
  expect((await githubConnector.listStatuses!({ owner:"o", repo:"r", token:"t" })).map(s=>s.name)).toEqual(["open","closed"])
})
test("listIssueTypes returns repo labels", async () => {
  const { githubConnector } = await import("./github")
  expect((await githubConnector.listIssueTypes!({ owner:"o", repo:"r", token:"t" })).map(l=>l.name)).toEqual(["bug","enhancement"])
})
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement in `github.ts`.** Add the `GITHUB_API` seam, `capabilities: { issueTypes:false, statuses:true, typesAsLabels:true }`, and:

```ts
async listStatuses(_cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  return [{ name: "open" }, { name: "closed" }]   // GitHub issues have no workflow beyond open/closed
},
async listIssueTypes(cfg: Record<string,string>): Promise<ConnectorMeta[]> {
  const res = await safeFetch(`${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/labels?per_page=100`,
    { method:"GET", headers:{ Authorization:`Bearer ${cfg.token}`, Accept:"application/vnd.github+json", "User-Agent":"Klavity" } },
    { allowHosts:["github.com"], allowLoopbackInTest:true })
  if (!res.ok) { const t=(await res.text().catch(()=>"")).slice(0,200); console.error(`github labels error ${res.status}: ${t}`); throw new Error(`tracker request failed (HTTP ${res.status})`) }
  const json = await res.json(); const rows:any[] = Array.isArray(json)?json:[]
  return rows.map(l=>({ id:String(l.id), name:String(l.name) }))
},
```
In `createIssue`, add `resolveIssueType(cfg, (ticket as any).kind, "")` to the `labels` sent natively (GitHub supports labels).

- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(github): listIssueTypes(labels)/listStatuses + kind label on export"`

---

### Task 8: POST /api/connectors/meta endpoint (+ server-side auto-match)

**Files:**
- Modify: `prototype/server.ts` (add handler beside `/connectors/test` ~8617; import `autoMatch` + Klavity source rows)
- Test: `prototype/server.connectors-meta.test.ts`

**Interfaces:**
- Consumes: adapters' `capabilities`/`listIssueTypes`/`listStatuses` (Tasks 4-7), `autoMatch` (Task 3), the secret-decrypt loop pattern (server.ts:8628-8634).
- Produces response:
```ts
{ capabilities: ConnectorCapabilities,
  issueTypes: ConnectorMeta[], statuses: ConnectorMeta[],
  rows: { types: MatchRow[], statuses: MatchRow[] },
  suggested: { issue_type_map: Record<string,string>, status_map: Record<string,string> } }
```

- [ ] **Step 1: Write the failing test** (loopback fake tracker returning Jira createmeta+statuses; assert `rows.types` has a matched `bug→Bug` and `suggested.issue_type_map.bug==="Bug"`; assert admin gating 403 for non-admin). Model setup on `server.manual-ticket.test.ts` (spawns server with `KLAV_TEST_ALLOW_LOOPBACK:"1"`).

- [ ] **Step 2: Run — expect FAIL** (404 — route missing).

- [ ] **Step 3: Implement.** Add, right after the unsaved `/connectors/test` block (~8617), a handler for `POST /api/projects/:pid/connectors/meta`:

```ts
if (req.method === "POST" && metaNoCid) {   // add `metaNoCid` route match near testNoCid
  if (access !== "admin") return json({ error: "Only project admins can manage connectors." }, 403)
  const body = await req.json().catch(() => ({}))
  const type = String(body.type || "")
  let config: Record<string,string> = (body.config && typeof body.config === "object") ? body.config : {}
  const adapter = getConnector(type)
  if (!adapter) return json({ error: `Unknown connector type: ${type}` }, 400)
  // if a saved cid is passed, load + decrypt (reuse the /cid/test decrypt loop); else use posted config
  if (body.cid) {
    const connector = await getConnectorById(pid, String(body.cid))
    if (!connector) return json({ error: "Connector not found." }, 404)
    config = { ...connector.config }
    for (const f of adapter.fields) if (f.secret && connector.config[f.key]) { try { config[f.key] = await decryptSecret(connector.config[f.key]) } catch { config[f.key] = "" } }
  }
  const caps = adapter.capabilities ?? { issueTypes: false, statuses: false }
  try {
    const [issueTypes, statuses] = await Promise.all([
      adapter.listIssueTypes ? adapter.listIssueTypes(config) : Promise.resolve([]),
      adapter.listStatuses ? adapter.listStatuses(config) : Promise.resolve([]),
    ])
    const typeOpts = issueTypes.map(t => t.name)
    const statusOpts = statuses.map(s => s.name)
    const KINDS = [{ key: "bug", label: "Bug" }, { key: "feature", label: "Feature" }]
    const STATUSES = [{ key: "new", label: "New" }, { key: "open", label: "Open" }, { key: "in_progress", label: "In Progress" }, { key: "done", label: "Done" }, { key: "dismissed", label: "Dismissed" }]
    const typeRows = KINDS.map(k => autoMatch(k, typeOpts))
    const statusRows = STATUSES.map(s => autoMatch(s, statusOpts))
    const issue_type_map: Record<string,string> = {}; for (const r of typeRows) if (r.suggested) issue_type_map[r.key] = r.suggested
    const status_map: Record<string,string> = {}; for (const r of statusRows) if (r.suggested) status_map[r.key] = r.suggested
    return json({ capabilities: caps, issueTypes, statuses, rows: { types: typeRows, statuses: statusRows }, suggested: { issue_type_map, status_map } })
  } catch (e: any) {
    const o = oops(e, "connector-meta")
    return json({ ok: false, error: o.error, id: o.id }, 502)
  }
}
```
Add the `metaNoCid` path match next to `testNoCid` (grep how `testNoCid` is computed from the URL and mirror it for `/connectors/meta`). Import `autoMatch` from `"./lib/connector-automatch"`.

- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(api): POST /connectors/meta — fetch tracker types/statuses + server-side auto-match"`

---

### Task 9: Wire kind into export + status_map into inbound normalization

**Files:**
- Modify: `prototype/server.ts` (`feedbackToTicketPayload` ~1462 — set `kind`), `prototype/lib/connectors/inbound.ts` (use `status_map` reversed where it hard-codes provider→Klavity status).
- Test: `prototype/lib/connectors/inbound.status-map.test.ts`, and extend the Jira mapping test's kind assertion (already in Task 4).

**Interfaces:**
- Consumes: `fb.report_type` (Task 1), `parseJsonMap` (Task 2), `status_map` stored in config (Task 10 saves it).
- Produces: exported tickets carry `kind`; inbound status sync respects a connector's `status_map`.

- [ ] **Step 1: Write the failing test** for inbound: given `status_map = {done:"Done"}`, an inbound event with provider status `"Done"` maps the Klavity ticket to `done`; an unmapped provider status leaves status unchanged. (Model on existing inbound tests — grep `inbound` test files for the current shape.)

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement.**
  - In `feedbackToTicketPayload` return object (server.ts:1532-1542), add `kind: (fb.report_type === "feature" ? "feature" : fb.report_type === "bug" ? "bug" : undefined),`.
  - In `inbound.ts`, where a provider status string is currently mapped to a Klavity status via hard-coded logic, first consult `parseJsonMap(cfg.status_map)` reversed (provider name → klavity key). Fall back to the existing hard-coded behavior when no `status_map` entry matches (back-compat). Keep it a pure lookup; unknown provider status → no status change (as today).

- [ ] **Step 4: Run — expect PASS** (inbound test + re-run `jira.mapping.test.ts`).
- [ ] **Step 5: Commit** — `git commit -am "feat(connectors): carry report kind on export + honor status_map on inbound sync"`

---

### Task 10: Inline mapping UI in the connect flow

**Files:**
- Modify: `prototype/public/dashboard.html` (near `renderConnectorFields` ~7380, `renderTestResult` ~7218, `saveConnector`/create path). 
- Verify: browser (logged-in `/dashboard` connectors settings) + `node prototype/scripts/check-inline-js.mjs` (if present) or the repo's inline-JS guard.

**Interfaces:**
- Consumes: `POST /api/projects/:pid/connectors/meta` (Task 8) → `{ capabilities, issueTypes, statuses, rows, suggested }`.
- Produces: two mapping tables rendered after a successful Test; on Save, writes `issue_type_map` + `status_map` (JSON strings) into the connector `config` submitted to the existing create/PATCH endpoint.

- [ ] **Step 1: Add a `renderConnectorMapping(type, config)` function** that calls the meta endpoint and renders the two tables from `rows.types` + `rows.statuses`. Each row: source label on the left, a `<select>` of the real option names on the right (from `issueTypes`/`statuses`), pre-selected to `row.suggested`. Rows with `status: "ambiguous"` or `"unmatched"` get an `amber` class + the select defaults to a blank "— choose —" option and is marked `data-needs="1"`. Adapt the section title/labels using `capabilities.typesAsLabels` ("Jira issue type" vs "{Tracker} label"). If `capabilities.issueTypes===false && capabilities.statuses===false` (webhook), skip the mapping step entirely.

- [ ] **Step 2: Wire it into the flow.** After a successful Test (`renderTestResult` success branch), reveal a "Next: map fields" affordance that calls `renderConnectorMapping`. Provide a "Skip — use defaults" control that proceeds without maps (today's behavior). Disable the final Save/Connect button while any `[data-needs="1"]` select is unset (mirror the mockup's "N items need your input" gate).

- [ ] **Step 3: On Save,** collect the selects into `issue_type_map` (`{bug,feature,default}`) and `status_map` (`{new,open,in_progress,done,dismissed}`; omit entries left as "Ignore / don't sync"), `JSON.stringify` each into the `config` object POSTed/PATCHed to the existing connector-save endpoint. No new save endpoint.

- [ ] **Step 4: Re-open behavior.** In `openConnEdit` (~7235), when editing an existing connector, parse its stored `issue_type_map`/`status_map` and pre-select them so the mapping is editable later.

- [ ] **Step 5: Verify.** Run the repo inline-JS guard (parses all inline `<script>`), then in a logged-in browser: add/edit a Jira connector against a test config, confirm the mapping step renders the two tables, amber rows block Save, and a saved connector round-trips its maps on re-open. (No bun unit test — dashboard.html inline JS is not unit-tested; the auto-match logic it depends on is already covered by Task 3.)

- [ ] **Step 6: Commit** — `git commit -am "feat(dashboard): inline tracker field-mapping step in the connect flow"`

---

## Self-Review

**Spec coverage:** shared interface (T2) ✓; per-adapter metadata all 4 (T4-7) ✓; kind-aware createIssue (T4-7) + payload kind + persistence (T1, T9) ✓; status_map store+use (T9 inbound; T10 save) ✓ — NOTE: outbound status *transitions* (e.g. Jira transition-id POST) are intentionally deferred to a fast-follow; v1 captures+stores the status map and applies it on inbound sync (documented scope trim, called out here so it isn't a silent gap). `POST /connectors/meta` (T8) ✓; inline UI + auto-match + amber gating (T3, T8, T10) ✓; webhook skip (T10) ✓; back-compat (every task) ✓.

**Placeholder scan:** no TBD/TODO; every code step has concrete code.

**Type consistency:** `ConnectorMeta`, `ConnectorCapabilities`, `MatchRow`, `resolveIssueType(cfg,kind,fallback)`, `autoMatch({key,label},options)`, `parseJsonMap`, `kind?:"bug"|"feature"` used identically across T2-T10. Config maps are JSON strings everywhere (`parseJsonMap` on read, `JSON.stringify` on write).

**Deferred (fast-follow, not v1):** outbound Jira/Linear/Plane status transitions; custom-field mapping; per-project maps.
