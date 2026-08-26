// @vitest-environment jsdom
// KLA-601: on a Screen-share DECLINE the composer keeps the rendered fallback but surfaces a one-time,
// dismissible helper nudge anchored to the (recommended) Screen button — never a silent fail, never a nag.
// KLA-602(a): a finished "Record me" recording drops STRAIGHT into the photos/videos gallery as a selected,
// removable video tile (reusing the KLA-591 video-tile look) — no separate Preview→Attach modal, no text chip.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

beforeEach(() => { document.body.innerHTML = "" })

// ── KLA-601: Screen-decline nudge ──────────────────────────────────────────────────────────────────────
describe("KLA-601 Screen-decline helper nudge", () => {
  const declineCbs = () => ({
    onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
    onCaptureViewport: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,VIEWPORT", quality: "rendered" as const }),
    // getDisplayMedia cancelled → NotAllowedError (an expected decline).
    onCaptureSharp: vi.fn().mockRejectedValue(Object.assign(new Error("Permission denied"), { name: "NotAllowedError" })),
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
    autoCaptureOnOpen: true,
    screenCaptureDefault: true,
  })

  it("on decline: keeps the rendered fallback AND shows a one-time nudge that pulses the Screen button", async () => {
    const cbs = declineCbs()
    buildModal("bug", cbs as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await wait(60)
    // Rendered fallback still ran — the reporter is never left shot-less.
    expect(cbs.onCaptureViewport).toHaveBeenCalledTimes(1)
    // The action-oriented nudge is anchored near the Screen button and steers the eye (pulse).
    const nudges = shadow.querySelectorAll(".kl-nudge")
    expect(nudges.length).toBe(1)
    expect(nudges[0].textContent || "").toMatch(/pixel-perfect|try it now/i)
    const sharp = shadow.getElementById("klavity-sharp") as HTMLButtonElement
    expect(sharp.classList.contains("kl-pulse")).toBe(true)
    // It is non-blocking: no error surfaced for a decline.
    const err = shadow.getElementById("klavity-err") as HTMLElement | null
    expect(err && err.style.display === "block").toBeFalsy()
  })

  it("is dismissible and shows AT MOST ONCE per composer session (a second decline does not re-nag)", async () => {
    const cbs = declineCbs()
    buildModal("bug", cbs as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await wait(60)
    expect(shadow.querySelectorAll(".kl-nudge").length).toBe(1)
    // Dismiss it via its close affordance.
    ;(shadow.querySelector(".kl-nudge .kl-nudge-x") as HTMLButtonElement).click()
    expect(shadow.querySelectorAll(".kl-nudge").length).toBe(0)
    // A SECOND decline (manual Screen click → rejects again) must NOT resurrect the nudge.
    ;(shadow.getElementById("klavity-sharp") as HTMLButtonElement).click()
    await wait(30)
    expect(cbs.onCaptureSharp).toHaveBeenCalledTimes(2) // both the on-open default + the manual retry declined
    expect(shadow.querySelectorAll(".kl-nudge").length).toBe(0) // once-per-session: never shown again
  })

  it("never nudges when Screen is unsupported (no onCaptureSharp — e.g. iOS Safari)", async () => {
    const cbs = {
      onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
      onCaptureViewport: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,VIEWPORT", quality: "rendered" as const }),
      onClose: vi.fn(),
      onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
      autoCaptureOnOpen: true,
    }
    buildModal("bug", cbs as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await wait(60)
    expect(shadow.getElementById("klavity-sharp")).toBeNull() // no Screen button
    expect(shadow.querySelectorAll(".kl-nudge").length).toBe(0)
  })
})

// ── KLA-602(a): recording → gallery video tile ─────────────────────────────────────────────────────────
describe("KLA-602(a) recording auto-adds to the gallery as a selected, removable video tile", () => {
  const recCbs = (onRecord: any) => ({
    onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
    allowRecording: true,
    onRecord,
  })
  const fakeRecording = () => ({
    id: "rec_1", dataUrl: "data:video/webm;base64,AAAA", mime: "video/webm",
    durationMs: 12000, bytes: 2048, width: 1280, height: 720, screenOnly: false,
  })

  it("stopping a recording drops it into the strip as an active video tile with play + Re-record + Remove — NO preview/chip", async () => {
    const onRecord = vi.fn().mockResolvedValue(fakeRecording())
    buildModal("bug", recCbs(onRecord) as any, { theme: "light" } as any)
    const shadow = modalShadow()
    // The finished recording resolves through onRecord (the recorder no longer gates on a Preview→Attach modal).
    ;(shadow.getElementById("klavity-record") as HTMLButtonElement).click()
    await wait(30)
    expect(onRecord).toHaveBeenCalledTimes(1)
    // It renders as a KLA-591-style video TILE in the unified strip — not the old text chip / recordings box.
    const tile = shadow.querySelector(".klavity-strip .kl-rec-tile") as HTMLElement | null
    expect(tile).not.toBeNull()
    expect(tile!.classList.contains("kl-video-thumb")).toBe(true)
    expect(tile!.querySelector("video")).not.toBeNull()          // inline play (poster/first frame)
    expect(tile!.classList.contains("kl-thumb-active")).toBe(true) // auto-selected as the hero
    expect(tile!.querySelector(".kl-rerec")).not.toBeNull()        // Re-record affordance
    expect(tile!.querySelector(".klavity-rm")).not.toBeNull()      // removable
    // The selected recording owns the hero as an inline <video controls> preview.
    expect(shadow.querySelector("#klavity-hero-stage video")).not.toBeNull()
    // The old separate recordings chip row is gone entirely.
    expect(shadow.getElementById("klavity-recordings")).toBeNull()
    expect(shadow.querySelector(".kl-rec-chip")).toBeNull()
  })

  it("the reporter can delete the recording from the gallery", async () => {
    const onRecord = vi.fn().mockResolvedValue(fakeRecording())
    buildModal("bug", recCbs(onRecord) as any, { theme: "light" } as any)
    const shadow = modalShadow()
    ;(shadow.getElementById("klavity-record") as HTMLButtonElement).click()
    await wait(30)
    expect(shadow.querySelector(".kl-rec-tile")).not.toBeNull()
    ;(shadow.querySelector(".kl-rec-tile .klavity-rm") as HTMLButtonElement).click()
    await wait(10)
    expect(shadow.querySelector(".kl-rec-tile")).toBeNull()
    // Hero falls back to the empty state (no shots, no recording).
    expect(shadow.querySelector("#klavity-hero-stage video")).toBeNull()
  })

  it("a recording-only report is valid evidence and submits with the dedicated `recordings` field", async () => {
    const onRecord = vi.fn().mockResolvedValue(fakeRecording())
    const cbs = recCbs(onRecord)
    buildModal("bug", cbs as any, { theme: "light" } as any)
    const shadow = modalShadow()
    ;(shadow.getElementById("klavity-record") as HTMLButtonElement).click()
    await wait(30)
    const submit = shadow.getElementById("klavity-submit") as HTMLButtonElement
    expect(submit.disabled).toBe(false) // recording = evidence → submit enabled with no typed prose
    submit.click()
    await wait(40)
    expect(cbs.onSubmit).toHaveBeenCalledTimes(1)
    const payload = cbs.onSubmit.mock.calls[0][0]
    expect(Array.isArray(payload.recordings)).toBe(true)
    expect(payload.recordings.length).toBe(1)
    expect(payload.recordings[0].id).toBe("rec_1")
  })
})
