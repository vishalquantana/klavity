// @vitest-environment jsdom
// #638: console logs are DEFAULT OFF, gated behind a per-report "Attach console logs" toggle in the composer.
// These tests lock in: the toggle renders only when the host opts in (callbacks.consoleAttachToggle), it is
// UNCHECKED by default, and the submit payload's attachConsole reflects the checkbox state (false by default,
// true only when the reporter flips it on). When the host does NOT opt in, attachConsole is omitted entirely.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

function build(onSubmit: any, consoleAttachToggle?: boolean): ShadowRoot {
  buildModal(
    "bug",
    {
      onCaptureFull: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onClose: vi.fn(),
      onSubmit,
      consoleAttachToggle,
    },
    { theme: "light" } as any,
  )
  return modalShadow()
}

async function submit(shadow: ShadowRoot, text: string) {
  const desc = shadow.getElementById("klavity-desc") as HTMLTextAreaElement
  desc.value = text
  desc.dispatchEvent(new Event("input"))
  ;(shadow.getElementById("klavity-submit") as HTMLButtonElement).click()
  // Blocking submit path awaits pre-compression + onSubmit; a couple of macrotask ticks settle it.
  await new Promise((r) => setTimeout(r, 0))
  await new Promise((r) => setTimeout(r, 0))
}

beforeEach(() => { document.body.innerHTML = "" })

describe("#638 console-logs attach toggle", () => {
  it("renders the toggle (unchecked) only when the host opts in", () => {
    const shadow = build(vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }), true)
    const cb = shadow.getElementById("klavity-conlog-cb") as HTMLInputElement | null
    expect(cb).not.toBeNull()
    // DEFAULT OFF — the checkbox starts unchecked.
    expect(cb!.checked).toBe(false)
    expect((shadow.getElementById("klavity-conlog") as HTMLElement).textContent || "").toContain("Attach console logs")
  })

  it("does NOT render the toggle when the host omits consoleAttachToggle", () => {
    const shadow = build(vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }))
    expect(shadow.getElementById("klavity-conlog-cb")).toBeNull()
  })

  it("DEFAULT OFF: submit sends attachConsole=false when the toggle is untouched", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" })
    const shadow = build(onSubmit, true)
    await submit(shadow, "something is broken on this page")
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][0].attachConsole).toBe(false)
  })

  it("OPT IN: checking the toggle sends attachConsole=true", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" })
    const shadow = build(onSubmit, true)
    const cb = shadow.getElementById("klavity-conlog-cb") as HTMLInputElement
    cb.checked = true
    await submit(shadow, "something is broken on this page")
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][0].attachConsole).toBe(true)
  })

  it("no toggle rendered => attachConsole is omitted from the payload entirely", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" })
    const shadow = build(onSubmit)
    await submit(shadow, "something is broken on this page")
    expect(onSubmit).toHaveBeenCalled()
    expect("attachConsole" in onSubmit.mock.calls[0][0]).toBe(false)
  })
})
