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
import { redactedAutosimAuthConfig, runAutosimAuthProbe } from "./autosim-auth-probe"

const ACCOUNT = "acct_autosim_probe"
const PROJECT_GREEN = "proj_autosim_probe_green"
const PROJECT_RED = "proj_autosim_probe_red"
const PROJECT_RESUME = "proj_autosim_probe_resume"
const OWNER = "vishal@quantana.com.au"
const FIXTURE_URL = "https://example.com/login"

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
  for (const projectId of [PROJECT_GREEN, PROJECT_RED, PROJECT_RESUME]) {
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
