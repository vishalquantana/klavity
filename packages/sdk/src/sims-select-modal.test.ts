// @vitest-environment jsdom
// Select Sims modal — per-user Run / Stop (Activate / Deactivate stays on the dashboard Sims tab).
import { afterEach, describe, it, expect, vi } from "vitest"
import {
  openSelectSimsModal, createSelectSimsApi, SELECT_SIMS_HOST_ID, managedSigOf, planManagedSync, isSimRunning,
  type ManagedSim, type ManagedSimAction, type SelectSimsApi,
} from "./sims-select-modal"

const flush = () => new Promise((r) => setTimeout(r, 0))

const sim = (id: string, name: string, role: string, run: "running" | "stopped", active = true): ManagedSim =>
  ({ id, name, role, run, active })

/** In-memory backend with the same rules as prototype/lib/sim-run-state.ts + the endpoint (only active Sims can run). */
function fakeApi(initial: ManagedSim[]) {
  let sims = initial.map((s) => ({ ...s }))
  const calls: Array<{ action: ManagedSimAction; simIds?: string[] }> = []
  let gate: Promise<void> | null = null
  const api: SelectSimsApi = {
    load: vi.fn(async () => sims.map((s) => ({ ...s }))),
    act: vi.fn(async (action: ManagedSimAction, simIds?: string[]) => {
      calls.push({ action, simIds })
      if (gate) await gate
      const applied: string[] = []
      const skipped: Array<{ simId: string; reason: string }> = []
      sims = sims.map((s) => {
        const target = action === "stop_all" || (simIds || []).includes(s.id)
        if (!target) return s
        if (action === "run") {
          if (s.active === false) { skipped.push({ simId: s.id, reason: "deactivated on the Sims tab — activate it there first" }); return s }
          if (s.run === "running") return s
          applied.push(s.id); return { ...s, run: "running" as const }
        }
        if (s.run !== "running") return s
        applied.push(s.id); return { ...s, run: "stopped" as const }
      })
      return { applied, skipped, sims: sims.map((s) => ({ ...s })) }
    }),
  }
  return { api, calls, hold: () => { let release!: () => void; gate = new Promise((r) => { release = r }); return () => { gate = null; release() } } }
}

const root = () => document.getElementById(SELECT_SIMS_HOST_ID)!.shadowRoot!
const rows = () => [...root().querySelectorAll<HTMLElement>(".kss-row")]
const row = (id: string) => root().querySelector<HTMLElement>(`.kss-row[data-sim-id="${id}"]`)!
const rowBtn = (id: string) => row(id).querySelector<HTMLButtonElement>(".kss-exec")
const foot = (action: string) => root().querySelector<HTMLButtonElement>(`.kss-foot [data-action="${action}"]`)!

const PROJECT = [
  sim("s1", "Eleanor Vance", "Technology executive", "stopped"),
  sim("s2", "Sarah Davis", "Product manager", "running"),
  sim("s3", "Marcus Chen", "Digital transformation leader", "stopped"),
  sim("s4", "Priya Nair", "Finance lead", "stopped", false),
]

afterEach(() => { document.body.innerHTML = "" })

describe("Select Sims modal — Run / Stop", () => {
  it("lists every Sim with ONE control: Run when stopped, Stop when running; running first, Deactivated last", async () => {
    const { api } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    expect(rows().map((r) => r.dataset.simId)).toEqual(["s2", "s1", "s3", "s4"])
    expect(row("s1").textContent).toContain("Eleanor Vance")
    expect(row("s1").textContent).toContain("Technology executive")
    expect(row("s2").querySelector('[data-kind="run"]')!.textContent).toBe("Running")
    expect(row("s1").querySelector('[data-kind="run"]')!.textContent).toBe("Not running")   // KD-2869: never "Stopped" for a Sim that was never started
    expect(rowBtn("s2")!.dataset.action).toBe("stop")
    expect(rowBtn("s1")!.dataset.action).toBe("run")
    // No Deploy / Deactivate / Pause / Resume anywhere.
    expect(root().querySelector('[data-action="deploy"],[data-action="deactivate"],[data-action="pause"],[data-action="resume"]')).toBeNull()
    expect(root().querySelector(".kss-count")!.textContent).toBe("1 of 3 Sims running")
  })

  it("Run starts that Sim and reports the change to the page", async () => {
    const { api, calls } = fakeApi(PROJECT)
    const onChange = vi.fn()
    openSelectSimsModal({ api, onChange })
    await flush()
    rowBtn("s1")!.click()
    await flush()
    expect(calls).toEqual([{ action: "run", simIds: ["s1"] }])
    expect(rowBtn("s1")!.dataset.action).toBe("stop")
    expect(onChange).toHaveBeenCalledWith(expect.any(Array), { action: "run", applied: ["s1"] })
    expect(root().querySelector(".kss-toast")!.textContent).toContain("Eleanor Vance is running")
  })

  it("Stop stops that Sim (its reported issues stay) and reports the change", async () => {
    const { api, calls } = fakeApi(PROJECT)
    const onChange = vi.fn()
    openSelectSimsModal({ api, onChange })
    await flush()
    rowBtn("s2")!.click()
    await flush()
    expect(calls).toEqual([{ action: "stop", simIds: ["s2"] }])
    expect(rowBtn("s2")!.dataset.action).toBe("run")
    expect(onChange).toHaveBeenCalledWith(expect.any(Array), { action: "stop", applied: ["s2"] })
    expect(root().querySelector(".kss-toast")!.textContent).toContain("reported issues stay")
  })

  it("Run all starts only the stopped ACTIVE Sims; Stop all stops every running one", async () => {
    const { api, calls } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    foot("run_all").click()
    await flush()
    expect(calls[0]).toEqual({ action: "run", simIds: ["s1", "s3"] })
    expect(foot("run_all").hidden).toBe(true) // everything active is running now
    expect(root().querySelector(".kss-count")!.textContent).toBe("3 of 3 Sims running")
    foot("stop_all").click()
    await flush()
    expect(calls[1]).toEqual({ action: "stop_all", simIds: undefined })
    expect(foot("stop_all").hidden).toBe(true)
    expect(root().querySelector(".kss-count")!.textContent).toBe("0 of 3 Sims running")
  })

  it("filters by name or role", async () => {
    const { api } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    const input = root().querySelector<HTMLInputElement>("input")!
    input.value = "product"
    input.dispatchEvent(new Event("input"))
    expect(rows().map((r) => r.dataset.simId)).toEqual(["s2"])
  })

  it("KD-2869: an idle Activated Sim says 'Not running'; Run shows 'Running' at once and it stays Running after the server answers", async () => {
    const { api, hold } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    const badge = (id: string) => row(id).querySelector('[data-kind="run"]')!.textContent
    expect(badge("s1")).toBe("Not running")
    expect(badge("s3")).toBe("Not running")
    expect(badge("s2")).toBe("Running")
    expect(root().textContent).not.toContain("Stopped")
    const release = hold()
    rowBtn("s1")!.click()
    expect(badge("s1")).toBe("Running")              // instant, before the server answers
    release(); await flush(); await flush()
    expect(badge("s1")).toBe("Running")              // and no flip back once it has answered
    foot("stop_all").click()
    await flush(); await flush()
    expect(badge("s1")).toBe("Not running")
  })

  it("Run is INSTANT: the row flips and the toast shows before the server answers", async () => {
    const { api, hold } = fakeApi(PROJECT)
    const onChange = vi.fn()
    openSelectSimsModal({ api, onChange })
    await flush()
    const release = hold()
    rowBtn("s1")!.click()
    // Server still pending — the modal already shows the result, and nothing is locked.
    expect(rowBtn("s1")!.dataset.action).toBe("stop")
    expect(root().querySelector(".kss-toast")!.textContent).toContain("Eleanor Vance is running")
    expect(rowBtn("s3")!.disabled).toBe(false)
    expect(onChange).not.toHaveBeenCalled() // the page is driven by the SERVER's answer, not the prediction
    release(); await flush(); await flush()
    expect(onChange).toHaveBeenCalledWith(expect.any(Array), { action: "run", applied: ["s1"] })
  })

  it("quick successive clicks are all applied, sent one after another in order", async () => {
    const { api, calls, hold } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    const release = hold()
    rowBtn("s1")!.click()
    rowBtn("s3")!.click()
    rowBtn("s2")!.click()
    expect(root().querySelector(".kss-count")!.textContent).toBe("2 of 3 Sims running")
    release()
    for (let i = 0; i < 6; i++) await flush()
    expect(calls).toEqual([{ action: "run", simIds: ["s1"] }, { action: "run", simIds: ["s3"] }, { action: "stop", simIds: ["s2"] }])
    expect(root().querySelector(".kss-count")!.textContent).toBe("2 of 3 Sims running")
  })

  it("a failed call shows an error and puts the real state back", async () => {
    const { api } = fakeApi(PROJECT)
    ;(api.act as any).mockRejectedValueOnce(new Error("Server down"))
    openSelectSimsModal({ api })
    await flush()
    rowBtn("s1")!.click()
    expect(rowBtn("s1")!.dataset.action).toBe("stop") // optimistic
    for (let i = 0; i < 4; i++) await flush()
    expect(root().querySelector(".kss-toast.err")!.textContent).toBe("Server down")
    expect(rowBtn("s1")!.dataset.action).toBe("run") // reverted to the server's state
  })

  it("closes on Done and Escape", async () => {
    const { api } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    root().querySelector<HTMLButtonElement>(".kss-foot .kss-ghost")!.click()
    expect(document.getElementById(SELECT_SIMS_HOST_ID)).toBeNull()
    openSelectSimsModal({ api })
    await flush()
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    expect(document.getElementById(SELECT_SIMS_HOST_ID)).toBeNull()
  })
})

describe("Select Sims modal — multi-select", () => {
  const all = () => root().querySelector<HTMLElement>(".kss-all")!

  it("ticking Sims swaps Run all / Stop all for 'N selected' + Run N / Stop N", async () => {
    const { api } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    row("s1").click(); row("s2").click()
    expect(row("s1").getAttribute("aria-checked")).toBe("true")
    expect(root().querySelector(".kss-count")!.textContent).toBe("2 selected")
    expect(foot("run_all").hidden).toBe(true)
    expect(foot("stop_all").hidden).toBe(true)
    expect(foot("run_selected").textContent!.trim()).toBe("Run 1")
    expect(foot("stop_selected").textContent!.trim()).toBe("Stop 1")
    row("s1").click(); row("s2").click() // untick → back to Run all / Stop all
    expect(foot("run_selected").hidden).toBe(true)
    expect(foot("run_all").hidden).toBe(false)
  })

  it("Run selected starts only the ticked stopped Sims; Stop selected stops only the ticked running ones", async () => {
    const { api, calls } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    row("s1").click(); row("s3").click(); row("s2").click()
    foot("run_selected").click()
    await flush()
    expect(calls[0]).toEqual({ action: "run", simIds: ["s1", "s3"] })
    // The applied Sims are unticked; s2 stays ticked and can be stopped.
    expect(root().querySelector(".kss-count")!.textContent).toBe("1 selected")
    foot("stop_selected").click()
    await flush()
    expect(calls[1]).toEqual({ action: "stop", simIds: ["s2"] })
  })

  it("Select all ticks every Activated Sim (never a Deactivated one), and toggles off again", async () => {
    const { api } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    all().click()
    expect(root().querySelector(".kss-count")!.textContent).toBe("3 selected")
    expect(row("s4").getAttribute("aria-checked")).toBeNull()
    expect(all().getAttribute("aria-checked")).toBe("true")
    all().click()
    expect(root().querySelector(".kss-count")!.textContent).toBe("1 of 3 Sims running")
  })

  it("the per-row Run / Stop button acts on that Sim only and doesn't tick the row", async () => {
    const { api, calls } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    rowBtn("s1")!.click()
    await flush()
    expect(calls).toEqual([{ action: "run", simIds: ["s1"] }])
    expect(row("s1").getAttribute("aria-checked")).toBe("false")
  })

  it("clicking a Deactivated row never ticks it", async () => {
    const { api } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    row("s4").click()
    expect(root().querySelector(".kss-count")!.textContent).toBe("1 of 3 Sims running")
  })
})

describe("Select Sims modal — Sims Deactivated on the Sims tab", () => {
  it("are shown greyed out as Deactivated with no Run / Stop, pointing to the Sims tab", async () => {
    const { api } = fakeApi(PROJECT)
    openSelectSimsModal({ api })
    await flush()
    expect(row("s4").classList.contains("off")).toBe(true)
    expect(row("s4").querySelector('[data-kind="active"]')!.textContent).toBe("Deactivated")
    expect(rowBtn("s4")).toBeNull()
    expect(row("s4").textContent).toContain("Activate this Sim on the Sims tab")
  })

  it("never count as running, even with a stale running state", () => {
    const stale = sim("x", "X", "", "running", false)
    expect(isSimRunning(stale)).toBe(false)
    expect(managedSigOf([stale])).toBe("")
  })
})

describe("createSelectSimsApi", () => {
  it("sends project + bearer + action and surfaces server errors", async () => {
    const f = vi.fn(async (_u: string, _i?: RequestInit) => new Response(JSON.stringify({ ok: false, error: "nope" }), { status: 400 }))
    const api = createSelectSimsApi({ backendUrl: "https://k.test", projectId: "p1", getToken: () => "tok", fetch: f })
    await expect(api.act("run", ["s1"])).rejects.toThrow("nope")
    const [url, init] = f.mock.calls[0]
    expect(url).toBe("https://k.test/api/widget/sim-deployments")
    expect((init!.headers as any).authorization).toBe("Bearer tok")
    expect(JSON.parse(String(init!.body))).toEqual({ project: "p1", action: "run", simIds: ["s1"] })
  })

  it("stop_all sends no Sim ids (the card's Close)", async () => {
    const f = vi.fn(async (_u: string, _i?: RequestInit) => new Response(JSON.stringify({ ok: true, applied: [], skipped: [], sims: [] }), { status: 200 }))
    const api = createSelectSimsApi({ backendUrl: "https://k.test", projectId: "p1", getToken: () => "", fetch: f })
    await api.act("stop_all")
    expect(JSON.parse(String(f.mock.calls[0][1]!.body))).toEqual({ project: "p1", action: "stop_all" })
  })

  it("explains a server without the endpoint instead of a bare 'Not found'", async () => {
    const f = vi.fn(async () => new Response("Not found", { status: 404 }))
    const api = createSelectSimsApi({ backendUrl: "https://k.test", projectId: "p1", getToken: () => "", fetch: f })
    await expect(api.load()).rejects.toThrow(/isn’t available on this Klavity server/)
  })
})

describe("planManagedSync (Run / Stop made outside this page reaches it)", () => {
  const S = (a: "running" | "stopped", b: "running" | "stopped" = "stopped") => [sim("a", "A", "", a), sim("b", "B", "", b)]

  it("started on the dashboard → apply and review that Sim right away", () => {
    expect(planManagedSync("", S("running"))).toEqual({ kind: "apply", sig: "a", fresh: ["a"] })
  })

  it("a second Sim started while one runs → only the new one is reviewed", () => {
    expect(planManagedSync("a", S("running", "running"))).toEqual({ kind: "apply", sig: "a,b", fresh: ["b"] })
  })

  it("stopped elsewhere → apply with nothing to review (the page drops it / closes the card)", () => {
    expect(planManagedSync("a", S("stopped"))).toEqual({ kind: "apply", sig: "", fresh: [] })
  })

  it("no change → skip (the poll never re-mounts or re-reviews)", () => {
    expect(planManagedSync("a", S("running")).kind).toBe("skip")
  })

  it("first sync after a reload restores running Sims without an extra review", () => {
    expect(planManagedSync(null, S("running"))).toEqual({ kind: "apply", sig: "a", fresh: [] })
  })

  it("first sync with nothing running → nothing to show", () => {
    expect(planManagedSync(null, S("stopped"))).toEqual({ kind: "skip", sig: "" })
  })
})
