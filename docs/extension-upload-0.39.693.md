# Chrome Web Store upload note — Klavity extension v0.39.693

**Ticket:** KLAVITYKLA-361 — [Extension] Rebuild + upload the Chrome Web Store extension
(OTP unify + accumulated changes)

The extension only reaches users through a **manual Chrome Web Store upload**. This note
describes the artifact a human needs to upload and what changed since the last one.

---

## The artifact

| | |
|---|---|
| **Zip** | `/Users/vishalkumar/Downloads/klavity-extension-0.39.693.zip` (406 KB, 23 files) |
| **Version** | `0.39.693` (from `packages/extension/manifest.json`) |
| **Previous Web Store upload** | `0.39.514` |
| **Built from** | `packages/extension` via `vite build` (`@crxjs/vite-plugin`) |

Built with `pnpm install && ./node_modules/.bin/vite build` from `packages/extension`, then
zipped from **inside** `dist/` so `manifest.json` sits at the zip root (the Web Store rejects
a zip with the payload nested one folder down).

The zip is deliberately **not committed** — it is a build output. Regenerate it with:

```bash
cd packages/extension
rm -rf dist && ./node_modules/.bin/vite build
find dist -name .DS_Store -delete
(cd dist && zip -r -X -q /Users/vishalkumar/Downloads/klavity-extension-$(node -p "require('../manifest.json').version").zip .)
```

---

## ⚠️ Permissions: UNCHANGED — this should NOT trigger a permissions re-review

The full `manifest.json` diff between the last upload (`v0.39.514`) and this build is
**one line — the version string**:

```diff
-  "version": "0.39.514",
+  "version": "0.39.693",
```

Every permission field is byte-identical to what the Web Store already approved:

- `permissions`: `activeTab`, `storage`, `scripting`, `tabs`, `cookies`, `contextMenus`, `notifications`
- `host_permissions`: `https://klavity.in/*`, `https://klavity.quantana.top/*`, `http://localhost/*`
- `optional_host_permissions`: `*://*/*`
- `externally_connectable`: unchanged

**No new permissions, no new host permissions, no new install warning.** Reviews that add
permissions get queued into a slower manual re-review; this one should not.

One thing to be ready to explain if a reviewer asks: the built manifest contains a
`web_accessible_resources` entry whose `matches` is `<all_urls>`, covering
`assets/content.ts-*.js`, `assets/icons-*.js`, `assets/heic2any-*.js`. This is applied at
build time by the `widenContentWar()` plugin in `vite.config.ts`. It is **resource
accessibility only** — it does not grant host permissions and does not produce the "read and
change all your data on all websites" warning. The content script is declared narrowly
(`http://localhost/*`) and is otherwise injected on demand via `activeTab` or registered
dynamically on origins the user has explicitly granted. This was already true of the
`0.39.514` upload; it is not a change.

---

## What changed since v0.39.514

### Unified OTP input across all four OTP screens — KLAVITYKLA-296 (headline change)

The four separate OTP-entry UIs (web login, widget connect, extension popup, extension
options) now share one helper, `mountOtpInput` from `@klavity/core/otp-input`. Both
`popup.ts` and `options.ts` import it, so the extension's two code-entry screens now behave
identically to each other and to the web:

- digit-only sanitisation and paste-to-fill (`123 456`, `1-2-3-4-5-6` all work)
- auto-submit once six digits are present, plus Enter-to-submit, guarded against
  double-firing the same code
- a shared error slot that clears as the user types
- consistent `inputmode=numeric` / `autocomplete=one-time-code` / `aria-label` markup
- **`options.html` gained a Resend link** (`#klav-resend`) with a 30s shared cooldown,
  matching the popup's existing `#auth-resend`

### Other changes bundled into this upload

- **KLAVITYKLA-241** — pre-submit known-issue acknowledgment in the composer: warns the
  reporter inline when their description matches an already-tracked issue.
- **KLAVITYKLA-228** — element picker writes `annotations.selector`, so a report pins the
  exact element.
- **KLAVITYKLA-320** — the extension now revalidates its cached `klavConfig` against the
  backend via a `configVersion` stamp, plus a config-flush path
  (`config-revalidate.ts`, `config-flush.ts`, both new). Fixes extensions running on stale
  project config.
- **KLAVITYKLA-311** — the whiteLabel Pro gate now extends to the widget and modal.
- **KLAVITYKLA-288** — retired the legacy personal/inline Plane path.
- **KLAVITYKLA-230** — fixed lead-gen silent failures.

Churn across `packages/extension` + `packages/core` since `v0.39.514`: 40 files,
+3933 / −178.

---

## Verification performed on the artifact

Checked against the extracted zip, not just the build directory:

- `manifest.json` sits at the zip root, parses as valid JSON, `manifest_version: 3`,
  version `0.39.693` in Chrome's required dotted-integer format.
- Store metadata within limits — name 61 chars (max 75), description 125 (max 132).
- **Every** manifest-referenced path resolves inside the zip: service worker, both content
  scripts, `content.css`, `options.html`, `popup.html`, all three icons, all
  `web_accessible_resources`. Every relative JS import across all bundles resolves too.
- Icons are real PNGs at exactly 16×16, 48×48, 128×128.
- **OTP unify proven present in the built output**: the minified `mountOtpInput` body is in
  the shared chunk `assets/otp-input-zU2udUWt.js` (its `one-time-code` attribute and the
  `` `Resend in ${n}s` `` cooldown template are both there), and **both**
  `assets/popup.html-*.js` and `assets/options.html-*.js` import from that one chunk — a
  single shared implementation, not two copies. The built `src/options.html` contains the
  new `#klav-resend` link.
- No source maps, no `.ts` sources, no test files, no `.DS_Store` — 23 files total.

### Tests

- `packages/extension` — **131 passed** (9 files), green.
- `packages/core` — **265 passed** (32 files), including `otp-input.test.ts` 12/12.
  One suite is reported as failed: `scripts/ci-deploy-hardening.test.mjs`, which is a
  `node:test` file that the core vitest glob picks up and cannot parse as a vitest suite.
  Pre-existing, unrelated to the extension, and untouched by this work.

---

## Upload steps for the human

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   and select the Klavity item.
2. **Package → Upload new package**, choose
   `/Users/vishalkumar/Downloads/klavity-extension-0.39.693.zip`.
3. Confirm the dashboard reads the version as **0.39.693** and reports **no permission
   changes**. If it *does* flag a permission change, stop — something rebuilt differently
   than what was verified here.
4. Store listing copy, screenshots, and privacy declarations need no edits; nothing in this
   release changes data handling.
5. Submit for review.

After it goes live, note the published version here or on KLAVITYKLA-361 so the next rebuild
knows its true baseline. (This note's baseline came from the ticket rather than a recorded
upload log — worth keeping a running record.)
