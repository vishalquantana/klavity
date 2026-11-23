// AutoSims → Projects & Test Cases: "Upload & Extract" flow (upload → extract → review → add test cases,
// no run step) + test case F-01 fields (client wiring). Server behaviour: lib/requirements-extract.test.ts,
// lib/requirement-runs.test.ts and server.autosim-projects.route.test.ts.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const js = readFileSync(join(import.meta.dir, "public/vendor/autosim-projects.js"), "utf8")

test("Upload & Extract button sits beside + New test case and opens the flow", () => {
  expect(js).toMatch(/id="aspTcExtract"[^']*'\s*\+\s*ui\('upload', 15\) \+ ' Upload &amp; Extract<\/button>'\s*\+\s*'<button class="btn btn-indigo" id="aspTcAdd">\+ New test case/)
  expect(js).toContain("$('aspTcExtract').onclick = function () { uxOpen() }")
})

test("the flow has every step up to adding the test cases, with the pre-filled details step", () => {
  for (const title of ["Upload Requirements", "Document Uploaded", "Extracting Requirements", "Review Extracted Requirements",
    "Test Scenarios Generated", "Review Test Cases", "Complete Test Case Details", "Adding Test Cases"]) {
    expect(js).toContain(`'${title}'`)
  }
  expect(js).toContain("if (a === 'run') { ux.step = 'details'")
  expect(js).toContain("uxBtn('create', uxAddLabel(sel.length), true)")
  expect(js).toContain("uxBtn('run', sel.length ? uxAddLabel(sel.length) : 'Select test cases'")
  expect(js).not.toContain('Next: add')
  expect(js).toContain("function uxAddLabel(n) { return 'Add ' + n + ' Test Case' + (n === 1 ? '' : 's') }")
  expect(js).toContain('#aspUxBg .ux-app{grid-template-columns:1fr 1fr')
  // Pre-fill incl. preconditions + expected result, editable per scenario.
  expect(js).toContain("({ title: s.title, steps: s.steps, pre: s.preconditions || '', exp: s.expectedResult || '', url: s.startUrl || '' })[f]")
  expect(js).toContain('data-ux-f="pre"')
  expect(js).toContain('data-ux-f="exp"')
  expect(js).toContain("url: r.startUrl || ''")
})

test("no run step after generating: adding closes the popup and shows them on the Test Cases board", () => {
  expect(js).not.toContain("'Running Tests in AutoSims'")
  expect(js).not.toContain("data-ux=\"stoprun\"")
  expect(js).not.toContain("uxBtn('startrun'")
  expect(js).not.toContain("function uxStartRun(")
  expect(js).not.toContain("'/requirement-runs'")
  expect(js).toContain("toast(plural(n, 'test case') + ' added to Test Cases')")
  // only a partial failure keeps the popup open, listing what was not added
  expect(js).toContain("if (ux.failed.length) { ux.step = 'done'; return uxDraw() }")
  expect(js).toContain("'Some Test Cases Were Not Added'")
})

test("extract → add (linked to scenarios) endpoints", () => {
  expect(js).toContain("'/extract' + (p ? '?project=' + encodeURIComponent(p) : '')")
  expect(js).toContain("fd.append('file', ux.file, ux.file.name)")
  expect(js).toContain("'/requirement-docs/' + encodeURIComponent(ux.result.docId) + '/test-cases'")
  expect(js).toContain("scenario_id: sc.dbId")
})

test("client-side file checks match the server (PDF/DOCX/TXT/MD, ≤25 MB)", () => {
  expect(js).toContain("var UX_MAX = 25 * 1024 * 1024")
  expect(js).toContain("var UX_EXT = /\\.(pdf|docx|txt|md)$/i")
})

test("no backdrop close; closing before the test cases are added asks before discarding them", () => {
  expect(js).not.toMatch(/aspUxBg[^\n]*addEventListener\('click'/)
  expect(js).toContain("confirmDanger('Discard the extracted test cases?'")
  expect(js).not.toContain("Saved under Requirements")
})

test("no Requirements tab: extracted test cases all land in the Test Cases tab", () => {
  expect(js).toContain("['test-cases', 'Test Cases']]")
  expect(js).not.toContain("['requirements', 'Requirements']")
  expect(js).not.toContain("function drawRequirements(")
  expect(js).not.toContain("function drawReqDoc(")
  expect(js).not.toContain("function uxOpenFromDoc(")
  // old ?asp_tab=requirements links open Test Cases instead
  expect(js).toContain("if (tab === 'requirements') tab = 'test-cases'")
  // every extracted scenario is selected by default, not just the "ready" ones
  expect(js).toContain("d.scenarios.forEach(function (s) { ux.selected[s.id] = true })")
  // closing/finishing after adding goes to the Test Cases tab
  expect(js).toContain("go({ asp: cur.project.id, tab: 'test-cases' })")
  expect(js).not.toContain("tab: 'requirements'")
  // the requirement link + validation history stay on the test case page
  expect(js).toContain("function evidenceLinks(ev)")
})

test("test case page + form: preconditions, expected result, requirement, validation history; recording carries the expected result", () => {
  expect(js).toContain("{ key: 'preconditions', label: 'Preconditions'")
  expect(js).toContain("{ key: 'expected_result', label: 'Expected result'")
  expect(js).toContain("api('GET', tcBase + '/validation')")
  expect(js).toContain("objective: objectiveFor(tc, tcReq)")
  expect(js).toContain("'Expected result (before finishing, confirm this is actually shown/true in the application): '")
})

// Pull the page's own helpers out of the IIFE to test them directly.
const helper = (name: string) => {
  const s = js.indexOf(`function ${name}(`); let i = js.indexOf("{", s), depth = 0
  for (; i < js.length; i++) { if (js[i] === "{") depth++; else if (js[i] === "}" && --depth === 0) break }
  return js.slice(s, i + 1)
}
const setupFns = new Function(`${helper("stepLines")}\n${helper("hasSetupSteps")}\n${helper("withSetupSteps")}\nreturn { hasSetupSteps, withSetupSteps }`)() as any
const PX4 = '1. Log in to the application with the attached credentials\n2. Security code: 147852\n3. Choose "PX4 Softwaress" company\n4. Wait until the dashboard page is visible.'

test("common setup steps go in front of a test case's steps, renumbered, and are never added twice", () => {
  const out = setupFns.withSetupSteps(PX4, "1. Open the Project Details page\n2. Toggle 'Archive' on")
  expect(out).toBe('1. Log in to the application with the attached credentials\n2. Security code: 147852\n3. Choose "PX4 Softwaress" company\n4. Wait until the dashboard page is visible.\n5. Open the Project Details page\n6. Toggle \'Archive\' on')
  expect(setupFns.hasSetupSteps(PX4, out)).toBe(true)
  expect(setupFns.withSetupSteps(PX4, out)).toBe(out)                       // idempotent
  expect(setupFns.withSetupSteps("", "1. Only this")).toBe("1. Only this")  // no setup → unchanged
})

test("setup steps are not on the project form; the details step asks PX4 vs other application", () => {
  expect(js).not.toContain("{ key: 'setup_steps'")
  expect(js).toContain('name="uxApp" value="px4"')
  expect(js).toContain('name="uxApp" value="other"')
  // required, just two plain options, no default, and the steps are never shown
  expect(js).toContain("Which application is this? *")
  expect(js).toContain("app ? app.value : (ux.shared && ux.shared.app) || '',")
  expect(js).toContain("if (sh.app !== 'px4' && sh.app !== 'other') { ux.err = 'Choose which application this is: PX4 or Other.'")
  expect(js).not.toContain('id="uxSetup"')
  expect(js).not.toContain("PX4 setup steps <span")   // no visible steps label
  // only PX4 prepends the (hidden) steps
  expect(js).toContain("var setup = sh.app === 'px4' ? String(sh.setup || '').trim() : ''")
  expect(js).toContain("api('PATCH', reqBase(), { setup_steps: setup })")
  expect(js).toContain("steps: withSetupSteps(setup, uxVal(sc, 'steps')).slice(0, 4000)")
})

test("each test case opens as an edit form (name, preconditions, steps, expected result, start URL) on review and details", () => {
  const row = helper("uxRow")
  for (const f of ['data-ux-f="title"', 'data-ux-f="pre"', 'data-ux-f="steps"', 'data-ux-f="exp"', 'data-ux-f="url"']) expect(row).toContain(f)
  // review: with a checkbox to untick; details: the selected test cases are listed (no checkbox)
  const review = js.slice(js.indexOf("case 'scenarios':"), js.indexOf("case 'details':"))
  const details = js.slice(js.indexOf("case 'details':"), js.indexOf("case 'creating':"))
  expect(review).toContain("sc.map(function (s) { return uxRow(s, true) })")
  expect(details).toContain("sel.map(function (s) { return uxRow(s, false) })")
  expect(details).toContain("Test cases to add")
  expect(row).toContain("(pickable ? '<input type=\"checkbox\" data-ux-sel=")
  // editing updates the row's name + pill in place
  expect(js).toContain("uxSyncRow(id)")
})

// "Needs Info" only for what the user must still write in — not for start URL / login / PX4 codes,
// which the details step already asks for.
const missingFns = (edits: Record<string, any> = {}) => new Function("edits",
  `var ux = { edits: edits }\n${helper("uxVal")}\nvar UX_COVERED = ${js.match(/var UX_COVERED = (\/.*\/i)/)![1]}\n${helper("uxMissing")}\nreturn uxMissing`)(edits) as (s: any) => string[]

test("Needs Info ignores what the next step covers (URL, credentials, security code, company)", () => {
  const uxMissing = missingFns()
  const base = { id: "TS-001", title: "t", steps: "1. a", preconditions: "", startUrl: "", expectedResult: "Saved" }
  expect(uxMissing({ ...base, missing: ["start URL", "login credentials", "valid username and password", "security code", "company to choose"] })).toEqual([])
  expect(uxMissing({ ...base, missing: ["start URL", "a valid project name"] })).toEqual(["a valid project name"])
  expect(uxMissing({ ...base, expectedResult: "", missing: ["expected result"] })).toEqual(["expected result"])
})

test("editing a test case's steps clears the document's gaps; an empty expected result still needs info", () => {
  const s = { id: "TS-002", title: "t", steps: "1. a", preconditions: "", startUrl: "", expectedResult: "", missing: ["a valid date"] }
  expect(missingFns()(s)).toEqual(["a valid date", "expected result"])
  expect(missingFns({ "TS-002": { steps: "1. a\n2. type 01/01/2026" } })(s)).toEqual(["expected result"])
  expect(missingFns({ "TS-002": { steps: "1. a", exp: "Date saved" } })(s)).toEqual([])
})

test("test case list: AI badge for document-created test cases; Edit/Delete as side-by-side icon buttons", () => {
  const rows = helper("drawTcRows")
  expect(rows).toContain("var ai = t.requirementId ? ' <span class=\"asp-ai\"")
  expect(rows).toContain('class="asp-tc-acts"')
  expect(rows).toContain("class=\"asp-ibtn\" data-tedit=")
  expect(rows).toContain("class=\"asp-ibtn danger\" data-tdel=")
  expect(rows).toContain("ui('pencil', 15)")
  expect(rows).toContain("ui('trash', 15)")
  expect(js).toContain("'#aspRoot .asp-tc-acts{display:flex;gap:6px;justify-content:flex-end}'")
  // long URLs stay on one line (full URL on hover)
  expect(rows).toContain('class="asp-url"')
})
