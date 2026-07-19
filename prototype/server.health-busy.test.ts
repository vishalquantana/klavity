// KLAVITYKLA-346 — GET /api/health/busy exposes the in-flight AutoSim/Sim busy count that the
// zero-downtime autodeploy (scripts/autodeploy.sh) polls on the OLD slot before stopping it, so a
// slot flip never kills an in-flight run mid-execution. On an idle server it must report busy:0 /
// idle:true. Spawns a real server subprocess (mirrors server.legacy-domain-api-cors.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-health-busy-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

beforeAll(async () => {
  serverPort = 32000 + Math.floor(Math.random() * 1000)
  base = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/api/health`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill() })

test("GET /api/health/busy reports idle on a quiet server", async () => {
  const r = await fetch(`${base}/api/health/busy`)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.busy).toBe(0)
  expect(body.idle).toBe(true)
  // Shape the deploy drain relies on.
  expect(body.activeWalks).toBe(0)
  expect(body.queuedWalks).toBe(0)
  expect(typeof body.authorActive).toBe("boolean")
  expect(typeof body.pdfActive).toBe("boolean")
})
