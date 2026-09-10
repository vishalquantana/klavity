// KLA-791: bun-test preload that sweeps the per-run temp SQLite DBs the suite leaves in the OS tmpdir.
//
// Many tests do `join(tmpdir(), `klav-...-${Date.now()}-${rand}.db`)` and set TURSO_DATABASE_URL to it, but
// never delete the file (nor its libSQL -wal/-shm sidecars). Over a long session of repeated `bun test`
// runs these accumulated to ~11k files / ~14G in the macOS tmpdir and filled the dev disk (ENOSPC → false
// test failures). Rather than retrofit an afterAll into ~108 test files, sweep once at the end of the run.
//
// Wired via `[test] preload` in bunfig.toml. Cleanup runs from a GLOBAL afterAll (registered here in the
// preload) — bun's test runner does not reliably emit process "exit" for a preload handler, so afterAll is
// the load-bearing hook; process.on("exit") is kept only as a harmless fallback.
//
// Safety: only files CREATED during this process (birthtime >= process start) and matching klav-*.db* are
// removed, so a parallel `bun test` invocation's DBs (created earlier) are never clobbered. `[test]
// maxConcurrency = 1` also means there is no in-run parallelism to race.
import { tmpdir } from "node:os"
import { readdirSync, statSync, unlinkSync } from "node:fs"
import { join } from "node:path"
import { afterAll } from "bun:test"

const START_MS = Date.now()
// klav-<suffix>-<ts>-<rand>.db plus its libSQL sidecars.
const TEMP_DB_RE = /^klav-.*\.db(-wal|-shm|-journal)?$/

function sweepRunTempDbs(): void {
  const dir = tmpdir()
  let names: string[]
  try { names = readdirSync(dir) } catch { return }
  for (const name of names) {
    if (!TEMP_DB_RE.test(name)) continue
    const p = join(dir, name)
    try {
      const st = statSync(p)
      // birthtime = creation time (reliable on APFS); fall back to mtime if unavailable. Only remove files
      // born during this run, with a small grace for clock skew.
      const born = st.birthtimeMs || st.mtimeMs
      if (born >= START_MS - 5_000) unlinkSync(p)
    } catch { /* already gone / held open — ignore */ }
  }
}

afterAll(sweepRunTempDbs)
process.on("exit", sweepRunTempDbs) // fallback; the *Sync fs calls are safe in a sync exit handler
