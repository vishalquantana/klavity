// KLAVITYKLA-441 — pure unit tests for the workspace auto-labeling rule engine.
// No DB / no network — matchHostGlob, ipInCidr, evaluateLabelRules, sanitizeLabelRules.

import { test, expect, describe } from "bun:test"
import { matchHostGlob, ipInCidr, evaluateLabelRules, sanitizeLabelRules, hostConventionEnv, LABEL_RULES_MAX } from "./label-rules"

describe("matchHostGlob", () => {
  test("exact match", () => {
    expect(matchHostGlob("app.acme.com", "app.acme.com")).toBe(true)
    expect(matchHostGlob("app.acme.com", "www.acme.com")).toBe(false)
  })
  test("leading wildcard subdomain", () => {
    expect(matchHostGlob("*.staging.acme.com", "app.staging.acme.com")).toBe(true)
    expect(matchHostGlob("*.staging.acme.com", "a.b.staging.acme.com")).toBe(true)
    expect(matchHostGlob("*.staging.acme.com", "staging.acme.com")).toBe(false)
  })
  test("case-insensitive", () => {
    expect(matchHostGlob("App.Acme.COM", "app.acme.com")).toBe(true)
  })
  test("dots are literal (not any-char)", () => {
    expect(matchHostGlob("app.acme.com", "appxacme.com")).toBe(false)
  })
  test("single-char ? wildcard", () => {
    expect(matchHostGlob("api?.acme.com", "api1.acme.com")).toBe(true)
    expect(matchHostGlob("api?.acme.com", "api12.acme.com")).toBe(false)
  })
  test("empty inputs never match", () => {
    expect(matchHostGlob("", "app.acme.com")).toBe(false)
    expect(matchHostGlob("*.acme.com", "")).toBe(false)
  })
})

describe("ipInCidr (IPv4)", () => {
  test("inside range", () => {
    expect(ipInCidr("10.1.2.3", "10.0.0.0/8")).toBe(true)
    expect(ipInCidr("192.168.5.20", "192.168.0.0/16")).toBe(true)
  })
  test("outside range", () => {
    expect(ipInCidr("11.0.0.1", "10.0.0.0/8")).toBe(false)
    expect(ipInCidr("192.169.0.1", "192.168.0.0/16")).toBe(false)
  })
  test("bare IP treated as /32", () => {
    expect(ipInCidr("1.2.3.4", "1.2.3.4")).toBe(true)
    expect(ipInCidr("1.2.3.5", "1.2.3.4")).toBe(false)
  })
  test("/0 matches everything", () => {
    expect(ipInCidr("8.8.8.8", "0.0.0.0/0")).toBe(true)
  })
  test("loopback", () => {
    expect(ipInCidr("127.0.0.1", "127.0.0.0/8")).toBe(true)
  })
  test("malformed / IPv6 → no match (never throws)", () => {
    expect(ipInCidr("not-an-ip", "10.0.0.0/8")).toBe(false)
    expect(ipInCidr("10.0.0.1", "garbage")).toBe(false)
    expect(ipInCidr("::1", "10.0.0.0/8")).toBe(false)
    expect(ipInCidr("10.0.0.1", "10.0.0.0/40")).toBe(false)
    expect(ipInCidr("10.0.0.999", "10.0.0.0/8")).toBe(false)
  })
})

describe("evaluateLabelRules — first match wins", () => {
  const rules = [
    { match: { urlHost: "*.staging.acme.com" }, label: { env: "staging", org: "Acme", server: "eu-1" } },
    { match: { cidr: "10.0.0.0/8" }, label: { env: "internal", org: "Acme" } },
    { match: { urlHost: "app.acme.com", cidr: "203.0.113.0/24" }, label: { env: "prod" } },
  ]
  test("host glob match", () => {
    expect(evaluateLabelRules(rules, { urlHost: "app.staging.acme.com", ip: "8.8.8.8" }))
      .toEqual({ env: "staging", org: "Acme", server: "eu-1" })
  })
  test("cidr match when host doesn't match earlier rule", () => {
    expect(evaluateLabelRules(rules, { urlHost: "other.com", ip: "10.9.9.9" }))
      .toEqual({ env: "internal", org: "Acme", server: null })
  })
  test("first match wins (staging beats the cidr rule)", () => {
    // Host matches rule 0 AND ip matches rule 1 — rule 0 (earlier) must win.
    expect(evaluateLabelRules(rules, { urlHost: "x.staging.acme.com", ip: "10.0.0.1" }).env).toBe("staging")
  })
  test("AND semantics: both host+cidr must hold for a two-criterion rule", () => {
    expect(evaluateLabelRules([rules[2]], { urlHost: "app.acme.com", ip: "203.0.113.5" }).env).toBe("prod")
    expect(evaluateLabelRules([rules[2]], { urlHost: "app.acme.com", ip: "1.1.1.1" }).env).toBeNull()
  })
  test("unmatched → all null", () => {
    expect(evaluateLabelRules(rules, { urlHost: "nope.com", ip: "1.1.1.1" }))
      .toEqual({ env: null, org: null, server: null })
  })
  test("empty / missing rules → all null", () => {
    expect(evaluateLabelRules([], { urlHost: "app.staging.acme.com" })).toEqual({ env: null, org: null, server: null })
    expect(evaluateLabelRules(null, { urlHost: "app.staging.acme.com" }).env).toBeNull()
  })
})

describe("hostConventionEnv — zero-config env from host convention", () => {
  test("recognized subdomain tokens", () => {
    expect(hostConventionEnv("qa1.px4app.com")).toBe("qa")
    expect(hostConventionEnv("qa.example.com")).toBe("qa")
    expect(hostConventionEnv("qa2.example.com")).toBe("qa")
    expect(hostConventionEnv("staging.acme.io")).toBe("staging")
    expect(hostConventionEnv("stg.acme.io")).toBe("staging")
    expect(hostConventionEnv("dev.foo.com")).toBe("dev")
    expect(hostConventionEnv("uat.x.com")).toBe("uat")
    expect(hostConventionEnv("test.x.com")).toBe("test")
    expect(hostConventionEnv("tst.x.com")).toBe("test")
    expect(hostConventionEnv("sandbox.x.com")).toBe("sandbox")
    expect(hostConventionEnv("sbx.x.com")).toBe("sandbox")
    expect(hostConventionEnv("preview.x.com")).toBe("preview")
    expect(hostConventionEnv("pr-123.x.com")).toBe("preview")
    expect(hostConventionEnv("demo.x.com")).toBe("demo")
  })
  test("case + whitespace normalized", () => {
    expect(hostConventionEnv("  QA1.PX4APP.COM  ")).toBe("qa")
  })
  test("local hosts", () => {
    expect(hostConventionEnv("localhost")).toBe("local")
    expect(hostConventionEnv("app.local")).toBe("local")
    expect(hostConventionEnv("127.0.0.1")).toBe("local")
    expect(hostConventionEnv("10.1.2.3")).toBe("local")
    expect(hostConventionEnv("192.168.1.5")).toBe("local")
  })
  test("no recognized token → null (never guesses prod)", () => {
    expect(hostConventionEnv("www.px4app.com")).toBeNull()
    expect(hostConventionEnv("px4app.com")).toBeNull()
    expect(hostConventionEnv("app.acme.com")).toBeNull()
    expect(hostConventionEnv("")).toBeNull()
    expect(hostConventionEnv(null)).toBeNull()
    expect(hostConventionEnv(undefined)).toBeNull()
  })
})

describe("sanitizeLabelRules", () => {
  test("keeps well-formed rules, order preserved", () => {
    const raw = [
      { match: { urlHost: "*.a.com" }, label: { env: "staging" } },
      { match: { cidr: "10.0.0.0/8" }, label: { org: "Acme", server: "s1" } },
    ]
    const out = sanitizeLabelRules(raw)
    expect(out).toHaveLength(2)
    expect(out[0].match.urlHost).toBe("*.a.com")
    expect(out[1].label).toEqual({ org: "Acme", server: "s1" })
  })
  test("drops rules with no match criterion", () => {
    expect(sanitizeLabelRules([{ match: {}, label: { env: "x" } }])).toHaveLength(0)
  })
  test("drops rules with no labels", () => {
    expect(sanitizeLabelRules([{ match: { urlHost: "*.a.com" }, label: {} }])).toHaveLength(0)
  })
  test("garbage → []", () => {
    expect(sanitizeLabelRules(null)).toEqual([])
    expect(sanitizeLabelRules("nope")).toEqual([])
    expect(sanitizeLabelRules([1, 2, "x", null])).toEqual([])
  })
  test("caps rule count at LABEL_RULES_MAX", () => {
    const many = Array.from({ length: LABEL_RULES_MAX + 20 }, () => ({ match: { urlHost: "*.a.com" }, label: { env: "e" } }))
    expect(sanitizeLabelRules(many)).toHaveLength(LABEL_RULES_MAX)
  })
})
