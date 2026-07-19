// PostHog server-side capture helper — KLAVITYKLA-335.
// Fire-and-forget activation events sent directly to the PostHog /capture endpoint.
// The helper is a thin wrapper: it builds the payload, fires a best-effort POST, and
// swallows any errors so a PostHog outage never impacts the request path.
//
// Usage:
//   void capturePosthog("user@example.com", "signup_completed", { email: "user@example.com" })
//
// The function is a no-op when KLAV_POSTHOG_KEY is not set (local dev / CI).

const POSTHOG_ENDPOINT = "https://us.i.posthog.com/capture/"

// ── Session-replay gating (KLAVITYKLA-329) ──────────────────────────────────────
// GTM P1-5: we want PostHog session replay (masked) for roughly the first ~50 tool
// users only — enough to watch the earliest activation journeys without recording
// forever. The client SDK arms recording; the SERVER decides whether to arm it by
// substituting a flag into the app-page HTML, gated on this cap. Client-side we also
// respect Do-Not-Track / opt-out (posthog `respect_dnt`), so this is only the volume gate.
export const POSTHOG_REPLAY_USER_CAP = 50

/**
 * Decide whether masked session replay should be armed for this page load.
 * Off unless PostHog is configured AND we're still under the tool-user cap.
 * Kept pure + injectable so it's hermetically testable and callers pass the count.
 *
 * @param opts.hasKey        whether KLAV_POSTHOG_KEY is configured (no key → no PostHog)
 * @param opts.toolUserCount current count of tool users (e.g. rows in `users`)
 * @param opts.cap           override the default ~50 cap (tests / tuning)
 */
export function posthogReplayEnabled(opts: {
  hasKey: boolean
  toolUserCount: number
  cap?: number
}): boolean {
  const cap = opts.cap ?? POSTHOG_REPLAY_USER_CAP
  if (!opts.hasKey) return false
  if (!Number.isFinite(opts.toolUserCount) || opts.toolUserCount < 0) return false
  return opts.toolUserCount < cap
}

/**
 * Fire-and-forget PostHog server-side capture.
 * @param distinctId - the user's email or a stable anonymous id
 * @param event - the PostHog event name
 * @param properties - arbitrary event properties (merged with $lib marker)
 */
export async function capturePosthog(
  distinctId: string,
  event: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  const key = process.env.KLAV_POSTHOG_KEY
  if (!key) return

  try {
    await fetch(POSTHOG_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        distinct_id: distinctId,
        event,
        properties: {
          $lib: "klavity-server",
          ...properties,
        },
      }),
    })
  } catch {
    // Silently swallow — PostHog capture must never affect the request path.
  }
}
