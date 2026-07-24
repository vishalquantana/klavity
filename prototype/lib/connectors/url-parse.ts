// KLAVITYKLA-392 — "Paste your project URL" connector autofill.
//
// A founder setting up a tracker connector shouldn't have to reverse-engineer
// "API Host", "Workspace Slug" and "Project ID" out of the one URL they already
// have open — their project page. These helpers take that single URL and derive
// the raw connector config fields it implies.
//
// Contract: NEVER guess. Any field the URL can't determine is left ABSENT from
// the returned object, so callers merge only what's known and leave the rest to
// manual entry. Junk / non-URLs yield an empty object.
//
// This module is the tested source of truth for the parsing rules. The dashboard
// form (prototype/public/dashboard.html) carries a hand-mirrored client copy of
// the same rules (it's static client JS and can't import this TS) — keep the two
// in lockstep; these tests pin the behaviour.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Jira project keys: start with a letter, then letters/digits (e.g. "PROJ", "ABC2").
const JIRA_KEY_RE = /^[A-Za-z][A-Za-z0-9]{0,29}$/

// Accept a URL with or without scheme; trim whitespace and normalise. Returns
// null when the input isn't a plausible tracker URL — in particular a host with
// no dot (rejects bare junk words like "randomtext" once we prepend a scheme).
function toUrl(raw: string): URL | null {
  if (!raw) return null
  let s = String(raw).trim()
  if (!s) return null
  if (!/^https?:\/\//i.test(s)) s = "https://" + s
  let u: URL
  try {
    u = new URL(s)
  } catch {
    return null
  }
  if (!u.hostname.includes(".")) return null
  return u
}

// Path segments, empties (from leading/trailing/double slashes) dropped.
function segments(u: URL): string[] {
  return u.pathname
    .split("/")
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s)
      } catch {
        return s
      }
    })
}

// Scheme + host, no trailing slash — the server origin the connector wants as "host".
function origin(u: URL): string {
  return `${u.protocol}//${u.host}`
}

// Plane: https://<host>/<workspace>/projects/<uuid>/issues/...
//   → { host, workspace, project_id }
// A bare origin (no /projects/) still yields { host }, which is useful on its own.
export function parsePlaneUrl(raw: string): Record<string, string> {
  const u = toUrl(raw)
  if (!u) return {}
  const parts = segments(u)
  const out: Record<string, string> = { host: origin(u) }
  const pi = parts.indexOf("projects")
  if (pi > 0) out.workspace = parts[pi - 1]
  if (pi >= 0 && parts[pi + 1] && UUID_RE.test(parts[pi + 1])) {
    out.project_id = parts[pi + 1]
  }
  return out
}

// Jira Cloud:
//   https://<site>.atlassian.net/jira/software/projects/<KEY>/...
//   https://<site>.atlassian.net/browse/<KEY>-123
//   → { host, project_key }
// Email + API token can't come from a URL, so they're left for manual entry.
export function parseJiraUrl(raw: string): Record<string, string> {
  const u = toUrl(raw)
  if (!u) return {}
  const parts = segments(u)
  const out: Record<string, string> = { host: origin(u) }
  const key = extractJiraKey(parts)
  if (key) out.project_key = key
  return out
}

function extractJiraKey(parts: string[]): string | null {
  // .../browse/<KEY>-123  or  .../browse/<KEY>
  const bi = parts.indexOf("browse")
  if (bi >= 0 && parts[bi + 1]) {
    const k = parts[bi + 1].replace(/-\d+$/, "")
    if (JIRA_KEY_RE.test(k)) return k.toUpperCase()
  }
  // .../projects/<KEY>/...  (also covers /jira/software/c/projects/<KEY>)
  const pi = parts.indexOf("projects")
  if (pi >= 0 && parts[pi + 1]) {
    const k = parts[pi + 1]
    if (JIRA_KEY_RE.test(k)) return k.toUpperCase()
  }
  return null
}

// Linear:
//   https://linear.app/<workspace>/project/<slug-uuid>
//   https://linear.app/<workspace>/team/<TEAM-KEY>/...
//   https://linear.app/<workspace>/issue/<TEAM-KEY>-123
//   → { workspace, project?, team? }
//
// NOTE: the Linear connector's fields are `api_key` + `team_id` (a UUID), neither
// of which a URL can supply (URLs expose the human team KEY, not its UUID). So the
// dashboard form does NOT wire URL-paste for Linear — but the parser still models
// Linear URLs for completeness / future use, and the tests pin it.
export function parseLinearUrl(raw: string): Record<string, string> {
  const u = toUrl(raw)
  if (!u) return {}
  if (!/(^|\.)linear\.app$/i.test(u.hostname)) return {}
  const parts = segments(u)
  const out: Record<string, string> = {}
  if (parts[0]) out.workspace = parts[0]
  const pri = parts.indexOf("project")
  if (pri >= 0 && parts[pri + 1]) out.project = parts[pri + 1]
  const ti = parts.indexOf("team")
  if (ti >= 0 && parts[ti + 1]) out.team = parts[ti + 1]
  const ii = parts.indexOf("issue")
  if (ii >= 0 && parts[ii + 1]) out.team = parts[ii + 1].replace(/-\d+.*$/, "")
  return out
}

// Dispatch on connector type. Unknown types yield {} (no autofill).
export function parseTrackerUrl(type: string, raw: string): Record<string, string> {
  switch (type) {
    case "plane":
      return parsePlaneUrl(raw)
    case "jira":
      return parseJiraUrl(raw)
    case "linear":
      return parseLinearUrl(raw)
    default:
      return {}
  }
}
