#!/usr/bin/env node
// Unresolved-binding guard — catches the "merge-eaten import" bug class.
//
// WHY (two real prod defects, 2026-07-20): the merge-train merges with `-X theirs` and ran
// no CI. Twice in one day a theirs-wins merge kept a file's CALL SITES but silently dropped
// the IMPORT that bound them:
//   1. server.ts kept 11 `logAudit(...)` call sites — one on the login/verify success path —
//      but lost `import { logAudit, … } from "./lib/audit-log"`. Every login threw
//      `ReferenceError: logAudit is not defined`. (commit b0e70882)
//   2. server.ts called `agencyClientOutcomes(...)` with no import → agency report route 500s.
//
// An unresolved identifier only throws AT CALL TIME, so the server still BOOTS: boot-smoke
// and prod's health-rollback are both blind to it. Only a static check catches it.
//
// CRITICAL: `prototype/tsconfig.json` does NOT include server.ts (verified — plain
// `tsc --noEmit --listFiles` matches 0 server.ts), so the single largest and most
// merge-contended file in the repo was invisible to the type gate. This script therefore
// passes the backend file set EXPLICITLY on the command line (which bypasses tsconfig
// `include`) and then ASSERTS via --listFiles that server.ts really is in the program.
// If that assertion ever fails, the script exits non-zero rather than passing silently.
//
// Usage:  node scripts/check-ts-bindings.mjs [repoRoot]
//   exit 0 = no TS2304 ("cannot find name") in the backend program
//   exit 1 = unresolved bindings found (prints them)
//   exit 2 = the check could not be trusted (server.ts not in program / no tsc)

import { readdirSync, statSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { realpathSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Same compiler flags the merge-train's existing tsc gate uses, so results are comparable.
export const TSC_FLAGS = [
  '--noEmit', '--pretty', 'false', '--strict', 'false', '--noImplicitAny', 'false',
  '--skipLibCheck', '--moduleResolution', 'bundler', '--module', 'esnext',
  '--target', 'es2022', '--lib', 'es2022,dom',
]

// Bun-isms tsc can't resolve on its own. Without these the run drowns in noise (and, worse,
// some of that noise is TS2304 — which would make this gate cry wolf).
const GLOBALS_DTS = `
declare const process: any;
declare const Bun: any;
declare const Buffer: any;
declare const console: any;
declare const fetch: any;
declare const setTimeout: any;
declare const clearTimeout: any;
declare const setInterval: any;
declare const clearInterval: any;
declare module "bun" { export class S3Client { constructor(...args: any[]) } }
interface ImportMeta { dir: string; }
declare module "node:async_hooks" { export class AsyncLocalStorage<T = any> { constructor(); run<R>(store: T, callback: () => R): R; getStore(): T | undefined; } }
declare module "node:crypto" { export const createHmac: any; export const timingSafeEqual: any; export const randomUUID: any; }
declare module "node:dns/promises" { export const lookup: any; }
declare module "node:net" { export const isIP: any; }
`

function walkTs(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (name === 'node_modules' || name === '.git' || name === 'dist') continue
    const full = join(dir, name)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) walkTs(full, out)
    // *.test.ts import bun:test (unresolvable by tsc; covered by `bun test` instead)
    else if (name.endsWith('.ts') && !/\.test\.tsx?$/.test(name) && !name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

/**
 * The backend program: every prototype/*.ts entrypoint (server.ts et al) plus prototype/lib/**.
 * Entrypoints are the whole point — they are what tsconfig `include` was missing.
 */
export function backendProgramFiles(root) {
  const proto = join(root, 'prototype')
  const files = []
  let top = []
  try { top = readdirSync(proto) } catch { return files }
  for (const name of top) {
    if (!name.endsWith('.ts') || /\.test\.tsx?$/.test(name) || name.endsWith('.d.ts')) continue
    files.push(join(proto, name))
  }
  walkTs(join(proto, 'lib'), files)
  return files
}

function resolveTsc(root) {
  // Also look next to THIS script, not just under `root`: the merge-train runs us against a
  // bare `git worktree add` of origin/master to compute a baseline, and that tree has no
  // node_modules. Falling back to the main checkout's tsc keeps the baseline run working.
  const candidates = [
    join(root, 'packages/core/node_modules/.bin/tsc'),
    join(root, 'node_modules/.bin/tsc'),
    join(__dirname, '..', 'packages/core/node_modules/.bin/tsc'),
    join(__dirname, '..', 'node_modules/.bin/tsc'),
  ]
  for (const c of candidates) if (existsSync(c)) return { cmd: c, pre: [] }
  for (const [cmd, pre] of [['bunx', ['tsc']], ['npx', ['--no-install', 'tsc']]]) {
    try { execFileSync('command', ['-v', cmd], { stdio: 'ignore' }) } catch { /* ignore */ }
    return { cmd, pre }   // let the run itself fail if the launcher is missing
  }
  return null
}

/** @returns {{ ok:boolean, reason:string, errors:string[], serverInProgram:boolean, fileCount:number }} */
export function checkBindings(root) {
  const files = backendProgramFiles(root)
  const serverTs = join(root, 'prototype', 'server.ts')
  if (!files.some((f) => f === serverTs)) {
    return { ok: false, reason: 'server.ts not found on disk', errors: [], serverInProgram: false, fileCount: files.length }
  }
  const tsc = resolveTsc(root)
  if (!tsc) return { ok: false, reason: 'no tsc available', errors: [], serverInProgram: false, fileCount: files.length }

  const tmp = mkdtempSync(join(tmpdir(), 'klav-tsbind-'))
  const shim = join(tmp, 'globals.d.ts')
  writeFileSync(shim, GLOBALS_DTS)
  let out = ''
  try {
    out = execFileSync(tsc.cmd, [...tsc.pre, ...TSC_FLAGS, '--listFiles', shim, ...files], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
    })
  } catch (e) {
    // tsc exits non-zero whenever there are ANY errors — expected; we only care about TS2304.
    out = `${e.stdout || ''}${e.stderr || ''}`
    if (!out) { rmSync(tmp, { recursive: true, force: true }); return { ok: false, reason: `tsc failed to run: ${e.message}`, errors: [], serverInProgram: false, fileCount: files.length } }
  }
  rmSync(tmp, { recursive: true, force: true })

  const lines = out.split('\n')
  // COVERAGE ASSERTION — never trust a green result we can't prove was computed over server.ts.
  const serverInProgram = lines.some((l) => /(^|\/)prototype\/server\.ts\s*$/.test(l.trim()) || l.trim().endsWith('/prototype/server.ts'))
  const errors = lines.filter((l) => /error TS2304/.test(l))
  if (!serverInProgram) {
    return { ok: false, reason: 'COVERAGE FAILURE: prototype/server.ts is not in the tsc program', errors, serverInProgram: false, fileCount: files.length }
  }
  return { ok: errors.length === 0, reason: errors.length ? 'unresolved bindings' : 'clean', errors, serverInProgram: true, fileCount: files.length }
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const samePath = (a, b) => { try { return realpathSync(a) === realpathSync(b) } catch { return a === b } }
if (process.argv[1] && samePath(fileURLToPath(import.meta.url), process.argv[1])) {
  const root = process.argv[2] ? process.argv[2] : join(__dirname, '..')
  const r = checkBindings(root)
  if (!r.serverInProgram || r.reason === 'no tsc available' || r.reason.startsWith('tsc failed')) {
    console.error(`ts-bindings: CANNOT VERIFY — ${r.reason}. Treating as failure (a gate that can't see server.ts is worse than no gate).`)
    process.exit(2)
  }
  if (!r.ok) {
    console.error(`ts-bindings: ${r.errors.length} unresolved name(s) (TS2304) in the backend program.`)
    console.error('This is the merge-eaten-import bug class: the call site survived a -X theirs merge but its import/definition did NOT.')
    console.error('The server still BOOTS — it throws ReferenceError at call time — so boot-smoke and prod health-rollback will NOT catch this.')
    for (const e of r.errors.slice(0, 25)) console.error(`  ${e.trim()}`)
    if (r.errors.length > 25) console.error(`  ...and ${r.errors.length - 25} more`)
    process.exit(1)
  }
  console.log(`ts-bindings: OK — 0 TS2304 across ${r.fileCount} backend file(s); server.ts confirmed in program.`)
}
