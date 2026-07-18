# UTM Attribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture UTM first-touch attribution in the browser and stamp it on the `accounts` row at signup.

**Architecture:** A self-contained IIFE block in `site/kit.js` captures UTM params and persists first-touch + anon ID in localStorage, exposing `window.klavAttribution()`. `site/onboarding.html` passes the attribution object in the `/api/auth/verify` body. `prototype/lib/db.ts` adds 5 nullable attribution columns to `accounts` via the existing idempotent ALTER TABLE migration pattern. `prototype/server.ts` reads attribution from the verify body on `wasNew` signups and persists it.

**Tech Stack:** Bun + TypeScript server, vanilla JS browser, libSQL/Turso, bun:test

## Global Constraints

- Never touch `master` — work on `feat/utm-attribution` branch in the worktree at `/Users/vishalkumar/Downloads/qbug/klav-snap-wt-utm-attribution`
- `bun test` must be green before calling the task done
- Do NOT bump `package.json` version, `CHANGELOG.md`, or `docs/PRD.md`
- All new DB columns are nullable TEXT — no NOT NULL, no DEFAULT on the migration
- `parseAttribution` must silently handle null/undefined/non-object input (never throws)
- Max lengths: source/medium/campaign → 100 chars; referrer/anonId → 500 chars

---

### Task 1: DB migration — add attribution columns to `accounts`

**Files:**
- Modify: `prototype/lib/db.ts`

- [ ] **Step 1: Add the attribution column list near `accountBillingColumns`**

In `prototype/lib/db.ts`, find the line:
```ts
const accountBillingColumns: Array<[string, string]> = [
```
Add the following block immediately BEFORE it:
```ts
const accountAttributionColumns: Array<[string, string]> = [
  ["first_source", "TEXT"],
  ["first_medium", "TEXT"],
  ["first_campaign", "TEXT"],
  ["first_referrer", "TEXT"],
  ["anon_id", "TEXT"],
]
```

- [ ] **Step 2: Add the migration loop in `initDb`**

Find the block ending with:
```ts
  for (const [col, def] of accountBillingColumns) {
    if (!_initCols.get("accounts")?.has(col))
      await db!.execute(`ALTER TABLE accounts ADD COLUMN ${col} ${def}`).catch((e: any) => console.warn(`accounts.${col} ALTER skipped:`, e?.message || e))
  }
```
Add immediately AFTER:
```ts
  for (const [col, def] of accountAttributionColumns) {
    if (!_initCols.get("accounts")?.has(col))
      await db!.execute(`ALTER TABLE accounts ADD COLUMN ${col} ${def}`).catch((e: any) => console.warn(`accounts.${col} ALTER skipped:`, e?.message || e))
  }
```

- [ ] **Step 3: Commit**
```bash
git add prototype/lib/db.ts
git commit -m "feat(db): add first-touch attribution columns to accounts"
```

---

### Task 2: UTM capture in `site/kit.js`

**Files:**
- Modify: `site/kit.js`

Append the following block at the very end of `site/kit.js` (after the icons IIFE that ends with `})(window.KlavityKit = window.KlavityKit || {});`):

```js
(function () {
  "use strict";
  var LS;
  try { LS = window.localStorage; } catch (e) { return; }
  if (!LS) return;

  function parseUtm() {
    try {
      var p = new URLSearchParams(window.location.search);
      return {
        source:   (p.get("utm_source")   || "").slice(0, 100),
        medium:   (p.get("utm_medium")   || "").slice(0, 100),
        campaign: (p.get("utm_campaign") || "").slice(0, 100),
      };
    } catch (e) { return { source: "", medium: "", campaign: "" }; }
  }

  function getOrCreateAid() {
    var v = LS.getItem("klav_aid");
    if (!v) {
      try { v = crypto.randomUUID(); } catch (e) {
        v = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
      }
      try { LS.setItem("klav_aid", v); } catch (e) {}
    }
    return v || "";
  }

  var utmNow = parseUtm();
  var hasUtm  = utmNow.source || utmNow.medium || utmNow.campaign;
  var first   = null;

  try {
    var raw = LS.getItem("klav_utm");
    first = raw ? JSON.parse(raw) : null;
  } catch (e) { first = null; }

  if (!first && hasUtm) {
    first = utmNow;
    try { LS.setItem("klav_utm", JSON.stringify(first)); } catch (e) {}
  }
  first = first || { source: "", medium: "", campaign: "" };

  if (hasUtm) {
    try { LS.setItem("klav_utm_last", JSON.stringify(utmNow)); } catch (e) {}
  }

  var aid = getOrCreateAid();

  window.klavAttribution = function () {
    return {
      anonId:   aid,
      source:   first.source   || "",
      medium:   first.medium   || "",
      campaign: first.campaign || "",
      referrer: (document.referrer || "").slice(0, 500),
    };
  };
})();
```

After appending, run `node --check site/kit.js` — must exit 0.

- [ ] **Commit**
```bash
git add site/kit.js
git commit -m "feat(kit): add UTM first-touch capture and window.klavAttribution()"
```

---

### Task 3: Server — persist attribution at signup

**Files:**
- Modify: `prototype/server.ts`
- Modify: `prototype/lib/signup-alert.ts`
- Create: `prototype/server.attribution.test.ts`

**Step 1:** Create `prototype/server.attribution.test.ts`:

```ts
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-attr-${RUN}.db`)
const EMAIL_NEW  = `attr-new-${RUN}@test.local`
const EMAIL_RTN  = `attr-rtn-${RUN}@test.local`
const SECRET = Buffer.from(new Uint8Array(32).fill(41)).toString("base64")
const PORT = 44200 + Math.floor(Math.random() * 300)
const BASE = `http://localhost:${PORT}`

function rmDb() {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

let appProc: ReturnType<typeof Bun.spawn>

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

async function query(sql: string, args: any[] = []) {
  return (await raw.execute({ sql, args })).rows
}

function verify(email: string, code: string, attribution?: object) {
  return fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, code, ...(attribution ? { attribution } : {}) }),
  })
}

beforeAll(async () => {
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
      KLAV_TEST_OTP: "1",
      KLAV_TEST_OTP_EMAILS: `${EMAIL_NEW},${EMAIL_RTN}`,
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }

  const NOW = Date.now()
  const ACCT = `acct_rtn_${RUN}`
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [EMAIL_RTN, NOW])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Rtn Workspace", EMAIL_RTN, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_rtn_${RUN}`, ACCT, EMAIL_RTN, "owner", NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [`sess_rtn_${RUN}`, EMAIL_RTN, NOW, NOW + 86400_000])
})

afterAll(() => {
  appProc?.kill()
  raw.close()
  rmDb()
})

test("attribution is stamped on the account row for a new signup", async () => {
  const r = await verify(EMAIL_NEW, "666666", {
    source: "reddit",
    medium: "post",
    campaign: "q2-launch",
    referrer: "https://reddit.com/r/SaaS",
    anonId: "anon-test-123",
  })
  expect(r.status).toBe(200)
  const rows = await query(
    "SELECT first_source, first_medium, first_campaign, first_referrer, anon_id FROM accounts WHERE owner_email=?",
    [EMAIL_NEW]
  )
  expect(rows.length).toBe(1)
  expect(rows[0].first_source).toBe("reddit")
  expect(rows[0].first_medium).toBe("post")
  expect(rows[0].first_campaign).toBe("q2-launch")
  expect(rows[0].first_referrer).toBe("https://reddit.com/r/SaaS")
  expect(rows[0].anon_id).toBe("anon-test-123")
})

test("attribution is NOT overwritten on a returning user login", async () => {
  const r = await verify(EMAIL_RTN, "666666", {
    source: "twitter",
    medium: "organic",
    campaign: "day2",
  })
  expect(r.status).toBe(200)
  const rows = await query("SELECT first_source FROM accounts WHERE owner_email=?", [EMAIL_RTN])
  expect(rows.length).toBe(1)
  expect(rows[0].first_source == null || rows[0].first_source === "").toBe(true)
})

test("verify succeeds with no attribution field", async () => {
  const NOW = Date.now()
  const email = `attr-noattr-${RUN}@test.local`
  await exec("INSERT INTO login_otps (email, code, expires_at, used) VALUES (?, ?, ?, ?)",
    [email, "777777", NOW + 300_000, 0])
  const r = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, code: "777777" }),
  })
  expect(r.status).toBe(200)
})

test("oversized attribution values are truncated not rejected", async () => {
  const NOW = Date.now()
  const email = `attr-long-${RUN}@test.local`
  await exec("INSERT INTO login_otps (email, code, expires_at, used) VALUES (?, ?, ?, ?)",
    [email, "888888", NOW + 300_000, 0])
  const r = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, code: "888888", attribution: { source: "x".repeat(200) } }),
  })
  expect(r.status).toBe(200)
  const rows = await query("SELECT first_source FROM accounts WHERE owner_email=?", [email])
  expect(rows.length).toBe(1)
  expect((rows[0].first_source as string).length).toBe(100)
})
```

**Step 2:** Add `parseAttribution` to `prototype/server.ts` near other pure helpers (clientIp, token, otp):
```ts
function parseAttribution(raw: unknown): { source: string; medium: string; campaign: string; referrer: string; anonId: string } {
  const a = (raw != null && typeof raw === "object" && !Array.isArray(raw)) ? (raw as Record<string, unknown>) : {}
  const s = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max)
  return { source: s(a.source, 100), medium: s(a.medium, 100), campaign: s(a.campaign, 100), referrer: s(a.referrer, 500), anonId: s(a.anonId, 500) }
}
```

**Step 3:** In `/api/auth/verify`, change:
```ts
        const { email, code } = await req.json()
```
to:
```ts
        const { email, code, attribution } = await req.json()
```

Then change:
```ts
        const acceptedAssignmentInvites = await acceptPendingTicketAssignmentInvites(e)
        if (!acceptedAssignmentInvites.length) await ensureAccount(e)
```
to:
```ts
        const acceptedAssignmentInvites = await acceptPendingTicketAssignmentInvites(e)
        const newMemberships = acceptedAssignmentInvites.length ? null : await ensureAccount(e)
        if (wasNew && attribution != null) {
          const accountId = (newMemberships ?? acceptedAssignmentInvites)[0]?.workspaceId
          if (accountId) {
            const attr = parseAttribution(attribution)
            await db!.execute({
              sql: "UPDATE accounts SET first_source=?,first_medium=?,first_campaign=?,first_referrer=?,anon_id=? WHERE id=?",
              args: [attr.source, attr.medium, attr.campaign, attr.referrer, attr.anonId, accountId],
            }).catch((err: any) => console.error("attribution persist (non-fatal):", err?.message || err))
          }
        }
```

**Step 4:** In `prototype/lib/signup-alert.ts`, add `utmSource?: string` to `SignupContext` and update the Source field line.

**Step 5:** In server.ts verify handler, change:
```ts
          void notifyNewSignup({ email: e, ip: vIp, userAgent: sUa, referer: sRef, at: Date.now() })
```
to:
```ts
          const attrForSlack = attribution != null ? parseAttribution(attribution) : null
          void notifyNewSignup({ email: e, ip: vIp, userAgent: sUa, referer: sRef, utmSource: attrForSlack?.source || undefined, at: Date.now() })
```

**Step 6:** Run `bun test server.attribution.test.ts` — all 4 pass. Then `bun test` — green.

- [ ] **Commit**
```bash
git add prototype/server.ts prototype/lib/signup-alert.ts prototype/server.attribution.test.ts
git commit -m "feat(auth): persist UTM first-touch attribution on new account signup"
```

---

### Task 4: Onboarding page passes attribution + final check

**Files:**
- Modify: `site/onboarding.html`

In `site/onboarding.html` `verifyCode()`, find:
```js
    const v = await jsonFetch('/api/auth/verify', {
      method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email, code })
    })
```
Replace with:
```js
    const _attr = (typeof window !== 'undefined' && window.klavAttribution) ? window.klavAttribution() : {}
    const v = await jsonFetch('/api/auth/verify', {
      method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email, code, attribution: _attr })
    })
```

Verify `kit.js` is loaded on onboarding.html: `grep "kit.js" site/onboarding.html`

Run `bun test` — green. Rebase: `git fetch origin master && git rebase origin/master`.

- [ ] **Commit**
```bash
git add site/onboarding.html
git commit -m "feat(onboarding): pass UTM attribution to /api/auth/verify"
```
