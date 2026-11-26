// KD-2878: an uncaught server error must never show Bun's raw error page ("1 error on this page" + internal text).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { unhandledErrorResponse, wantsHtml } from "./error-response"

const page = (accept: string, method = "GET") => new Request("https://klavity.in/dashboard", { method, headers: { accept } })

test("a browser page load gets a friendly 503 page that reloads itself — no internal error text", async () => {
  const r = unhandledErrorResponse(page("text/html,application/xhtml+xml"), "ab12cd34")
  expect(r.status).toBe(503)
  expect(r.headers.get("content-type")).toContain("text/html")
  expect(r.headers.get("retry-after")).toBe("3")
  const body = await r.text()
  expect(body).toContain("temporary connection problem")
  expect(body).toContain('http-equiv="refresh"')
  expect(body).toContain("ab12cd34")
  expect(body).not.toContain("socket")
})

test("API calls get a 503 JSON error with the trace id", async () => {
  const r = unhandledErrorResponse(page("application/json", "POST"), "ab12cd34")
  expect(r.status).toBe(503)
  expect(await r.json()).toEqual({ error: "Temporary connection problem. Please try again.", id: "ab12cd34" })
  expect(wantsHtml(page("text/html", "POST"))).toBe(false)   // a form POST never gets an auto-reloading page
  expect(unhandledErrorResponse(null, "x").headers.get("content-type")).toBe("application/json")
})

test("the server wraps every request and sets Bun's error() handler", () => {
  const src = readFileSync(join(import.meta.dir, "..", "server.ts"), "utf8")
  expect(src).toContain("return withWidgetCors(req, withSecurityHeaders(unhandledErrorResponse(req, id)))")
  expect(src).toMatch(/\n  error\(e\) \{\s*\n\s*const \{ id \} = oops\(e, "unhandled"\)/)
})
