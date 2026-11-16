// Bug: "objective must be 10-4000 chars" showed on the New AutoSim wizard's last step before Create & Run.
// Cause: (1) the server capped objectives at 4000 chars that the wizard never checked, and (2) that server message
// stayed in #wizProgress when the user went Back / edited and came back to "Ready to go". Now there is NO maximum
// (wizard + POST /api/trails/author), the minimum is re-checked on Create & Run, and a stale result is cleared.
const SERVER = readFileSync(join(import.meta.dir, "server.ts"), "utf8").replace(/\r\n/g, "\n")

test("POST /api/trails/author has no maximum objective length (minimum only)", () => {
  const i = SERVER.indexOf('if (req.method === "POST" && path === "/api/trails/author")')
  const handler = SERVER.slice(i, SERVER.indexOf("base_url must be an http(s) URL", i))
  expect(handler).toContain("if (objective.length < 10) return json(")
  expect(handler).not.toContain("objective.length > 4000")
})
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const read = (f: string) => readFileSync(join(import.meta.dir, "public", f), "utf8").replace(/\r\n/g, "\n")
const PAGES = { dashboard: read("dashboard.html"), trails: read("trails.html") }
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i + sig.length - 1), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

function validator(html: string) {
  const fields: Record<string, { value: string }> = { wizName: { value: "Checkout" }, wizUrl: { value: "https://shop.example.com" }, wizObj: { value: "" } }
  const document = { getElementById: (id: string) => fields[id] || null }
  const wizValidate = new Function("document", `${extractFn(html, "function wizValidate(")}; return wizValidate`)(document)
  return { fields, wizValidate }
}

for (const [page, html] of Object.entries(PAGES)) {
  test(`${page}: the objective has no maximum length, only a minimum`, () => {
    const { fields, wizValidate } = validator(html)
    fields.wizObj.value = "Open pricing, pick the Pro plan and check out."
    expect(wizValidate(3)).toBeNull()
    fields.wizObj.value = "x".repeat(7230) // the length from the report
    expect(wizValidate(3)).toBeNull()
    fields.wizObj.value = "x".repeat(50_000)
    expect(wizValidate(3)).toBeNull()
    fields.wizObj.value = "short"
    expect(wizValidate(3)).toContain("more detail")
    expect(html).not.toContain("Keep the objective under")
  })

  test(`${page}: a stale server message is cleared on Back / edit, a live run is left alone`, () => {
    const box = { style: { display: "" }, innerHTML: '<div class="nt-stall">objective must be 10-4000 chars</div>', querySelector(s: string) { return s === ".nt-stall" && this.innerHTML.includes("nt-stall") ? {} : null } }
    const btn = { disabled: false, textContent: "Try again" }
    const els: Record<string, any> = { wizProgress: box, wizCreate: btn }
    const clear = new Function("document", `${extractFn(html, "function wizClearStaleResult(")}; return wizClearStaleResult`)({ getElementById: (id: string) => els[id] || null })
    clear()
    expect(box.innerHTML).toBe("")
    expect(box.style.display).toBe("none")
    expect(btn.textContent).toBe("Create & Run")
    box.innerHTML = '<div class="nt-live">AutoSim is recording your path…</div>'; box.style.display = ""
    clear()
    expect(box.innerHTML).toContain("recording") // a run in progress is never wiped
  })

  test(`${page}: Create & Run re-validates before sending, and Back clears the stale result`, () => {
    const create = html.slice(html.indexOf('getElementById("wizCreate").addEventListener("click"'))
    const beforeSend = create.slice(0, create.indexOf('btn.textContent = "Creating…"'))
    expect(beforeSend).toMatch(/for \(var vs = 1; vs <= 3; vs\+\+\)/)
    expect(beforeSend).toContain("wizValidate(vs)")
    const back = html.slice(html.indexOf('getElementById("wizBack").addEventListener("click"'))
    expect(back.slice(0, 300)).toContain("wizClearStaleResult()")
  })
}
