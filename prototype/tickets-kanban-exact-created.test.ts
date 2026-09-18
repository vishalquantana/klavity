// KD-160 — the "All Tickets" kanban swimlane cards showed only a relative age ("3 wks ago") with no
// way to see exactly when a ticket was created. Fixed by swapping the card's meta line to the exact
// "Created: 15 Sep 2026, 04:35 PM" format (also set as the element's title). These guards extract the
// SHIPPED `exactCreatedWhen` arrow from dashboard.html (same technique as dashboard-ago-recency.test.ts)
// and check the kanban card wiring actually uses it.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// Pull out `function exactCreatedWhen(ms) { ... }` from the shipped source and build a callable.
// The function constructs `new Date(...)` internally, so unlike loadAgo() we don't need to stub
// Date.now — we just pass a fixed ms timestamp straight through.
function loadExactCreatedWhen(): (ms: number) => string {
  const monthsI = HTML.indexOf("const _KD160_MONTHS =")
  if (monthsI < 0) throw new Error("_KD160_MONTHS definition not found")
  const monthsEnd = HTML.indexOf("\n", monthsI)
  const monthsDecl = HTML.slice(monthsI, monthsEnd)

  const i = HTML.indexOf("function exactCreatedWhen(ms)")
  if (i < 0) throw new Error("exactCreatedWhen definition not found")
  const j = HTML.indexOf("{", i)
  let depth = 0
  let end = -1
  for (let k = j; k < HTML.length; k++) {
    if (HTML[k] === "{") depth++
    else if (HTML[k] === "}") { depth--; if (depth === 0) { end = k; break } }
  }
  const body = HTML.slice(j, end + 1)
  const fn = new Function(`${monthsDecl}\nreturn function exactCreatedWhen(ms) ${body}`)
  return fn()
}

const exactCreatedWhen = loadExactCreatedWhen()

// Fixed local-time instants (constructed via the Date(y,m,d,h,min) local-time constructor, so the
// test is not timezone-dependent — exactCreatedWhen reads the same local getters).
const at = (y: number, m: number, d: number, h: number, min: number) => new Date(y, m - 1, d, h, min).getTime()

test("empty / falsy / invalid timestamp → empty string", () => {
  expect(exactCreatedWhen(0)).toBe("")
  expect(exactCreatedWhen(null as any)).toBe("")
  expect(exactCreatedWhen(NaN)).toBe("")
})

test("matches the ticket's literal example format: 'DD Mon YYYY, HH:MM AM/PM'", () => {
  // 15 Sep 2026, 04:35 PM — the exact example from the ticket's Expected Result.
  expect(exactCreatedWhen(at(2026, 9, 15, 16, 35))).toBe("15 Sep 2026, 04:35 PM")
})

test("day and hour are zero-padded to two digits", () => {
  expect(exactCreatedWhen(at(2026, 9, 5, 9, 7))).toBe("05 Sep 2026, 09:07 AM")
})

test("midnight is 12 AM, not 00", () => {
  expect(exactCreatedWhen(at(2026, 1, 1, 0, 0))).toBe("01 Jan 2026, 12:00 AM")
})

test("noon is 12 PM, not 00", () => {
  expect(exactCreatedWhen(at(2026, 1, 1, 12, 0))).toBe("01 Jan 2026, 12:00 PM")
})

test("hour 13 (1 PM) converts correctly to 12-hour clock", () => {
  expect(exactCreatedWhen(at(2026, 1, 1, 13, 0))).toBe("01 Jan 2026, 01:00 PM")
})

test("month name is unambiguous — never a bare zero-padded number", () => {
  const jan = exactCreatedWhen(at(2026, 1, 15, 10, 0))
  const dec = exactCreatedWhen(at(2026, 12, 15, 10, 0))
  expect(jan).toContain("Jan")
  expect(dec).toContain("Dec")
  expect(jan).not.toMatch(/\b01\b.*2026/) // not "01 2026" — must spell the month
})

test("format is locale-independent (manual construction, not toLocaleString)", () => {
  // A regression here would mean the format silently changed shape based on the CI/deploy locale.
  expect(HTML).not.toContain("toLocaleString(undefined")
  expect(HTML).toContain("_KD160_MONTHS")
})

test("kanban card meta line shows 'Created: <exact time>' instead of the relative ticketAgo(t)", () => {
  expect(HTML).toContain("const createdWhen = exactCreatedWhen(t.createdAt)")
  expect(HTML).toContain('createdWhen ? ("Created: " + createdWhen) : ""')
})

test("the card's title attribute mirrors the visible text (readable in full even if the line truncates)", () => {
  expect(HTML).toContain('<div class="kb-card-d" title="${esc(sub)}">${esc(sub)}</div>')
})

test("the fix is scoped to the kanban board — the List view still uses the relative ticketAgo(t)", () => {
  // makeTktListRow (List view row builder) must be untouched by this ticket.
  expect(HTML).toContain('const sub = [t.urlPath ? esc(t.urlPath) : "", ticketAgo(t)].filter(Boolean).join(" · ")')
})

test("ticketAgo() itself is unchanged — every other relative-time consumer keeps its behavior", () => {
  expect(HTML).toContain('function ticketAgo(t) {')
  expect(HTML).toContain('if (n && n >= 2 && t.lastSeenAt && t.lastSeenAt > (t.createdAt || 0)) return "reported " + ago(t.lastSeenAt)')
  expect(HTML).toContain("return ago(t.createdAt)")
})
