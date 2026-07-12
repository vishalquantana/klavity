// KLAVITYKLA-223 (JTBD 7.10): White-label / agency branding.
// Covers:
//   PURE (lib/trails-branding):
//     - sanitizeBrandingInput validates color/name/logo and Pro-gates white-label
//     - resolveBranding normalizes stored config with safe defaults
//     - brandingFooterHtml / brandingFooterText produce the "Monitored by <Agency> · powered by
//       Klavity" PLG line, drop Klavity under white-label, and escape agency names (no reflected XSS)
//   RENDER (trust digest + walk report):
//     - branded projects show logo/accent/agency; white-label removes the Klavity footer
//     - unbranded projects render exactly as before
//   ROUTE (subprocess server, isolated DB):
//     - POST/GET /api/projects/:id/branding round-trips config (admin only)
//     - white-label rejected for a free account; accepted for a Pro account
//     - invalid accent / oversized name rejected
//     - the client-status-portal data JSON carries the branding subset
//     - an HTML agency name renders inert (escaped) in the walk-report HTML

import { test, expect, beforeAll, afterAll, describe } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  sanitizeBrandingInput,
  resolveBranding,
  brandingFooterHtml,
  brandingFooterText,
  isValidAccent,
  isValidLogoDataUrl,
  DEFAULT_ACCENT,
  KLAVITY_SIGNUP_URL,
  MAX_AGENCY_NAME_LEN,
} from "./lib/trails-branding"

// A tiny valid 1x1 PNG data-URL used as a logo fixture.
const PNG_1x1 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

// ── PURE: validation ────────────────────────────────────────────────────────────

describe("branding validation", () => {
  test("isValidAccent accepts #rgb and #rrggbb, rejects garbage", () => {
    expect(isValidAccent("#6366f1")).toBe(true)
    expect(isValidAccent("#abc")).toBe(true)
    expect(isValidAccent("red")).toBe(false)
    expect(isValidAccent("#12")).toBe(false)
    expect(isValidAccent("#6366f1;background:url(x)")).toBe(false)
    expect(isValidAccent(123 as any)).toBe(false)
  })

  test("isValidLogoDataUrl accepts a small image data-URL, rejects non-images and oversized", () => {
    expect(isValidLogoDataUrl(PNG_1x1)).toBe(true)
    expect(isValidLogoDataUrl("data:text/html;base64,PHNjcmlwdD4=")).toBe(false)
    expect(isValidLogoDataUrl("https://evil.example/logo.png")).toBe(false)
    // oversized: 200KB of base64
    expect(isValidLogoDataUrl("data:image/png;base64," + "A".repeat(200 * 1024))).toBe(false)
  })

  test("sanitizeBrandingInput accepts a clean branded config", () => {
    const v = sanitizeBrandingInput({ name: "Acme QA", accent: "#10B981", logoDataUrl: PNG_1x1 }, { isPro: true })
    expect(v.ok).toBe(true)
    if (v.ok) {
      expect(v.branding.name).toBe("Acme QA")
      expect(v.branding.accent).toBe("#10b981") // lowercased
      expect(v.branding.logoDataUrl).toBe(PNG_1x1)
      expect(v.branding.whiteLabel).toBeUndefined()
    }
  })

  test("sanitizeBrandingInput rejects a bad accent", () => {
    const v = sanitizeBrandingInput({ accent: "notacolor" }, { isPro: true })
    expect(v.ok).toBe(false)
  })

  test("sanitizeBrandingInput rejects an over-long agency name", () => {
    const v = sanitizeBrandingInput({ name: "x".repeat(MAX_AGENCY_NAME_LEN + 1) }, { isPro: true })
    expect(v.ok).toBe(false)
  })

  test("sanitizeBrandingInput Pro-gates white-label", () => {
    const free = sanitizeBrandingInput({ name: "Acme", whiteLabel: true }, { isPro: false })
    expect(free.ok).toBe(false)
    const pro = sanitizeBrandingInput({ name: "Acme", whiteLabel: true }, { isPro: true })
    expect(pro.ok).toBe(true)
    if (pro.ok) expect(pro.branding.whiteLabel).toBe(true)
  })

  test("empty strings clear fields (un-brand)", () => {
    const v = sanitizeBrandingInput({ name: "", accent: "", logoDataUrl: "" }, { isPro: true })
    expect(v.ok).toBe(true)
    if (v.ok) expect(Object.keys(v.branding).length).toBe(0)
  })
})

// ── PURE: resolve ────────────────────────────────────────────────────────────────

describe("resolveBranding", () => {
  test("null / empty resolves to unbranded default", () => {
    const r = resolveBranding(null)
    expect(r.branded).toBe(false)
    expect(r.accent).toBe(DEFAULT_ACCENT)
    expect(r.name).toBeNull()
    expect(r.logoDataUrl).toBeNull()
    expect(r.whiteLabel).toBe(false)
  })

  test("valid config resolves branded with its accent + name", () => {
    const r = resolveBranding({ name: "Acme QA", accent: "#ff0000", logoDataUrl: PNG_1x1, whiteLabel: true })
    expect(r.branded).toBe(true)
    expect(r.accent).toBe("#ff0000")
    expect(r.name).toBe("Acme QA")
    expect(r.logoDataUrl).toBe(PNG_1x1)
    expect(r.whiteLabel).toBe(true)
  })

  test("invalid accent falls back to the default without dropping a valid name", () => {
    const r = resolveBranding({ name: "Acme", accent: "javascript:alert(1)" })
    expect(r.accent).toBe(DEFAULT_ACCENT)
    expect(r.name).toBe("Acme")
    expect(r.branded).toBe(true)
  })
})

// ── PURE: footer builders ────────────────────────────────────────────────────────

describe("brandingFooter", () => {
  test("unbranded footer is 'powered by Klavity' linking to signup", () => {
    const html = brandingFooterHtml(resolveBranding(null))
    expect(html).toContain("powered by Klavity")
    expect(html).toContain(KLAVITY_SIGNUP_URL)
    expect(html).not.toContain("Monitored by")
  })

  test("branded footer is 'Monitored by <Agency> · powered by Klavity'", () => {
    const html = brandingFooterHtml(resolveBranding({ name: "Acme QA" }))
    expect(html).toContain("Monitored by")
    expect(html).toContain("Acme QA")
    expect(html).toContain("powered by Klavity")
  })

  test("white-label footer drops the Klavity backlink entirely", () => {
    const html = brandingFooterHtml(resolveBranding({ name: "Acme QA", whiteLabel: true }))
    expect(html).toContain("Monitored by")
    expect(html).toContain("Acme QA")
    expect(html).not.toContain("powered by Klavity")
    expect(html).not.toContain(KLAVITY_SIGNUP_URL)
  })

  test("agency name with HTML is escaped in the footer (no reflected XSS)", () => {
    const html = brandingFooterHtml(resolveBranding({ name: "<img src=x onerror=alert(1)>" }))
    expect(html).not.toContain("<img src=x")
    expect(html).toContain("&lt;img")
  })

  test("text footer mirrors the HTML footer for the digest text/plain part", () => {
    expect(brandingFooterText(resolveBranding(null))).toContain("powered by Klavity")
    const branded = brandingFooterText(resolveBranding({ name: "Acme QA" }))
    expect(branded).toContain("Monitored by Acme QA")
    expect(branded).toContain("powered by Klavity")
    const wl = brandingFooterText(resolveBranding({ name: "Acme QA", whiteLabel: true }))
    expect(wl).toContain("Monitored by Acme QA")
    expect(wl).not.toContain("powered by Klavity")
  })
})

// ── RENDER: trust digest + walk report skinning ──────────────────────────────────

describe("branded render surfaces", () => {
  test("trust digest applies logo/accent/agency and PLG footer; unbranded renders as before", async () => {
    const { buildTrustReportHtml } = await import("./lib/trust-report")
    const base = {
      projectId: "proj_1",
      projectName: "Acme Web",
      weekStart: new Date(0),
      weekEnd: new Date(7 * 864e5),
      snapReportsTotal: 0,
      snapHighlights: [],
      autoSimRunsTotal: 0,
      regressionsTotal: 0,
      regressionHighlights: [],
      simFindingsTotal: 0,
      simFindingHighlights: [],
      recurringIssuesTotal: 0,
      recurringHighlights: [],
      isQuietWeek: true,
    } as any

    const unbranded = buildTrustReportHtml({ ...base, branding: resolveBranding(null) })
    expect(unbranded).toContain(">Klavity</div>")
    expect(unbranded).toContain("powered by Klavity")

    const branded = buildTrustReportHtml({
      ...base,
      branding: resolveBranding({ name: "Acme QA", accent: "#ff0000", logoDataUrl: PNG_1x1 }),
    })
    expect(branded).toContain(PNG_1x1) // logo inlined into the header
    expect(branded).toContain("#ff0000") // agency accent header
    expect(branded).toContain("Monitored by")
    expect(branded).toContain("Acme QA")
    expect(branded).toContain("powered by Klavity")

    const wl = buildTrustReportHtml({
      ...base,
      branding: resolveBranding({ name: "Acme QA", whiteLabel: true }),
    })
    expect(wl).toContain("Monitored by")
    expect(wl).not.toContain("powered by Klavity")
  })

  test("walk report applies branding and escapes an HTML agency name (no reflected XSS)", async () => {
    const { renderWalkReportHtml } = await import("./lib/trails-report")
    const data: any = {
      trail: { id: "t1", name: "Login flow", intent: "reach dashboard" },
      walk: { id: "walk_1", status: "green", startedAt: 0, finishedAt: 15000, llmCalls: 2 },
      steps: [],
      findings: [],
      projectName: "Acme Web",
      branding: resolveBranding({ name: "<b>Evil & Co</b>", accent: "#ff0000", logoDataUrl: PNG_1x1 }),
    }
    const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: 1_700_000_000_000 })
    expect(html).toContain(PNG_1x1)
    expect(html).toContain("#ff0000")
    expect(html).toContain("Monitored by")
    // The name renders inert — escaped, no raw <b> injected.
    expect(html).not.toContain("<b>Evil")
    expect(html).toContain("&lt;b&gt;Evil")
    expect((html.match(/<script/gi) ?? []).length).toBe(0)
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// ROUTE tests — subprocess server + isolated DB
// ────────────────────────────────────────────────────────────────────────────────

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-branding-${ts}.db`)
const TEST_SECRET = Buffer.alloc(32, 9).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

const ADMIN_EMAIL = `admin-br-${ts}@test.local`
const ADMIN_SID = `sess_br_admin_${ts}`
const MEMBER_EMAIL = `member-br-${ts}@test.local`
const MEMBER_SID = `sess_br_member_${ts}`
const FREE_ACCOUNT = `acct_br_free_${ts}`
const FREE_PROJECT = `proj_br_free_${ts}`
const PRO_ACCOUNT = `acct_br_pro_${ts}`
const PRO_PROJECT = `proj_br_pro_${ts}`
const NOW = Date.now()

// Build the full production schema in-process (avoids drift with hand-rolled tables), then
// seed fixtures against it. reconnectDb+applySchema must run BEFORE the fixture inserts.
process.env.KLAV_SECRET = TEST_SECRET
process.env.TURSO_DATABASE_URL = "file:" + srvDbFile
process.env.TURSO_AUTH_TOKEN = ""
const { reconnectDb, applySchema } = await import("./lib/db")
const _db = reconnectDb("file:" + srvDbFile)
await applySchema(_db)
// modal_config_json is added via an ALTER in initDb() (not applySchema); the subprocess server
// runs initDb() on boot, but our fixture inserts need the column present now. Add it idempotently.
await rawExec("ALTER TABLE projects ADD COLUMN modal_config_json TEXT DEFAULT '{}'").catch(() => {})

// Fixtures: free account (admin+member) + a Pro account (admin).
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [MEMBER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [FREE_ACCOUNT, "Free WS", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_br_a_${ts}`, FREE_ACCOUNT, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_br_m_${ts}`, FREE_ACCOUNT, MEMBER_EMAIL, "member", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, modal_config_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`, [FREE_PROJECT, FREE_ACCOUNT, "Acme App", "{}", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`pm_br_a_${ts}`, FREE_PROJECT, ADMIN_EMAIL, "admin", NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`pm_br_m_${ts}`, FREE_PROJECT, MEMBER_EMAIL, "member", NOW])

await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [PRO_ACCOUNT, "Pro WS", ADMIN_EMAIL, "pro", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_br_pa_${ts}`, PRO_ACCOUNT, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, modal_config_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`, [PRO_PROJECT, PRO_ACCOUNT, "Pro App", "{}", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`pm_br_pa_${ts}`, PRO_PROJECT, ADMIN_EMAIL, "admin", NOW])

await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [MEMBER_SID, MEMBER_EMAIL, NOW, NOW + 86400_000])

let base = ""
let serverProc: ReturnType<typeof Bun.spawn>

beforeAll(async () => {
  const port = 47700 + Math.floor(Math.random() * 900)
  base = `http://localhost:${port}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      OPENROUTER_API_KEY: undefined as any,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

function cookie(sid: string) {
  return { headers: { Cookie: `klav_session=${sid}` } }
}

describe("branding API", () => {
  test("POST then GET round-trips branding for a free project (no white-label)", async () => {
    const post = await fetch(`${base}/api/projects/${FREE_PROJECT}/branding`, {
      method: "POST",
      headers: { ...cookie(ADMIN_SID).headers, "content-type": "application/json" },
      body: JSON.stringify({ name: "Acme QA", accent: "#10B981", logoDataUrl: PNG_1x1 }),
    })
    expect(post.status).toBe(200)
    const pb = await post.json()
    expect(pb.ok).toBe(true)
    expect(pb.branding.name).toBe("Acme QA")
    expect(pb.branding.accent).toBe("#10b981")
    expect(pb.branding.logoDataUrl).toBe(PNG_1x1)

    const get = await fetch(`${base}/api/projects/${FREE_PROJECT}/branding`, cookie(ADMIN_SID))
    expect(get.status).toBe(200)
    const gb = await get.json()
    expect(gb.branding.name).toBe("Acme QA")
    expect(gb.branding.accent).toBe("#10b981")
    expect(gb.pro).toBe(false)
  })

  test("white-label rejected for free account, accepted for Pro account", async () => {
    const free = await fetch(`${base}/api/projects/${FREE_PROJECT}/branding`, {
      method: "POST",
      headers: { ...cookie(ADMIN_SID).headers, "content-type": "application/json" },
      body: JSON.stringify({ name: "Acme QA", whiteLabel: true }),
    })
    expect(free.status).toBe(400)

    const pro = await fetch(`${base}/api/projects/${PRO_PROJECT}/branding`, {
      method: "POST",
      headers: { ...cookie(ADMIN_SID).headers, "content-type": "application/json" },
      body: JSON.stringify({ name: "Acme QA", whiteLabel: true }),
    })
    expect(pro.status).toBe(200)
    const pb = await pro.json()
    expect(pb.branding.whiteLabel).toBe(true)
    expect(pb.pro).toBe(true)
  })

  test("invalid accent is rejected (400)", async () => {
    const r = await fetch(`${base}/api/projects/${FREE_PROJECT}/branding`, {
      method: "POST",
      headers: { ...cookie(ADMIN_SID).headers, "content-type": "application/json" },
      body: JSON.stringify({ accent: "notacolor" }),
    })
    expect(r.status).toBe(400)
  })

  test("non-admin member cannot change branding (403)", async () => {
    const r = await fetch(`${base}/api/projects/${FREE_PROJECT}/branding`, {
      method: "POST",
      headers: { ...cookie(MEMBER_SID).headers, "content-type": "application/json" },
      body: JSON.stringify({ name: "Sneaky" }),
    })
    expect(r.status).toBe(403)
  })

  test("client-status-portal data JSON carries the branding subset", async () => {
    // Set full branding (incl. white-label) on the Pro project, then mint a portal token and
    // read the public data JSON. setProjectBranding replaces the whole config, so we pass every
    // field we want to persist here.
    await fetch(`${base}/api/projects/${PRO_PROJECT}/branding`, {
      method: "POST",
      headers: { ...cookie(ADMIN_SID).headers, "content-type": "application/json" },
      body: JSON.stringify({ name: "Portal Agency", accent: "#123abc", logoDataUrl: PNG_1x1, whiteLabel: true }),
    })
    const tok = await fetch(`${base}/api/projects/${PRO_PROJECT}/share-token`, {
      method: "POST",
      ...cookie(ADMIN_SID),
    })
    expect(tok.status).toBe(201)
    const { token } = await tok.json()

    const data = await fetch(`${base}/shared/project/${token}/data`)
    expect(data.status).toBe(200)
    const body = await data.json()
    expect(body.branding).toBeDefined()
    expect(body.branding.name).toBe("Portal Agency")
    expect(body.branding.accent).toBe("#123abc")
    expect(body.branding.logoDataUrl).toBe(PNG_1x1)
    // white-label was set earlier on this project, so the signup backlink is suppressed.
    expect(body.branding.whiteLabel).toBe(true)
    expect(body.branding.signupUrl).toBe("")
  })
})
