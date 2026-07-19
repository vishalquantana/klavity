# Native screenshot attachments in tracker connectors (KLA-285 / JTBD 5.6)

The screenshot is the most persuasive part of a Klavity ticket. Every export payload
(`feedbackToTicketPayload`) carries both:

- `attachment.bytes` — for connectors that can upload the image **natively**, so it renders inline
  in the customer's tracker and lives there forever, and
- `attachment.url` — a permanent HMAC-signed link on our domain, always present in the issue body.

A native upload is therefore a pure **enhancement**: it must never fail the export. But it must also
never degrade **invisibly** — before KLA-285 a failed upload was only discoverable by opening the
external issue by hand. Connectors now return `ExportResult.attachmentWarning`, and the callers in
`server.ts` write it to the `ticket_exports` row (`status` stays `"ok"`, `error` holds the reason) so
it shows on the export timeline as "exported, screenshot attach failed — link included in body".

## Plane — VERIFIED 2026-07-19

Verified live against self-hosted Plane at `plane.quantana.top`, workspace `qbuilder`, project
`05ea72ad-a53f-46d5-b37e-7874ce2a65b4`.

**What was wrong:** the connector POSTed `multipart/form-data` with an `asset` field directly to
`/issue-attachments/`. Real Plane answers that with:

```
HTTP 400 {"error":"Invalid request.","status":false}
```

so *every* Plane export was silently falling back to the body link. The real API is a 3-step
presigned-storage flow.

### Step 1 — reserve the asset (JSON metadata, not bytes)

```
POST {host}/api/v1/workspaces/{ws}/projects/{proj}/issues/{issue_id}/issue-attachments/
X-API-Key: {token}
Content-Type: application/json

{ "name": "shot.png", "type": "image/png", "size": 70 }
```

Returns `200` with `asset_id`, `attachment` (note `is_uploaded: false`), and
`upload_data: { url, fields }`.

### Step 2 — presigned POST of the bytes to object storage

`POST upload_data.url` as `multipart/form-data`: every entry of `upload_data.fields` first, then the
binary as `file` **last**. Returns `204`.

The presigned policy pins `content-length-range` to exactly the `size` declared in step 1. During
verification, declaring 68 for a 70-byte file returned:

```
<Error><Code>EntityTooLarge</Code><ProposedSize>70</ProposedSize><MaxSizeAllowed>68</MaxSizeAllowed></Error>
```

So `size` must be `bytes.byteLength` — never a recomputed or approximate value.

### Step 3 — commit the asset

```
PATCH {…}/issue-attachments/{asset_id}/    body {}   → 204
```

This flips `is_uploaded` to `true`. **Without step 3 Plane omits the attachment from the issue
entirely** — skipping it is indistinguishable from never having uploaded.

### Re-running the verification

`GET .../issue-attachments/` lists only fully-committed assets; a successful run shows the row with
`is_uploaded= True`. The regression suite in `prototype/lib/connectors/plane.attach.test.ts` encodes
all three of the above enforcement behaviors in a `fakePlane()` double, so the old multipart shape
cannot come back without turning the suite red (it fails 7 of 9 tests).

## Linear — STILL UNVERIFIED

No Linear API key or workspace is available to this codebase, so the `fileUpload` mutation +
presigned `PUT` in `lib/connectors/linear.ts` remain derived from Linear's published GraphQL schema
rather than an observed round-trip. That path may still be wrong in the same way Plane's was.

It is at least no longer silent: failures surface via `attachmentWarning` on the export record. To
finish the verification, export a ticket with a screenshot to a real Linear workspace and confirm
the image renders inline in the issue description; then update this section and drop the
"STILL UNVERIFIED" comment at the top of `linear.ts`.

## Jira

`lib/connectors/jira.ts` uses Jira's documented `/attachments` endpoint with the
`X-Atlassian-Token: no-check` header. Not covered by this ticket.
