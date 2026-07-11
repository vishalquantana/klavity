// Unit tests for the humanized verdict/finding text helpers (KLAVITYKLA-272).
//
// humanStepDescription() and humanRedReason() are pure functions — no DB, no browser.
// Tests verify that the output is human-readable (plain English), accurate, and consistent
// across all supported StepAction values.

import { expect, test, describe } from "bun:test"
import { humanStepDescription, humanRedReason } from "./trails-runner"

describe("humanStepDescription", () => {
  test("click with name", () => {
    expect(humanStepDescription("click", "Sign in")).toBe('clicking "Sign in"')
  })

  test("click without name", () => {
    expect(humanStepDescription("click")).toBe("clicking")
  })

  test("assert with name", () => {
    expect(humanStepDescription("assert", "Order confirmed")).toBe('checking "Order confirmed"')
  })

  test("assert without name", () => {
    expect(humanStepDescription("assert")).toBe("checking")
  })

  test("type with name", () => {
    expect(humanStepDescription("type", "Email")).toBe('typing into "Email"')
  })

  test("navigate without name", () => {
    expect(humanStepDescription("navigate")).toBe("navigating to")
  })

  test("wait without name", () => {
    expect(humanStepDescription("wait")).toBe("waiting")
  })

  test("hover with name", () => {
    expect(humanStepDescription("hover", "Help menu")).toBe('hovering over "Help menu"')
  })

  test("select with name", () => {
    expect(humanStepDescription("select", "Country")).toBe('selecting from "Country"')
  })

  test("clearField with name", () => {
    expect(humanStepDescription("clearField", "Search")).toBe('clearing "Search"')
  })

  test("keyPress with name", () => {
    expect(humanStepDescription("keyPress", "Submit")).toBe('pressing a key on "Submit"')
  })

  test("pauseForSecret with name", () => {
    expect(humanStepDescription("pauseForSecret", "Password")).toBe('filling in "Password"')
  })

  test("callModule with name", () => {
    expect(humanStepDescription("callModule", "login")).toBe('running module "login"')
  })

  test("unknown action falls back to the raw action name", () => {
    expect(humanStepDescription("unknownAction", "Thing")).toBe('unknownAction "Thing"')
  })

  test("null name treated same as no name", () => {
    expect(humanStepDescription("click", null)).toBe("clicking")
  })

  test("empty string name treated as no name", () => {
    // Empty string is falsy — treated as absent
    expect(humanStepDescription("click", "")).toBe("clicking")
  })
})

describe("humanRedReason", () => {
  test("non-assert step produces plain-English action description", () => {
    const reason = humanRedReason(1, "click", "Add to cart")
    // Must not contain terse codes like "step 1 (click): RED"
    expect(reason).not.toMatch(/\bRED\b/)
    expect(reason).not.toMatch(/step \d+ \(\w+\)/)
    // Must be human-readable
    expect(reason).toContain("Add to cart")
    expect(reason).toContain("2") // stepIdx 1 → displayed as "Step 2"
  })

  test("assert step uses check-failed language", () => {
    const reason = humanRedReason(3, "assert", "Order confirmed")
    expect(reason).toContain("Order confirmed")
    expect(reason).toContain("4") // stepIdx 3 → "Step 4"
    // Should say something like "check" or "failed"
    expect(reason.toLowerCase()).toMatch(/check|fail/)
  })

  test("step index is 0-based internally, displayed as 1-based", () => {
    const r0 = humanRedReason(0, "click", "Sign in")
    expect(r0).toContain("Step 1")

    const r4 = humanRedReason(4, "assert", "Dashboard visible")
    expect(r4).toContain("Step 5")
  })

  test("works without a target name", () => {
    const reason = humanRedReason(2, "navigate")
    expect(reason).toContain("Step 3")
    expect(reason).not.toMatch(/undefined|null/)
  })

  test("assert without name falls back gracefully", () => {
    const reason = humanRedReason(0, "assert")
    expect(reason).not.toContain("undefined")
    expect(reason).not.toContain("null")
    // Should still mention a check
    expect(reason.toLowerCase()).toMatch(/check|fail/)
  })

  test("all common actions produce a non-empty string without internal codes", () => {
    const actions = ["click", "type", "select", "assert", "hover", "navigate", "wait", "clearField"]
    for (const action of actions) {
      const r = humanRedReason(0, action, "Element")
      expect(r.length).toBeGreaterThan(10)
      expect(r).not.toMatch(/: RED/)
    }
  })
})
