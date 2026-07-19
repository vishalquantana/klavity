/**
 * Unified OTP (one-time-code) input helper — the single source of truth for the
 * FOUR Klavity OTP-entry UIs:
 *   1. web login            (prototype/public/login.html, #code)
 *   2. widget connect       (prototype/public/widget-connect.html, #code)
 *   3. extension popup       (packages/extension/src/popup.ts, #auth-code)
 *   4. extension options     (packages/extension/src/options.ts, #klav-code)
 *
 * Framework-agnostic DOM: it enhances an existing single <input> with the same
 * markup + UX everywhere — digit-only sanitisation, paste-to-fill, auto-submit on
 * completion, Enter-to-submit, an optional error slot that clears as you type, and
 * an optional resend link with a shared cooldown. Each call site keeps its own
 * request/verify wiring; this only unifies the input + resend behaviour so the four
 * screens look and feel identical.
 *
 * Consumed two ways:
 *   • the extension imports `mountOtpInput` from `@klavity/core/otp-input` (Vite bundles it);
 *   • the static web pages load `window.KlavityOTP.mount(...)` from `prototype/public/otp-input.js`,
 *     which is built from `otp-input.global.ts` — mirroring the sim.global.ts → klavity-sim.js pattern.
 */

export interface OtpResendConfig {
  /** The resend trigger element — an <a> or a <button>. The helper owns its label + disabled state. */
  el: HTMLElement
  /**
   * (Re)send the code. Runs when the user clicks resend (the helper guards against
   * double-clicks and cooldown). Return `false` to skip the cooldown — e.g. the send
   * failed and the user should be able to retry immediately. Any other return (incl.
   * undefined) starts the cooldown.
   */
  onResend: () => unknown | Promise<unknown>
  /** Cooldown length in seconds before resend is allowed again. Default 30. */
  cooldownSecs?: number
  /** Label shown when resend is ready. Default "Resend code". */
  idleLabel?: string
  /** Label shown while a resend request is in flight. Default "Sending…". */
  busyLabel?: string
}

export interface OtpInputOptions {
  /** The single text input the user types the code into. */
  input: HTMLInputElement
  /** Expected code length. Default 6. */
  length?: number
  /**
   * Called when the code should be submitted — on Enter, or automatically once
   * `length` digits are present (unless autoSubmit is false). This is your verify
   * handler; it still validates/handles errors as it likes.
   */
  onComplete?: (code: string) => void
  /** Optional element used to render error text via setError()/clearError(). Cleared as the user types. */
  errorEl?: HTMLElement | null
  /** Optional resend link wiring. */
  resend?: OtpResendConfig
  /** Auto-submit (call onComplete) as soon as `length` digits are present. Default true. */
  autoSubmit?: boolean
}

export interface OtpController {
  /** Current sanitised value. */
  value(): string
  /** Clear the input (and re-arm auto-submit). */
  clear(): void
  /** Focus the input. */
  focus(): void
  /** Set the error text (no-op if no errorEl was provided). */
  setError(msg: string): void
  /** Clear the error text. */
  clearError(): void
  /** Start (or restart) the resend cooldown. */
  startResendCooldown(secs?: number): void
  /** Stop the cooldown and restore the resend link to its ready state. */
  stopResendCooldown(): void
  /** Detach all listeners + timers. */
  destroy(): void
}

export function mountOtpInput(opts: OtpInputOptions): OtpController {
  const { input } = opts
  const length = opts.length ?? 6
  const autoSubmit = opts.autoSubmit !== false
  const errorEl = opts.errorEl ?? null
  const R = opts.resend

  // ── consistent markup/attributes across all four call sites ──
  input.setAttribute('inputmode', 'numeric')
  input.setAttribute('autocomplete', 'one-time-code')
  input.setAttribute('maxlength', String(length))
  input.setAttribute('aria-label', `${length}-digit code`)
  if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', '0'.repeat(length))

  // Guards a completed value from auto-submitting twice (auto + Enter, or repeated input events).
  let firedFor = ''

  const sanitize = (raw: string) => raw.replace(/\D+/g, '').slice(0, length)

  function setError(msg: string) { if (errorEl) errorEl.textContent = msg }
  function clearError() { if (errorEl) errorEl.textContent = '' }

  // explicit = user pressed Enter (delegate regardless of length; the handler validates).
  function submit(explicit: boolean) {
    const v = input.value
    if (explicit) {
      if (v.length === length && v === firedFor) return // already auto-submitted this exact code
      if (v.length === length) firedFor = v
      opts.onComplete?.(v)
      return
    }
    if (!autoSubmit) return
    if (v.length !== length) return
    if (v === firedFor) return
    firedFor = v
    opts.onComplete?.(v)
  }

  // Paste-to-fill works for free: paste fires an `input` event, so sanitize() strips any
  // spaces/dashes/letters from "123 456", "1-2-3-4-5-6", etc. and caps at `length`.
  function onInput() {
    const clean = sanitize(input.value)
    if (clean !== input.value) input.value = clean
    clearError()
    if (clean.length < length) firedFor = '' // re-arm once the field drops below full
    submit(false)
  }
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); submit(true) }
  }

  input.addEventListener('input', onInput)
  input.addEventListener('keydown', onKeydown)

  // ── resend link (optional) ──
  let resendTimer: ReturnType<typeof setInterval> | undefined
  let coolingDown = false
  let busy = false
  const idleLabel = R?.idleLabel ?? 'Resend code'
  const busyLabel = R?.busyLabel ?? 'Sending…'

  function setResendDisabled(disabled: boolean) {
    if (!R) return
    const el = R.el as HTMLElement & { disabled?: boolean }
    if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) el.disabled = disabled
    el.classList.toggle('disabled', disabled)
    el.style.pointerEvents = disabled ? 'none' : ''
    el.style.opacity = disabled ? '0.5' : ''
    el.setAttribute('aria-disabled', disabled ? 'true' : 'false')
  }

  function startResendCooldown(secs = R?.cooldownSecs ?? 30) {
    if (!R) return
    coolingDown = true
    setResendDisabled(true)
    let left = secs
    const tick = () => {
      if (left <= 0) {
        stopResendCooldown()
        return
      }
      R.el.textContent = `Resend in ${left}s`
      left--
    }
    if (resendTimer) clearInterval(resendTimer)
    tick()
    resendTimer = setInterval(tick, 1000)
  }

  function stopResendCooldown() {
    if (resendTimer) { clearInterval(resendTimer); resendTimer = undefined }
    coolingDown = false
    if (R) { R.el.textContent = idleLabel; setResendDisabled(false) }
  }

  async function onResendClick(e: Event) {
    e.preventDefault()
    if (!R || coolingDown || busy) return
    busy = true
    setResendDisabled(true)
    R.el.textContent = busyLabel
    try {
      const res = await R.onResend()
      if (res === false) {
        R.el.textContent = idleLabel
        setResendDisabled(false)
        return
      }
      startResendCooldown()
    } catch {
      R.el.textContent = idleLabel
      setResendDisabled(false)
    } finally {
      busy = false
    }
  }
  if (R) R.el.addEventListener('click', onResendClick)

  return {
    value: () => input.value,
    clear: () => { input.value = ''; firedFor = '' },
    focus: () => input.focus(),
    setError,
    clearError,
    startResendCooldown,
    stopResendCooldown,
    destroy: () => {
      input.removeEventListener('input', onInput)
      input.removeEventListener('keydown', onKeydown)
      if (R) R.el.removeEventListener('click', onResendClick)
      if (resendTimer) clearInterval(resendTimer)
    },
  }
}
