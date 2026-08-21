import { test, expect, mock, afterEach } from "bun:test"
import { getConnector } from "./index"

// Codex connector-security fixes for the Jira adapter:
//   #1 CRITICAL — the Basic-auth token must NEVER follow a cross-origin redirect (credential exfil).
//   #3          — the connection test's throwaway issue is deletable (no permanent orphan).
//   #9 LOW      — upstream error/reason strings are redacted so an echoed Authorization can't leak.

const realFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = realFetch })

const CFG = {
  host: "https://my.atlassian.net",
  email: "admin@example.com",
  token: "SECRET_TOKEN",
  project_key: "PROJ",
  issue_type: "Task",
}

const TICKET = {
  title: "✅ Klavity connection test",
  body: "This is a test ticket created by Klavity.",
  priority: null,
  url: null,
  simName: "Klavity",
  createdAt: 1,
  klavityUrl: "https://klavity.in/dashboard",
}

function redirect(location: string, status = 302): Response {
  return new Response(null, { status, headers: { location } })
}

// ── #1 CRITICAL: credentials never reach a redirect target ──────────────────

test("#1 a Jira host that 302s to another origin never sends the Authorization header to the redirect target", async () => {
  const calls: { url: string; auth: string | null }[] = []
  let hop = 0
  globalThis.fetch = mock(async (u: any, o: any) => {
    const headers = new Headers(o?.headers || {})
    calls.push({ url: String(u), auth: headers.get("authorization") })
    hop++
    // Malicious/misconfigured vanity host redirects the authenticated create to an attacker collector.
    if (hop === 1) return redirect("https://attacker.example.net/collect")
    return new Response(JSON.stringify({ key: "PROJ-1" }), { status: 200 })
  }) as any

  // createIssue must reject (the redirect is blocked) rather than deliver the token onward.
  await expect(getConnector("jira")!.createIssue(TICKET as any, CFG)).rejects.toThrow(/cross-origin/i)

  // Exactly ONE request was made — to the configured Jira host — and the attacker host was NEVER hit.
  expect(calls.length).toBe(1)
  expect(new URL(calls[0].url).host).toBe("my.atlassian.net")
  expect(calls.some((c) => c.url.includes("attacker.example.net"))).toBe(false)
  // The one request that carried the Basic-auth token went ONLY to the configured host.
  const authedCalls = calls.filter((c) => c.auth)
  for (const c of authedCalls) expect(new URL(c.url).host).toBe("my.atlassian.net")
})

// ── #3: the connection-test issue is deletable (create-then-delete cleanup) ──

test("#3 jira adapter exposes deleteIssue that DELETEs the issue with auth to the configured host", async () => {
  const calls: { method: string; url: string; auth: string | null }[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    const headers = new Headers(o?.headers || {})
    calls.push({ method: String(o?.method || "GET"), url: String(u), auth: headers.get("authorization") })
    return new Response(null, { status: 204 })
  }) as any

  const adapter = getConnector("jira")!
  expect(typeof adapter.deleteIssue).toBe("function")
  const r = await adapter.deleteIssue!("PROJ-1", CFG)
  expect(r.ok).toBe(true)
  expect(calls.length).toBe(1)
  expect(calls[0].method).toBe("DELETE")
  expect(calls[0].url).toBe("https://my.atlassian.net/rest/api/3/issue/PROJ-1")
  expect(calls[0].auth).toBeTruthy()  // authenticated delete
})

test("#3 deleteIssue is non-throwing and reports failure on a non-2xx without leaking", async () => {
  globalThis.fetch = mock(async () => new Response("nope", { status: 403 })) as any
  const r = await getConnector("jira")!.deleteIssue!("PROJ-9", CFG)
  expect(r.ok).toBe(false)
  expect(r.error).toContain("403")
})

// ── #9 LOW: redact Authorization/Basic strings from surfaced error text ─────

test("#9 an upstream reason containing a Basic-auth string is redacted in the returned error", async () => {
  // Simulate a proxy/host that echoes the request's Authorization header back in its error body.
  const leaky = 'Rejected. Authorization: Basic YWRtaW5AZXhhbXBsZS5jb206U0VDUkVUX1RPS0VO was invalid'
  globalThis.fetch = mock(async () => new Response(leaky, { status: 400 })) as any

  const res = await getConnector("jira")!.addComment("PROJ-1", "hi", {}, CFG)
  expect(res.ok).toBe(false)
  const err = String(res.error || "")
  // The base64 credential blob must NOT survive into the surfaced/logged error.
  expect(err).not.toContain("YWRtaW5AZXhhbXBsZS5jb206U0VDUkVUX1RPS0VO")
  expect(err).toContain("[redacted]")
})
