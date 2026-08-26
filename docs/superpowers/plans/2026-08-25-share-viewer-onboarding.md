# Shared-ticket Viewer Onboarding — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the normal ticket URL (`/t/:ref`) into an adaptive share link: members see the full ticket, everyone else gets a server-side-redacted blurred teaser they can unblur with just an email (passwordless OTP → session → per-ticket viewer grant), then read and comment.

**Architecture:** One canonical URL `GET /t/:ref` branches on a pure-ish resolver `ticketViewAccess(feedbackId, sessionEmail) → 'full'|'teaser'|'pending'|'login'`. The teaser is redacted **on the server** — a no-access caller's HTTP response never contains the description text or screenshot bytes/token; the teaser page (`public/ticket-teaser.html`) paints placeholder blur only. Data flows through a new JSON endpoint `GET /api/t/:ref` (teaser vs full payload by access). Onboarding reuses the existing OTP path (`createOtp`/`verifyOtp`/`createSession`) via new `POST /api/t/:ref/unlock` + `POST /api/t/:ref/verify`, which grant a per-ticket `ticket_viewers` row. Comment authz on the existing `POST /api/feedback/:id/comments` widens to accept a caller whose access resolves `full`.

**Tech Stack:** Bun + TypeScript single-file server (`prototype/server.ts`), `@libsql/client` (Turso/SQLite) via `prototype/lib/db.ts`, static HTML pages in `prototype/public/`, `bun test` route/unit tests that spawn the real server or call `applySchema` against a temp file DB.

## Global Constraints

- **Never touch `master`.** Work only on branch `feat/share-viewer-onboarding` in worktree `/Users/vishalkumar/Downloads/qbug/klav-snap-wt-share-viewer-onboarding`. A shared hook rejects commits/pushes to master.
- **Do NOT bump the version.** Do not edit `package.json` version, `CHANGELOG.md` version lines, or `docs/PRD.md` version lines. A normal CHANGELOG feature entry is fine; the orchestrator stamps the version.
- **Additive `needCol` migrations only.** New columns via the `needCol(table, col)` guard + `ALTER TABLE … ADD COLUMN …` with a safe default; new tables via `CREATE TABLE IF NOT EXISTS` in the `stmts` DDL array. Never drop/rename a column; never a destructive migration.
- **Server-side redaction is load-bearing.** The teaser HTTP response (`GET /api/t/:ref` when access is teaser/pending, and the teaser HTML page) must contain **NONE** of: the ticket description/observation text, screenshot bytes, the screenshot id, or a signed `/img/…` token, reporter PII, or comment bodies. Only `title, status, priority, source, createdAt, commentCount` may appear.
- **Viewer sessions are normal `klav_session` sessions, but mutations gate on member/admin, not merely "signed in".** A viewer's OTP verify mints a normal session with **no workspace** (no `ensureAccount`). Every mutation endpoint keeps requiring `projectAccess(me, projectId) ∈ {admin, member}`; the only write a viewer may perform is a comment (via the widened comment authz).
- **Inline JS in new HTML must pass the inline-js guard.** Use straight ASCII quotes only (no smart quotes) in `public/ticket-teaser.html`; CSP already allows `script-src 'self' 'unsafe-inline'`.
- **Test email for any flow:** `vishal@quantana.com.au`.
- **`share_mode` defaults `'teaser'`.** The project share-settings UI, the `approval` admin-approve flow, and per-ticket→project-viewer upgrade are **Phase 2** — out of scope here. The resolver recognizes all five modes (`teaser|public|approval|auto_join|off`) for forward-compat, but only `teaser` (default), `public`, and `off` are reachable in Phase 1.

---

## Resolved Spec Ambiguities

These conflicts between the spec and the real code were resolved while grounding; each is called out at its task:

1. **Teaser page filename.** Spec §3/§12 say the teaser is `public/ticket.html`, but that file already exists as the member fast single-ticket page (KLA-491). Resolution: the teaser/guest page is a **new** file `public/ticket-teaser.html`; the existing `public/ticket.html` stays the member fast page.
2. **Member full rendering.** Spec §3 says "redirect a member into the real dashboard dedicated-ticket page." But `server.single-ticket-page.test.ts` asserts a member gets the standalone page at `/t/:ref` (the KLA-491 fast permalink). Resolution: keep serving the existing standalone `public/ticket.html` for member/admin `full` access — no dashboard redirect. It already *is* the full dedicated-ticket view and is fast.
3. **Viewer full rendering.** An active viewer (non-member) with `full` access cannot use `public/ticket.html` (its APIs are member-gated). Resolution: serve `public/ticket-teaser.html` for viewer-`full` too; the same page renders the unlocked state driven by the `access:"full"` field of `GET /api/t/:ref`.
4. **Existing single-ticket-page assertions.** Under the new default `share_mode='teaser'`, two existing assertions no longer hold: "403 for a logged-in non-member" and "redirect an unauthenticated visitor to login" — both now resolve to the teaser (200). Resolution: update those two assertions to the new semantics in Task 5 (they test the old members-only behavior that this feature intentionally changes).
5. **OTP email framing.** Spec §5 wants the subject framed "your code to view KLAV-88." Resolution: Phase 1 reuses the existing generic `sendOtp(to, code)` (same `createOtp`/`verifyOtp` path); ticket-specific subject framing is deferred as minor polish.
6. **Test-OTP in verify.** So route tests can drive OTP without reading a hashed code, `POST /api/t/:ref/verify` honors the same test-OTP bypass (`testOtpDecision` + fixed code `666666`) as `/api/auth/verify`.

---

## File Structure

**New files**
- `prototype/lib/ticket-viewers.ts` — viewer-access domain module. Exports `grantTicketViewer`, `ticketViewerStatus`, `isActiveTicketViewer`, and the resolver `ticketViewAccess`. Imports the `db` handle + `projectById`, `projectAccess`, `normalizeShareMode` from `./db` (one-directional import; the normalizer + `ProjectRow` mapping live in `db.ts` to avoid a circular import).
- `prototype/lib/ticket-viewers.test.ts` — unit matrix for `ticketViewAccess` (member / ticket-viewer / project-viewer / anon × share_modes) + `grantTicketViewer`/status helpers.
- `prototype/public/ticket-teaser.html` — the public teaser page. Renders blurred **placeholder** screenshot + placeholder text, real title/status/priority/source pills, an email→OTP unblur form, and (after unblur, when `/api/t/:ref` returns `full`) the unblurred description, real screenshot, comments + a comment box with a "guest" chip, plus a soft "create your own free Klavity" CTA. `noindex`.
- `prototype/server.share-viewer.route.test.ts` — route tests: teaser-redaction security test, adaptive `/t/:ref` render matrix, unlock→verify→grant→full round-trip, viewer-can-comment authz, anon `/dashboard?ticket=` redirect.

**Modified files**
- `prototype/lib/db.ts` — (a) new `ticket_viewers` table + indexes in the DDL `stmts` array; (b) additive `needCol` columns `projects.share_mode` (default `'teaser'`) + `projects.share_allowlist` (nullable); (c) `SHARE_MODES`/`ShareMode`/`normalizeShareMode`; (d) `ProjectRow.shareMode` + `ProjectRow.shareAllowlist` and their `rowToProject` mapping; (e) `projectAccess` widened so a `project_role='viewer'` row resolves to `null` (viewers never pass the member/admin mutation gate).
- `prototype/server.ts` — (a) new `GET /api/t/:ref`, `POST /api/t/:ref/unlock`, `POST /api/t/:ref/verify` routes; (b) rewrite the existing `GET /t/:ref` HTML route (~line 7291) to branch on `ticketViewAccess`; (c) anon `/dashboard?ticket=<id>` → 302 `/t/:ref` (~line 7031); (d) widen `POST/GET /api/feedback/:id/comments` authz to accept a viewer whose access resolves `full` (~line 10096).
- `prototype/public/dashboard.html` — `ticketPageUrl(id)` (~line 6713) returns `<origin>/t/<id>` so Copy-link produces the adaptive URL.
- `prototype/server.single-ticket-page.test.ts` — update the two assertions that encoded the old members-only behavior (Task 5).

---

## Task 1: Schema — `ticket_viewers` table + `projects.share_mode`/`share_allowlist` + share-mode normalizer

**Files:**
- Modify: `prototype/lib/db.ts` (DDL array ~line 305-309; needCol block ~line 1131; `ProjectRow` type ~line 1991; `rowToProject` ~line 2030; place `SHARE_MODES` next to `SNAP_ROUTINGS` ~line 2024)
- Test: `prototype/lib/ticket-viewers.test.ts` (schema-presence assertions in this task; resolver matrix added in Task 2)

**Interfaces:**
- Produces:
  - Table `ticket_viewers(id TEXT PK, feedback_id TEXT, project_id TEXT, email TEXT, status TEXT DEFAULT 'active', granted_by TEXT, created_at INTEGER, UNIQUE(feedback_id,email))` + indexes on `(feedback_id)` and `(email)`.
  - Columns `projects.share_mode TEXT NOT NULL DEFAULT 'teaser'`, `projects.share_allowlist TEXT` (nullable JSON email array).
  - `export const SHARE_MODES = ["teaser","public","approval","auto_join","off"] as const`
  - `export type ShareMode = (typeof SHARE_MODES)[number]`
  - `export function normalizeShareMode(v: unknown): ShareMode`
  - `ProjectRow.shareMode: string` and `ProjectRow.shareAllowlist: string[] | null`, mapped in `rowToProject`.

- [ ] **Step 1: Write the failing test**

Create `prototype/lib/ticket-viewers.test.ts`:

```ts
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-ticket-viewers-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { applySchema, db, reconnectDb, normalizeShareMode, projectById } from "./db"

const ACCOUNT = "acct_tv"
const PROJECT = "proj_tv"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [ACCOUNT, "TV", "vishal@quantana.com.au", now] })
  await c.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [PROJECT, ACCOUNT, "TV Project", now, now] })
})

test("normalizeShareMode falls back to teaser on junk and echoes known modes", () => {
  expect(normalizeShareMode(undefined)).toBe("teaser")
  expect(normalizeShareMode("nonsense")).toBe("teaser")
  expect(normalizeShareMode("public")).toBe("public")
  expect(normalizeShareMode("off")).toBe("off")
})

test("projects default share_mode is teaser and rowToProject exposes shareMode/shareAllowlist", async () => {
  const p = await projectById(PROJECT)
  expect(p).not.toBeNull()
  expect(p!.shareMode).toBe("teaser")
  expect(p!.shareAllowlist).toBeNull()
})

test("ticket_viewers table accepts a unique (feedback_id,email) grant", async () => {
  const now = Date.now()
  await db!.execute({ sql: "INSERT INTO ticket_viewers (id,feedback_id,project_id,email,status,granted_by,created_at) VALUES (?,?,?,?,?,?,?)", args: ["tv_1", "fb_x", PROJECT, "guest@ex.com", "active", null, now] })
  // Duplicate (feedback_id,email) must violate the UNIQUE constraint.
  let threw = false
  try {
    await db!.execute({ sql: "INSERT INTO ticket_viewers (id,feedback_id,project_id,email,status,granted_by,created_at) VALUES (?,?,?,?,?,?,?)", args: ["tv_2", "fb_x", PROJECT, "guest@ex.com", "active", null, now] })
  } catch { threw = true }
  expect(threw).toBe(true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/ticket-viewers.test.ts`
Expected: FAIL — `normalizeShareMode` is not exported; `p.shareMode` is `undefined`; the `ticket_viewers` INSERT throws "no such table".

- [ ] **Step 3: Add the DDL, columns, normalizer, and ProjectRow mapping**

In `prototype/lib/db.ts`, after the `proj_mem_email_idx` index in the `stmts` DDL array (currently ~line 309), add the new table + indexes:

```ts
    `CREATE INDEX IF NOT EXISTS proj_mem_email_idx ON project_members (email)`,
    // ── Shared-ticket viewers (per-ticket, free & unlimited). A grant unlocks the full ticket +
    // commenting for `email`. status 'active' = unblurred now; 'pending_approval' = waiting for an
    // admin (share_mode='approval', Phase 2). UNIQUE(feedback_id,email) makes a grant idempotent.
    `CREATE TABLE IF NOT EXISTS ticket_viewers (
       id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL,
       email TEXT NOT NULL,
       status TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'pending_approval'
       granted_by TEXT, created_at INTEGER NOT NULL, UNIQUE(feedback_id, email))`,
    `CREATE INDEX IF NOT EXISTS ticket_viewers_feedback_idx ON ticket_viewers (feedback_id)`,
    `CREATE INDEX IF NOT EXISTS ticket_viewers_email_idx ON ticket_viewers (email)`,
```

In the additive `needCol` block, after the `projects.report_clarity` ALTER (currently ~line 1131), add:

```ts
  // ── Shared-ticket viewer onboarding: per-project share behavior. Default 'teaser' (blurred preview +
  // email-to-unblur). share_allowlist is an optional JSON email array (approval/allowlist, Phase 2).
  if (needCol("projects", "share_mode")) await c.execute("ALTER TABLE projects ADD COLUMN share_mode TEXT NOT NULL DEFAULT 'teaser'").catch((e: any) => console.warn("projects.share_mode ALTER skipped:", e?.message || e))
  if (needCol("projects", "share_allowlist")) await c.execute("ALTER TABLE projects ADD COLUMN share_allowlist TEXT").catch((e: any) => console.warn("projects.share_allowlist ALTER skipped:", e?.message || e))
```

Note: `projects` is already in the `ALTERED_TABLES` preload list (~line 965), so an established DB issues zero extra ALTERs on reboot — no preload change needed.

Next to `SNAP_ROUTINGS`/`normalizeSnapRouting` (currently ~line 2024), add the share-mode vocabulary:

```ts
// Per-project shared-ticket behavior. 'teaser' (default) = blurred preview + email-to-unblur;
// 'public' = full ticket to anyone with the link; 'approval'/'auto_join' = Phase 2; 'off' = members
// only. Unknown/legacy values normalize to the safe default 'teaser'.
export const SHARE_MODES = ["teaser", "public", "approval", "auto_join", "off"] as const
export type ShareMode = (typeof SHARE_MODES)[number]
export function normalizeShareMode(v: unknown): ShareMode {
  const s = String(v ?? "")
  return (SHARE_MODES as readonly string[]).includes(s) ? (s as ShareMode) : "teaser"
}
```

In the `ProjectRow` type (currently ~line 2014, after `labelRules`), add:

```ts
  labelRules: LabelRule[]
  // Shared-ticket viewer onboarding: per-project share behavior + optional allowlist (JSON emails).
  shareMode: string
  shareAllowlist: string[] | null
}
```

In `rowToProject` (currently ~line 2051, after the `labelRules` line), add:

```ts
    labelRules: sanitizeLabelRules(safeJsonParse(x.label_rules_json)),
    shareMode: normalizeShareMode(x.share_mode),
    shareAllowlist: (() => { try { const a = JSON.parse(String(x.share_allowlist ?? "null")); return Array.isArray(a) ? a.map((e: any) => String(e)) : null } catch { return null } })(),
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/ticket-viewers.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/db.ts prototype/lib/ticket-viewers.test.ts
git commit -m "feat(db): ticket_viewers table + projects.share_mode/share_allowlist + share-mode normalizer"
```

---

## Task 2: `ticketViewAccess` resolver + unit matrix

**Files:**
- Create: `prototype/lib/ticket-viewers.ts`
- Test: `prototype/lib/ticket-viewers.test.ts` (extend)

**Interfaces:**
- Consumes: `db`, `projectById`, `projectAccess`, `normalizeShareMode` from `./db` (Task 1); `ticketViewerStatus` (defined here / Task 3).
- Produces:
  - `export type TicketViewAccess = "full" | "teaser" | "pending" | "login"`
  - `export async function ticketViewAccess(feedbackId: string, sessionEmail: string | null): Promise<TicketViewAccess>`
  - Access matrix (spec §3/§13): project member/admin → `full`; project-wide `viewer` row → `full`; active `ticket_viewers` row → `full`; pending `ticket_viewers` row → `pending`; else by `share_mode`: `public`→`full`, `off`→`login`, `teaser`/`approval`/`auto_join`→`teaser`.

Note: this task depends on `ticketViewerStatus` (Task 3). Implement the two helpers `ticketViewerStatus`/`grantTicketViewer`/`isActiveTicketViewer` first in this same file (their bodies are shown in Task 3); this task's steps show the resolver and its matrix. If executing strictly in order, add the resolver here and the grant/status bodies in Task 3 — but since they share one file, define all four functions now and let Task 3 add only the `grantTicketViewer` test. To keep tasks independently testable, define `ticketViewerStatus` inline in this task (repeated verbatim in Task 3's file view).

- [ ] **Step 1: Write the failing test** (append to `prototype/lib/ticket-viewers.test.ts`)

```ts
import { ticketViewAccess, grantTicketViewer, ticketViewerStatus } from "./ticket-viewers"

// Seed: an owner (member/admin), a project-wide viewer, a per-ticket active viewer, a pending viewer,
// and a stranger — against one feedback row, exercised across share_modes.
const OWNER = "owner-tv@test.local"
const PVIEWER = "pviewer-tv@test.local"     // project_members role 'viewer'
const TVIEWER = "tviewer-tv@test.local"     // active ticket_viewers grant
const PENDING = "pending-tv@test.local"     // pending_approval ticket_viewers grant
const STRANGER = "stranger-tv@test.local"
const FID = "fb_" + "a".repeat(8) + "-" + "b".repeat(4) + "-" + "c".repeat(4) + "-" + "d".repeat(4) + "-" + "e".repeat(12)

beforeAll(async () => {
  const now = Date.now()
  await db!.execute({ sql: "INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", args: ["am_tv_owner", ACCOUNT, OWNER, "owner", now] })
  await db!.execute({ sql: "INSERT INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?)", args: ["pm_tv_owner", PROJECT, OWNER, "admin", null, now] })
  await db!.execute({ sql: "INSERT INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?)", args: ["pm_tv_pv", PROJECT, PVIEWER, "viewer", null, now] })
  await db!.execute({ sql: "INSERT INTO feedback (id,project_id,observation,status,created_at) VALUES (?,?,?,?,?)", args: [FID, PROJECT, "secret repro steps", "open", now] })
  await grantTicketViewer({ feedbackId: FID, projectId: PROJECT, email: TVIEWER, status: "active" })
  await grantTicketViewer({ feedbackId: FID, projectId: PROJECT, email: PENDING, status: "pending_approval" })
})

async function setMode(mode: string) {
  await db!.execute({ sql: "UPDATE projects SET share_mode=? WHERE id=?", args: [mode, PROJECT] })
}

test("member/admin resolves full in every share_mode (even off)", async () => {
  for (const m of ["teaser", "public", "approval", "auto_join", "off"]) {
    await setMode(m)
    expect(await ticketViewAccess(FID, OWNER)).toBe("full")
  }
})

test("project-wide viewer resolves full in every share_mode", async () => {
  for (const m of ["teaser", "public", "off"]) {
    await setMode(m)
    expect(await ticketViewAccess(FID, PVIEWER)).toBe("full")
  }
})

test("active per-ticket viewer resolves full; pending resolves pending", async () => {
  await setMode("teaser")
  expect(await ticketViewAccess(FID, TVIEWER)).toBe("full")
  expect(await ticketViewAccess(FID, PENDING)).toBe("pending")
})

test("no-access caller branches on share_mode", async () => {
  await setMode("teaser");    expect(await ticketViewAccess(FID, STRANGER)).toBe("teaser")
  await setMode("approval");  expect(await ticketViewAccess(FID, STRANGER)).toBe("teaser")
  await setMode("auto_join"); expect(await ticketViewAccess(FID, STRANGER)).toBe("teaser")
  await setMode("public");    expect(await ticketViewAccess(FID, STRANGER)).toBe("full")
  await setMode("off");       expect(await ticketViewAccess(FID, STRANGER)).toBe("login")
})

test("anon (null session) branches on share_mode identically", async () => {
  await setMode("teaser"); expect(await ticketViewAccess(FID, null)).toBe("teaser")
  await setMode("public"); expect(await ticketViewAccess(FID, null)).toBe("full")
  await setMode("off");    expect(await ticketViewAccess(FID, null)).toBe("login")
  await setMode("teaser") // restore default for later tasks
})

test("ticketViewerStatus reflects the grant status", async () => {
  expect(await ticketViewerStatus(FID, TVIEWER)).toBe("active")
  expect(await ticketViewerStatus(FID, PENDING)).toBe("pending_approval")
  expect(await ticketViewerStatus(FID, STRANGER)).toBeNull()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/ticket-viewers.test.ts`
Expected: FAIL — `Cannot find module "./ticket-viewers"`.

- [ ] **Step 3: Create the module**

Create `prototype/lib/ticket-viewers.ts`:

```ts
// Shared-ticket viewer onboarding — access resolution + per-ticket grants.
// The canonical share URL /t/:ref branches on ticketViewAccess(); the teaser is redacted server-side
// so a no-access caller never receives the description/screenshot. Viewers are free & unlimited and
// (in Phase 1) always per-ticket — a project-wide 'viewer' row is Phase 2 (auto_join/upgrade).
import { db, projectById, projectAccess, normalizeShareMode } from "./db"

export type TicketViewAccess = "full" | "teaser" | "pending" | "login"

// Grant (or re-affirm) a per-ticket viewer. Idempotent on (feedback_id,email): a repeat grant updates
// the status (e.g. pending_approval → active on admin approve, Phase 2) rather than erroring.
export async function grantTicketViewer(input: {
  feedbackId: string
  projectId: string
  email: string
  status?: "active" | "pending_approval"
  grantedBy?: string | null
}): Promise<void> {
  const email = String(input.email || "").trim().toLowerCase()
  const status = input.status ?? "active"
  await db!.execute({
    sql: `INSERT INTO ticket_viewers (id,feedback_id,project_id,email,status,granted_by,created_at)
          VALUES (?,?,?,?,?,?,?)
          ON CONFLICT(feedback_id,email) DO UPDATE SET status=excluded.status`,
    args: ["tv_" + crypto.randomUUID(), input.feedbackId, input.projectId, email, status, input.grantedBy ?? null, Date.now()],
  })
}

export async function ticketViewerStatus(feedbackId: string, email: string): Promise<"active" | "pending_approval" | null> {
  const r = await db!.execute({
    sql: "SELECT status FROM ticket_viewers WHERE feedback_id=? AND email=? LIMIT 1",
    args: [feedbackId, String(email || "").trim().toLowerCase()],
  })
  if (!r.rows.length) return null
  return String((r.rows[0] as any).status) === "pending_approval" ? "pending_approval" : "active"
}

export async function isActiveTicketViewer(feedbackId: string, email: string): Promise<boolean> {
  return (await ticketViewerStatus(feedbackId, email)) === "active"
}

// The access matrix (spec §3/§13). sessionEmail may be null (anon).
export async function ticketViewAccess(feedbackId: string, sessionEmail: string | null): Promise<TicketViewAccess> {
  const fb = await db!.execute({ sql: "SELECT project_id FROM feedback WHERE id=? LIMIT 1", args: [feedbackId] })
  if (!fb.rows.length) return "login" // unknown ticket — safest; the /t/:ref route 404s before rendering
  const projectId = String((fb.rows[0] as any).project_id)
  const email = sessionEmail ? String(sessionEmail).trim().toLowerCase() : null

  if (email) {
    // 1) Project member/admin → always full (projectAccess returns null for a 'viewer' row — Task 3).
    if (await projectAccess(email, projectId)) return "full"
    // 2) Project-wide viewer (Phase 2 auto_join/upgrade creates these) → full.
    const pv = await db!.execute({
      sql: "SELECT 1 FROM project_members WHERE project_id=? AND email=? AND project_role='viewer' LIMIT 1",
      args: [projectId, email],
    })
    if (pv.rows.length) return "full"
    // 3) Per-ticket grant.
    const tv = await ticketViewerStatus(feedbackId, email)
    if (tv === "active") return "full"
    if (tv === "pending_approval") return "pending"
  }

  // 4) No access → branch on the project's share_mode.
  const proj = await projectById(projectId)
  const mode = normalizeShareMode(proj?.shareMode)
  if (mode === "public") return "full"
  if (mode === "off") return "login"
  return "teaser" // teaser | approval | auto_join all show the teaser to a no-access caller
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/ticket-viewers.test.ts`
Expected: PASS. (The member-in-`off`-mode and project-viewer cases depend on the `projectAccess` `viewer` fix in Task 3; if the "member/admin full" case passes but a later "project-wide viewer full" case fails because `projectAccess` returns `'member'` for the viewer row, complete Task 3's `projectAccess` change and re-run — they are co-dependent and land together.)

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/ticket-viewers.ts prototype/lib/ticket-viewers.test.ts
git commit -m "feat(access): ticketViewAccess resolver + per-ticket grant helpers"
```

---

## Task 3: Widen `projectAccess` for the `viewer` role

**Files:**
- Modify: `prototype/lib/db.ts` (`projectAccess` ~line 2772)
- Test: `prototype/lib/ticket-viewers.test.ts` (extend)

**Interfaces:**
- Consumes: `project_members.project_role` may now be `'viewer'` (in addition to `'admin'`/`'member'`).
- Produces: `projectAccess(email, projectId)` returns `null` for a `project_role='viewer'` row (unchanged `'admin'`/`'member'` behavior for existing rows) so a project-wide viewer never passes any member/admin mutation gate. `addProjectMember(...)` accepts `'viewer'` as a role value.

- [ ] **Step 1: Write the failing test** (append to `prototype/lib/ticket-viewers.test.ts`)

```ts
import { projectAccess, addProjectMember } from "./db"

test("projectAccess treats a 'viewer' project_members row as no member/admin access", async () => {
  // PVIEWER has a project_role='viewer' row (seeded in Task 2). It must NOT resolve to member/admin.
  expect(await projectAccess(PVIEWER, PROJECT)).toBeNull()
  // An admin still resolves admin.
  expect(await projectAccess(OWNER, PROJECT)).toBe("admin")
})

test("addProjectMember can store a 'viewer' role", async () => {
  const NEWV = "newviewer-tv@test.local"
  await addProjectMember(PROJECT, ACCOUNT, NEWV, "viewer", OWNER)
  const r = await db!.execute({ sql: "SELECT project_role FROM project_members WHERE project_id=? AND email=?", args: [PROJECT, NEWV] })
  expect(String((r.rows[0] as any).project_role)).toBe("viewer")
  expect(await projectAccess(NEWV, PROJECT)).toBeNull()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/ticket-viewers.test.ts`
Expected: FAIL — `projectAccess(PVIEWER, PROJECT)` currently returns `"member"` (any non-admin row maps to member); `addProjectMember` coerces the role to `"member"`.

- [ ] **Step 3: Widen `projectAccess` and `addProjectMember`**

In `prototype/lib/db.ts`, change `projectAccess` (~line 2777-2778) from:

```ts
  const r = await db!.execute({ sql: "SELECT project_role FROM project_members WHERE project_id=? AND email=?", args: [projectId, email] })
  if (r.rows.length) return String((r.rows[0] as any).project_role) === "admin" ? "admin" : "member"
```

to:

```ts
  const r = await db!.execute({ sql: "SELECT project_role FROM project_members WHERE project_id=? AND email=?", args: [projectId, email] })
  if (r.rows.length) {
    const role = String((r.rows[0] as any).project_role)
    if (role === "admin") return "admin"
    // A 'viewer' row (shared-ticket onboarding) is NOT member access — viewers never mutate.
    if (role === "viewer") return null
    return "member"
  }
```

In `addProjectMember` (~line 2794), change the role coercion from `projectRole === "admin" ? "admin" : "member"` to preserve `viewer`:

```ts
  const role = projectRole === "admin" ? "admin" : projectRole === "viewer" ? "viewer" : "member"
  await db!.execute({ sql: "INSERT INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(project_id,email) DO NOTHING", args: ["pm_" + projectId + "_" + email, projectId, email, role, invitedBy ?? null, now] })
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/ticket-viewers.test.ts`
Expected: PASS (all resolver + role tests).

- [ ] **Step 5: Guard against regressions in the broad project-access suites**

Run: `cd prototype && bun test server.member-invite.test.ts server.team-member-remove.test.ts`
Expected: PASS — existing rows are only `admin`/`member`, so their behavior is unchanged.

- [ ] **Step 6: Commit**

```bash
git add prototype/lib/db.ts prototype/lib/ticket-viewers.test.ts
git commit -m "feat(access): projectAccess treats project_role='viewer' as non-member; addProjectMember stores viewer"
```

---

## Task 4: `GET /api/t/:ref` — server-side-redacted teaser vs full payload (+ security test)

**Files:**
- Modify: `prototype/server.ts` (add route immediately after the `GET /t/:ref` HTML block, ~line 7312)
- Test: `prototype/server.share-viewer.route.test.ts` (create)

**Interfaces:**
- Consumes: `ticketViewAccess` (Task 2); `resolveFeedbackRef`, `feedbackById`, `listTicketComments`, `effectiveTicketTitle`, `signImageToken`, `sessionEmail`, `clientIp`, `rlAllow`, `json`, `BASE`.
- Produces: `GET /api/t/:ref` JSON:
  - access `full` → `{ access: "full", ticket: { ref, title, status, priority, source, createdAt, commentCount, description, screenshotUrl, pageUrl, urlHost, comments: [{author, body, createdAt}] } }`
  - access `teaser` | `pending` → `{ access, ticket: { ref, title, status, priority, source, createdAt, commentCount } }` (**redacted — no description/screenshotUrl/comments/reporter**)
  - access `login` → `404` (no leak).

**Add the import** at the top of `server.ts` (near the other `./lib/...` imports, e.g. after the `imgsign` import ~line 48):

```ts
import { ticketViewAccess, grantTicketViewer } from "./lib/ticket-viewers"
```

- [ ] **Step 1: Write the failing test**

Create `prototype/server.share-viewer.route.test.ts` (harness mirrors `server.single-ticket-page.test.ts`):

```ts
// Shared-ticket viewer onboarding — adaptive /t/:ref + /api/t/:ref + unlock/verify + viewer comments.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-share-viewer-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(43)).toString("base64")

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `owner-${RUN}@test.local`
const OWNER_SID = `sess_owner_${RUN}`
const STRANGER = `stranger-${RUN}@test.local`
const STRANGER_SID = `sess_stranger_${RUN}`
const GUEST = `vishal@quantana.com.au`
const ACCT = `acct_${RUN}`
const PROJ = `proj_${RUN}`
const UUID = crypto.randomUUID()
const FID = `fb_${UUID}`
const SHORT_REF = FID.split("-")[0]
const DESC = "PAYNOW_SECRET_DESCRIPTION_TEXT spins forever on checkout"
const SHOT = `shot_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

beforeAll(async () => {
  const port = 47200 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local,quantana.com.au",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      // Test-OTP bypass so /api/t/:ref/verify accepts the fixed code 666666 for the guest email.
      KLAV_TEST_OTP: "1",
      KLAV_TEST_OTP_EMAILS: GUEST,
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [STRANGER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [OWNER_SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [STRANGER_SID, STRANGER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Share Viewer", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Share Viewer Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO screenshots (id, project_id, s3_key, content_type, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)", [SHOT, PROJ, "s3/secret-key.png", "image/png", 1234, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, title, priority, status, source, screenshot_id, url_host, url_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [FID, PROJ, DESC, "Pay now spins forever", "high", "open", "widget", SHOT, "app.example.com", "/checkout", NOW])
})

afterAll(() => { proc?.kill(); raw.close(); rmDb() })

function get(path: string, sid?: string, redirect: RequestRedirect = "manual") {
  const headers: Record<string, string> = {}
  if (sid) headers.Cookie = `klav_session=${sid}`
  return fetch(`${BASE}${path}`, { method: "GET", headers, redirect })
}

test("SECURITY: teaser payload (no-access caller) exposes title/status but NEVER the description or screenshot token", async () => {
  const r = await get(`/api/t/${FID}`, STRANGER_SID) // signed-in non-member, default share_mode=teaser
  expect(r.status).toBe(200)
  const bodyText = await r.text()
  const body = JSON.parse(bodyText)
  expect(body.access).toBe("teaser")
  expect(body.ticket.title).toBe("Pay now spins forever")
  expect(body.ticket.status).toBe("open")
  expect(body.ticket.priority).toBe("high")
  expect(body.ticket.source).toBe("widget")
  // Redaction invariants — the raw HTTP body must contain none of these.
  expect(bodyText).not.toContain(DESC)
  expect(bodyText).not.toContain(SHOT)      // no screenshot id
  expect(bodyText).not.toContain("/img/")   // no signed image token
  expect(body.ticket.description).toBeUndefined()
  expect(body.ticket.screenshotUrl).toBeUndefined()
  expect(body.ticket.comments).toBeUndefined()
})

test("full payload (member) includes description + screenshotUrl + comments", async () => {
  const r = await get(`/api/t/${FID}`, OWNER_SID)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.access).toBe("full")
  expect(body.ticket.description).toContain("spins forever")
  expect(body.ticket.screenshotUrl).toContain("/img/")
  expect(Array.isArray(body.ticket.comments)).toBe(true)
})

test("anon teaser payload is redacted the same way", async () => {
  const r = await get(`/api/t/${SHORT_REF}`) // no session, short ref
  expect(r.status).toBe(200)
  const bodyText = await r.text()
  expect(bodyText).not.toContain(DESC)
  expect(bodyText).not.toContain(SHOT)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.share-viewer.route.test.ts -t "SECURITY"`
Expected: FAIL — `GET /api/t/:ref` returns 404 (route not yet added).

- [ ] **Step 3: Add the `GET /api/t/:ref` route**

In `prototype/server.ts`, immediately AFTER the closing `}` of the existing `GET /t/:ref` HTML block (~line 7312), add:

```ts
    // ── GET /api/t/:ref — adaptive ticket JSON for the shared-ticket viewer page. Full payload only
    // when ticketViewAccess resolves 'full'; otherwise a SERVER-SIDE-REDACTED teaser (title/status/
    // priority/source/createdAt/commentCount ONLY — never description, screenshot, reporter, comments).
    const apiTicketMatch = path.match(/^\/api\/t\/([A-Za-z0-9_-]{1,80})$/)
    if (req.method === "GET" && apiTicketMatch) {
      if (!rlAllow("apiticket:" + clientIp(req, server), 120, 60_000)) return json({ error: "Rate limited" }, 429)
      const me = await sessionEmail(req)
      const resolved = await resolveFeedbackRef(apiTicketMatch[1]).catch(() => null)
      if (!resolved) return json({ error: "Not found" }, 404)
      const access = await ticketViewAccess(resolved.id, me)
      if (access === "login") return json({ error: "Not found" }, 404) // share_mode=off — no teaser
      const fbRow = await feedbackById(resolved.projectId, resolved.id)
      if (!fbRow) return json({ error: "Not found" }, 404)
      const comments = await listTicketComments(resolved.id).catch(() => [])
      const teaser = {
        ref: String(fbRow.id).split("-")[0],
        title: effectiveTicketTitle(fbRow),
        status: fbRow.status ?? null,
        priority: fbRow.priority ?? null,
        source: fbRow.source ?? null,
        createdAt: fbRow.createdAt ?? null,
        commentCount: comments.length,
      }
      if (access !== "full") {
        // teaser | pending — redacted. No description, no screenshot, no comment bodies.
        return json({ access, ticket: teaser }, 200, { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" })
      }
      // full — description, screenshot (HMAC-gated /img/ token), page context, comments.
      const ticket = {
        ...teaser,
        description: (fbRow.title && String(fbRow.title).trim()) ? fbRow.observation : fbRow.observation,
        screenshotUrl: fbRow.screenshotId ? `${BASE}/img/${signImageToken(fbRow.screenshotId)}` : null,
        pageUrl: fbRow.reportUrl || (fbRow.urlHost ? `https://${fbRow.urlHost}${fbRow.urlPath || ""}` : (fbRow.urlPath || null)),
        urlHost: fbRow.urlHost ?? null,
        comments: comments.map((c: any) => ({ author: c.author, body: c.body, createdAt: c.createdAt })),
      }
      return json({ access: "full", ticket }, 200, { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" })
    }
```

Note on `description`: the teaser `title` is the AI summary; the full `description` is the raw `observation` text. (The ternary above always yields `fbRow.observation`; it is written that way to mirror the projection at line 10225 and make the "full description = observation" intent explicit for the reader.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.share-viewer.route.test.ts -t "payload"`
Expected: PASS (3 payload/redaction tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/server.share-viewer.route.test.ts
git commit -m "feat(api): GET /api/t/:ref adaptive redacted teaser vs full ticket payload"
```

---

## Task 5: Adaptive `GET /t/:ref` HTML route + anon `/dashboard?ticket=` redirect

**Files:**
- Modify: `prototype/server.ts` (`GET /t/:ref` block ~line 7291; `/dashboard` route ~line 7031)
- Create (stub): `prototype/public/ticket-teaser.html` (a minimal placeholder here; full page is Task 8)
- Modify: `prototype/server.single-ticket-page.test.ts` (update two now-obsolete assertions)
- Test: `prototype/server.share-viewer.route.test.ts` (extend)

**Interfaces:**
- Consumes: `ticketViewAccess` (Task 2), `projectAccess`, `resolveFeedbackRef`, `loginGate`, `PUB`, `redirect`.
- Produces: `GET /t/:ref` serves — member/admin `full` → existing `public/ticket.html`; viewer `full` OR anon under `public` mode → `public/ticket-teaser.html`; `teaser`/`pending` → `public/ticket-teaser.html`; `login` (off mode) → `loginGate` (anon) or 404 (signed-in non-member). `GET /dashboard?ticket=<id>` for an unauthenticated visitor → 302 `/t/<id>`.

- [ ] **Step 1: Write the failing test** (append to `server.share-viewer.route.test.ts`)

```ts
test("GET /t/:ref serves the standalone member page for a member (KLA-491 preserved)", async () => {
  const r = await get(`/t/${FID}`, OWNER_SID)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("standalone single-ticket page") // the existing member page marker
  expect(html).toContain(`"${FID}"`)
})

test("GET /t/:ref serves the teaser page for a signed-in non-member (default teaser mode)", async () => {
  const r = await get(`/t/${FID}`, STRANGER_SID)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("shared-ticket teaser page") // the new teaser page marker
  expect(html).not.toContain("__TICKET_ID__")
})

test("GET /t/:ref serves the teaser page for an anon visitor (default teaser mode)", async () => {
  const r = await get(`/t/${FID}`)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("shared-ticket teaser page")
})

test("GET /t/:ref redirects anon to login only when share_mode=off", async () => {
  await exec("UPDATE projects SET share_mode=? WHERE id=?", ["off", PROJ])
  const r = await get(`/t/${FID}`)
  expect(r.status).toBe(302)
  expect((r.headers.get("location") || "")).toContain("/login")
  await exec("UPDATE projects SET share_mode=? WHERE id=?", ["teaser", PROJ]) // restore
})

test("anon GET /dashboard?ticket=<id> 302s to /t/<id>", async () => {
  const r = await get(`/dashboard?ticket=${FID}`)
  expect(r.status).toBe(302)
  expect(decodeURIComponent(r.headers.get("location") || "")).toContain(`/t/${FID}`)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.share-viewer.route.test.ts -t "teaser page"`
Expected: FAIL — the current `/t/:ref` returns 403 for the stranger and redirects the anon to login; `ticket-teaser.html` does not exist.

- [ ] **Step 3: Create the teaser page stub**

Create `prototype/public/ticket-teaser.html` (minimal; fleshed out in Task 8):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Shared ticket · Klavity</title>
</head>
<body>
<!-- shared-ticket teaser page -->
<div id="app" data-ticket="__TICKET_ID__" data-project="__PROJECT_ID__">Loading shared ticket…</div>
</body>
</html>
```

- [ ] **Step 4: Rewrite the `GET /t/:ref` HTML route**

In `prototype/server.ts`, replace the body of the `if (req.method === "GET" && ticketRefMatch) { … }` block (~line 7292-7312) with:

```ts
    if (req.method === "GET" && ticketRefMatch) {
      if (!rlAllow("ticket:page:" + clientIp(req, server), 120, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveFeedbackRef(ticketRefMatch[1]).catch(() => null)
      if (!resolved) return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } })
      const access = await ticketViewAccess(resolved.id, me)
      if (access === "login") {
        // share_mode=off — members only. Anon → login gate; signed-in non-member → bare 404 (no leak).
        return me ? new Response("Not found", { status: 404 }) : loginGate(path, url.search)
      }
      const memberAcc = me ? await projectAccess(me, resolved.projectId).catch(() => null) : null
      // Member/admin full → the fast standalone member page (KLA-491, unchanged).
      const pagePath = (access === "full" && memberAcc) ? (PUB + "/ticket.html") : (PUB + "/ticket-teaser.html")
      if (!(await Bun.file(pagePath).exists())) return new Response("Not found", { status: 404 })
      let _tHtml = await Bun.file(pagePath).text()
      _tHtml = _tHtml.replaceAll("__TICKET_ID__", resolved.id).replaceAll("__PROJECT_ID__", resolved.projectId)
      return new Response(_tHtml, {
        headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" },
      })
    }
```

- [ ] **Step 5: Add the anon `/dashboard?ticket=` redirect**

In `prototype/server.ts`, change the `/dashboard` route (~line 7031) from:

```ts
    if (req.method === "GET" && path === "/dashboard") return me ? await dashboardPage() : loginGate(path, url.search)
```

to:

```ts
    if (req.method === "GET" && path === "/dashboard") {
      if (me) return await dashboardPage()
      // A member's own address-bar deep link (?ticket=<id>) must work for a colleague: send an
      // unauthenticated visitor to the adaptive /t/:ref so they get the teaser, not a login wall.
      const _tkt = url.searchParams.get("ticket")
      if (_tkt) return redirect("/t/" + encodeURIComponent(_tkt))
      return loginGate(path, url.search)
    }
```

- [ ] **Step 6: Update the two now-obsolete assertions in `server.single-ticket-page.test.ts`**

Replace the `returns 403 for a logged-in non-member` test with the new teaser semantics:

```ts
test("GET /t/:ref serves the teaser (not a 403) for a logged-in non-member under default share_mode", async () => {
  const r = await get(`/t/${FID}`, OUTSIDE_SID)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain("shared-ticket teaser page")
})
```

Replace the `redirects unauthenticated visitors to login` test with:

```ts
test("GET /t/:ref serves the teaser to an unauthenticated visitor under default share_mode", async () => {
  const r = await get(`/t/${FID}`)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain("shared-ticket teaser page")
})
```

(The member-serves-standalone, short-ref, and unknown-ref-404 tests are unchanged and still pass.)

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd prototype && bun test server.share-viewer.route.test.ts server.single-ticket-page.test.ts`
Expected: PASS (both files).

- [ ] **Step 8: Commit**

```bash
git add prototype/server.ts prototype/public/ticket-teaser.html prototype/server.share-viewer.route.test.ts prototype/server.single-ticket-page.test.ts
git commit -m "feat(route): adaptive /t/:ref (full/teaser/login) + anon /dashboard?ticket= teaser redirect"
```

---

## Task 6: Email-to-unblur — `POST /api/t/:ref/unlock` + `POST /api/t/:ref/verify`

**Files:**
- Modify: `prototype/server.ts` (add after the `GET /api/t/:ref` route, ~Task 4 insertion point)
- Test: `prototype/server.share-viewer.route.test.ts` (extend)

**Interfaces:**
- Consumes: `resolveFeedbackRef`, `projectById`, `normalizeShareMode`, `createOtp`, `verifyOtp`, `createSession`, `upsertUser`, `sendOtp`, `otp()`, `token()`, `cookie`, `SESSION_DAYS`, `SECURE`, `testOtpDecision`, `isTestAccountEmail`, `TEST_OTP_CODE`, `rlAllow`, `clientIp`, `grantTicketViewer`, `ticketViewAccess`.
- Produces:
  - `POST /api/t/:ref/unlock {email}` → `{ ok: true }` (always 200 to prevent enumeration), `400` invalid email, `404` unknown ref / `share_mode=off`, `429` when rate-limited (per IP+ref). Side effect: `createOtp` + best-effort `sendOtp`.
  - `POST /api/t/:ref/verify {email, code}` → `{ ok: true, access: "full" | "pending" }` + `Set-Cookie: klav_session`; `401` bad/expired code; `404` unknown ref. Side effects: `upsertUser`, `createSession` (NO `ensureAccount` — viewer has no workspace), `grantTicketViewer` (`status: 'active'`, or `'pending_approval'` when `share_mode=approval`).

Add these imports to `server.ts` if not already present (check the existing `./lib/db` and `./lib/test-otp-gate` imports first): `createOtp`, `verifyOtp`, `createSession`, `upsertUser`, `sendOtp`, `projectById`, `normalizeShareMode` come from `./lib/db` / `./lib/mail` (already imported per the header import block); `testOtpDecision` + `TEST_OTP_CODE` from `./lib/test-otp-gate` (already imported for `/api/auth/verify`).

- [ ] **Step 1: Write the failing test** (append to `server.share-viewer.route.test.ts`)

```ts
async function postJson(path: string, body: any, sid?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (sid) headers.Cookie = `klav_session=${sid}`
  return fetch(`${BASE}${path}`, { method: "POST", headers, body: JSON.stringify(body), redirect: "manual" })
}

test("unlock always returns ok (no email enumeration) and issues an OTP", async () => {
  const r = await postJson(`/api/t/${FID}/unlock`, { email: GUEST })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)
})

test("unlock rejects a malformed email with 400", async () => {
  const r = await postJson(`/api/t/${FID}/unlock`, { email: "not-an-email" })
  expect(r.status).toBe(400)
})

test("verify (test-OTP 666666) mints a session, grants an active viewer, and /api/t/:ref then returns full", async () => {
  const v = await postJson(`/api/t/${FID}/verify`, { email: GUEST, code: "666666" })
  expect(v.status).toBe(200)
  const vbody = await v.json()
  expect(vbody.ok).toBe(true)
  expect(vbody.access).toBe("full")
  const setCookie = v.headers.get("set-cookie") || ""
  expect(setCookie).toContain("klav_session=")
  // The grant row is active.
  const rows = await raw.execute({ sql: "SELECT status FROM ticket_viewers WHERE feedback_id=? AND email=?", args: [FID, GUEST] })
  expect(String((rows.rows[0] as any).status)).toBe("active")
  // The minted session now resolves full via /api/t/:ref.
  const sid = (setCookie.match(/klav_session=([^;]+)/) || [])[1]
  const full = await fetch(`${BASE}/api/t/${FID}`, { headers: { Cookie: `klav_session=${sid}` } })
  expect((await full.json()).access).toBe("full")
})

test("verify rejects a wrong code with 401", async () => {
  const r = await postJson(`/api/t/${FID}/verify`, { email: `other-${RUN}@test.local`, code: "000000" })
  expect(r.status).toBe(401)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.share-viewer.route.test.ts -t "unlock"`
Expected: FAIL — the unlock/verify routes 404 (not yet added).

- [ ] **Step 3: Add the unlock + verify routes**

In `prototype/server.ts`, after the `GET /api/t/:ref` block (Task 4), add:

```ts
    // ── POST /api/t/:ref/unlock {email} — email-to-unblur step 1. Issue an OTP for this email.
    // Always responds 200 ("check your email") to avoid account enumeration; rate-limited per IP+ref.
    const unlockMatch = path.match(/^\/api\/t\/([A-Za-z0-9_-]{1,80})\/unlock$/)
    if (req.method === "POST" && unlockMatch) {
      const ip = clientIp(req, server)
      if (!rlAllow(`viewer:unlock:${ip}:${unlockMatch[1]}`, 5, 15 * 60_000)) {
        return json({ error: "Too many requests. Please wait and try again." }, 429, { "Retry-After": "900" })
      }
      const resolved = await resolveFeedbackRef(unlockMatch[1]).catch(() => null)
      if (!resolved) return json({ error: "Not found" }, 404)
      const proj = await projectById(resolved.projectId)
      if (normalizeShareMode(proj?.shareMode) === "off") return json({ error: "Not found" }, 404)
      let email = ""
      try { email = String((await req.json()).email || "").trim().toLowerCase() } catch { return json({ error: "invalid JSON" }, 400) }
      if (!email || !email.includes("@")) return json({ error: "Enter a valid email." }, 400)
      const code = otp()
      await createOtp(email, code, Date.now() + 10 * 60 * 1000)
      try { await sendOtp(email, code) } catch (err: any) { console.error("viewer unlock OTP email failed:", err?.message || err); if (DEV_SHOW_OTP) console.log(`viewer OTP for ${email} → ${code}`) }
      return json({ ok: true, ...(DEV_SHOW_OTP ? { devCode: code } : {}) })
    }

    // ── POST /api/t/:ref/verify {email, code} — email-to-unblur step 2. Verify the OTP, mint a normal
    // klav_session (but NO workspace — a viewer has no account), and grant a per-ticket viewer. Honors
    // the same test-OTP bypass as /api/auth/verify so CI can drive it with the fixed code.
    const verifyMatch = path.match(/^\/api\/t\/([A-Za-z0-9_-]{1,80})\/verify$/)
    if (req.method === "POST" && verifyMatch) {
      const ip = clientIp(req, server)
      if (!rlAllow(`viewer:verify:${ip}:${verifyMatch[1]}`, 20, 15 * 60_000)) {
        return json({ error: "Too many attempts. Please wait and try again." }, 429, { "Retry-After": "900" })
      }
      const resolved = await resolveFeedbackRef(verifyMatch[1]).catch(() => null)
      if (!resolved) return json({ error: "Not found" }, 404)
      let email = "", code = ""
      try { const b = await req.json(); email = String(b.email || "").trim().toLowerCase(); code = String(b.code || "").trim() } catch { return json({ error: "invalid JSON" }, 400) }
      if (!email || !email.includes("@")) return json({ error: "Enter a valid email." }, 400)
      const testGranted = code === TEST_OTP_CODE ? (await testOtpDecision(email, () => isTestAccountEmail(email))).allowed : false
      if (!(testGranted || await verifyOtp(email, code))) return json({ error: "Invalid or expired code." }, 401)
      await upsertUser(email)
      const proj = await projectById(resolved.projectId)
      const mode = normalizeShareMode(proj?.shareMode)
      const status = mode === "approval" ? "pending_approval" : "active"
      await grantTicketViewer({ feedbackId: resolved.id, projectId: resolved.projectId, email, status, grantedBy: null })
      const sid = token()
      await createSession(sid, email, Date.now() + SESSION_DAYS * 86400 * 1000)
      const access = status === "active" ? "full" : "pending"
      return json({ ok: true, access }, 200, { "Set-Cookie": cookie("klav_session", sid, SESSION_DAYS * 86400, SECURE) })
    }
```

If `otp`, `DEV_SHOW_OTP`, `token`, `SECURE`, `SESSION_DAYS`, `isTestAccountEmail`, or `cookie` are not already in scope at this point in `server.ts`, they are — each is used by `/api/auth/request` and `/api/auth/verify` earlier in the same file (grep to confirm exact names before use).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.share-viewer.route.test.ts -t "unlock"` then `-t "verify"`
Expected: PASS (4 unlock/verify tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/server.share-viewer.route.test.ts
git commit -m "feat(api): email-to-unblur unlock+verify → session + per-ticket viewer grant"
```

---

## Task 7: Viewer-can-comment authz on `POST /api/feedback/:id/comments`

**Files:**
- Modify: `prototype/server.ts` (feedback handler `fbRow` resolution ~line 10116-10126)
- Test: `prototype/server.share-viewer.route.test.ts` (extend)

**Interfaces:**
- Consumes: `ticketViewAccess` (Task 2), `resolveFeedbackRef`, `feedbackById`.
- Produces: `POST /api/feedback/:id/comments` and `GET /api/feedback/:id/comments` accept a caller whose `ticketViewAccess(:id, me)` resolves `full` (member OR active viewer). A no-access caller (or a viewer on any non-comments subroute) still gets `404`/`403`. No new storage — the existing `insertTicketComment(fid, me, text)` runs with the viewer's email as author.

- [ ] **Step 1: Write the failing test** (append to `server.share-viewer.route.test.ts`)

This test runs AFTER the verify test, so `GUEST` is an active viewer of `FID`. It uses the session minted by verify — re-mint here for isolation:

```ts
test("an active viewer can POST a comment; a no-access caller gets 404", async () => {
  // GUEST became an active viewer in the verify test. Mint a fresh session row for GUEST directly.
  const guestSid = `sess_guest_${RUN}`
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [guestSid, GUEST, NOW, NOW + 86400_000])
  const posted = await fetch(`${BASE}/api/feedback/${FID}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${guestSid}` },
    body: JSON.stringify({ body: "Guest viewer comment — I see it too." }),
  })
  expect(posted.status).toBe(201)
  const { comment } = await posted.json()
  expect(comment.author).toBe(GUEST)

  // A signed-in non-viewer (STRANGER has only teaser access) cannot comment.
  const denied = await fetch(`${BASE}/api/feedback/${FID}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${STRANGER_SID}` },
    body: JSON.stringify({ body: "should be rejected" }),
  })
  expect(denied.status).toBe(404)
})
```

Note: sessions are stored as `sha256hex(id)` by `createSession`, but the test inserts the raw id into `sessions.id`. `getSession` has a dual-read fallback that also matches the raw id, so a directly-seeded raw session id resolves (this is exactly how `server.single-ticket-page.test.ts` seeds sessions).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.share-viewer.route.test.ts -t "active viewer can POST"`
Expected: FAIL — the comment POST returns 404 for GUEST (the member-only `fbRow` loop finds nothing because a viewer has no accessible projects).

- [ ] **Step 3: Add the viewer fallback to `fbRow` resolution**

In `prototype/server.ts`, in the feedback handler, after the member-resolution loop and BEFORE the `if (!fbRow) return json(...)` line (~line 10125-10126), insert a viewer fallback scoped strictly to the comments subroute:

```ts
          if (row) { fbRow = row; fbAccess = a; break }
        }
        // Shared-ticket viewers: allow the COMMENTS subroute (read+write) for a caller whose access
        // resolves 'full' via ticketViewAccess (an active per-ticket viewer, not a project member).
        // Scoped to isComments only — every other subroute (PATCH/export/merge/labels/…) stays
        // member-gated: a viewer that isn't a member leaves fbRow null and 404s below.
        if (!fbRow && me && isComments) {
          const _vres = await resolveFeedbackRef(fid).catch(() => null)
          if (_vres && (await ticketViewAccess(_vres.id, me)) === "full") {
            const _vrow = await feedbackById(_vres.projectId, _vres.id)
            if (_vrow) fbRow = _vrow // fbAccess stays null — viewer is NOT a member/admin
          }
        }
        if (!fbRow) return json({ error: "Feedback not found or not accessible." }, 404)
```

(The teaser page always POSTs to the full injected `__TICKET_ID__`, so `fid` here is the full `fb_<uuid>` that `insertTicketComment(fid, me, text)` needs.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.share-viewer.route.test.ts -t "active viewer can POST"`
Expected: PASS.

- [ ] **Step 5: Guard against opening non-comment subroutes to viewers**

Run: `cd prototype && bun test server.ticket-comments.test.ts server.ticket-detail.test.ts server.single-ticket-page.test.ts`
Expected: PASS — member behavior on every feedback subroute is unchanged.

- [ ] **Step 6: Commit**

```bash
git add prototype/server.ts prototype/server.share-viewer.route.test.ts
git commit -m "feat(authz): active ticket viewers may read+write comments (comments subroute only)"
```

---

## Task 8: `public/ticket-teaser.html` — teaser + in-place unlock + full render

**Files:**
- Modify: `prototype/public/ticket-teaser.html` (replace the Task 5 stub with the full page)
- Test: `prototype/inline-js-guard.test.ts` (existing — must stay green); manual render check via the route tests already written

**Interfaces:**
- Consumes: `GET /api/t/__TICKET_ID__` (Task 4 — teaser vs full), `POST /api/t/__TICKET_ID__/unlock`, `POST /api/t/__TICKET_ID__/verify` (Task 6), `POST /api/feedback/__TICKET_ID__/comments` (Task 7).
- Produces: a `noindex` page that (a) fetches `/api/t/:ref`; (b) for `access:"teaser"|"pending"` shows real title/status/priority/source pills, a **placeholder** blurred screenshot (CSS fake-UI, never the real image) + placeholder blurred text, and an email→OTP unblur form (`unlock` then `verify`, on success `location.reload()`); (c) for `access:"full"` shows the unblurred description, the real screenshot (`ticket.screenshotUrl`), the comment list + a comment box (POST to `/api/feedback/:ref/comments`) with a "guest" chip, and a soft "Create your own free Klavity" CTA. Must use straight ASCII quotes only.

**Reference:** `/Users/vishalkumar/Downloads/qbug/klavity-share-viewer-mockup.html` — teaser card (blurred `.pic .fakeui` placeholder + blurred `.desc`), `.gate` email form, OTP `#v-otp` screen, unlocked `#v-full` (guest bar + comments + composer), and the footer CTA. Reuse its class names/structure; adapt to the light or existing `ticket.html` palette as preferred.

- [ ] **Step 1: Write the full teaser page**

Replace `prototype/public/ticket-teaser.html` with a complete page. Key requirements (straight quotes only; keep the `<!-- shared-ticket teaser page -->` marker the route tests assert; keep `data-ticket="__TICKET_ID__"`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Shared ticket · Klavity</title>
<style>
  :root{--bg:#f6f4f0;--panel:#fff;--ink:#29261f;--mut:#8b857a;--line:#e8e4dc;--pri:#6d5ef0;--pri-d:#5a4be0;--red:#e2445c}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--ink);padding:26px 16px}
  .wrap{max-width:760px;margin:0 auto}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:16px;box-shadow:0 8px 28px rgba(35,30,20,.08);overflow:hidden}
  .head{padding:16px 22px;border-bottom:1px solid var(--line)}
  .h1{font:600 22px/1.3 Georgia,serif;margin:5px 0 8px}
  .meta{display:flex;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--mut)}
  .pill{font-size:10.5px;font-weight:700;padding:2px 9px;border-radius:99px;text-transform:uppercase;background:#fdf1e2;color:#b06a12}
  .body{padding:20px 22px}
  .sec-l{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#b6b0a4;margin:18px 0 7px}
  .shot{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#eceae2}
  .pic{height:210px;background:linear-gradient(135deg,#dfe6f5,#eef1fa);position:relative}
  .fakeui{position:absolute;inset:16px;display:flex;flex-direction:column;gap:9px}
  .bar{height:13px;border-radius:5px;background:#cdd5e8}.bar.s{width:45%}.bar.m{width:70%}.bar.red{background:#f3b0bb}
  .blur{filter:blur(7px);user-select:none;pointer-events:none}
  .gate{margin:20px 0 4px;border:1px solid #dcd6fa;background:linear-gradient(180deg,#faf9ff,#f3f1fd);border-radius:14px;padding:22px;text-align:center}
  .row{display:flex;gap:8px;max-width:380px;margin:10px auto 0}
  .inp{flex:1;border:1px solid var(--line);border-radius:9px;padding:10px 13px;font:inherit}
  .btn{padding:10px 16px;border-radius:9px;border:none;background:var(--pri);color:#fff;font-weight:600;cursor:pointer}
  .btn:hover{background:var(--pri-d)}
  .fine{font-size:11px;color:#b6b0a4;margin-top:10px}
  .guestbar{display:flex;gap:11px;align-items:center;background:#f0edfa;border:1px solid #dcd6fa;border-radius:11px;padding:11px 14px;margin-bottom:16px;font-size:13px}
  .cmt{margin-bottom:12px}.cmt .who{font-weight:600}.cmt .when{color:#b6b0a4;font-size:11px;margin-left:6px}
  .foot{padding:16px 22px;border-top:1px solid var(--line);background:#fbfaf7;color:var(--mut);font-size:12.5px;display:flex}
  .foot .cta{margin-left:auto;color:var(--pri-d);font-weight:600;text-decoration:none}
  .hide{display:none}
</style>
</head>
<body>
<!-- shared-ticket teaser page -->
<div class="wrap"><div class="card" id="app" data-ticket="__TICKET_ID__" data-project="__PROJECT_ID__">
  <div class="head">
    <div class="h1" id="title">Loading shared ticket…</div>
    <div class="meta" id="meta"></div>
  </div>
  <div class="body" id="bodyEl"></div>
  <div class="foot">Shared from <b>Klavity</b> · a bug report your team can act on
    <a class="cta" href="/signup">Create your own free Klavity →</a></div>
</div></div>
<script>
(function(){
  var REF = document.getElementById("app").getAttribute("data-ticket");
  var email = "";
  function h(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c]; }); }
  function pill(v){ return v ? "<span class=\"pill\">" + h(v) + "</span>" : ""; }
  function load(){
    fetch("/api/t/" + encodeURIComponent(REF), { credentials: "include" })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ if(!d){ document.getElementById("title").textContent = "This ticket is not available."; return; } render(d); });
  }
  function render(d){
    var t = d.ticket || {};
    document.getElementById("title").textContent = t.title || "Untitled";
    document.getElementById("meta").innerHTML = pill(t.status) + pill(t.priority) + pill(t.source) +
      " <span>" + h(t.commentCount || 0) + " comments</span>";
    var b = document.getElementById("bodyEl");
    if (d.access === "full") { b.innerHTML = fullHtml(t); wireComment(); }
    else { b.innerHTML = teaserHtml(d.access); wireGate(); }
  }
  function teaserHtml(access){
    var pending = access === "pending" ? "<p class=\"fine\">An admin needs to approve you before this unblurs.</p>" : "";
    return "<div class=\"sec-l\">Screenshot</div>" +
      "<div class=\"shot\"><div class=\"pic blur\"><div class=\"fakeui\"><div class=\"bar m\"></div><div class=\"bar s\"></div><div class=\"bar red m\"></div><div class=\"bar s\"></div></div></div></div>" +
      "<div class=\"sec-l\">Description</div>" +
      "<div class=\"blur\"><p>When I click the button it just spins and nothing happens. I tried several times across browsers. This is placeholder text — the real report is hidden until you unblur.</p></div>" +
      "<div class=\"gate\"><h3>See the full report and join the conversation</h3>" +
      "<p class=\"fine\">Enter your email to unblur the screenshot, read the details, and comment. No password — we email you a code.</p>" + pending +
      "<div class=\"row\"><input class=\"inp\" id=\"emailInp\" placeholder=\"you@company.com\" /><button class=\"btn\" id=\"unlockBtn\">Continue</button></div>" +
      "<div class=\"row hide\" id=\"otpRow\"><input class=\"inp\" id=\"codeInp\" placeholder=\"6-digit code\" maxlength=\"6\" /><button class=\"btn\" id=\"verifyBtn\">Unlock</button></div>" +
      "<div class=\"fine\" id=\"gateMsg\">Free forever · viewing this ticket only</div></div>";
  }
  function fullHtml(t){
    var shot = t.screenshotUrl ? "<div class=\"shot\"><img src=\"" + h(t.screenshotUrl) + "\" alt=\"Screenshot\" style=\"max-width:100%;display:block\" /></div>" : "";
    var comments = (t.comments || []).map(function(c){
      return "<div class=\"cmt\"><span class=\"who\">" + h(c.author || "Someone") + "</span><span class=\"when\">" + h(new Date(c.createdAt).toLocaleString()) + "</span><div>" + h(c.body) + "</div></div>";
    }).join("");
    return "<div class=\"guestbar\">You are viewing as a <b>guest</b> on this ticket.</div>" +
      "<div class=\"sec-l\">Screenshot</div>" + shot +
      "<div class=\"sec-l\">Description</div><div><p>" + h(t.description) + "</p></div>" +
      "<div class=\"sec-l\">Activity</div>" + comments +
      "<div class=\"row\"><input class=\"inp\" id=\"cmtInp\" placeholder=\"Add a comment…\" /><button class=\"btn\" id=\"cmtBtn\">Send</button></div>" +
      "<div class=\"fine\" id=\"cmtMsg\"></div>";
  }
  function wireGate(){
    document.getElementById("unlockBtn").onclick = function(){
      email = (document.getElementById("emailInp").value || "").trim();
      if (!email || email.indexOf("@") < 0){ document.getElementById("gateMsg").textContent = "Enter a valid email."; return; }
      fetch("/api/t/" + encodeURIComponent(REF) + "/unlock", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: email }) })
        .then(function(){ document.getElementById("otpRow").classList.remove("hide"); document.getElementById("gateMsg").textContent = "We sent a code to " + email; });
    };
    document.getElementById("verifyBtn").onclick = function(){
      var code = (document.getElementById("codeInp").value || "").trim();
      fetch("/api/t/" + encodeURIComponent(REF) + "/verify", { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify({ email: email, code: code }) })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){ if (d && d.ok){ location.reload(); } else { document.getElementById("gateMsg").textContent = "Invalid or expired code."; } });
    };
  }
  function wireComment(){
    var btn = document.getElementById("cmtBtn"); if (!btn) return;
    btn.onclick = function(){
      var body = (document.getElementById("cmtInp").value || "").trim(); if (!body) return;
      fetch("/api/feedback/" + encodeURIComponent(REF) + "/comments", { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify({ body: body }) })
        .then(function(r){ if (r.status === 201){ load(); } else { document.getElementById("cmtMsg").textContent = "Could not post comment."; } });
    };
  }
  load();
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Run the inline-JS guard + route tests**

Run: `cd prototype && bun test inline-js-guard.test.ts server.share-viewer.route.test.ts`
Expected: PASS — the guard accepts straight-quote inline JS; the `/t/:ref` teaser/full render tests still find their markers.

- [ ] **Step 3: Verify no smart quotes slipped in**

Run: `cd prototype && node --check <(node -e "process.stdout.write('ok')") 2>/dev/null; grep -nP "[\x{2018}\x{2019}\x{201C}\x{201D}]" public/ticket-teaser.html || echo "no smart quotes"`
Expected: `no smart quotes`.

- [ ] **Step 4: Commit**

```bash
git add prototype/public/ticket-teaser.html
git commit -m "feat(ui): shared-ticket teaser page — blurred placeholder + email unblur + full render"
```

---

## Task 9: Dashboard Copy-link → `/t/:ref`

**Files:**
- Modify: `prototype/public/dashboard.html` (`ticketPageUrl` ~line 6713)
- Test: `prototype/dashboard-ticket-deeplink-loop.test.ts` / any test asserting `ticketPageUrl` (grep first)

**Interfaces:**
- Consumes: nothing new.
- Produces: `ticketPageUrl(id)` returns `<origin>/t/<id>` (the adaptive share URL) instead of `<current-url>#tickets/<id>`. The in-dashboard deep-link (`maybeOpenDeepLinkTicket`, which reads `?ticket=` / `#tickets/<id>`) is unchanged and still opens the in-board ticket.

- [ ] **Step 1: Find any test that pins the old `ticketPageUrl` shape**

Run: `cd prototype && grep -rn "ticketPageUrl\|#tickets/" *.test.ts | grep -i "tickets/" | head`
Expected: identify tests (if any) asserting `#tickets/<id>` as the copied link. If a test extracts and asserts `ticketPageUrl`, update its expectation in this task to `/t/<id>`.

- [ ] **Step 2: Write / update the failing test**

If a brace-extracted unit test exists for `ticketPageUrl` (mirroring how `dashboard-ticket-deeplink-loop.test.ts` extracts dashboard functions), update it to assert:

```ts
// ticketPageUrl now returns the adaptive share URL /t/<id> (Copy link is shareable to colleagues).
expect(ticketPageUrl("fb_abc")).toContain("/t/fb_abc")
expect(ticketPageUrl("fb_abc")).not.toContain("#tickets/")
```

If no such extractable test exists, add a focused one to `dashboard-ticket-deeplink-loop.test.ts` using the same brace-extraction harness that file already uses for dashboard helpers (copy its extraction preamble; assert the two lines above).

- [ ] **Step 3: Run test to verify it fails**

Run: `cd prototype && bun test dashboard-ticket-deeplink-loop.test.ts`
Expected: FAIL — `ticketPageUrl` still returns a `#tickets/<id>` hash URL.

- [ ] **Step 4: Change `ticketPageUrl`**

In `prototype/public/dashboard.html` (~line 6712-6716), replace:

```js
// KLA-563: the shareable canonical URL for a ticket's dedicated page — the hash route #tickets/<id>.
function ticketPageUrl(id) {
  try { const u = new URL(location.href); u.searchParams.delete("ticket"); u.hash = "tickets/" + encodeURIComponent(String(id)); return u.toString() }
  catch (e) { return location.origin + location.pathname + "#tickets/" + encodeURIComponent(String(id)) }
}
```

with:

```js
// Share-viewer onboarding: the shareable canonical URL is the ADAPTIVE ticket link /t/<id>. A member
// who opens it gets the full ticket; a colleague without access gets the redacted teaser + email
// unblur. (The in-dashboard deep link still uses ?ticket= / #tickets/<id> via maybeOpenDeepLinkTicket.)
function ticketPageUrl(id) {
  try { return new URL("/t/" + encodeURIComponent(String(id)), location.origin).toString() }
  catch (e) { return location.origin + "/t/" + encodeURIComponent(String(id)) }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd prototype && bun test dashboard-ticket-deeplink-loop.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add prototype/public/dashboard.html prototype/dashboard-ticket-deeplink-loop.test.ts
git commit -m "feat(dashboard): Copy link produces the adaptive /t/:ref share URL"
```

---

## Task 10: Full-suite green + rebase + CHANGELOG entry

**Files:**
- Modify: `prototype/CHANGELOG.md` (feature entry only — NO version line)

**Interfaces:** none.

- [ ] **Step 1: Run the full test suite**

Run: `cd prototype && bun test`
Expected: PASS (green). Investigate any failure with superpowers:systematic-debugging; likely candidates are the two updated `server.single-ticket-page.test.ts` assertions and any `ticketPageUrl` test.

- [ ] **Step 2: Add a CHANGELOG feature entry (no version bump)**

Add under the appropriate unreleased section of `prototype/CHANGELOG.md` (do NOT touch any version number/line):

```markdown
- **Shared-ticket viewer onboarding (Phase 1):** the normal ticket URL `/t/:ref` is now an adaptive share link — members see the full ticket, everyone else gets a server-side-redacted blurred teaser and can unblur + comment with just an email (passwordless). New `ticket_viewers` grants (free & unlimited, per-ticket). Dashboard Copy-link now produces `/t/:ref`.
```

- [ ] **Step 3: Rebase onto latest master and re-run**

Run: `git fetch origin master && git rebase origin/master && cd prototype && bun test`
Expected: clean rebase (resolve trivially or `git merge origin/master` per worktree rules), suite green.

- [ ] **Step 4: Commit**

```bash
git add prototype/CHANGELOG.md
git commit -m "docs(changelog): shared-ticket viewer onboarding Phase 1"
```

---

## Test Coverage Map (spec §13)

| Spec §13 test | Task | Test name |
|---|---|---|
| `ticketViewAccess` unit matrix (member/ticket-viewer/project-viewer/anon × share_modes) | 2 | member full / project-viewer full / active+pending / no-access branch / anon branch |
| Teaser redaction (no-access `/api/t/:ref` has title/status, NOT description/screenshot) | 4 | "SECURITY: teaser payload … NEVER the description or screenshot token" |
| Unlock→verify→grant→full (OTP round-trip → session + active row → `/api/t/:ref` full) | 6 | "verify (test-OTP 666666) mints a session, grants an active viewer …" |
| Viewer comment (active viewer POSTs; no-access → 403/404) | 7 | "an active viewer can POST a comment; a no-access caller gets 404" |
| `auto_join` grants project-wide viewer; `approval` leaves `pending_approval` | 2, 6 | resolver `auto_join`→teaser + `approval`→teaser (resolver); verify with `share_mode=approval` grants `pending_approval` (unit-level; the project-wide auto_join *grant* action is Phase 2) |
| Anon `/dashboard?ticket=` redirects to `/t/:ref` | 5 | "anon GET /dashboard?ticket=<id> 302s to /t/<id>" |

**Phase-2 boundary note:** the `approval` admin-approve action, the `auto_join` project-wide grant *write*, the per-ticket→project-viewer upgrade endpoint, and the project share-settings UI are intentionally NOT implemented here. `ticketViewAccess` recognizes those modes/roles (tested at the resolver level) so Phase 2 slots in without touching the resolver.

---

## Self-Review

**1. Spec coverage.** §3 adaptive URL → Task 5; §4 server-side redaction → Task 4 (+ security test); §5 email-to-unblur → Task 6; §6 viewer role + `ticket_viewers` → Tasks 1-3 (upgrade action = Phase 2); §7 comments for viewers → Task 7; §8 per-project `share_mode`/`share_allowlist` columns → Task 1 (settings UI = Phase 2); §10 data model → Tasks 1-3; §11 security (redaction, off/approval, rate-limit, enumeration-safe unlock, viewer ≠ member mutations) → Tasks 4/6/7 + Global Constraints; §12 Phase-1 scope → all tasks; §13 tests → coverage map above. No Phase-1 requirement is left without a task.

**2. Placeholder scan.** No "TBD"/"handle edge cases"/"similar to Task N". Every code step shows complete code. The teaser page (Task 8) is shown in full. The one deliberate deferral (OTP subject framing, project-wide auto_join write, settings UI) is scoped OUT to Phase 2 per the spec, not left as a placeholder.

**3. Type consistency.** `ticketViewAccess(feedbackId, sessionEmail) → "full"|"teaser"|"pending"|"login"` is used identically in Tasks 2/4/5/7. `grantTicketViewer({feedbackId, projectId, email, status?, grantedBy?})` object signature is consistent in Tasks 2 and 6. `ticketViewerStatus → "active"|"pending_approval"|null` matches its checks. `normalizeShareMode` / `SHARE_MODES` defined once in `db.ts` (Task 1), imported by `ticket-viewers.ts` (Task 2) and `server.ts` (Task 6) — no circular import (the normalizer + `ProjectRow` mapping stay in `db.ts`). `ProjectRow.shareMode`/`shareAllowlist` names match between the type, `rowToProject`, and every consumer. The `GET /api/t/:ref` payload shape (`{access, ticket:{…}}`) is produced in Task 4 and consumed by the Task 8 page under the same field names (`title,status,priority,source,createdAt,commentCount,description,screenshotUrl,comments`).
