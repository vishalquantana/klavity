// New AutoSim dialog: clicking outside the card must not close it (that silently left the AutoSim running
// in the background and blocked the next "Create AutoSim"). Only Cancel closes it, and while a run is in
// progress Cancel asks first ("Stop this AutoSim?") and then stops the run.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")

test("backdrop click no longer closes the New AutoSim dialog", () => {
  expect(html).not.toContain('document.getElementById("ntBg").addEventListener("click"')
})

test("Cancel goes through the guarded close", () => {
  expect(html).toContain('document.getElementById("ntCancel").addEventListener("click", requestCloseNtDialog)')
})

test("while a run is in progress, Cancel warns, then cancels the run and closes", () => {
  const start = html.indexOf("async function requestCloseNtDialog()")
  const body = html.slice(start, html.indexOf("function closeNtDialog()", start))
  expect(body).toContain("if (!sid) { closeNtDialog(); return }")      // nothing running → close straight away
  expect(body).toContain("await klavConfirm(")
  expect(body).toContain('title: "Stop this AutoSim?"')
  expect(body).toContain("if (!ok) return")                             // "Keep running" keeps the dialog open
  expect(body).toContain('"/cancel" + projQ(), { method: "POST" }')
})

test("Cancel stays visible during a run; only Create AutoSim is hidden", () => {
  const start = html.indexOf("function ntBusy(on)")
  const body = html.slice(start, html.indexOf("\n            }", start))
  expect(body).toContain('go.style.display = on ? "none" : ""')
  expect(body).toContain('cancel.style.display = ""')
})

test("the dialog tracks the running AutoSim and closing stops its poll loop", () => {
  expect(html).toContain("ntRunningSessionId = sessionId")
  expect(html).toContain('if (s.status !== "running") ntRunningSessionId = null')
  expect(html).toContain("ntPollGen++; ntRunningSessionId = null")
})
