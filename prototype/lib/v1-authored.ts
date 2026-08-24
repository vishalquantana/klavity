// KLA-550 — pure mappers translating an AuthorSession into the v1 "authored run" wire shape.
// Mirrors lib/v1-runs.ts. One responsibility: shape only, no I/O.
import type { AuthorSession } from "./trails-author"

export type V1AuthoredStatus = "authoring" | "completed" | "failed" | "needs_auth" | "cancelled"

export function v1AuthoredStatus(session: Pick<AuthorSession, "status">): V1AuthoredStatus {
  switch (session.status) {
    case "running":
    case "resuming":
      return "authoring"
    case "crystallized":
      return "completed"
    case "needs_auth":
      return "needs_auth"
    case "stalled":
    case "failed":
    default:
      return "failed"
  }
}

export function buildAuthoredRunStatus(session: AuthorSession) {
  return {
    authored_run_id: session.id,
    status: v1AuthoredStatus(session),
    trail_id: session.trailId ?? null,
    verification_run_id: session.verificationRunId ?? null,
    verdict: (session.verificationVerdict ?? null) as "green" | "amber" | "red" | null,
    objective_verified: session.objectiveVerified ?? null,
    stall_reason: session.stallReason ?? null,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  }
}
