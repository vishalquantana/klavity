// @vitest-environment jsdom
// KD-2869: in the in-page "Sims on this page" menu, an Activated Sim that isn't running is "Not running" (not "Stopped" —
// it may never have been started). Deactivated Sims keep their own label.
import { afterEach, describe, expect, it } from "vitest"
import { SimsLive, type CardSim } from "./sims-live"

const flush = () => new Promise((r) => setTimeout(r, 0))
const A = { id: "a", name: "Alex Walker", initials: "AW", accent: "#7c3aed" }
const sims: CardSim[] = [
  { id: "a", name: "Alex Walker", active: true, running: true },
  { id: "b", name: "Bea Reviewer", active: true, running: false },
  { id: "c", name: "Cy Deactivated", active: false, running: false },
]
const shadow = () => (document.querySelector("#klav-sims-live") as HTMLElement).shadowRoot!

afterEach(() => SimsLive.undeploy())

describe("in-page Sims menu labels", () => {
  it("shows Running / Not running / Deactivated, and groups the idle Sims under 'Not running'", async () => {
    SimsLive.deploy("all", [A], { onClose: () => { }, simControls: { list: async () => sims.map((s) => ({ ...s })), run: async () => sims, stop: async () => sims } })
    ;(shadow().querySelector(".ksl-launcher") as HTMLButtonElement).click()
    ;(shadow().querySelector(".ksl-sims-btn") as HTMLButtonElement).click()
    await flush(); await flush()
    const label = (name: string) =>
      [...shadow().querySelectorAll(".ksl-sm-row")].find((r) => r.textContent!.includes(name))?.querySelector(".ksl-sm-st")?.textContent
    expect(label("Alex Walker")).toBe("Running")
    expect(label("Bea Reviewer")).toBe("Not running")
    expect(label("Cy Deactivated")).toBe("Deactivated")
    const groups = [...shadow().querySelectorAll(".ksl-sm-group")].map((g) => g.textContent)
    expect(groups).toEqual(["Running · 1", "Not running · 1", "Deactivated · 1"])
    expect(shadow().textContent).not.toContain("Stopped")
  })
})
