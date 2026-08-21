// PX4 #411 regression (E2E dogfood): the Snap composer's explicit one-line Title was persisted into
// feedback.title but every READ path derived the displayed title from observation / suggested_bug.title,
// so the reporter's Title was captured then invisible. These tests lock the fix: each title-showing read
// path surfaces the explicit title when present + non-empty, and falls back to the OLD behavior when the
// row carries no title (back-compat).
import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-title-surface-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { db, applySchema, insertFeedback, listFeedback, listTriageFeedback, listTicketsPaginated } = await import("./db")
await applySchema(db!)
const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`

// ── Triage list (GET /api/projects/:id/triage → listTriageFeedback) ──────────────────────────────
test("triage list: explicit Title wins over the observation-derived auto-title", async () => {
  const P = `proj_tg_title_${RUN}`
  // priority "medium" → status "new", so it lands in the triage queue.
  await insertFeedback({ projectId: P, observation: "the whole verbose body first line", priority: "medium", title: "Login button does nothing" })
  const rows = await listTriageFeedback(P)
  expect(rows.length).toBe(1)
  expect(rows[0].title).toBe("Login button does nothing")
})

test("triage list: falls back to observation when no Title was typed (back-compat)", async () => {
  const P = `proj_tg_notitle_${RUN}`
  await insertFeedback({ projectId: P, observation: "checkout throws 500", priority: "medium" })
  const rows = await listTriageFeedback(P)
  expect(rows.length).toBe(1)
  expect(rows[0].title).toBe("checkout throws 500")
})

// ── Dashboard tickets list (GET /api/dashboard → listFeedback, server derives title from f.title) ──
test("listFeedback surfaces the explicit .title field (present) and null (absent, back-compat)", async () => {
  const P = `proj_lf_title_${RUN}`
  await insertFeedback({ projectId: P, observation: "obs A", priority: "low", title: "Explicit A" })
  await insertFeedback({ projectId: P, observation: "obs B", priority: "low" })
  const rows = await listFeedback(P, { limit: 10 })
  const byObs = Object.fromEntries(rows.map((r) => [r.observation, r]))
  // The dashboard tickets list derives its shown title as (f.title || f.observation).
  expect(byObs["obs A"].title).toBe("Explicit A")
  expect(byObs["obs B"].title).toBe(null) // absent → server falls back to observation, exactly as before
})

// ── Paginated tickets list (listTicketsPaginated, same derivation as the triage path) ────────────
test("listTicketsPaginated: explicit Title wins; no Title falls back to observation", async () => {
  const P = `proj_tp_title_${RUN}`
  // priority "high" → status "open", so these show up in the (non-new) tickets list.
  await insertFeedback({ projectId: P, observation: "obs with title", priority: "high", title: "Cart total wrong" })
  await insertFeedback({ projectId: P, observation: "obs no title", priority: "high" })
  const { tickets } = await listTicketsPaginated(P, { limit: 50 })
  const byObs = Object.fromEntries(tickets.map((t: any) => [t.observation, t]))
  expect(byObs["obs with title"].title).toBe("Cart total wrong")
  expect(byObs["obs no title"].title).toBe("obs no title")
})
