// Pure types + cacheKey hash for Klavity OS "Trails". No db/runtime imports.

export type TrailStatus = "draft" | "active" | "paused" | "archived"
export type AuthorKind = "llm" | "human" | "mixed"
export type StepAction = "navigate" | "click" | "type" | "select" | "assert" | "wait"
export type Tier = "cache" | "candidate" | "vision" | "none"
export type Verdict = "green" | "amber" | "red" | "skip"
export type FailureClass =
  | "locator_drift" | "timing" | "test_data" | "runtime_error"
  | "visual" | "interaction_change" | "regression" | "unknown"
export type FindingKind = "regression" | "visual" | "amber_heal"
export type FindingStatus = "queued" | "auto_filed" | "filed" | "dismissed"

export interface Fingerprint {
  role?: string
  accessibleName?: string
  text?: string
  testId?: string
  domPath?: string
  bbox?: [number, number, number, number]
  screenshotKey?: string
}

export interface Trail {
  id: string; projectId: string; name: string; intent: string; baseUrl: string
  baselineRef: string | null; authorKind: AuthorKind; status: TrailStatus
  createdBy: string | null; createdAt: number; updatedAt: number
  stepVersion: number
}

export type CheckpointKind = "visible" | "textEquals" | "textContains" | "urlMatches" | "elementCount"

export interface Checkpoint {
  description: string
  /** Defaults to "visible" for legacy rows that never persisted a kind. */
  kind?: CheckpointKind
  value?: string     // textEquals / textContains
  regex?: string     // urlMatches
  count?: number     // elementCount
}

export interface TrailStep {
  id: string; trailId: string; projectId: string; idx: number
  action: StepAction; actionValue: string | null
  target: Fingerprint | null; checkpoint: Checkpoint | null; createdAt: number
}

export interface LocatorCacheRow {
  id: string; projectId: string; trailId: string; stepId: string
  cacheKey: string; resolvedSelector: string; fingerprint: Fingerprint | null
  confidence: number; source: "crystallize" | "heal"; createdAt: number; updatedAt: number
}

export interface Walk {
  id: string; trailId: string; projectId: string; trigger: "manual"
  status: "running" | Verdict; llmCalls: number; trailVersion: number
  summary: Record<string, unknown> | null; startedAt: number; finishedAt: number | null
}

export interface RunStep {
  id: string; runId: string; trailId: string; stepId: string; projectId: string
  idx: number; tier: Tier; verdict: Verdict; confidence: number
  diagnosis: FailureClass | null; healed: boolean
  evidence: Record<string, unknown> | null; createdAt: number
}

export interface Finding {
  id: string; projectId: string; runId: string; stepId: string | null; trailId: string
  kind: FindingKind; title: string; evidence: Record<string, unknown> | null
  groundQuote: string | null; confidence: number; dedupKey: string; recurrence: number
  status: FindingStatus; connectorRef: string | null; connectorError: string | null
  createdAt: number; updatedAt: number
}

function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw)
    u.hash = ""
    u.searchParams.sort()
    return u.toString()
  } catch {
    return raw
  }
}

export async function cacheKey(method: string, url: string, domHash: string, projectId: string): Promise<string> {
  const input = `${method}|${normalizeUrl(url)}|${domHash}|${projectId}`
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("")
}
