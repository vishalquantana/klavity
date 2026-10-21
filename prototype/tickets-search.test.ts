import { test, expect, describe, beforeAll } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

describe("QA Audit: Ticket Search by ID & Multi-field Search Scenarios", () => {
  test("Frontend: tktMatchesSelectFilters searches seqNum, #seqNum, and formatted key", () => {
    expect(html).toContain('const seqStr = t.seqNum != null ? String(t.seqNum) : ""')
    expect(html).toContain('const hashSeq = seqStr ? ("#" + seqStr) : ""')
    expect(html).toContain('const displayKey = (tktKey && seqStr) ? (tktKey + "-" + seqStr) : hashSeq')
    expect(html).toContain('matchesNum = Boolean(numOnly && seqStr && (seqStr === numOnly || seqStr.includes(numOnly)))')
  })

  test("Frontend: kanbanSearch is bound in tktFilterBarBind for both board and list views", () => {
    expect(html).toContain('const searchEl = document.getElementById("kanbanSearch")')
    expect(html).toContain('searchEl.value = _tktFilters.search || ""')
    expect(html).toContain('if (!_kbSearchBound)')
    expect(html).toContain('searchEl.addEventListener("input"')
  })

  test("Frontend: search supports Enter to submit immediately and Escape to clear", () => {
    expect(html).toContain('if (e.key === "Enter")')
    expect(html).toContain('else if (e.key === "Escape")')
  })

  test("Frontend: client-side filter logic handles all ID search scenarios", () => {
    // Simulate tktMatchesSelectFilters
    const simulateFilter = (t: any, query: string) => {
      const f = { search: query }
      const rawQ = String(f.search).trim().toLowerCase()
      if (!rawQ) return true

      const numMatch = rawQ.match(/^(?:[a-z0-9_-]+[-_#\s]+)?#?(\d+)$/)
      const numOnly = numMatch ? numMatch[1] : ""
      let bug = ""
      try { bug = t.suggestedBug ? (typeof t.suggestedBug === "string" ? t.suggestedBug : JSON.stringify(t.suggestedBug)) : "" } catch { bug = "" }
      const labNames = Array.isArray(t.labels) ? t.labels.map((l: any) => (typeof l === "object" && l ? (l.name || l.label || "") : String(l))).join(" ") : ""
      const seqStr = t.seqNum != null ? String(t.seqNum) : ""
      const hashSeq = seqStr ? ("#" + seqStr) : ""
      const tktKey = t.ticketKey || "KD"
      const displayKey = (tktKey && seqStr) ? (tktKey + "-" + seqStr) : hashSeq
      const hay = [
        t.title,
        t.key,
        displayKey,
        hashSeq,
        seqStr,
        t.id,
        t.planeIssueKey,
        t.assignee,
        t.reporterEmail,
        t.actorEmail,
        t.contactEmail,
        t.observation,
        t.notes,
        bug,
        labNames
      ].filter(Boolean).join(" \n ").toLowerCase()

      const matchesHay = hay.includes(rawQ)
      const matchesNum = Boolean(numOnly && seqStr && (seqStr === numOnly || seqStr.includes(numOnly)))
      return Boolean(matchesHay || matchesNum)
    }

    const ticket981 = {
      id: "fb_a793db0f-a2f6-48cd-b1d3-e52743a64e82",
      seqNum: 981,
      ticketKey: "KD",
      key: "KD-981",
      title: "Implement AI-driven automated ticket creation from recorded videos",
      observation: "Feature request for video recording extraction",
      notes: "Sprint 42 feature",
      assignee: "alice@example.com",
      reporterEmail: "bob@example.com",
      labels: [{ name: "AI/ML" }]
    }

    const ticket100 = {
      id: "fb_11112222-3333-4444-5555-666677778888",
      seqNum: 100,
      ticketKey: "KD",
      key: "KD-100",
      title: "Fix login button click handler",
      observation: "Button not responding",
      assignee: "charlie@example.com"
    }

    // 1. Raw numeric ID search: 981
    expect(simulateFilter(ticket981, "981")).toBe(true)
    expect(simulateFilter(ticket100, "981")).toBe(false)

    // 2. Hash prefixed ID search: #981
    expect(simulateFilter(ticket981, "#981")).toBe(true)
    expect(simulateFilter(ticket100, "#981")).toBe(false)

    // 3. Project key prefixed search: KD-981 & lowercase kd-981
    expect(simulateFilter(ticket981, "KD-981")).toBe(true)
    expect(simulateFilter(ticket981, "kd-981")).toBe(true)
    expect(simulateFilter(ticket100, "KD-981")).toBe(false)

    // 4. Whitespace padded query: "  981  "
    expect(simulateFilter(ticket981, "   981   ")).toBe(true)
    expect(simulateFilter(ticket981, "   #981   ")).toBe(true)

    // 5. Partial sequence ID: "98" matches 981
    expect(simulateFilter(ticket981, "98")).toBe(true)
    expect(simulateFilter(ticket100, "98")).toBe(false)

    // 6. Alphanumeric internal ID: "fb_a793"
    expect(simulateFilter(ticket981, "fb_a793")).toBe(true)
    expect(simulateFilter(ticket100, "fb_a793")).toBe(false)

    // 7. Full UUID internal ID
    expect(simulateFilter(ticket981, "fb_a793db0f-a2f6-48cd-b1d3-e52743a64e82")).toBe(true)

    // 8. Title search
    expect(simulateFilter(ticket981, "AI-driven automated")).toBe(true)
    expect(simulateFilter(ticket100, "AI-driven automated")).toBe(false)

    // 9. Observation search
    expect(simulateFilter(ticket981, "video recording")).toBe(true)
    expect(simulateFilter(ticket100, "video recording")).toBe(false)

    // 10. Notes search
    expect(simulateFilter(ticket981, "Sprint 42")).toBe(true)

    // 11. Assignee search
    expect(simulateFilter(ticket981, "alice@example.com")).toBe(true)
    expect(simulateFilter(ticket981, "alice")).toBe(true)
    expect(simulateFilter(ticket100, "alice")).toBe(false)

    // 12. Reporter search
    expect(simulateFilter(ticket981, "bob@example.com")).toBe(true)
    expect(simulateFilter(ticket100, "bob@example.com")).toBe(false)

    // 13. Label search
    expect(simulateFilter(ticket981, "AI/ML")).toBe(true)
    expect(simulateFilter(ticket100, "AI/ML")).toBe(false)

    // 14. Non-existing search query
    expect(simulateFilter(ticket981, "9999999")).toBe(false)
    expect(simulateFilter(ticket100, "9999999")).toBe(false)

    // 15. Empty query matches all
    expect(simulateFilter(ticket981, "")).toBe(true)
    expect(simulateFilter(ticket100, "")).toBe(true)
    expect(simulateFilter(ticket981, "   ")).toBe(true)
  })
})

describe("Database & Backend: Ticket Search by ID and Metadata", () => {
  let db: any
  let applySchema: any
  let migrateV2: any
  let insertFeedback: any
  let updateFeedbackMeta: any
  let listTicketsPaginated: any
  let projIdA: string
  let projIdB: string
  let ticketId981: string
  let ticketId100: string
  let projBTicketId: string

  beforeAll(async () => {
    const file = join(tmpdir(), `klav-search-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
    process.env.TURSO_DATABASE_URL = "file:" + file
    delete process.env.TURSO_AUTH_TOKEN
    const mod = await import("./lib/db")
    db = mod.db
    applySchema = mod.applySchema
    migrateV2 = mod.migrateV2
    insertFeedback = mod.insertFeedback
    updateFeedbackMeta = mod.updateFeedbackMeta
    listTicketsPaginated = mod.listTicketsPaginated

    await applySchema(db!)
    await migrateV2(db!)

    projIdA = `proj_search_a_${Date.now()}`
    projIdB = `proj_search_b_${Date.now()}`

    // Insert project rows with ticket keys
    const now = Date.now()
    await db!.execute({
      sql: "INSERT INTO projects (id, account_id, name, ticket_key, ticket_seq, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [projIdA, "acc_test_a", "Search Test Project A", "KD", 1000, now, now]
    })
    await db!.execute({
      sql: "INSERT INTO projects (id, account_id, name, ticket_key, ticket_seq, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [projIdB, "acc_test_b", "Search Test Project B", "OTHER", 1000, now, now]
    })

    // Insert ticket 981 in Project A
    ticketId981 = await insertFeedback({
      projectId: projIdA,
      title: "Implement AI-driven automated ticket creation from recorded videos",
      observation: "Feature request: analyze recorded videos to create tickets",
      priority: "high",
      actorEmail: "reporter@example.com"
    })
    await db!.execute({
      sql: "UPDATE feedback SET seq_num=981, status='open', assignee='developer@example.com' WHERE id=?",
      args: [ticketId981]
    })

    // Insert ticket 100 in Project A with different text
    ticketId100 = await insertFeedback({
      projectId: projIdA,
      title: "Fix navigation dropdown layout on mobile screens",
      observation: "Menu cuts off on viewport < 380px",
      priority: "medium",
      actorEmail: "qa@example.com"
    })
    await db!.execute({
      sql: "UPDATE feedback SET seq_num=100, status='in_progress', assignee='designer@example.com' WHERE id=?",
      args: [ticketId100]
    })

    // Insert ticket in Project B also with seq_num 981 to test tenant scoping
    projBTicketId = await insertFeedback({
      projectId: projIdB,
      title: "Project B Ticket 981",
      observation: "Confidential Project B ticket with same sequence",
      priority: "low"
    })
    await db!.execute({
      sql: "UPDATE feedback SET seq_num=981, status='open' WHERE id=?",
      args: [projBTicketId]
    })
  })

  test("Search by exact numeric sequence number: 981", async () => {
    const res = await listTicketsPaginated(projIdA, { search: "981" })
    expect(res.tickets.length).toBe(1)
    expect(res.tickets[0].id).toBe(ticketId981)
    expect(res.tickets[0].seqNum).toBe(981)
    expect(res.tickets[0].ticketKey).toBe("KD")
    expect(res.tickets[0].key).toBe("KD-981")
  })

  test("Search by # prefixed sequence number: #981", async () => {
    const res = await listTicketsPaginated(projIdA, { search: "#981" })
    expect(res.tickets.length).toBe(1)
    expect(res.tickets[0].id).toBe(ticketId981)
    expect(res.tickets[0].seqNum).toBe(981)
  })

  test("Search by project key + sequence number: KD-981 and kd-981", async () => {
    const resUpper = await listTicketsPaginated(projIdA, { search: "KD-981" })
    expect(resUpper.tickets.length).toBe(1)
    expect(resUpper.tickets[0].id).toBe(ticketId981)

    const resLower = await listTicketsPaginated(projIdA, { search: "kd-981" })
    expect(resLower.tickets.length).toBe(1)
    expect(resLower.tickets[0].id).toBe(ticketId981)
  })

  test("Search with leading and trailing whitespace: '   981   '", async () => {
    const res = await listTicketsPaginated(projIdA, { search: "   981   " })
    expect(res.tickets.length).toBe(1)
    expect(res.tickets[0].id).toBe(ticketId981)
  })

  test("Search by partial sequence number: 98 matches 981", async () => {
    const res = await listTicketsPaginated(projIdA, { search: "98" })
    expect(res.tickets.some(t => t.id === ticketId981)).toBe(true)
  })

  test("Search by internal ticket ID prefix: fb_...", async () => {
    const prefix = ticketId981.slice(0, 10)
    const res = await listTicketsPaginated(projIdA, { search: prefix })
    expect(res.tickets.length).toBe(1)
    expect(res.tickets[0].id).toBe(ticketId981)
  })

  test("Search by full internal ticket ID", async () => {
    const res = await listTicketsPaginated(projIdA, { search: ticketId981 })
    expect(res.tickets.length).toBe(1)
    expect(res.tickets[0].id).toBe(ticketId981)
  })

  test("Search by title, observation, assignee, and reporter", async () => {
    // Title
    const titleRes = await listTicketsPaginated(projIdA, { search: "AI-driven automated" })
    expect(titleRes.tickets.length).toBe(1)
    expect(titleRes.tickets[0].id).toBe(ticketId981)

    // Observation
    const obsRes = await listTicketsPaginated(projIdA, { search: "viewport < 380px" })
    expect(obsRes.tickets.length).toBe(1)
    expect(obsRes.tickets[0].id).toBe(ticketId100)

    // Assignee
    const assRes = await listTicketsPaginated(projIdA, { search: "developer@example.com" })
    expect(assRes.tickets.length).toBe(1)
    expect(assRes.tickets[0].id).toBe(ticketId981)

    // Reporter
    const repRes = await listTicketsPaginated(projIdA, { search: "qa@example.com" })
    expect(repRes.tickets.length).toBe(1)
    expect(repRes.tickets[0].id).toBe(ticketId100)
  })

  test("Search for a non-existing ticket ID: 999999", async () => {
    const res = await listTicketsPaginated(projIdA, { search: "999999" })
    expect(res.total).toBe(0)
    expect(res.tickets.length).toBe(0)
  })

  test("Search combined with status filter (AND logic)", async () => {
    // Both 981 and 100 exist in projIdA; 981 is 'open', 100 is 'in_progress'
    const openRes = await listTicketsPaginated(projIdA, { search: "981", statuses: ["open"] })
    expect(openRes.tickets.length).toBe(1)
    expect(openRes.tickets[0].id).toBe(ticketId981)

    const inProgRes = await listTicketsPaginated(projIdA, { search: "981", statuses: ["in_progress"] })
    expect(inProgRes.tickets.length).toBe(0)
  })

  test("Search combined with priority filter", async () => {
    // 981 is high priority
    const highRes = await listTicketsPaginated(projIdA, { search: "981", priorities: ["high"] })
    expect(highRes.tickets.length).toBe(1)

    const lowRes = await listTicketsPaginated(projIdA, { search: "981", priorities: ["low"] })
    expect(lowRes.tickets.length).toBe(0)
  })

  test("Project scoping: search for 981 in Project A never returns Project B ticket", async () => {
    const resA = await listTicketsPaginated(projIdA, { search: "981" })
    expect(resA.tickets.length).toBe(1)
    expect(resA.tickets[0].id).toBe(ticketId981)
    expect(resA.tickets[0].id).not.toBe(projBTicketId)

    const resB = await listTicketsPaginated(projIdB, { search: "981" })
    expect(resB.tickets.length).toBe(1)
    expect(resB.tickets[0].id).toBe(projBTicketId)
    expect(resB.tickets[0].id).not.toBe(ticketId981)
  })

  test("Empty search returns all tickets in project", async () => {
    const res = await listTicketsPaginated(projIdA, { search: "" })
    expect(res.tickets.length).toBe(2)
  })

  test("Numeric search does not falsely match random hex digits in internal UUID", async () => {
    // Create a ticket with seq_num 156 and an internal ID containing '16'
    const hexId = "fb_521aa47b-eb52-4b6d-a825-f215f169ec5a"
    await db!.execute({
      sql: "INSERT OR REPLACE INTO feedback (id, project_id, title, observation, seq_num, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [hexId, projIdA, "Voice-to-text widget issue", "Widget issue description", 156, "open", Date.now()]
    })

    // Searching '16' should NOT match KD-156 purely because its UUID contains '16'
    const res16 = await listTicketsPaginated(projIdA, { search: "16" })
    const matched156 = res16.tickets.find((t: any) => t.id === hexId)
    expect(matched156).toBeUndefined()

    // But searching by internal ID prefix or exact ID DOES match it
    const resUuid = await listTicketsPaginated(projIdA, { search: "fb_521aa47b" })
    expect(resUuid.tickets.length).toBe(1)
    expect(resUuid.tickets[0].id).toBe(hexId)

    const resExact = await listTicketsPaginated(projIdA, { search: hexId })
    expect(resExact.tickets.length).toBe(1)
    expect(resExact.tickets[0].id).toBe(hexId)

    // And searching 156 matches KD-156
    const res156 = await listTicketsPaginated(projIdA, { search: "156" })
    expect(res156.tickets.some((t: any) => t.id === hexId)).toBe(true)
  })
})

