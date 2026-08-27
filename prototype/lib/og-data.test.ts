// KLA-739 — negative-control tests for the OG card DATA loader's anonymous privacy gate + teaser
// redaction + cache-version fold. loadOgCardData is dependency-injected so these exercise the REAL
// decision path (ticketViewAccess → serve/redact) with fakes, no server/DB/S3 boot (QA neg-control rule).

import { test, expect, describe } from "bun:test"
import {
  loadOgCardData, ogAnonServeable, redactOgCardForAnon, ogSeverityFor, type OgDataDeps, type OgFeedbackRow,
} from "./og-data"
import type { TicketViewAccess } from "./ticket-viewers"

// A human bug row + a Sim row, each carrying private fields (reporter / source_quote / persona).
const HUMAN_ROW: OgFeedbackRow = {
  id: "fb_human01", sim_id: null, source: "widget", report_type: "bug",
  reporter_json: JSON.stringify({ name: "Asmin Rao" }),
  title: "Checkout button dead on mobile Safari", observation: "", suggested_bug_json: null,
  priority: "urgent", source_quote: null, ver: 100,
}
const SIM_ROW: OgFeedbackRow = {
  id: "fb_sim0001", sim_id: "sim_1", source: "sim", report_type: "bug",
  reporter_json: null, title: "Plan selection unclear", observation: "", suggested_bug_json: null,
  priority: "medium", source_quote: "I couldn't tell which plan was selected before paying.", ver: 200,
}
const PERSONA = { id: "sim_1", name: "Sarah Chen", role: "Small-business owner", initials: "SC", accent: "#8b5cf6" }

function makeDeps(access: TicketViewAccess, row: OgFeedbackRow = HUMAN_ROW): OgDataDeps {
  return {
    resolveRef: async (ref) => (ref === "unknown" ? null : { id: row.id, projectId: "proj_1" }),
    loadRow: async () => row,
    anonAccess: async () => access,
    listPersonas: async () => [PERSONA],
    effectiveTitle: (r) => String(r.title),
  }
}

describe("ogAnonServeable — only public/teaser shares are anon-serveable", () => {
  test("full + teaser serveable; login + pending NOT", () => {
    expect(ogAnonServeable("full")).toBe(true)
    expect(ogAnonServeable("teaser")).toBe(true)
    expect(ogAnonServeable("login")).toBe(false)
    expect(ogAnonServeable("pending")).toBe(false)
  })
})

describe("C1 gate — a login-gated (share_mode=off) ticket is NOT served to anon", () => {
  // NEG-CONTROL: without the anon gate, loadOgCardData(anon) returns the FULL human card for a
  // login-gated ticket → this expectation (null) FAILS, exactly reproducing the live leak.
  test("anon + access=login → null (caller serves the default card, no title/reporter leak)", async () => {
    const got = await loadOgCardData(makeDeps("login"), "fb_human01", { anon: true })
    expect(got).toBeNull()
  })
  test("anon + access=pending → null", async () => {
    const got = await loadOgCardData(makeDeps("pending"), "fb_human01", { anon: true })
    expect(got).toBeNull()
  })
  test("unknown ref → null (indistinguishable from the login-gated case)", async () => {
    const got = await loadOgCardData(makeDeps("full"), "unknown", { anon: true })
    expect(got).toBeNull()
  })
  test("NON-anon (page meta for a member) still resolves the full card for a login ticket", async () => {
    const got = await loadOgCardData(makeDeps("login"), "fb_human01")
    expect(got).not.toBeNull()
    expect((got!.data as any).reporter).toBe("Asmin Rao")
  })
})

describe("C1 redaction — anon teaser withholds reporter / source_quote / persona identity", () => {
  test("human teaser: title+severity kept, reporter WITHHELD", async () => {
    const got = await loadOgCardData(makeDeps("teaser"), "fb_human01", { anon: true })
    expect(got).not.toBeNull()
    const d = got!.data as any
    expect(d.type).toBe("human")
    expect(d.title).toBe("Checkout button dead on mobile Safari")
    expect(d.severity).toBeTruthy()
    // NEG-CONTROL: pre-fix, the reporter name leaked into the anon card here.
    expect(d.reporter).toBeNull()
  })

  test("sim teaser: source_quote + persona identity WITHHELD (generic Sim, title as finding)", async () => {
    const got = await loadOgCardData(makeDeps("teaser", SIM_ROW), "fb_sim0001", { anon: true })
    const d = got!.data as any
    expect(d.type).toBe("sim")
    // NEG-CONTROL: the verbatim finding + persona name/role must NOT be present in a teaser card.
    expect(d.finding).toBe("Plan selection unclear") // == title, NOT the source_quote
    expect(d.finding).not.toContain("couldn't tell")
    expect(d.simName).toBe("A Sim")
    expect(d.simRole).toBeNull()
    expect(d.initials).toBeNull()
    expect(d.accent).toBeNull()
  })

  test("public share (access=full): human card DOES include the reporter", async () => {
    const got = await loadOgCardData(makeDeps("full"), "fb_human01", { anon: true })
    expect((got!.data as any).reporter).toBe("Asmin Rao")
  })

  test("public share (access=full): sim card DOES include the finding + persona identity", async () => {
    const got = await loadOgCardData(makeDeps("full", SIM_ROW), "fb_sim0001", { anon: true })
    const d = got!.data as any
    expect(d.finding).toContain("couldn't tell which plan")
    expect(d.simName).toBe("Sarah Chen")
    expect(d.simRole).toBe("Small-business owner")
  })
})

describe("redactOgCardForAnon — pure policy", () => {
  test("strips human reporter", () => {
    const r = redactOgCardForAnon({ type: "human", ticketKey: "K", title: "t", severity: null, reporter: "Bob" }) as any
    expect(r.reporter).toBeNull()
  })
  test("strips sim finding + identity", () => {
    const r = redactOgCardForAnon({
      type: "sim", ticketKey: "K", title: "t", finding: "secret quote", severity: null,
      simName: "Bob", simRole: "CEO", initials: "BB", accent: "#123456",
    }) as any
    expect(r.finding).toBe("t")
    expect(r.simName).toBe("A Sim")
    expect(r.simRole).toBeNull()
    expect(r.accent).toBeNull()
  })
})

describe("C2-5 — an edited ticket produces a NEW cache version (busts the immutable PNG)", () => {
  // The server folds MAX(updated_at,last_seen_at,created_at) into `ver`; here we simulate the row's ver
  // changing after an edit and assert the loader threads it into the version (→ a new S3 key).
  test("version reflects the row's folded ver; an edit's higher ver yields a different version/key", async () => {
    const before = await loadOgCardData(makeDeps("full", { ...HUMAN_ROW, ver: 100 }), "fb_human01", { anon: true })
    const afterEdit = await loadOgCardData(makeDeps("full", { ...HUMAN_ROW, ver: 999, title: "Edited title" }), "fb_human01", { anon: true })
    expect(before!.version).toBe("100")
    expect(afterEdit!.version).toBe("999")
    // NEG-CONTROL intent: if `ver` ignored updated_at (stale), an edit would keep version "100" and the
    // cache key would never change — the assertion that the two versions differ would FAIL.
    expect(before!.version).not.toBe(afterEdit!.version)
  })
})

describe("ogSeverityFor", () => {
  test("maps priorities to badges", () => {
    expect(ogSeverityFor("urgent")?.cls).toBe("c1")
    expect(ogSeverityFor("medium")?.cls).toBe("c2")
    expect(ogSeverityFor("low")?.cls).toBe("c3")
    expect(ogSeverityFor("nonsense")).toBeNull()
  })
})
