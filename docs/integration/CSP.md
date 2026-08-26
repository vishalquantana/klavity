# Embedding the Klavity widget under a Content-Security-Policy

**Audience:** any host site that embeds `/widget.js` and enforces a
Content-Security-Policy (CSP) — e.g. PX4 (CodeIgniter) and other Quantana
products rolling out the Klavity feedback widget.

**TL;DR — you do NOT need to disable your CSP.** During the PX4 QA1 rollout the
widget only worked with CSP switched off. That is not required and not
recommended. Add Klavity to your existing CSP allowlist instead (details
below). The thing that broke under PX4's strict CSP was the **Snap
screenshot round-trip** — the upload (`connect-src`) and the returned
screenshot render (`img-src`) — see [PX4 finding](#px4-finding-what-actually-broke).

Throughout this doc we assume the widget is served from **`https://klavity.in`**.
If you self-host `widget.js` on another origin, substitute that origin
everywhere `https://klavity.in` appears — the widget derives every API call
from the origin its `<script src>` was loaded from (see
[why](#why-each-directive-is-needed)).

---

## 1. The exact directives to add

Add these sources to your **existing** CSP (merge them into directives you
already have; do not replace your whole policy). Nothing here needs
`unsafe-eval`, and no S3/AWS host needs to be reachable from the browser.

| Directive | Sources to allow | Purpose |
|---|---|---|
| `script-src` | `https://klavity.in` `https://challenges.cloudflare.com` | Load `widget.js`, the same-origin vendored session-recorder (`/vendor/klv-buffer.min.js`), and Cloudflare Turnstile (anti-spam for anonymous reports). |
| `connect-src` | `https://klavity.in` `https://challenges.cloudflare.com` | All widget API calls (`/api/feedback` Snap upload, config, ping/heartbeat, known-check, Sims, errors …) go to the widget's own origin. Turnstile verifies its token to Cloudflare. |
| `img-src` | `https://klavity.in` `data:` `blob:` | Render the returned screenshot (`https://klavity.in/img/<id>.<hmac>`), plus inline preview crops (`data:`) and locally-built image bytes (`blob:`). |
| `media-src` | `blob:` `data:` | Screen-capture (`getDisplayMedia`) preview and screen-recording (`MediaRecorder`) playback. |
| `style-src` | `'unsafe-inline'` | The widget injects its UI styles into a shadow root as inline `<style>` and `.style.cssText`. |
| `font-src` | `data:` | Fonts captured from your page are inlined as `data:` URLs into the screenshot. |
| `frame-src` | `https://klavity.in` `https://challenges.cloudflare.com` | The Turnstile challenge iframe, and the `/widget-connect` helper iframe. |

If you only need the **core Snap flow** (report a bug with a screenshot) and
have anonymous-abuse protection turned off, the minimum is
`script-src https://klavity.in`, `connect-src https://klavity.in`,
`img-src https://klavity.in data: blob:`, and `style-src 'unsafe-inline'`.
Add the Turnstile + media rows when anonymous reports and screen-recording are
enabled.

> **You do not need to allowlist the S3/asset bucket.** The browser never talks
> to S3. The Snap is uploaded through the Klavity server, which stores it in a
> **private** bucket and streams it back through `https://klavity.in/img/…`.
> The one exception: if your workspace explicitly serves *public-read* Snaps
> from the dashboard, those render from the raw storage host (`S3_ENDPOINT`) —
> add that host to `img-src` only in that case.

---

## 2. Copy-paste snippets

### HTTP response header form

Merge these sources into your app's existing `Content-Security-Policy` header.
Example (a complete, self-contained policy that embeds the widget):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://klavity.in https://challenges.cloudflare.com;
  connect-src 'self' https://klavity.in https://challenges.cloudflare.com;
  img-src 'self' https://klavity.in data: blob:;
  media-src 'self' blob: data:;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  frame-src 'self' https://klavity.in https://challenges.cloudflare.com
```

(Send it as a single line — the header value cannot contain real newlines. The
directives above are wrapped only for readability.)

**CodeIgniter (PX4):** CI ships a CSP builder. In `app/Config/App.php` set
`$CSPEnabled = true`, then in `app/Config/ContentSecurityPolicy.php` (or via
`$response->getCSP()`):

```php
$csp = $this->response->getCSP();
$csp->addScriptSrc(['https://klavity.in', 'https://challenges.cloudflare.com']);
$csp->addConnectSrc(['https://klavity.in', 'https://challenges.cloudflare.com']);
$csp->addImageSrc(['https://klavity.in', 'data:', 'blob:']);
$csp->addMediaSrc(['blob:', 'data:']);
$csp->addStyleSrc(["'unsafe-inline'"]);
$csp->addFontSrc(['data:']);
$csp->addFrameSrc(['https://klavity.in', 'https://challenges.cloudflare.com']);
```

### `<meta http-equiv>` form

For hosts that set CSP in HTML instead of a header. `frame-ancestors`,
`report-uri`, and `sandbox` are ignored in `<meta>` form — everything the
widget needs works. Put it in `<head>` **before** the widget `<script>`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://klavity.in https://challenges.cloudflare.com;
  connect-src 'self' https://klavity.in https://challenges.cloudflare.com;
  img-src 'self' https://klavity.in data: blob:;
  media-src 'self' blob: data:;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  frame-src 'self' https://klavity.in https://challenges.cloudflare.com
">
```

Then load the widget as usual:

```html
<script src="https://klavity.in/widget.js" data-project="YOUR_PROJECT_ID" async></script>
```

---

## 3. Why each directive is needed (directive → widget capability)

| Directive / source | What in the widget needs it | If you omit it |
|---|---|---|
| `script-src https://klavity.in` | Loads `widget.js` **and** the same-origin session-recorder bundle `/vendor/klv-buffer.min.js` injected at runtime. | The widget never loads at all (or session-replay silently disables). |
| `script-src https://challenges.cloudflare.com` | Cloudflare Turnstile anti-spam script for anonymous reports. | Anonymous reports may be rejected as unverified; the Turnstile script is blocked. |
| `connect-src https://klavity.in` | Every `fetch`/XHR: **`POST /api/feedback` (the Snap + screenshot upload)**, `GET /api/projects/<id>/config`, `POST /api/widget/ping` (heartbeat), `POST /api/widget/known-check`, `GET /api/widget/sims`, `POST /api/report/clarity` & `/enhance`, `POST /api/voice/transcribe`, `POST /api/upgrade-request`, `POST /api/sim/review`, `POST /api/errors`. | **Snap upload fails silently** and config/heartbeat calls are blocked. |
| `connect-src https://challenges.cloudflare.com` | Turnstile token verification traffic. | Anonymous-report verification fails. |
| `img-src https://klavity.in` | Renders the returned screenshot served from `https://klavity.in/img/<id>.<hmac>` (a private-bucket object streamed through the Klavity server). | The screenshot doesn't render (broken image) even though the upload succeeded. |
| `img-src data:` | Inline preview crops and placeholder pixels the widget builds in-memory. | Screenshot preview thumbnails don't show. |
| `img-src blob:` | Locally-decoded image bytes before/after capture. | Some previews fail to render. |
| `media-src blob: data:` | `getDisplayMedia` screen-share preview and `MediaRecorder` screen-recording playback. | Screen-capture preview / recorded-clip playback breaks. |
| `style-src 'unsafe-inline'` | The widget mounts its UI in a shadow root and styles it with injected `<style>` text and `.style.cssText`. | The widget renders **unstyled** or fails to paint its launcher/composer. |
| `font-src data:` | Page fonts inlined into the screenshot as `data:` URLs so the capture looks pixel-accurate. | Captured fonts fall back; screenshots look off (non-fatal). |
| `frame-src https://klavity.in https://challenges.cloudflare.com` | The `/widget-connect` helper iframe and the Turnstile challenge iframe. | Turnstile / connect handshake can't render. |

---

## 4. Troubleshooting

Every CSP block is reported by the browser. Open **DevTools → Console** (and
optionally **Network**) and reproduce the flow. A blocked resource logs a line
like:

```
Refused to connect to 'https://klavity.in/api/feedback' because it violates
the following Content Security Policy directive: "connect-src 'self'".
```

The directive named at the end of the message is the one to fix. Map the
symptom:

| Symptom | Likely missing directive | Console signature |
|---|---|---|
| Widget button never appears; nothing loads | `script-src https://klavity.in` | `Refused to load the script 'https://klavity.in/widget.js' … violates … "script-src"` |
| Widget appears but is **unstyled** / broken layout | `style-src 'unsafe-inline'` | `Refused to apply inline style … "style-src"` |
| Clicking "Report" / submitting a Snap does nothing, no ticket created (**upload fails silently**) | `connect-src https://klavity.in` | `Refused to connect to 'https://klavity.in/api/feedback' … "connect-src"` |
| Report submits but the **screenshot shows as a broken image** in the ticket/preview | `img-src https://klavity.in data: blob:` | `Refused to load the image 'https://klavity.in/img/…' … "img-src"` |
| Screen-capture / recording preview is blank | `media-src blob: data:` | `Refused to load media … "media-src"` |
| Anonymous reports rejected / Turnstile box missing | `script-src`, `connect-src`, `frame-src` for `https://challenges.cloudflare.com` | `Refused to load … 'https://challenges.cloudflare.com/…'` |
| Config/heartbeat 404-style failures, Sims panel empty | `connect-src https://klavity.in` | `Refused to connect to 'https://klavity.in/api/…' … "connect-src"` |

**Diagnose systematically:**

1. Reproduce with the Console open and **filter by "Refused"** (or "Content
   Security Policy"). Each violation names the exact directive and blocked URL.
2. Add the named source to that directive, reload, repeat until the Console is
   clean through a full flow: open widget → Snap a screenshot → submit → see
   the returned screenshot render.
3. To collect violations centrally while you tune, add a reporting directive:
   `report-to` / `report-uri https://your-host/csp-report` (header form only),
   or temporarily run `Content-Security-Policy-Report-Only` to log without
   blocking.

---

## 5. PX4 finding: what actually broke

During the PX4 (CodeIgniter) QA1 rollout the widget only functioned with CSP
**disabled entirely**. That is a workaround, not the fix, and it blocks
promoting PX4 past QA1 (production security posture forbids running with no
CSP), and it blocks reusing the same pattern on other Quantana products.

**Root cause — the Snap screenshot round-trip under a strict CSP:**

- The widget uploads the Snap via **`POST /api/feedback`** to the Klavity
  origin. Under a strict `connect-src 'self'` this is blocked, so the upload
  **fails silently** — the user sees the composer submit but no ticket lands.
- The captured screenshot is then served back and rendered from
  **`https://klavity.in/img/<id>.<hmac>`** (the server streams the private S3
  object through its own domain). Under a strict `img-src 'self'` the returned
  screenshot **doesn't render**.

Both halves of that round-trip target `https://klavity.in`, so a CSP that only
allows `'self'` breaks them — which is exactly why turning CSP off "fixed" it.

**The fix is allowlisting, not disabling.** Add `https://klavity.in` to
`script-src`, `connect-src`, and `img-src` (plus `data:`/`blob:` on `img-src`
and `'unsafe-inline'` on `style-src`) per the tables above. Keep CSP enabled.

**No S3 bucket allowlist is needed.** A reasonable first guess is that the S3
bucket host must be reachable from the browser — it does not. The browser only
ever talks to `https://klavity.in`; all S3 access is server-side and the bucket
stays private behind the signed `/img/…` proxy.
