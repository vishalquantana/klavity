// KLAVITYKLA-331 — founder booking (Cal.com) CTA on the unlocked report + nurture email.
//
// REGRESSION GUARD: the audit found NO cal.com link anywhere in product code — it existed only
// in the GTM planning docs. These tests fail if the CTA, its env configurability, or its funnel
// event disappear from the two free-tool pages or the step-2 nurture email.

import { test, expect, describe } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { FUNNEL_EVENTS, CLIENT_INGESTABLE, buildFunnelRow } from "./lib/funnel"
import { buildNurtureEmail, calBookingLink, DEFAULT_CAL_BOOKING_URL } from "./lib/lead-nurture"

const SITE = join(import.meta.dir, "..", "site")
const readSite = (f: string) => readFileSync(join(SITE, f), "utf8")

describe("booking CTA on the unlocked report", () => {
  for (const page of ["cro.html", "bug-check.html"]) {
    test(`${page} renders a founder booking CTA in the unlocked-report section`, () => {
      const html = readSite(page)
      // The CTA copy from the ticket.
      expect(html).toContain("Book 15 min with the founder")
      // Link must be env-configurable via the server's placeholder, not hardcoded.
      expect(html).toContain('href="__CAL_BOOKING_URL__"')
      expect(html).toContain('id="booking-cta"')
      // It must live inside the post-unlock CTA section, not the email gate.
      const ctaStart = html.indexOf('id="cta-section"')
      expect(ctaStart).toBeGreaterThan(-1)
      const ctaEnd = html.indexOf("</div>", html.indexOf("Book 15 min with the founder"))
      expect(html.indexOf("Book 15 min with the founder")).toBeGreaterThan(ctaStart)
      expect(ctaEnd).toBeGreaterThan(-1)
    })

    test(`${page} fires the booking_cta_clicked funnel event on click`, () => {
      const html = readSite(page)
      expect(html).toContain("booking_cta_clicked")
      expect(html).toContain('bookingCta.addEventListener("click"')
    })

    test(`${page} opens the booking link safely in a new tab`, () => {
      const html = readSite(page)
      const anchor = html.slice(html.indexOf('href="__CAL_BOOKING_URL__"'))
        .slice(0, html.slice(html.indexOf('href="__CAL_BOOKING_URL__"')).indexOf(">") + 1)
      expect(anchor).toContain('target="_blank"')
      expect(anchor).toContain('rel="noopener"')
    })

    test(`${page} uses no curly quotes in the booking CTA markup`, () => {
      const html = readSite(page)
      const line = html.split("\n").find((l) => l.includes("Book 15 min with the founder"))!
      expect(line).toBeDefined()
      expect(/[‘’“”]/.test(line)).toBe(false)
    })
  }
})

describe("booking_cta_clicked funnel event", () => {
  test("is a known funnel event", () => {
    expect(FUNNEL_EVENTS).toContain("booking_cta_clicked")
  })

  test("is client-ingestable so /api/track accepts it from the page", () => {
    expect(CLIENT_INGESTABLE).toContain("booking_cta_clicked")
  })

  test("builds a persistable row with the placement props", () => {
    const row = buildFunnelRow({
      event: "booking_cta_clicked",
      anonId: "anon_1",
      url: "https://example.com/pricing",
      props: { tool: "cro", placement: "unlocked_report" },
    })
    expect(row.event).toBe("booking_cta_clicked")
    expect(JSON.parse(row.props_json!)).toEqual({ tool: "cro", placement: "unlocked_report" })
  })

  test("meeting_booked is reserved for the optional Cal webhook", () => {
    expect(FUNNEL_EVENTS).toContain("meeting_booked")
    // ...but a client must not be able to fake a booked meeting.
    expect(CLIENT_INGESTABLE).not.toContain("meeting_booked")
  })
})

describe("calBookingLink", () => {
  test("falls back to the default when unconfigured", () => {
    expect(calBookingLink("")).toBe(DEFAULT_CAL_BOOKING_URL)
    expect(DEFAULT_CAL_BOOKING_URL).toContain("cal.com")
  })

  test("honours an explicit CAL_BOOKING_URL override", () => {
    expect(calBookingLink("https://cal.com/someone/intro")).toBe("https://cal.com/someone/intro")
  })

  test("rejects non-http(s) values instead of injecting them into an href", () => {
    expect(calBookingLink("javascript:alert(1)")).toBe(DEFAULT_CAL_BOOKING_URL)
    expect(calBookingLink("  ")).toBe(DEFAULT_CAL_BOOKING_URL)
  })

  test("appends attribution params without clobbering an existing query string", () => {
    expect(calBookingLink("https://cal.com/x/15min", "nurture-step2"))
      .toBe("https://cal.com/x/15min?utm_source=klavity&utm_campaign=nurture-step2")
    expect(calBookingLink("https://cal.com/x/15min?a=1", "nurture-step2"))
      .toBe("https://cal.com/x/15min?a=1&utm_source=klavity&utm_campaign=nurture-step2")
  })
})

describe("nurture email step 2 booking link", () => {
  test("includes the booking CTA in both HTML and plain text", () => {
    const e = buildNurtureEmail(2, { analyzedUrl: "https://example.com", calBookingUrl: "https://cal.com/x/15min" })
    expect(e.html).toContain("Book 15 min with the founder")
    expect(e.html).toContain("https://cal.com/x/15min?utm_source=klavity&amp;utm_campaign=nurture-step2")
    expect(e.text).toContain("Book 15 min with the founder: https://cal.com/x/15min?utm_source=klavity&utm_campaign=nurture-step2")
  })

  test("still renders a booking link when nothing is configured", () => {
    const e = buildNurtureEmail(2, { analyzedUrl: "https://example.com", calBookingUrl: "" })
    expect(e.html).toContain("cal.com")
    expect(e.text).toContain("cal.com")
  })

  test("steps 1 and 3 are unchanged (booking lives on step 2 only)", () => {
    expect(buildNurtureEmail(1, {}).html).not.toContain("Book 15 min with the founder")
    expect(buildNurtureEmail(3, {}).html).not.toContain("Book 15 min with the founder")
  })
})
