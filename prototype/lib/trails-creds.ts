// ADR-0001: Trails store {{cred:<account>:email|password|otp}} placeholders, never secrets. This module
// resolves a placeholder to its live value at RUN TIME only. Callers must never persist, log, or
// send the resolved value anywhere (evidence keeps the placeholder; screenshots dot passwords).
// KLA-103: added "otp" field for OTP/passwordless auth shapes (uses KLAV_TEST_OTP bypass).
import { getTestAccountSecret } from "./test-accounts"
import { decryptSecret } from "./crypto"
import { getAutosimAuthConfigEncrypted } from "./db"
import { testOtpActiveForTestAccounts } from "./test-otp-gate"

export const CRED_RE = /\{\{cred:([a-z0-9_-]{1,40}):(email|password|otp|token)\}\}/g
export const AUTOSIM_AUTH_CRED_RE = /\{\{autosim_auth:(email|secret|otp|link)\}\}/g

export function hasCredRef(v: string): boolean {
  CRED_RE.lastIndex = 0
  AUTOSIM_AUTH_CRED_RE.lastIndex = 0
  return CRED_RE.test(v) || AUTOSIM_AUTH_CRED_RE.test(v)
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
    } else if (field === "password" || field === "token") {
      if ((sec.authShape !== "password" && sec.authShape !== "token") || sec.password === undefined) {
        throw new Error(`test account "${name}" does not have a password or token (auth_shape: ${sec.authShape})`)
      }
      resolved = sec.password
    } else {
      // field === "otp": only works when the test-OTP bypass is active on the server; fail loud
      // otherwise so a misconfigured prod run surfaces the problem immediately. Always validate
      // authShape first so a password-shape account with an :otp ref fails loud (config mistake).
      // KLAVITYKLA-304: env bootstrap OR an unexpired /opsadmin runtime gate.
      if (!(await testOtpActiveForTestAccounts())) throw new Error(`{{cred:${name}:otp}} requires KLAV_TEST_OTP to be set`)
      if (sec.authShape !== "otp") {
        throw new Error(`test account "${name}" does not have an OTP code (auth_shape: ${sec.authShape})`)
      }
      resolved = TEST_OTP_CODE
    }
    out = out.replaceAll(whole, resolved)
  }
  AUTOSIM_AUTH_CRED_RE.lastIndex = 0
  const autosimMatches = Array.from(value.matchAll(AUTOSIM_AUTH_CRED_RE))
  if (autosimMatches.length > 0) {
    const cfg = await getAutosimAuthConfigEncrypted(projectId)
    if (!cfg) throw new Error("autosim auth config is not registered")
    let decryptedSecret: string | null = null
    const secret = async () => {
      if (decryptedSecret === null) decryptedSecret = await decryptSecret(cfg.secretEnc)
      return decryptedSecret
    }
    for (const m of autosimMatches) {
      const [whole, field] = m
      let resolved: string
      if (field === "email") {
        resolved = cfg.email
      } else if (field === "otp") {
        if (cfg.method !== "fixed_otp") throw new Error("autosim auth config is not a fixed OTP method")
        resolved = await secret()
      } else if (field === "link") {
        if (cfg.method !== "mint_link") throw new Error("autosim auth config is not a mint-link method")
        resolved = await secret()
      } else {
        resolved = await secret()
      }
      out = out.replaceAll(whole, resolved)
    }
  }
  return out
}
