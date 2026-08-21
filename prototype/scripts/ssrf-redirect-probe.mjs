// Real-Chromium probe for the SSRF-via-redirect hole (KLAVITYKLA-405 / QA#1 re-open).
// Starts a local HTTP server:  GET /start -> 302 -> /private ("SECRET-INTERNAL-CONTENT").
// Installs a guard that ALLOWS /start but DENIES /private, then navigates a real Chromium at /start.
// A correct guard must ensure the browser never fetches or renders /private.
//
// Usage:  bunx playwright ... (chromium must be installed)  →  node/bun scripts/ssrf-redirect-probe.mjs [old|new]
import http from "node:http"
import { chromium } from "playwright"

const MODE = process.argv[2] === "new" ? "new" : "old"
const SECRET = "SECRET-INTERNAL-CONTENT-169254"

const server = http.createServer((req, res) => {
  if (req.url === "/start") {
    res.writeHead(302, { Location: "/private" })
    res.end("redirecting")
  } else if (req.url === "/private") {
    res.writeHead(200, { "Content-Type": "text/html" })
    res.end(`<html><body><h1>${SECRET}</h1></body></html>`)
  } else {
    res.writeHead(404); res.end("nope")
  }
})

await new Promise((r) => server.listen(0, "127.0.0.1", r))
const port = server.address().port
const base = `http://127.0.0.1:${port}`

// Guard: allow the /start entrypoint, deny everything else (models "public host 302s to internal").
const isAllowed = (u) => {
  try { return new URL(u).pathname === "/start" } catch { return false }
}

// ── OLD guard (current code in trails-browser-page.ts) — route('**/*') + continue() ──────────────
async function installOldGuard(page) {
  await page.route("**/*", async (route) => {
    const req = route.request()
    if (!req.isNavigationRequest()) { await route.continue().catch(() => {}); return }
    let ok = false
    try { ok = await isAllowed(req.url()) } catch { ok = false }
    if (ok) await route.continue().catch(() => {})
    else await route.abort("blockedbyclient").catch(() => {})
  })
}

// ── NEW guard (proposed fix) — fetch each nav with maxRedirects:0, validate Location, re-fulfill ──
async function installNewGuard(page) {
  await page.route("**/*", async (route) => {
    const req = route.request()
    if (!req.isNavigationRequest()) { await route.continue().catch(() => {}); return }
    let ok = false
    try { ok = await isAllowed(req.url()) } catch { ok = false }
    if (!ok) { await route.abort("blockedbyclient").catch(() => {}); return }
    let response
    try { response = await route.fetch({ maxRedirects: 0 }) }
    catch { await route.abort("failed").catch(() => {}); return }
    const status = response.status()
    if (status >= 300 && status < 400) {
      const loc = response.headers()["location"]
      if (loc) {
        let next
        try { next = new URL(loc, req.url()).toString() } catch { next = null }
        let nextOk = false
        try { nextOk = next ? await isAllowed(next) : false } catch { nextOk = false }
        if (!nextOk) { await route.abort("blockedbyclient").catch(() => {}); return }
      }
    }
    await route.fulfill({ response }).catch(() => { route.abort("failed").catch(() => {}) })
  })
}

const browser = await chromium.launch({ headless: true })
let leaked = false, finalUrl = "", content = ""
try {
  const page = await browser.newPage()
  if (MODE === "new") await installNewGuard(page); else await installOldGuard(page)
  try { await page.goto(`${base}/start`, { timeout: 8000, waitUntil: "domcontentloaded" }) } catch (e) { /* blocked nav throws */ }
  finalUrl = page.url()
  content = await page.content().catch(() => "")
  leaked = content.includes(SECRET)
} finally {
  await browser.close().catch(() => {})
  server.close()
}

console.log(JSON.stringify({ mode: MODE, finalUrl, leaked, snippet: content.slice(0, 120).replace(/\n/g, " ") }, null, 2))
console.log(leaked ? "RESULT: LEAKED internal content (VULNERABLE)" : "RESULT: blocked (SAFE)")
process.exit(leaked ? 1 : 0)
