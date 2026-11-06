// @vitest-environment jsdom
// KD-1456: the Sims feedback panel shows each deployed Sim's status — a chip per Sim with a spinner while
// that Sim is still reviewing ("MC · -"), and, for the selected Sim, "Sim is analysing… 1/3" (→ 2/3 → 3/3)
// with a Pause / Resume button.

import { afterEach, describe, expect, it, vi } from "vitest"
import { SimsLive } from "./sims-live"

const SD = { id: "sim_sd", name: "Sara Dunn", initials: "SD", accent: "#2563eb" }
const MC = { id: "sim_mc", name: "Marcus Chen", initials: "MC", accent: "#a21caf" }

const shadow = () => (document.querySelector("#klav-sims-live") as HTMLElement | null)?.shadowRoot ?? null
const open = () => (shadow()?.querySelector(".ksl-launcher") as HTMLButtonElement).click()
const chips = () => Array.from(shadow()?.querySelectorAll(".ksl-chips .ksl-chip") ?? []) as HTMLButtonElement[]
const chip = (label: string) => chips().find((c) => c.textContent?.startsWith(label))!
const simHead = () => shadow()?.querySelector(".ksl-simhead") as HTMLElement
const headStatus = () => (simHead().querySelector(".ksl-simhead-status") as HTMLElement).textContent
const pauseBtn = () => simHead().querySelector(".ksl-pause") as HTMLButtonElement | null
const concern = (text: string) => ({ text, sentiment: "frustrated", priority: "high" })
const flush = () => new Promise((r) => setTimeout(r, 0))

afterEach(() => { SimsLive.onPauseToggle = null; SimsLive.undeploy() })

describe("Sims feedback per-Sim status", () => {
  it("shows All + a chip for every deployed Sim, even before any findings", () => {
    SimsLive.deploy("all", [SD, MC])
    open()
    expect(chips().map((c) => c.textContent)).toEqual(["All", "SD · 0", "MC · 0"])
    expect(chip("All").classList.contains("is-on")).toBe(true)
  })

  it("a Sim still reviewing shows a spinner and '· -'; it stops when that Sim completes", () => {
    SimsLive.deploy("all", [SD, MC])
    open()
    SimsLive.setSimStatus(SD.id, "analysing")
    SimsLive.setSimStatus(MC.id, "analysing")
    SimsLive.setSimStatus(SD.id, "running")
    SimsLive.renderFeedback(SD.id, SD.name, [concern("Labels are blurred"), concern("No filter for dates")])
    SimsLive.setSimStatus(SD.id, "completed")
    expect(chip("SD").textContent).toBe("SD · 2")
    expect(chip("SD").querySelector(".ksl-spin")).toBeNull()
    expect(chip("MC").textContent).toBe("MC · -")
    expect(chip("MC").querySelector(".ksl-spin")).not.toBeNull()
  })

  it("selecting a Sim shows its name and the 1/3 → 2/3 → 3/3 steps", () => {
    SimsLive.deploy("all", [SD, MC])
    open()
    expect(simHead().hidden).toBe(true)
    chip("MC").click()
    expect(simHead().hidden).toBe(false)
    expect(simHead().textContent).toContain("Marcus Chen")
    SimsLive.setSimStatus(MC.id, "analysing")
    expect(headStatus()).toBe("Sim is analysing… 1/3")
    expect(simHead().querySelector(".ksl-spin")).not.toBeNull()
    SimsLive.setSimStatus(MC.id, "running")
    expect(headStatus()).toBe("Sim is running… 2/3")
    SimsLive.setSimStatus(MC.id, "completed")
    expect(headStatus()).toBe("Sim run completed 3/3")
    expect(simHead().querySelector(".ksl-spin")).toBeNull()
    chip("All").click()
    expect(simHead().hidden).toBe(true)
  })

  it("a selected Sim with no findings yet says it's still reviewing", () => {
    SimsLive.deploy("all", [SD, MC])
    open()
    SimsLive.setSimStatus(MC.id, "running")
    chip("MC").click()
    expect(shadow()?.querySelector(".ksl-empty-title")?.textContent).toBe("Marcus Chen is still reviewing this page…")
  })

  it("no Pause button without a pause handler", () => {
    SimsLive.deploy("all", [MC])
    open()
    chip("MC").click()
    expect(pauseBtn()).toBeNull()
  })

  it("Pause calls the handler, then shows Paused + Resume; Resume flips it back", async () => {
    const hook = vi.fn(async () => true)
    SimsLive.onPauseToggle = hook
    SimsLive.deploy("all", [SD, MC])
    open()
    SimsLive.setSimStatus(MC.id, "running")
    chip("MC").click()
    expect(pauseBtn()!.textContent).toContain("Pause")
    pauseBtn()!.click()
    await flush()
    expect(hook).toHaveBeenLastCalledWith(MC.id, true)
    expect(headStatus()).toBe("Paused — not reviewing this page")
    expect(pauseBtn()!.textContent).toContain("Resume")
    expect(chip("MC").classList.contains("is-paused")).toBe(true)
    expect(chip("MC").querySelector(".ksl-spin")).toBeNull()
    pauseBtn()!.click()
    await flush()
    expect(hook).toHaveBeenLastCalledWith(MC.id, false)
    expect(pauseBtn()!.textContent).toContain("Pause")
  })

  it("a failed Pause leaves the Sim running", async () => {
    SimsLive.onPauseToggle = async () => false
    SimsLive.deploy("all", [MC])
    open()
    chip("MC").click()
    pauseBtn()!.click()
    await flush()
    expect(pauseBtn()!.textContent).toContain("Pause")
    expect(pauseBtn()!.disabled).toBe(false)
  })

  it("setSimPaused from outside (dashboard / Select Sims) shows in the panel", () => {
    SimsLive.deploy("all", [MC])
    open()
    chip("MC").click()
    SimsLive.setSimPaused(MC.id, true)
    expect(headStatus()).toBe("Paused — not reviewing this page")
  })

  it("redeploy clears every Sim's status", () => {
    SimsLive.deploy("all", [MC])
    SimsLive.setSimStatus(MC.id, "running")
    SimsLive.setSimPaused(MC.id, true)
    SimsLive.deploy("all", [MC])
    open()
    expect(chip("MC").textContent).toBe("MC · 0")
    expect(chip("MC").classList.contains("is-paused")).toBe(false)
  })
})
