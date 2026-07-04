// Full authored-Trail A/B: same objective, arm A = current (screenshot every step),
// arm B = text-first + screenshot escalation. Real OpenRouter spend (~$0.05–0.15/run).
// Standalone opt-in:  bun scripts/bench-author-ab.ts
// Uses a throwaway temp-file SQLite DB so nothing lands in the real ledger/trails tables.
import { authorTrail } from "../lib/trails-author"
import { openRouterAuthorModel } from "../lib/trails-author-model"
import { tmpdir } from "node:os"
import { join } from "node:path"

if (!process.env.OPENROUTER_API_KEY) { console.error("OPENROUTER_API_KEY missing"); process.exit(1) }

// ── Throwaway temp DB (same pattern as trails-author.textfirst.test.ts) ────────────────────────
const file = join(tmpdir(), `klav-ab-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = process.env.KLAV_SECRET ?? Buffer.from("autosims-bench-secret-key-32bytes").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("../lib/db")
const db = reconnectDb("file:" + file)
await applySchema(db)
await migrateV2(db)

// ── Seed one project (same pattern as trails-author.kref.e2e.test.ts) ──────────────────────────
const PROJECT_ID = "proj_ab_bench"
await db.execute({
  sql: `INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, observability_mode, created_at, updated_at)
        VALUES (?, ?, ?, 'active', 'auto', 'named', ?, ?)`,
  args: [PROJECT_ID, "acct_ab_bench", "ab-bench", Date.now(), Date.now()],
})

// ── Bench config ────────────────────────────────────────────────────────────────────────────────
const OBJECTIVE = "Open the blog from the home page, open the most recent post, then assert the post heading is visible."
const BASE_URL = "https://klavity.in/"

async function arm(name: string, textFirst: boolean) {
  const t0 = Date.now()
  const out = await authorTrail(
    PROJECT_ID,
    { name: `ab-${name}`, objective: OBJECTIVE, baseUrl: BASE_URL },
    { model: openRouterAuthorModel, textFirst },
  )
  return {
    name,
    textFirst,
    status: out.status,
    verdict: out.verificationVerdict,
    llmCalls: out.llmCalls,
    costUsd: out.costUsd,
    steps: out.steps.length,
    misses: out.steps.filter((s) => !s.ok).length,
    secs: Math.round((Date.now() - t0) / 1000),
  }
}

console.log("Running arm A (current: screenshot every step)…")
const a = await arm("current", false)
console.log("Running arm B (text-first: screenshot on miss only)…")
const b = await arm("text-first", true)

console.table([a, b])
console.log(`cost delta: ${(100 * (1 - b.costUsd / Math.max(a.costUsd, 1e-9))).toFixed(1)}% cheaper`)
console.log("Append these rows to prototype/docs/bench-autosim-cost.md §A/B.")
