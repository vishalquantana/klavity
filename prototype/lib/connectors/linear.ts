import type { Connector, TicketPayload, ExportResult, CommentSyncResult } from "./index"
import { safeFetch } from "../safe-fetch"

const LINEAR_API = "https://api.linear.app/graphql"

// ── Native screenshot attachment (ENHANCEMENT, never required) ───────────────────
//
// Linear's file flow is a 2-step GraphQL upload that must complete BEFORE issue
// creation so the resulting assetUrl can be embedded inline in the description markdown.
//
//   step 1 (GraphQL @ https://api.linear.app/graphql):
//     mutation($ct:String!,$fn:String!,$sz:Int!){
//       fileUpload(contentType:$ct, filename:$fn, size:$sz){
//         success uploadFile { uploadUrl assetUrl headers { key value } }
//       }
//     }
//   step 2 (presigned PUT @ uploadFile.uploadUrl — a Linear-controlled host):
//     PUT <uploadUrl> with body = raw bytes,
//         headers = { "Content-Type": contentType, ...each { key, value } }
//   step 3: embed `![screenshot](assetUrl)` in the issue description before creating it.
//
// NEEDS E2E VERIFICATION against a live Linear workspace (fileUpload mutation + presigned PUT).
//
// Graceful degradation: every attachment upload is wrapped in try/catch. On ANY failure we
// console.warn and SKIP — the issue body already carries the permanent fallback link per
// screenshot, so createIssue MUST still create the issue and MUST NEVER throw because of an
// attachment problem.
async function uploadAttachment(
  api_key: string,
  att: { filename: string; contentType: string; bytes: Uint8Array },
): Promise<string | null> {
  // step 1 — request a presigned upload slot.
  const res = await safeFetch(
    LINEAR_API,
    {
      method: "POST",
      headers: { "Authorization": api_key, "Content-Type": "application/json" },
      body: JSON.stringify({
        query:
          "mutation($ct:String!,$fn:String!,$sz:Int!){ fileUpload(contentType:$ct,filename:$fn,size:$sz){ success uploadFile { uploadUrl assetUrl headers { key value } } } }",
        variables: { ct: att.contentType, fn: att.filename, sz: att.bytes.byteLength },
      }),
    },
    { allowHosts: ["linear.app"], allowLoopbackInTest: true },
  )
  if (!res.ok) throw new Error(`fileUpload HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "fileUpload graphql error")
  const uf = json?.data?.fileUpload?.uploadFile
  if (!uf?.uploadUrl || !uf?.assetUrl) throw new Error("fileUpload returned no uploadUrl/assetUrl")

  // step 2 — PUT the raw bytes to the presigned (Linear-controlled) URL with returned headers.
  const putHeaders: Record<string, string> = { "Content-Type": att.contentType }
  for (const h of (uf.headers ?? []) as Array<{ key: string; value: string }>) {
    if (h?.key) putHeaders[h.key] = h.value
  }
  const put = await safeFetch(
    uf.uploadUrl,
    { method: "PUT", headers: putHeaders, body: att.bytes },
    { allowHosts: ["linear.app"], allowLoopbackInTest: true },
  )
  if (!put.ok) throw new Error(`presigned PUT HTTP ${put.status}`)

  // step 3 caller embeds: `![screenshot](assetUrl)`
  return uf.assetUrl as string
}

export const linearConnector: Connector = {
  type: "linear",
  label: "Linear",
  fields: [
    { key: "api_key", label: "API Key", required: true, secret: true },
    { key: "team_id", label: "Team ID", required: true, placeholder: "TEAM-UUID" },
    // Two-way sync (G4): the webhook signing secret Linear shows when you create the webhook.
    // Used ONLY to verify inbound Linear-Signature (HMAC-SHA256); never sent outbound. Optional —
    // leave blank to keep this connector outbound-only.
    { key: "inbound_secret", label: "Inbound Webhook Secret (optional, for two-way sync)", secret: true },
  ],

  validate(cfg) {
    for (const k of ["api_key", "team_id"] as const) {
      if (!cfg[k]) return { ok: false, error: `${k} is required` }
    }
    return { ok: true }
  },

  async createIssue(ticket: TicketPayload, cfg: Record<string, string>): Promise<ExportResult> {
    const { api_key, team_id } = cfg

    // ENHANCEMENT: natively upload each screenshot and embed it inline in the description.
    // Wrapped per-attachment so a failure NEVER blocks issue creation (the body keeps the
    // permanent fallback link). No-op when there are no attachments (unchanged behavior).
    let description = ticket.body
    // JTBD 2.16: Linear applies labels by UUID (labelIds), not by name, so mapping Klavity's
    // label names onto native Linear labels needs a version-dependent lookup. Carry the
    // classification in the issue description instead so the exported ticket keeps its labels.
    if (ticket.labels?.length) description += `\n\nLabels: ${ticket.labels.join(", ")}`
    for (const att of ticket.attachments ?? []) {
      try {
        const assetUrl = await uploadAttachment(api_key, att)
        if (assetUrl) description += `\n\n![screenshot](${assetUrl})`
      } catch (e) {
        console.warn(
          `linear attachment upload skipped (${att.filename}): ${e instanceof Error ? e.message : String(e)}`,
        )
        // Skip — fallback link already in body; continue creating the issue normally.
      }
    }

    // Endpoint is a fixed first-party host (not user-controlled). safeFetch pins to
    // linear.app and re-validates every hop — rejecting any private/loopback resolution
    // (e.g. DNS-rebinding) or a redirect off-host before sending the API key.
    const res = await safeFetch(
      LINEAR_API,
      {
        method: "POST",
        headers: {
          "Authorization": api_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query:
            "mutation($t:String!,$d:String!,$tm:String!){ issueCreate(input:{title:$t,description:$d,teamId:$tm}){ issue { identifier url } } }",
          variables: { t: ticket.title, d: description, tm: team_id },
        }),
      },
      { allowHosts: ["linear.app"] },
    )

    if (!res.ok) {
      const text = (await res.text().catch(() => "")).slice(0, 200)
      console.error(`linear upstream error ${res.status}: ${text}`)
      throw new Error(`tracker request failed (HTTP ${res.status})`)
    }

    const json = await res.json()
    if (json.errors && json.errors.length > 0) {
      console.error(`linear graphql error: ${json.errors[0]?.message ?? "unknown error"}`)
      throw new Error("tracker request failed (GraphQL error)")
    }

    const issue = json?.data?.issueCreate?.issue
    return {
      externalKey: issue?.identifier ?? null,
      externalUrl: issue?.url ?? null,
    }
  },

  // addComment: create a comment on the Linear issue identified by externalIssueRef.
  //
  // externalIssueRef is the externalKey stored by createIssue: the Linear issue identifier,
  // e.g. "ENG-42". Linear requires the internal issue ID (UUID), not the identifier, for the
  // commentCreate mutation, so we resolve it first via a query.
  //
  // Linear comment API (GraphQL):
  //   POST https://api.linear.app/graphql
  //   Headers: Authorization: {api_key}   (no "Bearer" prefix for Linear personal API keys)
  //            Content-Type: application/json
  //
  //   Step 1 — resolve the issue's internal ID from its identifier:
  //     query($id:String!){ issue(id:$id){ id } }
  //     variables: { id: "ENG-42" }  (Linear accepts identifier OR UUID as $id)
  //
  //   Step 2 — create the comment:
  //     mutation($issueId:String!,$body:String!){ commentCreate(input:{issueId:$issueId,body:$body}){ comment { id } } }
  //
  // NOTE: Linear accepts the human identifier (e.g. "ENG-42") as the $id arg for `issue(id:…)`
  // so the resolution query is a single round-trip. Verified against Linear GraphQL schema 2024.
  async addComment(
    externalIssueRef: string,
    commentText: string,
    meta: { authorEmail?: string | null; klavityCommentId?: string },
    cfg: Record<string, string>,
  ): Promise<CommentSyncResult> {
    try {
      const { api_key } = cfg
      if (!api_key) {
        return { ok: false, error: "linear addComment: missing api_key in config" }
      }

      const headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
      }

      // Step 1: resolve the issue's internal UUID from the identifier (e.g. "ENG-42").
      // Linear's issue(id:) field accepts either the identifier or the UUID directly.
      const resolveRes = await safeFetch(
        LINEAR_API,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: "query($id:String!){ issue(id:$id){ id } }",
            variables: { id: externalIssueRef },
          }),
        },
        { allowHosts: ["linear.app"] },
      )

      if (!resolveRes.ok) {
        const text = (await resolveRes.text().catch(() => "")).slice(0, 200)
        return { ok: false, error: `linear issue resolve HTTP ${resolveRes.status}: ${text}` }
      }

      const resolveJson = await resolveRes.json()
      if (resolveJson.errors?.length) {
        return { ok: false, error: `linear issue resolve GraphQL: ${resolveJson.errors[0]?.message ?? "unknown"}` }
      }
      const issueId: string | undefined = resolveJson?.data?.issue?.id
      if (!issueId) {
        return { ok: false, error: `linear addComment: could not resolve issue ID for "${externalIssueRef}"` }
      }

      // Step 2: create the comment.
      const commentRes = await safeFetch(
        LINEAR_API,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            query:
              "mutation($issueId:String!,$body:String!){ commentCreate(input:{issueId:$issueId,body:$body}){ comment { id } } }",
            variables: { issueId, body: commentText },
          }),
        },
        { allowHosts: ["linear.app"] },
      )

      if (!commentRes.ok) {
        const text = (await commentRes.text().catch(() => "")).slice(0, 200)
        return { ok: false, error: `linear commentCreate HTTP ${commentRes.status}: ${text}` }
      }

      const commentJson = await commentRes.json()
      if (commentJson.errors?.length) {
        return { ok: false, error: `linear commentCreate GraphQL: ${commentJson.errors[0]?.message ?? "unknown"}` }
      }

      const externalCommentId = commentJson?.data?.commentCreate?.comment?.id ?? null
      return { ok: true, externalCommentId: externalCommentId ? String(externalCommentId) : null }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  },
}
