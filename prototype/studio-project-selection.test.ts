// Regression guard for KLAVITYKLA-47: onboarding created/named a project (step 1) but the
// step-3 "Open the Studio" handoff went to bare /app, so the Studio opened the account's FIRST
// project ("Default Project") — Six Hats Sims and saved reviews landed in the wrong project
// (and could auto-copy junk tickets to external trackers on multi-project accounts).
//
// The fix, pinned here by extracting the REAL shipped functions (not re-implementations):
//   • onboarding.html openStudio() carries ?project=<onboarding project> on both the hats and
//     transcript paths, and renderWidgetSnippet() deep-links the "Skip for now" /dashboard exit.
//   • studio (public/index.html) resolveStudioProject() honors precedence: valid ?project= param
//     (must be in the user's /api/projects list) > first project (account default).
//   • pq() scopes every project-bound API call with the ?project= param.
// Deterministic — no DOM, no network.

import { test, expect } from "bun:test"

const STUDIO = await Bun.file(import.meta.dir + "/public/index.html").text()
const ONBOARD = await Bun.file(import.meta.dir + "/../site/onboarding.html").text()

// ── Extract the actual shipped source units (anchored, brace-matched) ─────────
function extractFn(src: string, startSig: string): string {
  const i = src.indexOf(startSig)
  if (i < 0) throw new Error("source not found: " + startSig)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + startSig)
}

const resolveSrc = extractFn(STUDIO, "function resolveStudioProject(")
const pqSrc = extractFn(STUDIO, "function pq(")
// openStudio is `async function openStudio()` (it awaits markOnboarded()); anchor on the async
// keyword so it is PRESERVED — extracting the bare `function openStudio(` strips `async`, leaving
// a top-level `await` in a non-async fn → SyntaxError.
const openStudioSrc = extractFn(ONBOARD, "async function openStudio(")
const renderSnippetSrc = extractFn(ONBOARD, "function renderWidgetSnippet(")

// =============================================================================
// 1 · Studio: resolveStudioProject precedence — valid ?project= wins, else default
// =============================================================================
const resolveStudioProject = new Function(resolveSrc + "\nreturn resolveStudioProject;")() as
  (paramId: string | null, projects: Array<{ id: string }>) => string | null
const PROJECTS = [{ id: "proj_default" }, { id: "proj_9db93ede" }]

test("studio: a ?project= param naming one of the user's projects wins", () => {
  expect(resolveStudioProject("proj_9db93ede", PROJECTS)).toBe("proj_9db93ede")
})
test("studio: a stale/foreign ?project= param falls back to the first (default) project", () => {
  expect(resolveStudioProject("proj_evil", PROJECTS)).toBe("proj_default")
})
test("studio: no param -> first project; no projects -> null", () => {
  expect(resolveStudioProject(null, PROJECTS)).toBe("proj_default")
  expect(resolveStudioProject("proj_9db93ede", [])).toBe(null)
  expect(resolveStudioProject(null, [])).toBe(null)
})
test("studio: loadStudioProjects actually routes through resolveStudioProject", () => {
  // Guard against a future refactor reverting to `studioProjectId() || projects[0].id`
  // (which trusted an unvalidated param for the badge/back-link).
  expect(STUDIO).toContain("const active = resolveStudioProject(requested, projects)")
})

// =============================================================================
// 2 · Studio: pq() scopes project-bound API calls with the ?project= param
// =============================================================================
function buildPq(paramId: string | null) {
  // pq resolves studioProjectId via function-scope lookup — inject a stub.
  return new Function("studioProjectId", pqSrc + "\nreturn pq;")(() => paramId) as (p: string) => string
}
test("studio: pq appends ?project= (and &project= when a query exists)", () => {
  const pq = buildPq("proj_9db93ede")
  expect(pq("/api/personas")).toBe("/api/personas?project=proj_9db93ede")
  expect(pq("/api/personas?x=1")).toBe("/api/personas?x=1&project=proj_9db93ede")
  expect(buildPq(null)("/api/personas")).toBe("/api/personas")
})

// =============================================================================
// 3 · Onboarding: openStudio carries the step-1 project into the Studio
// =============================================================================
// openStudio is async (it `await markOnboarded()`s before setting location.href), so we must
// AWAIT it before reading the resulting href. markOnboarded is a free reference in the extracted
// unit — inject a no-op stub in the Function scope (mirroring how `window` is injected) so the
// awaited call resolves without touching the network.
async function runOpenStudio(intent: string, projectId: string | null, goal: string | null = null): Promise<string> {
  const win = { location: { href: "" } }
  const markOnboarded = async () => {}
  const openStudio = new Function("intent", "projectId", "goal", "window", "markOnboarded",
    openStudioSrc + "\nreturn openStudio;")(intent, projectId, goal, win, markOnboarded) as () => Promise<void>
  await openStudio()
  return win.location.href
}
test("onboarding: hats handoff carries ?project= alongside starter=hats", async () => {
  expect(await runOpenStudio("hats", "proj_9db93ede")).toBe("/app?starter=hats&project=proj_9db93ede")
})
test("onboarding: transcript handoff carries ?project= before the #add-transcript hash", async () => {
  expect(await runOpenStudio("transcript", "proj_9db93ede")).toBe("/app?project=proj_9db93ede#add-transcript")
})
test("onboarding: no resolved project degrades to the original destinations", async () => {
  expect(await runOpenStudio("hats", null)).toBe("/app?starter=hats")
  expect(await runOpenStudio("transcript", null)).toBe("/app#add-transcript")
})
// Goal fork: the chosen goal rides along into the Studio (after project, before any #hash)
// so the Studio/dashboard can tailor the first-run experience to Snap vs Sims.
test("onboarding: the goal fork carries goal= on both Studio handoffs", async () => {
  expect(await runOpenStudio("hats", "proj_9db93ede", "sims")).toBe("/app?starter=hats&project=proj_9db93ede&goal=sims")
  expect(await runOpenStudio("transcript", "proj_9db93ede", "snap")).toBe("/app?project=proj_9db93ede&goal=snap#add-transcript")
})

// =============================================================================
// 4 · Onboarding: the "Skip for now" /dashboard exit deep-links the project
// =============================================================================
test("onboarding: renderWidgetSnippet points skipToDash at /dashboard?project=", () => {
  const els: Record<string, { textContent: string; href: string }> = {
    snipPid: { textContent: "", href: "" },
    skipToDash: { textContent: "", href: "/dashboard" },
  }
  const doc = { getElementById: (id: string) => els[id] || null }
  const render = new Function("projectId", "document", "goal",
    renderSnippetSrc + "\nreturn renderWidgetSnippet;")("proj_9db93ede", doc, null) as () => void
  render()
  expect(els.snipPid.textContent).toBe("proj_9db93ede")
  expect(els.skipToDash.href).toBe("/dashboard?project=proj_9db93ede")
  // The markup must still carry the id the deep-link hook targets.
  expect(ONBOARD).toContain('id="skipToDash"')
})
test("onboarding: skipToDash also carries goal= once a goal is chosen", () => {
  const els: Record<string, { textContent: string; href: string }> = {
    snipPid: { textContent: "", href: "" },
    skipToDash: { textContent: "", href: "/dashboard" },
  }
  const doc = { getElementById: (id: string) => els[id] || null }
  const render = new Function("projectId", "document", "goal",
    renderSnippetSrc + "\nreturn renderWidgetSnippet;")("proj_9db93ede", doc, "snap") as () => void
  render()
  expect(els.skipToDash.href).toBe("/dashboard?project=proj_9db93ede&goal=snap")
})
