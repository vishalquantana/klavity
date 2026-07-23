// KLAVITYKLA-126 — AutoSim environment determinism + trace artifact: storage layer.
//
// "Zero-LLM deterministic replay" (Tier 0 cached selectors) makes SELECTOR resolution deterministic,
// but the ENVIRONMENT (live network / clock / backend state) is not — so the same Trail can green or
// red on backend state alone. This module persists two opt-in, flag-gated artifacts that make the
// environment reproducible, stored gzipped in walk_artifacts (mirrors the walk_replays gzip+base64
// scheme; ~20-100x smaller than raw):
//
//   • HAR   (kind='har')   — an HTTP Archive recorded on the FIRST GREEN walk of a Trail, then replayed
//                            via Playwright's context.routeFromHAR on later walks so network responses
//                            are frozen (true network determinism). Keyed by TRAIL (a later walk of the
//                            same trail reads it back). Recorded once; the first green baseline wins.
//   • TRACE (kind='trace')  — a Playwright trace zip (screenshots + DOM snapshots + actions) for a single
//                            run, for after-the-fact debugging via `npx playwright show-trace <zip>`.
//                            Keyed by RUN, exactly like a walk replay.
//
// All I/O here is best-effort at the call site (the runner try/catches every call): a storage failure
// must never change a walk verdict.
import { db } from "./db"

export type WalkArtifactKind = "har" | "trace"

/** Persist a raw artifact (HAR JSON bytes or a trace zip) gzipped+base64 into walk_artifacts. */
export async function saveWalkArtifact(opts: {
  projectId: string
  kind: WalkArtifactKind
  bytes: Uint8Array
  trailId?: string | null
  runId?: string | null
}): Promise<void> {
  const gz = Buffer.from(Bun.gzipSync(Buffer.from(opts.bytes))).toString("base64")
  await db!.execute({
    sql: `INSERT INTO walk_artifacts (id, project_id, trail_id, run_id, kind, artifact_gz, byte_size, created_at)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [
      "wa_" + crypto.randomUUID(),
      opts.projectId,
      opts.trailId ?? null,
      opts.runId ?? null,
      opts.kind,
      gz,
      opts.bytes.byteLength,
      Date.now(),
    ],
  })
}

/** The latest HAR recorded for a Trail as raw bytes (gunzipped), or null when none exists. */
export async function getHarForTrail(projectId: string, trailId: string): Promise<Buffer | null> {
  const r = await db!.execute({
    sql: `SELECT artifact_gz FROM walk_artifacts WHERE project_id=? AND trail_id=? AND kind='har'
          ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, trailId],
  })
  if (!r.rows.length) return null
  return Buffer.from(Bun.gunzipSync(Buffer.from(String((r.rows[0] as any).artifact_gz), "base64")))
}

/** Cheap existence probe: does this Trail already have a recorded HAR? Decides record-vs-replay. */
export async function hasHarForTrail(projectId: string, trailId: string): Promise<boolean> {
  const r = await db!.execute({
    sql: `SELECT 1 FROM walk_artifacts WHERE project_id=? AND trail_id=? AND kind='har' LIMIT 1`,
    args: [projectId, trailId],
  })
  return r.rows.length > 0
}

/** The latest Playwright trace zip for a run as raw bytes (gunzipped), or null when none exists. */
export async function getTraceForRun(projectId: string, runId: string): Promise<Buffer | null> {
  const r = await db!.execute({
    sql: `SELECT artifact_gz FROM walk_artifacts WHERE project_id=? AND run_id=? AND kind='trace'
          ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, runId],
  })
  if (!r.rows.length) return null
  return Buffer.from(Bun.gunzipSync(Buffer.from(String((r.rows[0] as any).artifact_gz), "base64")))
}
