# QPLANE-407 — Team management fixes: report

## Status
DONE. Committed on branch `feat/team-member-remove`.

## What shipped
1. **Fix 1** — `POST /api/team/invite` (prototype/server.ts) now always dispatches
   `sendMemberInviteEmail` when `SENDGRID_API_KEY` is set, for both a brand-new invite AND a
   re-invite of an already-active member. Previously the send was nested inside
   `if (!priorAccess)`, so re-inviting an existing member silently sent nothing while still
   returning a green "Invited" response.
2. **Fix 2** — `POST /api/team/member/remove` (admin-only, active-member removal):
   - `prototype/lib/db.ts`: new `removeProjectMember(projectId, email)` — plain `DELETE FROM
     project_members`, returns whether a row was actually deleted.
   - `prototype/lib/audit-log.ts`: added `"member_remove"` to `AuditAction`.
   - `prototype/server.ts`: new route, guard order exactly as specified — resolve project (400) →
     admin-only (403) → can't remove self (400) → can't remove account owner, looked up via
     `SELECT owner_email FROM accounts WHERE id=?` (400) → can't remove the last admin, counted via
     `membersOfProject` (400) → 404 if nothing was actually a member → `logAudit("member_remove")`
     → `{ ok: true, members }`.
   - `prototype/public/dashboard.html`: `renderMembers()` now renders a "Remove" control on every
     row except the caller's own (admin-only); wired via a small `removeMemberClick()` handler
     (confirm → POST → re-render on success, toast on server error). Server owns the
     finer-grained blocks (owner/last-admin), so the client doesn't try to duplicate that logic.
3. **Coordinator addition — "Resend" control**: extended `POST /api/team/invite/resend`
   (prototype/server.ts) so it also works for an already-ACTIVE member, not only a still-pending
   invite: if `getPendingInvite` finds nothing, it now falls back to a `membersOfProject` lookup
   and sends the same `sendMemberInviteEmail` using the member's current role. Still 404s for a
   genuinely unknown email. Chose this over repurposing `POST /api/team/invite` because
   `/invite/resend` already owns "re-send the access email" semantics and required no role
   parameter or role-mutation side effects. Wired a `Resend` button (shown on every row, incl.
   self, admin-only) next to Remove in `renderMembers()`, via `resendMemberClick()` — success shows
   `"Sign-in link re-sent to <email>"`, `emailSent:false` shows a distinct "mail isn't configured"
   toast, failure surfaces the server error.

## Files touched
- prototype/server.ts
- prototype/lib/db.ts
- prototype/lib/audit-log.ts
- prototype/public/dashboard.html
- prototype/server.member-invite.test.ts (extended)
- prototype/server.team-member-remove.test.ts (new)

## Tests
- `bun test server.team-member-remove.test.ts server.member-invite.test.ts server.workspace-rename.test.ts`
  → **21 pass, 0 fail** (85 expect() calls).
- New coverage:
  - re-inviting an already-active member returns `ok:true`, `emailSent:true` (SENDGRID_API_KEY set
    in that harness), doesn't re-pend status.
  - resend now works for an active member (was previously 404-only-if-pending); still 404s for a
    truly unknown email.
  - member-remove: admin removes a plain member (200, gone from roster); non-admin → 403; removing
    the account owner (by a different admin, not self) → 400 "owner"; removing yourself → 400;
    removing the last remaining admin → 400 "last admin"; unknown/already-removed → 404.
- Full-suite `bun test` (353 files, 3592 tests): 3477 pass, 100 skip, **15 fail, 1 error** — all
  pre-existing and unrelated to this change (verified by inspecting each failure): a login-redirect
  query-param assertion (`/login` vs `/login?next=...`) in `server.widget.test.ts` /
  `server.sim-new-page.test.ts`, a connector-outcome-copy snapshot string in
  `dashboard-connector-outcome-first.test.ts`, a pricing-canonical assertion, and a missing
  `@klavity/core/icons` module resolution in the SDK package. None touch team/invite/member code.

## Guards
- `node scripts/check-inline-js.mjs` → PASS
- `node scripts/check-inline-defs.mjs` → PASS
- `node scripts/check-no-emoji.mjs` → PASS

## Blocking concerns
- None for the assigned scope. One pre-existing, out-of-scope oddity noted in a test comment:
  `addProjectMember` uses `ON CONFLICT(project_id,email) DO NOTHING`, so re-inviting an existing
  member with a different role does NOT actually persist the role change in `project_members`,
  despite the handler's response echoing the requested role and an inline comment claiming
  "Inviting an already-active member updates their role." This predates this ticket and is outside
  the two fixes requested — flagging for a separate ticket if role-on-reinvite is expected to work.
- Per instructions, did not bump versions/CHANGELOG/manifests (orchestrator-owned) and did not
  rebase onto `origin/master` or push — left for the orchestrator's merge-train.
