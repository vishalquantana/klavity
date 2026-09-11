// KLA-838 — O(N-projects) per-request auth/list loops collapsed to single batched queries.
// PARITY tests: each new batched helper must return the SAME result as the old per-project loop, and
// the access/ordering semantics (first-created match wins) must be unchanged. In-process against an
// isolated file: libSQL DB (same harness as server.db-perf-fix.test.ts).

import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  reconnectDb, initDb, db,
  // helpers under test (new) + their pre-fix equivalents
  listEnabledMonitoredUrlPatternsForProjects, listMonitoredUrls, matchMonitored, patternMatchesUrl,
  listAccessibleProjects, listProjects, projectAccess,
  countPersonasForAccount, listPersonas,
  insertTraitEvents, insertTraitEvent, listTraitEvents,
  addMonitoredUrl,
} from "./lib/db"
import type { TraitEventRow } from "./lib/provenance"

const dbFile = join(tmpdir(), `klav-la838-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)

const NOW = Date.now()
const OWNER = `owner-838@test.local`
const MEMBER = `member-838@test.local`
const ACCT = `acct_838`
// Three projects in the account, created in a known order (created_at ASC): A, B, C.
const PA = `proj_838_a`, PB = `proj_838_b`, PC = `proj_838_c`

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  await initDb()
  const exec = (sql: string, args: any[] = []) => db!.execute({ sql, args })
  await exec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [OWNER, NOW])
  await exec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [MEMBER, NOW])
  await exec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`,
    [ACCT, "WS 838", OWNER, "free", NOW])
  await exec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_o_838`, ACCT, OWNER, "owner", NOW])
  await exec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_m_838`, ACCT, MEMBER, "member", NOW])
  // A < B < C by created_at.
  await exec(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PA, ACCT, "Alpha", "active", "auto", 200, "named", NOW, NOW])
  await exec(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PB, ACCT, "Bravo", "active", "auto", 200, "named", NOW + 1, NOW + 1])
  await exec(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PC, ACCT, "Charlie", "active", "auto", 200, "named", NOW + 2, NOW + 2])
  // Member has explicit rows on B and C only (NOT A) → member-accessible = {B, C}; owner-accessible = all.
  await exec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`pm_b_838`, PB, MEMBER, "member", NOW])
  await exec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`pm_c_838`, PC, MEMBER, "member", NOW])

  // Monitored URLs. BOTH A and B monitor the same host/path prefix so a URL matches multiple projects —
  // this is what proves "first accessible project (created_at ASC) wins" is preserved.
  await addMonitoredUrl(PA, "shared.example.com/app")   // A also matches the shared url
  await addMonitoredUrl(PB, "shared.example.com/app")   // B also matches the shared url
  await addMonitoredUrl(PB, "bravo.example.com/*/x")    // a glob pattern (ordering within a project)
  await addMonitoredUrl(PC, "charlie.example.com")

  // Personas: distinct name+role per project (no duplicates) so listPersonas' read-side dedup is a no-op
  // and the per-project sum equals raw COUNT(*). Seed via raw INSERT to keep the test hermetic.
  for (const [pid, names] of [[PA, ["A1"]], [PB, ["B1", "B2"]], [PC, ["C1", "C2", "C3"]]] as [string, string[]][]) {
    for (const nm of names) {
      await exec(`INSERT OR IGNORE INTO personas (id, project_id, name, role, insights_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ["sim_" + pid + "_" + nm, pid, nm, nm + "-role", "[]", NOW, NOW])
    }
  }
})

// ── PARITY 1: batched monitored-URL fetch == per-project listMonitoredUrls ──
test("KLA-838: listEnabledMonitoredUrlPatternsForProjects equals per-project listMonitoredUrls (same patterns + order)", async () => {
  const ids = [PA, PB, PC]
  const batched = await listEnabledMonitoredUrlPatternsForProjects(ids)
  for (const pid of ids) {
    const loop = (await listMonitoredUrls(pid, { enabledOnly: true })).map(m => m.urlPattern)
    expect(batched.get(pid) || []).toEqual(loop)
  }
  // Empty input → empty map (no query).
  expect((await listEnabledMonitoredUrlPatternsForProjects([])).size).toBe(0)
})

// ── PARITY 2: passive auto-resolve picks the SAME first-match project as the old loop ──
// Old loop: for (p of listProjects(me)) { if(!projectAccess) continue; if(matchMonitored(p.id,url)) pick }
async function oldLoopResolve(email: string, url: string): Promise<string | null> {
  for (const p of await listProjects(email)) {
    if (!(await projectAccess(email, p.id))) continue
    if (await matchMonitored(p.id, url)) return p.id
  }
  return null
}
async function newBatchedResolve(email: string, url: string): Promise<string | null> {
  const accessible = await listAccessibleProjects(email)
  const patterns = await listEnabledMonitoredUrlPatternsForProjects(accessible.map(p => p.id))
  for (const p of accessible) {
    if ((patterns.get(p.id) || []).some(pat => patternMatchesUrl(pat, url))) return p.id
  }
  return null
}

test("KLA-838: owner resolves the shared URL to A (first by created_at) — batched matches the old loop", async () => {
  const url = "https://shared.example.com/app/billing"
  expect(await oldLoopResolve(OWNER, url)).toBe(PA)
  expect(await newBatchedResolve(OWNER, url)).toBe(PA)
})

test("KLA-838: member (no access to A) resolves the shared URL to B — access filter preserved", async () => {
  const url = "https://shared.example.com/app/billing"
  // The old loop skips A (no access) and lands on B; the batched resolver must do the same — proving
  // listAccessibleProjects == listProjects+projectAccess for the member.
  expect(await oldLoopResolve(MEMBER, url)).toBe(PB)
  expect(await newBatchedResolve(MEMBER, url)).toBe(PB)
})

test("KLA-838: glob + no-match parity", async () => {
  expect(await newBatchedResolve(OWNER, "https://bravo.example.com/team/x")).toBe(await oldLoopResolve(OWNER, "https://bravo.example.com/team/x"))
  expect(await newBatchedResolve(OWNER, "https://nomatch.example.com/")).toBeNull()
})

// ── PARITY 3: account persona count == sum of per-project listPersonas lengths (dup-free data) ──
test("KLA-838: countPersonasForAccount equals the old per-project listPersonas sum", async () => {
  const accountProjects = (await listProjects(OWNER)).filter(p => p.accountId === ACCT)
  let loopSum = 0
  for (const p of accountProjects) loopSum += (await listPersonas(p.id)).length
  expect(await countPersonasForAccount(ACCT)).toBe(loopSum)
  expect(loopSum).toBe(6) // A:1 + B:2 + C:3
})

// ── PARITY 4: batched trait-event insert writes the same rows as serial insertTraitEvent ──
test("KLA-838: insertTraitEvents writes identical rows to serial insertTraitEvent", async () => {
  const simBatch = "sim_batch_838", simSerial = "sim_serial_838"
  const mk = (simId: string, i: number): TraitEventRow => ({
    traitId: `t_${simId}_${i}`, simId, transcriptId: `tr_${simId}`, op: "create",
    beforeText: null, afterText: `after ${i}`, quote: `quote ${i}`, quoteOffset: i,
    speaker: "Member", sourceDate: NOW, reason: "reconcile", createdAt: NOW + i,
    area: "billing", issueType: "bug", priority: "P2", actor: MEMBER,
  })
  const events = [0, 1, 2].map(i => mk(simBatch, i))
  const eventsSerial = [0, 1, 2].map(i => mk(simSerial, i))

  await insertTraitEvents(events)
  for (const e of eventsSerial) await insertTraitEvent(e)

  const batched = await listTraitEvents(simBatch)
  const serial = await listTraitEvents(simSerial)
  expect(batched.length).toBe(3)
  expect(serial.length).toBe(3)
  // Compare content field-by-field (ignore the minted id + sim id), in created_at order.
  const strip = (r: TraitEventRow) => ({
    traitId: r.traitId.replace(simBatch, "").replace(simSerial, ""),
    op: r.op, afterText: r.afterText, quote: r.quote, quoteOffset: r.quoteOffset,
    speaker: r.speaker, reason: r.reason, area: r.area, issueType: r.issueType,
    priority: r.priority, actor: r.actor, createdAt: r.createdAt,
  })
  expect(batched.map(strip)).toEqual(serial.map(strip))

  // Empty list is a no-op (no throw, no rows).
  await insertTraitEvents([])
  expect((await listTraitEvents("sim_never_838")).length).toBe(0)
})
