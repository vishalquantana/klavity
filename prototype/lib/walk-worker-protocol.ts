// Wire format shared by the Bun-side bridge (lib/walk-node-bridge.ts) and the Node worker (lib/walk-worker.ts).
// Kept free of side effects so the bridge can import it.
export const WALK_RESULT_MARK = "__KLAV_WALK_RESULT__"
export const WALK_ERROR_MARK = "__KLAV_WALK_ERROR__"

/**
 * CHROMIUM_PROD_ARGS targets a small Linux box (--single-process, --no-zygote); on Windows those flags make Chromium
 * exit immediately ("Target page, context or browser has been closed" on the first goto). Drop them there.
 */
const WINDOWS_UNSAFE_CHROMIUM_FLAGS = new Set(["--single-process", "--no-zygote"])
export function platformSafeChromiumArgs(args: string[] | undefined, platform: string = process.platform): string[] | undefined {
  if (!args) return args
  return platform === "win32" ? args.filter((a) => !WINDOWS_UNSAFE_CHROMIUM_FLAGS.has(a)) : args
}

/** Pull the worker's result/error line out of its stdout (the walker may log other lines before it). */
export function parseWorkerOutput(stdout: string): { ok: true; summary: any } | { ok: false; error: string } {
  const lines = stdout.split(/\r?\n/)
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i]
    if (l.startsWith(WALK_RESULT_MARK)) {
      try { return { ok: true, summary: JSON.parse(l.slice(WALK_RESULT_MARK.length)) } }
      catch (e: any) { return { ok: false, error: "walk worker returned unreadable JSON: " + String(e?.message || e) } }
    }
    if (l.startsWith(WALK_ERROR_MARK)) return { ok: false, error: l.slice(WALK_ERROR_MARK.length) || "walk worker failed" }
  }
  return { ok: false, error: "walk worker produced no result" }
}
