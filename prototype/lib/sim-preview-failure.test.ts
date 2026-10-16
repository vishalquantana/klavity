import { test, expect } from "bun:test"
import { classifyPreviewFailure, withPreviewTimeout } from "./sim-preview"
import { BrowserLaunchError } from "./trails-browser-page"

test("browser launch failure is reported as ours, not a missing Test Account", () => {
  const f = classifyPreviewFailure(new BrowserLaunchError("Could not start a local browser"), false)
  expect(f.kind).toBe("browser_unavailable")
  expect(f.error).toContain("Couldn't start the browser")
  expect(f.needsTestAccount).toBeUndefined()
})

test("a timed-out shot is browser_unavailable", () => {
  expect(classifyPreviewFailure(new Error("preview timed out after 60000ms"), false).kind).toBe("browser_unavailable")
})

test("page failure with no headless login keeps the Test Account hint", () => {
  const f = classifyPreviewFailure(new Error("net::ERR_FAILED"), false)
  expect(f.kind).toBe("needs_test_account")
  expect(f.needsTestAccount).toBe(true)
})

test("page failure with a login configured is a plain unreachable-page message", () => {
  const f = classifyPreviewFailure(new Error("net::ERR_FAILED"), true)
  expect(f.kind).toBe("page_unreachable")
  expect(f.error).toContain("Try a public page")
})

test("withPreviewTimeout rejects a hung promise and passes through a fast one", async () => {
  await expect(withPreviewTimeout(new Promise(() => { }), 20)).rejects.toThrow("preview timed out")
  expect(await withPreviewTimeout(Promise.resolve(7), 20)).toBe(7)
})
