// R2: resume claim lifecycle. A prior session claimed for a resume must never stay in `resuming` indefinitely, and a stale
// worker must never overwrite a newer attempt or a recovered state. Real (temp) database throughout; the only fakes are the
// author drive itself and the alert sender.
//
// State design under test:
//   child crystallized / stalled / needs_auth (progress kept) -> prior stays 'resuming' = CONSUMED by that child
//   child failed (retryable, or the process died)               -> prior restored to 'stalled', checkpoint intact, claim cleared
//   child cancelled by the user                                 -> prior terminal 'failed' ("resume cancelled by user"), never restored
//   claim + child row are created in ONE transaction; claim release/restore never touches updated_at (7-day timer)
//   every worker write is fenced:  child row -> `AND status='running'`;  prior row -> `AND status='resuming' AND resumed_by=<me>`
import { describe, test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-r2claim-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-r2-claim-test-32bytesecr").toString("base64")

const D = await import("./db")
let dbc: any
beforeAll(async () => { dbc = D.reconnectDb("file:" + file); await D.applySchema(dbc); await D.migrateV2(dbc) })
const A = await import("./trails-author")
const B = await import("./trails-browser")

const U = "https://example.com/start"
const cp0 = { traj: [{ action: "navigate", actionValue: U, url: U, domHash: "h0" }], history: ["navigate"], stepIdx: 0, llmCalls: 1, costUsd: 0.01, lastUrl: U }
const cp1 = { traj: [...cp0.traj, { action: "click", url: U + "/2", domHash: "h1" }], history: ["navigate", "click"], stepIdx: 1, llmCalls: 2, costUsd: 0.02, lastUrl: U + "/2" }
const req = { name: "n", objective: "do the thing", baseUrl: U }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const reset = () => { B._resetWalkPoolForTest(1, 0); B._resetAuthorAdmissionForTest() }
const outcome = (status: string, extra: Record<string, unknown> = {}) => ({ status, trailId: null, verificationRunId: null, verificationVerdict: null, steps: [], stallReason: "x", llmCalls: 0, costUsd: 0, objectiveVerified: false, ...extra })

async function newPrior(proj: string, status: "stalled" | "needs_auth" = "stalled", updatedAt?: number) {
  const id = await A.createAuthorSession(proj, req)
  await A.updateAuthorSession(proj, id, { checkpoint: cp0 as any, status, stallReason: "paused" })
  if (updatedAt !== undefined) await dbc.execute({ sql: "UPDATE author_sessions SET updated_at=? WHERE id=?", args: [updatedAt, id] })
  return id
}
const get = (proj: string, id: string) => A.getAuthorSession(proj, id)
const listed = async (proj: string) => (await A.listStalledAuthorSessions(proj)).map((s) => s.id)
async function waitNotRunning(proj: string, id: string, ms = 6000) {
  for (let t = 0; t < ms; t += 40) { const s = await get(proj, id); if (s && s.status !== "running") return s; await sleep(40) }
  return (await get(proj, id))!
}
/** Start a resume of `prior` whose drive is `drive`; resolves with the child session id as soon as the child row exists. */
async function resume(proj: string, prior: string, drive: (opts: any) => Promise<any>, extra: Record<string, unknown> = {}) {
  const { sessionId } = await A.runAuthorNow(proj, req, { author: ((_p: string, _r: any, o: any) => drive(o)) as any, resumeSessionId: prior, ...extra })
  return sessionId
}
const rejects = async (p: Promise<unknown>) => { try { await p; return null } catch (e: any) { return e as Error } }
const gate = () => { let open!: () => void; const p = new Promise<void>((r) => { open = r }); return { p, open } }

describe("1. child ends with progress kept -> prior is CONSUMED (stays resuming, owned by that child)", () => {
  for (const [name, drive] of [
    ["crystallized", async (o: any) => { await o.onCheckpoint(cp1); return outcome("crystallized") }],
    ["stalled with a usable checkpoint", async (o: any) => { await o.onCheckpoint(cp1); return outcome("stalled") }],
  ] as const) {
    test(name, async () => {
      reset(); const proj = "proj_r2_1_" + name.replace(/\W+/g, "_")
      const prior = await newPrior(proj)
      const child = await resume(proj, prior, drive)
      const c = await waitNotRunning(proj, child)
      expect(c.status).toBe(name === "crystallized" ? "crystallized" : "stalled")
      await sleep(100)
      const p = (await get(proj, prior))!
      expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(child)
      expect(await listed(proj)).not.toContain(prior)                       // never offered twice
      reset()
      const again = await rejects(A.runAuthorNow(proj, req, { author: (async () => outcome("failed")) as any, resumeSessionId: prior }))
      expect(again?.message).toMatch(/not paused/)
    }, 20_000)
  }
})

describe("2. child fails with a retryable error -> prior restored to stalled with its checkpoint, claim cleared", () => {
  const cases: Record<string, (o: any) => Promise<any>> = {
    "returned failed": async () => outcome("failed", { stallReason: "boom" }),
    "author() throws": async () => { throw new Error("kaboom") },
    "stalled but its checkpoint was never persisted (R1 verdict downgrade)": async () => outcome("stalled"),
  }
  for (const [name, drive] of Object.entries(cases)) {
    test(name, async () => {
      reset(); const proj = "proj_r2_2_" + name.replace(/\W+/g, "_")
      const prior = await newPrior(proj)
      const before = (await get(proj, prior))!
      const child = await resume(proj, prior, drive)
      const c = await waitNotRunning(proj, child)
      expect(c.status).toBe("failed")
      const p = (await get(proj, prior))!
      expect(p.status).toBe("stalled"); expect(p.resumedBy).toBeNull()
      expect(p.checkpoint).toEqual(before.checkpoint)                        // checkpoint preserved
      expect(p.updatedAt).toBe(before.updatedAt)                             // (see test 12)
      expect(await listed(proj)).toContain(prior)
      reset()                                                                 // manual resume works again
      const second = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp1); return outcome("stalled") })
      expect((await waitNotRunning(proj, second)).status).toBe("stalled")
    }, 20_000)
  }
})

describe("3. user cancellation is terminal: the prior is NEVER restored to a resumable state", () => {
  test("cancel during the resumed run", async () => {
    reset(); const proj = "proj_r2_3"
    const prior = await newPrior(proj)
    const before = (await get(proj, prior))!
    let sid = ""
    const child = await resume(proj, prior, async () => {
      sid = (await A.getActiveAuthorSession(proj))!.id
      B.cancelCurrentAuthor(sid)
      return outcome("failed", { stallReason: "cancelled by user" })
    })
    const c = await waitNotRunning(proj, child)
    expect(c.status).toBe("failed"); expect(c.stallReason).toBe("cancelled by user")
    const p = (await get(proj, prior))!
    expect(p.status).toBe("failed"); expect(p.stallReason).toBe("resume cancelled by user")
    expect(p.checkpoint).toEqual(before.checkpoint)                          // checkpoint kept for diagnostics, but not resumable
    expect(await listed(proj)).not.toContain(prior)
    reset()
    const again = await rejects(A.runAuthorNow(proj, req, { author: (async () => outcome("failed")) as any, resumeSessionId: prior }))
    expect(again?.message).toMatch(/not paused/)
    // and the sweeps never "recover" a cancelled prior
    await D.sweepOrphanedAuthorSessions(dbc); await D.sweepStaleAuthorSessions(dbc, 1)
    expect((await get(proj, prior))!.status).toBe("failed")
  }, 20_000)
})

describe("4. child process dies unexpectedly (boot sweep after the restart)", () => {
  test("child had no usable checkpoint -> child failed, prior restored to stalled", async () => {
    reset(); const proj = "proj_r2_4a"
    const prior = await newPrior(proj)
    const child = await resume(proj, prior, () => new Promise(() => {}))        // the worker never comes back: process died
    await sleep(100)
    expect((await get(proj, child))!.status).toBe("running")
    await D.sweepOrphanedAuthorSessions(dbc)                                   // server restart
    expect((await get(proj, child))!.status).toBe("failed")
    const p = (await get(proj, prior))!
    expect(p.status).toBe("stalled"); expect(p.resumedBy).toBeNull()
    expect(await listed(proj)).toContain(prior)
  }, 20_000)
  test("child had persisted a usable checkpoint -> child stalled (resumable), prior stays consumed", async () => {
    reset(); const proj = "proj_r2_4b"
    const prior = await newPrior(proj)
    const child = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp1); return new Promise(() => {}) })
    await sleep(150)
    await D.sweepOrphanedAuthorSessions(dbc)
    expect((await get(proj, child))!.status).toBe("stalled")
    const p = (await get(proj, prior))!
    expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(child)
    expect(await listed(proj)).toContain(child); expect(await listed(proj)).not.toContain(prior)
  }, 20_000)
})

describe("5. crash between the claim and the child insert cannot leave a claim behind (one transaction)", () => {
  test("if the child INSERT fails, the claim rolls back with it", async () => {
    reset(); const proj = "proj_r2_5"
    const prior = await newPrior(proj)
    const before = (await get(proj, prior))!
    await dbc.execute("CREATE TRIGGER r2_crash BEFORE INSERT ON author_sessions WHEN NEW.resumed_from IS NOT NULL BEGIN SELECT RAISE(ABORT, 'simulated crash after claim'); END")
    let err: Error | null
    try { err = await rejects(A.runAuthorNow(proj, req, { author: (async () => outcome("failed")) as any, resumeSessionId: prior })) }
    finally { await dbc.execute("DROP TRIGGER IF EXISTS r2_crash") }
    expect(err).not.toBeNull()
    const p = (await get(proj, prior))!
    expect(p.status).toBe("stalled"); expect(p.resumedBy).toBeNull(); expect(p.updatedAt).toBe(before.updatedAt)
    expect(((await dbc.execute({ sql: "SELECT COUNT(*) n FROM author_sessions WHERE resumed_from=?", args: [prior] })).rows[0] as any).n).toBe(0)
    expect(await listed(proj)).toContain(prior)
  }, 20_000)
})

describe("6. orphaned claims are recovered by the existing sweeps", () => {
  const seedClaim = async (proj: string, childStatus: string | null, opts: { reason?: string; beat?: number | null; cp?: boolean } = {}) => {
    const prior = await newPrior(proj)
    let childId = "auth_ghost_" + crypto.randomUUID()
    if (childStatus) {
      childId = await A.createAuthorSession(proj, req, prior)
      await dbc.execute({ sql: "UPDATE author_sessions SET status=?, stall_reason=?, last_beat_at=?, checkpoint_json=? WHERE id=?", args: [childStatus, opts.reason ?? null, opts.beat ?? null, opts.cp ? JSON.stringify(cp1) : null, childId] })
    }
    await dbc.execute({ sql: "UPDATE author_sessions SET status='resuming', resumed_by=? WHERE id=?", args: [childId, prior] })
    return { prior, childId }
  }
  // An OLD (pre-R2) process claims in two statements (UPDATE prior, then INSERT child) and bumps updated_at to "now" when it claims.
  // A claim with no child row is therefore only provably orphaned once it is older than the grace window; inside it the old process
  // may be about to insert the child. (New-code claims are atomic and can never be ghosts.)
  const age = async (prior: string, ms: number) => dbc.execute({ sql: "UPDATE author_sessions SET updated_at=? WHERE id=?", args: [Date.now() - ms, prior] })
  test("ghost claim (no child row) older than the grace window -> restored by the boot sweep AND by the stale reaper", async () => {
    for (const [sweep, tag] of [[() => D.sweepOrphanedAuthorSessions(dbc), "boot"], [() => D.sweepStaleAuthorSessions(dbc, 1), "stale"]] as const) {
      const { prior } = await seedClaim("proj_r2_6_ghost_" + tag, null)
      await age(prior, D.RESUME_CLAIM_GHOST_GRACE_MS + 60_000)
      await sweep()
      const p = (await get("proj_r2_6_ghost_" + tag, prior))!
      expect(p.status).toBe("stalled"); expect(p.resumedBy).toBeNull()
    }
  })
  test("BLUE/GREEN: a fresh ghost (an old process between its claim and its child INSERT) is NOT released; it is once it ages out", async () => {
    const proj = "proj_r2_6_bluegreen"
    const { prior, childId } = await seedClaim(proj, null)                      // updated_at = now: the old process just claimed
    await D.sweepOrphanedAuthorSessions(dbc); await D.sweepStaleAuthorSessions(dbc, 1)
    let p = (await get(proj, prior))!
    expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(childId)       // left alone inside the grace window
    // the old process now completes its (non-atomic) second statement: the child appears - nothing was double-claimed
    await dbc.execute({ sql: "INSERT INTO author_sessions (id,project_id,name,objective,base_url,status,resumed_from,created_at,updated_at,last_beat_at) VALUES (?,?,?,?,?,'running',?,?,?,?)", args: [childId, proj, "n", "o", U, prior, Date.now(), Date.now(), Date.now()] })
    await D.sweepOrphanedAuthorSessions(dbc); await D.sweepStaleAuthorSessions(dbc, 180_000)
    p = (await get(proj, prior))!
    expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(childId)       // the live child still owns it
    // a different ghost whose old process really died: recovered after the window
    const dead = await seedClaim("proj_r2_6_bluegreen_dead", null)
    await age(dead.prior, D.RESUME_CLAIM_GHOST_GRACE_MS - 30_000)
    await D.sweepOrphanedAuthorSessions(dbc)
    expect((await get("proj_r2_6_bluegreen_dead", dead.prior))!.status).toBe("resuming")   // still inside the window
    await age(dead.prior, D.RESUME_CLAIM_GHOST_GRACE_MS + 30_000)
    await D.sweepOrphanedAuthorSessions(dbc)
    expect((await get("proj_r2_6_bluegreen_dead", dead.prior))!.status).toBe("stalled")
  })
  test("legacy: child already failed (retryable) but the prior was never resolved -> restored", async () => {
    const { prior } = await seedClaim("proj_r2_6_failed", "failed", { reason: "boom" })
    await D.sweepStaleAuthorSessions(dbc, 180_000)
    expect((await get("proj_r2_6_failed", prior))!.status).toBe("stalled")
  })
  test("legacy: child already failed BECAUSE THE USER CANCELLED -> prior becomes terminal, not restored", async () => {
    const { prior } = await seedClaim("proj_r2_6_cancel", "failed", { reason: "cancelled by user" })
    await D.sweepOrphanedAuthorSessions(dbc)
    const p = (await get("proj_r2_6_cancel", prior))!
    expect(p.status).toBe("failed"); expect(p.stallReason).toBe("resume cancelled by user")
  })
  test("child running with a STALE heartbeat -> reaper ends the child and restores the prior in the same pass", async () => {
    const { prior, childId } = await seedClaim("proj_r2_6_stale", "running", { beat: Date.now() - 3_600_000 })
    await D.sweepStaleAuthorSessions(dbc, 180_000)
    expect((await get("proj_r2_6_stale", childId))!.status).toBe("failed")
    expect((await get("proj_r2_6_stale", prior))!.status).toBe("stalled")
  })
  test("child running with a FRESH heartbeat (live worker, maybe the other blue/green slot) -> untouched", async () => {
    const { prior, childId } = await seedClaim("proj_r2_6_fresh", "running", { beat: Date.now() - 2_000 })
    await D.sweepStaleAuthorSessions(dbc, 180_000); await D.sweepOrphanedAuthorSessions(dbc)
    expect((await get("proj_r2_6_fresh", childId))!.status).toBe("running")
    const p = (await get("proj_r2_6_fresh", prior))!
    expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(childId)
  })
  test("consumed priors (child crystallized / stalled with checkpoint) are never touched", async () => {
    for (const st of ["crystallized", "stalled"]) {
      const { prior, childId } = await seedClaim("proj_r2_6_consumed_" + st, st, { cp: true })
      await D.sweepOrphanedAuthorSessions(dbc); await D.sweepStaleAuthorSessions(dbc, 1)
      const p = (await get("proj_r2_6_consumed_" + st, prior))!
      expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(childId)
    }
  })
})

describe("7/8. stale workers are fenced: they cannot overwrite recovered state or a newer attempt", () => {
  test("7. old worker's LATE final write (and late checkpoint) is discarded after the sweep recovered the session", async () => {
    reset(); const proj = "proj_r2_7"
    const prior = await newPrior(proj)
    const g = gate(); const alerts: unknown[] = []
    const child = await resume(proj, prior, async (o: any) => {
      await o.onNeedsAuth("https://example.com/login", "login wall")
      await g.p                                                                // ... the worker is slow
      await o.onCheckpoint(cp1)                                                // late checkpoint write
      return outcome("needs_auth", { stallReason: "late worker result" })     // late final write
    }, { notifyNeedsAuth: (async (i: unknown) => { alerts.push(i) }) as any })
    await dbc.execute({ sql: "UPDATE author_sessions SET last_beat_at=? WHERE id=?", args: [Date.now() - 3_600_000, child] })
    await D.sweepStaleAuthorSessions(dbc, 180_000)                             // reaper recovers it: child failed, prior restored
    const swept = (await get(proj, child))!
    expect(swept.status).toBe("failed"); expect(swept.checkpoint).toBeNull()
    g.open(); await sleep(500)
    const after = (await get(proj, child))!
    expect(after.status).toBe("failed")                                        // NOT overwritten with the late result
    expect(after.stallReason).toBe(swept.stallReason)
    expect(after.checkpoint).toBeNull()                                        // late checkpoint discarded
    expect(alerts).toHaveLength(0)                                             // and no "resume it" alert for a fenced session
    expect((await get(proj, prior))!.status).toBe("stalled")
  }, 30_000)

  test("7b. a successfully COMPLETED session is not later marked failed by its own worker's late error", async () => {
    reset(); const proj = "proj_r2_7b"
    const prior = await newPrior(proj)
    let boom = false
    const child = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp1); return outcome("crystallized") }, {
      notifyNeedsAuth: (async () => { boom = true }) as any,
    })
    expect((await waitNotRunning(proj, child)).status).toBe("crystallized")
    // simulate what the catch-block of runAuthorNow does if something throws AFTER the final write
    const accepted = await A.updateOwnedAuthorSession(proj, child, { status: "failed", stallReason: "late error" })
    expect(accepted).toBe(false)
    expect((await get(proj, child))!.status).toBe("crystallized")
    void boom
  }, 20_000)

  test("8. a newer resume attempt is not overwritten (or its prior restored) by the older worker", async () => {
    reset(); const proj = "proj_r2_8"
    const prior = await newPrior(proj)
    const g1 = gate(), g2 = gate()
    const c1 = await resume(proj, prior, async () => { await g1.p; return outcome("failed", { stallReason: "old worker failed late" }) })
    await dbc.execute({ sql: "UPDATE author_sessions SET last_beat_at=? WHERE id=?", args: [Date.now() - 3_600_000, c1] })
    await D.sweepStaleAuthorSessions(dbc, 180_000)                             // C1 recovered, prior restored to stalled
    expect((await get(proj, prior))!.status).toBe("stalled")
    reset()                                                                    // (a different worker process takes over)
    const c2 = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp1); await g2.p; return outcome("stalled") })
    const mid = (await get(proj, prior))!
    expect(mid.status).toBe("resuming"); expect(mid.resumedBy).toBe(c2)
    g1.open(); await sleep(500)                                                // the OLD worker now tries to finish (and to restore the prior)
    const stillPrior = (await get(proj, prior))!
    expect(stillPrior.status).toBe("resuming"); expect(stillPrior.resumedBy).toBe(c2)   // not restored by the stale worker
    expect((await get(proj, c2))!.status).toBe("running")                       // newer child untouched
    expect((await get(proj, c1))!.status).toBe("failed")
    g2.open()
    expect((await waitNotRunning(proj, c2)).status).toBe("stalled")
    expect((await get(proj, prior))!.status).toBe("resuming")                  // newer attempt kept progress -> prior consumed by c2
  }, 30_000)
})

describe("10/11. automatic resume stops after three AUTOMATIC attempts; manual attempts never consume the allowance", () => {
  const key = (prior: string) => "autoresume:" + prior
  const counter = async (prior: string) => { const r = await dbc.execute({ sql: "SELECT value FROM schema_meta WHERE key=?", args: [key(prior)] }); return r.rows.length ? Number((r.rows[0] as any).value) : null }
  const seedCounter = (prior: string, n: number) => dbc.execute({ sql: "INSERT INTO schema_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", args: [key(prior), String(n)] })
  async function failedManualChildren(prior: string, proj: string, n: number) {
    for (let i = 0; i < n; i++) { const c = await A.createAuthorSession(proj, req, prior); await dbc.execute({ sql: "UPDATE author_sessions SET status='failed' WHERE id=?", args: [c] }) }
  }
  test("10. an auto-resumable needs_auth prior is picked up with 0-2 automatic attempts used, not with 3 or more", async () => {
    for (const n of [0, 1, 2, 3, 4]) {
      reset(); const proj = "proj_r2_10_" + n
      const prior = await newPrior(proj, "needs_auth")
      if (n) await seedCounter(prior, n)
      const calls: unknown[] = []
      const r = await A.autoResumeNeedsAuthSessions(proj, { runner: (async (_p: string, _r: any, d: any) => { calls.push(d.resumeSessionId); return { sessionId: "c" } }) as any })
      expect(r.eligible).toBe(n < 3 ? 1 : 0); expect(calls).toHaveLength(n < 3 ? 1 : 0)
    }
  })
  test("10b. MANUAL attempts do not consume the automatic allowance (many failed manual children, no counter -> still auto-eligible)", async () => {
    reset(); const proj = "proj_r2_10b"
    const prior = await newPrior(proj, "needs_auth")
    await failedManualChildren(prior, proj, 5)
    expect(await counter(prior)).toBeNull()
    const r = await A.autoResumeNeedsAuthSessions(proj, { runner: (async () => ({ sessionId: "c" })) as any })
    expect(r.eligible).toBe(1)
  })
  test("10c. a real MANUAL resume never writes or increments the counter; a real AUTOMATIC attempt increments it exactly once, in the claim", async () => {
    reset(); const proj = "proj_r2_10c"
    const manualPrior = await newPrior(proj, "needs_auth")
    const m = await resume(proj, manualPrior, async (o: any) => { await o.onCheckpoint(cp1); return outcome("stalled") })
    await waitNotRunning(proj, m)
    expect(await counter(manualPrior)).toBeNull()                                    // manual: untouched
    reset()
    const autoPrior = await newPrior(proj, "needs_auth")
    const r = await A.autoResumeNeedsAuthSessions(proj, { runner: ((p: string, rq: any, d: any) => A.runAuthorNow(p, rq, { ...d, author: (async (_p2: string, _r2: any, o: any) => { await o.onCheckpoint(cp1); return outcome("stalled") }) as any })) as any })
    expect(r.resumed).toHaveLength(1)
    expect(await counter(autoPrior)).toBe(1)
  }, 20_000)
  test("10d. a claim that FAILS does not count as an attempt (conflict, and a rolled-back transaction)", async () => {
    reset(); const proj = "proj_r2_10d"
    const prior = await newPrior(proj, "needs_auth")
    const c1 = await A.createAuthorSession(proj, req, prior)                          // another attempt already owns it
    reset()
    const err = await rejects(A.runAuthorNow(proj, req, { author: (async () => outcome("failed")) as any, resumeSessionId: prior, autoAttempt: true }))
    expect(err?.name).toBe("ResumeConflictError")
    expect(await counter(prior)).toBeNull()
    await dbc.execute({ sql: "UPDATE author_sessions SET status='failed' WHERE id=?", args: [c1] })
    await dbc.execute("CREATE TRIGGER r2_nochild BEFORE INSERT ON author_sessions WHEN NEW.resumed_from IS NOT NULL BEGIN SELECT RAISE(ABORT, 'simulated'); END")
    try { expect(await rejects(A.runAuthorNow(proj, req, { author: (async () => outcome("failed")) as any, resumeSessionId: prior, autoAttempt: true }))).not.toBeNull() }
    finally { await dbc.execute("DROP TRIGGER IF EXISTS r2_nochild") }
    expect(await counter(prior)).toBeNull()                                           // rolled back with the claim
  }, 20_000)
  test("10e. a failed automatic attempt restores the prior to stalled, so it is not auto-retried in a loop", async () => {
    reset(); const proj = "proj_r2_10e"
    const prior = await newPrior(proj, "needs_auth")
    const r1 = await A.autoResumeNeedsAuthSessions(proj, { runner: ((p: string, rq: any, d: any) => A.runAuthorNow(p, rq, { ...d, author: (async () => outcome("failed")) as any })) as any })
    expect(r1.resumed).toHaveLength(1)
    await sleep(400)
    expect((await get(proj, prior))!.status).toBe("stalled")
    const r2 = await A.autoResumeNeedsAuthSessions(proj, { runner: (async () => { throw new Error("must not be attempted") }) as any })
    expect(r2.eligible).toBe(0)
  }, 20_000)
  test("11. manual resume remains possible after the automatic cap (needs_auth and stalled priors)", async () => {
    for (const status of ["needs_auth", "stalled"] as const) {
      reset(); const proj = "proj_r2_11_" + status
      const prior = await newPrior(proj, status)
      await seedCounter(prior, 3)
      await failedManualChildren(prior, proj, 3)
      const child = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp1); return outcome("stalled") })
      expect((await waitNotRunning(proj, child)).status).toBe("stalled")
      expect(await counter(prior)).toBe(3)                                              // manual did not touch it
    }
  }, 20_000)
})

describe("2b. checkpoint preservation: progress made after the resume is not lost when the child then fails", () => {
  const cp2 = { ...cp1, traj: [...cp1.traj, { action: "click", url: U + "/3", domHash: "h2" }], history: [...cp1.history, "click"], stepIdx: 2, llmCalls: 3, costUsd: 0.03, lastUrl: U + "/3" }
  for (const [name, drive] of [
    ["child persists newer progress, then returns failed", async (o: any) => { await o.onCheckpoint(cp1); await o.onCheckpoint(cp2); return outcome("failed", { stallReason: "later error" }) }],
    ["child persists newer progress, then author() throws", async (o: any) => { await o.onCheckpoint(cp2); throw new Error("kaboom after progress") }],
  ] as const) {
    test(name + " -> the prior is restored WITH the child's latest checkpoint, and a manual resume continues from it", async () => {
      reset(); const proj = "proj_r2_2b_" + name.replace(/\W+/g, "_")
      const prior = await newPrior(proj)
      const before = (await get(proj, prior))!
      const child = await resume(proj, prior, drive)
      expect((await waitNotRunning(proj, child)).status).toBe("failed")
      await sleep(100)
      const p = (await get(proj, prior))!
      expect(p.status).toBe("stalled"); expect(p.resumedBy).toBeNull()
      expect(p.checkpoint).toEqual(cp2)                                               // the NEWER checkpoint, not cp0
      expect(p.updatedAt).toBe(before.updatedAt)                                      // retention timer untouched
      expect(await listed(proj)).toContain(prior)
      reset()
      let startedFrom: any = null
      const again = await resume(proj, prior, async (o: any) => { startedFrom = o.checkpoint; await o.onCheckpoint(cp2); return outcome("stalled") })
      await waitNotRunning(proj, again)
      expect(startedFrom).toEqual(cp2)                                                // resumed from the preserved progress
    }, 20_000)
  }
  test("the child's checkpoint is unusable -> the prior keeps its own (original) checkpoint", async () => {
    reset(); const proj = "proj_r2_2b_unusable"
    const prior = await newPrior(proj)
    const before = (await get(proj, prior))!
    const child = await resume(proj, prior, async (o: any) => { await o.onCheckpoint({ ...cp2, traj: [] }); return outcome("failed") },
      { persistCheckpoint: async (p: string, s: string, cp: any) => { await A.updateAuthorSession(p, s, { checkpoint: cp }) } })
    await waitNotRunning(proj, child); await sleep(100)
    const p = (await get(proj, prior))!
    expect(p.status).toBe("stalled"); expect(p.checkpoint).toEqual(before.checkpoint)
  }, 20_000)
  test("the child's checkpoint is NOT newer (no progress) -> prior unchanged", async () => {
    reset(); const proj = "proj_r2_2b_same"
    const prior = await newPrior(proj)
    const child = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp0); return outcome("failed") })
    await waitNotRunning(proj, child); await sleep(100)
    expect((await get(proj, prior))!.checkpoint).toEqual(cp0)
  }, 20_000)
  test("a CANCELLED child's progress is never transferred (prior is terminal, checkpoint untouched)", async () => {
    reset(); const proj = "proj_r2_2b_cancel"
    const prior = await newPrior(proj)
    const child = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp2); B.cancelCurrentAuthor((await A.getActiveAuthorSession(proj))!.id); return outcome("failed", { stallReason: "cancelled by user" }) })
    await waitNotRunning(proj, child); await sleep(100)
    const p = (await get(proj, prior))!
    expect(p.status).toBe("failed"); expect(p.checkpoint).toEqual(cp0)
  }, 20_000)
  test("ATOMIC: the transfer, the restore and the child's final write are one transaction (all or nothing)", async () => {
    reset(); const proj = "proj_r2_2b_atomic"
    const prior = await newPrior(proj)
    await dbc.execute("CREATE TRIGGER r2_block_fail BEFORE UPDATE ON author_sessions WHEN NEW.status='failed' AND OLD.status='running' AND NEW.resumed_from IS NOT NULL BEGIN SELECT RAISE(ABORT, 'simulated failure writing the child'); END")
    let child = ""
    try {
      child = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp2); return outcome("failed") })
      await sleep(600)
    } finally { await dbc.execute("DROP TRIGGER IF EXISTS r2_block_fail") }
    const p = (await get(proj, prior))!
    expect((await get(proj, child))!.status).toBe("running")                          // the child's write was refused ...
    expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(child)                 // ... so the restore did NOT happen
    expect(p.checkpoint).toEqual(cp0)                                                  // ... and neither did the transfer
  }, 20_000)
  test("FENCED: a stale worker cannot transfer a checkpoint into a prior a newer attempt now owns", async () => {
    reset(); const proj = "proj_r2_2b_fence"
    const prior = await newPrior(proj)
    const g1 = gate()
    const c1 = await resume(proj, prior, async (o: any) => { await o.onCheckpoint(cp1); await g1.p; await o.onCheckpoint(cp2); return outcome("failed") })
    await sleep(200)                                                                    // let c1 persist cp1 first
    await dbc.execute({ sql: "UPDATE author_sessions SET status='failed' WHERE id=?", args: [c1] })   // c1 ended elsewhere (legacy/other process)
    await D.sweepOrphanedAuthorSessions(dbc)                                          // sweep: prior restored with c1's usable cp1
    expect((await get(proj, prior))!.checkpoint).toEqual(cp1)
    reset()
    const g2 = gate()
    const c2 = await resume(proj, prior, async (o: any) => { await g2.p; return outcome("stalled") })
    g1.open(); await sleep(500)                                                         // the old worker finally finishes: write fenced
    const p = (await get(proj, prior))!
    expect(p.status).toBe("resuming"); expect(p.resumedBy).toBe(c2)
    expect(p.checkpoint).toEqual(cp1)                                                  // untouched by the stale worker (cp2 never lands)
    g2.open()
  }, 30_000)
  test("SWEEP path: a legacy failed child with a newer usable checkpoint hands it to the prior; an unusable one does not", async () => {
    const mk = async (proj: string, raw: string | null) => {
      const prior = await newPrior(proj)
      const c = await A.createAuthorSession(proj, req, prior)
      await dbc.execute({ sql: "UPDATE author_sessions SET status='failed', checkpoint_json=? WHERE id=?", args: [raw, c] })
      await dbc.execute({ sql: "UPDATE author_sessions SET status='resuming', resumed_by=? WHERE id=?", args: [c, prior] })
      return prior
    }
    const good = await mk("proj_r2_2b_sweep_good", JSON.stringify(cp2))
    const bad = await mk("proj_r2_2b_sweep_bad", JSON.stringify({ ...cp2, traj: [] }))
    const none = await mk("proj_r2_2b_sweep_none", null)
    await D.sweepStaleAuthorSessions(dbc, 180_000)
    expect((await get("proj_r2_2b_sweep_good", good))!.checkpoint).toEqual(cp2); expect((await get("proj_r2_2b_sweep_good", good))!.status).toBe("stalled")
    expect((await get("proj_r2_2b_sweep_bad", bad))!.checkpoint).toEqual(cp0); expect((await get("proj_r2_2b_sweep_bad", bad))!.status).toBe("stalled")
    expect((await get("proj_r2_2b_sweep_none", none))!.checkpoint).toEqual(cp0); expect((await get("proj_r2_2b_sweep_none", none))!.status).toBe("stalled")
  })
})

describe("12. claim and release never reset the original seven-day retention timer", () => {
  test("updated_at is identical before the claim, while claimed, and after the restore", async () => {
    reset(); const proj = "proj_r2_12"
    const aged = Date.now() - A.NEEDS_AUTH_RESUME_TTL_MS + 90 * 60_000          // 1.5h of its 7 days left
    const prior = await newPrior(proj, "stalled", aged)
    const g = gate()
    const child = await resume(proj, prior, async () => { await g.p; return outcome("failed") })
    const claimed = (await get(proj, prior))!
    expect(claimed.status).toBe("resuming"); expect(claimed.updatedAt).toBe(aged)   // claim does not bump the timer
    g.open(); await waitNotRunning(proj, child); await sleep(150)
    const restored = (await get(proj, prior))!
    expect(restored.status).toBe("stalled"); expect(restored.updatedAt).toBe(aged)  // nor does the restore
  }, 20_000)
  test("a prior that ages out while a failed resume was running is NOT kept alive by the restore", async () => {
    reset(); const proj = "proj_r2_12b"
    const aged = Date.now() - A.NEEDS_AUTH_RESUME_TTL_MS + 2 * 60_000
    const prior = await newPrior(proj, "stalled", aged)
    const child = await resume(proj, prior, async () => outcome("failed"))
    await waitNotRunning(proj, child); await sleep(150)
    await dbc.execute({ sql: "UPDATE author_sessions SET updated_at=updated_at - ? WHERE id=?", args: [5 * 60_000, prior] })   // 5 minutes pass
    expect(await listed(proj)).not.toContain(prior)
  }, 20_000)
})
