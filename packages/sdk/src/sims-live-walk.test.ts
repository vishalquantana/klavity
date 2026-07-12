// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SimsLive, type LiveObservation } from "./sims-live"

const SIM = { id: "sim_walk", name: "Alex Walker", initials: "AW", accent: "#7c3aed" }
const SIM2 = { id: "sim_b", name: "Bea Reviewer", initials: "BR", accent: "#37b58f" }

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

function shadow(): ShadowRoot | null {
  return (document.querySelector("#klav-sims-live") as HTMLElement | null)?.shadowRoot ?? null
}

function launcher(): HTMLButtonElement {
  return shadow()?.querySelector(".ksl-launcher") as HTMLButtonElement
}

function openPanel(): void {
  launcher().click()
}

function rows(): HTMLElement[] {
  return Array.from(shadow()?.querySelectorAll(".ksl-row") ?? []) as HTMLElement[]
}

function panelCountText(): string {
  return (shadow()?.querySelector(".ksl-count") as HTMLElement | null)?.textContent ?? ""
}

const OBS: LiveObservation = {
  text: "The checkout button is confusing and hard to trust.",
  sentiment: "confused",
  priority: "high",
  region: { x: 120 / 1280, y: 150 / 720, w: 240 / 1280, h: 90 / 720 },
  targetViewport: { scrollX: 0, scrollY: 0, width: 1280, height: 720 },
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

describe("SimsLive floating feedback panel", () => {
  it("mounts ONE bottom-right surface (launcher) with no always-on markers or tour", () => {
    SimsLive.deploy("all", [SIM])
    expect(shadow()?.querySelectorAll(".ksl-launcher")).toHaveLength(1)
    // Retired surfaces must be gone entirely.
    expect(document.querySelector(".klav-pin-marker")).toBeNull()
    expect(shadow()?.querySelector(".ksl-tour-controls")).toBeNull()
    expect(shadow()?.querySelector(".ksl-more-counter")).toBeNull()
    expect(shadow()?.querySelector(".ksl-dock")).toBeNull()
  })

  it("(a) renderFeedback adds a panel row; a duplicate obs does not add a second row", () => {
    SimsLive.deploy("all", [SIM])
    openPanel()

    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(rows()).toHaveLength(1)
    expect(rows()[0].textContent).toContain("confusing and hard to trust")

    // Same finding + a whitespace/case variant must normalize to the same key.
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    SimsLive.renderFeedback(SIM.id, SIM.name, [{
      ...OBS,
      text: "  The Checkout Button   is CONFUSING and hard to trust. ",
    }])
    expect(rows()).toHaveLength(1)

    // A genuinely NEW finding renders its own row.
    SimsLive.renderFeedback(SIM.id, SIM.name, [{ ...OBS, text: "The pricing section is misleading." }])
    expect(rows()).toHaveLength(2)
  })

  it("(b) clicking a row's Track as Bug fires onTriage and removes the row", () => {
    SimsLive.deploy("all", [SIM])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(rows()).toHaveLength(1)

    const onTriage = vi.fn()
    SimsLive.onTriage = onTriage
    const track = rows()[0].querySelector(".ksl-r-act.track") as HTMLButtonElement
    expect(track.textContent).toContain("Track as Bug")
    track.click()

    expect(onTriage).toHaveBeenCalledWith(OBS, SIM.name)
    vi.advanceTimersByTime(320)
    expect(rows()).toHaveLength(0)
  })

  it("does not re-create a tracked finding on a subsequent renderFeedback (handled key blocks it)", () => {
    SimsLive.deploy("all", [SIM])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    SimsLive.onTriage = vi.fn()
    ;(rows()[0].querySelector(".ksl-r-act.track") as HTMLButtonElement).click()
    vi.advanceTimersByTime(320)
    expect(rows()).toHaveLength(0)

    // A live re-review returns the SAME finding — it must NOT re-appear.
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(rows()).toHaveLength(0)
  })

  it("(c) Dismiss removes the row and blocks its re-render", () => {
    SimsLive.deploy("all", [SIM])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(rows()).toHaveLength(1)

    const dismiss = rows()[0].querySelector(".ksl-r-act.dismiss") as HTMLButtonElement
    expect(dismiss.textContent).toBe("Dismiss")
    dismiss.click()
    vi.advanceTimersByTime(320)
    expect(rows()).toHaveLength(0)

    // Re-review returns the same finding — dismissed findings stay gone.
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(rows()).toHaveLength(0)
  })

  it("(d) launcher + header counts reflect the number of findings and update on add/remove", () => {
    SimsLive.deploy("all", [SIM])

    // With the panel closed, the launcher label + high badge track the count.
    const txt = () => (shadow()?.querySelector(".ksl-pill-txt") as HTMLElement).textContent ?? ""
    const badge = () => shadow()?.querySelector(".ksl-pill-badge") as HTMLElement

    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    SimsLive.renderFeedback(SIM.id, SIM.name, [{ ...OBS, text: "The pricing section is misleading.", priority: "medium" }])
    expect(txt()).toContain("2 findings")
    // one HIGH finding → "1 high" badge visible
    expect(badge().hidden).toBe(false)
    expect(badge().textContent).toBe("1 high")

    // Open the panel → header count reflects findings + Sims + high.
    openPanel()
    expect(panelCountText()).toContain("2 findings")
    expect(panelCountText()).toContain("1 Sim")
    expect(panelCountText()).toContain("1 high")
    expect(rows()).toHaveLength(2)

    // Dismiss one → both header and launcher counts drop.
    ;(rows()[0].querySelector(".ksl-r-act.dismiss") as HTMLButtonElement).click()
    vi.advanceTimersByTime(320)
    expect(rows()).toHaveLength(1)
    expect(panelCountText()).toContain("1 finding")
  })

  it("(e) setReviewing(true) shows the reviewing state in the launcher and panel", () => {
    SimsLive.deploy("all", [SIM])

    SimsLive.setReviewing(true)
    expect(launcher().classList.contains("is-reviewing")).toBe(true)
    expect((shadow()?.querySelector(".ksl-pill-txt") as HTMLElement).textContent).toContain("reviewing")

    // Expanded panel shows the friendly reviewing empty state (shimmer).
    openPanel()
    expect(shadow()?.querySelector(".ksl-shimmer")).toBeTruthy()
    expect((shadow()?.querySelector(".ksl-empty-title") as HTMLElement).textContent).toContain("reviewing this page")

    SimsLive.setReviewing(false)
    expect(launcher().classList.contains("is-reviewing")).toBe(false)
  })

  it("clears the reviewing state automatically once results render", () => {
    SimsLive.deploy("all", [SIM])
    SimsLive.setReviewing(true)
    expect(launcher().classList.contains("is-reviewing")).toBe(true)

    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(launcher().classList.contains("is-reviewing")).toBe(false)
  })

  it("groups findings from multiple Sims and offers per-persona filter chips", () => {
    SimsLive.deploy("all", [SIM, SIM2])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    SimsLive.renderFeedback(SIM2.id, SIM2.name, [{ ...OBS, text: "The layout feels cramped to me." }])

    expect(rows()).toHaveLength(2)
    expect(panelCountText()).toContain("2 Sims")

    // Filtering to one Sim leaves only their rows.
    const chips = Array.from(shadow()?.querySelectorAll(".ksl-chip") ?? []) as HTMLButtonElement[]
    const awChip = chips.find(c => c.textContent?.includes("AW"))!
    awChip.click()
    expect(rows()).toHaveLength(1)
    expect(rows()[0].textContent).toContain("confusing and hard to trust")
  })

  it("Jump to on page draws a TRANSIENT halo that auto-fades (no always-on marker)", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])

    // No halo until the user asks for one.
    expect(document.querySelector(".klav-halo")).toBeNull()

    const jump = rows()[0].querySelector(".ksl-r-act.jump") as HTMLButtonElement
    jump.click()
    // resolveObservationTarget scrolls (smooth => 520ms) before drawing.
    await vi.advanceTimersByTimeAsync(600)
    expect(document.querySelector(".klav-halo")).toBeTruthy()

    // Transient: it fades itself out after a few seconds.
    await vi.advanceTimersByTimeAsync(3600)
    expect(document.querySelector(".klav-halo")).toBeNull()
  })

  it("full finding text is preserved (never truncated) — expand toggles the clamp", () => {
    SimsLive.deploy("all", [SIM])
    openPanel()
    const long = "This is a very long finding that a Sim wrote out in full detail. ".repeat(8).trim()
    SimsLive.renderFeedback(SIM.id, SIM.name, [{ ...OBS, text: long }])
    const obsEl = rows()[0].querySelector(".ksl-r-obs") as HTMLElement
    // The full text is present in the DOM (clamp is CSS-only, nothing is cut).
    expect(obsEl.textContent).toBe(long)
  })

  it("does not render positive or neutral observations as rows", () => {
    SimsLive.deploy("all", [SIM])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [
      { ...OBS, text: "The checkout button is exactly where I need it.", sentiment: "satisfied", priority: "none" },
      { ...OBS, text: "The pricing section is neutral.", sentiment: "neutral", priority: "none" },
    ])
    expect(rows()).toHaveLength(0)
  })

  it("re-deploy after undeploy starts the dedup guard clean", () => {
    SimsLive.deploy("all", [SIM])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(rows()).toHaveLength(1)

    SimsLive.undeploy()
    SimsLive.deploy("all", [SIM])
    openPanel()
    // Same text after a fresh deploy must render again (dedup set was cleared).
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    expect(rows()).toHaveLength(1)
  })

  it("undeploy tears down the launcher, panel, transient halo, and state", async () => {
    makeTarget()
    SimsLive.deploy("all", [SIM])
    openPanel()
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])
    ;(rows()[0].querySelector(".ksl-r-act.jump") as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(600)
    expect(document.querySelector(".klav-halo")).toBeTruthy()

    SimsLive.undeploy()

    expect(document.querySelector("#klav-sims-live")).toBeNull()
    expect(document.querySelector(".klav-halo")).toBeNull()
    expect(document.querySelector("#klav-sims-overlay")).toBeNull()
  })

  it("opening then collapsing the panel toggles the launcher back into view", () => {
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [OBS])

    openPanel()
    expect((shadow()?.querySelector(".ksl-panel") as HTMLElement).classList.contains("is-open")).toBe(true)
    expect(launcher().hidden).toBe(true)

    const collapse = shadow()?.querySelector(".ksl-icon-btn") as HTMLButtonElement
    collapse.click()
    expect((shadow()?.querySelector(".ksl-panel") as HTMLElement).classList.contains("is-open")).toBe(false)
    expect(launcher().hidden).toBe(false)
  })
})
