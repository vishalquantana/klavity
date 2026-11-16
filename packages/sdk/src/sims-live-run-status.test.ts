// @vitest-environment jsdom
// KD-1465: after "Deploy all Sims" the Sims feedback panel gave no sign that a Sim run was in progress or had
// finished (setReviewing was never called, and its copy only showed while the panel was empty). Each run now
// reports analysing → running → completed / failed, shown on a status line in the panel header.

import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { SimsLive } from "./sims-live"

const SIM = { id: "sim_a", name: "Alex Walker", initials: "AW", accent: "#7c3aed" }
const SIM2 = { id: "sim_b", name: "Bea Reviewer", initials: "BR", accent: "#37b58f" }

const shadow = () => (document.querySelector("#klav-sims-live") as HTMLElement | null)?.shadowRoot ?? null
const statusEl = () => shadow()?.querySelector(".ksl-status") as HTMLElement
const launcherText = () => (shadow()?.querySelector(".ksl-pill-txt") as HTMLElement).textContent ?? ""
const concern = (text: string) => ({ text, sentiment: "frustrated", priority: "high" })

afterEach(() => SimsLive.undeploy())

describe("Sims feedback run status", () => {
  it("is hidden until a run starts", () => {
    SimsLive.deploy("all", [SIM, SIM2])
    expect(statusEl().hidden).toBe(true)
  })

  it("shows analysing → running → completed with the run's new findings", () => {
    SimsLive.deploy("all", [SIM, SIM2])
    SimsLive.setRunStatus("analysing")
    expect(statusEl().hidden).toBe(false)
    expect(statusEl().className).toContain("is-analysing")
    expect(statusEl().textContent).toBe("2 Sims are analysing this page…")
    expect(launcherText()).toBe("2 Sims are analysing this page…")

    SimsLive.setRunStatus("running")
    expect(statusEl().textContent).toBe("Sims are running on this page…")
    expect(launcherText()).toBe("Sims are running on this page…")

    SimsLive.renderFeedback(SIM.id, SIM.name, [concern("Checkout button is hidden"), concern("Price is unclear")])
    SimsLive.setRunStatus("completed")
    expect(statusEl().className).toContain("is-completed")
    expect(statusEl().textContent).toBe("Sim run completed · 2 new findings")
    expect(launcherText()).toContain("2 findings from your Sims")
  })

  it("stays visible when findings are already listed (the reported case)", () => {
    SimsLive.deploy("all", [SIM])
    SimsLive.renderFeedback(SIM.id, SIM.name, [concern("Old finding")])
    SimsLive.setRunStatus("analysing")
    expect(statusEl().hidden).toBe(false)
    expect(statusEl().textContent).toBe("Sim is analysing this page…")
    SimsLive.setRunStatus("running")
    SimsLive.setRunStatus("completed")
    expect(statusEl().textContent).toBe("Sim run completed · no new findings")
  })

  it("shows a failed run", () => {
    SimsLive.deploy("all", [SIM])
    SimsLive.setRunStatus("analysing")
    SimsLive.setRunStatus("failed")
    expect(statusEl().className).toContain("is-failed")
    expect(statusEl().textContent).toContain("Sim run didn't finish")
  })

  it("overlapping runs report completed only after the last one ends", () => {
    SimsLive.deploy("all", [SIM])
    SimsLive.setRunStatus("analysing")   // boot review
    SimsLive.setRunStatus("analysing")   // watch engine review
    SimsLive.setRunStatus("completed")
    expect(statusEl().className).toContain("is-running")
    SimsLive.setRunStatus("completed")
    expect(statusEl().className).toContain("is-completed")
  })

  it("is cleared on undeploy / redeploy", () => {
    SimsLive.deploy("all", [SIM])
    SimsLive.setRunStatus("running")
    SimsLive.deploy("all", [SIM])
    expect(statusEl().hidden).toBe(true)
  })
})

describe("callers report the run phases", () => {
  const widget = readFileSync(join(__dirname, "widget.ts"), "utf8")
  const watch = readFileSync(join(__dirname, "sims-watch.ts"), "utf8")
  it("the boot review (Deploy all Sims) reports every phase", () => {
    const boot = widget.slice(widget.indexOf("async function bootReview("), widget.indexOf("function openConnect("))
    for (const s of ['runStatus("analysing")', 'runStatus("running")', 'runStatus("completed")', 'runStatus("failed")'])
      expect(boot).toContain(s)
  })
  it("the watch engine reports every phase", () => {
    for (const s of ["runStatus('analysing')", "runStatus('running')", "runStatus('completed')", "runStatus('failed')"])
      expect(watch).toContain(s)
  })
})
