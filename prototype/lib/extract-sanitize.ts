const ISSUE_TYPE_ENUM = new Set(["label-copy", "layout", "performance", "flow", "error-handling", "accessibility", "visual"])
const SEVERITY_ENUM = new Set(["high", "medium", "low"])
const SCOPE_ENUM = new Set(["ui", "feature", "workflow", "strategy"])
const PORTABILITY_ENUM = new Set(["portable", "site-specific"])

export interface SanitizedInsight {
  area: string | null
  issueType: string | null
  severity: string | null
  scope: string | null
  portability: string | null
}

export function sanitizeInsight(o: any): SanitizedInsight {
  const area = o.area != null && typeof o.area === "string" && o.area.trim() ? o.area.trim() : null
  const issueType = o.issueType != null && ISSUE_TYPE_ENUM.has(String(o.issueType)) ? String(o.issueType) : null
  const severity = o.severity != null && SEVERITY_ENUM.has(String(o.severity)) ? String(o.severity) : null
  const scope = o.scope != null && SCOPE_ENUM.has(String(o.scope)) ? String(o.scope) : null
  const portability = o.portability != null && PORTABILITY_ENUM.has(String(o.portability)) ? String(o.portability) : null
  return { area, issueType, severity, scope, portability }
}
