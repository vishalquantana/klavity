#!/usr/bin/env bun
// klav-ci.ts — Klavity AutoSim CI runner (KLA-90).
// Triggers a Trail walk via the CI API, polls until done, exits non-zero on RED.
//
// Usage:
//   KLAV_CI_TOKEN=kci_... KLAV_CI_BASE=https://klavity.in \
//     bun run scripts/klav-ci.ts <trailId> --project <projectId>
//
// Environment variables:
//   KLAV_CI_TOKEN   (required) kci_* token issued by POST /api/ci/token
//   KLAV_CI_BASE    (optional) base URL of the Klavity server (default: https://klavity.in)
//
// Exit codes:
//   0  — walk verdict is GREEN
//   1  — walk verdict is RED or AMBER, or an error occurred

const CI_TOKEN = process.env.KLAV_CI_TOKEN || ""
const BASE = (process.env.KLAV_CI_BASE || "https://klavity.in").replace(/\/$/, "")

function usage(): never {
  console.error("Usage: KLAV_CI_TOKEN=kci_... bun run scripts/klav-ci.ts <trailId> --project <projectId>")
  process.exit(1)
}

const args = process.argv.slice(2)
const trailId = args[0]
const projectIdx = args.indexOf("--project")
const projectId = projectIdx !== -1 ? args[projectIdx + 1] : ""
if (!trailId || !projectId) usage()
if (!CI_TOKEN) { console.error("KLAV_CI_TOKEN is required"); process.exit(1) }

function authHeaders() {
  return { Authorization: `Bearer ${CI_TOKEN}`, "Content-Type": "application/json" }
}

// Trigger the walk
const triggerRes = await fetch(`${BASE}/api/ci/trails/${trailId}/trigger?project=${projectId}`, {
  method: "POST",
  headers: authHeaders(),
})
if (!triggerRes.ok) {
  const body = await triggerRes.json().catch(() => ({})) as any
  console.error(`[klav-ci] trigger failed (HTTP ${triggerRes.status}): ${body?.error ?? "unknown"}`)
  process.exit(1)
}
const { runId } = await triggerRes.json() as { runId: string }
console.log(`[klav-ci] Walk started: ${runId}`)

// Poll until finished
const POLL_MS = 5_000
const TIMEOUT_MS = 5 * 60_000
const deadline = Date.now() + TIMEOUT_MS

while (Date.now() < deadline) {
  await Bun.sleep(POLL_MS)
  const pollRes = await fetch(`${BASE}/api/ci/runs/${runId}?project=${projectId}`, {
    headers: authHeaders(),
  })
  if (!pollRes.ok) {
    console.error(`[klav-ci] poll failed (HTTP ${pollRes.status})`)
    process.exit(1)
  }
  const walk = await pollRes.json() as { runId: string; status: string; finishedAt: number | null }
  if (walk.status === "running") {
    process.stdout.write(".")
    continue
  }
  console.log(`\n[klav-ci] ${walk.status.toUpperCase()} — run ${walk.runId}`)
  process.exit(walk.status === "green" ? 0 : 1)
}

console.error(`\n[klav-ci] timed out after ${TIMEOUT_MS / 1000}s`)
process.exit(1)
