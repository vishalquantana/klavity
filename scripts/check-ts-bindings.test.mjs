import { test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { backendProgramFiles, checkBindings } from './check-ts-bindings.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')

/** Build a throwaway repo-shaped tree: { 'prototype/server.ts': '…' } */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'klav-tsbind-fx-'))
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
  return root
}

// ── The real incident (b0e70882): server.ts kept the call sites, lost the import ──
// A gate that only ever proves the GREEN case proves nothing. These two are the ones
// that matter: the checker must actually BITE on the merge-eaten import.

const AUDIT_LIB = `
export type AuditAction = "login" | "invite"
export function logAudit(a: AuditAction, who: string) { return \`\${a}:\${who}\` }
export function queryAuditLog() { return [] as string[] }
`

test('BITES when server.ts loses its ./lib/audit-log import but keeps the call sites', { timeout: 60_000 }, () => {
  const root = fixture({
    'prototype/lib/audit-log.ts': AUDIT_LIB,
    // NOTE: no import line at all — this is exactly what the -X theirs merge produced.
    'prototype/server.ts': `
      export function verifyOtp(email: string) {
        logAudit("login", email)          // login/verify success path — prod outage
        return queryAuditLog()
      }
    `,
  })
  try {
    const r = checkBindings(root)
    expect(r.serverInProgram).toBe(true)
    expect(r.ok).toBe(false)
    const joined = r.errors.join('\n')
    expect(joined).toMatch(/error TS2304/)
    expect(joined).toMatch(/logAudit/)
    expect(joined).toMatch(/queryAuditLog/)
    expect(joined).toMatch(/server\.ts/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('PASSES once the import is restored (same fixture, import re-added)', { timeout: 60_000 }, () => {
  const root = fixture({
    'prototype/lib/audit-log.ts': AUDIT_LIB,
    'prototype/server.ts': `
      import { logAudit, queryAuditLog } from "./lib/audit-log"
      export function verifyOtp(email: string) {
        logAudit("login", email)
        return queryAuditLog()
      }
    `,
  })
  try {
    const r = checkBindings(root)
    expect(r.serverInProgram).toBe(true)
    expect(r.errors).toEqual([])
    expect(r.ok).toBe(true)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('HTMLRewriter (a Bun ambient global) must NOT be reported — the gate must not cry wolf', { timeout: 60_000 }, () => {
  const root = fixture({
    'prototype/server.ts': 'export const x = new HTMLRewriter()\n',
  })
  try {
    expect(checkBindings(root).errors.join('\n')).not.toMatch(/HTMLRewriter/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('the backend program includes server.ts (tsconfig include does NOT — that was the blind spot)', () => {
  const files = backendProgramFiles(REPO)
  expect(files).toContain(join(REPO, 'prototype/server.ts'))
  expect(files.length).toBeGreaterThan(50)
})

test('the backend program excludes *.test.ts (they import bun:test, unresolvable by tsc)', () => {
  expect(backendProgramFiles(REPO).some((f) => /\.test\.ts$/.test(f))).toBe(false)
})

test(
  'the real repo has zero unresolved bindings, and coverage of server.ts is PROVEN not assumed',
  { timeout: 60_000 },
  () => {
    const r = checkBindings(REPO)
    // If this ever fails with serverInProgram=false, the gate has gone blind — that is itself
    // the bug (a green result computed over a program that omits server.ts is worthless).
    expect(r.serverInProgram).toBe(true)
    expect(r.errors).toEqual([])
    expect(r.ok).toBe(true)
  }
)
