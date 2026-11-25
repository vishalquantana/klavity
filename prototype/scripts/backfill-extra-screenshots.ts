// One-off BACKFILL: show the missing screenshots on multi-capture tickets created before extra_screenshots_json existed.
//
// Those tickets kept only their FIRST screenshot; the picked-element / selected-region / extra full-page shots were stored but
// linked to nothing. For reports filed through an idempotent submission (widget, since 72ccc0f6) the extra screenshot ids are
// recomputed exactly from submission_keys and double-checked (see lib/extra-screenshots-backfill.ts). Older reports without a
// submission key are left untouched — their screenshot ids were random, so they can't be matched safely.
//
// SAFETY:
//   • DRY-RUN by default: prints what it would link and writes nothing. Pass --apply to write.
//   • Only ever fills extra_screenshots_json where it is NULL — never overwrites, re-running is a no-op.
//   • Never creates, moves or deletes a screenshot; it only links ones already stored for the same project.
//   • NEVER run automatically (no startup hook, no migration) — a human runs it.
//
// Local:
//   cd prototype && TURSO_DATABASE_URL=file:local.db bun scripts/backfill-extra-screenshots.ts            # dry-run
//   cd prototype && TURSO_DATABASE_URL=file:local.db bun scripts/backfill-extra-screenshots.ts --apply
//
// Dev / prod (a deliberate human step, after reviewing the dry-run output):
//   ssh <box> 'set -a; . /etc/klav/klav.env; set +a; cd /opt/klav/prototype; bun scripts/backfill-extra-screenshots.ts'
//   ssh <box> 'set -a; . /etc/klav/klav.env; set +a; cd /opt/klav/prototype; bun scripts/backfill-extra-screenshots.ts --apply'

import { db, reconnectDb, initDb } from "../lib/db"
import { planExtraScreenshotLinks, applyExtraScreenshotLinks } from "../lib/extra-screenshots-backfill"

async function main() {
  const argv = process.argv.slice(2)
  const apply = argv.includes("--apply")
  const dbIdx = argv.indexOf("--db")
  if (dbIdx >= 0 && argv[dbIdx + 1]) reconnectDb(argv[dbIdx + 1], process.env.TURSO_AUTH_TOKEN)
  if (!db) { console.error("No database — set TURSO_DATABASE_URL (or pass --db file:./local.db)"); process.exit(1) }
  await initDb() // adds extra_screenshots_json if this DB predates it

  const { plans, skipped } = await planExtraScreenshotLinks(db)
  const shots = plans.reduce((n, p) => n + p.extraIds.length, 0)
  console.log(`[extra-screenshots] tickets to fix=${plans.length} screenshots to link=${shots} skipped=${skipped.length}`)
  for (const s of skipped) console.log(`  skip ${s.feedbackId}: ${s.reason}`)

  if (!apply) { console.log("[extra-screenshots] dry-run — nothing written. Re-run with --apply to link them."); process.exit(0) }
  const n = await applyExtraScreenshotLinks(db, plans)
  console.log(`[extra-screenshots] applied: tickets updated=${n}`)
  process.exit(0)
}

main().catch((e) => { console.error("[extra-screenshots] failed:", e?.message || e); process.exit(1) })
