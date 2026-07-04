// Author loop with a scripted mock model that answers with kref selectors, on a real page.
// Verifies: kref actions execute; NOTHING persisted (trajectory, history-visible log) is a kref.
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { authorTrail } from "./trails-author"
import type { AuthorModel, AuthorStepInput } from "./trails-author-model"
import { AUTHOR_SYS, buildAuthorMessages } from "./trails-author-model"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB (mirrors trails-author.e2e.test.ts setup verbatim) ─────
const file = join(tmpdir(), `klav-kref-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-test-secret-key-32bytes").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

import * as T from "./trails"

// Serve a small two-step fixture over data: — authorTrail needs a URL it can page.goto().
const FIXTURE_URL =
  "data:text/html," +
  encodeURIComponent(
    `<html><body><h1>Fixture home</h1>
     <a id="go" href="#done" onclick="document.getElementById('flag').textContent='clicked'">Go</a>
     <p id="flag">idle</p></body></html>`,
  )

const PROJECT_ID = "proj_kref_author"

describe("authoring with kref selectors", () => {
  test("kref action executes; trajectory + step log persist stable selectors only", async () => {
    const seen: AuthorStepInput[] = []
    // Scripted model: step 1 clicks the link via its kref (parsed out of the snapshot), then done.
    const model: AuthorModel = async (input) => {
      seen.push(input)
      if (seen.length === 1) {
        const ref = input.domSnapshot.match(/link "Go" \[ref=(e\d+)\]/)?.[1]
        expect(ref).toBeDefined()
        return { action: { op: "click", selector: `[data-kref="${ref}"]`, value: null, url: null, checkpoint: null, rationale: "click Go" }, costUsd: 0 }
      }
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    const out = await authorTrail(PROJECT_ID, { name: "kref t", objective: "click Go", baseUrl: FIXTURE_URL }, { model })
    expect(out.status).toBe("crystallized")
    // 1) model got the kref snapshot, not raw HTML
    expect(seen[0].domSnapshot).toContain('[ref=')
    expect(seen[0].domSnapshot).not.toContain("<html")
    // 2) NOTHING persisted is a kref: crystallized trail steps + locator cache carry stable selectors
    const trail = await T.getTrail(PROJECT_ID, out.trailId!)
    // Assert trail exists before serializing it
    expect(trail).not.toBeNull()
    const steps = await T.listTrailSteps(PROJECT_ID, out.trailId!)
    // Find the click step and check its locator_cache entry for the stable selector
    const clickStep = steps.find((s) => s.action === "click")
    expect(clickStep).toBeDefined()
    const cacheRow = await T.getCacheForStep(PROJECT_ID, clickStep!.id)
    expect(cacheRow).not.toBeNull()
    // stableSelectorFor should have resolved the #go id selector
    expect(cacheRow!.resolvedSelector).toBe("#go")
    expect(cacheRow!.resolvedSelector).not.toContain("data-kref")
    // Full serialization must contain no kref and must include the stable selector
    const json = JSON.stringify({ trail, steps, cacheRow })
    expect(json).not.toContain("data-kref")
    expect(json).toContain("#go") // stableSelectorFor picked the id
    // 3) step log (history-visible) shows the stable form
    expect(JSON.stringify(out.steps)).not.toContain("data-kref")
  }, 60000)

  test("AUTHOR_SYS teaches kref + bans Playwright pseudo-classes; label is ELEMENT SNAPSHOT", () => {
    expect(AUTHOR_SYS).toContain('data-kref')
    expect(AUTHOR_SYS.toLowerCase()).toContain("pseudo-class")
    const msgs = buildAuthorMessages({ objective: "o", pageUrl: "u", screenshotB64: "x", mediaType: "image/jpeg", domSnapshot: "snap", history: [], credFields: [] })
    expect(JSON.stringify(msgs)).toContain("ELEMENT SNAPSHOT (untrusted)")
  })
})

afterAll(async () => { /* in-memory db, nothing to clean */ })
