// KLA-833 (issue #3) — the dashboard `ago()` relative-time helper must be UNAMBIGUOUS and CONSISTENT.
// The old version emitted "3m ago" for three MINUTES (reporters read it as three MONTHS) and had no
// months unit at all — it jumped straight from "29d ago" to a bare locale date. These guards extract
// the SHIPPED `ago` arrow from dashboard.html and evaluate it against a fixed "now".
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// Pull out `const ago = (ts) => { ... }` from the shipped source and build a callable with a stub Date.
function loadAgo(nowMs: number): (ts: number) => string {
  const i = HTML.indexOf("const ago = (ts) =>")
  if (i < 0) throw new Error("ago definition not found")
  let j = HTML.indexOf("{", i)
  let depth = 0
  let end = -1
  for (let k = j; k < HTML.length; k++) {
    if (HTML[k] === "{") depth++
    else if (HTML[k] === "}") { depth--; if (depth === 0) { end = k; break } }
  }
  const body = HTML.slice(j, end + 1)
  const fn = new Function("Date", `return (ts) => ${body}`)
  return fn({ now: () => nowMs })
}

const NOW = 1_700_000_000_000
const ago = loadAgo(NOW)
const mins = (n: number) => NOW - n * 60_000
const hrs = (n: number) => NOW - n * 3_600_000
const days = (n: number) => NOW - n * 86_400_000

test("empty / falsy timestamp → empty string", () => {
  expect(ago(0)).toBe("")
  expect(ago(null as any)).toBe("")
})

test("sub-minute reads 'just now'", () => {
  expect(ago(NOW - 5_000)).toBe("just now")
  expect(ago(NOW)).toBe("just now")
})

test("minutes use 'min' (never a bare 'm' that reads as months)", () => {
  expect(ago(mins(3))).toBe("3 min ago")
  expect(ago(mins(59))).toBe("59 min ago")
  // The minutes label must NOT collapse to the months-style "Nm"/"Nmo".
  expect(ago(mins(3))).not.toBe("3m ago")
  expect(ago(mins(3))).not.toContain("mo ago")
})

test("hours, days, weeks each have a distinct spelled unit", () => {
  expect(ago(hrs(2))).toBe("2 hrs ago")
  expect(ago(hrs(1))).toBe("1 hr ago")
  expect(ago(days(1))).toBe("1 day ago")
  expect(ago(days(3))).toBe("3 days ago")
  expect(ago(days(14))).toBe("2 wks ago")
})

test("months and years are relative + clearly distinct from minutes", () => {
  const threeMonths = ago(days(95))
  expect(threeMonths).toBe("3 mos ago")
  // Disambiguation is the whole point: three months must not look like three minutes.
  expect(threeMonths).not.toBe(ago(mins(3)))
  expect(ago(days(30))).toBe("1 mo ago")
  expect(ago(days(400))).toBe("1 yr ago")
  expect(ago(days(800))).toBe("2 yrs ago")
})

test("no longer falls back to a raw locale date for old timestamps", () => {
  const old = ago(days(200))
  expect(old).toContain("ago")          // stays relative
  expect(old).not.toMatch(/\d{4}/)       // not a "…/…/2023" locale date
})
