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
