// KLA-561 — one-off BACKFILL of auto-generated ticket titles for EXISTING untitled reports.
//
// KLA-554 already auto-titles NEW prose reports at intake (server.ts generateAndSaveTitle →
// generateTicketTitle → writes the dedicated `title` column, leaving `observation` untouched). But
// reports filed BEFORE that shipped still have an empty `title` column, so effectiveTicketTitle()
// (lib/db.ts) falls through to the RAW first line of the body (whole pasted URLs, paragraphs). This
// script titles those existing rows using the SAME titling path + the SAME budget-gate + cost-ledger
// the live intake path uses.
//
// SAFETY / behaviour:
//   • Selects ONLY rows that currently render a RAW/derived first-line title:
//       (title IS NULL OR title='')  AND  observation is non-empty PROSE  AND  no suggested_bug.title.
//     Rows with a human/explicit `title` or a suggested_bug title are SKIPPED (never clobbered).
//   • Persists via updateFeedbackTitle(), which is itself guarded to only fill an EMPTY title column —
//     so even a racing intake title can never be overwritten.
//   • DRY-RUN by default (prints old→new, writes nothing). Pass --apply to actually write.
//   • Budget-gated + logged IDENTICALLY to the live path: each real LLM call reserves
//     DEFAULT_AI_CALL_EST_USD against OPS_DAILY_CAP_USD via tryReserveDailySpend, reconciles to the
//     real cost, and records an ai_calls row of type "auto-title". If the daily cap denies a
//     reservation the run STOPS (never overshoots the wallet). A per-run --max-spend gives a second,
//     tighter local ceiling.
//   • Robust: a single bad row logs + continues, never aborts the run.
//
// Run against PROD (after review — this is the orchestrator/human step):
//   ssh root@66.135.20.62 'set -a; . /etc/klav/klav.env; set +a; cd /opt/klav/prototype; \
//     /home/klav/.bun/bin/bun scripts/backfill-ticket-titles.ts --dry-run --limit 20'   # inspect first
//   ...then, once happy:
//   ssh root@66.135.20.62 'set -a; . /etc/klav/klav.env; set +a; cd /opt/klav/prototype; \
//     /home/klav/.bun/bin/bun scripts/backfill-ticket-titles.ts --apply --max-spend 5'
//
// Local dry-run (no OpenRouter key needed — uses a deterministic stub LLM):
//   cd prototype && bun run scripts/backfill-ticket-titles.ts --dry-run --limit 5

import {
  db,
  reconnectDb,
  initDb,
  effectiveTicketTitle,
  updateFeedbackTitle,
  tryReserveDailySpend,
  reconcileDailySpend,
  recordAiCall,
  DEFAULT_AI_CALL_EST_USD,
} from "../lib/db"
import { generateTicketTitle, prepareObservationForTitle, TITLE_SYSTEM_PROMPT } from "../lib/auto-title"
import { UNTRUSTED_GUARD, wrapUntrusted } from "../lib/prompt-safety"

// ── config (mirrors server.ts) ───────────────────────────────────────────────────────────────────
const KEY = process.env.OPENROUTER_API_KEY
const CLARITY_MODEL = process.env.KLAV_CLARITY_MODEL || "google/gemini-3.1-flash-lite"
const ENDPOINT = process.env.OPENROUTER_ENDPOINT || "https://openrouter.ai/api/v1/chat/completions"
const OPS_DAILY_CAP_USD = Number(process.env.OPS_DAILY_CAP_USD || 50)
const BASE = (process.env.KLAV_BASE_URL || "http://localhost:4317").replace("klavity.quantana.top", "klavity.in")

export interface FeedbackTitleRow {
  id: string
  projectId: string
  title: string | null
  observation: string | null
  suggestedBugJson: string | null
}

// PURE predicate — the single source of truth for "does this row currently show a raw/derived title
// that we should replace?". True iff: no explicit title, no suggested_bug title, and the body distils
// to meaningful prose (prepareObservationForTitle is the SAME distiller the live titler uses, so we
// never spend an LLM call on a row that would title to ""). Unit-tested in isolation.
export function feedbackRowNeedsTitle(row: FeedbackTitleRow): boolean {
  const explicit = typeof row.title === "string" ? row.title.trim() : ""
  if (explicit) return false // human/explicit or already-backfilled title — never touch
  // effectiveTicketTitle resolves title → suggested_bug.title → first-line. If a suggested_bug title
  // exists the card already shows something real, so skip. Build the shape it expects.
  let sbTitle = ""
  const raw = row.suggestedBugJson
  if (typeof raw === "string" && raw) {
    try { sbTitle = String(JSON.parse(raw)?.title || "").trim() } catch { sbTitle = "" }
  }
  if (sbTitle) return false
  // Non-empty prose only (a URL-only / boilerplate-only body distils to "").
  return prepareObservationForTitle(String(row.observation ?? "")) !== ""
}

// Deterministic offline stub for the LLM when there is NO OpenRouter key (dry-run previews only). It
// echoes the JSON shape the real model returns so the whole generateTicketTitle pipeline (parse +
// sanitize) still runs. Never used when a key is present or when --apply spends real budget.
export function stubLlmReply(preparedInput: string): string {
  const firstLine = (preparedInput.split("\n")[0] || "").trim()
  const words = firstLine.split(/\s+/).slice(0, 8).join(" ")
  return JSON.stringify({ title: words ? "[stub] " + words : "" })
}

// Minimal OpenRouter call for the cheap clarity model — the same request shape chat() builds for a
// type:"auto-title" call (system = TITLE_SYSTEM_PROMPT + UNTRUSTED_GUARD, user = wrapped body,
// max_tokens 60, temperature 0, json mode). Returns the raw content + real cost. Records an ai_calls
// row (ok or failure) exactly like the live path. Budget reservation is done by the CALLER (so a
// denial can stop the whole run).
async function openrouterTitleCall(
  preparedBody: string,
  systemPrompt: string,
  projectId: string,
): Promise<{ content: string; costUsd: number }> {
  const model = CLARITY_MODEL
  const recordFailure = (reason: string) => {
    void recordAiCall({
      type: "auto-title", feature: "auto-title", model, projectId, actorEmail: null,
      inputTokens: null, outputTokens: null, costUsd: 0, ok: false,
    }).catch((e: any) => console.error(`recordAiCall failed for ${reason}:`, e?.message || e))
  }
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 90_000)
  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json", "HTTP-Referer": BASE, "X-Title": "Klavity" },
      body: JSON.stringify({
        model, max_tokens: 60, temperature: 0, usage: { include: true },
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt + UNTRUSTED_GUARD },
          { role: "user", content: "REPORT BODY:\n" + wrapUntrusted(preparedBody) },
        ],
      }),
      signal: ctl.signal,
    })
  } catch (e: any) {
    clearTimeout(timer)
    recordFailure("fetch")
    throw e
  }
  clearTimeout(timer)
  if (!res.ok) {
    recordFailure("http")
    throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  const data: any = await res.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ""
  const u = data?.usage || {}
  const costUsd = typeof u.cost === "number" ? u.cost : 0
  void recordAiCall({
    type: "auto-title", feature: "auto-title", model, projectId, actorEmail: null,
    inputTokens: typeof u.prompt_tokens === "number" ? u.prompt_tokens : null,
    outputTokens: typeof u.completion_tokens === "number" ? u.completion_tokens : null,
    costUsd,
  }).catch((e: any) => console.error("recordAiCall failed:", e?.message || e))
  return { content, costUsd }
}

export type LlmKind = "real" | "stub" | "injected"

export interface BackfillOptions {
  apply?: boolean
  projectId?: string | null
  limit?: number | null
  concurrency?: number
  maxSpendUsd?: number
  // Test seam: inject the SAME (input, systemPrompt)=>reply shape generateTicketTitle expects. When
  // provided it is treated as budget-free (kind "injected") — tests never touch the daily-spend table.
  llm?: (input: string, systemPrompt: string) => Promise<string>
  log?: (s: string) => void
}

export interface BackfillSummary {
  scanned: number
  titled: number
  skippedNoTitle: number // LLM returned "" ⇒ left the first-line fallback
  errored: number
  budgetHit: boolean
  spendEstUsd: number
  llmKind: LlmKind
  dryRun: boolean
}

// Select candidate rows: empty title column + non-empty observation, optionally scoped to one project,
// newest first, optionally capped. The suggested_bug + prose filter (feedbackRowNeedsTitle) is applied
// in JS so the predicate stays the single, unit-tested source of truth.
async function selectCandidates(projectId: string | null, limit: number | null): Promise<FeedbackTitleRow[]> {
  const where = ["(title IS NULL OR title='')", "observation IS NOT NULL", "observation<>''"]
  const args: any[] = []
  if (projectId) { where.push("project_id=?"); args.push(projectId) }
  let sql = `SELECT id, project_id, title, observation, suggested_bug_json
             FROM feedback WHERE ${where.join(" AND ")} ORDER BY created_at DESC`
  if (limit && limit > 0) { sql += " LIMIT ?"; args.push(limit) }
  const r = await db!.execute({ sql, args })
  return r.rows.map((x: any) => ({
    id: String(x.id),
    projectId: String(x.project_id),
    title: x.title != null ? String(x.title) : null,
    observation: x.observation != null ? String(x.observation) : null,
    suggestedBugJson: x.suggested_bug_json != null ? String(x.suggested_bug_json) : null,
  })).filter(feedbackRowNeedsTitle)
}

export async function runBackfill(opts: BackfillOptions): Promise<BackfillSummary> {
  const log = opts.log ?? ((s: string) => console.log(s))
  const dryRun = !opts.apply
  const concurrency = Math.max(1, opts.concurrency ?? 3)
  const maxSpendUsd = opts.maxSpendUsd ?? 5
  const est = DEFAULT_AI_CALL_EST_USD

  const llmKind: LlmKind = opts.llm ? "injected" : (KEY ? "real" : "stub")
  const summary: BackfillSummary = {
    scanned: 0, titled: 0, skippedNoTitle: 0, errored: 0,
    budgetHit: false, spendEstUsd: 0, llmKind, dryRun,
  }

  const rows = await selectCandidates(opts.projectId ?? null, opts.limit ?? null)
  summary.scanned = rows.length
  log(`Found ${rows.length} candidate row(s) needing a title` +
      (opts.projectId ? ` in project ${opts.projectId}` : " (all projects)") +
      ` · mode=${dryRun ? "DRY-RUN" : "APPLY"} · llm=${llmKind}`)

  // Process one row: reserve budget (real LLM only), generate the title, and (in --apply) persist it.
  // NEVER throws — a bad row logs + counts as errored and the run continues.
  async function processRow(row: FeedbackTitleRow): Promise<"stop" | "done"> {
    if (summary.budgetHit) return "stop"
    try {
      let reserved = false
      if (llmKind === "real") {
        // Per-run ceiling first (cheap, local), then the shared daily cap (authoritative).
        if (summary.spendEstUsd + est > maxSpendUsd) {
          log(`Per-run cap --max-spend $${maxSpendUsd} reached — stopping.`)
          summary.budgetHit = true
          return "stop"
        }
        reserved = await tryReserveDailySpend(est, OPS_DAILY_CAP_USD)
        if (!reserved) {
          log(`Daily AI budget cap $${OPS_DAILY_CAP_USD} reached — stopping.`)
          summary.budgetHit = true
          return "stop"
        }
        summary.spendEstUsd += est
      }

      let actualCost = 0
      let billed = false
      const llm =
        opts.llm ??
        (llmKind === "real"
          ? async (input: string, sys: string) => {
              const { content, costUsd } = await openrouterTitleCall(input, sys, row.projectId)
              actualCost = costUsd; billed = true
              return content
            }
          : async (input: string, _sys: string) => stubLlmReply(input)) // stub (no key, dry-run preview)

      let title = ""
      try {
        title = await generateTicketTitle(String(row.observation ?? ""), { llm })
      } finally {
        // Reconcile the reservation to the REAL cost (releases it entirely if nothing was billed).
        if (reserved) await reconcileDailySpend(est, billed ? actualCost : 0).catch(() => {})
      }

      const current = effectiveTicketTitle({ title: row.title, suggested_bug_json: row.suggestedBugJson, observation: row.observation })
      if (!title) {
        summary.skippedNoTitle++
        log(`  skip ${row.id}: LLM returned no title (keeps first-line fallback)`)
        return "done"
      }
      if (dryRun) {
        log(`  ${row.id}\n      old: ${trunc(current)}\n      new: ${title}`)
        summary.titled++
        return "done"
      }
      const wrote = await updateFeedbackTitle(row.id, row.projectId, title)
      if (wrote) { summary.titled++; log(`  titled ${row.id}: ${title}`) }
      else { summary.skippedNoTitle++; log(`  skip ${row.id}: title column already filled (raced) — left as-is`) }
      return "done"
    } catch (e: any) {
      summary.errored++
      log(`  ERROR ${row.id}: ${e?.message || e} — continuing`)
      return "done"
    }
  }

  // Small concurrency with pacing between batches; stop scheduling once the budget is hit.
  for (let i = 0; i < rows.length; i += concurrency) {
    if (summary.budgetHit) break
    const batch = rows.slice(i, i + concurrency)
    const results = await Promise.all(batch.map(processRow))
    if (results.includes("stop")) break
    if (i + concurrency < rows.length) await sleep(200) // gentle pacing
  }

  log(
    `\n=== ${dryRun ? "DRY RUN — no writes" : "APPLIED"} === ` +
    `scanned=${summary.scanned} titled=${summary.titled} ` +
    `skipped=${summary.skippedNoTitle} errored=${summary.errored} ` +
    `budgetHit=${summary.budgetHit} spendEst=$${summary.spendEstUsd.toFixed(3)} llm=${llmKind}`,
  )
  return summary
}

function trunc(s: string, n = 100): string {
  const one = String(s ?? "").replace(/\s+/g, " ").trim()
  return one.length > n ? one.slice(0, n) + "…" : one
}
function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)) }

// ── CLI ──────────────────────────────────────────────────────────────────────────────────────────
function parseArgs(argv: string[]) {
  const a = { apply: false, projectId: null as string | null, limit: null as number | null, concurrency: 3, maxSpendUsd: 5, dbUrl: null as string | null }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    if (k === "--apply") a.apply = true
    else if (k === "--dry-run") a.apply = false
    else if (k === "--project") a.projectId = argv[++i] ?? null
    else if (k === "--limit") a.limit = Number(argv[++i]) || null
    else if (k === "--concurrency") a.concurrency = Math.max(1, Number(argv[++i]) || 3)
    else if (k === "--max-spend") a.maxSpendUsd = Number(argv[++i]) || 5
    else if (k === "--db") a.dbUrl = argv[++i] ?? null
    else if (k === "-h" || k === "--help") { printHelp(); process.exit(0) }
  }
  return a
}
function printHelp() {
  console.log(`backfill-ticket-titles — title existing untitled prose reports (KLA-561)

  --dry-run           preview old→new, write nothing (DEFAULT)
  --apply             actually write titles (spends real budget if a key is set)
  --project <id>      scope to one project (default: all)
  --limit <N>         cap rows scanned
  --concurrency <N>   parallel titling calls (default 3)
  --max-spend <usd>   per-run spend ceiling (default 5), on top of OPS_DAILY_CAP_USD
  --db <url>          override TURSO_DATABASE_URL (e.g. file:./local.db)`)
}

if (import.meta.main) {
  const args = parseArgs(process.argv.slice(2))
  if (args.dbUrl) reconnectDb(args.dbUrl, process.env.TURSO_AUTH_TOKEN)
  if (!db) { console.error("No database — set TURSO_DATABASE_URL (or pass --db file:./local.db)"); process.exit(1) }
  await initDb()
  const summary = await runBackfill({
    apply: args.apply, projectId: args.projectId, limit: args.limit,
    concurrency: args.concurrency, maxSpendUsd: args.maxSpendUsd,
  })
  process.exit(summary.errored > 0 && summary.titled === 0 ? 1 : 0)
}
