// Guard tests for the ticket-detail lane (feat/ticket-panel-md):
//   #733 — the slide-over PANEL must never overflow horizontally: the cockpit's FIXED 480/280 3-col grid
//          is PAGE-ONLY, the panel stacks + hides overflow-x.
//   #734 — the description read view renders WhatsApp/markdown-lite (*bold* _italic_ `code`) — XSS-safe.
//   #735 — the "#<seq>" ticket-key pill (.tkt-page-key / .tkt-seq) copies the clean /t/<id> permalink.
//   #736 — opening the dedicated full page pushes a clean /t/<id> URL (not the #tickets/<id> hash) with
//          board-URL restore on close + a popstate handler (Back/Forward stay honest).
//   #737 — the cockpit middle column (.t3-mid) has a tight vertical rhythm (no sprawling empty gaps).
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

const esc = (s: any) => String(s == null ? "" : s).replace(/[&<>"]/g, c => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]))
const kicon = () => "<svg></svg>"

// ── #733: panel has no fixed-480 grid; page does; panel is overflow-safe ────────────────────────────
test("#733: the FIXED 480/280 cockpit grid is scoped to the dedicated PAGE, never the panel", () => {
  // page keeps the fixed 3-col grid…
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-cols{display:grid;grid-template-columns:var(--t3c1,480px) 8px minmax(0,1fr) 8px var(--t3c3,280px)}")
  // …and the fixed-column grid is declared EXACTLY ONCE (the page-scoped rule) — there is no second,
  // unscoped `.t3-cols{...480px...}` rule that could leak into the panel and overflow it.
  const fixedGridDecls = HTML.split("display:grid;grid-template-columns:var(--t3c1,480px)").length - 1
  expect(fixedGridDecls).toBe(1)
})

test("#733: the panel stacks .t3-cols and clamps overflow so nothing is left-clipped", () => {
  // belt-and-suspenders: even if a .t3-cols ever renders in the panel it becomes a single stacked column
  expect(HTML).toContain("#ticketSingle.tkt-panel .t3-cols{display:block}")
  expect(HTML).toContain("#ticketSingle.tkt-panel .t3-gutter{display:none}")
  // the panel container hides horizontal overflow…
  expect(HTML).toContain("overflow-y:auto;overflow-x:hidden")
  // …and its columns/children may shrink (min-width:0) so a fixed px column / long URL can't push scroll
  expect(HTML).toContain("#ticketSingle.tkt-panel .t3-col,#ticketSingle.tkt-panel .t3-mid,#ticketSingle.tkt-panel .t3-cols{min-width:0;max-width:100%}")
})

test("#733: the render only emits the 3-col grid in NON-panel mode (page)", () => {
  const fn = extractFn(HTML, "function buildTktDetail(t, admin, onChange, isSingle = false)")
  expect(fn).toContain('const _pageThreeCol = isSingle && (typeof _tktSingleMode !== "undefined" && _tktSingleMode !== "panel")')
  expect(fn).toContain('if (_pageThreeCol) {')
})

// ── #734: markdown-lite render (bold/italic/code) + XSS-safe ─────────────────────────────────────────
const bundle = extractFn(HTML, "function smartLinkLabel(") + "\n" + extractFn(HTML, "function fmtInlineMd(") + "\n" + extractFn(HTML, "function linkifyDescription(")
const { linkifyDescription, fmtInlineMd } = new Function("esc", "kicon", bundle + "\nreturn { linkifyDescription, fmtInlineMd }")(esc, kicon) as {
  linkifyDescription: (s: string) => string
  fmtInlineMd: (s: string) => string
}

test("#734: *bold* → <strong>, _italic_ → <em>, `code` → <code>", () => {
  expect(fmtInlineMd(esc("*Actual:* it broke"))).toBe("<strong>Actual:</strong> it broke")
  expect(fmtInlineMd(esc("this is _italic_ here"))).toBe("this is <em>italic</em> here")
  expect(fmtInlineMd(esc("run `bun test` now"))).toBe("run <code>bun test</code> now")
  // realistic Enhance-draft line
  const out = linkifyDescription("[bug] *Severity: C2* — see it")
  expect(out).toContain("<strong>Severity: C2</strong>")
  expect(out).toContain("[bug]")
})

test("#734: formatting is applied ALONGSIDE the #717 smart-links", () => {
  const out = linkifyDescription("*open* https://acme.example.com/x now")
  expect(out).toContain("<strong>open</strong>")
  expect(out).toContain('class="tkt-smartlink"')
  expect(out).toContain(">acme.example.com<")
})

test("#734: XSS — an escaped <script>/<img onerror> inside *…* never executes (stays escaped)", () => {
  const a = linkifyDescription("*<script>alert(1)</script>*")
  expect(a).not.toContain("<script>")
  expect(a).toContain("&lt;script&gt;")
  expect(a).toContain("<strong>")   // the delimiters still format, but only the ESCAPED text
  const b = linkifyDescription('`<img src=x onerror="alert(1)">`')
  expect(b).not.toContain("<img")
  expect(b).toContain("&lt;img")
  expect(b).not.toContain('onerror="alert')
  expect(b).toContain("<code>")
})

test("#734: no raw-HTML passthrough — a literal tag in the text is escaped even without delimiters", () => {
  const out = linkifyDescription("<b>hi</b>")
  expect(out).not.toContain("<b>hi</b>")
  expect(out).toContain("&lt;b&gt;hi&lt;/b&gt;")
})

test("#734: description read view uses linkifyDescription (formatted); EDIT mode shows RAW observation", () => {
  const desc = extractFn(HTML, "function descriptionBlockHtml(text)")
  expect(desc).toContain("linkifyDescription(raw)")   // read view = formatted
  const build = extractFn(HTML, "function buildTktDetail(t, admin, onChange, isSingle = false)")
  // the inline editor loads the RAW observation into the textarea (asterisks preserved, not the HTML)…
  expect(build).toContain('const cur = t.observation != null ? String(t.observation) : ""')
  expect(build).toContain("ta.value = cur")
  // …and on save re-renders the formatted read view from the new raw text.
  expect(build).toContain("renderDescObs(obsEl, next)")
  // clicking a smart-link does NOT hijack into edit mode (link opens; text still edits)
  expect(build).toContain('if (ev.target.closest("a.tkt-smartlink")) return')
})

// ── #735: the #<seq> key pill copies the clean /t/<id> permalink ─────────────────────────────────────
test("#735: wireTktKeyCopy copies the pretty ticket permalink from the key pill (#745)", () => {
  const fn = extractFn(HTML, "function wireTktKeyCopy(el, id)")
  // #745: the key pill now copies the Jira-clean /<slug>/<KEY>-<n> permalink (prettyTicketUrlById),
  // which falls back to the fast /t/<id> route when the workspace slug/key isn't backfilled.
  expect(fn).toContain("copyText(prettyTicketUrlById(id))")
  expect(fn).toContain('el.setAttribute("title", "Copy ticket link")')
  expect(fn).toContain('el.classList.add("tkt-key-copy")')
  expect(fn).toContain('el.addEventListener("click", doCopy)')
  // the opaque fallback /t/<id> route is still the base of prettyTicketUrl
  const url = extractFn(HTML, "function ticketPageUrl(id)")
  expect(url).toContain('"/t/" + encodeURIComponent(String(id))')
  // wired on the page header pill AND the panel/cockpit title pill
  expect(HTML).toContain('wireTktKeyCopy(ph.querySelector(".tkt-page-key"), id)')
  expect(HTML).toContain('wireTktKeyCopy(head.querySelector(".tkt-seq"), t.id)')
  // and it's visibly interactive
  expect(HTML).toContain(".tkt-key-copy{cursor:pointer")
})

// ── #736: clean /t/<id> URL on dedicated-page open + restore/popstate ───────────────────────────────
test("#736/#745: opening the dedicated page pushes the pretty /<slug>/<KEY>-<n> URL (opaque /t/<id> fallback)", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  // #745: the pushed clean path is the Jira-clean pretty form when the ticket carries slug+key+seq,
  // else the opaque /t/<id> fallback — history.state still carries { tkt: id } so popstate re-opens it.
  expect(fn).toContain('const cleanPath = prettyTicketPathFor(tktById(id)) || ("/t/" + encodeURIComponent(String(id)))')
  expect(fn).toContain('history.pushState({ tkt: String(id) }, "", location.origin + cleanPath)')
  // a re-render for the SAME id replaces (no new history entry)
  expect(fn).toContain('history.replaceState({ tkt: String(id) }, "", location.origin + cleanPath)')
  // the old page-mode hash write (#tickets/<id>) is gone
  expect(fn).not.toContain('const target = "tickets/" + encodeURIComponent(String(id))')
})

test("#736/#745: close restores the board URL; popstate re-opens via history.state (pretty-path safe)", () => {
  const close = extractFn(HTML, "function closeSingleTicket()")
  // #745: gate the board-URL restore on the stored return URL (set for the dedicated page), not a
  // /^\/t\// path regex — which wouldn't recognise the pretty /<slug>/<KEY>-<n> form.
  expect(close).toContain("if (_tktBoardReturnUrl)")
  expect(close).toContain('history.replaceState(null, "", _tktBoardReturnUrl)')
  // the legacy hash cleanup path is still present (guarded elsewhere)
  expect(close).toContain('u.hash = "tickets"')
  const pop = extractFn(HTML, "function ensureTktCleanUrlPopstate()")
  expect(pop).toContain('window.addEventListener("popstate"')
  // #745: prefer history.state.tkt (works even when the bar shows the pretty path), then the /t/<id> regex.
  expect(pop).toContain("(ev && ev.state && ev.state.tkt) ? String(ev.state.tkt) : null")
  expect(pop).toContain("/^\\/t\\/([^/?#]+)\\/?$/")
  expect(pop).toContain('openSingleTicket(stateId, "full")')
  expect(pop).toContain('openSingleTicket(decodeURIComponent(m[1]), "full")')
  expect(pop).toContain('closeSingleTicket()')
  expect(HTML).toContain("ensureTktCleanUrlPopstate()")
})

test("#736: existing deep-link entry points are preserved (?ticket= and #tickets/<id>)", () => {
  const fn = extractFn(HTML, "function maybeOpenDeepLinkTicket()")
  expect(fn).toContain('new URLSearchParams(location.search).get("ticket")')
  expect(fn).toContain('_hm = (location.hash || "").match(/^#?tickets\\/(.+)$/)')
  expect(fn).toContain('openSingleTicket(ticketId, "full")')
  // boot hash router still recognizes #tickets/<id>
  expect(HTML).toContain("var deepTkt=init.match(/^tickets\\/(.+)$/);")
})

// ── #737: tight middle-column rhythm ────────────────────────────────────────────────────────────────
test("#737: the cockpit middle column has a compact vertical rhythm (trimmed gaps + hr margins)", () => {
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-mid{display:flex;flex-direction:column;gap:13px}")
  expect(HTML).toContain(".t3-desctools{display:flex;gap:9px;flex-wrap:wrap;margin:2px 0 0}")
  expect(HTML).toContain(".t3-hr{border:0;border-top:1px solid var(--line);margin:6px 0 6px}")
  // the old sprawling values are gone
  expect(HTML).not.toContain("#ticketSingle.tkt-page .t3-mid{display:flex;flex-direction:column;gap:20px}")
  expect(HTML).not.toContain(".t3-hr{border:0;border-top:1px solid var(--line);margin:20px 0 14px}")
})
