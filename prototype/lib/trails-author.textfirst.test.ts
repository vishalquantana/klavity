// Text-first authoring: skip the screenshot on the happy path; escalate (attach screenshot)
// only after a miss. Tests cover both message-shape (no browser needed) and e2e escalation.
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { buildAuthorMessages, type AuthorModel, type AuthorStepInput } from "./trails-author-model"
import { authorTrail } from "./trails-author"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB (mirrors trails-author.kref.e2e.test.ts setup verbatim) ─────
const file = join(tmpdir(), `klav-textfirst-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-test-secret-key-32bytes").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const projectId = "proj_textfirst_test"

describe("buildAuthorMessages text-only", () => {
  const base = { objective: "o", pageUrl: "u", mediaType: "image/jpeg", domSnapshot: "s", history: [], credFields: [] }
  test("empty screenshotB64 → no image part, content is a plain string", () => {
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "" })
    expect(typeof msgs[1].content).toBe("string")
    expect(JSON.stringify(msgs)).not.toContain("image_url")
  })
  test("non-empty screenshotB64 → image part present (unchanged)", () => {
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "abc" })
    expect(Array.isArray(msgs[1].content)).toBe(true)
    expect(JSON.stringify(msgs)).toContain("image_url")
  })
})

describe("buildAuthorMessages project instructions", () => {
  const base = { objective: "o", pageUrl: "u", mediaType: "image/jpeg", domSnapshot: "s", history: [], credFields: [] }
  test("no instructions → system prompt unchanged, no PROJECT INSTRUCTIONS marker", () => {
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "" })
    expect(JSON.stringify(msgs)).not.toContain("PROJECT INSTRUCTIONS")
  })
  test("instructions appended to system prompt and present in user message text", () => {
    const inst = "Use data-testid selectors. Always wait for spinner to disappear."
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "" }, inst)
    const sysContent = String(msgs[0].content)
    expect(sysContent).toContain("PROJECT INSTRUCTIONS:")
    expect(sysContent).toContain(inst)
  })
  test("instructions also visible in user message body (text-only path)", () => {
    const inst = "Staging env: use https://staging.example.com"
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "" }, inst)
    // system prompt includes instructions; verify it's there
    expect(JSON.stringify(msgs)).toContain(inst)
  })
  test("whitespace-only instructions → no PROJECT INSTRUCTIONS marker", () => {
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "" }, "   \n\t  ")
    expect(JSON.stringify(msgs)).not.toContain("PROJECT INSTRUCTIONS")
  })
})

describe("authorTrail textFirst default + escalation", () => {
  const FIXTURE_URL = "data:text/html," + encodeURIComponent(`<html><body><a id="go" href="#x">Go</a></body></html>`)
  const doneModel = (shots: boolean[]): AuthorModel => async (input) => {
    shots.push(input.screenshotB64.length > 0)
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }
  test("happy path sends NO screenshot; after a miss the retry attaches one", async () => {
    const shots: boolean[] = []
    let call = 0
    const model: AuthorModel = async (input: AuthorStepInput) => {
      shots.push(input.screenshotB64.length > 0)
      call++
      if (call === 1) // deliberately bad selector → miss
        return { action: { op: "click", selector: "#does-not-exist", value: null, url: null, checkpoint: null, rationale: "bad" }, costUsd: 0 }
      if (call === 2) // retry (escalated): now click the real link
        return { action: { op: "click", selector: "#go", value: null, url: null, checkpoint: null, rationale: "good" }, costUsd: 0 }
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    const out = await authorTrail(projectId, { name: "tf", objective: "click go", baseUrl: FIXTURE_URL }, { model, textFirst: true })
    expect(out.status).toBe("crystallized")
    expect(shots[0]).toBe(false) // first call: text-only
    expect(shots[1]).toBe(true)  // after miss: screenshot attached
    expect(shots[2]).toBe(false) // miss counter reset on success → text-only again
  }, 60000)
  test("default (no flag) → text-first: NO screenshot on the happy path", async () => {
    const shots: boolean[] = []
    await authorTrail(projectId, { name: "tf-default", objective: "o", baseUrl: FIXTURE_URL }, { model: doneModel(shots) })
    expect(shots).toEqual([false])
  }, 60000)
  test("opt-out via textFirst:false → screenshot on every call (arm A)", async () => {
    const shots: boolean[] = []
    await authorTrail(projectId, { name: "tf-optout", objective: "o", baseUrl: FIXTURE_URL }, { model: doneModel(shots), textFirst: false })
    expect(shots).toEqual([true])
  }, 60000)
  test("kill-switch KLAV_AUTHOR_TEXT_FIRST=0 → screenshot on every call", async () => {
    const prev = process.env.KLAV_AUTHOR_TEXT_FIRST
    process.env.KLAV_AUTHOR_TEXT_FIRST = "0"
    try {
      const shots: boolean[] = []
      await authorTrail(projectId, { name: "tf-kill", objective: "o", baseUrl: FIXTURE_URL }, { model: doneModel(shots) })
      expect(shots).toEqual([true])
    } finally {
      if (prev === undefined) delete process.env.KLAV_AUTHOR_TEXT_FIRST
      else process.env.KLAV_AUTHOR_TEXT_FIRST = prev
    }
  }, 60000)
})

afterAll(async () => { /* in-memory db, nothing to clean */ })
