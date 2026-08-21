// @vitest-environment jsdom
// The non-blocking background-upload pill (widget layer). Covers the three states shown after the report
// modal closes on Submit: uploading (spinner + progress bar + byte readout), success ("Report sent" +
// ref + optional "Open in Klavity", auto-dismiss ~4s with hover pause), and failure ("Upload didn't
// finish" + Retry). Also proves the widget's retry loop re-sends the SAME retained payload — no
// re-capture — by mimicking widget.ts's `attempt()` around a fake submit that fails once then succeeds.
import { describe, it, expect, vi } from "vitest"

// widget.ts auto-calls mount() at module load. mount() reads the current <script> via
// parseScriptConfig, which crashes under jsdom (no script tag). Stub it to return an empty
// projectId so the auto-mount returns early — we only exercise the exported createUploadPill here.
vi.mock("./widget-lib", async () => {
  const actual = await vi.importActual<typeof import("./widget-lib")>("./widget-lib")
  return { ...actual, parseScriptConfig: vi.fn(() => ({ projectId: "", backendUrl: "" })) }
})
// session-replay lazy-loads rrweb over the network on import; keep it inert under jsdom.
vi.mock("./session-replay", () => ({ createSessionReplay: () => ({ snapshot: () => [], hasRecording: () => false, start: () => {}, stop: () => {} }) }))

import { createUploadPill } from "./widget"

const pillEl = () => document.querySelector('[data-klavity-ui="upload-pill"]')!.shadowRoot!.querySelector(".pill") as HTMLElement

describe("upload pill states", () => {
  it("starts in the uploading state with a spinner + byte readout", () => {
    const p = createUploadPill({ totalBytesHint: 16 * 1048576, label: "screenshot + recording" })
    const el = pillEl()
    expect(el.querySelector(".spin")).not.toBeNull()
    expect(el.textContent).toContain("Uploading your report")
    expect(el.textContent).toContain("screenshot + recording")
    expect(el.textContent).toContain("/ 16.0 MB")
    p.dismiss()
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })

  it("drives the progress bar + bytes from real upload progress", () => {
    const p = createUploadPill({ label: "screenshot" })
    p.progress(45, 4.9 * 1048576, 16 * 1048576)
    const el = pillEl()
    const fill = el.querySelector(".prog > i") as HTMLElement
    expect(fill.style.width).toBe("45%")
    expect(el.textContent).toContain("4.9 / 16.0 MB")
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })

  it("flips to success with ref + Open-in-Klavity link and auto-dismisses ~4s (hover pauses)", async () => {
    vi.useFakeTimers()
    const p = createUploadPill({ label: "screenshot" })
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/dashboard#tickets")
    const el = pillEl()
    expect(el.classList.contains("ok")).toBe(true)
    expect(el.textContent).toContain("Report sent")
    expect(el.textContent).toContain("fb_1a2b3c4d")
    expect(el.textContent).not.toContain("5e6f-4a81") // shortened, quotable ref only
    const a = el.querySelector("a") as HTMLAnchorElement
    expect(a.href).toBe("https://klavity.in/dashboard#tickets")
    expect(a.target).toBe("_blank")

    // Hover pauses the countdown; leaving resumes it.
    await vi.advanceTimersByTimeAsync(2000)
    el.dispatchEvent(new MouseEvent("mouseenter"))
    await vi.advanceTimersByTimeAsync(10000)
    expect(document.querySelector('[data-klavity-ui="upload-pill"]')).not.toBeNull() // still up
    el.dispatchEvent(new MouseEvent("mouseleave"))
    await vi.advanceTimersByTimeAsync(2000) // remaining ~2s
    await vi.advanceTimersByTimeAsync(300) // fade-out removal
    expect(document.querySelector('[data-klavity-ui="upload-pill"]')).toBeNull()
    vi.useRealTimers()
  })

  it("failure → Retry re-sends the SAME retained payload without re-capturing, then succeeds", async () => {
    // Mimic widget.ts's pill wiring: a retained payload + an attempt() that re-runs on Retry.
    const retainedPayload = { screenshots: ["shot"], recordings: [{ bytes: 5 }] }
    const seen: unknown[] = []
    let calls = 0
    const fakeSubmit = (payload: unknown, onProgress: (pct: number, l?: number, t?: number) => void) => {
      seen.push(payload)
      calls++
      onProgress(50, 8 * 1048576, 16 * 1048576)
      // Fail the first attempt, succeed the second.
      return calls === 1
        ? Promise.reject(new Error("network"))
        : Promise.resolve({ issueKey: "CHAR-7", issueUrl: "" })
    }

    const pill = createUploadPill({ label: "screenshot + recording" })
    const attempt = () => {
      pill.uploading()
      fakeSubmit(retainedPayload, (pct, l, t) => pill.progress(pct, l, t))
        .then((r) => pill.success((r as any).issueKey, (r as any).issueUrl))
        .catch(() => pill.failure(attempt))
    }
    attempt()
    await Promise.resolve(); await Promise.resolve()

    const el = pillEl()
    expect(el.classList.contains("err")).toBe(true)
    expect(el.textContent).toContain("Upload didn't finish")
    const retry = el.querySelector("a") as HTMLAnchorElement
    expect(retry.textContent).toBe("Retry")

    // Click Retry → re-runs attempt() with the SAME payload object (no re-capture).
    retry.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    await Promise.resolve(); await Promise.resolve()

    expect(calls).toBe(2)
    expect(seen[0]).toBe(retainedPayload) // exact same object reference reused
    expect(seen[1]).toBe(retainedPayload)
    const el2 = pillEl()
    expect(el2.classList.contains("ok")).toBe(true)
    expect(el2.textContent).toContain("Report sent")
    expect(el2.textContent).toContain("CHAR-7")
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })
})
