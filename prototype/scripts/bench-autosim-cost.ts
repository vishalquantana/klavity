// AutoSim cost/stability benchmark — compares page-state serializations and model variants
// for the Trail-authoring loop (lib/trails-author.ts). Standalone: does NOT touch the DB,
// the ai_calls ledger, or the daily-spend cap. Run manually:
//   bun scripts/bench-autosim-cost.ts            # phase 1 only (offline, no API cost)
//   bun scripts/bench-autosim-cost.ts --live     # + phase 2 (real OpenRouter calls, ~$0.05)
//
// Phase 1: raw page.content() (current, capped 16k) vs a compact ref-annotated element tree
//          (the "TOON/aria-tree" idea from opera-browser-cli / alibaba page-agent).
//          NOTE: Playwright 1.61's ariaSnapshot({ref:true}) silently ignores the ref option,
//          so we build our own: interactive elements get a data-kref="eN" attribute stamped
//          in-page, making every [ref=eN] a REAL, unique, resolvable CSS selector.
// Phase 2: one authoring step, 4 variants × N iterations, real usage.cost from OpenRouter,
//          PLUS selector validation — each returned selector is resolved on the live page:
//   A current        qwen3-vl  screenshot + raw DOM 16k   (what prod does today)
//   B compact-vision qwen3-vl  screenshot + kref tree
//   C text-only-vl   qwen3-vl  kref tree only (no image)  (page-agent style)
//   D text-only-lite flash-lite kref tree only            (cheap non-vision model)
import { chromium, type Page } from "playwright"
import { AUTHOR_SYS } from "../lib/trails-author-model"

const LIVE = process.argv.includes("--live")
const ITERS = 2
const DOM_CAP = 16_000 // mirrors trails-author.ts
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const VL_MODEL = "qwen/qwen3-vl-235b-a22b-instruct"
const LITE_MODEL = "google/gemini-2.5-flash-lite"

const PAGES: { url: string; objective: string; live?: boolean }[] = [
  { url: "https://klavity.in/", objective: "Open the signup flow from the home page", live: true },
  { url: "https://klavity.in/onboarding", objective: "Sign up with email vishal@quantana.com.au and reach the OTP screen", live: true },
  { url: "https://klavity.in/blog", objective: "Open the most recent blog post" },
  { url: "https://github.com/login", objective: "Log in with {{cred:main:email}} and {{cred:main:password}}", live: true },
  { url: "https://news.ycombinator.com/", objective: "Open the top story's comment page" },
]

// Rough token estimate for phase-1 (phase-2 reports REAL prompt_tokens from the API).
const estTok = (n: number) => Math.round(n / 3.8)

// Text-only variant of the author system prompt: selectors are the ref markers, which are
// real CSS (data-kref attributes stamped on the page) — resolvable with zero translation.
const AUTHOR_SYS_TEXT = AUTHOR_SYS
  .replace("the current page's screenshot and DOM snapshot", "the current page's compact element snapshot")
  .replace(
    `click/type/select/assert require "selector": a CSS selector derived from the DOM snapshot that matches EXACTLY ONE element. Prefer #id, [data-testid], stable attributes; avoid brittle positional selectors.`,
    `click/type/select/assert require "selector": pick the target element's [ref=eN] marker from the snapshot and return the selector as [data-kref="eN"] (e.g. the element marked [ref=e12] becomes [data-kref="e12"]).`,
  )

// Compact ref-annotated snapshot, built in-page. Interactive/semantic elements only:
// role "accessible name" {state} [ref=eN], indented by DOM depth. Refs are stamped as
// data-kref attributes so [data-kref="eN"] is a unique real selector.
async function compactSnapshot(page: Page): Promise<string> {
  return await page.evaluate(() => {
    let n = 0
    const lines: string[] = []
    const INTERACTIVE = new Set(["a", "button", "input", "select", "textarea", "summary", "option"])
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect?.()
      if (!r || (r.width === 0 && r.height === 0)) return false
      const s = getComputedStyle(el as HTMLElement)
      return s.display !== "none" && s.visibility !== "hidden"
    }
    const roleOf = (el: Element): string | null => {
      const explicit = el.getAttribute("role")
      if (explicit) return explicit
      const t = el.tagName.toLowerCase()
      if (t === "a" && el.hasAttribute("href")) return "link"
      if (t === "button" || (t === "input" && ["button", "submit"].includes((el as HTMLInputElement).type))) return "button"
      if (t === "input") { const ty = (el as HTMLInputElement).type; return ty === "checkbox" ? "checkbox" : ty === "radio" ? "radio" : "textbox" }
      if (t === "select") return "combobox"
      if (t === "textarea") return "textbox"
      if (/^h[1-6]$/.test(t)) return `heading${t[1]}`
      if (t === "img" && el.getAttribute("alt")) return "img"
      if (t === "label") return "label"
      return null
    }
    const nameOf = (el: Element): string => {
      const cand = el.getAttribute("aria-label") || el.getAttribute("placeholder") ||
        (el as HTMLImageElement).alt || (el.textContent || "").trim() || el.getAttribute("name") ||
        el.getAttribute("title") || (el as HTMLInputElement).value || ""
      return cand.replace(/\s+/g, " ").slice(0, 80)
    }
    const walk = (el: Element, depth: number) => {
      for (const child of Array.from(el.children)) {
        const t = child.tagName.toLowerCase()
        if (["script", "style", "noscript", "svg", "template", "iframe"].includes(t)) continue
        const role = roleOf(child)
        let emitted = false
        if (role && visible(child)) {
          let line = "  ".repeat(Math.min(depth, 6)) + `${role} "${nameOf(child)}"`
          if ((child as HTMLInputElement).disabled) line += " {disabled}"
          if (INTERACTIVE.has(t) || child.getAttribute("role")) {
            const ref = `e${++n}`
            child.setAttribute("data-kref", ref)
            line += ` [ref=${ref}]`
          }
          lines.push(line)
          emitted = true
        }
        walk(child, emitted ? depth + 1 : depth)
      }
    }
    walk(document.body, 0)
    return lines.join("\n")
  })
}

interface Capture { url: string; objective: string; rawHtml: string; rawCapped: string; snap: string; shotB64: string; shotBytes: number }

async function capture(page: Page, url: string, objective: string): Promise<Capture> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 })
  await page.waitForTimeout(1500)
  const rawHtml = await page.content()
  const snap = await compactSnapshot(page)
  const shot = await page.screenshot({ type: "jpeg", quality: 60 }) // mirrors trails-author.ts
  return { url, objective, rawHtml, rawCapped: rawHtml.slice(0, DOM_CAP), snap, shotB64: shot.toString("base64"), shotBytes: shot.length }
}

function userText(c: Capture, snapshot: string, kind: string) {
  return (
    `OBJECTIVE: ${c.objective}\nACTIONS SO FAR:\n(none)\n` +
    `PAGE URL (untrusted): <<<${c.url}>>>\n` +
    `${kind} (untrusted):\n<<<\n${snapshot}\n>>>`
  )
}

interface LiveResult { variant: string; model: string; page: string; ok: boolean; promptTok: number; outTok: number; cost: number; ms: number; action: string; selector: string | null; resolved: string }

async function callModel(model: string, messages: any[], variant: string, pageUrl: string): Promise<LiveResult> {
  const key = process.env.OPENROUTER_API_KEY!
  const t0 = Date.now()
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json", "HTTP-Referer": "https://klavity.in", "X-Title": "Klavity-bench" },
    body: JSON.stringify({ model, max_tokens: 600, messages, usage: { include: true }, response_format: { type: "json_object" } }),
  })
  const ms = Date.now() - t0
  if (!res.ok) return { variant, model, page: pageUrl, ok: false, promptTok: 0, outTok: 0, cost: 0, ms, action: `HTTP ${res.status}`, selector: null, resolved: "-" }
  const data: any = await res.json()
  const u = data?.usage || {}
  let action = "(unparsed)", selector: string | null = null
  try {
    const raw = String(data?.choices?.[0]?.message?.content ?? "")
    const m = raw.replace(/```(?:json)?/gi, "").match(/\{[\s\S]*\}/)
    const a = JSON.parse(m ? m[0] : raw)
    selector = typeof a.selector === "string" ? a.selector : null
    action = `${a.op} ${a.selector ?? a.url ?? ""}`.trim() + (a.value ? ` = ${String(a.value).slice(0, 30)}` : "")
  } catch {}
  return { variant, model, page: pageUrl, ok: true, promptTok: u.prompt_tokens ?? 0, outTok: u.completion_tokens ?? 0, cost: u.cost ?? 0, ms, action, selector, resolved: "-" }
}

// Resolve a returned selector on the live page: does it match exactly one element, and what?
async function validateSelector(page: Page, selector: string | null): Promise<string> {
  if (!selector) return "(no selector)"
  try {
    const loc = page.locator(selector)
    const count = await loc.count()
    if (count !== 1) return `✗ matches ${count}`
    const desc = await loc.first().evaluate((el: any) =>
      `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.textContent || el.getAttribute("name") || "").trim().replace(/\s+/g, " ").slice(0, 40)}"`)
    return `✓ ${desc}`
  } catch (e: any) { return `✗ bad selector` }
}

const pct = (a: number, b: number) => `${(100 * (1 - a / b)).toFixed(1)}%`
const pad = (s: string | number, n: number) => String(s).padEnd(n)

async function main() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()

  console.log("## Phase 1 — serialization size (chars)\n")
  console.log(pad("page", 34) + pad("rawHTML", 10) + pad("cap16k", 9) + pad("krefTree", 10) + pad("vs cap16k", 11) + pad("vs full", 9) + "shotKB")
  const results: LiveResult[] = []
  let totRaw = 0, totSnap = 0
  for (const p of PAGES) {
    let c: Capture
    try { c = await capture(page, p.url, p.objective) } catch (e: any) {
      console.log(pad(p.url, 34) + `CAPTURE FAILED: ${e?.message?.slice(0, 80)}`); continue
    }
    totRaw += c.rawCapped.length; totSnap += c.snap.length
    console.log(
      pad(p.url.replace("https://", ""), 34) +
      pad(c.rawHtml.length, 10) + pad(c.rawCapped.length, 9) + pad(c.snap.length, 10) +
      pad(pct(c.snap.length, c.rawCapped.length), 11) + pad(pct(c.snap.length, c.rawHtml.length), 9) +
      `${Math.round(c.shotBytes / 1024)}`,
    )
    if (!LIVE || !p.live) continue
    // Phase 2 for this page while it is still loaded (so selector validation is live).
    const img = { type: "image_url", image_url: { url: `data:image/jpeg;base64,${c.shotB64}` } }
    const variants: { name: string; model: string; messages: any[] }[] = [
      { name: "A current(shot+raw16k)", model: VL_MODEL, messages: [ { role: "system", content: AUTHOR_SYS }, { role: "user", content: [{ type: "text", text: userText(c, c.rawCapped, "DOM SNAPSHOT") }, img] } ] },
      { name: "B compact-vision", model: VL_MODEL, messages: [ { role: "system", content: AUTHOR_SYS_TEXT }, { role: "user", content: [{ type: "text", text: userText(c, c.snap, "ELEMENT SNAPSHOT") }, img] } ] },
      { name: "C text-only-vl", model: VL_MODEL, messages: [ { role: "system", content: AUTHOR_SYS_TEXT }, { role: "user", content: userText(c, c.snap, "ELEMENT SNAPSHOT") } ] },
      { name: "D text-only-lite", model: LITE_MODEL, messages: [ { role: "system", content: AUTHOR_SYS_TEXT }, { role: "user", content: userText(c, c.snap, "ELEMENT SNAPSHOT") } ] },
    ]
    for (const v of variants)
      for (let i = 0; i < ITERS; i++) {
        const r = await callModel(v.model, v.messages, v.name, c.url)
        r.resolved = await validateSelector(page, r.selector)
        results.push(r)
      }
  }
  console.log(`\nTotals: cap16k=${totRaw}ch (~${estTok(totRaw)}tok)  krefTree=${totSnap}ch (~${estTok(totSnap)}tok)  tree saves ${pct(totSnap, totRaw)} of DOM text\n`)

  if (!LIVE) { console.log("(phase 2 skipped — pass --live for real OpenRouter cost runs)"); await browser.close(); return }

  console.log("## Phase 2 — live authoring-step cost (real usage.cost) + selector validation\n")
  console.log(pad("variant", 24) + pad("page", 24) + pad("inTok", 7) + pad("cost$", 10) + pad("ms", 6) + pad("action", 44) + "selector resolves?")
  for (const r of results)
    console.log(pad(r.variant, 24) + pad(r.page.replace("https://", "").slice(0, 22), 24) + pad(r.promptTok, 7) + pad(r.cost.toFixed(6), 10) + pad(r.ms, 6) + pad(r.action.slice(0, 42), 44) + r.resolved)

  console.log("\n## Averages per variant (across pages × iters)\n")
  const byVar = new Map<string, LiveResult[]>()
  for (const r of results.filter((r) => r.ok)) byVar.set(r.variant, [...(byVar.get(r.variant) ?? []), r])
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
  let baseCost = 0
  for (const [v, rs] of byVar) {
    const c = avg(rs.map((r) => r.cost)), it = avg(rs.map((r) => r.promptTok)), ms = avg(rs.map((r) => r.ms))
    const good = rs.filter((r) => r.resolved.startsWith("✓") || r.action.startsWith("wait") || r.action.startsWith("navigate")).length
    if (v.startsWith("A")) baseCost = c
    console.log(pad(v, 24) + pad(Math.round(it), 8) + pad(`$${c.toFixed(6)}`, 12) + pad(`${Math.round(ms)}ms`, 9) + pad(`${good}/${rs.length} valid`, 11) + (baseCost ? `${pct(c, baseCost)} cheaper → 40-step ≈ $${(c * 40).toFixed(3)}` : ""))
  }
  const spent = results.reduce((s, r) => s + r.cost, 0)
  console.log(`\nTotal bench spend: $${spent.toFixed(4)} across ${results.length} calls`)
  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
