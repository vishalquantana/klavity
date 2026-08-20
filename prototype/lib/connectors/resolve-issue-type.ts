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

// PX4 #411: the ticket kinds Klavity can file. "task"/"query" join the original bug/feature. They have
// NO hardcoded external mapping — by default they resolve to the tracker's DEFAULT issue type (issue_type_map
// .default), and an admin can override where each lands per-project by adding a "task"/"query" entry to the
// connector's issue_type_map (the same config the bug/feature mapping already flows through).
export type IssueKind = "bug" | "feature" | "task" | "query"

// Resolve which external issue type to use for a given ticket `kind`. Precedence: per-kind entry
// in issue_type_map > issue_type_map.default > legacy cfg.issue_type > caller-supplied fallback.
// Back-compat: a connector with no issue_type_map still works off its legacy `issue_type` field,
// and a connector with neither falls back to `fallback` unchanged. For "task"/"query" with no explicit
// per-kind override, the map.default branch delivers the tracker's default issue type (the signed-off rule).
export function resolveIssueType(
  cfg: Record<string, string>,
  kind: IssueKind | undefined,
  fallback: string,
): string {
  const map = parseJsonMap((cfg as any).issue_type_map)
  if (map) {
    if (kind && map[kind]) return String(map[kind])
    if (map.default) return String(map.default)
  }
  return cfg.issue_type || fallback
}
