# Mobile Publishable Key Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-project **publishable key** that authorizes filing bug reports to `POST /api/feedback` from a client that has no browser `Origin` header or Turnstile challenge (i.e. the Flutter mobile SDK), so mobile reports flow through the same intake pipeline (triage / Sims / connectors / dashboard) as web reports.

**Architecture:** A publishable key is a Sentry-DSN-style token (`pk_…`) — safe to ship in an app binary because it only authorizes *filing reports to one project*, is rate-limited, and honors the project's `reportGate`. One re-viewable key per project, stored plaintext in a new `projects.publishable_key` column, generated/rotated by a project admin in Settings. On `/api/feedback`, a request carrying a valid `publishableKey` (and no Origin — a non-browser caller) satisfies the anonymous gate: the project is derived FROM the key (never trusted from the form), a per-key + per-IP rate limit applies, and the existing `reportGate` still runs.

**Tech Stack:** Bun + TypeScript server (`prototype/server.ts`), libSQL/Turso (`prototype/lib/db.ts`), `bun test`, vanilla-JS dashboard (`prototype/public/dashboard.html`).

## Global Constraints

- Never touch `master` directly — work on the `feat/mobile-publishable-key` branch in the worktree; the orchestrator merges. (from CLAUDE.md)
- Do NOT bump version / CHANGELOG / PRD version lines — the orchestrator stamps one version per integration.
- Run `bun test` from `prototype/` before calling a task done; keep it green.
- The publishable key is `pk_` + 64 hex chars (two `crypto.randomUUID()` halves, dashes stripped) — matches the existing `ext_`/`kci_` token shape in `prototype/lib/db.ts`.
- `project_id` for a publishable-key submit is ALWAYS derived from the resolved key, never read from the request body (tenant-isolation invariant).
- The publishable-key gate applies ONLY to non-browser callers (no `Origin` header). A browser request keeps the existing Origin/Turnstile gate. This preserves the web widget's anti-abuse posture unchanged.
- New settings UI + writes are admin-only (mirror the existing bug-notify admin gating: `state.active.role === "admin"` client-side AND `access === "admin"` server-side).
- Rate limits reuse the existing `rlAllow(key, limit, windowMs)` helper and the `FEEDBACK_ANON_WINDOW` (1h) window. New per-key limit constant `FEEDBACK_PK_PER_KEY = 200` (same as per-project). The existing per-IP limit (`FEEDBACK_ANON_PER_IP = 20`/h) still applies to the mobile caller.

---

### Task 1: DB layer — publishable key column + helpers

**Files:**
- Modify: `prototype/lib/db.ts` (add column migration ~line 1170 next to `dedup_enabled`; add `publishableKey` to `ProjectRow` + `rowToProject`; add three exported functions near `getProjectSlackWebhookUrl` ~line 2946)
- Test: `prototype/lib/publishable-key.test.ts` (new)

**Interfaces:**
- Produces:
  - `newPublishableKey(): string` — returns a fresh `pk_<64hex>` string (pure, exported for the test + rotate).
  - `getProjectByPublishableKey(pk: string): Promise<{ id: string } | null>` — resolves a presented key to its project id, or null (unknown/blank).
  - `rotateProjectPublishableKey(projectId: string): Promise<string>` — generates + stores a new key on the project (replacing any prior), returns the plaintext key.
  - `ProjectRow.publishableKey: string | null` — the stored key, exposed on the mapped project row (admin read-back only).

- [ ] **Step 1: Write the failing test**

Create `prototype/lib/publishable-key.test.ts`:

```ts
import { test, expect } from "bun:test"
import { newPublishableKey } from "./db"

test("newPublishableKey has the pk_ prefix and 64 hex chars", () => {
  const k = newPublishableKey()
  expect(k).toMatch(/^pk_[0-9a-f]{64}$/)
})

test("newPublishableKey is unique per call", () => {
  expect(newPublishableKey()).not.toBe(newPublishableKey())
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/publishable-key.test.ts`
Expected: FAIL — `newPublishableKey` is not exported from `./db`.

- [ ] **Step 3: Add the column migration**

In `prototype/lib/db.ts`, immediately after the `dedup_enabled` ALTER (search `projects", "dedup_enabled"`), add:

```ts
  // Mobile SDK publishable key (pk_…): a Sentry-DSN-style token that authorizes filing reports to THIS
  // project from a non-browser client (the Flutter SDK — no Origin/Turnstile). NULL until an admin
  // generates one. Plaintext by design (it is publishable / shipped in an app binary and only authorizes
  // filing to one project — rate-limited + reportGate-honored), so Settings can re-display it.
  if (needCol("projects", "publishable_key")) await c.execute("ALTER TABLE projects ADD COLUMN publishable_key TEXT").catch((e) => console.warn("projects.publishable_key ALTER skipped:", e?.message || e))
```

Add an index for the resolve-by-key lookup — find the block of `CREATE INDEX IF NOT EXISTS` statements that runs at init (search `ext_tok_email_idx`) and add alongside it:

```ts
    `CREATE INDEX IF NOT EXISTS projects_pubkey_idx ON projects (publishable_key)`,
```

- [ ] **Step 4: Expose `publishableKey` on the project row**

In the `ProjectRow` type (search `dedupEnabled: boolean`), add after it:

```ts
  // Mobile SDK publishable key (pk_…), null until generated. Admin read-back only.
  publishableKey: string | null
```

In `rowToProject` (search `dedupEnabled: x.dedup_enabled`), add after it:

```ts
    publishableKey: x.publishable_key != null ? String(x.publishable_key) : null,
```

- [ ] **Step 5: Add the three helper functions**

In `prototype/lib/db.ts`, immediately after `getProjectDedupEnabled`/`setProjectDedupEnabled` (search `setProjectDedupEnabled`), add:

```ts
// Mobile SDK publishable key (pk_…). Sentry-DSN-style: safe to ship in an app binary (authorizes filing
// reports to ONE project only, rate-limited + reportGate-honored). One re-viewable key per project.
export function newPublishableKey(): string {
  return "pk_" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
}
// Resolve a presented publishable key → its project id (or null). Blank / unknown → null.
export async function getProjectByPublishableKey(pk: string): Promise<{ id: string } | null> {
  const key = (pk || "").trim()
  if (!/^pk_[0-9a-f]{64}$/.test(key)) return null
  const r = await db!.execute({ sql: "SELECT id FROM projects WHERE publishable_key=? LIMIT 1", args: [key] })
  return r.rows.length ? { id: String((r.rows[0] as any).id) } : null
}
// Generate + store a fresh publishable key for the project (replaces any prior), returning the plaintext.
export async function rotateProjectPublishableKey(projectId: string): Promise<string> {
  const key = newPublishableKey()
  await db!.execute({ sql: "UPDATE projects SET publishable_key=?, updated_at=? WHERE id=?", args: [key, Date.now(), projectId] })
  return key
}
```

Note: `crypto` is already imported/global in `db.ts` (used by `issueCIToken`); do not add an import.

- [ ] **Step 6: Run test to verify it passes**

Run: `cd prototype && bun test lib/publishable-key.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add prototype/lib/db.ts prototype/lib/publishable-key.test.ts
git commit -m "feat(db): per-project mobile publishable key column + helpers"
```

---

### Task 2: `/api/feedback` — accept a publishable key as the mobile anon gate

**Files:**
- Modify: `prototype/server.ts` (import the two DB fns; add `FEEDBACK_PK_PER_KEY` const near `FEEDBACK_ANON_PER_PROJECT` ~line 3007; gate logic in the `POST /api/feedback` handler ~line 5040-5120)
- Test: `prototype/server.publishable-key.test.ts` (new)

**Interfaces:**
- Consumes: `getProjectByPublishableKey` (Task 1).
- Produces: a request to `POST /api/feedback` with form field `publishableKey=pk_…` and NO `Origin` header files a report into the resolved project (subject to reportGate + rate limits); `project_id` in the body is ignored in favor of the resolved key's project.

- [ ] **Step 1: Write the failing test**

Create `prototype/server.publishable-key.test.ts`. Mirror the setup of an existing feedback test — read `prototype/server.feedback-anon.test.ts` first for the exact harness (how it imports the handler / seeds a project / posts multipart). The test asserts:

```ts
// @vitest-environment node  (bun test — this comment is illustrative; follow the existing feedback test's harness)
import { test, expect } from "bun:test"
// Reuse the same in-memory-DB + handler bootstrapping the sibling server.feedback-anon.test.ts uses.
// (Import initDb + the request handler / a postFeedback helper exactly as that file does.)

test("a valid publishableKey with NO Origin files into the key's project", async () => {
  // 1. init a fresh test DB, create a project P, rotate a key for it (rotateProjectPublishableKey(P)).
  // 2. POST /api/feedback with form fields: description="mobile bug", publishableKey=<key>, project_id="WRONG_PROJECT"
  //    and NO Origin header.
  // 3. Expect 200 + the created feedback row's project_id === P (NOT "WRONG_PROJECT").
})

test("an unknown publishableKey with no Origin is rejected", async () => {
  // POST with publishableKey="pk_" + "0".repeat(64) and no Origin → expect a 4xx (not accepted).
})
```

Write these two tests concretely against the harness the sibling test uses (seed project, call `rotateProjectPublishableKey`, post multipart, read back the row). Do NOT leave the bodies as comments — fill them in following `server.feedback-anon.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.publishable-key.test.ts`
Expected: FAIL — the publishableKey path isn't handled; the report either 404s (unknown project) or files under the wrong project.

- [ ] **Step 3: Import the DB helper + add the per-key rate constant**

In `prototype/server.ts`, add `getProjectByPublishableKey` to the big `from "./lib/db"` import list (alongside `getProjectByPublishableKey`… i.e. add the identifier). Near `const FEEDBACK_ANON_PER_PROJECT = 200` add:

```ts
const FEEDBACK_PK_PER_KEY = 200 // per publishable key, per FEEDBACK_ANON_WINDOW (mobile SDK)
```

- [ ] **Step 4: Resolve the publishable key BEFORE the Origin gate**

In the `POST /api/feedback` handler, after `const reqOrigin = req.headers.get("origin") || ""` and the `anonActor` computation (search `const anonActor =`), and BEFORE the per-IP limit block, add the key resolution. Read the surrounding code first (server.ts ~4935-5045) so the insertion matches the existing structure:

```ts
        // Mobile SDK path: a non-browser caller (no Origin) may authorize an anonymous submit with a
        // per-project publishable key (pk_…) instead of the Origin/Turnstile gate. The project is derived
        // FROM the key (never trusted from the body). Browser callers (Origin present) keep the existing
        // gate untouched. Resolved here so both the rate-limit and persist branches can use it.
        let pkProjectId: string | null = null
        if (anonActor && !reqOrigin) {
          const pk = String(form.get("publishableKey") || "").trim()
          if (pk) {
            const proj = await getProjectByPublishableKey(pk)
            if (!proj) return wjson({ error: "Invalid publishable key." }, 401)
            pkProjectId = proj.id
            if (!rlAllow(`fbpk:key:${pk.slice(0, 12)}:${proj.id}`, FEEDBACK_PK_PER_KEY, FEEDBACK_ANON_WINDOW)) return wjson({ error: "rate limited" }, 429)
          }
        }
```

IMPORTANT: `form` must be parsed before this block. Confirm the `const form = await req.formData()` line precedes it (server.ts ~5052 in the current code); if the current structure parses `form` AFTER the `anonActor` block, move this resolution to immediately after `const form = ...`. Keep the per-IP limit (`fbanon:ip`) as-is — it still applies to the mobile caller.

- [ ] **Step 5: Make the resolved key satisfy the anon gate + set the project**

Find where the cross-origin widget gate sets `anonWidgetAllowed` and resolves `reqProjectId`/the project (server.ts ~5100-5125, the `if (anonActor && reqOrigin)` block). Add a sibling branch so a publishable-key submit is allowed and its project is used. After that block add:

```ts
        // Publishable-key submit (no Origin): treat as an allowed anonymous widget submit, scoped to the
        // key's project. reportGate still applies below (email/login gates use the same validReporterEmail).
        if (pkProjectId) {
          const gate = (await getWidgetConfig(pkProjectId))?.reportGate || "anonymous"
          if (gate === "login") return wjson({ error: "Sign in to report on this project." }, 401)
          if (gate === "email" && !validReporterEmail) return wjson({ error: "A valid email is required to submit." }, 400)
          anonWidgetAllowed = true
        }
```

Then, at the point where the persist branch decides the project id for an anonymous widget submit (search where `reqProjectId` / the resolved project id is used to insert the feedback row), ensure `pkProjectId` takes precedence. Read that section and set the effective project id to `pkProjectId ?? <existing resolved project id>`. (The exact variable name is in the persist branch — follow it; the invariant is: when `pkProjectId` is set, the row's `project_id` MUST be `pkProjectId`.)

- [ ] **Step 6: Run test to verify it passes**

Run: `cd prototype && bun test server.publishable-key.test.ts`
Expected: PASS (2 tests) — the report files under the key's project; an unknown key 401s.

- [ ] **Step 7: Run the feedback + anon regression suite**

Run: `cd prototype && bun test server.feedback-anon.test.ts server.feedback-dedup-race.test.ts`
Expected: PASS (no regression to the browser Origin/Turnstile path).

- [ ] **Step 8: Commit**

```bash
git add prototype/server.ts prototype/server.publishable-key.test.ts
git commit -m "feat(feedback): accept a per-project publishable key as the mobile submit gate"
```

---

### Task 3: Settings — generate/rotate/reveal the publishable key

**Files:**
- Modify: `prototype/server.ts` (config GET read-back ~line 12545; config POST accept a `rotatePublishableKey` action ~line 12530)
- Modify: `prototype/public/dashboard.html` (markup after the `kl-dedup` section ~line 2874; save + load handlers)
- Test: extend `prototype/server.publishable-key.test.ts`

**Interfaces:**
- Consumes: `rotateProjectPublishableKey` (Task 1), `proj.publishableKey` (Task 1).
- Produces: `GET /api/projects/:id/config` returns `publishableKey` (admin-only, the plaintext or null); `POST` with `{ rotatePublishableKey: true }` generates + returns a new key.

- [ ] **Step 1: Write the failing test**

Append to `prototype/server.publishable-key.test.ts`:

```ts
test("admin config GET returns the publishable key; rotate issues a new one", async () => {
  // 1. seed project P + an admin session/bearer for it (follow how server.feedback-anon or a config test authenticates an admin).
  // 2. GET /api/projects/P/config as admin → expect publishableKey === null initially.
  // 3. POST /api/projects/P/config { rotatePublishableKey: true } → expect a pk_ key back.
  // 4. GET again → expect publishableKey === the rotated key.
})
```

Fill the body concretely against the admin-config test harness (read how another admin-only `/config` field like `bugNotify` is tested, if a test exists; else follow `server.feedback-anon.test.ts` for auth seeding).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.publishable-key.test.ts`
Expected: FAIL — config GET has no `publishableKey`; rotate action unhandled.

- [ ] **Step 3: Import `rotateProjectPublishableKey` + handle the rotate action**

Add `rotateProjectPublishableKey` to the `from "./lib/db"` import. In the config POST handler, near the `dedupEnabled` write (search `setProjectDedupEnabled(pid`), add:

```ts
            // Mobile SDK: rotate (generate/replace) the project publishable key. Returns the new key so
            // the admin can copy it into their app. Admin-gated (this branch is already past access check).
            let rotatedPublishableKey: string | null = null
            if (body.rotatePublishableKey === true) rotatedPublishableKey = await rotateProjectPublishableKey(pid)
```

Then include it in the POST success response (find the `return json({ ok: true, modalConfig: v.config, pro })` for this branch and add the field):

```ts
            return json({ ok: true, modalConfig: v.config, pro, publishableKey: rotatedPublishableKey })
```

- [ ] **Step 4: Return the key in the admin config GET**

In the admin read-back block (search `dedupEnabled: proj.dedupEnabled`), add alongside it:

```ts
                    // Mobile SDK publishable key (admin read-back; safe to display — publishable by design).
                    publishableKey: proj.publishableKey,
```

- [ ] **Step 5: Run the server test**

Run: `cd prototype && bun test server.publishable-key.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Add the Settings UI section**

In `prototype/public/dashboard.html`, after the `kl-dedup` section's closing `</div>` (search `id="kl-dedup"` and find its close, ~line 2883), add:

```html
        <div id="kl-mobilekey" style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(120,120,140,.18)">
          <div style="font-weight:600;font-size:14px;margin-bottom:2px">Mobile SDK key</div>
          <p style="font-size:12px;opacity:.7;margin:0 0 10px">A publishable key for the Klavity Flutter SDK. Safe to ship in your app — it only authorizes filing reports to this project. <a href="https://pub.dev/packages/klavity_flutter" target="_blank" rel="noopener">Setup guide →</a></p>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="text" id="kl-mobilekey-val" readonly placeholder="No key yet — generate one" style="flex:1;font-family:var(--mono);font-size:12px" />
            <button type="button" id="kl-mobilekey-copy" class="btn btn-sm">Copy</button>
            <button type="button" id="kl-mobilekey-rotate" class="btn btn-sm">Generate</button>
          </div>
          <p id="kl-mobilekey-msg" style="font-size:12px;opacity:.7;margin:6px 0 0"></p>
        </div>
```

- [ ] **Step 7: Wire the load read-back + rotate/copy handlers**

In the config-load handler (search `if ($("kl-dedup-enabled"))`), add:

```js
    const mkVal = $("kl-mobilekey-val")
    if (mkVal) mkVal.value = d.publishableKey || ""
    if ($("kl-mobilekey-rotate")) $("kl-mobilekey-rotate").textContent = d.publishableKey ? "Rotate" : "Generate"
    const mkBox = $("kl-mobilekey")
    if (mkBox) mkBox.style.display = (state.active && state.active.role === "admin") ? "" : "none"
```

Near where other Settings buttons are bound (find the block that binds `$("connTestNew").onclick` or similar one-time bindings in the settings render — bind once, guarded by a `dataset.bound` flag), add:

```js
    const mkRotate = $("kl-mobilekey-rotate")
    if (mkRotate && !mkRotate.dataset.bound) {
      mkRotate.dataset.bound = "1"
      mkRotate.addEventListener("click", async () => {
        const msg = $("kl-mobilekey-msg")
        if (mkRotate.textContent === "Rotate" && !confirm("Rotate the mobile key? Apps using the old key will stop filing reports until updated.")) return
        mkRotate.disabled = true; if (msg) msg.textContent = "Generating…"
        try {
          const r = await fetch(projPath("/config"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rotatePublishableKey: true }) })
          const d = await r.json().catch(() => ({}))
          if (d.ok && d.publishableKey) { $("kl-mobilekey-val").value = d.publishableKey; mkRotate.textContent = "Rotate"; if (msg) msg.textContent = "New key generated — copy it into your app." }
          else if (msg) msg.textContent = "Error: " + (d.error || "failed")
        } catch { if (msg) msg.textContent = "Network error" }
        finally { mkRotate.disabled = false }
      })
    }
    const mkCopy = $("kl-mobilekey-copy")
    if (mkCopy && !mkCopy.dataset.bound) {
      mkCopy.dataset.bound = "1"
      mkCopy.addEventListener("click", () => {
        const v = $("kl-mobilekey-val").value
        if (v) { try { navigator.clipboard.writeText(v) } catch (e) {} const msg = $("kl-mobilekey-msg"); if (msg) msg.textContent = "Copied." }
      })
    }
```

- [ ] **Step 8: Verify inline JS parses**

Run: `node scripts/check-inline-js.mjs`
Expected: "Inline-JS guard passed — all inline scripts parse."

- [ ] **Step 9: Boot-smoke**

Run: `cd prototype && PORT=8888 bun run server.ts` (background), then `curl -s http://localhost:8888/api/health` → `{"ok":true,...}`, then stop it.
Expected: server boots, no error from the config changes.

- [ ] **Step 10: Commit**

```bash
git add prototype/server.ts prototype/public/dashboard.html prototype/server.publishable-key.test.ts
git commit -m "feat(settings): generate/rotate/reveal the mobile SDK publishable key"
```

---

### Task 4: Full-suite regression + verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full prototype test suite**

Run: `cd prototype && bun test`
Expected: green (pre-existing unrelated failures, if any, unchanged; all new publishable-key + feedback + dedup tests pass).

- [ ] **Step 2: Manual end-to-end sanity via curl (no browser)**

With the boot-smoke server running (or against a local server with a Turso DB), generate a key in Settings, then:

```bash
curl -s -X POST http://localhost:8888/api/feedback \
  -F "description=mobile e2e test" \
  -F "publishableKey=pk_<the-generated-key>"
```

Expected: `200` with an `issueKey`/`feedbackId`, and the report appears in that project's dashboard. (No `Origin` header sent — proves the mobile path.)

- [ ] **Step 3: Rebase onto latest master + re-run**

```bash
git fetch origin master && git rebase origin/master
cd prototype && bun test
```

Expected: green.

- [ ] **Step 4: Leave the branch for the orchestrator**

No push/merge — the merge-train integrates `feat/mobile-publishable-key` automatically.

---

## Self-Review

**Spec coverage (§7 of the design spec):**
- "per-project publishable key (pk_…, safe to ship in an app binary)" → Task 1 (column + `newPublishableKey`/`rotateProjectPublishableKey`). ✓
- "accept publishableKey on /api/feedback as an alternative to the Origin/Turnstile gate" → Task 2. ✓
- "enforce a per-key + per-IP rate limit" → Task 2 (`fbpk:key:` + existing `fbanon:ip`). ✓
- "honor the project's existing reportGate" → Task 2 Step 5. ✓
- "revocable/rotatable per project in settings" → Task 3 (rotate replaces the key; UI Generate/Rotate). ✓
- "No new PII" → key is an opaque token; no personal data. ✓

**Placeholder scan:** Task 2 Step 1 and Task 3 Step 1 intentionally direct the implementer to fill test bodies against the existing `server.feedback-anon.test.ts` harness (the exact multipart/auth bootstrapping is codebase-specific and must be read, not guessed) — the assertions and inputs are fully specified. All code steps show real code.

**Type consistency:** `newPublishableKey` / `getProjectByPublishableKey` (→ `{id}|null`) / `rotateProjectPublishableKey` (→ `string`) / `ProjectRow.publishableKey` used identically across Tasks 1-3. Response field `publishableKey` consistent between config GET (Task 3 Step 4) and POST (Task 3 Step 3) and the client read (Task 3 Step 7).

**Scope:** This plan is the backend prerequisite ONLY. The `klavity_flutter` package is a separate plan in a new repo, gated on this shipping.
