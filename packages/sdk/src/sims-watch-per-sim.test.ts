// KD-1456: the watch engine reviews each Sim in its own request (one shared screenshot) so the Sims feedback
// panel can show each Sim's own status; stop() clears the status of a review it cancels.

import { afterEach, describe, expect, it, vi } from "vitest"
import { startSimsWatch } from "./sims-watch"

function harness(fetchImpl?: (init: RequestInit) => Promise<Response>) {
  const listeners: Record<string, () => void> = {}
  const kl = { renderFeedback: vi.fn(), setSimStatus: vi.fn(), setRunStatus: vi.fn() }
  vi.stubGlobal("document", { title: "Objections", documentElement: { scrollHeight: 1200 }, body: null, getElementById: () => null, querySelectorAll: () => [] })
  vi.stubGlobal("window", {
    scrollY: 0, scrollX: 0, innerWidth: 1280, innerHeight: 800,
    addEventListener: (t: string, cb: () => void) => { listeners[t] = cb },
    removeEventListener: vi.fn(),
    KlavitySims: kl,
  })
  vi.stubGlobal("location", { href: "https://px4.test/objections", pathname: "/objections", search: "", hash: "" })
  vi.stubGlobal("history", { pushState: vi.fn(), replaceState: vi.fn() })
  const fetchMock = vi.fn(async (_u: string, init: RequestInit) => {
    if (fetchImpl) return fetchImpl(init)
    const simId = JSON.parse(String(init.body)).simIds?.[0]
    return { ok: true, json: async () => ({ ok: true, reviews: [{ simId, simName: simId, observations: [{ observation: `finding from ${simId}` }] }] }) } as unknown as Response
  })
  vi.stubGlobal("fetch", fetchMock)
  return { kl, fetchMock, scroll: () => listeners.scroll?.() }
}

const opts = (simIds?: string[]) => ({
  backendUrl: "https://klavity.test", projectId: "proj_1", simIds, minIntervalMs: 0, scrollDebounceMs: 0,
  captureViewport: async () => "data:image/png;base64,ZmFrZQ==",
})

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe("sims-watch per-Sim reviews", () => {
  it("sends one request per Sim, each with only that Sim, sharing one screenshot", async () => {
    vi.useFakeTimers()
    const h = harness()
    const capture = vi.fn(async () => "data:image/png;base64,ZmFrZQ==")
    const ctrl = startSimsWatch({ ...opts(["sim_a", "sim_b"]), captureViewport: capture })
    h.scroll()
    await vi.advanceTimersByTimeAsync(50)
    expect(capture).toHaveBeenCalledTimes(1)
    const sent = h.fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init.body)).simIds)
    expect(sent).toEqual([["sim_a"], ["sim_b"]])
    expect(h.kl.renderFeedback).toHaveBeenCalledTimes(2)
    ctrl.stop()
  })

  it("reports each Sim's phases: analysing → running → completed", async () => {
    vi.useFakeTimers()
    const h = harness()
    const ctrl = startSimsWatch(opts(["sim_a", "sim_b"]))
    h.scroll()
    await vi.advanceTimersByTimeAsync(50)
    const forA = h.kl.setSimStatus.mock.calls.filter(([id]) => id === "sim_a").map(([, s]) => s)
    expect(forA).toEqual(["analysing", "running", "completed"])
    expect(h.kl.setRunStatus.mock.calls.map(([s]) => s)).toEqual(["analysing", "running", "completed"])
    ctrl.stop()
  })

  it("one Sim failing marks only that Sim failed; the run still completes", async () => {
    vi.useFakeTimers()
    const h = harness(async (init) => {
      const simId = JSON.parse(String(init.body)).simIds[0]
      if (simId === "sim_b") return { ok: false, status: 500, json: async () => ({}) } as unknown as Response
      return { ok: true, json: async () => ({ ok: true, reviews: [{ simId, simName: simId, observations: [] }] }) } as unknown as Response
    })
    const ctrl = startSimsWatch(opts(["sim_a", "sim_b"]))
    h.scroll()
    await vi.advanceTimersByTimeAsync(50)
    expect(h.kl.setSimStatus).toHaveBeenCalledWith("sim_a", "completed")
    expect(h.kl.setSimStatus).toHaveBeenCalledWith("sim_b", "failed")
    expect(h.kl.setRunStatus).toHaveBeenLastCalledWith("completed")
    ctrl.stop()
  })

  it("without simIds it keeps the single request for all Sims", async () => {
    vi.useFakeTimers()
    const h = harness()
    const ctrl = startSimsWatch(opts())
    h.scroll()
    await vi.advanceTimersByTimeAsync(50)
    expect(h.fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(h.fetchMock.mock.calls[0][1].body)).simIds).toBeUndefined()
    expect(h.kl.setSimStatus).not.toHaveBeenCalled()
    ctrl.stop()
  })

  it("stop() mid-review clears the cancelled Sims' status (no chip left spinning)", async () => {
    vi.useFakeTimers()
    const h = harness((init) => new Promise((_, rej) => init.signal?.addEventListener("abort", () => rej(Object.assign(new Error("aborted"), { name: "AbortError" })))))
    const ctrl = startSimsWatch(opts(["sim_a"]))
    h.scroll()
    await vi.advanceTimersByTimeAsync(50)
    expect(h.kl.setSimStatus).toHaveBeenLastCalledWith("sim_a", "running")
    ctrl.stop()
    expect(h.kl.setSimStatus).toHaveBeenLastCalledWith("sim_a", null)
    expect(h.kl.setRunStatus).toHaveBeenLastCalledWith(null)
    await vi.advanceTimersByTimeAsync(50)
    expect(h.kl.setSimStatus).toHaveBeenLastCalledWith("sim_a", null)   // no late "failed"
  })
})
