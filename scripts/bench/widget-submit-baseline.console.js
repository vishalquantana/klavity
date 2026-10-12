// Widget-submit measurement (browser console). Run it on a SIGNED-IN dashboard tab of the environment being measured
// (e.g. https://dev.klavity.in/dashboard). It starts the run and returns immediately ("started"); read the result later with
//     window.__bench          (status: "running" → "done", per-phase rows, summary, created ticket ids)
// The whole run takes about 1–2 minutes and CREATES TEST TICKETS (listed in __bench.tickets — it never deletes anything).
//
// WHAT IT MEASURES (the same fixed inputs every time, so before/after runs are comparable):
//   A. BASELINE — N submits (default 3) of: synthetic 3840x2100 capture → JPEG ≤2000px + 320px thumb, a 200KB PDF, a ~690KB replay ONLY when window.__BENCH_WITH_REPLAY = true (the widget sends none any more; default off).
//        per run: browser prep | wire KB | upload (upload start → upload done) | server wait (upload done → response headers) | total,
//        plus the server's own Server-Timing phases when the build sends them.
//   B. MERGED REPORT — the same text filed twice: the 2nd report (with a PDF) must merge into the 1st ticket, be flagged deduped, attach
//        the PDF to that ticket exactly once, and a re-send of it must be a replay (not counted / attached again).
//   C. LOST RESPONSE — the reply to a submit is dropped on the client AFTER the server answered; the widget's own retry must re-send with the
//        same key and get the SAME ticket back (replayed), leaving exactly one ticket. (Uses the deployed /widget.js exports; skipped on a
//        build that predates them.)
//
// SETTINGS (set before running):  window.__BENCH_PROJECT_ID (default: Klavity Dogfood on dev)   window.__BENCH_RUNS (default 3)
//                                 window.__BENCH_WITH_REPLAY = true  (re-create the OLD request that carried a ~690KB replay; default false = what the widget sends now)
//                                 window.__BENCH_GZIP_REPLAY = true  (with __BENCH_WITH_REPLAY: send that replay gzipped, like the previous build)
//                                 window.__BENCH_WITH_KEY = false    (omit submission_key, e.g. to measure a build without idempotency)
(() => {
  const DOGFOOD_DEV = "proj_d5b1302c-a336-49ce-a38d-933da10b860d"
  const PID = window.__BENCH_PROJECT_ID || DOGFOOD_DEV, RUNS = Number(window.__BENCH_RUNS || 3)
  const WITH_KEY = window.__BENCH_WITH_KEY !== false, REPLAY = window.__BENCH_WITH_REPLAY === true, GZ = window.__BENCH_GZIP_REPLAY === true
  const B = (window.__bench = { status: "running", startedAt: new Date().toISOString(), origin: location.origin, project: PID, withKey: WITH_KEY, withReplay: REPLAY, gzipReplay: GZ, baseline: [], merge: null, lostResponse: null, tickets: [], errors: [], summary: null })
  const ms = () => performance.now(), sleep = (t) => new Promise((r) => setTimeout(r, t)), med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null }
  const rnd = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  const note = (t) => B.tickets.push(t)

  // ── fixed inputs ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const mkCapture = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#f4f4f6"); g.addColorStop(1, "#dfe6f5"); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = "#222"; for (let i = 0; i < 2600; i++) { x.font = (14 + (i % 5) * 2) * 2 + "px sans-serif"; x.fillText("Row " + i + " lorem ipsum dolor sit amet " + (i * 7919 % 1000), (i * 131) % (w - 600), 40 + (i * 53) % (h - 60)) } return c.toDataURL("image/png") }
  const fill = (n, seed) => { const a = new Uint8Array(n); let x = seed; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; a[i] = x >> 16 } return a }
  const node = (i) => ({ type: 2, tagName: "div", attributes: { class: "row-" + (i % 9), style: "display:flex;padding:8px" }, childNodes: [{ type: 3, textContent: "Item number " + i + " lorem ipsum dolor sit amet" }], id: 1000 + i })
  const loadImg = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u })
  const toJpeg = async (u, maxW, q) => { const img = await loadImg(u); const s = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1; const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s); const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h); return c.toDataURL("image/jpeg", q) }
  const d2b = (d) => { const [h, b] = d.split(","); const bin = atob(b); const by = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new Blob([by], { type: h.match(/data:([^;]+)/)[1] }) }
  const reportOf = async (id) => { const j = await (await fetch("/api/feedback/" + encodeURIComponent(id), { cache: "no-store" })).json().catch(() => ({})); return j.report || null }
  const dashTickets = async () => { const d = await (await fetch("/api/dashboard?project=" + PID, { cache: "no-store" })).json(); return Array.isArray(d.tickets) ? d.tickets : [] }
  const timingOf = (url) => { const pe = performance.getEntriesByType("resource").filter((e) => e.name.endsWith(url)).pop(); const o = {}; ((pe && pe.serverTiming) || []).forEach((p) => { o["p_" + p.name] = Math.round(p.duration) }); return o }

  // one multipart POST with the upload / server-wait split
  const post = (fd) => new Promise((resolve) => {
    const x = new XMLHttpRequest(), T = { start: ms() }
    x.upload.onloadstart = () => { T.upStart = ms() }; x.upload.onload = () => { T.upDone = ms() }
    x.onreadystatechange = () => { if (x.readyState === 2) T.headers = ms() }
    x.onload = () => { T.done = ms(); T.status = x.status; try { T.json = JSON.parse(x.responseText) } catch { T.json = {} } T.replay = x.getResponseHeader("idempotent-replay") === "true"; resolve(T) }
    x.onerror = () => { T.err = 1; resolve(T) }
    x.open("POST", "/api/feedback"); x.send(fd)
  })

  ;(async () => {
    try {
      const CAPTURE = mkCapture(3840, 2100), PDF = fill(200000, 3)
      const EVENTS = [{ type: 4, timestamp: 1, data: { href: location.href, width: 1280, height: 800 } }, { type: 2, timestamp: 2, data: { node: { type: 0, childNodes: Array.from({ length: 1500 }, (_, i) => node(i)) }, initialOffset: { top: 0, left: 0 } } }]
      for (let i = 0; i < 4000; i++) EVENTS.push({ type: 3, timestamp: 3 + i, data: { source: i % 2 ? 1 : 0, positions: [{ x: i % 1280, y: (i * 7) % 800, id: 1000 + (i % 1500), timeOffset: -(i % 50) }] } })

      // ── A. baseline ───────────────────────────────────────────────────────────────────────────────────────────────────────────
      for (let run = 1; run <= RUNS; run++) {
        const t0 = ms(); const shot = await toJpeg(CAPTURE, 2000, 0.82); const t1 = ms(); const thumb = await toJpeg(shot, 320, 0.6); const t2 = ms()
        const fd = new FormData(); fd.set("type", "bug"); fd.set("description", "[perf baseline - safe to delete] run " + run + " " + rnd()); fd.set("page_url", location.href); fd.set("project_id", PID)
        fd.set("context", JSON.stringify({ pageUrl: location.href, userAgent: navigator.userAgent, consoleErrors: [], networkFailures: [] }))
        if (WITH_KEY) fd.set("submission_key", crypto.randomUUID())
        if (REPLAY) {   // legacy comparison only: the widget no longer records or sends a replay
          const replayJson = JSON.stringify(EVENTS)
          if (GZ && typeof CompressionStream === "function") fd.set("replay_events_gz", await new Response(new Blob([replayJson]).stream().pipeThrough(new CompressionStream("gzip"))).blob(), "replay.json.gz"); else fd.set("replay_events", replayJson)
        }
        const t3 = ms()
        fd.append("screenshots", d2b(shot), "screenshot.png"); fd.append("screenshot_thumbs", d2b(thumb), "thumb.jpg"); fd.append("files", new File([PDF], "perf-doc.pdf", { type: "application/pdf" })); const t4 = ms()
        const wire = (await new Response(fd).blob()).size
        const T = await post(fd); await sleep(300)
        const row = { run, status: T.status, id: T.json && T.json.id, prep_ms: Math.round(t4 - t0), prep_split: { compress: Math.round(t1 - t0), thumb: Math.round(t2 - t1), replay: Math.round(t3 - t2), blobs_form: Math.round(t4 - t3) }, wire_kb: Math.round(wire / 1024), upload_ms: Math.round(T.upDone - T.upStart), server_wait_ms: Math.round(T.headers - T.upDone), total_ms: Math.round(T.done - T.start), serverTiming: timingOf("/api/feedback") }
        B.baseline.push(row); if (row.id) note({ id: row.id, kind: "baseline run " + run }); await sleep(1500)
      }

      // ── B. merged report keeps its evidence ────────────────────────────────────────────────────────────────────────────────────
      const text = "[perf bench merge - safe to delete] checkout button does nothing on the cart page " + rnd()
      const mk = (key, withPdf) => { const fd = new FormData(); fd.set("type", "bug"); fd.set("description", text); fd.set("page_url", location.href); fd.set("project_id", PID); if (WITH_KEY) fd.set("submission_key", key); if (withPdf) fd.append("files", new File([PDF], "merge-evidence.pdf", { type: "application/pdf" })); return fd }
      const k1 = crypto.randomUUID(), k2 = crypto.randomUUID()
      const m1 = await post(mk(k1, false)); await sleep(1200)
      const fd2 = mk(k2, true), m2 = await post(fd2); await sleep(1200)
      const m3 = WITH_KEY ? await post(mk(k2, true)) : null          // re-send of the merged report (a retry)
      await sleep(800)
      const tk = m1.json && m1.json.id ? await reportOf(m1.json.id) : null      // GET /api/feedback/:id → { report } (the dashboard LIST does not carry attachments)
      const att = tk ? (tk.attachments || []).map((a) => a.filename) : null
      B.merge = {
        firstId: m1.json && m1.json.id, secondId: m2.json && m2.json.id, secondDeduped: !!(m2.json && m2.json.deduped), mergedIntoFirst: !!(m1.json && m2.json && m1.json.id === m2.json.id),
        attachedToMergedTicket: att, pdfAttachedOnce: att ? att.filter((n) => n === "merge-evidence.pdf").length === 1 : null,
        recurrenceReported: tk ? (tk.recurrenceCount ?? null) : null,
        resend: m3 ? { id: m3.json && m3.json.id, replayed: m3.replay || !!(m3.json && m3.json.replayed), sameTicket: !!(m3.json && m3.json.id === m1.json.id) } : null,
        secondTotalMs: Math.round(m2.done - m2.start),
      }
      if (B.merge.resend && m1.json && m1.json.id) { const after = await reportOf(m1.json.id); B.merge.afterResend = after ? { attachments: (after.attachments || []).map((a) => a.filename), recurrenceCount: after.recurrenceCount ?? null } : null }   // a replay must not attach / count again
      for (const [k, r] of [["merge first", m1], ["merge second", m2]]) if (r.json && r.json.id) note({ id: r.json.id, kind: k })

      // ── C. lost response → the widget's own retry returns the SAME ticket ──────────────────────────────────────────────────────
      let W = window.KlavityWidget
      if (!W || !W.prepareSubmission) { try { await new Promise((res, rej) => { const s = document.createElement("script"); s.src = "/widget.js?" + Date.now(); s.onload = res; s.onerror = () => rej(new Error("widget.js failed to load")); document.head.appendChild(s) }); W = window.KlavityWidget } catch (e) { B.errors.push(String(e)) } }
      if (!W || typeof W.prepareSubmission !== "function" || typeof W.sendPrepared !== "function") {
        B.lostResponse = { skipped: "the deployed /widget.js predates prepareSubmission/sendPrepared (deploy the new build first)" }
      } else {
        const tok = rnd(), ltext = "[perf bench lost response - safe to delete] " + tok, cfg = { backendUrl: location.origin, projectId: PID, firstParty: true, token: "" }
        const prep = await W.prepareSubmission(cfg, { type: "bug", description: ltext, pageUrl: location.href, screenshots: [CAPTURE.length ? await toJpeg(CAPTURE, 1200, 0.8) : ""] })
        const orig = XMLHttpRequest.prototype.send; let sends = 0; const keys = [], infos = []
        XMLHttpRequest.prototype.send = function (body) { sends++; try { keys.push(body.get("submission_key")) } catch { /* not our form */ }
          if (sends === 1) { const me = this; me.onload = function () { me.onerror && me.onerror() } }   // the reply arrives but the browser treats it as a dropped connection
          return orig.call(this, body) }
        const t = ms(); let out = null, err = null
        try { out = await W.sendPrepared(prep, { backendUrl: location.origin, firstParty: true, token: "" }, { onProgress: () => {}, autoRetry: true, onRetry: (i) => infos.push({ attempt: i.attempt, pending: !!i.pending, delayMs: i.delayMs }) }) } catch (e) { err = String((e && e.userMessage) || e) }
        XMLHttpRequest.prototype.send = orig
        await sleep(800)
        const same = (await dashTickets()).filter((x) => (x.observation || "").includes(tok))   // exactly the report we sent (matched by its unique token)
        B.lostResponse = { attempts: sends, sameKeyEveryAttempt: new Set(keys).size === 1, retryInfo: infos, outcome: out && { id: out.id, replayed: out.replayed, missing: out.missing }, error: err, ticketsMatchingThisReport: same.length, recoveredMs: Math.round(ms() - t) }
        if (out && out.id) note({ id: out.id, kind: "lost response" })
      }

      // ── summary ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
      const cols = (k) => B.baseline.map((r) => r[k]).filter((v) => typeof v === "number" && !Number.isNaN(v))
      B.summary = { runs: B.baseline.length, median: { prep_ms: med(cols("prep_ms")), wire_kb: med(cols("wire_kb")), upload_ms: med(cols("upload_ms")), server_wait_ms: med(cols("server_wait_ms")), total_ms: med(cols("total_ms")) } }
      B.status = "done"; B.finishedAt = new Date().toISOString()
      console.table(B.baseline.map((r) => ({ run: r.run, status: r.status, prep: r.prep_ms, wire_kb: r.wire_kb, upload: r.upload_ms, server_wait: r.server_wait_ms, total: r.total_ms })))
      console.log("merge:", B.merge, "\nlost response:", B.lostResponse, "\nsummary:", B.summary, "\ntest tickets (delete manually when reviewed):", B.tickets)
    } catch (e) { B.errors.push(String((e && e.stack) || e)); B.status = "failed" }
  })()
  return "started — read window.__bench in ~1–2 minutes"
})()
