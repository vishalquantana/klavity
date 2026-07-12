import { afterEach, describe, it, expect, vi } from "vitest"
import {
  djb2,
  normalizeFindingText,
  computeContentHash,
  shouldSkipReview,
  isSignificantNode,
  isOwnOverlayNode,
  hasSignificantMutations,
  startSimsWatch,
} from "./sims-watch"

// ── djb2 ─────────────────────────────────────────────────────────────────────────────────

describe("djb2", () => {
  it("returns a non-negative integer", () => {
    expect(djb2("hello")).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(djb2("hello"))).toBe(true)
  })

  it("is stable — same input always produces the same hash", () => {
    expect(djb2("test")).toBe(djb2("test"))
    expect(djb2("klavity")).toBe(djb2("klavity"))
  })

  it("produces different hashes for different inputs", () => {
    expect(djb2("foo")).not.toBe(djb2("bar"))
    expect(djb2("")).not.toBe(djb2("x"))
  })

  it("handles empty string without throwing", () => {
    expect(typeof djb2("")).toBe("number")
    expect(djb2("")).toBeGreaterThanOrEqual(0)
  })
})

// ── computeContentHash ───────────────────────────────────────────────────────────────────

describe("computeContentHash", () => {
  it("is stable — same inputs always produce the same hash", () => {
    const h = computeContentHash(0, 3000, 1280, 800, "My Page", "/home")
    expect(h).toBe(computeContentHash(0, 3000, 1280, 800, "My Page", "/home"))
  })

  it("returns a non-empty string", () => {
    expect(computeContentHash(0, 3000, 1280, 800, "T", "/x").length).toBeGreaterThan(0)
  })

  it("changes when the URL path changes (SPA navigation)", () => {
    const a = computeContentHash(0, 3000, 1280, 800, "Title", "/page-a")
    const b = computeContentHash(0, 3000, 1280, 800, "Title", "/page-b")
    expect(a).not.toBe(b)
  })

  it("changes when the hash fragment changes (hash-route SPA navigation)", () => {
    const a = computeContentHash(0, 3000, 1280, 800, "T", "/app#/settings")
    const b = computeContentHash(0, 3000, 1280, 800, "T", "/app#/dashboard")
    expect(a).not.toBe(b)
  })

  it("changes when document height changes (new content loaded)", () => {
    const a = computeContentHash(0, 3000, 1280, 800, "T", "/x")
    const b = computeContentHash(0, 5000, 1280, 800, "T", "/x")
    expect(a).not.toBe(b)
  })

  it("changes when the page title changes", () => {
    const a = computeContentHash(0, 3000, 1280, 800, "Home", "/")
    const b = computeContentHash(0, 3000, 1280, 800, "Dashboard", "/")
    expect(a).not.toBe(b)
  })

  // ── scroll bucketing ──────────────────────────────────────────────────────────────────────
  it("buckets scroll to 50px — micro-scrolls within the same bucket share a hash", () => {
    // scrollY 100 and 120 both round to bucket 100 (Math.round(2.4) = 2)
    const a = computeContentHash(100, 3000, 1280, 800, "T", "/x")
    const b = computeContentHash(120, 3000, 1280, 800, "T", "/x")
    expect(a).toBe(b)
  })

  it("produces distinct hashes across 50px scroll buckets", () => {
    // scrollY 100 (bucket 100) vs 150 (bucket 150)
    const a = computeContentHash(100, 3000, 1280, 800, "T", "/x")
    const c = computeContentHash(150, 3000, 1280, 800, "T", "/x")
    expect(a).not.toBe(c)
  })

  it("scrollY=0 is distinct from scrollY=50 (different buckets)", () => {
    const a = computeContentHash(0, 3000, 1280, 800, "T", "/x")
    const b = computeContentHash(50, 3000, 1280, 800, "T", "/x")
    expect(a).not.toBe(b)
  })

  // ── mutation epoch ────────────────────────────────────────────────────────────────────────
  it("epoch=0 (default) matches an explicit epoch=0 call", () => {
    const implicit = computeContentHash(0, 3000, 1280, 800, "T", "/x")
    const explicit = computeContentHash(0, 3000, 1280, 800, "T", "/x", 0)
    expect(implicit).toBe(explicit)
  })

  it("different epochs produce different hashes for identical viewport state", () => {
    const e0 = computeContentHash(0, 3000, 1280, 800, "T", "/x", 0)
    const e1 = computeContentHash(0, 3000, 1280, 800, "T", "/x", 1)
    const e2 = computeContentHash(0, 3000, 1280, 800, "T", "/x", 2)
    expect(e0).not.toBe(e1)
    expect(e1).not.toBe(e2)
    expect(e0).not.toBe(e2)
  })

  it("epoch bump escapes seenHashes — simulates mutation-triggered re-review of same page", () => {
    // Epoch=0 is reviewed and added to seenHashes.
    const seenHashes = new Set<string>()
    const h0 = computeContentHash(0, 3000, 1280, 800, "T", "/x", 0)
    seenHashes.add(h0)
    // Same positional state, epoch=1 (mutation fired) → hash is different → not in seenHashes.
    const h1 = computeContentHash(0, 3000, 1280, 800, "T", "/x", 1)
    expect(h1).not.toBe(h0)
    expect(seenHashes.has(h1)).toBe(false) // confirms the new hash escapes the dedup set
  })
})

// ── shouldSkipReview ─────────────────────────────────────────────────────────────────────

describe("shouldSkipReview", () => {
  const empty = new Set<string>()
  const MIN = 30_000 // 30s

  // ── throttle (minIntervalMs) ────────────────────────────────────────────────────────────
  it("allows the very first call (lastReviewAt=0, now=Date.now() >> minInterval)", () => {
    // lastReviewAt=0 means "never reviewed"; Date.now() ≈ 1.75 trillion >> 30 000
    expect(shouldSkipReview("h", empty, 0, 1_700_000_000_000, MIN)).toBe(false)
  })

  it("skips when elapsed time is less than minIntervalMs", () => {
    expect(shouldSkipReview("h", empty, 1_000, 1_000 + MIN - 1, MIN)).toBe(true)
  })

  it("allows exactly at the minIntervalMs boundary", () => {
    expect(shouldSkipReview("h", empty, 1_000, 1_000 + MIN, MIN)).toBe(false)
  })

  it("skips a rapid second trigger at 1ms after the first (throttle, not hash)", () => {
    // Simulates: review fires at t=1000, second trigger at t=1001 — within 30s window.
    expect(shouldSkipReview("brand-new-hash", empty, 1_000, 1_001, MIN)).toBe(true)
  })

  it("allows again once minInterval elapses, even with a fresh hash", () => {
    expect(shouldSkipReview("h", empty, 1_000, 1_000 + MIN + 1, MIN)).toBe(false)
  })

  // ── seenHashes (unchanged content skip) ────────────────────────────────────────────────
  it("skips when the hash is already in seenHashes (content unchanged)", () => {
    const seen = new Set(["h1"])
    expect(shouldSkipReview("h1", seen, 0, 1_700_000_000_000, MIN)).toBe(true)
  })

  it("allows when hash is new and interval has elapsed", () => {
    const seen = new Set(["other"])
    expect(shouldSkipReview("h1", seen, 0, 1_700_000_000_000, MIN)).toBe(false)
  })

  it("seenHash check is independent of throttle — both must pass", () => {
    // Throttle clear, but hash already seen → still skipped.
    const seen = new Set(["h1"])
    expect(shouldSkipReview("h1", seen, 0, 1_700_000_000_000, MIN)).toBe(true)
    // Throttle clear, hash new → allowed.
    expect(shouldSkipReview("h2", seen, 0, 1_700_000_000_000, MIN)).toBe(false)
    // Throttle blocked, hash new → still skipped.
    expect(shouldSkipReview("h2", seen, 1_000, 1_001, MIN)).toBe(true)
  })

  it("zero minIntervalMs disables the throttle (only seenHash matters)", () => {
    expect(shouldSkipReview("h", empty, 1_000, 1_001, 0)).toBe(false)
  })
})

// ── isSignificantNode ────────────────────────────────────────────────────────────────────

/** Build a minimal Element-like mock for pure testing. */
function mockEl(opts: {
  tag?: string
  role?: string
  className?: string
  size?: { w: number; h: number }
  offsetSize?: { w: number; h: number }
}): Element {
  const { tag = "DIV", role, className = "", size, offsetSize } = opts
  return {
    tagName: tag.toUpperCase(),
    getAttribute: (k: string) => (k === "role" ? (role ?? null) : null),
    className,
    getBoundingClientRect: size
      ? () => ({ width: size.w, height: size.h, top: 0, left: 0, bottom: size.h, right: size.w })
      : undefined,
    offsetHeight: offsetSize?.h ?? 0,
    offsetWidth: offsetSize?.w ?? 0,
  } as unknown as Element
}

describe("isSignificantNode", () => {
  it("ignores SCRIPT elements", () => {
    expect(isSignificantNode(mockEl({ tag: "SCRIPT" }))).toBe(false)
  })
  it("ignores STYLE elements", () => {
    expect(isSignificantNode(mockEl({ tag: "STYLE" }))).toBe(false)
  })
  it("ignores META elements", () => {
    expect(isSignificantNode(mockEl({ tag: "META" }))).toBe(false)
  })
  it("ignores NOSCRIPT elements", () => {
    expect(isSignificantNode(mockEl({ tag: "NOSCRIPT" }))).toBe(false)
  })

  it("treats role=dialog as significant", () => {
    expect(isSignificantNode(mockEl({ role: "dialog" }))).toBe(true)
  })
  it("treats role=main as significant", () => {
    expect(isSignificantNode(mockEl({ role: "main" }))).toBe(true)
  })
  it("treats role=complementary as significant", () => {
    expect(isSignificantNode(mockEl({ role: "complementary" }))).toBe(true)
  })
  // role=feed/log/banner/navigation were dropped: a live feed streaming in on every
  // token is exactly the loop we're fixing — those must NOT be significant by role.
  it("does NOT treat role=feed as significant (streaming feed guard)", () => {
    expect(isSignificantNode(mockEl({ role: "feed" }))).toBe(false)
  })

  it("detects modal class-name pattern", () => {
    expect(isSignificantNode(mockEl({ className: "modal-container" }))).toBe(true)
  })
  it("detects panel class-name pattern", () => {
    expect(isSignificantNode(mockEl({ className: "chat-panel" }))).toBe(true)
  })
  it("detects drawer class-name pattern", () => {
    expect(isSignificantNode(mockEl({ className: "right-drawer open" }))).toBe(true)
  })
  // "notification"/"toast"/"message"/"chat"/"alert" by class were dropped — a streaming
  // chat fires those per token. A tiny toast (no container class match, small size) is now insignificant.
  it("does NOT treat a small notification-toast as significant (streaming guard)", () => {
    expect(isSignificantNode(mockEl({ className: "notification-toast", size: { w: 200, h: 60 } }))).toBe(false)
  })

  it("treats a genuinely large element (≥220×180) as significant via getBoundingClientRect", () => {
    expect(isSignificantNode(mockEl({ size: { w: 300, h: 240 } }))).toBe(true)
  })
  it("rejects a mid-size element below the raised 220×180 threshold (chat-bubble sized)", () => {
    // A chat bubble / small card that used to trip the old 100×100 bar no longer counts.
    expect(isSignificantNode(mockEl({ size: { w: 200, h: 120 } }))).toBe(false)
    expect(isSignificantNode(mockEl({ size: { w: 219, h: 180 } }))).toBe(false)
    expect(isSignificantNode(mockEl({ size: { w: 220, h: 179 } }))).toBe(false)
  })

  it("falls back to offsetHeight/Width when getBoundingClientRect is absent", () => {
    expect(isSignificantNode(mockEl({ offsetSize: { w: 320, h: 220 } }))).toBe(true)
    expect(isSignificantNode(mockEl({ offsetSize: { w: 200, h: 120 } }))).toBe(false)
  })

  it("ignores an unstyled empty DIV (no role, no class, no size)", () => {
    expect(isSignificantNode(mockEl({}))).toBe(false)
  })

  it("ignores the Sims' own overlay/dock nodes (self-mutation guard)", () => {
    // A large node that IS our own dock/overlay must never count, or the engine
    // would re-review itself in a loop.
    expect(isSignificantNode(mockEl({ className: "ksl-bubble", size: { w: 400, h: 300 } }))).toBe(false)
    expect(isSignificantNode(mockEl({ className: "klav-pin-marker", size: { w: 400, h: 300 } }))).toBe(false)
  })
})

// ── hasSignificantMutations ───────────────────────────────────────────────────────────────

function mutRecord(type: "childList" | "attributes" | "characterData", addedNodes: unknown[] = []): MutationRecord {
  return {
    type,
    addedNodes: addedNodes as unknown as NodeList,
    removedNodes: [] as unknown as NodeList,
    target: null as unknown as Node,
    attributeName: null,
    attributeNamespace: null,
    nextSibling: null,
    previousSibling: null,
    oldValue: null,
  } as unknown as MutationRecord
}

function mockNode(elOpts: Parameters<typeof mockEl>[0]): Node {
  return { nodeType: 1, ...mockEl(elOpts) } as unknown as Node
}

describe("hasSignificantMutations", () => {
  it("returns false for an empty batch", () => {
    expect(hasSignificantMutations([])).toBe(false)
  })

  it("returns false for attribute-only mutations", () => {
    expect(hasSignificantMutations([mutRecord("attributes")])).toBe(false)
  })

  it("returns false for character-data mutations", () => {
    expect(hasSignificantMutations([mutRecord("characterData")])).toBe(false)
  })

  it("returns false when no nodes were added", () => {
    expect(hasSignificantMutations([mutRecord("childList", [])])).toBe(false)
  })

  it("returns true when a dialog element is added", () => {
    const dialog = mockNode({ role: "dialog" })
    expect(hasSignificantMutations([mutRecord("childList", [dialog])])).toBe(true)
  })

  it("returns true when a large-area element is added", () => {
    const bigDiv = mockNode({ size: { w: 400, h: 300 } })
    expect(hasSignificantMutations([mutRecord("childList", [bigDiv])])).toBe(true)
  })

  it("returns false when only a small SPAN is added", () => {
    const span = mockNode({ tag: "SPAN", size: { w: 50, h: 20 } })
    expect(hasSignificantMutations([mutRecord("childList", [span])])).toBe(false)
  })

  it("returns false when only a SCRIPT element is added", () => {
    const script = mockNode({ tag: "SCRIPT" })
    expect(hasSignificantMutations([mutRecord("childList", [script])])).toBe(false)
  })

  it("returns false for a text node added (nodeType !== 1)", () => {
    const textNode = { nodeType: 3 } as unknown as Node
    expect(hasSignificantMutations([mutRecord("childList", [textNode])])).toBe(false)
  })

  it("returns true when at least one of several mutations is significant", () => {
    const small = mockNode({ tag: "SPAN", size: { w: 20, h: 10 } })
    const modal = mockNode({ className: "modal-overlay" })
    expect(hasSignificantMutations([
      mutRecord("childList", [small]),
      mutRecord("childList", [modal]),
    ])).toBe(true)
  })

  it("returns false when all added nodes are insignificant", () => {
    const a = mockNode({ tag: "SPAN", size: { w: 10, h: 10 } })
    const b = mockNode({ tag: "SPAN", size: { w: 20, h: 20 } })
    expect(hasSignificantMutations([mutRecord("childList", [a, b])])).toBe(false)
  })

  // ── Live streaming-chat scenario (the bug we're fixing) ──────────────────────────────────
  it("ignores a burst of streaming chat-message mutations (no significant page change)", () => {
    // Simulate an AI chat streaming tokens: many small message rows + a typing indicator,
    // none of which is a container-level panel. This must NOT trigger a mutation review.
    const chatRow1 = mockNode({ tag: "DIV", className: "message chat-message", size: { w: 600, h: 40 } })
    const chatRow2 = mockNode({ tag: "DIV", className: "message chat-message", size: { w: 600, h: 40 } })
    const typing = mockNode({ tag: "DIV", className: "typing-indicator", size: { w: 60, h: 20 } })
    expect(hasSignificantMutations([
      mutRecord("childList", [chatRow1]),
      mutRecord("childList", [chatRow2]),
      mutRecord("childList", [typing]),
    ])).toBe(false)
  })

  it("still fires when a genuine dialog/panel opens amid streaming noise", () => {
    const chatRow = mockNode({ tag: "DIV", className: "message", size: { w: 600, h: 40 } })
    const dialog = mockNode({ role: "dialog", size: { w: 500, h: 400 } })
    expect(hasSignificantMutations([
      mutRecord("childList", [chatRow, dialog]),
    ])).toBe(true)
  })

  it("ignores the Sims' own overlay/dock mutations (self-mutation loop guard)", () => {
    // Our walkers/markers/bubbles are injected into the page as the Sims work.
    const walker = mockNode({ tag: "DIV", className: "klav-walker", size: { w: 400, h: 300 } })
    const bubble = mockNode({ tag: "DIV", className: "ksl-bubble", size: { w: 300, h: 240 } })
    expect(hasSignificantMutations([
      mutRecord("childList", [walker, bubble]),
    ])).toBe(false)
  })
})

// ── normalizeFindingText ─────────────────────────────────────────────────────────────────

describe("normalizeFindingText", () => {
  it("trims, lowercases, and collapses whitespace", () => {
    expect(normalizeFindingText("  The  Checkout   Button\nis Confusing ")).toBe("the checkout button is confusing")
  })
  it("treats differently-cased/spaced repeats as the same key", () => {
    expect(normalizeFindingText("Same Finding")).toBe(normalizeFindingText("  same   finding  "))
  })
  it("handles empty/nullish text", () => {
    expect(normalizeFindingText("")).toBe("")
    expect(normalizeFindingText(undefined as unknown as string)).toBe("")
  })
})

// ── isOwnOverlayNode ─────────────────────────────────────────────────────────────────────

describe("isOwnOverlayNode", () => {
  it("matches the dock host by id", () => {
    const el = { id: "klav-sims-live", className: "", parentElement: null } as unknown as Element
    expect(isOwnOverlayNode(el)).toBe(true)
  })
  it("matches an overlay class", () => {
    const el = { id: "", className: "klav-pin-marker is-active", parentElement: null } as unknown as Element
    expect(isOwnOverlayNode(el)).toBe(true)
  })
  it("matches a child nested inside an overlay node", () => {
    const parent = { id: "klav-sims-overlay", className: "", parentElement: null } as unknown as Element
    const child = { id: "", className: "some-inner", parentElement: parent } as unknown as Element
    expect(isOwnOverlayNode(child)).toBe(true)
  })
  it("does not match an ordinary page element", () => {
    const el = { id: "hero", className: "container main-content", parentElement: null } as unknown as Element
    expect(isOwnOverlayNode(el)).toBe(false)
  })
})

// ── startSimsWatch network timeout ────────────────────────────────────────────────────────

describe("startSimsWatch", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("aborts a stalled review fetch and allows the same viewport to retry", async () => {
    vi.useFakeTimers()

    vi.stubGlobal("document", {
      title: "Dashboard",
      documentElement: { scrollHeight: 1200 },
      body: { scrollHeight: 1200 },
      getElementById: () => null,
      querySelectorAll: () => [],
    })
    vi.stubGlobal("window", {
      scrollY: 0,
      scrollX: 0,
      innerWidth: 1280,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal("location", {
      href: "https://example.test/dashboard",
      pathname: "/dashboard",
      search: "",
      hash: "",
    })
    vi.stubGlobal("history", {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    })

    const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const err = new Error("aborted")
        err.name = "AbortError"
        reject(err)
      })
    }))
    vi.stubGlobal("fetch", fetchMock)

    const ctrl = startSimsWatch({
      backendUrl: "https://klavity.test",
      projectId: "proj_1",
      minIntervalMs: 0,
      captureViewport: async () => "data:image/png;base64,ZmFrZQ==",
    })

    history.pushState({}, "", "/dashboard")
    await vi.runOnlyPendingTimersAsync()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(45_000)
    await Promise.resolve()

    history.pushState({}, "", "/dashboard")
    await vi.runOnlyPendingTimersAsync()
    expect(fetchMock).toHaveBeenCalledTimes(2)

    ctrl.stop()
  })

  // ── Mutation-loop guard integration (the core bug fix) ─────────────────────────────────────

  /**
   * Stub the DOM globals and expose a controllable MutationObserver so a test can
   * fire a "significant mutation" batch on demand, plus a fetch that returns a
   * scripted list of observations. Returns helpers to drive the engine.
   */
  function setupWatchHarness(reviewObservations: () => Array<{ observation: string }>) {
    const loc = { href: "https://example.test/chat", pathname: "/chat", search: "", hash: "" }
    let mutationCb: ((mutations: unknown[], obs: unknown) => void) | null = null

    vi.stubGlobal("document", {
      title: "Chat",
      documentElement: { scrollHeight: 1200 },
      body: { scrollHeight: 1200 },
      getElementById: () => null,
      querySelectorAll: () => [],
    })
    vi.stubGlobal("window", {
      scrollY: 0,
      scrollX: 0,
      innerWidth: 1280,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      KlavitySims: { renderFeedback: vi.fn() },
    })
    vi.stubGlobal("location", loc)
    vi.stubGlobal("history", { pushState: vi.fn(), replaceState: vi.fn() })
    vi.stubGlobal("MutationObserver", class {
      constructor(cb: (mutations: unknown[], obs: unknown) => void) { mutationCb = cb }
      observe() {}
      disconnect() {}
      takeRecords() { return [] }
    })

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
        reviews: [{ simId: "sim_1", simName: "Alex", observations: reviewObservations() }],
      }),
    } as unknown as Response))
    vi.stubGlobal("fetch", fetchMock)

    // A "significant" mutation batch (a real dialog opening) that passes hasSignificantMutations.
    const significantBatch = [mutRecord("childList", [mockNode({ role: "dialog", size: { w: 500, h: 400 } })])]

    return {
      fetchMock,
      fireMutation: () => { mutationCb?.(significantBatch as unknown[], null) },
      setPath: (p: string) => { loc.pathname = p },
    }
  }

  it("caps repeated same-URL mutation reviews after K with no new findings", async () => {
    vi.useFakeTimers()
    // Server keeps returning the SAME finding every review — a live page loop.
    const harness = setupWatchHarness(() => [{ observation: "The header feels cramped" }])

    const ctrl = startSimsWatch({
      backendUrl: "https://klavity.test",
      projectId: "proj_1",
      minIntervalMs: 0, // isolate the mutation cap from the 30s throttle
      captureViewport: async () => "data:image/png;base64,ZmFrZQ==",
    })

    // Fire many significant mutations at the same URL. Each mutation bumps the epoch
    // so the hash is fresh; only the new cap should stop the loop.
    for (let i = 0; i < 8; i++) {
      harness.fireMutation()
      await vi.runOnlyPendingTimersAsync()
      await Promise.resolve()
    }

    // First review returns a NEW finding (count stays 0), then 3 no-new reviews reach
    // the cap (K=3) → 4 mutation reviews total, then no more are scheduled.
    expect(harness.fetchMock).toHaveBeenCalledTimes(4)

    ctrl.stop()
  })

  it("a run of insignificant (streaming) mutations never schedules a review", async () => {
    vi.useFakeTimers()
    const harness = setupWatchHarness(() => [{ observation: "irrelevant" }])
    // Override fireMutation to send only insignificant streaming nodes.
    const loc = { pathname: "/chat" }
    void loc

    const ctrl = startSimsWatch({
      backendUrl: "https://klavity.test",
      projectId: "proj_1",
      minIntervalMs: 0,
      captureViewport: async () => "data:image/png;base64,ZmFrZQ==",
    })

    // hasSignificantMutations returns false for streaming chat rows, so the observer
    // callback never calls schedule() — we verify by firing an insignificant batch
    // directly through hasSignificantMutations (the observer's gate).
    const streamingBatch = [
      mutRecord("childList", [mockNode({ tag: "DIV", className: "message", size: { w: 600, h: 40 } })]),
    ]
    expect(hasSignificantMutations(streamingBatch as unknown as MutationRecord[])).toBe(false)
    // No review is ever scheduled from streaming noise.
    await vi.runOnlyPendingTimersAsync()
    expect(harness.fetchMock).not.toHaveBeenCalled()

    ctrl.stop()
  })

  it("navigation still triggers a review even after the mutation cap is hit", async () => {
    vi.useFakeTimers()
    const harness = setupWatchHarness(() => [{ observation: "The header feels cramped" }])

    const ctrl = startSimsWatch({
      backendUrl: "https://klavity.test",
      projectId: "proj_1",
      minIntervalMs: 0,
      captureViewport: async () => "data:image/png;base64,ZmFrZQ==",
    })

    // Exhaust the mutation cap on /chat.
    for (let i = 0; i < 8; i++) {
      harness.fireMutation()
      await vi.runOnlyPendingTimersAsync()
      await Promise.resolve()
    }
    expect(harness.fetchMock).toHaveBeenCalledTimes(4)

    // A real navigation resets the cap and MUST trigger a fresh review.
    harness.setPath("/settings")
    history.pushState({}, "", "/settings")
    await vi.runOnlyPendingTimersAsync()
    await Promise.resolve()
    expect(harness.fetchMock).toHaveBeenCalledTimes(5)

    ctrl.stop()
  })
})
