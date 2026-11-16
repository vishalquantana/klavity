// @vitest-environment jsdom
// KD-2870: the "N Sims are running on this page" pill has an on-screen Stop (stops every Sim), so nobody has to
// open the panel or the right-click menu to stop. It reuses the host's close handler — the same action as the panel's ×.
import { afterEach, describe, expect, it, vi } from "vitest"
import { SimsLive } from "./sims-live"

const A = { id: "a", name: "Alex Walker", initials: "AW", accent: "#7c3aed" }
const shadow = () => (document.querySelector("#klav-sims-live") as HTMLElement).shadowRoot!
const stopBtn = () => shadow().querySelector(".ksl-stop-all") as HTMLButtonElement | null
const launcher = () => shadow().querySelector(".ksl-launcher") as HTMLButtonElement

afterEach(() => SimsLive.undeploy())

describe("on-screen Stop for the running-Sims pill", () => {
  it("is shown next to the pill, labelled Stop, and stops all Sims without opening the panel", () => {
    const onClose = vi.fn()
    SimsLive.deploy("all", [A], { onClose })
    const b = stopBtn()!
    expect(b).toBeTruthy()
    expect(b.textContent).toContain("Stop")
    expect(b.getAttribute("aria-label")).toBe("Stop all Sims")
    expect(b.parentElement).toBe(launcher().parentElement)          // side by side in one dock
    expect(b.tagName).toBe("BUTTON")
    expect(launcher().contains(b)).toBe(false)                       // never a button nested in the pill button
    b.click()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(shadow().querySelector(".ksl-panel.is-open")).toBeNull()  // did not open the panel
  })

  it("is absent when the host gives no close handler (nothing to stop)", () => {
    SimsLive.deploy("all", [A], {})
    expect(stopBtn()).toBeNull()
  })

  it("does not break the pill: clicking it still opens the panel", () => {
    SimsLive.deploy("all", [A], { onClose: () => { } })
    launcher().click()
    expect(shadow().querySelector(".ksl-panel.is-open")).not.toBeNull()
  })

  it("sits INSIDE the pill group on the right (after the label) and hides with the whole pill while the panel is open", () => {
    SimsLive.deploy("all", [A], { onClose: () => { } })
    const group = launcher().parentElement as HTMLElement
    expect(group.classList.contains("ksl-launch-group")).toBe(true)
    expect(group.lastElementChild).toBe(stopBtn())                  // right-most control of the pill
    expect(launcher().nextElementSibling).toBe(stopBtn())
    launcher().click()
    expect(group.hidden).toBe(true)                                  // label + Stop go away together
    expect(shadow().querySelector(".ksl-panel.is-open")).not.toBeNull()
  })

  it("is styled as a red destructive action inside the pill", () => {
    SimsLive.deploy("all", [A], { onClose: () => { } })
    const css = [...shadow().querySelectorAll("style")].map((x) => x.textContent).join(" ")
    const block = (sel: string) => css.slice(css.indexOf(sel + " {"), css.indexOf("}", css.indexOf(sel + " {")))
    expect(block(".ksl-stop-all")).toContain("rgba(233,79,55")
    expect(block(".ksl-stop-all:hover")).toContain("#d93a4f")
  })
})
