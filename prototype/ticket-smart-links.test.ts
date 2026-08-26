// #717: smart links in the ticket description. The description auto-linkifies http(s) URLs and emails
// into compact chips whose label is JUST the hostname (domain-only, as short as possible). This must be
// XSS-safe: raw text is escaped FIRST, hrefs are restricted to http/https/mailto, and a javascript: or
// <img onerror> paste can never become an executable/clickable chip.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

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

// Real esc() from dashboard.html (escapes & < > "), and a stub kicon.
const esc = (s: any) => String(s == null ? "" : s).replace(/[&<>"]/g, c => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]))
const kicon = () => "<svg></svg>"

const bundle = extractFn(HTML, "function smartLinkLabel(") + "\n" + extractFn(HTML, "function linkifyDescription(")
const { smartLinkLabel, linkifyDescription } = new Function("esc", "kicon", bundle + "\nreturn { smartLinkLabel, linkifyDescription }")(esc, kicon) as {
  smartLinkLabel: (u: string) => string
  linkifyDescription: (s: string) => string
}

test("smartLinkLabel returns just the hostname (domain-only, no path/query)", () => {
  expect(smartLinkLabel("https://charantraqa.quantana.top/admin/investees/2a6c856f-de8d-4163-88ea-1a756e88ae96")).toBe("charantraqa.quantana.top")
  expect(smartLinkLabel("https://sub.example.com/a/b?c=d#e")).toBe("sub.example.com")
})

test("smartLinkLabel strips a leading www.", () => {
  expect(smartLinkLabel("https://www.example.com/path")).toBe("example.com")
  // hostnames are case-insensitive; the URL parser normalizes to lower-case (still domain-only)
  expect(smartLinkLabel("http://WWW.Example.COM")).toBe("example.com")
})

test("smartLinkLabel is total — unparsable input falls back to the raw string", () => {
  expect(smartLinkLabel("not a url")).toBe("not a url")
})

test("linkify makes a URL clickable with a domain-only label + full URL in title/href", () => {
  const url = "https://charantraqa.quantana.top/admin/investees/2a6c856f-de8d-4163-88ea-1a756e88ae96"
  const out = linkifyDescription("see " + url + " thanks")
  expect(out).toContain('class="tkt-smartlink"')
  expect(out).toContain('href="' + url + '"')
  expect(out).toContain('title="' + url + '"')
  expect(out).toContain('target="_blank"')
  expect(out).toContain('rel="noopener noreferrer"')
  // chip label is the bare hostname
  expect(out).toContain(">charantraqa.quantana.top<")
  // the full path is NOT shown as the label text (domain-only)
  expect(out).not.toContain(">" + url + "<")
})

test("linkify turns emails into a mailto chip", () => {
  const out = linkifyDescription("ping vamsi.g@quantana.com.au ok")
  expect(out).toContain('href="mailto:vamsi.g@quantana.com.au"')
  expect(out).toContain('class="tkt-smartlink mail"')
  expect(out).toContain(">vamsi.g@quantana.com.au<")
})

test("XSS: a javascript: paste never becomes a clickable chip", () => {
  const out = linkifyDescription("click javascript:alert(document.cookie) now")
  expect(out).not.toContain("<a ")
  expect(out).not.toContain('href="javascript:')
  // it survives as escaped plain text
  expect(out).toContain("javascript:alert(document.cookie)")
})

test("XSS: HTML in the description is escaped, never injected", () => {
  const out = linkifyDescription('<img src=x onerror="alert(1)">')
  expect(out).not.toContain("<img")
  expect(out).toContain("&lt;img")
  // no executable attribute leaks through
  expect(out).not.toContain("onerror=\"alert")
})

test("XSS: a data: URL is not linkified", () => {
  const out = linkifyDescription("data:text/html,<script>alert(1)</script>")
  expect(out).not.toContain('href="data:')
  expect(out).toContain("data:text/html")
  expect(out).not.toContain("<script>")
})
