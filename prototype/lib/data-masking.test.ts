// prototype/lib/data-masking.test.ts — Hermetic unit tests for PII redaction.
// No DB / no network: pure function coverage only.
import { test, expect, describe } from "bun:test"
import {
  maskEmail, maskToken, maskPii, maskDeep,
  isMaskingEnabled, maskMemberExportRow, maskEmailPartial, maskWalkReportData,
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
// H2 — mask ORDERING. Emails must be redacted before the numeric patterns, or a
// narrower pass eats half the address and the other half survives verbatim.
// ---------------------------------------------------------------------------
describe("maskPii — ordering (H2 regression)", () => {
  test("an IP-literal domain does not leak the name half", () => {
    const out = maskPii("firstname.lastname@172.16.0.9")
    expect(out).toBe("[EMAIL]")
    expect(out).not.toContain("firstname")
    expect(out).not.toContain("lastname")
  })

  test("a phone-shaped local part does not leak the domain half", () => {
    const out = maskPii("4155550100@example.com")
    expect(out).toBe("[EMAIL]")
    expect(out).not.toContain("example.com")
  })

  test("both broken forms stay clean inside surrounding prose", () => {
    const out = maskPii("Reported by firstname.lastname@172.16.0.9 and 4155550100@example.com")
    expect(out).toBe("Reported by [EMAIL] and [EMAIL]")
  })
})

// ---------------------------------------------------------------------------
// M3 — TOKEN_RE must not eat ordinary snake_case identifiers / CSS selectors.
// ---------------------------------------------------------------------------
describe("maskPii — does not corrupt selectors (M3 regression)", () => {
  test("an api_-prefixed CSS selector survives verbatim", () => {
    expect(maskPii("#api_reference_guide_container")).toBe("#api_reference_guide_container")
  })

  test("a healed-selector diff stays actionable (not '- [TOKEN] / + [TOKEN]')", () => {
    const diff = "- #api_reference_guide_container\n+ #api_reference_guide_wrapper"
    expect(maskPii(diff)).toBe(diff)
  })

  test("other ordinary snake_case identifiers survive", () => {
    for (const s of [
      "token_refresh_button_wrapper",
      "secret_santa_modal_container",
      "div[data-testid='api_settings_panel_root']",
    ]) {
      expect(maskPii(s)).toBe(s)
    }
  })

  test("real secrets are still caught despite the tightening", () => {
    expect(maskPii("api_key: A1b2C3d4E5f6G7h8I9j0")).toContain("[TOKEN]")
    expect(maskPii("key: sk_live_abcdefghijklmnop")).toBe("key: [TOKEN]")
  })

  test("selector-ish evidence keys are spared by maskDeep but still lose emails", () => {
    const out = maskDeep({
      selector: "#api_reference_guide_container",
      fromSelector: "#user_4155550100_row",
      toSelector: "#user_row",
      note: "raised by alice@acme.com",
    })
    expect(out.selector).toBe("#api_reference_guide_container")
    expect(out.fromSelector).toBe("#user_4155550100_row")
    expect(out.toSelector).toBe("#user_row")
    expect(out.note).toBe("raised by [EMAIL]")
  })
})

// ---------------------------------------------------------------------------
// M5/M6 — vendor secret shapes + non-US PII coverage.
// ---------------------------------------------------------------------------
describe("maskPii — vendor secret coverage (M5)", () => {
  test("GitHub tokens (ghp_/gho_/ghs_)", () => {
    expect(maskPii("ghp_abcdefghijklmnopqrstuvwxyz0123456789")).toBe("[TOKEN]")
    expect(maskPii("gho_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")).toBe("[TOKEN]")
    expect(maskPii("token=ghs_abcdefghijklmnopqrstuvwxyz012345")).toContain("[TOKEN]")
  })

  test("AWS access key ids", () => {
    expect(maskPii("AKIAIOSFODNN7EXAMPLE")).toBe("[TOKEN]")
    expect(maskPii("creds ASIAIOSFODNN7EXAMPLE here")).toBe("creds [TOKEN] here")
  })

  test("Slack bot/user tokens", () => {
    expect(maskPii("xoxb-123456789012-abcdefghijkl")).toBe("[TOKEN]")
    expect(maskPii("xoxp-123456789012-abcdefghijkl")).toBe("[TOKEN]")
  })

  test("Google API keys are redacted, not mangled into [PHONE]", () => {
    const out = maskPii("AIzaSyD-1234567890abc")
    expect(out).toBe("[TOKEN]")
    expect(out).not.toContain("[PHONE]")
    expect(out).not.toContain("AIzaSyD")
  })
})

describe("maskPii — non-US PII coverage (M6)", () => {
  test("+91 Indian mobile numbers", () => {
    expect(maskPii("+91 98765 43210")).toBe("[PHONE]")
    expect(maskPii("reach me on +919876543210")).toBe("reach me on [PHONE]")
  })

  test("bare 10-digit Indian mobile", () => {
    expect(maskPii("9876543210")).toBe("[PHONE]")
    expect(maskPii("call 7012345678 today")).toBe("call [PHONE] today")
  })

  test("US SSN", () => {
    expect(maskPii("SSN 123-45-6789")).toBe("SSN [SSN]")
  })

  test("IPv6 addresses (full and compressed)", () => {
    expect(maskPii("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe("[IP]")
    expect(maskPii("from fe80::1 port 80")).toBe("from [IP] port 80")
  })
})

// ---------------------------------------------------------------------------
// M4 — numeric FALSE POSITIVES. Over-masking corrupts reports just as badly as
// under-masking leaks them.
// ---------------------------------------------------------------------------
describe("maskPii — numeric false positives (M4 regression)", () => {
  test("10-digit Unix epochs are not phone numbers", () => {
    expect(maskPii("ts=1753000000")).toBe("ts=1753000000")
    expect(maskPii("started at 1700000000 and ended at 1700003600")).toBe(
      "started at 1700000000 and ended at 1700003600",
    )
  })

  test("4-part version strings are not IP addresses", () => {
    expect(maskPii("v1.2.3.4")).toBe("v1.2.3.4")
    expect(maskPii("app version 1.2.3.4")).toBe("app version 1.2.3.4")
    expect(maskPii("build 10.0.19041.1")).toBe("build 10.0.19041.1")
  })

  test("a 16-digit build/order id that fails Luhn is not a credit card", () => {
    expect(maskPii("order 4816273649283746")).toBe("order 4816273649283746")
    expect(maskPii("build_id 1234567812345678")).toBe("build_id 1234567812345678")
  })

  test("real, Luhn-valid card numbers are still redacted", () => {
    expect(maskPii("4111111111111111")).toBe("[CC]")
    expect(maskPii("Card: 4111 1111 1111 1111")).toBe("Card: [CC]")
  })

  test("timestamps are not IPv6 addresses", () => {
    expect(maskPii("failed at 12:34:56")).toBe("failed at 12:34:56")
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

  test("partially redacts the email field (local part hidden, domain kept)", () => {
    const out = maskMemberExportRow(row)
    expect(out.email).not.toBe("alice@acme.com")
    expect(out.email).not.toContain("alice")
    expect(out.email).toStartWith("a***")
    expect(out.email).toEndWith("@acme.com")
  })

  // M7: a blanket "[EMAIL]" made every roster row identical, and email is the ONLY identifier the
  // export carries (allow-list = email/role/joined_at/status) — the CSV became unusable.
  test("keeps two different members DISTINGUISHABLE after masking", () => {
    const a = maskMemberExportRow({ ...row, email: "alice@acme.com" })
    const b = maskMemberExportRow({ ...row, email: "bob@acme.com" })
    expect(a.email).not.toBe(b.email)
  })

  test("keeps members distinguishable even when they share a first letter and domain", () => {
    const a = maskEmailPartial("alice@acme.com")
    const b = maskEmailPartial("albert@acme.com")
    expect(a).not.toBe(b)
    expect(a).toStartWith("a***")
    expect(b).toStartWith("a***")
  })

  test("the mask is STABLE — the same address always masks to the same value", () => {
    expect(maskEmailPartial("alice@acme.com")).toBe(maskEmailPartial("alice@acme.com"))
  })

  test("falls back to full redaction for a value that is not an address", () => {
    expect(maskEmailPartial("not-an-email")).toBe("[EMAIL]")
    expect(maskEmailPartial("")).toBe("")
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
