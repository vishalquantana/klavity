// Entry point of the Node walk worker. The server (Bun) spawns this, bundled for Node, to run ONE replay walk, because
// Playwright cannot launch or attach to a browser under Bun on Windows (see lib/walk-node-bridge.ts).
//
// Protocol: stdin line 1 = JSON job {projectId, trailId, opts}; later stdin line "abort" cancels the walk.
// stdout: the walker may log freely; the result is one line  <WALK_RESULT_MARK><json WalkSummary>  (or WALK_ERROR_MARK).
import "./walk-worker-shims" // must evaluate first: installs the Bun stand-ins the rest of the import chain expects
import { createInterface } from "node:readline"
import { WALK_RESULT_MARK, WALK_ERROR_MARK, platformSafeChromiumArgs } from "./walk-worker-protocol"

const rl = createInterface({ input: process.stdin })
const abort = new AbortController()
let started = false

rl.on("line", async (line) => {
  const text = line.trim()
  if (text === "abort") { abort.abort(); return }
  if (started || !text.startsWith("{")) return
  started = true
  try {
    const job = JSON.parse(text)
    const { walkTrail } = await import("./trails-runner")
    const { configuredVisionResolver } = await import("./trails-vision")
    const { vision: wantVision, ...opts } = job.opts ?? {}
    const summary = await walkTrail(job.projectId, job.trailId, {
      ...opts,
      ...(opts.launchArgs ? { launchArgs: platformSafeChromiumArgs(opts.launchArgs) } : {}),
      ...(wantVision ? (() => { const v = configuredVisionResolver(); return v ? { vision: v } : {} })() : {}),
      signal: abort.signal,
    })
    process.stdout.write("\n" + WALK_RESULT_MARK + JSON.stringify(summary) + "\n", () => process.exit(0))
  } catch (e: any) {
    process.stdout.write("\n" + WALK_ERROR_MARK + String(e?.stack || e?.message || e).slice(0, 2000) + "\n", () => process.exit(1))
  }
})
