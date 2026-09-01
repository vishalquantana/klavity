import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const mergeTrain = readFileSync(join(here, "merge-train.sh"), "utf8")
const prodDeploy = readFileSync(join(here, "prod-deploy.sh"), "utf8")
const autodeploy = readFileSync(join(here, "autodeploy.sh"), "utf8")
const server = readFileSync(join(here, "..", "prototype", "server.ts"), "utf8")

test("merge train has a tsc --noEmit rollback gate after branch merges", () => {
  assert.match(mergeTrain, /typecheck_changed_ts\(\)/)
  assert.match(mergeTrain, /tsc --noEmit/)
  assert.match(mergeTrain, /if ! typecheck_changed_ts "\$pre"; then/)
  assert.match(mergeTrain, /why="\$why tsc-noEmit"/)
  assert.match(mergeTrain, /git reset -q --hard "\$pre"/)
})

test("prod deploy installs prototype dependencies before restart and rolls back unhealthy deploys", () => {
  assert.match(prodDeploy, /BUN_BIN="\$\{BUN_BIN:-\/home\/klav\/\.bun\/bin\/bun\}"/)
  assert.match(prodDeploy, /git reset -q --hard origin\/master/)
  assert.match(prodDeploy, /cd "\$REPO\/prototype" && "\$BUN_BIN" install/)
  assert.match(prodDeploy, /run_systemctl restart "\$SERVICE"|systemctl restart "\$SERVICE"/)
  assert.match(prodDeploy, /poll_health/)
  assert.match(prodDeploy, /git reset -q --hard "\$previous"/)
})

// ── KLA-750 deploy-slot hardening ──────────────────────────────────────────────

// (a) Squatter detection + kill path: before starting the slot, a non-systemd listener on the slot
// port is SIGTERM'd then SIGKILL'd, and the deploy aborts if the port can't be freed.
test("KLA-750(a): autodeploy kills non-systemd port squatters before starting the slot", () => {
  // Helper that lists listeners on the port via ss -ltnp.
  assert.match(autodeploy, /port_listeners\(\)/)
  assert.match(autodeploy, /ss -H -ltnp "sport = :\$\{port\}"/)
  // Compares listener PIDs against the unit's systemd MainPID (only kills NON-systemd squatters).
  assert.match(autodeploy, /systemctl show -p MainPID --value "\$svc"/)
  // SIGTERM then SIGKILL fallback.
  assert.match(autodeploy, /kill -TERM "\$pid"/)
  assert.match(autodeploy, /kill -KILL "\$pid"/)
  // Fails loudly (non-zero) if the port can't be freed.
  assert.match(autodeploy, /could not free slot port/)
  // Wired into the flow BEFORE the slot is started.
  const freeIdx = autodeploy.indexOf('if ! free_slot_port "$inactive_port"')
  const startIdx = autodeploy.indexOf('systemctl start "$inactive_svc"')
  assert.ok(freeIdx > 0, "free_slot_port must be called")
  assert.ok(startIdx > 0, "slot must be started")
  assert.ok(freeIdx < startIdx, "port must be freed BEFORE the slot is started")
})

// (b) Served-commit mismatch → deploy aborts BEFORE the Caddy flip.
test("KLA-750(b): autodeploy verifies served commit before flipping Caddy", () => {
  assert.match(autodeploy, /served_commit\(\)/)
  assert.match(autodeploy, /assert_served_commit\(\)/)
  assert.match(autodeploy, /\/api\/version/)
  assert.match(autodeploy, /SERVED-COMMIT MISMATCH/)
  // The assertion must run BEFORE flip_caddy, and a failure stops the slot + exits (no promotion).
  const assertIdx = autodeploy.indexOf('if ! assert_served_commit "$inactive_ver_url" "$target"')
  const flipIdx = autodeploy.indexOf('flip_caddy "$inactive_port"')
  assert.ok(assertIdx > 0, "assert_served_commit must be called with the deployed target")
  assert.ok(flipIdx > 0, "flip_caddy must be called")
  assert.ok(assertIdx < flipIdx, "served-commit check must run BEFORE the Caddy flip")
})

// (b2) BEHAVIORAL parse test — the (b) test above is static (matches script TEXT) and missed a real
// bug: served_commit's old `grep -oE '[0-9a-fA-F]+' | head -n1` matched the 'c' in the word "commit"
// FIRST, so it returned "c" and aborted EVERY Caddy flip (prod froze on old code). Extract the ACTUAL
// served_commit function from the script, stub curl, and prove it returns the SHA — not "c".
function runServedCommit(script, body) {
  const fn = script.match(/served_commit\(\)\s*\{[\s\S]*?\n\}/)
  assert.ok(fn, "served_commit() function must exist")
  const harness = `curl(){ printf '%s' ${JSON.stringify(body)}; }\n${fn[0]}\nserved_commit "http://127.0.0.1:0/api/version"`
  return execFileSync("bash", ["-c", harness], { encoding: "utf8" }).trim()
}
for (const [name, script] of [["autodeploy", autodeploy], ["prod-deploy", prodDeploy]]) {
  test(`KLA-750 parse: ${name} served_commit extracts the SHA, not the 'c' in "commit"`, () => {
    const sha = "5416faeb6b4256031044e8758c2990bbb0b81f52"
    assert.equal(runServedCommit(script, `{"ok":true,"commit":"${sha}","startedAt":"x","pid":1}`), sha)
    // whitespace variant + no commit → empty (not a partial match)
    assert.equal(runServedCommit(script, `{ "commit" : "abcdef1234567890" }`), "abcdef1234567890")
    assert.equal(runServedCommit(script, `{"ok":true,"pid":1}`), "")
    // regression guard: the buggy second-grep-then-head antipattern must be gone from CODE
    // (matches the pipeline `grep -oE '[0-9a-fA-F]+' | head`, not the prose comment describing it).
    assert.doesNotMatch(script, /grep -oE '\[0-9a-fA-F\]\+'\s*\|\s*head/, "the double-grep→head that returned 'c' must be removed")
  })
}

// (c) Restart-counter climb (EADDRINUSE crash-loop) detection → abort, not silent success.
test("KLA-750(c): autodeploy detects a climbing restart counter and aborts", () => {
  assert.match(autodeploy, /nrestarts\(\)/)
  assert.match(autodeploy, /systemctl show -p NRestarts --value/)
  assert.match(autodeploy, /restarts_before="\$\(nrestarts "\$inactive_svc"\)"/)
  assert.match(autodeploy, /restarts_after="\$\(nrestarts "\$inactive_svc"\)"/)
  assert.match(autodeploy, /if \[ "\$restarts_after" -gt "\$restarts_before" \]; then/)
  assert.match(autodeploy, /crash-loop \(EADDRINUSE\?\)/)
  // The baseline must be captured before the slot starts; the comparison before the flip.
  const beforeIdx = autodeploy.indexOf('restarts_before="$(nrestarts "$inactive_svc")"')
  const startIdx = autodeploy.indexOf('systemctl start "$inactive_svc"')
  const afterIdx = autodeploy.indexOf('restarts_after="$(nrestarts "$inactive_svc")"')
  const flipIdx = autodeploy.indexOf('flip_caddy "$inactive_port"')
  assert.ok(beforeIdx > 0 && beforeIdx < startIdx, "restart baseline captured before start")
  assert.ok(afterIdx > 0 && afterIdx < flipIdx, "restart climb checked before the flip")
})

// prod-deploy.sh shares the same flip logic → it carries the same three guards on its ZDT path.
test("KLA-750: prod-deploy ZDT path carries the same three guards", () => {
  assert.match(prodDeploy, /free_slot_port\(\)/)
  assert.match(prodDeploy, /assert_served_commit\(\)/)
  assert.match(prodDeploy, /nrestarts\(\)/)
  assert.match(prodDeploy, /\/api\/version/)
  const freeIdx = prodDeploy.indexOf('if ! free_slot_port "$inactive_port"')
  const startIdx = prodDeploy.indexOf('systemctl start "$inactive_svc"')
  const assertIdx = prodDeploy.indexOf('if ! assert_served_commit "$inactive_ver_url" "$new_head"')
  const flipIdx = prodDeploy.indexOf('flip_caddy "$inactive_port"')
  assert.ok(freeIdx > 0 && freeIdx < startIdx, "port freed before start (prod-deploy)")
  assert.ok(assertIdx > 0 && assertIdx < flipIdx, "served-commit checked before flip (prod-deploy)")
})

// The server must expose the identity endpoint the deploy relies on.
test("KLA-750: server exposes GET /api/version with a boot commit + startedAt", () => {
  assert.match(server, /path === "\/api\/version"/)
  assert.match(server, /BOOT_COMMIT/)
  assert.match(server, /BOOT_STARTED_AT/)
  // Commit sourced from KLAV_COMMIT env, falling back to git rev-parse HEAD at boot.
  assert.match(server, /process\.env\.KLAV_COMMIT/)
  assert.match(server, /git", "rev-parse", "HEAD/)
  assert.match(server, /commit: BOOT_COMMIT, startedAt: BOOT_STARTED_AT/)
})
