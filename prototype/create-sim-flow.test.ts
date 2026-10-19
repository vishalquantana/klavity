// Create Sim dialog (package B1): closing asks before throwing away unsaved work, buttons show they're working (and can't be double-fired),
// a hung request gives up with a clear message, validation appears under the field, and a locked plan says so with an Upgrade link.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function fn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const esc = (x: any) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// ── postJSON: timeout, network, error details ────────────────────────────────────────────────────────────────────────
function makePost(fetchImpl: any) {
  return new Function("fetch", fn(HTML, "async function postJSON(") + "; return postJSON")(fetchImpl) as (url: string, body: any, opts?: any) => Promise<any>
}
const jsonRes = (status: number, body: any) => ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) })

test("a request that never answers gives up after the timeout with a clear message (code: timeout)", async () => {
  const post = makePost((_u: string, o: any) => new Promise((_res, rej) => o.signal.addEventListener("abort", () => rej(new Error("aborted")))))
  const err: any = await post("/api/persona/brief", { brief: "x" }, { timeoutMs: 30 }).catch((e) => e)
  expect(err.code).toBe("timeout"); expect(err.status).toBe(0)
  expect(err.message).toContain("taking longer than expected")
})
test("a network failure says it could not reach Klavity (code: network)", async () => {
  const post = makePost(() => Promise.reject(new TypeError("Failed to fetch")))
  const err: any = await post("/api/persona/brief", {}).catch((e) => e)
  expect(err.code).toBe("network"); expect(err.message).toContain("Couldn't reach Klavity")
})
test("server errors keep their status, code, trace id and upgrade link; a good reply returns the data", async () => {
  const bad = makePost(() => Promise.resolve(jsonRes(402, { error: "Snap plan", code: "snap_locked", upgradeUrl: "/pricing", id: "ab12" })))
  const err: any = await bad("/api/personas", {}).catch((e) => e)
  expect(err.status).toBe(402); expect(err.code).toBe("snap_locked"); expect(err.upgradeUrl).toBe("/pricing"); expect(err.traceId).toBe("ab12"); expect(err.message).toBe("Snap plan")
  const good = makePost(() => Promise.resolve(jsonRes(200, { persona: { name: "A" } })))
  expect((await good("/x", {})).persona.name).toBe("A")
  const noBody = makePost(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.reject(new Error("no json")) }))
  expect(((await noBody("/x", {}).catch((e) => e)) as any).message).toBe("HTTP 500")
})

// ── withBusy ──────────────────────────────────────────────────────────────────────────────────────────────────────────
function fakeBtn(label: string) {
  const attrs: Record<string, string> = {}
  return { disabled: false, innerHTML: label, attrs, setAttribute(k: string, v: string) { attrs[k] = v }, removeAttribute(k: string) { delete attrs[k] } } as any
}
const withBusy = new Function("esc", fn(HTML, "async function withBusy(") + "; return withBusy")(esc) as (b: any, label: string, f: () => Promise<void>) => Promise<void>

test("withBusy disables the button with a spinner while the work runs, then restores it — even if the work throws", async () => {
  const b = fakeBtn("Create Sim →"); let during: any = null
  await withBusy(b, "Imagining…", async () => { during = { disabled: b.disabled, label: b.innerHTML, busy: b.attrs["aria-busy"] } })
  expect(during.disabled).toBe(true); expect(during.label).toContain("sm-spin"); expect(during.label).toContain("Imagining…"); expect(during.busy).toBe("true")
  expect(b.disabled).toBe(false); expect(b.innerHTML).toBe("Create Sim →"); expect(b.attrs["aria-busy"]).toBeUndefined()
  const b2 = fakeBtn("Add"); await withBusy(b2, "…", async () => { throw new Error("boom") }).catch(() => { })
  expect(b2.disabled).toBe(false); expect(b2.innerHTML).toBe("Add")
})
test("a second click while it is working does nothing (no parallel AI calls)", async () => {
  const b = fakeBtn("Go"); let runs = 0; let release: () => void = () => { }
  const first = withBusy(b, "…", () => new Promise<void>((res) => { runs++; release = res }))
  await withBusy(b, "…", async () => { runs++ })           // button is disabled → ignored
  expect(runs).toBe(1)
  release(); await first
})

// ── unsaved-work check ───────────────────────────────────────────────────────────────────────────────────────────────
function makeDirty(o: { shown?: boolean; success?: boolean; brief?: string; tx?: string; url?: string; siteUrl?: string; unsavedCards?: boolean }) {
  const ov = { classList: { contains: (c: string) => c === "show" && o.shown !== false } }
  const successEl = { classList: { contains: (c: string) => c === "show" && !!o.success } }
  const vals: Record<string, string> = { smBrief: o.brief || "", smTx: o.tx || "", smUrl: o.url ?? (o.siteUrl || "") }
  const $ = (id: string) => ({ value: vals[id] })
  const out = { querySelector: (sel: string) => (sel === ".sm-sim:not(.added)" && o.unsavedCards ? {} : null) }
  const state = { active: { siteUrl: o.siteUrl || "" } }
  const body = [fn(HTML, "function simSuccessShown("), fn(HTML, "function simDirty("), "return simDirty"].join("\n")
  return new Function("ov", "successEl", "$", "out", "state", body)(ov, successEl, $, out, state) as () => boolean
}
test("nothing typed, nothing generated: closing is free", () => { expect(makeDirty({})()).toBe(false); expect(makeDirty({ siteUrl: "https://a.com", url: "https://a.com" })()).toBe(false) })
test("typed text in any tab, an edited site URL, or generated cards that are not added yet all count as unsaved", () => {
  expect(makeDirty({ brief: "ops manager" })()).toBe(true)
  expect(makeDirty({ tx: "call transcript…" })()).toBe(true)
  expect(makeDirty({ siteUrl: "https://a.com", url: "https://b.com" })()).toBe(true)
  expect(makeDirty({ unsavedCards: true })()).toBe(true)
})
test("once a Sim was added (success panel showing) or the dialog is closed, there is nothing to lose", () => {
  expect(makeDirty({ brief: "x", success: true })()).toBe(false)
  expect(makeDirty({ brief: "x", shown: false })()).toBe(false)
})

// ── wiring ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("✕, backdrop, Escape and browser Back all go through the same check; the page warns on unload while unsaved", () => {
  expect(HTML).toContain('$("simClose").onclick = function () { requestClose(); };')
  expect(HTML).toContain("ov.addEventListener(\"mousedown\", (e) => { if (e.target === ov) requestClose(); });")
  expect(HTML).toContain("if (discardOpen()) { hideDiscard(); return; }")
  expect(HTML).toContain("else if (ov.classList.contains(\"show\")) { requestClose(true); }")
  expect(HTML).toContain('window.addEventListener("beforeunload", (e) => { if (simDirty()) { e.preventDefault(); e.returnValue = ""; } });')
  const rc = fn(HTML, "function requestClose(")
  expect(rc).toContain("if (!simDirty()) { close(fromPop); return; }")
  expect(rc).toContain("history.pushState(null, \"\", simNewUrl(currentMode()))")      // Back already left /sim/new: put the entry back
  expect(HTML).toContain('<strong id="smDiscardT">Discard this Sim?</strong>')
  expect(HTML).toContain('id="smKeep">Keep editing</button><button type="button" class="btn btn-indigo btn-sm" id="smDiscardGo">Discard</button>')
})
test("the three generate buttons show progress, validation lands under the field, and a locked plan gets an Upgrade link", () => {
  expect(HTML).toContain('$("smBriefGo").onclick = () => withBusy($("smBriefGo"), "Imagining…", genBrief);')
  expect(HTML).toContain('$("smUrlGo").onclick = () => withBusy($("smUrlGo"), "Reading…", genSite);')
  expect(HTML).toContain('$("smTxGo").onclick = () => withBusy($("smTxGo"), "Extracting…", genCall);')
  expect(HTML).toContain('fieldErr($("smBrief"), "Describe your user in a sentence — a few words is enough.")')
  expect(HTML).toContain('fieldErr($("smUrl"), "Enter your product’s URL.")')
  expect(HTML).toContain("if (e && e.status === 402) { failUpgrade(e.message")
  const fu = fn(HTML, "function failUpgrade(")
  expect(fu).toContain('u.charAt(0) === "/" || u.indexOf("https://") === 0')            // never a javascript: / http: link
})
