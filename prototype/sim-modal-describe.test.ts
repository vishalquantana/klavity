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

test("Adding a Sim shows the design's 'Sim created!' popup view, which stays until closed (closing reloads the list); the old 'put them to work' panel is never shown", () => {
  expect(DASH).toContain('id="smCreatedT">Sim created!</h2>')
  expect(DASH).toContain("It will appear in your Sims list shortly.")
  const f = block(DASH, "function showSuccessPanel(addedName, addedCount, merged, simId)", 1800)
  expect(f).toContain('ov.classList.add("sm-modal-created")')
  expect(f).not.toContain("setTimeout(")                            // KD-2862: no auto-close
  expect(f).toContain('out.querySelector(".sm-sim:not(.added)")')   // suggestions still waiting → toast only, popup view last
  expect(f).not.toContain("successEl.classList.add")                // the old panel is never shown
  expect(f).not.toContain("put them to work")
  expect(DASH).toContain(".sm-modal-created .sm-seg")                // everything but the close button is hidden meanwhile
  expect(block(DASH, "function close(fromPop)", 300)).toContain("clearCreatedView()")
  expect(block(DASH, "function close(fromPop)", 2200)).toContain("if (simAdded) { simAdded = false; load();")
  expect(DASH).toContain('ov.classList.contains("sm-modal-created"); }')   // an open created view never counts as unsaved work
})

// ── Presets: adding a preset Sim gets the same "Sim created!" popup as Describe, even with other presets unadded ──
function runShowSuccess(source: string, unaddedCards: boolean, args: [string | null, number, boolean, string | null]) {
  const start = DASH.indexOf("function showSuccessPanel(addedName, addedCount, merged, simId)")
  const end = DASH.indexOf("function hideSuccessPanel()", start)
  const body = DASH.slice(start, end)
  const els: Record<string, any> = { smCreated: { hidden: true }, smCreatedT: {}, smCreatedN: {}, smCreatedS: {}, smCreatedClose: { focus: () => { } } }
  const cls = new Set<string>(); const toasts: string[] = []; let closed = 0
  const ov = { classList: { add: (c: string) => cls.add(c), remove: (c: string) => cls.delete(c), contains: (c: string) => cls.has(c) } }
  const out = { querySelector: (sel: string) => (sel === ".sm-sim:not(.added)" && unaddedCards ? {} : null) }
  const timers: Array<() => void> = []
  new Function("$", "ov", "out", "klavToast", "esc", "lastSimSource", "PANE_TO_SOURCE", "close", "clearCreatedView", "setTimeout", "createdTimerBox", "SIM_CREATED_MS",
    "var createdTimer = null;" + body.replace(/createdTimer = setTimeout/, "createdTimer = setTimeout") + "; showSuccessPanel.apply(null, " + JSON.stringify(args) + ")")(
    (id: string) => els[id], ov, out, (m: string) => toasts.push(m), (s: string) => s, source,
    { describe: "describe", site: "from-site", call: "transcript", preset: "preset" }, () => { closed++ }, () => cls.delete("sm-modal-created"),
    (fn: () => void) => { timers.push(fn); return 1 }, {}, 5000)
  return { created: cls.has("sm-modal-created"), toasts, title: els.smCreatedT.textContent, name: els.smCreatedN.textContent, runTimer: () => timers.forEach((f) => f()), closed: () => closed }
}
test("a preset Sim add shows the 'Sim created!' popup and closes, even while other presets are still unadded", () => {
  const r = runShowSuccess("preset", true, ["QA Reviewer", 1, false, "sim_1"])
  expect(r.created).toBe(true)
  expect(r.title).toBe("Sim created!")
  expect(r.name).toBe("QA Reviewer")
  expect(r.toasts.length).toBe(0)
  r.runTimer(); expect(r.closed()).toBe(0)                           // KD-2862: nothing was scheduled, so nothing closes by itself
})
test("From your site / From a call with suggestions still waiting keep the toast-only behaviour", () => {
  for (const src of ["from-site", "transcript"]) {
    const r = runShowSuccess(src, true, ["Priya", 1, false, "sim_2"])
    expect(r.created).toBe(false)
    expect(r.toasts.length).toBe(1)
  }
})
test("Describe (no other cards) still shows the popup", () => {
  expect(runShowSuccess("describe", false, ["Alex", 1, false, "sim_3"]).created).toBe(true)
})

// ── After a Sim is added the user ends on the Sims page, wherever the dialog was opened from ──
function runClose(o: { added: boolean; returnUrl: string | null; atSimNew?: boolean; fromPop?: boolean }) {
  const start = DASH.indexOf("function close(fromPop) {")
  const end = DASH.indexOf("// Closing (✕, backdrop, Escape", start)
  const body = DASH.slice(start, end)
  const calls: string[] = []
  const cls = new Set<string>()
  const ov = { classList: { remove: (c: string) => cls.delete(c), add: (c: string) => cls.add(c), contains: (c: string) => cls.has(c) } }
  const doc = { body: { style: {} as any } }
  const hist = { back: () => calls.push("back"), replaceState: (_s: any, _t: string, u: string) => calls.push("replace:" + u) }
  const win = { setView: (v: string) => calls.push("setView:" + v) }
  new Function("o", "ov", "document", "history", "window", "clearCreatedView", "hideSuccessPanel", "hideDiscard", "atSimNew", "simNewFallbackUrl", "load",
    "var simNewReturnUrl = o.returnUrl, simAdded = o.added;" + body + "; close(o.fromPop)")(
    o, ov, doc, hist, win, () => { }, () => { }, () => { }, () => o.atSimNew !== false, () => "/dashboard?project=P", () => calls.push("load"))
  return calls
}
test("after adding a Sim opened from the Sims page: go back to it, reload, and show Sims", () => {
  expect(runClose({ added: true, returnUrl: "/dashboard?project=P#sims" })).toEqual(["back", "load", "setView:sims"])
})
test("after adding a Sim opened from another page (or a deep link): go straight to the Sims page, not back", () => {
  expect(runClose({ added: true, returnUrl: "/dashboard?project=P#triage" })).toEqual(["replace:/dashboard?project=P", "load", "setView:sims"])
  expect(runClose({ added: true, returnUrl: null })).toEqual(["replace:/dashboard?project=P", "load", "setView:sims"])
})
test("closing without adding a Sim still goes back to where it was opened from and does not switch views", () => {
  expect(runClose({ added: false, returnUrl: "/dashboard?project=P#triage" })).toEqual(["back"])
  expect(runClose({ added: false, returnUrl: null })).toEqual(["replace:/dashboard?project=P"])
})
test("browser Back (fromPop) never touches history, even after an add", () => {
  expect(runClose({ added: true, returnUrl: "/dashboard?project=P#triage", fromPop: true })).toEqual(["load", "setView:sims"])
})
