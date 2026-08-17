# BugHerd Sub-project A — Passive client-error auto-ticketing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passively catch client-side JS errors / failed requests / `console.error` on customer sites and file each unique one as a deduped Klavity `fb_` ticket with recurrence + connector auto-copy, opt-in per project and hard-capped.

**Architecture:** A new SDK `installErrorReporter` beacons deduped errors to a new `POST /api/errors`; the server scrubs + fingerprints them and creates-or-bumps an `fb_` feedback row via a new `lib/client-error-ticket.ts`, reusing the existing feedback table, recurrence, and `autoCopyFeedback` connector path.

**Tech Stack:** Bun + TypeScript server (`prototype/`), libsql/Turso; SDK/widget in `packages/` (vite, vitest); server tests `bun test`.

## Global Constraints

- Never touch `master`; work only on `feat/bugherd-autocapture`. Do NOT edit the 7 version/CHANGELOG files (orchestrator owns them).
- No emoji in user-facing source (emoji CI guard). Use the Lucide icon system if UI glyphs are needed.
- Inline `<script>` in HTML must parse (inline-js guard) — no smart quotes in code.
- After any widget bundle rebuild: `node --check packages/sdk/dist/klavity-widget.iife.js`.
- Opt-in OFF by default; no behavior change for existing projects until they enable `autoCaptureErrors`.
- Reuse existing helpers — do NOT reinvent: `errorTicketSignature`-style fingerprinting, `insertFeedback`, `bumpFeedbackRecurrence`, `autoCopyFeedback`, `maskPii`/`maskDeep`, `redactUrl`, `rlAllow`.
- Test email for any flow: `vishal@quantana.com.au`.

---

### Task 1: DB layer — `feedback.signature`, `projects.widget_auto_capture_errors`, lookup + config

**Files:**
- Modify: `prototype/lib/db.ts` (migration `needCol` list near line 971 where `recurrence_count` already lives; `getWidgetConfig` ~2413; `setWidgetConfig` ~2426; add helper near `bumpFeedbackRecurrence` ~line 3179)
- Test: `prototype/lib/db.client-error-signature.test.ts`

**Interfaces:**
- Produces: `findFeedbackBySignature(projectId: string, signature: string): Promise<{ id: string; status: string; recurrenceCount: number } | null>`
- Produces: `getWidgetConfig(pid)` now also returns `autoCaptureErrors: boolean` (default false); `setWidgetConfig(pid, { autoCaptureErrors?: boolean })` persists it. (Doing this here — not in Task 4 — so the Task 3 endpoint can read the flag.)
- Consumes: existing `insertFeedback(FeedbackInsert)` — `FeedbackInsert` has no `signature` field yet; add `signature?: string | null` to the type and persist it in the INSERT.

Also add both migrations here: `feedback.signature TEXT` (+ index `feedback_sig_idx` on `(project_id, signature)`) and `projects.widget_auto_capture_errors INTEGER NOT NULL DEFAULT 0`. Ensure `projectById` selects `widget_auto_capture_errors` so `getWidgetConfig` can map it (`autoCaptureErrors: Number(p.widgetAutoCaptureErrors) === 1`), and `setWidgetConfig` handles `if (cfg.autoCaptureErrors !== undefined) { sets.push("widget_auto_capture_errors=?"); args.push(cfg.autoCaptureErrors ? 1 : 0) }`. Add a round-trip assertion to this task's test: `autoCaptureErrors` defaults false and round-trips via set/get.

- [ ] **Step 1: Write the failing test**
```ts
// @vitest-environment node  (bun test)
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
// boot an in-memory-ish file db via initDb pattern used by other db.*.test.ts, then:
test("findFeedbackBySignature returns the row for a project+signature, null otherwise", async () => {
  const pid = "proj_sig1"
  const id = await insertFeedback({ projectId: pid, observation: "boom", source: "auto-error", signature: "sig_abc" })
  const hit = await findFeedbackBySignature(pid, "sig_abc")
  expect(hit?.id).toBe(id)
  expect(await findFeedbackBySignature(pid, "nope")).toBeNull()
  expect(await findFeedbackBySignature("other_proj", "sig_abc")).toBeNull()
})
```
- [ ] **Step 2: Run test to verify it fails** — `cd prototype && bun test lib/db.client-error-signature.test.ts` → FAIL (`findFeedbackBySignature` not exported / column missing).
- [ ] **Step 3: Add the column migration** — in the `needCol("feedback", …)` block add: after the `recurrence_count` entry, ensure `if (needCol("feedback","signature")) await c.execute("ALTER TABLE feedback ADD COLUMN signature TEXT").catch(e=>console.warn("feedback.signature ALTER skipped:", e?.message||e))` and `await c.execute("CREATE INDEX IF NOT EXISTS feedback_sig_idx ON feedback (project_id, signature)").catch(()=>{})`.
- [ ] **Step 4: Extend `FeedbackInsert` + INSERT** — add `signature?: string | null` to the type (line ~2842) and include `signature` in the `insertFeedback` column list + args (default null).
- [ ] **Step 5: Add the helper**
```ts
export async function findFeedbackBySignature(projectId: string, signature: string): Promise<{ id: string; status: string; recurrenceCount: number } | null> {
  if (!signature) return null
  const r = await db!.execute({ sql: "SELECT id, status, recurrence_count FROM feedback WHERE project_id=? AND signature=? ORDER BY created_at ASC LIMIT 1", args: [projectId, signature] })
  if (!r.rows.length) return null
  const x = r.rows[0] as any
  return { id: String(x.id), status: String(x.status), recurrenceCount: Number(x.recurrence_count) || 1 }
}
```
- [ ] **Step 6: Run test to verify it passes** — `bun test lib/db.client-error-signature.test.ts` → PASS.
- [ ] **Step 7: Commit** — `git add prototype/lib/db.ts prototype/lib/db.client-error-signature.test.ts && git commit -m "feat(db): feedback.signature column + findFeedbackBySignature for client-error dedup"`

---

### Task 2: `lib/client-error-ticket.ts` — fingerprint + record (create/bump/reopen/mask)

**Files:**
- Create: `prototype/lib/client-error-ticket.ts`
- Test: `prototype/lib/client-error-ticket.test.ts`

**Interfaces:**
- Consumes: `findFeedbackBySignature` (Task 1), `insertFeedback`, `bumpFeedbackRecurrence(id, atMs)`, `maskPii`/`maskDeep` (`./data-masking`), `sha256hex` (`./crypto`).
- Produces:
  - `type ClientError = { kind: "error" | "unhandledrejection" | "console.error" | "network"; message: string; stack?: string; pageUrl: string; selector?: string; status?: number }`
  - `clientErrorSignature(projectId: string, e: ClientError): string`  (sha256, 32-char)
  - `severityFor(e: ClientError): "high" | "medium" | "low"`
  - `recordClientError(projectId: string, e: ClientError, ctx: any, opts?: { atMs?: number; overCap?: boolean }): Promise<{ id: string; created: boolean }>`

- [ ] **Step 1: Write the failing test**
```ts
import { test, expect } from "bun:test"
import { clientErrorSignature, severityFor, recordClientError } from "./client-error-ticket"
test("signature is stable per (project,message,topframe,pageUrl) and project-scoped", () => {
  const e = { kind: "error", message: "x is not a function", stack: "at f (a.js:1:2)\nat g", pageUrl: "https://s.com/a" } as any
  expect(clientErrorSignature("p1", e)).toBe(clientErrorSignature("p1", { ...e, message: "x is not a function " }))
  expect(clientErrorSignature("p1", e)).not.toBe(clientErrorSignature("p2", e))
})
test("severity: uncaught error > 5xx network > console.error", () => {
  expect(severityFor({ kind: "error" } as any)).toBe("high")
  expect(severityFor({ kind: "network", status: 500 } as any)).toBe("medium")
  expect(severityFor({ kind: "console.error" } as any)).toBe("low")
})
test("first occurrence creates a fb_ ticket; second bumps recurrence, not a new ticket", async () => {
  const pid = "proj_cet1"
  const e = { kind: "error", message: "boom user@x.com", stack: "at f", pageUrl: "https://s.com/p" } as any
  const a = await recordClientError(pid, e, {}, { atMs: 1000 })
  expect(a.created).toBe(true)
  const b = await recordClientError(pid, e, {}, { atMs: 2000 })
  expect(b.created).toBe(false)
  expect(b.id).toBe(a.id)
})
test("PII in the message is masked before persistence", async () => {
  const pid = "proj_cet2"
  const { id } = await recordClientError(pid, { kind: "error", message: "fail for user@example.com", pageUrl: "https://s.com" } as any, {}, { atMs: 1 })
  const row = /* SELECT observation FROM feedback WHERE id=? */ await getObservation(id)
  expect(row).not.toContain("user@example.com")
})
```
- [ ] **Step 2: Run test to verify it fails** — `bun test lib/client-error-ticket.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement `clientErrorSignature` + `severityFor`**
```ts
import { sha256hex } from "./crypto"
import { maskPii, maskDeep } from "./data-masking"
import { insertFeedback, bumpFeedbackRecurrence, findFeedbackBySignature } from "./db"
const norm = (s?: string) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim().replace(/\d+/g, "#")
const topFrame = (stack?: string) => String(stack || "").split("\n").map(s => s.trim()).find(Boolean) || ""
export function clientErrorSignature(projectId: string, e: ClientError): string {
  return sha256hex([projectId, e.kind === "network" ? "network" : "js", norm(e.message), norm(new URL(e.pageUrl, "http://x").pathname), norm(topFrame(e.stack)), e.selector || ""].join("\n")).slice(0, 32)
}
export function severityFor(e: ClientError): "high" | "medium" | "low" {
  if (e.kind === "error" || e.kind === "unhandledrejection") return "high"
  if (e.kind === "network") return (e.status || 0) >= 500 || e.status === 0 ? "medium" : "low"
  return "low"
}
```
- [ ] **Step 4: Implement `recordClientError`** (create-or-bump; mask; connector copy is triggered by the CALLER in Task 3 via `autoCopyFeedback`, so this returns `created`)
```ts
export async function recordClientError(projectId, e, ctx, opts = {}) {
  const atMs = opts.atMs ?? Date.now()
  const signature = clientErrorSignature(projectId, e)
  const existing = await findFeedbackBySignature(projectId, signature)
  if (existing) { await bumpFeedbackRecurrence(existing.id, atMs); return { id: existing.id, created: false } }
  if (opts.overCap) { /* over the per-project cap and no existing ticket → drop, caller logs */ return { id: "", created: false } }
  const message = maskPii(String(e.message || "")).slice(0, 2000)
  const priority = severityFor(e) === "high" ? "high" : severityFor(e) === "medium" ? "medium" : "low"
  const host = (() => { try { return new URL(e.pageUrl).host } catch { return null } })()
  const path = (() => { try { return new URL(e.pageUrl).pathname } catch { return null } })()
  const id = await insertFeedback({ projectId, observation: `[auto] ${message}`, priority, source: "auto-error", signature, urlHost: host, urlPath: path, clientContext: maskDeep(ctx || {}) })
  return { id, created: true }
}
```
- [ ] **Step 5: Run test to verify it passes** — `bun test lib/client-error-ticket.test.ts` → PASS.
- [ ] **Step 6: Commit** — `git add prototype/lib/client-error-ticket.ts prototype/lib/client-error-ticket.test.ts && git commit -m "feat(errors): client-error fingerprint + create/bump/mask recorder"`

---

### Task 3: `POST /api/errors` endpoint — gate, rate-cap, record + auto-copy

**Files:**
- Modify: `prototype/server.ts` (add route near `POST /api/feedback` ~line 3345; add `recordClientError` + `findFeedbackBySignature` imports; add `getWidgetConfig` is already imported)
- Test: `prototype/server.errors-endpoint.test.ts`

**Interfaces:**
- Consumes: `projectById`, `getWidgetConfig` (extended in Task 4 — until then treat missing flag as OFF), `rlAllow`, `recordClientError`, `autoCopyFeedback(feedbackId, projectId, actor, priority?)`.
- Produces: HTTP `POST /api/errors` accepting JSON `{ projectId, errors: ClientError[], context?: any }`.

- [ ] **Step 1: Write the failing test** (boot server like `server.workspace-rename.test.ts`; seed a project with `autoCaptureErrors` enabled — set `widget_auto_capture_errors=1` directly in the test DB until Task 4 adds the setter):
```ts
test("POST /api/errors creates a ticket for a new signature; repeats bump not create", async () => {
  const body = { projectId: PROJ, errors: [{ kind: "error", message: "boom", stack: "at f", pageUrl: "https://acme.test/p" }] }
  const r1 = await fetch(`${BASE}/api/errors`, { method: "POST", headers: { "content-type": "application/json", origin: "https://acme.test" }, body: JSON.stringify(body) })
  expect(r1.status).toBe(200); const d1 = await r1.json(); expect(d1.created).toBe(1)
  const r2 = await fetch(`${BASE}/api/errors`, { method: "POST", headers: { "content-type": "application/json", origin: "https://acme.test" }, body: JSON.stringify(body) })
  const d2 = await r2.json(); expect(d2.created).toBe(0)
})
test("unknown project → 404; disabled project → 200 but created:0 (no-op)", async () => { /* … */ })
test("per-project hourly cap: beyond cap, new signatures fold to recurrence-only (created stops rising)", async () => { /* loop > cap distinct errors */ })
```
- [ ] **Step 2: Run test to verify it fails** — `bun test server.errors-endpoint.test.ts` → FAIL (404, route missing).
- [ ] **Step 3: Implement the route**
```ts
if (req.method === "POST" && path === "/api/errors") {
  const reqOrigin = req.headers.get("origin") || ""
  if (!reqOrigin) return json({ error: "origin required" }, 400)
  const body = await req.json().catch(() => ({}))
  const pid = String(body.projectId || "").trim()
  const proj = pid ? await projectById(pid) : null
  if (!proj) return json({ error: "Unknown project." }, 404)
  const cfg = await getWidgetConfig(pid)
  if (!cfg || (cfg as any).autoCaptureErrors !== true) return json({ ok: true, created: 0, disabled: true })
  const ip = clientIp(req, server)
  if (!rlAllow(`errIp:${ip}`, ERRORS_ANON_PER_IP, ERRORS_WINDOW)) return json({ error: "rate limited" }, 429)
  const errors = Array.isArray(body.errors) ? body.errors.slice(0, 20) : []
  let created = 0
  for (const e of errors) {
    if (!e || typeof e.message !== "string" || typeof e.pageUrl !== "string") continue
    const overCap = !rlAllow(`errProj:${pid}`, ERRORS_PER_PROJECT_HOUR, ERRORS_WINDOW)
    try {
      const res = await recordClientError(pid, e, body.context || {}, { overCap })
      if (res.created) { created++; autoCopyFeedback(res.id, pid, null, undefined) }
    } catch (err: any) { console.error("client-error record failed:", err?.message || err) }
  }
  if (errors.length && created === 0) console.warn(`/api/errors: ${errors.length} error(s) folded to recurrence/cap for ${pid}`)
  return json({ ok: true, created })
}
```
Add constants near the OTP rate constants: `const ERRORS_WINDOW = 60 * 60 * 1000`, `const ERRORS_ANON_PER_IP = 120`, `const ERRORS_PER_PROJECT_HOUR = 50`.
- [ ] **Step 4: Run test to verify it passes** — `bun test server.errors-endpoint.test.ts` → PASS.
- [ ] **Step 5: Boot-smoke** — `bun run server.ts` boots (the test already proves this) + no tsc regression in changed files.
- [ ] **Step 6: Commit** — `git add prototype/server.ts prototype/server.errors-endpoint.test.ts && git commit -m "feat(errors): POST /api/errors — gated, rate-capped, dedup→ticket + auto-copy"`

---

### Task 4: `autoCaptureErrors` — settings toggle + SDK config exposure

**Files:**
- Modify: `prototype/server.ts` (the widget-config read endpoint the SDK fetches, and the admin settings write endpoint — mirror how `mode`/`reportGate` are exposed/saved)
- Modify: `prototype/public/dashboard.html` (settings drawer: an admin toggle, mirroring existing widget-mode controls)
- Test: `prototype/server.widget-autocapture-config.test.ts`

**Interfaces:**
- Consumes: `getWidgetConfig`/`setWidgetConfig` with `autoCaptureErrors` (added in Task 1).
- Produces: the SDK-facing widget config payload now carries `autoCaptureErrors`; the admin write endpoint accepts it.

- [ ] **Step 1: Write the failing test** — boot server (workspace-rename harness); seed an admin session + project; POST the widget-config write endpoint with `autoCaptureErrors:true`; GET the SDK-facing widget config endpoint for that project and assert it returns `autoCaptureErrors:true`; assert a non-admin gets 403 on the write.
- [ ] **Step 2: Run to verify it fails** — `bun test server.widget-autocapture-config.test.ts` → FAIL.
- [ ] **Step 3: Expose in the SDK-facing widget config endpoint** — find where the widget fetches its config (grep for the endpoint returning `mode`/`reportGate`/`ctaUrl` to the client) and include `autoCaptureErrors` from `getWidgetConfig`.
- [ ] **Step 4: Accept in the admin write endpoint** — where the settings drawer saves widget mode/gate, read `autoCaptureErrors` from the body and pass to `setWidgetConfig` (admin-gated — mirror the existing role check).
- [ ] **Step 5: Add the settings toggle** — in `dashboard.html` settings drawer, an admin-only toggle next to the widget-mode controls that reads current value from the config load and POSTs on change. No emoji; reuse existing control styles; keep inline JS parseable.
- [ ] **Step 6: Run to verify it passes** — PASS.
- [ ] **Step 7: Guards** — `node scripts/check-inline-js.mjs && node scripts/check-inline-defs.mjs && node scripts/check-no-emoji.mjs` → pass.
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat(errors): autoCaptureErrors settings toggle + SDK config exposure"`

---

### Task 5: SDK `error-reporter.ts` — dedup ring, triggers, beacon

**Files:**
- Create: `packages/sdk/src/error-reporter.ts`
- Test: `packages/sdk/src/error-reporter.test.ts` (vitest, jsdom)

**Interfaces:**
- Consumes: `installCapture` `onError` hook (`@klavity/core/capture`), `buildCaptureContext` (`./capture-context`).
- Produces: `installErrorReporter(opts: { backendUrl: string; projectId: string; enabled: boolean; buffers: CaptureBuffers; contextSnapshot: () => any }): void`

- [ ] **Step 1: Write the failing test**
```ts
// @vitest-environment jsdom
import { installErrorReporter } from "./error-reporter"
it("beacons the first occurrence of a signature, dedupes repeats in-session", () => {
  const sent: any[] = []
  ;(navigator as any).sendBeacon = (url: string, body: string) => { sent.push(JSON.parse(body)); return true }
  installErrorReporter({ backendUrl: "https://k", projectId: "p", enabled: true, buffers: { consoleErrors: [], networkFailures: [] }, contextSnapshot: () => ({}) })
  window.dispatchEvent(new ErrorEvent("error", { message: "boom", error: new Error("boom") }))
  window.dispatchEvent(new ErrorEvent("error", { message: "boom", error: new Error("boom") }))
  expect(sent.length).toBe(1)
})
it("is a no-op when enabled:false", () => { /* sendBeacon never called */ })
it("captures console.error and 5xx/0 network but not 4xx", () => { /* … */ })
```
- [ ] **Step 2: Run to verify it fails** — `cd packages/core && npx vitest run ../sdk/src/error-reporter.test.ts` (or the sdk vitest config) → FAIL.
- [ ] **Step 3: Implement** — install `onError`-based hooks (uncaught + rejection already surfaced by `installCapture`; wrap `console.error`; wrap fetch/XHR completion for status>=500||0), compute a client signature (message+topframe+path), keep a `Set` of seen signatures, `sendBeacon(backendUrl+"/api/errors", JSON.stringify({ projectId, errors:[e], context: contextSnapshot() }))` on first-seen; `fetch(..,{keepalive:true})` fallback. No-op when `!enabled`. Cap payload sizes (reuse core truncation).
- [ ] **Step 4: Run to verify it passes** — PASS.
- [ ] **Step 5: Commit** — `git add packages/sdk/src/error-reporter.ts packages/sdk/src/error-reporter.test.ts && git commit -m "feat(sdk): passive error-reporter with in-session dedup + beacon"`

---

### Task 6: Wire error-reporter into the widget (gated) + rebuild bundle

**Files:**
- Modify: `packages/sdk/src/widget.ts` (after config fetch + capture install, call `installErrorReporter` when `cfg.autoCaptureErrors`)
- Modify: `packages/sdk/dist/klavity-widget.iife.js` (rebuilt artifact — tracked)

**Interfaces:**
- Consumes: `installErrorReporter` (Task 5), the widget's existing config object (now carrying `autoCaptureErrors` from Task 4), the widget's capture buffers + `buildCaptureContext`.

- [ ] **Step 1: Wire it** — where the widget already calls `installCaptureContext`, add: `if (cfg.autoCaptureErrors) installErrorReporter({ backendUrl: cfg.backendUrl, projectId: cfg.projectId, enabled: true, buffers: _buffers, contextSnapshot: () => buildCaptureContext(_buffers) })`.
- [ ] **Step 2: Typecheck** — `npx tsc --noEmit -p packages/sdk/tsconfig.json` → no errors.
- [ ] **Step 3: Rebuild bundle** — `pnpm -C packages/sdk build`.
- [ ] **Step 4: Verify bundle** — `node --check packages/sdk/dist/klavity-widget.iife.js` → OK; `grep -c installErrorReporter packages/sdk/dist/klavity-widget.iife.js` ≥ 1.
- [ ] **Step 5: Full suites** — `cd packages/core && npx vitest run` (green) and `cd prototype && bun test` (the new server/lib tests green; pre-existing unrelated failures unchanged).
- [ ] **Step 6: Commit** — `git add -f packages/sdk/dist/klavity-widget.iife.js && git add packages/sdk/src/widget.ts && git commit -m "feat(widget): mount passive error-reporter when autoCaptureErrors is on"`

---

## Verification (whole feature)

- [ ] Enable `autoCaptureErrors` on a test project; from a page with the widget, throw an uncaught error twice → exactly one `fb_` ticket tagged `source:auto-error`, `recurrence_count` = 2, visible in the dashboard triage, PII masked, connector copy fired (if a connector is configured).
- [ ] With the flag OFF, the same errors produce zero tickets and no beacons.
- [ ] Exceed the per-project hourly cap → new distinct errors stop creating tickets and log the fold, existing tickets still bump.
- [ ] `bun test` (new suites green), `packages/core` vitest green, emoji + inline-js guards pass, widget bundle `node --check` OK.
- [ ] CHANGELOG entry under the feature (union-merges; do NOT bump version).
- [ ] Pull latest master, rebase, re-run tests before leaving the branch.
