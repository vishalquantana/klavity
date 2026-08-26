# Shared-ticket viewer onboarding — Design Spec

**Status:** approved (brainstorm 2026-08-25) · mockup: `klavity-share-viewer-mockup.html`
**Growth thesis:** users are free, so every shared ticket should be a viral loop — share → intrigued view → one-tap (email) onboard → new user in the graph (and a candidate to spin up their own workspace).

## 1. Problem
Sharing a ticket today is a dead end: `/r/:ref` shows only a thin no-login status ladder, the full ticket needs project membership, and **commenting requires an authenticated account** (`insertTicketComment(fid, me, …)`). A colleague pasted a link either sees almost nothing or hits a login wall — the funnel leaks exactly where it should convert.

## 2. Goals / Non-goals
**Goals**
- The **normal ticket URL is the share link** — no separate "public link" to generate. It adapts by (signed-in? · has access?).
- A not-signed-in colleague gets a **blurred teaser** that's intriguing but safe, and can **onboard with just an email** (passwordless) to unblur + comment.
- Viewers are **free & unlimited**, **per-ticket by default**, one-click upgradeable to project-wide.
- Per-project control over sharing behavior.

**Non-goals**
- Billing/seats for viewers (free by design). Real-time collab. Replacing member/admin roles. Public search-indexing of tickets.

## 3. Core model — ONE adaptive URL
The canonical shareable URL is `GET /t/:ref` (`:ref` = the short quotable ref or `fb_<uuid>`; the dashboard Copy-link produces this). The dashboard deep-link `/dashboard?ticket=<id>` for an **unauthenticated** visitor redirects to `/t/:ref` so a member's own address-bar link also works for colleagues.

`GET /t/:ref` resolves the feedback (`resolveFeedbackRef`) then branches on `ticketViewAccess(feedbackId, sessionEmail)`:

| Result | Condition | Render |
|---|---|---|
| **full** | signed-in AND (project member/admin OR active viewer of this ticket/project) — OR `share_mode=public` | the FULL ticket (redirect a member into the real dashboard dedicated-ticket page; render the public full page for a `public`-mode anon) |
| **teaser** | not-signed-in, or signed-in without access, AND `share_mode ∈ {teaser, approval, auto_join}` | `public/ticket.html` teaser (server-side-redacted) + email-unblur gate |
| **pending** | `share_mode=approval` and the viewer signed in but isn't approved yet | teaser + "waiting for an admin to approve you" |
| **login** | `share_mode=off` | redirect to `/login?next=/t/:ref` (members only) |

**After email-unblur sign-in:** grant a per-ticket viewer record → 302 back to `/t/:ref`, which now resolves **full**.

## 4. Server-side redaction (the must-get-right)
The teaser MUST be redacted **on the server** — never send the real screenshot/description to the browser and CSS-blur it (trivially bypassable via devtools). The teaser payload (`GET /api/t/:ref` when access=teaser) contains ONLY:
- `title` (the AI-generated summary — the hook), `status`, `priority`, `source`, `createdAt`, `commentCount`.
- NO description text, NO screenshot bytes/URL, NO reporter PII, NO comment bodies.
The teaser page renders a **placeholder** blurred screenshot + placeholder blurred text (not the real content). Full content is only returned by `GET /api/t/:ref` once access resolves to **full**.

## 5. Email-to-unblur (onboarding)
Reuses the existing OTP path (`createOtp`/`verifyOtp`/`createSession`):
- `POST /api/t/:ref/unlock {email}` → validate email → `createOtp` → send the "your code" email (subject/body framed as "your code to view KLAV-88"). Rate-limited per IP + per ref.
- `POST /api/t/:ref/verify {email, code}` → `verifyOtp` → `createSession` (sets `klav_session`) → **grant viewer** for this ticket (`grantTicketViewer`), unless `share_mode=approval` (then status `pending_approval` + notify an admin). Returns `{ ok, access: 'full'|'pending' }` → client navigates to `/t/:ref`.

## 6. Viewer role + upgrade
- New role value **`viewer`** (below `member`) for `project_members.project_role` (currently `admin|member`).
- New table **`ticket_viewers`**: `id, feedback_id, project_id, email, status ('active'|'pending_approval'), created_at, granted_by`. A per-ticket grant; unique `(feedback_id, email)`.
- **Access = full** if: project member/admin, OR a project-wide `project_members` row with role `viewer`, OR an `active` `ticket_viewers` row for this feedback.
- **Upgrade:** `POST /api/t/:ref/upgrade` (or an owner action) promotes a per-ticket viewer to a project-wide `viewer` (`addProjectMember(..., 'viewer')`). Owner-initiated by default; viewer can request (creates a pending row an admin approves).

## 7. Comments for viewers
The existing comment write (`POST /api/feedback/:id/comments` → `insertTicketComment(fid, me, text)`) now accepts a caller whose access resolves to **full** (member OR active viewer). Read (`listTicketComments`) is included in the full payload. A viewer's comments show their email/name + a "guest" chip. No new comment storage — just the authz change.

## 8. Per-project share settings
`projects.share_mode TEXT NOT NULL DEFAULT 'teaser'` ∈ `{teaser, public, approval, auto_join, off}` + optional `projects.share_allowlist TEXT` (JSON email list, used by `approval`/allowlist). `auto_join` = a verified viewer is granted **project-wide** viewer (not just per-ticket). Settings UI in the project settings surface (radio group per the mockup) — OPS/admin-gated write via `PATCH /api/projects/:id` (extend the existing project-settings endpoint).

## 9. Growth loops (phased, see §12)
- **UTM** on `/t/:ref` links (reuse the attribution system) → new signups attributed to sharing.
- **Comment notifications**: on a new comment, email participants (members + active viewers + reporter) a magic-link back to `/t/:ref` — re-engagement.
- **Owner nudge**: "N people viewed / M joined KLAV-88" surfaced to the project owner (dashboard + digest).
- **Reporter-follow (wave 2)**: the Snap reporter (often anonymous) gets a magic link to follow + comment on their own report — converts anonymous reporters (ties into KLA-463).
- Every viewer surface carries a soft **"create your own free Klavity"** CTA.

## 10. Data model summary
- `projects`: + `share_mode` (default `teaser`), + `share_allowlist` (nullable JSON). Additive `needCol` migrations.
- `project_members.project_role`: allow new value `viewer` (no schema change; enum widening in code).
- new table `ticket_viewers` (per §6), with an index on `(feedback_id)` and `(email)`.
- No change to `feedback`/`screenshots`/comments storage.

## 11. Security & privacy
- Server-side redaction (§4) is the load-bearing control — verified by a test that the teaser HTTP response for a no-access caller contains none of the description/screenshot bytes.
- `off` mode: no teaser at all (members-only). `approval`: unblur gated on admin approval. Allowlist honored.
- Rate-limit unlock/verify (per IP + per ref) to prevent email bombing / enumeration. Email enumeration: unlock always responds 200 ("check your email") regardless of whether the email is new.
- Sessions from unblur are normal `klav_session` sessions but the account is a **viewer** (no admin/triage powers); the dashboard/API must gate mutations on member/admin, not merely "signed in".
- Titles are shown in the teaser (accepted — they're AI summaries; the hook). Projects with sensitive titles use `approval`/`off`.

## 12. Phasing
- **Phase 1 (core loop):** adaptive `/t/:ref` (full/teaser/login by access + `share_mode`), server-side-redacted teaser payload, email-unblur (OTP → session → per-ticket viewer grant), viewer-can-comment authz, dashboard Copy-link → `/t/:ref`, anon `/dashboard?ticket=` → teaser redirect. `share_mode` defaults `teaser`; settings UI can come in P2 (default is enough to ship the loop).
- **Phase 2 (control):** project share-settings UI (`share_mode` + allowlist), `approval` flow + admin approve, per-ticket → project-viewer upgrade.
- **Phase 3 (loops):** comment magic-link notifications, owner "who viewed" nudge, reporter-follow, UTM attribution dashboards.

## 13. Testing
- `ticketViewAccess` unit matrix: (member, ticket-viewer, project-viewer, anon) × (teaser, public, approval, auto_join, off) → correct verdict.
- Teaser redaction: the no-access `GET /api/t/:ref` response body contains title/status but NOT the description text or screenshot key/bytes (the security test).
- Unlock→verify→grant→full: OTP round-trip creates a session + an active `ticket_viewers` row + subsequent `/api/t/:ref` returns full.
- Viewer comment: an active viewer can POST a comment; a no-access caller gets 403.
- `auto_join` grants project-wide viewer; `approval` leaves status `pending_approval` until approved.
- Anon `/dashboard?ticket=` redirects to `/t/:ref`.

## 14. Open decisions (resolved)
- View default: **teaser + email-to-unblur** (per-project overridable). Comment identity: **sign-in required** (passwordless). Viewer scope: **per-ticket, one-click upgrade to project**. Landing: **lightweight `public/ticket.html`**. Same-URL adaptive routing (members skip the teaser): **yes**.
