import { test, expect, beforeEach, afterEach } from "bun:test"
import { deflateRawSync } from "node:zlib"
import { docKind, readZipEntry, docxText, normalizeExtract, extractRequirements, ExtractError } from "./requirements-extract"

// Minimal zip writer (stored or deflated) so the DOCX reader is tested on real zip bytes.
function makeZip(files: Record<string, string>, deflate: boolean): Uint8Array {
  const enc = new TextEncoder(), locals: Uint8Array[] = [], central: Uint8Array[] = []
  let offset = 0
  for (const [name, text] of Object.entries(files)) {
    const nameB = enc.encode(name), raw = enc.encode(text)
    const data = deflate ? new Uint8Array(deflateRawSync(raw)) : raw
    const lh = new Uint8Array(30 + nameB.length), lv = new DataView(lh.buffer)
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(8, deflate ? 8 : 0, true)
    lv.setUint32(18, data.length, true); lv.setUint32(22, raw.length, true); lv.setUint16(26, nameB.length, true)
    lh.set(nameB, 30)
    const ch = new Uint8Array(46 + nameB.length), cv = new DataView(ch.buffer)
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(10, deflate ? 8 : 0, true)
    cv.setUint32(20, data.length, true); cv.setUint32(24, raw.length, true); cv.setUint16(28, nameB.length, true)
    cv.setUint32(42, offset, true); ch.set(nameB, 46)
    locals.push(lh, data); central.push(ch); offset += lh.length + data.length
  }
  const cdSize = central.reduce((n, c) => n + c.length, 0)
  const eocd = new Uint8Array(22), ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, central.length, true); ev.setUint16(10, central.length, true)
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true)
  const parts = [...locals, ...central, eocd], out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length }
  return out
}

const DOC_XML = `<?xml version="1.0"?><w:document><w:body>` +
  `<w:p><w:r><w:t>Login &amp; access</w:t></w:r></w:p>` +
  `<w:p><w:r><w:t>1.</w:t></w:r><w:r><w:tab/><w:t>Open https://app.example.com</w:t></w:r></w:p>` +
  `<w:p><w:r><w:t>Line</w:t><w:br/><w:t>break &#8211; done</w:t></w:r></w:p></w:body></w:document>`

test("docKind accepts PDF / DOCX / TXT / MD and rejects others", () => {
  expect(docKind("spec.PDF")).toBe("pdf")
  expect(docKind("spec.docx")).toBe("docx")
  expect(docKind("notes.txt")).toBe("text")
  expect(docKind("readme.md")).toBe("text")
  expect(docKind("x.bin", "application/pdf")).toBe("pdf")
  expect(docKind("image.png")).toBeNull()
  expect(docKind("legacy.doc")).toBeNull()
})

for (const deflate of [false, true]) {
  test(`docxText reads word/document.xml from a ${deflate ? "deflated" : "stored"} zip`, () => {
    const zip = makeZip({ "[Content_Types].xml": "<Types/>", "word/document.xml": DOC_XML }, deflate)
    expect(readZipEntry(zip, "missing.xml")).toBeNull()
    expect(docxText(zip)).toBe("Login & access\n1.\tOpen https://app.example.com\nLine\nbreak – done")
  })
}

test("docxText on a non-docx throws a friendly ExtractError", () => {
  expect(() => docxText(new TextEncoder().encode("not a zip at all"))).toThrow(ExtractError)
})

test("normalizeExtract: REQ/TS ids, scenario→requirement links, preconditions/expected, ready vs needs_info", () => {
  const out = normalizeExtract({
    documentTitle: "Functional Requirements",
    startUrl: "https://app.example.com/login",
    documentIssues: ["Section 4 is an unreadable image"],
    features: ["Auth", { name: "Requests" }, ""], workflows: ["Submit a request"],
    clarifications: ["Which roles can delete?", "", 5],
    requirements: [
      { ref: "R1", title: "Login", description: "Users sign in with email + password", type: "functional", feature: "Auth", section: "3.1", quote: "The user shall log in.", preconditions: "Account exists", expectedResult: "Dashboard is shown" },
      { ref: "R2", title: "Max file size", description: "Uploads up to 10 MB", type: "business_rule", feature: "Requests", section: "4.2", ambiguous: true, clarification: "Which file types?" },
      { ref: "R3", description: "" },   // no title / description → dropped
    ],
    scenarios: [
      { title: "User login with valid credentials", requirementRefs: ["R1", "nope"], preconditions: "Account exists", steps: "1. Open login\n2. Sign in", expectedResult: "Dashboard is shown", needsLogin: true, missing: [] },
      { title: "Upload a supporting document", requirementRefs: ["r2"], steps: ["1. Open request", "2. Upload file"], expectedResult: "File listed", missing: ["file to upload"], startUrl: "javascript:alert(1)" },
      { title: "No expected result", requirementRefs: ["R1"], steps: "1. Do a thing\n2. And another" },
      { title: "", steps: "no title → dropped" },
    ],
  }, "fr.pdf")
  expect(out.documentTitle).toBe("Functional Requirements")
  expect(out.startUrl).toBe("https://app.example.com/login")
  expect(out.documentIssues).toEqual(["Section 4 is an unreadable image"])
  expect(out.features).toEqual(["Auth", "Requests"])
  expect(out.requirements.map(r => [r.ref, r.type, r.ambiguous])).toEqual([["REQ-001", "functional", false], ["REQ-002", "business_rule", true]])
  expect(out.requirements[0]).toMatchObject({ section: "3.1", quote: "The user shall log in.", preconditions: "Account exists", expectedResult: "Dashboard is shown", clarification: "" })
  expect(out.clarifications).toEqual(["Which roles can delete?", "REQ-002: Which file types?"])
  expect(out.counts).toEqual({ requirements: 2, features: 2, workflows: 1, clarifications: 2 })
  expect(out.scenarios.map(s => [s.id, s.status, s.requirementRefs])).toEqual([
    ["TS-001", "ready", ["REQ-001"]], ["TS-002", "needs_info", ["REQ-002"]], ["TS-003", "needs_info", ["REQ-001"]],
  ])
  expect(out.scenarios[0]).toMatchObject({ preconditions: "Account exists", expectedResult: "Dashboard is shown", needsLogin: true })
  expect(out.scenarios[1].steps).toBe("1. Open request\n2. Upload file")
  expect(out.scenarios[1].startUrl).toBeNull()                 // non-http URL rejected
  expect(out.scenarios[2].missing).toEqual(["expected result"]) // no expected result → needs info
  expect(normalizeExtract(null, "a.txt")).toMatchObject({ documentTitle: "a.txt", requirements: [], scenarios: [] })
})

let savedKey: string | undefined
beforeEach(() => { savedKey = process.env.OPENROUTER_API_KEY; process.env.OPENROUTER_API_KEY = "test-key" })
afterEach(() => { if (savedKey === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = savedKey })

function fakeFetch(content: string, status = 200, capture?: (body: any) => void): typeof fetch {
  return (async (_url: any, init: any) => {
    capture?.(JSON.parse(init.body))
    return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }), { status })
  }) as any
}
const base = { projectId: "proj_x", actorEmail: "qa@example.com" }
const GOOD = JSON.stringify({
  requirements: [{ ref: "R1", title: "Login", description: "Users can log in", expectedResult: "Dashboard shown" }],
  features: ["Auth"], workflows: ["Login"], clarifications: [],
  scenarios: [{ title: "Login", requirementRefs: ["R1"], steps: "1. Open\n2. Sign in", expectedResult: "Dashboard shown", missing: [] }],
})

test("extractRequirements: text file → text prompt; PDF → file part", async () => {
  let body: any
  const txt = await extractRequirements({ ...base, bytes: new TextEncoder().encode("The user logs in and sees the dashboard."), filename: "req.txt", fetchImpl: fakeFetch(GOOD, 200, b => (body = b)) })
  expect(txt.scenarios[0]).toMatchObject({ id: "TS-001", title: "Login", status: "ready" })
  expect(typeof body.messages[1].content).toBe("string")
  expect(body.messages[1].content).toContain("The user logs in")

  await extractRequirements({ ...base, bytes: new Uint8Array([37, 80, 68, 70, 45]), filename: "req.pdf", fetchImpl: fakeFetch("```json\n" + GOOD + "\n```", 200, b => (body = b)) })
  const filePart = body.messages[1].content.find((p: any) => p.type === "file")
  expect(filePart.file.filename).toBe("req.pdf")
  expect(filePart.file.file_data.startsWith("data:application/pdf;base64,")).toBe(true)
})

test("extractRequirements: validation and failure modes are friendly ExtractErrors", async () => {
  const run = (o: any) => extractRequirements({ ...base, bytes: new TextEncoder().encode("The user logs in and sees the dashboard."), filename: "req.txt", fetchImpl: fakeFetch(GOOD), ...o })
  await expect(run({ filename: "pic.png" })).rejects.toMatchObject({ status: 400 })
  await expect(run({ bytes: new Uint8Array() })).rejects.toThrow("empty")
  await expect(run({ bytes: new TextEncoder().encode("hi") })).rejects.toThrow("No readable text")
  await expect(run({ fetchImpl: fakeFetch("{}", 500) })).rejects.toMatchObject({ status: 502 })
  await expect(run({ fetchImpl: fakeFetch("not json") })).rejects.toMatchObject({ status: 502 })
  await expect(run({ fetchImpl: fakeFetch(JSON.stringify({ scenarios: [] })) })).rejects.toMatchObject({ status: 422 })
  await expect(run({ fetchImpl: (async () => { throw new Error("ECONNRESET") }) as any })).rejects.toMatchObject({ status: 502 })
  delete process.env.OPENROUTER_API_KEY
  await expect(run({})).rejects.toMatchObject({ status: 503 })
})
