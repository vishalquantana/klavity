// KLAVITYKLA-337 — regression guard for the /alternatives/marker-io comparison page.
//
// The page shipped with a brand-new HTTP route in server.ts plus a new entry in the
// /sitemap.xml core list and ZERO test coverage: nothing asserted the route returned
// 200, that the SEO contract held (exactly one <h1>, canonical, parseable JSON-LD with
// FAQPage + SoftwareApplication + BreadcrumbList), or that the sitemap still listed it.
// A refactor of the marketing-route block could 404 the page — or silently drop it from
// the sitemap — and every test would still pass. These tests close that hole.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-alt-marker-${RUN}.db`)
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
  const port = 48300 + Math.floor(Math.random() * 200)
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

// Cache the page body across tests — one fetch, many assertions.
let pageHtml = ""
async function page(): Promise<string> {
  if (!pageHtml) {
    const res = await fetch(`${BASE}/alternatives/marker-io`)
    expect(res.status).toBe(200)
    pageHtml = await res.text()
  }
  return pageHtml
}

test("GET /alternatives/marker-io returns 200 HTML (route exists)", async () => {
  const res = await fetch(`${BASE}/alternatives/marker-io`)
  expect(res.status).toBe(200)
  expect(res.headers.get("content-type") || "").toContain("text/html")
  const html = await res.text()
  expect(html.length).toBeGreaterThan(1000)
  expect(html).toContain("Marker.io")
})

test("page has exactly one <h1> and it names the target keyword", async () => {
  const html = await page()
  const h1s = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) ?? []
  expect(h1s.length).toBe(1)
  const h1Text = h1s[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  expect(h1Text).toContain("Marker.io Alternative")
})

test("page declares the canonical URL for /alternatives/marker-io", async () => {
  const html = await page()
  expect(html).toContain('<link rel="canonical" href="https://klavity.in/alternatives/marker-io">')
})

test("every JSON-LD block parses and the required schema types are present", async () => {
  const html = await page()
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
  expect(blocks.length).toBeGreaterThan(0)

  const types = new Set<string>()
  const collect = (node: any) => {
    if (Array.isArray(node)) return node.forEach(collect)
    if (!node || typeof node !== "object") return
    if (typeof node["@type"] === "string") types.add(node["@type"])
    if (Array.isArray(node["@graph"])) node["@graph"].forEach(collect)
  }

  for (const raw of blocks) {
    // Must be valid JSON — a stray trailing comma or smart quote makes Google drop the
    // whole block silently, which is exactly the failure this test exists to catch.
    let parsed: any
    expect(() => { parsed = JSON.parse(raw) }).not.toThrow()
    collect(parsed)
  }

  expect(types.has("FAQPage")).toBe(true)
  expect(types.has("SoftwareApplication")).toBe(true)
  expect(types.has("BreadcrumbList")).toBe(true)
})

test("page internally links to /snap, /sims and /pricing", async () => {
  const html = await page()
  for (const href of ["/snap", "/sims", "/pricing"]) {
    expect(html).toContain(`href="${href}"`)
  }
})

test("page contains no curly/smart quotes (has broken this site before)", async () => {
  const html = await page()
  const bad = html.match(/[‘’“”]/g) ?? []
  expect(bad.length).toBe(0)
})

test("/sitemap.xml still lists the marker-io alternative page", async () => {
  const res = await fetch(`${BASE}/sitemap.xml`)
  expect(res.status).toBe(200)
  expect(res.headers.get("content-type") || "").toContain("text/xml")
  const xml = await res.text()
  expect(xml).toContain("<loc>https://klavity.in/alternatives/marker-io</loc>")
})
