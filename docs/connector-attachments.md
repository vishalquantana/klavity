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

## Manual live-verify checklist (human step — not automated)

The hermetic tests in `plane.attach.test.ts` and `linear.attach.test.ts` prove the request shapes
are correct against a faithful mock. To confirm the image actually renders inline in a real tracker
(the final visual gate), a human must do the following once before closing KLAVITYKLA-285.

### Plane (self-hosted at plane.quantana.top)

1. Open Klavity at <https://klavity.in>, log in as `vishal@quantana.com.au`.
2. Open any existing feedback item that has a screenshot — look for the camera icon in the
   feedback list or use the "Test report" button on the dashboard.
3. In the feedback detail panel, click **Export → Plane** (or use an auto-copy connector already
   configured for workspace `qbuilder`, project `05ea72ad`).
4. Open the exported Plane issue at <https://plane.quantana.top/qbuilder/projects/05ea72ad/issues/>.
5. **Visual check**: the screenshot renders inline in the "Attachments" section of the issue (not
   just a link in the description body). The thumbnail should be visible without clicking anything.
6. Hover the attachment thumbnail and confirm the filename matches the one Klavity uploaded
   (e.g. `shot-<timestamp>.png`).
7. If the attachment is missing: check `ticket_exports` in the DB for a non-null `error` column
   (the `attachmentWarning` text). Also check server logs for `plane attachment upload failed`.

### Linear

1. Open Klavity, same feedback item with a screenshot.
2. Export → Linear, using your API key and the target team ID.
3. Open the created Linear issue.
4. **Visual check**: the issue description contains an inline image rendered from the `assetUrl`
   returned by the `fileUpload` mutation (markdown: `![screenshot](https://uploads.linear.app/…)`).
   The image must load — it is not just a broken-image placeholder.
5. If no image: check `ticket_exports.error` for `screenshot attach failed`. Also check server
   logs for `linear attachment upload skipped`.
6. When the live round-trip confirms the request shapes are correct, remove the "STILL UNVERIFIED"
   comment at the top of `lib/connectors/linear.ts` and update the Linear section above.

## Jira

`lib/connectors/jira.ts` uses Jira's documented `/attachments` endpoint with the
`X-Atlassian-Token: no-check` header. Not covered by this ticket.
