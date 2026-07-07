# Steel remote-browser seam (AUTOSIM_CDP_URL)

AutoSim browser work — both the **authoring drive** (`trails-author`) and the **walk engine**
(`trails-runner`) — can be routed to a remote Chromium via two env vars.  Setting them moves the
heavyweight Chromium process off the 1 GB prod box without any code change.

## Env vars

| Variable | Required? | Description |
|---|---|---|
| `AUTOSIM_CDP_URL` | gate | CDP WebSocket base URL. When set, ALL AutoSim browser work routes remote. When absent, local `chromium.launch()` is used (current prod default). |
| `STEEL_API_KEY` | optional | If set alongside `AUTOSIM_CDP_URL`, a [Steel.dev](https://steel.dev) session is created on every run and released on close. |
| `STEEL_API_URL` | optional | Steel REST API base (default `https://api.steel.dev`). Override for self-hosted Steel. |

## Authoring drive (`acquireBrowser` → Puppeteer-over-CDP)

`prototype/lib/trails-browser-page.ts` → `acquireBrowser()` is used by `trails-author` and
`sim-preview`.  It connects via **Puppeteer-core** because the 2026-07-04 spike found that
Playwright's `connectOverCDP` hung over transcontinental latency to Steel.  The Puppeteer
`PuppeteerPage` adapter re-adds Playwright-style actionability (waitForSelector visible).

## Walk engine (`acquirePlaywrightBrowser` → Playwright connectOverCDP)

`prototype/lib/trails-runner.ts` uses `acquirePlaywrightBrowser()` (same file) which returns a
native **Playwright `Browser`** so the runner's full Playwright API surface is preserved
(BrowserContext, Page.setDefaultTimeout, Locator, rrweb addInitScript, etc.).

Remote path: `chromium.connectOverCDP(url)`.  Spike note: tested from Mac→Steel (transcontinental)
it hung; from a co-located prod box (~50–150 ms RTT) it is stable.

## Routing table

| AUTOSIM_CDP_URL | STEEL_API_KEY | authoring | walks |
|---|---|---|---|
| unset | — | local Chromium | local Chromium |
| set | unset | connectOverCDP (self-hosted) | connectOverCDP (self-hosted) |
| set | set | Steel session + Puppeteer | Steel session + connectOverCDP |

## Enabling on prod (NOT YET — seam only)

The seam is in place and tested.  To activate for production:

```bash
# In /etc/klav/klav.env on the Vultr box:
AUTOSIM_CDP_URL=wss://connect.steel.dev
STEEL_API_KEY=<your-steel-api-key>
```

Then `systemctl restart klav`.  Verify with a test AutoSim run — the walk log will include
`steel:<region>` in the browser kind field once connected.

Cost estimate: ~$0 base + ~$0.10/browser-hour (100 free hrs/mo on Steel Starter).  See
`klavity_autosim_cost_bench` memory for the full bench.
