// Report-clarity heuristic — the "password strength, for bug reports" scorer. Pure + zero-cost + no
// network: runs on every keystroke in the composer to render a live meter + coverage chips + status label.
// A separate debounced cheap-LLM tip (server /api/report/clarity) layers a specific suggestion on top, but
// this file never calls out — it's synchronous and deterministic so it's trivially unit-testable.
//
// Coverage detected (each a boolean chip):
//   problem  — "what's broken": concrete content beyond the vague filler phrases below.
//   expected — "what you expected": expected / should / instead / supposed to.
//   repro    — "how to reproduce": when i / steps / click / tap / then / go to, OR a URL / path.
//
// score = number of covered flags (0..3). level: 3 -> great, 2 -> good, 0..1 -> needs.

export interface ClarityCoverage {
  /** "what's broken" — a concrete noun/verb beyond the vague phrases. */
  problem: boolean
  /** "what you expected" — expected / should / instead / supposed to. */
  expected: boolean
  /** "how to reproduce" — a step verb / sequencer, or a URL / path. */
  repro: boolean
}

export type ClarityLevel = 'needs' | 'good' | 'great'

export interface ClarityScore {
  /** Count of covered flags, 0..3 — drives the meter fill. */
  score: number
  coverage: ClarityCoverage
  /** 'needs' (0..1) | 'good' (2) | 'great' (3). */
  level: ClarityLevel
  /** Short status label for the helper ("Needs detail" | "Good" | "Great"). */
  label: string
  /** Whether the raw text is one of / dominated by the vague filler phrases. */
  vague: boolean
}

// Low-signal phrases that read as "something's wrong" but give the team nothing to act on. Matched
// case-insensitively as substrings; also stripped before the problem-coverage content-word count so a
// report that is ONLY filler ("not working", "broken pls fix") scores no coverage.
export const VAGUE_PHRASES: string[] = [
  'not working',
  "doesn't work",
  'does not work',
  "doesnt work",
  'broken',
  'pls fix',
  'please fix',
  'fix it',
  'help',
]

// Sequencer / step verbs + intent openers that signal a reproduction path.
const REPRO_RE = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i
// A URL or a leading path segment (/checkout, /api/x) also counts as a concrete repro anchor.
const PATH_RE = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i
// "What you expected" markers.
const EXPECTED_RE = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i

// Minimal stopword set for the problem content-word count (articles / pronouns / copulas / conjunctions).
const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'its', 'i', 'im', "i'm", 'and', 'or',
  'to', 'of', 'my', 'me', 'this', 'that', 'but', 'no', 'not', 'on', 'in', 'at', 'so', 'as', 'do', 'does',
  'did', 'has', 'have', 'had', 'with', 'for', 'you', 'your', 'we', 'they', 'he', 'she', 'from', 'by',
])

const LABELS: Record<ClarityLevel, string> = { needs: 'Needs detail', good: 'Good', great: 'Great' }

/** Strip every vague phrase from the text (case-insensitive) — used before counting real content words. */
function stripVague(lower: string): string {
  let out = lower
  for (const p of VAGUE_PHRASES) out = out.split(p).join(' ')
  return out
}

/** Count content words (len >= 3, not a stopword, alphabetic-ish) in the vague-stripped text. */
function contentWordCount(strippedLower: string): number {
  const words = strippedLower.split(/[^a-z0-9]+/i).filter(Boolean)
  let n = 0
  for (const w of words) {
    if (w.length < 3) continue
    if (STOPWORDS.has(w)) continue
    n++
  }
  return n
}

/**
 * Score the in-progress report description. Deterministic + synchronous.
 * Empty / whitespace text -> level 'needs', all flags false.
 */
export function scoreReportClarity(text: string): ClarityScore {
  const raw = (text || '').trim()
  const lower = raw.toLowerCase()
  const stripped = stripVague(lower)
  const content = contentWordCount(stripped)

  // Is the text purely / mostly filler? (no real content survived the vague strip)
  const vague = raw.length > 0 && VAGUE_PHRASES.some((p) => lower.includes(p)) && content < 3

  // (a) what's broken — needs a few concrete content words beyond the filler, and a bit of length so a
  //     single stray noun doesn't tick it green.
  const problem = content >= 3 && raw.length >= 12
  // (b) what you expected
  const expected = EXPECTED_RE.test(lower)
  // (c) how to reproduce — a step verb/sequencer OR a URL/path anchor.
  const repro = REPRO_RE.test(lower) || PATH_RE.test(raw)

  const coverage: ClarityCoverage = { problem, expected, repro }
  const score = (problem ? 1 : 0) + (expected ? 1 : 0) + (repro ? 1 : 0)
  const level: ClarityLevel = score >= 3 ? 'great' : score === 2 ? 'good' : 'needs'
  return { score, coverage, level, label: LABELS[level], vague }
}

/**
 * Whether a debounced cheap-LLM tip is worth fetching for this text: non-trivial length AND not already
 * Great (a clear report needs no nudge). Mirrors the mockup — the AI line hides once clarity is Great.
 */
export function shouldFetchClarityTip(text: string): boolean {
  const t = (text || '').trim()
  if (t.length <= 15) return false
  return scoreReportClarity(t).level !== 'great'
}

/**
 * Whether Submit should surface the soft pre-submit nudge: the reporter typed something, but it's still
 * in the weakest 'needs' band. NEVER a hard block — the caller always lets "Submit anyway" through.
 * Empty descriptions (evidence-only reports) are not nudged.
 */
export function shouldNudgeOnSubmit(text: string): boolean {
  const t = (text || '').trim()
  if (t.length === 0) return false
  return scoreReportClarity(t).level === 'needs'
}

// ── KLAVITYKLA-492: never let a coach tip ASK the reporter for something Klavity already captures ────
// The widget auto-captures the page URL, screenshot(s), and the reporter's browser/UA + screen size on
// EVERY report, and (since the context-forwarding half of this ticket) the server prompt already tells
// the coach LLM to never request them. But prompts drift — a stale model can still emit "please attach a
// screenshot of your browser settings at https://…". This is the client-side backstop: a tip that asks
// for an auto-captured field is suppressed instead of rendered. Pure + deterministic + unit-testable.

/** Substrings (lowercase) whose presence means the tip is asking for data Klavity attaches automatically. */
const AUTO_CAPTURED_ASKS: string[] = [
  'screenshot', 'screen shot', 'screengrab', 'screen grab', 'snip',
  'url', 'link to the page', 'page link', 'web address', 'address bar',
  'browser name', 'browser version', 'which browser', 'what browser', 'your browser',
  'user agent', 'user-agent',
  'operating system', 'os version', 'which os', 'what os',
  'device type', 'screen size', 'window size', 'viewport size', 'resolution',
]

/**
 * Whether a clarity TIP is asking the reporter for anything Klavity has ALREADY captured automatically
 * (page URL / screenshot / browser+UA / OS / screen or window size). Such a tip wastes the reporter's
 * time — it must be suppressed, not shown. Deterministic; used by the composer before rendering a tip.
 */
export function suppressesAutoCapturedAsk(tip: string): boolean {
  const t = (tip || '').toLowerCase()
  if (!t) return false
  return AUTO_CAPTURED_ASKS.some((ask) => t.includes(ask))
}
