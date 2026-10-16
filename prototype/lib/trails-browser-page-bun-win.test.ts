import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"

const SRC = readFileSync(new URL("./trails-browser-page.ts", import.meta.url), "utf8")

// Playwright's chromium.launch() never finishes under Bun on Windows, which made every local Sim preview time out.
// The local launch there must go through puppeteer-core, and closing it must kill Chromium's whole process tree.
test("Bun on Windows launches local Chromium through puppeteer-core", () => {
  expect(SRC).toContain("if (isBunOnWindows()) return await launchLocalPuppeteer(chromium.executablePath(), opts)")
  expect(SRC).toContain('(process.versions as any).bun && process.platform === "win32"')
})

test("local puppeteer launch is cleaned up with taskkill /T so no Chromium children leak", () => {
  expect(SRC).toContain('"taskkill", ["/PID", String(proc.pid), "/T", "/F"]')
})

test("a launch failure surfaces as BrowserLaunchError (so the preview says 'our side')", () => {
  const i = SRC.indexOf("async function launchLocalPuppeteer(")
  expect(SRC.slice(i, i + 900)).toContain("throw new BrowserLaunchError(")
})
