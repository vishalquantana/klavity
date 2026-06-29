# Klavity Embeddable Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `<script>`-tag widget that renders a team's Klavity Sims live on their own web app and lets a logged-in user trigger a review that files feedback — no Chrome extension.

**Architecture:** A self-contained IIFE bundle (`/widget.js`, built from `packages/sdk`) runs on the customer origin. First use opens a first-party connect popup (`/widget-connect`) that signs the user in and mints a narrow, revocable widget token, handed back via `postMessage` to an allowlisted origin. The widget then calls the **existing** `/api/personas` and `/api/sim/review` (Bearer auth, already supported) cross-origin, with new CORS headers. Screenshots are self-captured via `html-to-image`. No review-pipeline, gating, or feedback changes.

**Tech Stack:** Bun + TypeScript (`prototype/server.ts`), Vite (`packages/sdk`), `@klavity/core/sim`, `html-to-image`, bun:test (backend integration), vitest (pure logic).

## Global Constraints

- **Logged-in users only. No publishable key, no anonymous access.** Every review requires a per-user widget token minted after an authenticated, access-checked connect.
- **Reuse existing endpoints unchanged:** `GET /api/personas?project=<id>`, `POST /api/sim/review` (body `{projectId,url,domSig,screenshotDataUrl}`), `POST /api/consent` (body `{projectId,status}`). All accept Bearer via `bearerEmail` (`server.ts:458`).
- **Token machinery (verbatim):** `issueExtensionToken(email, projectId?, ttlMs?): Promise<string>` returns an `ext_`-prefixed token (`lib/db.ts:1296`); validate via `getExtensionTokenEmail(token)` (`lib/db.ts:1307`). `SESSION_DAYS` exists in `server.ts`.
- **Response helper (verbatim):** `json(body, status = 200, headers = {})` (`server.ts:366`) merges `headers`. `file(path)` (`server.ts:369`) serves a file. `redirect(loc, headers)` (`server.ts:370`).
- **CORS:** Bearer auth means **no cookies cross-origin**, so `Access-Control-Allow-Origin: *` is safe (never send `Allow-Credentials`). Allow headers `authorization, content-type`; methods `GET, POST, OPTIONS`.
- **postMessage target origin is always the validated, allowlisted customer origin — never `*`.**
- **Version on release:** lockstep bump **0.16.1 → 0.17.0** across `docs/PRD.md` (Version line), top of `CHANGELOG.md`, and `package.json` in `/`, `packages/core`, `packages/extension`, `packages/sdk`, plus `packages/extension/manifest.json`.
- **Backend tests** follow the subprocess + temp-DB pattern in `prototype/server.connectors.test.ts` (spin a real server, seed via raw `@libsql/client`, hit over HTTP). **Pure-logic tests** use vitest in `packages/sdk`.
- **Allowlist matching (verbatim, `lib/db.ts:1220`):** `patternMatchesUrl(pattern, url)` strips scheme/query/fragment/trailing-slash, lowercases; `*` → `.*` regex; otherwise exact or prefix-with-`/`. `matchMonitored(projectId, url)` returns the first enabled match (`lib/db.ts:1237`).

---

### Task 1: Backend — `originAllowedForProject` helper

**Files:**
- Modify: `prototype/lib/db.ts` (add helper near `matchMonitored`, ~`:1237`)
- Test: `prototype/lib/db.widget.test.ts` (new)

**Interfaces:**
- Consumes: `listMonitoredUrls(projectId, { enabledOnly: true })` (existing).
- Produces: `export async function originAllowedForProject(projectId: string, origin: string): Promise<boolean>` — true if `origin`'s host equals the host of any enabled monitored-URL pattern.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/db.widget.test.ts
import { test, expect } from "bun:test"
import { hostOfPattern } from "./db"

test("hostOfPattern strips scheme, path and wildcard to the bare host", () => {
  expect(hostOfPattern("https://app.acme.com/*")).toBe("app.acme.com")
  expect(hostOfPattern("app.acme.com/billing")).toBe("app.acme.com")
  expect(hostOfPattern("APP.ACME.COM/x?y=1")).toBe("app.acme.com")
  expect(hostOfPattern("")).toBe("")
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/db.widget.test.ts`
Expected: FAIL — `hostOfPattern` is not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// prototype/lib/db.ts — add near patternMatchesUrl (~line 1237)
export function hostOfPattern(pattern: string): string {
  return String(pattern || "").trim()
    .replace(/^https?:\/\//i, "")
    .replace(/[?#].*$/, "")
    .split("/")[0]
    .replace(/\*+$/, "")
    .toLowerCase()
}

export async function originAllowedForProject(projectId: string, origin: string): Promise<boolean> {
  let host = ""
  try { host = new URL(origin).host.toLowerCase() } catch { return false }
  if (!host) return false
  const rows = await listMonitoredUrls(projectId, { enabledOnly: true })
  return rows.some(r => hostOfPattern(r.urlPattern) === host)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/db.widget.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/db.ts prototype/lib/db.widget.test.ts
git commit -m "feat(widget): originAllowedForProject + hostOfPattern allowlist host check"
```

---

### Task 2: Backend — `POST /api/widget/token` + CORS/OPTIONS for widget API

**Files:**
- Modify: `prototype/server.ts` (add CORS const + OPTIONS handler near top of the request handler ~`:360`; add the `/api/widget/token` route near `/api/extension/config` ~`:929`; append CORS headers to `/api/personas`, `/api/sim/review`, `/api/consent` responses)
- Test: `prototype/server.widget.test.ts` (new — model on `server.connectors.test.ts`)

**Interfaces:**
- Consumes: `sessionEmail(req)`, `resolveProject(me, id)`, `issueExtensionToken`, `originAllowedForProject` (Task 1), `json`, `SESSION_DAYS`.
- Produces: route `POST /api/widget/token` → body `{ projectId, origin }` → `{ token }` on success; CORS headers on widget API responses; `OPTIONS /api/*` → `204` with CORS headers.

- [ ] **Step 1: Write the failing tests**

Add to a new `prototype/server.widget.test.ts` following the subprocess/temp-DB seeding pattern of `server.connectors.test.ts` (copy its `beforeAll`/`afterAll` server-spawn + seed helpers; seed a user with a session cookie, an account, a project the user admins, and one enabled monitored URL `app.acme.com/*`). Then:

```ts
test("OPTIONS /api/sim/review returns 204 with permissive CORS", async () => {
  const r = await fetch(base + "/api/sim/review", { method: "OPTIONS" })
  expect(r.status).toBe(204)
  expect(r.headers.get("access-control-allow-origin")).toBe("*")
  expect((r.headers.get("access-control-allow-headers") || "").toLowerCase()).toContain("authorization")
})

test("POST /api/widget/token rejects when not signed in", async () => {
  const r = await fetch(base + "/api/widget/token", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ projectId, origin: "https://app.acme.com" }),
  })
  expect(r.status).toBe(401)
})

test("POST /api/widget/token rejects an origin not on the allowlist", async () => {
  const r = await fetch(base + "/api/widget/token", {
    method: "POST", headers: { "content-type": "application/json", cookie: sessionCookie },
    body: JSON.stringify({ projectId, origin: "https://evil.example" }),
  })
  expect(r.status).toBe(403)
})

test("POST /api/widget/token mints a token for a valid session + allowlisted origin", async () => {
  const r = await fetch(base + "/api/widget/token", {
    method: "POST", headers: { "content-type": "application/json", cookie: sessionCookie },
    body: JSON.stringify({ projectId, origin: "https://app.acme.com" }),
  })
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(j.token).toMatch(/^ext_/)
})

test("the minted token authorizes GET /api/personas via Bearer with CORS header", async () => {
  const t = await (await fetch(base + "/api/widget/token", {
    method: "POST", headers: { "content-type": "application/json", cookie: sessionCookie },
    body: JSON.stringify({ projectId, origin: "https://app.acme.com" }),
  })).json()
  const r = await fetch(base + "/api/personas?project=" + projectId, {
    headers: { authorization: "Bearer " + t.token },
  })
  expect(r.status).toBe(200)
  expect(r.headers.get("access-control-allow-origin")).toBe("*")
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd prototype && bun test server.widget.test.ts`
Expected: FAIL — route 404s / no CORS headers.

- [ ] **Step 3: Implement CORS + OPTIONS + the route**

```ts
// server.ts — near the json() helper (~line 366)
const WIDGET_CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-max-age": "600",
}
```

```ts
// server.ts — as the FIRST check inside the request handler, before routing (~line 360,
// right after `path` is computed). Preflight for any API path the widget calls.
if (req.method === "OPTIONS" && path.startsWith("/api/")) {
  return new Response(null, { status: 204, headers: WIDGET_CORS })
}
```

```ts
// server.ts — add the route immediately after the /api/consent block (~line 945)
if (req.method === "POST" && path === "/api/widget/token") {
  const meW = await sessionEmail(req)            // first-party popup → cookie only
  if (!meW) return json({ error: "Sign in to continue." }, 401)
  const body = await req.json().catch(() => ({}))
  const projW = await resolveProject(meW, String(body.projectId || ""))
  if (!projW) return json({ error: "No access to this project." }, 403)
  const origin = String(body.origin || "")
  if (!(await originAllowedForProject(projW.id, origin))) {
    return json({ error: "This origin is not on the project's watch list." }, 403)
  }
  const token = await issueExtensionToken(meW, projW.id, SESSION_DAYS * 24 * 60 * 60 * 1000)
  return json({ token })
}
```

For the three widget API responses, add `WIDGET_CORS` to their existing `json(...)` calls. Example for `/api/personas` (`server.ts:866`):

```ts
// before: return json({ personas })
return json({ personas }, 200, WIDGET_CORS)
```

Apply the same `, 200, WIDGET_CORS` (or the existing status) to the success responses of `POST /api/sim/review` and `POST /api/consent`. Import `originAllowedForProject` from `./lib/db` at the top of `server.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd prototype && bun test server.widget.test.ts`
Expected: PASS (all 5).

- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/server.widget.test.ts
git commit -m "feat(widget): POST /api/widget/token + CORS/OPTIONS for widget API"
```

---

### Task 3: Backend — `GET /widget-connect` popup page

**Files:**
- Create: `prototype/public/widget-connect.html`
- Modify: `prototype/server.ts` (add `GET /widget-connect` route serving the file ~near other public HTML routes)
- Test: manual (covered in Task 7) + a route-serves-200 assertion below.

**Interfaces:**
- Consumes: existing `/api/auth/request`, `/api/auth/verify` (OTP), and `/api/widget/token` (Task 2).
- Produces: a first-party page that, given `?project=<id>&origin=<customerOrigin>`, signs the user in if needed, mints a widget token, and `postMessage`s `{ type: "klavity-widget-token", token, projectId }` to `origin`, then closes.

- [ ] **Step 1: Write the failing test**

```ts
// add to prototype/server.widget.test.ts
test("GET /widget-connect serves HTML", async () => {
  const r = await fetch(base + "/widget-connect?project=" + projectId + "&origin=https://app.acme.com")
  expect(r.status).toBe(200)
  expect((r.headers.get("content-type") || "")).toContain("text/html")
  expect(await r.text()).toContain("klavity-widget-token")
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.widget.test.ts -t "widget-connect"`
Expected: FAIL — 404.

- [ ] **Step 3: Implement the route + page**

```ts
// server.ts — near the other static public-page routes
if (req.method === "GET" && path === "/widget-connect") {
  return new Response(Bun.file("public/widget-connect.html"), {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
}
```

```html
<!-- prototype/public/widget-connect.html -->
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Connect to Klavity</title>
<style>
  body{font-family:system-ui,sans-serif;background:#19140f;color:#f5f3ee;margin:0;
    display:grid;place-items:center;min-height:100vh}
  .card{width:320px;padding:28px;text-align:center}
  h1{font-size:18px;margin:0 0 6px}.sub{color:#8a8076;font-size:13px;margin:0 0 18px}
  input{width:100%;box-sizing:border-box;background:#15110d;border:1px solid #574f45;
    border-radius:10px;padding:11px;color:#f5f3ee;font-size:15px;margin-bottom:10px}
  button{width:100%;border:0;border-radius:10px;padding:11px;background:#6366f1;color:#fff;
    font-size:15px;font-weight:600;cursor:pointer}
  .err{color:#db2777;font-size:13px;min-height:1em;margin-top:8px}
  .hide{display:none}
</style></head><body>
<div class="card">
  <h1>Connect to Klavity</h1>
  <p class="sub" id="sub">Sign in to bring your Sims onto this page.</p>
  <div id="emailStep">
    <input id="email" type="email" placeholder="you@acme.com" autocomplete="email" />
    <button id="sendBtn">Send sign-in code</button>
  </div>
  <div id="codeStep" class="hide">
    <input id="code" inputmode="numeric" maxlength="6" placeholder="6-digit code" />
    <button id="verifyBtn">Verify &amp; connect</button>
  </div>
  <div class="err" id="err"></div>
</div>
<script>
const qs = new URLSearchParams(location.search)
const projectId = qs.get("project") || ""
const targetOrigin = qs.get("origin") || ""
const $ = (id) => document.getElementById(id)
const err = (m) => { $("err").textContent = m || "" }
async function jf(url, opts){ const r = await fetch(url, opts); let d={}; try{d=await r.json()}catch(e){} return {ok:r.ok,status:r.status,data:d} }

async function mintAndFinish(){
  const r = await jf("/api/widget/token", { method:"POST", headers:{"content-type":"application/json"},
    body: JSON.stringify({ projectId, origin: targetOrigin }) })
  if (!r.ok){ err(r.data.error || "Could not connect."); return }
  if (window.opener && targetOrigin){
    window.opener.postMessage({ type:"klavity-widget-token", token:r.data.token, projectId }, targetOrigin)
  }
  $("sub").textContent = "Connected — you can close this window."
  $("emailStep").classList.add("hide"); $("codeStep").classList.add("hide")
  setTimeout(() => window.close(), 600)
}
$("sendBtn").onclick = async () => {
  err(""); const email = $("email").value.trim().toLowerCase()
  if (!email.includes("@")) return err("Enter a valid email.")
  // If already signed in, /api/widget/token will succeed straight away.
  const probe = await jf("/api/widget/token", { method:"POST", headers:{"content-type":"application/json"},
    body: JSON.stringify({ projectId, origin: targetOrigin }) })
  if (probe.ok){ if (window.opener && targetOrigin) window.opener.postMessage({type:"klavity-widget-token",token:probe.data.token,projectId}, targetOrigin); $("sub").textContent="Connected — you can close this window."; $("emailStep").classList.add("hide"); setTimeout(()=>window.close(),600); return }
  const r = await jf("/api/auth/request", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ email }) })
  if (!r.ok) return err(r.data.error || "Could not send a code.")
  $("emailStep").classList.add("hide"); $("codeStep").classList.remove("hide"); $("code").focus()
}
$("verifyBtn").onclick = async () => {
  err(""); const email = $("email").value.trim().toLowerCase(); const code = $("code").value.trim()
  if (code.length < 4) return err("Enter the 6-digit code.")
  const r = await jf("/api/auth/verify", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ email, code }) })
  if (!r.ok) return err(r.data.error || "Invalid or expired code.")
  await mintAndFinish()
}
</script></body></html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.widget.test.ts -t "widget-connect"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype/public/widget-connect.html prototype/server.ts
git commit -m "feat(widget): first-party /widget-connect sign-in + token postMessage popup"
```

---

### Task 4: SDK — pure widget helpers (config parse + gate→message)

**Files:**
- Create: `packages/sdk/src/widget-lib.ts`
- Test: `packages/sdk/tests/widget-lib.test.ts` (new)

**Interfaces:**
- Produces:
  - `parseScriptConfig(scriptEl: { dataset: { project?: string }, src: string }): { projectId: string, backendUrl: string }`
  - `gateMessage(reason: string): string` — maps a `reviewGate` reason to user copy.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/sdk/tests/widget-lib.test.ts
import { describe, it, expect } from "vitest"
import { parseScriptConfig, gateMessage } from "../src/widget-lib"

describe("parseScriptConfig", () => {
  it("reads data-project and derives backend origin from src", () => {
    const cfg = parseScriptConfig({ dataset: { project: "P1" }, src: "https://klavity.in/widget.js?v=1" })
    expect(cfg.projectId).toBe("P1")
    expect(cfg.backendUrl).toBe("https://klavity.in")
  })
})

describe("gateMessage", () => {
  it("maps known reasons to friendly copy", () => {
    expect(gateMessage("offAllowlist")).toMatch(/watch list/i)
    expect(gateMessage("budgetExhausted")).toMatch(/budget/i)
    expect(gateMessage("paused")).toMatch(/paused/i)
    expect(gateMessage("anythingElse")).toMatch(/couldn.t run/i)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/sdk && npx vitest run tests/widget-lib.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// packages/sdk/src/widget-lib.ts
export function parseScriptConfig(scriptEl: { dataset: { project?: string }, src: string }): { projectId: string, backendUrl: string } {
  const projectId = scriptEl.dataset.project || ""
  let backendUrl = ""
  try { backendUrl = new URL(scriptEl.src).origin } catch { backendUrl = "" }
  return { projectId, backendUrl }
}

export function gateMessage(reason: string): string {
  switch (reason) {
    case "paused": return "Sims are paused for this project."
    case "userPaused": return "Live reviews are paused for your account."
    case "needsConsent": return "Turning on live reviews for your account…"
    case "offAllowlist": return "This page isn't on your project's watch list — add it in Klavity."
    case "alreadyReviewed": return "Your Sims already reviewed this view."
    case "budgetExhausted": return "Today's review budget is used up."
    case "unauthorized": return "Your session expired — reconnect to Klavity."
    default: return "Couldn't run the review. Try again."
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/sdk && npx vitest run tests/widget-lib.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/widget-lib.ts packages/sdk/tests/widget-lib.test.ts
git commit -m "feat(widget): pure helpers — parseScriptConfig + gateMessage"
```

---

### Task 5: SDK — widget runtime

**Files:**
- Create: `packages/sdk/src/widget.ts`
- Test: manual (Task 7). Pure logic already covered by Task 4.

**Interfaces:**
- Consumes: `parseScriptConfig`, `gateMessage` (Task 4); `createSim`, `injectSimStyles`, `emotionFromSentiment` from `@klavity/core/sim`; `toPng` from `html-to-image`; backend routes from Tasks 2–3.
- Produces: a side-effecting module that, on load, mounts the dock and wires connect + review. Exposes `window.KlavityWidget = { mount }` for manual re-init.

- [ ] **Step 1: Implement the runtime** (no unit test — DOM/popup integration; verified manually in Task 7)

```ts
// packages/sdk/src/widget.ts
import { createSim, injectSimStyles, emotionFromSentiment } from "@klavity/core/sim"
import { toPng } from "html-to-image"
import { parseScriptConfig, gateMessage } from "./widget-lib"

const HOST_ID = "klavity-widget-host"
const TOKEN_KEY = "klavity_widget_token"

type Persona = { id: string; name: string; initials?: string; accent?: string }

function currentScript(): HTMLScriptElement {
  return (document.currentScript as HTMLScriptElement)
    || (document.querySelector('script[src*="widget.js"]') as HTMLScriptElement)
}

function getToken(): string { try { return localStorage.getItem(TOKEN_KEY) || "" } catch { return "" } }
function setToken(t: string) { try { localStorage.setItem(TOKEN_KEY, t) } catch {} }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY) } catch {} }

async function mount() {
  const cfg = parseScriptConfig(currentScript())
  if (!cfg.projectId || !cfg.backendUrl) return

  const host = document.createElement("div")
  host.id = HOST_ID
  host.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:2147483646"
  document.body.appendChild(host)
  const root = host.attachShadow({ mode: "open" })
  injectSimStyles(root)
  const dock = document.createElement("div")
  dock.style.cssText = "display:flex;align-items:flex-end;gap:10px;font-family:system-ui,sans-serif"
  root.appendChild(dock)

  const banner = (text: string) => {
    let el = root.getElementById("kw-banner") as HTMLDivElement | null
    if (!el) { el = document.createElement("div"); el.id = "kw-banner"
      el.style.cssText = "max-width:240px;background:#15110d;color:#f5f3ee;border:1px solid #574f45;border-radius:10px;padding:9px 11px;font-size:12.5px;margin-bottom:8px"
      dock.appendChild(el) }
    el.textContent = text
    setTimeout(() => { if (el && el.textContent === text) el.remove() }, 6000)
  }

  async function api(pathName: string, opts: RequestInit = {}) {
    const r = await fetch(cfg.backendUrl + pathName, {
      ...opts,
      headers: { ...(opts.headers || {}), authorization: "Bearer " + getToken() },
    })
    return r
  }

  function renderConnectButton() {
    dock.innerHTML = ""
    const b = document.createElement("button")
    b.textContent = "⚡ Connect to Klavity"
    b.style.cssText = "border:0;border-radius:999px;padding:10px 16px;background:#6366f1;color:#fff;font-weight:600;font-size:13px;cursor:pointer;box-shadow:0 8px 24px rgba(99,102,241,.35)"
    b.onclick = openConnect
    dock.appendChild(b)
  }

  function openConnect() {
    const u = cfg.backendUrl + "/widget-connect?project=" + encodeURIComponent(cfg.projectId)
      + "&origin=" + encodeURIComponent(location.origin)
    const w = window.open(u, "klavity-connect", "width=380,height=460")
    const onMsg = (ev: MessageEvent) => {
      if (ev.origin !== cfg.backendUrl) return
      if (ev.data && ev.data.type === "klavity-widget-token" && ev.data.token) {
        setToken(ev.data.token)
        window.removeEventListener("message", onMsg)
        try { w && w.close() } catch {}
        loadSims()
      }
    }
    window.addEventListener("message", onMsg)
  }

  async function loadSims() {
    const r = await api("/api/personas?project=" + encodeURIComponent(cfg.projectId))
    if (r.status === 401) { clearToken(); renderConnectButton(); return }
    if (!r.ok) { banner("Couldn't load your Sims."); return }
    const j = await r.json()
    renderDock((j.personas || []) as Persona[])
  }

  function renderDock(personas: Persona[]) {
    dock.innerHTML = ""
    const col = document.createElement("div")
    col.style.cssText = "display:flex;flex-direction:column;align-items:flex-end;gap:8px"
    const btn = document.createElement("button")
    btn.textContent = "Have your Sims review this page"
    btn.style.cssText = "border:0;border-radius:999px;padding:9px 14px;background:#d98324;color:#fff;font-weight:600;font-size:12.5px;cursor:pointer;box-shadow:0 8px 24px rgba(217,131,36,.3)"
    btn.onclick = () => runReview(btn)
    const avatars = document.createElement("div")
    avatars.style.cssText = "display:flex;gap:-6px"
    for (const p of personas.slice(0, 5)) {
      const s = createSim({ name: p.name, initials: p.initials, color: p.accent || "#6366f1", size: 34, legs: false, animate: false })
      s.style.marginLeft = "-6px"
      avatars.appendChild(s)
    }
    col.appendChild(avatars); col.appendChild(btn); dock.appendChild(col)
  }

  async function runReview(btn: HTMLButtonElement) {
    btn.disabled = true; const orig = btn.textContent; btn.textContent = "Capturing…"
    let shot = ""
    try {
      shot = await toPng(document.body, { cacheBust: true, pixelRatio: 1, skipFonts: true,
        filter: (node) => (node as HTMLElement).id !== HOST_ID })
    } catch { banner("Couldn't capture the page."); btn.disabled = false; btn.textContent = orig; return }
    btn.textContent = "Reviewing…"
    let r = await api("/api/sim/review", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId: cfg.projectId, url: location.href, domSig: null, screenshotDataUrl: shot }) })
    let j = await r.json().catch(() => ({}))
    // Auto-grant consent once, then retry — the widget user is an authenticated team member.
    if (!j.ok && j.reason === "needsConsent") {
      await api("/api/consent", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: cfg.projectId, status: "granted" }) })
      r = await api("/api/sim/review", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: cfg.projectId, url: location.href, domSig: null, screenshotDataUrl: shot }) })
      j = await r.json().catch(() => ({}))
    }
    btn.disabled = false; btn.textContent = orig
    if (r.status === 401) { clearToken(); renderConnectButton(); return }
    if (!j.ok) { banner(gateMessage(j.reason || "")); return }
    for (const rev of (j.reviews || [])) for (const re of (rev.reactions || [])) {
      renderBubble(rev.simName, rev.accent || "#6366f1", re.observation, re.sentiment)
    }
    if (!(j.reviews || []).some((x: any) => (x.reactions || []).length)) banner("Your Sims had nothing to flag here.")
  }

  function renderBubble(name: string, accent: string, observation: string, sentiment: string) {
    const b = document.createElement("div")
    b.style.cssText = "max-width:260px;background:#15110d;color:#f5f3ee;border:1px solid #574f45;border-left:3px solid " + accent + ";border-radius:10px;padding:10px 12px;font-size:12.5px;margin-bottom:8px"
    const em = emotionFromSentiment(sentiment)
    b.innerHTML = "<b>" + name + "</b> · <span style='color:#8a8076'>" + em + "</span><br>" + (observation || "")
    dock.insertBefore(b, dock.firstChild)
    setTimeout(() => b.remove(), 16000)
  }

  // Boot
  if (getToken()) loadSims(); else renderConnectButton()
  ;(window as any).KlavityWidget = { mount }
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mount())
  else mount()
}

export { mount }
```

- [ ] **Step 2: Typecheck**

Run: `cd packages/sdk && npx tsc --noEmit`
Expected: no errors. (If `@klavity/core/sim` types resolve via workspace, this passes; fix import paths if not.)

- [ ] **Step 3: Commit**

```bash
git add packages/sdk/src/widget.ts
git commit -m "feat(widget): widget runtime — dock, connect popup, capture, review, bubbles"
```

---

### Task 6: Build + serve `/widget.js`

**Files:**
- Modify: `packages/sdk/vite.config.ts` (add a second IIFE lib build for `widget.ts`)
- Modify: `prototype/server.ts` (add `GET /widget.js` serving the built IIFE)
- Test: `prototype/server.widget.test.ts` (serves 200 + JS content-type)

**Interfaces:**
- Produces: build artifact `packages/sdk/dist/klavity-widget.iife.js`; route `GET /widget.js`.

- [ ] **Step 1: Add the build entry**

Inspect the existing `packages/sdk/vite.config.ts`. Add a build that emits a single self-contained IIFE for `src/widget.ts` named `klavity-widget.iife.js` with `format: "iife"` and `name: "KlavityWidget"`, inlining deps (no `external`). If the existing config uses one `lib.entry`, add a second build config or a multi-entry `lib` with `fileName` per entry. Keep the existing snap build intact.

```ts
// packages/sdk/vite.config.ts — example shape (adapt to the existing file)
import { defineConfig } from "vite"
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/widget.ts",
      name: "KlavityWidget",
      formats: ["iife"],
      fileName: () => "klavity-widget.iife.js",
    },
  },
})
```

- [ ] **Step 2: Build and verify the artifact exists**

Run: `cd packages/sdk && npx vite build`
Expected: `packages/sdk/dist/klavity-widget.iife.js` exists and is a single file (deps inlined). Run `ls -la dist/klavity-widget.iife.js`.

- [ ] **Step 3: Write the failing serve test**

```ts
// add to prototype/server.widget.test.ts
test("GET /widget.js serves javascript", async () => {
  const r = await fetch(base + "/widget.js")
  expect(r.status).toBe(200)
  expect((r.headers.get("content-type") || "")).toContain("javascript")
})
```

- [ ] **Step 4: Implement the route**

```ts
// server.ts — near other static asset routes
if (req.method === "GET" && path === "/widget.js") {
  return new Response(Bun.file("../packages/sdk/dist/klavity-widget.iife.js"), {
    headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=300" },
  })
}
```

(Confirm the relative path from the prototype process CWD; adjust to an absolute resolve if the server runs from a different directory in prod — `/opt/klav` deploys the whole repo, so `../packages/sdk/dist/...` from `prototype/` is correct.)

- [ ] **Step 5: Run the serve test**

Run: `cd prototype && bun test server.widget.test.ts -t "widget.js"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/sdk/vite.config.ts packages/sdk/dist/klavity-widget.iife.js prototype/server.ts
git commit -m "feat(widget): build klavity-widget IIFE and serve at /widget.js"
```

---

### Task 7: Release — version bump, onboarding tile, deploy + manual verify

**Files:**
- Modify: `docs/PRD.md`, `CHANGELOG.md`, `package.json` (`/`, `packages/core`, `packages/extension`, `packages/sdk`), `packages/extension/manifest.json` → **0.17.0**
- Modify: `site/onboarding.html:199` (flip the "Or embed the widget" tile from "Coming soon" to a working snippet reveal) — **only after manual verification passes**.

- [ ] **Step 1: Run the full test suites**

Run: `cd prototype && bun test` then `cd packages/sdk && npx vitest run` and `cd packages/core && npx vitest run`
Expected: all green.

- [ ] **Step 2: Manual verification on a local page**

Start the prototype (`cd prototype && bun server.ts`). Create `/tmp/widget-test.html` with `<script src="http://localhost:4317/widget.js" data-project="<a real local project id>" defer></script>` served from a different port (e.g. `python3 -m http.server 8899`). In the browser: dock shows "Connect" → popup signs in → dock shows Sims → "Review this page" → bubble appears and a feedback row shows in `/dashboard`. Note: a monitored URL covering `localhost:8899` must exist on the project, else expect the friendly `offAllowlist` banner (that itself verifies gating).

- [ ] **Step 3: Flip the onboarding tile** (after Step 2 passes)

```html
<!-- site/onboarding.html:199 — replace the Coming-soon tile with a working reveal -->
<div class="tile alt" id="widgetTile" onclick="document.getElementById('widgetSnippet').classList.toggle('hide')"><div class="ti">&lt;/&gt;</div><h3>Or embed the widget</h3><p>One script tag for any web app — no extension needed. Click for the snippet.</p></div>
```
Add (after the tiles, inside step 2's panel) a hidden snippet block the user can copy:
```html
<pre class="hide" id="widgetSnippet" style="margin-top:12px;background:var(--ink-2);border:1px solid var(--line);border-radius:10px;padding:12px;font-family:var(--mono);font-size:11.5px;overflow:auto">&lt;script src="https://klavity.in/widget.js" data-project="YOUR_PROJECT_ID" defer&gt;&lt;/script&gt;</pre>
```

- [ ] **Step 4: Version lockstep bump to 0.17.0**

Bump all six version locations (see Global Constraints) and add a `## [0.17.0] — <date>` CHANGELOG entry under **Added**: "Embeddable live-Sims widget (`/widget.js`) — logged-in team members can drop one script tag on their own app and trigger Sim reviews that file feedback; first-party connect popup, no extension required."

- [ ] **Step 5: Commit, push, deploy**

```bash
git add -A && git commit -m "release(widget): embeddable live-Sims widget v0.17.0"
git push origin master
ssh root@66.135.20.62 'sudo -u klav git -C /opt/klav pull --ff-only && sudo -u klav bash -lc "cd /opt/klav/prototype && ~/.bun/bin/bun install --production" ; systemctl restart klav'
```
Then poll health (`curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4317/` → 200, ~10s boot) and verify `curl -s https://klavity.in/widget.js | head -c 200` returns JS.

> **Build note for prod:** `packages/sdk/dist/klavity-widget.iife.js` must exist on the box. Either commit the built artifact (simplest — Task 6 Step 6 commits it) or add a build step to deploy. This plan commits the artifact, so the prod pull ships it directly.

---

## Self-Review

**Spec coverage:** §3.1 widget bundle → Tasks 5–6; §3.2 connect popup → Task 3; §3.3 backend (token, CORS, routes) → Tasks 1–2, 6; §4 data flow → Tasks 3+5; §5 gate handling → Task 4 `gateMessage` + Task 5 consent retry; §6 security (origin pin, no public key, Bearer CORS) → Tasks 2–3, 5; §7 components → Tasks 1–6; §8 testing → tests in Tasks 1–4, 6 + manual Task 7; §9 rollout → Task 7; §10 open questions resolved: consent endpoint = `POST /api/consent` (Bearer, auto-grant in Task 5); `/api/sim/review` takes `url` in body (no tab assumption — Task 5 passes `location.href`); bundle delivery = commit IIFE artifact + serve (Task 6).

**Placeholder scan:** No TBD/TODO; every code step has concrete code; the only adapt-to-existing note is `vite.config.ts` shape (Task 6 Step 1), which shows the exact target config.

**Type consistency:** `issueExtensionToken(email, projectId?, ttlMs?)`, `originAllowedForProject(projectId, origin)`, `hostOfPattern(pattern)`, `parseScriptConfig`/`gateMessage`, `json(body,status,headers)`, `createSim`/`injectSimStyles`/`emotionFromSentiment` — names used consistently across tasks and match the verified source signatures.
