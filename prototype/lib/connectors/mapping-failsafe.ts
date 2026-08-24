// Connector export failsafe (KLA-551): shared, PURE helpers for the "never drop / never
// miscategorize a report" guarantee. No DB, no network — DB callers live in db.ts, adapters
// import these leaf functions to (a) apply the admin's PERMANENT state/label remap before hitting
// the tracker and (b) report a configured state/label NAME that could not be resolved so it can be
// queued for a one-time human fix instead of silently defaulting forever.
//
// The north-star pain is lost/miscategorized reports. The contract every connector honours:
//   • A configured state/label name that does NOT exist in the target tracker must NEVER throw and
//     must NEVER drop the finding. The issue is created with the tracker's DEFAULT state and the
//     unresolved label is OMITTED natively but PRESERVED in the description (as Plane already does).
//   • The unresolved name is surfaced up via ExportResult.unresolvedMappings so the caller can record
//     it on the connector row (pending_mappings + needs_attention) and the admin can map it PERMANENTLY
//     later (state_map / label_map, applied here on all future exports).

import type { ConnectorMeta } from "./index"

// One configured name that resolved to nothing in the target tracker on a given export.
export type UnresolvedMapping = {
  field: "state" | "label"
  requested_name: string
}

// A persisted "needs mapping" queue entry on the connector row (pending_mappings JSON list).
export type PendingMapping = {
  field: "state" | "label"
  requested_name: string
  first_seen: number
  count: number
  sample_finding_id: string | null
}

// Parse a JSON string→string map stored in cfg (state_map / label_map). Never throws — a malformed
// value degrades to an empty map so a corrupt config can never break an export.
export function parseNameMap(raw: string | undefined | null): Record<string, string> {
  if (!raw || typeof raw !== "string") return {}
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.trim()) out[String(k).toLowerCase()] = v
    }
    return out
  } catch {
    return {}
  }
}

// Apply the admin's PERMANENT state remap (cfg.state_map) to a configured state name. Case-insensitive
// on the requested name. Returns the mapped tracker name, or the original when there's no override.
export function applyStateMap(cfg: Record<string, string>, name: string): string {
  const map = parseNameMap(cfg.state_map)
  return map[String(name || "").trim().toLowerCase()] ?? name
}

// Apply the admin's PERMANENT label remap (cfg.label_map) to each label name. Case-insensitive on the
// requested name; unmapped labels pass through unchanged. A mapping to the empty string is treated as
// "no override" (handled by parseNameMap dropping empties), never as "drop this label".
export function applyLabelMap(cfg: Record<string, string>, labels: string[] | undefined): string[] {
  const map = parseNameMap(cfg.label_map)
  return (labels ?? []).map((l) => map[String(l || "").trim().toLowerCase()] ?? l)
}

// Resolve a configured NAME to its tracker id via a list of remote options. Case-insensitive match on
// the option name. Returns the id (or the matched name when the option carries no id) or NULL when the
// name is absent — NEVER throws, so an unresolved name degrades to the tracker default instead of a 4xx.
export function resolveOptionByName(
  options: ConnectorMeta[] | null | undefined,
  name: string,
): { id: string | null; found: boolean } {
  const want = String(name || "").trim().toLowerCase()
  if (!want || !Array.isArray(options)) return { id: null, found: false }
  for (const o of options) {
    if (String(o?.name ?? "").trim().toLowerCase() === want) {
      return { id: o?.id != null ? String(o.id) : String(o?.name ?? ""), found: true }
    }
  }
  return { id: null, found: false }
}

// Merge one unresolved mapping into the connector's pending_mappings list. Deduped on
// (field, requested_name) case-insensitively: an existing entry has its count bumped and keeps its
// first_seen; a new entry is appended. Pure — returns a NEW list, never mutates the input.
export function mergePendingMapping(
  list: PendingMapping[] | null | undefined,
  entry: UnresolvedMapping,
  sampleFindingId: string | null,
  now: number = Date.now(),
): PendingMapping[] {
  const out: PendingMapping[] = Array.isArray(list) ? list.map((p) => ({ ...p })) : []
  const want = String(entry.requested_name || "").trim().toLowerCase()
  const existing = out.find(
    (p) => p.field === entry.field && String(p.requested_name || "").trim().toLowerCase() === want,
  )
  if (existing) {
    existing.count += 1
    if (!existing.sample_finding_id && sampleFindingId) existing.sample_finding_id = sampleFindingId
  } else {
    out.push({
      field: entry.field,
      requested_name: entry.requested_name,
      first_seen: now,
      count: 1,
      sample_finding_id: sampleFindingId,
    })
  }
  return out
}

// Remove a resolved entry from the pending list (called when the admin saves a permanent mapping).
// Pure — returns a NEW list.
export function removePendingMapping(
  list: PendingMapping[] | null | undefined,
  field: "state" | "label",
  requestedName: string,
): PendingMapping[] {
  const want = String(requestedName || "").trim().toLowerCase()
  return (Array.isArray(list) ? list : []).filter(
    (p) => !(p.field === field && String(p.requested_name || "").trim().toLowerCase() === want),
  )
}
