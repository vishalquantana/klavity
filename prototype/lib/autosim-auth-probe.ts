import {
  finishAutosimAuthProbe,
  getAutosimAuthConfigEncrypted,
  getAutosimAuthProbe,
  markAutosimAuthProbeRunning,
  type AutosimAuthMethod,
} from "./db"
import { decryptSecret } from "./crypto"
import { safeFetch } from "./safe-fetch"
import { autoResumeNeedsAuthSessions, type AutoResumeNeedsAuthResult } from "./trails-author"

export type AutosimAuthProbeConfig = {
  projectId: string
  method: AutosimAuthMethod
  email: string
  secret: string
  notes: string | null
}

export type AutosimAuthProbeResult = {
  ok: boolean
  error?: string | null
}

export type RunAutosimAuthProbeResult = AutosimAuthProbeResult & {
  probeId: string
  projectId: string
  resumeSummary: AutoResumeNeedsAuthResult | null
}

export type AutosimAuthVerifier = (config: AutosimAuthProbeConfig) => Promise<AutosimAuthProbeResult>

export function redactedAutosimAuthConfig(config: AutosimAuthProbeConfig) {
  return {
    projectId: config.projectId,
    method: config.method,
    email: config.email,
    secret: "[REDACTED]",
    notes: config.notes,
  }
}

function redactSecret(message: unknown, secret?: string | null): string {
  let out = String((message as any)?.message || message || "auth probe failed")
  if (secret) out = out.split(secret).join("[REDACTED]")
  return out.slice(0, 1000)
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await safeFetch(url, { method: "GET", signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export const defaultAutosimAuthVerifier: AutosimAuthVerifier = async (config) => {
  const secret = config.secret.trim()
  if (!secret) return { ok: false, error: "auth secret is empty" }
  if (config.method === "fixed_otp") {
    if (secret.length < 4 || secret.length > 128) return { ok: false, error: "fixed OTP secret has an invalid length" }
    return { ok: true }
  }
  try {
    const res = await fetchWithTimeout(secret, 15_000)
    await res.body?.cancel().catch(() => {})
    if (res.status >= 200 && res.status < 400) return { ok: true }
    return { ok: false, error: `mint link returned HTTP ${res.status}` }
  } catch (e: any) {
    return { ok: false, error: redactSecret(e, secret) }
  }
}

export async function runAutosimAuthProbe(
  probeId: string,
  opts: {
    verifier?: AutosimAuthVerifier
    resume?: typeof autoResumeNeedsAuthSessions
  } = {},
): Promise<RunAutosimAuthProbeResult> {
  const started = await markAutosimAuthProbeRunning(probeId)
  const probe = started ?? await getAutosimAuthProbe(probeId)
  if (!probe) throw new Error("autosim auth probe not found")

  const encrypted = await getAutosimAuthConfigEncrypted(probe.projectId)
  if (!encrypted) {
    const error = "auth config missing"
    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: false, error })
    return { ok: false, error, probeId, projectId: probe.projectId, resumeSummary: null }
  }

  let secret = ""
  try {
    secret = await decryptSecret(encrypted.secretEnc)
    const config: AutosimAuthProbeConfig = {
      projectId: encrypted.projectId,
      method: encrypted.method,
      email: encrypted.email,
      secret,
      notes: encrypted.notes,
    }
    const verified = await (opts.verifier ?? defaultAutosimAuthVerifier)(config)
    if (!verified.ok) {
      const error = redactSecret(verified.error || "auth probe failed", secret)
      await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: false, error })
      return { ok: false, error, probeId, projectId: probe.projectId, resumeSummary: null }
    }

    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: true, resumeSummary: null })
    const resumeSummary = await (opts.resume ?? autoResumeNeedsAuthSessions)(probe.projectId)
    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: true, resumeSummary })
    return { ok: true, error: null, probeId, projectId: probe.projectId, resumeSummary }
  } catch (e: any) {
    const error = redactSecret(e, secret)
    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: false, error })
    return { ok: false, error, probeId, projectId: probe.projectId, resumeSummary: null }
  }
}
