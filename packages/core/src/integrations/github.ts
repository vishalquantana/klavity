import type { IntegrationConfig, SubmitResult } from '../types'

export async function submitReport(config: IntegrationConfig): Promise<SubmitResult> {
  const { settings, type, description, context, screenshots } = config
  const { token, repo } = settings.github
  const labels = type === 'bug' ? ['klav', 'klav-bug'] : ['klav', 'klav-feature']

  const screenshotsMd = screenshots.length
    ? `\n\n<details><summary>Screenshots (${screenshots.length})</summary>\n\n${screenshots.map((s, i) => `![screenshot-${i + 1}](${s})`).join('\n')}\n\n</details>`
    : ''

  const body = [
    description,
    '',
    `**Page:** ${context.pageUrl}`,
    `**Browser:** ${context.userAgent}`,
    `**Screen:** ${context.screenSize} | **Viewport:** ${context.viewportSize}`,
    screenshotsMd,
  ].join('\n')

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `[Klav] ${description.slice(0, 180)}`,
      body,
      labels,
    }),
  })

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json() as { number: number; html_url: string }
  return { issueKey: `#${data.number}`, issueUrl: data.html_url }
}
