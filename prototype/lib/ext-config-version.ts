// ── Extension config version stamp (KLAVITYKLA-320) ──────────────────────────
// The browser extension caches the per-project config served by
// GET /api/extension/config in chrome.storage.local under `klavConfig`. Before this
// module there was NO way for the extension to know an admin had changed that config
// in the dashboard (review mode, monitored URLs, project added/removed/renamed), so
// the cache was only refreshed on install / browser startup / CONNECT — users kept
// getting the old behaviour for hours.
//
// We stamp the payload with a cheap content hash. The extension stores it and
// revalidates against GET /api/extension/config/version (which mints no token and
// does no extra work beyond this hash), refetching in full only when it differs.

import { createHash } from "node:crypto"

export type ExtProjectConfig = {
  id: string
  name: string
  reviewMode: string
  monitoredUrls: string[]
}

/**
 * Stable content hash of the extension-visible project config.
 *
 * Stability rules that matter for correctness:
 *  - projects are sorted by id, and each project's monitoredUrls are sorted, so a
 *    reordering by the DB (no semantic change) does NOT churn the version and force
 *    every installed extension to resync;
 *  - every field the extension actually consumes IS in the hash, so a real edit
 *    always changes it.
 * The per-user ext token is deliberately excluded: it is re-minted on every call and
 * would make the version change on each request, defeating the whole point.
 */
export function extConfigVersion(projects: ExtProjectConfig[]): string {
  const canonical = [...projects]
    .map(p => ({
      id: String(p.id),
      name: String(p.name ?? ""),
      reviewMode: String(p.reviewMode ?? ""),
      monitoredUrls: [...(p.monitoredUrls ?? [])].map(String).sort(),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex").slice(0, 16)
}
