/**
 * Bug Check (mode=qa on /api/cro/analyze) — mechanical verification helpers. KLAVITYKLA-342.
 *
 * The launch-blocking problem with the first cut (KLAVITYKLA-341) was that the model was handed
 * tag-stripped page TEXT and asked to spot breakage — so it inferred "broken link 'GitHub'" from
 * an anchor's label alone. Those claims are unfalsifiable to the model and were wrong in practice
 * (the flagged link returned HTTP 200). This module makes link claims MECHANICAL:
 *
 *   - `extractLinks`  pulls real hrefs out of the HTML (before tags are stripped),
 *   - `verifyLinks`   actually resolves each one and records the status code,
 *   - `brokenLinkFindings` turns only the genuinely-failing ones into findings,
 *   - `isLinkBreakageClaim` lets the caller DROP any model-authored link claim, since the model
 *     has no way to know and we already have the truth.
 *
 * `extractInventory` backs the explicit "nothing broken — here's what we checked" success state:
 * a zero-finding scan must still tell the user what was examined.
 *
 * Everything here is pure/injectable (verifyLinks takes its fetcher) so it can be unit-tested
 * without network access.
 */

export type PageInventory = { links: number; forms: number; buttons: number; inputs: number }

export type PageLink = { href: string; text: string }

/**
 * Tri-state on purpose (KLAVITYKLA-347). "not ok" is NOT the same as "broken": a lot of perfectly
 * healthy links answer a datacentre IP with 403/429 (bot walls — Google's Chrome Web Store is the
 * canonical example), or time out under load. Reporting those as broken is a worse failure than
 * missing them, because the user can click the link and see it work.
 */
export type LinkVerdict = "ok" | "broken" | "inconclusive"

export type LinkCheck = {
  href: string
  text: string
  status: number | null
  /** True only for a confirmed-good (2xx/3xx) response. Kept for callers that just want health. */
  ok: boolean
  verdict: LinkVerdict
  /** True when the link points off the scanned origin — we can't control those, so we soften them. */
  external?: boolean
}

export type BugFinding = { what: string; where: string; why: string; severity: string; evidence?: string }

/** How many links we're willing to resolve per scan — bounds latency and outbound load. */
export const MAX_LINKS_CHECKED = 12

const TAG_RE = {
  anchor: /<a\b[^>]*>/gi,
  form: /<form\b/gi,
  button: /<button\b|<input\b[^>]*type\s*=\s*["']?(?:submit|button)["']?/gi,
  input: /<input\b|<textarea\b|<select\b/gi,
}

function countMatches(html: string, re: RegExp): number {
  const m = html.match(new RegExp(re.source, re.flags))
  return m ? m.length : 0
}

/** What the scan looked at — shown verbatim to the user in the empty/success state. */
export function extractInventory(html: string): PageInventory {
  return {
    links: countMatches(html, TAG_RE.anchor),
    forms: countMatches(html, TAG_RE.form),
    buttons: countMatches(html, TAG_RE.button),
    inputs: countMatches(html, TAG_RE.input),
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
}

/**
 * Real anchors from a PARSED DOM, absolutised against `baseUrl` and deduped by href.
 *
 * KLAVITYKLA-347 — WHY THIS IS NOT A REGEX ANY MORE. The previous implementation regex-matched
 * `href="..."` over the RAW source, so it "found" links inside <script> bodies. On klavity.in's own
 * home page, site/index.html builds markup with ordinary JS string concatenation:
 *
 *     slot.innerHTML = '<div class="hd-cta-row"><a class="btn" href="' + esc(onboardingHref(url)) + '">'
 *
 * …and the scanner dutifully reported `https://klavity.in/'%20+%20esc(onboardingHref(url))%20+%20'`
 * as a HIGH-severity broken link. That is not a link, it is our own source code. Every JS-heavy app
 * — i.e. every prospect we're trying to impress — produces this garbage. So we now feed the HTML
 * through a real HTML tokenizer (HTMLRewriter), which by spec treats <script>/<style> bodies as raw
 * text and never as markup, and we additionally skip <template>/<noscript> (parsed as markup, but
 * inert — those anchors are not on the page a visitor sees). Comments are dropped by the parser.
 *
 * Non-navigational schemes (mailto:, tel:, javascript:, data:, sms:, #fragment-only) are skipped —
 * there is nothing to HTTP-verify there, and flagging them would recreate the false-positive problem.
 */
export async function extractLinks(html: string, baseUrl: string, limit = MAX_LINKS_CHECKED): Promise<PageLink[]> {
  const raw: Array<{ href: string; text: string }> = []
  let inert = 0
  let cur: { href: string; text: string } | null = null

  await new HTMLRewriter()
    .on("template,noscript", {
      element(el) {
        inert++
        el.onEndTag(() => { inert-- })
      },
    })
    .on("a", {
      element(el) {
        cur = null
        if (inert > 0) return
        const href = el.getAttribute("href")
        if (href == null) return
        const node = { href, text: "" }
        raw.push(node)
        cur = node
        el.onEndTag(() => { cur = null })
      },
      text(t) {
        if (cur) cur.text += t.text
      },
    })
    .transform(new Response(html))
    .text()

  const out: PageLink[] = []
  const seen = new Set<string>()
  for (const node of raw) {
    // HTMLRewriter already entity-decodes attribute values; decodeEntities is belt-and-braces for
    // the double-encoded cases (&amp;amp;) that show up in CMS output.
    const rawHref = decodeEntities(node.href).trim()
    if (!rawHref || rawHref.startsWith("#")) continue
    if (/^(mailto|tel|javascript|data|sms|file|ftp):/i.test(rawHref)) continue
    let abs: URL
    try {
      abs = new URL(rawHref, baseUrl)
    } catch {
      continue
    }
    if (abs.protocol !== "http:" && abs.protocol !== "https:") continue
    abs.hash = ""
    const href = abs.toString()
    if (seen.has(href)) continue
    seen.add(href)
    const text = node.text.replace(/\s+/g, " ").trim().slice(0, 80)
    out.push({ href, text })
    if (out.length >= limit) break
  }
  return out
}

/**
 * Same-origin pages worth also scanning (KLAVITYKLA-347, BUG 3). We pick from links we already
 * extracted, so we never invent URLs, and we never leave the entered origin.
 *
 * Ordering favours the shallowest paths, which in practice are the nav/header/footer destinations
 * (/pricing, /docs, /blog) rather than deep permalinks — the pages a prospect would actually click.
 * Assets and non-HTML endpoints are excluded so we don't burn the budget fetching a PDF.
 */
const NON_PAGE_EXT = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|json|xml|txt|pdf|zip|gz|mp4|webm|woff2?|ttf|eot|rss|atom)$/i

export function sameOriginCrawlTargets(links: PageLink[], baseUrl: string, max: number): string[] {
  let base: URL
  try {
    base = new URL(baseUrl)
  } catch {
    return []
  }
  const basePath = base.pathname.replace(/\/+$/, "")
  const candidates: Array<{ href: string; depth: number }> = []
  const seen = new Set<string>()
  for (const l of links) {
    let u: URL
    try {
      u = new URL(l.href)
    } catch {
      continue
    }
    if (u.origin !== base.origin) continue
    if (NON_PAGE_EXT.test(u.pathname)) continue
    const norm = u.origin + u.pathname.replace(/\/+$/, "")
    if (norm === base.origin + basePath) continue // the page we already scanned
    if (seen.has(norm)) continue
    seen.add(norm)
    candidates.push({ href: u.toString(), depth: u.pathname.split("/").filter(Boolean).length })
  }
  candidates.sort((a, b) => a.depth - b.depth)
  return candidates.slice(0, max).map((c) => c.href)
}

/**
 * A browser-shaped User-Agent. KLAVITYKLA-347: sending "KlavityBot/1.0" got us 403'd by bot walls
 * (Google's Chrome Web Store returned 403 to the bot UA while the link works fine in a browser),
 * and we then reported the customer's WORKING link as dead. We are doing exactly what a visitor's
 * browser does — a single GET of a page they linked to — so we identify as one.
 */
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/126.0.0.0 Safari/537.36 KlavityLinkCheck/1.0 (+https://klavity.in)"

/**
 * Statuses that tell us NOTHING about whether the link works for a human. Bot walls, method
 * restrictions, rate limits, auth walls and origin hiccups all land here. Never reported.
 */
function statusVerdict(status: number): LinkVerdict {
  // The only statuses that mean "this resource is genuinely not there".
  if (status === 404 || status === 410) return "broken"
  if (status < 400) return "ok"
  // 401/403 (auth or bot wall), 405 (method), 408/429 (throttle), 5xx (transient origin) — all
  // routinely returned to datacentre IPs for links that work perfectly in a browser.
  return "inconclusive"
}

/**
 * A thrown fetch error only counts as broken when the HOST ITSELF does not exist (DNS failure) —
 * that is a real dead end no visitor can reach. Timeouts, TLS handshake failures and connection
 * resets are frequently anti-bot behaviour or transient, so they stay inconclusive.
 */
function errorVerdict(err: unknown): LinkVerdict {
  const blob = `${(err as any)?.code ?? ""} ${(err as any)?.message ?? ""}`.toLowerCase()
  if (/enotfound|eai_again|dns|getaddrinfo|unknown host|name not resolved/.test(blob)) return "broken"
  return "inconclusive"
}

/**
 * Resolve every link and record what actually came back.
 *
 * KLAVITYKLA-347 rewrote the policy here. Previously ANY non-2xx/3xx — or any thrown error — was
 * reported to the user as a broken link. That produced the worst possible failure mode for a tool
 * whose whole job is to demonstrate our quality: telling a prospect their working link is dead.
 * Now a link is only ever reported broken on an UNAMBIGUOUS signal (404/410, or the host not
 * resolving). Everything else is `inconclusive` and is silently not reported.
 *
 * We use GET with a browser User-Agent and follow redirects, because that is what a visitor does.
 * (HEAD is cheaper but is exactly what bot walls and CDNs mishandle, which is how we got here.)
 */
export async function verifyLinks(
  links: PageLink[],
  fetcher: (url: string, init: RequestInit) => Promise<Response>,
  opts: { concurrency?: number; timeoutMs?: number; baseUrl?: string } = {},
): Promise<LinkCheck[]> {
  const concurrency = opts.concurrency ?? 6
  const timeoutMs = opts.timeoutMs ?? 8_000
  const results: LinkCheck[] = new Array(links.length)
  let next = 0

  let baseOrigin: string | null = null
  try {
    baseOrigin = opts.baseUrl ? new URL(opts.baseUrl).origin : null
  } catch { /* leave null — everything is then treated as same-origin-unknown */ }

  const headers = {
    "user-agent": BROWSER_UA,
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
  }

  async function probe(url: string): Promise<{ status: number | null; verdict: LinkVerdict }> {
    try {
      const res = await fetcher(url, {
        method: "GET",
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      })
      // Drain so sockets close promptly; we only care about the status.
      await res.body?.cancel().catch(() => {})
      return { status: res.status, verdict: statusVerdict(res.status) }
    } catch (err) {
      return { status: null, verdict: errorVerdict(err) }
    }
  }

  async function worker() {
    while (true) {
      const i = next++
      if (i >= links.length) return
      const link = links[i]
      const { status, verdict } = await probe(link.href)
      let external = false
      try {
        external = baseOrigin != null && new URL(link.href).origin !== baseOrigin
      } catch { /* unparseable can't happen here — extractLinks already normalised */ }
      results[i] = { href: link.href, text: link.text, status, ok: verdict === "ok", verdict, external }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, links.length) }, worker))
  return results
}

/**
 * Findings for links that UNAMBIGUOUSLY failed — the only broken-link claims we ever emit.
 * `inconclusive` checks produce nothing at all.
 *
 * External links are reported at MEDIUM, not HIGH. We can't control someone else's domain, a
 * third-party 404 is usually a vendor moving a page rather than the customer's bug, and being
 * loudly wrong about another company's site is the most embarrassing way for this tool to fail.
 */
export function brokenLinkFindings(checks: LinkCheck[]): BugFinding[] {
  return checks
    .filter((c) => c.verdict === "broken")
    .map((c) => ({
      what: `Broken link${c.text ? ` "${c.text}"` : ""}`.slice(0, 100),
      where: c.href.slice(0, 120),
      why: c.status === null
        ? "The link's domain doesn't resolve, so a visitor clicking it hits a dead end."
        : `The link returns HTTP ${c.status}, so a visitor clicking it hits an error page.`,
      severity: c.external ? "medium" : "high",
    }))
}

const LINKY = /\blinks?\b|\bhrefs?\b|\banchors?\b|\burls?\b|\bhyperlinks?\b/i
const BREAKY = /\bbroken\b|\bdead\b|\bbrakes?\b|\b404\b|\b500\b|\bnot found\b|\bdoesn'?t work\b|\bdoes not work\b|\bmissing\b|\binvalid\b/i

/**
 * True when a model-authored finding is asserting that a LINK is broken. We drop these
 * unconditionally: link health is verified mechanically above, so anything the model says about
 * it is either redundant (we already found it) or a false positive (we already proved it 2xx).
 */
export function isLinkBreakageClaim(f: { what?: string; where?: string; why?: string }): boolean {
  const what = String(f.what ?? "")
  const blob = `${what} ${String(f.where ?? "")} ${String(f.why ?? "")}`
  return LINKY.test(blob) && BREAKY.test(blob)
}

/**
 * Shortest evidence quote we'll accept. Anything shorter ("NaN" is 3) matches too much text by
 * chance, which would make grounding a rubber stamp.
 */
export const MIN_EVIDENCE_LEN = 6

/** Whitespace/case-insensitive normalisation so a quote survives the model reflowing the text. */
function normalizeForGrounding(s: string): string {
  return s.toLowerCase().replace(/[\s ]+/g, " ").trim()
}

/**
 * FALSE-POSITIVE GATE (KLAVITYKLA-342). A model finding must quote VERBATIM text from the page it
 * was shown; we then check that quote really occurs in that page text. Speculative findings
 * ("the checkout probably fails", "users may be confused") cannot produce a quote that grounds,
 * so they are dropped mechanically instead of being argued with in the prompt.
 *
 * This deliberately does NOT judge whether the quoted thing is genuinely broken — that needs
 * product judgement. It only enforces that every shipped finding is anchored to text that
 * demonstrably exists on the page, which is what killed the reported false positives (findings
 * about elements and states that were never on the page at all).
 */
export function isGrounded(f: BugFinding, pageText: string): boolean {
  const quote = String(f.evidence ?? "").trim()
  if (quote.length < MIN_EVIDENCE_LEN) return false
  return normalizeForGrounding(pageText).includes(normalizeForGrounding(quote))
}

/**
 * Drop model link-breakage claims and ungrounded (speculative/hallucinated) findings, then de-dupe
 * against findings we already produced.
 *
 * `pageText` is the exact text handed to the model. Omit it to skip grounding (used by callers
 * that have already grounded, and keeps this helper usable for the non-qa path).
 */
export function filterModelFindings(findings: BugFinding[], already: BugFinding[], pageText?: string): BugFinding[] {
  const seen = new Set(already.map((f) => f.what.toLowerCase().trim()))
  const out: BugFinding[] = []
  for (const f of findings) {
    if (isLinkBreakageClaim(f)) continue
    if (pageText !== undefined && !isGrounded(f, pageText)) continue
    const key = f.what.toLowerCase().trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(f)
  }
  return out
}

/** Human-readable "here's what we checked" line for the empty/success state. */
export function checkedSummary(inv: PageInventory, linksVerified: number, pages = 1): string {
  const links = linksVerified === 1 ? "resolved 1 link" : `resolved ${linksVerified} links`
  const forms = inv.forms === 1 ? "1 form" : `${inv.forms} forms`
  const buttons = inv.buttons === 1 ? "1 button" : `${inv.buttons} buttons`
  const scope = pages > 1 ? `We read ${pages} pages, ` : "We "
  return `${scope}${links}, and inspected ${forms} and ${buttons}.`
}
