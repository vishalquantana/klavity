// KLAVITYKLA-318 regression guard: the legacy domain (klavity.quantana.top) used to 301 EVERY path
// to klavity.in, including /api/*. A redirected cross-origin fetch drops the
// Access-Control-Allow-Origin header, so any extension/widget whose cached backend still pointed at
// the old host hard-failed with an opaque "No 'Access-Control-Allow-Origin' header is present"
// (observed live on vchar.quantana.top, 2026-07-13).
//
// Contract locked in here:
//   - legacy-host /api/*  → served in place, WITH reflected-Origin CORS (never a 301)
//   - legacy-host site paths → still 301 to klavity.in (SEO)
// Spawns a real server subprocess and sets an explicit Host header (mirrors server.assets.test.ts).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const LEGACY_HOST = "klavity.quantana.top"
const ORIGIN = "https://vchar.quantana.top"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-legacy-domain-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

// fetch() forbids setting Host, so talk to the socket directly.
async function rawGet(path: string, headers: Record<string, string>): Promise<{ status: number; headers: Map<string, string>; location?: string }> {
  const lines = [
    `GET ${path} HTTP/1.1`,
    `Host: ${headers.host}`,
    ...Object.entries(headers).filter(([k]) => k.toLowerCase() !== "host").map(([k, v]) => `${k}: ${v}`),
    "Connection: close",
    "",
    "",
  ].join("\r\n")

  const chunks: Uint8Array[] = []
  await new Promise<void>((resolve, reject) => {
    Bun.connect({
      hostname: "localhost",
      port: serverPort,
      socket: {
        open(sock) { sock.write(lines) },
        data(_sock, data) { chunks.push(new Uint8Array(data)) },
        close() { resolve() },
        error(_sock, err) { reject(err) },
      },
    }).catch(reject)
  })

  const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8")
  const head = text.split("\r\n\r\n")[0] || ""
  const [statusLine, ...headerLines] = head.split("\r\n")
  const status = Number((statusLine || "").split(" ")[1] || 0)
  const map = new Map<string, string>()
  for (const l of headerLines) {
    const i = l.indexOf(":")
    if (i > 0) map.set(l.slice(0, i).trim().toLowerCase(), l.slice(i + 1).trim())
  }
  return { status, headers: map, location: map.get("location") }
}

beforeAll(async () => {
  serverPort = 31000 + Math.floor(Math.random() * 1000)
  base = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill() })

test("legacy-host /api/extension/match is NOT 301'd (the redirect strips CORS)", async () => {
  const r = await rawGet("/api/extension/match?url=https%3A%2F%2Fvchar.quantana.top%2F", {
    host: LEGACY_HOST,
    origin: ORIGIN,
  })
  expect(r.status).not.toBe(301)
  expect(r.status).not.toBe(302)
})

test("legacy-host /api/extension/match answers with reflected-Origin CORS", async () => {
  const r = await rawGet("/api/extension/match?url=https%3A%2F%2Fvchar.quantana.top%2F", {
    host: LEGACY_HOST,
    origin: ORIGIN,
  })
  // Whatever the handler decides (200 / 401 / 400), the browser must be able to READ it.
  expect(r.headers.get("access-control-allow-origin")).toBe(ORIGIN)
})

test("legacy-host /api/health is served in place, not redirected", async () => {
  const r = await rawGet("/api/health", { host: LEGACY_HOST, origin: ORIGIN })
  expect(r.status).toBe(200)
})

test("legacy-host NON-api paths still 301 to klavity.in (SEO preserved)", async () => {
  const r = await rawGet("/pricing", { host: LEGACY_HOST })
  expect(r.status).toBe(301)
  expect(r.location).toBe("https://klavity.in/pricing")
})

test("legacy-host /widget.js is still served in place (never redirected)", async () => {
  const r = await rawGet("/widget.js", { host: LEGACY_HOST })
  expect(r.status).toBe(200)
})
