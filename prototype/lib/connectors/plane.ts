import type { Connector, TicketPayload, ExportResult, CommentSyncResult } from "./index"
import { safeFetch } from "../safe-fetch"

export const planeConnector: Connector = {
  type: "plane",
  label: "Plane",
  fields: [
    { key: "host", label: "API Host", placeholder: "https://api.plane.so" },
    { key: "workspace", label: "Workspace Slug", required: true },
    { key: "project_id", label: "Project ID", required: true },
    { key: "token", label: "API Key", required: true, secret: true },
    // Two-way sync (G4): shared secret sent by Plane's webhook as X-Plane-Signature.
    // Verified on inbound only; never sent outbound. Optional — blank = outbound-only.
    { key: "inbound_secret", label: "Inbound Webhook Secret (optional, for two-way sync)", secret: true },
  ],

  validate(cfg) {
    for (const k of ["workspace", "project_id", "token"] as const) {
      if (!cfg[k]) return { ok: false, error: `${k} is required` }
    }
    return { ok: true }
  },

  async createIssue(ticket: TicketPayload, cfg: Record<string, string>): Promise<ExportResult> {
    const host = cfg.host?.replace(/\/$/, "") || "https://api.plane.so"
    const { workspace, project_id, token } = cfg
    const apiUrl = `${host}/api/v1/workspaces/${workspace}/projects/${project_id}/issues/`

    // JTBD 2.16: Plane's issue-create API applies labels by UUID, not by name, so we can't map
    // Klavity's label names onto native Plane labels without a version-dependent lookup. Instead
    // we carry the classification in the issue description so the exported ticket keeps its labels.
    let descriptionHtml = ticket.body
    if (ticket.labels?.length) descriptionHtml += `\n\nLabels: ${ticket.labels.join(", ")}`

    // SSRF guard (H3): `host` is user-supplied (self-hosted Plane is allowed, but must be a
    // public https host). safeFetch validates the URL and every redirect hop (loopback /
    // private / link-local / metadata blocked, https required) before the X-API-Key is sent.
    const res = await safeFetch(
      apiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": token,
        },
        body: JSON.stringify({
          name: ticket.title,
          description_html: descriptionHtml,
        }),
      },
      { allowLoopbackInTest: true },
    )

    if (!res.ok) {
      const text = (await res.text().catch(() => "")).slice(0, 200)
      console.error(`plane upstream error ${res.status}: ${text}`)
      throw new Error(`tracker request failed (HTTP ${res.status})`)
    }

    const json = await res.json()
    const id: string = String(json.id)
    const seqId: string | null = json.sequence_id != null ? String(json.sequence_id) : null

    // ── Native screenshot attachment (pure ENHANCEMENT) ─────────────────────────────
    // ASSUMED Plane attachment API — NEEDS E2E VERIFICATION against the actual deployed
    // Plane version; falls back to the permanent body link if wrong.
    //   Endpoint: POST {host}/api/v1/workspaces/{workspace}/projects/{project_id}/issues/{id}/issue-attachments/
    //   Auth:     X-API-Key: {token}
    //   Body:     multipart/form-data — field `asset` = Blob(bytes, contentType) + filename.
    //             We let fetch set the multipart Content-Type boundary (do NOT set it manually).
    //
    // Plane's public REST attachment API is version-dependent and NOT fully stable, so the
    // ENTIRE step is wrapped in try/catch and SWALLOWED on any failure: the issue already
    // exists and its body carries a permanent signed fallback link to every screenshot, so a
    // failed/absent upload must NEVER throw or alter the returned {externalKey, externalUrl}.
    if (ticket.attachments?.length) {
      const attachUrl = `${host}/api/v1/workspaces/${workspace}/projects/${project_id}/issues/${id}/issue-attachments/`
      for (const att of ticket.attachments) {
        try {
          const form = new FormData()
          // `asset` is the best-documented field name; some Plane builds expect `file`.
          form.append("asset", new Blob([att.bytes], { type: att.contentType }), att.filename)
          // Best-known metadata the API may require alongside the binary.
          form.append(
            "attributes",
            JSON.stringify({ name: att.filename, type: att.contentType, size: att.bytes.byteLength }),
          )

          const aRes = await safeFetch(
            attachUrl,
            {
              method: "POST",
              // NOTE: no Content-Type header — fetch derives the multipart boundary from FormData.
              headers: { "X-API-Key": token },
              body: form,
            },
            { allowLoopbackInTest: true },
          )

          if (!aRes.ok) {
            const text = (await aRes.text().catch(() => "")).slice(0, 200)
            console.warn(`plane attachment upload failed ${aRes.status}: ${text} (falling back to body link)`)
          }
        } catch (e) {
          console.warn(`plane attachment upload error for ${att.filename}: ${String(e)} (falling back to body link)`)
        }
      }
    }

    // URL: strip /api suffix from host for the web URL
    const webBase = host.replace(/\/api$/, "")
    const externalUrl = `${webBase}/${workspace}/projects/${project_id}/issues/${id}`
    const externalKey = seqId ?? id

    return { externalKey, externalUrl }
  },

  // addComment: POST a comment on the Plane issue identified by externalIssueRef.
  //
  // externalIssueRef is the externalKey stored by createIssue: sequence_id (e.g. "42") if
  // available, otherwise the issue UUID. Plane's comment API requires the issue UUID, not the
  // sequence_id, so we resolve the issue first when the ref looks like a sequence number.
  //
  // Plane comment API (best-known endpoint — VERIFY against your Plane version):
  //   POST {host}/api/v1/workspaces/{workspace}/projects/{project_id}/issues/{issue_id}/comments/
  //   Headers: X-API-Key: {token}, Content-Type: application/json
  //   Body:    { "comment_html": "<p>text</p>" }   or   { "comment_stripped": "text" }
  //
  // NOTE: Plane's public REST comment API shape is version-dependent. We use comment_html here
  // because it is present in documented Plane Community + Cloud; comment_stripped is a safe
  // fallback the caller can add if needed. The entire call is best-effort (swallows errors
  // and returns { ok: false, error }) so it never blocks the Klavity comment-save path.
  async addComment(
    externalIssueRef: string,
    commentText: string,
    meta: { authorEmail?: string | null; klavityCommentId?: string },
    cfg: Record<string, string>,
  ): Promise<CommentSyncResult> {
    try {
      const host = cfg.host?.replace(/\/$/, "") || "https://api.plane.so"
      const { workspace, project_id, token } = cfg
      if (!workspace || !project_id || !token) {
        return { ok: false, error: "plane addComment: missing workspace/project_id/token in config" }
      }

      // externalIssueRef may be a sequence_id string (e.g. "42") or a UUID. The comment
      // endpoint requires the UUID, so if the ref looks like a pure integer (sequence_id) we
      // must resolve the UUID via the issues list filtered by sequence_id. If resolution fails,
      // fall back to using the ref directly (it may already be a UUID from createIssue when
      // sequence_id was null).
      let issueId = externalIssueRef
      if (/^\d+$/.test(externalIssueRef)) {
        try {
          // SSRF guard: host is user-supplied → safeFetch validates before sending the token.
          const listRes = await safeFetch(
            `${host}/api/v1/workspaces/${workspace}/projects/${project_id}/issues/?sequence_id=${externalIssueRef}`,
            { method: "GET", headers: { "X-API-Key": token } },
            { allowLoopbackInTest: true },
          )
          if (listRes.ok) {
            const data = await listRes.json()
            // Response may be { results: [{id, ...}] } or an array.
            const results = Array.isArray(data) ? data : (data?.results ?? [])
            if (results.length > 0 && results[0].id) issueId = String(results[0].id)
          }
        } catch { /* resolution failed: fall through and try with the ref as-is */ }
      }

      const commentUrl = `${host}/api/v1/workspaces/${workspace}/projects/${project_id}/issues/${issueId}/comments/`
      const res = await safeFetch(
        commentUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": token },
          body: JSON.stringify({ comment_html: `<p>${commentText}</p>` }),
        },
        { allowLoopbackInTest: true },
      )

      if (!res.ok) {
        const text = (await res.text().catch(() => "")).slice(0, 200)
        return { ok: false, error: `plane comment POST HTTP ${res.status}: ${text}` }
      }

      const json = await res.json().catch(() => null)
      const externalCommentId = json?.id ? String(json.id) : null
      return { ok: true, externalCommentId }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  },
}
