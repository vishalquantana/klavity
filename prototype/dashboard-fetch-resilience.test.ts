// Regression guard for #700: a transient/aborted `fetch()` in a dashboard view renderer must NOT crash
// render()/refreshAll() or page as a P1 "Frontend error".
//
// Root cause: taccRender (and peer sub-loaders) did an UNGUARDED `await fetch(...)`. When that fetch
// rejected (network blip, endpoint down, or an in-flight request ABORTED because the user navigated away),
// the rejection escaped the _subOnce sub-loader dispatch — whose plain `try{fn()}catch` cannot catch an
// async Promise rejection — bubbled up uncaught, was reported to /api/client-error, and got classified P1.
//
// The fix has three source-level invariants, asserted here so they can't silently regress:
//   1. a shared safeFetch() helper that catches network/abort and returns null;
//   2. taccRender routes its load through safeFetch (no bare `await fetch`) and no-ops on null;
//   3. _subOnce catches the async rejection of its sub-loader Promise;
//   4. the server /api/client-error handler drops benign transient network errors (no P1 page).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")
const serverSrc = readFileSync(join(import.meta.dir, "server.ts"), "utf8")

// Reconstruct the ACTUAL transient-error matcher shipped in server.ts (extracted from source, not a copy,
// so the test can never drift from the real classifier) to prove genuine app bugs are NOT swallowed.
function buildTransientMatcher(): (m: string) => boolean {
  const m = serverSrc.match(/const TRANSIENT_CLIENT_ERROR_RE\s*=\s*([\s\S]*?)\n(?:function|const)\s/)
  expect(m).toBeTruthy()
  const reText = (m![1]).trim().replace(/\n\s*/g, "")
  // reText looks like: /(...)/i
  const lastSlash = reText.lastIndexOf("/")
  const pattern = reText.slice(1, lastSlash)
  const flags = reText.slice(lastSlash + 1)
  const re = new RegExp(pattern, flags)
  return (s: string) => {
    const t = String(s || "").trim()
    if (!t) return false
    if (/^aborterror\b/i.test(t)) return true
    return re.test(t)
  }
}

function bodyOf(name: string): string {
  // Extract a rough function body: from the function keyword to the matching brace depth 0.
  const start = html.indexOf(name)
  expect(start).toBeGreaterThan(-1)
  const braceStart = html.indexOf("{", start)
  let depth = 0
  for (let i = braceStart; i < html.length; i++) {
    const c = html[i]
    if (c === "{") depth++
    else if (c === "}") { depth--; if (depth === 0) return html.slice(braceStart, i + 1) }
  }
  throw new Error("could not find end of " + name)
}

test("a shared safeFetch() helper exists and swallows network/abort into null", () => {
  expect(html).toContain("function safeFetch(url, opts)")
  const body = bodyOf("function safeFetch(url, opts)")
  // catches the rejection and returns null so callers can degrade gracefully
  expect(body).toContain(".catch(")
  expect(body).toMatch(/return null/)
  // treats AbortError as a silent no-op (user navigated away)
  expect(body).toContain("AbortError")
})

test("taccRender loads via safeFetch — no bare unguarded `await fetch`", () => {
  const body = bodyOf("async function taccRender()")
  // The initial load must go through safeFetch...
  expect(body).toContain('safeFetch("/api/projects/"')
  // ...and must NOT do a raw `await fetch(` for that load (the exact #700 crash).
  expect(body).not.toContain("await fetch(")
  // ...and must handle the null (network-error) path without throwing.
  expect(body).toMatch(/r === null/)
})

test("_subOnce catches async (Promise) rejections from its sub-loaders, not just sync throws", () => {
  const body = bodyOf("function _subOnce(key, fn)")
  // It must inspect the returned value for a thenable and attach a .catch — a plain try/catch alone
  // cannot catch an async sub-loader's rejection (which is exactly how #700 escaped).
  expect(body).toMatch(/typeof ret\.then === "function"/)
  expect(body).toContain(".catch(")
})

test("server /api/client-error handler drops transient errors BEFORE paging", () => {
  // The handler must gate reportError/autoTicketError on the classifier.
  expect(serverSrc).toContain("function isBenignTransientClientError")
  expect(serverSrc).toMatch(/if \(isBenignTransientClientError\(message\)\)[\s\S]{0,120}return json/)
  // And the drop must come before the P1 paging calls (reportError/autoTicketError) in that handler.
  const handlerIdx = serverSrc.indexOf('path === "/api/client-error"')
  const dropIdx = serverSrc.indexOf("isBenignTransientClientError(message)", handlerIdx)
  const reportIdx = serverSrc.indexOf("reportError({ where: \"frontend\"", handlerIdx)
  expect(dropIdx).toBeGreaterThan(handlerIdx)
  expect(reportIdx).toBeGreaterThan(dropIdx)
})

test("server classifier drops benign transient network errors so they never page as P1", () => {
  const isBenignTransientClientError = buildTransientMatcher()
  // Real environmental / abort failures → dropped (benign).
  for (const m of [
    "TypeError: Failed to fetch",
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "Load failed",
    "AbortError: The user aborted a request.",
    "The operation was aborted.",
    "The network connection was lost.",
  ]) {
    expect(isBenignTransientClientError(m)).toBe(true)
  }
  // Genuine application bugs → NOT dropped (keep their real severity).
  for (const m of [
    "TypeError: Cannot read properties of undefined (reading 'id')",
    "ReferenceError: foo is not defined",
    "Uncaught SyntaxError: unexpected token",
    "",
  ]) {
    expect(isBenignTransientClientError(m)).toBe(false)
  }
})
