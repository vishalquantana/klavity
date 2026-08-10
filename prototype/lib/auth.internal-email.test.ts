import { test, expect, afterEach } from "bun:test"
import { isInternalEmail } from "./auth"

const ENV_KEY = "KLAV_INTERNAL_DOMAINS"
afterEach(() => { delete process.env[ENV_KEY] })

test("quantana.in and quantana.com.au are internal by default", () => {
  expect(isInternalEmail("karthik@quantana.in")).toBe(true)
  expect(isInternalEmail("vishal@quantana.com.au")).toBe(true)
})

test("internal match is case-insensitive", () => {
  expect(isInternalEmail("Karthik@Quantana.IN")).toBe(true)
})

test("external domains are not internal", () => {
  expect(isInternalEmail("someone@gmail.com")).toBe(false)
  expect(isInternalEmail("user@quantana.com")).toBe(false) // .com is NOT one of ours
})

test("subdomains are not treated as internal (exact domain match)", () => {
  expect(isInternalEmail("bot@mail.quantana.in")).toBe(false)
})

test("malformed / empty emails are not internal", () => {
  expect(isInternalEmail("")).toBe(false)
  expect(isInternalEmail("no-at-sign")).toBe(false)
  expect(isInternalEmail("trailing@")).toBe(false)
})

test("KLAV_INTERNAL_DOMAINS adds extra domains without dropping the defaults", () => {
  process.env[ENV_KEY] = "partnerco.com, another.io"
  expect(isInternalEmail("a@partnerco.com")).toBe(true)
  expect(isInternalEmail("b@another.io")).toBe(true)
  expect(isInternalEmail("c@quantana.in")).toBe(true) // defaults still internal
  expect(isInternalEmail("d@gmail.com")).toBe(false)
})
