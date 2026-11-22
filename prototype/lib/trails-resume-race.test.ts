// R2 requirement 9: a REAL two-worker race. Two independent OS processes (separate DB connections, separate in-memory author
// slots) try to resume the SAME prior session at the same moment, against one real SQLite file. Exactly one may win.
// Nothing here is mocked in-process: the database claim is the only thing that can serialise the two workers.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { writeFileSync, existsSync, unlinkSync } from "node:fs"

const dbFile = join(tmpdir(), `klav-r2race-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + dbFile
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-r2-race-test-32bytesecre").toString("base64")

const D = await import("./db")
let dbc: any
beforeAll(async () => { dbc = D.reconnectDb("file:" + dbFile); await D.applySchema(dbc); await D.migrateV2(dbc) })
const A = await import("./trails-author")

const U = "https://example.com/start"
const cp0 = { traj: [{ action: "navigate", actionValue: U, url: U, domHash: "h0" }], history: ["navigate"], stepIdx: 0, llmCalls: 1, costUsd: 0, lastUrl: U }
const WORKER = join(import.meta.dir, "trails-resume-race.worker.ts")

type Line = { ready?: boolean; won?: boolean; sessionId?: string; error?: string; name?: string; pid?: number }
async function spawnWorker(proj: string, prior: string, go: string) {
  const proc = Bun.spawn(["bun", "run", WORKER], {
    env: { ...process.env, RACE_DB: "file:" + dbFile, RACE_PROJECT: proj, RACE_PRIOR: prior, RACE_GO: go, RACE_HOLD_MS: "400" },
    stdout: "pipe", stderr: "pipe",
  })
  const lines: Line[] = []
  const reader = (async () => {
    const dec = new TextDecoder(); let buf = ""
    for await (const chunk of proc.stdout as any) {
      buf += dec.decode(chunk)
      let i: number
      while ((i = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (l.startsWith("{")) { try { lines.push(JSON.parse(l)) } catch {} } }
    }
  })()
  const ready = async () => { for (let t = 0; t < 20_000; t += 5) { if (lines.some((l) => l.ready)) return; await Bun.sleep(5) } throw new Error("worker never became ready") }
  return { proc, lines, reader, ready }
}

test("two real worker processes race to resume the same prior: exactly one wins, the other is refused", async () => {
  const ROUNDS = 6
  const winners = new Set<number>()
  for (let round = 0; round < ROUNDS; round++) {
    const proj = "proj_r2_race_" + round
    const prior = await A.createAuthorSession(proj, { name: "p", objective: "o", baseUrl: U })
    await A.updateAuthorSession(proj, prior, { checkpoint: cp0 as any, status: "stalled", stallReason: "paused" })
    const go = join(tmpdir(), `klav-r2race-go-${Date.now()}-${round}-${Math.random().toString(36).slice(2)}`)
    const w = [await spawnWorker(proj, prior, go), await spawnWorker(proj, prior, go)]
    await Promise.all(w.map((x) => x.ready()))
    writeFileSync(go, "go")                                                    // both released together
    await Promise.all(w.map(async (x) => { await x.proc.exited; await x.reader }))
    try { if (existsSync(go)) unlinkSync(go) } catch {}

    const results = w.map((x) => x.lines.find((l) => l.won !== undefined)!)
    expect(results.every(Boolean)).toBe(true)
    const won = results.filter((r) => r.won), lost = results.filter((r) => !r.won)
    expect(won).toHaveLength(1)                                                // EXACTLY one winner
    expect(lost).toHaveLength(1)
    // the loser was refused by the claim (or by the busy author slot - never a crash, never a second child)
    expect(lost[0].error).toMatch(/already claimed|not paused|already being resumed|already running/i)

    const kids = (await dbc.execute({ sql: "SELECT id, status FROM author_sessions WHERE resumed_from=?", args: [prior] })).rows as any[]
    expect(kids).toHaveLength(1)                                               // exactly ONE child row exists
    expect(kids[0].id).toBe(won[0].sessionId)
    const p = (await A.getAuthorSession(proj, prior))!
    expect(p.resumedBy).toBe(won[0].sessionId)                                 // the prior is owned by the winner only
    expect(p.status).toBe("resuming")                                          // winner kept progress -> consumed
    expect(kids[0].status).toBe("stalled")
    winners.add(won[0].pid!)
  }
  expect(winners.size).toBeGreaterThan(0)
}, 120_000)
