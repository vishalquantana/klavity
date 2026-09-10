# Native mobile / device testing (emulation profiles + real-device path)

## Problem & user value

AutoSim authors and walks trails against a single Chromium context whose only
device knob today is a **viewport size** (`width`/`height`/`isMobile`/`hasTouch`/
`deviceScaleFactor`) chosen from exactly two presets — `desktop` (1280×720) and
`mobile` (390×844). See `prototype/lib/trails-viewport.ts:3` (`TRAIL_VIEWPORT_PRESETS`).

That misses the majority of real mobile bugs, which are triggered not by width but by:

- **User-Agent / client hints** — server-side device branching, "download our app"
  interstitials, UA-gated CSS, WebKit-vs-Blink layout and JS engine differences.
- **Touch/pointer semantics** — `pointer: coarse`, `hover: none` media queries,
  tap targets, momentum scroll, iOS Safari 100vh/`env(safe-area-inset)` quirks.
- **Geolocation / locale / timezone** — store selectors, currency, date formats,
  "near me" flows, GDPR banners keyed off locale.
- **Device pixel ratio** — retina asset selection, blurry-image regressions.

Because our walks always run desktop-class Chromium (local, self-hosted CDP, or
Steel remote — all Chromium), a mobile-Safari-only layout break or a UA-gated
redirect is **invisible** to the fully-autonomous QA agent. The north star is
catching (nearly) all bugs; mobile is the single largest blind spot.

**User value:** an author picks "iPhone 14 / Safari" (or runs the trail across a
device matrix) and AutoSim reproduces the real device's UA, engine, touch, DPR,
locale and geolocation — filing findings tagged with the device that broke — with
a credible path to real iOS/Android hardware for the flows emulation can't cover.

## Goals

- Device **emulation profiles** richer than viewport: named device registry
  (backed by Playwright's `devices`) carrying `userAgent`, `deviceScaleFactor`,
  `isMobile`, `hasTouch`, plus **locale**, **timezoneId**, **geolocation**,
  **permissions**, and **engine** (`chromium` | `webkit` for iOS Safari).
- Fully backward compatible with existing `viewport` presets and free-form sizes.
- Select a device from the **API, MCP, CLI, and author UI**; persist it; every
  walk records the device it ran on and findings are attributable to it.
- **Cross-device matrix**: run one AutoSim across N device profiles in a single
  scheduled/triggered run, deduping findings per device.
- A **real mobile-web** backend path via a device cloud (BrowserStack / Sauce /
  LambdaTest Playwright endpoints) behind the existing `acquireWalkBrowser` seam.

## Non-goals

- **Native app (Appium / XCUITest / Espresso) automation.** Our runner drives a
  Playwright `Page`/`Locator`/`addInitScript` DOM (`trails-runner.ts:794`,
  `PlaywrightHandle.newPage` `trails-browser-page.ts:505`). Native apps have no DOM
  and would need a parallel driver abstraction — tracked as a documented future
  spike, not built here. This capability covers **mobile _web_** end to end.
- Shipping our own physical device farm. We integrate a cloud vendor's Appium/
  Playwright real-device endpoint; we do not rack hardware.
- Client-hints header spoofing beyond what Playwright's context options expose.

## Competitor benchmark (concrete)

- **Playwright `devices` registry** (the mechanism we adopt): a keyed map of 100+
  descriptors, each `{ userAgent, viewport, deviceScaleFactor, isMobile, hasTouch,
  defaultBrowserType }` (e.g. `devices['iPhone 14']` → `defaultBrowserType:'webkit'`).
  You spread it into `browser.newContext({ ...devices['iPhone 14'] })`. Geolocation,
  locale, timezone, permissions and colorScheme are **separate context options**
  (`newContext({ geolocation:{latitude,longitude}, permissions:['geolocation'],
  locale:'de-DE', timezoneId:'Europe/Berlin' })`). Emulation is software only — same
  engine, no mobile GPU/OS — which is exactly why a real-device path is also needed.
- **QA Wolf**: AI agents map journeys and emit Playwright/Appium code; runs iOS on
  a **self-owned real iPhone/iPad farm** and Android on **GPU-accelerated emulators**,
  parallelized across hundreds of isolated containers with full artifact capture
  (video/trace/logs + exact failing line). Takeaway: emulate for breadth, use real
  devices for hardware-dependent flows; capture rich artifacts per device.
- **BrowserStack / Sauce Labs Real Device Cloud**: thousands of real devices driven
  over **Appium W3C capabilities**; both also expose **cloud Playwright endpoints**
  (connect a Playwright client to a hosted browser over a WS/CDP URL with caps in the
  query/`browserstack.` prefixed options). Key distinction they stress: *Appium is
  the protocol that drives a device; the device farm is where the device lives.* For
  mobile **web**, their Playwright endpoints let us reuse our existing
  `connectOverCDP` remote path almost verbatim.

## Current state in our codebase (file refs)

- **Viewport model** — `TrailViewport` = `{ width, height, preset?, isMobile?,
  deviceScaleFactor? }` (`prototype/lib/trails-types.ts:20`). Presets in
  `TRAIL_VIEWPORT_PRESETS` (`trails-viewport.ts:3`): only `desktop`/`mobile`.
- **Normalization/validation** — `normalizeTrailViewport(input)`
  (`trails-viewport.ts:14`) accepts a preset string or `{width,height,isMobile,
  deviceScaleFactor}`; `parseTrailViewportJson` (`:44`) reads persisted JSON.
- **Context application** — `playwrightContextOptionsForTrailViewport(viewport)`
  (`trails-browser-page.ts:813`) emits only `{ viewport, isMobile, hasTouch,
  deviceScaleFactor }`. **No** `userAgent`, `locale`, `timezoneId`, `geolocation`,
  `permissions`, or engine selection.
- **Where it's applied** — walk: `trails-runner.ts:794` passes `trail.viewport`
  into the context; `PlaywrightHandle.newPage` (`trails-browser-page.ts:505`) and
  `PuppeteerHandle.newPage` (`:638`) call the mapper.
- **Browser backends (the seam)** — `acquireWalkBrowser` (`trails-browser-page.ts:1024`,
  bounded retry) → `acquirePlaywrightBrowser` (`:938`): local `chromium.launch()`
  (`launchLocalChromium` `:747`), self-hosted CDP, or **Steel** remote via
  `acquireRemotePlaywrightBrowser` (`:1059`) / `createSteelSession` (`:708`, posts
  `/v1/sessions` with region+timeout). **All Chromium; no WebKit, no real device.**
- **Persistence** — `trails.viewport_json TEXT` (`db.ts:565`, ALTER `db.ts:1301`);
  `createTrail` (`trails.ts:41`), `updateTrail` (`trails.ts:99`, patches
  `viewport_json`), `rowToTrail` (`trails.ts:11`). `viewport_json` is free-form JSON,
  so **new emulation fields ride along without a schema migration**.
- **Author entry** — `authorTrail` (`trails-author.ts:273`) reads `req.viewport` via
  `normalizeTrailViewport` (`:338`, `:526`); `AuthorRequest.viewport` (`:104`).
- **MCP** — dispatch through `handleMcpMessage` (`lib/mcp/rpc.ts:39`) over tools in
  `lib/mcp/tools.ts`; tool `inputSchema` is where a `device` arg is added.
- **Existing tests** — `trails-browser-page.test.ts:156` asserts the exact context
  options for a mobile viewport (the contract we extend); backend matrix
  `trails-browser-page.test.ts:59-325`; retry `autosim-walk-resilience.test.ts`.

## Proposed architecture (grounded in our modules)

### 1. Device profile model (extend, don't replace, TrailViewport)

In `trails-types.ts`, extend `TrailViewport` with optional fields — persisted rows
stay valid (all additive, JSON):

```ts
export interface TrailViewport {
  width: number
  height: number
  preset?: TrailViewportPreset        // legacy "desktop" | "mobile" — keep
  isMobile?: boolean
  deviceScaleFactor?: number
  // NEW (device emulation):
  device?: string                     // registry key, e.g. "iPhone 14", "Pixel 7"
  engine?: "chromium" | "webkit"      // webkit = iOS Safari emulation
  userAgent?: string
  locale?: string                     // e.g. "de-DE"
  timezoneId?: string                 // IANA, e.g. "Europe/Berlin"
  geolocation?: { latitude: number; longitude: number; accuracy?: number }
}
```

Add `TrailViewportPreset` stays; introduce a separate device **registry** in a new
`trails-devices.ts` that re-exports a curated slice of Playwright's `devices`
(so we don't hand-maintain UA strings), e.g. `iPhone 14`, `iPhone 14 Pro Max`,
`iPhone SE`, `Pixel 7`, `Galaxy S9+`, `iPad (gen 7)` + landscape variants. Shape:
`TRAIL_DEVICE_PRESETS: Record<string, TrailViewport>` derived at module load from
`import("playwright").devices` (fallback to a hard-coded frozen copy so the module
never throws if Playwright's export shifts). `TRAIL_VIEWPORT_PRESETS` stays as the
two-name shortcut and is composed from the registry.

### 2. Normalization (extend `normalizeTrailViewport`, `trails-viewport.ts:14`)

- Accept `device: "<key>"`: look up `TRAIL_DEVICE_PRESETS[key]`; error listing valid
  keys if unknown (mirrors the current preset error). Device sets base
  width/height/UA/DPR/isMobile/engine; explicit `width`/`height` still override.
- Validate new fields: `engine ∈ {chromium,webkit}`; `locale` matches
  `^[a-z]{2}(-[A-Z]{2})?$`; `timezoneId` non-empty string (Intl validation guard);
  `geolocation.latitude ∈ [-90,90]`, `longitude ∈ [-180,180]`. Reuse `boundedInt`
  pattern. Keep the existing `deviceScaleFactor 1-4` and 200-3840 width bounds.
- `parseTrailViewportJson` needs no change (already round-trips arbitrary JSON).

### 3. Context application (`trails-browser-page.ts:813`)

Rename-with-alias: keep `playwrightContextOptionsForTrailViewport` exported (tests +
call sites at `trails-runner.ts:794`, `PlaywrightHandle.newPage` `:507`,
`PuppeteerHandle.newPage`) and have it emit the richer option set:

```ts
return {
  viewport: { width, height },
  isMobile: !!v.isMobile,
  hasTouch: !!v.isMobile,
  deviceScaleFactor: v.deviceScaleFactor ?? 1,
  ...(v.userAgent   ? { userAgent: v.userAgent } : {}),
  ...(v.locale      ? { locale: v.locale } : {}),
  ...(v.timezoneId  ? { timezoneId: v.timezoneId } : {}),
  ...(v.geolocation ? { geolocation: v.geolocation, permissions: ["geolocation"] } : {}),
}
```

**Engine selection**: `launchLocalChromium` (`:747`) is Chromium-only. Add
`launchLocalEngine(engine, opts)` that switches on `engine` to `webkit.launch()` for
iOS-Safari emulation, wired through `acquirePlaywrightBrowser` (`:938`) which reads
the requested engine from `opts.engine` (populated in `walkTrail` from
`trail.viewport?.engine`). Remote/Steel paths are Chromium-only → if a WebKit engine
is requested but the active backend can't provide it, resolve to the **cloud-device
backend** (Phase 3) or fail with an actionable `BrowserLaunchError` ("iOS Safari
emulation needs the WebKit engine or a device-cloud backend"). Local dev gets WebKit
free via `playwright install webkit`.

### 4. Per-run device attribution + matrix (`trails-runner.ts`)

- `WalkOptions` gains `deviceOverride?: TrailViewport` so a matrix run can walk a
  device other than the trail's saved default without mutating the trail.
- In `walkTrail`, resolve `const device = opts.deviceOverride ?? trail.viewport` and
  pass to both `acquireWalkBrowser({ ...opts, engine: device?.engine })` and the
  context mapper (replacing the direct `trail.viewport` at `:794`). Record the device
  label on the walk row (see data model) and include it in the RED alert context
  (`walk-red-alert.ts` `WalkRedAlertContext`) so a device-specific regression names
  its device.
- New `walkTrailMatrix(projectId, trailId, devices: TrailViewport[], opts)` that
  loops `walkTrail` per device (respecting the single global walk slot), returns a
  `WalkSummary[]`, and tags each finding with its device. Findings dedupe is
  **per-device** (a break present on all devices files once with `devices:[...]`;
  a device-specific break files separately) — extend the existing finding dedupe key
  with the device label.

### 5. Real mobile-web backend (Phase 3) — behind the existing seam

Add `acquireCloudDeviceBrowser(caps)` alongside `acquireRemotePlaywrightBrowser`
(`:1059`), selected inside `acquirePlaywrightBrowser` when
`AUTOSIM_DEVICE_CLOUD` (`browserstack` | `sauce` | `lambdatest`) is set and the
requested device is flagged `real: true`. Mechanics mirror the Steel path: build the
vendor Playwright WS endpoint from `{ device, os, engine }` caps + credentials env
(`BROWSERSTACK_USER`/`_KEY`, etc.), `chromium.connectOverCDP(wsUrl)` (vendors expose a
CDP/WS Playwright endpoint for mobile web), and return a `PlaywrightBrowserHandle`
with `close()` that releases the session and `kind: "device-cloud:<vendor>:<device>"`.
Reuses the whole downstream walk unchanged (it only needs a Playwright `Browser`).
Native-app Appium is explicitly out (see Non-goals).

## Data-model changes

- **`trails.viewport_json`** — no migration; the new device fields are additive JSON.
- **`walks` table** — add `device_json TEXT` (nullable) recording the resolved device
  for that run (label + key + engine), so the run list / replay can show a device
  badge and findings can be filtered by device. Follow the additive-column pattern in
  `db.ts` (`needCol(...) → ALTER TABLE ... ADD COLUMN`, e.g. `db.ts:1301`).
- **`findings`** — add `device_label TEXT` (nullable) so a finding names the device it
  reproduced on; include `device_label` in the dedupe key alongside the existing keys.
- **`trails`** (matrix, Phase 2) — add `device_matrix_json TEXT` (nullable): an array
  of device profiles a scheduled walk fans out over. Absent/empty = single-device
  (today's behavior).

## API / MCP / CLI surface

- **HTTP** (`server.ts` trail create/update + author endpoints): accept
  `viewport` as today **or** a new `device` field (registry key) and the optional
  `locale`/`timezoneId`/`geolocation`/`engine`; all funnel through
  `normalizeTrailViewport`. Add `GET /api/trails/devices` returning the registry
  (`{ key, label, engine, isMobile, real }[]`) so the UI and agents can enumerate.
- **MCP** (`lib/mcp/tools.ts`): extend the author/create-trail tool `inputSchema`
  with `device` (enum from the registry) + `locale`/`timezone`/`geolocation`; add a
  `list_devices` tool. Descriptions steer the AI agent to pick a device by name.
- **CLI**: the trail author/run scripts gain `--device "iPhone 14"` /
  `--devices "iPhone 14,Pixel 7"` (matrix) / `--locale` / `--timezone` / `--geo
  lat,lng`, mapped onto the same normalizer.

## UX / reporting

- **Author form**: replace the two-item viewport toggle with a device picker
  (grouped: Desktop / iOS / Android / Custom size) sourced from
  `GET /api/trails/devices`; advanced disclosure for locale/timezone/geolocation.
  Follow the white-card-on-beige + button micro-animation house rules.
- **Run views / replay**: show a device badge (e.g. "iPhone 14 · Safari · de-DE")
  from `walks.device_json`; matrix runs render a per-device pass/fail strip.
- **Findings**: badge the device that reproduced the break; matrix findings list the
  affected devices. RED alerts (`walk-red-alert.ts`) include the device in the
  subject/body so a Safari-only regression is unambiguous.

## Acceptance criteria

1. `normalizeTrailViewport({ device: "iPhone 14" })` returns a profile with the
   registry's UA, DPR, `isMobile:true`, `engine:"webkit"`; unknown device key throws
   an error listing valid keys.
2. `playwrightContextOptionsForTrailViewport` emits `userAgent`, `locale`,
   `timezoneId`, and `geolocation`+`permissions:["geolocation"]` when present, and is
   unchanged (byte-for-byte) for a plain viewport with none set — the existing
   `trails-browser-page.test.ts:156` assertion still passes.
3. A walk of a trail with `engine:"webkit"` launches WebKit locally (when installed)
   and the served page sees an iOS Safari UA; the walk row's `device_json` records it.
4. A matrix walk over `["iPhone 14","Pixel 7","desktop"]` produces one run per device,
   each finding tagged with its device, with per-device (not collapsed) dedupe.
5. `device` is settable and round-trips through HTTP, MCP, CLI, and the author UI; a
   run view shows the device badge.
6. With `AUTOSIM_DEVICE_CLOUD` unset, behavior is byte-for-byte today's (default local
   Chromium); the cloud path is only reached when explicitly configured.

## Test plan

- **Unit** (`trails-viewport`): device key resolution, override precedence
  (explicit width beats device), field validation (bad locale/timezone/geo/engine
  rejected), backward-compat for the two legacy presets.
- **Unit** (`trails-browser-page.test.ts`): extend to assert the enriched context
  options for a device profile **and** keep the existing plain-viewport assertion
  (regression guard on the contract).
- **Engine**: hermetic test that `acquirePlaywrightBrowser({ engine:"webkit" })`
  calls the WebKit launcher (inject a fake `webkit.launch`), mirroring the existing
  Chromium backend tests (`trails-browser-page.test.ts:59-325`).
- **Integration (real browser, Bun)**: per the "real-browser features need a REAL Bun
  integration test" lesson, a gated test that actually launches WebKit and asserts the
  page observes a mobile-Safari UA + `pointer: coarse` — not a fake-injected mock.
- **Matrix**: `walkTrailMatrix` over 2 fake devices runs the walker twice and returns
  2 summaries with device-tagged findings (inject a fake `walkTrail`).
- **Negative control**: a page that renders **correctly on desktop but broken only on
  iOS Safari / touch** (e.g. a control hidden behind `@media (hover:hover)` or a
  `100vh` overflow) must produce a RED finding on the `iPhone 14` (webkit) walk and a
  GREEN on `desktop` — proving the device profile, not the width, is what catches it.
  The control must fail (stay GREEN on iOS) if the engine/UA wiring is reverted.
- **Cloud backend**: hermetic test with mocked `connectOverCDP` + fetch asserting the
  vendor WS endpoint/caps are built correctly and the session is released on `close()`
  (mirrors `createSteelSession` tests `trails-browser-page.test.ts:385`). No live
  vendor call in CI.

## Phasing (what ships first)

- **Phase 1 (foundation)**: device profile model + registry + normalizer + enriched
  context options + WebKit engine + local wiring in `walkTrail`; API/MCP/CLI/UI to
  select a device; per-run `device_json` + finding device attribution. This alone
  closes the iOS-Safari / UA / touch / geo blind spot with zero new infra.
- **Phase 2 (mid)**: cross-device matrix (`walkTrailMatrix`, `device_matrix_json`,
  scheduled fan-out, per-device dedupe + matrix reporting strip).
- **Phase 3 (advanced)**: real mobile-web device-cloud backend behind the
  `acquireWalkBrowser` seam (BrowserStack/Sauce/LambdaTest Playwright endpoints);
  native-app Appium remains a documented future spike.

## Effort estimate

- Phase 1: **L** (~1 focused ctx: types + registry + normalizer + context options +
  WebKit backend + tests). Surface wiring (API/MCP/CLI/UI + attribution): **M**.
- Phase 2 matrix: **M**.
- Phase 3 cloud backend: **M–L** (mostly a Steel-shaped clone + vendor auth/caps +
  hermetic tests; risk is real-endpoint quirks).

## Risks & open questions

- **WebKit under Bun**: the over-hardening lesson — `webkit.launch()` must be
  validated in a real Bun integration test; a hermetic mock could hide a Bun-specific
  connect failure. Requires `playwright install webkit` on the prod box (adds image
  size); gate WebKit walks behind capability detection with an actionable error.
- **Steel/remote is Chromium-only**: iOS-Safari emulation can't run on the current
  remote box; either run WebKit walks locally, or require Phase 3's cloud backend.
  Need a clear resolution order (requested engine → available backend → error).
- **Client hints**: emulated UA doesn't set full `Sec-CH-UA-*` headers; sites relying
  on client hints may still branch as desktop. Document as an emulation limitation and
  a reason to reach for the real-device path.
- **Cost/COGS**: device-cloud minutes and matrix fan-out multiply walk cost; must feed
  the existing AI/compute COGS ledger and be plan-gated (matrix + real devices are
  paid-tier). Open: per-device metering unit.
- **Registry drift**: pinning to Playwright's `devices` export risks key/UA changes
  across upgrades — keep a frozen fallback copy and a test that the curated keys exist.

## Dependencies on other capabilities

- Plan-gating / entitlement engine (matrix + real-device are metered, paid-tier) —
  reuse `projectEntitlement()` gating on the execution engines.
- COGS/metering ledger for per-device and cloud-minute cost.
- Scheduler (Phase 2 matrix fan-out rides the existing cron/scheduled-walk path).
- Findings dedupe/attribution pipeline (device label added to the dedupe key).
