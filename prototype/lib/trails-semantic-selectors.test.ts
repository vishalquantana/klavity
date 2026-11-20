// Increment 1 / F11: role + accessible-name and scoped-text selector tiers for AutoSim authoring (docs/AUTOSIMS_ARCHITECTURE_AUDIT.md).
//
// Selectors are GENERATED the way production does it: through the Puppeteer adapter (acquireBrowser under Bun on Windows),
// i.e. the in-page stableSelectorBody. They are VERIFIED the way replay consumes them: in REAL Playwright (the engine behind
// resolveTarget's Tier 0, `page.locator(cachedSelector)`). Playwright cannot launch under Bun on Windows, so the verifier is a
// Node subprocess (lib/trails-pw-check.cjs). Local fixtures only - no QA2.
// Runs only with KLAV_E2E=1, like the other browser tests.
import { describe, test, expect, afterAll } from "bun:test"
import { spawnSync } from "node:child_process"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import * as bp from "./trails-browser-page"
import { generatePlaywright } from "./trails-codegen"

const RUN = !!process.env.KLAV_E2E
const HELPER = resolve(import.meta.dir, "trails-pw-check.cjs")

let bh: bp.BrowserHandle | null = null
afterAll(async () => { await bh?.close().catch(() => {}) })

const page_ = (body: string) => `<!doctype html><html><body>${body}</body></html>`

/** Generate the selector production would save for the element marked data-t=`t` in `html`. */
async function gen(html: string, t: string): Promise<string> {
  bh ??= await bp.acquireBrowser({ headless: true })
  const page: any = await bh.newPage({ width: 1280, height: 720 })
  await page.goto("data:text/html," + encodeURIComponent(html), 15_000)
  const sel = await page.stableSelector(`[data-t="${t}"]`)
  expect(sel).not.toBeNull()
  return sel as string
}

interface Check { html: string; selector: string }
interface Result { count: number; ts: string[]; tier0: { hit: boolean; t: string | null }; error: string | null }
/** Evaluate selectors in real Playwright (one Node process per call). */
function pw(checks: Check[]): Result[] {
  const r = spawnSync("node", [HELPER], { input: JSON.stringify({ checks }), encoding: "utf8", timeout: 90_000 })
  if (r.status !== 0) throw new Error(`pw-check failed: ${r.stderr || r.error}`)
  return JSON.parse(r.stdout)
}
/** The selector must resolve in Playwright to exactly the marked element, as a Tier-0 cache hit (no heal). */
function expectResolvesTo(res: Result, t: string, why = "") {
  expect({ why, error: res.error, count: res.count, ts: res.ts }).toEqual({ why, error: null, count: 1, ts: [t] })
  expect({ why, hit: res.tier0.hit, t: res.tier0.t }).toEqual({ why, hit: true, t })
}
const isPositional = (s: string): boolean => {
  const f = (bp as any).isPositionalSelector
  if (typeof f !== "function") throw new Error("isPositionalSelector is not exported from trails-browser-page yet")
  return f(s)
}
const ROLE_LINK = (name: string) => `role=link[name="${name}"s]`
const ROLE_BUTTON = (name: string) => `role=button[name="${name}"s]`

// ── fixtures ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// PX4-style sidebar: bare links, no id / aria-label / testid. `extraTop` adds a body-level overlay, `before` a new item, `wrap` a wrapper level.
const NAV = (o: { extraTop?: string; before?: string; wrap?: boolean } = {}) => {
  const list = `<ul><li><a href="/home">Home</a></li><li><a href="/projects">Projects</a></li>${o.before ?? ""}<li><a href="/done" data-t="done">Completed Actions</a></li><li><a href="/settings">Settings</a></li></ul>`
  return page_(`${o.extraTop ?? ""}<div><p>head</p></div>${o.wrap ? `<div class="w"><nav>${list}</nav></div>` : `<nav>${list}</nav>`}<div><p>foot</p></div>`)
}
const BUTTONS = page_(`<div class="bar"><button>Cancel</button><button data-t="complete">Complete</button></div><div class="bar2"><button>Back</button></div>`)
const ROW = (n: string, i: number) => `<tr><td>${n}</td><td>Active</td><td><div><button data-t="edit-${i}">Edit</button></div></td></tr>`
const ROWS = (names: string[]) => page_(`<table><tbody>${names.map((n, i) => ROW(n, i)).join("")}</tbody></table>`)

describe.skipIf(!RUN)("T1 link with visible text only", () => {
  test("gets role=link[name=…s], not a positional path, and resolves in Playwright", async () => {
    const sel = await gen(NAV(), "done")
    expect(sel).toBe(ROLE_LINK("Completed Actions"))
    expectResolvesTo(pw([{ html: NAV(), selector: sel }])[0], "done")
  })
})

describe.skipIf(!RUN)("T2 button with visible text only", () => {
  test("gets role=button[name=…s]", async () => {
    const sel = await gen(BUTTONS, "complete")
    expect(sel).toBe(ROLE_BUTTON("Complete"))
    expectResolvesTo(pw([{ html: BUTTONS, selector: sel }])[0], "complete")
  })
})

describe.skipIf(!RUN)("T3 row button with a repeated label", () => {
  test("every Edit button resolves to ITS OWN row, even when row texts overlap and rows are reordered", async () => {
    const names = ["Acme Inc", "Acme Industries", "Beta"]
    const html = ROWS(names)
    const sels = [await gen(html, "edit-0"), await gen(html, "edit-1"), await gen(html, "edit-2")]
    expect(new Set(sels).size).toBe(3)
    for (const s of sels) {
      expect(s).toContain(":has-text(")
      expect(s.endsWith(` >> ${ROLE_BUTTON("Edit")}`)).toBe(true)
      expect(isPositional(s)).toBe(false)
    }
    // same page, then a drifted page: rows reversed with a header row added in front (every nth-of-type shifts)
    const drift = page_(`<table><tbody><tr><th>Name</th><th>Status</th><th></th></tr>${[2, 1, 0].map((i) => ROW(names[i], i)).join("")}</tbody></table>`)
    const res = pw([...sels.map((s) => ({ html, selector: s })), ...sels.map((s) => ({ html: drift, selector: s }))])
    sels.forEach((_, i) => { expectResolvesTo(res[i], `edit-${i}`, "same page"); expectResolvesTo(res[i + 3], `edit-${i}`, "drifted page") })
  })
})

describe.skipIf(!RUN)("T4 same link text in different containers", () => {
  test("each 'Details' link resolves to its own card, not merely a unique-looking parent", async () => {
    const html = page_(`<article><h2>Billing</h2><p>Invoices and cards</p><a href="/b" data-t="bill">Details</a></article>` +
      `<article><h2>Shipping</h2><p>Addresses</p><a href="/s" data-t="ship">Details</a></article>`)
    const bill = await gen(html, "bill"), ship = await gen(html, "ship")
    expect(bill).not.toBe(ship)
    expect(bill).toContain(">>"); expect(ship).toContain(">>")
    const swapped = page_(`<div class="new"></div><article><h2>Shipping</h2><p>Addresses</p><a href="/s" data-t="ship">Details</a></article>` +
      `<article><h2>Billing</h2><p>Invoices and cards</p><a href="/b" data-t="bill">Details</a></article>`)
    const res = pw([{ html, selector: bill }, { html, selector: ship }, { html: swapped, selector: bill }, { html: swapped, selector: ship }])
    expectResolvesTo(res[0], "bill"); expectResolvesTo(res[1], "ship")
    expectResolvesTo(res[2], "bill", "swapped"); expectResolvesTo(res[3], "ship", "swapped")
  })
})

describe.skipIf(!RUN)("T5 hidden duplicates with the same accessible name", () => {
  test("display:none and aria-hidden twins do not make the selector ambiguous", async () => {
    const html = page_(`<nav><a href="/r" data-t="rep">Reports</a></nav><div style="display:none"><a href="/r2">Reports</a></div><a aria-hidden="true" tabindex="-1" href="/r3">Reports</a>`)
    const sel = await gen(html, "rep")
    expect(sel).toBe(ROLE_LINK("Reports"))
    expectResolvesTo(pw([{ html, selector: sel }])[0], "rep")
  })
})

describe.skipIf(!RUN)("T6 list where the target's position changes", () => {
  test("selector authored with the target 2nd still finds it after the list is reordered and extended", async () => {
    const v1 = page_(`<ul><li><a href="/a">Alpha</a></li><li><a href="/b" data-t="beta">Beta</a></li><li><a href="/g">Gamma</a></li></ul>`)
    const v2 = page_(`<ul><li><a href="/g">Gamma</a></li><li><a href="/a">Alpha</a></li><li><a href="/d">Delta</a></li><li><a href="/b" data-t="beta">Beta</a></li></ul>`)
    const sel = await gen(v1, "beta")
    expectResolvesTo(pw([{ html: v2, selector: sel }])[0], "beta", `reordered list, selector=${sel}`)
    expect(isPositional(sel)).toBe(false)
  })
})

describe.skipIf(!RUN)("T7 sidebar where a new item is inserted", () => {
  test("v17 case: Completed Actions keeps resolving after a new item, an overlay div and a wrapper level appear", async () => {
    const sel = await gen(NAV(), "done")
    const drifted = NAV({ extraTop: `<div class="overlay"></div>`, before: `<li><a href="/new">New thing</a></li>`, wrap: true })
    expectResolvesTo(pw([{ html: drifted, selector: sel }])[0], "done", `drifted sidebar, selector=${sel}`)
    expect(isPositional(sel)).toBe(false)
  })
})

describe.skipIf(!RUN)("T8 ambiguous semantics keep the positional fallback", () => {
  test("two identical unnamed blocks -> positional selector (marked as such) that still resolves to the target", async () => {
    const html = page_(`<div class="c"><a href="/1" data-t="m1">More</a></div><div class="c"><a href="/2" data-t="m2">More</a></div>`)
    const m1 = await gen(html, "m1"), m2 = await gen(html, "m2")
    for (const s of [m1, m2]) { expect(s.startsWith("role=")).toBe(false); expect(s).not.toContain(">>") }
    expect(m1).not.toBe(m2)
    const res = pw([{ html, selector: m1 }, { html, selector: m2 }])
    expectResolvesTo(res[0], "m1"); expectResolvesTo(res[1], "m2")
    for (const s of [m1, m2]) expect(isPositional(s)).toBe(true)
    // isPositionalSelector itself: semantic / attribute selectors are not positional
    expect(isPositional(ROLE_LINK("x"))).toBe(false)
    expect(isPositional(`#id`)).toBe(false)
    expect(isPositional(`a[name="x"]`)).toBe(false)
    expect(isPositional(`li:nth-of-type(3)>a:nth-of-type(1)`)).toBe(true)
    expect(isPositional(`ul>li:nth-child(2)>a`)).toBe(true)
  })
})

describe.skipIf(!RUN)("T9 replay resolver Tier 0 (cache hit, no heal)", () => {
  test("link, button and row-button selectors authored on page A are Tier-0 hits on a drifted page B", async () => {
    const link = await gen(NAV(), "done")
    const btn = await gen(BUTTONS, "complete")
    const rowHtml = ROWS(["Acme Inc", "Beta"])
    const row = await gen(rowHtml, "edit-1")
    const navB = NAV({ extraTop: `<div class="overlay"></div>`, before: `<li><a href="/new">New</a></li>`, wrap: true })
    const btnB = page_(`<div class="toast"></div><div class="bar"><button>Help</button><button>Cancel</button><button data-t="complete">Complete</button></div>`)
    const rowB = page_(`<table><tbody><tr><th>Name</th></tr>${ROW("Beta", 1)}${ROW("Acme Inc", 0)}</tbody></table>`)
    const res = pw([{ html: navB, selector: link }, { html: btnB, selector: btn }, { html: rowB, selector: row }])
    expectResolvesTo(res[0], "done", "link"); expectResolvesTo(res[1], "complete", "button"); expectResolvesTo(res[2], "edit-1", "row button")
    for (const s of [link, btn, row]) expect(isPositional(s)).toBe(false)
  })
})

describe.skipIf(!RUN)("T10 accessible-name accuracy (generated by the in-page matcher, judged by Playwright)", () => {
  // `role` = must be a role= selector; `other` = an existing attribute tier wins (not role=). EVERY case must resolve safely.
  const CASES: Array<{ name: string; html: string; expect: "role" | "other"; want?: string }> = [
    { name: "aria-labelledby", html: `<span id="lbl">Open invoices</span><a href="/i" data-t="x" aria-labelledby="lbl"><svg width="8" height="8"></svg></a><a href="/j">Other</a>`, expect: "role", want: ROLE_LINK("Open invoices") },
    { name: "aria-label (existing attribute tier wins)", html: `<a href="/p" aria-label="Projects" data-t="x">P</a><a href="/q">Q</a>`, expect: "other" },
    { name: "nested text across elements", html: `<a href="/n" data-t="x"><span>Completed</span> <b>Actions</b></a><a href="/m">Other</a>`, expect: "role", want: ROLE_LINK("Completed Actions") },
    { name: "whitespace normalisation", html: `<button data-t="x">\n   Save   \n   changes </button><button>Other</button>`, expect: "role", want: ROLE_BUTTON("Save changes") },
    { name: "aria-hidden icon + text", html: `<button data-t="x"><svg aria-hidden="true" width="8" height="8"></svg> Export</button><button>Other</button>`, expect: "role", want: ROLE_BUTTON("Export") },
    { name: "img alt as the name", html: `<a href="/h" data-t="x"><img src="data:," alt="Home page"></a><a href="/z">Other</a>`, expect: "role", want: ROLE_LINK("Home page") },
    { name: "input[type=submit] value (type not unique)", html: `<input type="submit" value="Send it" data-t="x"><input type="submit" value="Cancel">`, expect: "role", want: ROLE_BUTTON("Send it") },
    { name: "title only", html: `<button title="Delete row" data-t="x"><svg aria-hidden="true" width="8" height="8"></svg></button><button>Other</button>`, expect: "role", want: ROLE_BUTTON("Delete row") },
    { name: "hidden child text is not part of the name", html: `<a href="/x" data-t="x">Reports<span style="display:none"> (hidden suffix)</span></a><a href="/y">Other</a>`, expect: "role", want: ROLE_LINK("Reports") },
    { name: "aria-hidden text inside is not part of the name", html: `<a href="/x" data-t="x">Price: <span aria-hidden="true">$</span>5</a><a href="/y">Other</a>`, expect: "role", want: ROLE_LINK("Price: 5") },
    { name: "quotes and backslash need escaping", html: `<button data-t="x">Say "hi" \\ there</button><button>Other</button>`, expect: "role" },
    { name: "role=button on a div", html: `<div role="button" data-t="x">Open menu</div><div role="button">Other menu</div>`, expect: "role", want: ROLE_BUTTON("Open menu") },
  ]
  // One test per case (so each reports on its own); all cases are generated and judged in a single Playwright process.
  let batch: Promise<{ sels: string[]; res: Result[] }> | null = null
  const run = () => (batch ??= (async () => {
    const sels: string[] = []
    for (const c of CASES) sels.push(await gen(page_(c.html), "x"))
    return { sels, res: pw(CASES.map((c, i) => ({ html: page_(c.html), selector: sels[i] }))) }
  })())
  CASES.forEach((c, i) => test(c.name, async () => {
    const { sels, res } = await run()
    expectResolvesTo(res[i], "x", `${c.name}; selector=${sels[i]}`)           // SAFETY: never a wrong or ambiguous match
    expect({ sel: sels[i], isRole: sels[i].startsWith("role=") }).toEqual({ sel: sels[i], isRole: c.expect === "role" })
    if (c.want) expect(sels[i]).toBe(c.want)
  }))
})

describe.skipIf(!RUN)("T11 code export", () => {
  test("generatePlaywright emits a syntactically valid page.click for a generated role/scoped selector", async () => {
    const link = await gen(NAV(), "done")
    const row = await gen(ROWS(["Acme Inc", "Beta"]), "edit-1")
    expect(link.startsWith("role=")).toBe(true)
    expect(row).toContain(">>")
    const trail: any = { id: "t1", name: "x", baseUrl: "http://localhost/", intent: "" }
    const step = (id: string, idx: number): any => ({ id, idx, action: "click", actionValue: null, target: null, checkpoint: null })
    const code = generatePlaywright(trail, [step("s1", 1), step("s2", 2)], { s1: link, s2: row })
    const q = (v: string) => "'" + v.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'"
    expect(code).toContain(`page.click(${q(link)})`)
    expect(code).toContain(`page.click(${q(row)})`)
    const f = join(mkdtempSync(join(tmpdir(), "klav-codegen-")), "export.mjs")
    writeFileSync(f, code)
    const chk = spawnSync("node", ["--check", f], { encoding: "utf8" })
    expect({ status: chk.status, err: chk.stderr }).toEqual({ status: 0, err: "" })
  })
})

// ── T12: large-page safeguard for the scoped-text tier ────────────────────────────────────────────────────────────────
// The scoped tier's cost grows with rows x labels (8.9 s at 10,000 rows, near the author's 8-10 s stableSelector bound). When the page has
// >= SCOPED_TIER_MAX_CANDIDATES (3,000) interactive candidates of the target's role, the scoped tier is skipped and the existing positional
// path is used. The role + accessible-name tier is NOT capped (2.3 s at 10,000 unique links).
// Each row holds exactly one "Edit" button, so the number of button candidates == the number of rows.
const BIG = (rows: number, extra = "") => page_(`<table><tbody>${Array.from({ length: rows }, (_, i) =>
  `<tr><td>Row ${i}</td><td>Active</td><td><button${i === rows - 1 ? ' data-t="last"' : ""}>Edit</button></td></tr>`).join("")}${extra}</tbody></table>`)

describe.skipIf(!RUN)("T12 large-page safeguard (scoped tier)", () => {
  test("below the threshold (2,999 candidates) the scoped tier is still attempted and resolves to the right row", async () => {
    const html = BIG(2_999)
    const sel = await gen(html, "last")
    expect(sel).toBe(`tr:has-text("Row 2998") >> ${ROLE_BUTTON("Edit")}`)
    expectResolvesTo(pw([{ html, selector: sel }])[0], "last")
  })

  test("at the threshold (3,000) the scoped tier is skipped; the positional fallback still resolves to the target", async () => {
    const html = BIG(3_000)
    const sel = await gen(html, "last")
    expect(sel).not.toContain(":has-text(")
    expect(sel).not.toContain(">>")
    expect(isPositional(sel)).toBe(true)
    expectResolvesTo(pw([{ html, selector: sel }])[0], "last")
  })

  test("above the threshold (3,500) the scoped tier is skipped; the fallback is the positional path, not a fingerprint domPath", async () => {
    const html = BIG(3_500)
    const sel = await gen(html, "last")
    expect(sel).not.toContain(":has-text(")
    expect(isPositional(sel)).toBe(true)
    // the same selector the pre-existing code produced: shortest unique positional suffix that matches exactly this element
    expect(sel.startsWith("tr:nth-of-type(3500)>")).toBe(true)
    expectResolvesTo(pw([{ html, selector: sel }])[0], "last")
  })

  test("the role + accessible-name tier is preserved on a large page when the name is unique", async () => {
    const html = BIG(3_500, `<tr><td>Special</td><td></td><td><button data-t="special">Archive everything</button></td></tr>`)
    const sel = await gen(html, "special")
    expect(sel).toBe(ROLE_BUTTON("Archive everything"))
    expectResolvesTo(pw([{ html, selector: sel }])[0], "special")
  })
})
