// lib/test-db-isolation.ts — shared DB isolation helper for Bun test files.
//
// PROBLEM: all test files run in ONE Bun process (maxConcurrency=1, sequential),
// but they share a single module registry. The `db` export in lib/db.ts is a
// mutable `let` binding created once at first import. Any test file that calls
// reconnectDb() re-points that shared singleton — which can stomp on another
// file's state if tests interleave or if a file sets TURSO_DATABASE_URL at
// module-load time and does NOT reconnect before every test.
//
// USAGE (in a test file that needs its own isolated SQLite DB):
//
//   import { useIsolatedDb } from "./test-db-isolation"
//
//   const { getClient } = useIsolatedDb()
//
//   // Then use getClient() inside tests to get the currently-active test client.
//   // The helper wires reconnectDb + applySchema into beforeEach automatically.
//
// This guarantees:
//   (a) Before every test in this file, the shared `db` singleton is re-pointed
//       at THIS file's own temp SQLite file.
//   (b) The schema is applied so the DB is ready.
//   (c) The client returned by getClient() is always the same object that the
//       module-level `db` binding refers to — so direct writes via the client
//       and helper-function reads via `db!` always hit the same file.

import { beforeEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { reconnectDb, applySchema, type Client } from "./db"

export interface IsolatedDbHandle {
  /** Returns the currently-active test client (updated every beforeEach). */
  getClient: () => Client
  /** The path of the isolated DB file (constant across all tests). */
  dbPath: string
  /** The `file:` URL of the isolated DB (constant across all tests). */
  dbUrl: string
}

/**
 * Wire a fresh isolated libSQL DB for a test file.
 *
 * Call once at the top of a test file (module scope).  The function registers a
 * `beforeEach` hook that re-points the shared `db` singleton at this file's own
 * temp file and applies the schema — so the file's tests always own the singleton
 * regardless of which other files ran before them.
 *
 * @param prefix  Short label used in the temp-file name (default: "klav-isolated").
 */
export function useIsolatedDb(prefix = "klav-isolated"): IsolatedDbHandle {
  const dbPath = join(
    tmpdir(),
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  )
  const dbUrl = "file:" + dbPath

  // Set the env var before any import of ./db can happen.  If ./db is already
  // loaded this is a no-op for the module init, but reconnectDb() below takes
  // over from there.
  process.env.TURSO_DATABASE_URL = dbUrl
  delete process.env.TURSO_AUTH_TOKEN

  let _client: Client

  beforeEach(async () => {
    // Re-point the shared singleton at OUR file.  This must happen before every
    // test so that even if another file's beforeAll/beforeEach ran between our
    // tests and re-pointed db, we take it back here.
    _client = reconnectDb(dbUrl)
    await applySchema(_client)
  })

  return {
    getClient: () => _client,
    dbPath,
    dbUrl,
  }
}
