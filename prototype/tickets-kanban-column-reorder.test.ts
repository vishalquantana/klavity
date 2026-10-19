// Ticket 382/384: Enable Drag-and-Drop Column Reordering on the Tickets Board.
// Tests cover:
//  - Default column order derived from STATUS_ORDER
//  - Column reordering via moveKanbanColumn (before and after target)
//  - Persistence per user and project via localStorage (with sanitization for missing/stale keys)
//  - Separation of column drag vs ticket card drag (no accidental moveTicketColumn calls)
//  - Prev/Next navigation and range select consistency via _tktOrderedVisibleIds
//  - DOM wiring and CSS drop indicator pins
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")

function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig)
  if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") d++
    else if (src[j] === "}") {
      d--
      if (d === 0) return src.slice(i, j + 1)
    }
  }
  throw new Error("unbalanced: " + sig)
}

const STATUS_ORDER = ["open", "new", "in_progress", "blocked", "ready_for_deployment", "deployed", "qa_review", "done", "dismissed"]
const KANBAN_COLS = STATUS_ORDER.map(s => ({ key: s, status: s, label: s.toUpperCase() }))

function makeEnv(opts: { uid?: string | null; projId?: string | null; store?: Record<string, string>; throwing?: boolean } = {}) {
  const store: Record<string, string> = opts.store ?? {}
  const localStorage = {
    getItem: (k: string) => {
      if (opts.throwing) throw new Error("blocked")
      return k in store ? store[k] : null
    },
    setItem: (k: string, v: string) => {
      if (opts.throwing) throw new Error("blocked")
      store[k] = String(v)
    },
    removeItem: (k: string) => {
      if (opts.throwing) throw new Error("blocked")
      delete store[k]
    }
  }
  const state = { active: opts.projId === null ? null : { id: opts.projId ?? "proj_1" } }
  const swrUid = () => (opts.uid === undefined ? "u1" : opts.uid)
  let reRenderCount = 0
  const renderTicketsKanban = () => { reRenderCount++ }
  const _tktBoardTickets: any[] = []

  const src = [
    "let _kbColOrder = null",
    "let _kbColOrderLoadedKey = null",
    "let _kbColDragging = null",
    extractFn(HTML, "function kbColOrderKey("),
    extractFn(HTML, "function kbColOrderLoad("),
    extractFn(HTML, "function kbColOrderSave("),
    extractFn(HTML, "function getOrderedKanbanCols("),
    extractFn(HTML, "function moveKanbanColumn(")
  ].join("\n")

  const api = new Function(
    "localStorage", "state", "swrUid", "STATUS_ORDER", "KANBAN_COLS", "renderTicketsKanban", "_tktBoardTickets",
    src + "\nreturn { kbColOrderKey, kbColOrderLoad, kbColOrderSave, getOrderedKanbanCols, moveKanbanColumn, getOrder: () => _kbColOrder }"
  )(localStorage, state, swrUid, STATUS_ORDER, KANBAN_COLS, renderTicketsKanban, _tktBoardTickets) as {
    kbColOrderKey: () => string
    kbColOrderLoad: () => string[]
    kbColOrderSave: () => void
    getOrderedKanbanCols: () => { key: string; status: string; label: string }[]
    moveKanbanColumn: (fromKey: string, toKey: string, isBefore: boolean) => void
    getOrder: () => string[] | null
  }

  return { ...api, store, getReRenderCount: () => reRenderCount }
}

test("Ticket 382/384: default column order matches STATUS_ORDER", () => {
  const env = makeEnv()
  const cols = env.getOrderedKanbanCols()
  expect(cols.map(c => c.key)).toEqual(STATUS_ORDER)
})

test("Ticket 382/384: moving column before another updates the order immediately", () => {
  const env = makeEnv()
  // Move 'open' before 'done'
  env.moveKanbanColumn("open", "done", true)
  const cols = env.getOrderedKanbanCols().map(c => c.key)
  expect(cols.indexOf("open")).toBe(cols.indexOf("done") - 1)
  expect(env.getReRenderCount()).toBe(1)
})

test("Ticket 382/384: moving column after another updates the order immediately", () => {
  const env = makeEnv()
  // Move 'in_progress' after 'dismissed' (to the very end)
  env.moveKanbanColumn("in_progress", "dismissed", false)
  const cols = env.getOrderedKanbanCols().map(c => c.key)
  expect(cols[cols.length - 1]).toBe("in_progress")
  expect(cols.indexOf("dismissed")).toBe(cols.length - 2)
  expect(env.getReRenderCount()).toBe(1)
})

test("Ticket 382/384: dragging column onto itself or non-existent column is a no-op", () => {
  const env = makeEnv()
  const initial = env.getOrderedKanbanCols().map(c => c.key)
  env.moveKanbanColumn("open", "open", true)
  expect(env.getOrderedKanbanCols().map(c => c.key)).toEqual(initial)
  expect(env.getReRenderCount()).toBe(0)

  env.moveKanbanColumn("nonexistent", "open", true)
  expect(env.getOrderedKanbanCols().map(c => c.key)).toEqual(initial)
  expect(env.getReRenderCount()).toBe(0)
})

test("Ticket 382/384: column order persists to localStorage per user and project", () => {
  const env1 = makeEnv({ uid: "user_a", projId: "proj_x" })
  env1.moveKanbanColumn("done", "open", true) // Put 'done' first
  const expectedKey = "klav:kbcolorder:user_a:proj_x"
  expect(env1.store[expectedKey]).toBeDefined()
  const stored = JSON.parse(env1.store[expectedKey])
  expect(stored[0]).toBe("done")

  // Fresh session with the same user + project restores the order
  const env2 = makeEnv({ uid: "user_a", projId: "proj_x", store: env1.store })
  expect(env2.getOrderedKanbanCols().map(c => c.key)[0]).toBe("done")

  // Another user or project gets the default order (isolated)
  const envOther = makeEnv({ uid: "user_b", projId: "proj_x", store: env1.store })
  expect(envOther.getOrderedKanbanCols().map(c => c.key)).toEqual(STATUS_ORDER)
})

test("Ticket 382/384: sanitization cleans up stale columns and appends missing statuses", () => {
  const store = {
    "klav:kbcolorder:u1:proj_1": JSON.stringify(["done", "unknown_old_status", "new"])
  }
  const env = makeEnv({ store })
  const cols = env.getOrderedKanbanCols().map(c => c.key)
  // 'unknown_old_status' should be omitted
  expect(cols).not.toContain("unknown_old_status")
  // 'done' and 'new' are kept at the front
  expect(cols[0]).toBe("done")
  expect(cols[1]).toBe("new")
  // Missing statuses from STATUS_ORDER are cleanly appended
  for (const s of STATUS_ORDER) {
    expect(cols).toContain(s)
  }
  expect(cols.length).toBe(STATUS_ORDER.length)
})

test("Ticket 382/384: throwing/blocked localStorage does not crash or break column ordering", () => {
  const env = makeEnv({ throwing: true })
  expect(() => env.getOrderedKanbanCols()).not.toThrow()
  expect(env.getOrderedKanbanCols().map(c => c.key)).toEqual(STATUS_ORDER)
  expect(() => env.moveKanbanColumn("open", "new", false)).not.toThrow()
})

test("Ticket 382/384: _tktOrderedVisibleIds respects custom column order for prev/next", () => {
  const fnSrc = extractFn(HTML, "function _tktOrderedVisibleIds(")
  expect(fnSrc).toContain("getOrderedKanbanCols")
  expect(fnSrc).toContain("orderedCols.forEach")
})

test("Ticket 382/384: UI wiring pins for column draggable header, grip handle, and drop styling", () => {
  // CSS rules
  expect(HTML).toContain('.kb-head[draggable="true"]')
  expect(HTML).toContain(".kb-head .kb-grip")
  expect(HTML).toContain(".kb-col.col-dragging")
  expect(HTML).toContain(".kb-col.col-drop-before")
  expect(HTML).toContain(".kb-col.col-drop-after")

  // JS wiring in renderTicketsKanban
  const renderSrc = extractFn(HTML, "function renderTicketsKanban(")
  expect(renderSrc).toContain('head.setAttribute("draggable", "true")')
  expect(renderSrc).toContain('head.setAttribute("data-col-key", col.key)')
  expect(renderSrc).toContain('class="kb-grip"')
  expect(renderSrc).toContain("application/x-klav-col-key")
  expect(renderSrc).toContain("moveKanbanColumn(")

  // Ensure button clicks (e.g. sort button) don't trigger column drag
  expect(renderSrc).toMatch(/ev\.target\.closest\(["']button["']\)/)

  // Ensure column drag doesn't trigger ticket card moves
  expect(renderSrc).toContain("isColDrag")
  expect(renderSrc).toContain("moveTicketColumn(ticketId, fromKey, col.key)")
})
