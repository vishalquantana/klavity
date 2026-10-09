// suggest-labels perf: (1) the DB distinguishes "never generated" (NULL) from "generated, no label fits" ([]) so the
// endpoint stops calling the model for an empty result; (2) the dashboard fetches suggestions only for the VISIBLE
// single-ticket detail and caches them per ticket (list rows / kanban cards build a hidden detail for "Copy to AI").
import { test, expect, beforeAll } from "bun:test"
import { readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-suggest-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { applySchema, ensureAccount, reconnectDb, insertFeedback, createLabel, setSuggestedLabels, getSuggestedLabels, getSuggestedLabelsState } = await import("./lib/db")

let projectId = "", fbId = ""
beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  const m = await ensureAccount("suggest-perf@test.local")
  projectId = "proj_" + m[0].workspaceId
  fbId = await insertFeedback({ projectId, observation: "checkout button does nothing", priority: "low" })
})

test("never generated (column NULL) → computed:false", async () => {
  const s = await getSuggestedLabelsState(fbId, projectId)
  expect(s.computed).toBe(false)
  expect(s.labels).toEqual([])
})

test("generated but nothing fits ([]) → computed:true with no labels — the case that must NOT regenerate", async () => {
  await setSuggestedLabels(fbId, [])
  const s = await getSuggestedLabelsState(fbId, projectId)
  expect(s.computed).toBe(true)
  expect(s.labels).toEqual([])
  // the legacy helper cannot tell the two apart — that was the bug
  expect(await getSuggestedLabels(fbId, projectId)).toEqual([])
})

test("generated with labels → computed:true and the resolved rows; unknown ids are dropped", async () => {
  const bug = await createLabel(projectId, "bug", "#ff0000")
  await createLabel(projectId, "ux", "#00ff00")
  await setSuggestedLabels(fbId, [bug.id, "lbl_deleted"])
  const s = await getSuggestedLabelsState(fbId, projectId)
  expect(s.computed).toBe(true)
  expect(s.labels.map(l => l.name)).toEqual(["bug"])
})

test("another project's feedback id is not readable (project-scoped) → computed:false", async () => {
  const s = await getSuggestedLabelsState(fbId, "proj_other")
  expect(s.computed).toBe(false)
  expect(s.labels).toEqual([])
})

// ── client ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
function makeLoader(fetchImpl: (url: string) => Promise<any>) {
  const src = ["const _sugCache = new Map()", "const _sugInflight = new Map()", extractFn(HTML, "function loadTicketSuggestions(")].join("\n")
  return new Function("fetch", src + "\nreturn loadTicketSuggestions")(fetchImpl) as (id: string) => Promise<any[] | null>
}
const ok = (suggestions: any[]) => ({ ok: true, json: async () => ({ suggestions }) })

test("client: results are cached per ticket — an empty list included — so re-renders never refetch", async () => {
  const urls: string[] = []
  const load = makeLoader(async (u) => { urls.push(u); return ok(u.includes("fb_a") ? [{ id: "l1" }] : []) })
  expect(await load("fb_a")).toEqual([{ id: "l1" }])
  expect(await load("fb_a")).toEqual([{ id: "l1" }])
  expect(await load("fb_b")).toEqual([])
  expect(await load("fb_b")).toEqual([])
  expect(urls).toEqual(["/api/feedback/fb_a/suggest-labels", "/api/feedback/fb_b/suggest-labels"])
})

test("client: concurrent callers for one ticket share ONE request", async () => {
  let n = 0
  const load = makeLoader(async () => { n++; await Bun.sleep(20); return ok([{ id: "l1" }]) })
  const [a, b, c] = await Promise.all([load("fb_a"), load("fb_a"), load("fb_a")])
  expect(n).toBe(1)
  expect([a, b, c]).toEqual([[{ id: "l1" }], [{ id: "l1" }], [{ id: "l1" }]])
})

test("client: a failed request (HTTP error / network error) is NOT cached — the next open retries", async () => {
  let n = 0
  const load = makeLoader(async () => { n++; if (n === 1) return { ok: false }; if (n === 2) throw new Error("net"); return ok([{ id: "l1" }]) })
  expect(await load("fb_a")).toBeNull()
  expect(await load("fb_a")).toBeNull()
  expect(await load("fb_a")).toEqual([{ id: "l1" }])
  expect(n).toBe(3)
})

test("client wiring (source pin): the suggest-labels fetch exists once, only inside the isSingle gate", () => {
  const detail = extractFn(HTML, "function buildTktDetail(")
  expect((HTML.match(/"\/suggest-labels"/g) || []).length).toBe(1)   // the one fetch, inside loadTicketSuggestions
  expect(detail).not.toContain("suggest-labels")
  expect(detail).toMatch(/if \(isSingle\) \{\s*loadTicketSuggestions\(ticketId\)/)
})
