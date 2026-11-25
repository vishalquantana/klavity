// KD-2878: what the server returns when a request throws something no route caught (e.g. the connection to the
// database dropped mid-request: "The socket connection was closed unexpectedly"). Without this, Bun answered with
// its raw development error page ("1 error on this page" + the internal message) and the app page stayed blank.
//  - a browser page load (Accept: text/html) → a small branded "temporary problem" page that retries itself
//  - anything else (API / fetch / widget)    → 503 JSON { error, id } like every other server error
// The internal error text is never shown to the user; `id` ties the response to the server log line.

const RETRY_AFTER_SEC = 3

export function wantsHtml(req: Request | null | undefined): boolean {
  if (!req) return false
  if (req.method !== "GET" && req.method !== "HEAD") return false
  const accept = req.headers.get("accept") || ""
  return accept.includes("text/html")
}

export function unhandledErrorResponse(req: Request | null | undefined, id: string): Response {
  if (wantsHtml(req)) {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="${RETRY_AFTER_SEC}"><title>Klavity — one moment</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;background:#f5f3ee;color:#19140f}
.c{max-width:420px;padding:28px 30px;background:#fff;border:1px solid #e7e2d8;border-radius:14px;text-align:center}
h1{font-size:18px;margin:0 0 6px}p{margin:0 0 14px;color:#574f45}a{color:#6366f1;font-weight:600}small{color:#9a9184}</style></head>
<body><div class="c"><h1>We hit a temporary connection problem</h1><p>This page will reload in a few seconds.</p>
<p><a href="">Reload now</a></p><small>Reference: ${id.replace(/[^a-zA-Z0-9-]/g, "")}</small></div></body></html>`
    return new Response(html, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "retry-after": String(RETRY_AFTER_SEC), "cache-control": "no-store" } })
  }
  return new Response(JSON.stringify({ error: "Temporary connection problem. Please try again.", id }), {
    status: 503, headers: { "content-type": "application/json", "retry-after": String(RETRY_AFTER_SEC), "cache-control": "no-store" },
  })
}
