// ADR-0001: Trails store {{cred:<account>:email|password|otp}} placeholders, never secrets. This module
// resolves a placeholder to its live value at RUN TIME only. Callers must never persist, log, or
// send the resolved value anywhere (evidence keeps the placeholder; screenshots dot passwords).
// KLA-103: added "otp" field for OTP/passwordless auth shapes (uses KLAV_TEST_OTP bypass).
import { getTestAccountSecret } from "./test-accounts"

export const CRED_RE = /\{\{cred:([a-z0-9_-]{1,40}):(email|password|otp)\}\}/g

export function hasCredRef(v: string): boolean {
  CRED_RE.lastIndex = 0
  return CRED_RE.test(v)
}

export const TEST_OTP_CODE = "666666"

export type CredResolver = (projectId: string, value: string) => Promise<string>

export const resolveCredRefs: CredResolver = async (projectId, value) => {
  CRED_RE.lastIndex = 0
  let out = value
  for (const m of value.matchAll(CRED_RE)) {
    const [whole, name, field] = m
    const sec = await getTestAccountSecret(projectId, name)
    if (!sec) throw new Error(`unknown test account: ${name}`)
    let resolved: string
    if (field === "email") {
      resolved = sec.loginEmail
    } else if (field === "password") {
      if (sec.authShape !== "password" || sec.password === undefined) {
        throw new Error(`test account "${name}" does not have a password (auth_shape: ${sec.authShape})`)
      }
      resolved = sec.password
    } else {
      // field === "otp": only works when the test-OTP bypass is active on the server; fail loud
      // otherwise so a misconfigured prod run surfaces the problem immediately. Always validate
      // authShape first so a password-shape account with an :otp ref fails loud (config mistake).
      if (!process.env.KLAV_TEST_OTP) throw new Error(`{{cred:${name}:otp}} requires KLAV_TEST_OTP to be set`)
      if (sec.authShape !== "otp") {
        throw new Error(`test account "${name}" does not have an OTP code (auth_shape: ${sec.authShape})`)
      }
      resolved = TEST_OTP_CODE
    }
    out = out.replaceAll(whole, resolved)
  }
  return out
}
