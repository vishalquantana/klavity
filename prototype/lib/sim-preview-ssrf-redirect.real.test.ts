// REAL-CHROMIUM SSRF-via-redirect test (KLAVITYKLA-405 / QA#1 re-open).
//
// Why a real browser: the prior hermetic test (sim-preview.test.ts) used a fake page whose goto()
// re-ran the nav guard on the redirect target — which is exactly the ASSUMPTION that was false. Against
// real Chromium, a plain route.continue() lets the network stack auto-follow a 302 WITHOUT re-invoking
// the route handler, so the redirect destination was fetched and rendered. This test drives the REAL
// PlaywrightPage.guardNavigations (via acquireBrowser) at a local server that 302s to a denied host and
// asserts the denied destination is NEVER fetched and no screenshot is returned. Covers BOTH the public
// (screenshotUrl) and authed (authedScreenshotUrl) capture paths.
import { test, expect, beforeAll, afterAll } from "bun:test"
import http from "node:http"
import { screenshotUrl, authedScreenshotUrl } from "./sim-preview"
import { isSafeUrl } from "./url-guard"

const SECRET = "SECRET-INTERNAL-CONTENT-DO-NOT-LEAK"
const hits: string[] = []
let server: http.Server
let base = ""

// Local origin behaves like a "public" site that redirects internally:
//   /start        -> 302 -> /private            (private/internal page)
//   /start-meta   -> 302 -> http://169.254.169.254/   (cloud metadata — blocked by the REAL guard)
//   /start-pub    -> 302 -> /pub                (an allowed public destination)
//   /private,/pub -> 200 html
beforeAll(async () => {
  server = http.createServer((req, res) => {
    hits.push(req.url || "")
    if (req.url === "/start") { res.writeHead(302, { Location: "/private" }); res.end("redir") }
    else if (req.url === "/start-meta") { res.writeHead(302, { Location: "http://169.254.169.254/latest/meta-data/" }); res.end("redir") }
    else if (req.url === "/start-pub") { res.writeHead(302, { Location: "/pub" }); res.end("redir") }
    else if (req.url === "/private") { res.writeHead(200, { "Content-Type": "text/html" }); res.end(`<html><body><h1>${SECRET}</h1></body></html>`) }
    else if (req.url === "/pub") { res.writeHead(200, { "Content-Type": "text/html" }); res.end("<html><body><h1>public landing page here</h1></body></html>") }
    else { res.writeHead(404); res.end("nope") }
  })
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()))
  const addr = server.address()
  const port = typeof addr === "object" && addr ? addr.port : 0
  base = `http://127.0.0.1:${port}`
})

afterAll(() => { server?.close() })

// Path-based guard for the local /private case: the entrypoint host is allowed, the internal
// destination path is denied. Models "public host that 302s to an internal path".
const allowEntryDenyPrivate = (u: string): boolean => {
  try {
    const p = new URL(u)
    if (p.hostname !== "127.0.0.1") return false
    return p.pathname === "/start" || p.pathname === "/start-pub" || p.pathname === "/pub"
  } catch { return false }
}

// Guard that combines a whitelisted local entry with the REAL SSRF guard for every other host — so a
// redirect to the real 169.254.169.254 metadata IP is judged by production logic (isSafeUrl).
const realGuardWithLocalEntry = async (u: string): Promise<boolean> => {
  try { if (new URL(u).hostname === "127.0.0.1" && new URL(u).pathname === "/start-meta") return true } catch { return false }
  return await isSafeUrl(u)
}

test("REAL Chromium: 302 -> /private is blocked; internal content never fetched or screenshotted", async () => {
  hits.length = 0
  await expect(
    screenshotUrl(`${base}/start`, { settleMs: 0, navTimeoutMs: 8000 }, { isUrlAllowed: allowEntryDenyPrivate }),
  ).rejects.toThrow()
  // The denied destination must NEVER have been requested (not by the browser, not by the guard's
  // maxRedirects:0 fetch). /start may be hit; /private must not be.
  expect(hits).not.toContain("/private")
}, 30000)

test("REAL Chromium: 302 -> 169.254.169.254 metadata IP is blocked by the real url-guard", async () => {
  hits.length = 0
  await expect(
    screenshotUrl(`${base}/start-meta`, { settleMs: 0, navTimeoutMs: 8000 }, { isUrlAllowed: realGuardWithLocalEntry }),
  ).rejects.toThrow()
  // Server saw the entrypoint; the metadata redirect target was aborted pre-fetch by the guard.
  expect(hits).toContain("/start-meta")
}, 30000)

test("REAL Chromium: 302 -> an ALLOWED public destination still succeeds (guard is not over-broad)", async () => {
  hits.length = 0
  const res = await screenshotUrl(`${base}/start-pub`, { settleMs: 0, navTimeoutMs: 8000 }, { isUrlAllowed: allowEntryDenyPrivate })
  expect(res.mediaType).toBe("image/jpeg")
  expect(res.imageB64.length).toBeGreaterThan(100)
  expect(hits).toContain("/pub") // the allowed redirect target WAS followed and rendered
}, 30000)

test("REAL Chromium (authed path): 302 -> /private is blocked in authedScreenshotUrl too", async () => {
  hits.length = 0
  await expect(
    authedScreenshotUrl(`${base}/start`, "p1", { settleMs: 0, navTimeoutMs: 8000 }, {
      isUrlAllowed: allowEntryDenyPrivate,
      loadAuthConfig: async () => null, // public fallback; still must block the redirect
    }),
  ).rejects.toThrow()
  expect(hits).not.toContain("/private")
}, 30000)
