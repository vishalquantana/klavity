# Klavity CI API — Programmatic Trail Trigger

Run AutoSim Trails from CI/CD pipelines (GitHub Actions, GitLab CI, etc.) using a
dedicated `kci_*` Bearer token. The token is project-scoped and never grants access
to other users' projects.

## 1. Issue a CI token (one-time, from the dashboard)

```bash
# Logged-in session cookie is required (copy from browser DevTools).
curl -s -X POST https://klavity.in/api/ci/token \
  -H "Cookie: klav_session=<your-session-id>" \
  -H "Content-Type: application/json" \
  -d '{"project": "<project-id>"}' \
  | jq '.token'
# → "kci_abc123..."
```

Store the returned token as a CI secret (e.g. `KLAVITY_CI_TOKEN`). Tokens do not
expire and can be revoked from the Klavity dashboard settings page.

## 2. Trigger a Trail walk

```bash
curl -s -X POST \
  "https://klavity.in/api/ci/trails/<trail-id>/trigger?project=<project-id>" \
  -H "Authorization: Bearer $KLAVITY_CI_TOKEN" \
  -H "Content-Type: application/json"
# → {"runId": "walk_abc..."}
```

Returns HTTP 202 immediately — the walk runs in the background.  
Returns HTTP 409 if a walk is already in progress (retry after ~2 min).

## 3. Poll for the verdict

```bash
RUN_ID="walk_abc..."
while true; do
  RESULT=$(curl -s \
    "https://klavity.in/api/ci/runs/$RUN_ID?project=<project-id>" \
    -H "Authorization: Bearer $KLAVITY_CI_TOKEN")
  STATUS=$(echo "$RESULT" | jq -r '.status')
  echo "status: $STATUS"
  if [ "$STATUS" != "running" ]; then break; fi
  sleep 10
done

# Exit non-zero if red (regression detected)
[ "$STATUS" = "red" ] && exit 1 || exit 0
```

### Verdict meanings

| status  | meaning                          | suggested CI exit |
|---------|----------------------------------|-------------------|
| green   | all assertions passed            | 0 (pass)          |
| amber   | self-healed drift (warning)      | 0 (warn)          |
| red     | regression detected              | 1 (fail)          |
| skip    | walk skipped (no steps)          | 0 (pass)          |

## GitHub Actions example

```yaml
- name: Run Klavity Trail
  env:
    KLAVITY_CI_TOKEN: ${{ secrets.KLAVITY_CI_TOKEN }}
    TRAIL_ID: trl_xxxxxxxxxxxxx
    PROJECT_ID: proj_xxxxxxxxxxxx
  run: |
    RUN_ID=$(curl -sf -X POST \
      "https://klavity.in/api/ci/trails/$TRAIL_ID/trigger?project=$PROJECT_ID" \
      -H "Authorization: Bearer $KLAVITY_CI_TOKEN" | jq -r '.runId')
    for i in $(seq 1 30); do
      STATUS=$(curl -sf \
        "https://klavity.in/api/ci/runs/$RUN_ID?project=$PROJECT_ID" \
        -H "Authorization: Bearer $KLAVITY_CI_TOKEN" | jq -r '.status')
      echo "Trail status: $STATUS"
      [ "$STATUS" != "running" ] && break
      sleep 10
    done
    [ "$STATUS" = "red" ] && exit 1 || exit 0
```

## API reference

### `POST /api/ci/token`
**Auth**: session cookie (log in via the dashboard first)  
**Body**: `{ "project": "<project-id>" }` (required)  
**Response 201**: `{ "token": "kci_...", "project": "<project-id>" }`

### `POST /api/ci/trails/:trailId/trigger`
**Auth**: `Authorization: Bearer <kci_token>`  
**Query**: `?project=<project-id>` (required unless token is project-bound)  
**Response 202**: `{ "runId": "walk_..." }`  
**Response 409**: another walk is already running

### `GET /api/ci/runs/:runId`
**Auth**: `Authorization: Bearer <kci_token>`  
**Query**: `?project=<project-id>`  
**Response 200**: `{ "runId": "walk_...", "status": "running"|"green"|"amber"|"red"|"skip", "finishedAt": <ms>|null, "summary": {...}|null }`  
**Response 404**: run not found in this project
