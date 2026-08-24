# Objective-Driven Authored Runs + MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a CI pipeline or a third-party AI (Claude Code/Cursor) trigger an AutoSim by URL + natural-language objective (no pre-authored Trail), and expose the whole run engine over MCP.

**Architecture:** Two independently-shippable parts, both thin adapters over engines that already exist. **Part A** adds a versioned REST endpoint `POST /api/v1/authored-runs` that wraps the existing F1 authoring engine (`runAuthorNow`) — authoring crystallizes a Trail *and* runs a verification walk, so the "authored run" result composes with the already-shipped `GET /api/v1/runs/:id/report`. **Part B** adds a hand-rolled, Streamable-HTTP-compatible JSON-RPC `/mcp` endpoint inside the existing `Bun.serve` handler, whose tools call the same underlying lib functions the REST routes call (no HTTP round-trip, no Node-coupled SDK).

**Tech Stack:** Bun (`bun run server.ts`, `bun test`), TypeScript, libSQL/SQLite (`lib/db.ts`), Zod (already a dep). No new runtime dependency is required.

## Global Constraints

- Never edit `master`; commit only on this `feat/authored-runs-mcp` branch (worktree already created).
- Do NOT bump versions / `CHANGELOG` version lines / `docs/PRD.md` version lines (orchestrator stamps these).
- All new HTTP routes go inside the single `async function handle(req, server)` linear if-chain in `prototype/server.ts` (starts `server.ts:2420`), inserted **before** the generic `/api/` login-redirect gate — same placement as the existing `/api/v1/runs` block (`server.ts:7177`) and `/api/trails/*` blocks.
- Reuse existing helpers verbatim: `json(body, status=200, headers={})` (`server.ts:871`), `readJsonLimited(req, maxBytes)` (`server.ts:874`), `getExtensionTokenInfo(token)` (`lib/db.ts:4962`), `allow`/`rlAllow` from `./lib/ratelimit` (imported `server.ts:76`), `snapLocked(project)` (`server.ts:1415`), `oops(e, label)` for 500s.
- Auth for every new machine endpoint = `kci_` Bearer token, mirroring `/api/v1/runs` (`server.ts:7182-7202`): match `/^Bearer\s+(kci_\S+)$/i`, resolve via `getExtensionTokenInfo`, require `info.projectId`, and require the request's `project_id`/`?project` to `=== info.projectId` (IDOR guard) else `403 forbidden`.
- Structured errors: re-declare the per-request closure `const v1err = (code,message,status) => json({error:{code,message,request_id: crypto.randomUUID().slice(0,8)}}, status)` (as `server.ts:7179` does).
- Test style: `bun test`, `import { test, expect, beforeAll, afterAll } from "bun:test"`. Integration tests spawn the real server and mint a `kci_` token via `POST /api/ci/token` — model on `prototype/server.v1-runs.test.ts`. Run new suites in isolation to confirm green (the full `bun test` has ~30 pre-existing shared-DB isolation failures unrelated to this work).
- Commit after each task with a clear message. Rebase on `origin/master` before finishing each part.

---

## Part A — Objective-driven authored run REST API

**Engine facts (from `lib/trails-author.ts`):**
- `runAuthorNow(projectId, req: AuthorRequest, deps?): Promise<{ sessionId: string }>` (`:1016`) — async/fire-and-forget: returns as soon as the `author_sessions` row exists; the browser drive + verification walk continue in the background. Throws `AuthorBusyError`/`WalkBusyError` when the single global author slot / default walk bucket is busy.
- `AuthorRequest` fields used by `POST /api/trails/author`: `{ name, objective, baseUrl, viewport?, testAccount?, simName? }` (route maps snake_case body → these).
- `getAuthorSession(projectId, id): Promise<AuthorSession | null>` (`:903`). `AuthorSession.status: "running"|"crystallized"|"stalled"|"failed"|"needs_auth"|"resuming"`; carries `trailId`, `verificationRunId`, `verificationVerdict: "green"|"amber"|"red"|null`, `objectiveVerified`, `stallReason`, `objective`, `createdAt`, `updatedAt`.
- `cancelCurrentAuthor(sessionId)` backs `POST /api/trails/author/:id/cancel` (`server.ts:8087`); requires `status==="running"`.
- Gates the existing author route applies (mirror these): `snapLocked(project)` → 402 (`server.ts:8010-8012`), and `quotaExceeded(acctId, "autosimFlows", …)` → 402 (`server.ts:8054-8061`).

**Result composition:** an authored run that reaches `crystallized` exposes `trail_id` (reusable with `POST /api/v1/runs`) and `verification_run_id` (usable with the already-shipped `GET /api/v1/runs/:verification_run_id/report`). So **no new report endpoint is needed** — findings are fetched through the existing v1 report route.

### File Structure (Part A)
- Create `prototype/lib/v1-authored.ts` — pure mappers: `authoredRunStatus(session)`, status enum, response shapers. One responsibility: translate an `AuthorSession` into the v1 wire shape. Mirrors `lib/v1-runs.ts`.
- Modify `prototype/server.ts` — insert one `if (path === "/api/v1/authored-runs" || path.startsWith("/api/v1/authored-runs/"))` block near the existing v1 block (~after `server.ts:7177`).
- Modify `prototype/lib/db.ts` — reuse the existing `api_idempotency` table (no schema change): `getIdempotentRunId`/`saveIdempotentRunId` already store a generic TEXT id; we store the `sessionId` there.
- Create `prototype/lib/v1-authored.test.ts` — unit tests for the mapper.
- Create `prototype/server.v1-authored.test.ts` — integration tests.

---

### Task A1: Authored-run status mapper (`lib/v1-authored.ts`)

**Files:**
- Create: `prototype/lib/v1-authored.ts`
- Test: `prototype/lib/v1-authored.test.ts`

**Interfaces:**
- Consumes: `AuthorSession` type from `./trails-author` (import type only).
- Produces:
  - `type V1AuthoredStatus = "authoring" | "completed" | "failed" | "needs_auth" | "cancelled"`
  - `v1AuthoredStatus(session: Pick<AuthorSession,"status">): V1AuthoredStatus`
  - `buildAuthoredRunStatus(session: AuthorSession): { authored_run_id: string; status: V1AuthoredStatus; trail_id: string|null; verification_run_id: string|null; verdict: "green"|"amber"|"red"|null; objective_verified: boolean|null; stall_reason: string|null; created_at: number|string; updated_at: number|string }`

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/v1-authored.test.ts
import { test, expect } from "bun:test"
import { v1AuthoredStatus, buildAuthoredRunStatus } from "./v1-authored"

test("v1AuthoredStatus maps author states to wire states", () => {
  expect(v1AuthoredStatus({ status: "running" })).toBe("authoring")
  expect(v1AuthoredStatus({ status: "resuming" })).toBe("authoring")
  expect(v1AuthoredStatus({ status: "crystallized" })).toBe("completed")
  expect(v1AuthoredStatus({ status: "stalled" })).toBe("failed")
  expect(v1AuthoredStatus({ status: "failed" })).toBe("failed")
  expect(v1AuthoredStatus({ status: "needs_auth" })).toBe("needs_auth")
})

test("buildAuthoredRunStatus shapes the wire object", () => {
  const s: any = {
    id: "auth_1", status: "crystallized", trailId: "trail_9",
    verificationRunId: "run_5", verificationVerdict: "green",
    objectiveVerified: true, stallReason: null,
    createdAt: 111, updatedAt: 222,
  }
  expect(buildAuthoredRunStatus(s)).toEqual({
    authored_run_id: "auth_1", status: "completed", trail_id: "trail_9",
    verification_run_id: "run_5", verdict: "green", objective_verified: true,
    stall_reason: null, created_at: 111, updated_at: 222,
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/v1-authored.test.ts`
Expected: FAIL — `Cannot find module "./v1-authored"`.

- [ ] **Step 3: Write minimal implementation**

```ts
// prototype/lib/v1-authored.ts
import type { AuthorSession } from "./trails-author"

export type V1AuthoredStatus = "authoring" | "completed" | "failed" | "needs_auth" | "cancelled"

export function v1AuthoredStatus(session: Pick<AuthorSession, "status">): V1AuthoredStatus {
  switch (session.status) {
    case "running":
    case "resuming":
      return "authoring"
    case "crystallized":
      return "completed"
    case "needs_auth":
      return "needs_auth"
    case "stalled":
    case "failed":
    default:
      return "failed"
  }
}

export function buildAuthoredRunStatus(session: AuthorSession) {
  return {
    authored_run_id: session.id,
    status: v1AuthoredStatus(session),
    trail_id: session.trailId ?? null,
    verification_run_id: session.verificationRunId ?? null,
    verdict: (session.verificationVerdict ?? null) as "green" | "amber" | "red" | null,
    objective_verified: session.objectiveVerified ?? null,
    stall_reason: session.stallReason ?? null,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/v1-authored.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/v1-authored.ts prototype/lib/v1-authored.test.ts
git commit -m "feat(v1): authored-run status mapper (KLA-550)"
```

---

### Task A2: `POST /api/v1/authored-runs` route (trigger)

**Files:**
- Modify: `prototype/server.ts` (insert block near `:7177`)
- Test: `prototype/server.v1-authored.test.ts`

**Interfaces:**
- Consumes: `runAuthorNow` (`lib/trails-author.ts:1016`), `getAuthorSession` (`:903`), `buildAuthoredRunStatus`/`v1AuthoredStatus` (Task A1), `getIdempotentRunId`/`saveIdempotentRunId` (`lib/db.ts:1454/1466`), `snapLocked` (`server.ts:1415`), `getExtensionTokenInfo`, `json`, `readJsonLimited`, `allow`.
- Produces: HTTP `POST /api/v1/authored-runs` → 202 `{ authored_run_id, status:"authoring", status_url }`.

**Interface note for the implementer:** confirm the exact imports already present at the top of `server.ts` (`runAuthorNow` is imported for the `/api/trails/author` route; `getIdempotentRunId`/`saveIdempotentRunId` are imported for the v1-runs block). Add `getAuthorSession`, `buildAuthoredRunStatus`, `v1AuthoredStatus` to the existing import groups. Do NOT import `quotaExceeded` unless Step 3 uses it (see note there).

- [ ] **Step 1: Write the failing test**

```ts
// prototype/server.v1-authored.test.ts
import { test, expect, beforeAll, afterAll } from "bun:test"
// Model bootstrap on server.v1-runs.test.ts: spawn server, create a project,
// mint a kci_ token via POST /api/ci/token. Reuse its helpers verbatim.
import { startTestServer, mintCiToken, makeProject } from "./test-helpers/v1" // if v1-runs test inlines these, inline the same here

let base: string, token: string, projectId: string, stop: () => void
beforeAll(async () => {
  const t = await startTestServer(); base = t.base; stop = t.stop
  projectId = await makeProject(base)
  token = await mintCiToken(base, projectId)
})
afterAll(() => stop())

test("POST /api/v1/authored-runs returns 202 with authored_run_id", async () => {
  const res = await fetch(base + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ project_id: projectId, target_url: "https://example.com", objective: "Check that the pricing page loads and the CTA is clickable" }),
  })
  expect(res.status).toBe(202)
  const j = await res.json()
  expect(typeof j.authored_run_id).toBe("string")
  expect(j.status).toBe("authoring")
  expect(j.status_url).toContain(j.authored_run_id)
})

test("rejects wrong-project token with 403", async () => {
  const res = await fetch(base + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ project_id: "proj_other", target_url: "https://example.com", objective: "x".repeat(20) }),
  })
  expect(res.status).toBe(403)
})

test("missing objective/target_url → 400", async () => {
  const res = await fetch(base + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ project_id: projectId }),
  })
  expect(res.status).toBe(400)
})
```

> **Implementer:** open `prototype/server.v1-runs.test.ts` first. If it inlines the spawn/token/project helpers rather than importing them, copy those inline helpers into this file (don't invent a `test-helpers/v1` module unless one already exists). The three tests above are the contract.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.v1-authored.test.ts`
Expected: FAIL — 404/route-not-found (all three assertions fail).

- [ ] **Step 3: Write minimal implementation**

Insert into `handle()` near `server.ts:7177` (before the generic `/api/` gate):

```ts
// KLA-550: objective-driven authored run — wraps the F1 authoring engine (runAuthorNow),
// which crystallizes a Trail AND runs a verification walk. Result composes with the existing
// GET /api/v1/runs/:verification_run_id/report. Auth mirrors /api/v1/runs (kci_ bearer).
if (path === "/api/v1/authored-runs" || path.startsWith("/api/v1/authored-runs/")) {
  const v1err = (code: string, message: string, status: number) =>
    json({ error: { code, message, request_id: crypto.randomUUID().slice(0, 8) } }, status)

  const raw = (req.headers.get("authorization") || "").match(/^Bearer\s+(kci_\S+)$/i)?.[1] ?? ""
  if (!raw) return v1err("unauthorized", "missing kci_ bearer token", 401)
  const info = await getExtensionTokenInfo(raw)
  if (!info || !info.projectId) return v1err("unauthorized", "invalid token", 401)
  const tokenProject = info.projectId

  if (req.method === "POST" && path === "/api/v1/authored-runs") {
    if (!allow(`v1authored:create:${tokenProject}`, 10, 60_000)) return v1err("rate_limited", "too many authored runs", 429)
    const body = await readJsonLimited(req, 8_000).catch(() => null) as any
    if (!body) return v1err("bad_request", "invalid JSON body", 400)
    if (body.project_id !== tokenProject) return v1err("forbidden", "token not scoped to project_id", 403)
    const objective = String(body.objective || "").trim()
    const targetUrl = String(body.target_url || "").trim()
    if (objective.length < 10 || objective.length > 4000) return v1err("bad_request", "objective must be 10-4000 chars", 400)
    if (!/^https?:\/\//i.test(targetUrl) || targetUrl.length > 500) return v1err("bad_request", "target_url must be an http(s) URL", 400)

    // Plan gate — same as POST /api/trails/author (server.ts:8010).
    const proj = await getProject(tokenProject)
    if (proj && snapLocked(proj)) return v1err("plan_required", "authored runs require a paid plan on this project", 402)

    // Idempotency — reuse api_idempotency (generic TEXT id column stores the session id).
    const idemKey = (req.headers.get("idempotency-key") || "").trim()
    if (idemKey) {
      const existing = await getIdempotentRunId(tokenProject, idemKey)
      if (existing) {
        const s = await getAuthorSession(tokenProject, existing)
        if (s && s.objective !== objective) return v1err("idempotency_conflict", "Idempotency-Key reused with a different objective", 409)
        if (s) return json({ ...buildAuthoredRunStatus(s), status_url: `/api/v1/authored-runs/${s.id}`, idempotent_replay: true }, 200)
      }
    }

    let sessionId: string
    try {
      const r = await runAuthorNow(tokenProject, {
        name: String(body.name || objective).slice(0, 80),
        objective,
        baseUrl: targetUrl,
        viewport: body.viewport,
        testAccount: body.test_account,
        simName: body.sim_name,
      } as any)
      sessionId = r.sessionId
    } catch (e: any) {
      const msg = String(e?.message || e)
      if (/busy|already running/i.test(msg)) return v1err("busy", "an AutoSim or authoring run is already in progress", 409)
      return v1err("internal", oops(e, "v1-authored-create").id, 500)
    }
    if (idemKey) await saveIdempotentRunId(tokenProject, idemKey, sessionId)
    return json({ authored_run_id: sessionId, status: "authoring", status_url: `/api/v1/authored-runs/${sessionId}` }, 202)
  }

  return v1err("not_found", "unknown authored-runs route", 404)
}
```

> **Implementer notes:**
> - `getProject` is the existing project loader used elsewhere in `server.ts` (the `/api/trails/author` route loads the project as `authorProj`); use the same accessor name that file already uses. If it's a different name (e.g. `loadProject`), match it.
> - The `autosimFlows` quota gate (`server.ts:8054`) is **intentionally deferred** here — it is dark unless `KLAV_BILLING_ENFORCEMENT=1`, and wiring `quotaExceeded` needs the account id resolver. Add a `// TODO(KLA-550): mirror autosimFlows quota gate once billing enforcement is on` comment. Do not import `quotaExceeded` yet.
> - `AuthorRequest` field names: confirm against `lib/trails-author.ts` (the route maps `base_url`→`baseUrl`, `test_account`→`testAccount`, `sim_name`→`simName`). If a field name differs, match the type, not this snippet.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.v1-authored.test.ts`
Expected: PASS for the 3 tests (202 create, 403 wrong project, 400 missing fields).

- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/server.v1-authored.test.ts
git commit -m "feat(v1): POST /api/v1/authored-runs trigger (KLA-550)"
```

---

### Task A3: `GET /api/v1/authored-runs/:id` (status poll) + cancel

**Files:**
- Modify: `prototype/server.ts` (extend the block from Task A2)
- Test: `prototype/server.v1-authored.test.ts` (add cases)

**Interfaces:**
- Consumes: `getAuthorSession`, `buildAuthoredRunStatus` (Task A1), `cancelCurrentAuthor` (backs `server.ts:8087`).
- Produces: `GET /api/v1/authored-runs/:id?project=` → 200 status object; `POST /api/v1/authored-runs/:id/cancel?project=` → 200.

- [ ] **Step 1: Write the failing test**

```ts
// append to prototype/server.v1-authored.test.ts
test("GET status echoes the wire shape and 404s unknown ids", async () => {
  // create one
  const c = await fetch(base + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ project_id: projectId, target_url: "https://example.com", objective: "Verify the login form rejects a blank password" }),
  })
  const { authored_run_id } = await c.json()

  const ok = await fetch(`${base}/api/v1/authored-runs/${authored_run_id}?project=${projectId}`, { headers: { authorization: `Bearer ${token}` } })
  expect(ok.status).toBe(200)
  const j = await ok.json()
  expect(j.authored_run_id).toBe(authored_run_id)
  expect(["authoring", "completed", "failed", "needs_auth", "cancelled"]).toContain(j.status)
  expect("trail_id" in j).toBe(true)
  expect("verification_run_id" in j).toBe(true)

  const miss = await fetch(`${base}/api/v1/authored-runs/auth_does_not_exist?project=${projectId}`, { headers: { authorization: `Bearer ${token}` } })
  expect(miss.status).toBe(404)
})

test("GET status rejects wrong project (403)", async () => {
  const res = await fetch(`${base}/api/v1/authored-runs/auth_x?project=proj_other`, { headers: { authorization: `Bearer ${token}` } })
  expect(res.status).toBe(403)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.v1-authored.test.ts`
Expected: FAIL — GET returns 404 for the freshly-created id (route not implemented), and the wrong-project test returns 404 not 403.

- [ ] **Step 3: Write minimal implementation**

Inside the same block (before the final `return v1err("not_found", …, 404)`), add:

```ts
  const m = path.match(/^\/api\/v1\/authored-runs\/([^/]+)(\/cancel)?$/)
  if (m) {
    const sessionId = m[1]
    const isCancel = !!m[2]
    const qp = url.searchParams.get("project") || ""
    if (qp !== tokenProject) return v1err("forbidden", "token not scoped to ?project", 403)

    if (req.method === "GET" && !isCancel) {
      const s = await getAuthorSession(tokenProject, sessionId)
      if (!s) return v1err("not_found", "unknown authored_run_id", 404)
      return json({ ...buildAuthoredRunStatus(s), status_url: `/api/v1/authored-runs/${s.id}` }, 200)
    }
    if (req.method === "POST" && isCancel) {
      const s = await getAuthorSession(tokenProject, sessionId)
      if (!s) return v1err("not_found", "unknown authored_run_id", 404)
      if (s.status !== "running") return json({ ...buildAuthoredRunStatus(s), cancel_requested: false }, 200)
      try { await cancelCurrentAuthor(sessionId) } catch { /* cooperative/best-effort */ }
      const after = await getAuthorSession(tokenProject, sessionId)
      return json({ ...buildAuthoredRunStatus(after || s), cancel_requested: true }, 200)
    }
  }
```

> **Implementer:** `cancelCurrentAuthor` is the function behind `POST /api/trails/author/:id/cancel` (`server.ts:8087`) — import it from wherever that route imports it (`lib/trails-author.ts` or `lib/trails-browser.ts`; grep `cancelCurrentAuthor`). `url` is already in scope (`const url = new URL(req.url)` at `server.ts:2421`).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.v1-authored.test.ts`
Expected: PASS (all Part-A tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/server.v1-authored.test.ts
git commit -m "feat(v1): authored-run status + cancel routes (KLA-550)"
```

---

### Task A4: Idempotency-replay integration test + rebase

**Files:**
- Test: `prototype/server.v1-authored.test.ts` (add case)

- [ ] **Step 1: Write the failing test**

```ts
test("Idempotency-Key replays the same authored_run_id", async () => {
  const key = "idem-" + projectId + "-A"
  const mk = () => fetch(base + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "idempotency-key": key },
    body: JSON.stringify({ project_id: projectId, target_url: "https://example.com", objective: "Confirm the signup CTA opens the register modal" }),
  })
  const a = await mk(); const ja = await a.json()
  const b = await mk(); const jb = await b.json()
  expect(jb.authored_run_id).toBe(ja.authored_run_id)
  expect(b.status).toBe(200)
  expect(jb.idempotent_replay).toBe(true)
})
```

- [ ] **Step 2: Run to verify** — should PASS already (logic added in A2); if the second call 409s or creates a new id, fix A2's replay branch. Run: `cd prototype && bun test server.v1-authored.test.ts`.

- [ ] **Step 3: Rebase + full suite sanity**

```bash
cd /Users/vishalkumar/Downloads/qbug/klav-snap-wt-authored-runs-mcp
git fetch origin master && git rebase origin/master   # on conflict: git merge --abort, keep commits
cd prototype && bun test server.v1-authored.test.ts lib/v1-authored.test.ts
```
Expected: all Part-A tests PASS.

- [ ] **Step 4: Commit**

```bash
git add prototype/server.v1-authored.test.ts
git commit -m "test(v1): authored-run idempotency replay (KLA-550)"
```

**Part A ships here.** It is independently deployable and testable without Part B.

---

## Part B — MCP server (`/mcp` Streamable-HTTP JSON-RPC)

**Decision:** hand-roll a minimal Streamable-HTTP-compatible JSON-RPC endpoint rather than add `@modelcontextprotocol/sdk`. Rationale: the SDK's `StreamableHTTPServerTransport` is coupled to Node `req/res` and does not drop cleanly into `Bun.serve`'s `fetch`; our surface is tiny and stateless; the MCP Streamable-HTTP spec permits a server to answer a POST with a single `application/json` JSON-RPC response (no SSE) when it isn't streaming. We implement `initialize`, `notifications/initialized`, `tools/list`, `tools/call`. Auth = `kci_` Bearer (same as REST); note in a comment that OAuth 2.1 is a later enterprise phase.

**Tools (all call lib functions directly — no HTTP round-trip):**
- `start_qa_run` → `runWalkNow(project_id, trail_id)` → returns `{ run_id }`.
- `start_authored_run` → `runAuthorNow(project_id, {objective, baseUrl})` → `{ authored_run_id }`.
- `get_qa_run` → `getWalk` + `buildV1RunStatus` (`lib/v1-runs.ts:46`).
- `get_qa_report` → `buildV1Report` (`lib/v1-runs.ts:148`).
- `get_authored_run` → `getAuthorSession` + `buildAuthoredRunStatus` (Task A1).
- `list_qa_runs` → `listRecentWalks(project_id)`.

Every tool is scoped to the token's project; `project_id` args must match the `kci_` token's project or the call errors.

### File Structure (Part B)
- Create `prototype/lib/mcp/tools.ts` — the tool registry: name → `{ description, inputSchema (JSON Schema object), handler(args, ctx) }`. `ctx = { projectId }` from the authed token. One responsibility: define + execute tools.
- Create `prototype/lib/mcp/rpc.ts` — pure JSON-RPC dispatcher: `handleMcpMessage(msg, ctx): Promise<object|null>` handling `initialize`/`tools/list`/`tools/call`/notifications. No I/O beyond calling tool handlers.
- Modify `prototype/server.ts` — one `if (path === "/mcp")` block: auth (`kci_`), parse body, call `handleMcpMessage`, return `json(...)`.
- Create `prototype/lib/mcp/rpc.test.ts` and `prototype/server.mcp.test.ts`.

---

### Task B1: Tool registry (`lib/mcp/tools.ts`)

**Files:**
- Create: `prototype/lib/mcp/tools.ts`
- Test: `prototype/lib/mcp/tools.test.ts`

**Interfaces:**
- Consumes: `runWalkNow` (`lib/trails-trigger.ts`), `runAuthorNow`, `getAuthorSession`, `buildAuthoredRunStatus`, `getWalk`, `buildV1RunStatus`, `buildV1Report`, `listRecentWalks`.
- Produces:
  - `interface McpToolCtx { projectId: string }`
  - `interface McpTool { name: string; description: string; inputSchema: object; handler(args: any, ctx: McpToolCtx): Promise<any> }`
  - `const MCP_TOOLS: McpTool[]`
  - `function getTool(name: string): McpTool | undefined`

- [ ] **Step 1: Write the failing test** (inject fakes so no browser/LLM runs)

```ts
// prototype/lib/mcp/tools.test.ts
import { test, expect } from "bun:test"
import { MCP_TOOLS, getTool } from "./tools"

test("registry exposes the expected tools with schemas", () => {
  const names = MCP_TOOLS.map(t => t.name).sort()
  expect(names).toEqual([
    "get_authored_run", "get_qa_report", "get_qa_run",
    "list_qa_runs", "start_authored_run", "start_qa_run",
  ])
  for (const t of MCP_TOOLS) {
    expect(typeof t.description).toBe("string")
    expect(t.inputSchema).toHaveProperty("type", "object")
  }
})

test("start_qa_run rejects a project_id that mismatches the token ctx", async () => {
  const tool = getTool("start_qa_run")!
  await expect(tool.handler({ project_id: "proj_other", trail_id: "t1" }, { projectId: "proj_me" }))
    .rejects.toThrow(/project/i)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd prototype && bun test lib/mcp/tools.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write minimal implementation**

```ts
// prototype/lib/mcp/tools.ts
import { runWalkNow } from "../trails-trigger"
import { runAuthorNow, getAuthorSession } from "../trails-author"
import { getWalk, listRecentWalks } from "../trails"
import { buildV1RunStatus, buildV1Report } from "../v1-runs"
import { buildAuthoredRunStatus } from "../v1-authored"

export interface McpToolCtx { projectId: string }
export interface McpTool {
  name: string
  description: string
  inputSchema: object
  handler(args: any, ctx: McpToolCtx): Promise<any>
}

function requireProject(args: any, ctx: McpToolCtx): string {
  const p = String(args?.project_id || "")
  if (!p) throw new Error("project_id is required")
  if (p !== ctx.projectId) throw new Error("project_id does not match the authenticated token's project")
  return p
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: "start_qa_run",
    description: "Start an AutoSim walk of an existing Trail. Returns a run_id immediately; poll get_qa_run.",
    inputSchema: { type: "object", required: ["project_id", "trail_id"], properties: {
      project_id: { type: "string" }, trail_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const trailId = String(args.trail_id || "")
      if (!trailId) throw new Error("trail_id is required")
      const { runId } = await runWalkNow(project, trailId)
      return { run_id: runId, status: "queued" }
    },
  },
  {
    name: "start_authored_run",
    description: "Start an objective-driven AutoSim: give a URL + natural-language objective, no pre-authored Trail. Returns an authored_run_id; poll get_authored_run.",
    inputSchema: { type: "object", required: ["project_id", "target_url", "objective"], properties: {
      project_id: { type: "string" }, target_url: { type: "string" }, objective: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const objective = String(args.objective || "").trim()
      const baseUrl = String(args.target_url || "").trim()
      if (objective.length < 10) throw new Error("objective must be at least 10 chars")
      if (!/^https?:\/\//i.test(baseUrl)) throw new Error("target_url must be an http(s) URL")
      const { sessionId } = await runAuthorNow(project, { name: objective.slice(0, 80), objective, baseUrl } as any)
      return { authored_run_id: sessionId, status: "authoring" }
    },
  },
  {
    name: "get_qa_run",
    description: "Get the status/verdict of an AutoSim run by run_id.",
    inputSchema: { type: "object", required: ["project_id", "run_id"], properties: {
      project_id: { type: "string" }, run_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walk = await getWalk(project, String(args.run_id || ""))
      if (!walk) throw new Error("unknown run_id")
      return buildV1RunStatus(walk)
    },
  },
  {
    name: "get_qa_report",
    description: "Fetch the structured, AI-consumable bug report for a completed run. Paginated via cursor.",
    inputSchema: { type: "object", required: ["project_id", "run_id"], properties: {
      project_id: { type: "string" }, run_id: { type: "string" }, cursor: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walk = await getWalk(project, String(args.run_id || ""))
      if (!walk) throw new Error("unknown run_id")
      return await buildV1Report(project, walk, { baseUrl: "", cursor: args.cursor ?? null })
    },
  },
  {
    name: "get_authored_run",
    description: "Get the status of an objective-driven authored run (its trail_id + verification_run_id once it completes).",
    inputSchema: { type: "object", required: ["project_id", "authored_run_id"], properties: {
      project_id: { type: "string" }, authored_run_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const s = await getAuthorSession(project, String(args.authored_run_id || ""))
      if (!s) throw new Error("unknown authored_run_id")
      return buildAuthoredRunStatus(s)
    },
  },
  {
    name: "list_qa_runs",
    description: "List recent AutoSim runs for the project.",
    inputSchema: { type: "object", required: ["project_id"], properties: { project_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walks = await listRecentWalks(project)
      return { runs: walks.map(buildV1RunStatus) }
    },
  },
]

export function getTool(name: string): McpTool | undefined {
  return MCP_TOOLS.find(t => t.name === name)
}
```

> **Implementer:** verify the exact exported names/signatures of `getWalk`, `listRecentWalks` (in `lib/trails.ts`), `buildV1RunStatus` (`lib/v1-runs.ts:46` — confirm whether it takes `(walk)` or `(walk, opts)`), and `buildV1Report` (`lib/v1-runs.ts:148` — signature `(projectId, walk, {baseUrl,cursor,limit})`). Match them; adjust the calls above if a signature differs. `runWalkNow` returns `{ runId }` (`lib/trails-trigger.ts`). If `getWalk`'s arg order is `(id)` not `(projectId, id)`, match the real one.

- [ ] **Step 4: Run to verify it passes**

Run: `cd prototype && bun test lib/mcp/tools.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/mcp/tools.ts prototype/lib/mcp/tools.test.ts
git commit -m "feat(mcp): tool registry wrapping the v1 run engine (KLA-550)"
```

---

### Task B2: JSON-RPC dispatcher (`lib/mcp/rpc.ts`)

**Files:**
- Create: `prototype/lib/mcp/rpc.ts`
- Test: `prototype/lib/mcp/rpc.test.ts`

**Interfaces:**
- Consumes: `MCP_TOOLS`, `getTool`, `McpToolCtx` (Task B1).
- Produces: `handleMcpMessage(msg: any, ctx: McpToolCtx): Promise<object | null>` — returns a JSON-RPC response object, or `null` for notifications (no reply). Protocol version string `const MCP_PROTOCOL_VERSION = "2025-06-18"`.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/mcp/rpc.test.ts
import { test, expect } from "bun:test"
import { handleMcpMessage } from "./rpc"

const ctx = { projectId: "proj_me" }

test("initialize returns protocol + capabilities + serverInfo", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }, ctx)
  expect(r.jsonrpc).toBe("2.0")
  expect(r.id).toBe(1)
  expect(r.result.protocolVersion).toBe("2025-06-18")
  expect(r.result.capabilities).toHaveProperty("tools")
  expect(r.result.serverInfo).toHaveProperty("name")
})

test("notifications/initialized yields no reply", async () => {
  const r = await handleMcpMessage({ jsonrpc: "2.0", method: "notifications/initialized" }, ctx)
  expect(r).toBeNull()
})

test("tools/list returns the tool descriptors", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, ctx)
  const names = r.result.tools.map((t: any) => t.name)
  expect(names).toContain("start_authored_run")
  expect(r.result.tools[0]).toHaveProperty("inputSchema")
})

test("tools/call unknown tool → JSON-RPC error -32602", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "nope", arguments: {} } }, ctx)
  expect(r.error.code).toBe(-32602)
})

test("tools/call surfaces a handler error as isError content, not a thrown exception", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 4, method: "tools/call",
    params: { name: "get_qa_run", arguments: { project_id: "proj_other", run_id: "x" } } }, ctx)
  expect(r.result.isError).toBe(true)
  expect(r.result.content[0].type).toBe("text")
})

test("unknown method → -32601", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 5, method: "bogus/method" }, ctx)
  expect(r.error.code).toBe(-32601)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd prototype && bun test lib/mcp/rpc.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write minimal implementation**

```ts
// prototype/lib/mcp/rpc.ts
import { MCP_TOOLS, getTool, type McpToolCtx } from "./tools"

export const MCP_PROTOCOL_VERSION = "2025-06-18"

const ok = (id: any, result: any) => ({ jsonrpc: "2.0", id, result })
const err = (id: any, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } })

export async function handleMcpMessage(msg: any, ctx: McpToolCtx): Promise<object | null> {
  const { id, method, params } = msg || {}
  // Notifications (no id) get no reply.
  if (id === undefined || id === null) {
    return null
  }
  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "klavity-autosim", version: "1" },
      })
    case "tools/list":
      return ok(id, { tools: MCP_TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) })
    case "tools/call": {
      const name = params?.name
      const tool = getTool(name)
      if (!tool) return err(id, -32602, `unknown tool: ${name}`)
      try {
        const out = await tool.handler(params?.arguments || {}, ctx)
        return ok(id, { content: [{ type: "text", text: JSON.stringify(out) }] })
      } catch (e: any) {
        // MCP convention: tool execution errors are reported in-band (isError), not as protocol errors.
        return ok(id, { content: [{ type: "text", text: String(e?.message || e) }], isError: true })
      }
    }
    default:
      return err(id, -32601, `method not found: ${method}`)
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd prototype && bun test lib/mcp/rpc.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/mcp/rpc.ts prototype/lib/mcp/rpc.test.ts
git commit -m "feat(mcp): JSON-RPC dispatcher (initialize/tools.list/tools.call) (KLA-550)"
```

---

### Task B3: Wire `/mcp` route into the server + integration test

**Files:**
- Modify: `prototype/server.ts` (insert `if (path === "/mcp")` block near the v1 blocks)
- Test: `prototype/server.mcp.test.ts`

**Interfaces:**
- Consumes: `handleMcpMessage` (Task B2), `getExtensionTokenInfo`, `json`, `readJsonLimited`, `allow`.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/server.mcp.test.ts — bootstrap identical to server.v1-authored.test.ts
import { test, expect, beforeAll, afterAll } from "bun:test"
// reuse the same inline spawn/token/project helpers used in server.v1-runs.test.ts
let base: string, token: string, projectId: string, stop: () => void
beforeAll(async () => { /* startTestServer + makeProject + mintCiToken (inline, as in v1-runs test) */ })
afterAll(() => stop())

const rpc = (bodyObj: any, tok = token) => fetch(base + "/mcp", {
  method: "POST",
  headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" },
  body: JSON.stringify(bodyObj),
})

test("unauthenticated /mcp → 401", async () => {
  const r = await fetch(base + "/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
  expect(r.status).toBe(401)
})

test("initialize handshake over HTTP", async () => {
  const r = await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(j.result.protocolVersion).toBe("2025-06-18")
})

test("tools/list over HTTP", async () => {
  const r = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
  const j = await r.json()
  expect(j.result.tools.map((t: any) => t.name)).toContain("start_authored_run")
})

test("tools/call get_qa_run with cross-project arg is reported isError, not 500", async () => {
  const r = await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_qa_run", arguments: { project_id: "proj_other", run_id: "x" } } })
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(j.result.isError).toBe(true)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd prototype && bun test server.mcp.test.ts`
Expected: FAIL — `/mcp` returns 404.

- [ ] **Step 3: Write minimal implementation**

Insert into `handle()` near the other v1 blocks:

```ts
// KLA-550: MCP server — Streamable-HTTP-compatible JSON-RPC over a single POST. Tools wrap the
// same v1 run engine. Auth = kci_ bearer (OAuth 2.1 is a later enterprise phase). Stateless:
// we answer each POST with one application/json JSON-RPC response (no SSE needed for our surface).
if (path === "/mcp") {
  const mcpErr = (status: number, message: string) =>
    json({ jsonrpc: "2.0", id: null, error: { code: -32000, message } }, status)
  if (req.method !== "POST") return mcpErr(405, "POST required")
  const raw = (req.headers.get("authorization") || "").match(/^Bearer\s+(kci_\S+)$/i)?.[1] ?? ""
  if (!raw) return mcpErr(401, "missing kci_ bearer token")
  const info = await getExtensionTokenInfo(raw)
  if (!info || !info.projectId) return mcpErr(401, "invalid token")
  if (!allow(`mcp:${info.projectId}`, 120, 60_000)) return mcpErr(429, "rate limited")
  const msg = await readJsonLimited(req, 32_000).catch(() => null) as any
  if (!msg || msg.jsonrpc !== "2.0") return mcpErr(400, "invalid JSON-RPC 2.0 message")
  const reply = await handleMcpMessage(msg, { projectId: info.projectId })
  if (reply === null) return new Response(null, { status: 202 })  // notification: no body
  return json(reply, 200)
}
```

> **Implementer:** add `import { handleMcpMessage } from "./lib/mcp/rpc"` to the server imports. Confirm `allow` is the imported name for the rate limiter (`server.ts:76`).

- [ ] **Step 4: Run to verify it passes**

Run: `cd prototype && bun test server.mcp.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/server.mcp.test.ts
git commit -m "feat(mcp): /mcp Streamable-HTTP JSON-RPC endpoint (KLA-550)"
```

---

### Task B4: Connection docs + rebase + full verification

**Files:**
- Create: `prototype/docs/mcp.md`

- [ ] **Step 1: Write the docs**

```markdown
# Klavity AutoSim — MCP server

Endpoint: `POST https://klavity.in/mcp` (JSON-RPC 2.0, Streamable HTTP).
Auth: `Authorization: Bearer <kci_ token>` (mint via `POST /api/ci/token`).

## Claude Code / Cursor config
```json
{ "mcpServers": { "klavity": {
  "url": "https://klavity.in/mcp",
  "headers": { "Authorization": "Bearer kci_YOUR_TOKEN" } } } }
```

## Tools
- `start_qa_run { project_id, trail_id }` → `{ run_id }`
- `start_authored_run { project_id, target_url, objective }` → `{ authored_run_id }`
- `get_qa_run { project_id, run_id }` → status/verdict
- `get_qa_report { project_id, run_id, cursor? }` → structured issues
- `get_authored_run { project_id, authored_run_id }` → trail_id + verification_run_id when complete
- `list_qa_runs { project_id }` → recent runs
```

- [ ] **Step 2: Rebase + run all new suites**

```bash
cd /Users/vishalkumar/Downloads/qbug/klav-snap-wt-authored-runs-mcp
git fetch origin master && git rebase origin/master   # conflict → git merge --abort, keep commits
cd prototype && bun test lib/v1-authored.test.ts lib/mcp/tools.test.ts lib/mcp/rpc.test.ts server.v1-authored.test.ts server.mcp.test.ts
```
Expected: all new suites PASS. Then a full `bun test 2>&1 | tail -20` to confirm no NEW failures beyond the known ~30 shared-DB isolation ones (diff against a stashed baseline if unsure).

- [ ] **Step 3: Commit**

```bash
git add prototype/docs/mcp.md
git commit -m "docs(mcp): connection + tool reference (KLA-550)"
```

---

## Self-Review

**Spec coverage:** Part A implements the objective-driven run (the P0 Momentic-parity gap) as `POST/GET/cancel /api/v1/authored-runs`, composing with the shipped report endpoint. Part B implements the MCP server (6 tools) over the same engine. Both are covered by tasks; both ship independently.

**Deferred (noted in tasks, not silently dropped):** the `autosimFlows` billing quota gate on authored runs (dark until `KLAV_BILLING_ENFORCEMENT=1`; TODO left in A2); OAuth 2.1 for MCP (bearer-key used now, noted in B3); outbound completion webhooks, scoped-key rotation, CLI/GitHub Action (separate later phases per KLA-550).

**Placeholder scan:** every code step contains real, runnable code grounded in verified signatures. Where a neighboring signature must be confirmed (`getWalk`, `listRecentWalks`, `buildV1RunStatus` arity, `cancelCurrentAuthor` import path, `getProject` name, `AuthorRequest` field names), the implementer note names the exact file to check — because the linear router and lib exports are large and these must match reality, not this document.

**Type consistency:** `authored_run_id` = the author `sessionId` throughout; `run_id` = a walk id throughout; `buildAuthoredRunStatus` (A1) is consumed identically in A2/A3/B1; `handleMcpMessage(msg, ctx)` and `McpToolCtx{projectId}` are consistent across B1/B2/B3.

**Known risk to flag at execution:** authoring is globally single-flighted (`withAuthorSlot`) and shares the default walk bucket with `runWalkNow`, so `start_authored_run` and `start_qa_run`/`POST /v1/runs` can `409/busy` each other under load. This is correct engine behavior; the API surfaces it as `409 busy`. If contention becomes a product problem, a queue is a separate ticket.
