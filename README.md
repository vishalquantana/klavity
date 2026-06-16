# Klavity Snap ⚡

> Right-click to file annotated bug reports to Jira, Linear, GitHub Issues, or Plane — from any website.

Named after Ekalavya: the self-taught master. Klavity Snap is the "eyes" of the Klavity suite — the foundation that Klavity Sims (AI personas) and Klavity OS (autonomous testing) will build on.

---

## Screenshots

_Screenshots coming soon — load the extension and right-click any page to see it in action._

To try it yourself:
1. Build and load the extension (`pnpm install && pnpm -r build`, then load `packages/extension/dist` as an unpacked extension)
2. Right-click any element on any page → **Report a Bug** or **Request a Feature**
3. Annotate the auto-captured screenshot, add context, and submit to your configured integration

---

## Features

- **Right-click anywhere** → Report a Bug / Request a Feature / View submissions
- **Auto screenshot** on modal open — captures the full rendered page (cross-origin images included)
- **Region capture** — drag to select any area of the page
- **Canvas annotation** — pen, rectangle, arrow, text with 4 colours, undo/clear
- **Upload + paste** — drag files, paste from clipboard, HEIC/HEIF auto-converted
- **Context capture** — page URL, browser, screen size, last 50 console errors, last 50 network failures
- **4 integrations** — Jira, Linear, GitHub Issues, Plane
- **Cloud switch** — set a backend URL to route all submissions through Klavity Cloud or your self-hosted instance

---

## Install

### Chrome Extension

**Chrome Web Store:** _(coming soon)_

**Developer / self-hosted:**
1. `pnpm install && pnpm -r build`
2. Open `chrome://extensions` → Enable Developer mode → Load unpacked → select `packages/extension/dist`
3. Click the ⚡ Klavity icon in your toolbar → Settings → configure your integration

### Embeddable SDK (`@klavity/snap`)

For SaaS products that want Klavity Snap built into their own app:

**Script tag:**
```html
<script src="https://cdn.klav.io/snap/klavity-snap.umd.js"></script>
<script>
  KlavitySnap.init({
    integration: 'jira',
    jira: {
      baseUrl: 'https://yourorg.atlassian.net',
      email: 'dev@yourorg.com',
      token: 'your-api-token',
      projectKey: 'PROJ'
    }
  })
</script>
```

**npm:**
```bash
npm install @klavity/snap
```
```js
import KlavitySnap from '@klavity/snap'
KlavitySnap.init({
  integration: 'linear',
  linear: { apiKey: 'lin_api_...', teamId: 'team_...' }
})
```

---

## Configuration

Open the extension settings (click the ⚡ icon → Settings) or pass config to `KlavitySnap.init()`.

| Setting | Description |
|---|---|
| Active integration | `jira`, `linear`, `github`, or `plane` |
| Jira: Base URL | e.g. `https://yourorg.atlassian.net` |
| Jira: Email + API Token | From Atlassian account settings |
| Jira: Project Key | e.g. `PROJ` |
| Linear: API Key | Personal API key from Linear settings |
| Linear: Team ID | Your Linear team ID |
| GitHub: PAT | Personal access token with `repo` scope |
| GitHub: Repository | `owner/repo` format |
| Plane: API Token | From Plane account settings |
| Backend URL | Leave empty for direct mode. Set to self-hosted URL or `https://app.klav.io` for Klavity Cloud. |
| Auto-file JS errors | Auto-file silent tickets for unhandled JS errors (opt-in) |

---

## Architecture

```
klav-snap/
├── packages/core/       # @klavity/core — shared types, integrations, annotator, crop, modal
├── packages/extension/  # Chrome MV3 extension — background, content script, options, popup
└── packages/sdk/        # @klavity/snap — embeddable script-tag / npm SDK
```

The **cloud switch** is a single `backendUrl` setting. Empty = direct mode (extension calls Jira/Linear/etc APIs directly). Non-empty = all submissions route through the Klavity backend, which also powers Klavity Sims and Klavity OS.

---

## Roadmap

| Tier | Product | Status |
|---|---|---|
| 1 | **Klavity Snap** — right-click bug reporter | ✅ This repo |
| 2 | **Klavity Sims** — AI persona panel (virtual QA engineers) | 🔜 |
| 3 | **Klavity OS** — autonomous UAT agent | 🔜 |

---

## Development

```bash
pnpm install          # install all workspace deps
pnpm -r test          # run all tests (22 tests)
pnpm -r build         # build extension + SDK

# Load extension in Chrome:
# chrome://extensions → Developer mode → Load unpacked → packages/extension/dist
```

---

## License

[FSL-1.1-ALv2](LICENSE) (Functional Source License) — free for any non-competing use; converts to Apache 2.0 on the second anniversary of each release.  
For commercial licensing, contact [hello@quantana.com.au](mailto:hello@quantana.com.au).

Built by [Quantana](https://quantana.com.au) — AI-first design and development agency.
