// Pure types + cacheKey hash for Klavity OS "Trails". No db/runtime imports.

export type TrailStatus = "draft" | "active" | "paused" | "archived"
export type AuthorKind = "llm" | "human" | "mixed"
export type StepAction = "navigate" | "click" | "type" | "select" | "assert" | "wait" | "hover" | "keyPress" | "clearField" | "callModule" | "pauseForSecret"
export type Tier = "cache" | "candidate" | "vision" | "none"
export type Verdict = "green" | "amber" | "red" | "skip"
export type FailureKind = "crash" | "regression"
export type FailureClass =
  | "locator_drift" | "timing" | "test_data" | "runtime_error"
  | "visual" | "interaction_change" | "regression" | "unknown"
export type FindingKind = "regression" | "visual" | "amber_heal"
export type FindingStatus = "queued" | "auto_filed" | "filed" | "dismissed"
export type TrailViewportPreset = "desktop" | "mobile"

export interface TrailViewport {
  width: number
  height: number
  preset?: TrailViewportPreset
  isMobile?: boolean
  deviceScaleFactor?: number
}

export interface Fingerprint {
  role?: string
  accessibleName?: string
  text?: string
  testId?: string
  domPath?: string
  bbox?: [number, number, number, number]
  screenshotKey?: string
}

/** KLA-93: named environment override for a trail — e.g. staging vs prod. */
export interface TrailEnvironment {
  name: string
  baseUrl: string
}

export interface Trail {
  id: string; projectId: string; name: string; intent: string; baseUrl: string
  viewport: TrailViewport | null
  baselineRef: string | null; authorKind: AuthorKind; status: TrailStatus
  createdBy: string | null; createdAt: number; updatedAt: number
  stepVersion: number
  schedule: string | null         // 5-field cron expression, null = no schedule
  /**
   * KLA-277 (JTBD 4.13): IANA timezone the `schedule` cron is expressed in (e.g. "America/New_York").
   * When set, the cron is interpreted as LOCAL wall-clock in this zone and the UTC fire instant is
   * computed per occurrence, so a 9am-local guard survives DST. Null = legacy baked-UTC cron.
   */
  scheduleTz: string | null
  scheduledLastRunAt: number | null  // epoch ms when last scheduled walk was triggered
  /** KLA-73: persona chosen to judge walk results for this Trail. Null = no judge assigned. */
  judgePersonaId: string | null
  objectiveVerified?: boolean | null
  /** KLA-93: named environments (e.g. staging, prod). Empty = only baseUrl is available. */
  environments: TrailEnvironment[]
}


/** One persona's verdict on a single finding produced by a Walk. */
export interface PersonaVerdict {
  findingId: string
  verdict: "valid" | "false_positive" | "clarify"
  confidence: number
  rationale: string
}

/** A complete persona-judged review of all findings from one Walk. */
export interface WalkJudgment {
  id: string
  projectId: string
  runId: string
  personaId: string
  personaName: string
  verdicts: PersonaVerdict[]
  /** Optional overall summary the persona offers across all findings. */
  overallNote: string | null
  createdAt: number
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
  /** KLA-67: optional per-step action timeout (ms). Overrides the runner's adaptive default. */
  timeoutMs?: number
}

export interface LocatorCacheRow {
  id: string; projectId: string; trailId: string; stepId: string
  cacheKey: string; resolvedSelector: string; fingerprint: Fingerprint | null
  confidence: number; source: "crystallize" | "heal"; createdAt: number; updatedAt: number
}

export interface Walk {
  id: string; trailId: string; projectId: string; trigger: "manual"
  /** running = in progress; paused = waiting for a secret via POST /resume; needs_auth = stopped at auth gate; finished verdicts below */
  status: "running" | "paused" | "needs_auth" | Verdict; llmCalls: number; trailVersion: number
  summary: Record<string, unknown> | null; startedAt: number; finishedAt: number | null
  /** KLA-93: name of the environment this walk ran against. Null = default (trail.baseUrl). */
  environmentName: string | null
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
  groundQuote: string | null; confidence: number; dedupKey: string; contentSig: string | null; recurrence: number
  /** KLA-168: computed priority (renamed from severity). NULL on legacy rows — use severityForKind(kind) as fallback. */
  priority: string | null
  status: FindingStatus; connectorRef: string | null; connectorError: string | null
  createdAt: number; updatedAt: number
}

// ── Trail Modules (KLA-106): named reusable step-groups ──────────────────────────────────────────

/**
 * A named, reusable group of steps. Trails reference modules via a `callModule` step whose
 * `actionValue` is `JSON.stringify({ moduleId, params })`. At runtime, `expandModuleSteps`
 * (trails-modules.ts) inlines the module's steps with `{{param:name}}` substitution applied.
 */
export interface TrailModule {
  id: string
  projectId: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

/** A single step stored inside a TrailModule. Same shape as TrailStep but references moduleId. */
export interface TrailModuleStep {
  id: string
  moduleId: string
  projectId: string
  idx: number
  action: Exclude<StepAction, "callModule">  // modules cannot nest callModule (v1)
  actionValue: string | null
  target: Fingerprint | null
  checkpoint: Checkpoint | null
  createdAt: number
}

/** Params passed at a callModule call site: `Record<paramName, resolvedValue>`. */
export type ModuleParams = Record<string, string>

// ── Network mocking (KLA-111) ─────────────────────────────────────────────────────────────────────
export type NetworkMockAction = "stub" | "block"

/**
 * Intercept a URL pattern during a Walk or author drive.
 * - "stub": return a canned HTTP response (status/body/contentType/headers).
 * - "block": abort the request (simulates network failure or ad/tracker blocking).
 * `url` is a substring or glob pattern matched against the full request URL.
 */
export interface NetworkMock {
  /** Substring matched against the full request URL (e.g. "api.example.com/users" matches "https://api.example.com/users?page=1"). */
  url: string
  action: NetworkMockAction
  /** HTTP status for stub responses. Default 200. */
  status?: number
  /** Response body string for stub responses. Default "". */
  body?: string
  /** Content-Type header for stub responses. Default "application/json". */
  contentType?: string
  /** Additional response headers for stub responses. */
  headers?: Record<string, string>
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
