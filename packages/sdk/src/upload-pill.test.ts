// @vitest-environment jsdom
// The non-blocking background-upload REPORTS PANEL (widget layer). Every report filed after the modal closes on
// Submit is a row in ONE "Your reports" panel (KD-3092): uploading (spinner + progress bar + byte readout),
// success ("Report sent" + ticket-ID link + "Open in Klavity"), failure ("Upload didn't finish" + Retry). The
// panel stays until the reporter closes it with × — no auto-dismiss — so every ticket ID of a multi-ticket report
// stays visible. Also proves the widget's retry loop re-sends the SAME retained payload — no re-capture.
import { describe, it, expect, vi, beforeEach } from "vitest"

// widget.ts auto-calls mount() at module load. mount() reads the current <script> via
// parseScriptConfig, which crashes under jsdom (no script tag). Stub it to return an empty
// projectId so the auto-mount returns early — we only exercise the exported createUploadPill here.
vi.mock("./widget-lib", async () => {
  const actual = await vi.importActual<typeof import("./widget-lib")>("./widget-lib")
  return { ...actual, parseScriptConfig: vi.fn(() => ({ projectId: "", backendUrl: "" })) }
})

import { createUploadPill } from "./widget"

const trayHost = () => document.querySelector('[data-klavity-ui="report-tray"]') as HTMLElement | null
const tray = () => trayHost()!.shadowRoot!
const rows = () => Array.from(tray().querySelectorAll(".pill")) as HTMLElement[]
const pillEl = () => rows()[0]
const panel = () => tray().querySelector(".tray") as HTMLElement
const closeBtn = () => tray().querySelector(".tray-x") as HTMLButtonElement
const summary = () => (tray().querySelector(".hd .sm") as HTMLElement).textContent || ""

beforeEach(() => { document.querySelectorAll('[data-klavity-ui="report-tray"]').forEach(n => n.remove()) })

describe("report row states", () => {
  it("starts in the uploading state with a spinner + byte readout", () => {
    createUploadPill({ totalBytesHint: 16 * 1048576, label: "screenshot + recording" })
    const el = pillEl()
    expect(el.querySelector(".spin")).not.toBeNull()
    expect(el.textContent).toContain("Uploading your report")
    expect(el.textContent).toContain("screenshot + recording")
    expect(el.textContent).toContain("/ 16.0 MB")
    expect(summary()).toBe("Sending…")
  })

  it("drives the progress bar + bytes from real upload progress", () => {
    const p = createUploadPill({ label: "screenshot" })
    p.progress(45, 4.9 * 1048576, 16 * 1048576)
    const el = pillEl()
    const fill = el.querySelector(".prog > i") as HTMLElement
    expect(fill.style.width).toBe("45%")
    expect(el.textContent).toContain("4.9 / 16.0 MB")
  })

  it("flips to success (thumbnail + 'Report sent' + ticket-ID link + Open-in-Klavity) and does NOT auto-dismiss", async () => {
    vi.useFakeTimers()
    // #651: the report's own captured screenshot → rendered as the row's thumbnail.
    const shot = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA0AAAAA"
    const p = createUploadPill({ label: "screenshot", thumbnail: shot })
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/dashboard#tickets")
    const el = pillEl()
    expect(el.classList.contains("ok")).toBe(true)
    expect(el.textContent).toContain("Report sent")
    expect(el.textContent).toContain("Filed as")
    expect(el.textContent).toContain("fb_1a2b3c4d")
    expect(el.textContent).not.toContain("5e6f-4a81") // shortened, quotable ref only
    const thumb = el.querySelector("img.thumb") as HTMLImageElement
    expect(thumb).not.toBeNull()
    expect(thumb.src).toBe(shot)
    expect(el.querySelector(".thumbwrap .badge svg")).not.toBeNull()
    // The ticket ID itself is a link to the ticket; "Open in Klavity" too.
    const id = el.querySelector("a.refc") as HTMLAnchorElement
    expect(id.textContent).toBe("fb_1a2b3c4d")
    expect(id.href).toBe("https://klavity.in/dashboard#tickets")
    expect(id.target).toBe("_blank")
    expect(id.rel).toBe("noopener")
    const a = el.querySelector("a.open") as HTMLAnchorElement
    expect(a.href).toBe("https://klavity.in/dashboard#tickets")
    expect(a.target).toBe("_blank")
    expect(a.rel).toBe("noopener")
    expect(a.textContent).toContain("Open in Klavity")
    expect(summary()).toBe("1 sent")

    // KD-3092: it stays — the reporter closes it.
    await vi.advanceTimersByTimeAsync(60000)
    expect(trayHost()).not.toBeNull()
    expect(pillEl().textContent).toContain("Report sent")
    vi.useRealTimers()
  })

  it("KLA-766: success shows the friendly ticket key from the deep-link permalink, not the fb_ id", () => {
    const p = createUploadPill({ label: "screenshot" })
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/quantana/KLA-142")
    const el = pillEl()
    expect(el.querySelector(".refc")?.textContent).toBe("KLA-142")
    expect(el.textContent).not.toContain("fb_")
    // KLA-768: both the ID and the link deep-link to that exact issue permalink.
    expect((el.querySelector("a.refc") as HTMLAnchorElement).href).toBe("https://klavity.in/quantana/KLA-142")
    const a = el.querySelector("a.open") as HTMLAnchorElement
    expect(a.href).toBe("https://klavity.in/quantana/KLA-142")
    expect(a.textContent).toContain("Open in Klavity")
  })

  it("KLA-766: falls back to the shortened fb_ ref when the deep link has no friendly key (/t/<id>)", () => {
    const p = createUploadPill({ label: "screenshot" })
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/t/fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9")
    expect(pillEl().querySelector(".refc")?.textContent).toBe("fb_1a2b3c4d")
  })

  it("no URL → the ID is shown as plain text (not a dead link); nothing at all → 'We filed it.'", () => {
    const p = createUploadPill({ label: "screenshot" })
    p.success("CHAR-7", "")
    expect(pillEl().querySelector("span.refc")?.textContent).toBe("CHAR-7")
    expect(pillEl().querySelector("a")).toBeNull()
    const q = createUploadPill({ label: "screenshot" })
    q.success("", "")
    expect(rows()[1].textContent).toContain("We filed it.")
  })

  it("#651: success falls back to the Klavity 'K' mark tile when no screenshot is available", () => {
    const p = createUploadPill({ label: "screenshot" }) // no thumbnail
    p.success("fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9", "https://klavity.in/dashboard#tickets")
    const el = pillEl()
    expect(el.querySelector("img.thumb")).toBeNull()
    const kmark = el.querySelector(".thumb.kmark") as HTMLElement
    expect(kmark).not.toBeNull()
    expect(kmark.textContent).toBe("K")
  })

  it("failure → Retry re-sends the SAME retained payload without re-capturing, then succeeds", async () => {
    const retainedPayload = { screenshots: ["shot"], recordings: [{ bytes: 5 }] }
    const seen: unknown[] = []
    let calls = 0
    const fakeSubmit = (payload: unknown, onProgress: (pct: number, l?: number, t?: number) => void) => {
      seen.push(payload)
      calls++
      onProgress(50, 8 * 1048576, 16 * 1048576)
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
    expect(summary()).toContain("needs attention")
    const retry = el.querySelector("a") as HTMLAnchorElement
    expect(retry.textContent).toBe("Retry")
    retry.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    await Promise.resolve(); await Promise.resolve()

    expect(calls).toBe(2)
    expect(seen[0]).toBe(retainedPayload) // exact same object reference reused
    expect(seen[1]).toBe(retainedPayload)
    const el2 = pillEl()
    expect(el2.classList.contains("ok")).toBe(true)
    expect(el2.textContent).toContain("Report sent")
    expect(el2.textContent).toContain("CHAR-7")
    expect(rows()).toHaveLength(1) // the retry updated the same row
  })

  it("retrying: shows the attempt count and the reason, with the spinner", () => {
    const p = createUploadPill({ label: "screenshot" })
    p.retrying(2, 3, "No connection to Klavity — check your network.")
    const el = pillEl()
    expect(el.querySelector(".spin")).not.toBeNull()
    expect(el.textContent).toContain("Retrying… (2/3)")
    expect(el.textContent).toContain("No connection to Klavity")
  })

  it("failure: shows the SPECIFIC reason (falls back to the old generic hint) and Retry re-runs the attempt once", () => {
    const retry = vi.fn()
    const p = createUploadPill({ label: "screenshot" })
    p.failure(retry, "The files are too large to upload. Remove some and try again.")
    expect(pillEl().textContent).toContain("Upload didn't finish")
    expect(pillEl().textContent).toContain("The files are too large to upload")
    ;(pillEl().querySelector("a") as HTMLElement).click()
    expect(retry).toHaveBeenCalledTimes(1)
    p.dismiss()
    const q = createUploadPill({ label: "screenshot" }); q.failure(() => {})
    expect(pillEl().textContent).toContain("check your connection")
  })

  it("a failed row stays (no auto-dismiss) until the reporter closes the panel", async () => {
    vi.useFakeTimers()
    const p = createUploadPill({ label: "screenshot" })
    p.failure(() => {})
    await vi.advanceTimersByTimeAsync(120000)
    expect(pillEl().classList.contains("err")).toBe(true)
    vi.useRealTimers()
  })

  it("partial: the ticket was created but files are missing — a warning (not a failure) with the count, and Retry re-sends only those", () => {
    const retryMissing = vi.fn()
    const p = createUploadPill({ label: "screenshot + 3 files" })
    p.partial(2, retryMissing)
    const el = pillEl()
    expect(el.classList.contains("err")).toBe(true)
    expect(el.textContent).toContain("Report sent")
    expect(el.textContent).toContain("2 files missing")
    expect(summary()).toBe("1 sent")
    ;(el.querySelector("a") as HTMLElement).click()
    expect(retryMissing).toHaveBeenCalledTimes(1)
    p.partial(1, () => {})
    expect(pillEl().textContent).toContain("1 file missing")        // singular
  })

  it("waiting: says the server is still processing, when it will look again and how long it has waited — spinner on, no failure styling", () => {
    const p = createUploadPill({ label: "screenshot + 2 files" })
    p.waiting(3000, 12000)
    const el = pillEl()
    expect(el.classList.contains("err")).toBe(false)
    expect(el.querySelector(".spin")).not.toBeNull()
    expect(el.textContent).toContain("Finishing your report")
    expect(el.textContent).toContain("still processing")
    expect(el.textContent).toContain("checking again in 3s")
    expect(el.textContent).toContain("waited 12s")
  })

  it("failure with a custom button label ('Retry anyway') shows a LONG explanation in full (wrapped, with a tooltip) and Retry still fires once", () => {
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
  })
})

describe("KD-3092: one 'Your reports' panel for every ticket", () => {
  it("several reports (e.g. a multi-issue submit) are rows in ONE panel, each with its own ticket-ID link", () => {
    const a = createUploadPill({ label: "1" })
    const b = createUploadPill({ label: "2" })
    const c = createUploadPill({ label: "3" })
    expect(document.querySelectorAll('[data-klavity-ui="report-tray"]').length).toBe(1)
    expect(rows()).toHaveLength(3)
    expect(summary()).toBe("0 of 3 sent · 3 uploading")
    a.success("x", "https://klavity.in/acme/PM-101")
    b.success("y", "https://klavity.in/acme/PM-102")
    expect(summary()).toBe("2 of 3 sent · 1 uploading")
    c.success("z", "https://klavity.in/acme/PM-103")
    expect(summary()).toBe("3 of 3 sent")
    const ids = rows().map(r => (r.querySelector("a.refc") as HTMLAnchorElement))
    expect(ids.map(i => i.textContent)).toEqual(["PM-101", "PM-102", "PM-103"])
    expect(ids.map(i => i.href)).toEqual(["https://klavity.in/acme/PM-101", "https://klavity.in/acme/PM-102", "https://klavity.in/acme/PM-103"])
  })

  it("the panel has a header with a × Close button; × closes it", () => {
    const p = createUploadPill({ label: "1" })
    p.success("x", "https://klavity.in/acme/PM-101")
    expect(tray().querySelector(".hd b")?.textContent).toBe("Your reports")
    expect(closeBtn().getAttribute("aria-label")).toBe("Close")
    closeBtn().click()
    expect(trayHost()).toBeNull()
  })

  it("closing while a report is still uploading hides the panel; it comes back when that report finishes", () => {
    const done = createUploadPill({ label: "1" })
    const later = createUploadPill({ label: "2" })
    done.success("x", "https://klavity.in/acme/PM-101")
    closeBtn().click()
    expect(trayHost()).not.toBeNull()
    expect(panel().hidden).toBe(true)
    expect(rows()).toHaveLength(1)                 // the finished one left with the close
    later.success("y", "https://klavity.in/acme/PM-102")
    expect(panel().hidden).toBe(false)             // back, showing the newly filed ticket
    expect(rows().map(r => r.querySelector(".refc")?.textContent)).toEqual(["PM-102"])
  })

  it("a new report after closing opens a fresh panel", () => {
    const p = createUploadPill({ label: "1" }); p.success("x", "https://klavity.in/acme/PM-101")
    closeBtn().click()
    expect(trayHost()).toBeNull()
    createUploadPill({ label: "2" })
    expect(trayHost()).not.toBeNull()
    expect(panel().hidden).toBe(false)
    expect(rows()).toHaveLength(1)
  })

  it("dismiss() removes just that row; the last one takes the panel with it", () => {
    const a = createUploadPill({ label: "1" })
    const b = createUploadPill({ label: "2" })
    a.dismiss()
    expect(rows()).toHaveLength(1)
    b.dismiss()
    expect(trayHost()).toBeNull()
  })

  it("ticket IDs are set as text, never HTML (XSS-safe)", () => {
    const p = createUploadPill({ label: "1" })
    p.success("<img src=x onerror=alert(1)>", "")
    expect(pillEl().querySelector("img:not(.thumb)")).toBeNull()
  })
})
