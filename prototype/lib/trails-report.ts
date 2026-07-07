// Task 2: Walk Report data gatherer + branded HTML renderer.
// Pure: no DOM dependencies, no <script> in output, all strings HTML-escaped.
import type { Trail, Walk, RunStep, Finding } from "./trails-types"

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

type ReportStep = RunStep & { screenshotUrl?: string; screenshotError?: string }

export interface WalkReportData {
  trail: Trail
  walk: Walk
  steps: ReportStep[]
  findings: Finding[]
  projectName?: string
}

// ---------------------------------------------------------------------------
// Data gatherer
// ---------------------------------------------------------------------------

export async function gatherWalkReport(
  projectId: string,
  runId: string,
  opts?: { presign?: (key: string) => string },
): Promise<WalkReportData | null> {
  const { getWalk, listRunSteps, listFindings, getTrail } = await import("./trails")

  // IDOR guard: getWalk is project-scoped
  const walk = await getWalk(projectId, runId)
  if (!walk) return null

  const trail = await getTrail(projectId, walk.trailId)
  if (!trail) return null

  const rawSteps = await listRunSteps(projectId, runId)

  const steps: ReportStep[] = await Promise.all(rawSteps.map(async (rs) => {
    const ev = rs.evidence as Record<string, unknown> | null
    const key = ev?.screenshotKey as string | undefined
    if (key) {
      const shot = await resolveReportScreenshot(key, opts)
      return { ...rs, ...shot }
    }
    return { ...rs }
  }))

  // Filter findings to this walk's runId
  const allFindings = await listFindings(projectId)
  const findings = allFindings.filter((f) => f.runId === runId)

  // Optional project name — best-effort, not critical
  let projectName: string | undefined
  try {
    const { projectById } = await import("./db")
    const proj = await projectById(projectId)
    projectName = proj?.name ?? undefined
  } catch {
    // ignore — projectName is optional
  }

  return { trail, walk, steps, findings, projectName }
}

async function resolveReportScreenshot(
  key: string,
  opts?: { presign?: (key: string) => string },
): Promise<Pick<ReportStep, "screenshotUrl" | "screenshotError">> {
  try {
    const url = opts?.presign ? opts.presign(key) : await screenshotDataUrl(key)
    if (usableScreenshotUrl(url)) return { screenshotUrl: url }
    return { screenshotError: "Screenshot could not be loaded." }
  } catch {
    return { screenshotError: "Screenshot could not be loaded." }
  }
}

async function screenshotDataUrl(key: string): Promise<string> {
  const { getObjectBytes } = await import("./s3")
  const obj = await getObjectBytes(key)
  const contentType = obj.contentType && obj.contentType.startsWith("image/") ? obj.contentType : "image/png"
  return `data:${contentType};base64,${Buffer.from(obj.bytes).toString("base64")}`
}

function usableScreenshotUrl(url: string): boolean {
  return url.startsWith("data:image/") || url.startsWith("https://")
}

// ---------------------------------------------------------------------------
// HTML escape helper — no DOM dependency
// ---------------------------------------------------------------------------

function esc(s: string | null | undefined): string {
  if (s == null) return ""
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export function renderWalkReportHtml(
  data: WalkReportData,
  opts: { baseUrl: string; generatedAt: number },
): string {
  const { trail, walk, steps, findings, projectName } = data
  const { baseUrl, generatedAt } = opts

  const base = baseUrl.replace(/\/$/, "")

  // Verdict color tokens matching trails.html tokens
  const verdictColor: Record<string, string> = {
    green: "#10b981",
    amber: "#f59e0b",
    red: "#e11d48",
    skip: "#9ca3af",
    running: "#9ca3af",
  }
  const verdictBg: Record<string, string> = {
    green: "rgba(16,185,129,.14)",
    amber: "rgba(245,158,11,.16)",
    red: "rgba(225,29,72,.14)",
    skip: "rgba(156,163,175,.12)",
    running: "rgba(156,163,175,.12)",
  }
  const wVerdict = (walk.status as string) in verdictColor ? (walk.status as string) : "skip"
  const wColor = verdictColor[wVerdict] ?? "#9ca3af"
  const wBg = verdictBg[wVerdict] ?? "rgba(156,163,175,.12)"

  // Duration
  const durationMs = walk.finishedAt != null ? walk.finishedAt - walk.startedAt : null
  const durationStr = durationMs != null ? `${(durationMs / 1000).toFixed(1)}s` : "—"

  // Heal count
  const healedCount = steps.filter((s) => s.healed).length

  // Date formatting
  const startDate = new Date(walk.startedAt).toISOString().replace("T", " ").slice(0, 19) + " UTC"
  const genDate = new Date(generatedAt).toISOString().replace("T", " ").slice(0, 19) + " UTC"

  // Klavity wordmark SVG (inline, derived from favicon.svg)
  const wordmarkSvg = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="32" height="32" style="border-radius:8px;display:inline-block;vertical-align:middle">
  <rect width="48" height="48" rx="11" fill="#1a1023"/>
  <g fill="white">
    <circle cx="15" cy="9" r="2"/>
    <circle cx="11" cy="16" r="2"/>
    <circle cx="10" cy="24" r="2"/>
    <circle cx="11" cy="32" r="2"/>
    <circle cx="15" cy="39" r="2"/>
    <circle cx="33" cy="9" r="2"/>
    <circle cx="37" cy="16" r="2"/>
    <circle cx="38" cy="24" r="2"/>
    <circle cx="37" cy="32" r="2"/>
    <circle cx="33" cy="39" r="2"/>
  </g>
  <g stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.35">
    <line x1="15" y1="9" x2="33" y2="9"/>
    <line x1="11" y1="16" x2="37" y2="16"/>
    <line x1="10" y1="24" x2="38" y2="24"/>
    <line x1="11" y1="32" x2="37" y2="32"/>
    <line x1="15" y1="39" x2="33" y2="39"/>
  </g>
</svg>`

  // Step rows
  const stepRows = steps.map((s) => {
    const ev = s.evidence as Record<string, unknown> | null
    const sVerdict = (s.verdict as string) in verdictColor ? (s.verdict as string) : "skip"
    const sColor = verdictColor[sVerdict] ?? "#9ca3af"
    const sBg = verdictBg[sVerdict] ?? "rgba(156,163,175,.12)"

    const selector = (ev?.selector ?? ev?.toSelector ?? ev?.fromSelector ?? null) as string | null
    const rationale = (ev?.rationale ?? ev?.reason ?? null) as string | null
    const checkpoint = (ev?.checkpoint ?? null) as string | null
    const fromSel = (ev?.fromSelector ?? null) as string | null
    const toSel = (ev?.toSelector ?? null) as string | null
    const imgUrl = s.screenshotUrl ?? null
    const imgError = s.screenshotError ?? null

    let healDiff = ""
    if (s.healed && fromSel && toSel) {
      healDiff = `
      <div style="margin-top:8px;background:#f8f8fb;border-radius:6px;padding:8px 10px;font-family:monospace;font-size:11px;color:#555">
        <div><span style="color:#e11d48">- ${esc(fromSel)}</span></div>
        <div><span style="color:#10b981">+ ${esc(toSel)}</span></div>
      </div>`
    }

    const screenshotHtml = imgUrl
      ? `<div style="margin-top:10px"><img src="${esc(imgUrl)}" alt="Step ${s.idx + 1} screenshot" style="max-width:100%;border-radius:6px;border:1px solid #e5e7eb" /></div>`
      : imgError
        ? `<div style="margin-top:10px;border:1px dashed #d1d5db;border-radius:6px;padding:10px 12px;background:#f9fafb;color:#6b7280;font-size:12px">${esc(imgError)}</div>`
      : ""

    const checkpointHtml = checkpoint
      ? `<div style="margin-top:6px;font-size:12px;color:#6b7280"><strong>Checkpoint:</strong> ${esc(checkpoint)}</div>`
      : ""

    const rationaleHtml = rationale
      ? `<div style="margin-top:6px;font-size:12px;color:#6b7280">${esc(rationale)}</div>`
      : ""

    return `
    <tr style="border-bottom:1px solid #f3f4f6">
      <td style="padding:12px 8px;font-family:monospace;font-size:12px;color:#9ca3af;white-space:nowrap;vertical-align:top">${s.idx + 1}</td>
      <td style="padding:12px 8px;vertical-align:top">
        <div style="font-family:monospace;font-size:12px;font-weight:600;color:#111">${esc(ev?.action as string ?? "—")}</div>
        ${selector ? `<code style="display:block;margin-top:4px;font-size:11px;color:#6366f1;background:#f0f0ff;padding:2px 5px;border-radius:4px;word-break:break-all">${esc(selector)}</code>` : ""}
        ${checkpointHtml}
        ${rationaleHtml}
        ${healDiff}
        ${screenshotHtml}
      </td>
      <td style="padding:12px 8px;white-space:nowrap;vertical-align:top">
        <span style="display:inline-block;font-family:monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:12px;background:${esc(sBg)};color:${esc(sColor)}">${esc(s.tier)}</span>
      </td>
      <td style="padding:12px 8px;white-space:nowrap;vertical-align:top">
        <span style="display:inline-block;font-family:monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:12px;background:${esc(sBg)};color:${esc(sColor)}">${esc(s.verdict)}</span>
        ${s.healed ? '<span style="margin-left:4px;font-size:10px;color:#f59e0b">(healed)</span>' : ""}
      </td>
    </tr>`
  }).join("")

  // Findings section
  const findingKindColor: Record<string, string> = {
    regression: "#e11d48",
    visual: "#6366f1",
    amber_heal: "#f59e0b",
  }
  const findingKindBg: Record<string, string> = {
    regression: "rgba(225,29,72,.1)",
    visual: "rgba(99,102,241,.1)",
    amber_heal: "rgba(245,158,11,.12)",
  }

  const findingsHtml = findings.length === 0
    ? '<p style="color:#9ca3af;font-size:14px;padding:16px 0">No findings for this walk.</p>'
    : findings.map((f) => {
        const fColor = findingKindColor[f.kind] ?? "#6b7280"
        const fBg = findingKindBg[f.kind] ?? "rgba(107,114,128,.1)"
        const quoteHtml = f.groundQuote
          ? `<blockquote style="margin:8px 0 0;border-left:3px solid #e5e7eb;padding:6px 10px;color:#6b7280;font-size:13px;line-height:1.5">${esc(f.groundQuote)}</blockquote>`
          : ""
        return `
      <div style="margin-bottom:12px;padding:14px 16px;background:#f9fafb;border-radius:10px;border:1px solid #f3f4f6">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-family:monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:12px;background:${esc(fBg)};color:${esc(fColor)}">${esc(f.kind)}</span>
          <span style="margin-left:auto;font-family:monospace;font-size:11px;color:#9ca3af">${Math.round(f.confidence * 100)}%</span>
        </div>
        <div style="font-weight:600;font-size:14.5px;line-height:1.4;color:#111">${esc(f.title)}</div>
        ${quoteHtml}
      </div>`
      }).join("")

  // Font face declarations — absolute URLs so Chromium can fetch them
  const fontFaces = `
@font-face {
  font-family: 'Fraunces';
  font-style: normal;
  font-weight: 300 900;
  font-display: swap;
  src: url('${base}/fonts/fraunces-300-900-normal-latin.woff2') format('woff2');
}
@font-face {
  font-family: 'Hanken Grotesk';
  font-style: normal;
  font-weight: 300 800;
  font-display: swap;
  src: url('${base}/fonts/hanken-grotesk-300-800-normal-latin.woff2') format('woff2');
}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Walk Report: ${esc(trail.name)} | Klavity AutoSims</title>
<style>
${fontFaces}
*{margin:0;padding:0;box-sizing:border-box}
@page{margin:14mm}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
body{font-family:'Hanken Grotesk',system-ui,sans-serif;color:#111;background:#fff;line-height:1.5;font-size:14px}
h1,h2,h3{font-family:'Fraunces',Georgia,serif;letter-spacing:-.02em}
code{font-family:monospace}
.page-break{page-break-before:always}
</style>
</head>
<body>

<!-- Cover header -->
<div style="padding:24px 0 20px;border-bottom:2px solid #e5e7eb;margin-bottom:28px;display:flex;align-items:center;gap:12px">
  ${wordmarkSvg}
  <div>
    <div style="font-family:'Fraunces',Georgia,serif;font-size:20px;font-weight:600;letter-spacing:-.02em">Klavity</div>
    <div style="font-size:11px;color:#9ca3af;font-family:monospace;letter-spacing:.04em;text-transform:uppercase">AutoSims Walk Report</div>
  </div>
</div>

<!-- Trail name + verdict banner -->
<div style="margin-bottom:24px">
  <h1 style="font-size:28px;font-weight:500;line-height:1.2;margin-bottom:8px">${esc(trail.name)}</h1>
  <div style="display:inline-block;padding:8px 20px;border-radius:10px;background:${esc(wBg)};color:${esc(wColor)};font-family:monospace;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${esc(walk.status)}</div>
</div>

<!-- Objective blockquote -->
<blockquote style="margin-bottom:24px;border-left:3px solid #6366f1;padding:10px 16px;background:#f5f5ff;border-radius:0 8px 8px 0;color:#374151;font-size:14px;font-style:italic">
  <strong>Objective:</strong> ${esc(trail.intent)}
</blockquote>

<!-- Meta row -->
<table style="width:100%;margin-bottom:28px;border-collapse:collapse;font-size:13px;color:#374151">
  <tr>
    ${projectName ? `<td style="padding:6px 16px 6px 0"><span style="color:#9ca3af;font-family:monospace;font-size:11px;text-transform:uppercase;display:block;margin-bottom:2px">Project</span>${esc(projectName)}</td>` : ""}
    <td style="padding:6px 16px 6px 0"><span style="color:#9ca3af;font-family:monospace;font-size:11px;text-transform:uppercase;display:block;margin-bottom:2px">Walk ID</span><span style="font-family:monospace;font-size:12px">${esc(walk.id)}</span></td>
    <td style="padding:6px 16px 6px 0"><span style="color:#9ca3af;font-family:monospace;font-size:11px;text-transform:uppercase;display:block;margin-bottom:2px">Started</span>${esc(startDate)}</td>
    <td style="padding:6px 16px 6px 0"><span style="color:#9ca3af;font-family:monospace;font-size:11px;text-transform:uppercase;display:block;margin-bottom:2px">Duration</span>${esc(durationStr)}</td>
    <td style="padding:6px 16px 6px 0"><span style="color:#9ca3af;font-family:monospace;font-size:11px;text-transform:uppercase;display:block;margin-bottom:2px">LLM Calls</span>${walk.llmCalls}</td>
    <td style="padding:6px 16px 6px 0"><span style="color:#9ca3af;font-family:monospace;font-size:11px;text-transform:uppercase;display:block;margin-bottom:2px">Healed</span>${healedCount}</td>
  </tr>
</table>

<!-- Step timeline -->
<h2 style="font-size:18px;font-weight:500;margin-bottom:14px;color:#111">Steps</h2>
<table style="width:100%;border-collapse:collapse;margin-bottom:32px">
  <thead>
    <tr style="border-bottom:2px solid #e5e7eb;background:#f9fafb">
      <th style="text-align:left;padding:8px 8px;font-family:monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;font-weight:600">#</th>
      <th style="text-align:left;padding:8px 8px;font-family:monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;font-weight:600">Action / Detail</th>
      <th style="text-align:left;padding:8px 8px;font-family:monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;font-weight:600">Tier</th>
      <th style="text-align:left;padding:8px 8px;font-family:monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;font-weight:600">Verdict</th>
    </tr>
  </thead>
  <tbody>
    ${stepRows || '<tr><td colspan="4" style="padding:16px;color:#9ca3af;text-align:center">No steps recorded.</td></tr>'}
  </tbody>
</table>

<!-- Findings -->
<h2 style="font-size:18px;font-weight:500;margin-bottom:14px;color:#111">Findings</h2>
<div style="margin-bottom:32px">
  ${findingsHtml}
</div>

<!-- Footer -->
<div style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#9ca3af;font-family:monospace">
  <span>Generated by Klavity AutoSims &middot; <a href="https://klavity.in" style="color:#6366f1;text-decoration:none">klavity.in</a></span>
  <span>Generated at ${esc(genDate)} &middot; ${esc(base)}</span>
</div>

</body>
</html>`
}
