// KLAVITYKLA-269: /autosims (public/trails.html) and the dashboard AutoSims view
// (public/dashboard.html) are now ONE canonical surface. Their shared hero + banner
// copy is single-sourced from public/vendor/autosims-copy.js so the two can't drift,
// and the standalone page no longer shows the dead "—" precision state the dashboard
// already removed. This test locks in that unification.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const pub = (f: string) => readFileSync(join(import.meta.dir, "public", f), "utf8")
const trails = pub("trails.html")
const dashboard = pub("dashboard.html")
const copySrc = pub(join("vendor", "autosims-copy.js"))
const server = readFileSync(join(import.meta.dir, "server.ts"), "utf8")

// Evaluate the browser IIFE with a fake window to read the canonical object.
function loadCopy(): Record<string, string> {
  const w: any = {}
  new Function("window", copySrc)(w)
  return w.KLAV_AUTOSIMS_COPY
}

test("canonical copy module exposes the shared AutoSims strings", () => {
  const c = loadCopy()
  expect(c.title).toBe("AutoSims")
  expect(c.lead).toBe("Your AutoSims run on a schedule and flag regressions before your users do.")
  expect(c.precisionLabel).toBe("Signal quality · % of real bugs found")
  expect(c.loadError).toBe("Couldn't load AutoSims.")
  // The object is frozen so a page can't mutate the shared source at runtime.
  expect(Object.isFrozen(c)).toBe(true)
})

test("the copy module is served by the server under /vendor", () => {
  expect(server).toContain('path === "/vendor/autosims-copy.js"')
})

test("both AutoSims surfaces load the single-sourced copy module", () => {
  expect(trails).toContain('<script src="/vendor/autosims-copy.js"></script>')
  expect(dashboard).toContain('<script src="/vendor/autosims-copy.js"></script>')
})

test("both surfaces render the hero lead + precision label from the canonical source", () => {
  // trails.html
  expect(trails).toContain("window.KLAV_AUTOSIMS_COPY")
  expect(trails).toContain("AS_COPY.lead")
  expect(trails).toContain("AS_COPY.precisionLabel")
  expect(trails).toContain("AS_COPY.loadError")
  // dashboard.html
  expect(dashboard).toContain("window.KLAV_AUTOSIMS_COPY")
  expect(dashboard).toContain("AS_COPY.lead")
  expect(dashboard).toContain("AS_COPY.precisionLabel")
})

test("/autosims no longer shows the dead '—' precision state (matches dashboard canonical)", () => {
  // Old divergence: trails.html set precPct to the em-dash when precision was null.
  expect(trails).not.toContain('$("precPct").textContent = "—"')
  // Both surfaces now hide the precision banner until real review data exists.
  expect(trails).toContain('$("precBanner").style.display = "none"')
  expect(dashboard).toContain('precBanner.style.display="none"')
})

test("the hero lead is not hard-coded a second time in page JS (single source)", () => {
  // The literal may remain once as static HTML fallback, but the render() JS must read
  // it from the shared module rather than re-hard-coding it.
  const lead = "Your AutoSims run on a schedule and flag regressions before your users do."
  // dashboard render() previously hard-coded the lead in JS; it now uses AS_COPY.lead as
  // the primary value (the literal survives only as an inline `|| "..."` fallback).
  const dashLeadJs = dashboard.includes("lEl.textContent=AS_COPY.lead||")
  expect(dashLeadJs).toBe(true)
  // Sanity: the canonical string still appears (as fallback / static markup).
  expect(dashboard).toContain(lead)
  expect(trails).toContain(lead)
})
