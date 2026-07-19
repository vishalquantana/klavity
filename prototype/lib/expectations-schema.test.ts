// prototype/lib/expectations-schema.test.ts
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
import { applySchema } from "./db"

test("expectations table exists with expected columns", async () => {
  const c = createClient({ url: "file::memory:" })
  await applySchema(c)
  const cols = await c.execute("PRAGMA table_info(expectations)")
  const names = cols.rows.map((r: any) => r.name).sort()
  // KLA-242: source_ticket_id — ticket this guard was created from
  // KLA-243: saves_count — number of times this guard caught a regression
  // B.13: source_quote / source_quote_verified / source_quote_ref — the originating grounded quote
  // B.5: awaiting_trail — validated-but-unenforceable, waiting for a covering Trail
  expect(names).toEqual(
    ["area","awaiting_trail","corroboration_json","created_at","dedup_key","enforced_step_id","id","project_id","saves_count","source_quote","source_quote_ref","source_quote_verified","source_refs_json","source_ticket_id","status","title","updated_at","url_path"].sort()
  )
})
