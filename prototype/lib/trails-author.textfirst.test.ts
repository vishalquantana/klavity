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

describe("authorTrail textFirst escalation", () => {
  const FIXTURE_URL = "data:text/html," + encodeURIComponent(`<html><body><a id="go" href="#x">Go</a></body></html>`)
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
  test("flag off → screenshot on every call (current behavior)", async () => {
    const shots: boolean[] = []
    const model: AuthorModel = async (input) => {
      shots.push(input.screenshotB64.length > 0)
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    await authorTrail(projectId, { name: "tf2", objective: "o", baseUrl: FIXTURE_URL }, { model })
    expect(shots).toEqual([true])
  }, 60000)
})

afterAll(async () => { /* in-memory db, nothing to clean */ })
