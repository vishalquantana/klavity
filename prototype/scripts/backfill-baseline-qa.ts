// One-off BACKFILL: give every EXISTING project the system-provided Baseline QA Sim.
//
// New workspaces/projects get it automatically (ensureAccount / createProject). Projects created before that shipped do not, so
// this adds it to them. It is NEVER run automatically — there is no startup hook and no migration — so deploying never touches
// existing data; a human runs it.
//
// SAFETY:
//   • DRY-RUN by default: prints how many projects are missing the Baseline QA Sim and writes nothing. Pass --apply to write.
//   • Idempotent: ensureBaselineQaSim is one INSERT OR IGNORE with a deterministic id (sim_baseline_<projectId>) — re-running
//     creates nothing new, and an existing row (even one the customer edited) is never overwritten.
//   • Only ever ADDS a row; customer-created Sims are untouched.
//
// Local:
//   cd prototype && TURSO_DATABASE_URL=file:local.db bun scripts/backfill-baseline-qa.ts            # dry-run
//   cd prototype && TURSO_DATABASE_URL=file:local.db bun scripts/backfill-baseline-qa.ts --apply
//
// Dev / prod (a deliberate human step, after reviewing the dry-run output):
//   ssh <box> 'set -a; . /etc/klav/klav.env; set +a; cd /opt/klav/prototype; bun scripts/backfill-baseline-qa.ts'          # dry-run
//   ssh <box> 'set -a; . /etc/klav/klav.env; set +a; cd /opt/klav/prototype; bun scripts/backfill-baseline-qa.ts --apply'

import { db, reconnectDb, initDb, backfillBaselineQaSims } from "../lib/db"
import { baselineQaId } from "../lib/baseline-qa"

async function main() {
  const argv = process.argv.slice(2)
  const apply = argv.includes("--apply")
  const dbIdx = argv.indexOf("--db")
  if (dbIdx >= 0 && argv[dbIdx + 1]) reconnectDb(argv[dbIdx + 1], process.env.TURSO_AUTH_TOKEN)
  if (!db) { console.error("No database — set TURSO_DATABASE_URL (or pass --db file:./local.db)"); process.exit(1) }
  await initDb()

  const projects = (await db.execute({ sql: "SELECT id FROM projects", args: [] })).rows.map((r: any) => String(r.id))
  const have = new Set((await db.execute({ sql: "SELECT id FROM personas WHERE sim_source='baseline'", args: [] })).rows.map((r: any) => String(r.id)))
  const missing = projects.filter((id) => !have.has(baselineQaId(id)))
  console.log(`[baseline-qa] projects=${projects.length} already-have=${projects.length - missing.length} missing=${missing.length}`)

  if (!apply) { console.log("[baseline-qa] dry-run — nothing written. Re-run with --apply to add the Baseline QA Sim to the missing projects."); process.exit(0) }
  const res = await backfillBaselineQaSims()
  console.log(`[baseline-qa] applied: created=${res.created} (projects scanned=${res.projects})`)
  process.exit(0)
}

main().catch((e) => { console.error("[baseline-qa] failed:", e?.message || e); process.exit(1) })
