// R1: ONE definition of a usable AuthorCheckpoint, shared by all five paths:
//   (1) boot sweep  (2) stale reaper  (3) resumable list  (4) resume gate  (5) runAuthorNow's final checkpoint verdict.
// Also: the needs_auth alert is only sent once the verdict says the session is resumable, and the user-facing wording.
// Real (temp) DB throughout; only the alert sender and the checkpoint writer are injected.
import { describe, test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-cpvalid-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-cp-validity-32bytesecret").toString("base64")

const D = await import("./db")
let dbc: any
beforeAll(async () => { dbc = D.reconnectDb("file:" + file); await D.applySchema(dbc); await D.migrateV2(dbc) })
const A = await import("./trails-author")
const B = await import("./trails-browser")
const V = await import("./author-checkpoint")

const URL1 = "https://example.com/start"
const legacy = { traj: [{ action: "navigate", actionValue: URL1, url: URL1, domHash: "h0" }], history: ["navigate"], stepIdx: 0, llmCalls: 1, costUsd: 0.01, lastUrl: URL1 }
const current = { ...legacy, autoAdvanceClicks: 1, unconfirmedCommitPending: false, commitNudgeCount: 0, proactiveVerifyFails: 0 }

// name -> [raw stored value, expected usable]
const SHAPES: Record<string, { raw: string; usable: boolean }> = {
  "current format (with optional fields)": { raw: JSON.stringify(current), usable: true },
  "legacy format (six required fields only)": { raw: JSON.stringify(legacy), usable: true },
  "valid JSON, wrong structure": { raw: JSON.stringify({ v: 1, lastUrl: URL1 }), usable: false },
  "corrupt JSON": { raw: "{not json", usable: false },
  "empty trajectory": { raw: JSON.stringify({ ...legacy, traj: [] }), usable: false },
  "missing history": { raw: JSON.stringify({ ...legacy, history: undefined }), usable: false },
  "missing stepIdx": { raw: JSON.stringify({ ...legacy, stepIdx: undefined }), usable: false },
  "missing llmCalls/costUsd": { raw: JSON.stringify({ ...legacy, llmCalls: undefined, costUsd: undefined }), usable: false },
  "trajectory step without action": { raw: JSON.stringify({ ...legacy, traj: [{ url: URL1 }] }), usable: false },
  "missing lastUrl": { raw: JSON.stringify({ ...legacy, lastUrl: undefined }), usable: false },
  "empty lastUrl": { raw: JSON.stringify({ ...legacy, lastUrl: "" }), usable: false },
  "lastUrl not a URL": { raw: JSON.stringify({ ...legacy, lastUrl: "not a url" }), usable: false },
  "lastUrl about:blank": { raw: JSON.stringify({ ...legacy, lastUrl: "about:blank" }), usable: false },
  "lastUrl a number": { raw: JSON.stringify({ ...legacy, lastUrl: 123 }), usable: false },
  "checkpoint is an array": { raw: JSON.stringify([legacy]), usable: false },
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
async function insertSession(proj: string, status: string, raw: string | null, beat: number | null = null): Promise<string> {
  const id = "auth_" + crypto.randomUUID()
  const now = Date.now()
  await dbc.execute({
    sql: `INSERT INTO author_sessions (id,project_id,name,objective,base_url,status,created_by,created_at,updated_at,checkpoint_json,last_beat_at) VALUES (?,?,'N','O',?,?,null,?,?,?,?)`,
    args: [id, proj, URL1, status, now, now, raw, beat],
  })
  return id
}
const statusOf = async (id: string) => String(((await dbc.execute({ sql: "SELECT status FROM author_sessions WHERE id=?", args: [id] })).rows[0] as any).status)
const stubFailAuthor = (async () => { throw new Error("stub author must not matter") }) as any

describe("one validity rule, five paths", () => {
  for (const [name, shape] of Object.entries(SHAPES)) {
    test(`shape: ${name} -> usable=${shape.usable}`, async () => {
      const proj = "proj_cpv_" + name.replace(/\W+/g, "_")
      const want = shape.usable

      // the shared predicate itself
      expect(V.usableCheckpointFromJson(shape.raw) !== null).toBe(want)

      // (1) boot sweep: running + no heartbeat
      const s1 = await insertSession(proj, "running", shape.raw)
      await D.sweepOrphanedAuthorSessions(dbc)
      expect(await statusOf(s1)).toBe(want ? "stalled" : "failed")

      // (2) stale reaper: running + old heartbeat
      const s2 = await insertSession(proj, "running", shape.raw, Date.now() - 3_600_000)
      await D.sweepStaleAuthorSessions(dbc, 180_000)
      expect(await statusOf(s2)).toBe(want ? "stalled" : "failed")

      // (3) resumable list: a stalled session is listed iff usable
      const s3 = await insertSession(proj, "stalled", shape.raw)
      expect((await A.listStalledAuthorSessions(proj)).map((x) => x.id).includes(s3)).toBe(want)
      // ... and so is a needs_auth session, in the auto-resume list
      const s3b = await insertSession(proj, "needs_auth", shape.raw)
      expect((await A.listNeedsAuthSessionsForAutoResume(proj)).map((x) => x.id).includes(s3b)).toBe(want)

      // (4) resume gate: accepted iff usable (rejection names the checkpoint)
      B._resetWalkPoolForTest(1, 0); B._resetAuthorAdmissionForTest()
      const s4 = await insertSession(proj, "stalled", shape.raw)
      const resume = A.runAuthorNow(proj, { name: "r", objective: "o", baseUrl: URL1 }, { author: stubFailAuthor, resumeSessionId: s4 })
      if (want) { await expect(resume).resolves.toBeDefined(); await sleep(100) }
      else await expect(resume).rejects.toThrow(/no usable checkpoint/)

      // (5) runAuthorNow's final verdict: an author that persists this checkpoint then reports `stalled`.
      //     (Corrupt raw JSON cannot be produced through the writer; a non-object value stands in for it.)
      B._resetWalkPoolForTest(1, 0); B._resetAuthorAdmissionForTest()
      let stored: unknown; try { stored = JSON.parse(shape.raw) } catch { stored = shape.raw }
      const author = (async (_p: string, _r: any, o: any) => {
        await o.onCheckpoint(stored)
        return { status: "stalled", trailId: null, verificationRunId: null, verificationVerdict: null, steps: [], stallReason: "orig", llmCalls: 0, costUsd: 0, objectiveVerified: false }
      }) as any
      const { sessionId } = await A.runAuthorNow(proj, { name: "v", objective: "o", baseUrl: URL1 }, { author })
      let final = "running"
      for (let i = 0; i < 100 && final === "running"; i++) { final = (await A.getAuthorSession(proj, sessionId))!.status; if (final === "running") await sleep(30) }
      expect(final).toBe(want ? "stalled" : "failed")
    })
  }
})

describe("needs_auth alert is sent only after the checkpoint verdict says the session is resumable", () => {
  type Sent = { sessionId: string; pageUrl: string; statusAtSend: string }
  async function run(proj: string, opts: { onCheckpoint: "valid" | "none"; persist?: (p: string, s: string, cp: any) => Promise<void>; grace?: number; gateCalls?: number }) {
    B._resetWalkPoolForTest(1, 0); B._resetAuthorAdmissionForTest()
    const sent: Sent[] = []
    let sid = ""
    const author = (async (_p: string, _r: any, o: any) => {
      for (let i = 0; i < (opts.gateCalls ?? 1); i++) await o.onNeedsAuth("https://example.com/login", "login wall")
      if (opts.onCheckpoint === "valid") void o.onCheckpoint(legacy)           // not awaited: models a write that may still be in flight
      return { status: "needs_auth", trailId: null, verificationRunId: null, verificationVerdict: null, steps: [], stallReason: "stopped at auth gate", llmCalls: 0, costUsd: 0, objectiveVerified: false }
    }) as any
    const r = await A.runAuthorNow(proj, { name: "n", objective: "o", baseUrl: URL1 }, {
      author, checkpointGraceMs: opts.grace ?? 2000, ...(opts.persist ? { persistCheckpoint: opts.persist } : {}),
      notifyNeedsAuth: (async (input: any) => { sent.push({ sessionId: input.sessionId, pageUrl: input.pageUrl, statusAtSend: String((await A.getAuthorSession(proj, input.sessionId))!.status) }) }) as any,
    })
    sid = r.sessionId
    let s = await A.getAuthorSession(proj, sid)
    for (let i = 0; i < 100 && s!.status === "running"; i++) { await sleep(30); s = await A.getAuthorSession(proj, sid) }
    await sleep(100)                                                          // let any (suppressed) alert path run
    return { s: (await A.getAuthorSession(proj, sid))!, sent }
  }

  test("valid checkpoint persisted -> alert sent once, after the session is already needs_auth", async () => {
    const { s, sent } = await run("proj_na_ok", { onCheckpoint: "valid" })
    expect(s.status).toBe("needs_auth")
    expect(sent).toHaveLength(1)
    expect(sent[0].sessionId).toBe(s.id)
    expect(sent[0].pageUrl).toBe("https://example.com/login")
    expect(sent[0].statusAtSend).toBe("needs_auth")                           // the alert follows the final status write
  })

  test("checkpoint persistence fails -> session failed and NO resume alert", async () => {
    const { s, sent } = await run("proj_na_err", { onCheckpoint: "valid", persist: async () => { throw new Error("disk full") } })
    expect(s.status).toBe("failed")
    expect(sent).toHaveLength(0)
  })

  test("no checkpoint was ever written -> failed and NO resume alert", async () => {
    const { s, sent } = await run("proj_na_none", { onCheckpoint: "none" })
    expect(s.status).toBe("failed")
    expect(sent).toHaveLength(0)
  })

  test("slow write that lands within the grace window -> decided by the REAL persisted checkpoint: alert sent", async () => {
    const { s, sent } = await run("proj_na_slow", { onCheckpoint: "valid", grace: 3000, persist: async (p, id, cp) => { await sleep(400); await A.updateAuthorSession(p, id, { checkpoint: cp }) } })
    expect(s.status).toBe("needs_auth")
    expect(sent).toHaveLength(1)
  })

  test("write that never lands -> failed and NO alert", async () => {
    const { s, sent } = await run("proj_na_hang", { onCheckpoint: "valid", grace: 200, persist: () => new Promise<void>(() => {}) })
    expect(s.status).toBe("failed")
    expect(sent).toHaveLength(0)
  })

  test("the driver reporting the gate more than once still sends exactly one alert", async () => {
    const { s, sent } = await run("proj_na_dup", { onCheckpoint: "valid", gateCalls: 3 })
    expect(s.status).toBe("needs_auth")
    expect(sent).toHaveLength(1)
  })
})

describe("user-facing stall wording depends on the ACTUAL session state (status + checkpoint), not on the stored text", () => {
  const f = V.userFacingStallReason
  // Any wording that tells the user they can/will resume. (Not matched: "it can't be resumed", which is a negation.)
  const RESUME_WORDING = /you can resume|resume will continue|resume to continue|resume from/i
  const START_NEW = /start a new run/i
  const noInternals = (s: string) => { for (const leak of [/SQLITE/i, /database/i, /save error/i, /did not complete in time/i, /\[/, /page\.evaluate/, /Target page/, /ECONNRESET/]) expect(s).not.toMatch(leak) }

  test("null / empty stays null", () => {
    expect(f(null, { status: "failed", checkpoint: null })).toBeNull()
    expect(f("", { status: "stalled", checkpoint: legacy })).toBeNull()
  })

  // ── the six required regression cases ──
  test("1. FAILED, server-restart reason, no checkpoint -> start a new run, no resume wording", () => {
    const out = f("interrupted by a server restart - please retry", { status: "failed", checkpoint: null })!
    expect(out).toMatch(/server restarted/i)
    expect(out).toMatch(START_NEW)
    expect(out).not.toMatch(RESUME_WORDING)
    expect(out).not.toMatch(/please retry/i)
  })
  test("2. FAILED, stale-heartbeat reason, no checkpoint -> start a new run, no resume wording", () => {
    const out = f("stale heartbeat — process may have crashed, please retry", { status: "failed", checkpoint: null })!
    expect(out).toMatch(/stopped responding/i)
    expect(out).toMatch(START_NEW)
    expect(out).not.toMatch(RESUME_WORDING)
  })
  test("3. FAILED status even though a usable checkpoint exists (e.g. cancelled, or a late write) -> never resume wording", () => {
    for (const reason of [
      "interrupted by a server restart - Resume to continue from the last checkpoint",
      "stale heartbeat - process may have crashed. Resume to continue from the last checkpoint",
      "network error, run paused: ECONNRESET. Resume to continue from the last checkpoint. [latest checkpoint not saved (save did not complete in time); Resume continues from an earlier step]",
      "cancelled by user",
    ]) {
      const out = f(reason, { status: "failed", checkpoint: legacy })!
      expect(out).toMatch(START_NEW)
      expect(out).not.toMatch(RESUME_WORDING)
      noInternals(out)
    }
  })
  test("4. STALLED with a valid checkpoint -> may say it can be resumed", () => {
    expect(f("interrupted by a server restart - Resume to continue from the last checkpoint", { status: "stalled", checkpoint: legacy }))
      .toBe("The server restarted while AutoSim was working. You can resume it.")
    expect(f("stale heartbeat - process may have crashed. Resume to continue from the last checkpoint", { status: "stalled", checkpoint: current }))
      .toBe("AutoSim stopped responding. You can resume it.")
    expect(f("network error, run paused: ECONNRESET. Resume to continue from the last checkpoint.", { status: "stalled", checkpoint: legacy })).toMatch(/connection dropped.*You can resume it/i)
  })
  test("5. STALLED with an OLDER valid checkpoint -> Resume continues from the last saved progress, no internals", () => {
    const out = f("browser/page problem, run paused: page.evaluate: Target page, context or browser has been closed. Resume to continue from the last checkpoint. [latest checkpoint not saved (save error: SQLITE_BUSY: database is locked); Resume continues from an earlier step]", { status: "stalled", checkpoint: legacy })!
    expect(out).toContain("Resume will continue from the last saved progress")
    noInternals(out)
    const timeout = f("network error, run paused: ECONNRESET. [latest checkpoint not saved (save did not complete in time); Resume continues from an earlier step]", { status: "stalled", checkpoint: legacy })!
    expect(timeout).toMatch(/connection dropped/i); expect(timeout).toContain("Resume will continue from the last saved progress"); noInternals(timeout)
  })
  test("6. STALLED (or needs_auth) with a missing/invalid checkpoint -> no resume wording at all", () => {
    const invalid: unknown[] = [null, undefined, { v: 1, lastUrl: URL1 }, { ...legacy, traj: [] }, { ...legacy, lastUrl: "about:blank" }, { ...legacy, history: undefined }, "garbage"]
    for (const status of ["stalled", "needs_auth"]) for (const cp of invalid) for (const reason of [
      "interrupted by a server restart - Resume to continue from the last checkpoint",
      "browser/page problem, run paused: page.evaluate: Target page. Resume to continue from the last checkpoint. [latest checkpoint not saved (save error: disk full); Resume continues from an earlier step]",
      "stopped at auth gate",
    ]) {
      const out = f(reason, { status, checkpoint: cp })!
      expect(out).toMatch(START_NEW)
      expect(out).not.toMatch(RESUME_WORDING)
      noInternals(out)
    }
  })

  // ── invariants / the rest ──
  test("property: a FAILED session never gets resume wording, whatever the stored reason or checkpoint", () => {
    const reasons = [
      "interrupted by a server restart - please retry", "interrupted by a server restart - Resume to continue from the last checkpoint",
      "stale heartbeat — process may have crashed, please retry", "stale heartbeat - process may have crashed. Resume to continue from the last checkpoint",
      "browser/page problem, run paused: x. Resume to continue from the last checkpoint.", "network error, run paused: y. Resume to continue from the last checkpoint.",
      "step watchdog: no progress for 91s at \"x\" (step 3) - ... Resume to continue from the last checkpoint.",
      "stopped at auth gate [checkpoint not saved (save error: disk full); Resume is unavailable]", "stuck after 3 failed attempts; last: nope", "cancelled by user", "x [checkpoint not saved (oops",
    ]
    for (const reason of reasons) for (const cp of [null, legacy, current, { v: 1 }]) {
      const out = f(reason, { status: "failed", checkpoint: cp })!
      expect(out).not.toMatch(RESUME_WORDING)
      expect(out).toMatch(START_NEW)
      noInternals(out)
    }
  })
  test("the old 'progress could not be saved' note still produces the plain not-resumable sentence", () => {
    const out = f("stopped at auth gate [checkpoint not saved (save error: disk full); Resume is unavailable]", { status: "failed", checkpoint: null })!
    expect(out).toMatch(/progress could not be saved, so it can't be resumed/)
    expect(out).toMatch(START_NEW); noInternals(out)
  })
  test("a failed session whose checkpoint DID persist is not told its progress was lost", () => {
    expect(f("cancelled by user", { status: "failed", checkpoint: legacy })).toBe("cancelled by user. Please start a new run.")
  })
  test("a malformed persistence note never leaks", () => { expect(f("x [checkpoint not saved (oops", { status: "failed", checkpoint: null })!).not.toMatch(/checkpoint not saved/) })
  test("resumable stalled / needs_auth sessions with ordinary reasons pass through unchanged", () => {
    expect(f("stuck after 3 failed attempts; last: nope", { status: "stalled", checkpoint: legacy })).toBe("stuck after 3 failed attempts; last: nope")
    expect(f("stopped at auth gate", { status: "needs_auth", checkpoint: legacy })).toBe("stopped at auth gate")
  })
  test("running / crystallized sessions get no resume or new-run advice", () => {
    for (const status of ["running", "crystallized"]) {
      const out = f("browser/page problem, run paused: x", { status, checkpoint: legacy })!
      expect(out).not.toMatch(RESUME_WORDING); expect(out).not.toMatch(START_NEW)
    }
  })
  test("watchdog wording", () => {
    expect(f("step watchdog: no progress for 91s at \"x\" (step 3) - ... Resume to continue from the last checkpoint.", { status: "stalled", checkpoint: legacy })).toMatch(/stopped making progress.*You can resume it/i)
  })
})

describe("autoResumeNeedsAuthSessions relies on the shared validity rule (no separate presence-only check)", () => {
  const usableShapes = [["legacy", JSON.stringify(legacy)], ["current", JSON.stringify(current)]] as const
  const unusableShapes = [["wrong structure", JSON.stringify({ v: 1, lastUrl: URL1 })], ["corrupt JSON", "{not json"], ["empty trajectory", JSON.stringify({ ...legacy, traj: [] })]] as const
  async function run(proj: string, raw: string) {
    const id = await insertSession(proj, "needs_auth", raw)
    const calls: any[] = []
    const result = await A.autoResumeNeedsAuthSessions(proj, { runner: (async (_p: string, _r: any, deps: any) => { calls.push(deps?.resumeSessionId); return { sessionId: "child_" + calls.length } }) as any })
    return { id, calls, result }
  }
  for (const [name, raw] of usableShapes) test(`usable (${name}) checkpoint -> resumed exactly once`, async () => {
    const { id, calls, result } = await run("proj_ar_ok_" + name, raw)
    expect(calls).toEqual([id]); expect(result.resumed).toHaveLength(1); expect(result.errors).toHaveLength(0)
  })
  for (const [name, raw] of unusableShapes) test(`unusable (${name}) checkpoint -> never offered, never resumed, no spurious skip/error`, async () => {
    const { calls, result } = await run("proj_ar_bad_" + name.replace(/\W+/g, "_"), raw)
    expect(calls).toHaveLength(0); expect(result.eligible).toBe(0)
    expect(result.resumed).toHaveLength(0); expect(result.skipped).toHaveLength(0); expect(result.errors).toHaveLength(0)
  })
})
