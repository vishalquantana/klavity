import type { Connector, TicketPayload, ExportResult, CommentSyncResult, FieldUpdate, FieldSyncResult } from "./index"
import { safeFetch } from "../safe-fetch"

// JTBD 5.7: GitHub Issues has no native priority field, so we carry Klavity priority as a
// conventional `priority:<value>` label alongside the ticket's classification labels. GitHub only
// applies labels that already exist in the repo (unknown ones are silently ignored, never an error),
// so this is safe whether or not the repo defines priority labels. Returns the FULL desired label
// set (content labels + optional priority label) because GitHub replaces labels wholesale on update.
function githubLabels(labels: string[] | undefined, priority: string | null | undefined): string[] {
  const out = [...(labels ?? [])]
  if (priority) out.push(`priority:${priority}`)
  return out
}

export const githubConnector: Connector = {
  type: "github",
  label: "GitHub Issues",
  fields: [
    { key: "owner", label: "Repository Owner", required: true, placeholder: "my-org" },
    { key: "repo", label: "Repository Name", required: true, placeholder: "my-repo" },
    { key: "token", label: "Personal Access Token", required: true, secret: true },
    // Two-way sync (G4): the webhook secret you set on the GitHub repo's issue webhook.
    // Used ONLY to verify inbound X-Hub-Signature-256; never sent outbound. Optional —
    // leave blank to keep this connector outbound-only.
    { key: "inbound_secret", label: "Inbound Webhook Secret (optional, for two-way sync)", secret: true },
  ],

  validate(cfg) {
    for (const k of ["owner", "repo", "token"] as const) {
      if (!cfg[k]) return { ok: false, error: `${k} is required` }
    }
    return { ok: true }
  },

  async createIssue(ticket: TicketPayload, cfg: Record<string, string>): Promise<ExportResult> {
    const { owner, repo, token } = cfg
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`

    // Endpoint host is fixed (api.github.com), but owner/repo are user-supplied path
    // segments. safeFetch pins the request (and every redirect hop) to github.com so a
    // crafted owner/repo or a 3xx can't move the request host, and rejects private resolutions.
    const res = await safeFetch(
      url,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "User-Agent": "Klavity",
          "Content-Type": "application/json",
        },
        // JTBD 2.16 + 5.7: GitHub accepts labels natively as an array of strings, so we pass
        // Klavity's classification labels AND (since GitHub has no native priority field) the
        // priority carried as a `priority:<value>` label. Unknown labels are ignored (never an
        // error). Omit the field entirely when there are neither labels nor a priority.
        body: JSON.stringify({
          title: ticket.title,
          body: ticket.body,
          ...((): { labels?: string[] } => {
            const ls = githubLabels(ticket.labels, ticket.priority)
            return ls.length ? { labels: ls } : {}
          })(),
        }),
      },
      { allowHosts: ["github.com"] },
    )

    if (!res.ok) {
      const text = (await res.text().catch(() => "")).slice(0, 200)
      console.error(`github upstream error ${res.status}: ${text}`)
      throw new Error(`tracker request failed (HTTP ${res.status})`)
    }

    const json = await res.json()
    return {
      externalKey: `#${json.number}`,
      externalUrl: json.html_url,
    }
  },

  // addComment: POST a comment on the GitHub issue identified by externalIssueRef.
  //
  // externalIssueRef is the externalKey stored by createIssue: "#42" (issue number).
  //
  // GitHub comment API:
  //   POST https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments
  //   Headers: Authorization: Bearer {token}
  //            Accept: application/vnd.github+json
  //            User-Agent: Klavity
  //            Content-Type: application/json
  //   Body:    { "body": "comment text" }
  //   Response: { "id": 12345, ... }
  async addComment(
    externalIssueRef: string,
    commentText: string,
    meta: { authorEmail?: string | null; klavityCommentId?: string },
    cfg: Record<string, string>,
  ): Promise<CommentSyncResult> {
    try {
      const { owner, repo, token } = cfg
      if (!owner || !repo || !token) {
        return { ok: false, error: "github addComment: missing owner/repo/token in config" }
      }

      // externalIssueRef is "#42" — strip the leading "#" to get the issue number.
      const issueNumber = externalIssueRef.replace(/^#/, "")
      if (!issueNumber || !/^\d+$/.test(issueNumber)) {
        return { ok: false, error: `github addComment: invalid externalIssueRef "${externalIssueRef}"` }
      }

      const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`

      // Host is fixed (api.github.com). safeFetch pins to github.com and validates every redirect.
      const res = await safeFetch(
        url,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "Klavity",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: commentText }),
        },
        { allowHosts: ["github.com"] },
      )

      if (!res.ok) {
        const text = (await res.text().catch(() => "")).slice(0, 200)
        return { ok: false, error: `github comment POST HTTP ${res.status}: ${text}` }
      }

      const json = await res.json().catch(() => null)
      const externalCommentId = json?.id != null ? String(json.id) : null
      return { ok: true, externalCommentId }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  // updateIssue (JTBD 5.7): PATCH the GitHub issue's labels to mirror the ticket's current
  // classification + priority. GitHub replaces the label set wholesale, so we send the FULL desired
  // set (githubLabels merges content labels with the priority label). Best-effort — never throws.
  //   PATCH https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}
  //   Body: { "labels": [...] }
  async updateIssue(
    externalIssueRef: string,
    fields: FieldUpdate,
    cfg: Record<string, string>,
  ): Promise<FieldSyncResult> {
    try {
      const { owner, repo, token } = cfg
      if (!owner || !repo || !token) {
        return { ok: false, error: "github updateIssue: missing owner/repo/token in config" }
      }

      const issueNumber = externalIssueRef.replace(/^#/, "")
      if (!issueNumber || !/^\d+$/.test(issueNumber)) {
        return { ok: false, error: `github updateIssue: invalid externalIssueRef "${externalIssueRef}"` }
      }

      const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`
      const res = await safeFetch(
        url,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "Klavity",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ labels: githubLabels(fields.labels, fields.priority) }),
        },
        { allowHosts: ["github.com"] },
      )

      if (!res.ok) {
        const text = (await res.text().catch(() => "")).slice(0, 200)
        return { ok: false, error: `github issue PATCH HTTP ${res.status}: ${text}` }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  },
}
