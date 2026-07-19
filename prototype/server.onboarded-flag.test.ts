// server.onboarded-flag.test.ts
// KLA-297 regression: /onboarding must key its "already set up, go to the dashboard" redirect on an
// EXPLICIT accounts.onboarded_at flag, not on the OPTIONAL accounts.domain field.
//
// The bug this locks down: the wizard labels the website field "Your website · optional", so
//   - a user who FINISHED the wizard but skipped that field got the wizard restarted every visit;
//   - a user who filled it could never deliberately re-enter the wizard (e.g. for client #2).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-onbflag-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(43)).toString("base64")
const PORT = 44700 + Math.floor(Math.random() * 200)
const BASE = `http://localhost:${PORT}`

// Three shapes of user, all with a membership:
const EMAIL_FRESH = `onb-fresh-${RUN}@test.local`     // brand-new signup — no flag, no domain
const EMAIL_SKIPPED = `onb-skipped-${RUN}@test.local` // finished the wizard, skipped the website field
const EMAIL_DOMAIN = `onb-domain-${RUN}@test.local`   // legacy account with a domain (backfill target)

function rmDb() {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

let appProc: ReturnType<typeof Bun.spawn>

async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }
async function query(sql: string, args: any[] = []) { return (await raw.execute({ sql, args })).rows }

// Seed a user + account + owner membership + session. Returns the session id (cookie value).
async function seedUser(email: string, tag: string, domain: string | null) {
  const now = Date.now()
  const acct = `acct_${tag}_${RUN}`
  const sess = `sess_${tag}_${RUN}`
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [email, now])
  await exec("INSERT INTO accounts (id, name, owner_email, domain, created_at) VALUES (?, ?, ?, ?, ?)",
    [acct, `${tag} Workspace`, email, domain, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)",
    [`am_${tag}_${RUN}`, acct, email, "owner", now])
  await exec("INSERT INTO projects (id, account_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [`proj_${tag}_${RUN}`, acct, "Default Project", "active", now, now])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)",
    [`pm_${tag}_${RUN}`, `proj_${tag}_${RUN}`, email, "admin", now])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [sess, email, now, now + 86400_000])
  return { acct, sess }
}

// GET /onboarding without following the redirect, so we can read the Location header.
function getOnboarding(sess?: string, qs = "") {
  return fetch(`${BASE}/onboarding${qs}`, {
    redirect: "manual",
    headers: sess ? { cookie: `klav_session=${sess}` } : {},
  })
}

let fresh: { acct: string; sess: string }
let skipped: { acct: string; sess: string }
let withDomain: { acct: string; sess: string }

beforeAll(async () => {
  // Boot once to let initDb create the schema, then seed against the same file.
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  fresh = await seedUser(EMAIL_FRESH, "fresh", null)
  skipped = await seedUser(EMAIL_SKIPPED, "skipped", null)
  withDomain = await seedUser(EMAIL_DOMAIN, "domain", "acme.test")
})

afterAll(() => {
  appProc?.kill()
  raw.close()
  rmDb()
})

test("accounts carries an explicit onboarded_at column", async () => {
  const cols = await query("PRAGMA table_info(accounts)")
  expect(cols.some((c: any) => c.name === "onboarded_at")).toBe(true)
})

test("a brand-new signup still lands in the wizard", async () => {
  const r = await getOnboarding(fresh.sess)
  expect(r.status).toBe(200)
})

test("a logged-out visitor still gets the wizard", async () => {
  const r = await getOnboarding()
  expect(r.status).toBe(200)
})

// THE REGRESSION: finishing the wizard while skipping the optional website field must count.
// Under the old domain-based check this account had no domain, so every visit restarted the wizard.
test("finishing the wizard WITHOUT a domain redirects to /dashboard on the next visit", async () => {
  const before = await getOnboarding(skipped.sess)
  expect(before.status).toBe(200) // not onboarded yet — wizard

  const mark = await fetch(`${BASE}/api/account/onboarded`, {
    method: "POST",
    headers: { cookie: `klav_session=${skipped.sess}` },
  })
  expect(mark.status).toBe(200)

  const rows = await query("SELECT domain, onboarded_at FROM accounts WHERE id=?", [skipped.acct])
  expect(rows[0].domain == null).toBe(true)      // still no domain — the flag is independent
  expect(rows[0].onboarded_at != null).toBe(true)

  const after = await getOnboarding(skipped.sess)
  expect(after.status).toBe(302)
  expect(after.headers.get("location")).toBe("/dashboard")
})

// THE OTHER DIRECTION: an onboarded user must be able to ask for the wizard by name.
test("?again=1 lets an onboarded user deliberately re-enter the wizard", async () => {
  const r = await getOnboarding(skipped.sess, "?again=1")
  expect(r.status).toBe(200)
})

test("marking onboarded twice keeps the FIRST completion timestamp", async () => {
  const first = (await query("SELECT onboarded_at FROM accounts WHERE id=?", [skipped.acct]))[0].onboarded_at
  await Bun.sleep(5)
  const again = await fetch(`${BASE}/api/account/onboarded`, {
    method: "POST",
    headers: { cookie: `klav_session=${skipped.sess}` },
  })
  expect(again.status).toBe(200)
  const second = (await query("SELECT onboarded_at FROM accounts WHERE id=?", [skipped.acct]))[0].onboarded_at
  expect(second).toBe(first)
})

test("the onboarded endpoint rejects anonymous callers", async () => {
  const r = await fetch(`${BASE}/api/account/onboarded`, { method: "POST", redirect: "manual" })
  expect(r.ok).toBe(false)
})

// BACKFILL: an existing account that only ever had the old domain signal must NOT get thrown back
// into the wizard by this change.
test("backfill marks a legacy domain-having account onboarded", async () => {
  // Simulate the deploy: clear the one-shot guard + the flag, then re-run initDb by rebooting.
  await exec("UPDATE accounts SET onboarded_at=NULL")
  await exec("DELETE FROM schema_migrations WHERE key=?", ["accounts_onboarded_at_backfill_kla297"])

  const { backfillOnboardedAt } = await import("./lib/db")
  const res = await backfillOnboardedAt(raw as any)
  expect(res.backfilled).toBeGreaterThanOrEqual(1)

  const dom = await query("SELECT onboarded_at FROM accounts WHERE id=?", [withDomain.acct])
  expect(dom[0].onboarded_at != null).toBe(true)
  // ...and a truly fresh account (no domain, no activity) is left alone.
  const fr = await query("SELECT onboarded_at FROM accounts WHERE id=?", [fresh.acct])
  expect(fr[0].onboarded_at == null).toBe(true)
})

test("backfill counts prior activity (feedback) as onboarded, even with no domain", async () => {
  const now = Date.now()
  const act = await seedUser(`onb-activity-${RUN}@test.local`, "activity", null)
  await exec("INSERT INTO feedback (id, project_id, observation, created_at) VALUES (?, ?, ?, ?)",
    [`fb_${RUN}`, `proj_activity_${RUN}`, "something broke", now])
  await exec("DELETE FROM schema_migrations WHERE key=?", ["accounts_onboarded_at_backfill_kla297"])

  const { backfillOnboardedAt } = await import("./lib/db")
  await backfillOnboardedAt(raw as any)

  const rows = await query("SELECT domain, onboarded_at FROM accounts WHERE id=?", [act.acct])
  expect(rows[0].domain == null).toBe(true)
  expect(rows[0].onboarded_at != null).toBe(true)
})
