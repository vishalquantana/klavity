/**
 * /api/simwalk end-to-end integration — the /bug-check Sim walk-through.
 *
 * This drives the REAL route in a real server subprocess, against a real headless browser capture
 * of a real (stub) page, with a stub OpenRouter answering the persona + vision calls. Nothing about
 * the pipeline is re-implemented here, so what these assert is what a prospect gets.
 *
 * The unhappy paths are the point of most of this file. The walk is the free tool's hook, but the
 * verified findings underneath it are the substance — so every failure mode must return a clean,
 * explained error the page can degrade around, never a 500 and never a response that would leave
 * the client spinning.
 */
import { afterAll, beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-simwalk-${RUN}.db`)
const DB_FILE_CAP = join(tmpdir(), `klav-simwalk-cap-${RUN}.db`)

function rmDbFile(f: string) {
  for (const suffix of ["", "-wal", "-shm"]) { try { unlinkSync(f + suffix) } catch {} }
}

let pageServer: ReturnType<typeof Bun.serve>
let PAGE_BASE = ""
let aiServer: ReturnType<typeof Bun.serve>
let AI_BASE = ""
let appProc: ReturnType<typeof Bun.spawn>
let BASE = ""
let appProcCap: ReturnType<typeof Bun.spawn>
let BASE_CAP = ""

let personaCalls = 0
let reactCalls = 0
/** Flipped by a test to make every vision call fail, without touching the persona call. */
let reactFails = false

// Two named Sims with real roles. The route asks for SIMWALK_SIMS personas; the stub returns two,
// which also proves the client is not hardcoded to a fixed cast size.
const PERSONAS = JSON.stringify({
  personas: [
    { name: "Priya Nair", role: "Ops Lead", simClass: "user", side: "external", initials: "PN", accent: "#6366f1", summary: "Runs the daily sync.", insights: [] },
    { name: "Marcus Webb", role: "Finance Director", simClass: "client", side: "external", initials: "MW", accent: "#e8843a", summary: "Signs the cheque.", insights: [] },
  ],
})
// One anchored reaction (region present) and one page-level one (region null) — the two shapes the
// client has to render, exercised on every run.
const REACTIONS = JSON.stringify({
  reactions: [
    { observation: "The sync status just says undefined — I can't tell if it worked.", sentiment: "frustrated", emoji: "", targetDescription: "sync status line", region: { x: 0.05, y: 0.3, w: 0.6, h: 0.08 }, citedTraitIds: [], suggestedBug: null },
    { observation: "Nothing here tells me what this costs.", sentiment: "confused", emoji: "", targetDescription: "page overall", region: null, citedTraitIds: [], suggestedBug: null },
  ],
})

async function waitReady(base: string) {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) return
    await Bun.sleep(150)
  }
}

function spawnApp(port: number, db: string, capUsd: string, perMin: string) {
  return Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + db,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(53)).toString("base64"),
      KLAV_BASE_URL: `http://localhost:${port}`,
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: AI_BASE,
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      KLAV_FREETOOL_DAILY_CAP_USD: capUsd,
      KLAV_SIMWALK_SIMS: "2",
      KLAV_SIMWALK_PER_MIN: perMin,
    },
    stdout: "ignore",
    stderr: "ignore",
  })
}

beforeAll(async () => {
  pageServer = Bun.serve({
    port: 0,
    fetch() {
      // Deliberately taller than one viewport so the full-page capture is genuinely scrollable —
      // a walk over a single-screen image would not exercise the scroll path at all.
      return new Response(
        `<html><head><title>Acme App</title></head><body style="margin:0">
          <h1>Acme Dashboard</h1>
          <p>Welcome back. Your last sync was undefined.</p>
          <div style="height:2400px;background:linear-gradient(#eef,#fee)">Long body content for a tall page.</div>
          <footer>Contact us</footer>
        </body></html>`,
        { headers: { "content-type": "text/html" } },
      )
    },
  })
  PAGE_BASE = `http://localhost:${pageServer.port}`

  aiServer = Bun.serve({
    port: 0,
    async fetch(req) {
      const bodyText = await req.text()
      // The persona call is text-only; the vision call carries the screenshot as an image_url part.
      const isReact = bodyText.includes("image_url")
      if (isReact) {
        reactCalls++
        if (reactFails) return new Response("upstream exploded", { status: 500 })
        return Response.json({ choices: [{ message: { content: REACTIONS } }], usage: { prompt_tokens: 900, completion_tokens: 120, cost: 0.004 } })
      }
      personaCalls++
      return Response.json({ choices: [{ message: { content: PERSONAS } }], usage: { prompt_tokens: 400, completion_tokens: 200, cost: 0.001 } })
    },
  })
  AI_BASE = `http://localhost:${aiServer.port}`

  const port = 48600 + Math.floor(Math.random() * 200)
  BASE = `http://localhost:${port}`
  appProc = spawnApp(port, DB_FILE, "5", "50")

  const portCap = 48900 + Math.floor(Math.random() * 200)
  BASE_CAP = `http://localhost:${portCap}`
  // Below the walk's whole reservation (DEFAULT_AI_CALL_EST_USD * (1 + sims)) — the very first
  // walk of the day must be refused before a single model call or browser launch.
  appProcCap = spawnApp(portCap, DB_FILE_CAP, "0.001", "2")

  await Promise.all([waitReady(BASE), waitReady(BASE_CAP)])
}, 40_000)

afterAll(() => {
  appProc?.kill()
  appProcCap?.kill()
  pageServer?.stop(true)
  aiServer?.stop(true)
  rmDbFile(DB_FILE)
  rmDbFile(DB_FILE_CAP)
})

const walk = (base: string, url: string) =>
  fetch(`${base}/api/simwalk`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  })

test("happy path: personas + one shared full-page capture + a beat per Sim reaction", async () => {
  const before = { personaCalls, reactCalls }
  const res = await walk(BASE, `${PAGE_BASE}/`)
  expect(res.status).toBe(200)
  const d = await res.json()

  // The cast is real, named, and normalised.
  expect(d.cast.map((c: any) => c.name)).toEqual(["Priya Nair", "Marcus Webb"])
  expect(d.cast[0].role).toBe("Ops Lead")
  expect(d.cast.every((c: any) => /^#[0-9a-f]{3,8}$/i.test(c.accent))).toBe(true)

  // Bubble text is the model's actual in-persona line — NOT canned copy.
  const lines = d.beats.map((b: any) => b.observation)
  expect(lines).toContain("The sync status just says undefined — I can't tell if it worked.")
  expect(lines).toContain("Nothing here tells me what this costs.")
  expect(d.beats.every((b: any) => b.simName && b.initials)).toBe(true)

  // At least one beat is anchored to a region, so the client can point at what was said.
  expect(d.anchored).toBe(true)
  const anchored = d.beats.find((b: any) => b.region)
  expect(anchored.region.y).toBeCloseTo(0.3, 5)

  // Beats run down the page: the anchored y=0.3 reaction precedes the region-less follow-up.
  expect(d.beats[0].region).not.toBeNull()

  // A real JPEG capture came back, big enough to be a genuine full-page shot of a tall page.
  expect(d.screenshot.mediaType).toBe("image/jpeg")
  expect(d.screenshot.b64.length).toBeGreaterThan(2000)
  expect(Buffer.from(d.screenshot.b64, "base64").subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]))

  // COST SHAPE: exactly one persona call plus one vision call PER SIM. One capture, shared.
  expect(personaCalls - before.personaCalls).toBe(1)
  expect(reactCalls - before.reactCalls).toBe(2)
}, 90_000)

test("re-running the same URL is served from cache — a spike costs one set of model calls", async () => {
  const before = { personaCalls, reactCalls }
  const res = await walk(BASE, `${PAGE_BASE}/`)
  expect(res.status).toBe(200)
  const d = await res.json()
  expect(d.cached).toBe(true)
  expect(d.beats.length).toBeGreaterThan(0)
  expect(personaCalls).toBe(before.personaCalls)
  expect(reactCalls).toBe(before.reactCalls)
}, 30_000)

test("DEGRADED: every Sim's vision call failing returns an explained 503, not a 500", async () => {
  reactFails = true
  try {
    // A distinct URL so the cache from the happy path does not answer this.
    const res = await walk(BASE, `${PAGE_BASE}/no-reactions`)
    expect(res.status).toBe(503)
    const d = await res.json()
    // The copy must point the user at the scan that DID run — never a dead end.
    expect(String(d.error)).toContain("scan below still ran")
  } finally {
    reactFails = false
  }
}, 90_000)

test("DEGRADED: an unreachable URL is a clean 400, before any model call or browser launch", async () => {
  const before = { personaCalls, reactCalls }
  const res = await walk(BASE, "http://127.0.0.1:1/nope")
  expect(res.status).toBe(400)
  expect(String((await res.json()).error)).toMatch(/reach that URL|reach that page/)
  expect(personaCalls).toBe(before.personaCalls)
  expect(reactCalls).toBe(before.reactCalls)
}, 30_000)

test("SSRF: a private/loopback host that is not the test-allowlisted page server is refused", async () => {
  // The route reuses safeFetch, so link-local metadata endpoints never get a browser pointed at them.
  const res = await walk(BASE, "http://169.254.169.254/latest/meta-data/")
  expect(res.status).toBe(400)
  expect(res.status).not.toBe(200)
}, 30_000)

test("DEGRADED: a page with no readable text is refused before spending anything", async () => {
  const before = { personaCalls, reactCalls }
  const empty = Bun.serve({ port: 0, fetch: () => new Response("<html><body></body></html>", { headers: { "content-type": "text/html" } }) })
  try {
    const res = await walk(BASE, `http://localhost:${empty.port}/`)
    expect(res.status).toBe(400)
    expect(String((await res.json()).error)).toContain("didn't have enough text")
    expect(personaCalls).toBe(before.personaCalls)
    expect(reactCalls).toBe(before.reactCalls)
  } finally { empty.stop(true) }
}, 30_000)

test("the free-tool daily cap refuses the whole walk up front, spending nothing", async () => {
  const before = { personaCalls, reactCalls }
  const res = await walk(BASE_CAP, `${PAGE_BASE}/capped`)
  expect(res.status).toBe(429)
  expect(String((await res.json()).error)).toMatch(/busy right now/)
  // Pay-or-don't-start: no cast call, no vision calls, no browser launch.
  expect(personaCalls).toBe(before.personaCalls)
  expect(reactCalls).toBe(before.reactCalls)
}, 30_000)

test("a per-IP walk limit fires, and is distinguishable from the budget cap", async () => {
  // This server runs KLAV_SIMWALK_PER_MIN=2. Both refusals are 429, so the discriminator is the
  // Retry-After header the LIMITER sets and the budget cap does not — without it this assertion
  // would pass on a server where the limiter had been removed entirely.
  const seen: Array<{ status: number; retryAfter: string | null }> = []
  for (let i = 0; i < 6; i++) {
    const r = await walk(BASE_CAP, `${PAGE_BASE}/rl-${i}`)
    seen.push({ status: r.status, retryAfter: r.headers.get("retry-after") })
  }
  expect(seen.every((s) => s.status === 429)).toBe(true)
  expect(seen.some((s) => s.retryAfter === "60")).toBe(true)
}, 60_000)

test("a malformed body is rejected without reaching the pipeline", async () => {
  const res = await fetch(`${BASE}/api/simwalk`, {
    method: "POST", headers: { "content-type": "application/json" }, body: "{not json",
  })
  expect(res.status).toBeGreaterThanOrEqual(400)
  expect(res.status).toBeLessThan(500)
})

test("a missing URL is a 400 with usable copy", async () => {
  const res = await walk(BASE, "")
  expect(res.status).toBe(400)
  expect(String((await res.json()).error)).toContain("Enter your site URL")
})
