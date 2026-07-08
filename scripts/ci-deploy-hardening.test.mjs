import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const mergeTrain = readFileSync(join(here, "merge-train.sh"), "utf8")
const prodDeploy = readFileSync(join(here, "prod-deploy.sh"), "utf8")

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
  assert.match(prodDeploy, /run_systemctl restart "\$SERVICE"/)
  assert.match(prodDeploy, /poll_health/)
  assert.match(prodDeploy, /git reset -q --hard "\$previous"/)
})
