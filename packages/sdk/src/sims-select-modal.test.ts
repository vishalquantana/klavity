// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest"
import {
  openSelectSimsModal, bulkActionsFor, createSelectSimsApi, SELECT_SIMS_HOST_ID,
  type ManagedSim, type ManagedSimAction, type SelectSimsApi,
} from "./sims-select-modal"

const flush = () => new Promise((r) => setTimeout(r, 0))

function sim(id: string, name: string, role: string, deployment: ManagedSim["deployment"], execution: ManagedSim["execution"]): ManagedSim {
  return { id, name, role, deployment, execution }
}

/** In-memory backend that applies the same transition rules as lib/sim-deployments.ts. */
function fakeApi(initial: ManagedSim[]) {
  let sims = initial.map((s) => ({ ...s }))
  const calls: Array<{ action: ManagedSimAction; simIds: string[] }> = []
  let gate: Promise<void> | null = null
  const api: SelectSimsApi = {
    load: vi.fn(async () => sims.map((s) => ({ ...s }))),
    act: vi.fn(async (action, simIds) => {
      calls.push({ action, simIds })
      if (gate) await gate
      const applied: string[] = []
      sims = sims.map((s) => {
        if (!simIds.includes(s.id)) return s
        const n =
          action === "deploy" && s.deployment !== "deployed" ? { deployment: "deployed", execution: "running" } :
          action === "deactivate" && s.deployment === "deployed" ? { deployment: "deactivated", execution: "not_running" } :
          action === "pause" && s.execution === "running" ? { deployment: s.deployment, execution: "paused" } :
          action === "resume" && s.execution === "paused" ? { deployment: s.deployment, execution: "running" } : null
        if (!n) return s
        applied.push(s.id)
        return { ...s, ...(n as any) }
      })
      return { applied, skipped: [], sims: sims.map((s) => ({ ...s })) }
    }),
  }
  return { api, calls, hold: () => { let release!: () => void; gate = new Promise((r) => { release = r }); return () => { gate = null; release() } } }
}

const root = () => document.getElementById(SELECT_SIMS_HOST_ID)!.shadowRoot!
const rows = () => [...root().querySelectorAll<HTMLElement>(".kss-row")]
const row = (id: string) => root().querySelector<HTMLElement>(`.kss-row[data-sim-id="${id}"]`)!
const btn = (action: string) => root().querySelector<HTMLButtonElement>(`.kss-foot [data-action="${action}"]`)!

const WORKSPACE = [
  sim("s1", "Eleanor Vance", "Technology executive", "not_deployed", "not_running"),
  sim("s2", "Sarah Davis", "Product manager", "deployed", "running"),
  sim("s3", "Marcus Chen", "Digital transformation leader", "deployed", "paused"),
  sim("s4", "Priya Nair", "Finance lead", "deactivated", "not_running"),
]

afterEach(() => { document.body.innerHTML = "" })

describe("bulkActionsFor", () => {
  it("splits a mixed selection into compatible deploy / deactivate sets", () => {
    const r = bulkActionsFor(WORKSPACE, new Set(["s1", "s2", "s3", "s4"]))
    expect(r.deploy).toEqual(["s1", "s4"])
    expect(r.deactivate).toEqual(["s2", "s3"])
  })
})

describe("Select Sims modal", () => {
  it("lists Sims with names, roles and separate deployment / execution statuses", async () => {
    const { api } = fakeApi(WORKSPACE)
    openSelectSimsModal({ api })
    await flush()
    expect(rows()).toHaveLength(4)
    expect(row("s1").textContent).toContain("Eleanor Vance")
    expect(row("s1").textContent).toContain("Technology executive")
    const badge = (id: string, kind: string) => row(id).querySelector(`[data-kind="${kind}"]`)!.textContent
    expect(badge("s1", "deployment")).toBe("Not deployed")
    expect(badge("s2", "deployment")).toBe("Deployed")
    expect(badge("s2", "execution")).toBe("Running")
    expect(badge("s3", "execution")).toBe("Paused")
    expect(badge("s4", "deployment")).toBe("Deactivated")
    // Execution controls only on deployed Sims
    expect(row("s1").querySelector(".kss-exec")).toBeNull()
    expect(row("s2").querySelector<HTMLElement>(".kss-exec")!.dataset.action).toBe("pause")
    expect(row("s3").querySelector<HTMLElement>(".kss-exec")!.dataset.action).toBe("resume")
  })

  it("filters by name or role and select-all applies to matches", async () => {
    const { api } = fakeApi(WORKSPACE)
    const onSel = vi.fn()
    openSelectSimsModal({ api, onSelectionChange: onSel })
    await flush()
    const input = root().querySelector<HTMLInputElement>("input")!
    input.value = "product"
    input.dispatchEvent(new Event("input"))
    expect(rows().map((r) => r.dataset.simId)).toEqual(["s2"])
    root().querySelector<HTMLElement>(".kss-all")!.click()
    expect(onSel).toHaveBeenLastCalledWith(["s2"])
    expect(root().querySelector(".kss-count")!.textContent).toBe("1 selected")
  })

  it("deploys only the selected undeployed Sims", async () => {
    const { api, calls } = fakeApi(WORKSPACE)
    const onChange = vi.fn()
    openSelectSimsModal({ api, onChange })
    await flush()
    row("s1").click()
    expect(btn("deploy").disabled).toBe(false)
    btn("deploy").click()
    await flush()
    expect(calls).toEqual([{ action: "deploy", simIds: ["s1"] }])
    expect(row("s1").querySelector('[data-kind="deployment"]')!.textContent).toBe("Deployed")
    expect(onChange).toHaveBeenCalledWith(expect.any(Array), { action: "deploy", applied: ["s1"] })
    expect(root().querySelector(".kss-toast")!.textContent).toContain("Deployed 1 Sim")
  })

  it("shows Deactivate for deployed selections and only sends deployed ids", async () => {
    const { api, calls } = fakeApi(WORKSPACE)
    openSelectSimsModal({ api })
    await flush()
    row("s2").click()
    expect(btn("deploy").hidden).toBe(true)
    expect(btn("deactivate").hidden).toBe(false)
    btn("deactivate").click()
    await flush()
    expect(calls).toEqual([{ action: "deactivate", simIds: ["s2"] }])
    expect(row("s2").querySelector('[data-kind="deployment"]')!.textContent).toBe("Deactivated")
  })

  it("mixed selection offers both actions, explains them, and never cross-applies", async () => {
    const { api, calls } = fakeApi(WORKSPACE)
    openSelectSimsModal({ api })
    await flush()
    row("s1").click(); row("s2").click()
    expect(btn("deploy").hidden).toBe(false)
    expect(btn("deactivate").hidden).toBe(false)
    expect(root().querySelector<HTMLElement>(".kss-mixed")!.hidden).toBe(false)
    btn("deploy").click()
    await flush()
    expect(calls[0]).toEqual({ action: "deploy", simIds: ["s1"] })
  })

  it("pause / resume change execution without touching deployment", async () => {
    const { api, calls } = fakeApi(WORKSPACE)
    openSelectSimsModal({ api })
    await flush()
    row("s2").querySelector<HTMLButtonElement>(".kss-exec")!.click()
    await flush()
    expect(calls[0]).toEqual({ action: "pause", simIds: ["s2"] })
    expect(row("s2").querySelector('[data-kind="deployment"]')!.textContent).toBe("Deployed")
    expect(row("s2").querySelector('[data-kind="execution"]')!.textContent).toBe("Paused")
    // The row click on the exec button must not toggle selection
    expect(row("s2").getAttribute("aria-checked")).toBe("false")
    row("s3").querySelector<HTMLButtonElement>(".kss-exec")!.click()
    await flush()
    expect(row("s3").querySelector('[data-kind="execution"]')!.textContent).toBe("Running")
  })

  it("blocks duplicate submissions while an action is in flight", async () => {
    const { api, calls, hold } = fakeApi(WORKSPACE)
    openSelectSimsModal({ api })
    await flush()
    row("s1").click()
    const release = hold()
    btn("deploy").click()
    btn("deploy").click()
    expect(btn("deploy").disabled).toBe(true)
    expect(btn("deploy").textContent).toContain("Deploying")
    release()
    await flush()
    expect(calls).toHaveLength(1)
  })

  it("shows an error toast and keeps state when the backend fails", async () => {
    const { api } = fakeApi(WORKSPACE)
    ;(api.act as any).mockRejectedValueOnce(new Error("boom"))
    openSelectSimsModal({ api })
    await flush()
    row("s1").click()
    btn("deploy").click()
    await flush()
    expect(root().querySelector(".kss-toast.err")!.textContent).toBe("boom")
    expect(row("s1").querySelector('[data-kind="deployment"]')!.textContent).toBe("Not deployed")
    expect(btn("deploy").disabled).toBe(false)
  })

  it("restores the remembered selection on reopen, pruning removed Sims", async () => {
    const { api } = fakeApi(WORKSPACE)
    const onSel = vi.fn()
    openSelectSimsModal({ api, initialSelection: ["s1", "gone"], onSelectionChange: onSel })
    await flush()
    expect(row("s1").getAttribute("aria-checked")).toBe("true")
    expect(root().querySelector(".kss-count")!.textContent).toBe("1 selected")
    expect(onSel).toHaveBeenLastCalledWith(["s1"])
  })

  it("closes on Cancel and Escape", async () => {
    const { api } = fakeApi(WORKSPACE)
    openSelectSimsModal({ api })
    await flush()
    root().querySelector<HTMLButtonElement>(".kss-ghost")!.click()
    expect(document.getElementById(SELECT_SIMS_HOST_ID)).toBeNull()
    openSelectSimsModal({ api })
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    expect(document.getElementById(SELECT_SIMS_HOST_ID)).toBeNull()
  })
})

describe("createSelectSimsApi", () => {
  it("sends project + bearer and surfaces server errors", async () => {
    const f = vi.fn(async (_u: string, _i?: RequestInit) => new Response(JSON.stringify({ ok: false, error: "nope" }), { status: 400 }))
    const api = createSelectSimsApi({ backendUrl: "https://k.test", projectId: "p1", getToken: () => "tok", fetch: f })
    await expect(api.act("deploy", ["s1"])).rejects.toThrow("nope")
    const [url, init] = f.mock.calls[0]
    expect(url).toBe("https://k.test/api/widget/sim-deployments")
    expect((init!.headers as any).authorization).toBe("Bearer tok")
    expect(JSON.parse(String(init!.body))).toEqual({ project: "p1", action: "deploy", simIds: ["s1"] })
  })
})

describe("Select Sims modal — layout guards", () => {
  it("[hidden] wins over the .kss-btn display rule (no Deactivate button with 0 selected)", async () => {
    const { api } = fakeApi(WORKSPACE)
    openSelectSimsModal({ api })
    await flush()
    expect(root().querySelector("style")!.textContent).toContain("[hidden]{display:none!important}")
    expect(btn("deactivate").hidden).toBe(true)
    expect(btn("deploy").hidden).toBe(false)
    expect(btn("deploy").disabled).toBe(true)
  })

  it("explains a server without the endpoint instead of a bare 'Not found'", async () => {
    const f = vi.fn(async () => new Response("Not found", { status: 404 }))
    const api = createSelectSimsApi({ backendUrl: "https://k.test", projectId: "p1", getToken: () => "", fetch: f })
    await expect(api.load()).rejects.toThrow(/isn’t available on this Klavity server/)
  })
})
