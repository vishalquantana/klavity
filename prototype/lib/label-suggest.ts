// KLA-175: Lightweight AI label suggestion at bug capture time.
// Fetches project labels, asks a cheap LLM to pick 1–3, stores the result for ghost-chip display.
import { listLabels, setSuggestedLabels, recordAiCall, updateFeedbackTitle } from "./db"
import { clientInfoLines } from "./feedback"

const SUGGEST_MODEL = process.env.KLAV_LABEL_SUGGEST_MODEL || "openai/gpt-4o-mini"
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

// JTBD 1.10: deterministic fallback title for a screenshot-only report (no typed prose). Used as the
// row's observation at intake so triage always shows something sensible, and again if the AI refinement
// (below) is unavailable or fails. Derived from report type + page path so it's meaningful offline.
export function fallbackDraftTitle(opts: { reportType?: "bug" | "feature"; pageUrl?: string | null }): string {
  const { reportType, pageUrl } = opts
  let where = ""
  if (pageUrl) {
    try { where = new URL(pageUrl).pathname } catch { where = String(pageUrl).split(/[?#]/)[0] || "" }
    if (where === "/" || !where) where = ""
  }
  const noun = reportType === "feature" ? "Feature request" : "Screenshot report"
  return (where ? `${noun} on ${where}` : noun).slice(0, 200)
}

const _MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
// UTC (not server-local time) so the stamp means the same thing regardless of where the server runs.
function formatCapturedAt(ms: number): string {
  const d = new Date(ms)
  const day = String(d.getUTCDate()).padStart(2, "0")
  const month = _MONTHS[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  let h = d.getUTCHours()
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12; if (h === 0) h = 12
  const hh = String(h).padStart(2, "0")
  const mm = String(d.getUTCMinutes()).padStart(2, "0")
  return `${day} ${month} ${year}, ${hh}:${mm} ${ampm} UTC`
}

// KD-162: a screenshot-only report (no typed description) previously fell back to whatever raw text the
// widget happened to send (often a bare page URL with an opaque id in it, or nothing at all — see
// fallbackDraftTitle's history above). This composes an actually useful description from context that's
// ALREADY captured with every report: the page, when it was captured, and the reporter's browser/OS/
// viewport (reused from clientInfoLines — the same formatter already used for the export/share payload).
export function fallbackDraftDescription(opts: {
  reportType?: "bug" | "feature"
  pageUrl?: string | null
  createdAt: number
  clientInfo?: unknown
}): string {
  const lines = [fallbackDraftTitle({ reportType: opts.reportType, pageUrl: opts.pageUrl })]
  lines.push(`Captured: ${formatCapturedAt(opts.createdAt)}`)
  lines.push(...clientInfoLines(opts.clientInfo))
  return lines.join("\n").slice(0, 1000)
}

// JTBD 1.10: post-intake title drafting for a screenshot-only report. The row was inserted with a
// deterministic fallback observation; here we ask a cheap LLM to draft a concise, human-readable title
// from whatever text context we DO have (page URL + captured console/network summary + report type) and
// overwrite the observation in place. Fire-and-forget from the intake path — never blocks the response,
// and a missing API key / failure simply leaves the fallback title untouched.
export async function draftTitleForFeedback(opts: {
  feedbackId: string
  projectId: string
  reportType?: "bug" | "feature"
  pageUrl?: string | null
  clientContext?: any
}): Promise<void> {
  const { feedbackId, projectId, reportType, pageUrl, clientContext } = opts
  const apiKey = process.env.KLAV_OPENROUTER_KEY
  if (!apiKey) return // fallback title already persisted at intake

  // Build a compact text summary of the evidence we have (the screenshot pixels aren't sent to this
  // cheap text model; the captured dev-tools context is the strongest textual signal we can offer).
  const bits: string[] = []
  if (pageUrl) bits.push(`Page: ${String(pageUrl).slice(0, 300)}`)
  const errs = Array.isArray(clientContext?.consoleErrors)
    ? clientContext.consoleErrors.filter((e: any) => e?.level === "error").slice(0, 3).map((e: any) => String(e?.message || "").slice(0, 200))
    : []
  if (errs.length) bits.push(`Console errors:\n${errs.join("\n")}`)
  const netFails = Array.isArray(clientContext?.networkFailures)
    ? clientContext.networkFailures.filter((n: any) => Number(n?.status) >= 400).slice(0, 3).map((n: any) => `${n?.method || "GET"} ${String(n?.url || "").slice(0, 160)} → ${n?.status}`)
    : []
  if (netFails.length) bits.push(`Failed requests:\n${netFails.join("\n")}`)
  const evidence = bits.join("\n\n").slice(0, 1500)

  const kind = reportType === "feature" ? "feature request" : "bug report"
  const system = `You title ${kind}s. Given the captured page context for a screenshot-only report, write ONE short, specific title (max 12 words, no trailing period). Respond ONLY with a JSON object like {"title":"..."}. If there is nothing to go on, return {"title":""}.`
  const user = evidence || `A ${kind} was filed via screenshot with no page context.`

  let inputTokens: number | null = null
  let outputTokens: number | null = null
  let costUsd: number | null = null
  let ok = true

  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://klavity.in",
      },
      body: JSON.stringify({
        model: SUGGEST_MODEL,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        response_format: { type: "json_object" },
        max_tokens: 40,
      }),
    })
    if (!resp.ok) {
      console.warn(`[title-draft] OpenRouter ${resp.status}: ${(await resp.text().catch(() => "?")).slice(0, 200)}`)
      ok = false
    } else {
      const data: any = await resp.json()
      inputTokens = data.usage?.prompt_tokens ?? null
      outputTokens = data.usage?.completion_tokens ?? null
      if (inputTokens != null && outputTokens != null) {
        costUsd = inputTokens * 0.00000015 + outputTokens * 0.0000006
      }
      let title = ""
      try {
        const raw = JSON.parse(data.choices?.[0]?.message?.content || "{}")
        if (typeof raw.title === "string") title = raw.title.trim().replace(/[.\s]+$/, "").slice(0, 200)
      } catch { /* ignore parse errors — keep fallback */ }
      // KD-162: this used to overwrite `observation` (the ticket's DESCRIPTION) with the drafted title —
      // which clobbered fallbackDraftDescription's page/capture-time/browser context the moment OpenRouter
      // succeeded, undoing the whole point of that richer fallback. Stamp the dedicated `title` column
      // instead (guarded empty-only, matching generateAndSaveTitle's KLA-554 pattern below), and leave the
      // description alone.
      if (title) await updateFeedbackTitle(feedbackId, projectId, title)
    }
  } catch (e: any) {
    console.warn("[title-draft] failed (non-fatal):", e?.message || e)
    ok = false
  }

  await recordAiCall({
    type: "title-draft",
    model: SUGGEST_MODEL,
    projectId,
    feature: "title-draft",
    inputTokens,
    outputTokens,
    costUsd,
    ok,
  }).catch(() => null)
}

export async function suggestLabelsForFeedback(opts: {
  feedbackId: string
  projectId: string
  text: string
}): Promise<void> {
  const { feedbackId, projectId, text } = opts
  const apiKey = process.env.KLAV_OPENROUTER_KEY
  if (!apiKey) return

  const labels = await listLabels(projectId)
  if (!labels.length) return

  const labelList = labels.map(l => l.name).join(", ")
  const snippet = text.slice(0, 1500)

  const system = `You are a ticket labeling assistant. Given a bug report and a list of project labels, select 1–3 labels that best categorize the issue. Respond ONLY with a JSON object like: {"labels": ["label-name"]}. Use only exact names from the provided list. If no label fits, return {"labels": []}.`
  const user = `Bug report:\n${snippet}\n\nAvailable labels: ${labelList}`

  let inputTokens: number | null = null
  let outputTokens: number | null = null
  let costUsd: number | null = null
  let ok = true

  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://klavity.in",
      },
      body: JSON.stringify({
        model: SUGGEST_MODEL,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        response_format: { type: "json_object" },
        max_tokens: 80,
      }),
    })

    if (!resp.ok) {
      console.warn(`[label-suggest] OpenRouter ${resp.status}: ${(await resp.text().catch(() => "?")).slice(0, 200)}`)
      ok = false
    } else {
      const data: any = await resp.json()
      inputTokens = data.usage?.prompt_tokens ?? null
      outputTokens = data.usage?.completion_tokens ?? null
      // gpt-4o-mini pricing ~$0.15/1M input, $0.60/1M output
      if (inputTokens != null && outputTokens != null) {
        costUsd = inputTokens * 0.00000015 + outputTokens * 0.0000006
      }

      let suggested: string[] = []
      try {
        const raw = JSON.parse(data.choices?.[0]?.message?.content || "{}")
        if (Array.isArray(raw.labels)) suggested = raw.labels.filter((n: any) => typeof n === "string")
      } catch { /* ignore parse errors */ }

      // Map names → IDs (case-insensitive, skip unknown)
      const nameToId = new Map(labels.map(l => [l.name.toLowerCase(), l.id]))
      const labelIds = suggested
        .map(n => nameToId.get(n.toLowerCase()))
        .filter((id): id is string => !!id)
        .slice(0, 3)

      await setSuggestedLabels(feedbackId, labelIds)
    }
  } catch (e: any) {
    console.warn("[label-suggest] failed (non-fatal):", e?.message || e)
    ok = false
  }

  await recordAiCall({
    type: "label-suggest",
    model: SUGGEST_MODEL,
    projectId,
    feature: "label-suggest",
    inputTokens,
    outputTokens,
    costUsd,
    ok,
  }).catch(() => null)
}
