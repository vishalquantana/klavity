import { test, expect } from "bun:test"
import { ticketKeyLabel } from "./ticket-key-label"

test("tickets: KEY-n with a project key, #n without", () => {
  expect(ticketKeyLabel({ ticketKey: "KD", seqNum: 232, status: "open" })).toBe("KD-232")
  expect(ticketKeyLabel({ ticketKey: null, seqNum: 232, status: "open" })).toBe("#232")
})

test("untriaged Sim Reports use their own SIM number; accepted ones use the ticket number", () => {
  expect(ticketKeyLabel({ ticketKey: "KD", simSeqNum: 12, seqNum: null, status: "new" })).toBe("KD-SIM-12")
  expect(ticketKeyLabel({ ticketKey: null, simSeqNum: 12, status: "new" })).toBe("SIM-12")
  expect(ticketKeyLabel({ ticketKey: "KD", simSeqNum: 12, seqNum: 95, status: "new" })).toBe("KD-SIM-12")
  expect(ticketKeyLabel({ ticketKey: "KD", simSeqNum: 12, seqNum: 95, status: "open" })).toBe("KD-95")
})

test("no number yet → null (never an internal id)", () => {
  expect(ticketKeyLabel({ ticketKey: "KD", seqNum: null, simSeqNum: null, status: "open" })).toBeNull()
})
