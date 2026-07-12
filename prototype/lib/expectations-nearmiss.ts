// prototype/lib/expectations-nearmiss.ts
// KLA-251 (B.11): cross-source matching instrumentation + the deferred embeddings pass.
//
// Two responsibilities:
//   1. logNearMisses / nearMissSummary — record & report the pairs the 0.82 lexical thread
//      DECLINED but that scored in the near-miss band. This is the measurement that decides
//      whether the embeddings upgrade is worth building.
//   2. embeddingsRematch — Phase 2, FLAG-GATED (KLAV_EXP_EMBEDDINGS=1). For a candidate the
//      lexical pass could not match, an embeddings-similarity second pass may recover a true
//      cross-source match. Off by default; evaluated against the logged near-misses first.
//
// Like the other spine ingest helpers this NEVER throws into callers — every export is
// best-effort and swallows its own errors (instrumentation must not break the ingest path).
import type { Client } from "@libsql/client"
import type { NearMiss, SourceKind } from "./expectations"

/** Persist a batch of declined near-miss pairs for one incoming candidate. Best-effort. */
export async function logNearMisses(c: Client, args: {
  projectId: string
  candTitle: string
  candKind: SourceKind
  existingKinds?: SourceKind[]
  nearMisses: NearMiss[]
  threshold: number
}): Promise<void> {
  if (!args.nearMisses.length) return
  const now = Date.now()
  const existingKindsJson = JSON.stringify([...new Set(args.existingKinds ?? [])])
  try {
    for (const nm of args.nearMisses) {
      await c.execute({
        sql: `INSERT INTO expectation_near_misses
              (id, project_id, cand_title, existing_id, existing_title, cand_kind, existing_kinds_json, score, threshold, created_at)
              VALUES (?,?,?,?,?,?,?,?,?,?)`,
        args: [
          "nm_" + crypto.randomUUID(),
          args.projectId,
          args.candTitle.slice(0, 200),
          nm.existingId,
          nm.existingTitle.slice(0, 200),
          args.candKind,
          existingKindsJson,
          nm.score,
          args.threshold,
          now,
        ],
      })
    }
  } catch (e) {
    console.warn("[expectations] logNearMisses skipped:", String(e))
  }
}

export type NearMissRow = {
  id: string; projectId: string; candTitle: string; existingId: string; existingTitle: string
  candKind: string | null; existingKinds: string[]; score: number; threshold: number; createdAt: number
}

function nmRowTo(x: any): NearMissRow {
  return {
    id: x.id, projectId: x.project_id, candTitle: x.cand_title, existingId: x.existing_id,
    existingTitle: x.existing_title, candKind: x.cand_kind ?? null,
    existingKinds: JSON.parse(x.existing_kinds_json || "[]"),
    score: Number(x.score), threshold: Number(x.threshold), createdAt: Number(x.created_at),
  }
}

/** Raw near-miss rows for one project (most recent first). Used by sampling / evaluation. */
export async function listNearMisses(c: Client, projectId: string, opts?: { sinceMs?: number; limit?: number }): Promise<NearMissRow[]> {
  const since = opts?.sinceMs ?? 0
  const limit = Math.min(Math.max(opts?.limit ?? 500, 1), 2000)
  const r = await c.execute({
    sql: "SELECT * FROM expectation_near_misses WHERE project_id=? AND created_at>=? ORDER BY created_at DESC LIMIT ?",
    args: [projectId, since, limit],
  })
  return r.rows.map(nmRowTo)
}

export type NearMissSummary = {
  projectId: string
  windowMs: number | null
  count: number
  avgScore: number
  minScore: number
  maxScore: number
  // A few representative pairs (highest-scoring — most likely true matches) for eyeballing / sampling.
  samples: Array<{ candTitle: string; existingTitle: string; score: number; candKind: string | null; existingKinds: string[] }>
}

/**
 * Summarize near-miss volume per project over an optional time window. This is the report
 * that decides the embeddings upgrade: high count + high avg score in the band = the lexical
 * thread is under-matching real cross-source pairs.
 */
export async function nearMissSummary(c: Client, projectId: string, opts?: { sinceMs?: number; sampleN?: number }): Promise<NearMissSummary> {
  const since = opts?.sinceMs ?? 0
  const sampleN = Math.min(Math.max(opts?.sampleN ?? 10, 1), 50)
  const agg = await c.execute({
    sql: `SELECT COUNT(*) AS n, AVG(score) AS avg_s, MIN(score) AS min_s, MAX(score) AS max_s
          FROM expectation_near_misses WHERE project_id=? AND created_at>=?`,
    args: [projectId, since],
  })
  const a = agg.rows[0] as any
  const count = Number(a?.n ?? 0)
  const sampleRows = count
    ? (await c.execute({
        sql: `SELECT * FROM expectation_near_misses WHERE project_id=? AND created_at>=?
              ORDER BY score DESC LIMIT ?`,
        args: [projectId, since, sampleN],
      })).rows.map(nmRowTo)
    : []
  return {
    projectId,
    windowMs: opts?.sinceMs ? Date.now() - opts.sinceMs : null,
    count,
    avgScore: count ? Number(a.avg_s) : 0,
    minScore: count ? Number(a.min_s) : 0,
    maxScore: count ? Number(a.max_s) : 0,
    samples: sampleRows.map((r) => ({
      candTitle: r.candTitle, existingTitle: r.existingTitle, score: r.score,
      candKind: r.candKind, existingKinds: r.existingKinds,
    })),
  }
}

// ── Phase 2: embeddings similarity pass (FLAG-GATED, default OFF) ───────────────────────────────
// Only fires for a candidate the LEXICAL pass could not match. Behind KLAV_EXP_EMBEDDINGS so it
// can be A/B evaluated against the logged near-misses before being enabled by default.

export function embeddingsEnabled(): boolean {
  return process.env.KLAV_EXP_EMBEDDINGS === "1"
}

/** Default accept threshold for the embeddings pass. Higher than lexical because embedding
 *  cosine is denser; overridable via env for evaluation runs. */
export const EMBED_MATCH_THRESHOLD = Number(process.env.KLAV_EXP_EMBEDDINGS_THRESHOLD || "0.86")

export type Embedder = (texts: string[]) => Promise<number[][]>

export function cosineSim(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/** OpenRouter/OpenAI-compatible embeddings call. Returns [] on any failure or missing key. */
const EMBED_MODEL = process.env.KLAV_EXP_EMBEDDINGS_MODEL || "openai/text-embedding-3-small"
const EMBED_ENDPOINT = "https://openrouter.ai/api/v1/embeddings"
export const openRouterEmbedder: Embedder = async (texts) => {
  const apiKey = process.env.KLAV_OPENROUTER_KEY
  if (!apiKey || !texts.length) return []
  try {
    const resp = await fetch(EMBED_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://klavity.in",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
    })
    if (!resp.ok) return []
    const data = await resp.json()
    return (data?.data ?? []).map((d: any) => d.embedding as number[])
  } catch (e) {
    console.warn("[expectations] embeddings call failed:", String(e))
    return []
  }
}

/**
 * Phase 2 second-pass matcher: given a candidate title and the existing expectation titles the
 * LEXICAL pass FAILED to match, embed all of them and return the best existing id whose cosine
 * similarity clears EMBED_MATCH_THRESHOLD, else null.
 *
 * `embed` is injectable so this is unit-testable (and evaluatable against logged near-misses)
 * with a deterministic fake — no network in tests. Returns null when the flag is off, there is
 * no key/embedder, or nothing clears the threshold. NEVER throws.
 */
export async function embeddingsRematch(args: {
  candTitle: string
  existing: Array<{ id: string; title: string }>
  embed?: Embedder
  threshold?: number
}): Promise<{ matchId: string; score: number } | null> {
  if (!embeddingsEnabled()) return null
  if (!args.existing.length) return null
  const embed = args.embed ?? openRouterEmbedder
  const threshold = args.threshold ?? EMBED_MATCH_THRESHOLD
  try {
    const vecs = await embed([args.candTitle, ...args.existing.map((e) => e.title)])
    if (vecs.length !== args.existing.length + 1) return null
    const candVec = vecs[0]
    let best: { matchId: string; score: number } | null = null
    for (let i = 0; i < args.existing.length; i++) {
      const score = cosineSim(candVec, vecs[i + 1])
      if (!best || score > best.score) best = { matchId: args.existing[i].id, score }
    }
    return best && best.score >= threshold ? best : null
  } catch (e) {
    console.warn("[expectations] embeddingsRematch failed:", String(e))
    return null
  }
}
