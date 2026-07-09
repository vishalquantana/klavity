// KLA-175: Lightweight AI label suggestion at bug capture time.
// Fetches project labels, asks a cheap LLM to pick 1–3, stores the result for ghost-chip display.
import { listLabels, setSuggestedLabels, recordAiCall } from "./db"

const SUGGEST_MODEL = process.env.KLAV_LABEL_SUGGEST_MODEL || "openai/gpt-4o-mini"
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

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
