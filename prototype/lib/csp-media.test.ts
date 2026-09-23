import { test, expect } from "bun:test"
import { mediaSrcDirective } from "./csp-media"

test("no storage endpoint → the strict default (unchanged behaviour)", () => {
  expect(mediaSrcDirective("")).toBe("media-src 'self' blob: data:")
  expect(mediaSrcDirective(undefined)).toBe("media-src 'self' blob: data:")
})

test("allows exactly the storage endpoint origin (path and trailing slash dropped)", () => {
  expect(mediaSrcDirective("https://s3.eu-west-1.example.com/")).toBe("media-src 'self' blob: data: https://s3.eu-west-1.example.com")
  expect(mediaSrcDirective("http://localhost:9000")).toBe("media-src 'self' blob: data: http://localhost:9000")
  expect(mediaSrcDirective("https://abc.r2.cloudflarestorage.com/bucket/x")).toBe("media-src 'self' blob: data: https://abc.r2.cloudflarestorage.com")
})

test("a malformed or non-http endpoint never widens the policy", () => {
  expect(mediaSrcDirective("not a url")).toBe("media-src 'self' blob: data:")
  expect(mediaSrcDirective("javascript:alert(1)")).toBe("media-src 'self' blob: data:")
  expect(mediaSrcDirective("*")).toBe("media-src 'self' blob: data:")
})
