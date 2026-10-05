// Tiny in-process TTL caches for the screenshot endpoint (GET /api/screenshots/:id), plus the invalidation epoch that
// keeps them safe.
//
// Why: every screenshot request re-read the same immutable row and re-ran the same project-access check (≈4 sequential
// DB round-trips, ≈200 ms each on a remote Turso). The ticket preview fetches the thumbnail, then the full image, so a
// ticket opened with a slow database sat on "Loading screenshot…" for seconds (KD-195).
//
// Safety: ONLY positive results are cached (a denial is never cached), the TTLs are short, and anything that can REMOVE
// access (member removed / revoked invite / user erased) or delete a screenshot calls bumpAuthEpoch(), which invalidates
// every entry at once. The session itself is still checked from the DB on every request, so logout stays immediate.
let epoch = 0
export function bumpAuthEpoch(): void { epoch++ }
export function currentAuthEpoch(): number { return epoch }

export class TtlCache<V> {
  private m = new Map<string, { v: V; exp: number; epoch: number }>()
  constructor(private max: number, private ttlMs: number, private now: () => number = Date.now) {}
  get(key: string): V | undefined {
    const e = this.m.get(key)
    if (!e) return undefined
    if (e.epoch !== epoch || e.exp <= this.now()) { this.m.delete(key); return undefined }
    return e.v
  }
  set(key: string, v: V): void {
    if (!this.m.has(key) && this.m.size >= this.max) {
      const oldest = this.m.keys().next().value
      if (oldest !== undefined) this.m.delete(oldest)
    }
    this.m.set(key, { v, exp: this.now() + this.ttlMs, epoch })
  }
  delete(key: string): void { this.m.delete(key) }
  clear(): void { this.m.clear() }
  get size(): number { return this.m.size }
}
