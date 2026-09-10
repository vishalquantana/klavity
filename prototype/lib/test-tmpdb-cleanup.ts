// KLA-791: bun-test preload giving each test process its OWN temp dir, then removing it at the end.
//
// Many tests do `join(tmpdir(), `klav-...-${Date.now()}-${rand}.db`)` and set TURSO_DATABASE_URL to it, but
// never delete the file (nor its libSQL -wal/-shm sidecars). Over a long session of repeated `bun test`
// runs these accumulated to ~11k files / ~14G in the macOS tmpdir and filled the dev disk (ENOSPC → false
// test failures). Rather than retrofit cleanup into ~108 test files, redirect this process's tmpdir to a
// unique per-run subdirectory (bun's os.tmpdir() honors process.env.TMPDIR at call time — verified) and
// remove that whole subtree when the suite finishes.
//
// This is TRUE per-process isolation: every `tmpdir()` call in this process resolves inside our own
// subdir, so a parallel `bun test` invocation writes into ITS own subdir and we can never delete its files
// (the birthtime/mtime heuristic a prior version used could clobber a concurrent run — codex round-review).
//
// Wired via `[test] preload` in bunfig.toml. Cleanup runs from a GLOBAL afterAll (registered here) — bun's
// test runner does not reliably emit process "exit" for a preload handler; the exit handler is a fallback.
import { tmpdir } from "node:os"
import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { afterAll } from "bun:test"

// Create the per-run dir under the ORIGINAL system tmpdir, then point TMPDIR at it BEFORE any test imports
// os/calls tmpdir(). Preloads run before test files, so all subsequent tmpdir() calls see this subdir.
const RUN_TMPDIR = mkdtempSync(join(tmpdir(), "klav-testrun-"))
process.env.TMPDIR = RUN_TMPDIR

function removeRunTmpdir(): void {
  try { rmSync(RUN_TMPDIR, { recursive: true, force: true }) } catch { /* best-effort */ }
}

afterAll(removeRunTmpdir)
process.on("exit", removeRunTmpdir) // fallback; rmSync is sync so it is safe in an exit handler
