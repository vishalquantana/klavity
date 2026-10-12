// Bounded concurrency for the upload fan-out in POST /api/feedback. Uploads to object storage are independent of each
// other, but an unbounded Promise.all over (screenshots + thumbnails + attachments + recordings) would hold every
// file's bytes in memory at once and open one connection per file. A limiter caps how many run at the same time while
// the CALLER keeps results in input order (mapBounded) so descriptors stay aligned with the files the user attached.

/** Returns `run(fn)`: starts `fn` when fewer than `max` tasks are in flight, otherwise queues it (FIFO). */
export function createLimiter(max: number): <T>(fn: () => Promise<T>) => Promise<T> {
  const cap = Math.max(1, Math.floor(max) || 1)
  let active = 0
  const queue: Array<() => void> = []
  const next = () => {
    if (active >= cap) return
    const start = queue.shift()
    if (start) start()
  }
  return function run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        active++
        let p: Promise<T>
        try { p = Promise.resolve(fn()) } catch (e) { p = Promise.reject(e) }
        p.then(resolve, reject).finally(() => { active--; next() })
      }
      if (active < cap) start()
      else queue.push(start)
    })
  }
}

/**
 * Maps `items` through `fn` with at most `limit` in flight (or through a shared `limiter`). The result array is in
 * INPUT order regardless of completion order. A rejection rejects the whole call — callers that need per-item
 * partial-failure handling (uploads) catch inside `fn` and return a value describing the failure.
 */
export async function mapBounded<I, O>(
  items: readonly I[],
  limit: number | (<T>(fn: () => Promise<T>) => Promise<T>),
  fn: (item: I, index: number) => Promise<O>,
): Promise<O[]> {
  const run = typeof limit === "function" ? limit : createLimiter(limit)
  return Promise.all(items.map((it, i) => run(() => fn(it, i))))
}

/** Upload concurrency for one submit: KLAV_UPLOAD_CONCURRENCY, default 4, clamped to 1..8. */
export function uploadConcurrency(env: Record<string, string | undefined> = process.env): number {
  const n = Math.floor(Number(env.KLAV_UPLOAD_CONCURRENCY))
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 8) : 4
}
