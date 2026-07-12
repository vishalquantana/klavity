// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SimsLive, type LiveObservation } from "./sims-live"

const SIM = { id: "sim_walk", name: "Alex Walker", initials: "AW", accent: "#7c3aed" }

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

function setRect(el: HTMLElement, r: DOMRect): void {
  el.getBoundingClientRect = vi.fn(() => r)
  Object.defineProperty(el, "offsetHeight", { value: r.height, configurable: true })
  Object.defineProperty(el, "offsetWidth", { value: r.width, configurable: true })
}

function makeTarget(text = "Checkout button pricing area"): HTMLElement {
  const target = document.createElement("div")
  target.id = "target"
  target.textContent = text
  target.style.display = "block"
  document.body.appendChild(target)
  setRect(target, rect(120, 150, 240, 90))

  Object.defineProperty(document, "elementFromPoint", { value: vi.fn(() => target), configurable: true })
  Object.defineProperty(document, "elementsFromPoint", { value: vi.fn(() => [target, document.body]), configurable: true })
  return target
}

function dockShadow(): ShadowRoot | null {
  return (document.querySelector("#klav-sims-live") as HTMLElement | null)?.shadowRoot ?? null
}

async function settleWalk(): Promise<void> {
  await vi.advanceTimersByTimeAsync(1)
  expect(document.querySelector(".klav-walker")).toBeTruthy()
  await vi.advanceTimersByTimeAsync(1500)
}

async function settleMarkers(): Promise<HTMLElement[]> {
  await vi.advanceTimersByTimeAsync(1900)
  return Array.from(document.querySelectorAll(".klav-pin-marker")) as HTMLElement[]
}

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ""
  Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true })
  Object.defineProperty(window, "innerHeight", { value: 720, configurable: true })
  Object.defineProperty(window, "scrollX", { value: 0, configurable: true, writable: true })
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true })
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0))
  vi.spyOn(window, "scrollTo").mockImplementation((arg1: ScrollToOptions | number, arg2?: number) => {
    if (typeof arg1 === "object") {
      Object.defineProperty(window, "scrollX", { value: Number(arg1.left || 0), configurable: true, writable: true })
      Object.defineProperty(window, "scrollY", { value: Number(arg1.top || 0), configurable: true, writable: true })
    } else {
      Object.defineProperty(window, "scrollX", { value: Number(arg1 || 0), configurable: true, writable: true })
      Object.defineProperty(window, "scrollY", { value: Number(arg2 || 0), configurable: true, writable: true })
    }
  })
  SimsLive.undeploy()
})

afterEach(() => {
  SimsLive.undeploy()
  SimsLive.onTriage = null
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("SimsLive walk + outline choreography", () => {
  it("renders a collapsed marker first, then walks and expands on marker click", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])

    const obs: LiveObservation = {
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])

    const markers = await settleMarkers()
    expect(markers).toHaveLength(1)
    expect(document.querySelector(".klav-walker")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
    expect(document.querySelector(".klav-pin")).toBeNull()

    markers[0].click()
    await settleWalk()

    expect(document.querySelector(".klav-halo")).toBeTruthy()
    expect(document.querySelector(".klav-pin")).toBeTruthy()
    expect(document.querySelectorAll(".klav-pin")).toHaveLength(1)
    expect(document.querySelector(".ksl-bubble")).toBeNull()

    const trackBtn = document.querySelector(".klav-pin-triage") as HTMLButtonElement
    const onTriage = vi.fn()
    SimsLive.onTriage = onTriage
    expect(trackBtn.textContent).toContain("Track as Bug")
    trackBtn.click()
    expect(onTriage).toHaveBeenCalledWith(obs, SIM.name)
  })

  it("falls back to visible text matching when the model returns no region", async () => {
    makeTarget("Pricing checkout guarantee")
    SimsLive.deploy("all", [SIM])

    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      text: "The pricing checkout guarantee is confusing.",
      sentiment: "confused",
      region: null,
    }])

    const markers = await settleMarkers()
    expect(markers).toHaveLength(1)
    markers[0].dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }))
    await settleWalk()

    expect(document.querySelector(".klav-halo")).toBeTruthy()
    expect(document.querySelector(".klav-pin")).toBeTruthy()
  })

  it("keeps only one observation expanded and dims the rest", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])

    SimsLive.renderFeedback(SIM.id, SIM.name, [
      {
        text: "The checkout button feels blocked.",
        sentiment: "blocked",
        region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
        targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
      },
      {
        text: "The checkout pricing feels broken.",
        sentiment: "confused",
        region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
        targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
      },
    ])

    const markers = await settleMarkers()
    expect(markers).toHaveLength(2)
    const counter = dockShadow()?.querySelector(".ksl-more-counter") as HTMLButtonElement
    expect(counter.textContent).toBe("+2 more")
    counter.click()
    await settleWalk()
    expect(document.querySelectorAll(".klav-pin")).toHaveLength(1)
    expect(counter.textContent).toBe("+1 more")
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await vi.advanceTimersByTimeAsync(260)

    markers[0].click()
    await settleWalk()
    expect(document.querySelectorAll(".klav-pin")).toHaveLength(1)
    expect(document.querySelectorAll(".klav-halo")).toHaveLength(1)
    expect(markers[0].classList.contains("is-active")).toBe(true)
    expect(markers[1].classList.contains("is-dim")).toBe(true)

    markers[1].click()
    await settleWalk()
    expect(document.querySelectorAll(".klav-pin")).toHaveLength(1)
    expect(document.querySelectorAll(".klav-halo")).toHaveLength(1)
    expect(markers[0].classList.contains("is-dim")).toBe(true)
    expect(markers[1].classList.contains("is-active")).toBe(true)
  })

  it("walk-me-through controls advance one focused observation at a time", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [
      {
        text: "The checkout button feels blocked.",
        sentiment: "blocked",
        region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
        targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
      },
      {
        text: "The checkout pricing feels broken.",
        sentiment: "confused",
        region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
        targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
      },
    ])

    const markers = await settleMarkers()
    expect(markers).toHaveLength(2)
    const shadow = dockShadow()
    const controls = shadow?.querySelector(".ksl-tour-controls") as HTMLElement
    const play = shadow?.querySelector('[aria-label="Play Sim walkthrough"]') as HTMLButtonElement
    expect(controls.style.display).toBe("inline-flex")

    play.click()
    await settleWalk()
    expect(document.querySelectorAll(".klav-pin")).toHaveLength(1)
    expect(markers[0].classList.contains("is-active")).toBe(true)
    expect(markers[1].classList.contains("is-dim")).toBe(true)

    await vi.advanceTimersByTimeAsync(5200)
    expect(document.querySelectorAll(".klav-pin")).toHaveLength(1)
    expect(markers[1].classList.contains("is-active")).toBe(true)

    const pause = shadow?.querySelector('[aria-label="Pause Sim walkthrough"]') as HTMLButtonElement
    pause.click()
    await vi.advanceTimersByTimeAsync(4000)
    expect(markers[1].classList.contains("is-active")).toBe(true)

    const prev = shadow?.querySelector('[aria-label="Previous Sim observation"]') as HTMLButtonElement
    prev.click()
    await settleWalk()
    expect(document.querySelectorAll(".klav-pin")).toHaveLength(1)
    expect(markers[0].classList.contains("is-active")).toBe(true)

    const stop = shadow?.querySelector('[aria-label="Stop Sim walkthrough"]') as HTMLButtonElement
    stop.click()
    await vi.advanceTimersByTimeAsync(260)
    expect(document.querySelector(".klav-pin")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
    expect(document.querySelectorAll(".klav-pin-marker")).toHaveLength(2)
  })

  it("dock click focuses that Sim's annotation and Escape collapses back to pins", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      text: "The checkout button feels blocked.",
      sentiment: "blocked",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }])

    const markers = await settleMarkers()
    expect(markers).toHaveLength(1)
    const slot = dockShadow()?.querySelector(".ksl-slot") as HTMLElement
    slot.click()
    await settleWalk()
    expect(document.querySelector(".klav-pin")).toBeTruthy()

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await vi.advanceTimersByTimeAsync(260)
    expect(document.querySelector(".klav-pin")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
    expect(document.querySelector(".klav-pin-marker")).toBeTruthy()

    markers[0].click()
    await settleWalk()
    expect(document.querySelector(".klav-pin")).toBeTruthy()
    document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, composed: true }))
    await vi.advanceTimersByTimeAsync(260)
    expect(document.querySelector(".klav-pin")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
  })

  it("queues offscreen observations and reveals their pins when the target enters the viewport", async () => {
    const target = makeTarget()
    setRect(target, rect(120, 1000, 240, 90))
    let ioCallback: IntersectionObserverCallback | null = null
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal("IntersectionObserver", vi.fn((cb: IntersectionObserverCallback) => {
      ioCallback = cb
      return { observe, disconnect, unobserve: vi.fn(), takeRecords: vi.fn(() => []) }
    }))

    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      text: "The checkout button feels blocked.",
      sentiment: "blocked",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }])

    await vi.advanceTimersByTimeAsync(250)
    expect(document.querySelector(".klav-pin-marker")).toBeNull()
    const counter = dockShadow()?.querySelector(".ksl-more-counter") as HTMLButtonElement
    expect(counter.textContent).toBe("+1 more")
    expect(observe).toHaveBeenCalledWith(target)

    setRect(target, rect(120, 150, 240, 90))
    ioCallback?.([{ isIntersecting: true, intersectionRatio: 0.6, target } as IntersectionObserverEntry], {} as IntersectionObserver)
    await vi.advanceTimersByTimeAsync(1700)

    expect(disconnect).toHaveBeenCalled()
    expect(document.querySelectorAll(".klav-pin-marker")).toHaveLength(1)
    expect(document.querySelector(".klav-pin")).toBeNull()
    expect(counter.textContent).toBe("+1 more")
  })

  it("undeploy removes queued walkers, halos, expanded bubbles, and markers", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      text: "The checkout button feels blocked.",
      sentiment: "blocked",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }])
    const markers = await settleMarkers()
    markers[0].click()
    await settleWalk()

    SimsLive.undeploy()

    expect(document.querySelector(".klav-walker")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
    expect(document.querySelector(".klav-pin")).toBeNull()
    expect(document.querySelector(".klav-pin-marker")).toBeNull()
  })

  it("dedupes identical observations across repeat renderFeedback calls (loop guard)", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])

    const obs: LiveObservation = {
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }
    // First delivery creates one marker.
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    let markers = await settleMarkers()
    expect(markers).toHaveLength(1)

    // A live-mutating page re-reviews and the server returns the SAME finding again
    // (plus a whitespace/case variant that must normalize to the same key). No new
    // marker must appear — this is what stops the "+N more" pile-up.
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      ...obs,
      text: "  The Checkout Button   is CONFUSING and hard to trust. ",
    }])
    markers = await settleMarkers()
    expect(markers).toHaveLength(1)

    // A genuinely NEW finding still renders its own marker.
    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      ...obs,
      text: "The pricing section is misleading.",
    }])
    markers = await settleMarkers()
    expect(markers).toHaveLength(2)
  })

  it("re-deploy after undeploy starts the dedup guard clean", async () => {
    makeTarget()
    const obs: LiveObservation = {
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }

    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    expect(await settleMarkers()).toHaveLength(1)

    SimsLive.undeploy()
    SimsLive.deploy("all", [SIM])
    // Same text after a fresh deploy must render again (dedup set was cleared).
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    expect(await settleMarkers()).toHaveLength(1)
  })

  it("does not render positive or neutral observations on-page", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])

    SimsLive.renderFeedback(SIM.id, SIM.name, [
      {
        text: "The checkout button is exactly where I need it.",
        sentiment: "satisfied",
        region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
        targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
      },
      {
        text: "The pricing section is neutral.",
        sentiment: "neutral",
        region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
        targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
      },
    ])
    await vi.advanceTimersByTimeAsync(2000)

    expect(document.querySelector(".klav-walker")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
    expect(document.querySelector(".klav-pin")).toBeNull()
    expect(document.querySelector(".klav-pin-marker")).toBeNull()
    expect(dockShadow()?.querySelector(".ksl-bubble")).toBeNull()
  })

  it("shows a legible reviewing-status caption while a review is in flight (Issue A)", async () => {
    SimsLive.deploy("all", [SIM])

    const status = dockShadow()?.querySelector(".ksl-review-status") as HTMLElement
    expect(status).toBeTruthy()
    // Hidden until a review starts.
    expect(status.classList.contains("is-on")).toBe(false)
    expect(status.textContent).toContain("reviewing this page")

    SimsLive.setReviewing(true)
    expect(status.classList.contains("is-on")).toBe(true)
    // Every dock slot also shows the thinking ring.
    const slot = dockShadow()?.querySelector(".ksl-slot") as HTMLElement
    expect(slot.classList.contains("ksl-thinking")).toBe(true)

    SimsLive.setReviewing(false)
    expect(status.classList.contains("is-on")).toBe(false)
    expect(slot.classList.contains("ksl-thinking")).toBe(false)
  })

  it("does not promise a hard review duration in the time hint (Issue A)", () => {
    SimsLive.deploy("all", [SIM])
    const hint = dockShadow()?.querySelector(".ksl-time-hint") as HTMLElement
    expect(hint).toBeTruthy()
    // No dishonest "~5s" style number — just an honest, non-specific label.
    expect(hint.textContent || "").not.toMatch(/\d+\s*s/i)
    expect((hint.textContent || "").toLowerCase()).toContain("analyz")
  })

  it("clears the reviewing caption automatically once results render (Issue A)", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])
    SimsLive.setReviewing(true)
    const status = dockShadow()?.querySelector(".ksl-review-status") as HTMLElement
    expect(status.classList.contains("is-on")).toBe(true)

    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      text: "The checkout button feels blocked.",
      sentiment: "blocked",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }])

    expect(status.classList.contains("is-on")).toBe(false)
    await settleMarkers()
  })

  it("Track as Bug removes the finding and drops the dock counter (no re-prompt)", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])

    const obs: LiveObservation = {
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }
    // A second concern so the dock counter is non-zero after removal.
    const obs2: LiveObservation = { ...obs, text: "The pricing section is misleading." }
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs, obs2])

    const markers = await settleMarkers()
    expect(markers).toHaveLength(2)

    const counter = dockShadow()?.querySelector(".ksl-more-counter") as HTMLButtonElement
    expect(counter.textContent).toBe("+2 more")

    // Focus the first finding, then click "Track as Bug".
    markers[0].click()
    await settleWalk()
    expect(document.querySelector(".klav-pin")).toBeTruthy()

    const onTriage = vi.fn()
    SimsLive.onTriage = onTriage
    const trackBtn = document.querySelector(".klav-pin-triage") as HTMLButtonElement
    trackBtn.click()

    // Bug composer fired AND the finding is gone (marker + expanded chrome).
    expect(onTriage).toHaveBeenCalledWith(obs, SIM.name)
    await vi.advanceTimersByTimeAsync(260)
    expect(document.querySelector(".klav-pin")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
    expect(document.querySelectorAll(".klav-pin-marker")).toHaveLength(1)
    // Counter reflects one fewer (was +2, now +1 with nothing focused).
    expect(counter.textContent).toBe("+1 more")
  })

  it("does not re-create a tracked finding on a subsequent renderFeedback (handled key blocks it)", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])

    const obs: LiveObservation = {
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    let markers = await settleMarkers()
    expect(markers).toHaveLength(1)

    markers[0].click()
    await settleWalk()
    SimsLive.onTriage = vi.fn()
    ;(document.querySelector(".klav-pin-triage") as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(260)
    expect(document.querySelectorAll(".klav-pin-marker")).toHaveLength(0)

    // A live re-review returns the SAME finding — it must NOT re-appear.
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    markers = await settleMarkers()
    expect(markers).toHaveLength(0)
    expect(document.querySelector(".klav-pin")).toBeNull()
  })

  it("Dismiss removes a finding permanently and blocks its re-render", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])
    const obs: LiveObservation = {
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    const markers = await settleMarkers()
    markers[0].click()
    await settleWalk()

    const dismissBtn = document.querySelector(".klav-pin-dismiss") as HTMLButtonElement
    expect(dismissBtn.textContent).toBe("Dismiss")
    dismissBtn.click()
    await vi.advanceTimersByTimeAsync(260)
    expect(document.querySelectorAll(".klav-pin-marker")).toHaveLength(0)

    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    expect(await settleMarkers()).toHaveLength(0)
  })

  it("undeploy clears the handled set so a tracked finding CAN show again after re-deploy", async () => {
    makeTarget()
    const obs: LiveObservation = {
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }

    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    const markers = await settleMarkers()
    markers[0].click()
    await settleWalk()
    SimsLive.onTriage = vi.fn()
    ;(document.querySelector(".klav-pin-triage") as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(260)
    expect(document.querySelectorAll(".klav-pin-marker")).toHaveLength(0)

    // Fresh deploy must clear the handled key — same finding shows again.
    SimsLive.undeploy()
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [obs])
    expect(await settleMarkers()).toHaveLength(1)
  })

  it("clamps the expanded card within the viewport near the bottom edge (Issue C)", async () => {
    // Target sits near the top so the card flips BELOW it; a tall card would then
    // overflow the viewport bottom without the vertical clamp.
    makeTarget()
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      text: "The checkout button is confusing and hard to trust.",
      sentiment: "confused",
      region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
      targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
    }])

    const markers = await settleMarkers()
    markers[0].click()
    await settleWalk()

    const pin = document.querySelector(".klav-pin") as HTMLElement
    expect(pin).toBeTruthy()
    // Force a tall card so the clamp math is deterministic and would overflow
    // (rect.bottom 240 + 14 + 560 = 814 > 720) without the bottom clamp.
    Object.defineProperty(pin, "offsetHeight", { value: 560, configurable: true })
    window.dispatchEvent(new Event("resize"))
    await vi.advanceTimersByTimeAsync(20)

    const top = parseFloat(pin.style.top)
    // Card top must keep the whole 560px card on-screen: top <= 720 - 560 - 10.
    expect(top).toBeLessThanOrEqual(720 - 560 - 10)
    expect(top).toBeGreaterThanOrEqual(10)
  })
})
