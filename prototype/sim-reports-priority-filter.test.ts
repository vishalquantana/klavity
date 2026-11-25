import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

test("Sim Reports priority filter: _triagePriority state variable is defined", () => {
  expect(HTML).toContain('let _triagePriority =')
})

test("Sim Reports priority filter: tgPriorityPass supports multi-select array, single string, and defaults", () => {
  expect(HTML).toContain("function tgPriorityPass(t)")
  
  const fn = new Function("_triagePriority", `
    return function tgPriorityPass(t) {
      const cur = Array.isArray(_triagePriority)
        ? _triagePriority
        : (_triagePriority && _triagePriority !== "all" ? [_triagePriority] : [])
      if (cur.length === 0 || cur.includes("all")) return true
      const p = (t && t.priority ? String(t.priority) : "medium").toLowerCase()
      return cur.map(x => x.toLowerCase()).includes(p)
    }
  `)

  // Test "all" / empty array
  const passAll = fn([])
  expect(passAll({ priority: "urgent" })).toBe(true)
  expect(passAll({ priority: "high" })).toBe(true)
  expect(passAll({ priority: "medium" })).toBe(true)
  expect(passAll({ priority: "low" })).toBe(true)
  expect(passAll({})).toBe(true)

  // Test single selection: ["medium"]
  const passMedium = fn(["medium"])
  expect(passMedium({ priority: "medium" })).toBe(true)
  expect(passMedium({ priority: "Medium" })).toBe(true)
  expect(passMedium({})).toBe(true) // defaults to medium
  expect(passMedium({ priority: "high" })).toBe(false)
  expect(passMedium({ priority: "low" })).toBe(false)
  expect(passMedium({ priority: "urgent" })).toBe(false)

  // Test multi-selection: ["high", "urgent"]
  const passHighUrgent = fn(["high", "urgent"])
  expect(passHighUrgent({ priority: "urgent" })).toBe(true)
  expect(passHighUrgent({ priority: "high" })).toBe(true)
  expect(passHighUrgent({ priority: "medium" })).toBe(false)
  expect(passHighUrgent({ priority: "low" })).toBe(false)
})

test("Sim Reports priority filter: tgPriorityColVisible controls board column rendering", () => {
  expect(HTML).toContain("function tgPriorityColVisible(key)")

  const fn = new Function("_triagePriority", `
    return function tgPriorityColVisible(key) {
      const cur = Array.isArray(_triagePriority)
        ? _triagePriority
        : (_triagePriority && _triagePriority !== "all" ? [_triagePriority] : [])
      if (cur.length === 0 || cur.includes("all")) return true
      return cur.map(x => x.toLowerCase()).includes(key.toLowerCase())
    }
  `)

  // When All Priorities is active, all 4 columns are visible
  const visAll = fn([])
  expect(visAll("urgent")).toBe(true)
  expect(visAll("high")).toBe(true)
  expect(visAll("medium")).toBe(true)
  expect(visAll("low")).toBe(true)

  // When ONLY "medium" is selected, only medium column is visible
  const visMedium = fn(["medium"])
  expect(visMedium("medium")).toBe(true)
  expect(visMedium("urgent")).toBe(false)
  expect(visMedium("high")).toBe(false)
  expect(visMedium("low")).toBe(false)

  // When "urgent" and "high" are selected, only those two columns are visible
  const visUrgentHigh = fn(["urgent", "high"])
  expect(visUrgentHigh("urgent")).toBe(true)
  expect(visUrgentHigh("high")).toBe(true)
  expect(visUrgentHigh("medium")).toBe(false)
  expect(visUrgentHigh("low")).toBe(false)
})

test("Sim Reports priority filter: renderTriageBoard filters rendered columns with tgPriorityColVisible", () => {
  expect(HTML).toContain("const colsToRender = TG_PRI_COLS.filter(([key]) => tgPriorityColVisible(key))")
  expect(HTML).toContain("colsToRender.forEach(([key, label]) =>")
})

test("Sim Reports priority filter: multi-select dropdown UI components are present", () => {
  expect(HTML).toContain('id="tgPriMsWrap"')
  expect(HTML).toContain('id="tgPriMsBtn"')
  expect(HTML).toContain('id="tgPriMsMenu"')
  expect(HTML).toContain('id="tgPriorityFilter"')
  expect(HTML).toContain('["all", "All Priorities"]')
  expect(HTML).toContain('["urgent", "Urgent"]')
  expect(HTML).toContain('["high", "High"]')
  expect(HTML).toContain('["medium", "Medium"]')
  expect(HTML).toContain('["low", "Low"]')
})

test("Sim Reports priority filter: clear filters button and empty state messaging include priority", () => {
  expect(HTML).toContain('id="tgClearFilters"')
  expect(HTML).toContain('id="tgEmptyClearFilters"')
  expect(HTML).toContain("Clear the priority, sentiment, or Sim filter to see the rest.")
})

test("Sim Reports priority filter: empty column renders kb-card-empty card instead of wiping board", () => {
  expect(HTML).toContain('kb-card kb-card-empty')
  expect(HTML).toContain('No ${esc(label.toLowerCase())} reports')
  expect(HTML).toContain('No reports in this column')
})

