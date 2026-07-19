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

export type LinkCheck = { href: string; text: string; status: number | null; ok: boolean }

export type BugFinding = { what: string; where: string; why: string; severity: string }

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
 * Real anchors from the raw HTML, absolutised against `baseUrl` and deduped by href.
 * Non-navigational schemes (mailto:, tel:, javascript:, #fragment-only) are skipped — there is
 * nothing to HTTP-verify there, and flagging them would recreate the false-positive problem.
 */
export function extractLinks(html: string, baseUrl: string, limit = MAX_LINKS_CHECKED): PageLink[] {
  const out: PageLink[] = []
  const seen = new Set<string>()
  const re = /<a\b[^>]*\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s">]+))[^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const rawHref = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "").trim()
    if (!rawHref || rawHref.startsWith("#")) continue
    if (/^(mailto|tel|javascript|data|sms):/i.test(rawHref)) continue
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
    const text = decodeEntities(m[5].replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80)
    out.push({ href, text })
    if (out.length >= limit) break
  }
  return out
}

/**
 * Resolve every link and record what actually came back. A link only counts as broken on a real
 * 4xx/5xx or a connection failure — 2xx/3xx (and anything we couldn't classify) is treated as
 * working, because a false "your link is broken" is the credibility event we're eliminating.
 *
 * HEAD first (cheap); some servers answer HEAD with 405/501 or 404 while GET is fine, so those
 * statuses are re-checked with GET before we call anything broken.
 */
export async function verifyLinks(
  links: PageLink[],
  fetcher: (url: string, init: RequestInit) => Promise<Response>,
  opts: { concurrency?: number; timeoutMs?: number } = {},
): Promise<LinkCheck[]> {
  const concurrency = opts.concurrency ?? 6
  const timeoutMs = opts.timeoutMs ?? 5_000
  const results: LinkCheck[] = new Array(links.length)
  let next = 0

  const headers = { "user-agent": "KlavityBot/1.0 (+https://klavity.in)" }
  async function probe(url: string, method: "HEAD" | "GET"): Promise<number | null> {
    try {
      const res = await fetcher(url, { method, headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) })
      // Drain so sockets close promptly; we only care about the status.
      await res.body?.cancel().catch(() => {})
      return res.status
    } catch {
      return null
    }
  }

  async function worker() {
    while (true) {
      const i = next++
      if (i >= links.length) return
      const link = links[i]
      let status = await probe(link.href, "HEAD")
      // HEAD is unreliable on a lot of real hosts — confirm any failure with a GET before we
      // ever tell a user their link is broken.
      if (status === null || status >= 400) status = await probe(link.href, "GET")
      results[i] = { href: link.href, text: link.text, status, ok: status !== null && status < 400 }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, links.length) }, worker))
  return results
}

/** Findings for links that genuinely failed — the only broken-link claims we ever emit. */
export function brokenLinkFindings(checks: LinkCheck[]): BugFinding[] {
  return checks
    .filter((c) => !c.ok)
    .map((c) => ({
      what: `Broken link${c.text ? ` "${c.text}"` : ""}`.slice(0, 100),
      where: c.href.slice(0, 120),
      why: c.status === null
        ? "The link didn't respond, so a visitor clicking it hits a dead end."
        : `The link returns HTTP ${c.status}, so a visitor clicking it hits an error page.`,
      severity: "high",
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

/** Drop model link-breakage claims, then de-dupe against findings we already produced. */
export function filterModelFindings(findings: BugFinding[], already: BugFinding[]): BugFinding[] {
  const seen = new Set(already.map((f) => f.what.toLowerCase().trim()))
  const out: BugFinding[] = []
  for (const f of findings) {
    if (isLinkBreakageClaim(f)) continue
    const key = f.what.toLowerCase().trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(f)
  }
  return out
}

/** Human-readable "here's what we checked" line for the empty/success state. */
export function checkedSummary(inv: PageInventory, linksVerified: number): string {
  const parts: string[] = []
  parts.push(linksVerified === 1 ? "resolved 1 link" : `resolved ${linksVerified} links`)
  parts.push(inv.forms === 1 ? "1 form" : `${inv.forms} forms`)
  parts.push(inv.buttons === 1 ? "1 button" : `${inv.buttons} buttons`)
  return `We ${parts[0]}, and inspected ${parts[1]} and ${parts[2]}.`
}
