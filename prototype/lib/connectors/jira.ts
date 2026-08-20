import type { Connector, TicketPayload, ExportResult, CommentSyncResult, FieldUpdate, FieldSyncResult, ConnectorMeta } from "./index"
import { resolveIssueType } from "./resolve-issue-type"
import { safeFetch } from "../safe-fetch"

// JTBD 5.7: map Klavity priority (urgent/high/medium/low) onto Jira's default priority scheme
// names (Highest/High/Medium/Low/Lowest). Jira's create/edit APIs set priority by name. Returns
// null when there's no priority or no mapping, so the caller omits the field entirely.
function jiraPriorityName(priority: string | null | undefined): string | null {
  switch (priority) {
    case "urgent": return "Highest"
    case "high": return "High"
    case "medium": return "Medium"
    case "low": return "Low"
    default: return null
  }
}

// Jira labels cannot contain whitespace — collapse spaces to underscores and drop anything empty.
function jiraLabels(labels: string[] | undefined): string[] {
  return (labels ?? []).map((l) => l.trim().replace(/\s+/g, "_")).filter(Boolean)
}

// Parse a short, sanitized reason out of a Jira error response body for server-side diagnostics.
// Jira 400s the create-issue call with a machine-readable body that names the exact offending
// field(s), e.g. {"errors":{"issuetype":"Specify a valid issue type"}} or
// {"errorMessages":["..."]}. The generic thrown message must stay "tracker request failed (HTTP
// 400)" so nothing upstream leaks to end users (oops() already replaces it with a generic string
// client-side) — but we surface the parsed reason in logs + on the thrown error's internal detail
// so an auto-filed 400 (KLAVITYKLA-408) is diagnosable instead of a bare status code. Mirrors the
// shape of lib/connector-test-error.ts#friendlyUpstream (hold/connector-test-noalert) so a future
// server route can reuse the same upstreamStatus/upstreamBody contract without more adapter edits.
function jiraErrorReason(body: string | undefined | null): string {
  if (!body) return "no additional details available"
  try {
    const parsed = JSON.parse(body)
    if (parsed && typeof parsed === "object") {
      // Jira create-issue validation errors: { errors: { issuetype: "Specify a valid issue type" } }
      if (parsed.errors && typeof parsed.errors === "object" && !Array.isArray(parsed.errors)) {
        const vals = Object.entries(parsed.errors).map(([k, v]) => `${k}: ${String(v)}`).filter(Boolean)
        if (vals.length) return vals.join("; ").slice(0, 200)
      }
      // Jira top-level errors: { errorMessages: ["..."] }
      if (Array.isArray(parsed.errorMessages) && parsed.errorMessages.length) {
        return parsed.errorMessages.map(String).join("; ").slice(0, 200)
      }
      // Generic { message: "..." } shape.
      if (typeof parsed.message === "string" && parsed.message) return parsed.message.slice(0, 200)
    }
  } catch {
    // not JSON — fall through to the raw (already truncated) body
  }
  return body.slice(0, 200)
}

// Build an Atlassian Document Format (ADF) doc wrapping plain text.
function toAdf(text: string): object {
  return {
    version: 1,
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  }
}

export const jiraConnector: Connector = {
  type: "jira",
  label: "Jira",
  fields: [
    { key: "host", label: "Jira Host", required: true, placeholder: "https://myorg.atlassian.net" },
    { key: "email", label: "Account Email", required: true, placeholder: "user@example.com" },
    { key: "token", label: "API Token", required: true, secret: true },
    { key: "project_key", label: "Project Key", required: true, placeholder: "PROJ" },
    { key: "issue_type", label: "Issue Type", placeholder: "Task" },
    // Two-way sync (G4): shared secret you embed in the Jira webhook URL (?token=…) or send
    // as the X-Klavity-Token header. Jira Cloud webhooks aren't HMAC-signed by default, so this
    // token is the auth. Verified on inbound only; never sent outbound. Optional — blank = outbound-only.
    { key: "inbound_secret", label: "Inbound Webhook Secret (optional, for two-way sync)", secret: true },
  ],

  validate(cfg) {
    for (const k of ["host", "email", "token", "project_key"] as const) {
      if (!cfg[k]) return { ok: false, error: `${k} is required` }
    }
    return { ok: true }
  },

  async createIssue(ticket: TicketPayload, cfg: Record<string, string>): Promise<ExportResult> {
    const { host, email, token, project_key } = cfg
    const issueType = resolveIssueType(cfg, (ticket as any).kind, "Task")
    const url = `${host.replace(/\/$/, "")}/rest/api/3/issue`

    const credentials = Buffer.from(`${email}:${token}`).toString("base64")

    // SSRF guard (H3): `host` is user-supplied. safeFetch validates the constructed URL and
    // every redirect hop (loopback / private / link-local / metadata blocked, https required,
    // no auto-redirect to an unchecked host) before credentials are ever sent.
    const res = await safeFetch(
      url,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          fields: {
            project: { key: project_key },
            issuetype: { name: issueType },
            summary: ticket.title,
            description: toAdf(ticket.body),
            // JTBD 2.16: Jira supports a native `labels` field (array of strings, no whitespace).
            // Omit the field entirely when there are no labels.
            ...(jiraLabels(ticket.labels).length ? { labels: jiraLabels(ticket.labels) } : {}),
            // JTBD 5.7: Jira has a native `priority` field, set by name. Only include it when we
            // have a mapping; sending an unknown priority name would fail the whole create.
            ...(jiraPriorityName(ticket.priority)
              ? { priority: { name: jiraPriorityName(ticket.priority) } }
              : {}),
          },
        }),
      },
      { allowLoopbackInTest: true },
    )

    if (!res.ok) {
      // Capture Jira's error body (it names the exact offending field, e.g. an invalid issuetype)
      // instead of discarding it, so a 400 during a connector test is diagnosable from logs + the
      // auto-filed ticket. The thrown message stays generic — no upstream text reaches the client.
      const text = (await res.text().catch(() => "")).slice(0, 500)
      const reason = jiraErrorReason(text)
      console.error(`jira create-issue upstream error ${res.status}: ${reason}`)
      const err = new Error(`tracker request failed (HTTP ${res.status})`)
      ;(err as any).upstreamStatus = res.status
      ;(err as any).upstreamBody = text
      ;(err as any).upstreamReason = reason
      throw err
    }

    const json = await res.json()
    const key: string = json.key

    // Native screenshot attachment (ENHANCEMENT — the ticket body already contains a permanent
    // fallback link to each screenshot, so this is best-effort and never affects the result).
    // Endpoint: POST {host}/rest/api/3/issue/{key}/attachments
    // NEEDS E2E VERIFICATION against a live Jira Cloud instance (multipart attachment API, X-Atlassian-Token).
    if (ticket.attachments?.length) {
      const attachUrl = `${host.replace(/\/$/, "")}/rest/api/3/issue/${key}/attachments`
      for (const att of ticket.attachments) {
        try {
          // Build a Web FormData so the multipart boundary is set automatically — do NOT set
          // Content-Type manually (the boundary would be missing/wrong).
          const form = new FormData()
          form.append("file", new Blob([att.bytes], { type: att.contentType }), att.filename)

          // SSRF guard (H3): host is user-supplied → validate with safeFetch before sending creds.
          const attRes = await safeFetch(
            attachUrl,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${credentials}`,
                // Required by Jira to accept multipart attachment uploads (XSRF bypass).
                "X-Atlassian-Token": "no-check",
              },
              body: form,
            },
            { allowLoopbackInTest: true },
          )
          if (!attRes.ok) {
            const text = (await attRes.text().catch(() => "")).slice(0, 200)
            console.warn(`jira attachment upload failed for ${att.filename} (HTTP ${attRes.status}): ${text}`)
          }
        } catch (err) {
          // Swallow: the issue already exists and its body has the permanent link. Never throw.
          console.warn(`jira attachment upload error for ${att.filename}:`, err)
        }
      }
    }

    return {
      externalKey: key,
      externalUrl: `${host.replace(/\/$/, "")}/browse/${key}`,
    }
  },

  // addComment: POST a comment on the Jira issue identified by externalIssueRef.
  //
  // externalIssueRef is the externalKey stored by createIssue: the Jira issue key, e.g. "PROJ-42".
  //
  // Jira Cloud comment API (REST API v3):
  //   POST {host}/rest/api/3/issue/{issueKey}/comment
  //   Headers: Authorization: Basic base64(email:token)
  //            Content-Type: application/json
  //            Accept: application/json
  //   Body:    { "body": <ADF doc> }
  //   Response: { "id": "10001", ... }
  async addComment(
    externalIssueRef: string,
    commentText: string,
    meta: { authorEmail?: string | null; klavityCommentId?: string },
    cfg: Record<string, string>,
  ): Promise<CommentSyncResult> {
    try {
      const { host, email, token } = cfg
      if (!host || !email || !token) {
        return { ok: false, error: "jira addComment: missing host/email/token in config" }
      }

      const url = `${host.replace(/\/$/, "")}/rest/api/3/issue/${externalIssueRef}/comment`
      const credentials = Buffer.from(`${email}:${token}`).toString("base64")

      // SSRF guard (H3): host is user-supplied → safeFetch validates before sending credentials.
      const res = await safeFetch(
        url,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ body: toAdf(commentText) }),
        },
        { allowLoopbackInTest: true },
      )

      if (!res.ok) {
        const text = (await res.text().catch(() => "")).slice(0, 200)
        return { ok: false, error: `jira comment POST HTTP ${res.status}: ${text}` }
      }

      const json = await res.json().catch(() => null)
      const externalCommentId = json?.id != null ? String(json.id) : null
      return { ok: true, externalCommentId }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  // updateIssue (JTBD 5.7): PUT the Jira issue's labels + priority to mirror the ticket's current
  // classification/priority. Both are native Jira fields. Jira's edit endpoint returns 204 with an
  // empty body on success. Best-effort — never throws.
  //   PUT {host}/rest/api/3/issue/{issueKey}
  //   Body: { "fields": { "labels": [...], "priority": { "name": "High" } } }
  async updateIssue(
    externalIssueRef: string,
    fields: FieldUpdate,
    cfg: Record<string, string>,
  ): Promise<FieldSyncResult> {
    try {
      const { host, email, token } = cfg
      if (!host || !email || !token) {
        return { ok: false, error: "jira updateIssue: missing host/email/token in config" }
      }

      const url = `${host.replace(/\/$/, "")}/rest/api/3/issue/${externalIssueRef}`
      const credentials = Buffer.from(`${email}:${token}`).toString("base64")

      const jFields: Record<string, unknown> = { labels: jiraLabels(fields.labels) }
      const priName = jiraPriorityName(fields.priority)
      if (priName) jFields.priority = { name: priName }

      // SSRF guard (H3): host is user-supplied → safeFetch validates before sending credentials.
      const res = await safeFetch(
        url,
        {
          method: "PUT",
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ fields: jFields }),
        },
        { allowLoopbackInTest: true },
      )

      if (!res.ok) {
        const text = (await res.text().catch(() => "")).slice(0, 200)
        return { ok: false, error: `jira issue PUT HTTP ${res.status}: ${text}` }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  // Connector-field-mapping: declares which optional metadata lookups this adapter implements.
  capabilities: { issueTypes: true, statuses: true },

  // Connector-field-mapping: list the Jira issue types available for the configured project, so
  // the mapping UI can offer them instead of free text. Excludes subtasks (not a valid top-level
  // create target). https://{host}/rest/api/3/issue/createmeta/{projectKey}/issuetypes
  async listIssueTypes(cfg: Record<string, string>): Promise<ConnectorMeta[]> {
    const host = cfg.host.replace(/\/$/, "")
    const credentials = Buffer.from(`${cfg.email}:${cfg.token}`).toString("base64")
    const res = await safeFetch(
      `${host}/rest/api/3/issue/createmeta/${encodeURIComponent(cfg.project_key)}/issuetypes`,
      { method: "GET", headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" } },
      { allowLoopbackInTest: true },
    )
    if (!res.ok) {
      const t = (await res.text().catch(() => "")).slice(0, 200)
      console.error(`jira issuetypes error ${res.status}: ${t}`)
      throw new Error(`tracker request failed (HTTP ${res.status})`)
    }
    const json = await res.json()
    const arr: any[] = Array.isArray(json) ? json : (json?.values ?? json?.issueTypes ?? [])
    return arr.filter((x: any) => !x.subtask).map((x: any) => ({ id: String(x.id ?? ""), name: String(x.name) }))
  },

  // Connector-field-mapping: list the Jira workflow statuses available across the configured
  // project's issue types, flattened + de-duplicated by name for the mapping UI.
  // https://{host}/rest/api/3/project/{projectKey}/statuses
  async listStatuses(cfg: Record<string, string>): Promise<ConnectorMeta[]> {
    const host = cfg.host.replace(/\/$/, "")
    const credentials = Buffer.from(`${cfg.email}:${cfg.token}`).toString("base64")
    const res = await safeFetch(
      `${host}/rest/api/3/project/${encodeURIComponent(cfg.project_key)}/statuses`,
      { method: "GET", headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" } },
      { allowLoopbackInTest: true },
    )
    if (!res.ok) {
      const t = (await res.text().catch(() => "")).slice(0, 200)
      console.error(`jira statuses error ${res.status}: ${t}`)
      throw new Error(`tracker request failed (HTTP ${res.status})`)
    }
    const json = await res.json()
    const seen = new Set<string>()
    const out: ConnectorMeta[] = []
    for (const group of (Array.isArray(json) ? json : [])) {
      for (const s of (group.statuses ?? [])) {
        if (!seen.has(s.name)) {
          seen.add(s.name)
          out.push({ id: String(s.id ?? ""), name: String(s.name), category: s.statusCategory?.key })
        }
      }
    }
    return out
  },
}
