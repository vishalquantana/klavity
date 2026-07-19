// Regression tests for scripts/check-inline-js.mjs (KLAVITYKLA-0).
//
// The guard used to write every extracted inline <script> to ONE fixed temp
// path (join(tmpdir(), 'klav-inline-check.js')). In this multi-agent workspace
// several agents run the guard at once, so runs clobbered each other's scratch
// file mid-check and emitted random bogus SyntaxError FAILs — and could
// FALSE-PASS, which is the one thing a guard must never do. These tests lock
// in per-invocation temp isolation.
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const GUARD = resolve(import.meta.dir, '..', 'scripts', 'check-inline-js.mjs')

/** Build a throwaway repo-shaped dir (site/ + prototype/public/) to scan. */
function fixture(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'inline-guard-fx-'))
  mkdirSync(join(root, 'site'), { recursive: true })
  mkdirSync(join(root, 'prototype', 'public'), { recursive: true })
  for (const [rel, html] of Object.entries(files)) writeFileSync(join(root, rel), html)
  return root
}

async function runGuard(cwd: string) {
  const proc = Bun.spawn(['node', GUARD], { cwd, stdout: 'pipe', stderr: 'pipe' })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}

const OK_PAGE = `<html><body>
<script>const a = 1; function f(){ return a + 1 } f()</script>
<script>window.x = { k: 'v' }; if (window.x.k === 'v') { console.log('ok') }</script>
</body></html>`

// A big-ish valid page, to widen the window in which a shared temp file would
// be observed half-written by a concurrent run.
const BIG_OK_PAGE = `<html><body><script>\n${Array.from(
  { length: 400 },
  (_, i) => `function fn${i}(){ const v${i} = ${i}; return v${i} * 2 }`,
).join('\n')}\n</script></body></html>`

// Smart-quote corruption — the exact class the guard exists to catch.
const BROKEN_PAGE = `<html><body><script>let x = ‘widget’;</script></body></html>`

let clean: string
let dirty: string

beforeAll(() => {
  clean = fixture({
    'site/a.html': OK_PAGE,
    'site/big.html': BIG_OK_PAGE,
    'prototype/public/b.html': OK_PAGE,
    'prototype/public/big2.html': BIG_OK_PAGE,
  })
  dirty = fixture({
    'site/a.html': OK_PAGE,
    'site/big.html': BIG_OK_PAGE,
    'site/broken.html': BROKEN_PAGE,
    'prototype/public/b.html': BIG_OK_PAGE,
  })
})

afterAll(() => {
  for (const d of [clean, dirty]) rmSync(d, { recursive: true, force: true })
})

describe('inline-JS guard: correctness', () => {
  test('passes on clean inline scripts', async () => {
    const { exitCode, stdout } = await runGuard(clean)
    expect(exitCode).toBe(0)
    expect(stdout).toContain('Inline-JS guard passed')
  })

  test('fails on a real syntax error and names the offending file', async () => {
    const { exitCode, stderr } = await runGuard(dirty)
    expect(exitCode).toBe(1)
    expect(stderr).toContain('site/broken.html')
    expect(stderr).toContain('1 unparsable inline script(s)')
  })

  test('skips src=, JSON-LD and empty scripts', async () => {
    const dir = fixture({
      'site/skip.html': `<html><body>
        <script src="/x.js"></script>
        <script type="application/ld+json">{"@type":"Thing"}</script>
        <script type="application/json">{"a":1}</script>
        <script></script>
      </body></html>`,
    })
    const { exitCode } = await runGuard(dir)
    expect(exitCode).toBe(0)
    rmSync(dir, { recursive: true, force: true })
  })

  test('checks type="module" scripts too', async () => {
    const dir = fixture({
      'site/mod.html': `<html><body><script type="module">import x from './y.js'; let z = ‘bad’;</script></body></html>`,
    })
    const { exitCode, stderr } = await runGuard(dir)
    expect(exitCode).toBe(1)
    expect(stderr).toContain('site/mod.html')
    rmSync(dir, { recursive: true, force: true })
  })
})

describe('inline-JS guard: concurrency safety (no shared temp file)', () => {
  test('source never writes to a fixed shared temp path', () => {
    const src = readFileSync(GUARD, 'utf-8')
    // The historical bug, verbatim. Any reintroduction of a constant filename
    // under tmpdir() is a regression.
    expect(src).not.toContain("join(tmpdir(), 'klav-inline-check.js')")
    expect(src).toContain('mkdtempSync')
  })

  test('12 concurrent runs on a CLEAN tree all pass (no bogus FAILs)', async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () => runGuard(clean)),
    )
    for (const r of results) {
      expect(r.stderr).not.toContain('FAIL')
      expect(r.exitCode).toBe(0)
    }
  }, 60_000)

  test('12 concurrent runs on a DIRTY tree all report exactly the real failure (no false pass)', async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () => runGuard(dirty)),
    )
    for (const r of results) {
      expect(r.exitCode).toBe(1)
      expect(r.stderr).toContain('site/broken.html')
      // Deterministic: exactly one failure, never a random extra file.
      expect(r.stderr).toContain('1 unparsable inline script(s)')
    }
  }, 60_000)
})

describe('inline-JS guard: repo HTML actually parses', () => {
  test('the real repo tree passes the guard', async () => {
    const repoRoot = resolve(import.meta.dir, '..')
    const { exitCode, stderr } = await runGuard(repoRoot)
    if (exitCode !== 0) console.error(stderr)
    expect(exitCode).toBe(0)
  }, 120_000)
})
