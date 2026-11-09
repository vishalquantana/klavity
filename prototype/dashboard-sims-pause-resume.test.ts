// KD-1071: per-Sim Pause / Resume on the dashboard Sims tab. It reads/writes only the additive Select Sims state
// (/api/widget/sim-deployments); the existing Activate/Deactivate control stays exactly as it was.
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
function buttonFor(st: { deployment: string; execution: string } | null, busy: string | null = null) {
  const src = extractFn(HTML, "function simExecButtonHtml(")
  const _simExec = { pid: "p1", states: st ? { s1: st } : {}, busy }
  return new Function("_simExec", "curProjId", "esc", `${src}; return simExecButtonHtml`)(_simExec, () => "p1", esc)({ id: "s1", name: "Eleanor" }) as string
}

test("running Sim → Pause, paused Sim → Resume, each wired to its own Sim", () => {
  const pause = buttonFor({ deployment: "deployed", execution: "running" })
  expect(pause).toContain("Pause")
  expect(pause).toContain(`simExecAction('s1', 'pause', this)`)
  const resume = buttonFor({ deployment: "deployed", execution: "paused" })
  expect(resume).toContain("Resume")
  expect(resume).toContain(`simExecAction('s1', 'resume', this)`)
})

test("a Sim that isn't deployed / running shows no Pause or Resume at all; unknown state shows nothing", () => {
  for (const st of [{ deployment: "not_deployed", execution: "not_running" }, { deployment: "deactivated", execution: "not_running" }]) {
    expect(buttonFor(st)).toBe("")
  }
  expect(buttonFor(null)).toBe("")
})

test("shows a loading label while the request is in flight", () => {
  expect(buttonFor({ deployment: "deployed", execution: "running" }, "s1")).toContain("Pausing…")
  expect(buttonFor({ deployment: "deployed", execution: "paused" }, "s1")).toContain("Resuming…")
})

test("card renders Pause/Resume next to the untouched Activate/Deactivate button, and never a Deployed pill", () => {
  const feed = extractFn(HTML, "function renderSimsFeed(")
  expect(feed).toContain("${execBtn}\n      ${toggleBtn}")
  expect(feed).toContain(`onclick="toggleSimActive(`) // existing control unchanged
  expect(feed).not.toContain("Deployed")
})

test("Pause/Resume calls the Select Sims endpoint with exactly one Sim", () => {
  const act = extractFn(HTML, "async function simExecAction(")
  expect(act).toContain('fetch("/api/widget/sim-deployments"')
  expect(act).toContain("simIds: [simId]")
  expect(act).not.toContain("/api/personas/")
})
