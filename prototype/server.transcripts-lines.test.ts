// server.transcripts-lines.test.ts
//
// Regression guard for the lines_json column on `transcripts` (Task 3 migration) as
// deployed by the running server's schema application (initDb). Subprocess harness
// mirrors server.sim-url-preview.test.ts: spawn `bun run server.ts` against a fresh
// temp `file:` DB, wait for it to boot (schema applied, including the ALTER TABLE
// transcripts ADD COLUMN lines_json migration), then write/read a transcript row
// directly through @libsql/client and assert lines_json round-trips with tsSeconds
// intact. No LLM calls are exercised here — full end-to-end POST /api/transcripts
// coverage (extract+reconcile) is LLM-dependent and covered by the e2e journey (Task 9).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Temp DB ───────────────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-tx-lines-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(66)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })

// ── Server subprocess ─────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = await __freePortKLA719()
  BASE = `http://localhost:${serverPort}`

  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
}, 20000 /* bun:test beforeAll timeout */)

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

test("stored transcript has lines_json with parsed timestamps", async () => {
  await rawClient.execute({
    sql: "INSERT INTO transcripts (id,project_id,title,raw_text,source_date,lines_json,added_by,created_at) VALUES (?,?,?,?,?,?,?,?)",
    args: ["tr_lines_1", "proj_1", null, "00:00:05 Sarah: hi", 1000,
           JSON.stringify([{ speaker: "Sarah", text: "hi", tsSeconds: 5, charStart: 0, charEnd: 18 }]),
           "t@x.com", Date.now()],
  })
  const r = await rawClient.execute({ sql: "SELECT lines_json FROM transcripts WHERE id=?", args: ["tr_lines_1"] })
  expect(JSON.parse(String(r.rows[0].lines_json))[0].tsSeconds).toBe(5)
})
