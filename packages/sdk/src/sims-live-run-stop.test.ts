// @vitest-environment jsdom
// Sims feedback card under the Run / Stop model: a stopped Sim keeps the issues it already reported but adds no new ones; a
// started Sim is added without clearing the card; the card's × (Close) hands control to the host (which stops every Sim).

import { afterEach, describe, expect, it, vi } from "vitest"
import { SimsLive } from "./sims-live"

const A = { id: "sim_a", name: "Alex Walker", initials: "AW", accent: "#7c3aed" }
const B = { id: "sim_b", name: "Bea Reviewer", initials: "BR", accent: "#37b58f" }

const shadow = () => (document.querySelector("#klav-sims-live") as HTMLElement | null)?.shadowRoot ?? null
const launcherText = () => (shadow()?.querySelector(".ksl-pill-txt") as HTMLElement).textContent ?? ""
const findingTexts = () => {
  // Open the panel so the rows render, then read them.
  ;(shadow()!.querySelector(".ksl-launcher") as HTMLElement | null)?.click()
  return [...shadow()!.querySelectorAll(".ksl-row")].map((r) => r.textContent || "")
}
const concern = (text: string) => ({ text, sentiment: "frustrated", priority: "high" })

afterEach(() => SimsLive.undeploy())

describe("Sims feedback card — Run / Stop", () => {
  it("a stopped Sim keeps its earlier findings but adds no new ones", () => {
    SimsLive.updateSims!([A, B])
    SimsLive.renderFeedback(A.id, A.name, [concern("Checkout button is hidden")])
    SimsLive.updateSims!([B]) // A stopped
    SimsLive.renderFeedback(A.id, A.name, [concern("A late finding from an in-flight review")])
    SimsLive.renderFeedback(B.id, B.name, [concern("Price is unclear")])
    const rows = findingTexts()
    expect(rows.some((t) => t.includes("Checkout button is hidden"))).toBe(true)
    expect(rows.some((t) => t.includes("Price is unclear"))).toBe(true)
    expect(rows.some((t) => t.includes("A late finding"))).toBe(false)
  })

  it("starting another Sim adds it without clearing the card", () => {
    SimsLive.updateSims!([A])
    SimsLive.renderFeedback(A.id, A.name, [concern("Checkout button is hidden")])
    SimsLive.updateSims!([A, B])
    expect(findingTexts().some((t) => t.includes("Checkout button is hidden"))).toBe(true)
  })

  it("the launcher counts the RUNNING Sims", () => {
    SimsLive.updateSims!([A, B])
    expect(launcherText()).toBe("2 Sims are running on this page")
    SimsLive.updateSims!([B])
    expect(launcherText()).toBe("1 Sim is running on this page")
  })

  it("with a Close handler the header has Minimize (–) and Close (×); × calls the host", () => {
    const onClose = vi.fn()
    SimsLive.updateSims!([A], { onClose })
    const close = shadow()!.querySelector<HTMLButtonElement>(".ksl-close-btn")!
    expect(close.getAttribute("aria-label")).toBe("Close Sims feedback and stop all Sims")
    expect(shadow()!.querySelectorAll(".ksl-head-btns .ksl-icon-btn")).toHaveLength(2)
    close.click()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("without a Close handler (older hosts) × still just minimizes", () => {
    SimsLive.deploy("all", [A])
    expect(shadow()!.querySelector(".ksl-close-btn")).toBeNull()
  })
})

describe("Sims feedback card — header Sims menu", () => {
  const flush = () => new Promise((r) => setTimeout(r, 0))
  type S = { id: string; name: string; active: boolean; running: boolean }
  const setup = (initial: S[]) => {
    let sims = initial.map((s) => ({ ...s }))
    const calls: Array<[string, string[]]> = []
    const apply = (ids: string[], running: boolean) => { sims = sims.map((s) => ids.includes(s.id) ? { ...s, running } : s); return sims.map((s) => ({ ...s })) }
    const ctl = {
      list: vi.fn(async () => sims.map((s) => ({ ...s }))),
      run: vi.fn(async (ids: string[]) => { calls.push(["run", ids]); return apply(ids, true) }),
      stop: vi.fn(async (ids: string[]) => { calls.push(["stop", ids]); return apply(ids, false) }),
    }
    SimsLive.updateSims!([A], { onClose: () => {}, simControls: ctl })
    ;(shadow()!.querySelector(".ksl-launcher") as HTMLElement).click() // open the panel
    return { ctl, calls }
  }
  const menu = () => shadow()!.querySelector(".ksl-simmenu") as HTMLElement | null
  const row = (id: string) => menu()!.querySelector<HTMLElement>(`.ksl-sm-row[data-sim-id="${id}"]`)!
  const openMenu = async () => { shadow()!.querySelector<HTMLButtonElement>(".ksl-sims-btn")!.click(); await flush() }
  const SIMS: S[] = [
    { id: "sim_a", name: "Alex Walker", active: true, running: true },
    { id: "sim_b", name: "Bea Reviewer", active: true, running: false },
    { id: "sim_c", name: "Cleo Off", active: false, running: false },
  ]

  it("lists every Sim: running / stopped with Run or Stop, Deactivated with no control", async () => {
    setup(SIMS)
    await openMenu()
    expect([...menu()!.querySelectorAll<HTMLElement>(".ksl-sm-row")].map((r) => r.dataset.simId)).toEqual(["sim_a", "sim_b", "sim_c"])
    expect(row("sim_a").querySelector<HTMLElement>(".ksl-sm-act")!.dataset.action).toBe("stop")
    expect(row("sim_b").querySelector<HTMLElement>(".ksl-sm-act")!.dataset.action).toBe("run")
    expect(row("sim_c").querySelector(".ksl-sm-act")).toBeNull()
    expect(row("sim_c").textContent).toContain("Deactivated")
  })

  it("clicking a Deactivated Sim says to activate it on the Sims tab", async () => {
    setup(SIMS)
    await openMenu()
    row("sim_c").click()
    expect(menu()!.querySelector(".ksl-sm-note")!.textContent).toBe("Cleo Off is deactivated. Activate this Sim on the Sims tab to run it.")
  })

  it("Run / Stop on a single row calls the host", async () => {
    const { calls } = setup(SIMS)
    await openMenu()
    row("sim_b").querySelector<HTMLButtonElement>(".ksl-sm-act")!.click()
    await flush()
    expect(calls).toEqual([["run", ["sim_b"]]])
    expect(row("sim_b").querySelector<HTMLElement>(".ksl-sm-act")!.dataset.action).toBe("stop")
  })

  it("multi-select: tick several, then Run / Stop only the ones each action applies to", async () => {
    const { calls } = setup(SIMS)
    await openMenu()
    row("sim_a").click(); row("sim_b").click()
    expect(menu()!.querySelector(".ksl-sm-cnt")!.textContent).toBe("2 selected")
    const bulk = (a: string) => menu()!.querySelector<HTMLButtonElement>(`[data-action="${a}"]`)!
    expect(bulk("run-selected").textContent).toBe("Run 1")
    expect(bulk("stop-selected").textContent).toBe("Stop 1")
    bulk("stop-selected").click()
    await flush()
    expect(calls).toEqual([["stop", ["sim_a"]]])
  })

  it("the menu view keeps Minimize (–) and Close (×) in its own header", async () => {
    const onClose = vi.fn()
    let sims = SIMS.map((s) => ({ ...s }))
    SimsLive.updateSims!([A], { onClose, simControls: { list: async () => sims, run: async () => sims, stop: async () => sims } })
    ;(shadow()!.querySelector(".ksl-launcher") as HTMLElement).click()
    await openMenu()
    menu()!.querySelector<HTMLButtonElement>(".ksl-sm-close")!.click()
    expect(onClose).toHaveBeenCalledTimes(1)
    menu()!.querySelector<HTMLButtonElement>(".ksl-sm-min")!.click()
    expect(menu()).toBeNull()
    expect(shadow()!.querySelector(".ksl-panel")!.classList.contains("is-open")).toBe(false)
  })

  it("Escape closes the menu before the panel", async () => {
    setup(SIMS)
    await openMenu()
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    expect(menu()).toBeNull()
    expect(shadow()!.querySelector(".ksl-panel")!.classList.contains("is-open")).toBe(true)
  })
})
