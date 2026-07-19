# Legacy domain retirement — klavity.quantana.top

`klavity.in` is the canonical domain. `klavity.quantana.top` is the legacy host, still resolving to
the same box.

## Current behaviour (KLAVITYKLA-318)

Implemented in `prototype/server.ts` (search `LEGACY_HOST`):

| Request on `klavity.quantana.top` | Behaviour |
| --- | --- |
| `/api/*` | **Served in place**, with the same reflected-Origin CORS as `klavity.in` (`withWidgetCors`). Each hit is counted per path and logged (`[legacy-domain] ...`) on the 1st and every 100th hit. |
| `/widget.js` | Served in place (unchanged — widgets embed the absolute URL). |
| everything else | `301` → `https://klavity.in<path><query>` (SEO). |

### Why `/api/*` is not redirected

A cross-origin `fetch` that gets a `301` loses the `Access-Control-Allow-Origin` header on the
followed request, so the browser blocks the response and the caller sees only the opaque
*"No 'Access-Control-Allow-Origin' header is present"* error. Any extension or widget whose cached
backend still points at the legacy host would hard-fail with no diagnosable cause. Observed live on
a customer site (`vchar.quantana.top`) on 2026-07-13 via `/api/extension/match`.

Regression guard: `prototype/server.legacy-domain-api-cors.test.ts`.

## Retirement timeline

1. **Now → legacy `/api/*` hits reach ~0.** Watch the `[legacy-domain]` warnings in the service log:
   `journalctl -u klav -o cat | grep '\[legacy-domain\]'`.
2. **Gate:** a full 7 consecutive days with zero legacy `/api/*` hits.
3. **Hard cut:** replace the pass-through with a `410 Gone` + JSON body
   (`{ error: "klavity.quantana.top is retired; use https://klavity.in" }`) carrying CORS headers, so
   any straggler fails *loudly and diagnosably* rather than with an opaque CORS error. Keep the 410
   for one more release cycle.
4. **Delete** the whole `LEGACY_HOST` block, `noteLegacyHostApiHit`, this doc, and the DNS record.

Do not skip step 3 — going straight from pass-through to nothing reintroduces the exact opaque
failure mode this ticket fixed.
