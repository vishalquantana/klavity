// Plan E2 — rrweb Walk replay: storage + opt-in capture.
//
// STORAGE HALF: a Walk's session replay is stored as an array of per-page ReplaySegments
// (one rrweb recording per document the Walk navigated through). The whole array is
// JSON.stringify'd, gzipped (Bun.gzipSync), and base64'd into walk_replays.segments_gz.
// Project-scoped on every read. Storage-efficient (gzip ~20-100x smaller than video).
//
// CAPTURE HALF: setupReplayCapture(context) injects the rrweb recorder into every page via
// context.addInitScript (re-runs on each fresh document) and collects events through an
// exposed binding. The runner flushes a segment at each navigation boundary (URL change) and
// once at the end. Capture is OPT-IN (WalkOptions.replay) and best-effort/try-caught: a
// recorder failure yields no replay but NEVER fails or slows a Walk.
import { db } from "./db"
import type { BrowserContext, Page } from "playwright"
import { readFileSync, existsSync } from "node:fs"
import { dirname, join as joinPath } from "node:path"
import { createRequire } from "node:module"

export interface ReplaySegment {
  /** The run_step idx at which this page began (segment boundary tag). */
  idx: number
  url: string
  events: unknown[]
  truncated?: boolean
}

function positiveInt(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

export function trimReplayEventBuffer(events: unknown[], cap: number): { events: unknown[]; truncated: boolean } {
  const effectiveCap = Math.max(0, Math.floor(cap))
  if (events.length <= effectiveCap) return { events, truncated: false }

  const snapshot = events.find((e: any) => e && e.type === 2)
  const newestCount = snapshot ? Math.max(0, effectiveCap - 1) : effectiveCap
  const sliced = newestCount > 0 ? events.slice(events.length - newestCount) : []
  if (snapshot && !sliced.some((e: any) => e && e.type === 2)) {
    return { events: [snapshot, ...sliced], truncated: true }
  }
  return { events: sliced, truncated: true }
}

// ── storage ───────────────────────────────────────────────────────────────────────
export async function saveReplay(projectId: string, runId: string, segments: ReplaySegment[], resolvedCreds?: Set<string>): Promise<void> {
  let json = JSON.stringify(segments)
  if (resolvedCreds && resolvedCreds.size > 0) {
    for (const cred of resolvedCreds) {
      if (cred && cred.trim().length > 0) {
        const escapedCred = cred.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        json = json.replace(new RegExp(escapedCred, "g"), "[REDACTED]")
        const jsonEscaped = JSON.stringify(cred).slice(1, -1)
        if (jsonEscaped !== cred) {
          const escapedJsonCred = jsonEscaped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          json = json.replace(new RegExp(escapedJsonCred, "g"), "[REDACTED]")
        }
      }
    }
  }
  const gz = Buffer.from(Bun.gzipSync(Buffer.from(json))).toString("base64")
  const nEvents = segments.reduce((n, s) => n + (s.events?.length || 0), 0)
  await db!.execute({
    sql: `INSERT INTO walk_replays (id, run_id, project_id, segments_gz, n_segments, n_events, created_at) VALUES (?,?,?,?,?,?,?)`,
    args: ["rep_" + crypto.randomUUID(), runId, projectId, gz, segments.length, nEvents, Date.now()],
  })
}

export async function getReplay(projectId: string, runId: string): Promise<ReplaySegment[] | null> {
  const r = await db!.execute({
    sql: `SELECT segments_gz FROM walk_replays WHERE project_id=? AND run_id=? ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, runId],
  })
  if (!r.rows.length) return null
  const gz = Buffer.from(String((r.rows[0] as any).segments_gz), "base64")
  return JSON.parse(Buffer.from(Bun.gunzipSync(gz)).toString()) as ReplaySegment[]
}

/**
 * Which of the given runIds have a saved replay — project-scoped, one query. Lets the dashboard show
 * a "▶ Replay" affordance only on Walks that actually have a recording (no per-row 404 probing).
 */
export async function runsWithReplay(projectId: string, runIds: string[]): Promise<Set<string>> {
  const out = new Set<string>()
  if (!runIds.length) return out
  const placeholders = runIds.map(() => "?").join(",")
  const r = await db!.execute({
    sql: `SELECT DISTINCT run_id FROM walk_replays WHERE project_id=? AND run_id IN (${placeholders})`,
    args: [projectId, ...runIds],
  })
  for (const row of r.rows) out.add(String((row as any).run_id))
  return out
}

// ── capture ───────────────────────────────────────────────────────────────────────
// The rrweb recorder bundle, resolved from node_modules and inlined into an init script so it
// runs in EVERY document (including the file:// fixtures, no network). Loaded lazily + cached.
let rrwebSource: string | null = null
function loadRrwebSource(): string {
  if (rrwebSource != null) return rrwebSource
  const require = createRequire(import.meta.url)
  // rrweb ships a UMD bundle that defines window.rrweb (record/Replayer). Its package.json `exports`
  // blocks direct subpath resolution of the UMD file, so resolve the main entry (dist/rrweb.cjs),
  // take its dist dir, and prefer the minified UMD bundle inside it.
  const main = require.resolve("rrweb") // → .../rrweb/dist/rrweb.cjs
  const dist = dirname(main)
  const candidates = ["rrweb.umd.min.cjs", "rrweb.umd.cjs", "rrweb.js"]
  let path = main
  for (const c of candidates) {
    const p = joinPath(dist, c)
    if (existsSync(p)) { path = p; break }
  }
  rrwebSource = readFileSync(path, "utf8")
  return rrwebSource
}

export interface ReplayCapture {
  /**
   * Pull the live page's in-page rrweb buffer into the current segment's accumulator WITHOUT sealing.
   * Called by the runner at the top of each step so the document currently shown has its
   * snapshot/interactions captured into `current` BEFORE a step navigates away (correct per-page
   * attribution; the 250ms in-page timer is a backstop, not the primary path).
   */
  drain: (page: Page) => Promise<void>
  /**
   * Seal the accumulated events for the page just left into a segment, then start fresh.
   * `final=true` means `page` still shows this segment's document (the last page of the Walk): poll
   * the live page briefly so its async full-snapshot is captured even after a fast final assert.
   */
  flush: (idx: number, url: string, page: Page, final?: boolean) => Promise<void>
  /** Current process-side rrweb event count, exposed so watchdog/tests can verify bounded memory. */
  bufferedEventCount: () => number
  segments: ReplaySegment[]
}

/**
 * Wire rrweb capture into a BrowserContext. exposeBinding gives the page a function to push BATCHES
 * of recorded events back to the runner; addInitScript injects the recorder + a call to rrweb.record
 * on every fresh document (so a full-page navigation transparently starts a new recording).
 *
 * IMPORTANT (deadlock avoidance): rrweb's `emit` is NOT wired directly to the binding. During the
 * initial full-DOM snapshot rrweb emits synchronously while the document is still loading; calling
 * an exposeBinding (a CDP round-trip) inside that synchronous burst can stall page load. Instead the
 * recorder pushes events into an in-page buffer and a timer drains the buffer to the binding in
 * batches — fully decoupled from the snapshot. The runner's flush(idx,url,page) forces a final drain
 * (page.evaluate) so no tail events are lost before a navigation, then seals the page as a segment.
 */
export async function setupReplayCapture(context: BrowserContext): Promise<ReplayCapture> {
  const maxEvents = positiveInt(process.env.KLAV_REPLAY_MAX_EVENTS, 5000)
  const maxTotalEvents = positiveInt(process.env.KLAV_REPLAY_MAX_TOTAL_EVENTS, 15000)

  let current: unknown[] = []
  let currentTruncated = false
  const segments: ReplaySegment[] = []

  const applyCapping = () => {
    const totalSoFar = segments.reduce((sum, s) => sum + s.events.length, 0)
    const remainingWalkCap = Math.max(0, maxTotalEvents - totalSoFar)
    const effectiveCap = Math.min(maxEvents, remainingWalkCap)

    const capped = trimReplayEventBuffer(current, effectiveCap)
    current = capped.events
    currentTruncated = currentTruncated || capped.truncated
  }

  // The page calls this with a BATCH of rrweb events. _src is the binding source (unused).
  await context.exposeBinding("__klavReplayPush", (_src, batch: unknown) => {
    const payload = batch as any
    if (payload && payload.truncated) currentTruncated = true
    const rawEvents = payload && Array.isArray(payload.events) ? payload.events : batch
    const list = Array.isArray(rawEvents) ? rawEvents : (rawEvents != null ? [rawEvents] : [])
    for (const ev of list) {
      current.push(ev)
      applyCapping()
    }
  })

  const rrweb = loadRrwebSource()
  // Inject the recorder bundle, then start recording. Re-runs per document → per-page recording.
  // Best-effort: any error inside the page must not break navigation/interaction.
  await context.addInitScript({
    content:
      rrweb +
      `;(function(){try{
        if (window.__klavRrwebStarted) return; window.__klavRrwebStarted = true;
        var rec = (window.rrweb && window.rrweb.record) ? window.rrweb.record : (typeof rrwebRecord!=='undefined'?rrwebRecord:null);
        if (!rec) return;
        // In-page buffer: emit just appends (cheap, synchronous-safe). A timer drains batches to the
        // binding off the snapshot path. __klavDrain() forces an immediate drain (used at flush).
        window.__klavBuf = [];
        window.__klavMaxBufferedEvents = ${JSON.stringify(maxEvents)};
        window.__klavBufTruncated = false;
        window.__klavCapBuf = function(){
          var cap = window.__klavMaxBufferedEvents || 5000;
          if (!window.__klavBuf || window.__klavBuf.length <= cap) return;
          window.__klavBufTruncated = true;
          var snapshot = null;
          for (var i = 0; i < window.__klavBuf.length; i++) {
            var candidate = window.__klavBuf[i];
            if (candidate && candidate.type === 2) { snapshot = candidate; break; }
          }
          var newestCount = snapshot ? Math.max(0, cap - 1) : cap;
          var sliced = newestCount > 0 ? window.__klavBuf.slice(window.__klavBuf.length - newestCount) : [];
          var hasSnapshot = false;
          if (snapshot) {
            for (var j = 0; j < sliced.length; j++) {
              if (sliced[j] && sliced[j].type === 2) { hasSnapshot = true; break; }
            }
          }
          window.__klavBuf = snapshot && !hasSnapshot ? [snapshot].concat(sliced) : sliced;
        };
        window.__klavDrain = function(){
          if (!window.__klavBuf.length) return;
          var batch = window.__klavBuf; window.__klavBuf = [];
          var truncated = !!window.__klavBufTruncated; window.__klavBufTruncated = false;
          try { window.__klavReplayPush({ events: batch, truncated: truncated }); } catch(e) {}
        };
        function startRec(){
          // Skip the implicit about:blank Playwright opens before the first goto — recording it
          // deadlocks page creation and yields no useful frames. Only record real documents.
          try { if (!location || location.href === 'about:blank' || !document.body) return; } catch(e){ return; }
          if (window.__klavRecording) return; window.__klavRecording = true;
          rec({
            maskAllInputs: true,
            maskInputOptions: {
              password: true,
              email: true,
              text: true,
              color: true,
              date: true,
              'datetime-local': true,
              number: true,
              range: true,
              search: true,
              tel: true,
              time: true,
              url: true,
              week: true,
              textarea: true,
              select: true
            },
            maskInputFn: function(text, element) {
              return '*'.repeat((text || '').length);
            },
            emit: function(ev){ try{ window.__klavBuf.push(ev); window.__klavCapBuf(); }catch(e){} }
          });
          setInterval(function(){ try{ window.__klavDrain(); }catch(e){} }, 250);
        }
        // Defer to a real document: run on DOMContentLoaded (and immediately if already loaded).
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', startRec, { once: true });
        } else {
          startRec();
        }
      }catch(e){}})();`,
  })

  return {
    segments,
    bufferedEventCount() {
      return current.length
    },
    async drain(page: Page) {
      // Force the live page to flush its buffer to the binding (→ `current`). Best-effort.
      try { await page.evaluate("window.__klavDrain && window.__klavDrain()") } catch {}
    },
    async flush(idx: number, url: string, page: Page, final?: boolean) {
      if (final) {
        // The page still shows THIS document. Its rrweb full snapshot is emitted asynchronously after
        // DOMContentLoaded, so poll (bounded ~600ms) until at least one event has buffered, draining
        // each iteration. Reliably captures a just-loaded final page whose only interaction was a fast
        // assert. Immediate when events are already present.
        for (let i = 0; i < 12 && current.length === 0; i++) {
          try { await page.evaluate("window.__klavDrain && window.__klavDrain()") } catch { break }
          if (current.length > 0) break
          try { await page.waitForTimeout(50) } catch { break }
        }
      }
      // For a navigation-boundary flush we do NOT touch `page` (it holds the next document now); the
      // 250ms timer already drained this page's events into `current`. Seal and reset.
      applyCapping()
      if (current.length === 0) return
      segments.push({
        idx,
        url,
        events: current,
        ...(currentTruncated ? { truncated: true } : {})
      })
      current = []
      currentTruncated = false
    },
  }
}
