// Run a replay walk in a NODE child process instead of in the Bun server.
//
// Why: Playwright cannot talk to a browser under Bun on Windows - chromium.launch() never returns (its pipe transport
// hangs) and connectOverCDP() times out at the WebSocket (Bun bug; patching Playwright's ws options did not help). The
// walker is written against Playwright, so on bun+Windows the Verification Walk and every manual/scheduled replay
// failed with "browser did not start". Authoring is unaffected (it uses Puppeteer, which works).
//
// The worker is the walker bundled for Node (lib/walk-worker.ts) with `bun`'s S3Client aliased to a stub (lib/s3.ts is
// not modified: local runs use its disk mode, which the worker's Bun shims support). Used only when
// shouldUseNodeWalkWorker() is true: bun on Windows by default, AUTOSIM_NODE_WALK=1 to force, =0 to disable.
import { spawn } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { parseWorkerOutput } from "./walk-worker-protocol"
import { scaledWalkDeadlineMs, type WalkOptions, type WalkSummary } from "./trails-runner"

const LIB_DIR = import.meta.dir
const PROTO_DIR = join(LIB_DIR, "..")
const OUT_DIR = join(PROTO_DIR, ".walk-worker")
const BUNDLE = join(OUT_DIR, "walk-worker.mjs")

export function shouldUseNodeWalkWorker(env: NodeJS.ProcessEnv = process.env, versions: Record<string, any> = process.versions, platform: string = process.platform): boolean {
  if (env.AUTOSIM_NODE_WALK === "1") return true
  if (env.AUTOSIM_NODE_WALK === "0") return false
  return !!versions.bun && platform === "win32"
}

/** The JSON-serialisable subset of WalkOptions the worker understands (functions/signals are re-created inside it). */
export function serializeWalkOptions(opts: WalkOptions): Record<string, unknown> {
  const o = opts as any
  const keep = ["fixtureUrl", "replay", "launchArgs", "headless", "deadlineMs", "scaleDeadlineWithSteps", "runId", "stepShots", "suppressFindings", "environmentName", "_deferInfraAlert"]
  const out: Record<string, unknown> = {}
  for (const k of keep) if (o[k] !== undefined) out[k] = o[k]
  if (o.vision) out.vision = true
  return out
}

let building: Promise<string> | null = null
/** Bundle the walker for Node once per server process (a few seconds). Resolves to the .mjs path. */
export function ensureWorkerBundle(): Promise<string> {
  building ??= build().catch((e) => { building = null; throw e })
  return building
}

async function build(): Promise<string> {
  await mkdir(OUT_DIR, { recursive: true })
  const stub = join(OUT_DIR, "bun-stub.mjs")
  await writeFile(stub, "export class S3Client { constructor() { throw new Error('S3Client is unavailable in the Node walk worker (local disk storage is used instead)') } }\n")
  const result = await Bun.build({
    entrypoints: [join(LIB_DIR, "walk-worker.ts")],
    target: "node",
    format: "esm",
    outdir: OUT_DIR,
    naming: "walk-worker.mjs",
    external: ["playwright", "playwright-core", "puppeteer-core", "@libsql/client", "sharp", "canvas"],
    plugins: [{ name: "bun-alias", setup(b) { b.onResolve({ filter: /^bun$/ }, () => ({ path: stub })) } }],
  })
  if (!result.success) throw new Error("walk worker bundle failed: " + result.logs.map((l: any) => String(l.message || l)).join("; ").slice(0, 400))
  // `import.meta.dir` is Bun-only (lib/s3.ts uses it to find public/); point it at the real lib dir via the env we set below.
  const src = await readFile(BUNDLE, "utf8")
  await writeFile(BUNDLE, src.replaceAll("import.meta.dir", "process.env.KLAV_WALK_LIB_DIR"))
  return BUNDLE
}

export async function walkTrailViaNode(projectId: string, trailId: string, opts: WalkOptions): Promise<WalkSummary> {
  const bundle = await ensureWorkerBundle()
  const job = JSON.stringify({ projectId, trailId, opts: serializeWalkOptions(opts) })
  // Hard stop in case the worker wedges: the walk's own (scaled) deadline + generous teardown/launch headroom.
  const hardStopMs = scaledWalkDeadlineMs(opts.deadlineMs ?? 120_000, 60) + 180_000

  return await new Promise<WalkSummary>((resolve, reject) => {
    const child = spawn(process.env.NODE_BIN || "node", [bundle], {
      cwd: PROTO_DIR,
      env: { ...process.env, KLAV_WALK_LIB_DIR: LIB_DIR },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    })
    let out = "", err = ""
    child.stdout.on("data", (d) => { out += d })
    child.stderr.on("data", (d) => { err += d; if (err.length > 20_000) err = err.slice(-20_000) })
    const killTimer = setTimeout(() => { try { child.kill("SIGKILL") } catch {} }, hardStopMs)
    const onAbort = () => { try { child.stdin.write("abort\n") } catch {} }
    const sig = (opts as any).signal as AbortSignal | undefined
    if (sig) { if (sig.aborted) onAbort(); else sig.addEventListener("abort", onAbort, { once: true }) }
    child.on("error", (e) => { clearTimeout(killTimer); reject(new Error(`could not start the Node walk worker (${process.env.NODE_BIN || "node"}): ${e.message}`)) })
    child.on("close", (code) => {
      clearTimeout(killTimer)
      if (sig) sig.removeEventListener("abort", onAbort)
      const parsed = parseWorkerOutput(out)
      if (parsed.ok) return resolve(parsed.summary as WalkSummary)
      reject(new Error(`Node walk worker exited ${code}: ${parsed.error}${err ? " | stderr: " + err.trim().split("\n").slice(-3).join(" ") : ""}`))
    })
    child.stdin.write(job + "\n")
  })
}
