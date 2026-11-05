// Tickets → "Deleted" opens the deleted-tickets bin (list + Restore), and delete copy no longer says "cannot be undone".
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")

test("the Tickets toolbar has a Deleted button wired to the bin", () => {
  expect(HTML).toContain('id="deletedTicketsBtn"')
  expect(HTML).toContain('getElementById("deletedTicketsBtn"); if (b) b.addEventListener("click", openDeletedTickets)')
})

test("the bin lists from and restores through the new endpoints", () => {
  expect(HTML).toContain('"/tickets/deleted", { credentials: "include" }')
  expect(HTML).toContain('"/tickets/deleted/" + encodeURIComponent(fid) + "/restore", { method: "POST"')
  // A restore reloads the board so the ticket reappears.
  expect(HTML).toMatch(/_tktBoardLoadedPid = null\s*\n\s*try \{ await load\(\) \}/)
})

test("ticket delete confirmations point to the bin instead of 'cannot be undone'", () => {
  expect(HTML).not.toContain("will be permanently deleted. This action cannot be undone.")
  expect(HTML).toContain("will be moved to Deleted tickets, where you can restore it for 30 days.")
})
