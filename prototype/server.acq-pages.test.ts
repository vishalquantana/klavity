// KLAVITYKLA-526 — regression guard for the acquisition landing pages:
//   /alternatives/bugherd, /for/agencies, /for/saas-teams
//
// Mirrors the marker-io guard: each page must return 200 HTML, hold the SEO
// contract (exactly one <h1>, correct canonical, parseable JSON-LD, no smart
// quotes), and stay listed in /sitemap.xml. A refactor of the marketing-route
// block could 404 a page or silently drop it from the sitemap; these tests
// close that hole. Also asserts the retired KLA-525 leads never resurface.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-acq-${RUN}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(61)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

let appProc: ReturnType<typeof Bun.spawn>
let BASE = ""

beforeAll(async () => {
  const port = await __freePortKLA719()
  BASE = `http://localhost:${port}`
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_POSTHOG_KEY: "phc_acqpages_test",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => {
  appProc?.kill()
  rmDb()
})

const PAGES = [
  { path: "/alternatives/bugherd", canonical: "https://klavity.in/alternatives/bugherd", keyword: "BugHerd" },
  { path: "/for/agencies", canonical: "https://klavity.in/for/agencies", keyword: "agenc" },
  { path: "/for/saas-teams", canonical: "https://klavity.in/for/saas-teams", keyword: "SaaS" },
]

const cache = new Map<string, string>()
async function page(p: string): Promise<string> {
  if (!cache.has(p)) {
    const res = await fetch(`${BASE}${p}`)
    expect(res.status).toBe(200)
    cache.set(p, await res.text())
  }
  return cache.get(p)!
}

for (const P of PAGES) {
  test(`GET ${P.path} returns 200 HTML (route exists)`, async () => {
    const res = await fetch(`${BASE}${P.path}`)
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type") || "").toContain("text/html")
    const html = await res.text()
    expect(html.length).toBeGreaterThan(1000)
    expect(html).toContain(P.keyword)
  })

  test(`${P.path} has exactly one <h1>`, async () => {
    const html = await page(P.path)
    const h1s = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) ?? []
    expect(h1s.length).toBe(1)
  })

  test(`${P.path} declares its canonical URL`, async () => {
    const html = await page(P.path)
    expect(html).toContain(`<link rel="canonical" href="${P.canonical}">`)
  })

  test(`${P.path} JSON-LD parses`, async () => {
    const html = await page(P.path)
    const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
    expect(blocks.length).toBeGreaterThan(0)
    for (const raw of blocks) {
      expect(() => JSON.parse(raw)).not.toThrow()
    }
  })

  test(`${P.path} has no curly/smart quotes`, async () => {
    const html = await page(P.path)
    const bad = html.match(/[‘’“”]/g) ?? []
    expect(bad.length).toBe(0)
  })

  test(`${P.path} substitutes the PostHog key via htmlPage()`, async () => {
    const html = await page(P.path)
    // htmlPage() replaces __POSTHOG_KEY__ with KLAV_POSTHOG_KEY — the injected test key
    // must appear and the raw template token must be gone.
    expect(html).toContain("phc_acqpages_test")
    expect(html).not.toContain("__POSTHOG_KEY__")
  })

  test(`${P.path} title/H1 do not use retired KLA-525 leads`, async () => {
    const html = await page(P.path)
    const head = html.slice(0, html.indexOf("</head>") + 7)
    const h1 = (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i)?.[0] ?? "")
    const hay = (head + " " + h1).toLowerCase()
    expect(hay).not.toContain("before your customers do")
    expect(hay).not.toContain("before your clients do")
    expect(hay).not.toContain("synthetic user")
  })

  test(`/sitemap.xml lists ${P.path}`, async () => {
    const res = await fetch(`${BASE}/sitemap.xml`)
    expect(res.status).toBe(200)
    const xml = await res.text()
    expect(xml).toContain(`<loc>https://klavity.in${P.path}</loc>`)
  })
}
