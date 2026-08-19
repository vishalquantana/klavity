import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-connectors-meta-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `cm-owner-${RUN}@test.local`
const MEMBER = `cm-member-${RUN}@test.local`
const SID = `sess_cm_${RUN}`
const MEM_SID = `sess_cm_mem_${RUN}`
const ACCT = `acct_cm_${RUN}`
const PROJ = `proj_cm_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

// Fake Jira tracker: serves createmeta issue types + project statuses on loopback.
const fakeJira = Bun.serve({
  port: 0,
  fetch: (r) => {
    const url = new URL(r.url)
    if (url.pathname.includes("/issue/createmeta/") && url.pathname.endsWith("/issuetypes")) {
      return Response.json({
        values: [
          { id: "1", name: "Bug", subtask: false },
          { id: "2", name: "Story", subtask: false },
          { id: "3", name: "Subtask", subtask: true },
        ],
      })
    }
    if (url.pathname.match(/\/project\/[^/]+\/statuses$/)) {
      return Response.json([
        {
          statuses: [
            { id: "10", name: "To Do", statusCategory: { key: "new" } },
            { id: "11", name: "Done", statusCategory: { key: "done" } },
          ],
        },
      ])
    }
    return new Response("not found", { status: 404 })
  },
})
const JIRA_HOST = `http://127.0.0.1:${fakeJira.port}`

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 47500 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }

  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [MEM_SID, MEMBER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Connectors Meta Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Connectors Meta Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm2_${RUN}`, PROJ, MEMBER, "member", OWNER, NOW])
})

afterAll(() => {
  proc?.kill()
  raw.close()
  fakeJira.stop(true)
  rmDb()
})

function req(method: string, path: string, body?: any, sid = SID) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${sid}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

test("POST /api/projects/:id/connectors/meta returns matched rows + suggested map for Jira", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/connectors/meta`, {
    type: "jira",
    config: { host: JIRA_HOST, email: "a@b.com", token: "tok", project_key: "PROJ" },
  })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.capabilities).toEqual({ issueTypes: true, statuses: true })
  expect(d.issueTypes.map((t: any) => t.name)).toEqual(["Bug", "Story"])
  const bugRow = d.rows.types.find((row: any) => row.key === "bug")
  expect(bugRow.status).toBe("matched")
  expect(bugRow.suggested).toBe("Bug")
  expect(d.suggested.issue_type_map.bug).toBe("Bug")
})

test("POST /api/projects/:id/connectors/meta rejects non-admins with 403", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/connectors/meta`, {
    type: "jira",
    config: { host: JIRA_HOST, email: "a@b.com", token: "tok", project_key: "PROJ" },
  }, MEM_SID)
  expect(r.status).toBe(403)
})
