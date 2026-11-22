// Worker process for lib/trails-resume-race.test.ts. NOT a test file (no *.test.ts suffix).
// Each worker is a real, independent OS process with its own database connection and its own in-memory author slot, so the
// only thing that can serialise two workers resuming the same prior session is the database claim itself.
//
// env: RACE_DB (file: url), RACE_PROJECT, RACE_PRIOR, RACE_GO (path that appears when both workers are ready), RACE_HOLD_MS
import { existsSync } from "node:fs"

const url = process.env.RACE_DB!
process.env.TURSO_DATABASE_URL = url
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = process.env.KLAV_SECRET || Buffer.from("autosims-r2-race-worker-32bytesec").toString("base64")

const D = await import("./db")
D.reconnectDb(url)                                   // tunes the file DB (WAL + busy_timeout) like the real server does
const A = await import("./trails-author")

const proj = process.env.RACE_PROJECT!
const prior = process.env.RACE_PRIOR!
const hold = Number(process.env.RACE_HOLD_MS || 400)
const U = "https://example.com/start"
const cp = { traj: [{ action: "navigate", actionValue: U, url: U, domHash: "h" }], history: ["navigate"], stepIdx: 0, llmCalls: 1, costUsd: 0, lastUrl: U + "/w" + process.pid }

console.log(JSON.stringify({ ready: true, pid: process.pid }))
while (!existsSync(process.env.RACE_GO!)) await Bun.sleep(1)    // barrier: both workers fire at (nearly) the same instant

const author = (async (_p: string, _r: any, o: any) => {
  await Bun.sleep(hold)                                           // keep the child 'running' long enough for the loser to collide
  await o.onCheckpoint(cp)
  return { status: "stalled", trailId: null, verificationRunId: null, verificationVerdict: null, steps: [], stallReason: "worker done", llmCalls: 1, costUsd: 0, objectiveVerified: false }
}) as any

let result: Record<string, unknown>
try {
  const { sessionId } = await A.runAuthorNow(proj, { name: "race", objective: "race to resume", baseUrl: U }, { author, resumeSessionId: prior })
  result = { won: true, sessionId, pid: process.pid }
  // let the background drive finish so the child row reaches its final state before the process exits
  for (let i = 0; i < 200; i++) { const s = await A.getAuthorSession(proj, sessionId); if (s && s.status !== "running") break; await Bun.sleep(25) }
} catch (e: any) {
  result = { won: false, error: String(e?.message || e), name: String(e?.name || ""), pid: process.pid }
}
console.log(JSON.stringify(result))
process.exit(0)
