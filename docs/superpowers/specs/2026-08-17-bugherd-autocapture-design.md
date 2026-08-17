# BugHerd Sub-project A — Passive client-error auto-ticketing

**Status:** approved design → implementation
**Date:** 2026-08-17
**Scope:** ONE sub-project of the larger "replicate BugHerd" effort. Later sub-projects (out of scope here): B kanban triage board, C visual pin feedback, D guest reviewers.

## Problem / goal

BugHerd surfaces client-side JavaScript errors automatically. Klavity already captures console/network/perf context in the widget, but only *attaches* it to a **manual** Snap. There is no passive path that turns a real client-side error into a ticket on its own.

Goal: on customer-embedded sites, passively catch uncaught JS errors, failed network requests, and `console.error` calls, dedupe them, and file each unique one as a Klavity `fb_` ticket (the same record type a Snap produces), with recurrence counting — then auto-copy to the project's configured connector exactly like a Snap. Opt-in per project, hard-capped, PII-scrubbed.

## What already exists (reuse, don't reinvent)

- `packages/core/src/capture.ts` — `installCapture()` wraps `window.onerror` + `unhandledrejection` + console levels + fetch/XHR into bounded ring buffers, with an `onError(message, stack)` hook and `redactUrl()` secret-masking. Shared by SDK / no-install widget / extension.
- `packages/sdk/src/capture-context.ts` — `installCaptureContext()` adds PerformanceObserver; `buildCaptureContext()` snapshots console/network/perf into a `ReportContext`.
- `prototype/lib/error-autoticket.ts` — `errorTicketSignature(info)` (sha256 of where + normalized message + route + top stack frame), create-or-bump-recurrence, loud-failure Slack alert. Currently wired to Klavity's OWN server errors, gated by `KLAV_ERROR_AUTOTICKET=1`.
- `prototype/server.ts` `POST /api/feedback` — anonymous cross-origin widget report path: Origin check, `projectById`, per-IP + per-project `rlAllow` caps, `fb_` row creation, `source` tagging, connector auto-copy.
- `prototype/lib/data-masking.ts` — `maskPii()`, `maskDeep()` (emails, cards, IPs, phones, tokens); `capture.ts` `redactUrl()` for URL secrets.
- Connector auto-copy layer (Plane/GitHub/Jira/Linear/webhook) already invoked for Snaps; `listRecentFeedbackForDedup` / `bumpFeedbackRecurrence` / recurrence "seen again" comments already exist.

## Design

### 1. Client (widget SDK) — passive error reporter
New `packages/sdk/src/error-reporter.ts` (`installErrorReporter(opts)`):
- Subscribes to the signals `installCapture` already surfaces via `onError` (uncaught errors + unhandledrejection) **plus** wraps `console.error`, **plus** observes fetch/XHR responses with `status >= 500` or `status === 0`. (4xx excluded by default — too noisy.)
- **Client-side dedup ring:** a `Set` of client-computed signatures seen this session. Only the *first* occurrence of a signature beacons; later ones increment a local counter, flushed at most once per `FLUSH_MS` as a lightweight recurrence ping. First noise gate.
- Sends via `navigator.sendBeacon` (falls back to `fetch(keepalive:true)`) to `POST /api/errors`, carrying minimal `ErrorInfo` (message, stack, kind, pageUrl, selector?) + a **snapshot of the existing capture context** (recent console/network/perf) — but **no screenshot** (passive, no gesture).
- Gated on a per-project config flag fetched with the widget's existing config; if `autoCaptureErrors` is false/absent, `installErrorReporter` is a no-op.

### 2. Server — `POST /api/errors`
Sibling to `/api/feedback`, reusing its plumbing:
- Origin present + `projectById(projectId)`; unknown project → 404.
- `rlAllow` per-IP (`errIp:*`) and **per-project hourly cap** (`errProj:*`, new `ERRORS_PER_PROJECT_HOUR`). Over-cap requests still fold into recurrence (bump last-seen/count) but never create a NEW ticket → a broken deploy can't flood.
- Accepts JSON (sendBeacon body), not multipart.

### 3. Dedup → `fb_` ticket (+ recurrence) — `prototype/lib/client-error-ticket.ts`
- Extend `ErrorInfo` with `where: "frontend"`, `selector?`, `pageUrl`; extend `errorTicketSignature()` inputs to fold `pageUrl`/`selector` (per-project scoped).
- `recordClientError(projectId, info, ctx)`:
  - Look up existing `fb_` row for this project by `signature`.
  - **Exists:** `bumpFeedbackRecurrence` (count + last_seen); if `status` was resolved, re-open (mirrors existing grounded-dedup/known-issue recurrence). Post a "seen again" connector comment via the existing path.
  - **New:** mint an `fb_` row tagged `source: "auto-error"`, severity heuristic (uncaught error > 5xx > console.error), store scrubbed message + context. Then invoke the SAME connector auto-copy path Snaps use.
- Reuses the feedback table + triage board; auto-error tickets appear under "View in dashboard", filterable by the `auto-error` source tag.

### 4. Privacy
Before persisting: run message + captured URLs through `redactUrl()` (secrets) and `maskPii()`/`maskDeep()` (emails, cards, IPs, phones, tokens) — the same scrubbing Snaps get. No new privacy surface.

### 5. Enablement + safety
- **Opt-in per project**, OFF by default. New widget/project config field `autoCaptureErrors: boolean`, surfaced as a toggle in the project settings drawer. Client reads it from the config it already fetches.
- Hard caps: client-side dedup ring + `ERRORS_PER_PROJECT_HOUR` server cap (over-cap → recurrence only). Log (not silently drop) when the cap folds errors.

### 6. Data model
- `feedback` rows: add `signature TEXT` (indexed for dedup lookup) + `recurrence_count INTEGER DEFAULT 1`. `source` column already exists. Migration self-applies on boot (standard `db.ts` pattern; idempotent CREATE/ALTER guarded like existing columns).

## Components & boundaries

| Unit | Responsibility | Depends on |
|---|---|---|
| `error-reporter.ts` (SDK) | detect + client-dedup + beacon | `capture.ts` onError, capture-context snapshot, project config flag |
| `POST /api/errors` (server) | authz + origin, rate-cap, hand to recorder | `projectById`, `rlAllow`, `recordClientError` |
| `client-error-ticket.ts` (lib) | signature, create-or-bump, connector copy | `errorTicketSignature`, feedback db, connectors, data-masking |
| project config toggle | opt-in per project | existing widget-config get/set |

## Testing

- `packages/core` / `packages/sdk` vitest: `error-reporter.test.ts` — dedup ring (first beacons, repeats don't), trigger conditions (5xx/0 network, console.error, uncaught), no-op when flag off, sendBeacon payload shape.
- `prototype` bun test: `client-error-ticket.test.ts` — signature stability, create-vs-bump, re-open on resolved, cap folds to recurrence, masking applied. `server.errors-endpoint.test.ts` — origin/project gate, per-IP + per-project caps, JSON body, over-cap → recurrence-only.
- Boot-smoke + emoji + inline guards as usual.

## Out of scope (explicit)
- Screenshots on passive reports (none — no gesture).
- Source-map symbolication of minified stacks → **known limitation**, stacks stored raw. Fast-follow candidate; note in the ticket/CHANGELOG.
- Visual pins (C), guest reviewers (D), kanban board (B), 4xx auto-ticketing.

## Rollout
Opt-in OFF by default → dogfood on a Klavity-owned project first (enable flag, watch volume) → document the per-project toggle. No behavior change for existing projects until they turn it on.
