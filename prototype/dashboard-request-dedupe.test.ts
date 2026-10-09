// Step 3 (perf): browser-side de-duplication of /api/dashboard requests in dashboard.html.
//   • background polls (focus / visibilitychange / 25s tick) SKIP when their own request key is in flight,
//   • mutation-triggered refreshes + load() always fetch fresh, but register so later polls are suppressed,
//   • the registry is always cleared (success AND failure) and an older request never clears a newer entry,
//   • a response for a project that is no longer targeted is discarded,
//   • load()'s retry / error-recovery behaviour is unchanged.
// The real functions are extracted from public/dashboard.html and run in a sandbox with controllable stubs.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")

function extractFn(src: string, startSig: string): string {
  const i = src.indexOf(startSig)
  if (i < 0) throw new Error("source not found: " + startSig)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + startSig)
}

const SRC = {
  inflightDecl: "const _dashInflight = new Map()",
  seqDecl: "let _dashSeq = 0\n    let _dashAppliedSeq = 0",
  freshDecl: "const DASH_MIN_REFRESH_GAP_MS = 10000\n    let _dashLastAppliedRequestAt = 0",
  dashFreshEnough: extractFn(HTML, "function dashFreshEnough("),
  swrReadUid: extractFn(HTML, "function swrReadUid("),
  dashIdentityChanged: extractFn(HTML, "function dashIdentityChanged("),
  dashNoteNetworkApplied: extractFn(HTML, "function dashNoteNetworkApplied("),
  dashForgetProject: extractFn(HTML, "function dashForgetProject("),
  dashHardReset: extractFn(HTML, "function dashHardReset("),
  dashRequestUrl: extractFn(HTML, "function dashRequestUrl("),
  dashInflightEnter: extractFn(HTML, "function dashInflightEnter("),
  dashInflightLeave: extractFn(HTML, "function dashInflightLeave("),
  dashRegistered: extractFn(HTML, "async function dashRegistered("),
  dashResponseStale: extractFn(HTML, "function dashResponseStale("),
  activeProjectParam: extractFn(HTML, "function activeProjectParam("),
  dashTargetProjId: extractFn(HTML, "function dashTargetProjId("),
  dashCacheKey: extractFn(HTML, "function dashCacheKey("),
  load: extractFn(HTML, "async function load("),
  refreshAll: extractFn(HTML, "async function refreshAll("),
  dashLiveTick: extractFn(HTML, "function dashLiveTick("),
}
expect(HTML).toContain("const _dashInflight = new Map()")
expect(HTML).toContain("let _dashSeq = 0\nlet _dashAppliedSeq = 0")
expect(HTML).toContain("const DASH_MIN_REFRESH_GAP_MS = 10000\nlet _dashLastAppliedRequestAt = 0")

type Pending = { url: string; resolve: (status: number, body: any) => void; reject: (e?: any) => void }

const UID_A = "a".repeat(32), UID_B = "b".repeat(32)
function build(opts: { search?: string; stored?: string | null; state?: any; uid?: string | null; confirmed?: boolean } = {}) {
  const loc: any = { search: opts.search ?? "", href: "http://x.test/dashboard" + (opts.search ?? ""), pathname: "/dashboard" }
  const store: Record<string, string> = opts.stored != null ? { "klav:dash:last": opts.stored } : {}
  const localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
  }
  const pending: Pending[] = []
  const calls: string[] = []
  const fetchWithTimeout = (url: string) => {
    calls.push(url)
    return new Promise((res, rej) => {
      pending.push({
        url,
        resolve: (status, body) => res({ status, ok: status >= 200 && status < 300, json: async () => body }),
        reject: (e) => rej(e ?? new Error("network")),
      })
    })
  }
  // A tiny cookie jar with real document.cookie semantics (assigning ONE cookie must not wipe the others).
  const jar = new Map<string, string>(opts.uid === null ? [["klav_proj", "x"]] : [["klav_uid", opts.uid ?? UID_A], ["klav_proj", "x"]])
  const docStub: any = {
    body: { getAttribute: () => "overview" },
    get cookie() { return [...jar].map(([k, v]) => k + "=" + v).join("; ") },
    set cookie(line: string) {
      const [pair, ...attrs] = line.split(";").map((x) => x.trim())
      const i = pair.indexOf("="); const name = pair.slice(0, i), val = pair.slice(i + 1)
      if (attrs.some((a) => /^max-age=0$/i.test(a)) || val === "") jar.delete(name); else jar.set(name, val)
    },
  }
  const kbarLog = { start: 0, done: 0 }
  const kbar = { start: () => { kbarLog.start++ }, done: () => { kbarLog.done++ } }
  const rendered: any[] = []
  const written: string[] = []
  const replaced: string[] = []
  const history = { replaceState: (_a: any, _b: any, u: string) => { replaced.push(u); loc.search = u.includes("?") ? u.slice(u.indexOf("?")).split("#")[0] : "" } }
  const lead = { textContent: "" }
  // Deterministic wall clock (the sandbox's `Date.now()`); tests advance it explicitly.
  const clock = { t: 1_000_000, advance(ms: number) { clock.t += ms }, set(t: number) { clock.t = t } }
  const sessionStore = { _d: {} as Record<string, string>, getItem(k: string) { return this._d[k] ?? null }, setItem(k: string, v: string) { this._d[k] = v }, removeItem(k: string) { delete this._d[k] } }
  const invalidated: string[] = []
  const boot = { loadViewData: 0, mountReportWidget: 0, schedulePrefetch: 0, deepLink: 0 }
  const body = `
    let state = __initialState
    ${SRC.inflightDecl}
    ${SRC.seqDecl}
    ${SRC.freshDecl}
    let _dashStateNetworkConfirmed = false
    ${SRC.swrReadUid}
    const _pageUid = swrReadUid()
    ${SRC.dashIdentityChanged}
    ${SRC.dashNoteNetworkApplied}
    ${SRC.dashForgetProject}
    ${SRC.dashHardReset}
    ${SRC.dashFreshEnough}
    const DASH_LAST_KEY = "klav:dash:last"
    ${SRC.dashRequestUrl}
    ${SRC.dashInflightEnter}
    ${SRC.dashInflightLeave}
    ${SRC.dashRegistered}
    ${SRC.dashResponseStale}
    ${SRC.activeProjectParam}
    ${SRC.dashTargetProjId}
    ${SRC.dashCacheKey}
    ${SRC.load}
    ${SRC.refreshAll}
    ${SRC.dashLiveTick}
    return { load, refreshAll, dashLiveTick, _dashInflight, getState: () => state, setState: v => { state = v }, seqs: () => ({ seq: _dashSeq, applied: _dashAppliedSeq }), freshAt: () => _dashLastAppliedRequestAt, confirmed: () => _dashStateNetworkConfirmed, setConfirmed: (v) => { _dashStateNetworkConfirmed = v } }
  `
  const names = ["__initialState", "fetchWithTimeout", "kbar", "location", "localStorage", "history", "render", "swrRead", "swrWrite",
    "mergeLocalEdits", "maybeOpenDeepLinkTicket", "renderRegressionBanner", "dashLiveBusy", "renderTriage", "document", "loadViewData",
    "mountReportWidget", "schedulePrefetch", "clearStuckSkeletons", "safeRender", "renderSwitcher", "$", "setTimeout", "Date", "sessionStorage", "swrInvalidate"]
  const vals = [opts.state ?? null, fetchWithTimeout, kbar, loc, localStorage, history,
    (...a: any[]) => { rendered.push(a) }, () => null, (k: string) => { written.push(k) },
    (d: any) => d, () => { boot.deepLink++ }, () => undefined, () => false, () => {}, docStub, () => { boot.loadViewData++ },
    () => { boot.mountReportWidget++ }, () => { boot.schedulePrefetch++ }, () => {}, (_l: string, fn: () => void) => fn(), () => {}, (_k: string) => lead, (fn: () => void) => { fn(); return 0 }, { now: () => clock.t }, sessionStore, (k: string) => { invalidated.push(k) }]
  const api = new Function(...names, body)(...vals)
  if (opts.confirmed) api.setConfirmed(true)
  loc.reload = () => { loc.reloaded = (loc.reloaded || 0) + 1 }
  return { ...api, pending, calls, kbarLog, rendered, written, replaced, loc, store, lead, boot, clock, doc: docStub, sessionStore, invalidated }
}

const tick = async () => { for (let i = 0; i < 8; i++) await Bun.sleep(0) }
const GOOD = (id: string) => ({ email: "u@x", projects: [{ id, name: id }], active: { id, name: id }, tickets: [], sims: [] })
const A = "proj_A", B = "proj_B"
const URL_A = "/api/dashboard?project=proj_A"

// ── polls skip while the same request is in flight ───────────────────────────────────────────────────
test("simultaneous focus + visibilitychange (two dashLiveTick calls) → ONE dashboard fetch", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick()   // window "focus"
  h.dashLiveTick()   // document "visibilitychange"
  await tick()
  expect(h.calls).toEqual([URL_A])
  expect(h.kbarLog.start).toBe(1)           // skipped poll never touched the progress bar
  h.pending[0].resolve(200, GOOD(A))
  await tick()
  expect(h.rendered.length).toBe(1)         // the response is rendered once, not twice
  expect(h.kbarLog).toEqual({ start: 1, done: 1 })
})

test("a poll skips while a load() request for the same key is in flight (state already painted from SWR cache)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  const p = h.load()
  await tick()
  expect(h.calls).toEqual([URL_A])
  h.dashLiveTick()
  await tick()
  expect(h.calls.length).toBe(1)
  h.pending[0].resolve(200, GOOD(A))
  await p
})

test("the skip check runs BEFORE kbar.start() (and before the sequence stamp) (source order)", () => {
  const f = SRC.refreshAll
  const skip = f.indexOf("isPoll === true && (_dashInflight.has(reqUrl) || dashFreshEnough())")
  expect(skip).toBeGreaterThan(-1)
  expect(skip).toBeLessThan(f.indexOf("const seq = ++_dashSeq"))
  expect(skip).toBeLessThan(f.indexOf("\n  kbar.start()\n"))
})

// ── registry lifecycle ──────────────────────────────────────────────────────────────────────────────
test("a successful request clears the registry, so the next poll fetches again", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()
  expect(h._dashInflight.size).toBe(1)
  h.pending[0].resolve(200, GOOD(A)); await tick()
  expect(h._dashInflight.size).toBe(0)
  h.clock.advance(11_000)   // Step 4: clear the 10s freshness gap so this test still exercises the registry, not the gate
  h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)
})

test("a REJECTED request clears the registry and a later poll can retry", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()
  h.pending[0].reject(); await tick()
  expect(h._dashInflight.size).toBe(0)
  expect(h.kbarLog).toEqual({ start: 1, done: 1 })
  h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)
})

test("an HTTP-error response (500) and a 401 also clear the registry", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()
  h.pending[0].resolve(500, null); await tick()
  expect(h._dashInflight.size).toBe(0)
  h.dashLiveTick(); await tick()
  h.pending[1].resolve(401, null); await tick()
  expect(h._dashInflight.size).toBe(0)
  expect(h.loc.href).toBe("/login")
  expect(h.getState().active.id).toBe(A)     // state untouched by failures
})

test("an older request finishing late does NOT clear a newer request's entry", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()                 // older: poll
  h.refreshAll(); await tick()                   // newer: mutation refresh (same key, replaces the entry)
  expect(h.calls.length).toBe(2)
  h.pending[0].resolve(200, GOOD(A)); await tick()   // older finishes first
  expect(h._dashInflight.has(URL_A)).toBe(true)      // newer still registered
  h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)                     // → poll still suppressed
  h.pending[1].resolve(200, GOOD(A)); await tick()
  expect(h._dashInflight.size).toBe(0)
})

// ── mutation behaviour ──────────────────────────────────────────────────────────────────────────────
test("a mutation refresh (refreshAll() with no isPoll) is NOT suppressed by an older in-flight poll", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(1)
  h.refreshAll(); await tick()
  expect(h.calls.length).toBe(2)             // its own fresh request
})

test("mutation refresh makes its own fresh request and applies ITS (post-mutation) payload", async () => {
  const before = { ...GOOD(A), tickets: [{ id: "t1", status: "open" }] }
  const after = { ...GOOD(A), tickets: [{ id: "t1", status: "done" }] }
  const h = build({ search: `?project=${A}`, state: before })
  h.refreshAll(); await tick()
  expect(h.calls).toEqual([URL_A])
  h.pending[0].resolve(200, after); await tick()
  expect(h.getState().tickets[0].status).toBe("done")
})

test("a mutation request registers itself, so subsequent polls skip while it runs", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.refreshAll(); await tick()
  expect(h._dashInflight.has(URL_A)).toBe(true)
  h.dashLiveTick(); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(1)
  h.pending[0].resolve(200, GOOD(A)); await tick()
  h.clock.advance(11_000)   // Step 4: clear the 10s freshness gap (the registry entry is what this test is about)
  h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)
})

test("load() (setPlan / Sim-added path) with state present always fetches, even when a poll is in flight", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()
  const p = h.load(); await tick()
  expect(h.calls.length).toBe(2)
  h.pending[1].resolve(200, GOOD(A)); await p
})

test("mutation call sites are unchanged: refreshAll() / load() are still called WITHOUT isPoll", () => {
  expect(HTML).toContain("refreshAll(true)   // #658")          // the poll
  expect(HTML).toMatch(/refreshAll\(\)\s+\/\/ triage count \+ checklist tick update/)   // test-report submit
  expect(HTML).toMatch(/Re-fetch dashboard data so the overview count[^\n]*\n\s*refreshAll\(\)/)           // New Ticket
  expect(HTML).toContain('if (typeof load === "function") await load()')   // setPlan
  expect(HTML).toContain("if(simAdded){ simAdded=false; load(); }")      // Sim added
})

// ── independence of keys ────────────────────────────────────────────────────────────────────────────
test("bare /api/dashboard and ?project=<id> are distinct keys; different projects are independent", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()                         // key A in flight
  h.loc.search = `?project=${B}`                          // current target is now B
  h.dashLiveTick(); await tick()
  expect(h.calls).toEqual([URL_A, "/api/dashboard?project=proj_B"])   // B is NOT blocked by A
  h.loc.search = ""
  h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(3)                          // bare is a third, distinct key
  expect(h.calls[2]).toBe("/api/dashboard")
})

// ── stale project response ──────────────────────────────────────────────────────────────────────────
test("a response for a project that is no longer targeted is discarded (refreshAll)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(B) })
  h.dashLiveTick(); await tick()                          // request for A in flight
  h.loc.search = `?project=${B}`                          // target changes to B meanwhile
  h.pending[0].resolve(200, GOOD(A)); await tick()
  expect(h.getState().active.id).toBe(B)                 // A's payload did not overwrite B
  expect(h.rendered.length).toBe(0)
  expect(h.written.length).toBe(0)                       // …nor was it cached
  expect(h._dashInflight.size).toBe(0)
  expect(h.kbarLog).toEqual({ start: 1, done: 1 })
})

test("a response for the still-targeted project IS applied", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()
  h.pending[0].resolve(200, { ...GOOD(A), tickets: [{ id: "n" }] }); await tick()
  expect(h.getState().tickets.length).toBe(1)
  expect(h.rendered.length).toBe(1)
})

test("load(): stale response is discarded when state already exists, but a cold boot still paints", async () => {
  const warm = build({ search: `?project=${A}`, state: GOOD(A) })
  const p1 = warm.load(); await tick()
  warm.loc.search = `?project=${B}`
  warm.pending[0].resolve(200, GOOD(A)); await p1
  expect(warm.rendered.length).toBe(0)
  expect(warm.getState().active.id).toBe(A)              // kept what was already there

  const cold = build({ search: `?project=${A}`, state: null })
  const p2 = cold.load(); await tick()
  cold.loc.search = `?project=${B}`
  cold.pending[0].resolve(200, GOOD(A)); await p2
  expect(cold.getState().active.id).toBe(A)              // cold boot is never left on skeletons
  expect(cold.rendered.length).toBe(1)
})

// ── load() retry / error behaviour unchanged ────────────────────────────────────────────────────────
test("load(): a rejected fetch retries (3 attempts) and the registry is clear afterwards", async () => {
  const h = build({ search: `?project=${A}`, state: null })
  const p = h.load()
  for (let i = 0; i < 3; i++) { await tick(); h.pending[i].reject() }
  await p
  expect(h.calls).toEqual([URL_A, URL_A, URL_A])
  expect(h._dashInflight.size).toBe(0)
  expect(h.kbarLog).toEqual({ start: 1, done: 1 })
  expect(h.lead.textContent).toContain("Couldn't load your project")
})

test("load(): a transient failure then success paints the good payload", async () => {
  const h = build({ search: `?project=${A}`, state: null })
  const p = h.load()
  await tick(); h.pending[0].reject()
  await tick(); h.pending[1].resolve(200, GOOD(A))
  await p
  expect(h.calls.length).toBe(2)
  expect(h.getState().active.id).toBe(A)
  expect(h._dashInflight.size).toBe(0)
})

test("load(): an errored ?project= strips the param and retries bare /api/dashboard (KLA-829)", async () => {
  const h = build({ search: `?project=proj_dead`, stored: "proj_dead", state: GOOD(A) })
  const p = h.load()
  await tick(); h.pending[0].resolve(403, { error: "No access to this project." })
  await tick()
  expect(h.calls).toEqual(["/api/dashboard?project=proj_dead", "/api/dashboard"])
  expect(h.store["klav:dash:last"]).toBeUndefined()      // pointer cleared
  h.pending[1].resolve(200, GOOD(B))
  await p
  expect(h.getState().active.id).toBe(B)                 // recovered state is applied (not treated as stale)
  expect(h._dashInflight.size).toBe(0)
})

test("load(): 401 redirects to /login and leaves no registry entry", async () => {
  const h = build({ search: `?project=${A}`, state: null })
  const p = h.load()
  await tick(); h.pending[0].resolve(401, null)
  await p
  expect(h.loc.href).toBe("/login")
  expect(h._dashInflight.size).toBe(0)
})

test("load() source is still pinned: dashTargetProjId pid, dashUrl line, literal bare retry", () => {
  expect(SRC.load).toMatch(/const pid = dashTargetProjId\(\)/)
  expect(SRC.load).toContain('fetchWithTimeout("/api/dashboard")')
  expect(SRC.load.split("\n").some(l => l.includes("/api/dashboard") && l.includes("encodeURIComponent(pid)"))).toBe(true)
  expect(SRC.refreshAll).toMatch(/const pid = dashTargetProjId\(\)/)
})

test("polling interval and liveness wiring untouched (25s, focus, visibilitychange)", () => {
  expect(HTML).toContain("setInterval(dashLiveTick, 25000)")
  expect(HTML).toContain('window.addEventListener("focus", dashLiveTick)')
  expect(HTML).toContain('document.addEventListener("visibilitychange", () => { if (!document.hidden) dashLiveTick() })')
})

// ══ Response ordering (high-water mark): an older response must never overwrite a newer applied one ══════
const T = (id: string, status = "open") => ({ ...GOOD(A), tickets: [{ id, status }] })
const OLD = T("t_old"), NEW = T("t_new")

test("ordering 1: poll A starts, mutation B starts, B lands first → A is discarded (no state/render/cache)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()            // A: seq 1
  h.refreshAll(); await tick()              // B: seq 2 (mutation, never skipped)
  h.pending[1].resolve(200, NEW); await tick()
  expect(h.getState().tickets[0].id).toBe("t_new")
  expect(h.seqs()).toEqual({ seq: 2, applied: 2 })
  const renders = h.rendered.length, writes = h.written.length
  h.pending[0].resolve(200, OLD); await tick()
  expect(h.getState().tickets[0].id).toBe("t_new")        // A did not overwrite B
  expect(h.rendered.length).toBe(renders)                  // no repaint
  expect(h.written.length).toBe(writes)                    // ordering 9: no SWR/cache write for the superseded response
  expect(h.seqs().applied).toBe(2)
  expect(h._dashInflight.size).toBe(0)
  expect(h.kbarLog).toEqual({ start: 2, done: 2 })
})

test("ordering 2: A lands first, B lands later → both apply, B wins", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick(); h.refreshAll(); await tick()
  h.pending[0].resolve(200, OLD); await tick()
  expect(h.getState().tickets[0].id).toBe("t_old")         // an older response MAY apply while a newer one is merely in flight
  expect(h.seqs().applied).toBe(1)
  h.pending[1].resolve(200, NEW); await tick()
  expect(h.getState().tickets[0].id).toBe("t_new")
  expect(h.seqs().applied).toBe(2)
})

test("ordering 3: mutation vs mutation — the newer successful response wins regardless of arrival order", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.refreshAll(); await tick(); h.refreshAll(); await tick()      // M1 seq 1, M2 seq 2
  h.pending[1].resolve(200, T("t_m2")); await tick()
  h.pending[0].resolve(200, T("t_m1")); await tick()
  expect(h.getState().tickets[0].id).toBe("t_m2")
})

test("ordering 4: newer request REJECTS → the older successful response still applies", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick(); h.refreshAll(); await tick()
  h.pending[1].reject(); await tick()
  expect(h.seqs().applied).toBe(0)                          // a failure never advances the mark
  h.pending[0].resolve(200, OLD); await tick()
  expect(h.getState().tickets[0].id).toBe("t_old")
  expect(h.seqs().applied).toBe(1)
})

test("ordering 5: newer request returns HTTP 500 → the older successful response still applies", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick(); h.refreshAll(); await tick()
  h.pending[1].resolve(500, null); await tick()
  expect(h.seqs().applied).toBe(0)
  h.pending[0].resolve(200, OLD); await tick()
  expect(h.getState().tickets[0].id).toBe("t_old")
})

test("ordering 6: newer request returns an error payload → the older successful response still applies", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick(); h.refreshAll(); await tick()
  h.pending[1].resolve(200, { error: "boom" }); await tick()
  expect(h.seqs().applied).toBe(0)
  h.pending[0].resolve(200, OLD); await tick()
  expect(h.getState().tickets[0].id).toBe("t_old")
})

test("ordering 7: an empty/invalid newer response does not advance the applied sequence", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A), confirmed: true })
  h.dashLiveTick(); await tick(); h.refreshAll(); await tick()
  h.pending[1].resolve(200, { projects: [], active: null }); await tick()    // KLA-717 empty-payload guard
  expect(h.seqs().applied).toBe(0)
  const h2 = build({ search: `?project=${A}`, state: GOOD(A), confirmed: true })
  h2.dashLiveTick(); await tick(); h2.refreshAll(); await tick()
  h2.pending[1].resolve(200, null); await tick()                              // invalid (null) body
  expect(h2.seqs().applied).toBe(0)
  h.pending[0].resolve(200, OLD); await tick()
  expect(h.getState().tickets[0].id).toBe("t_old")
  h2.pending[0].resolve(200, OLD); await tick()
  expect(h2.getState().tickets[0].id).toBe("t_old")
})

test("ordering 8: a skipped poll does NOT consume a sequence number", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); h.dashLiveTick(); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(1)
  expect(h.seqs().seq).toBe(1)
})

test("ordering: a project-mismatch response is discarded and does not advance the applied sequence", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(B) })
  h.dashLiveTick(); await tick()
  h.loc.search = `?project=${B}`
  h.pending[0].resolve(200, GOOD(A)); await tick()
  expect(h.seqs()).toEqual({ seq: 1, applied: 0 })
  expect(h.getState().active.id).toBe(B)
})

test("ordering 10: each load() retry attempt gets its own fresh sequence number", async () => {
  const h = build({ search: `?project=${A}`, state: null })
  const p = h.load()
  await tick(); expect(h.seqs().seq).toBe(1); h.pending[0].reject()
  await tick(); expect(h.seqs().seq).toBe(2); h.pending[1].reject()
  await tick(); expect(h.seqs().seq).toBe(3); h.pending[2].resolve(200, GOOD(A))
  await p
  expect(h.seqs()).toEqual({ seq: 3, applied: 3 })          // applied with the stamp of the attempt that produced the data
  expect(h.getState().active.id).toBe(A)
})

test("ordering 11: the bare /api/dashboard fallback gets a fresh sequence number", async () => {
  const h = build({ search: `?project=proj_dead`, stored: "proj_dead", state: null })
  const p = h.load()
  await tick(); expect(h.seqs().seq).toBe(1); h.pending[0].resolve(403, { error: "No access" })
  await tick(); expect(h.calls[1]).toBe("/api/dashboard"); expect(h.seqs().seq).toBe(2)
  h.pending[1].resolve(200, GOOD(B))
  await p
  expect(h.seqs()).toEqual({ seq: 2, applied: 2 })
  expect(h.getState().active.id).toBe(B)
})

test("ordering 12+13: a superseded load() neither repaints nor caches the stale payload, but still completes boot init", async () => {
  // No ?project= in the URL (target comes from localStorage), so the boot's URL replaceState is observable.
  const h = build({ search: "", stored: A, state: GOOD(A) })
  const p = h.load(); await tick()                         // boot load: seq 1
  h.refreshAll(); await tick()                             // mutation refresh: seq 2
  h.pending[1].resolve(200, NEW); await tick()             // newer lands first and is applied + cached
  const renders = h.rendered.length, writes = h.written.length
  expect(h.seqs().applied).toBe(2)
  h.pending[0].resolve(200, OLD); await p                  // the older boot response lands last
  // stale payload: no state overwrite, no repaint, no cache write
  expect(h.getState().tickets[0].id).toBe("t_new")
  expect(h.rendered.length).toBe(renders)
  expect(h.written.length).toBe(writes)
  expect(h.seqs().applied).toBe(2)
  // boot initialisation still ran, against the CURRENT accepted state
  expect(h.boot).toEqual({ loadViewData: 1, mountReportWidget: 1, schedulePrefetch: 1, deepLink: 2 })   // deepLink: refreshAll + load
  expect(h.store["klav:dash:last"]).toBe(A)                // last-project bookkeeping
  expect(h.replaced).toEqual(["/dashboard?project=proj_A"])   // URL replaceState uses the accepted state's project
  expect(h._dashInflight.size).toBe(0)
  expect(h.kbarLog).toEqual({ start: 2, done: 2 })
})

test("ordering: a NON-superseded load() still applies, renders, caches and runs boot init exactly as before", async () => {
  const h = build({ search: "", stored: A, state: null })
  const p = h.load(); await tick()
  h.pending[0].resolve(200, NEW); await p
  expect(h.getState().tickets[0].id).toBe("t_new")
  expect(h.rendered.length).toBe(1)
  expect(h.written).toEqual(["dash:" + A])
  expect(h.boot).toEqual({ loadViewData: 1, mountReportWidget: 1, schedulePrefetch: 1, deepLink: 1 })
  expect(h.replaced).toEqual(["/dashboard?project=proj_A"])
})

test("ordering: a mutation-triggered load() (setPlan / Sim-added) beats an older in-flight poll that lands later", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  h.dashLiveTick(); await tick()                           // poll: seq 1
  const p = h.load(); await tick()                         // load: seq 2
  h.pending[1].resolve(200, NEW); await p
  h.pending[0].resolve(200, OLD); await tick()
  expect(h.getState().tickets[0].id).toBe("t_new")
})

test("KLA-764 pin preserved WITH per-attempt sequencing: stamp sits inside the retry loop's try, before the fetch", () => {
  const fi = SRC.load.indexOf("for (let attempt = 0; attempt < 3; attempt++)")
  const region = SRC.load.slice(fi, fi + 1600)
  expect(region.indexOf("stamp(); const r = await fetchWithTimeout(dashUrl)")).toBeGreaterThan(region.indexOf("try {"))
  expect(region).toContain("catch (e) { data = null }")
  expect(HTML.slice(HTML.indexOf("async function load("), HTML.indexOf("function mountReportWidget")).split("stamp()").length - 1).toBe(2)
})

// ══ Step 4: minimum background-refresh gap (10s) ═══════════════════════════════════════════════════════════
const BASE = 1_000_000
const at = (h: any, sec: number) => h.clock.set(BASE + Math.round(sec * 1000))
// Answer every request issued since the last call with a good payload (zero latency), then let microtasks settle.
function answerer(h: any) {
  let n = 0
  return async (body: any = GOOD(A)) => { await tick(); while (n < h.pending.length) h.pending[n++].resolve(200, body); await tick() }
}

test("freshness 1: a successful poll followed by focus within 10s is skipped (no request, no seq, no kbar)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) }); const answer = answerer(h)
  at(h, 0); h.dashLiveTick(); await answer()
  expect(h.calls.length).toBe(1)
  at(h, 2); h.dashLiveTick(); await tick()                // "focus" 2s later
  expect(h.calls.length).toBe(1)
  expect(h.seqs()).toEqual({ seq: 1, applied: 1 })        // 17: a freshness-skipped poll consumed no sequence number
  expect(h.kbarLog).toEqual({ start: 1, done: 1 })
})

test("freshness 2: visibilitychange + focus → ONE request (in-flight), and a third after completion is freshness-skipped", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) }); const answer = answerer(h)
  at(h, 40.2); h.dashLiveTick(); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(1)                           // Step 3 in-flight
  await answer()
  h.dashLiveTick(); await tick()                           // events separated by more than the request latency
  expect(h.calls.length).toBe(1)                           // Step 4 freshness
})

test("freshness 3: a focus/visibility refresh followed by the timer within 10s → timer skipped", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) }); const answer = answerer(h)
  at(h, 40.2); h.dashLiveTick(); await answer()
  at(h, 50); h.dashLiveTick(); await tick()                // age 9.8s
  expect(h.calls.length).toBe(1)
})

test("freshness 4: the gap is a strict \"< 10s\": 9999ms is skipped, exactly 10000ms and later run", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) }); const answer = answerer(h)
  at(h, 0); h.dashLiveTick(); await answer()
  at(h, 9.999); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(1)
  at(h, 10); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)
})

test("freshness 5+6: a mutation refresh then the timer within 10s → timer skipped; the mutation refresh itself is never gated", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) }); const answer = answerer(h)
  at(h, 0); h.dashLiveTick(); await answer()               // fresh poll
  at(h, 1); h.refreshAll(); await tick()                   // mutation refresh right after: NOT freshness-skipped
  expect(h.calls.length).toBe(2)
  await answer()
  at(h, 3); h.dashLiveTick(); await tick()                 // timer 2s after the mutation refresh
  expect(h.calls.length).toBe(2)
  at(h, 3); h.refreshAll(); await tick()                   // and a second mutation refresh is still allowed
  expect(h.calls.length).toBe(3)
})

test("freshness 7: a rejected request does not mark fresh (next poll runs immediately)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  at(h, 0); h.dashLiveTick(); await tick(); h.pending[0].reject(); await tick()
  expect(h.freshAt()).toBe(0)
  at(h, 0.5); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)
})

test("freshness 8: HTTP 500 / 401 do not mark fresh", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  at(h, 0); h.dashLiveTick(); await tick(); h.pending[0].resolve(500, null); await tick()
  expect(h.freshAt()).toBe(0)
  at(h, 0.5); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)
})

test("freshness 9: an error payload does not mark fresh", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  at(h, 0); h.dashLiveTick(); await tick(); h.pending[0].resolve(200, { error: "boom" }); await tick()
  expect(h.freshAt()).toBe(0)
  at(h, 0.5); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(2)
})

test("freshness 10: an empty (KLA-717) or invalid (null) response does not mark fresh", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A), confirmed: true })
  at(h, 0); h.dashLiveTick(); await tick(); h.pending[0].resolve(200, { projects: [], active: null }); await tick()
  expect(h.freshAt()).toBe(0)
  at(h, 1); h.dashLiveTick(); await tick(); h.pending[1].resolve(200, null); await tick()
  expect(h.freshAt()).toBe(0)
  at(h, 1.5); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(3)
})

test("freshness 11: a superseded response does not mark fresh (the newer response's issue time stands)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  at(h, 0); h.dashLiveTick(); await tick()                 // poll A: issued at 0
  at(h, 5); h.refreshAll(); await tick()                   // mutation B: issued at 5
  at(h, 6); h.pending[1].resolve(200, NEW); await tick()
  expect(h.freshAt()).toBe(BASE + 5000)
  at(h, 7); h.pending[0].resolve(200, OLD); await tick()   // older A lands last → discarded
  expect(h.freshAt()).toBe(BASE + 5000)                    // unchanged (not rewound to A's issue time)
  // superseded load(): same rule
  const h2 = build({ search: "", stored: A, state: GOOD(A) })
  at(h2, 0); const p = h2.load(); await tick()
  at(h2, 5); h2.refreshAll(); await tick(); at(h2, 6); h2.pending[1].resolve(200, NEW); await tick()
  at(h2, 7); h2.pending[0].resolve(200, OLD); await p
  expect(h2.freshAt()).toBe(BASE + 5000)
})

test("freshness 12: a project-mismatch response does not mark fresh", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(B) })
  at(h, 0); h.dashLiveTick(); await tick()
  h.loc.search = `?project=${B}`
  h.pending[0].resolve(200, GOOD(A)); await tick()
  expect(h.freshAt()).toBe(0)
})

test("freshness 13: an initial successful load() marks the request ISSUE time; initial load is never gated", async () => {
  const h = build({ search: `?project=${A}`, state: null })
  at(h, 0); const p = h.load(); await tick()
  at(h, 3); h.pending[0].resolve(200, GOOD(A)); await p     // lands 3s after it was issued
  expect(h.freshAt()).toBe(BASE)                             // issue time, not completion time
  // never gated: a load() right after a fresh apply still fetches; so does a mutation-triggered one
  at(h, 3.1); const p2 = h.load(); await tick()
  expect(h.calls.length).toBe(2)
  h.pending[1].resolve(200, GOOD(A)); await p2
})

test("freshness 14: a failed initial load() (all retries rejected) does not mark fresh, and every retry still fetches", async () => {
  const h = build({ search: `?project=${A}`, state: null })
  at(h, 0); const p = h.load()
  for (let i = 0; i < 3; i++) { await tick(); h.pending[i].reject() }
  await p
  expect(h.calls.length).toBe(3)                             // retries are never freshness-gated
  expect(h.freshAt()).toBe(0)
})

test("freshness 15: a long-hidden tab returning refreshes promptly (age >> 10s)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) }); const answer = answerer(h)
  at(h, 30); h.dashLiveTick(); await answer()
  at(h, 150); h.dashLiveTick(); h.dashLiveTick(); await tick()   // return after 2 minutes: visibilitychange + focus
  expect(h.calls.length).toBe(2)                                  // exactly one refresh (the pair is coalesced by Step 3)
})

test("freshness 16: the wall clock moving backwards is treated as NOT fresh", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) }); const answer = answerer(h)
  at(h, 100); h.dashLiveTick(); await answer()
  at(h, 95); h.dashLiveTick(); await tick()                  // age = -5s
  expect(h.calls.length).toBe(2)
})

test("freshness: a slow response does not extend the suppression window (issue time, not completion time)", async () => {
  const h = build({ search: `?project=${A}`, state: GOOD(A) })
  at(h, 0); h.dashLiveTick(); await tick()
  at(h, 8); h.pending[0].resolve(200, GOOD(A)); await tick()   // took 8s
  at(h, 10); h.dashLiveTick(); await tick()                    // 10s after ISSUE (2s after completion) → runs
  expect(h.calls.length).toBe(2)
})

test("freshness: the gate never touches mutation callers — source pin on call sites and the gate's condition", () => {
  expect(SRC.refreshAll).toContain("if (isPoll === true && (_dashInflight.has(reqUrl) || dashFreshEnough())) return")
  expect(SRC.load).not.toContain("dashFreshEnough")            // load() (incl. retries + fallback) is never gated
  expect(SRC.load).toContain("_dashLastAppliedRequestAt = reqAt")
  expect(SRC.refreshAll).toContain("_dashLastAppliedRequestAt = fetchStart")
})

// ── deterministic timelines (zero latency; seconds from the boot load) ──────────────────────────────────────
test("timeline A: normal visible dashboard — 0 load, 25/50/75 polls → NO regular 25s poll is suppressed", async () => {
  const h = build({ search: `?project=${A}`, state: null }); const answer = answerer(h)
  at(h, 0); const p = h.load(); await answer(); await p
  for (const t of [25, 50, 75]) { at(h, t); h.dashLiveTick(); await answer() }
  expect(h.calls.length).toBe(4)                              // 1 load + 3 polls
  expect(h.seqs()).toEqual({ seq: 4, applied: 4 })
})

test("timeline B: mutation at 23 → timer at 25 skipped → timer at 50 allowed", async () => {
  const h = build({ search: `?project=${A}`, state: null }); const answer = answerer(h)
  at(h, 0); const p = h.load(); await answer(); await p
  at(h, 23); h.refreshAll(); await answer()
  const after23 = h.calls.length
  at(h, 25); h.dashLiveTick(); await tick()
  expect(h.calls.length).toBe(after23)                        // skipped
  at(h, 50); h.dashLiveTick(); await answer()
  expect(h.calls.length).toBe(after23 + 1)                    // allowed
})

test("timeline C: 40.2 visibility refresh + coalesced focus → timer at 50 skipped → timer at 75 allowed", async () => {
  const h = build({ search: `?project=${A}`, state: null }); const answer = answerer(h)
  at(h, 0); const p = h.load(); await answer(); await p
  at(h, 25); h.dashLiveTick(); await answer()                 // regular poll
  const n0 = h.calls.length
  at(h, 40.2); h.dashLiveTick(); h.dashLiveTick(); await answer()   // visibilitychange + focus → one request
  expect(h.calls.length).toBe(n0 + 1)
  at(h, 50); h.dashLiveTick(); await tick()                   // 9.8s after the 40.2 refresh
  expect(h.calls.length).toBe(n0 + 1)                         // skipped
  at(h, 75); h.dashLiveTick(); await answer()
  expect(h.calls.length).toBe(n0 + 2)                         // allowed
})
