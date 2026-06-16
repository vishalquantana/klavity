import type { IntegrationConfig, SubmitResult } from '../types'

export async function submitReport(config: IntegrationConfig): Promise<SubmitResult> {
  const { settings, description, context } = config
  const { token, workspace, projectId } = settings.plane
  // host = API base. Cloud serves its API on api.plane.so; self-hosted serves it on its own origin.
  const apiBase = (settings.plane.host || 'https://api.plane.so').replace(/\/+$/, '')
  // Web UI link: cloud lives on app.plane.so, self-hosted shares the API origin.
  const webBase = apiBase === 'https://api.plane.so' ? 'https://app.plane.so' : apiBase

  const res = await fetch(
    `${apiBase}/api/v1/workspaces/${workspace}/projects/${projectId}/issues/`,
    {
      method: 'POST',
      headers: { 'X-API-Key': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `[Klavity] ${description.slice(0, 180)}`,
        description_html: `<p>${description}</p><p><strong>Page:</strong> ${context.pageUrl}</p>`,
      }),
    },
  )

  if (!res.ok) throw new Error(`Plane API error ${res.status}: ${await res.text()}`)

  const data = await res.json() as { sequence_id: number }
  return {
    issueKey: String(data.sequence_id),
    issueUrl: `${webBase}/${workspace}/projects/${projectId}/issues/`,
  }
}
