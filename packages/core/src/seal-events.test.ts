// @vitest-environment jsdom
// KLA-37: nothing the reporter does inside Klavity's chrome may reach the host page's
// document-level "click outside" handlers.
//
// The reported bug: on a PX4 list page you open the filter panel, click the Klavity icon to
// report it, and the panel vanishes — then, once the launcher was sealed, it still vanished as
// soon as you typed or clicked anything inside the composer, because the composer is a SEPARATE
// host on document.body (modal.ts: data-klavity-ui="composer"), not a child of the launcher host.
//
// These tests pin both halves: the helper's contract, and the composer actually using it.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { sealFromHostPage } from "./seal-events"
import { buildModal } from "./modal"

// The real handler shape from application/views/px4res_content/*.php:
//   document.addEventListener('click', e => { if (!panel.contains(e.target)) panel.classList.remove('visible') })
function mountHostPagePanel() {
  const panel = document.createElement("div")
  panel.id = "list1"
  panel.className = "visible"
  document.body.appendChild(panel)
  const handler = (event: Event) => {
    if (!panel.contains(event.target as Node)) panel.classList.remove("visible")
  }
  document.addEventListener("click", handler)
  return {
    panel,
    isOpen: () => panel.classList.contains("visible"),
    dispose: () => { document.removeEventListener("click", handler); panel.remove() },
  }
}

const baseCallbacks = () => ({
  onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
})

function composerHost(): HTMLElement {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.getAttribute("data-klavity-ui") === "composer") return el
  }
  throw new Error("composer host not found on document.body")
}

beforeEach(() => { document.body.innerHTML = "" })

describe("sealFromHostPage", () => {
  it("stops the three events popovers close on", () => {
    const el = document.createElement("div")
    document.body.appendChild(el)
    sealFromHostPage(el)
    const seen: string[] = []
    const spy = (e: Event) => seen.push(e.type)
    for (const t of ["pointerdown", "mousedown", "click"]) document.addEventListener(t, spy)
    try {
      for (const t of ["pointerdown", "mousedown", "click"]) {
        el.dispatchEvent(new MouseEvent(t, { bubbles: true }))
      }
      expect(seen).toEqual([])
    } finally {
      for (const t of ["pointerdown", "mousedown", "click"]) document.removeEventListener(t, spy)
    }
  })

  it("leaves mouseup and pointerup alone so a region drag can still finish", () => {
    const el = document.createElement("div")
    document.body.appendChild(el)
    sealFromHostPage(el)
    const seen: string[] = []
    const spy = (e: Event) => seen.push(e.type)
    document.addEventListener("mouseup", spy)
    document.addEventListener("pointerup", spy)
    try {
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }))
      el.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }))
      expect(seen).toEqual(["mouseup", "pointerup"])
    } finally {
      document.removeEventListener("mouseup", spy)
      document.removeEventListener("pointerup", spy)
    }
  })

  it("does not block other listeners on the sealed element itself", () => {
    const el = document.createElement("div")
    document.body.appendChild(el)
    sealFromHostPage(el)
    const own = vi.fn()
    el.addEventListener("click", own)
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(own).toHaveBeenCalledTimes(1)
  })

  it("still lets document CAPTURE listeners run", () => {
    const el = document.createElement("div")
    document.body.appendChild(el)
    sealFromHostPage(el)
    const cap = vi.fn()
    document.addEventListener("click", cap, true)
    try {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(cap).toHaveBeenCalledTimes(1)
    } finally {
      document.removeEventListener("click", cap, true)
    }
  })

  it("is a no-op on null/undefined rather than throwing", () => {
    expect(() => sealFromHostPage(null)).not.toThrow()
    expect(() => sealFromHostPage(undefined)).not.toThrow()
  })
})

describe("KLA-37: working inside the composer must not close the host page's popover", () => {
  it("a click anywhere in the composer leaves the panel open", () => {
    const page = mountHostPagePanel()
    try {
      buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
      const host = composerHost()
      const inner = host.shadowRoot?.querySelector("textarea, input, button") as HTMLElement | null
      expect(inner).toBeTruthy()
      inner!.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }))
      expect(page.isOpen()).toBe(true)
      // The composer host itself, too (retargeted target for anything in its shadow root).
      host.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }))
      expect(page.isOpen()).toBe(true)
    } finally {
      page.dispose()
    }
  })

  it("a genuine click on the host page still closes the panel", () => {
    const page = mountHostPagePanel()
    try {
      buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
      expect(page.isOpen()).toBe(true)
      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(page.isOpen()).toBe(false)
    } finally {
      page.dispose()
    }
  })
})
