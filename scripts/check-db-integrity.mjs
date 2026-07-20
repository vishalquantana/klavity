#!/usr/bin/env node
// DB integrity guard — every table the backend READS/WRITES must actually be CREATEd.
//
// WHY (real incident, 2026-07-20): the merge-train merges feat branches with `-X theirs`
// and ran no CI. Two branches concurrently edited prototype/lib/db.ts and one branch's
// `CREATE TABLE IF NOT EXISTS audit_log` was SILENTLY DROPPED. lib/audit-log.ts still
// INSERTed/SELECTed audit_log, so the whole audit-log feature (KLAVITYKLA-352) shipped
// dead — every audited action would throw "no such table: audit_log". Nothing caught it
// but a manual post-merge audit. This script automates that audit.
//
// Usage:  node scripts/check-db-integrity.mjs [repoRoot]
// Exit 0 = every referenced table has a CREATE somewhere in the tree.
// Exit 1 = at least one referenced table has no CREATE (prints table + call sites).
//
// Exported for unit tests: collectCreatedTables, collectReferencedTables, checkTree.

import { readFileSync, readdirSync, statSync, realpathSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Where tables get DECLARED (scanned repo-wide) and REFERENCED (backend only) ──
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out',
  'test-results', 'playwright-report', '.turbo', '.venv', 'venv', '__pycache__',
])
const CREATE_EXTS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.mjs', '.cjs', '.sql']

// A `CREATE TABLE`/`CREATE VIEW` in any form counts as a declaration.
const CREATE_RE =
  /\bCREATE\s+(?:TEMP\s+|TEMPORARY\s+)?(?:TABLE|VIRTUAL\s+TABLE|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"'[]?([A-Za-z_][A-Za-z0-9_]*)/gi
// A migration rename also brings a table into existence (e.g. personas → personas_v1).
const RENAME_RE = /\bALTER\s+TABLE\s+[`"']?[A-Za-z_][A-Za-z0-9_]*[`"']?\s+RENAME\s+TO\s+[`"']?([A-Za-z_][A-Za-z0-9_]*)/gi

// Table references: FROM / JOIN / INSERT INTO / UPDATE / DELETE FROM.
// Keywords are matched CASE-SENSITIVELY (uppercase) — this codebase writes SQL keywords
// in caps, and requiring caps is what keeps English prose ("copied from another…") and JS
// (`Array.from`, `import x from 'y'`) out of the results. Combined with the SQL-literal
// extraction below this yields ZERO false positives across the current tree.
const REF_RE = /\b(FROM|JOIN|INTO|UPDATE)\s+[`"']?([A-Za-z_][A-Za-z0-9_]*)/g

// A string literal only counts as SQL if it reads like a statement.
const SQL_LITERAL_RE =
  /\b(SELECT\s|INSERT\s+INTO\s|INSERT\s+OR\s|UPDATE\s|DELETE\s+FROM\s|CREATE\s+(TABLE|VIEW|INDEX)|WITH\s+[A-Za-z_])/

// Tokens that can legally follow one of the keywords but are NOT table names.
// (SQL keywords, CTE/alias plumbing, sqlite pseudo-tables.)
const NOT_A_TABLE = new Set([
  // SQL keywords / clause starters
  'select', 'values', 'set', 'where', 'as', 'on', 'using', 'and', 'or', 'not',
  'null', 'default', 'order', 'group', 'limit', 'offset', 'having', 'union',
  'all', 'distinct', 'exists', 'case', 'when', 'then', 'else', 'end', 'with',
  'recursive', 'left', 'right', 'inner', 'outer', 'full', 'cross', 'natural',
  'join', 'lateral', 'returning', 'conflict', 'do', 'nothing', 'begin', 'commit',
  'rollback', 'pragma', 'table', 'index', 'view', 'trigger', 'temp', 'temporary',
  'main', 'if', 'by', 'asc', 'desc', 'into', 'from', 'update', 'insert', 'delete',
  'count', 'sum', 'min', 'max', 'avg', 'json', 'cast', 'coalesce',
  // sqlite/libsql pseudo-tables — always present, never CREATEd by us
  'sqlite_master', 'sqlite_schema', 'sqlite_sequence', 'sqlite_temp_master',
  'pragma_table_info', 'pragma_table_list', 'pragma_index_list',
])

/**
 * Pull the *contents* of every string literal ('…', "…", `…`) out of a JS/TS source,
 * skipping // and /* *​/ comments. Comments are where the English prose lives, and prose
 * is the entire false-positive surface — so dropping it up front is the key move.
 * Template `${…}` regions are skipped so interpolated code isn't treated as SQL text.
 */
export function extractStringLiterals(src) {
  const out = []
  let i = 0
  const n = src.length
  while (i < n) {
    const c = src[i]
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue }
    if (c === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i++
      let buf = ''
      let depth = 0 // nesting depth inside a template's ${ … }
      while (i < n) {
        const ch = src[i]
        if (ch === '\\') { buf += ' '; i += 2; continue }
        if (quote === '`' && ch === '$' && src[i + 1] === '{') {
          // Skip the interpolated expression (brace-balanced), leave a space placeholder.
          i += 2; depth = 1
          while (i < n && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') depth--
            else if (src[i] === '`' || src[i] === "'" || src[i] === '"') {
              // step over a nested string so its braces don't unbalance us
              const q2 = src[i]; i++
              while (i < n && src[i] !== q2) { if (src[i] === '\\') i++; i++ }
            }
            i++
          }
          buf += ' '
          continue
        }
        if (ch === quote) { i++; break }
        if (quote !== '`' && ch === '\n') break // unterminated single-line string
        buf += ch
        i++
      }
      out.push(buf)
      continue
    }
    i++
  }
  return out
}

function walk(dir, exts, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) walk(full, exts, out)
    else if (exts.some((e) => name.endsWith(e))) out.push(full)
  }
  return out
}

/** Table/view names declared by CREATE / ALTER…RENAME TO inside one chunk of SQL text. */
export function createdInSql(sql) {
  const found = new Set()
  for (const m of sql.matchAll(CREATE_RE)) found.add(m[1].toLowerCase())
  for (const m of sql.matchAll(RENAME_RE)) found.add(m[1].toLowerCase())
  return found
}

/**
 * Every table/view name declared anywhere under `root`.
 *
 * IMPORTANT: for JS/TS we look ONLY inside string literals, never at comments. A comment
 * that merely *mentions* `CREATE TABLE foo` must not count as a declaration — otherwise
 * this very file's header would "declare" audit_log and the gate would silently never
 * fire for it. (Caught during development; kept as a test.)
 */
export function collectCreatedTables(root) {
  const created = new Set()
  for (const file of walk(root, CREATE_EXTS)) {
    let text
    try { text = readFileSync(file, 'utf8') } catch { continue }
    if (!/CREATE\s/i.test(text) && !/ALTER\s+TABLE/i.test(text)) continue
    if (file.endsWith('.sql')) {
      for (const t of createdInSql(text)) created.add(t)
    } else {
      for (const lit of extractStringLiterals(text)) {
        for (const t of createdInSql(lit)) created.add(t)
      }
    }
  }
  return created
}

/**
 * Local CTE names (`WITH x AS (`, `, x AS (`) defined in a file. These read exactly like
 * table references at the FROM/JOIN site but are query-local, so they must not be required
 * to have a CREATE.
 */
function collectCteNames(text) {
  const ctes = new Set()
  const re = /\b(?:WITH\s+(?:RECURSIVE\s+)?|,\s*)([A-Za-z_][A-Za-z0-9_]*)\s+AS\s*\(/gi
  for (const m of text.matchAll(re)) ctes.add(m[1].toLowerCase())
  return ctes
}

/** Table names referenced by FROM/JOIN/INTO/UPDATE inside one SQL string literal. */
export function referencedInSql(sql) {
  const found = new Set()
  if (!SQL_LITERAL_RE.test(sql)) return found
  const ctes = collectCteNames(sql)
  for (const m of sql.matchAll(REF_RE)) {
    const name = m[2].toLowerCase()
    if (NOT_A_TABLE.has(name)) continue
    if (ctes.has(name)) continue
    found.add(name)
  }
  return found
}

/**
 * Every table referenced by FROM/JOIN/INTO/UPDATE in the given backend files.
 * Returns Map<tableName, Set<"relativePath">>.
 */
export function collectReferencedTables(files, root) {
  const refs = new Map()
  for (const file of files) {
    let text
    try { text = readFileSync(file, 'utf8') } catch { continue }
    const rel = root ? relative(root, file) : file
    for (const lit of extractStringLiterals(text)) {
      for (const name of referencedInSql(lit)) {
        if (!refs.has(name)) refs.set(name, new Set())
        refs.get(name).add(rel)
      }
    }
  }
  return refs
}

/** Backend files whose SQL we hold to the "must be CREATEd" rule. */
export function backendFiles(root) {
  const files = walk(join(root, 'prototype', 'lib'), ['.ts'])
    .filter((f) => !/\.test\.tsx?$/.test(f))
  const server = join(root, 'prototype', 'server.ts')
  try { if (statSync(server).isFile()) files.push(server) } catch { /* absent */ }
  return files
}

/** @returns {{ missing: Array<{table:string, files:string[]}>, referenced:number, created:number }} */
export function checkTree(root) {
  const created = collectCreatedTables(root)
  const refs = collectReferencedTables(backendFiles(root), root)
  const missing = []
  for (const [table, files] of [...refs.entries()].sort()) {
    if (!created.has(table)) missing.push({ table, files: [...files].sort() })
  }
  return { missing, referenced: refs.size, created: created.size }
}

// ── CLI ──────────────────────────────────────────────────────────────────────
// realpath both sides: on macOS argv[1] can be /var/... while import.meta.url is /private/var/...
const samePath = (a, b) => { try { return realpathSync(a) === realpathSync(b) } catch { return a === b } }
const isMain = !!process.argv[1] && samePath(fileURLToPath(import.meta.url), process.argv[1])
if (isMain) {
  const root = process.argv[2] ? process.argv[2] : join(__dirname, '..')
  const { missing, referenced, created } = checkTree(root)
  if (missing.length) {
    console.error(
      `db-integrity: ${missing.length} referenced table(s) have NO "CREATE TABLE" anywhere in the tree.`
    )
    console.error('This is the merge-eaten-schema class of bug — the feature ships DEAD ("no such table").')
    for (const { table, files } of missing) {
      console.error(`  MISSING TABLE: ${table}`)
      for (const f of files.slice(0, 6)) console.error(`      referenced by ${f}`)
      if (files.length > 6) console.error(`      ...and ${files.length - 6} more file(s)`)
    }
    process.exit(1)
  }
  console.log(`db-integrity: OK — ${referenced} referenced table(s), all created (${created} CREATE declarations).`)
}
