# Screen-recording feasibility spike (KLAVITYKLA-426)

Feature target: from inside the Snap widget, record the user's **screen + camera
(picture-in-picture) + mic narration**, submit it with a bug report, then generate
a **transcript** stored alongside the screenshots.

- #438 "Record me" (the in-widget recorder)
- #435 video attachment (upload + store the recording with a report)
- #426 (this) feasibility SPIKE

This is a spike. It produced a **contained, standalone prototype** and this report.
Nothing here is wired into the shipped widget bundle
(`packages/sdk/dist/klavity-widget.iife.js`) or the shared composer
(`packages/core/src/modal.ts`), by design.

Prototype: [`docs/spikes/recording/record-poc.html`](./recording/record-poc.html)
Open it with `open docs/spikes/recording/record-poc.html` (or double-click).
`file://` is a secure context, so `getDisplayMedia` works with no server. Use
Chrome or Edge for the full path; it degrades gracefully elsewhere.

---

## Verdict: GREEN for record+upload (Phase 1), YELLOW for the customer-site camera/mic path

The core capability is a solved, well-supported browser primitive and it reuses
machinery we already ship. Two things pull it down from unconditional green:

1. **Customer-site `Permissions-Policy`** can block camera/mic (and, less commonly,
   display-capture) on the embedding page — the widget is a third party there. This
   is the single biggest risk and it is outside our control. Mitigation exists
   (screen-only fallback, or drive the recorder from our extension where policy is
   ours). See "Permissions / CSP".
2. **Transcription does not exist today** and cannot be added via our existing LLM
   plumbing — OpenRouter is chat-completions only. It needs a *new* direct call to
   OpenAI's audio-transcriptions endpoint (or equivalent). Straightforward, but net-new.

Recommendation: ship Phase 1 (record screen + optional camera/mic PiP, upload,
store) behind a per-project flag with a robust screen-only fallback; add Phase 2
(transcript) as an async job. Details and effort at the end.

---

## 1. What already exists (grounding)

- **Screen capture via `getDisplayMedia`** is already in production for the "Sharp"
  full-page screenshot. `packages/sdk/src/widget.ts` (`captureSharpFullPage`, ~L338)
  requests `getDisplayMedia({ video:{frameRate:30}, audio:false, preferCurrentTab:true })`,
  drives a hidden `<video>`, and scroll-stitches frames onto a `<canvas>`
  (geometry in `packages/sdk/src/sharp-capture.ts`). Feature-detected via
  `sharpCaptureSupported()` (absent on iOS Safari). The recorder reuses exactly this
  pattern: `getDisplayMedia` first (to preserve the click gesture), a `<video>`, a
  `<canvas>`. The new part is `canvas.captureStream()` + `MediaRecorder` instead of a
  one-shot `toDataURL`.
- **S3 upload exists.** `prototype/lib/s3.ts` has `uploadScreenshotMeta` and
  `uploadAttachment` (Bun `S3Client`, private ACL, `presignGet` for time-limited GETs,
  `deleteObject` for the retention/GDPR sweep). A `.webm` is just another private object
  under the `attachments/` prefix.
- **Multipart intake exists.** `prototype/server.ts` (~L3667) already accepts
  `form.getAll("screenshots")` files, checks `SCREENSHOTS.maxBytes` (8MB/file default,
  5 files/report) and an `image/` MIME prefix, uploads each, and records a
  `screenshots` ledger row. A video attach reuses this route almost verbatim (widen
  the MIME allowlist to `video/webm`, raise the per-file cap for video).
- **Transcript storage exists** (for the *Sims* text pipeline, not audio). A
  `transcripts` table (`raw_text`, `speakers_json`, `source_date`, ...) plus a
  `pending_transcripts` stash and per-line `src_quote_ts` timestamps (the multi-transcript
  enrichment work). A recording's `transcript_json` mirrors this shape.
- **LLM calls route through OpenRouter** — `prototype/lib/label-suggest.ts` posts to
  `https://openrouter.ai/api/v1/chat/completions` with models like `openai/gpt-4o-mini`,
  logging cost to the `ai_calls` ledger via `recordAiCall`.

### The transcription gap (confirmed)

Grepping `whisper | audio/transcriptions | speech-to-text` across the repo returns
**zero** server code — the only hits are this spike, docs, and the shipped bundles.
The existing "transcript pipeline" is *text-transcript -> Sim trait extraction*, not
audio -> text. So audio transcription is genuinely net-new. Critically, **OpenRouter
proxies chat/completions only — it has no audio-transcriptions route**, so we cannot
reuse the existing client. Phase 2 needs a direct call to a speech-to-text provider.

---

## 2. Browser support

| Capability | Chrome/Edge | Firefox | Safari (desktop) | iOS Safari |
| --- | --- | --- | --- | --- |
| `getDisplayMedia` (screen) | Yes | Yes | Yes (13+) | **No** |
| `getUserMedia` (cam/mic) | Yes | Yes | Yes | Yes |
| `canvas.captureStream()` | Yes | Yes | Yes | Yes |
| `MediaRecorder` | Yes | Yes | Yes (14.1+) | Yes (14.5+) |
| VP9/Opus in WebM | Yes | Yes | **No** (emits H.264/MP4) | **No** |
| `MediaRecorder.pause()/resume()` | Yes | Yes | Yes | Yes |
| `preferCurrentTab` picker hint | Yes | No (ignored) | No (ignored) | n/a |

Takeaways:

- **iOS Safari has no `getDisplayMedia`** — same limitation the Sharp screenshot
  already lives with. On iOS the recorder button is simply hidden; screenshots remain.
- **Codec is not universal.** VP9/Opus WebM is the Chrome/Edge/Firefox target. Safari
  will not produce WebM; it emits `video/mp4` (H.264/AAC). The recorder must
  **feature-pick the mimeType** (`MediaRecorder.isTypeSupported`) rather than hardcode
  vp9. The prototype does this (`CANDIDATES` list -> `pickMime()`) and shows a live
  support table for the running browser. Storage/serving must therefore accept both
  `.webm` and `.mp4`, and any transcription step must accept whatever container came out.
- Practically: **target Chrome/Edge/Firefox for launch; screen-only or screenshot
  fallback everywhere else.** This matches the existing Sharp-capture support envelope,
  so we are not narrowing the widget's reach.

---

## 3. Compositing approach (PiP)

Two viable ways to combine screen + camera + mic into one recording:

**A. Canvas mux (chosen in the prototype).** Draw the screen `<video>` full-frame and
the camera `<video>` as a bottom-right inset onto a single `<canvas>` every animation
frame; `canvas.captureStream(fps)` yields one video track; add the mic `AudioTrack`;
feed the combined `MediaStream` to one `MediaRecorder`. Result: **one webm/mp4 file**
with the PiP baked in and audio muxed.
- Pros: single file, single upload, single transcription source, plays anywhere, PiP
  layout fully under our control, degrades cleanly to screen-only if the camera is
  blocked (just stop drawing the inset).
- Cons: continuous canvas redraw costs CPU/GPU (mitigate by capping canvas at ~1280px
  wide and fps at ~24 — the prototype does both); the camera is flattened into the
  video (cannot be repositioned after the fact).

**B. Separate tracks / separate recorders.** Record screen and camera to separate
blobs (or add both video tracks to one stream). Rejected: `MediaRecorder` reliably
encodes only **one** video track; multiple video tracks are not portably muxed, and
two files means two uploads, client-side re-composition, and an ambiguous transcription
input. Canvas mux is simpler and more robust.

The prototype implements A: `drawFrame()` letterboxes the screen and overlays a 22%-width
camera PiP with a border and a red REC dot; a native "stop sharing" from the browser bar
ends the recording cleanly.

---

## 4. Permissions / CSP constraints (the crux)

The widget runs **on the customer's page**, so the customer's site — not Klavity —
controls the permission surface. Three distinct gates:

1. **`Permissions-Policy` (formerly Feature-Policy) HTTP header / iframe `allow`.**
   The embedding site can disable `camera`, `microphone`, and `display-capture` for
   the whole document or for specific origins. If the customer sends
   `Permissions-Policy: camera=(), microphone=()`, our `getUserMedia` call **rejects
   with a `NotAllowedError`** and there is nothing the widget can do about it — it is
   the page owner's policy. `display-capture` is more often left open (fewer sites set
   it) but can equally be blocked.
   - The widget currently injects as a **script on the page** (not a cross-origin
     iframe), so it inherits the top document's policy directly. If we ever move the
     recorder UI into an iframe, that iframe needs an explicit
     `allow="camera; microphone; display-capture"` attribute *and* the parent policy
     must permit it — an iframe cannot exceed the parent's grant.
   - **Mitigation:** feature-detect + attempt, and on rejection **fall back to
     screen-only** (still very useful for a bug repro) with a one-line hint to the user
     ("your site blocks camera/mic for embedded tools"). The prototype already does this:
     camera/mic failure is caught, logged as a possible Permissions-Policy block, and the
     recording continues screen-only.

2. **The browser's own user-gesture + permission prompts.** `getDisplayMedia` must be
   called from a user gesture (same constraint the Sharp path already respects — call it
   first, synchronously off the click) and always shows the OS/browser picker; camera/mic
   show their own prompt on first use. These are non-negotiable and fine — they are the
   privacy contract. No autoplay/silent capture is possible, which is correct.

3. **Klavity's own CSP** (`prototype/server.ts` ~L2110) already allows `media-src blob:
   data:`, `worker-src blob:`, and `img-src blob:`. That CSP governs *our* pages
   (dashboard/marketing) and is fine for previewing a recording. It does **not** govern
   the customer page — again, the customer's CSP/Permissions-Policy is what matters at
   capture time. No CSP change is needed on our side for Phase 1 upload.

**How the extension differs.** A browser extension with the `tabCapture`/`desktopCapture`
(or `activeTab` + `getDisplayMedia`) permission and its own content-script context is
**not subject to the host page's `Permissions-Policy`** in the same way — extension-origin
capture is governed by the extension's declared permissions, not the visited site's
headers. So the extension is the reliable path when a customer site clamps down camera/mic.
Standing rule is ext/widget parity (share `buildModal`); the recorder should live in the
shared composer with two capture backends — page `getUserMedia`/`getDisplayMedia` for the
widget, and the extension's capture APIs when running inside the extension — so a
locked-down customer site still gets full record via the extension.

---

## 5. Encoding, size and caps

Measured/expected with the prototype defaults (1280px-wide canvas, 24fps, VP9 video
~2.5 Mbps, Opus audio 128 kbps):

- **~60s recording ~= 18-22 MB** for a fairly static screen (VP9 is content-adaptive;
  a mostly-still bug-repro screen compresses well; heavy motion/scrolling pushes toward
  the 2.5 Mbps ceiling, i.e. ~19 MB/min). Open the prototype and read the "Extrapolated
  / 60s" figure for the exact number on your machine/content — it reports real bytes.
- Levers: `videoBitsPerSecond` (drop to 1-1.5 Mbps for ~8-11 MB/min with acceptable
  legibility), fps (24 -> 15 saves meaningfully), and canvas width.
- **Length cap** is enforced client-side (prototype: default 60s, auto-stop) — keeps
  blobs bounded and cheap to transcribe. Recommend a **90-120s default cap** with the
  bitrate tuned so a max-length recording stays under the upload cap.
- **Upload cap.** The existing screenshot path caps at 8MB/file (`SCREENSHOT_MAX_BYTES`).
  Video needs a **separate, higher cap** (e.g. `RECORDING_MAX_BYTES` ~= 50MB) — a new env
  knob mirroring `screenshot-config.ts`. Given ~19 MB/min, a 120s cap fits comfortably
  under 50MB. For anything larger later, switch to a presigned **multipart/direct-to-S3
  PUT** so the recording never transits the app server; Phase 1 can stay single-POST.

---

## 6. Upload path

Phase 1 reuses the existing multipart intake with minimal change:

- Client: `MediaRecorder` -> `Blob` -> append to the same `FormData` the widget already
  builds for screenshots, as a `recording` field.
- Server (`prototype/server.ts` feedback route): accept the `recording` file, validate a
  `video/webm`/`video/mp4` MIME and the new `RECORDING_MAX_BYTES` cap, call
  `s3.ts uploadAttachment(bytes, 'report.webm', mime)` (already stores **private** under
  `attachments/`), and record a ledger row (new `recordings` table, or a `kind` column on
  `screenshots`) with `{ key, bucket, contentType, durationMs, hasAudio }`.
- Serve back via the existing membership-checked, `presignGet`-signed pattern (the same
  `/api/screenshots/:id` model) — no public bucket exposure, consistent with CASA/PII.
- Retention/GDPR: the recording key drops into the same `deleteObject` sweep as screenshots.

No new storage infra, no CSP change, no new auth.

---

## 7. Transcription (Phase 2)

**Options & rough economics** (per minute of audio):

| Option | Endpoint | Rough cost | Latency | Notes |
| --- | --- | --- | --- | --- |
| OpenAI `whisper-1` | `POST api.openai.com/v1/audio/transcriptions` | ~$0.006/min | a few sec for ~1min clip | Battle-tested, returns text or verbose_json with per-segment timestamps. |
| OpenAI `gpt-4o-transcribe` / `gpt-4o-mini-transcribe` | same audio endpoint | ~$0.006/min (mini ~$0.003) | similar/faster | Higher accuracy; mini is cheapest. |
| Deepgram / AssemblyAI | vendor REST | ~$0.004-0.007/min | fast, streaming available | Alternative if we want diarization/streaming later. |

**Key architectural note: OpenRouter cannot do this.** Our existing LLM client
(`label-suggest.ts` -> `openrouter.ai/api/v1/chat/completions`) is chat-only. Audio
transcription requires a **new, direct** call to `api.openai.com/v1/audio/transcriptions`
(multipart file upload), with a new `OPENAI_API_KEY` server env (we may already have an
OpenAI key for embeddings; verify) and a new `recordAiCall` entry type (e.g.
`type='transcribe'`) so cost lands in the `ai_calls` ledger like every other call.

**Sync vs async: async.** Even a 60-120s clip is a few seconds of provider latency plus
the S3 fetch — do not block the report submission. Flow:

1. Report submits, recording uploads to S3, `recordings` row created with
   `transcript_status='pending'`. Report returns immediately (aha stays fast).
2. A **fire-and-forget job** (same pattern as `draftTitleForFeedback`, which is already
   fire-and-forget post-intake) pulls the audio (either the whole webm — the API accepts
   webm/mp4 — or an extracted audio track), POSTs to the transcription endpoint requesting
   `verbose_json` (segment timestamps), and writes the result.
3. Store as **`transcript_json`** mirroring the Sims transcript shape: `raw_text` +
   per-segment `{ text, start, end }` (the `src_quote_ts` convention already used for
   "@ 12:45" citations). Stash it on the `recordings`/`screenshots` ledger row (or a new
   `recording_transcripts` row keyed by recording id), alongside the screenshots — exactly
   the "stored alongside screenshots" requirement. Set `transcript_status='ready'`; the
   dashboard/report drawer shows the transcript when present, "transcribing..." when pending.

Cost is negligible (~$0.006 per 1-min report); the ledger + daily cap (`OPS_DAILY_CAP_USD`)
already exists to keep it bounded.

---

## 8. Phased recommendation

| Phase | Ticket | Scope | Effort | Main risk |
| --- | --- | --- | --- | --- |
| **0 — Spike (this)** | #426 | POC + this report | done | none |
| **1 — Record + upload + store** | #435 | Recorder in the shared composer (screen + optional camera PiP + mic via canvas mux, feature-picked mime, pause/stop, length cap); screen-only fallback when cam/mic blocked; new `recording` multipart field + `RECORDING_MAX_BYTES`; `s3.ts uploadAttachment`; `recordings` ledger + private presigned serving; retention/GDPR hook. iOS/no-`getDisplayMedia` -> button hidden. | **~3-5 days** | **Customer-site `Permissions-Policy` blocking camera/mic.** Mitigate with screen-only fallback (already in POC) and the extension capture backend for locked-down sites. Secondary: codec variance (Safari mp4) and CPU of canvas mux on low-end machines. |
| **2 — Transcript** | #438 | New direct OpenAI `audio/transcriptions` client (async, fire-and-forget), `ai_calls` logging, `transcript_json` (segments + timestamps) stored alongside screenshots, `transcript_status` state + dashboard display. | **~2-3 days** | New provider dependency + key management; async job reliability (retry on failure); no OpenRouter reuse so it is genuinely net-new code. Cost is a non-issue (~$0.006/min). |

Sequencing note: Phase 1 delivers standalone value (a video attached to a bug report is
already a big JTBD win — "I told you multiple times" -> here is the exact repro). Phase 2
layers transcription on top without touching the capture/upload path. Build them in order;
do not gate Phase 1 on Phase 2.

---

## Appendix: how to run the prototype

```
open docs/spikes/recording/record-poc.html      # macOS; or double-click the file
```

- Use **Chrome or Edge** for the full vp9/webm path (Firefox works; Safari emits mp4;
  iOS Safari cannot screen-capture and the tool says so).
- Click **Start recording**, pick a screen/window/tab, allow camera+mic. Watch the live
  PiP composite, stats (elapsed, chunks, blob size, kbps), and the codec-support table.
- It auto-stops at the length cap (default 60s) or on **Stop**; then preview + download
  the blob and read the **Extrapolated / 60s** size.
- To test the customer-site block: toggle off "Microphone"/"Camera", or open it from a
  page whose `Permissions-Policy` denies them — the tool logs the block and records
  screen-only, demonstrating the Phase 1 fallback.
