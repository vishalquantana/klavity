// KD-162 (remaining cases): a multi-screenshot widget session with nothing typed sends its whole description as the
// "Pages captured" trail (page paths + full URLs with ids). That must not become the ticket's description, and the fallback
// description should say which browser it came from and keep opaque ids out of the headline lines.
import { test, expect } from "bun:test"
import { splitPagesTrail, fallbackDraftDescription } from "./label-suggest"

const TRAIL = "Pages captured:\n1. /dashboard - https://klavity.in/dashboard?project=proj_d5b1302c-a336-49ce-a38d-933da10b860d\n2. /tickets - https://klavity.in/tickets"

test("splitPagesTrail: a trail-only description has no text — the intake treats it as empty", () => {
  expect(splitPagesTrail(TRAIL)).toEqual({ text: "", trail: TRAIL })
})
test("splitPagesTrail: typed text followed by a trail is split; typed text alone is untouched", () => {
  expect(splitPagesTrail("Button does nothing\n\n" + TRAIL)).toEqual({ text: "Button does nothing", trail: TRAIL })
  expect(splitPagesTrail("Button does nothing")).toEqual({ text: "Button does nothing", trail: "" })
  expect(splitPagesTrail("")).toEqual({ text: "", trail: "" })
})
test("splitPagesTrail: only a real numbered trail counts — look-alike text is left alone", () => {
  const fake = "Pages captured:\nthis is just prose the reporter typed"
  expect(splitPagesTrail(fake)).toEqual({ text: fake, trail: "" })
  const mid = "see Pages captured:\n1. /a - x"          // not at the start, not after a blank line
  expect(splitPagesTrail(mid)).toEqual({ text: mid, trail: "" })
})

const at = Date.UTC(2026, 9, 12, 8, 30)
test("fallbackDraftDescription adds a readable Browser line from the captured client info", () => {
  const d = fallbackDraftDescription({ pageUrl: "https://klavity.in/dashboard", createdAt: at, clientInfo: { browser: "Chrome", browserVersion: "130", os: "Windows", deviceType: "desktop" } })
  expect(d).toContain("Browser : Chrome 130 on Windows (desktop)")
  expect(d.indexOf("Browser :")).toBeLessThan(d.indexOf("Captured:"))
})
test("fallbackDraftDescription: partial or missing client info degrades quietly", () => {
  expect(fallbackDraftDescription({ pageUrl: "https://x.com/a", createdAt: at, clientInfo: { os: "macOS" } })).toContain("Browser : macOS")
  expect(fallbackDraftDescription({ pageUrl: "https://x.com/a", createdAt: at, clientInfo: { browser: "Safari" } })).toContain("Browser : Safari")
  expect(fallbackDraftDescription({ pageUrl: "https://x.com/a", createdAt: at, clientInfo: {} })).not.toContain("Browser :")
  expect(fallbackDraftDescription({ pageUrl: "https://x.com/a", createdAt: at })).not.toContain("Browser :")
})
test("fallbackDraftDescription: opaque ids in the shown path become :id, readable segments stay", () => {
  const d = fallbackDraftDescription({ pageUrl: "https://klavity.in/projects/proj_d5b1302c-a336-49ce-a38d-933da10b860d/tickets/fb_468623f4-eda6-4b5a-9f2d-ed77612a7fd3", createdAt: at })
  expect(d).toContain("Application path : /projects/:id/tickets/:id")
  expect(d).not.toContain("d5b1302c")
  expect(fallbackDraftDescription({ pageUrl: "https://x.com/settings/billing", createdAt: at })).toContain("Application path : /settings/billing")
})

const SERVER = await Bun.file(import.meta.dir + "/../server.ts").text()
test("intake wiring: a trail-only description is treated as empty, the clean fallback runs, and the trail is re-appended underneath", () => {
  expect(SERVER).toContain('const _descSplit = splitPagesTrail(String(form.get("description") || "").trim())')
  expect(SERVER).toContain('const description = _descSplit.text === "" ? "" : String(form.get("description") || "").trim()')
  expect(SERVER).toContain("fallbackDraftDescription({ reportType, pageUrl, createdAt: Date.now(), reportEnv, clientInfo })")
  expect(SERVER).toContain('(pagesTrailOnly ? "\\n\\n" + pagesTrailOnly : "")')
})
