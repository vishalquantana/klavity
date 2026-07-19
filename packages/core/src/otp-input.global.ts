/**
 * Browser-global entry for the unified OTP input helper — used ONLY to build the
 * standalone `otp-input.js` IIFE for classic <script> consumers (the static web
 * pages login.html + widget-connect.html).
 *
 * Keeping the `window` side effect here (not in otp-input.ts) keeps the importable
 * module pure and tree-shakeable, so it never leaks into the SDK/extension bundles.
 *
 *   bun build packages/core/src/otp-input.global.ts --format=iife --minify \
 *     --outfile prototype/public/otp-input.js
 */
import { mountOtpInput } from './otp-input'

declare const window: any
if (typeof window !== 'undefined') {
  window.KlavityOTP = { mount: mountOtpInput }
}
