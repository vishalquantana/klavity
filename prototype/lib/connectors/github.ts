import type { Connector, TicketPayload, ExportResult, CommentSyncResult } from "./index"
import { safeFetch } from "../safe-fetch"

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
        body: JSON.stringify({ title: ticket.title, body: ticket.body }),
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
}
