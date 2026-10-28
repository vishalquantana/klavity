import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const htmlPath = join(__dirname, "public", "dashboard.html")
const HTML = readFileSync(htmlPath, "utf8")

test("dashboard.html includes CSS styling for .tg-src-badge, .tg-src-sim, and .tg-src-autosim", () => {
  expect(HTML).toContain(".tg-src-badge")
  expect(HTML).toContain(".tg-src-badge.tg-src-sim")
  expect(HTML).toContain(".tg-src-badge.tg-src-autosim")
  expect(HTML).toContain('[data-theme="dark"] .tg-src-badge.tg-src-sim')
  expect(HTML).toContain('[data-theme="dark"] .tg-src-badge.tg-src-autosim')
})

test("dashboard.html includes tgSourceKind and tgSourceBadgeHtml helper functions", () => {
  expect(HTML).toContain("function tgSourceKind(t)")
  expect(HTML).toContain("function tgSourceBadgeHtml(t)")
})

test("tgSourceKind classification logic correctly differentiates Sim and AutoSim", () => {
  // Extract tgSourceKind function body and evaluate
  const start = HTML.indexOf("function tgSourceKind(t) {")
  expect(start).toBeGreaterThan(-1)
  const end = HTML.indexOf("function tgSourceBadgeHtml(t)", start)
  const fnStr = HTML.slice(start, end)
  const tgSourceKind = new Function(`${fnStr}; return tgSourceKind;`)()

  // AutoSim scenarios
  expect(tgSourceKind({ source: "autosim" })).toBe("autosim")
  expect(tgSourceKind({ source: "AutoSim" })).toBe("autosim")
  expect(tgSourceKind({ source: "auto-sim" })).toBe("autosim")
  expect(tgSourceKind({ source: "trail" })).toBe("autosim")
  expect(tgSourceKind({ source: "trails" })).toBe("autosim")
  expect(tgSourceKind({ source: "walk" })).toBe("autosim")
  expect(tgSourceKind({ source: "autosim_run_123" })).toBe("autosim")

  // Sim scenarios
  expect(tgSourceKind({ source: "sim" })).toBe("sim")
  expect(tgSourceKind({ source: "Sim" })).toBe("sim")
  expect(tgSourceKind({ source: "sims" })).toBe("sim")
  expect(tgSourceKind({ source: "adhoc" })).toBe("sim")
  expect(tgSourceKind({ simId: "sim_123" })).toBe("sim")
  expect(tgSourceKind({ simName: "Checkout Bot" })).toBe("sim")
  expect(tgSourceKind({ source: "sim", simName: "Bot 1" })).toBe("sim")

  // Non-Sim scenarios (must NOT be mislabeled as Sim or AutoSim)
  expect(tgSourceKind({ source: "manual" })).toBeNull()
  expect(tgSourceKind({ source: "widget" })).toBeNull()
  expect(tgSourceKind({ source: "human" })).toBeNull()
  expect(tgSourceKind({ source: null })).toBeNull()
  expect(tgSourceKind({ source: undefined })).toBeNull()
  expect(tgSourceKind({})).toBeNull()
  expect(tgSourceKind(null)).toBeNull()
})

test("renderTriageList and buildReportCard render the tgSourceBadgeHtml and data-source attribute", () => {
  // List view
  const listFnStart = HTML.indexOf("function renderTriageList(host, items) {")
  expect(listFnStart).toBeGreaterThan(-1)
  const listFnEnd = HTML.indexOf("function buildReportCard(t) {", listFnStart)
  const listFn = HTML.slice(listFnStart, listFnEnd)
  expect(listFn).toContain("const srcBadge = tgSourceBadgeHtml(t)")
  expect(listFn).toContain('data-source="${esc(srcKind)}"')
  expect(listFn).toContain("${srcBadge}")

  // Board view
  const cardFnStart = HTML.indexOf("function buildReportCard(t) {")
  expect(cardFnStart).toBeGreaterThan(-1)
  const cardFnEnd = HTML.indexOf("function renderTriageBoard(host, items) {", cardFnStart)
  const cardFn = HTML.slice(cardFnStart, cardFnEnd)
  expect(cardFn).toContain("const srcBadge = tgSourceBadgeHtml(t)")
  expect(cardFn).toContain('card.setAttribute("data-source", srcKind)')
  expect(cardFn).toContain("${srcBadge}")
})
