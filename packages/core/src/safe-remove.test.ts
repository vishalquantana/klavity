// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest"
import { safeRemove } from "./safe-remove"

describe("safeRemove", () => {
  const originalRemove = Element.prototype.remove
  afterEach(() => { Element.prototype.remove = originalRemove })

  it("detaches an attached node from its parent", () => {
    const parent = document.createElement("div")
    const child = document.createElement("span")
    parent.appendChild(child)
    document.body.appendChild(parent)
    safeRemove(child)
    expect(parent.contains(child)).toBe(false)
    parent.remove()
  })

  it("is a no-op (no throw) on a detached node, null, and undefined", () => {
    expect(() => safeRemove(document.createElement("div"))).not.toThrow()
    expect(() => safeRemove(null)).not.toThrow()
    expect(() => safeRemove(undefined)).not.toThrow()
  })

  it("does NOT invoke the (possibly poisoned) Element.prototype.remove, so it never throws under prototype pollution", () => {
    // priority-nav.min.js-style broken polyfill: no null guard → throws on a detached node.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Element.prototype.remove = function (this: any) { this.parentNode.removeChild(this) }
    // Sanity: the poison is live.
    expect(() => document.createElement("div").remove()).toThrow()
    // safeRemove goes through parentNode.removeChild directly, bypassing the poisoned prototype.
    expect(() => safeRemove(document.createElement("div"))).not.toThrow()
    // And it still correctly detaches a real, attached node.
    const parent = document.createElement("div"); const child = document.createElement("i")
    parent.appendChild(child); document.body.appendChild(parent)
    expect(() => safeRemove(child)).not.toThrow()
    expect(parent.contains(child)).toBe(false)
    parent.remove()
  })
})
