import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"

const SIM = readFileSync(new URL("./public/sim-runs.html", import.meta.url), "utf8")
const DASH = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")

function fn(src: string, start: string): string {
  const i = src.indexOf(start)
  if (i < 0) throw new Error("missing " + start)
  let d = 0, j = src.indexOf("{", i)
  for (let k = j; k < src.length; k++) {
    if (src[k] === "{") d++
    else if (src[k] === "}" && --d === 0) return src.slice(i, k + 1)
  }
  throw new Error("unbalanced " + start)
}

function link(fid: string, runId?: string, active: any = { id: "proj_1" }) {
  const body = fn(SIM, "function feedbackLink(")
  return new Function("state", "projParam", body + "; return feedbackLink")({ active }, () => "proj_url")(fid, runId) as string
}

test("report link opens the ticket itself with project and run", () => {
  const u = link("fb_1", "run_9")
  expect(u).toBe("/dashboard?project=proj_1&ticket=fb_1&fromRun=run_9")
  expect(u).not.toContain("triage")
})

test("report link falls back to the page's project param and encodes ids", () => {
  expect(link("fb a", undefined, null)).toBe("/dashboard?project=proj_url&ticket=fb%20a")
})

test("sim-runs labels the link 'Open report' and preselects ?run=", () => {
  expect(SIM).toContain("feedbackLink(obs.feedbackId, run.id)")
  expect(SIM).toContain("Open report")
  expect(SIM).toContain('get("run")')
})

test("dashboard opens reports that are not in the inbox", () => {
  expect(fn(DASH, "async function openReportOutsideInbox(")).toContain("We couldn't find that report in this project.")
  expect(DASH).toContain("else if (!t) openReportOutsideInbox(fid)")
  expect(DASH).toContain("window._pendingTriageFocus) { const fid")
})

test("inbox failures give a specific message", () => {
  expect(DASH).toContain("window.__klavErr[cacheKey]) || \"Couldn't load.\"")
  expect(DASH).toContain("You don't have access to this project's reports.")
  expect(DASH).toContain("Couldn't reach Klavity")
})

test("ticket page offers Back to Sim run when opened from a run", () => {
  expect(DASH).toContain("_fromSimRun = { run: _fr, ticket: ticketId }")
  expect(DASH).toContain('data-act", "back-run"')
  expect(DASH).toContain("↩ Back to Sim run")
})
