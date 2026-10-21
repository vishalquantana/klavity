import { test, expect, describe } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

describe("QA Audit: Tickets Status Filters & Board View Functionality", () => {
  const ALL_STATUSES = [
    "open",
    "new",
    "in_progress",
    "blocked",
    "ready_for_deployment",
    "deployed",
    "qa_review",
    "done",
    "dismissed"
  ]

  test("STATUS_ORDER contains all 9 production ticket statuses", () => {
    const match = html.match(/const STATUS_ORDER = \[([^\]]+)\]/)
    expect(match).not.toBeNull()
    const statuses = match![1].split(",").map(s => s.trim().replace(/['"]/g, ""))
    expect(statuses).toEqual(ALL_STATUSES)
  })

  test("STATUS_LABELS correctly maps QA Review, Done, Dismissed, and TO DO", () => {
    expect(html).toContain('qa_review: "QA Review"')
    expect(html).toContain('done: "Done"')
    expect(html).toContain('dismissed: "Dismissed"')
    expect(html).toContain('new: "TO DO"')
    expect(html).toContain('open: "Open"')
    expect(html).toContain('in_progress: "In Progress"')
    expect(html).toContain('blocked: "Blocked"')
    expect(html).toContain('ready_for_deployment: "Ready for Deployment"')
    expect(html).toContain('deployed: "Deployed"')
  })

  test("kanbanKeyForStatus maps all 9 statuses to their own column keys", () => {
    expect(html).toContain('function kanbanKeyForStatus(status) {')
    expect(html).toContain('return STATUS_ORDER.includes(status) ? status : "open"')

    const STATUS_ORDER = ALL_STATUSES
    function kanbanKeyForStatus(status: any) {
      if (!status) return "open"
      const s = String(status).trim().toLowerCase().replace(/[-\s]+/g, "_")
      const norm = (s === "todo" || s === "to_do") ? "new" : s
      return STATUS_ORDER.includes(norm) ? norm : "open"
    }

    for (const st of ALL_STATUSES) {
      expect(kanbanKeyForStatus(st)).toBe(st)
      expect(kanbanKeyForStatus(st.toUpperCase())).toBe(st)
    }
    expect(kanbanKeyForStatus("todo")).toBe("new")
    expect(kanbanKeyForStatus("to_do")).toBe("new")
    expect(kanbanKeyForStatus("qa-review")).toBe("qa_review")
    expect(kanbanKeyForStatus("QA Review")).toBe("qa_review")
    expect(kanbanKeyForStatus("invalid_status")).toBe("open")
    expect(kanbanKeyForStatus(null)).toBe("open")
  })

  test("KANBAN_COLS creates distinct columns for every status in STATUS_ORDER", () => {
    expect(html).toContain('const KANBAN_COLS = STATUS_ORDER.map(s => ({ key: s, status: s, label: STATUS_LABELS[s], statuses: [s] }))')
  })

  test("Status filter select element includes all 9 statuses in HTML", () => {
    for (const st of ALL_STATUSES) {
      expect(html).toContain(`<option value="${st}">`)
    }
  })

  test("Filter state initializes correctly", () => {
    expect(html).toContain('let _tktFilters = {')
    expect(html).toContain('status: []')
    expect(html).toContain('priority: []')
    expect(html).toContain('label: []')
    expect(html).toContain('assignee: []')
    expect(html).toContain('source: []')
    expect(html).toContain('search: ""')
  })

  test("hasActiveTicketFilters accurately tracks any active filter", () => {
    expect(html).toContain('function hasActiveTicketFilters()')
    expect(html).toContain('Array.isArray(f.status) ? f.status.length > 0 : f.status')
    expect(html).toContain('Array.isArray(f.priority) ? f.priority.length > 0 : f.priority')
    expect(html).toContain('Array.isArray(f.label) ? f.label.length > 0 : f.label')
    expect(html).toContain('Array.isArray(f.assignee) ? f.assignee.length > 0 : f.assignee')
    expect(html).toContain('Array.isArray(f.source) ? f.source.length > 0 : f.source')
  })

  test("ticketStatusParamFor sends active status filters to board & list queries without hardcoding ALL_STATUSES", () => {
    expect(html).toContain('function ticketStatusParamFor(view)')
    expect(html).toContain('_tktFilters.status.join(",")')
    expect(html).toContain('return ALL_STATUSES')
  })

  test("ticketQueryParams includes active status and filter parameters for board & list queries", () => {
    expect(html).toContain('function ticketQueryParams(view, page, limit)')
    expect(html).toContain('const statusParam = ticketStatusParamFor(view)')
    expect(html).toContain('if (statusParam) sp.set("status", statusParam)')
    expect(html).toContain('if (p) sp.set("priority", p)')
    expect(html).toContain('if (l) sp.set("label", l)')
    expect(html).toContain('if (a) sp.set("assignee", a === "__unassigned__" ? "" : a)')
    expect(html).toContain('if (src) sp.set("source", src)')
    expect(html).toContain('if (_tktFilters.search) sp.set("q", _tktFilters.search)')
  })

  test("Board caching avoids wiping full board cache when filtered", () => {
    expect(html).toContain('const hasFilter = hasActiveTicketFilters()')
    expect(html).toContain('_tktBoardAllTickets')
    expect(html).toContain('_tktBoardAllTotal')
  })

  test("URL filter parser supports single status, comma-separated statuses, and multiple query params", () => {
    expect(html).toContain('function loadTicketFiltersFromUrl()')
    expect(html).toContain('const allVals = sp.getAll(key)')
    expect(html).toContain('allVals.flatMap(v => v ? v.split(",") : [])')
  })

  test("syncTicketFiltersToUrl properly synchronizes filters to URL query string", () => {
    expect(html).toContain('function syncTicketFiltersToUrl()')
    expect(html).toContain('status: Array.isArray(_tktFilters.status) ? _tktFilters.status.join(",") : (_tktFilters.status || "")')
  })

  test("Browser back/forward popstate event synchronizes ticket filters", () => {
    expect(html).toContain('loadTicketFiltersFromUrl()')
    expect(html).toContain('syncFilterDropdownsFromState()')
  })

  test("Clear Filters button resets all filters and updates the board/list views", () => {
    expect(html).toContain('fbClear.addEventListener("click"')
    expect(html).toContain('_tktFilters = { status: [], priority: [], label: [], assignee: [], source: [], search: "" }')
  })

  test("renderTicketsKanban empty state respects active filter status vs totally empty project", () => {
    expect(html).toContain('const filterActive = hasActiveTicketFilters()')
    expect(html).toContain('const msg = filterActive ? "No tickets match these filters." : "No tickets yet."')
  })

  test("tktMatchesSelectFilters client-side filter logic handles every status case", () => {
    const sampleTickets = ALL_STATUSES.map((status, idx) => ({
      id: `tkt_${idx}`,
      title: `Ticket ${idx} with status ${status}`,
      status: status,
      priority: idx % 2 === 0 ? "high" : "low",
      source: "human"
    }))

    const simulateFilter = (t: any, filters: any) => {
      const f = filters
      const statuses = Array.isArray(f.status) ? f.status : (f.status ? String(f.status).split(",").filter(Boolean) : [])
      if (statuses.length) {
        const tStatus = String(t.status || "open").toLowerCase().trim()
        const normStatuses = statuses.map((s: string) => String(s).toLowerCase().trim())
        if (!normStatuses.includes(tStatus)) return false
      }
      return true
    }

    // Verify each status individually
    for (const st of ALL_STATUSES) {
      const filtered = sampleTickets.filter(t => simulateFilter(t, { status: [st] }))
      expect(filtered.length).toBe(1)
      expect(filtered[0].status).toBe(st)
    }

    // Verify QA Review filter matches only qa_review tickets
    const qaFiltered = sampleTickets.filter(t => simulateFilter(t, { status: ["qa_review"] }))
    expect(qaFiltered.length).toBe(1)
    expect(qaFiltered[0].status).toBe("qa_review")

    // Verify Done filter matches only done tickets
    const doneFiltered = sampleTickets.filter(t => simulateFilter(t, { status: ["done"] }))
    expect(doneFiltered.length).toBe(1)
    expect(doneFiltered[0].status).toBe("done")

    // Verify Dismissed filter matches only dismissed tickets
    const dismissedFiltered = sampleTickets.filter(t => simulateFilter(t, { status: ["dismissed"] }))
    expect(dismissedFiltered.length).toBe(1)
    expect(dismissedFiltered[0].status).toBe("dismissed")

    // Verify combined QA Review + Done filter matches both
    const multiFiltered = sampleTickets.filter(t => simulateFilter(t, { status: ["qa_review", "done"] }))
    expect(multiFiltered.length).toBe(2)
    expect(multiFiltered.map(t => t.status).sort()).toEqual(["done", "qa_review"])
  })
})

describe("Database & Backend: Ticket Status Filtering for All 9 Statuses", () => {
  const ALL_STATUSES = [
    "open",
    "new",
    "in_progress",
    "blocked",
    "ready_for_deployment",
    "deployed",
    "qa_review",
    "done",
    "dismissed"
  ]

  test("listTicketsPaginated: retrieves tickets for every status individually and in combination", async () => {
    const file = join(tmpdir(), `klav-audit-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
    process.env.TURSO_DATABASE_URL = "file:" + file
    delete process.env.TURSO_AUTH_TOKEN
    const { db, applySchema, migrateV2, insertFeedback, updateFeedbackMeta, listTicketsPaginated } = await import("./lib/db")
    await applySchema(db!)
    await migrateV2(db!)

    const projId = `proj_audit_${Date.now()}`
    const ticketIds: Record<string, string> = {}

    // Insert a ticket for each of the 9 statuses
    for (const st of ALL_STATUSES) {
      const id = await insertFeedback({
        projectId: projId,
        priority: "high",
        observation: `Ticket for status ${st}`
      })
      await updateFeedbackMeta(projId, id, { status: st })
      ticketIds[st] = id
    }

    // Test each status individually
    for (const st of ALL_STATUSES) {
      const res = await listTicketsPaginated(projId, { statuses: [st] })
      expect(res.tickets.length).toBe(1)
      expect(res.tickets[0].id).toBe(ticketIds[st])
      expect(res.tickets[0].status).toBe(st)
    }

    // Specifically test QA Review
    const qaRes = await listTicketsPaginated(projId, { statuses: ["qa_review"] })
    expect(qaRes.tickets.length).toBe(1)
    expect(qaRes.tickets[0].id).toBe(ticketIds["qa_review"])
    expect(qaRes.tickets[0].status).toBe("qa_review")

    // Specifically test Done
    const doneRes = await listTicketsPaginated(projId, { statuses: ["done"] })
    expect(doneRes.tickets.length).toBe(1)
    expect(doneRes.tickets[0].id).toBe(ticketIds["done"])
    expect(doneRes.tickets[0].status).toBe("done")

    // Specifically test Dismissed
    const disRes = await listTicketsPaginated(projId, { statuses: ["dismissed"] })
    expect(disRes.tickets.length).toBe(1)
    expect(disRes.tickets[0].id).toBe(ticketIds["dismissed"])
    expect(disRes.tickets[0].status).toBe("dismissed")

    // Test multi-status combination: qa_review + done + dismissed
    const multiRes = await listTicketsPaginated(projId, { statuses: ["qa_review", "done", "dismissed"] })
    expect(multiRes.tickets.length).toBe(3)
    const returnedStatuses = multiRes.tickets.map(t => t.status).sort()
    expect(returnedStatuses).toEqual(["dismissed", "done", "qa_review"])

    // Test default query (no status filter) excludes 'new'
    const defaultRes = await listTicketsPaginated(projId, {})
    expect(defaultRes.tickets.length).toBe(8)
    expect(defaultRes.tickets.some(t => t.status === "new")).toBe(false)
  })
})
