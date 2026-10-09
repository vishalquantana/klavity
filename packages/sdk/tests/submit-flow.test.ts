// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  SubmitError, classifyHttpFailure, networkFailure, nextDelayMs, withRetries, sendForm, buildRepairForm, refreshTurnstileField, outcomeFromResult,
  newSubmissionKey, RETRY, serverSupportsIdempotency, isUncertainOutcome, retryFailureCopy,
} from "../src/submit-flow"
import { prepareSubmission, sendPrepared, submitFeedback } from "../src/widget"

const err = (status: number, body: any = {}, retryAfter: string | null = null) => classifyHttpFailure(status, typeof body === "string" ? body : JSON.stringify(body), retryAfter)

describe("classifyHttpFailure — what is retried and what the user is told", () => {
  it("retryable: 5xx, 429 (Retry-After honoured and capped), in-progress 409, Turnstile 403", () => {
    for (const s of [500, 502, 503, 504]) { const e = err(s); expect(e.retryable).toBe(true); expect(e.userMessage).toMatch(/retrying/i) }
    const e429 = err(429, {}, "7"); expect(e429.retryable).toBe(true); expect(e429.retryAfterSec).toBe(7)
    expect(err(429, {}, "9999").retryAfterSec).toBe(30)                      // capped
    expect(err(429).retryAfterSec).toBe(10)                                   // default
    const e409 = err(409, { error: "still processing", in_progress: true, retryable: true }, "3"); expect(e409.retryable).toBe(true); expect(e409.retryAfterSec).toBe(3)
    expect(err(403, { error: "Verification failed. Please try again." }).retryable).toBe(true)
  })
  it("NOT retryable: validation, auth, permission, missing project, too large, key conflict — and the server's own reason is shown", () => {
    expect(err(400, { error: "Screenshot a.txt is not an image." })).toMatchObject({ retryable: false, userMessage: "Screenshot a.txt is not an image." })
    expect(err(400, { error: "Add a description or attach a screenshot." }).retryable).toBe(false)
    expect(err(401, {})).toMatchObject({ retryable: false }); expect(err(401, {}).userMessage).toMatch(/sign in/i)
    expect(err(403, { error: "No access" })).toMatchObject({ retryable: false, userMessage: "No access" })
    expect(err(403, {}).userMessage).toMatch(/permission/i)
    expect(err(404, {}).retryable).toBe(false)
    expect(err(413, {})).toMatchObject({ retryable: false }); expect(err(413, {}).userMessage).toMatch(/too large/i)
    expect(err(409, { error: "This submission key was already used by another request.", retryable: false })).toMatchObject({ retryable: false })
    expect(err(422, "<html>not json</html>").userMessage).toMatch(/couldn.t be submitted/i)    // no JSON body → generic, still clear
  })
  it("network failures: network / stalled / timeout are retryable with distinct, plain messages", () => {
    const msgs = (["network", "stalled", "timeout"] as const).map((k) => { const e = networkFailure(k); expect(e.retryable).toBe(true); expect(e).toBeInstanceOf(SubmitError); return e.userMessage })
    expect(new Set(msgs).size).toBe(3)
  })
})

describe("nextDelayMs", () => {
  it("1.5 s then 4 s (±20% jitter); Retry-After overrides; capped at 30 s", () => {
    for (let i = 0; i < 50; i++) {
      const a = nextDelayMs(1, {}), b = nextDelayMs(2, {}), c = nextDelayMs(9, {})
      expect(a).toBeGreaterThanOrEqual(1200); expect(a).toBeLessThanOrEqual(1800)
      expect(b).toBeGreaterThanOrEqual(3200); expect(b).toBeLessThanOrEqual(4800)
      expect(c).toBeLessThanOrEqual(4800)
    }
    expect(nextDelayMs(1, { retryAfterSec: 10 }, () => 0.5)).toBe(10_000)
    expect(nextDelayMs(1, { retryAfterSec: 30 }, () => 1)).toBe(30_000)        // 30 s × 1.2 = 36 s → capped
  })
})

describe("withRetries", () => {
  const noSleep = vi.fn(async (_ms: number) => {})
  beforeEach(() => noSleep.mockClear())
  it("re-runs the SAME attempt function until it succeeds (fail, fail, ok → 3 calls), telling the UI each time", async () => {
    let n = 0
    const infos: any[] = []
    const out = await withRetries(async () => { n++; if (n < 3) throw networkFailure("network"); return "done" }, { sleep: noSleep, onRetry: (i) => infos.push(i), rand: () => 0.5 })
    expect(out).toBe("done"); expect(n).toBe(3)
    expect(infos.map((i) => [i.attempt, i.maxAttempts])).toEqual([[2, 3], [3, 3]])
    expect(noSleep).toHaveBeenCalledTimes(2)
  })
  it("a non-retryable error stops at once (no sleep, no second call)", async () => {
    let n = 0
    await expect(withRetries(async () => { n++; throw err(400, { error: "bad" }) }, { sleep: noSleep })).rejects.toMatchObject({ userMessage: "bad" })
    expect(n).toBe(1); expect(noSleep).not.toHaveBeenCalled()
  })
  it("gives up after maxAttempts with the LAST error", async () => {
    let n = 0
    await expect(withRetries(async () => { n++; throw n < 3 ? networkFailure("network") : err(503) }, { sleep: noSleep })).rejects.toMatchObject({ status: 503 })
    expect(n).toBe(RETRY.maxAttempts)
  })
  it("an in-progress 409 waits for Retry-After, then succeeds with the recorded outcome", async () => {
    let n = 0
    const slept: number[] = []
    const out = await withRetries(async () => { n++; if (n === 1) throw err(409, { in_progress: true, retryable: true }, "4"); return "ticket" }, { sleep: async (ms) => { slept.push(ms) }, rand: () => 0.5 })
    expect(out).toBe("ticket"); expect(slept).toEqual([4000])
  })
  it("a hook that throws never breaks the retry; a non-SubmitError becomes a retryable network failure", async () => {
    let n = 0
    const out = await withRetries(async () => { n++; if (n === 1) throw new TypeError("boom"); return "ok" }, { sleep: noSleep, onRetry: () => { throw new Error("ui bug") } })
    expect(out).toBe("ok")
  })
})

// ── transport ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
class FakeXHR {
  static last: FakeXHR
  upload: any = {}; status = 0; responseText = ""; headers: Record<string, string> = {}; reqHeaders: Record<string, string> = {}
  onload: any; onerror: any; onabort: any; ontimeout: any; method = ""; url = ""; withCredentials = false; sent: any = null; aborted = false
  constructor() { FakeXHR.last = this }
  open(m: string, u: string) { this.method = m; this.url = u }
  setRequestHeader(k: string, v: string) { this.reqHeaders[k.toLowerCase()] = v }
  getResponseHeader(k: string) { return this.headers[k.toLowerCase()] ?? null }
  send(b: any) { this.sent = b }
  abort() { this.aborted = true; this.onabort?.() }
  progress(loaded: number, total: number) { this.upload.onprogress?.({ lengthComputable: true, loaded, total }) }
  uploadDone() { this.upload.onload?.() }
  respond(status: number, body: any, headers: Record<string, string> = {}) { this.status = status; this.responseText = typeof body === "string" ? body : JSON.stringify(body); this.headers = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])); this.onload?.() }
}
const cfg = { backendUrl: "https://k.test", firstParty: false, token: "ext_t" }
const fd = () => { const f = new FormData(); f.set("description", "d"); return f }

describe("sendForm (XHR) — progress, errors, and the stall watchdog", () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })
  it("resolves with the parsed JSON, reports 0–90% progress, sends the Bearer token, flags a replayed response", async () => {
    const pct: number[] = []
    const p = sendForm(cfg, fd(), { onProgress: (x) => pct.push(x) }, { XHR: FakeXHR as any })
    const x = FakeXHR.last
    expect(x.method).toBe("POST"); expect(x.url).toBe("https://k.test/api/feedback"); expect(x.reqHeaders.authorization).toBe("Bearer ext_t")
    x.progress(50, 100); x.progress(100, 100); x.uploadDone(); x.respond(200, { id: "fb_1", saved: true, replayed: true }, { "Idempotent-Replay": "true" })
    const r = await p
    expect(pct).toEqual([45, 90]); expect(r.json.id).toBe("fb_1"); expect(r.replayed).toBe(true)
    expect(outcomeFromResult(r)).toEqual({ id: "fb_1", issueUrl: "", replayed: true, missing: [] })
  })
  it("HTTP errors are typed (413 → not retryable; 503 → retryable), a dropped connection is a retryable network error", async () => {
    let p = sendForm(cfg, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any }); FakeXHR.last.respond(413, { error: "Attachments exceed the 120 MB total limit." })
    await expect(p).rejects.toMatchObject({ status: 413, retryable: false, userMessage: "Attachments exceed the 120 MB total limit." })
    p = sendForm(cfg, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any }); FakeXHR.last.respond(503, "")
    await expect(p).rejects.toMatchObject({ status: 503, retryable: true })
    p = sendForm(cfg, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any }); FakeXHR.last.onerror()
    await expect(p).rejects.toMatchObject({ kind: "network", retryable: true })
  })
  it("a 2xx with an unreadable body is a retryable failure, not a crash", async () => {
    const p = sendForm(cfg, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any }); FakeXHR.last.respond(200, "<html>proxy page</html>")
    await expect(p).rejects.toMatchObject({ retryable: true })
  })
  it("STALL: no upload progress for 45 s aborts the request and reports a retryable 'stalled' error", async () => {
    const p = sendForm(cfg, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any })
    const x = FakeXHR.last
    const assertion = expect(p).rejects.toMatchObject({ kind: "stalled", retryable: true })
    await vi.advanceTimersByTimeAsync(RETRY.stallMs + 100)
    await assertion
    expect(x.aborted).toBe(true)
  })
  it("a SLOW but moving upload is never cut off (each progress event restarts the stall clock — here 10 minutes of progress)", async () => {
    const p = sendForm(cfg, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any })
    const x = FakeXHR.last
    for (let i = 1; i <= 20; i++) { await vi.advanceTimersByTimeAsync(30_000); x.progress(i, 20) }
    expect(x.aborted).toBe(false)
    x.uploadDone(); x.respond(200, { id: "fb_slow" })
    expect((await p).json.id).toBe("fb_slow")
  })
  it("PROCESSING: the server not answering 90 s after the upload finished is a retryable 'timeout'", async () => {
    const p = sendForm(cfg, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any })
    const x = FakeXHR.last
    x.progress(1, 1); x.uploadDone()
    const assertion = expect(p).rejects.toMatchObject({ kind: "timeout", retryable: true })
    await vi.advanceTimersByTimeAsync(RETRY.processingMs + 100)
    await assertion
  })
  it("anonymous cross-origin sends no auth header; first-party sends cookies", () => {
    sendForm({ ...cfg, token: "" }, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any }); expect(FakeXHR.last.reqHeaders.authorization).toBeUndefined(); expect(FakeXHR.last.withCredentials).toBe(false)
    sendForm({ ...cfg, firstParty: true }, fd(), { onProgress: () => {} }, { XHR: FakeXHR as any }); expect(FakeXHR.last.withCredentials).toBe(true)
  })
})

// ── prepared submission: one body + one key for every attempt ─────────────────────────────────────────────────────────────────
const payload = { type: "bug", description: "checkout broken", pageUrl: "https://c.example/cart", screenshots: [] as string[] }
// A caller (or an older embed) may still hand the widget a replay buffer: the widget must not put it on the wire.
const bigReplay = Array.from({ length: 400 }, (_, i) => ({ type: 3, timestamp: i, data: { source: 1, x: i, text: "lorem ipsum dolor sit amet " + i } }))
describe("prepareSubmission / sendPrepared", () => {
  beforeEach(() => { vi.restoreAllMocks() })
  it("gives the report ONE idempotency key, and every attempt re-sends the SAME body object with it", async () => {
    const bodies: FormData[] = []
    let n = 0
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => { bodies.push(init.body); n++; if (n < 3) throw new TypeError("net down"); return new Response(JSON.stringify({ id: "fb_ok", saved: true }), { status: 200 }) }))
    const prep = await prepareSubmission({ backendUrl: "https://k.test", projectId: "p1", firstParty: true, token: "" }, payload)
    expect(prep.key).toMatch(/^[0-9a-f-]{36}$/); expect(prep.fd.get("submission_key")).toBe(prep.key)
    const out = await sendPrepared(prep, { backendUrl: "https://k.test", firstParty: true, token: "" }, { sleep: async () => {} })
    expect(out.id).toBe("fb_ok"); expect(n).toBe(3)
    expect(new Set(bodies).size).toBe(1); expect(bodies[0]).toBe(prep.fd)                    // not rebuilt, not re-read: the very same FormData
    expect(bodies.map((b) => b.get("submission_key"))).toEqual([prep.key, prep.key, prep.key])
  })
  it("a manual Retry later (a second sendPrepared on the same prepared report) keeps the key too", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ id: "fb_x" }), { status: 200 })))
    const prep = await prepareSubmission({ backendUrl: "https://k.test", projectId: "p1", firstParty: true, token: "" }, payload)
    const key = prep.fd.get("submission_key")
    await sendPrepared(prep, { backendUrl: "https://k.test", firstParty: true, token: "" }); await sendPrepared(prep, { backendUrl: "https://k.test", firstParty: true, token: "" })
    expect(prep.fd.get("submission_key")).toBe(key)
  })
  it("two different reports get different keys; an explicit key is respected", async () => {
    const c = { backendUrl: "https://k.test", projectId: "p1", firstParty: true, token: "" }
    const a = await prepareSubmission(c, payload), b = await prepareSubmission(c, payload), e = await prepareSubmission(c, { ...payload, submissionKey: "caller-chosen-key-123456" })
    expect(a.key).not.toBe(b.key); expect(e.key).toBe("caller-chosen-key-123456")
  })
  it("a widget ticket carries NO session replay data, even if a replay buffer is handed in (QA: replay removed from the widget)", async () => {
    const bodies: FormData[] = []
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => { bodies.push(init.body); return new Response(JSON.stringify({ id: "fb_nr", saved: true }), { status: 200 }) }))
    const c = { backendUrl: "https://k.test", projectId: "p1", firstParty: true, token: "" }
    const prep = await prepareSubmission(c, { ...payload, replayEvents: bigReplay } as any)
    await sendPrepared(prep, c)
    const keys = [...bodies[0].keys()]
    expect(keys.filter((k) => /replay/i.test(k))).toEqual([]); expect(prep.fd.get("replay_events")).toBeNull(); expect(prep.fd.get("replay_events_gz")).toBeNull()
  })
  it("non-retryable server errors reach the caller with the server's reason, after exactly ONE request", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ error: "Screenshot x.png exceeds 8 MB." }), { status: 400 }))
    vi.stubGlobal("fetch", f)
    const prep = await prepareSubmission({ backendUrl: "https://k.test", projectId: "p1", firstParty: true, token: "" }, payload)
    await expect(sendPrepared(prep, { backendUrl: "https://k.test", firstParty: true, token: "" }, { sleep: async () => {} })).rejects.toMatchObject({ userMessage: "Screenshot x.png exceeds 8 MB.", retryable: false })
    expect(f).toHaveBeenCalledTimes(1)
  })
  it("submitFeedback (single attempt, used by the interactive path and extension-style callers) still works and carries the key", async () => {
    const f = vi.fn(async (..._a: any[]) => new Response(JSON.stringify({ id: "fb9", issue_url: "https://k.test/t/fb9" }), { status: 200 }))
    vi.stubGlobal("fetch", f)
    const r = await submitFeedback({ backendUrl: "https://k.test", projectId: "p1", firstParty: true, token: "" }, payload)
    expect(r).toEqual({ issueKey: "fb9", issueUrl: "https://k.test/t/fb9" })
    expect(((f.mock.calls[0][1] as any).body as FormData).get("submission_key")).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe("Turnstile: a fresh single-use token per attempt, no accumulation", () => {
  beforeEach(() => { vi.restoreAllMocks() })
  it("the FIRST attempt uses the token from preparation; every later attempt (retry or manual) gets a freshly fetched one; the form never holds more than one", async () => {
    const seen: Array<string[]> = []
    let calls = 0
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => { seen.push((init.body as FormData).getAll("cf_turnstile_token") as string[]); calls++; if (calls < 3) throw new TypeError("down"); return new Response(JSON.stringify({ id: "fb_t" }), { status: 200 }) }))
    const prep = await prepareSubmission({ backendUrl: "https://k.test", projectId: "p1", firstParty: false, token: "" }, { ...payload, turnstileToken: "tok-initial" })
    let minted = 0
    const fresh = vi.fn(async () => `tok-fresh-${++minted}`)
    await sendPrepared(prep, { backendUrl: "https://k.test", firstParty: false, token: "" }, { sleep: async () => {}, freshTurnstile: fresh })
    expect(seen).toEqual([["tok-initial"], ["tok-fresh-1"], ["tok-fresh-2"]])               // one token each time, never the used one again
    expect(fresh).toHaveBeenCalledTimes(2)                                                    // not for the very first attempt
    expect(prep.fd.getAll("cf_turnstile_token")).toEqual(["tok-fresh-2"])
  })
  it("when a fresh token cannot be obtained the stale one is REMOVED, not re-sent", () => {
    const f = new FormData(); f.set("cf_turnstile_token", "used-token")
    refreshTurnstileField(f, null); expect(f.getAll("cf_turnstile_token")).toEqual([])
    refreshTurnstileField(f, "a"); refreshTurnstileField(f, "b"); expect(f.getAll("cf_turnstile_token")).toEqual(["b"])
  })
  it("a REPAIR body never inherits the old token and gets its own fresh one", async () => {
    const bodies: FormData[] = []
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => { bodies.push(init.body); return new Response(JSON.stringify({ id: "fb_r" }), { status: 200 }) }))
    const prep = await prepareSubmission({ backendUrl: "https://k.test", projectId: "p1", firstParty: false, token: "" }, { ...payload, turnstileToken: "tok-initial", files: [{ name: "a.pdf", type: "application/pdf", size: 3, dataUrl: "data:application/pdf;base64,QUJD" }] })
    await sendPrepared(prep, { backendUrl: "https://k.test", firstParty: false, token: "" }, { freshTurnstile: async () => "tok-for-repair", repairSlots: ["file:0"] })
    expect(bodies[0]).not.toBe(prep.fd); expect(bodies[0].getAll("cf_turnstile_token")).toEqual(["tok-for-repair"])
    expect(prep.fd.getAll("cf_turnstile_token")).toEqual(["tok-initial"])                    // the original body is untouched
  })
})

describe("buildRepairForm — re-send ONLY what the server says is missing", () => {
  const blob = (n: string, t = "application/octet-stream") => new File([new Uint8Array(4)], n, { type: t })
  const original = () => {
    const f = new FormData()
    f.set("description", "d"); f.set("project_id", "p1"); f.set("type", "bug"); f.set("submission_key", "key-aaaaaaaaaaaaaaaa"); f.set("cf_turnstile_token", "old")
    f.append("screenshots", blob("s0.png", "image/png")); f.append("screenshots", blob("s1.png", "image/png"))
    f.append("screenshot_thumbs", blob("t0.jpg", "image/jpeg")); f.append("screenshot_thumbs", blob("t1.jpg", "image/jpeg"))
    f.append("files", blob("f0.pdf")); f.append("files", blob("f1.pdf")); f.append("files", blob("f2.pdf"))
    f.append("recording", blob("r0.webm", "video/webm"))
    return f
  }
  it("includes just the missing slots, files them under their ORIGINAL slot ids, keeps the same key, drops the old Turnstile token", () => {
    const r = buildRepairForm(original(), ["file:1", "shot:1", "rec:0"])
    expect((r.getAll("files") as File[]).map((f) => f.name)).toEqual(["f1.pdf"])
    expect((r.getAll("screenshots") as File[]).map((f) => f.name)).toEqual(["s1.png"])
    expect((r.getAll("screenshot_thumbs") as File[]).map((f) => f.name)).toEqual(["t1.jpg"])      // the thumbnail travels with its shot
    expect((r.getAll("recording") as File[]).map((f) => f.name)).toEqual(["r0.webm"])
    expect(JSON.parse(r.get("slot_map") as string)).toEqual({ files: ["file:1"], screenshots: ["shot:1"], recording: ["rec:0"] })
    expect(JSON.parse(r.get("repair_slots") as string)).toEqual(["file:1", "shot:1", "rec:0"])
    expect(r.get("submission_key")).toBe("key-aaaaaaaaaaaaaaaa"); expect(r.get("description")).toBe("d"); expect(r.get("project_id")).toBe("p1")
    expect(r.get("cf_turnstile_token")).toBeNull()
  })
  it("a repair request never carries replay data (the widget no longer sends a replay slot)", () => {
    const r = buildRepairForm(original(), ["replay", "file:0"])
    expect([...r.keys()].filter((k) => /replay_events/.test(k))).toEqual([])
  })
  it("slots that do not exist are ignored (no empty parts), and an empty request carries no files", () => {
    const r = buildRepairForm(original(), ["file:9", "rec:5"])
    expect(r.getAll("files")).toEqual([]); expect(r.getAll("recording")).toEqual([]); expect(r.get("slot_map")).toBeNull()
  })
})

describe("newSubmissionKey", () => {
  it("is unique and always server-valid (16–64 chars of [A-Za-z0-9_-])", () => {
    const keys = new Set(Array.from({ length: 200 }, () => newSubmissionKey()))
    expect(keys.size).toBe(200); for (const k of keys) expect(k).toMatch(/^[A-Za-z0-9_-]{16,64}$/)
  })
  it("falls back when crypto.randomUUID is unavailable", () => {
    const c: any = (globalThis as any).crypto; const orig = c.randomUUID
    try { Object.defineProperty(c, "randomUUID", { value: undefined, configurable: true }); expect(newSubmissionKey()).toMatch(/^[A-Za-z0-9_-]{16,64}$/) }
    finally { Object.defineProperty(c, "randomUUID", { value: orig, configurable: true }) }
  })
})

// ── item 2: in-progress submissions are POLLED (not failed), at the server's Retry-After, longer than the stale window ───────
describe("pending (server still processing this report)", () => {
  const pending = (retryAfter: string | null = "3") => err(409, { error: "still processing", in_progress: true, retryable: true, retry_after: 3 }, retryAfter)
  it("is classified as pending + retryable, honouring Retry-After (header first, then the body hint), capped at 30 s", () => {
    expect(pending("5")).toMatchObject({ pending: true, retryable: true, retryAfterSec: 5 })
    expect(err(409, { in_progress: true, retryable: true, retry_after: 7 })).toMatchObject({ pending: true, retryAfterSec: 7 })
    expect(err(409, { in_progress: true, retryable: true })).toMatchObject({ pending: true, retryAfterSec: 3 })
    expect(err(409, { in_progress: true, retryable: true }, "999").retryAfterSec).toBe(30)
    expect(err(409, { error: "key used by another request", retryable: false }).pending).toBeUndefined()   // a real conflict is not pending
  })
  it("polls at Retry-After WITHOUT consuming an attempt: 10 pending answers, then 2 network blips, then success is still within the 3-attempt budget", async () => {
    let n = 0; const slept: number[] = []; const infos: any[] = []
    const out = await withRetries(async () => {
      n++
      if (n <= 10) throw pending("4")
      if (n <= 12) throw networkFailure("network")
      return "ticket"
    }, { sleep: async (ms) => { slept.push(ms) }, rand: () => 0.5, onRetry: (i) => infos.push(i) })
    expect(out).toBe("ticket"); expect(n).toBe(13)
    expect(slept.slice(0, 10).every((ms) => ms === 4000)).toBe(true)                  // the server's Retry-After, not a guess
    expect(infos.slice(0, 10).every((i) => i.pending === true)).toBe(true)
    expect(infos[9].waitedMs).toBe(40_000)                                            // the UI is told how long it has waited…
    expect(infos[0].budgetMs).toBe(RETRY.pendingBudgetMs)                             // …and how long it will keep waiting
    expect(infos.slice(10).every((i) => !i.pending)).toBe(true)
  })
  it("the polling budget outlasts the server's stale-claim window (60 s), so a crashed request's claim is taken over by OUR poll", async () => {
    expect(RETRY.pendingBudgetMs).toBeGreaterThan(60_000)
    let n = 0
    // the server answers 'in progress' until its claim goes stale after ~62 s of our polling, then the retry takes it over and succeeds
    const out = await withRetries(async () => { n++; if (n <= 21) throw pending("3"); return "recovered" }, { sleep: async () => {}, rand: () => 0.5 })
    expect(out).toBe("recovered"); expect(n).toBe(22)                                  // 21 × 3 s = 63 s of waiting, within the budget
  })
  it("when the budget is exhausted the user gets an accurate, non-retryable message (it may already be filed) — not a generic failure", async () => {
    let n = 0
    await expect(withRetries(async () => { n++; throw pending("10") }, { sleep: async () => {}, rand: () => 0.5 })).rejects.toMatchObject({
      retryable: false, userMessage: expect.stringMatching(/still being processed.*may already be filed/i),
    })
    expect(n).toBe(10)                                                                // 9 polls × 10 s = 90 s budget, then the 10th answer ends it
  })
  it("with automatic retries OFF (server did not advertise idempotency) even a pending answer is not polled", async () => {
    let n = 0
    await expect(withRetries(async () => { n++; throw pending() }, { maxAttempts: 1, sleep: async () => {} })).rejects.toMatchObject({ pending: true })
    expect(n).toBe(1)
  })
})

// ── item 5: automatic retries only when the server confirmed idempotency support ──────────────────────────────────────────────
describe("capability gate", () => {
  beforeEach(() => { vi.restoreAllMocks() })
  it("serverSupportsIdempotency: true only for an explicit capability; absent / malformed / older server → false", () => {
    expect(serverSupportsIdempotency({ capabilities: { submissionKeys: 1 } })).toBe(true)
    for (const c of [undefined, null, {}, { capabilities: {} }, { capabilities: { submissionKeys: 0 } }, { capabilities: null }, { capabilities: { submissionKeys: "no" } }, "x", 7]) expect(serverSupportsIdempotency(c as any)).toBe(false)
  })
  const cfgOf = { backendUrl: "https://k.test", firstParty: true, token: "" }
  it("autoRetry:false → exactly ONE request on a network failure (an old server would make a duplicate ticket from a re-send)", async () => {
    const f = vi.fn(async () => { throw new TypeError("down") }); vi.stubGlobal("fetch", f)
    const prep = await prepareSubmission({ ...cfgOf, projectId: "p1" }, payload)
    await expect(sendPrepared(prep, cfgOf, { autoRetry: false, sleep: async () => {} })).rejects.toMatchObject({ kind: "network" })
    expect(f).toHaveBeenCalledTimes(1)
  })
  it("autoRetry:true (server confirmed) → retries with the same key until it works", async () => {
    let n = 0; const keys: any[] = []
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => { keys.push((init.body as FormData).get("submission_key")); n++; if (n < 3) throw new TypeError("down"); return new Response(JSON.stringify({ id: "fb_ok" }), { status: 200 }) }))
    const prep = await prepareSubmission({ ...cfgOf, projectId: "p1" }, payload)
    const out = await sendPrepared(prep, cfgOf, { autoRetry: true, sleep: async () => {} })
    expect(out.id).toBe("fb_ok"); expect(n).toBe(3); expect(new Set(keys).size).toBe(1)
  })
  it("a 5xx on a server that did NOT confirm support is shown to the user at once (single attempt)", async () => {
    const f = vi.fn(async () => new Response("{}", { status: 503 })); vi.stubGlobal("fetch", f)
    const prep = await prepareSubmission({ ...cfgOf, projectId: "p1" }, payload)
    await expect(sendPrepared(prep, cfgOf, { autoRetry: false })).rejects.toMatchObject({ status: 503, retryable: true })
    expect(f).toHaveBeenCalledTimes(1)
  })
})

// ── manual Retry against an OLDER server: be honest that the ticket may already exist ─────────────────────────────────────────────
describe("retryFailureCopy / isUncertainOutcome", () => {
  it("a lost answer (network drop, stall, timeout) or a 5xx MAY mean the ticket was created; a clear rejection cannot", () => {
    for (const e of [networkFailure("network"), networkFailure("stalled"), networkFailure("timeout"), err(500), err(502), err(503), err(504)]) expect(isUncertainOutcome(e)).toBe(true)
    for (const e of [err(400, { error: "bad" }), err(401), err(403, { error: "No access" }), err(404), err(413), err(429), err(409, { error: "key used", retryable: false })]) expect(isUncertainOutcome(e)).toBe(false)
  })
  it("OLDER server (no idempotency support) + uncertain failure → warns the report may already exist and names the button 'Retry anyway'", () => {
    for (const e of [networkFailure("network"), networkFailure("timeout"), err(503)]) {
      const c = retryFailureCopy(e, false)
      expect(c.message).toMatch(/may already have been created/i)
      expect(c.message).toMatch(/Check Klavity before retrying/i)
      expect(c.message).toMatch(/can't prevent a duplicate/i)
      expect(c.retryLabel).toBe("Retry anyway")
    }
  })
  it("OLDER server + a clear rejection → the server's own reason and a plain Retry (nothing was created, so no warning)", () => {
    const c = retryFailureCopy(err(413, { error: "Attachments exceed the 120 MB total limit." }), false)
    expect(c).toEqual({ message: "Attachments exceed the 120 MB total limit.", retryLabel: undefined })
  })
  it("a server that CONFIRMED idempotency support → never the scary wording: a re-send is safe", () => {
    for (const e of [networkFailure("network"), err(503)]) { const c = retryFailureCopy(e, true); expect(c.message).not.toMatch(/already have been created/i); expect(c.retryLabel).toBeUndefined() }
  })
  it("no error object (unexpected throw) falls back to the generic hint", () => {
    expect(retryFailureCopy(null, false)).toEqual({ message: "check your connection" })
  })
})
