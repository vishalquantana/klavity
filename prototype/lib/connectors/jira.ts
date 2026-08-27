import type { Connector, TicketPayload, TicketAttachment, ExportResult, CommentSyncResult, FieldUpdate, FieldSyncResult, AttachFilesResult, TransitionResult, ConnectorMeta } from "./index"
import { resolveIssueType } from "./resolve-issue-type"
import { safeFetch } from "../safe-fetch"
import { selectAttachmentsWithinCaps } from "./attach-caps"
import { UpstreamTrackerError } from "./errors"
import { applyStateMap, applyLabelMap, type UnresolvedMapping } from "./mapping-failsafe"

// Klavity->Jira #414: base64 Basic-auth credential for the Jira REST API from the connector config.
function jiraCreds(cfg: Record<string, string>): string {
  return Buffer.from(`${cfg.email}:${cfg.token}`).toString("base64")
}

// CREDENTIAL-SAFETY (Codex #1): options every AUTHENTICATED Jira request passes to safeFetch. Besides
// the SSRF/loopback-test posture, `sameOriginRedirectsOnly` forbids following a 3xx off the configured
// Jira host — so the Basic-auth token (email:token) can NEVER be replayed to a redirect target like
// https://attacker/collect. The token is only ever sent to the validated, configured host.
const JIRA_FETCH_OPTS = { allowLoopbackInTest: true, sameOriginRedirectsOnly: true } as const

// Codex #9 (LOW): redact anything that looks like a credential before it reaches a log line or a
// returned error string. Jira's own error/response bodies should not contain our Authorization
// header, but a misconfigured proxy/host could echo request headers — so we strip Basic/Bearer
// tokens and any Authorization: value defensively. Keeps logs diagnosable without leaking secrets.
function redactSecrets(s: string): string {
  if (!s) return s
  return s
    .replace(/\bBasic\s+[A-Za-z0-9+/=_-]+/gi, "Basic [redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/\bAuthorization\b\s*[:=]\s*["']?[^"'\s,}]+/gi, "Authorization: [redacted]")
}

// Klavity->Jira #414: upload one batch of files to an already-created Jira issue. Shared by
// createIssue and the public attachFiles capability. Enforces the size caps up front, uploads each
// accepted file via multipart with the required X-Atlassian-Token header, and NEVER throws — a
// failed/oversize file is collected into the returned warning and the issue keeps its body link.
//   POST {host}/rest/api/3/issue/{key}/attachments  (multipart/form-data, X-Atlassian-Token: no-check)
async function jiraAttachFiles(
  host: string,
  credentials: string,
  issueKey: string,
  attachments: TicketAttachment[],
): Promise<AttachFilesResult> {
  const { accepted, skipped } = selectAttachmentsWithinCaps(attachments)
  // Skipped-by-cap files are a form of degradation the user should be able to see.
  const failures: string[] = skipped.map((s) => `${s.att.filename}: ${s.reason}`)
  const attachUrl = `${host.replace(/\/$/, "")}/rest/api/3/issue/${issueKey}/attachments`
  let attached = 0
  for (const att of accepted) {
    try {
      // Build a Web FormData so the multipart boundary is set automatically — do NOT set
      // Content-Type manually (the boundary would be missing/wrong).
      const form = new FormData()
      form.append("file", new Blob([att.bytes as BlobPart], { type: att.contentType }), att.filename)

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
        JIRA_FETCH_OPTS,
      )
      if (!attRes.ok) {
        const text = redactSecrets((await attRes.text().catch(() => "")).slice(0, 200))
        console.warn(`jira attachment upload failed for ${att.filename} (HTTP ${attRes.status}): ${text}`)
        failures.push(`${att.filename}: HTTP ${attRes.status}`)
      } else {
        attached++
      }
    } catch (err) {
      // Swallow: the issue already exists and its body has the permanent link. Never throw.
      const reason = redactSecrets(err instanceof Error ? err.message : String(err))
      console.warn(`jira attachment upload error for ${att.filename}: ${reason}`)
      failures.push(`${att.filename}: ${reason}`)
    }
  }
  const failed = accepted.length - attached
  return {
    attached,
    failed,
    skipped: skipped.length,
    warning: failures.length
      ? `attachment upload issues (${failures.length}/${attachments.length}) — link included in body: ${failures.join("; ").slice(0, 300)}`
      : null,
  }
}

// Klavity->Jira #414 (#433 mechanism): transition a freshly created Jira issue to `targetStatus`.
// Resolves the status name to a transition id via GET .../transitions, then POSTs it. Best-effort:
// returns a structured result and NEVER throws — a missing/failed transition leaves the issue in its
// created state and must not fail the export.
//   GET  {host}/rest/api/3/issue/{key}/transitions  -> { transitions: [{ id, name, to: { name } }] }
//   POST {host}/rest/api/3/issue/{key}/transitions  <- { transition: { id } }  (204 on success)
async function jiraTransitionIssue(
  host: string,
  credentials: string,
  issueKey: string,
  targetStatus: string,
): Promise<TransitionResult> {
  const want = String(targetStatus || "").trim()
  if (!want) return { ok: true, applied: false } // unset → no-op
  const url = `${host.replace(/\/$/, "")}/rest/api/3/issue/${issueKey}/transitions`
  try {
    const listRes = await safeFetch(
      url,
      { method: "GET", headers: { "Authorization": `Basic ${credentials}`, "Accept": "application/json" } },
      JIRA_FETCH_OPTS,
    )
    if (!listRes.ok) {
      const text = redactSecrets((await listRes.text().catch(() => "")).slice(0, 200))
      return { ok: false, applied: false, error: `jira transitions GET HTTP ${listRes.status}: ${text}` }
    }
    const json = await listRes.json().catch(() => null)
    const transitions: any[] = Array.isArray(json?.transitions) ? json.transitions : []
    const wantLc = want.toLowerCase()
    // Match on the transition name OR the destination status name (either is what an admin would type).
    const match = transitions.find(
      (t) => String(t?.name ?? "").toLowerCase() === wantLc || String(t?.to?.name ?? "").toLowerCase() === wantLc,
    )
    if (!match?.id) {
      // KLA-551: the status NAME does not exist in this issue's workflow. Not a transport failure —
      // flag it `unresolved` so createIssue can queue it for a permanent human mapping. The issue is
      // left in its default created state (never dropped, never fails the export).
      return { ok: false, applied: false, unresolved: true, error: `no transition to status "${want}" available on ${issueKey}` }
    }
    const transitionId = String(match.id)
    const postRes = await safeFetch(
      url,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ transition: { id: transitionId } }),
      },
      JIRA_FETCH_OPTS,
    )
    if (!postRes.ok) {
      const text = redactSecrets((await postRes.text().catch(() => "")).slice(0, 200))
      return { ok: false, applied: false, transitionId, error: `jira transition POST HTTP ${postRes.status}: ${text}` }
    }
    return { ok: true, applied: true, transitionId }
  } catch (e) {
    return { ok: false, applied: false, error: redactSecrets(e instanceof Error ? e.message : String(e)) }
  }
}

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
    // Klavity->Jira #414 (#433 mechanism): optional default status to transition a newly created issue
    // to (e.g. "In Progress", "Selected for Development"). Blank = leave in the workflow's initial
    // status. The specific value is per-project admin config (PX4 configures theirs later via #432).
    { key: "default_status", label: "Default status on create (optional)", placeholder: "In Progress" },
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
    // KLA-551: apply the admin's PERMANENT label remap (label_map) before hitting Jira. Jira labels are
    // free text, so an unresolved label never fails the create; label_map just lets an admin normalise
    // a name (e.g. "UX bug" → "ux") for good once they've fixed the mapping.
    const mappedLabels = jiraLabels(applyLabelMap(cfg, ticket.labels))
    const unresolvedMappings: UnresolvedMapping[] = []

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
            ...(mappedLabels.length ? { labels: mappedLabels } : {}),
            // JTBD 5.7: Jira has a native `priority` field, set by name. Only include it when we
            // have a mapping; sending an unknown priority name would fail the whole create.
            ...(jiraPriorityName(ticket.priority)
              ? { priority: { name: jiraPriorityName(ticket.priority) } }
              : {}),
          },
        }),
      },
      JIRA_FETCH_OPTS,
    )

    if (!res.ok) {
      // Capture Jira's error body (it names the exact offending field, e.g. an invalid issuetype)
      // instead of discarding it, so a 400 during a connector test is diagnosable from logs + the
      // auto-filed ticket. The thrown message stays generic — no upstream text reaches the client.
      const text = (await res.text().catch(() => "")).slice(0, 500)
      const reason = redactSecrets(jiraErrorReason(text))
      console.error(`jira create-issue upstream error ${res.status}: ${reason}`)
      // KLA-724: typed 4xx/5xx classification. Keeps the historical message + upstream* diagnosis props.
      const err = new UpstreamTrackerError(res.status, redactSecrets(text))
      ;(err as any).upstreamStatus = res.status
      ;(err as any).upstreamBody = redactSecrets(text)
      ;(err as any).upstreamReason = reason
      throw err
    }

    const json = await res.json()
    const key: string = json.key

    // Klavity->Jira #414: native file attachment (ENHANCEMENT — the ticket body already contains a
    // permanent fallback link, so this is best-effort and never affects the created issue). Uploads
    // BOTH report screenshots and the non-image files the reporter attached (PDF/.log/.har/etc.),
    // which arrive on ticket.attachments already resolved to bytes by feedbackToTicketPayload.
    // Size-capped + failures collected into attachmentWarning (surfaced on the export timeline).
    let attachmentWarning: string | null = null
    if (ticket.attachments?.length && key) {
      const r = await jiraAttachFiles(host, credentials, key, ticket.attachments)
      attachmentWarning = r.warning ?? null
    }

    // Klavity->Jira #414 (#433 mechanism): if a default status is configured, transition the new
    // issue to it. Best-effort — a missing/failed transition never fails the export.
    // KLA-551: apply the admin's PERMANENT state remap first; if the (mapped) status name has no
    // matching transition, record it as an unresolved STATE mapping so it can be fixed permanently —
    // the issue stays in its default created state (never dropped).
    if (cfg.default_status && key) {
      const wantStatus = applyStateMap(cfg, cfg.default_status)
      const t = await jiraTransitionIssue(host, credentials, key, wantStatus)
      if (!t.applied && t.error) console.warn(`jira default-status transition skipped for ${key}: ${t.error}`)
      if (t.unresolved) unresolvedMappings.push({ field: "state", requested_name: cfg.default_status })
    }

    return {
      externalKey: key,
      externalUrl: `${host.replace(/\/$/, "")}/browse/${key}`,
      attachmentWarning,
      unresolvedMappings: unresolvedMappings.length ? unresolvedMappings : undefined,
    }
  },

  // Klavity->Jira #414: public attachFiles capability — upload files to an already-created issue.
  // Delegates to the same helper createIssue uses (size caps + X-Atlassian-Token multipart, best-effort).
  async attachFiles(
    externalIssueRef: string,
    attachments: TicketAttachment[],
    cfg: Record<string, string>,
  ): Promise<AttachFilesResult> {
    if (!attachments?.length) return { attached: 0, failed: 0, skipped: 0, warning: null }
    return jiraAttachFiles(cfg.host, jiraCreds(cfg), externalIssueRef, attachments)
  },

  // Klavity->Jira #414 (#433 mechanism): public transitionIssue capability — resolve the target
  // status name to a transition id and apply it. Best-effort; no-op when targetStatus is blank.
  async transitionIssue(
    externalIssueRef: string,
    targetStatus: string,
    cfg: Record<string, string>,
  ): Promise<TransitionResult> {
    return jiraTransitionIssue(cfg.host, jiraCreds(cfg), externalIssueRef, targetStatus)
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
        JIRA_FETCH_OPTS,
      )

      if (!res.ok) {
        const text = redactSecrets((await res.text().catch(() => "")).slice(0, 200))
        return { ok: false, error: `jira comment POST HTTP ${res.status}: ${text}` }
      }

      const json = await res.json().catch(() => null)
      const externalCommentId = json?.id != null ? String(json.id) : null
      return { ok: true, externalCommentId }
    } catch (e) {
      return { ok: false, error: redactSecrets(e instanceof Error ? e.message : String(e)) }
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
        JIRA_FETCH_OPTS,
      )

      if (!res.ok) {
        const text = redactSecrets((await res.text().catch(() => "")).slice(0, 200))
        return { ok: false, error: `jira issue PUT HTTP ${res.status}: ${text}` }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: redactSecrets(e instanceof Error ? e.message : String(e)) }
    }
  },

  // Codex #3: delete an issue by key. Used to CLEAN UP the throwaway "Klavity connection test" issue
  // the connection-test route creates to verify credentials — without this, every onboarding retry
  // left a permanent orphan ticket in the customer's project. Best-effort + non-throwing.
  //   DELETE {host}/rest/api/3/issue/{key}  -> 204 on success
  async deleteIssue(
    externalIssueRef: string,
    cfg: Record<string, string>,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const { host, email, token } = cfg
      if (!host || !email || !token) return { ok: false, error: "jira deleteIssue: missing host/email/token in config" }
      if (!externalIssueRef) return { ok: false, error: "jira deleteIssue: missing issue key" }
      const url = `${host.replace(/\/$/, "")}/rest/api/3/issue/${encodeURIComponent(externalIssueRef)}`
      const credentials = Buffer.from(`${email}:${token}`).toString("base64")
      // SSRF + credential-safety guard (H3 / Codex #1): validated + same-origin-redirects-only.
      const res = await safeFetch(
        url,
        { method: "DELETE", headers: { "Authorization": `Basic ${credentials}`, "Accept": "application/json" } },
        JIRA_FETCH_OPTS,
      )
      if (!res.ok && res.status !== 204) {
        const text = redactSecrets((await res.text().catch(() => "")).slice(0, 200))
        return { ok: false, error: `jira issue DELETE HTTP ${res.status}: ${text}` }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: redactSecrets(e instanceof Error ? e.message : String(e)) }
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
      JIRA_FETCH_OPTS,
    )
    if (!res.ok) {
      const t = redactSecrets((await res.text().catch(() => "")).slice(0, 200))
      console.error(`jira issuetypes error ${res.status}: ${t}`)
      throw new UpstreamTrackerError(res.status, t)
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
      JIRA_FETCH_OPTS,
    )
    if (!res.ok) {
      const t = redactSecrets((await res.text().catch(() => "")).slice(0, 200))
      console.error(`jira statuses error ${res.status}: ${t}`)
      throw new UpstreamTrackerError(res.status, t)
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
