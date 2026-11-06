// KD-1456: Deploy all Sims and Select Sims both review each Sim in its own request (so each Sim's status
// moves on its own in the Sims feedback panel) and wire the panel's Pause / Resume button.
import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const src = readFileSync(join(__dirname, "widget.ts"), "utf8")
const boot = src.slice(src.indexOf("async function bootReview("), src.indexOf("function openConnect("))

describe("widget per-Sim Sim reviews", () => {
  it("the first review sends one request per (unpaused) Sim and reports each Sim's phases", () => {
    expect(boot).toContain(".filter((id) => !_pausedSims.has(id))")
    expect(boot).toContain("if (id) body.simIds = [id]")
    expect(boot).toContain("ids.length ? ids.map((id) => reviewOne(id)) : [reviewOne()]")
    for (const s of ['simStatus(id, "analysing")', 'simStatus(id, "running")', 'simStatus(id, "completed")', 'simStatus(id, "failed")'])
      expect(boot).toContain(s)
  })

  it("Deploy all Sims passes explicit Sim ids (minus paused) to the watch engine", () => {
    expect(src).toContain("_deployAllIds = simIds === 'all' ? sims.map((s) => s.id) : simIds")
    expect(src).toContain("const active = _deployAllIds.filter((id) => !_pausedSims.has(id))")
  })

  it("Pause / Resume: Select Sims Sims go through the server, Deploy all Sims Sims pause on the page", () => {
    expect(src).toContain("SimsLive.onPauseToggle = async (simId, pause) => {")
    expect(src).toContain('await managedSimsApi().act(pause ? "pause" : "resume", [simId])')
    expect(src).toContain("if (!pause) void bootReview([simId])")
    expect(src).toContain('kl?.setSimPaused?.(s.id, s.execution !== "running")')
  })
})
