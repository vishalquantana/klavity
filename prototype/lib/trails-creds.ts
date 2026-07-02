// ADR-0001: Trails store {{cred:<account>:email|password}} placeholders, never secrets. This module
// resolves a placeholder to its live value at RUN TIME only. Callers must never persist, log, or
// send the resolved value anywhere (evidence keeps the placeholder; screenshots dot passwords).
import { getTestAccountSecret } from "./test-accounts"

export const CRED_RE = /\{\{cred:([a-z0-9_-]{1,40}):(email|password)\}\}/g

export function hasCredRef(v: string): boolean {
  CRED_RE.lastIndex = 0
  return CRED_RE.test(v)
}

export type CredResolver = (projectId: string, value: string) => Promise<string>

export const resolveCredRefs: CredResolver = async (projectId, value) => {
  CRED_RE.lastIndex = 0
  let out = value
  for (const m of value.matchAll(CRED_RE)) {
    const [whole, name, field] = m
    const sec = await getTestAccountSecret(projectId, name)
    if (!sec) throw new Error(`unknown test account: ${name}`)
    out = out.replaceAll(whole, field === "email" ? sec.loginEmail : sec.password)
  }
  return out
}
