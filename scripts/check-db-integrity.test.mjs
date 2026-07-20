import { test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  checkTree,
  collectCreatedTables,
  collectReferencedTables,
  createdInSql,
  referencedInSql,
  extractStringLiterals,
} from './check-db-integrity.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')

/** Build a throwaway repo-shaped tree: { 'prototype/lib/x.ts': '…' } */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'klav-dbint-'))
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
  return root
}

// ── The real incident: KLAVITYKLA-352 audit_log ──────────────────────────────

test('FAILS when a referenced table has no CREATE (the audit_log merge-eaten bug)', () => {
  const root = fixture({
    'prototype/lib/db.ts': 'export const s = [`CREATE TABLE IF NOT EXISTS users (id TEXT)`]',
    'prototype/lib/audit-log.ts':
      'await db.execute({ sql: `INSERT INTO audit_log (id) VALUES (?)` })\n' +
      'await db.execute({ sql: `SELECT * FROM audit_log ORDER BY created_at DESC` })',
  })
  try {
    const { missing } = checkTree(root)
    expect(missing.map((m) => m.table)).toEqual(['audit_log'])
    expect(missing[0].files).toContain('prototype/lib/audit-log.ts')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('PASSES once the audit_log CREATE is restored', () => {
  const root = fixture({
    'prototype/lib/db.ts':
      'export const s = [`CREATE TABLE IF NOT EXISTS users (id TEXT)`, `CREATE TABLE IF NOT EXISTS audit_log (id TEXT)`]',
    'prototype/lib/audit-log.ts': 'await db.execute({ sql: `SELECT * FROM audit_log` })',
  })
  try {
    expect(checkTree(root).missing).toEqual([])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

// ── Self-poisoning regression: a COMMENT must never count as a declaration ───

test('a CREATE TABLE mentioned in a comment does NOT count as a declaration', () => {
  const root = fixture({
    // This is exactly the bug that made an early version of this checker useless:
    // its own header comment "declared" audit_log, so the gate could never fire.
    'prototype/lib/db.ts': '// we used to have CREATE TABLE IF NOT EXISTS audit_log here\nexport const s = []',
    'prototype/lib/audit-log.ts': 'await db.execute({ sql: `SELECT * FROM audit_log` })',
  })
  try {
    expect(checkTree(root).missing.map((m) => m.table)).toEqual(['audit_log'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

// ── Self-poisoning regression #2: a TEST FIXTURE must never count as a declaration ──
// This one was live: THIS file's own fixture above contains the literal
// `CREATE TABLE IF NOT EXISTS audit_log (id TEXT)`. Because collectCreatedTables walked the
// whole repo including scripts/, that fixture "declared" audit_log for the REAL tree — so
// deleting the real CREATE from prototype/lib/db.ts still exited 0. The gate was blind to
// the exact incident it was written for. Verified by hand before and after the fix.
test('a CREATE inside a *.test.mjs fixture does NOT count as a real declaration', () => {
  const root = fixture({
    'prototype/lib/db.ts': 'export const s = []',
    'prototype/lib/audit-log.ts': 'await db.execute({ sql: `SELECT * FROM audit_log` })',
    // a fixture file that merely *mentions* the CREATE, exactly like this test file does
    'scripts/check-db-integrity.test.mjs':
      "const f = { 'prototype/lib/db.ts': '`CREATE TABLE IF NOT EXISTS audit_log (id TEXT)`' }",
  })
  try {
    expect(checkTree(root).missing.map((m) => m.table)).toEqual(['audit_log'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('the real repo does NOT get its audit_log declaration from a test fixture', () => {
  // Belt-and-braces on the live tree: the ONLY thing that may declare audit_log is real
  // schema under prototype/, never scripts/*.test.*.
  expect(collectCreatedTables(REPO).has('audit_log')).toBe(true)
  expect(collectCreatedTables(join(REPO, 'scripts')).has('audit_log')).toBe(false)
})

// ── False-positive filters ──────────────────────────────────────────────────

test('English prose in comments is not read as a table reference', () => {
  const src = `
    // copied FROM another project, then we UPDATE the row and put it INTO the cache
    /* JOIN the two lists together */
    import { x } from 'node:fs'
    const y = Array.from(z)
  `
  const refs = new Set()
  for (const lit of extractStringLiterals(src)) for (const t of referencedInSql(lit)) refs.add(t)
  expect([...refs]).toEqual([])
})

test('lowercase sql-ish prose inside a string is not a reference', () => {
  expect([...referencedInSql('pulled from another workspace')]).toEqual([])
})

test('CTEs and sqlite pseudo-tables are not required to have a CREATE', () => {
  expect([...referencedInSql('WITH recent AS (SELECT * FROM feedback) SELECT * FROM recent')]).toEqual(['feedback'])
  expect([...referencedInSql("SELECT name FROM sqlite_master WHERE type='table'")]).toEqual([])
})

test('JOIN / UPDATE / DELETE FROM / INSERT INTO are all picked up', () => {
  expect([...referencedInSql('SELECT * FROM a JOIN b ON a.id=b.id')]).toEqual(['a', 'b'])
  expect([...referencedInSql('UPDATE projects SET name=?')]).toEqual(['projects'])
  expect([...referencedInSql('DELETE FROM sessions WHERE id=?')]).toEqual(['sessions'])
  expect([...referencedInSql('INSERT INTO users (id) VALUES (?)')]).toEqual(['users'])
})

test('a dynamic table name (template interpolation) is skipped, not guessed', () => {
  const src = 'const q = `SELECT * FROM ${tbl} WHERE id=?`'
  const refs = new Set()
  for (const lit of extractStringLiterals(src)) for (const t of referencedInSql(lit)) refs.add(t)
  expect([...refs]).toEqual([])
})

// ── Declaration forms ───────────────────────────────────────────────────────

test('ALTER TABLE … RENAME TO counts as creating the new table (personas_v1 case)', () => {
  expect(createdInSql('ALTER TABLE personas RENAME TO personas_v1').has('personas_v1')).toBe(true)
})

test('CREATE VIEW and CREATE TEMP TABLE count as declarations', () => {
  expect(createdInSql('CREATE VIEW v_stats AS SELECT 1').has('v_stats')).toBe(true)
  expect(createdInSql('CREATE TEMP TABLE scratch (id TEXT)').has('scratch')).toBe(true)
})

// ── The live tree must stay clean (this is what the merge-train enforces) ───

test('the real repo passes the db-integrity gate', () => {
  const { missing, referenced } = checkTree(REPO)
  expect(missing).toEqual([])
  expect(referenced).toBeGreaterThan(50)
})

test('the real repo declares audit_log and references it', () => {
  expect(collectCreatedTables(REPO).has('audit_log')).toBe(true)
  expect(collectReferencedTables([join(REPO, 'prototype/lib/audit-log.ts')], REPO).has('audit_log')).toBe(true)
})
