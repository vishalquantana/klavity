// ADR-0001: Trails store {{cred:<account>:email|password|otp}} placeholders, never secrets. This
// module resolves a placeholder to its live value at RUN TIME only. Callers must never persist,
// log, or send the resolved value anywhere (evidence keeps the placeholder; screenshots dot passwords).
// :otp resolves to the fixed test-OTP code (666666) when KLAV_TEST_OTP is set — always used for
// test account logins so AutoSim never triggers a real OTP email or hits the rate limit.
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
    if (field === "otp") {
      // :otp only works when the test-OTP bypass is active on the server; fail loud otherwise so
      // a misconfigured prod run surfaces the problem immediately rather than hanging on OTP input.
      if (!process.env.KLAV_TEST_OTP) throw new Error(`{{cred:${name}:otp}} requires KLAV_TEST_OTP to be set`)
      out = out.replaceAll(whole, TEST_OTP_CODE)
      continue
    }
    const sec = await getTestAccountSecret(projectId, name)
    if (!sec) throw new Error(`unknown test account: ${name}`)
    out = out.replaceAll(whole, field === "email" ? sec.loginEmail : sec.password)
  }
  return out
}
