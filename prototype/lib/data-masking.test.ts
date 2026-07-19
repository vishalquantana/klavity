// prototype/lib/data-masking.test.ts — Hermetic unit tests for PII redaction.
// No DB / no network: pure function coverage only.
import { test, expect, describe } from "bun:test"
import {
  maskEmail, maskToken, maskPii, maskDeep,
  isMaskingEnabled, maskMemberExportRow, maskWalkReportData,
  type MemberExportRowLike,
} from "./data-masking"

// ---------------------------------------------------------------------------
// maskEmail
// ---------------------------------------------------------------------------
describe("maskEmail", () => {
  test("replaces a bare email address", () => {
    expect(maskEmail("Contact alice@example.com for details")).toBe("Contact [EMAIL] for details")
  })

  test("replaces multiple emails in one string", () => {
    const result = maskEmail("From: alice@example.com To: bob@corp.io")
    expect(result).toBe("From: [EMAIL] To: [EMAIL]")
  })

  test("handles subdomains and plus-addressing", () => {
    expect(maskEmail("user+tag@mail.example.org")).toBe("[EMAIL]")
  })

  test("does not corrupt plain text without emails", () => {
    expect(maskEmail("No emails here.")).toBe("No emails here.")
  })
})

// ---------------------------------------------------------------------------
// maskToken
// ---------------------------------------------------------------------------
describe("maskToken", () => {
  test("redacts a Bearer token", () => {
    const s = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    expect(maskToken(s)).toBe("Authorization: [TOKEN]")
  })

  test("redacts a JWT string (three-segment eyJ…)", () => {
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    expect(maskToken(`token=${jwt}`)).toBe("token=[TOKEN]")
  })

  test("redacts sk_/sk- prefixed API keys", () => {
    expect(maskToken("key: sk_live_abcdefghijklmnop")).toBe("key: [TOKEN]")
    expect(maskToken("secret-key: sk-abcdefghijklmnopqrst")).toBe("secret-key: [TOKEN]")
  })

  test("does not redact short sk- that are too short to be a key", () => {
    // Fewer than 16 chars after prefix — should NOT match
    expect(maskToken("sk-short")).toBe("sk-short")
  })
})

// ---------------------------------------------------------------------------
// maskPii — full spectrum
// ---------------------------------------------------------------------------
describe("maskPii", () => {
  test("redacts email", () => {
    expect(maskPii("user@example.com")).toBe("[EMAIL]")
  })

  test("redacts IPv4 address", () => {
    expect(maskPii("IP: 203.0.113.42")).toBe("IP: [IP]")
    expect(maskPii("127.0.0.1")).toBe("[IP]")
  })

  test("redacts phone number (US format)", () => {
    expect(maskPii("Call (415) 555-0100")).toBe("Call [PHONE]")
    expect(maskPii("Phone: 415-555-0100")).toBe("Phone: [PHONE]")
  })

  test("redacts credit card number", () => {
    expect(maskPii("Card: 4111 1111 1111 1111")).toBe("Card: [CC]")
    expect(maskPii("4111-1111-1111-1111")).toBe("[CC]")
  })

  test("redacts multiple PII types in one string", () => {
    const s = "User alice@acme.com called from 415-555-0100 at 203.0.113.9"
    const result = maskPii(s)
    expect(result).toContain("[EMAIL]")
    expect(result).toContain("[PHONE]")
    expect(result).toContain("[IP]")
    expect(result).not.toContain("alice@acme.com")
    expect(result).not.toContain("415-555-0100")
    expect(result).not.toContain("203.0.113.9")
  })

  test("leaves clean strings unchanged", () => {
    const s = "This report has no PII."
    expect(maskPii(s)).toBe(s)
  })
})

// ---------------------------------------------------------------------------
// maskDeep
// ---------------------------------------------------------------------------
describe("maskDeep", () => {
  test("masks strings inside a flat object", () => {
    const obj = { description: "Reporter: alice@example.com", count: 3 }
    const out = maskDeep(obj)
    expect(out.description).toBe("Reporter: [EMAIL]")
    expect(out.count).toBe(3) // non-string values pass through
  })

  test("masks strings inside nested objects", () => {
    const obj = { meta: { reporter: "bob@corp.io", ip: "10.0.0.1" } }
    const out = maskDeep(obj)
    expect(out.meta.reporter).toBe("[EMAIL]")
    expect(out.meta.ip).toBe("[IP]")
  })

  test("masks strings inside arrays", () => {
    const arr = ["alice@example.com", "no pii", "203.0.113.1"]
    const out = maskDeep(arr)
    expect(out[0]).toBe("[EMAIL]")
    expect(out[1]).toBe("no pii")
    expect(out[2]).toBe("[IP]")
  })

  test("passes through null, numbers, booleans", () => {
    expect(maskDeep(null)).toBe(null)
    expect(maskDeep(42)).toBe(42)
    expect(maskDeep(true)).toBe(true)
  })

  test("does not mask object KEYS, only values", () => {
    const obj = { "alice@example.com": "key-is-an-email" }
    const out = maskDeep(obj)
    expect(Object.keys(out)[0]).toBe("alice@example.com") // key unchanged
    expect(out["alice@example.com"]).toBe("key-is-an-email") // clean value unchanged
  })
})

// ---------------------------------------------------------------------------
// isMaskingEnabled
// ---------------------------------------------------------------------------
describe("isMaskingEnabled", () => {
  test("returns true when piiMasking is exactly true", () => {
    expect(isMaskingEnabled({ piiMasking: true })).toBe(true)
  })

  test("returns false for absent, false, or string values", () => {
    expect(isMaskingEnabled({})).toBe(false)
    expect(isMaskingEnabled({ piiMasking: false })).toBe(false)
    expect(isMaskingEnabled({ piiMasking: "yes" })).toBe(false)
    expect(isMaskingEnabled({ piiMasking: 1 })).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// maskMemberExportRow
// ---------------------------------------------------------------------------
describe("maskMemberExportRow", () => {
  const row: MemberExportRowLike = {
    email: "alice@acme.com",
    role: "admin",
    joined_at: "2026-01-15T00:00:00.000Z",
    status: "active",
  }

  test("redacts the email field", () => {
    const out = maskMemberExportRow(row)
    expect(out.email).toBe("[EMAIL]")
  })

  test("leaves non-email fields unchanged", () => {
    const out = maskMemberExportRow(row)
    expect(out.role).toBe("admin")
    expect(out.joined_at).toBe("2026-01-15T00:00:00.000Z")
    expect(out.status).toBe("active")
  })

  test("does not mutate the original row", () => {
    maskMemberExportRow(row)
    expect(row.email).toBe("alice@acme.com")
  })
})

// ---------------------------------------------------------------------------
// maskWalkReportData
// ---------------------------------------------------------------------------
describe("maskWalkReportData", () => {
  const sampleData = {
    trail: { id: "trail_1", name: "Login flow", intent: "Verify login" },
    walk: { id: "walk_1", status: "green" },
    steps: [
      { id: "s1", evidence: { description: "Typed alice@corp.com into the email field", screenshotKey: "shot_1" } },
      { id: "s2", evidence: null },
    ],
    findings: [
      {
        id: "f1",
        title: "Login failed for user@acme.com with token Bearer sk-abcdef1234567890abcdef",
        groundQuote: "Error shown to user@acme.com: auth failed",
        evidence: { detail: "IP: 10.0.0.99, caller: admin@acme.com" },
      },
    ],
    judgment: {
      verdicts: [{ findingId: "f1", verdict: "valid", confidence: 0.9, rationale: "Confirmed fail for user@acme.com" }],
      overallNote: "Critical regression for user@acme.com",
    },
  }

  test("masks email in finding title", () => {
    const out = maskWalkReportData(sampleData)
    expect(out.findings[0].title).not.toContain("user@acme.com")
    expect(out.findings[0].title).toContain("[EMAIL]")
  })

  test("masks email in finding groundQuote", () => {
    const out = maskWalkReportData(sampleData)
    expect(out.findings[0].groundQuote).toContain("[EMAIL]")
    expect(out.findings[0].groundQuote).not.toContain("user@acme.com")
  })

  test("masks email and token in finding evidence", () => {
    const out = maskWalkReportData(sampleData)
    const ev = out.findings[0].evidence as Record<string, string>
    expect(ev.detail).toContain("[IP]")
    expect(ev.detail).toContain("[EMAIL]")
    expect(ev.detail).not.toContain("admin@acme.com")
    expect(ev.detail).not.toContain("10.0.0.99")
  })

  test("masks email in step evidence", () => {
    const out = maskWalkReportData(sampleData)
    const ev = out.steps[0].evidence as Record<string, string>
    expect(ev.description).toContain("[EMAIL]")
    expect(ev.description).not.toContain("alice@corp.com")
  })

  test("passes through null step evidence", () => {
    const out = maskWalkReportData(sampleData)
    expect(out.steps[1].evidence).toBeNull()
  })

  test("masks email in judgment rationale and overallNote", () => {
    const out = maskWalkReportData(sampleData)
    expect(out.judgment!.verdicts[0].rationale).toContain("[EMAIL]")
    expect(out.judgment!.overallNote).toContain("[EMAIL]")
    expect(out.judgment!.overallNote).not.toContain("user@acme.com")
  })

  test("handles missing judgment gracefully", () => {
    const data = { ...sampleData, judgment: null }
    const out = maskWalkReportData(data)
    expect(out.judgment).toBeNull()
  })

  test("handles undefined judgment gracefully", () => {
    const { judgment: _, ...data } = sampleData
    const out = maskWalkReportData(data as typeof sampleData)
    expect(out.judgment).toBeUndefined()
  })

  test("does not mutate the original data", () => {
    maskWalkReportData(sampleData)
    expect(sampleData.findings[0].title).toContain("user@acme.com")
    expect(sampleData.steps[0].evidence!.description).toContain("alice@corp.com")
  })
})
