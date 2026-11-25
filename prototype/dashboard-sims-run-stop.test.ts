// Dashboard Sims tab: per-user Run / Stop on every ACTIVATED Sim (replaces Pause / Resume), next to the project-wide
// Activate / Deactivate. Run / Stop reads/writes the same per-user state as the widget's Select Sims modal and the feedback
// card's Close (/api/widget/sim-deployments → lib/sim-run-state.ts).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
function buttonFor(st: { run: string } | null, busy: string | null = null) {
  const src = extractFn(HTML, "function simExecButtonHtml(")
  const _simExec = { pid: "p1", states: st ? { s1: st } : {}, busy }
  return new Function("_simExec", "curProjId", "esc", `${src}; return simExecButtonHtml`)(_simExec, () => "p1", esc)({ id: "s1", name: "Eleanor" }) as string
}

test("stopped Sim → Run, running Sim → Stop, each wired to its own Sim", () => {
  const run = buttonFor({ run: "stopped" })
  expect(run).toContain("Run")
  expect(run).toContain(`simExecAction('s1', 'run', this)`)
  const stop = buttonFor({ run: "running" })
  expect(stop).toContain("Stop")
  expect(stop).toContain(`simExecAction('s1', 'stop', this)`)
  expect(stop + run).not.toMatch(/Pause|Resume/)
})

test("an activated Sim shows Run until its state loads (nothing runs until you start it)", () => {
  expect(buttonFor(null)).toContain(`simExecAction('s1', 'run', this)`)
})

test("shows a loading label while the request is in flight", () => {
  expect(buttonFor({ run: "running" }, "s1")).toContain("Stopping…")
  expect(buttonFor({ run: "stopped" }, "s1")).toContain("Starting…")
})

test("card renders Run/Stop only for activated Sims, next to the Activate/Deactivate button", () => {
  const feed = extractFn(HTML, "function renderSimsFeed(")
  expect(feed).toContain("const execBtn = isActive ? simExecButtonHtml(sim) : \"\"")
  expect(feed).toContain("${execBtn}\n      ${toggleBtn}")
  expect(feed).toContain(`onclick="toggleSimActive(`)
})

test("Run/Stop calls the per-user endpoint with exactly one Sim", () => {
  const act = extractFn(HTML, "async function simExecAction(")
  expect(act).toContain('fetch("/api/widget/sim-deployments"')
  expect(act).toContain("simIds: [simId]")
  expect(act).not.toContain("/api/personas/")
})

test("Deactivating a Sim shows it stopped (Run) once it is activated again", () => {
  const toggle = extractFn(HTML, "async function toggleSimActive(")
  expect(toggle).toContain('_simExec.states[simId] = { run: "stopped" }')
})
