// Bench-only Bun preload: makes the LOCAL libsql database behave like a REMOTE one by adding a fixed round-trip delay to every
// execute() / batch() (each call = one network round trip to a remote Turso) and logging every call, so a local run can be compared
// with dev, where one database round trip costs ~275 ms. NEVER used by the app itself — only by bench-widget-submit-local.ts:
//   bun --preload scripts/bench/libsql-latency.preload.ts server.ts      (env: BENCH_DB_LATENCY_MS, BENCH_DB_LOG)
import { plugin } from "bun"
import { appendFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const real: any = await import(pathToFileURL(Bun.resolveSync("@libsql/client", process.cwd())).href)
;(globalThis as any).__REAL_LIBSQL = real
const DELAY = Number(process.env.BENCH_DB_LATENCY_MS || 0)
const LOG = process.env.BENCH_DB_LOG || ""
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const note = (kind: string, what: string) => { if (LOG) { try { appendFileSync(LOG, `${Date.now()}\t${kind}\t${what.replace(/\s+/g, " ").slice(0, 90)}\n`) } catch { /* ignore */ } } }

;(globalThis as any).__BENCH_WRAP = (client: any) => {
  const exec = client.execute.bind(client), batch = client.batch.bind(client)
  client.execute = async (stmt: any, ...rest: any[]) => { note("exec", typeof stmt === "string" ? stmt : String(stmt?.sql || "")); if (DELAY) await sleep(DELAY); return exec(stmt, ...rest) }
  client.batch = async (stmts: any[], ...rest: any[]) => { note("batch", `${stmts.length} stmts: ` + String((stmts[0] as any)?.sql || stmts[0] || "")); if (DELAY) await sleep(DELAY); return batch(stmts, ...rest) }
  return client
}

// Bun's virtual-module hook replaces the package for every importer in the process (the app's ~190 files all import it).
plugin({
  name: "bench-libsql-latency",
  setup(build) {
    build.module("@libsql/client", () => ({
      exports: { createClient: (cfg: any) => (globalThis as any).__BENCH_WRAP(real.createClient(cfg)), default: real.default },
      loader: "object",
    }))
  },
})
