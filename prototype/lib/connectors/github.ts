import type { Connector, TicketPayload, ExportResult, CommentSyncResult, FieldUpdate, FieldSyncResult, ImportedIssue, ConnectorMeta } from "./index"
import { safeFetch } from "../safe-fetch"
import { resolveIssueType } from "./resolve-issue-type"
import { applyLabelMap } from "./mapping-failsafe"
import { inlineLogAttachmentIntoBody } from "./inline-log-fallback"

// Connector-field-mapping: overridable via KLAV_GITHUB_API so tests can point this at a loopback
// fake. Read lazily (a function, not a module-level const) because bun's test runner shares one
// module registry across test files in this directory — a top-level const would freeze on
// whichever value was live the FIRST time any test file imported "./github" (directly or via
// "./index", which imports githubConnector eagerly), before this file's own test sets
// KLAV_GITHUB_API and dynamically imports it (see the identical gotcha documented in linear.ts).
function githubApi(): string {
  return process.env.KLAV_GITHUB_API || "https://api.github.com"
}

// JTBD 5.10: GitHub has no native priority. Our outbound export encodes Klavity priority as a
// conventional `priority:<value>` label (see githubLabels). On IMPORT we read that convention back so
// an issue we previously exported (or one a team labelled by hand) keeps its priority; issues with no
// such label degrade to null (unset). Only the four Klavity values are recognised.
const KLAVITY_PRIORITIES = new Set(["urgent", "high", "medium", "low"])
function priorityFromGithubLabels(labels: any): string | null {
  if (!Array.isArray(labels)) return null
  for (const l of labels) {
    const name = typeof l === "string" ? l : String(l?.name ?? "")
    const m = /^priority:(.+)$/i.exec(name.trim())
    if (m && KLAVITY_PRIORITIES.has(m[1].toLowerCase())) return m[1].toLowerCase()
  }
  return null
}

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
  // Connector-field-mapping: GitHub Issues has no native issue-type field (labels only) and no
  // workflow beyond open/closed, so the bug/feature `kind` is applied as a LABEL via
  // resolveIssueType (see createIssue) rather than a native "issue type" field.
  capabilities: { issueTypes: false, statuses: true, typesAsLabels: true },
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

  // Klavity->Jira #414: GitHub Issues has NO native attachment API (files must be uploaded to a
  // repo/gist or the user-content CDN, which needs a separate authenticated flow), so attachFiles is
  // intentionally NOT implemented — the issue body keeps the permanent signed fallback links.
  // KLA-582: for the ONE attachment that has no body link (the console/network log text file, built
  // in-memory), createIssue inlines its redacted content into the body (see inlineLogAttachmentIntoBody).
  // transitionIssue is likewise N/A (GitHub issues have only open/closed, no configurable workflow
  // statuses). TODO(#414): revisit if GitHub Projects v2 column moves are ever wanted.
  async createIssue(ticket: TicketPayload, cfg: Record<string, string>): Promise<ExportResult> {
    const { owner, repo, token } = cfg
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`

    // KLA-582: GitHub Issues has no native attachment upload, so it can't ship the console/network
    // log text-file attachment. Fall back to inlining that (already-redacted) log text into the
    // issue body as a collapsed <details> section — otherwise the logs would go NOWHERE for
    // GitHub-connected projects (regression: they used to be inline in the body). Best-effort.
    const body = inlineLogAttachmentIntoBody(ticket.body, ticket.attachments).body

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
          body,
          ...((): { labels?: string[] } => {
            // KLA-551: apply the admin's PERMANENT label remap (label_map) before hitting GitHub.
            // GitHub silently ignores labels that don't exist (never an error, never auto-created via
            // this path), so an unresolved label can't drop the finding; label_map lets an admin
            // permanently point a Klavity label name at a real repo label.
            const ls = githubLabels(applyLabelMap(cfg, ticket.labels), ticket.priority)
            // Connector-field-mapping: GitHub has no native issue-type field, so the bug/feature
            // kind is applied natively as an additional label (best-effort — GitHub silently
            // ignores labels that don't exist in the repo, never an error).
            const kindLabel = resolveIssueType(cfg, ticket.kind, "")
            if (kindLabel) ls.push(kindLabel)
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

  // listIssues (JTBD 5.10): fetch recent repo issues to import as Klavity tickets.
  //   GET https://api.github.com/repos/{owner}/{repo}/issues?state=all&sort=created&direction=desc&per_page=N
  // GitHub's issues endpoint also returns PULL REQUESTS (they carry a `pull_request` key) — we skip
  // those so imports stay issues-only. externalKey is `#${number}` to match createIssue exactly, so
  // re-import dedupes against ticket_exports. Priority is recovered from a `priority:<x>` label.
  async listIssues(cfg: Record<string, string>, opts?: { limit?: number }): Promise<ImportedIssue[]> {
    const { owner, repo, token } = cfg
    if (!owner || !repo || !token) throw new Error("github listIssues: missing owner/repo/token in config")

    // Clamp to GitHub's page maximum (100); default a sensible recent window.
    const limit = Math.max(1, Math.min(100, opts?.limit ?? 50))
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&sort=created&direction=desc&per_page=${limit}`

    // Host is fixed (api.github.com); owner/repo are user path segments. safeFetch pins to github.com
    // and re-validates every redirect hop so a crafted owner/repo can't move the request host.
    const res = await safeFetch(
      url,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "User-Agent": "Klavity",
        },
      },
      { allowHosts: ["github.com"] },
    )

    if (!res.ok) {
      const text = (await res.text().catch(() => "")).slice(0, 200)
      console.error(`github listIssues error ${res.status}: ${text}`)
      throw new Error(`tracker request failed (HTTP ${res.status})`)
    }

    const json = await res.json()
    const rows: any[] = Array.isArray(json) ? json : []
    const out: ImportedIssue[] = []
    for (const r of rows) {
      if (r?.pull_request) continue // skip PRs — GitHub lists them alongside issues
      if (r?.number == null) continue
      const createdAt = r?.created_at ? Date.parse(String(r.created_at)) : NaN
      out.push({
        externalKey: `#${r.number}`,
        externalUrl: r?.html_url != null ? String(r.html_url) : null,
        title: String(r?.title ?? `Issue #${r.number}`),
        body: r?.body != null ? String(r.body) : "",
        priority: priorityFromGithubLabels(r?.labels),
        status: r?.state != null ? String(r.state) : null, // "open" | "closed"
        createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
      })
    }
    return out
  },

  // listStatuses (Connector-field-mapping): GitHub issues have no workflow beyond open/closed —
  // return the fixed pair rather than hitting the network.
  async listStatuses(_cfg: Record<string, string>): Promise<ConnectorMeta[]> {
    return [{ name: "open" }, { name: "closed" }]
  },

  // listIssueTypes (Connector-field-mapping): GitHub has no native issue-type field, so we surface
  // the repo's labels — the mapping UI lets a user pick which label represents "bug"/"feature".
  //   GET https://api.github.com/repos/{owner}/{repo}/labels?per_page=100
  async listIssueTypes(cfg: Record<string, string>): Promise<ConnectorMeta[]> {
    const res = await safeFetch(
      `${githubApi()}/repos/${cfg.owner}/${cfg.repo}/labels?per_page=100`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${cfg.token}`,
          "Accept": "application/vnd.github+json",
          "User-Agent": "Klavity",
        },
      },
      { allowHosts: ["github.com"], allowLoopbackInTest: true },
    )
    if (!res.ok) {
      const text = (await res.text().catch(() => "")).slice(0, 200)
      console.error(`github labels error ${res.status}: ${text}`)
      throw new Error(`tracker request failed (HTTP ${res.status})`)
    }
    const json = await res.json()
    const rows: any[] = Array.isArray(json) ? json : []
    return rows.map(l => ({ id: String(l.id), name: String(l.name) }))
  },
}
