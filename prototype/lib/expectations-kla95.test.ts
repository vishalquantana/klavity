// KLA-95: AutoSim finding source flag + urlPath corroboration tests.
// Verifies:
//   (1) ingestFinding emits kind="autosim" and sets sim:true in corroboration
//   (2) urlPath is stored on the expectation from the finding's walk step URL
//   (3) AutoSim finding + Snap report on the same issue auto-validates (snap+sim)
//   (4) recordFinding threads urlPath through to the expectation spine
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-kla95-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const { ingestFinding, ingestSnapOrSim } = await import("./expectations-ingest")
const { listExpectations } = await import("./expectations-db")
const T = await import("./trails")
import { createClient } from "@libsql/client"

test("ingestFinding emits source kind='autosim' and sets sim:true in corroboration", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  await ingestFinding(c, {
    projectId: "proj_kla95_src",
    findingId: "find_abc",
    title: "Checkout button gone",
    dedupKey: "trail1:step1:element-gone",
    urlPath: "https://example.com/checkout",
  })
  const exps = await listExpectations(c, "proj_kla95_src")
  expect(exps).toHaveLength(1)
  const exp = exps[0]
  expect(exp.corroboration.sim).toBe(true)
  expect(exp.corroboration.snap).toBe(false)
  expect(exp.sourceRefs).toHaveLength(1)
  expect(exp.sourceRefs[0].kind).toBe("autosim")
  expect(exp.sourceRefs[0].id).toBe("find_abc")
})

test("ingestFinding stores urlPath on the expectation row", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  await ingestFinding(c, {
    projectId: "proj_kla95_url",
    findingId: "find_url1",
    title: "Submit button missing",
    dedupKey: "trail2:step2:element-gone",
    urlPath: "https://example.com/signup",
  })
  const exps = await listExpectations(c, "proj_kla95_url")
  expect(exps[0].urlPath).toBe("https://example.com/signup")
})

test("AutoSim finding + Snap report on same issue corroborates → validated", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  // First: an AutoSim finding emits the expectation (sim:true)
  await ingestFinding(c, {
    projectId: "proj_kla95_corr",
    findingId: "find_corr1",
    title: "Payment button gone",
    dedupKey: "trail3:step3:element-gone",
    urlPath: "https://example.com/pay",
  })
  // Expectation is candidate (only one source so far)
  const before = await listExpectations(c, "proj_kla95_corr")
  expect(before[0].status).toBe("candidate")
  expect(before[0].corroboration.sim).toBe(true)
  expect(before[0].corroboration.snap).toBe(false)

  // Then: a human Snap report on the same page issue → lexical match collapses and sets snap:true
  await ingestSnapOrSim(c, {
    projectId: "proj_kla95_corr",
    feedbackId: "fb_snap1",
    isSnap: true,
    title: "Payment button gone",
    dedupKey: "snap:proj_kla95_corr:/pay:regression:none",
    urlPath: "https://example.com/pay",
  })
  // Now snap+sim both true → auto-validated
  const after = await listExpectations(c, "proj_kla95_corr")
  expect(after).toHaveLength(1)
  expect(after[0].corroboration.snap).toBe(true)
  expect(after[0].corroboration.sim).toBe(true)
  expect(after[0].status).toBe("validated")
})

test("recordFinding threads urlPath to expectation spine", async () => {
  const proj = "proj_kla95_rf"
  const trailId = await T.createTrail(proj, { name: "kla95-trail", baseUrl: "https://example.com/" })
  const runId = await T.startWalk(proj, trailId)
  const { id } = await T.recordFinding(proj, {
    runId, trailId, kind: "regression",
    title: "Element gone on checkout",
    confidence: 0.9,
    dedupKey: `${trailId}:step1:element-gone`,
    urlPath: "https://example.com/checkout",
  })
  expect(id).toBeTruthy()
  // Check that the expectation was created with urlPath
  const { listExpectations: listExps } = await import("./expectations-db")
  // Wait a tick for the async import + ingest
  await new Promise((r) => setTimeout(r, 50))
  const exps = await listExps(db, proj)
  const exp = exps.find((e) => e.urlPath === "https://example.com/checkout")
  expect(exp).toBeDefined()
  expect(exp!.corroboration.sim).toBe(true)
  expect(exp!.sourceRefs[0]?.kind).toBe("autosim")
})
