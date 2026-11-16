// @vitest-environment jsdom
// KD-1459: the Sims feedback panel showed the same finding twice in a row. The widget's reviews are adhoc
// (the server skips its near-dup filter) and the watch engine re-reviews the same page, so the AI returned
// the finding again, slightly reworded — exact-text dedup let both through.

import { afterEach, describe, expect, it } from "vitest"
import { SimsLive } from "./sims-live"

const SIM = { id: "sim_a", name: "Alex Walker", initials: "AW", accent: "#7c3aed" }
const SIM2 = { id: "sim_b", name: "Bea Reviewer", initials: "BR", accent: "#37b58f" }

const shadow = () => (document.querySelector("#klav-sims-live") as HTMLElement | null)?.shadowRoot ?? null
const rowTexts = () => Array.from(shadow()?.querySelectorAll(".ksl-r-obs") ?? []).map((e) => e.textContent)
const open = () => (shadow()?.querySelector(".ksl-launcher") as HTMLButtonElement).click()
const concern = (text: string) => ({ text, sentiment: "confused", priority: "medium" })

const DATE_1 = "The date format for 'Objection Lodged' and 'Objection Finalised' seems inconsistent, which makes it hard to compare the two dates."
const DATE_2 = "The date format for \"Objection Lodged\" and \"Objection Finalised\" seems inconsistent, making it hard to compare the two dates."

afterEach(() => SimsLive.undeploy())

describe("Sims feedback near-duplicate findings", () => {
  it("a reworded repeat from the same Sim on a later review is not shown again (the reported case)", () => {
    SimsLive.deploy("all", [SIM])
    open()
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_1)])
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_2)])
    expect(rowTexts()).toEqual([DATE_1])
  })

  it("a reworded repeat inside one response is not shown twice", () => {
    SimsLive.deploy("all", [SIM])
    open()
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_1), concern(DATE_2)])
    expect(rowTexts()).toEqual([DATE_1])
  })

  it("near-identical text from another Sim is not shown twice", () => {
    SimsLive.deploy("all", [SIM, SIM2])
    open()
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_1)])
    SimsLive.renderFeedback(SIM2.id, SIM2.name, [concern(DATE_2)])
    expect(rowTexts()).toEqual([DATE_1])
  })

  it("different findings — same Sim or other Sims on the same element — all stay", () => {
    SimsLive.deploy("all", [SIM, SIM2])
    open()
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_1), concern("The Save button has no label for screen readers.")])
    SimsLive.renderFeedback(SIM2.id, SIM2.name, [concern("I can't tell which objection dates are overdue — nothing highlights them.")])
    expect(rowTexts()).toHaveLength(3)
  })

  it("a dismissed finding does not come back reworded", async () => {
    SimsLive.deploy("all", [SIM])
    open()
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_1)])
    ;(shadow()?.querySelector(".ksl-r-act.dismiss") as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 350))   // row removal animation
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_2)])
    expect(rowTexts()).toEqual([])
  })

  it("redeploying starts fresh", () => {
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_1)])
    SimsLive.deploy("all", [SIM])
    open()
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern(DATE_2)])
    expect(rowTexts()).toEqual([DATE_2])
  })
})
