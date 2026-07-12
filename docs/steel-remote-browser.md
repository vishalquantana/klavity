# Steel remote-browser seam (AUTOSIM_CDP_URL)

AutoSim browser work — both the **authoring drive** (`trails-author`) and the **walk engine**
(`trails-runner`) — can be routed to a remote Chromium via two env vars.  Setting them moves the
heavyweight Chromium process off the 1 GB prod box without any code change.

## Env vars

| Variable | Required? | Description |
|---|---|---|
| `AUTOSIM_CDP_URL` | gate | CDP WebSocket base URL (e.g. `wss://connect.steel.dev`). When set, ALL AutoSim browser work routes remote. When absent, local `chromium.launch()` is used (current prod default). |
| `STEEL_API_KEY` | optional | If set alongside `AUTOSIM_CDP_URL`, a [Steel.dev](https://steel.dev) session is created on every run and released on close. |
| `STEEL_API_URL` | optional | Steel REST API base (default `https://api.steel.dev`). Override for self-hosted Steel. |
| `STEEL_REGION` | optional | Steel session region: `lax` (Los Angeles) or `iad` (Washington DC). **Recommended: `iad`** (US-east, closest to the Vultr prod box → lowest CDP RTT). Unset → Steel's default region. |
| `STEEL_CONNECT_TIMEOUT_MS` | optional | CDP connect timeout in ms (default `20000`). Bounds the Playwright attach so an unreachable endpoint fails fast with a `BrowserLaunchError` instead of hanging. |
| `AUTOSIM_CDP_NO_FALLBACK` | optional | Walk engine only. When `1`, a dead remote endpoint FAILS HARD (RED crash) instead of falling back to a local browser. Default (unset) → **fall back to local** so a dead Steel session never becomes a missed scheduled/CI guard (KLAVITYKLA-278). |

## Authoring drive (`acquireBrowser` → Puppeteer-over-CDP)

`prototype/lib/trails-browser-page.ts` → `acquireBrowser()` is used by `trails-author` and
`sim-preview`.  It connects via **Puppeteer-core** because the 2026-07-04 spike found that
Playwright's `connectOverCDP` hung over transcontinental latency to Steel.  The Puppeteer
`PuppeteerPage` adapter re-adds Playwright-style actionability (waitForSelector visible).

## Walk engine (`acquirePlaywrightBrowser` → puppeteer-bridge → Playwright)

`prototype/lib/trails-runner.ts` uses `acquirePlaywrightBrowser()` (same file) which returns a
native **Playwright `Browser`** so the runner's full Playwright API surface is preserved
(BrowserContext, Page.setDefaultTimeout, Locator, rrweb addInitScript, etc.).

**KLAVITYKLA-195 / 278 fix.** Playwright's `chromium.connectOverCDP()` **HANGS** against Steel's
connect proxy — the WebSocket opens but Playwright's CDP target-discovery never completes, so it
times out ("Timeout 30000ms exceeded"). This is a known Playwright bug (the raw CDP WS works;
Playwright's discovery layer is what stalls), and it hit prod even from the co-located box.

The Steel path now **bridges through puppeteer-core** (whose raw-CDP `puppeteer.connect()` works
against Steel, per the 2026-07-04 spike):

1. `createSteelSession()` POSTs `/v1/sessions` (with `STEEL_REGION`) and uses the response's
   region-correct **`websocketUrl`** (falling back to `${cdpBase}?apiKey=&sessionId=` only if the
   API omits it).
2. `puppeteer.connect()` attaches to that session (works where Playwright hangs) and yields the
   resolved per-browser endpoint `ws://…/devtools/browser/<id>`.
3. Playwright `connectOverCDP(resolvedWs)` attaches to that **already-resolved** endpoint — which
   skips Playwright's broken discovery step — then puppeteer disconnects, leaving Playwright the
   sole owner of the remote browser. All connects are bounded by `STEEL_CONNECT_TIMEOUT_MS`.

The authoring drive (`acquireBrowser` → puppeteer only) was already correct and now shares the same
`createSteelSession()` (websocketUrl + region) helper.

### Health check + local fallback (KLAVITYKLA-278)

The walk engine is the recurring-volume path (scheduled trails + CI-triggered walks all go through
`walkTrail` → `acquirePlaywrightBrowser`). A dead Steel session or an unreachable remote endpoint must
**not** turn a guard into a silent RED "crash" with an empty report. So `acquirePlaywrightBrowser`
now treats the remote connect as a **health check**: if `acquireRemotePlaywrightBrowser()` throws a
`BrowserLaunchError` (session-create 5xx, connect timeout, unreachable host), the walk **falls back to
a local Chromium** so the guard still runs. The fallback is visible two ways:

1. a `console.warn` line — `remote walk browser at AUTOSIM_CDP_URL is unreachable (…); falling back to
   a LOCAL browser …`, and
2. the walk's `summary.browserKind` is recorded as **`local-fallback`** (vs `local` / `steel:<region>`
   / `cdp-remote`), so the walk report shows which browser actually ran it.

Set `AUTOSIM_CDP_NO_FALLBACK=1` to opt out (strict remote-only: the original `BrowserLaunchError`
propagates and the walk finalizes RED as a crash, as before). With `AUTOSIM_CDP_URL` **unset** the
remote path is never touched — behavior is byte-for-byte the local default.

## Routing table

| AUTOSIM_CDP_URL | STEEL_API_KEY | authoring | walks |
|---|---|---|---|
| unset | — | local Chromium | local Chromium |
| set | unset | Puppeteer connect (self-hosted CDP) | connectOverCDP (self-hosted CDP) |
| set | set | Steel session + Puppeteer | Steel session + **puppeteer-bridge → Playwright** |

## Enabling on prod (NOT YET — seam only)

The seam is in place and tested.  To activate for production:

```bash
# In /etc/klav/klav.env on the Vultr box:
AUTOSIM_CDP_URL=wss://connect.steel.dev
STEEL_API_KEY=<your-steel-api-key>
STEEL_REGION=iad          # US-east — closest to the Vultr box (lowest CDP RTT)
```

Then `systemctl restart klav`.  Verify with a test AutoSim run — the walk log will include
`steel:<region>` in the browser kind field once connected.

### Prod-verify step (KLAVITYKLA-195 / 278)

This code path CANNOT be tested against real Steel from the dev box (needs the live key + network).
To verify on prod after this ships:

1. Set the three env vars above in `/etc/klav/klav.env`, then `systemctl restart klav`.
2. Trigger one AutoSim walk (e.g. the `criticalpath1` dogfood Trail) as `vishal@quantana.com.au`.
3. **Pass:** the walk runs and its browser kind is `steel:iad` — NOT an instant RED with
   "connectOverCDP: Timeout 30000ms exceeded". If it still times out, the puppeteer bridge fell
   through: check the walk report for the "Connected to Steel via puppeteer but Playwright could not
   attach" message (means the resolved devtools endpoint isn't reachable from the box — try leaving
   `STEEL_CONNECT_TIMEOUT_MS` default and confirm outbound wss to `*.steel.dev` isn't firewalled).
4. Confirm the alert routing (PART B): a genuine RED regression posts to `SLACK_ALERT_WEBHOOK_URL`;
   an infra/connection failure posts to `SLACK_ERROR_WEBHOOK_URL` labelled "connection /
   infrastructure failure" — and NEVER to the signup channel.

Cost estimate: ~$0 base + ~$0.10/browser-hour (100 free hrs/mo on Steel Starter).  See
`klavity_autosim_cost_bench` memory for the full bench.
