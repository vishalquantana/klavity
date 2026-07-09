import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

process.env.KLAV_SECRET = Buffer.from(new Uint8Array(32).fill(82)).toString("base64")
const file = join(tmpdir(), `klav-autosim-auth-db-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import {
  reconnectDb,
  applySchema,
  createAutosimAuthSetupToken,
  resolveAutosimAuthSetupToken,
  revokeAutosimAuthSetupToken,
  registerAutosimAuthConfig,
} from "./db"

const PROJECT = "proj_autosim_auth_db"
const ACCOUNT = "acct_autosim_auth_db"
const OWNER = "vishal@quantana.com.au"
let tokenId = ""
let rawToken = ""

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [ACCOUNT, "Auth DB", OWNER, now] })
  await c.execute({ sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [PROJECT, ACCOUNT, "Auth DB Project", "active", "auto", 200, "named", now, now] })
})

test("createAutosimAuthSetupToken stores only a hash and resolves the raw token", async () => {
  const issued = await createAutosimAuthSetupToken(PROJECT, OWNER)
  tokenId = issued.id
  rawToken = issued.token
  expect(rawToken.startsWith("aset_")).toBe(true)

  const info = await resolveAutosimAuthSetupToken(rawToken)
  expect(info).toMatchObject({ id: tokenId, projectId: PROJECT })

  const { db } = await import("./db")
  const stored = await db!.execute({ sql: "SELECT token_hash FROM autosim_auth_setup_tokens WHERE id=?", args: [tokenId] })
  expect(String((stored.rows[0] as any).token_hash)).not.toBe(rawToken)
})

test("registerAutosimAuthConfig encrypts secret, marks project registered, consumes token, and queues probe", async () => {
  const registered = await registerAutosimAuthConfig(PROJECT, tokenId, {
    method: "mint_link",
    email: OWNER,
    secret: "https://example.com/mint?token=secret",
    notes: "mint link flow",
  })
  expect(registered).not.toBeNull()
  const probeId = registered!.probeId
  expect(probeId.startsWith("aatp_")).toBe(true)

  const { db } = await import("./db")
  const cfg = await db!.execute({ sql: "SELECT method, email, secret_enc, notes FROM autosim_auth_configs WHERE project_id=?", args: [PROJECT] })
  expect(cfg.rows).toHaveLength(1)
  expect((cfg.rows[0] as any).method).toBe("mint_link")
  expect(String((cfg.rows[0] as any).secret_enc)).not.toContain("secret")

  const project = await db!.execute({ sql: "SELECT autosim_auth_status FROM projects WHERE id=?", args: [PROJECT] })
  expect((project.rows[0] as any).autosim_auth_status).toBe("registered")
  expect(await resolveAutosimAuthSetupToken(rawToken)).toBeNull()

  const probe = await db!.execute({ sql: "SELECT status FROM autosim_auth_probe_queue WHERE id=?", args: [probeId] })
  expect((probe.rows[0] as any).status).toBe("queued")
})

test("revokeAutosimAuthSetupToken prevents resolution", async () => {
  const issued = await createAutosimAuthSetupToken(PROJECT, OWNER)
  expect(await revokeAutosimAuthSetupToken(PROJECT, issued.id)).toBe(true)
  expect(await resolveAutosimAuthSetupToken(issued.token)).toBeNull()
})
