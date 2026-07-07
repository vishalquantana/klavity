// Plan E2 Task 2 — opt-in rrweb capture during a real-Chromium multi-page Walk.
// Reuses the existing journey trajectory shape + fixtures. Asserts:
//   - replay:true captures ≥2 per-page segments (the journey navigates landing→login→products→cart→confirm)
//     with events > 0, and a segment exists at/around the Checkout (idx 5) heal boundary;
//   - replay OFF (default) stores NOTHING (default-off proof, engine behavior unchanged).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const file = join(tmpdir(), `klav-replay-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")
const R = await import("./trails-replay")

const landingOf = (dir: string) =>
  pathToFileURL(resolve(import.meta.dir, "..", "test-fixtures", dir, "landing.html")).href

// Same crystallized journey shape as lib/trails-journey.e2e.test.ts: concrete #id selectors, click-
// driven multi-page navigation (no explicit navigate steps), final order-confirmation assert.
function journeyTrajectory() {
  const base = landingOf("journey")
  return {
    name: "Buy a widget end-to-end",
    intent: "land, sign in, add a widget to the cart, check out, reach the order confirmation",
    baseUrl: base,
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: base, domHash: "landing",
        target: { role: "button", accessibleName: "Start", text: "Start", testId: "start-link", resolvedSelector: "#start" } },
      { action: "type" as const, actionValue: "buyer@test.dev", url: base, domHash: "login",
        target: { role: "textbox", accessibleName: "Email", testId: "email-input", resolvedSelector: "#email" } },
      { action: "click" as const, url: base, domHash: "login",
        target: { role: "button", accessibleName: "Sign in", text: "Sign in", testId: "signin-btn", resolvedSelector: "#signin" } },
      { action: "click" as const, url: base, domHash: "products",
        target: { role: "button", accessibleName: "Add to cart", text: "Add to cart", testId: "add-to-cart-btn", resolvedSelector: "#add-to-cart" } },
      { action: "click" as const, url: base, domHash: "products",
        target: { role: "button", accessibleName: "Cart", text: "Cart", testId: "cart-link", resolvedSelector: "#cart" } },
      { action: "click" as const, url: base, domHash: "cart",
        target: { role: "button", accessibleName: "Checkout", text: "Checkout", testId: "checkout-link", resolvedSelector: "#checkout" } },
      { action: "assert" as const, checkpoint: { description: "order confirmation shown" }, url: base, domHash: "confirm",
        target: { role: "heading", accessibleName: "Order confirmed", text: "Order confirmed", testId: "order-confirmation", resolvedSelector: "#order-confirmation" } },
    ],
  }
}

const IDX_CHECKOUT = 5 // the cart Checkout step (the drift point)

test("replay:true captures per-page rrweb segments for a multi-page walk (drift-t1, Tier-1 heal)", async () => {
  const projectId = "proj_replay_e2e"
  const { trailId } = await crystallize(projectId, journeyTrajectory())

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: landingOf("journey-drift-t1"), replay: true })

  // Sanity: the walk itself still behaves like Layer C/D (AMBER heal at Checkout, no model call).
  expect(summary.verdict).toBe("amber")
  expect(summary.llmCalls).toBe(0)

  const segs = await R.getReplay(projectId, summary.runId)
  expect(segs).not.toBeNull()
  // Multiple documents recorded → multiple segments (landing/login/products/cart/confirm).
  expect(segs!.length).toBeGreaterThanOrEqual(2)
  // Total events captured across all pages.
  const totalEvents = segs!.reduce((n, s) => n + s.events.length, 0)
  expect(totalEvents).toBeGreaterThan(0)
  // Every segment carries a url + a non-negative idx boundary tag.
  for (const s of segs!) {
    expect(typeof s.url).toBe("string")
    expect(s.url.length).toBeGreaterThan(0)
    expect(s.idx).toBeGreaterThanOrEqual(0)
  }
  // The cart page (where the Checkout heal happened, idx 5) is captured: a segment whose boundary
  // sits at or before the Checkout step and at least one segment AFTER it (the confirm page).
  expect(segs!.some((s) => s.idx <= IDX_CHECKOUT)).toBe(true)
  expect(segs!.some((s) => s.idx > IDX_CHECKOUT)).toBe(true)
}, 60000)

test("replay OFF (default) stores nothing — engine behavior unchanged", async () => {
  const projectId = "proj_replay_off"
  const { trailId } = await crystallize(projectId, journeyTrajectory())
  const summary = await walkTrail(projectId, trailId, { fixtureUrl: landingOf("journey") })
  expect(summary.verdict).toBe("green")
  expect(await R.getReplay(projectId, summary.runId)).toBeNull()
}, 60000)

test("replays do NOT record real input values or credentials (KLA-60)", async () => {
  const projectId = "proj_replay_masking"
  const SENTINEL_PASS = "SUPER-SECRET-SENTINEL-PASSWORD-999"
  const SENTINEL_EMAIL = "super-secret-buyer@test.dev"
  const base = landingOf("journey")
  
  const { trailId } = await crystallize(projectId, {
    name: "Masking test",
    intent: "test input masking",
    baseUrl: base,
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: base, domHash: "landing",
        target: { role: "button", accessibleName: "Start", text: "Start", testId: "start-link", resolvedSelector: "#start" } },
      { action: "type" as const, actionValue: SENTINEL_EMAIL, url: base, domHash: "login",
        target: { role: "textbox", accessibleName: "Email", testId: "email-input", resolvedSelector: "#email" } },
      { action: "type" as const, actionValue: "{{cred:admin:password}}", url: base, domHash: "login",
        target: { role: "textbox", accessibleName: "Password", testId: "password-input", resolvedSelector: "#password" } },
      { action: "click" as const, url: base, domHash: "login",
        target: { role: "button", accessibleName: "Sign in", text: "Sign in", testId: "signin-btn", resolvedSelector: "#signin" } },
    ],
  })

  const credResolver = async () => SENTINEL_PASS

  const summary = await walkTrail(projectId, trailId, {
    fixtureUrl: landingOf("journey"),
    replay: true,
    credResolver
  })

  expect(summary.verdict).toBe("green")

  const segs = await R.getReplay(projectId, summary.runId)
  expect(segs).not.toBeNull()

  const serialized = JSON.stringify(segs)
  expect(serialized).not.toContain(SENTINEL_PASS)
  expect(serialized).not.toContain(SENTINEL_EMAIL)

  const row = await reconnectDb("file:" + file).execute({
    sql: "SELECT segments_gz FROM walk_replays WHERE run_id=?",
    args: [summary.runId]
  })
  expect(row.rows.length).toBe(1)
  const gz = Buffer.from(String((row.rows[0] as any).segments_gz), "base64")
  const rawSegmentsJson = Buffer.from(Bun.gunzipSync(gz)).toString()
  expect(rawSegmentsJson).not.toContain(SENTINEL_PASS)
  expect(rawSegmentsJson).not.toContain(SENTINEL_EMAIL)
}, 60000)

test("replay capping: synthetic event flood yields bounded buffer, snapshot retained, truncated flag set", async () => {
  const origMax = process.env.KLAV_REPLAY_MAX_EVENTS
  const origTotal = process.env.KLAV_REPLAY_MAX_TOTAL_EVENTS
  process.env.KLAV_REPLAY_MAX_EVENTS = "10"
  process.env.KLAV_REPLAY_MAX_TOTAL_EVENTS = "25"

  try {
    let bindingCallback: any = null
    const mockContext: any = {
      exposeBinding: async (name: string, cb: any) => {
        if (name === "__klavReplayPush") bindingCallback = cb
      },
      addInitScript: async () => {}
    }

    const cap = await R.setupReplayCapture(mockContext)

    expect(bindingCallback).not.toBeNull()

    // 1. Generate synthetic events. We want a full snapshot (type 2) at the start, and then many subsequent events (type 3).
    const events: any[] = [
      { type: 4, timestamp: 1 }, // meta
      { type: 2, timestamp: 2, data: "snapshot" }, // snapshot
    ]
    for (let i = 0; i < 20; i++) {
      events.push({ type: 3, timestamp: 10 + i, data: `mutation_${i}` })
    }

    // Push events to the binding callback
    await bindingCallback({}, events)
    expect(cap.bufferedEventCount()).toBeLessThanOrEqual(10)

    // Drain and flush
    const mockPage: any = {
      evaluate: async () => {}
    }
    await cap.flush(0, "http://test.url/1", mockPage)

    // Assert segment
    expect(cap.segments.length).toBe(1)
    const seg1 = cap.segments[0]
    expect(seg1.truncated).toBe(true)
    expect(seg1.events.length).toBe(10) // capped at KLAV_REPLAY_MAX_EVENTS = 10
    // Keep snapshot (type 2)
    const snapshotEvent: any = seg1.events[0]
    expect(snapshotEvent.type).toBe(2)
    expect(snapshotEvent.data).toBe("snapshot")

    // The remaining 9 events should be the newest ones (mutation_11 to mutation_19)
    const lastEvent: any = seg1.events[9]
    expect(lastEvent.data).toBe("mutation_19")

    // 2. Test total event capping across multiple segments.
    // Total cap is 25. Segment 1 used 10. Segment 2 will try to push 20 events.
    const events2: any[] = [
      { type: 2, timestamp: 100, data: "snapshot2" }
    ]
    for (let i = 0; i < 20; i++) {
      events2.push({ type: 3, timestamp: 200 + i, data: `mutation2_${i}` })
    }

    await bindingCallback({}, events2)
    expect(cap.bufferedEventCount()).toBeLessThanOrEqual(10)
    await cap.flush(1, "http://test.url/2", mockPage)

    expect(cap.segments.length).toBe(2)
    const seg2 = cap.segments[1]
    expect(seg2.truncated).toBe(true)
    // Remaining cap for walk = 25 - 10 = 15. Since seg2 cap is min(10, 15) = 10, seg2 should have 10 events.
    expect(seg2.events.length).toBe(10)
    expect(seg2.events[0].type).toBe(2)
    expect(seg2.events[0].data).toBe("snapshot2")

    // Let's flush a third segment to see it cap down to 5 (since total events in seg1 + seg2 = 20, remaining = 5)
    const events3: any[] = [
      { type: 2, timestamp: 300, data: "snapshot3" }
    ]
    for (let i = 0; i < 20; i++) {
      events3.push({ type: 3, timestamp: 400 + i, data: `mutation3_${i}` })
    }
    await bindingCallback({}, events3)
    expect(cap.bufferedEventCount()).toBeLessThanOrEqual(5)
    await cap.flush(2, "http://test.url/3", mockPage)

    expect(cap.segments.length).toBe(3)
    const seg3 = cap.segments[2]
    expect(seg3.truncated).toBe(true)
    // Remaining cap for walk = 25 - 20 = 5.
    expect(seg3.events.length).toBe(5)
    expect(seg3.events[0].type).toBe(2)
    expect(seg3.events[0].data).toBe("snapshot3")

    // Let's check a fourth segment when remaining cap is 0
    const events4: any[] = [
      { type: 2, timestamp: 500, data: "snapshot4" }
    ]
    for (let i = 0; i < 5; i++) {
      events4.push({ type: 3, timestamp: 600 + i, data: `mutation4_${i}` })
    }
    await bindingCallback({}, events4)
    expect(cap.bufferedEventCount()).toBe(1)
    await cap.flush(3, "http://test.url/4", mockPage)

    expect(cap.segments.length).toBe(4)
    const seg4 = cap.segments[3]
    expect(seg4.truncated).toBe(true)
    // Remaining cap = 0. So it should only contain the snapshot (length 1)
    expect(seg4.events.length).toBe(1)
    expect(seg4.events[0].type).toBe(2)
    expect(seg4.events[0].data).toBe("snapshot4")

    // Verify replay still saves correctly
    const projectId = "proj_cap_test"
    await R.saveReplay(projectId, "run_cap_test", cap.segments)

    const saved = await R.getReplay(projectId, "run_cap_test")
    expect(saved).not.toBeNull()
    expect(saved!.length).toBe(4)
    expect(saved![0].truncated).toBe(true)
    expect(saved![0].events.length).toBe(10)
    expect(saved![3].events.length).toBe(1)
  } finally {
    process.env.KLAV_REPLAY_MAX_EVENTS = origMax
    process.env.KLAV_REPLAY_MAX_TOTAL_EVENTS = origTotal
  }
}, 30000)

test("replay capping: browser-side capped batches keep the truncated marker", async () => {
  const origMax = process.env.KLAV_REPLAY_MAX_EVENTS
  const origTotal = process.env.KLAV_REPLAY_MAX_TOTAL_EVENTS
  process.env.KLAV_REPLAY_MAX_EVENTS = "10"
  process.env.KLAV_REPLAY_MAX_TOTAL_EVENTS = "50"

  try {
    let bindingCallback: any = null
    const mockContext: any = {
      exposeBinding: async (name: string, cb: any) => {
        if (name === "__klavReplayPush") bindingCallback = cb
      },
      addInitScript: async () => {}
    }

    const cap = await R.setupReplayCapture(mockContext)
    await bindingCallback({}, {
      truncated: true,
      events: [
        { type: 2, timestamp: 1, data: "snapshot" },
        ...Array.from({ length: 9 }, (_, i) => ({ type: 3, timestamp: 2 + i, data: `kept_${i}` })),
      ],
    })
    expect(cap.bufferedEventCount()).toBe(10)

    const mockPage: any = { evaluate: async () => {} }
    await cap.flush(0, "http://test.url/browser-capped", mockPage)
    expect(cap.segments.length).toBe(1)
    expect(cap.segments[0].truncated).toBe(true)
    expect(cap.segments[0].events.length).toBe(10)
  } finally {
    process.env.KLAV_REPLAY_MAX_EVENTS = origMax
    process.env.KLAV_REPLAY_MAX_TOTAL_EVENTS = origTotal
  }
}, 30000)
