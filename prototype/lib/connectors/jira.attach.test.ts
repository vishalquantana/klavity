import { test, expect, mock } from "bun:test"
import { getConnector } from "./index"
import type { TicketAttachment } from "./index"

const BASE_TICKET = {
  title: "Bug",
  body: "desc with permanent link",
  priority: "high",
  url: "https://app/x",
  simName: "Vamshi",
  createdAt: 1,
  klavityUrl: "https://klavity.in/dashboard",
}

const CFG = {
  host: "https://my.atlassian.net",
  email: "user@example.com",
  token: "jira-token",
  project_key: "PROJ",
  issue_type: "Bug",
}

function makeAttachment(name = "shot.png"): TicketAttachment {
  return {
    filename: name,
    contentType: "image/png",
    bytes: new Uint8Array([1, 2, 3, 4]),
    url: "https://klavity.in/img/abc.hmac",
  }
}

// (1) attachment present → second request hits the attachments endpoint with the
//     X-Atlassian-Token: no-check header and a multipart/FormData body.
test("jira createIssue uploads attachment to attachments endpoint with FormData + X-Atlassian-Token", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-42" }), { status: 201 })
    }
    return new Response(JSON.stringify([{ id: "att1" }]), { status: 200 })
  }) as any

  const r = await getConnector("jira")!.createIssue(
    { ...BASE_TICKET, attachments: [makeAttachment()] },
    CFG,
  )

  // Issue create first, attachment upload second.
  expect(calls.length).toBe(2)
  expect(calls[0][0]).toBe("https://my.atlassian.net/rest/api/3/issue")
  expect(calls[1][0]).toBe("https://my.atlassian.net/rest/api/3/issue/PROJ-42/attachments")
  expect(calls[1][1].method).toBe("POST")
  expect(calls[1][1].headers["X-Atlassian-Token"]).toBe("no-check")
  // Basic auth carried over to the attachment request.
  const expectedBase64 = Buffer.from("user@example.com:jira-token").toString("base64")
  expect(calls[1][1].headers["Authorization"]).toBe(`Basic ${expectedBase64}`)
  // Body is a Web FormData (boundary set automatically — no manual Content-Type).
  expect(calls[1][1].body).toBeInstanceOf(FormData)
  expect(calls[1][1].headers["Content-Type"]).toBeUndefined()
  const form = calls[1][1].body as FormData
  const file = form.get("file") as Blob
  expect(file).toBeInstanceOf(Blob)
  expect(file.type).toBe("image/png")

  // Normal result still returned.
  expect(r.externalKey).toBe("PROJ-42")
  expect(r.externalUrl).toBe("https://my.atlassian.net/browse/PROJ-42")
})

test("jira createIssue uploads one request per attachment", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-7" }), { status: 201 })
    }
    return new Response("[]", { status: 200 })
  }) as any

  await getConnector("jira")!.createIssue(
    { ...BASE_TICKET, attachments: [makeAttachment("a.png"), makeAttachment("b.png")] },
    CFG,
  )

  const attachCalls = calls.filter(([u]) => String(u).endsWith("/attachments"))
  expect(attachCalls.length).toBe(2)
})

// (2a) attachment upload returns non-2xx → createIssue still resolves normally.
test("jira createIssue resolves normally when attachment upload returns non-2xx", async () => {
  globalThis.fetch = mock(async (u: any) => {
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-99" }), { status: 201 })
    }
    return new Response("Payload too large", { status: 413 })
  }) as any

  const r = await getConnector("jira")!.createIssue(
    { ...BASE_TICKET, attachments: [makeAttachment()] },
    CFG,
  )

  // Issue still created; the degradation is surfaced (not silent) via attachmentWarning.
  expect(r.externalKey).toBe("PROJ-99")
  expect(r.externalUrl).toBe("https://my.atlassian.net/browse/PROJ-99")
  expect(typeof r.attachmentWarning).toBe("string")
})

// (2b) attachment upload throws → createIssue still resolves normally (graceful).
test("jira createIssue resolves normally when attachment upload throws", async () => {
  globalThis.fetch = mock(async (u: any) => {
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-100" }), { status: 201 })
    }
    throw new Error("network down")
  }) as any

  const r = await getConnector("jira")!.createIssue(
    { ...BASE_TICKET, attachments: [makeAttachment()] },
    CFG,
  )

  expect(r.externalKey).toBe("PROJ-100")
  expect(r.externalUrl).toBe("https://my.atlassian.net/browse/PROJ-100")
  expect(typeof r.attachmentWarning).toBe("string")
})

// (3) no attachments → no attachment request is made.
test("jira createIssue makes no attachment request when attachments is undefined", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    return new Response(JSON.stringify({ key: "PROJ-1" }), { status: 201 })
  }) as any

  await getConnector("jira")!.createIssue(BASE_TICKET, CFG)

  expect(calls.length).toBe(1)
  expect(calls.every(([u]) => !String(u).endsWith("/attachments"))).toBe(true)
})

test("jira createIssue makes no attachment request when attachments is empty array", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    return new Response(JSON.stringify({ key: "PROJ-2" }), { status: 201 })
  }) as any

  await getConnector("jira")!.createIssue({ ...BASE_TICKET, attachments: [] }, CFG)

  expect(calls.length).toBe(1)
})

// Klavity->Jira #414: a NON-IMAGE reporter file (e.g. a .log) is uploaded to the attachments
// endpoint just like a screenshot — any type, not only PNGs.
test("jira createIssue uploads a non-image reporter file (e.g. .log) with its content type", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-50" }), { status: 201 })
    }
    return new Response(JSON.stringify([{ id: "att-log" }]), { status: 200 })
  }) as any

  const logFile: TicketAttachment = {
    filename: "app.log",
    contentType: "text/plain",
    bytes: new Uint8Array([104, 105]),
    url: "https://klavity.in/att/log.hmac",
  }

  await getConnector("jira")!.createIssue(
    { ...BASE_TICKET, attachments: [makeAttachment("shot.png"), logFile] },
    CFG,
  )

  const attachCalls = calls.filter(([u]) => String(u).endsWith("/attachments"))
  expect(attachCalls.length).toBe(2)
  // The second attachment is the .log with its declared content type preserved on the Blob.
  const logForm = attachCalls[1][1].body as FormData
  const logBlob = logForm.get("file") as Blob
  expect(logBlob.type).toContain("text/plain")
  expect((logForm.get("file") as File).name).toBe("app.log")
})

// Klavity->Jira #414: size cap — a file larger than the per-file cap (~10MB) is NOT uploaded, the
// issue is still created, and the degradation is surfaced via attachmentWarning.
test("jira createIssue skips an over-cap file but still creates the issue (size cap enforced)", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-BIG" }), { status: 201 })
    }
    return new Response(JSON.stringify([{ id: "att1" }]), { status: 200 })
  }) as any

  const huge: TicketAttachment = {
    filename: "huge.bin",
    contentType: "application/octet-stream",
    bytes: new Uint8Array(10 * 1024 * 1024 + 1), // 1 byte over the 10MB per-file cap
    url: "https://klavity.in/att/huge.hmac",
  }
  const ok = makeAttachment("small.png")

  const r = await getConnector("jira")!.createIssue(
    { ...BASE_TICKET, attachments: [huge, ok] },
    CFG,
  )

  // Only the small file was uploaded; the over-cap file was skipped up front (no request for it).
  const attachCalls = calls.filter(([u]) => String(u).endsWith("/attachments"))
  expect(attachCalls.length).toBe(1)
  const form = attachCalls[0][1].body as FormData
  expect((form.get("file") as File).name).toBe("small.png")
  // Issue created; the skip is surfaced.
  expect(r.externalKey).toBe("PROJ-BIG")
  expect(typeof r.attachmentWarning).toBe("string")
})

// Klavity->Jira #414: the standalone attachFiles capability is exposed and delegates to the same
// multipart upload path with the X-Atlassian-Token header.
test("jira attachFiles capability uploads to the attachments endpoint", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    return new Response(JSON.stringify([{ id: "att1" }]), { status: 200 })
  }) as any

  const res = await getConnector("jira")!.attachFiles!("PROJ-9", [makeAttachment()], CFG)

  expect(calls.length).toBe(1)
  expect(calls[0][0]).toBe("https://my.atlassian.net/rest/api/3/issue/PROJ-9/attachments")
  expect(calls[0][1].headers["X-Atlassian-Token"]).toBe("no-check")
  expect(res.attached).toBe(1)
  expect(res.failed).toBe(0)
})
