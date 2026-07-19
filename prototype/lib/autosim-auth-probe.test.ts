import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

process.env.KLAV_SECRET = Buffer.from(new Uint8Array(32).fill(83)).toString("base64")
const file = join(tmpdir(), `klav-autosim-auth-probe-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import {
  applySchema,
  createAutosimAuthSetupToken,
  db,
  getAutosimAuthProbe,
  reconnectDb,
  registerAutosimAuthConfig,
} from "./db"
import {
  autoResumeNeedsAuthSessions,
  createAuthorSession,
  getAuthorSession,
  listNeedsAuthSessionsForAutoResume,
  NEEDS_AUTH_RESUME_TTL_MS,
  updateAuthorSession,
  type AuthorCheckpoint,
} from "./trails-author"
import { redactedAutosimAuthConfig, runAutosimAuthProbe, defaultAutosimAuthVerifier, type AutosimAuthProbeConfig, type ProbeBrowserFactory } from "./autosim-auth-probe"
import { mintAutosimAuthLinkToken } from "./autosim-auth-exec"
import type { BrowserHandle, BrowserPage } from "./trails-browser-page"

const ACCOUNT = "acct_autosim_probe"
const PROJECT_GREEN = "proj_autosim_probe_green"
const PROJECT_RED = "proj_autosim_probe_red"
const PROJECT_RESUME = "proj_autosim_probe_resume"
const PROJECT_HONEST = "proj_autosim_probe_honest"
const OWNER = "vishal@quantana.com.au"
const FIXTURE_URL = "https://example.com/login"

// ── Fake browser infrastructure for hermetic mint_link drive tests ────────────────────────────────

/**
 * Minimal fake BrowserPage that simulates the drive navigation outcome.
 *
 * @param landedUrl   The URL the page "redirected to" after the mint navigation (simulates post-login redirect).
 * @param showAuthGate If true the krefSnapshot returns a login-wall string, triggering drive-failed.
 */
function makeFakePage(landedUrl: string, showAuthGate: boolean): BrowserPage {
  let currentUrl = "https://example.com/before"
  return {
    url: () => currentUrl,
    goto: async (u: string) => { currentUrl = landedUrl },
    waitMs: async () => {},
    krefSnapshot: async () => showAuthGate ? 'button "Sign in" [ref=e1]' : 'button "Dashboard" [ref=e1]',
    screenshotJpeg: async () => "",
    count: async () => 0,
    fingerprint: async () => ({ domPath: "" }),
    stableSelector: async () => null,
    click: async () => {},
    fill: async () => {},
    selectOption: async () => {},
    hover: async () => {},
    keyPress: async () => {},
    clearField: async () => {},
    assertVisible: async () => {},
    assertTextEquals: async () => {},
    assertTextContains: async () => {},
    assertUrlMatches: async () => {},
    assertElementCount: async () => {},
    interceptNetwork: async () => {},
  }
}

/** Fake BrowserHandle wrapping a FakeBrowserPage. Tracks whether close() was called. */
function makeFakeHandle(landedUrl: string, showAuthGate: boolean): BrowserHandle & { closed: boolean } {
  const handle = {
    kind: "fake",
    closed: false,
    newPage: async () => makeFakePage(landedUrl, showAuthGate),
    close: async () => { handle.closed = true },
  }
  return handle
}

const checkpoint: AuthorCheckpoint = {
  traj: [{ action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "h" }],
  history: ["navigate login"],
  stepIdx: 1,
  llmCalls: 1,
  costUsd: 0.01,
  lastUrl: FIXTURE_URL,
}

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [ACCOUNT, "Probe", OWNER, now] })
  for (const projectId of [PROJECT_GREEN, PROJECT_RED, PROJECT_RESUME, PROJECT_HONEST]) {
    await c.execute({ sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [projectId, ACCOUNT, "Probe Project", "active", "auto", 200, "named", now, now] })
  }
})

async function register(projectId: string, method: "fixed_otp" | "mint_link", secret: string) {
  const token = await createAutosimAuthSetupToken(projectId, OWNER)
  const registered = await registerAutosimAuthConfig(projectId, token.id, { method, email: OWNER, secret, notes: "probe" })
  expect(registered).not.toBeNull()
  return registered!.probeId
}

test("green auth probe marks the project verified, redacts secret payloads, and resumes needs_auth sessions", async () => {
  const needsAuthId = await createAuthorSession(PROJECT_GREEN, { name: "Resume me", objective: "sign in", baseUrl: FIXTURE_URL, createdBy: OWNER })
  await updateAuthorSession(PROJECT_GREEN, needsAuthId, { status: "needs_auth", checkpoint, stallReason: "login wall" })
  const probeId = await register(PROJECT_GREEN, "fixed_otp", "123456")

  const resumed: string[] = []
  const result = await runAutosimAuthProbe(probeId, {
    verifier: async (config) => {
      expect(config.secret).toBe("123456")
      expect(JSON.stringify(redactedAutosimAuthConfig(config))).not.toContain("123456")
      return { ok: true }
    },
    resume: async (projectId) => {
      resumed.push(projectId)
      return { eligible: 1, resumed: [{ fromSessionId: needsAuthId, sessionId: "auth_resumed" }], skipped: [], errors: [] }
    },
  })

  expect(result.ok).toBe(true)
  expect(resumed).toEqual([PROJECT_GREEN])
  const project = await db!.execute({ sql: "SELECT autosim_auth_status FROM projects WHERE id=?", args: [PROJECT_GREEN] })
  expect((project.rows[0] as any).autosim_auth_status).toBe("verified")
  const probe = await getAutosimAuthProbe(probeId)
  expect(probe?.status).toBe("green")
  expect(probe?.resumeSummary).toMatchObject({ eligible: 1 })
})

test("fixed_otp DEFAULT verifier is honest: green probe but project stays 'registered' (no false verified)", async () => {
  // criticalpath1 regression: the default fixed_otp probe only format-checks the secret (it cannot
  // drive an arbitrary login UI), so it must NOT promote the project to 'verified' — the first
  // live walk previously died at the OTP wall right after the UI said verified.
  const probeId = await register(PROJECT_HONEST, "fixed_otp", "666666")
  const result = await runAutosimAuthProbe(probeId, {
    resume: async () => ({ eligible: 0, resumed: [], skipped: [], errors: [] }),
  })
  expect(result.ok).toBe(true)
  expect(result.unverifiedLogin).toBe(true)
  const project = await db!.execute({ sql: "SELECT autosim_auth_status FROM projects WHERE id=?", args: [PROJECT_HONEST] })
  expect((project.rows[0] as any).autosim_auth_status).toBe("registered")
  const probe = await getAutosimAuthProbe(probeId)
  expect(probe?.status).toBe("green")
  expect(probe?.error || "").toContain("verifies on the first successful walk")
})

test("red auth probe stores a redacted failure and does not auto-resume", async () => {
  const probeId = await register(PROJECT_RED, "fixed_otp", "SECRET-FAIL")
  let resumed = false
  const result = await runAutosimAuthProbe(probeId, {
    verifier: async (config) => ({ ok: false, error: `bad code ${config.secret}` }),
    resume: async () => {
      resumed = true
      return { eligible: 0, resumed: [], skipped: [], errors: [] }
    },
  })

  expect(result.ok).toBe(false)
  expect(resumed).toBe(false)
  const probe = await getAutosimAuthProbe(probeId)
  expect(probe?.status).toBe("red")
  expect(probe?.error).toContain("[REDACTED]")
  expect(probe?.error).not.toContain("SECRET-FAIL")
  const project = await db!.execute({ sql: "SELECT autosim_auth_status FROM projects WHERE id=?", args: [PROJECT_RED] })
  expect((project.rows[0] as any).autosim_auth_status).toBe("registered")
})

test("mint_link auth probe validates signed token expiry without consuming replay state", async () => {
  const okProject = "proj_autosim_probe_mint_ok"
  const badProject = "proj_autosim_probe_mint_bad"
  const now = Date.now()
  await db!.execute({ sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, site_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [okProject, ACCOUNT, "Mint OK", "active", "auto", 200, "named", "https://app.example.com", now, now] })
  await db!.execute({ sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, site_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [badProject, ACCOUNT, "Mint Bad", "active", "auto", 200, "named", "https://app.example.com", now, now] })

  // Inject a browser factory that simulates a successful authenticated drive so the test remains
  // hermetic (no real browser required). The intent of THIS test is format/signature validation;
  // the browser-drive behavior is covered by the dedicated injectable-factory tests below.
  const successFactory: ProbeBrowserFactory = async () => makeFakeHandle("https://app.example.com/dashboard", false)

  const goodProbe = await register(okProject, "mint_link", await mintAutosimAuthLinkToken(okProject))
  const good = await runAutosimAuthProbe(goodProbe, {
    browserFactory: successFactory,
    resume: async () => ({ eligible: 0, resumed: [], skipped: [], errors: [] }),
  })
  expect(good.ok).toBe(true)

  const expiredProbe = await register(badProject, "mint_link", await mintAutosimAuthLinkToken(badProject, -1))
  const expired = await runAutosimAuthProbe(expiredProbe, {
    browserFactory: successFactory,
    resume: async () => { throw new Error("should not resume") },
  })
  expect(expired.ok).toBe(false)
  expect(expired.error).toMatch(/expired/)
})

test("auto-resume only adopts recent needs_auth checkpoints once", async () => {
  const now = Date.now()
  const recent = await createAuthorSession(PROJECT_RESUME, { name: "Recent", objective: "continue", baseUrl: FIXTURE_URL })
  await updateAuthorSession(PROJECT_RESUME, recent, { status: "needs_auth", checkpoint })

  const stale = await createAuthorSession(PROJECT_RESUME, { name: "Stale", objective: "continue", baseUrl: FIXTURE_URL })
  await updateAuthorSession(PROJECT_RESUME, stale, { status: "needs_auth", checkpoint })
  await db!.execute({ sql: "UPDATE author_sessions SET updated_at=? WHERE id=?", args: [now - NEEDS_AUTH_RESUME_TTL_MS - 1000, stale] })

  const already = await createAuthorSession(PROJECT_RESUME, { name: "Already", objective: "continue", baseUrl: FIXTURE_URL })
  await updateAuthorSession(PROJECT_RESUME, already, { status: "needs_auth", checkpoint })
  await createAuthorSession(PROJECT_RESUME, { name: "Child", objective: "continue", baseUrl: FIXTURE_URL }, already)

  const candidates = await listNeedsAuthSessionsForAutoResume(PROJECT_RESUME, 10, now)
  const ids = candidates.map((s) => s.id)
  expect(ids).toContain(recent)
  expect(ids).not.toContain(stale)
  expect(ids).not.toContain(already)

  const resumed = await autoResumeNeedsAuthSessions(PROJECT_RESUME, {
    limit: 10,
    nowMs: now,
    runner: async (_projectId, req, deps) => {
      expect(req.name).toBe("Recent")
      expect(deps?.resumeSessionId).toBe(recent)
      return { sessionId: "auth_new_resume" }
    },
  })
  expect(resumed.resumed).toEqual([{ fromSessionId: recent, sessionId: "auth_new_resume" }])
  expect(await getAuthorSession(PROJECT_RESUME, recent)).not.toBeNull()
})

// ── Injectable-factory tests (hermetic, no real browser or network) ───────────────────────────────
// These tests exercise the three meaningful outcomes of the mint_link probe drive path:
//   (a) bad token format → fails fast, no browser opened
//   (b) drive never reaches authed state → NOT verified (failureKind:"drive-failed")
//   (c) drive reaches authed signal → verified

test("(a) mint_link bad token format → fails fast without opening a browser", async () => {
  let browserOpened = false
  const factory: ProbeBrowserFactory = async () => {
    browserOpened = true
    return makeFakeHandle("https://app.example.com/dashboard", false)
  }

  const config: AutosimAuthProbeConfig = {
    projectId: "proj_irrelevant",
    method: "mint_link",
    email: OWNER,
    secret: "not-a-valid-token",
    notes: null,
  }

  const result = await defaultAutosimAuthVerifier(config, factory)

  expect(result.ok).toBe(false)
  expect(result.failureKind).toBe("bad-format")
  expect(result.error).toBeTruthy()
  // Browser must NOT have been opened — format check is the fast pre-check
  expect(browserOpened).toBe(false)
})

test("(b) mint_link drive stays on /test-login → NOT verified with drive-failed reason", async () => {
  // The fake page URL after navigation stays on /test-login, indicating the session was not established.
  const factory: ProbeBrowserFactory = async (baseUrl) => {
    expect(baseUrl).toBeTruthy() // base URL must have been resolved
    // Simulate: app redirected back to /test-login (session mint rejected)
    return makeFakeHandle("https://klavity.example.com/test-login", false)
  }

  const driveProject = "proj_mint_drive_fail"
  const now = Date.now()
  await db!.execute({
    sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, site_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [driveProject, ACCOUNT, "Drive Fail", "active", "auto", 200, "named", "https://klavity.example.com", now, now],
  })

  const token = await mintAutosimAuthLinkToken(driveProject)
  const config: AutosimAuthProbeConfig = {
    projectId: driveProject,
    method: "mint_link",
    email: OWNER,
    secret: token,
    notes: null,
  }

  const result = await defaultAutosimAuthVerifier(config, factory)

  expect(result.ok).toBe(false)
  expect(result.failureKind).toBe("drive-failed")
  expect(result.error).toMatch(/test-login|session was not established/)
})

test("(c) mint_link drive reaches authenticated state → verified", async () => {
  // The fake page URL after navigation is /dashboard (post-login redirect), and krefSnapshot
  // does not show a login wall. The probe must return verified:true.
  let browserClosed = false
  const factory: ProbeBrowserFactory = async (baseUrl) => {
    expect(baseUrl).toBeTruthy()
    const handle = makeFakeHandle("https://klavity.example.com/dashboard", false)
    const origClose = handle.close.bind(handle)
    handle.close = async () => { browserClosed = true; await origClose() }
    return handle
  }

  const authProject = "proj_mint_drive_success"
  const now = Date.now()
  await db!.execute({
    sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, site_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [authProject, ACCOUNT, "Drive Success", "active", "auto", 200, "named", "https://klavity.example.com", now, now],
  })

  const token = await mintAutosimAuthLinkToken(authProject)
  const config: AutosimAuthProbeConfig = {
    projectId: authProject,
    method: "mint_link",
    email: OWNER,
    secret: token,
    notes: null,
  }

  const result = await defaultAutosimAuthVerifier(config, factory)

  expect(result.ok).toBe(true)
  expect(result.error).toBeNull()
  expect(result.failureKind).toBeUndefined()
  // Browser must have been cleanly closed after the drive
  expect(browserClosed).toBe(true)
})
