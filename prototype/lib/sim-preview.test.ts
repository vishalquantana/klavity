// sim-preview — screenshotUrl plumbing (browser factory injected, no real Chromium) + default persona.
import { test, expect } from "bun:test"
import { screenshotUrl, authedScreenshotUrl, projectHasHeadlessAuth, defaultPreviewPersona } from "./sim-preview"

// A minimal fake BrowserHandle/BrowserPage that records the calls screenshotUrl makes.
// `redirectTo` simulates the browser following a 3xx to another URL: goto re-runs the installed
// navigation guard on the redirect target (as a real browser + guardNavigations route would), and
// throws a blocked-navigation error when the guard rejects a hop — so no screenshot is taken.
function fakeAcquire(opts: { b64?: string; gotoThrows?: boolean; emptyShot?: boolean; redirectTo?: string } = {}) {
  const calls: any = { acquired: 0, goto: [] as string[], shots: 0, closed: 0, waited: 0, guarded: 0 }
  const acquire = async (_o?: any) => {
    calls.acquired++
    let guard: ((u: string) => boolean | Promise<boolean>) | null = null
    return {
      kind: "local",
      async newPage() {
        return {
          url() { return "" },
          async guardNavigations(isAllowed: (u: string) => boolean | Promise<boolean>) { guard = isAllowed; calls.guarded++ },
          async goto(u: string, _t: number) {
            if (opts.gotoThrows) throw new Error("nav fail")
            // The initial URL is already SSRF-validated upstream (server preflights via safeFetch), so
            // the guard's real job is redirect hops. Only exercise it against the simulated 3xx target.
            if (opts.redirectTo) {
              if (guard && !(await guard(opts.redirectTo))) throw new Error("net::ERR_BLOCKED_BY_CLIENT")
              calls.goto.push(opts.redirectTo)
            } else {
              calls.goto.push(u)
            }
          },
          async waitMs(_ms: number) { calls.waited++ },
          async screenshotJpeg(_q: number, _t: number) { calls.shots++; return opts.emptyShot ? "" : (opts.b64 ?? "QUJD".repeat(50)) },
          async krefSnapshot(_c?: number) { return "" },
        } as any
      },
      async close() { calls.closed++ },
    } as any
  }
  return { acquire, calls }
}

// A synchronous stand-in for the real url-guard so these tests do no DNS/network. Blocks the same
// literal hosts the real guard blocks (loopback / link-local metadata / private) + non-https.
function fakeUrlGuard(u: string): boolean {
  let parsed: URL
  try { parsed = new URL(u) } catch { return false }
  if (parsed.protocol !== "https:") return false
  const h = parsed.hostname
  if (h === "localhost" || h === "127.0.0.1" || h === "169.254.169.254") return false
  if (/^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return false
  return true
}

test("screenshotUrl navigates, screenshots, and always closes the browser", async () => {
  const { acquire, calls } = fakeAcquire({ b64: "SGVsbG8".repeat(30) })
  const res = await screenshotUrl("https://example.com", { settleMs: 5 }, { acquire })
  expect(res.mediaType).toBe("image/jpeg")
  expect(res.imageB64.length).toBeGreaterThan(100)
  expect(calls.acquired).toBe(1)
  expect(calls.goto).toEqual(["https://example.com"])
  expect(calls.shots).toBe(1)
  expect(calls.waited).toBe(1)
  expect(calls.closed).toBe(1) // browser released even on the happy path
})

test("screenshotUrl closes the browser even when navigation throws", async () => {
  const { acquire, calls } = fakeAcquire({ gotoThrows: true })
  await expect(screenshotUrl("https://bad.example", { settleMs: 0 }, { acquire })).rejects.toThrow()
  expect(calls.closed).toBe(1) // finally-block release on failure
})

// ── QA #1: SSRF-via-redirect — a redirect to an internal/metadata host must be blocked ────────────

test("screenshotUrl installs the navigation guard before navigating", async () => {
  const { acquire, calls } = fakeAcquire({ b64: "SGVsbG8".repeat(30) })
  await screenshotUrl("https://example.com", { settleMs: 0 }, { acquire, isUrlAllowed: fakeUrlGuard })
  expect(calls.guarded).toBe(1) // guard installed exactly once, before goto
})

test("screenshotUrl blocks a 302 to the cloud-metadata IP (no content returned)", async () => {
  const { acquire, calls } = fakeAcquire({ redirectTo: "http://169.254.169.254/latest/meta-data/" })
  await expect(
    screenshotUrl("https://safe-looking.example", { settleMs: 0 }, { acquire, isUrlAllowed: fakeUrlGuard }),
  ).rejects.toThrow()
  expect(calls.shots).toBe(0)   // never screenshotted the internal content
  expect(calls.goto).toHaveLength(0)
  expect(calls.closed).toBe(1)  // browser still released
})

test("screenshotUrl blocks a redirect to loopback / a private host", async () => {
  for (const bad of ["https://127.0.0.1/", "https://10.0.0.5/admin", "http://192.168.1.1/"]) {
    const { acquire, calls } = fakeAcquire({ redirectTo: bad })
    await expect(
      screenshotUrl("https://safe.example", { settleMs: 0 }, { acquire, isUrlAllowed: fakeUrlGuard }),
    ).rejects.toThrow()
    expect(calls.shots).toBe(0)
  }
})

test("screenshotUrl allows a redirect to another PUBLIC https host", async () => {
  const { acquire, calls } = fakeAcquire({ redirectTo: "https://www.example.org/landing", b64: "SGVsbG8".repeat(30) })
  const res = await screenshotUrl("https://example.com", { settleMs: 0 }, { acquire, isUrlAllowed: fakeUrlGuard })
  expect(res.imageB64.length).toBeGreaterThan(100)
  expect(calls.shots).toBe(1)
  expect(calls.goto).toEqual(["https://www.example.org/landing"])
})

test("authedScreenshotUrl also installs the navigation guard and blocks an internal redirect", async () => {
  const { acquire, calls } = fakeAcquire({ redirectTo: "http://169.254.169.254/" })
  await expect(
    authedScreenshotUrl("https://app.example", "p1", { settleMs: 0 }, {
      acquire, loadAuthConfig: async () => null, isUrlAllowed: fakeUrlGuard,
    }),
  ).rejects.toThrow()
  expect(calls.guarded).toBe(1)
  expect(calls.shots).toBe(0)
  expect(calls.closed).toBe(1)
})

test("screenshotUrl rejects an empty/too-small screenshot", async () => {
  const { acquire } = fakeAcquire({ emptyShot: true })
  await expect(screenshotUrl("https://example.com", { settleMs: 0 }, { acquire })).rejects.toThrow(/empty screenshot/)
})

test("defaultPreviewPersona is an ephemeral first-visitor persona with 3 insights", () => {
  const p = defaultPreviewPersona()
  expect(p.name).toBeTruthy()
  expect(p.insights).toHaveLength(3)
  expect(p.insights.map((i) => i.kind).sort()).toEqual(["love", "pain", "want"])
  expect((p as any).id).toBeUndefined() // ephemeral — no saved-Sim id
})

// ── KLA-264 (JTBD 3.12): behind-auth previews ─────────────────────────────────────────────────────

const mintCfg = { projectId: "p1", method: "mint_link" as const, email: "a@b.co", secret: "tok123", notes: null }
const otpCfg = { projectId: "p1", method: "fixed_otp" as const, email: "a@b.co", secret: "666666", notes: null }

test("authedScreenshotUrl establishes a mint_link session before shooting, returns authed:true", async () => {
  const { acquire, calls } = fakeAcquire({ b64: "SGVsbG8".repeat(30) })
  let established = 0
  const res = await authedScreenshotUrl("https://app.example/dashboard", "p1", { settleMs: 0 }, {
    acquire,
    loadAuthConfig: async () => mintCfg,
    establishSession: async (_page, _cfg, _base) => { established++; return { established: true, method: "mint_link" } },
  })
  expect(res.authed).toBe(true)          // the shot shows the authed state
  expect(res.mediaType).toBe("image/jpeg")
  expect(res.imageB64.length).toBeGreaterThan(100)
  expect(established).toBe(1)            // logged in exactly once, before the shot
  expect(calls.goto).toContain("https://app.example/dashboard")
  expect(calls.shots).toBe(1)
  expect(calls.closed).toBe(1)          // browser always released
})

test("authedScreenshotUrl falls back to a public shot (authed:false) when no auth method is configured", async () => {
  const { acquire } = fakeAcquire()
  const res = await authedScreenshotUrl("https://public.example", "p1", { settleMs: 0 }, {
    acquire,
    loadAuthConfig: async () => null,
    establishSession: async () => { throw new Error("should not be called") },
  })
  expect(res.authed).toBe(false)
  expect(res.imageB64.length).toBeGreaterThan(100)
})

test("authedScreenshotUrl does NOT try to headlessly log in a fixed_otp project (needs a form fill)", async () => {
  const { acquire } = fakeAcquire()
  let established = 0
  const res = await authedScreenshotUrl("https://app.example", "p1", { settleMs: 0 }, {
    acquire,
    loadAuthConfig: async () => otpCfg,
    establishSession: async () => { established++; return { established: true, method: "fixed_otp" } },
  })
  expect(res.authed).toBe(false)   // fixed_otp is not establishable in a plain headless tab
  expect(established).toBe(0)
})

test("authedScreenshotUrl still releases the browser when the shot fails", async () => {
  const { acquire, calls } = fakeAcquire({ emptyShot: true })
  await expect(authedScreenshotUrl("https://app.example", "p1", { settleMs: 0 }, {
    acquire, loadAuthConfig: async () => null,
  })).rejects.toThrow(/empty screenshot/)
  expect(calls.closed).toBe(1)
})

test("authedScreenshotUrl never surfaces the decrypted secret in its result", async () => {
  const { acquire } = fakeAcquire()
  const res = await authedScreenshotUrl("https://app.example", "p1", { settleMs: 0 }, {
    acquire,
    loadAuthConfig: async () => mintCfg,
    establishSession: async () => ({ established: true, method: "mint_link" }),
  })
  const serialized = JSON.stringify(res)
  expect(serialized).not.toContain(mintCfg.secret)
  expect(serialized).not.toContain(mintCfg.email)
})

test("projectHasHeadlessAuth is true only for mint_link configs", async () => {
  expect(await projectHasHeadlessAuth("p1", { loadAuthConfig: async () => mintCfg })).toBe(true)
  expect(await projectHasHeadlessAuth("p1", { loadAuthConfig: async () => otpCfg })).toBe(false)
  expect(await projectHasHeadlessAuth("p1", { loadAuthConfig: async () => null })).toBe(false)
})
