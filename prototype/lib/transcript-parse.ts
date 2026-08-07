export type ParsedLine = {
  speaker: string | null
  text: string
  tsSeconds: number | null
  charStart: number
  charEnd: number
}

// Matches a leading timestamp: optional "[", H:MM:SS or MM:SS or M:SS, optional "]".
const TS_RE = /^\s*\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?\s*/
// Matches a leading "Speaker:" (1-40 chars, no digits-only, stops at first colon).
const SPEAKER_RE = /^([A-Za-z][\w .'-]{0,39}?):\s*/

function toSeconds(a: string, b: string, c?: string): number {
  const x = Number(a), y = Number(b), z = c != null ? Number(c) : null
  return z != null ? x * 3600 + y * 60 + z : x * 60 + y
}

export function parseTranscript(rawText: string): ParsedLine[] {
  const out: ParsedLine[] = []
  let i = 0
  for (const line of rawText.split("\n")) {
    const start = i
    const end = i + line.length
    i = end + 1 // consumed "\n"
    if (!line.trim()) continue

    let rest = line
    let tsSeconds: number | null = null
    const tm = rest.match(TS_RE)
    if (tm) {
      tsSeconds = toSeconds(tm[1], tm[2], tm[3])
      rest = rest.slice(tm[0].length)
    }
    let speaker: string | null = null
    const sm = rest.match(SPEAKER_RE)
    if (sm) {
      speaker = sm[1].trim()
      rest = rest.slice(sm[0].length)
    }
    out.push({ speaker, text: rest.trim(), tsSeconds, charStart: start, charEnd: end })
  }
  return out
}

export function offsetToTime(lines: ParsedLine[], offset: number | null): number | null {
  if (offset == null) return null
  for (const ln of lines) {
    if (offset >= ln.charStart && offset < ln.charEnd) return ln.tsSeconds
  }
  return null
}

export function formatTs(tsSeconds: number | null): string | null {
  if (tsSeconds == null) return null
  const s = Math.max(0, Math.floor(tsSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

export function speakersFromLines(lines: ParsedLine[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const ln of lines) {
    if (ln.speaker && !seen.has(ln.speaker)) { seen.add(ln.speaker); out.push(ln.speaker) }
  }
  return out
}
