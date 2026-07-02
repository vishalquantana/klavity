// AutoSims F1 — authoring engine e2e tests. Hermetic local libsql + KLAV_SECRET.
// Real headless Chromium (Playwright), scripted fake AuthorModel — no network, no OpenRouter.
// Mirrors trails-runner.e2e.test.ts setup conventions.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const file = join(tmpdir(), `klav-author-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
// KLAV_SECRET required by test-accounts (encrypts password at rest); 32 bytes base64.
process.env.KLAV_SECRET = Buffer.from("autosims-test-secret-key-32bytes").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

import { authorTrail, runAuthorNow, getAuthorSession, AUTHOR_MAX_STEPS } from "./trails-author"
import type { AuthorModel } from "./trails-author-model"
import { createTestAccount } from "./test-accounts"
import * as T from "./trails"

const P = "proj_author"
const fixtureUrl = (name: string) =>
  pathToFileURL(resolve(import.meta.dir, "../test-fixtures", name)).href

const scripted = (script: any[]): AuthorModel => {
  let i = 0
  return async () => ({ action: { selector: null, value: null, url: null, checkpoint: null, rationale: "r", ...script[Math.min(i++, script.length - 1)] }, costUsd: 0.001 })
}
const LOGIN_SCRIPT = [
  { op: "type", selector: "#email", value: "{{cred:admin:email}}" },
  { op: "type", selector: "#pw", value: "{{cred:admin:password}}" },
  { op: "click", selector: "#signin" },
  { op: "assert", selector: "#welcome", checkpoint: "Logged-in welcome visible" },
  { op: "done" },
]

test("happy path: authors, crystallizes DRAFT trail, verification walk GREEN, no findings, no secret anywhere", async () => {
  await createTestAccount(P, { name: "admin", loginEmail: "vishal@quantana.com.au", password: "pw-authoring" })
  const out = await authorTrail(P, { name: "Login journey", objective: "log in and see the welcome screen", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted(LOGIN_SCRIPT) })
  expect(out.status).toBe("crystallized")
  expect(out.verificationVerdict).toBe("green")
  expect(out.llmCalls).toBe(5)
  const trail = await T.getTrail(P, out.trailId!)
  expect(trail!.status).toBe("draft")
  expect(trail!.authorKind).toBe("llm")
  const steps = await T.listTrailSteps(P, out.trailId!)
  expect(steps.length).toBe(5)                      // 4 actions + assert checkpoint
  expect(steps.some((s) => s.action === "assert")).toBe(true)
  const all = JSON.stringify({ steps, out, runSteps: await T.listRunSteps(P, out.verificationRunId!) })
  expect(all).toContain("{{cred:admin:password}}")
  expect(all).not.toContain("pw-authoring")
  expect((await T.listFindings(P)).length).toBe(0)  // draft + verification: nothing filed
}, 60000)

test("bad selector: model gets an error turn, then stalls out after 3 consecutive misses", async () => {
  const out = await authorTrail(P, { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted([{ op: "click", selector: "#does-not-exist" }]) })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toContain("#does-not-exist")
  expect(out.trailId).toBeNull()
}, 30000)

test("model stall op surfaces the rationale", async () => {
  const out = await authorTrail(P, { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted([{ op: "stall", rationale: "auth wall I cannot pass" }]) })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toBe("auth wall I cannot pass")
}, 30000)

test("budget cap stalls the attempt", async () => {
  const pricey: AuthorModel = async () => ({ action: { op: "click", selector: "#signin", value: null, url: null, checkpoint: null, rationale: "r" }, costUsd: 0.2 })
  const out = await authorTrail(P, { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: pricey })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toContain("budget")
}, 30000)

test("runAuthorNow persists a pollable session that reaches crystallized", async () => {
  await createTestAccount("proj_sess", { name: "admin", loginEmail: "a@b.c", password: "p" })
  const { sessionId } = await runAuthorNow("proj_sess", { name: "s", objective: "log in", baseUrl: fixtureUrl("author-mockup.html"), testAccountName: "admin" }, { model: scripted(LOGIN_SCRIPT) })
  for (let i = 0; i < 120; i++) {
    const s = await getAuthorSession("proj_sess", sessionId)
    if (s!.status !== "running") { expect(s!.status).toBe("crystallized"); expect(s!.trailId).toBeTruthy(); return }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error("session never finished")
}, 60000)

test("session is project-scoped", async () => {
  const { sessionId } = await runAuthorNow("proj_a1", { name: "s", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted([{ op: "stall", rationale: "x" }]) })
  expect(await getAuthorSession("proj_b1", sessionId)).toBeNull()
}, 30000)
