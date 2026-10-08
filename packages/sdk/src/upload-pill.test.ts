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

  it("flips to success (Option D: thumbnail + 'Report sent' + ref chip + Open-in-Klavity) and auto-dismisses ~4s (hover pauses)", async () => {
    vi.useFakeTimers()
    // #651: pass the report's own captured screenshot → rendered as the success toast's thumbnail.
    const shot = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA0AAAAA"
    const p = createUploadPill({ label: "screenshot", thumbnail: shot })
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/dashboard#tickets")
    const el = pillEl()
    expect(el.classList.contains("ok")).toBe(true)
    expect(el.textContent).toContain("Report sent")
    expect(el.textContent).toContain("Filed as")
    expect(el.textContent).toContain("fb_1a2b3c4d")
    expect(el.textContent).not.toContain("5e6f-4a81") // shortened, quotable ref only
    // Thumbnail = the captured screenshot; green 'sent' check badge overlaps it.
    const thumb = el.querySelector("img.thumb") as HTMLImageElement
    expect(thumb).not.toBeNull()
    expect(thumb.src).toBe(shot)
    expect(el.querySelector(".thumbwrap .badge svg")).not.toBeNull()
    // Ref is a mono chip; indigo 'K' logo chip precedes the title.
    expect(el.querySelector(".refc")?.textContent).toBe("fb_1a2b3c4d")
    expect(el.querySelector(".klogo")?.textContent).toBe("K")
    const a = el.querySelector("a.open") as HTMLAnchorElement
    expect(a.href).toBe("https://klavity.in/dashboard#tickets")
    expect(a.target).toBe("_blank")
    expect(a.rel).toBe("noopener")
    expect(a.textContent).toContain("Open in Klavity")

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

  it("KLA-766: success shows the friendly ticket key from the deep-link permalink, not the fb_ id", () => {
    const p = createUploadPill({ label: "screenshot" })
    // Server returned a pretty deep link with a friendly KEY-<n> → surface THAT, never the opaque fb_ id.
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/quantana/KLA-142")
    const el = pillEl()
    expect(el.querySelector(".refc")?.textContent).toBe("KLA-142")
    expect(el.textContent).not.toContain("fb_")
    // KLA-768: link deep-links to that exact issue permalink.
    const a = el.querySelector("a.open") as HTMLAnchorElement
    expect(a.href).toBe("https://klavity.in/quantana/KLA-142")
    expect(a.textContent).toContain("Open in Klavity")
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })

  it("KLA-766: falls back to the shortened fb_ ref when the deep link has no friendly key (/t/<id>)", () => {
    const p = createUploadPill({ label: "screenshot" })
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/t/fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9")
    const el = pillEl()
    expect(el.querySelector(".refc")?.textContent).toBe("fb_1a2b3c4d")
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })

  it("#651: success falls back to the Klavity 'K' mark tile when no screenshot is available", () => {
    const p = createUploadPill({ label: "screenshot" }) // no thumbnail
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/dashboard#tickets")
    const el = pillEl()
    expect(el.querySelector("img.thumb")).toBeNull()
    const kmark = el.querySelector(".thumb.kmark") as HTMLElement
    expect(kmark).not.toBeNull()
    expect(kmark.textContent).toBe("K")
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
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

  // #475: concurrent pills must occupy distinct vertical slots, and dismissing one must REFLOW the rest so a
  // later pill never lands on top of an existing one (the old count-based positioning did exactly that).
  it("#475: pills take distinct slots; dismissing one reflows the rest so none overlap", async () => {
    vi.useFakeTimers()
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const hosts = () => Array.from(document.querySelectorAll('[data-klavity-ui="upload-pill"]')) as HTMLElement[]

    const p1 = createUploadPill({ label: "1" })
    createUploadPill({ label: "2" })
    createUploadPill({ label: "3" })
    expect(hosts().map(h => h.style.bottom)).toEqual(["78px", "136px", "194px"])

    // Dismiss pill 1 (slot 0). The two survivors immediately compact to slots 0 + 1.
    p1.dismiss()
    await vi.advanceTimersByTimeAsync(300) // fade-out + host.remove()
    expect(hosts().length).toBe(2)
    expect(hosts().map(h => h.style.bottom)).toEqual(["78px", "136px"])

    // A NEW pill (filed mid-upload) lands on the next free slot — never on top of an existing one.
    createUploadPill({ label: "4" })
    const bottoms = hosts().map(h => h.style.bottom)
    expect(new Set(bottoms).size).toBe(bottoms.length) // all distinct → no overlap
    expect(bottoms).toContain("194px")

    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    vi.useRealTimers()
  })

  // #475: failed pills used to persist forever and stack up. They now auto-dismiss after a long window
  // (~30s, well past the 4s success window) while still offering the × / Retry to clear sooner.
  it("#475: a failed pill auto-dismisses after the long fail window", async () => {
    vi.useFakeTimers()
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const p = createUploadPill({ label: "screenshot" })
    p.failure(() => {})
    expect(pillEl().classList.contains("err")).toBe(true)

    // Still up well before the fail window elapses (much longer than the 4s success window).
    await vi.advanceTimersByTimeAsync(10000)
    expect(document.querySelector('[data-klavity-ui="upload-pill"]')).not.toBeNull()

    // Past ~30s + the fade-out → gone.
    await vi.advanceTimersByTimeAsync(21000)
    await vi.advanceTimersByTimeAsync(300)
    expect(document.querySelector('[data-klavity-ui="upload-pill"]')).toBeNull()
    vi.useRealTimers()
  })
  // Safe retries: the pill tells the user what is happening instead of a bare "didn't finish".
  it("retrying: shows the attempt count and the reason, with the spinner", () => {
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const p = createUploadPill({ label: "screenshot" })
    p.retrying(2, 3, "No connection to Klavity — check your network.")
    const el = pillEl()
    expect(el.querySelector(".spin")).not.toBeNull()
    expect(el.textContent).toContain("Retrying… (2/3)")
    expect(el.textContent).toContain("No connection to Klavity")
    p.dismiss(); document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })

  it("failure: shows the SPECIFIC reason (falls back to the old generic hint) and Retry re-runs the attempt once", () => {
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const retry = vi.fn()
    const p = createUploadPill({ label: "screenshot" })
    p.failure(retry, "The files are too large to upload. Remove some and try again.")
    expect(pillEl().textContent).toContain("Upload didn't finish")
    expect(pillEl().textContent).toContain("The files are too large to upload")
    ;(pillEl().querySelector("a") as HTMLElement).click()
    expect(retry).toHaveBeenCalledTimes(1)
    p.dismiss(); document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const q = createUploadPill({ label: "screenshot" }); q.failure(() => {})
    expect(pillEl().textContent).toContain("check your connection")
    q.dismiss(); document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })

  it("partial: the ticket was created but files are missing — a warning (not a failure) with the count, and Retry re-sends only those", () => {
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const retryMissing = vi.fn()
    const p = createUploadPill({ label: "screenshot + 3 files" })
    p.partial(2, retryMissing)
    const el = pillEl()
    expect(el.classList.contains("err")).toBe(true)
    expect(el.textContent).toContain("Report sent")
    expect(el.textContent).toContain("2 files missing")
    ;(el.querySelector("a") as HTMLElement).click()
    expect(retryMissing).toHaveBeenCalledTimes(1)
    p.partial(1, () => {})
    expect(pillEl().textContent).toContain("1 file missing")        // singular
    p.dismiss(); document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })
  // The server is still processing THIS report (an earlier attempt owns it): an accurate 'waiting' state, not a failure and not a new attempt.
  it("waiting: says the server is still processing, when it will look again and how long it has waited — spinner on, no failure styling", () => {
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const p = createUploadPill({ label: "screenshot + 2 files" })
    p.waiting(3000, 12000)
    const el = pillEl()
    expect(el.classList.contains("err")).toBe(false)
    expect(el.querySelector(".spin")).not.toBeNull()
    expect(el.textContent).toContain("Finishing your report")
    expect(el.textContent).toContain("still processing")
    expect(el.textContent).toContain("checking again in 3s")
    expect(el.textContent).toContain("waited 12s")
    p.dismiss(); document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })
  it("failure with a custom button label ('Retry anyway') shows a LONG explanation in full (wrapped, with a tooltip) and Retry still fires once", () => {
    document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
    const retry = vi.fn()
    const p = createUploadPill({ label: "screenshot" })
    const msg = "We couldn't confirm your report was received — it may already have been created. Check Klavity before retrying: this server can't prevent a duplicate."
    p.failure(retry, msg, "Retry anyway")
    const el = pillEl()
    expect(el.textContent).toContain("may already have been created")
    expect((el.querySelector("a") as HTMLElement).textContent).toBe("Retry anyway")
    const sub = el.querySelector(".sub") as HTMLElement
    expect(sub.style.whiteSpace).toBe("normal"); expect(sub.title).toBe(msg)
    ;(el.querySelector("a") as HTMLElement).click()
    expect(retry).toHaveBeenCalledTimes(1)
    p.uploading()                                                    // after the user retries the wrapped text goes back to normal
    expect((pillEl().querySelector(".sub") as HTMLElement).style.whiteSpace).toBe("")
    p.dismiss(); document.querySelectorAll('[data-klavity-ui="upload-pill"]').forEach(n => n.remove())
  })
})
