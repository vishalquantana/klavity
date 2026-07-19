// KLAVITYKLA-187 follow-up fixes — regressions for four defects in the /sim/new surface:
//   1. (HIGH) load()'s KLA-299 URL rewrite hard-coded "/dashboard?project=", clobbering /sim/new.
//   2. (MED)  simNewUrl() dropped the active ?project=, so a shared link created the Sim
//             against the RECIPIENT's default project.
//   3. (LOW)  PANE_ORDER was a plain object literal used as the ?mode= allowlist, so
//             Object.prototype keys (?mode=constructor) passed validation.
//   4. (LOW)  close() used history.replaceState, leaving Back looking like a no-op.
//
// The helpers are plain functions inside dashboard.html's script block, so we slice them out
// of the source and evaluate them against stubbed location/history — a real behavioural test,
// not a string match.

import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"

const dashSrc = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")

// ── Harness: evaluate the /sim/new helper block with stubbed globals ──────────
function sliceBetween(start: string, end: string) {
  const a = dashSrc.indexOf(start)
  expect(a).toBeGreaterThan(-1)
  const b = dashSrc.indexOf(end, a)
  expect(b).toBeGreaterThan(a)
  return dashSrc.slice(a, b)
}

function makeHelpers(href: string) {
  const block = sliceBetween('const SIM_NEW_PATH="/sim/new"', "function selectPane(mode)")
  const u = new URL(href, "https://app.klavity.in")
  const location = { pathname: u.pathname, search: u.search, hash: u.hash, href: u.href }
  const activeProjectParam = () => new URLSearchParams(location.search).get("project")
  const fn = new Function(
    "location",
    "activeProjectParam",
    block + "\nreturn { paneOf, simNewUrl, simNewFallbackUrl, atSimNew, currentMode, PANE_ORDER };",
  )
  return fn(location, activeProjectParam) as {
    paneOf: (m: any) => string
    simNewUrl: (m?: string) => string
    simNewFallbackUrl: () => string
    atSimNew: () => boolean
    currentMode: () => string
    PANE_ORDER: any
  }
}

// ── Defect 3: ?mode= allowlist must not accept Object.prototype keys ─────────
test("paneOf: only the three real panes pass; prototype keys fall back to describe", () => {
  const h = makeHelpers("/sim/new")
  expect(h.paneOf("describe")).toBe("describe")
  expect(h.paneOf("site")).toBe("site")
  expect(h.paneOf("call")).toBe("call")
  // The regression: these used to return Object.prototype members (truthy → accepted).
  for (const evil of ["constructor", "toString", "hasOwnProperty", "__proto__", "valueOf", "isPrototypeOf"]) {
    expect(h.paneOf(evil)).toBe("describe")
  }
  expect(h.paneOf(null)).toBe("describe")
  expect(h.paneOf(undefined)).toBe("describe")
  expect(h.paneOf("")).toBe("describe")
})

test("PANE_ORDER has a null prototype (no inherited keys to leak through)", () => {
  const h = makeHelpers("/sim/new")
  expect(Object.getPrototypeOf(h.PANE_ORDER)).toBeNull()
})

test("currentMode: ?mode=constructor deep link resolves to describe, not a prototype member", () => {
  expect(makeHelpers("/sim/new?mode=constructor").currentMode()).toBe("describe")
  expect(makeHelpers("/sim/new?mode=call").currentMode()).toBe("call")
  expect(makeHelpers("/sim/new").currentMode()).toBe("describe")
})

// ── Defect 2: simNewUrl must carry the active project ────────────────────────
test("simNewUrl carries the active ?project= so a shared link targets the right project", () => {
  const h = makeHelpers("/dashboard?project=proj_abc")
  expect(h.simNewUrl("describe")).toBe("/sim/new?project=proj_abc")
  const withMode = h.simNewUrl("call")
  expect(new URLSearchParams(withMode.split("?")[1]).get("mode")).toBe("call")
  expect(new URLSearchParams(withMode.split("?")[1]).get("project")).toBe("proj_abc")
})

test("simNewUrl stays bare when there is no active project", () => {
  const h = makeHelpers("/dashboard")
  expect(h.simNewUrl("describe")).toBe("/sim/new")
  expect(h.simNewUrl("site")).toBe("/sim/new?mode=site")
})

test("simNewFallbackUrl preserves the project when closing a deep-linked /sim/new", () => {
  expect(makeHelpers("/sim/new?project=proj_abc").simNewFallbackUrl()).toBe("/dashboard?project=proj_abc")
  expect(makeHelpers("/sim/new").simNewFallbackUrl()).toBe("/dashboard")
})

// ── Defect 1: load()'s project-param rewrite must preserve the current path ──
test("load()'s KLA-299 URL rewrite keeps the current path (does not clobber /sim/new)", () => {
  const START = "if (!activeProjectParam()) {"
  const a = dashSrc.indexOf(START)
  expect(a).toBeGreaterThan(-1)
  const b = dashSrc.indexOf("} catch (e) {}", a)
  expect(b).toBeGreaterThan(a)
  const block = dashSrc.slice(a, b + "} catch (e) {}".length) + "\n}"   // close the `if`
  // Guard: the old hard-coded literal must be gone.
  expect(dashSrc).not.toContain('history.replaceState(null, "", "/dashboard?project=" + encodeURIComponent(data.active.id))')

  function runRewrite(href: string) {
    const u0 = new URL(href, "https://app.klavity.in")
    const location = { href: u0.href, search: u0.search, pathname: u0.pathname }
    const activeProjectParam = () => new URLSearchParams(location.search).get("project")
    let out: string | null = null
    const history = { replaceState: (_a: any, _b: any, url: string) => { out = url } }
    new Function("location", "activeProjectParam", "history", "data", block)(
      location, activeProjectParam, history, { active: { id: "proj_abc" } },
    )
    return out
  }

  // The regression: on /sim/new this used to rewrite to /dashboard?project=…
  expect(runRewrite("/sim/new")).toBe("/sim/new?project=proj_abc")
  expect(runRewrite("/sim/new?mode=call")).toBe("/sim/new?mode=call&project=proj_abc")
  // Normal dashboard landing still gets the param appended.
  expect(runRewrite("/dashboard")).toBe("/dashboard?project=proj_abc")
  // Already-parameterised URLs are left alone.
  expect(runRewrite("/dashboard?project=proj_zzz")).toBeNull()
})

// ── Defect 4: close() pops our pushed history entry instead of replacing it ──
test("close() uses history.back() for the entry we pushed, so Back is not a no-op", () => {
  const block = sliceBetween("if(!fromPop&&atSimNew()){", "$(\"simClose\")")
  expect(block).toContain("history.back()")
  expect(block).toContain("simNewFallbackUrl()")
  // The old unconditional replaceState-to-returnUrl form must be gone.
  expect(dashSrc).not.toContain('history.replaceState(null,"",simNewReturnUrl||"/dashboard")')
})
