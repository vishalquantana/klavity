// KLA-554: auto-generated ticket titles.
//
// The composer promised "we'll auto-generate one" but nothing did, so ticket cards fell back to the raw
// first line of the report body (whole pasted URLs, paragraphs of prose). These tests pin the pure
// titling pipeline in lib/auto-title.ts with an INJECTED fake LLM (no network): URL stripping, length
// cap, single-line, sensible fallback on a thrown/empty reply, and the skip/don't-clobber predicate.

import { test, expect, describe } from "bun:test"
import {
  generateTicketTitle,
  sanitizeTitle,
  prepareObservationForTitle,
  parseTitleReply,
  shouldAutoTitle,
  TITLE_MAX_LEN,
  TITLE_SYSTEM_PROMPT,
} from "./lib/auto-title"

// A fake LLM that always replies with the given JSON/string, ignoring input.
const fixedLlm = (reply: string) => async () => reply

describe("sanitizeTitle", () => {
  test("strips URLs the model echoes back", () => {
    expect(sanitizeTitle("Broken link at https://example.com/foo?x=1 on load")).toBe("Broken link at on load")
  })

  test("forces a single line and collapses whitespace", () => {
    expect(sanitizeTitle("Login\n\n  button   does\tnothing")).toBe("Login button does nothing")
  })

  test("removes trailing punctuation", () => {
    expect(sanitizeTitle("Checkout crashes on submit!!!")).toBe("Checkout crashes on submit")
  })

  test("strips wrapping quotes", () => {
    expect(sanitizeTitle('"Signup form rejects valid email"')).toBe("Signup form rejects valid email")
  })

  test("caps length at TITLE_MAX_LEN on a word boundary", () => {
    const long = "The dashboard page takes an extremely long time to load whenever many widgets are pinned"
    const out = sanitizeTitle(long)
    expect(out.length).toBeLessThanOrEqual(TITLE_MAX_LEN)
    expect(out).not.toMatch(/\s$/)
    // must not cut mid-word
    expect(long.startsWith(out)).toBe(true)
  })

  test("empty / whitespace-only ⇒ empty", () => {
    expect(sanitizeTitle("   ")).toBe("")
    expect(sanitizeTitle("")).toBe("")
  })
})

describe("prepareObservationForTitle", () => {
  test("drops pasted URLs, boilerplate lines and stack frames", () => {
    const body = [
      "Pages captured: /dashboard, /settings",
      "https://app.example.com/dashboard?ref=email",
      "The save button spins forever and never confirms",
      "    at handleSave (bundle.js:1201:19)",
      "TypeError: cannot read properties of undefined",
    ].join("\n")
    const out = prepareObservationForTitle(body)
    expect(out).toContain("save button spins forever")
    expect(out).not.toMatch(/https?:\/\//)
    expect(out).not.toContain("Pages captured")
    expect(out).not.toContain("bundle.js")
    expect(out).not.toContain("TypeError")
  })

  test("empty body ⇒ empty", () => {
    expect(prepareObservationForTitle("")).toBe("")
    expect(prepareObservationForTitle("   \n  ")).toBe("")
  })

  test("clips to maxChars", () => {
    const out = prepareObservationForTitle("x".repeat(5000), 100)
    expect(out.length).toBe(100)
  })
})

describe("parseTitleReply", () => {
  test('parses {"title":"..."} JSON', () => {
    expect(parseTitleReply('{"title":"Login broken"}')).toBe("Login broken")
  })
  test("tolerates a bare string reply", () => {
    expect(parseTitleReply("Login broken")).toBe("Login broken")
  })
  test("empty JSON title ⇒ empty", () => {
    expect(parseTitleReply('{"title":""}')).toBe("")
  })
})

describe("generateTicketTitle (injected LLM, no network)", () => {
  test("produces a clean single-line title from prose + strips URLs/length", async () => {
    const body =
      "https://app.example.com/checkout\n\nWhen I click Pay Now the page just spins and the order is never placed."
    const title = await generateTicketTitle(body, {
      llm: fixedLlm('{"title":"Pay Now button spins and never places the order"}'),
    })
    expect(title).toBe("Pay Now button spins and never places the order")
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LEN)
    expect(title).not.toMatch(/https?:\/\//)
  })

  test("falls back to empty when the LLM throws (caller keeps first-line fallback)", async () => {
    const title = await generateTicketTitle("Something is broken on the page", {
      llm: async () => { throw new Error("boom / timeout") },
    })
    expect(title).toBe("")
  })

  test("falls back to empty on an empty LLM reply", async () => {
    const title = await generateTicketTitle("Something is broken on the page", {
      llm: fixedLlm('{"title":""}'),
    })
    expect(title).toBe("")
  })

  test("returns empty when there is nothing meaningful to title (URL-only body)", async () => {
    let called = false
    const title = await generateTicketTitle("https://example.com/only-a-link", {
      llm: async () => { called = true; return '{"title":"should not happen"}' },
    })
    expect(title).toBe("")
    expect(called).toBe(false) // short-circuits before spending an LLM call
  })

  test("returns empty when no LLM is injected (pure pipeline, no network)", async () => {
    expect(await generateTicketTitle("A real prose report about a bug")).toBe("")
  })

  test("caps an over-long model title", async () => {
    const title = await generateTicketTitle("Report about slow dashboard loading with many pinned widgets", {
      llm: fixedLlm('{"title":"The dashboard page takes an extremely long time to load whenever a large number of widgets are pinned to it"}'),
    })
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LEN)
    expect(title.length).toBeGreaterThan(0)
  })
})

describe("shouldAutoTitle (skip / don't-clobber decision)", () => {
  test("skips when the user supplied an explicit non-empty title", () => {
    expect(shouldAutoTitle("My hand-written title")).toBe(false)
  })
  test("runs when no user title is present", () => {
    expect(shouldAutoTitle(null)).toBe(true)
    expect(shouldAutoTitle(undefined)).toBe(true)
    expect(shouldAutoTitle("")).toBe(true)
    expect(shouldAutoTitle("   ")).toBe(true)
  })
})

describe("system prompt", () => {
  test("instructs a JSON single-line, URL-free, punctuation-free title", () => {
    expect(TITLE_SYSTEM_PROMPT).toMatch(/JSON/i)
    expect(TITLE_SYSTEM_PROMPT).toMatch(/single line/i)
    expect(TITLE_SYSTEM_PROMPT.toLowerCase()).toContain("no url")
  })
})
