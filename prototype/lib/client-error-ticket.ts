// BugHerd sub-project A, task 2: fingerprint a client-side error and
// create-or-bump a deduped fb_ feedback ticket, masking PII before persist.
import { sha256hex } from "./crypto"
import { maskPii, maskDeep } from "./data-masking"
import { insertFeedback, bumpFeedbackRecurrence, findFeedbackBySignature } from "./db"

export type ClientError = {
  kind: "error" | "unhandledrejection" | "console.error" | "network"
  message: string
  stack?: string
  pageUrl: string
  selector?: string
  status?: number
}

const norm = (s?: string) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim().replace(/\d+/g, "#")

const topFrame = (stack?: string) =>
  String(stack || "").split("\n").map(s => s.trim()).find(Boolean) || ""

export function clientErrorSignature(projectId: string, e: ClientError): string {
  const pathname = (() => {
    try { return new URL(e.pageUrl, "http://x").pathname } catch { return "" }
  })()
  return sha256hex([
    projectId,
    e.kind === "network" ? "network" : "js",
    norm(e.message),
    norm(pathname),
    norm(topFrame(e.stack)),
    e.selector || "",
  ].join("\n")).slice(0, 32)
}

export function severityFor(e: ClientError): "high" | "medium" | "low" {
  if (e.kind === "error" || e.kind === "unhandledrejection") return "high"
  if (e.kind === "network") return (e.status || 0) >= 500 || e.status === 0 ? "medium" : "low"
  return "low"
}

export async function recordClientError(
  projectId: string,
  e: ClientError,
  ctx: any,
  opts: { atMs?: number; overCap?: boolean } = {}
): Promise<{ id: string; created: boolean }> {
  const atMs = opts.atMs ?? Date.now()
  const signature = clientErrorSignature(projectId, e)

  const existing = await findFeedbackBySignature(projectId, signature)
  if (existing) {
    await bumpFeedbackRecurrence(existing.id, atMs)
    return { id: existing.id, created: false }
  }

  if (opts.overCap) {
    // Over the per-project cap and no existing ticket to bump onto — drop.
    // Caller is responsible for logging this decision.
    return { id: "", created: false }
  }

  const message = maskPii(String(e.message || "")).slice(0, 2000)
  const severity = severityFor(e)
  const priority = severity === "high" ? "high" : severity === "medium" ? "medium" : "low"

  const host = (() => { try { return new URL(e.pageUrl).host } catch { return null } })()
  const path = (() => { try { return new URL(e.pageUrl).pathname } catch { return null } })()

  const id = await insertFeedback({
    projectId,
    observation: `[auto] ${message}`,
    priority,
    source: "auto-error",
    signature,
    urlHost: host,
    urlPath: path,
    clientContext: maskDeep(ctx || {}),
  })

  return { id, created: true }
}
