import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

process.env.KLAV_SECRET = Buffer.from(new Uint8Array(32).fill(84)).toString("base64")
const file = join(tmpdir(), `klav-autosim-auth-exec-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import {
  reconnectDb,
  applySchema,
  createAutosimAuthSetupToken,
  registerAutosimAuthConfig,
  getAutosimAuthConfigRaw,
} from "./db"
import {
  AUTOSIM_AUTH_CRED_ACCOUNT,
  autosimAuthCredFields,
  autosimMintUrl,
  establishAutosimSession,
  loadAutosimAuthConfig,
  mintAutosimAuthLinkToken,
  withAutosimAuthCreds,
  _resetAutosimMintReplayForTests,
  type DecryptedAutosimAuthConfig,
  type MintablePage,
} from "./autosim-auth-exec"

const ACCOUNT = "acct_autosim_auth_exec"
const PROJECT = "proj_autosim_auth_exec"
const PROJECT_MINT = "proj_autosim_auth_exec_mint"
const OWNER = "vishal@quantana.com.au"

async function registerMethod(projectId: string, method: "fixed_otp" | "mint_link", email: string, secret: string) {
  const tok = await createAutosimAuthSetupToken(projectId, OWNER)
  const res = await registerAutosimAuthConfig(projectId, tok.id, { method, email, secret })
  expect(res).not.toBeNull()
}

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [ACCOUNT, "Exec", OWNER, now] })
  for (const p of [PROJECT, PROJECT_MINT]) {
    await c.execute({
      sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [p, ACCOUNT, "Exec Project", "active", "auto", 200, "named", now, now],
    })
  }
  await registerMethod(PROJECT, "fixed_otp", "vishal@quantana.com.au", "424242")
  await registerMethod(PROJECT_MINT, "mint_link", "vishal@quantana.com.au", await mintAutosimAuthLinkToken(PROJECT_MINT))
})

test("loadAutosimAuthConfig decrypts the stored secret at execution time (round-trip)", async () => {
  // Sanity: the row on disk holds ciphertext, not the plaintext secret.
  const raw = await getAutosimAuthConfigRaw(PROJECT)
  expect(raw).not.toBeNull()
  expect(raw!.secretEnc).not.toBe("424242")
  expect(raw!.secretEnc).toContain(":")

  const cfg = await loadAutosimAuthConfig(PROJECT)
  expect(cfg).toMatchObject({ method: "fixed_otp", email: "vishal@quantana.com.au", secret: "424242" })
})

test("loadAutosimAuthConfig returns null for an unregistered project", async () => {
  expect(await loadAutosimAuthConfig("proj_does_not_exist")).toBeNull()
})

test("autosimAuthCredFields exposes email+otp placeholders for fixed_otp, none for mint_link", () => {
  const otpCfg: DecryptedAutosimAuthConfig = { projectId: PROJECT, method: "fixed_otp", email: "a@b.co", secret: "424242", notes: null }
  expect(autosimAuthCredFields(otpCfg)).toEqual([
    `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:email}}`,
    `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:otp}}`,
  ])
  const mintCfg: DecryptedAutosimAuthConfig = { projectId: PROJECT_MINT, method: "mint_link", email: "a@b.co", secret: "tok", notes: null }
  expect(autosimAuthCredFields(mintCfg)).toEqual([])
  expect(autosimAuthCredFields(null)).toEqual([])
})

test("withAutosimAuthCreds resolves autosim-auth placeholders and delegates the rest", async () => {
  const cfg: DecryptedAutosimAuthConfig = { projectId: PROJECT, method: "fixed_otp", email: "login@example.com", secret: "424242", notes: null }
  let delegated = ""
  const base = async (_p: string, v: string) => { delegated = v; return v.replaceAll("{{cred:admin:password}}", "pw-1") }
  const resolver = withAutosimAuthCreds(base, cfg)

  expect(await resolver(PROJECT, `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:email}}`)).toBe("login@example.com")
  expect(await resolver(PROJECT, `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:otp}}`)).toBe("424242")

  // A pure autosim-auth placeholder must NOT reach the base resolver (which knows nothing of it).
  delegated = ""
  await resolver(PROJECT, `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:email}}`)
  expect(delegated).toBe("")

  // A mixed value: autosim-auth resolved here, the test-account ref forwarded to base.
  const mixed = await resolver(PROJECT, `${AUTOSIM_AUTH_CRED_ACCOUNT ? `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:email}}` : ""}|{{cred:admin:password}}`)
  expect(mixed).toBe("login@example.com|pw-1")
})

test("withAutosimAuthCreds does NOT resolve otp for mint_link method", async () => {
  const cfg: DecryptedAutosimAuthConfig = { projectId: PROJECT_MINT, method: "mint_link", email: "m@example.com", secret: "tok", notes: null }
  const base = async (_p: string, v: string) => v
  const resolver = withAutosimAuthCreds(base, cfg)
  // email still resolves; otp placeholder is left untouched (mint_link fills no form).
  expect(await resolver(PROJECT, `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:email}}`)).toBe("m@example.com")
  expect(await resolver(PROJECT, `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:otp}}`)).toBe(`{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:otp}}`)
})

test("withAutosimAuthCreds returns the base resolver unchanged when no method is registered", () => {
  const base = async (_p: string, v: string) => v
  expect(withAutosimAuthCreds(base, null)).toBe(base)
})

test("autosimMintUrl builds a same-origin /test-login URL from token or path secrets", async () => {
  const token = await mintAutosimAuthLinkToken(PROJECT_MINT)
  expect(autosimMintUrl(token, "https://app.example.com/dash")).toBe(`https://app.example.com/test-login?token=${encodeURIComponent(token)}`)
  expect(autosimMintUrl(`/test-login?token=${encodeURIComponent(token)}`, "https://app.example.com/dash")).toBe(`https://app.example.com/test-login?token=${encodeURIComponent(token)}`)
})

test("autosimMintUrl rejects absolute URLs, non-test-login paths, and private origins", async () => {
  const token = await mintAutosimAuthLinkToken(PROJECT_MINT)
  expect(() => autosimMintUrl("https://auth.example.com/test-login?token=x", "https://app.example.com")).toThrow(/absolute URL/)
  expect(() => autosimMintUrl(`/magic?token=${encodeURIComponent(token)}`, "https://app.example.com/dash")).toThrow(/\/test-login/)
  expect(() => autosimMintUrl(token, "http://127.0.0.1:3000/dash")).toThrow(/private/)
})

test("autosimMintUrl can allow private origins under the explicit test flag", async () => {
  const token = await mintAutosimAuthLinkToken(PROJECT_MINT)
  process.env.KLAV_ALLOW_PRIVATE_MINT_LINKS = "1"
  expect(autosimMintUrl("tok-123", "https://app.example.com/dash")).toBe("https://app.example.com/test-login?token=tok-123")
  expect(autosimMintUrl(token, "http://127.0.0.1:3000/dash")).toBe(`http://127.0.0.1:3000/test-login?token=${encodeURIComponent(token)}`)
  delete process.env.KLAV_ALLOW_PRIVATE_MINT_LINKS
})

function fakePage(): MintablePage & { visited: string[]; waited: number[] } {
  const visited: string[] = []
  const waited: number[] = []
  let current = "about:blank"
  return {
    visited,
    waited,
    async goto(url: string) {
      visited.push(url)
      const u = new URL(url)
      current = u.pathname === "/test-login" ? `${u.origin}/dashboard` : url
    },
    async waitMs(ms: number) { waited.push(ms) },
    url() { return current },
  }
}

test("establishAutosimSession hits the mint link for mint_link and no-ops otherwise", async () => {
  _resetAutosimMintReplayForTests()
  const token = await mintAutosimAuthLinkToken(PROJECT_MINT)
  const mintCfg: DecryptedAutosimAuthConfig = { projectId: PROJECT_MINT, method: "mint_link", email: "m@example.com", secret: token, notes: null }
  const p1 = fakePage()
  const r1 = await establishAutosimSession(p1, mintCfg, "https://app.example.com/dash")
  expect(r1).toEqual({ established: true, method: "mint_link" })
  expect(p1.visited).toEqual([`https://app.example.com/test-login?token=${encodeURIComponent(token)}`, "https://app.example.com/dash"])
  expect(p1.waited.length).toBe(2)

  const otpCfg: DecryptedAutosimAuthConfig = { projectId: PROJECT, method: "fixed_otp", email: "m@example.com", secret: "424242", notes: null }
  const p2 = fakePage()
  const r2 = await establishAutosimSession(p2, otpCfg, "https://app.example.com/dash")
  expect(r2.established).toBe(false)
  expect(p2.visited).toEqual([])

  const p3 = fakePage()
  const r3 = await establishAutosimSession(p3, null, "https://app.example.com/dash")
  expect(r3).toEqual({ established: false, method: null })
  expect(p3.visited).toEqual([])
})

test("establishAutosimSession swallows navigation failures (walk falls back to pausing at the gate)", async () => {
  _resetAutosimMintReplayForTests()
  const cfg: DecryptedAutosimAuthConfig = { projectId: PROJECT_MINT, method: "mint_link", email: "m@example.com", secret: await mintAutosimAuthLinkToken(PROJECT_MINT), notes: null }
  const page: MintablePage = {
    async goto() { throw new Error("net::ERR_CONNECTION_REFUSED") },
    async waitMs() {},
    url() { return "about:blank" },
  }
  const res = await establishAutosimSession(page, cfg, "https://app.example.com")
  expect(res).toEqual({ established: false, method: "mint_link" })
})

test("establishAutosimSession rejects expired mint tokens and replay", async () => {
  _resetAutosimMintReplayForTests()
  const expired = await mintAutosimAuthLinkToken(PROJECT_MINT, -1)
  const expiredRes = await establishAutosimSession(fakePage(), { projectId: PROJECT_MINT, method: "mint_link", email: "m@example.com", secret: expired, notes: null }, "https://app.example.com")
  expect(expiredRes).toEqual({ established: false, method: "mint_link" })

  const token = await mintAutosimAuthLinkToken(PROJECT_MINT)
  const cfg: DecryptedAutosimAuthConfig = { projectId: PROJECT_MINT, method: "mint_link", email: "m@example.com", secret: token, notes: null }
  expect((await establishAutosimSession(fakePage(), cfg, "https://app.example.com")).established).toBe(true)
  expect((await establishAutosimSession(fakePage(), cfg, "https://app.example.com")).established).toBe(false)
})

test("establishAutosimSession returns false when the mint route does not establish a session", async () => {
  _resetAutosimMintReplayForTests()
  const token = await mintAutosimAuthLinkToken(PROJECT_MINT)
  const page = {
    visited: [] as string[],
    waited: [] as number[],
    async goto(url: string) { this.visited.push(url) },
    async waitMs(ms: number) { this.waited.push(ms) },
    url() { return this.visited[this.visited.length - 1] ?? "about:blank" },
    async krefSnapshot() { return 'textbox "Password" [ref=e1]' },
  }
  const res = await establishAutosimSession(page, { projectId: PROJECT_MINT, method: "mint_link", email: "m@example.com", secret: token, notes: null }, "https://app.example.com")
  expect(res).toEqual({ established: false, method: "mint_link" })
})
