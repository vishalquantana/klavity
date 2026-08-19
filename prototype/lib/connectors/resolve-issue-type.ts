// Connector-field-mapping: leaf module (no dependency on ./index) so adapters can import
// resolveIssueType directly without creating an import cycle through the registry in index.ts
// (index.ts imports every adapter at module top-level; an adapter importing a VALUE back out of
// index.ts creates a circular init order that breaks under TDZ when the adapter file itself is
// the entry point — see jira.mapping.test.ts). index.ts re-exports these for back-compat.

// `issue_type_map` arrives on cfg (a Record<string,string>) as a JSON STRING (e.g.
// `{"bug":"Bug","feature":"Story","default":"Task"}`), since cfg values are always strings.
// Tolerates an already-parsed object (tests/callers may pass one directly) and never throws on
// malformed JSON — returns null instead so callers fall back gracefully.
export function parseJsonMap(raw: unknown): Record<string, string> | null {
  if (!raw) return null
  if (typeof raw === "object") return raw as Record<string, string>
  if (typeof raw !== "string") return null
  try {
    const o = JSON.parse(raw)
    return o && typeof o === "object" ? o : null
  } catch {
    return null
  }
}

// Resolve which external issue type to use for a given ticket `kind`. Precedence: per-kind entry
// in issue_type_map > issue_type_map.default > legacy cfg.issue_type > caller-supplied fallback.
// Back-compat: a connector with no issue_type_map still works off its legacy `issue_type` field,
// and a connector with neither falls back to `fallback` unchanged.
export function resolveIssueType(
  cfg: Record<string, string>,
  kind: "bug" | "feature" | undefined,
  fallback: string,
): string {
  const map = parseJsonMap((cfg as any).issue_type_map)
  if (map) {
    if (kind && map[kind]) return String(map[kind])
    if (map.default) return String(map.default)
  }
  return cfg.issue_type || fallback
}
