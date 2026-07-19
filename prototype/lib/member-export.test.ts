// prototype/lib/member-export.test.ts — Member export WITH POLICY (JTBD 5.8 / KLAVITYKLA-287).
// Hermetic: pure policy functions, no DB / no network. Asserts the two governance axes:
//   1. authorization (only effective admin/owner may export → others 403)
//   2. field policy / PII minimization (only email, role, joined_at, status survive; sensitive fields drop)
import { test, expect } from "bun:test"
import {
  buildMemberExport, applyMemberExportPolicy, membersToCsv, canExportMembers,
  MEMBER_EXPORT_FIELDS, MEMBER_EXPORT_EXCLUDED_FIELDS, type RawMember,
} from "./member-export"

const JOINED = Date.UTC(2026, 0, 15) // 2026-01-15T00:00:00.000Z

// A realistic raw roster row carrying extra/sensitive attributes the policy MUST strip.
function rawMembers(): RawMember[] {
  return [
    { email: "owner@acme.example", role: "admin", createdAt: JOINED,
      id: "pm_secret_1", invited_by: "founder@acme.example", account_id: "acct_1",
      project_id: "proj_1", name: "Ada Owner", ip: "203.0.113.9", user_agent: "Chrome",
      attribution: "utm_source=google" },
    { email: "member@acme.example", role: "member", createdAt: JOINED + 86_400_000,
      id: "pm_secret_2", invited_by: "owner@acme.example" },
  ]
}

test("authorized admin/owner may export", () => {
  expect(canExportMembers("admin")).toBe(true)
  const res = buildMemberExport("admin", rawMembers())
  expect(res.ok).toBe(true)
  if (!res.ok) throw new Error("expected ok")
  expect(res.rows).toHaveLength(2)
})

test("unauthorized roles get 403 (member + anonymous)", () => {
  expect(canExportMembers("member")).toBe(false)
  expect(canExportMembers(null)).toBe(false)
  for (const access of ["member", null] as const) {
    const res = buildMemberExport(access, rawMembers())
    expect(res.ok).toBe(false)
    if (res.ok) throw new Error("expected denial")
    expect(res.status).toBe(403)
  }
})

test("export carries only the allow-listed field set", () => {
  const rows = applyMemberExportPolicy(rawMembers())
  expect(rows[0]).toEqual({
    email: "owner@acme.example", role: "admin",
    joined_at: "2026-01-15T00:00:00.000Z", status: "active",
  })
  // Exactly the four policy fields — no more.
  expect(Object.keys(rows[0]).sort()).toEqual([...MEMBER_EXPORT_FIELDS].sort())
})

test("policy-excluded / sensitive fields are absent from rows and CSV", () => {
  const rows = applyMemberExportPolicy(rawMembers())
  for (const row of rows) {
    for (const banned of MEMBER_EXPORT_EXCLUDED_FIELDS) {
      expect(row).not.toHaveProperty(banned)
    }
  }
  const csv = membersToCsv(rows)
  // None of the sensitive VALUES leak into the serialized output.
  for (const secret of ["pm_secret_1", "founder@acme.example", "acct_1", "proj_1", "Ada Owner", "203.0.113.9", "utm_source=google"]) {
    expect(csv).not.toContain(secret)
  }
})

test("CSV has the policy header and one row per member", () => {
  const csv = membersToCsv(applyMemberExportPolicy(rawMembers()))
  const lines = csv.trimEnd().split("\r\n")
  expect(lines[0]).toBe("email,role,joined_at,status")
  expect(lines).toHaveLength(3) // header + 2 members
  expect(lines[1]).toBe("owner@acme.example,admin,2026-01-15T00:00:00.000Z,active")
})

test("status defaults to active when absent", () => {
  const rows = applyMemberExportPolicy([{ email: "x@y.z", role: "member", createdAt: JOINED }])
  expect(rows[0].status).toBe("active")
})
