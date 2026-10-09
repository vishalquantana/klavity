// Step 5: SWR / dashboard-cache USER ISOLATION + stale-authorization correctness in public/dashboard.html.
// The REAL swr*/dash*/load()/refreshAll() source is extracted and run in a sandbox against a fake "browser"
// (one localStorage + one cookie jar shared by every page/tab, like a real browser profile), so user switches,
// logout, session changes under an open tab and revoked access can be simulated end to end.
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
function line(re: RegExp): string {
  const m = HTML.match(re)
  if (!m) throw new Error("line not found: " + re)
  return m[0]
}

const FN = (sig: string) => extractFn(HTML, sig)
const SRC = [
  line(/^const SWR_V = .*$/m), line(/^const SWR_TTL_MS = .*$/m), line(/^const SWR_PREFIX = .*$/m),
  FN("function swrReadUid("), line(/^const _pageUid = swrReadUid\(\).*$/m), FN("function swrUid("), FN("function dashIdentityChanged("),
  FN("function swrKey("), FN("function swrBootPurge("), line(/^swrBootPurge\(\)\s*$/m),
  FN("function swrRead("), FN("function swrPrune("), FN("function swrWrite("), FN("function swrInvalidate("),
  FN("function activeProjectParam("), line(/^const DASH_LAST_KEY = .*$/m), FN("function dashCacheKey("), FN("function dashTargetProjId("),
  "const _dashInflight = new Map()", "let _dashSeq = 0", "let _dashAppliedSeq = 0",
  "const DASH_MIN_REFRESH_GAP_MS = 10000", "let _dashLastAppliedRequestAt = 0", FN("function dashFreshEnough("),
  FN("function dashRequestUrl("), FN("function dashInflightEnter("), FN("function dashInflightLeave("), FN("async function dashRegistered("),
  FN("function dashResponseStale("), "let _dashStateNetworkConfirmed = false", FN("function dashNoteNetworkApplied("),
  FN("function dashForgetProject("), FN("function dashHardReset("), FN("function dashClearClientCache("),
  FN("async function load("), FN("async function refreshAll("),
].join("\n")

// ── fake browser profile (shared by all pages/tabs) ───────────────────────────────────────────────────────────────
const UID_A = "a1".repeat(16), UID_B = "b2".repeat(16)
function browser() {
  const store = new Map<string, string>()
  const jar = new Map<string, string>()
  const session = new Map<string, string>()
  const reads: string[] = []   // every localStorage.getItem key (to prove the boot purge never reads legacy payloads)
  const localStorage = {
    getItem: (k: string) => { reads.push(k); return store.has(k) ? store.get(k)! : null },
    setItem: (k: string, v: string) => { store.set(k, String(v)) },
    removeItem: (k: string) => { store.delete(k) },
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size },
  }
  const sessionStorage = { getItem: (k: string) => session.get(k) ?? null, setItem: (k: string, v: string) => { session.set(k, v) }, removeItem: (k: string) => { session.delete(k) } }
  const document: any = {
    body: { getAttribute: () => "overview" },
    get cookie() { return [...jar].map(([k, v]) => k + "=" + v).join("; ") },
    set cookie(l: string) {
      const [pair, ...attrs] = l.split(";").map((x) => x.trim()); const i = pair.indexOf("=")
      const n = pair.slice(0, i), v = pair.slice(i + 1)
      if (attrs.some((a) => /^max-age=0$/i.test(a)) || v === "") jar.delete(n); else jar.set(n, v)
    },
  }
  return {
    store, jar, session, reads, localStorage, sessionStorage, document,
    keys: () => [...store.keys()],
    login: (uid: string) => { jar.set("klav_uid", uid); jar.set("klav_proj", "stale") },
    logoutServer: () => { jar.delete("klav_uid"); jar.delete("klav_proj") },   // what POST /api/auth/logout's Set-Cookie headers do
  }
}
type Browser = ReturnType<typeof browser>

const tick = async () => { for (let i = 0; i < 8; i++) await Bun.sleep(0) }
const DASH = (pid: string, email = "u@x.test", extra: any = {}) => ({ email, projects: [{ id: pid, name: pid }], active: { id: pid, name: pid, role: "admin" }, tickets: [{ id: "t_" + pid }], sims: [], ...extra })
const EMPTY = { email: "u@x.test", projects: [], active: null, members: [], sims: [], tickets: [] }
const PA = "proj_A", PB = "proj_B"
const cacheKey = (uid: string, pid: string) => `klav:swr:v2:${uid}:dash:${pid}`

// One "page load" (a tab) inside the shared browser. The page script's top level runs here: it captures klav_uid
// and runs the boot purge BEFORE anything reads the cache.
function page(b: Browser, opts: { search?: string; state?: any } = {}) {
  const loc: any = {
    search: opts.search ?? "", href: "http://x.test/dashboard" + (opts.search ?? ""), pathname: "/dashboard", protocol: "https:",
    reloaded: 0, replaced: [] as string[],
    reload() { loc.reloaded++ }, replace(u: string) { loc.replaced.push(u) },
  }
  const history = { replaceState: (_a: any, _b: any, u: string) => { loc.search = u.includes("?") ? u.slice(u.indexOf("?")).split("#")[0] : "" } }
  const pending: { url: string; resolve: (s: number, body: any) => void; reject: () => void }[] = []
  const calls: string[] = []
  const fetchWithTimeout = (url: string) => { calls.push(url); return new Promise((res, rej) => pending.push({ url, resolve: (status, body) => res({ status, ok: status >= 200 && status < 300, json: async () => body }), reject: () => rej(new Error("net")) })) }
  const rendered: any[] = []
  const lead = { textContent: "" }
  const boot = { loadViewData: 0, mountReportWidget: 0, schedulePrefetch: 0 }
  let api: any
  const body = `
    let state = __initialState
    ${SRC}
    return { load, refreshAll, dashClearClientCache, dashTargetProjId, swrRead, swrWrite, swrKey, swrBootPurge, _pageUid, getState: () => state,
      confirmed: () => _dashStateNetworkConfirmed, setConfirmed: (v) => { _dashStateNetworkConfirmed = v }, inflight: _dashInflight }
  `
  const names = ["__initialState", "fetchWithTimeout", "kbar", "location", "localStorage", "sessionStorage", "document", "history", "render",
    "mergeLocalEdits", "maybeOpenDeepLinkTicket", "renderRegressionBanner", "loadViewData", "mountReportWidget", "schedulePrefetch",
    "clearStuckSkeletons", "safeRender", "renderSwitcher", "$", "setTimeout", "Date"]
  const vals = [opts.state ?? null, fetchWithTimeout, { start() {}, done() {} }, loc, b.localStorage, b.sessionStorage, b.document, history,
    () => { const s = api?.getState(); rendered.push(s ? (s.active ? s.active.id : "(empty)") : null) },
    (d: any) => d, () => {}, () => undefined, () => { boot.loadViewData++ }, () => { boot.mountReportWidget++ }, () => { boot.schedulePrefetch++ },
    () => {}, (_l: string, fn: () => void) => fn(), () => {}, (_k: string) => lead, (fn: () => void) => { fn(); return 0 }, { now: () => Date.now() }]
  api = new Function(...names, body)(...vals)
  return { ...api, loc, pending, calls, rendered, lead, boot }
}

// Put a valid, same-user v2 entry for `pid` into the browser exactly as the page itself would write it.
function seedOwn(b: Browser, uid: string, pid: string, data: any) {
  b.store.set(cacheKey(uid, pid), JSON.stringify({ v: 2, u: uid, t: Date.now(), data }))
}

// ══ 1. cross-user isolation ═════════════════════════════════════════════════════════════════════════════════════
test("A caches project A, logs out, B logs in → B NEVER paints A's cached dashboard (explicit logout)", async () => {
  const b = browser(); b.login(UID_A)
  const a = page(b, { search: `?project=${PA}` })
  const p = a.load(); await tick(); a.pending[0].resolve(200, DASH(PA, "a@x.test")); await p
  expect(b.keys()).toContain(cacheKey(UID_A, PA))                       // A's cache really is written
  expect(b.store.get(`klav:dash:last:${UID_A}`)).toBe(PA)               // and A's pointer
  a.dashClearClientCache(); b.logoutServer(); b.login(UID_B)            // logout (client cleanup + server clears cookies), B logs in
  const pb = page(b)                                                    // B's page: no ?project=
  const q = pb.load(); await tick()
  expect(pb.rendered).toEqual([])                                       // nothing painted before B's network response
  expect(pb.getState()).toBeNull()
  expect(pb.calls).toEqual(["/api/dashboard"])                          // bare: A's pointer was NOT used
  pb.pending[0].resolve(200, DASH(PB, "b@x.test")); await q
  expect(pb.getState().email).toBe("b@x.test")
  expect(pb.rendered).toEqual([PB])
})

test("A's entries still in localStorage (session expired / logged out elsewhere, no cleanup) → B never paints them; boot purge removes them", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA, "a@x.test")); b.store.set(`klav:dash:last:${UID_A}`, PA)
  b.logoutServer(); b.login(UID_B)                                      // no client cleanup at all
  const pb = page(b, { search: `?project=${PA}` })                      // even a URL that names A's project
  const q = pb.load(); await tick()
  expect(pb.rendered).toEqual([])                                       // A's data never painted
  expect(b.keys().some((k) => k.includes(UID_A))).toBe(false)           // purged at boot
  pb.pending[0].resolve(403, { error: "No access to this project." }); await tick()
  pb.pending[1].resolve(200, DASH(PB, "b@x.test")); await q
  expect(pb.getState().active.id).toBe(PB)
})

test("B has ZERO projects → A's cached state cannot persist (empty authoritative response applies)", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA, "a@x.test")); b.store.set(`klav:dash:last:${UID_A}`, PA)
  b.logoutServer(); b.login(UID_B)
  const pb = page(b)
  const q = pb.load(); await tick()
  expect(pb.getState()).toBeNull()
  pb.pending[0].resolve(200, { ...EMPTY, email: "b@x.test" }); await q
  expect(pb.getState().projects).toEqual([])
  expect(pb.getState().email).toBe("b@x.test")
  expect(JSON.stringify(pb.getState())).not.toContain("a@x.test")
})

test("different users cannot read each other's KNOWN cache keys (key + envelope uid both enforced)", () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA))
  b.logoutServer(); b.login(UID_B)
  const pb = page(b)
  // A's entry was purged at boot; re-plant it exactly under A's key, and ALSO under B's key with A's uid in the envelope
  seedOwn(b, UID_A, PA, DASH(PA))
  b.store.set(cacheKey(UID_B, PA), JSON.stringify({ v: 2, u: UID_A, t: Date.now(), data: DASH(PA, "a@x.test") }))
  expect(pb.swrRead("dash:" + PA)).toBeNull()
  // sanity: B's own correctly-tagged entry IS readable
  pb.swrWrite("dash:" + PB, DASH(PB, "b@x.test"))
  expect(pb.swrRead("dash:" + PB).active.id).toBe(PB)
})

test("envelope uid mismatch is rejected even under the correct key", () => {
  const b = browser(); b.login(UID_A)
  const pa = page(b)
  b.store.set(cacheKey(UID_A, PA), JSON.stringify({ v: 2, u: UID_B, t: Date.now(), data: DASH(PA) }))
  expect(pa.swrRead("dash:" + PA)).toBeNull()
  b.store.set(cacheKey(UID_A, PA), JSON.stringify({ v: 2, t: Date.now(), data: DASH(PA) }))   // no uid in the envelope at all
  expect(pa.swrRead("dash:" + PA)).toBeNull()
})

// ══ 2. fail closed ═════════════════════════════════════════════════════════════════════════════════════════════
test("missing klav_uid fails CLOSED: nothing read, nothing written, everything Klavity-SWR purged at boot", async () => {
  const b = browser()
  seedOwn(b, UID_A, PA, DASH(PA)); b.store.set("klav:swr:v1:dash:" + PA, JSON.stringify({ v: 1, t: Date.now(), data: DASH(PA) }))
  b.store.set("klav:dash:last", PA); b.store.set("unrelated", "keep")
  const pg = page(b, { search: `?project=${PA}` })                        // no klav_uid cookie at all
  expect(pg.swrKey("dash:" + PA)).toBeNull()
  expect(pg.swrRead("dash:" + PA)).toBeNull()
  pg.swrWrite("dash:" + PA, DASH(PA))
  expect(b.keys().filter((k) => k.startsWith("klav:swr:"))).toEqual([])  // swrWrite wrote nothing; boot purged the rest
  expect(b.keys()).not.toContain("klav:dash:last")
  expect(b.store.get("unrelated")).toBe("keep")
  const q = pg.load(); await tick()
  expect(pg.rendered).toEqual([])                                         // no cache paint without an identity
  pg.pending[0].resolve(200, DASH(PA)); await q
  expect(b.keys().filter((k) => k.startsWith("klav:swr:"))).toEqual([])   // …and the apply wrote no cache either
})

// ══ 3. same-user behaviour is preserved ═══════════════════════════════════════════════════════════════════════
test("same user reload: the valid cache still paints IMMEDIATELY (before the network), then the network applies", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA, "a@x.test"))
  const pg = page(b, { search: `?project=${PA}` })
  const q = pg.load(); await tick()
  expect(pg.rendered).toEqual([PA])                                       // painted from cache, network still pending
  expect(pg.confirmed()).toBe(false)                                      // …and that did NOT make the state network-confirmed
  expect(pg.calls).toEqual(["/api/dashboard?project=proj_A"])             // the authoritative request is still issued
  pg.pending[0].resolve(200, DASH(PA, "a@x.test", { tickets: [{ id: "fresh" }] })); await q
  expect(pg.rendered).toEqual([PA, PA])
  expect(pg.getState().tickets[0].id).toBe("fresh")
  expect(pg.confirmed()).toBe(true)
})

test("same user, different project: only that project's cache is used", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA)); seedOwn(b, UID_A, PB, DASH(PB))
  const pg = page(b, { search: `?project=${PB}` })
  const q = pg.load(); await tick()
  expect(pg.rendered).toEqual([PB])
  pg.pending[0].resolve(200, DASH(PB)); await q
  expect(b.keys()).toContain(cacheKey(UID_A, PA))                         // the other project's entry is untouched
})

test("two tabs of the SAME user share the namespace and both stay valid", async () => {
  const b = browser(); b.login(UID_A)
  const t1 = page(b, { search: `?project=${PA}` }); const p1 = t1.load(); await tick(); t1.pending[0].resolve(200, DASH(PA)); await p1
  const t2 = page(b, { search: `?project=${PA}` }); const p2 = t2.load(); await tick()
  expect(t2.rendered).toEqual([PA])                                       // tab 2 paints what tab 1 cached
  t2.pending[0].resolve(200, DASH(PA)); await p2
  expect(t1.swrRead("dash:" + PA)).not.toBeNull()
})

// ══ 4. migration: legacy v1 + unscoped pointer ═════════════════════════════════════════════════════════════════
test("old unscoped v1 entries and the legacy pointer are NEVER rendered, and the boot purge removes them WITHOUT reading them", async () => {
  const b = browser(); b.login(UID_A)
  b.store.set("klav:swr:v1:dash:" + PA, JSON.stringify({ v: 1, t: Date.now(), data: DASH(PA, "legacy@x.test") }))
  b.store.set("klav:swr:v1:triage:" + PA, "{not even json")
  b.store.set("klav:dash:last", PA)
  b.store.set("klav:swr:v2:" + UID_B + ":dash:" + PA, JSON.stringify({ v: 2, u: UID_B, t: Date.now(), data: DASH(PA) }))   // another user's v2 entry
  b.store.set("unrelated", "keep")
  const pg = page(b, { search: "" })                                      // no ?project=: would have resolved via the legacy pointer
  expect(b.keys().filter((k) => k.startsWith("klav:swr:") || k === "klav:dash:last")).toEqual([])
  expect(b.store.get("unrelated")).toBe("keep")
  expect(b.reads.filter((k) => k.startsWith("klav:swr:") || k.startsWith("klav:dash:last"))).toEqual([])   // purged by key NAME only
  const q = pg.load(); await tick()
  expect(pg.rendered).toEqual([])
  expect(pg.calls).toEqual(["/api/dashboard"])                            // legacy pointer ignored
  pg.pending[0].resolve(200, DASH(PB)); await q
})

test("the per-user dashboard pointer cannot cross users", async () => {
  const b = browser(); b.login(UID_A)
  b.store.set(`klav:dash:last:${UID_A}`, PA)
  b.logoutServer(); b.login(UID_B)
  const pb = page(b)
  expect(pb.dashTargetProjId()).toBeNull()
  expect(b.keys()).not.toContain(`klav:dash:last:${UID_A}`)
  // B's own pointer works for B
  b.store.set(`klav:dash:last:${UID_B}`, PB)
  expect(pb.dashTargetProjId()).toBe(PB)
})

// ══ 5. logout cleanup ═════════════════════════════════════════════════════════════════════════════════════════
test("explicit logout removes every Klavity SWR entry (all users/versions) + pointers, and preserves unrelated localStorage", () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA)); seedOwn(b, UID_B, PB, DASH(PB))
  b.store.set("klav:swr:v1:dash:x", "1"); b.store.set("klav:dash:last", PA); b.store.set(`klav:dash:last:${UID_A}`, PA)
  for (const k of ["theme", "klav-plan-intent", "klav:other", "posthog_distinct", "swr-not-ours"]) b.store.set(k, "keep")
  const pg = page(b)
  pg.dashClearClientCache()
  expect(b.keys().sort()).toEqual(["klav-plan-intent", "klav:other", "posthog_distinct", "swr-not-ours", "theme"].sort())
})

test("the dashboard logout handler clears the client cache (and does not call localStorage.clear())", () => {
  const h = HTML.match(/\$\("logout"\)\.onclick = .*/)![0]
  expect(h).toContain("dashClearClientCache()")
  expect(h).toContain("/api/auth/logout")
  expect(h).not.toContain("localStorage.clear")
})

// ══ 6. network-confirmed provenance + KLA-717/KLA-764 ═════════════════════════════════════════════════════════
test("authoritative EMPTY response replaces cache-derived state (provenance: cache paint is not network-confirmed)", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA))
  const pg = page(b, { search: `?project=${PA}` })
  const q = pg.load(); await tick()
  expect(pg.getState().active.id).toBe(PA); expect(pg.confirmed()).toBe(false)
  pg.pending[0].resolve(200, { ...EMPTY }); await q
  expect(pg.getState().projects).toEqual([])                              // the user really has no projects now
})

test("KLA-717/764 still protect NETWORK-CONFIRMED populated state from a racey empty payload (load AND refreshAll)", async () => {
  const b = browser(); b.login(UID_A)
  const pg = page(b, { search: `?project=${PA}` })
  const q = pg.load(); await tick(); pg.pending[0].resolve(200, DASH(PA)); await q
  expect(pg.confirmed()).toBe(true)
  const q2 = pg.load(); await tick(); pg.pending[1].resolve(200, { ...EMPTY }); await q2           // load() re-run (plan change etc.)
  expect(pg.getState().active.id).toBe(PA)
  pg.loc.search = `?project=${PA}`
  const r = pg.refreshAll(); await tick(); pg.pending[2].resolve(200, { ...EMPTY }); await r         // background/mutation refresh
  expect(pg.getState().active.id).toBe(PA)
})

test("refreshAll(): an authoritative EMPTY response also replaces cache-derived (unconfirmed) state", async () => {
  const b = browser(); b.login(UID_A)
  const pg = page(b, { search: `?project=${PA}`, state: DASH(PA) })     // state as painted from the cache: NOT network-confirmed
  expect(pg.confirmed()).toBe(false)
  const r = pg.refreshAll(); await tick(); pg.pending[0].resolve(200, { ...EMPTY }); await r
  expect(pg.getState().projects).toEqual([])
  expect(pg.confirmed()).toBe(true)
})

test("the boot purge is a top-level statement that runs BEFORE the first cache read (source order)", () => {
  const purgeCall = HTML.search(/^swrBootPurge\(\)\s*$/m)
  expect(purgeCall).toBeGreaterThan(-1)
  expect(purgeCall).toBeGreaterThan(HTML.indexOf("function swrBootPurge("))
  expect(purgeCall).toBeLessThan(HTML.indexOf("async function load("))
  expect(purgeCall).toBeLessThan(HTML.indexOf("swrRead(dashCacheKey(dashTargetProjId()))"))
  expect(purgeCall).toBeLessThan(HTML.indexOf("const DASH_LAST_KEY ="))
})

// ══ 7. 403 / revoked access ═══════════════════════════════════════════════════════════════════════════════════
test("load(): explicit project 403 → denied project's cache + pointer + klav_proj cleared, ?project= stripped, bare fallback resolves ANOTHER project", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA)); b.store.set(`klav:dash:last:${UID_A}`, PA)
  const pg = page(b, { search: `?project=${PA}` })
  const q = pg.load(); await tick()
  expect(pg.rendered).toEqual([PA])                                       // cache-derived paint of the (now revoked) project
  pg.pending[0].resolve(403, { error: "No access to this project." }); await tick()
  expect(b.keys()).not.toContain(cacheKey(UID_A, PA))                     // denied project's cache invalidated
  expect(b.store.has(`klav:dash:last:${UID_A}`)).toBe(false)              // pointer cleared
  expect(b.jar.has("klav_proj")).toBe(false)                              // stale klav_proj cookie cleared (would 403 the bare retry)
  expect(b.jar.get("klav_uid")).toBe(UID_A)                               // …without touching the identity cookie
  expect(pg.loc.search).toBe("")                                          // invalid ?project= stripped
  expect(pg.calls[1]).toBe("/api/dashboard")                              // existing bare fallback
  pg.pending[1].resolve(200, DASH(PB)); await q
  expect(pg.getState().active.id).toBe(PB)
  expect(b.keys()).toContain(cacheKey(UID_A, PB))                         // the fallback project is cached
})

test("load(): a NON-403 error payload does not invalidate the cache or clear klav_proj (only the pointer, as before)", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA)); b.store.set(`klav:dash:last:${UID_A}`, PA)
  const pg = page(b, { search: `?project=${PA}` })
  const q = pg.load(); await tick()
  pg.pending[0].resolve(500, { error: "boom" }); await tick()
  expect(b.keys()).toContain(cacheKey(UID_A, PA))
  expect(b.jar.has("klav_proj")).toBe(true)
  expect(b.store.has(`klav:dash:last:${UID_A}`)).toBe(false)
  pg.pending[1].resolve(200, DASH(PB)); await q
})

test("load(): 403 then a ZERO-project fallback → the denied project's cache-derived state is NOT retained", async () => {
  const b = browser(); b.login(UID_A)
  seedOwn(b, UID_A, PA, DASH(PA))
  const pg = page(b, { search: `?project=${PA}` })
  const q = pg.load(); await tick()
  expect(pg.getState().active.id).toBe(PA)
  pg.pending[0].resolve(403, { error: "No access to this project." }); await tick()
  pg.pending[1].resolve(200, { ...EMPTY }); await q
  expect(pg.getState().projects).toEqual([]); expect(pg.getState().active).toBeNull()
  expect(b.keys().filter((k) => k.includes(":dash:"))).toEqual([])
})

test("refreshAll(): authoritative 403 for the CURRENT project → cache/pointer/klav_proj dropped and a one-shot location.replace('/dashboard')", async () => {
  const b = browser(); b.login(UID_A)
  const pg = page(b, { search: `?project=${PA}`, state: DASH(PA) })
  seedOwn(b, UID_A, PA, DASH(PA)); b.store.set(`klav:dash:last:${UID_A}`, PA)
  const r = pg.refreshAll(); await tick()
  pg.pending[0].resolve(403, { error: "No access to this project." }); await r
  expect(pg.loc.replaced).toEqual(["/dashboard"])
  expect(b.keys()).not.toContain(cacheKey(UID_A, PA))
  expect(b.store.has(`klav:dash:last:${UID_A}`)).toBe(false)
  expect(b.jar.has("klav_proj")).toBe(false)
  expect(pg.getState().active.id).toBe(PA)                                // (the reload replaces the page; no payload was applied)
  // one-shot: a second 403 in the same tab session does NOT reset again (no reload loop)…
  const r2 = pg.refreshAll(); await tick(); pg.pending[1].resolve(403, { error: "No access" }); await r2
  expect(pg.loc.replaced).toEqual(["/dashboard"])
  // …and a successful network apply re-arms it
  const r3 = pg.refreshAll(); await tick(); pg.pending[2].resolve(200, DASH(PA)); await r3
  expect(b.session.has("klav:dash:reset")).toBe(false)
})

test("refreshAll(): a 403 for a project that is no longer the target does NOT reset", async () => {
  const b = browser(); b.login(UID_A)
  const pg = page(b, { search: `?project=${PA}`, state: DASH(PB) })
  const r = pg.refreshAll(); await tick()
  pg.loc.search = `?project=${PB}`
  pg.pending[0].resolve(403, { error: "No access" }); await r
  expect(pg.loc.replaced).toEqual([])
})

// ══ 8. session continuity: user changes while a request is in flight ═══════════════════════════════════════════
test("refreshAll(): uid changes in flight → response discarded, NO cache write (either namespace), reload initiated", async () => {
  const b = browser(); b.login(UID_A)
  const pg = page(b, { search: `?project=${PA}`, state: DASH(PA, "a@x.test") })
  const before = b.keys().slice()
  const r = pg.refreshAll(); await tick()
  b.login(UID_B)                                                          // another tab signed in as B
  pg.pending[0].resolve(200, DASH(PA, "b@x.test", { tickets: [{ id: "B-data" }] })); await r
  expect(pg.getState().email).toBe("a@x.test")                            // not applied
  expect(pg.rendered).toEqual([])                                         // not rendered
  expect(b.keys()).toEqual(before)                                        // nothing written into A's OR B's namespace
  expect(pg.loc.reloaded).toBe(1)                                         // clean re-init
  expect(pg.confirmed()).toBe(false)
})

test("a mutation-triggered refresh (no isPoll) and a background poll are both covered by the continuity guard", async () => {
  for (const poll of [true, false]) {
    const b = browser(); b.login(UID_A)
    const pg = page(b, { search: `?project=${PA}`, state: DASH(PA) })
    const r = pg.refreshAll(poll || undefined); await tick()
    b.logoutServer()                                                      // cookie vanished (logged out elsewhere)
    pg.pending[0].resolve(200, DASH(PA)); await r
    expect(pg.loc.reloaded).toBe(1)
    expect(b.keys().filter((k) => k.startsWith("klav:swr:"))).toEqual([])
  }
})

test("load(): uid changes in flight (incl. across a retry and the bare fallback) → discarded, no cache write, reload", async () => {
  const b = browser(); b.login(UID_A)
  const pg = page(b, { search: `?project=${PA}` })
  const q = pg.load(); await tick()
  pg.pending[0].resolve(403, { error: "No access" }); await tick()        // → bare fallback in flight
  b.login(UID_B)                                                          // session switches to B meanwhile
  pg.pending[1].resolve(200, DASH(PB, "b@x.test")); await q
  expect(pg.getState()).toBeNull()                                        // not applied
  expect(pg.rendered).toEqual([])
  expect(b.keys().filter((k) => k.startsWith("klav:swr:"))).toEqual([])   // no write under A's namespace (the tab's) or B's
  expect(pg.loc.reloaded).toBe(1)
})

test("a tab whose identity changed fails closed for ALL SWR consumers (reads and writes), not just the dashboard", () => {
  const b = browser(); b.login(UID_A)
  const pg = page(b)
  pg.swrWrite("triage:" + PA, { triage: [1] })
  expect(pg.swrRead("triage:" + PA)).not.toBeNull()
  b.login(UID_B)                                                          // browser-wide session is now B
  expect(pg.swrRead("triage:" + PA)).toBeNull()                           // A's tab can't read A's (or B's) cache any more
  pg.swrWrite("tickets:" + PA, [1])
  expect(b.keys().some((k) => k.includes(":tickets:"))).toBe(false)       // …nor write
})

// ══ 9. every SWR consumer is isolated centrally ═══════════════════════════════════════════════════════════════
test("all SWR consumers go through the central helpers (no direct klav:swr localStorage access outside them)", () => {
  const outside = HTML.split("\n").filter((l) => /localStorage\.(getItem|setItem|removeItem)\(\s*["'`]klav:swr/.test(l))
  expect(outside).toEqual([])
  const consumers = ["triage:", "tickets:", "tktlist:", "sim-matches:", "trails-dash:", "expectations:"]
  for (const c of consumers) expect(HTML).toContain(c)
  expect(SRC).toContain('const SWR_V = 2')
})
