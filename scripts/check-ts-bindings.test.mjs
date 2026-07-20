import { test, expect } from 'vitest'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { backendProgramFiles, checkBindings } from './check-ts-bindings.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')

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
