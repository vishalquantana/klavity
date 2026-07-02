# Task 2 Report: Test Accounts API Routes

## Status: DONE

## Implementation

### Files changed
- `prototype/server.ts` — 2 changes:
  1. Added import: `import { createTestAccount, listTestAccounts, getTestAccountByName, deleteTestAccount } from "./lib/test-accounts"`
  2. Updated `projMatch` regex (line ~3267) to include `/test-accounts(?:\/[^/]+)?` so the router captures both `/test-accounts` and `/test-accounts/:accId` URLs
  3. Inserted the handler block between `/config` and `/activity` blocks, using local variable names `pid`, `access`, `me` exactly as found in the surrounding code

- `prototype/server.test-accounts.route.test.ts` — New hermetic route test file

### Route handler

Three sub-routes implemented inside the `sub === "/test-accounts" || sub.startsWith("/test-accounts/")` guard:

- `GET /api/projects/:id/test-accounts` — any project member; returns `{ accounts: TestAccount[] }` (password never in response by design of `listTestAccounts`)
- `POST /api/projects/:id/test-accounts` — admin only; validates `name` (regex `/^[a-z0-9_-]{1,40}$/`), `login_email` (contains `@`, ≤200 chars), `password` (non-empty, ≤200 chars); 409 on duplicate name; returns `{ account }` with 201
- `DELETE /api/projects/:id/test-accounts/:accId` — admin only; 404 if not found, `{ ok: true }` on success

## TDD Evidence

**RED phase:** `bun test server.test-accounts.route.test.ts` before implementation:
- `member can list, only admin can create/delete, secret never returned` → FAIL (POST returned 404, expected 201)
- `validation: name 1-40 chars [a-z0-9_-], email required, password 1-200` → FAIL (returned 404, expected 400)
- `cross-project access is 403/404` → PASS (server returned 403 for unknown project — acceptable per `expect([403, 404]).toContain(r.status)`)
- Result: 1 pass, 2 fail

**GREEN phase:** After implementation:
- All 3 tests PASS — 3 pass, 0 fail, 7 expect() calls

**Full suite:** 939 pass, 1 fail (timing flakes in `lib/trails-journey.e2e.test.ts` and `lib/trails-runner-deadline.test.ts` under full-suite load — both pass cleanly in isolation, pre-existing known flake).

## Commit

- SHA: `3d6a30b`
- Message: `feat(autosims): /api/projects/:id/test-accounts routes (admin-gated, secret write-only)`
- Branch: `feat/autosims-domain-model`

## Self-Review

1. **Secret write-only confirmed:** `listTestAccounts` (used for both GET response and POST response via filter) selects only `id,project_id,name,login_email,created_by,created_at,updated_at` — `password_enc` is never fetched; test assertion `expect(JSON.stringify(created)).not.toContain("pw-123")` passes.

2. **Regex correctly captures both paths:** `/test-accounts(?:\/[^/]+)?` matches `/test-accounts` (no trailing segment) and `/test-accounts/tacc_uuid` (with ID segment).

3. **Variable name alignment:** The surrounding `/api/projects/:id/` block uses `pid` (projMatch[1]), `access` (from `projectAccess(me, pid)`), `me` (from `sessionEmail(req)`) — all used correctly in the handler.

4. **Cross-project isolation:** Access check `const access = await projectAccess(me, pid)` happens before any sub-route handler executes; a user with no membership gets 403 before reaching the test-accounts block.

5. **409 duplicate name:** Prevents silent overwrites of encrypted credentials.

## Concerns

None. Implementation is clean and matches the brief verbatim.

## Fix pass

### Findings addressed

**Finding 1 — TOCTOU in POST 201 response (server.ts)**

Added `getTestAccountById(projectId: string, id: string): Promise<TestAccount | null>` to `lib/test-accounts.ts`. It uses the same column list as `listTestAccounts` (never selects `password_enc`) and reuses the existing `row2acc` mapper. The POST handler in `server.ts` now calls this point-read instead of the old filter-after-list pattern; if the row is null (extreme concurrent-delete race), it returns 500.

Changed files:
- `prototype/lib/test-accounts.ts` — added `getTestAccountById` function
- `prototype/server.ts` — updated import to include `getTestAccountById`; replaced `const [account] = (await listTestAccounts(pid)).filter(...)` with `const account = await getTestAccountById(pid, id)` + null-guard returning 500

**Finding 2 — Missing DELETE coverage in route test file**

Added two new test blocks to `prototype/server.test-accounts.route.test.ts`:

1. Extended `"cross-project access is 403/404"` to also cover: member POST on project B → 403/404; member DELETE on project B → 403/404.

2. New test `"DELETE: admin can delete existing account; member cannot; unknown id is 404"`:
   - Creates a fresh account (`to-delete`) via admin POST
   - member DELETE → 403 and account still present in GET list
   - admin DELETE existing → 200 `{ok: true}`
   - account absent from GET list after deletion
   - admin DELETE unknown id → 404

**Finding 3 — Dead code in test file**

Removed the unused `const base = () => BASE` helper from `prototype/server.test-accounts.route.test.ts`.

### TDD note

The DELETE handler was already correctly implemented in 3d6a30b. Writing the DELETE tests first and running them confirmed they passed immediately — no handler change needed. The TOCTOU fix (finding 1) required the new `getTestAccountById` function in lib, which is tested via the route test's POST assertions.

### Test run

```
bun test server.test-accounts.route.test.ts lib/test-accounts.test.ts
```

Output:
```
bun test v1.3.14 (0d9b296a)

 9 pass
 0 fail
 29 expect() calls
Ran 9 tests across 2 files. [433.00ms]
```

9 tests pass (5 route tests across 2 files + 4 lib unit tests), 0 failures, 29 expect() calls.
