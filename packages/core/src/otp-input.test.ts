// @vitest-environment jsdom
// Unit tests for the unified OTP input helper (KLAVITYKLA-296) — the single source of
// truth behind the four Klavity OTP-entry UIs (web login, widget-connect, extension
// popup, extension options).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mountOtpInput } from "./otp-input"

function makeInput(): HTMLInputElement {
  const el = document.createElement("input")
  document.body.appendChild(el)
  return el
}
// Simulate a user typing/pasting: set the value then fire the `input` event the helper listens on.
function type(el: HTMLInputElement, value: string) {
  el.value = value
  el.dispatchEvent(new Event("input"))
}

describe("mountOtpInput — input UX", () => {
  it("applies consistent attributes (inputmode, autocomplete, maxlength, placeholder)", () => {
    const input = makeInput()
    mountOtpInput({ input })
    expect(input.getAttribute("inputmode")).toBe("numeric")
    expect(input.getAttribute("autocomplete")).toBe("one-time-code")
    expect(input.getAttribute("maxlength")).toBe("6")
    expect(input.getAttribute("placeholder")).toBe("000000")
  })

  it("keeps an existing placeholder", () => {
    const input = makeInput()
    input.setAttribute("placeholder", "6-digit code")
    mountOtpInput({ input })
    expect(input.getAttribute("placeholder")).toBe("6-digit code")
  })

  it("strips non-digits and caps at length (paste-to-fill)", () => {
    const input = makeInput()
    mountOtpInput({ input, autoSubmit: false })
    type(input, "12 34-56")
    expect(input.value).toBe("123456")
    type(input, "abc9x8y7z6w5v4u3")
    expect(input.value).toBe("987654")
  })

  it("auto-submits once when it reaches full length", () => {
    const input = makeInput()
    const onComplete = vi.fn()
    mountOtpInput({ input, onComplete })
    type(input, "123")
    expect(onComplete).not.toHaveBeenCalled()
    type(input, "123456")
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith("123456")
    // Re-firing the same value (extra input event) does not double-submit.
    input.dispatchEvent(new Event("input"))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it("does not auto-submit when autoSubmit is false, but Enter still submits", () => {
    const input = makeInput()
    const onComplete = vi.fn()
    mountOtpInput({ input, onComplete, autoSubmit: false })
    type(input, "654321")
    expect(onComplete).not.toHaveBeenCalled()
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
    expect(onComplete).toHaveBeenCalledWith("654321")
  })

  it("re-arms auto-submit after the field drops below full (re-typing the same code)", () => {
    const input = makeInput()
    const onComplete = vi.fn()
    const ctrl = mountOtpInput({ input, onComplete })
    type(input, "111111")
    expect(onComplete).toHaveBeenCalledTimes(1)
    ctrl.clear()
    type(input, "111111")
    expect(onComplete).toHaveBeenCalledTimes(2)
  })

  it("clears the error element as the user types", () => {
    const input = makeInput()
    const errorEl = document.createElement("div")
    const ctrl = mountOtpInput({ input, errorEl })
    ctrl.setError("Invalid code")
    expect(errorEl.textContent).toBe("Invalid code")
    type(input, "1")
    expect(errorEl.textContent).toBe("")
  })
})

describe("mountOtpInput — resend cooldown", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("runs onResend, then counts down and re-enables the link", async () => {
    const input = makeInput()
    const link = document.createElement("a")
    const onResend = vi.fn().mockResolvedValue(undefined)
    mountOtpInput({ input, resend: { el: link, onResend, cooldownSecs: 3 } })

    link.dispatchEvent(new MouseEvent("click"))
    await vi.waitFor(() => expect(onResend).toHaveBeenCalledTimes(1))
    // Cooldown is armed.
    expect(link.getAttribute("aria-disabled")).toBe("true")
    expect(link.textContent).toBe("Resend in 3s")

    vi.advanceTimersByTime(3000)
    expect(link.textContent).toBe("Resend code")
    expect(link.getAttribute("aria-disabled")).toBe("false")
  })

  it("ignores clicks while cooling down", async () => {
    const input = makeInput()
    const link = document.createElement("a")
    const onResend = vi.fn().mockResolvedValue(true)
    mountOtpInput({ input, resend: { el: link, onResend, cooldownSecs: 30 } })
    link.dispatchEvent(new MouseEvent("click"))
    await vi.waitFor(() => expect(onResend).toHaveBeenCalledTimes(1))
    link.dispatchEvent(new MouseEvent("click"))
    link.dispatchEvent(new MouseEvent("click"))
    expect(onResend).toHaveBeenCalledTimes(1)
  })

  it("skips the cooldown when onResend returns false (send failed)", async () => {
    const input = makeInput()
    const link = document.createElement("a")
    const onResend = vi.fn().mockResolvedValue(false)
    mountOtpInput({ input, resend: { el: link, onResend, cooldownSecs: 30 } })
    link.dispatchEvent(new MouseEvent("click"))
    await vi.waitFor(() => expect(onResend).toHaveBeenCalledTimes(1))
    // No cooldown → immediately clickable again.
    expect(link.getAttribute("aria-disabled")).toBe("false")
    expect(link.textContent).toBe("Resend code")
    link.dispatchEvent(new MouseEvent("click"))
    await vi.waitFor(() => expect(onResend).toHaveBeenCalledTimes(2))
  })

  it("stopResendCooldown restores the ready state", () => {
    const input = makeInput()
    const link = document.createElement("a")
    const ctrl = mountOtpInput({ input, resend: { el: link, onResend: () => {}, cooldownSecs: 30 } })
    ctrl.startResendCooldown(30)
    expect(link.getAttribute("aria-disabled")).toBe("true")
    ctrl.stopResendCooldown()
    expect(link.getAttribute("aria-disabled")).toBe("false")
    expect(link.textContent).toBe("Resend code")
  })

  it("disables a <button> resend element via its .disabled property", () => {
    const input = makeInput()
    const btn = document.createElement("button")
    const ctrl = mountOtpInput({ input, resend: { el: btn, onResend: () => {} } })
    ctrl.startResendCooldown(10)
    expect(btn.disabled).toBe(true)
    ctrl.stopResendCooldown()
    expect(btn.disabled).toBe(false)
  })
})
