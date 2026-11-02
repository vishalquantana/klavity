// WP-S3 (Add a Sim modal, per the Figma design): Describe is two steps (description → "Name your Sim"), Create stays disabled
// until a name is typed, the chosen name is sent to /api/persona/brief and enforced there, and "From your site" uses the new copy.
// Presets are deliberately unchanged (no new persona presets).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"

const DASH = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")
const SERVER = readFileSync(new URL("./server.ts", import.meta.url), "utf8")

function block(src: string, start: string, len = 1500): string {
  const i = src.indexOf(start)
  if (i < 0) throw new Error("missing " + start)
  return src.slice(i, i + len)
}

test("Describe step 1 is 'Continue →' (not Create) and step 2 is 'Name your Sim' with Create disabled until named", () => {
  expect(DASH).toContain('<button class="btn btn-indigo" id="smBriefGo">Continue →</button>')
  expect(DASH).toContain('hd.textContent = "Name your Sim"; sub.textContent = "Give this Sim a memorable name. You can change it later."')
  expect(DASH).toContain('<label class="sm-name-lbl" for="smName">Sim name</label>')
  expect(DASH).toContain('placeholder="e.g. Eleanor, Cautious Buyer, Finance Lead"')
  expect(DASH).toContain('<div class="sm-desc-lbl">Sim description</div>')
  expect(DASH).toContain(".sm-modal-namestep .sm-seg")      // tabs are hidden on the name screen
  expect(DASH).toContain('id="smCreateGo" disabled>Create Sim →</button>')
  expect(DASH).toContain('$("smName").addEventListener("input", () => { $("smCreateGo").disabled = !$("smName").value.trim(); });')
})

test("Continue with a too-short description shows a message instead of doing nothing", () => {
  const g = block(DASH, "function goToName()", 500)
  expect(g).toContain("v.length < 4")
  expect(g).toContain("fieldErr($(\"smBrief\")")
  expect(g.indexOf("fieldErr")).toBeLessThan(g.indexOf('showBriefStep("name")'))
})

test("example chips and Enter in the description go to the name step; Create sends the name", () => {
  expect(DASH).toContain('$("smBrief").value = c.textContent; goToName();')
  expect(DASH).toContain('if (e.key === "Enter") { e.preventDefault(); goToName(); }')
  const g = block(DASH, "async function genBrief()", 900)
  expect(g).toContain('Give your Sim a name.')
  expect(g).toContain('postJSON("/api/persona/brief", { brief: v, name: nm })')
})

test("opening the modal resets to step 1, and a typed name counts as unsaved work", () => {
  expect(DASH).toContain('$("smName").value = ""; $("smBriefStep").hidden = false; $("smNameStep").hidden = true; $("smCreateGo").disabled = true; ov.classList.remove("sm-modal-namestep");')
  expect(DASH).toContain('$("smBrief").value.trim() || $("smName").value.trim() || $("smTx").value.trim()')
})

test("/api/persona/brief uses the chosen name exactly (and derives initials from it)", () => {
  const b = block(SERVER, 'path === "/api/persona/brief"', 4200)
  expect(b).toContain("const { brief, name: briefName } = await req.json()")
  expect(b).toContain(".slice(0, 60)")                       // bounded
  expect(b).toContain("Name the Sim exactly: ")               // model is told the name…
  expect(b).toContain("data.persona.name = chosenName")       // …and the server enforces it
  expect(b).toContain("data.persona.initials =")
})

test("From your site: new button and description copy; the project's site URL is still prefilled", () => {
  expect(DASH).toContain('id="smUrlGo">Analyse &amp; suggest Sims →</button>')
  expect(DASH).toContain("Klavity will analyse your site and suggest Sims based on who likely uses it.")
  expect(DASH).toContain('$("smUrl").value = (state && state.active && state.active.siteUrl) || ""')
})

test("Presets are unchanged: still the five QA reviewers, no persona-preset group", () => {
  expect(SERVER).not.toContain("PERSONA_PRESET_SIMS")
  expect(SERVER).toContain('return wjson({ presets: PRESET_SIMS })')
})

test("Add a Sim popup follows the design: 580px wide, users icon, lead line above a full-width URL field with a globe, full-width action button", () => {
  expect(DASH).toContain("max-width: 580px;\n      padding: 30px 30px 26px;".replace(/\n/g, DASH.includes("\r\n") ? "\r\n" : "\n"))
  expect(DASH.indexOf('class="sm-note sm-site-lead"')).toBeLessThan(DASH.indexOf('class="sm-field url sm-url-wrap"'))
  expect(DASH.indexOf('class="sm-field url sm-url-wrap"')).toBeLessThan(DASH.indexOf('class="btn btn-indigo sm-site-go" id="smUrlGo"'))
  expect(DASH).toContain('<path d="M16 3.13a4 4 0 0 1 0 7.75" />')   // lucide "users" header icon
})

test("From a call is a drop zone (drag-drop + Browse files) for .txt/.vtt/.srt; pasting is still available behind a link", () => {
  expect(DASH).toContain('class="sm-drop" id="smDrop"')
  expect(DASH).toContain('Drop a transcript file')
  expect(DASH).toContain('accept=".txt,.vtt,.srt,text/plain"')
  expect(DASH).toContain('Upload a sales call, user interview, or support transcript.')
  const l = block(DASH, "function loadTranscriptFile(f)", 1400)
  expect(l).toContain("parseTranscriptFile(f.name, txt)")      // .vtt/.srt cue stripping still applies
  expect(l).toContain('$("smTx").value = txt')                   // feeds the existing Extract flow
  expect(DASH).toContain('smDrop.addEventListener("drop"')
  expect(DASH).toContain('$("smPasteToggle").onclick')
  expect(DASH).toContain("#smTx[hidden]")                        // .sm-ta display:block must not defeat `hidden`
})

test("Extract Sims with nothing loaded says what to do (the hidden paste box can't show an inline error)", () => {
  const g = block(DASH, "async function genCall()", 700)
  expect(g).toContain("Drop or browse a transcript file, or paste the call.")
})
