// A database that already ran an EARLIER build has submission_keys WITHOUT attempt_token (CREATE TABLE IF NOT EXISTS cannot add a column).
// initDb must upgrade it in place, and the atomic merge must then work on it. (Found for real: a local database from the previous build.)
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-submig-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

test("initDb adds submission_keys.attempt_token to a table created by the earlier build, keeps its rows, and is idempotent", async () => {
  const pre = createClient({ url: "file:" + file })
  await pre.execute(`CREATE TABLE submission_keys (project_id TEXT NOT NULL, submission_key TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending', owner TEXT, actor_email TEXT, feedback_id TEXT, deduped INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL, claimed_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (project_id, submission_key))`)
  await pre.execute({ sql: "INSERT INTO submission_keys (project_id, submission_key, state, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?)", args: ["p_old", "k_old_aaaaaaaaaaaaaaaa", "pending", 1, 1, 1] })
  pre.close()
  const dbm = await import("./db")
  dbm.reconnectDb("file:" + file)          // bind to THIS file even when other suites in the same process already loaded ./db
  await dbm.initDb()
  await dbm.initDb()                                                   // a second boot changes nothing
  const cols = (await dbm.db!.execute("PRAGMA table_info(submission_keys)")).rows.map((r: any) => String(r.name))
  expect(cols).toContain("attempt_token")
  expect(Number((await dbm.db!.execute("SELECT COUNT(*) AS n FROM submission_keys")).rows[0].n)).toBe(1)   // existing rows survive
  // …and the merge (which writes attempt_token) works on the upgraded table
  const now = Date.now()
  await dbm.db!.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at,domain) VALUES (?,?,?,?,?)", args: ["a_m", "M", "o@x.com", now, null] })
  await dbm.db!.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: ["p_m", "a_m", "M", "active", "auto", 200, "named", now, now] })
  const head = await dbm.insertFeedback({ projectId: "p_m", observation: "head", priority: "low" } as any)
  const subs = await import("./submissions")
  const k = "k_new_" + crypto.randomUUID()
  await subs.claimSubmission({ projectId: "p_m", key: k, actor: null, owner: "o1" })
  const r = await dbm.mergeReportIntoTicketForSubmission({ targetId: head, projectId: "p_m", atMs: 9, allowPromote: false, occurrence: null, sub: { projectId: "p_m", key: k, owner: "o1", evidenceJson: null } })
  expect(r).toEqual({ status: "merged", id: head })
})
