// KLA-564 — receiving-side dogfood runner (Klavity-on-Klavity).
//
// Companion to dogfood-autosim.ts (which covers only the REPORTING funnel). This runner exercises the
// RECEIVING surface end-to-end:
//
//   AUTH   → establish a logged-in session on Klavity's OWN dashboard. Auth ladder is picked by the
//            pure selectReceivingAuthMethod() (see oracle module): mint_link (GET /test-login?token=,
//            CI-preferred) or the fixed_otp bypass (666666, gated by KLAV_TEST_OTP). Both are HTTP-only
//            here so the primary flow runs headless in CI; the browser VIEW check is layered on top.
//   SUBMIT → POST /api/feedback with a uniquely-marked seeded Snap (the widget submit path).
//   ASSERT → poll GET /api/projects/:id/triage (primary oracle, newest-first) and evaluate present +
//            at-top + right-bucket via evaluateReceivingOracle(). Optionally drive the /dashboard triage
//            VIEW in a browser as a second check when a CDP browser is available.
//
// Runnable two ways (mirrors dogfood-autosim.ts):
//   • ONE-SHOT:   bun run lib/dogfood-receiving.ts        (import.meta.main guard at the bottom)
//   • SCHEDULED:  call runReceivingDogfood() from a cron/scheduler tick, or crystallize the returned
//                 view-trail spec with a schedule_cron so trails-scheduler fires it every N minutes.
//
// Everything IO lives here; the decision logic (auth pick + oracle) is in dogfood-receiving-oracle.ts
// and is unit-tested. `fetchImpl`/`log` are injectable so the runner itself is testable against a
// spawned server without touching globals.

import {
  selectReceivingAuthMethod,
  evaluateReceivingOracle,
  buildSeededSnap,
  type AuthPlan,
  type ReceivingOracleResult,
  type ReceivingExpectation,
  type SeededSnap,
  type TriageRowLike,
} from "./dogfood-receiving-oracle"

const TEST_OTP_CODE = "666666"

export interface ReceivingRunOptions {
  /** Base origin of the target Klavity instance, e.g. https://klavity.in or a spawned test server. */
  base: string
  /** Project whose triage inbox we assert against. Auto-discovered from the OTP verify flow if omitted. */
  projectId?: string
  /** If already authenticated (e.g. a caller who established the session), pass the session cookie header. */
  sessionCookie?: string
  /** Email for the fixed_otp verify flow. Defaults to the device test email. */
  email?: string
  /** mint_link secret (opaque token or same-origin /test-login path) when using the mint_link ladder. */
  mintSecret?: string
  /** Whether the target server has the fixed test-OTP bypass on. Drives auth selection. */
  testOtpActive?: boolean
  /** The project's registered AutoSim auth method, if known (drives auth selection). */
  configuredMethod?: "mint_link" | "fixed_otp" | null
  /** Bucket expectations for the seeded Snap (optional — omit to only assert present + at-top). */
  expectedPriority?: string | null
  expectedLabel?: string | null
  /** Which oracle endpoint to poll. Default "triage" (the New-reports queue). */
  oracleEndpoint?: "triage" | "tickets"
  /**
   * Snap-routing to force on the project before submitting (admin-only). The DEFAULT project routes human
   * Snaps 'autofile' → they advance straight to 'open' (the Tickets board), bypassing the New-reports
   * triage queue. To exercise the TRIAGE inbox the runner sets 'review' so the Snap stays 'new'. When
   * asserting against /tickets instead, pass "autofile" (or set skipRouting). null = leave unchanged.
   */
  setRouting?: "review" | "autofile" | null
  /**
   * Opt-in to run against a NON-test base (a real/prod-looking origin like https://klavity.in). Default
   * false: runReceivingDogfood() REFUSES such a base up-front so a stray scheduled/one-shot run can't flip
   * a real workspace's snap-routing or seed a report into a live inbox. Set true only when you knowingly
   * want to dogfood a real instance (one-shot maps this from RECEIVING_ALLOW_PROD=1).
   */
  allowProdBase?: boolean
  pollTimeoutMs?: number
  pollIntervalMs?: number
  fetchImpl?: typeof fetch
  log?: (msg: string) => void
}

export interface ReceivingRunResult {
  authPlan: AuthPlan
  projectId: string
  seed: SeededSnap
  feedbackId: string
  oracle: ReceivingOracleResult
  rowsSeen: number
  verdict: "pass" | "fail"
  durationMs: number
}

/** Resolve which auth ladder to use given the run options (delegates to the pure selector). */
export function planReceivingAuth(opts: ReceivingRunOptions): AuthPlan {
  return selectReceivingAuthMethod({
    configuredMethod: opts.configuredMethod ?? (opts.mintSecret ? "mint_link" : opts.testOtpActive ? "fixed_otp" : null),
    testOtpActive: !!opts.testOtpActive,
  })
}

/**
 * Is this base a safe (non-prod) target — i.e. localhost/loopback, a *.local/*.internal host, or an
 * obviously-test/staging origin? Only these may be dogfooded WITHOUT the explicit prod opt-in. Anything
 * else (e.g. https://klavity.in) is treated as a real workspace and refused unless allowProdBase is set.
 * Pure + exported so the guard is unit-testable.
 */
export function isNonProdBase(base: string): boolean {
  let host: string
  try {
    host = new URL(base).hostname.toLowerCase()
  } catch {
    return false // unparseable → treat as prod (refuse) to fail safe
  }
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") return true
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".test")) return true
  // Common test/staging markers anywhere in the host label.
  if (/(^|[.-])(staging|stage|dev|test|preview|localhost)([.-]|$)/.test(host)) return true
  return false
}

/**
 * Refuse to run against a real workspace by default. Throws a loud, actionable error when `base` looks
 * like a live origin and the caller has not explicitly opted in (allowProdBase / RECEIVING_ALLOW_PROD=1).
 * This is the prod-safety wall: it must run BEFORE any auth/submit/routing IO.
 */
export function assertReceivingBaseAllowed(opts: ReceivingRunOptions): void {
  if (opts.allowProdBase) return
  if (isNonProdBase(opts.base)) return
  throw new Error(
    `[receiving-dogfood] REFUSING to run against non-test base ${opts.base}: this would flip the real ` +
      `workspace's snap-routing and seed a report into a live inbox. Point RECEIVING_BASE at a ` +
      `localhost/staging instance, or set allowProdBase (RECEIVING_ALLOW_PROD=1) to override intentionally.`,
  )
}

/** Read the project's current human-Snap routing over HTTP (GET /snap-routing). Returns null on failure. */
export async function getSnapRoutingMode(
  opts: ReceivingRunOptions,
  cookie: string,
  projectId: string,
): Promise<"review" | "autofile" | null> {
  const f = opts.fetchImpl ?? fetch
  const r = await f(`${opts.base}/api/projects/${encodeURIComponent(projectId)}/snap-routing`, {
    headers: { Cookie: cookie },
  }).catch(() => null)
  if (!r || r.status !== 200) return null
  const body: any = await r.json().catch(() => ({}))
  const mode = body?.snapRouting
  return mode === "review" || mode === "autofile" ? mode : null
}

/** Extract the klav_session cookie header from a Set-Cookie response header. */
function sessionCookieFrom(setCookie: string | null): string | null {
  if (!setCookie) return null
  const m = /klav_session=([^;]+)/.exec(setCookie)
  return m ? `klav_session=${m[1]}` : null
}

/**
 * Establish a session on Klavity's OWN dashboard over HTTP. Returns the cookie + (for the OTP flow) the
 * auto-created default projectId. mint_link hits GET /test-login?token=; fixed_otp does the
 * request→verify OTP bypass. Throws with a legible message on failure so the run FAILS loud, not hangs.
 */
export async function establishReceivingSession(
  opts: ReceivingRunOptions,
  plan: AuthPlan,
): Promise<{ cookie: string; projectId?: string }> {
  const f = opts.fetchImpl ?? fetch
  if (opts.sessionCookie) return { cookie: opts.sessionCookie }

  if (plan.method === "mint_link") {
    if (!opts.mintSecret) throw new Error("mint_link selected but no mintSecret provided")
    const s = opts.mintSecret.trim()
    if (/^https?:\/\//i.test(s)) throw new Error("mintSecret must be a token or same-origin /test-login path, not an absolute URL")
    const url = s.startsWith("/")
      ? new URL(s, opts.base)
      : new URL(`/test-login?token=${encodeURIComponent(s)}`, opts.base)
    const r = await f(url.toString(), { redirect: "manual" })
    const cookie = sessionCookieFrom(r.headers.get("set-cookie"))
    if (!cookie) throw new Error(`mint_link did not set a session cookie (status ${r.status})`)
    return { cookie }
  }

  if (plan.method === "fixed_otp") {
    const email = opts.email ?? "vishal@quantana.com.au"
    const reqR = await f(`${opts.base}/api/auth/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (reqR.status !== 200) throw new Error(`/api/auth/request failed (status ${reqR.status})`)
    const verifyR = await f(`${opts.base}/api/auth/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code: TEST_OTP_CODE }),
    })
    if (verifyR.status !== 200) throw new Error(`/api/auth/verify failed (status ${verifyR.status}) — is KLAV_TEST_OTP on?`)
    const body: any = await verifyR.json().catch(() => ({}))
    const cookie = sessionCookieFrom(verifyR.headers.get("set-cookie")) ?? (body.token ? `klav_session=${body.token}` : null)
    if (!cookie) throw new Error("verify succeeded but no session cookie was returned")
    return { cookie, projectId: typeof body.projectId === "string" ? body.projectId : undefined }
  }

  throw new Error(`no usable auth method: ${plan.reason}`)
}

/**
 * Force the project's human-Snap routing (admin-only). Best-effort: on a non-admin session or an error
 * this returns false and the caller proceeds (the oracle then reports the real surface). Needed because
 * the default 'autofile' routing sends trusted Snaps straight to 'open', bypassing the triage queue.
 */
export async function setSnapRoutingMode(
  opts: ReceivingRunOptions,
  cookie: string,
  projectId: string,
  mode: "review" | "autofile",
): Promise<boolean> {
  const f = opts.fetchImpl ?? fetch
  const r = await f(`${opts.base}/api/projects/${encodeURIComponent(projectId)}/snap-routing`, {
    method: "POST",
    headers: { "content-type": "application/json", Cookie: cookie },
    body: JSON.stringify({ snapRouting: mode }),
  }).catch(() => null)
  return !!r && r.status === 200
}

/** Submit the seeded Snap via the widget POST /api/feedback path (authed, non-browser). Returns its id. */
export async function submitSeededSnap(
  opts: ReceivingRunOptions,
  cookie: string,
  projectId: string,
  seed: SeededSnap,
): Promise<string> {
  const f = opts.fetchImpl ?? fetch
  const fd = new FormData()
  fd.set("description", seed.description)
  fd.set("title", seed.title)
  fd.set("type", seed.type)
  fd.set("page_url", seed.pageUrl)
  fd.set("project_id", projectId)
  fd.set("reporter_email", opts.email ?? "vishal@quantana.com.au")
  const r = await f(`${opts.base}/api/feedback`, { method: "POST", headers: { Cookie: cookie }, body: fd })
  if (r.status !== 200) throw new Error(`POST /api/feedback failed (status ${r.status})`)
  const body: any = await r.json().catch(() => ({}))
  if (!body.saved || !body.id) throw new Error(`POST /api/feedback did not persist (body: ${JSON.stringify(body)})`)
  return String(body.id)
}

/** Fetch the oracle rows (triage newest-first, or tickets). Normalizes to TriageRowLike for the oracle. */
export async function fetchOracleRows(
  opts: ReceivingRunOptions,
  cookie: string,
  projectId: string,
): Promise<TriageRowLike[]> {
  const f = opts.fetchImpl ?? fetch
  const endpoint = opts.oracleEndpoint ?? "triage"
  const r = await f(`${opts.base}/api/projects/${encodeURIComponent(projectId)}/${endpoint}`, {
    headers: { Cookie: cookie },
  })
  if (r.status !== 200) throw new Error(`GET /${endpoint} failed (status ${r.status})`)
  const body: any = await r.json().catch(() => ({}))
  const rows: any[] = endpoint === "triage" ? body.triage : body.tickets
  if (!Array.isArray(rows)) throw new Error(`/${endpoint} did not return an array`)
  return rows.map((x) => ({ id: String(x.id), priority: x.priority ?? null, labels: Array.isArray(x.labels) ? x.labels : null }))
}

/**
 * Full receiving-side dogfood: auth → submit → poll-assert. Returns a structured result; never throws for
 * an oracle FAIL (that is a legitimate finding). Throws only on setup/IO failures (auth, submit, endpoint).
 */
export async function runReceivingDogfood(opts: ReceivingRunOptions): Promise<ReceivingRunResult> {
  const log = opts.log ?? (() => {})
  const t0 = Date.now()

  // PROD-SAFETY WALL (must be first): refuse a real/live base unless explicitly opted in. Prevents a stray
  // scheduled/one-shot run from flipping a real workspace's snap-routing or seeding a live inbox.
  assertReceivingBaseAllowed(opts)

  const plan = planReceivingAuth(opts)
  log(`[receiving-dogfood] auth plan: ${plan.method} — ${plan.reason}`)

  const { cookie, projectId: discovered } = await establishReceivingSession(opts, plan)
  const projectId = opts.projectId ?? discovered
  if (!projectId) throw new Error("no projectId (pass one, or use the OTP flow which auto-creates a default project)")
  log(`[receiving-dogfood] authenticated; project=${projectId}`)

  // Route control: for the triage oracle, ensure 'review' so the Snap is triage-gated (stays 'new').
  // Default 'autofile' would advance it straight to 'open' (the Tickets board), so the triage inbox
  // would look (wrongly) empty. Explicit setRouting wins; otherwise infer from the oracle endpoint.
  const endpoint = opts.oracleEndpoint ?? "triage"
  const routing = opts.setRouting !== undefined ? opts.setRouting : endpoint === "triage" ? "review" : null

  // Read the ORIGINAL routing BEFORE flipping so we can restore it in the finally below. A dogfood run
  // must never leave prod routing changed — otherwise every subsequent HUMAN Snap silently changes bucket.
  let originalRouting: "review" | "autofile" | null = null
  let flipped = false
  if (routing) {
    originalRouting = await getSnapRoutingMode(opts, cookie, projectId)
    const ok = await setSnapRoutingMode(opts, cookie, projectId, routing)
    flipped = ok && originalRouting !== null && originalRouting !== routing
    log(`[receiving-dogfood] snap-routing ${originalRouting ?? "?"} → ${routing} (${ok ? "set" : "unchanged — non-admin/best-effort"})`)
  }

  try {
    const seed = buildSeededSnap()
    const feedbackId = await submitSeededSnap(opts, cookie, projectId, seed)
    log(`[receiving-dogfood] submitted seeded Snap ${seed.marker} → ${feedbackId}`)

    const expected: ReceivingExpectation = {
      feedbackId,
      expectedPriority: opts.expectedPriority ?? null,
      expectedLabel: opts.expectedLabel ?? null,
    }

    // Poll the oracle endpoint until the report appears (async enrichment/label-suggest can lag a beat).
    const timeout = opts.pollTimeoutMs ?? 10_000
    const interval = opts.pollIntervalMs ?? 500
    const deadline = Date.now() + timeout
    let rows: TriageRowLike[] = []
    let oracle: ReceivingOracleResult
    for (;;) {
      rows = await fetchOracleRows(opts, cookie, projectId)
      oracle = evaluateReceivingOracle(rows, expected)
      if (oracle.pass || Date.now() >= deadline) break
      await new Promise((r) => setTimeout(r, interval))
    }

    const verdict: "pass" | "fail" = oracle.pass ? "pass" : "fail"
    log(`[receiving-dogfood] verdict=${verdict.toUpperCase()} (${rows.length} rows)`)
    for (const fail of oracle.failures) log(`  ✗ ${fail}`)

    return { authPlan: plan, projectId, seed, feedbackId, oracle, rowsSeen: rows.length, verdict, durationMs: Date.now() - t0 }
  } finally {
    // RESTORE original routing even on error/throw mid-run. Only restore what it actually was, and only if
    // WE flipped it to a different value (a best-effort no-op set left it unchanged → nothing to undo).
    if (flipped && originalRouting) {
      const ok = await setSnapRoutingMode(opts, cookie, projectId, originalRouting).catch(() => false)
      log(`[receiving-dogfood] snap-routing restored → ${originalRouting} (${ok ? "ok" : "FAILED — check manually"})`)
    }
  }
}

// ── One-shot entrypoint (bun run lib/dogfood-receiving.ts) ────────────────────
// Mirrors dogfood-autosim.ts's "run against a target" shape. Env:
//   RECEIVING_BASE        target origin (default https://klavity.in)
//   RECEIVING_PROJECT     project id to assert against (required unless the OTP flow auto-creates one)
//   RECEIVING_MINT_SECRET mint_link token/path (mint_link ladder)
//   KLAV_TEST_OTP=1       enable the fixed_otp ladder (test email 666666)
//   RECEIVING_EMAIL       override the test email
//   RECEIVING_ALLOW_PROD=1 opt-in to run against a non-test base (default REFUSES a real/live origin)
if ((import.meta as any).main) {
  // Default base is intentionally left UNSET (not a hard-coded prod URL) so a bare `bun run` refuses
  // instead of silently hitting klavity.in. Point RECEIVING_BASE at a localhost/staging instance.
  const base = process.env.RECEIVING_BASE || "http://localhost:3000"
  const result = await runReceivingDogfood({
    base,
    projectId: process.env.RECEIVING_PROJECT || undefined,
    mintSecret: process.env.RECEIVING_MINT_SECRET || undefined,
    email: process.env.RECEIVING_EMAIL || undefined,
    testOtpActive: process.env.KLAV_TEST_OTP === "1",
    configuredMethod: process.env.RECEIVING_MINT_SECRET ? "mint_link" : process.env.KLAV_TEST_OTP === "1" ? "fixed_otp" : null,
    allowProdBase: process.env.RECEIVING_ALLOW_PROD === "1",
    log: (m) => console.log(m),
  })
  console.log("\n═══════════════════════════════════════════════════════")
  console.log("RECEIVING-SIDE DOGFOOD SUMMARY")
  console.log("═══════════════════════════════════════════════════════")
  console.log(`Auth:      ${result.authPlan.method}`)
  console.log(`Project:   ${result.projectId}`)
  console.log(`Snap:      ${result.seed.marker} → ${result.feedbackId}`)
  console.log(`Oracle:    present=${result.oracle.checks.present.pass} atTop=${result.oracle.checks.atTop.pass} bucket=${result.oracle.checks.bucket.pass}`)
  console.log(`Verdict:   ${result.verdict.toUpperCase()} in ${result.durationMs}ms`)
  console.log("═══════════════════════════════════════════════════════")
  process.exit(result.verdict === "pass" ? 0 : 1)
}
