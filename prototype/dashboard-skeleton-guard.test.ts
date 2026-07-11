// Regression guard for the stuck-skeleton fix (v0.39.114, commit cfbfa1c).
//
// The Manager repeatedly reported dashboard stat numbers "never loading" — a section left
// shimmering on its loading skeleton forever when its data didn't arrive. It regressed once.
// The fix centralized the fallback so NO section can hang on a skeleton:
//   • swrSection(...).finally — for independent-fetch sections, always replaces a leftover `.sk`
//     in the section host with a terminal "Couldn't load" state (success/throw/empty/cold-miss).
//   • SKELETON_HOSTS + clearStuckSkeletons — the central safety net listing every skeleton host,
//     invoked on the cold-error path in load() (the exact "stats never load" scenario).
//
// This test pins the REAL shipped helpers (extracted from dashboard.html, not re-implemented) and
// proves: every failure path reaches a terminal state, and no markup skeleton host bypasses the
// central list. Deterministic — no DOM, no network.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// ── Extract the actual shipped source units (anchored, brace-matched) ─────────
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
const skeletonHostsSrc = (HTML.match(/const SKELETON_HOSTS = \[[^\]]*\]/) || [])[0]
const swrSectionSrc = extractFn(HTML, "async function swrSection(")
const clearStuckSrc = extractFn(HTML, "function clearStuckSkeletons(")
const renderSimsFeedSrc = extractFn(HTML, "function renderSimsFeed(")
const renderSayingSrc = extractFn(HTML, "function renderSaying(")
const buildTktDetailSrc = extractFn(HTML, "function buildTktDetail(")
const openSingleTicketSrc = extractFn(HTML, "function openSingleTicket(")

expect(skeletonHostsSrc).toBeTruthy()

// ── Build a sandbox with the helpers' collaborators stubbed ───────────────────
const EMPTY_PREFIX = "EMPTY:" // emptyState() stub marker — a non-skeleton terminal state
function buildSandbox(getEl: (id: string) => any) {
  const stubEmptyState = (_i: string, msg: string) => EMPTY_PREFIX + msg
  const stubKbar = { start() {}, done() {} }
  const factory = new Function(
    "$", "emptyState", "swrRead", "swrWrite", "kbar",
    `${skeletonHostsSrc}\n${swrSectionSrc}\n${clearStuckSrc}\n` +
      "return { swrSection, clearStuckSkeletons, SKELETON_HOSTS };",
  )
  return factory(getEl, stubEmptyState, () => null /*swrRead: no cache*/, () => {} /*swrWrite*/, stubKbar)
}

// Minimal fake section host: models whether a `.sk` skeleton is still present.
function fakeHost(opts: { sk: boolean; num?: boolean }) {
  return {
    innerHTML: "",
    textContent: "",
    _sk: opts.sk,
    querySelector(sel: string) {
      if (sel === ".sk") return this._sk ? {} : null
      if (sel === ".sk-num") return this._sk && opts.num ? {} : null
      return null
    },
  }
}

// =============================================================================
// 1 · swrSection ALWAYS reaches a terminal state — never leaves a skeleton
// =============================================================================
test("swrSection: a throwing fetch resolves the skeleton to a terminal state", async () => {
  const { swrSection } = buildSandbox(() => null)
  const host = fakeHost({ sk: true })
  await swrSection("k", async () => { throw new Error("network down") }, () => {}, host)
  // The leftover skeleton must be replaced by a terminal "couldn't load" state.
  expect(host.innerHTML.startsWith(EMPTY_PREFIX)).toBe(true)
  expect(host.innerHTML.toLowerCase()).toContain("couldn't load")
})

test("swrSection: an empty (null) payload resolves the skeleton to a terminal state", async () => {
  const { swrSection } = buildSandbox(() => null)
  const host = fakeHost({ sk: true })
  await swrSection("k", async () => null, () => {}, host)
  expect(host.innerHTML.startsWith(EMPTY_PREFIX)).toBe(true)
})

test("swrSection: an apply that throws still resolves the skeleton (never hangs)", async () => {
  const { swrSection } = buildSandbox(() => null)
  const host = fakeHost({ sk: true })
  await swrSection("k", async () => ({ ok: 1 }), () => { throw new Error("render bug") }, host)
  expect(host.innerHTML.startsWith(EMPTY_PREFIX)).toBe(true)
})

test("swrSection: success paints data and does NOT overwrite with the fallback", async () => {
  const { swrSection } = buildSandbox(() => null)
  const host = fakeHost({ sk: true })
  await swrSection("k", async () => ({ ok: 1 }), (d) => { host._sk = false; host.innerHTML = "DATA:" + JSON.stringify(d) }, host)
  expect(host.innerHTML).toBe('DATA:{"ok":1}')
  expect(host.innerHTML.startsWith(EMPTY_PREFIX)).toBe(false)
})

test("swrSection: resolves the host even when passed by id (string)", async () => {
  const host = fakeHost({ sk: true })
  const { swrSection } = buildSandbox((id) => (id === "triageList" ? host : null))
  await swrSection("k", async () => { throw new Error("x") }, () => {}, "triageList")
  expect(host.innerHTML.startsWith(EMPTY_PREFIX)).toBe(true)
})

// =============================================================================
// 2 · clearStuckSkeletons (the central safety net) resolves EVERY leftover host
// =============================================================================
test("clearStuckSkeletons: stat tiles → dash, list feeds → empty state, never a skeleton", () => {
  const els: Record<string, any> = {}
  // Build a fake element for every host the code knows about, all still skeleton-stuck.
  const hosts = (HTML.match(/const SKELETON_HOSTS = \[([^\]]*)\]/)![1].match(/"([^"]+)"/g) || []).map(s => s.replace(/"/g, ""))
  // stat tiles carry a .sk-num (resolve to "—"); the rest are list/feed hosts (resolve to empty state)
  const statTiles = new Set(["stFeedback", "stSims", "stTeam", "stTickets"])
  for (const id of hosts) els[id] = fakeHost({ sk: true, num: statTiles.has(id) })
  const { clearStuckSkeletons } = buildSandbox((id) => els[id] ?? null)
  clearStuckSkeletons()
  for (const id of hosts) {
    const el = els[id]
    if (statTiles.has(id)) expect(el.textContent).toBe("—")
    else expect(el.innerHTML.startsWith(EMPTY_PREFIX)).toBe(true)
  }
})

test("clearStuckSkeletons: leaves a host that already rendered (no .sk) untouched", () => {
  const painted = { ...fakeHost({ sk: false }), innerHTML: "REAL DATA", textContent: "123" }
  const { clearStuckSkeletons } = buildSandbox((id) => (id === "stFeedback" ? painted : null))
  clearStuckSkeletons()
  expect(painted.innerHTML).toBe("REAL DATA")
  expect(painted.textContent).toBe("123")
})

// =============================================================================
// 3 · No section bypasses the fallback: every markup skeleton host is centralized
// =============================================================================
test("every skeleton host in the markup is listed in SKELETON_HOSTS", () => {
  const listed = new Set((skeletonHostsSrc.match(/"([^"]+)"/g) || []).map(s => s.replace(/"/g, "")))
  // Find each element whose FIRST child is a loading skeleton (id="X"…><…class="sk…) in the markup.
  const found = new Set<string>()
  const re = /<[^>]*\bid="([A-Za-z0-9_-]+)"[^>]*>\s*<[^>]*\bclass="sk[ "]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(HTML))) found.add(m[1])
  expect(found.size).toBeGreaterThan(0) // sanity: we actually located skeleton hosts
  const missing = [...found].filter(id => !listed.has(id))
  expect(missing).toEqual([]) // a new skeleton section must be added to SKELETON_HOSTS
})

// =============================================================================
// 4 · The cold-error path actually invokes the safety net (the Manager's case)
// =============================================================================
test("load()'s failed-fetch / cold-miss branch calls clearStuckSkeletons", () => {
  // On (no cached state + failed dashboard fetch) render() never runs, so the safety net MUST fire.
  const loadSrc = extractFn(HTML, "async function load(")
  const errBranch = loadSrc.slice(loadSrc.indexOf("if (!data || data.error)"))
  expect(errBranch).toContain("clearStuckSkeletons(")
})

// swrSection's own guarantee must keep living in its finally block (don't let a refactor drop it).
test("swrSection keeps the skeleton-clearing guarantee in a finally block", () => {
  expect(swrSectionSrc).toContain("finally")
  expect(swrSectionSrc).toMatch(/querySelector\(["']\.sk["']\)/)
  expect(swrSectionSrc).toContain("emptyState(")
})

test("sidebar view switcher dedupes nav buttons and exposes the inline setView API", () => {
  expect(HTML).toContain("function normalizeSidebar()")
  expect(HTML).toContain("if(!key||seen[key]){b.remove();return;}")
  expect(HTML).toContain("side.dataset.navBound='1'")
  expect(HTML).toContain("window.setView=setView")
})

test("project picker lives in the top navbar, not the sidebar", () => {
  const barStart = HTML.indexOf('<div class="bar"><div class="bar-in">')
  const wrapStart = HTML.indexOf('<div class="wrap">')
  const sideStart = HTML.indexOf('<aside class="side"')
  const pickerStart = HTML.indexOf('id="projSwitcher"')
  expect(barStart).toBeGreaterThan(-1)
  expect(wrapStart).toBeGreaterThan(barStart)
  expect(sideStart).toBeGreaterThan(wrapStart)
  expect(pickerStart).toBeGreaterThan(barStart)
  expect(pickerStart).toBeLessThan(wrapStart)
  const sideMarkup = HTML.slice(sideStart, HTML.indexOf('<div class="content">', sideStart))
  expect(sideMarkup).not.toContain('id="projSwitcher"')
  expect(HTML).not.toContain(".side .proj-pick")
})

test("overview cards use per-card View all links without a Focus/Full control", () => {
  expect(HTML).not.toContain("Focus mode")
  expect(HTML).not.toContain("Focus/Full")
  expect(HTML).not.toContain("Focus ⇄ Full")
  expect(HTML).not.toContain("Full</button>")
  expect(HTML).toContain('onclick="setView(\'sims\')" aria-label="View all Sims and their feedback"')
  expect(HTML).toContain('onclick="setView(\'tickets\')" aria-label="View all tickets"')
  expect(HTML).toContain('onclick="setView(\'triage\')" style="margin-left:auto" aria-label="View all feedback and activity"')
  expect(HTML).toContain('onclick="setView(\'sims\')" style="margin-left:auto" aria-label="View all Sims feedback"')
  expect(HTML).toContain("const shown = acts.slice(0, FEED_VISIBLE)")
})

test("single-ticket view keeps title/source in the header and operational details in the panel", () => {
  const renderHeadStart = openSingleTicketSrc.indexOf("const renderHead = () =>")
  const detailStart = openSingleTicketSrc.indexOf("const detailEl = buildTktDetail")
  const renderHeadSrc = openSingleTicketSrc.slice(renderHeadStart, detailStart)
  expect(renderHeadSrc).toContain('class="single-title"')
  expect(renderHeadSrc).not.toContain("statusPillHtml(")
  expect(renderHeadSrc).not.toContain("s-${esc(t.sentiment)}")
  expect(buildTktDetailSrc).toContain("const _showBugTitle")
  expect(buildTktDetailSrc).toContain("const _showBugBody")
  expect(buildTktDetailSrc).toContain("const _showBug =")
  expect(buildTktDetailSrc).toContain("Status</span>")
  expect(buildTktDetailSrc).toContain("Notes</label>")
})

test("Sims page leads with Sims feed; Live/Observability are collapsible in Sims+Settings views", () => {
  expect(HTML.indexOf('id="simsFeed"')).toBeGreaterThan(-1)
  expect(HTML.indexOf('id="simLiveStrip"')).toBeGreaterThan(-1)
  expect(HTML.indexOf('id="simsFeed"')).toBeLessThan(HTML.indexOf('id="simLiveStrip"'))
  // drawers now appear in both Sims and Settings views as collapsed <details>
  expect(HTML).toContain('id="liveDrawer" data-view="sims settings"')
  expect(HTML).toContain('id="obsDrawer" data-view="sims settings"')
  expect(HTML).toContain('id="simLiveDismiss"')
})

test("renderSimsFeed shows actual observation text with a Triage link", () => {
  const els: Record<string, any> = {
    simsFeed: { innerHTML: "" },
    simsCount: { textContent: "" },
  }
  const state = {
    active: { id: "proj_1" },
    sims: [{ id: "sim_1", name: "Alice Buyer", role: "Buyer", initials: "AB", accent: "#6366f1" }],
    simFeedback: {
      sim_1: [{ id: "fb_1", text: "The checkout CTA disappears below the fold.", sentiment: "confused", urlPath: "/checkout", createdAt: 1700000000000 }],
    },
    saying: [],
  }
  const factory = new Function(
    "state", "$", "emptyState", "kicon", "curProjId", "esc", "safeAccent", "col", "initials", "ago",
    `${renderSimsFeedSrc}\nreturn renderSimsFeed;`,
  )
  const renderSimsFeed = factory(
    state,
    (id: string) => els[id] ?? null,
    () => "",
    () => "",
    () => state.active.id,
    (s: unknown) => String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string)),
    (_accent: string, fallback: string) => fallback,
    () => "#6366f1",
    (s: string) => s.slice(0, 2).toUpperCase(),
    () => "just now",
  )
  renderSimsFeed()
  expect(els.simsFeed.innerHTML).toContain("The checkout CTA disappears below the fold.")
  expect(els.simsFeed.innerHTML).toContain("View in New reports")
  expect(els.simsFeed.innerHTML).toContain('href="#triage"')
  expect(els.simsCount.textContent).toBe("1")
})

// =============================================================================
// KLA-234: dupAckHtml — duplicate-acknowledgment callout
// =============================================================================
// Extract the real shipped function (brace-matched) plus its collaborators.
const dupAckSrc = extractFn(HTML, "function dupAckHtml(")
const agoStub = `function ago(ts) { return "2 days ago" }`
const escStub = `function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;") }`
const kiconStub = `function kicon(name) { return "<svg data-icon='"+name+"'></svg>" }`

function buildDupAckSandbox() {
  const factory = new Function(
    "ago", "esc", "kicon",
    `${dupAckSrc}\nreturn dupAckHtml;`,
  )
  return factory(
    (ts: number) => "2 days ago",
    (s: unknown) => String(s).replace(/[&<>"']/g, (ch: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch as string])),
    (_name: string) => "<svg></svg>",
  )
}

test("KLA-234 dupAckHtml: returns empty string when recurrenceCount < 2", () => {
  const dupAckHtml = buildDupAckSandbox()
  expect(dupAckHtml({ recurrenceCount: 1, recurrence: 1 })).toBe("")
  expect(dupAckHtml({ recurrenceCount: 0, recurrence: 0 })).toBe("")
  expect(dupAckHtml({})).toBe("")
})

test("KLA-234 dupAckHtml: returns empty string for count=1 using legacy recurrence field", () => {
  const dupAckHtml = buildDupAckSandbox()
  expect(dupAckHtml({ recurrence: 1 })).toBe("")
})

test("KLA-234 dupAckHtml: banner mode fires for recurrenceCount=2", () => {
  const dupAckHtml = buildDupAckSandbox()
  const html = dupAckHtml({ recurrenceCount: 2, firstSeen: 1700000000000, lastSeen: 1700100000000 })
  expect(html).toContain("dup-ack")
  expect(html).toContain("Known issue")
  expect(html).toContain("reported twice")
  expect(html).toContain("First seen")
  expect(html).toContain("Last seen")
})

test("KLA-234 dupAckHtml: banner mode fires for recurrenceCount=5 with plural label", () => {
  const dupAckHtml = buildDupAckSandbox()
  const html = dupAckHtml({ recurrenceCount: 5, firstSeen: 1700000000000, lastSeen: 1700200000000 })
  expect(html).toContain("reported 5 times")
})

test("KLA-234 dupAckHtml: badge mode returns compact span for list rows", () => {
  const dupAckHtml = buildDupAckSandbox()
  const html = dupAckHtml({ recurrenceCount: 3, recurrence: 3 }, { badge: true })
  expect(html).toContain("dup-ack-badge")
  expect(html).toContain("Known issue ×3")
  // badge mode should NOT contain the full banner wrapper
  expect(html).not.toContain("dup-ack\"")
})

test("KLA-234 dupAckHtml: badge mode falls back to legacy recurrence field", () => {
  const dupAckHtml = buildDupAckSandbox()
  const html = dupAckHtml({ recurrence: 4 }, { badge: true })
  expect(html).toContain("Known issue ×4")
})

test("KLA-234 dupAckHtml: banner omits date detail when firstSeen not present", () => {
  const dupAckHtml = buildDupAckSandbox()
  const html = dupAckHtml({ recurrenceCount: 2 })
  expect(html).toContain("Known issue")
  expect(html).not.toContain("First seen")
  expect(html).not.toContain("Last seen")
})

test("KLA-234 dupAckHtml: banner omits last-seen when firstSeen === lastSeen", () => {
  const dupAckHtml = buildDupAckSandbox()
  const ts = 1700000000000
  const html = dupAckHtml({ recurrenceCount: 2, firstSeen: ts, lastSeen: ts })
  expect(html).toContain("First reported")
  expect(html).not.toContain("Last seen")
})

test("KLA-234 dupAckHtml: uses recurrenceCount over legacy recurrence when both present", () => {
  const dupAckHtml = buildDupAckSandbox()
  // recurrenceCount=7 should win; legacy recurrence=2 is ignored
  const html = dupAckHtml({ recurrenceCount: 7, recurrence: 2 }, { badge: true })
  expect(html).toContain("×7")
  expect(html).not.toContain("×2")
})

test("KLA-234 dupAckHtml: has aria-label for screen readers", () => {
  const dupAckHtml = buildDupAckSandbox()
  const html = dupAckHtml({ recurrenceCount: 3 })
  expect(html).toContain('aria-label=')
  expect(html).toContain("3 times")
})

test("KLA-234 buildTktDetail includes dupAckHtml call inside tkt-context", () => {
  // Guards that the call was not accidentally removed from the context pane.
  expect(buildTktDetailSrc).toContain("dupAckHtml(t)")
})

test("KLA-234 _hasDupAck gates context pane for recurring-only tickets", () => {
  // The guard '_hasDupAck' ensures the tkt-context block renders even when
  // no observation/bug/quote/chips exist — only recurrenceCount matters.
  expect(buildTktDetailSrc).toContain("_hasDupAck")
  expect(buildTktDetailSrc).toContain("|| _hasDupAck")
})

test("renderSaying never frames unresolved bug reports as A Sim", () => {
  const els: Record<string, any> = {
    saying: { innerHTML: "" },
  }
  const state = {
    saying: [{
      source: "feedback",
      simId: "sim_missing",
      simName: null,
      initials: null,
      accent: "#6366f1",
      text: "[bug] Checkout button is hidden below the fold.",
      sentiment: "confused",
      urlPath: "/checkout",
      createdAt: 1700000000000,
    }],
  }
  const factory = new Function(
    "state", "$", "emptyState", "kicon", "esc", "safeAccent", "col", "initials", "ago",
    `${renderSayingSrc}\nreturn renderSaying;`,
  )
  const renderSaying = factory(
    state,
    (id: string) => els[id] ?? null,
    () => "",
    () => "",
    (s: unknown) => String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string)),
    (_accent: string, fallback: string) => fallback,
    () => "#6366f1",
    (s: string) => s.slice(0, 2).toUpperCase(),
    () => "just now",
  )
  renderSaying()
  expect(els.saying.innerHTML).toContain("Bug report")
  expect(els.saying.innerHTML).toContain("Checkout button is hidden")
  expect(els.saying.innerHTML).not.toContain("A Sim")
})
