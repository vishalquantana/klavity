# Klavity Flutter SDK (`klavity_flutter`) — Design Spec

**Date:** 2026-08-30
**Status:** Approved design → ready for implementation plan
**Origin:** A client asked whether Klavity's widget + reporting can run inside a Flutter app.

## 1. Goal & scope

Deliver Klavity's in-app bug/feedback reporting **natively inside Flutter mobile apps
(iOS + Android)** as a standalone, public **pub.dev** package `klavity_flutter`.

The package captures a screenshot + diagnostic evidence and files a report to the
**existing** Klavity backend (`POST /api/feedback`), so every downstream capability —
triage, Sims, connector auto-copy (Jira/Linear/GitHub/Plane), the dashboard — works
unchanged. **No backend rewrite**; one additive backend change is required (mobile
submit auth/anti-abuse, §7).

**Non-goals for v1:** session replay (deferred — no clean Flutter equivalent, see §8),
Flutter Web (the existing JS widget already targets web), desktop.

## 2. Success criteria

1. A Flutter app adds Klavity in ~2 lines and gets: shake-to-report → screenshot +
   captured errors/logs → describe → submit → the report appears in the Klavity
   dashboard/triage exactly like a web report.
2. Capture NEVER crashes or visibly degrades the host app (all hooks guarded).
3. Reports survive flaky mobile networks (offline queue + retry; failures are
   user-visible and retryable, never silently dropped — JTBD "no lost reports").
4. Payload is wire-compatible with the web SDK's `/api/feedback` multipart shape, so
   the server needs no report-shape changes.
5. Published to pub.dev with docs + an example app.

## 3. Architecture

Layered package; each layer is independently testable and communicates via narrow
interfaces.

### 3.1 `Klavity` facade (public API)
```dart
Klavity.run(                       // preferred: wraps the app so capture is automatic
  () => runApp(const MyApp()),
  projectId: 'proj_...',
  backendUrl: 'https://klavity.in',
  publishableKey: 'pk_...',        // §7 mobile auth
  triggers: const [Trigger.shake, Trigger.screenshot],
);

// Alternatives / imperative surface:
Klavity.init(...);                 // for apps that can't change main()
Klavity.identify(KlavityUser(email: ..., name: ..., id: ...));
Klavity.setMetadata({'plan': 'pro'});
Klavity.report({KlavityReportType type = KlavityReportType.bug});  // any trigger calls this
```
`Klavity.run` installs `runZonedGuarded` + `FlutterError.onError`, mounts the overlay,
and wires the configured triggers. `KlavityWrapper` widget is provided for apps that
prefer a widget over changing `main()`.

### 3.2 Capture layer
- **`ScreenshotCapturer`** — captures the current frame via a `RepaintBoundary` placed
  at the app root (or the `screenshot`/`native_screenshot` package as a fallback).
  Higher fidelity than web: Flutter paints its own canvas, so there are NO cross-origin
  CSS/font gaps (the exact class of bug that plagues the web capture). Masks nothing by
  default; a `Klavity.mask(widgetKey)` opt-in redacts sensitive widgets before capture.
- **`ErrorCapturer`** — `runZonedGuarded` (uncaught async) + `FlutterError.onError`
  (framework) → bounded ring buffer of recent errors (message + stack, capped count/size).
- **`LogCapturer`** — wraps `debugPrint` (and optionally a provided logger) → bounded
  ring buffer. DEFAULT captures recent logs; attaches with the report (mirrors the web
  console-attach, which now defaults on — align the default, allow opt-out).
- **`NetworkCapturer`** — a Dio `Interceptor` + a thin `http` client wrapper → bounded
  ring buffer of failed/slow requests (method, url, status, duration; bodies redacted).
  Opt-in per client the app registers.
- **`ClientInfo`** — `device_info_plus` + `package_info_plus` + `MediaQuery`/`Window`:
  OS/version, device model, app version/build, locale, viewport, DPR, orientation.
  Maps onto the server's existing `client_info` fields.

All buffers are size- and count-bounded and cheap; capture hooks are wrapped so any
failure is swallowed (never propagates to the host app).

### 3.3 Trigger layer (all → `Klavity.report()`)
- **`ShakeDetector`** — `sensors_plus` accelerometer, debounced threshold. Default on.
- **`FabOverlay`** — a draggable floating button via an `OverlayEntry`. Opt-in.
- **`ScreenshotDetector`** — OS-screenshot event (`screen_capture_event` pkg / platform
  channel) → offer to file it. Opt-in.
- **Developer-invoked** — `Klavity.report()` is always available for the app's own
  "Report a bug" button.

### 3.4 UI layer — `KlavityReporter`
A native composer sheet (modal bottom sheet / dialog), themable from project config:
- Bug/Feature type toggle, multiline description ("no title needed — auto-generated").
- Screenshot thumbnail + **annotate** (`CustomPainter`: pen/arrow/rect/text, colors,
  stroke width) — parity with the web annotator.
- Attach files (image/pdf/log), optional.
- Submit → upload progress → "Report sent · <ref> · Open in Klavity" confirmation
  (mirrors the web upload pill / sent toast).

### 3.5 Transport — `FeedbackClient`
Builds the **identical** multipart payload the web SDK posts and sends it to
`POST {backendUrl}/api/feedback`:
`screenshots[]` (PNG bytes), `description`, `type`, `title?`, `page_url` (current route
name / deep link), `client_info` (JSON), `context` (console/network buffers JSON),
`reporter_*` (from `identify`), `project_id`, `publishableKey` (§7). Includes an
**offline queue**: reports persist to disk (path_provider) and retry with backoff until
delivered; the UI reflects queued/sent/failed state.

### 3.6 Config
On init, fetch `GET /api/projects/:id/config` (same endpoint the web widget uses) for
theme (colors/labels) and `reportGate`. Non-blocking, cached, best-effort.

## 4. Data flow

```
trigger (shake/FAB/screenshot/API)
  → ScreenshotCapturer.capture()  +  snapshot(error/log/network buffers)  +  ClientInfo
  → KlavityReporter sheet (prefilled with the shot)
  → user annotates / describes / picks type
  → FeedbackClient.submit(payload)         ── multipart ──▶  POST /api/feedback
       (offline? enqueue + retry)                            (SAME server pipeline:
  → "Report sent" confirmation                                triage / Sims / connectors)
```

## 5. Error handling & resilience
- Every capture hook is guarded; a capture failure degrades gracefully (e.g. screenshot
  fails → text-only report still allowed).
- Submit failures are **non-silent**: surfaced with a retry affordance; the offline queue
  persists the report so it is never lost (aligns with the "no lost reports" north star).
- The SDK never throws into the host app's zone; all public calls are safe no-ops when
  uninitialised.

## 6. Testing strategy
- **Unit (Dart):** ring buffers (bounds/eviction), payload builder (wire-compat with the
  web multipart shape — assert field names/shape), offline queue (persist/retry/backoff),
  ClientInfo mapping.
- **Widget:** composer (type toggle, description, submit states), annotator, trigger
  wiring; a **golden test** for the composer.
- **Integration:** submit against a mock `/api/feedback` asserting the exact multipart
  fields; a real end-to-end against a staging Klavity backend from the example app.
- Capture-never-crashes: fault-injection tests (throwing logger/interceptor/screenshot)
  assert the host app is unaffected.

## 7. Backend implication — mobile submit auth/anti-abuse (the one additive change)

The web anonymous `/api/feedback` path leans on the browser `Origin` header + optional
Turnstile for anti-abuse. Mobile has neither. Proposal:
- Introduce a **per-project publishable key** (`pk_...`, safe to ship in an app binary —
  it only authorizes *filing* reports to that project, like a write-only client token).
- Server: accept `publishableKey` on `/api/feedback` as an alternative to the
  Origin/Turnstile gate; enforce a **per-key + per-IP rate limit**; honor the project's
  existing `reportGate` (anonymous/email/login).
- No new PII; the key is revocable/rotatable per project in settings.

This is the ONLY backend change v1 requires and should be its own small spec/PR
(`feat/mobile-publishable-key`) sequenced before the SDK's submit path is finalized.

## 8. Deferred (post-v1)
- **Session replay** — rrweb records DOM mutations; Flutter has no DOM. Approach when
  needed: a periodic **screenshot "flipbook"** (bounded ring of frames at 1–2 fps) +
  a Flutter scrub player, OR native platform screen-recording. Its own design spike.
- Voice input + AI-enhance (reuse the same server endpoints).
- Region/element capture; richer masking.

## 9. Phasing
- **P1 MVP (~1–2 wk) → pub.dev 0.1:** `Klavity.run/init`, shake trigger, native
  screenshot, error + log capture, description composer, multipart submit, offline queue,
  example app. (Depends on §7 publishable-key backend change.)
- **P2 (~2–3 wk):** FAB + screenshot-detect triggers, annotation, network capture, file
  attach, `identify()`, config/theme, "Report sent" confirmation, full client_info
  parity in the dashboard.
- **P3:** voice + AI-enhance, replay-as-frames, region/element capture.

## 10. Distribution
Standalone **public GitHub repo** published to **pub.dev** (`klavity_flutter`), with
README (2-line quickstart), API docs, and an `example/` app. Versioned independently of
the backend; documents the minimum backend version it targets.

## 11. Open items for the implementation plan
1. Finalize §7 publishable-key backend change (separate PR, sequenced first).
2. Confirm the exact web `/api/feedback` multipart field list to mirror (extract from
   `packages/sdk/src/widget.ts` submit path + `packages/core/src/submit.ts`).
3. Pick the screenshot package vs. hand-rolled RepaintBoundary (spike in P1).
4. iOS/Android permission surfaces (accelerometer, screenshot-detection).
