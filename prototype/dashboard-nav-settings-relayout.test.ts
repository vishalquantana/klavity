// Guards for the nav/settings relayout lane:
//  #710 Tickets promoted directly after "New reports" (triage) in the sidebar order
//  #711 "Bugs by page" renamed to "Sim Reports" (nav label + view heading)
//  #712 Settings view uses a two-column (heading-left / controls-right) layout
//  #713 "Getting started" removed from the sidebar
// String-assertion style, matching the other dashboard-*.test.ts guards — the rendered sidebar order
// is driven by the VIEWS array (normalizeSidebar re-inserts each nav button in VIEWS order), so we
// assert against that source-of-truth array rather than DOM order.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

function viewsArray(): string[] {
  const m = HTML.match(/var VIEWS=\[([^\]]*)\]/)
  if (!m) throw new Error("VIEWS array not found")
  return m[1].split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
}

test("#710 rendered sidebar order puts Tickets immediately after New reports (triage)", () => {
  const v = viewsArray()
  const iTriage = v.indexOf("triage")
  const iTickets = v.indexOf("tickets")
  const iSims = v.indexOf("sims")
  expect(iTriage).toBeGreaterThanOrEqual(0)
  expect(iTickets).toBe(iTriage + 1) // directly after New reports
  expect(iTickets).toBeLessThan(iSims) // and before Sims
})

test("#713 Getting started is gone from the sidebar (VIEWS + nav button)", () => {
  expect(viewsArray()).not.toContain("getting-started")
  expect(HTML).not.toContain('data-go="getting-started"')
  expect(HTML).not.toContain("nv-getting-started")
})

test("#711 pagebugs nav label and view heading read 'Sim Reports' (routing key unchanged)", () => {
  // routing key preserved
  expect(HTML).toContain('data-go="pagebugs"')
  // nav label + card heading renamed
  expect(HTML).toContain("</svg></span>Sim Reports</button>")
  expect(HTML).toContain("Sim Reports\n      </h2>")
  // old label fully retired from user-facing copy
  expect(HTML).not.toContain(">Bugs by page</button>")
})

test("#712 Settings view has a scoped two-column layout for its sections", () => {
  // the re-layout is CSS scoped to the settings view so shared drawers keep their accordion look elsewhere
  expect(HTML).toContain('body[data-view="settings"] details.drawer[data-view~="settings"]')
  expect(HTML).toContain("grid-template-columns:minmax(220px,34%) minmax(0,1fr)")
  // responsive single-column stack
  expect(HTML).toContain("@media (max-width:760px){")
})
