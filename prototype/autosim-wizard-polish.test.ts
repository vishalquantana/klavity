// AutoSim wizard polish: the objective limits are shown at the field, Create & Run reads as disabled until the wizard is valid, and a
// provider / budget stall tells the user what is actually wrong instead of "refine the objective".
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const SERVER = await Bun.file(import.meta.dir + "/server.ts").text()
const AUTHOR = await Bun.file(import.meta.dir + "/lib/trails-author.ts").text()
const AUTHOR_MODEL = await Bun.file(import.meta.dir + "/lib/trails-author-model.ts").text()

function fn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const esc = (x: any) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const limits = "var OBJ_MIN = 10, OBJ_MAX = 4000"
if (!HTML.includes(limits)) throw new Error("limits line not found")
const api = new Function("esc",
  [limits, fn(HTML, "function objLengthMsg("), fn(HTML, "function isInfraStall("), fn(HTML, "function stallHint("), fn(HTML, "function startErrHtml("), fn(HTML, "function humanizeStall(")].join("\n")
  + "\nreturn { objLengthMsg, isInfraStall, stallHint, startErrHtml, humanizeStall }")(esc) as any

test("objective limits: under 10 and over 4,000 give a clear message with the count; 10 and 4,000 are fine", () => {
  expect(api.objLengthMsg(0)).toBe("Objective is too short — use at least 10 characters.")
  expect(api.objLengthMsg(9)).toBe("Objective is too short — use at least 10 characters (you have 9).")
  expect(api.objLengthMsg(10)).toBeNull(); expect(api.objLengthMsg(12)).toBeNull(); expect(api.objLengthMsg(4000)).toBeNull()
  expect(api.objLengthMsg(4001)).toBe("Objective is too long — use at most 4,000 characters (1 over).")
  expect(api.objLengthMsg(4500)).toContain("500 over")
})
test("the wizard uses those limits (it used to require 15 while the server accepted 10)", () => {
  const v = fn(HTML, "function wizValidate(")
  expect(v).toContain("var lm = objLengthMsg(v2.length); if (lm) return lm")
  expect(v).not.toContain("v2.length < 15")
  expect(HTML).toContain('placeholder="Log in, create a project, open it, then delete it and log out." aria-describedby="ntObjCount"')   // the older modal too
  expect(HTML).toContain("var ntLenMsg = objLengthMsg(")
})
test("a live counter sits under both objective fields and updates as you type", () => {
  expect(HTML).toContain('<div class="wiz-count" id="wizObjCount" aria-live="polite">0 / 4,000 · at least 10 characters</div>')
  expect(HTML).toContain('<div class="wiz-count" id="ntObjCount" aria-live="polite">')
  expect(HTML).toContain('document.getElementById("wizObj").addEventListener("input", function () { paintObjCount("wizObj", "wizObjCount"); wizSyncCreate() })')
  expect(HTML).toContain('document.getElementById("ntObj").addEventListener("input", function () { paintObjCount("ntObj", "ntObjCount") })')
  expect(HTML).toContain(".wiz-count.over,")
})
test("server: the 10–4000 rule stays, with a readable message and a code", () => {
  expect(SERVER).toContain('"Objective is too short — use at least 10 characters."')
  expect(SERVER).toContain('code: "objective_length"')
  expect(SERVER).toContain("objective.length < 10 || objective.length > 4000")
})

test("Create & Run is disabled (grey, not-allowed, no hover lift) until steps 1–3 are valid, and says what is missing", () => {
  const sync = fn(HTML, "function wizSyncCreate(")
  expect(sync).toContain("cb.disabled = !!unmet")
  expect(sync).toContain('cb.setAttribute("aria-disabled"')
  expect(sync).toContain('"Not ready yet (step " + unmet.step + "): " + unmet.msg')
  expect(HTML).toContain('<p class="wiz-hint-unmet" id="wizUnmet" aria-live="polite"></p>')
  expect(HTML).toContain(".wiz-nav .btn:disabled,")
  expect(HTML).toContain("filter: grayscale(.55)")
  expect(HTML).toContain("cursor: not-allowed")
  expect(HTML).toContain('paintObjCount("wizObj", "wizObjCount"); wizSyncCreate()')                       // re-evaluated on every step render
})
test("submitting shows a spinner and a busy marker, and every exit path restores the button through one helper", () => {
  expect(HTML).toContain('btn.innerHTML = \'<span class="wiz-spin" aria-hidden="true"></span>Creating…\'')
  expect(HTML).toContain('btn.setAttribute("data-busy", "1")')
  const reset = fn(HTML, "function wizResetCreate(")
  expect(reset).toContain('btn.removeAttribute("data-busy")'); expect(reset).toContain("wizSyncCreate()")
  expect(HTML).toContain('wizResetCreate(createBtn, "Create & Run")')
  expect(HTML).toContain('wizResetCreate(btn, "Try again")')
  expect(HTML).toContain('var unmetNow = wizFirstUnmet()')                                                 // a stale enabled click can't submit invalid input
})

test("provider credits / daily budget / provider access stalls get an actionable message, not the raw status", () => {
  expect(api.humanizeStall("model auth error: author model 402")).toContain("run out of credits")
  expect(api.humanizeStall("provider_credits_exhausted: AI provider credits exhausted after 3 model calls")).toContain("workspace admin")
  expect(api.humanizeStall("OpenRouter 402: payment required")).toContain("run out of credits")
  expect(api.humanizeStall("budget_exhausted: daily AI budget reached after 5 model calls")).toContain("daily AI budget")
  expect(api.humanizeStall("model auth error: author model 401")).toContain("access was refused")
  // existing mappings are untouched
  expect(api.humanizeStall("authoring budget cap $2 reached")).toBe("We hit our cost limit while drafting this trail.")
  expect(api.humanizeStall("stuck after 4 failed attempts")).toBe("AutoSim kept running into the same problem and gave up.")
  expect(api.humanizeStall("something unmapped")).toBe("something unmapped")
})
test("for those stalls the hint no longer says 'refine the objective'; for ordinary stalls it does", () => {
  for (const r of ["provider_credits_exhausted: x", "model auth error: author model 402", "budget_exhausted: y", "OpenRouter 402"]) {
    expect(api.isInfraStall(r)).toBe(true)
    expect(api.stallHint(r, "Refine the objective and try again.")).toContain("needs a workspace admin")
  }
  expect(api.isInfraStall("stuck after 4 failed attempts")).toBe(false)
  expect(api.stallHint("stuck after 4 failed attempts", "Refine the objective and try again.")).toBe("Refine the objective and try again.")
})
test("start errors show the server's message plus an Upgrade link only for a same-site path or https", () => {
  expect(api.startErrHtml({ error: "This project is on the Snap plan." }, "Payment Required")).toBe('<div class="nt-stall">This project is on the Snap plan.</div>')
  expect(api.startErrHtml({ error: "Upgrade needed", upgradeUrl: "/pricing" }, "")).toContain('<a href="/pricing" target="_blank" rel="noopener"')
  expect(api.startErrHtml({ error: "x", upgradeUrl: "https://klavity.in/pricing" }, "")).toContain("Upgrade</a>")
  expect(api.startErrHtml({ error: "x", upgradeUrl: "javascript:alert(1)" }, "")).not.toContain("<a ")        // never a script link
  expect(api.startErrHtml({ error: "x", upgradeUrl: "http://evil.example" }, "")).not.toContain("<a ")
  expect(api.startErrHtml({ error: '<img src=x onerror=1>' }, "")).not.toContain("<img")                      // escaped
  expect(api.startErrHtml({}, "Bad Gateway")).toContain("Bad Gateway")
})
test("server: a provider 402 stalls with a stable prefix and is logged loudly", () => {
  expect(AUTHOR).toContain("if (e.httpStatus === 402) return await stall(`provider_credits_exhausted:")
  expect(AUTHOR_MODEL).toContain('if (res.status === 402) console.error("[provider-402]')
  // 402 stays non-retryable (retrying a no-credit account only burns time)
  expect(AUTHOR_MODEL).toContain("const retryable = res.status === 429 || res.status >= 500")
})
