// KLA-738 — dynamic per-type Open Graph / social share cards.
//
// Pure, self-contained server-side templates: each `render*` builder returns a complete 1200×630
// HTML document (inline CSS, no external assets except system/bundled fonts) that the headless
// renderer (lib/og-render.ts) turns into a PNG. Ported faithfully from the design mockups
// (~/Downloads/klavity-og-types.html + klavity-og-optionA.html): black/purple/beige + gold brand,
// the real dot-ladder logo, four templates — human ticket, Sim ticket, roast scorecard, default.
//
// This module is DEPENDENCY-FREE (no db/s3/browser imports) so it is trivially unit-testable and the
// resolver can be exercised against representative rows without booting the app.

export type OgType = "human" | "sim" | "roast" | "default"

// Sources that mark a report as machine/Sim-generated (mirrors NON_HUMAN_FEEDBACK_SOURCES in lib/db,
// minus studio-demo which is a quarantine marker, not a Sim). Kept local so this module stays pure.
const SIM_SOURCES = new Set(["sim", "autosim", "adhoc", "ad-hoc", "trail", "trails", "walk"])

export interface OgResolverRow {
  reportType?: string | null // 'bug' | 'feature' | 'task' | ...
  simId?: string | null
  source?: string | null
  reporter?: { name?: string | null } | null
  // Roast / Banana-Scorecard markers (any one present ⇒ roast card).
  roast?: boolean | null
  bananaScore?: number | null
}

/**
 * Map a shared ref's row to its OG card type. Precedence (most-specific first):
 *   1. Banana-Scorecard run           → roast
 *   2. sim_id OR sim/autosim/adhoc…   → sim
 *   3. report_type=bug + human prov.  → human
 *   4. anything else / homepage       → default
 * "Human provenance" = no sim_id AND source is not a Sim source.
 */
export function resolveOgType(row: OgResolverRow | null | undefined): OgType {
  if (!row) return "default"
  if (row.roast === true || (row.bananaScore != null && Number.isFinite(Number(row.bananaScore)))) return "roast"
  const src = String(row.source || "").trim().toLowerCase()
  const isSim = !!row.simId || SIM_SOURCES.has(src)
  if (isSim) return "sim"
  const isHumanProvenance = !row.simId && !SIM_SOURCES.has(src)
  if (String(row.reportType || "").trim().toLowerCase() === "bug" && isHumanProvenance) return "human"
  return "default"
}

// ── template data ──────────────────────────────────────────────────────────────────────────────
export interface Severity { label: string; cls: "c1" | "c2" | "c3" }
export interface HumanCardData {
  type: "human"
  ticketKey: string
  title: string
  severity?: Severity | null
  reporter?: string | null
  foot?: string
}
export interface SimCardData {
  type: "sim"
  ticketKey: string
  title: string
  finding: string // the Sim's quote/finding
  severity?: Severity | null
  simName: string
  simRole?: string | null
  initials?: string | null
  accent?: string | null
  foot?: string
}
export interface RoastCardData {
  type: "roast"
  score: number
  domain: string
  simCount: number
  critical: number
  needsWork: number
  polish: number
  foot?: string
}
export interface DefaultCardData { type: "default"; foot?: string }
export type OgCardData = HumanCardData | SimCardData | RoastCardData | DefaultCardData

// ── helpers ──────────────────────────────────────────────────────────────────────────────────
export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function initialsOf(name: string, fallback?: string | null): string {
  if (fallback && fallback.trim()) return fallback.trim().slice(0, 2).toUpperCase()
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Real dot-ladder logo, verbatim from the mockups.
const LOGO_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g fill="#6366f1"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#6366f1" stroke-width="1.6" stroke-linecap="round" opacity=".4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg>`

const BRAND = `<div class="brand"><div class="mark">${LOGO_SVG}</div><div class="name">Klav<i>ity</i></div></div>`

// Shared CSS — ported from klavity-og-types.html + optionA. Emoji use a bundled/system color-emoji
// font stack so the 🍌 renders in headless Chromium (see lib/og-render.ts font bundling).
const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --black:#0b0813;--ink:#f7f5ef;--pur:#6366f1;--pur2:#8b5cf6;--pur3:#a9a5f7;--pur-deep:#5a5ad6;
  --beige:#ece6db;--cream:#f3ece1;--gold:#e8a24a;--taupe:#b3a896;--line:rgba(236,230,219,.09);
  --red:#ff6b5e;--amber:#e8a24a;--green:#9fd6a0;--greenb:#10b981;
}
html,body{width:1200px;height:630px}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,"Noto Sans","Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",system-ui,sans-serif;color:var(--ink);overflow:hidden}
.emoji{font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif}
.card{width:1200px;height:630px;position:relative;overflow:hidden;
  background:radial-gradient(1100px 680px at 80% -14%,rgba(99,102,241,.32),transparent 55%),
    radial-gradient(760px 520px at 6% 116%,rgba(232,162,74,.12),transparent 52%),
    linear-gradient(158deg,#120d1c 0%,#0b0813 62%,#080610 100%)}
.card::before{content:"";position:absolute;inset:0;
  background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);
  background-size:50px 50px;mask-image:radial-gradient(950px 540px at 28% 42%,#000,transparent 78%);opacity:.55}
.brand{position:absolute;top:50px;left:60px;display:flex;align-items:center;gap:15px;z-index:5}
.mark{width:54px;height:54px;border-radius:15px;background:linear-gradient(150deg,#faf7f1,#ece6db);display:grid;place-items:center;
  box-shadow:0 10px 30px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.12) inset,0 0 30px rgba(99,102,241,.22)}
.mark svg{width:35px;height:35px}
.name{font-size:26px;font-weight:800;letter-spacing:-.02em}.name i{font-style:normal;color:var(--pur3)}
.pill{position:absolute;top:56px;right:60px;z-index:5;display:flex;align-items:center;gap:10px;padding:9px 17px;border-radius:999px;
  background:rgba(99,102,241,.14);border:1px solid rgba(99,102,241,.34);color:var(--pur3);font-size:14px;font-weight:600}
.pill .dot{width:8px;height:8px;border-radius:50%}
.copy{position:absolute;left:60px;bottom:76px;max-width:660px;z-index:5}
.kicker{font-size:16px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:18px;display:flex;align-items:center;gap:12px}
h1{font-size:58px;line-height:1.06;font-weight:800;letter-spacing:-.02em;color:var(--cream)}
h1 em{font-style:normal;background:linear-gradient(118deg,#a9a5f7,#8b5cf6 50%,#6366f1);-webkit-background-clip:text;background-clip:text;color:transparent}
.metarow{margin-top:26px;display:flex;align-items:center;gap:14px}
.chip{display:flex;align-items:center;gap:10px;padding:9px 15px;border-radius:12px;background:rgba(18,13,28,.7);border:1px solid rgba(236,230,219,.14);font-size:17px;font-weight:700}
.foot{position:absolute;left:60px;bottom:36px;color:#8b8378;font-size:16px;font-weight:600;z-index:5}
.sev{font-size:15px;font-weight:800;letter-spacing:.05em;padding:6px 12px;border-radius:8px}
.sev.c1{background:rgba(255,107,94,.16);color:#ff9187;border:1px solid rgba(255,107,94,.4)}
.sev.c2{background:rgba(232,162,74,.16);color:#f0b667;border:1px solid rgba(232,162,74,.4)}
.sev.c3{background:rgba(159,214,160,.14);color:#bfe6c0;border:1px solid rgba(159,214,160,.4)}
.key{color:var(--pur3);font-weight:800;letter-spacing:.03em}
.av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:15px;color:#fff;border:2px solid #0b0813}
.win{position:absolute;right:56px;top:50%;transform:translateY(-50%) rotate(2deg);width:430px;border-radius:18px;overflow:hidden;z-index:2;
  background:#0f0f1a;border:1px solid rgba(236,230,219,.14);box-shadow:0 26px 70px rgba(0,0,0,.6)}
.bar{height:38px;background:#161626;display:flex;align-items:center;gap:7px;padding:0 14px}.bar i{width:11px;height:11px;border-radius:50%;background:#3a3a52}
.shot{height:280px;background:linear-gradient(135deg,#1a1526,#12101d);position:relative;padding:26px}
.shot .h{height:16px;width:62%;background:rgba(236,230,219,.15);border-radius:6px}.shot .h2{height:11px;width:44%;background:rgba(236,230,219,.09);border-radius:6px;margin-top:14px}
.shot .btn{position:absolute;left:26px;bottom:30px;height:40px;width:150px;border-radius:10px;background:linear-gradient(120deg,#6366f1,#5a5ad6);opacity:.85}
.marq{position:absolute;right:30px;bottom:28px;width:170px;height:110px;border:2px solid var(--gold);border-radius:12px;background:rgba(232,162,74,.14);box-shadow:0 0 0 3px rgba(232,162,74,.15)}
.marq::after{content:"";position:absolute;right:-10px;bottom:-10px;width:18px;height:18px;background:var(--gold);border-radius:50%;border:3px solid #0f0f1a}
.persona{position:absolute;right:70px;top:50%;transform:translateY(-50%);width:430px;z-index:2;display:flex;flex-direction:column;align-items:center;gap:22px}
.pav{width:170px;height:170px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:56px;color:#fff;
  box-shadow:0 0 60px rgba(139,92,246,.55),0 20px 50px rgba(0,0,0,.5);border:4px solid rgba(236,230,219,.16)}
.quote{background:rgba(18,13,28,.9);border:1px solid rgba(236,230,219,.14);border-radius:18px;padding:20px 22px;font-size:20px;line-height:1.4;color:var(--cream);
  box-shadow:0 18px 50px rgba(0,0,0,.5);position:relative;max-width:400px;text-align:center}
.quote .who{margin-top:12px;font-size:15px;color:var(--taupe);font-weight:600}
.score{position:absolute;right:74px;top:50%;transform:translateY(-50%) rotate(-3deg);width:370px;background:#0f0d1a;border:1px solid rgba(236,230,219,.14);
  border-radius:22px;padding:28px 30px 24px;box-shadow:0 26px 70px rgba(0,0,0,.62);z-index:2}
.score h3{font-size:19px;font-weight:800;display:flex;align-items:center;gap:9px;color:var(--cream)}
.banana{font-size:66px;font-weight:900;background:linear-gradient(120deg,#ffd23f,#e8a24a);-webkit-background-clip:text;background-clip:text;color:transparent;margin:8px 0 2px;letter-spacing:-.03em;display:flex;align-items:center;gap:14px}
.banana .b{-webkit-text-fill-color:initial;color:initial}
.score .cap{color:var(--taupe);font-size:15px;margin-bottom:16px}
.sevrow{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-top:1px solid rgba(236,230,219,.09);font-size:16px;color:var(--cream)}
.sevrow .c{font-variant-numeric:tabular-nums;font-weight:800}
.cdot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:9px;vertical-align:middle}
.sub{margin-top:20px;color:var(--taupe);font-size:24px;line-height:1.45;max-width:520px}
`

function doc(bodyInner: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>${bodyInner}</body></html>`
}

function foot(data: { foot?: string }): string {
  return `<div class="foot">${escapeHtml(data.foot || "klavity.in")}</div>`
}

function renderHuman(d: HumanCardData): string {
  const sev = d.severity
  const inner = `<div class="card">
    ${BRAND}
    <div class="pill"><span class="dot" style="background:var(--gold);box-shadow:0 0 10px var(--gold)"></span>Shared bug report</div>
    <div class="win"><div class="bar"><i></i><i></i><i></i></div><div class="shot"><div class="h"></div><div class="h2"></div><div class="btn"></div><div class="marq"></div></div></div>
    <div class="copy">
      ${sev ? `<div class="kicker" style="color:var(--red)"><span class="sev ${sev.cls}">${escapeHtml(sev.label)}</span></div>` : ""}
      <h1>${escapeHtml(d.title)}</h1>
      <div class="metarow">
        <span class="chip"><span class="key">${escapeHtml(d.ticketKey)}</span></span>
        ${d.reporter ? `<span class="chip"><span class="av" style="background:linear-gradient(150deg,#b3a896,#8b8378)">${escapeHtml(initialsOf(d.reporter))}</span>Reported by ${escapeHtml(d.reporter)}</span>` : ""}
      </div>
    </div>
    ${foot(d)}
  </div>`
  return doc(inner)
}

function renderSim(d: SimCardData): string {
  const sev = d.severity
  const accent = d.accent || "#8b5cf6"
  const inits = initialsOf(d.simName, d.initials)
  const inner = `<div class="card">
    ${BRAND}
    <div class="pill"><span class="dot" style="background:var(--pur2);box-shadow:0 0 10px var(--pur2)"></span>Shared Sim report</div>
    <div class="persona">
      <div class="pav" style="background:linear-gradient(150deg,${escapeHtml(accent)},#6366f1)">${escapeHtml(inits)}</div>
      <div class="quote">&ldquo;${escapeHtml(d.finding)}&rdquo;<div class="who">${escapeHtml(d.simName)}${d.simRole ? ` &middot; ${escapeHtml(d.simRole)}` : ""}</div></div>
    </div>
    <div class="copy">
      <div class="kicker" style="color:var(--pur3)"><span>&#9670; Found by a Sim</span></div>
      <h1>${escapeHtml(d.title)}</h1>
      <div class="metarow">
        <span class="chip"><span class="key">${escapeHtml(d.ticketKey)}</span></span>
        ${sev ? `<span class="chip"><span class="sev ${sev.cls}">${escapeHtml(sev.label)}</span></span>` : ""}
      </div>
    </div>
    ${foot(d)}
  </div>`
  return doc(inner)
}

function renderRoast(d: RoastCardData): string {
  const inner = `<div class="card">
    ${BRAND}
    <div class="pill"><span class="dot" style="background:var(--green);box-shadow:0 0 10px var(--green)"></span>Free roast &middot; 60s</div>
    <div class="score">
      <h3><span class="emoji">&#127820;</span> Banana Scorecard</h3>
      <div class="banana">${escapeHtml(String(d.score))} <span class="b emoji">&#127820;</span></div>
      <div class="cap">${escapeHtml(d.domain)} &middot; reviewed by ${escapeHtml(String(d.simCount))} Sims</div>
      <div class="sevrow"><span><span class="cdot" style="background:var(--red)"></span>Critical</span><span class="c">${escapeHtml(String(d.critical))}</span></div>
      <div class="sevrow"><span><span class="cdot" style="background:var(--amber)"></span>Needs work</span><span class="c">${escapeHtml(String(d.needsWork))}</span></div>
      <div class="sevrow"><span><span class="cdot" style="background:var(--greenb)"></span>Polish</span><span class="c">${escapeHtml(String(d.polish))}</span></div>
    </div>
    <div class="copy">
      <div class="kicker" style="color:var(--gold)"><span><span class="emoji">&#128293;</span> AI roast</span></div>
      <h1>${escapeHtml(d.domain)}, <em>roasted by AI.</em></h1>
      <div class="sub">Five AI personas toured it and scored every flaw.</div>
    </div>
    ${foot(d)}
  </div>`
  return doc(inner)
}

function renderDefault(d: DefaultCardData): string {
  const inner = `<div class="card">
    ${BRAND}
    <div class="pill"><span class="dot" style="background:var(--green);box-shadow:0 0 10px var(--green)"></span>AI QA, always on</div>
    <div style="position:absolute;inset:0;z-index:1">
      <div style="position:absolute;right:120px;top:130px;background:rgba(18,13,28,.8);border:1px solid rgba(236,230,219,.12);border-radius:12px;padding:11px 15px;font-size:16px;font-weight:600;color:var(--cream);box-shadow:0 14px 38px rgba(0,0,0,.5);display:flex;align-items:center;gap:9px"><span style="width:9px;height:9px;border-radius:50%;background:#ff6b5e;display:inline-block"></span>Regression caught</div>
      <div style="position:absolute;right:250px;top:300px;background:rgba(18,13,28,.8);border:1px solid rgba(236,230,219,.12);border-radius:12px;padding:11px 15px;font-size:16px;font-weight:600;color:var(--cream);box-shadow:0 14px 38px rgba(0,0,0,.5);display:flex;align-items:center;gap:9px"><span style="width:9px;height:9px;border-radius:50%;background:#10b981;display:inline-block"></span>Ticket auto-filed</div>
      <div style="position:absolute;right:110px;top:452px;background:rgba(18,13,28,.8);border:1px solid rgba(236,230,219,.12);border-radius:12px;padding:11px 15px;font-size:16px;font-weight:600;color:var(--cream);box-shadow:0 14px 38px rgba(0,0,0,.5);display:flex;align-items:center;gap:9px"><span style="width:9px;height:9px;border-radius:50%;background:#8b5cf6;display:inline-block"></span>Sim replay attached</div>
    </div>
    <div style="position:absolute;left:60px;top:50%;transform:translateY(-50%);max-width:720px;z-index:5">
      <div class="kicker" style="color:var(--gold);margin-bottom:22px"><span>Snap &middot; Sims &middot; Auto-Sims</span></div>
      <h1 style="font-size:72px">Ship with confidence.<br><em>Klavity finds what QA misses.</em></h1>
      <div class="sub" style="font-size:26px;max-width:600px">The AI-native bug reporter &amp; autonomous QA for modern product teams.</div>
    </div>
    ${foot(d)}
  </div>`
  return doc(inner)
}

/**
 * Inject per-type og:image / twitter meta into a served share page's <head>. Pure + idempotent: skips
 * when og:image is already present so it never double-injects. imageUrl is the versioned /og/<ref>.png.
 */
export function injectOgMeta(html: string, meta: { imageUrl: string; title: string; description: string }): string {
  if (html.includes('property="og:image"')) return html
  const tags = [
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.imageUrl)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.imageUrl)}" />`,
  ].join("\n")
  return html.includes("</head>") ? html.replace("</head>", tags + "\n</head>") : tags + html
}

/** Render a full 1200×630 HTML document for the given typed card data. Never throws on valid data. */
export function renderOgCardHtml(data: OgCardData): string {
  switch (data.type) {
    case "human": return renderHuman(data)
    case "sim": return renderSim(data)
    case "roast": return renderRoast(data)
    case "default": return renderDefault(data)
    default: return renderDefault({ type: "default" })
  }
}
