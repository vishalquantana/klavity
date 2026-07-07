# Klavity CI v1 — AutoSim Trail gating

Run project Trails from your CI pipeline and gate deploys on the verdict.

## How it works

1. **Issue a CI token** (once, from the dashboard or curl) — bound to a specific project.
2. **Trigger a Trail walk** via the CI API — returns a `runId` immediately.
3. **Poll the run** until it finishes — exit non-zero on RED.

## Quick start

### 1. Issue a CI token

```bash
# Authenticate with your Klavity session cookie and get a kci_* token:
curl -s -X POST https://klavity.in/api/ci/token \
  -H "Content-Type: application/json" \
  -H "Cookie: klav_session=<your-session>" \
  -d '{"project":"proj_abc123"}' | jq .
# → {"token":"kci_...","project":"proj_abc123"}
```

Store the `kci_*` token as a CI secret (e.g. `KLAV_CI_TOKEN`).

### 2. Run via the CLI script

```bash
KLAV_CI_TOKEN=kci_... \
  bun run prototype/scripts/klav-ci.ts <trailId> --project <projectId>
# exits 0 on GREEN, 1 on RED/AMBER/error
```

### 3. Or call the API directly

```bash
# Trigger a walk:
RUN=$(curl -sf -X POST \
  "https://klavity.in/api/ci/trails/${TRAIL_ID}/trigger?project=${PROJECT_ID}" \
  -H "Authorization: Bearer ${KLAV_CI_TOKEN}" | jq -r .runId)

# Poll until done:
while true; do
  STATUS=$(curl -sf \
    "https://klavity.in/api/ci/runs/${RUN}?project=${PROJECT_ID}" \
    -H "Authorization: Bearer ${KLAV_CI_TOKEN}" | jq -r .status)
  [ "$STATUS" = "running" ] && sleep 5 && continue
  [ "$STATUS" = "green" ] && exit 0 || exit 1
done
```

## API reference

### `POST /api/ci/token`

Issues a CI token bound to a project. Requires an active browser session.

**Request body:** `{ "project": "proj_..." }`

**Response 201:** `{ "token": "kci_...", "project": "proj_..." }`

---

### `POST /api/ci/trails/:trailId/trigger?project=:projectId`

Triggers a Trail walk. Returns `202` with `{ runId }` immediately; the walk runs in the background.

**Auth:** `Authorization: Bearer kci_...`

**Errors:** `401` no/invalid token · `403` token not bound to this project · `404` trail not found · `409` walk already running

---

### `GET /api/ci/runs/:runId?project=:projectId`

Polls a walk. Returns `{ runId, status, startedAt, finishedAt }`.

`status` is one of: `running` · `green` · `amber` · `red`

**Auth:** `Authorization: Bearer kci_...`

**Errors:** `401` · `403` · `404`

## Security

- CI tokens are project-scoped; they cannot access other projects.
- Tokens are stored hashed (SHA-256) and are revocable.
- No token expiry by default; rotate by issuing a new token.
