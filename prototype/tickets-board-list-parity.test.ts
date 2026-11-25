// Tickets page: the List and the Board must show the SAME tickets for the same filters.
//  1. "All statuses" in the List used to send `status=` (an empty array is truthy), which the server reads as
//     "everything except TO DO" — so the List hid every TO DO ticket and any filter showed fewer rows than the Board.
//  2. The Board loaded a single 200-row page (the API maximum), so on a project with >200 tickets the rest never
//     reached the board and every board filter ran over a truncated set.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const ALL_STATUSES = "open,new,in_progress,blocked,ready_for_deployment,deployed,qa_review,done,dismissed"
expect(HTML).toContain(`const ALL_STATUSES = STATUS_ORDER.join(",")`)

function statusParam(status: unknown): string {
  const src = extractFn(HTML, "function ticketStatusParamFor(")
  return new Function("_tktFilters", "ALL_STATUSES", `${src}; return ticketStatusParamFor("list")`)({ status }, ALL_STATUSES)
}

test("List with no status selected asks for EVERY status, TO DO included (same set as the Board)", () => {
  expect(statusParam([])).toBe(ALL_STATUSES)        // the real shape after the filter bar loads
  expect(statusParam("")).toBe(ALL_STATUSES)        // initial shape before it loads
  expect(statusParam(undefined)).toBe(ALL_STATUSES)
  expect(statusParam(["", ""])).toBe(ALL_STATUSES)
})

test("List with statuses selected sends exactly those", () => {
  expect(statusParam(["open", "in_progress"])).toBe("open,in_progress")
  expect(statusParam(["new"])).toBe("new")
  expect(statusParam("open,done")).toBe("open,done")
})

function boardFetcher(total: number, perPageOverlap = 0) {
  const calls: string[] = []
  const ids = Array.from({ length: total }, (_, i) => "t" + i)
  const fetchImpl = async (url: string) => {
    calls.push(url)
    const sp = new URL(url, "http://x").searchParams
    const page = Number(sp.get("page")), limit = Number(sp.get("limit"))
    const start = Math.max(0, (page - 1) * limit - (page > 1 ? perPageOverlap : 0))
    const slice = ids.slice(start, (page - 1) * limit + limit).map((id) => ({ id }))
    return { ok: true, json: async () => ({ tickets: slice, total, page, totalPages: Math.max(1, Math.ceil(total / limit)), rev: "r1" }) }
  }
  const src = extractFn(HTML, "async function fetchAllBoardTickets(")
  const fn = new Function("fetch", "ALL_STATUSES", "BOARD_PAGE_SIZE", "BOARD_MAX_PAGES", `${src}; return fetchAllBoardTickets`)(fetchImpl, ALL_STATUSES, 200, 15)
  return { fn, calls }
}

test("Board loads every page, not just the first 200 tickets", async () => {
  const { fn, calls } = boardFetcher(530)
  const d = await fn("proj_1")
  expect(d.tickets.length).toBe(530)
  expect(d.total).toBe(530)
  expect(d.rev).toBe("r1")
  expect(calls.length).toBe(3)
  for (const u of calls) {
    expect(u).toContain("status=" + encodeURIComponent(ALL_STATUSES))
    expect(u).toContain("limit=200")
  }
})

test("Board with <=200 tickets still makes a single request", async () => {
  const { fn, calls } = boardFetcher(120)
  expect((await fn("proj_1")).tickets.length).toBe(120)
  expect(calls.length).toBe(1)
})

test("a ticket that shifts between pages while loading is not shown twice", async () => {
  const { fn } = boardFetcher(450, 3)
  const d = await fn("proj_1")
  expect(new Set(d.tickets.map((t: any) => t.id)).size).toBe(d.tickets.length)
  expect(d.tickets.length).toBe(450)
})

test("the board fetch and the idle prefetch both use the all-pages loader", () => {
  expect(extractFn(HTML, "async function fetchAndRenderTktBoard(")).toContain("fetchAllBoardTickets(projId)")
  expect(HTML).toContain("d = await fetchAllBoardTickets(pid, signal)")
})
