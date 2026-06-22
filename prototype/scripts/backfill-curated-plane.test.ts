// Test the curated Plane backfill against a fake Plane API + a seeded temp DB.
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

process.env.KLAV_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")
const { encryptSecret } = await import("../lib/crypto")
const { runCuratedBackfill } = await import("./backfill-curated-plane")

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-backfill-${ts}.db`)
const c = createClient({ url: "file:" + dbFile })
const ex = (sql: string, args: any[] = []) => c.execute({ sql, args })

await ex(`CREATE TABLE feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, observation TEXT, url_path TEXT, plane_issue_key TEXT, plane_issue_url TEXT, created_at INTEGER NOT NULL)`)
await ex(`CREATE TABLE connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL)`)
await ex(`CREATE TABLE ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)

// Fake Plane API — stateful so idempotency-by-title works on the second run.
let seq = 100
const issues: any[] = []
const plane = Bun.serve({
  port: 0,
  async fetch(req) {
    const u = new URL(req.url)
    if (u.pathname.endsWith("/states/")) return Response.json({ results: [{ id: "st-done", group: "completed", name: "Done" }, { id: "st-prog", group: "started", name: "In Progress" }, { id: "st-todo", group: "unstarted", name: "Todo" }] })
    if (u.pathname.endsWith("/issues/") && req.method === "GET") return Response.json({ results: issues, next_page_results: false })
    if (u.pathname.endsWith("/issues/") && req.method === "POST") {
      const body = await req.json() as any
      const iss = { id: `iss-${++seq}`, sequence_id: seq, name: body.name, state: body.state, priority: body.priority }
      issues.push(iss)
      return Response.json(iss, { status: 201 })
    }
    return new Response("nope", { status: 404 })
  },
})

const KL = "proj_32948ecf-a7bb", BIG = "proj_6d574acf-x", WEB = "proj_5a9b422f-x"
const now = Date.now()
await ex(`INSERT INTO connectors (id, project_id, type, name, config, auto_copy, enabled, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  ["conn_test", KL, "plane", "Plane (qbuilder)", JSON.stringify({ host: `http://localhost:${plane.port}`, workspace: "qbuilder", project_id: "05ea72ad", token: await encryptSecret("tok-123") }), 1, 1, now])

let n = 0
const fb = (proj: string, obs: string, urlPath = "", key: string | null = null) =>
  ex(`INSERT INTO feedback (id, project_id, observation, url_path, plane_issue_key, created_at) VALUES (?,?,?,?,?,?)`, [`fb_${++n}`, proj, obs, urlPath, key, now + n])

await fb(KL, "[bug] dashboard is slow and the empty state placeholder boxes feel cold", "/dashboard")    // t1
await fb(KL, "[bug] dashboard already exported", "/dashboard", "OLD-1")                                   // t1 but already keyed → skip
await fb(KL, "[bug] single ticket page repeated the title and showed satisfied, redundant", "/tickets")   // t2
await fb(BIG, "[bug] upload is slow on submit with no progress", "/")                                      // t3
await fb(BIG, "[bug] right-click drag shows the previous context menu", "/")                               // t4
await fb(BIG, "[bug] widget active state not visible and close icon cut off, need scroll on tall screens", "/") // t5
await fb(WEB, "[bug] leadgen form looks dull and white, does not match background", "/")                   // t6
await fb(WEB, "[bug] Sharp option unclear and capture button icon not middle aligned, no animation", "/")  // t7
await fb(WEB, "just a neutral note, nothing actionable here", "/")                                         // unmatched

test("curated backfill: creates 7 tickets, keys source rows, skips already-keyed, idempotent", async () => {
  const { results, unmatched } = await runCuratedBackfill(c, () => {})
  // 7 tickets all created
  expect(results.length).toBe(7)
  expect(results.every(r => r.created)).toBe(true)
  expect(issues.length).toBe(7)
  // each created issue got a real key
  for (const r of results) expect(r.key).toMatch(/^\d+$/)
  // dashboard ticket keyed exactly the ONE un-keyed row (the OLD-1 row stays as-is)
  const t1 = results.find(r => r.slug === "klavity-dashboard-cold-slow")!
  expect(t1.rows.length).toBe(1)
  const old = (await ex(`SELECT plane_issue_key FROM feedback WHERE id='fb_2'`)).rows[0]
  expect(String(old.plane_issue_key)).toBe("OLD-1")
  // a keyed row points at its ticket
  const k1 = (await ex(`SELECT plane_issue_key, plane_issue_url FROM feedback WHERE id='fb_1'`)).rows[0]
  expect(String(k1.plane_issue_key)).toBe(t1.key)
  expect(String(k1.plane_issue_url)).toContain("/projects/05ea72ad/")
  // ticket_exports row written per keyed row — 7 un-keyed rows (1 per ticket; the OLD-1 row is skipped)
  const exrows = (await ex(`SELECT COUNT(*) n FROM ticket_exports`)).rows[0]
  expect(Number(exrows.n)).toBe(7)
  // the neutral note is unmatched, left untouched
  expect(unmatched.some(r => r.id === "fb_9")).toBe(true)
  // status mapping: the fixed ticket got the 'completed' state
  expect(issues.find(i => i.name.includes("loading & empty"))?.state).toBe("st-done")
  expect(issues.find(i => i.name.includes("upload"))?.state).toBe("st-prog")
  expect(issues.find(i => i.name.includes("Leadgen"))?.state).toBe("st-todo")

  // ── idempotent re-run: no new Plane issues, no new exports ──
  const before = issues.length
  const exBefore = Number((await ex(`SELECT COUNT(*) n FROM ticket_exports`)).rows[0].n)
  const r2 = await runCuratedBackfill(c, () => {})
  expect(issues.length).toBe(before)                 // reused by title, none created
  expect(r2.results.every(r => !r.created)).toBe(true)
  expect(Number((await ex(`SELECT COUNT(*) n FROM ticket_exports`)).rows[0].n)).toBe(exBefore) // no new exports
  plane.stop(true)
})
