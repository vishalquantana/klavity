// #728 Workspace-alias & ticket-permalink — Phase 1 (backend foundation) db-level unit tests.
// Covers: fresh-DB schema applies + is idempotent on re-run; slugify/deriveKey correctness +
// uniqueness + reserved-word rejection + charset; atomic seq allocation (no dup under concurrent
// insert); backfill idempotency + gate; 3-layer resolve (pretty → redirect → opaque); and proof the
// opaque fb_ fallback is untouched. Negative controls on the key-correctness assertions throughout.
import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-wsalias-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const m = await import("./lib/db")
const {
  db, applySchema, migrateV2,
  slugifyName, isValidSlug, isReservedSlug, slugSyntaxOk,
  deriveTicketKey, isValidTicketKey,
  generateUniqueSlug, generateUniqueTicketKey,
  ensureAccount, createProject, insertFeedback,
  resolveWorkspaceTicket, resolveFeedbackRef, accountBySlug,
  recordSlugAlias, recordKeyAlias, backfillWorkspaceAlias,
} = m as any

// Fresh-DB apply + idempotency: applySchema/migrateV2 twice must not throw.
await applySchema(db!); await migrateV2(db!)
await applySchema(db!); await migrateV2(db!)

test("schema: additive columns/indexes exist on a fresh DB after applySchema", async () => {
  const acctCols = new Set((await db!.execute("PRAGMA table_info(accounts)")).rows.map((r: any) => String(r.name)))
  expect(acctCols.has("slug")).toBe(true)
  expect(acctCols.has("display_slug")).toBe(true)
  expect(acctCols.has("slug_updated_at")).toBe(true)
  const projCols = new Set((await db!.execute("PRAGMA table_info(projects)")).rows.map((r: any) => String(r.name)))
  expect(projCols.has("ticket_key")).toBe(true)
  expect(projCols.has("ticket_seq")).toBe(true)
  const idx = new Set((await db!.execute("SELECT name FROM sqlite_master WHERE type='index'")).rows.map((r: any) => String(r.name)))
  expect(idx.has("accounts_slug_uidx")).toBe(true)
  expect(idx.has("projects_key_uidx")).toBe(true)
  expect(idx.has("feedback_proj_seqnum_uidx")).toBe(true)
  const tbls = new Set((await db!.execute("SELECT name FROM sqlite_master WHERE type='table'")).rows.map((r: any) => String(r.name)))
  expect(tbls.has("alias_redirects")).toBe(true)
})

test("slugifyName: NFKD accents, lowercasing, hyphen collapsing", () => {
  expect(slugifyName("Klavity Inc!!")).toBe("klavity-inc")
  expect(slugifyName("Café Déjà")).toBe("cafe-deja")
  expect(slugifyName("  multiple   spaces  ")).toBe("multiple-spaces")
  expect(slugifyName("我们")).toBe("") // non-latin → empty; caller supplies fallback
  // Negative control: must NOT keep uppercase or punctuation.
  expect(slugifyName("Foo_Bar")).not.toBe("Foo_Bar")
})

test("isValidSlug: charset + length + no edge/double hyphen", () => {
  expect(isValidSlug("abc")).toBe(true)
  expect(isValidSlug("a1-b2")).toBe(true)
  expect(isValidSlug("ab")).toBe(false)        // too short
  expect(isValidSlug("-ab")).toBe(false)       // leading hyphen
  expect(isValidSlug("ab-")).toBe(false)       // trailing hyphen
  expect(isValidSlug("a--b")).toBe(false)      // double hyphen
  expect(isValidSlug("AB_c")).toBe(false)      // uppercase + underscore
  expect(isValidSlug("a".repeat(41))).toBe(false) // too long
})

test("reserved-word blocklist rejects top-level routes, not normal names", () => {
  for (const w of ["t", "api", "dashboard", "admin", "www", "widget", "login", "signup", "s", "opsadmin", "klavity"]) {
    expect(isReservedSlug(w)).toBe(true)
    expect(slugSyntaxOk(w)).toBe(false)
  }
  expect(isReservedSlug("acme")).toBe(false)
  expect(slugSyntaxOk("acme")).toBe(true)
})

test("deriveTicketKey: correctness + charset", () => {
  expect(deriveTicketKey("Klavity")).toBe("KLAV")
  expect(deriveTicketKey("Payments API")).toBe("PA")     // multi-word → initials
  expect(deriveTicketKey("123 numbers")).toBe("K1N")     // must start with a letter
  // Negative controls: wrong answers should fail.
  expect(deriveTicketKey("Klavity")).not.toBe("KLAVITY")
  expect(deriveTicketKey("Klavity")).not.toBe("klav")
  for (const n of ["Klavity", "Payments API", "123 numbers", "X"]) {
    expect(isValidTicketKey(deriveTicketKey(n))).toBe(true)
  }
})

test("isValidTicketKey: ^[A-Z][A-Z0-9]{1,9}$", () => {
  expect(isValidTicketKey("KLAV")).toBe(true)
  expect(isValidTicketKey("K1")).toBe(true)
  expect(isValidTicketKey("K")).toBe(false)     // too short
  expect(isValidTicketKey("1AB")).toBe(false)   // must start with letter
  expect(isValidTicketKey("klav")).toBe(false)  // lowercase
  expect(isValidTicketKey("ABCDEFGHIJK")).toBe(false) // 11 chars
})

test("generateUniqueSlug: global uniqueness + reserved avoidance", async () => {
  // Two workspaces literally named "Acme" → distinct slugs (slug is the unique key, not the name).
  const a1 = await ensureAccount("acme-owner-1@test.local")
  const a2 = await ensureAccount("acme-owner-2@test.local")
  await db!.execute({ sql: "UPDATE accounts SET name='Acme' WHERE id=?", args: [a1[0].workspaceId] })
  await db!.execute({ sql: "UPDATE accounts SET name='Acme' WHERE id=?", args: [a2[0].workspaceId] })
  const s1 = await generateUniqueSlug("Acme", { excludeAccountId: a1[0].workspaceId })
  await db!.execute({ sql: "UPDATE accounts SET slug=? WHERE id=?", args: [s1, a1[0].workspaceId] })
  const s2 = await generateUniqueSlug("Acme", { excludeAccountId: a2[0].workspaceId })
  expect(s1).not.toBe(s2)
  expect(slugSyntaxOk(s1)).toBe(true)
  expect(slugSyntaxOk(s2)).toBe(true)
  // A name that slugifies to a reserved word must NOT produce that reserved slug.
  const rs = await generateUniqueSlug("Dashboard")
  expect(rs).not.toBe("dashboard")
  expect(slugSyntaxOk(rs)).toBe(true)
})

test("generateUniqueTicketKey: unique within an account, collision → suffix", async () => {
  const acc = (await ensureAccount("keys-owner@test.local"))[0].workspaceId
  const p1 = await createProject(acc, "Klavity")
  const p2 = await createProject(acc, "Klavity")  // same name → key must differ within account
  expect(p1.ticketKey ?? (await keyOf(p1.id))).toBeTruthy()
  const k1 = await keyOf(p1.id); const k2 = await keyOf(p2.id)
  expect(k1).toBe("KLAV")
  expect(k2).not.toBe(k1)
  expect(isValidTicketKey(k2)).toBe(true)
  // Another account may reuse KLAV (keys are unique-in-account, not global).
  const acc2 = (await ensureAccount("keys-owner-2@test.local"))[0].workspaceId
  const p3 = await createProject(acc2, "Klavity")
  expect(await keyOf(p3.id)).toBe("KLAV")
})

async function keyOf(projectId: string): Promise<string> {
  const r = await db!.execute({ sql: "SELECT ticket_key FROM projects WHERE id=?", args: [projectId] })
  return String((r.rows[0] as any).ticket_key)
}

test("ensureAccount mints a slug + default-project key on creation", async () => {
  const acc = (await ensureAccount("mint@test.local"))[0].workspaceId
  const row = (await db!.execute({ sql: "SELECT slug, display_slug FROM accounts WHERE id=?", args: [acc] })).rows[0] as any
  expect(typeof row.slug).toBe("string")
  expect(slugSyntaxOk(String(row.slug))).toBe(true)
  const pk = await keyOf("proj_" + acc)
  expect(isValidTicketKey(pk)).toBe(true)
})

test("atomic seq allocation: 40 concurrent inserts get 40 distinct sequential numbers", async () => {
  const acc = (await ensureAccount("concurrency@test.local"))[0].workspaceId
  const proj = (await createProject(acc, "Race")).id
  await Promise.all(Array.from({ length: 40 }, (_, i) => insertFeedback({ projectId: proj, observation: "c" + i })))
  const seqs = (await db!.execute({ sql: "SELECT seq_num FROM feedback WHERE project_id=?", args: [proj] }))
    .rows.map((r: any) => Number(r.seq_num)).sort((a: number, b: number) => a - b)
  expect(seqs.length).toBe(40)
  expect(new Set(seqs).size).toBe(40)               // NO duplicate under concurrency
  expect(seqs).toEqual(Array.from({ length: 40 }, (_, i) => i + 1)) // exactly 1..40
})

test("3-layer resolve: pretty → opaque; wrong guesses return null (not another ticket)", async () => {
  const acc = (await ensureAccount("resolve@test.local"))[0].workspaceId
  const slug = String(((await db!.execute({ sql: "SELECT slug FROM accounts WHERE id=?", args: [acc] })).rows[0] as any).slug)
  const key = await keyOf("proj_" + acc)
  const f1 = await insertFeedback({ projectId: "proj_" + acc, observation: "first" })
  const f2 = await insertFeedback({ projectId: "proj_" + acc, observation: "second" })

  // Layer 1 pretty
  expect(await resolveWorkspaceTicket(slug, `${key}-1`)).toEqual({ id: f1, projectId: "proj_" + acc })
  expect(await resolveWorkspaceTicket(slug, `${key}-2`)).toEqual({ id: f2, projectId: "proj_" + acc })
  // Layer 3 opaque under a slug segment still works (item 4).
  expect(await resolveWorkspaceTicket(slug, f1)).toEqual({ id: f1, projectId: "proj_" + acc })
  // Negative controls — must NOT resolve, and must NOT return a different ticket.
  expect(await resolveWorkspaceTicket(slug, `${key}-99`)).toBeNull()          // no such seq
  expect(await resolveWorkspaceTicket(slug, "NOPE-1")).toBeNull()             // no such key
  expect(await resolveWorkspaceTicket("no-such-slug", `${key}-1`)).toBeNull() // no such slug
  expect(await resolveWorkspaceTicket(slug, "garbage")).toBeNull()            // unparseable
})

test("resolve layer 2: renamed slug/key 301-redirects to the current pretty URL", async () => {
  const acc = (await ensureAccount("rename@test.local"))[0].workspaceId
  const curSlug = String(((await db!.execute({ sql: "SELECT slug FROM accounts WHERE id=?", args: [acc] })).rows[0] as any).slug)
  const curKey = await keyOf("proj_" + acc)
  await insertFeedback({ projectId: "proj_" + acc, observation: "one" })
  // Simulate a prior rename: old handles recorded in alias_redirects.
  await recordSlugAlias("old-workspace-name", acc)
  await recordKeyAlias("OLDKEY", acc, "proj_" + acc)
  // Old slug → redirect to current slug (same key/n)
  expect(await resolveWorkspaceTicket("old-workspace-name", `${curKey}-1`)).toEqual({ redirect: `/${curSlug}/t/${curKey}-1` })
  // Old key under the current slug → redirect to current key
  expect(await resolveWorkspaceTicket(curSlug, "OLDKEY-1")).toEqual({ redirect: `/${curSlug}/t/${curKey}-1` })
})

test("opaque fb_ fallback (resolveFeedbackRef) is untouched: full + 8hex still resolve", async () => {
  const acc = (await ensureAccount("opaque@test.local"))[0].workspaceId
  const fid = await insertFeedback({ projectId: "proj_" + acc, observation: "opaque" })
  const full = await resolveFeedbackRef(fid)
  expect(full).toEqual({ id: fid, projectId: "proj_" + acc })
  const short = fid.slice(0, "fb_".length + 8) // fb_ + 8 hex
  expect(await resolveFeedbackRef(short)).toEqual({ id: fid, projectId: "proj_" + acc })
  // Negative control: a non-fb ref is not accepted by the opaque resolver.
  expect(await resolveFeedbackRef("KLAV-1")).toBeNull()
})

test("backfill is idempotent + gated: assigns once, second run is a no-op", async () => {
  // Legacy rows: an account + project + feedback with slug/key NULL (as a pre-#728 prod DB would have).
  const AID = "acct_legacy_" + Date.now()
  const PID = "proj_legacy_" + Date.now()
  const now = Date.now()
  await db!.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: [AID, "Legacy Co", "legacy@test.local", now] })
  await db!.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: [PID, AID, "Legacy Project", "active", "auto", 200, "named", now, now] })
  await db!.execute({ sql: "INSERT INTO feedback (id,project_id,observation,created_at) VALUES (?,?,?,?)", args: ["fb_legacy_a", PID, "L1", now] })
  await db!.execute({ sql: "INSERT INTO feedback (id,project_id,observation,seq_num,created_at) VALUES (?,?,?,?,?)", args: ["fb_legacy_b", PID, "L2", 2, now + 1] })
  await db!.execute({ sql: "UPDATE feedback SET seq_num=1 WHERE id='fb_legacy_a'" })
  // The applySchema-time backfill already ran (gate set) — clear the gate to exercise this legacy set.
  await db!.execute({ sql: "DELETE FROM schema_migrations WHERE key='workspace_alias_backfill_2026_08_26'" })

  const r1 = await backfillWorkspaceAlias(db!)
  expect(r1.slugs).toBeGreaterThanOrEqual(1)
  expect(r1.keys).toBeGreaterThanOrEqual(1)
  const slug1 = String(((await db!.execute({ sql: "SELECT slug FROM accounts WHERE id=?", args: [AID] })).rows[0] as any).slug)
  const key1 = await keyOf(PID)
  expect(slugSyntaxOk(slug1)).toBe(true)
  expect(isValidTicketKey(key1)).toBe(true)
  // ticket_seq seeded to MAX(seq_num)=2 so the next insert continues at 3.
  const seqAfter = Number(((await db!.execute({ sql: "SELECT ticket_seq FROM projects WHERE id=?", args: [PID] })).rows[0] as any).ticket_seq)
  expect(seqAfter).toBe(2)
  const f3 = await insertFeedback({ projectId: PID, observation: "L3" })
  const n3 = Number(((await db!.execute({ sql: "SELECT seq_num FROM feedback WHERE id=?", args: [f3] })).rows[0] as any).seq_num)
  expect(n3).toBe(3)

  // Second run is gated → no-op, and the slug/key are unchanged (stable links).
  const r2 = await backfillWorkspaceAlias(db!)
  expect(r2).toEqual({ slugs: 0, keys: 0 })
  const slug2 = String(((await db!.execute({ sql: "SELECT slug FROM accounts WHERE id=?", args: [AID] })).rows[0] as any).slug)
  expect(slug2).toBe(slug1)

  // The backfilled ticket resolves via its pretty permalink.
  expect(await resolveWorkspaceTicket(slug1, `${key1}-1`)).toEqual({ id: "fb_legacy_a", projectId: PID })
})
