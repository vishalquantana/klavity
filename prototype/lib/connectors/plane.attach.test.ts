import { test, expect, mock } from "bun:test"
import { getConnector } from "./index"
import type { TicketAttachment } from "./index"

// KLA-285 (JTBD 5.6) — Plane native screenshot attachment.
//
// The previous version of this file mocked a permissive `fetch` that returned 201 for ANY request to
// /issue-attachments/, so it happily green-lit a request shape real Plane rejects. Verified live on
// 2026-07-19 against self-hosted Plane (plane.quantana.top, workspace qbuilder): a direct multipart
// POST with an `asset` field returns `400 {"error":"Invalid request.","status":false}` — every Plane
// export was silently degrading to the body link.
//
// So the fake below is not permissive: `fakePlane()` reproduces the three behaviors real Plane
// actually enforces, each of which independently fails the old implementation.
//   1. step 1 must be application/json metadata { name, type, size } — multipart bodies get 400.
//   2. step 2 uploads to a SEPARATE presigned storage URL, echoing every upload_data.fields entry,
//      and the byte count must equal the declared `size` (S3 policy content-length-range; a
//      mismatch really did return EntityTooLarge during verification).
//   3. step 3 must PATCH the asset to flip is_uploaded — without it Plane omits the attachment from
//      the issue, which is indistinguishable from never having uploaded at all.
// `listAttachments()` mirrors Plane by only reporting assets that completed all three steps.

const BASE_TICKET = {
  title: "Bug",
  body: "desc",
  priority: "high",
  url: "https://app/x",
  simName: "Vamshi",
  createdAt: 1,
  klavityUrl: "https://klavity.in/dashboard",
}

const CFG = {
  host: "https://api.plane.so",
  workspace: "my-workspace",
  project_id: "proj-uuid",
  token: "plane-token",
}

const ATTACHMENT: TicketAttachment = {
  filename: "shot.png",
  contentType: "image/png",
  bytes: new Uint8Array([1, 2, 3, 4]),
  url: "https://klavity.in/img/abc.hmac",
}

const ISSUE_URL = "https://api.plane.so/api/v1/workspaces/my-workspace/projects/proj-uuid/issues/"
const ATTACH_URL =
  "https://api.plane.so/api/v1/workspaces/my-workspace/projects/proj-uuid/issues/issue-uuid-1/issue-attachments/"
// The presigned step-2 target is a SEPARATE host from the Plane API (real Plane hands back an
// S3 endpoint). safeFetch resolves hosts for real, so point the fake bucket at the test-only
// loopback hatch rather than an unresolvable domain — `fetch` itself is mocked, nothing is sent.
process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"
const STORAGE_URL = "http://127.0.0.1:59285/plane-bucket"

type FakeAsset = { name: string; declaredSize: number; uploadedBytes: number | null; committed: boolean }

/**
 * Stand-in for a real Plane deployment, modeled on the live round-trip captured for KLA-285.
 * `opts.failAt` forces a step to fail so we can assert graceful, VISIBLE degradation.
 */
function fakePlane(opts: { failAt?: "reserve" | "storage" | "commit" } = {}) {
  const assets = new Map<string, FakeAsset>()
  const calls: Array<{ url: string; method: string }> = []
  let n = 0

  const handler = async (u: any, o: any = {}) => {
    const url = String(u)
    const method = (o.method ?? "GET").toUpperCase()
    calls.push({ url, method })
    const headers: Record<string, string> = o.headers ?? {}

    // ── issue creation ────────────────────────────────────────────────────────────
    if (url === ISSUE_URL && method === "POST") {
      return new Response(JSON.stringify({ id: "issue-uuid-1", sequence_id: 42 }), { status: 201 })
    }

    // ── step 3: PATCH {…}/issue-attachments/{asset_id}/ ───────────────────────────
    if (url.startsWith(ATTACH_URL) && url !== ATTACH_URL && method === "PATCH") {
      if (opts.failAt === "commit") return new Response("commit boom", { status: 500 })
      const assetId = url.slice(ATTACH_URL.length).replace(/\/$/, "")
      const a = assets.get(assetId)
      if (!a) return new Response(JSON.stringify({ error: "not found" }), { status: 404 })
      // Real Plane will not mark an asset uploaded if the bytes never landed in storage.
      if (a.uploadedBytes == null) return new Response(JSON.stringify({ error: "not uploaded" }), { status: 400 })
      a.committed = true
      return new Response(null, { status: 204 })
    }

    // ── step 1: POST issue-attachments/ — JSON metadata ONLY ─────────────────────
    if (url === ATTACH_URL && method === "POST") {
      if (opts.failAt === "reserve") return new Response("reserve boom", { status: 500 })
      // This is the exact rejection the old multipart implementation hit on real Plane.
      if (o.body instanceof FormData) {
        return new Response(JSON.stringify({ error: "Invalid request.", status: false }), { status: 400 })
      }
      if (!String(headers["Content-Type"] ?? "").includes("application/json")) {
        return new Response(JSON.stringify({ error: "Invalid request.", status: false }), { status: 400 })
      }
      if (headers["X-API-Key"] !== "plane-token") return new Response("unauthorized", { status: 401 })
      const meta = JSON.parse(String(o.body))
      if (typeof meta.size !== "number" || !meta.name || !meta.type) {
        return new Response(JSON.stringify({ error: "Invalid request.", status: false }), { status: 400 })
      }
      const assetId = `asset-${++n}`
      assets.set(assetId, { name: meta.name, declaredSize: meta.size, uploadedBytes: null, committed: false })
      return new Response(
        JSON.stringify({
          asset_id: assetId,
          attachment: { id: assetId, is_uploaded: false, attributes: meta },
          upload_data: {
            url: STORAGE_URL,
            fields: {
              "Content-Type": meta.type,
              key: `ws/${assetId}/${meta.name}`,
              policy: "signed-policy",
              "x-amz-signature": "sig",
            },
          },
        }),
        { status: 200 },
      )
    }

    // ── step 2: presigned POST to object storage ─────────────────────────────────
    if (url === STORAGE_URL && method === "POST") {
      if (opts.failAt === "storage") return new Response("<Error>storage boom</Error>", { status: 500 })
      const form = o.body as FormData
      if (!(form instanceof FormData)) return new Response("<Error>MalformedPOSTRequest</Error>", { status: 400 })
      // S3 requires the signed policy fields alongside the file.
      for (const f of ["key", "policy", "x-amz-signature"]) {
        if (!form.has(f)) return new Response(`<Error>missing ${f}</Error>`, { status: 403 })
      }
      const file = form.get("file")
      if (!(file instanceof Blob)) return new Response("<Error>no file field</Error>", { status: 400 })
      const assetId = String(form.get("key")).split("/")[1]
      const a = assets.get(assetId)
      if (!a) return new Response("<Error>AccessDenied</Error>", { status: 403 })
      // The presigned policy pins content-length-range to the declared size.
      if (file.size !== a.declaredSize) {
        return new Response("<Error><Code>EntityTooLarge</Code></Error>", { status: 400 })
      }
      a.uploadedBytes = file.size
      return new Response(null, { status: 204 })
    }

    return new Response("unexpected request", { status: 404 })
  }

  return {
    handler,
    calls,
    /** Mirrors Plane: only fully-committed assets are visible on the issue. */
    listAttachments: () => [...assets.values()].filter((a) => a.committed && a.uploadedBytes != null),
  }
}

function withSilencedWarn<T>(fn: () => Promise<T>): Promise<T> {
  const warn = console.warn
  console.warn = () => {}
  return fn().finally(() => { console.warn = warn })
}

// ── THE REGRESSION TEST ────────────────────────────────────────────────────────────
// Fails against the pre-KLA-285 multipart implementation (step 1 → 400, nothing ever attaches).
test("plane createIssue natively attaches the screenshot (real 3-step presigned flow)", async () => {
  const plane = fakePlane()
  globalThis.fetch = mock(plane.handler) as any

  const r = await getConnector("plane")!.createIssue({ ...BASE_TICKET, attachments: [ATTACHMENT] }, CFG)

  expect(r.externalKey).toBe("42")
  expect(r.externalUrl).toContain("issue-uuid-1")

  // The whole point: the image is actually attached to the issue, not silently dropped.
  const attached = plane.listAttachments()
  expect(attached.length).toBe(1)
  expect(attached[0].name).toBe("shot.png")
  expect(attached[0].uploadedBytes).toBe(ATTACHMENT.bytes.byteLength)

  // ...and a clean attach reports no warning.
  expect(r.attachmentWarning).toBeFalsy()

  // All three steps were actually performed, in order.
  expect(plane.calls.map((c) => `${c.method} ${c.url}`)).toEqual([
    `POST ${ISSUE_URL}`,
    `POST ${ATTACH_URL}`,
    `POST ${STORAGE_URL}`,
    `PATCH ${ATTACH_URL}asset-1/`,
  ])
})

test("plane declares the exact byte length so the presigned size policy accepts the upload", async () => {
  const plane = fakePlane()
  const bodies: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    if (String(u) === ATTACH_URL && (o?.method ?? "").toUpperCase() === "POST" && !(o.body instanceof FormData)) {
      bodies.push(JSON.parse(String(o.body)))
    }
    return plane.handler(u, o)
  }) as any

  const big: TicketAttachment = { ...ATTACHMENT, bytes: new Uint8Array(4096).fill(7) }
  await getConnector("plane")!.createIssue({ ...BASE_TICKET, attachments: [big] }, CFG)

  expect(bodies.length).toBe(1)
  expect(bodies[0]).toMatchObject({ name: "shot.png", type: "image/png", size: 4096 })
  expect(plane.listAttachments().length).toBe(1)
})

test("plane attaches every screenshot when a ticket carries several", async () => {
  const plane = fakePlane()
  globalThis.fetch = mock(plane.handler) as any

  const r = await getConnector("plane")!.createIssue(
    {
      ...BASE_TICKET,
      attachments: [ATTACHMENT, { ...ATTACHMENT, filename: "shot2.png", bytes: new Uint8Array([9, 9]) }],
    },
    CFG,
  )

  expect(plane.listAttachments().map((a) => a.name).sort()).toEqual(["shot.png", "shot2.png"])
  expect(r.attachmentWarning).toBeFalsy()
})

// ── Graceful degradation must stay graceful — but stop being SILENT ────────────────
for (const failAt of ["reserve", "storage", "commit"] as const) {
  test(`plane createIssue still returns the issue, and reports a warning, when the attach fails at ${failAt}`, async () => {
    const plane = fakePlane({ failAt })
    globalThis.fetch = mock(plane.handler) as any

    const r = await withSilencedWarn(() =>
      getConnector("plane")!.createIssue({ ...BASE_TICKET, attachments: [ATTACHMENT] }, CFG),
    )

    // Export itself must succeed — the body still carries the permanent signed link.
    expect(r.externalKey).toBe("42")
    expect(r.externalUrl).toContain("issue-uuid-1")
    // Nothing ended up attached...
    expect(plane.listAttachments().length).toBe(0)
    // ...and that is now VISIBLE on the export record instead of being swallowed (KLA-285).
    expect(r.attachmentWarning).toBeTruthy()
    expect(r.attachmentWarning).toContain("shot.png")
    expect(r.attachmentWarning).toContain("link included in body")
  })
}

test("plane createIssue survives a thrown network error during attach and reports it", async () => {
  globalThis.fetch = mock(async (u: any) => {
    if (String(u).includes("/issue-attachments/")) throw new Error("network boom")
    return new Response(JSON.stringify({ id: "issue-uuid-1", sequence_id: 42 }), { status: 201 })
  }) as any

  const r = await withSilencedWarn(() =>
    getConnector("plane")!.createIssue({ ...BASE_TICKET, attachments: [ATTACHMENT] }, CFG),
  )
  expect(r.externalKey).toBe("42")
  expect(r.attachmentWarning).toContain("network boom")
})

// ── No attachments = no attachment traffic at all (unchanged behavior) ─────────────
test("plane createIssue makes no attachment request when attachments undefined", async () => {
  const plane = fakePlane()
  globalThis.fetch = mock(plane.handler) as any

  const r = await getConnector("plane")!.createIssue(BASE_TICKET, CFG)
  expect(plane.calls.length).toBe(1)
  expect(plane.calls.some((c) => c.url.includes("/issue-attachments/"))).toBe(false)
  expect(r.attachmentWarning).toBeFalsy()
})

test("plane createIssue makes no attachment request when attachments empty array", async () => {
  const plane = fakePlane()
  globalThis.fetch = mock(plane.handler) as any

  await getConnector("plane")!.createIssue({ ...BASE_TICKET, attachments: [] }, CFG)
  expect(plane.calls.length).toBe(1)
  expect(plane.calls.some((c) => c.url.includes("/issue-attachments/"))).toBe(false)
})
