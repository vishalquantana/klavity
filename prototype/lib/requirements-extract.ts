// AutoSims → Projects & Test Cases → "Upload & Extract".
// Reads a requirements document (PDF / DOCX / TXT / MD) and asks an LLM for the requirement counts plus
// a list of test scenarios (title + plain-language steps + start URL + login need + missing details),
// which the UI pre-fills into new test cases. Nothing is saved here: the user reviews, completes the
// missing details and the UI creates the test cases through the normal test-case API.
//
// DOCX/TXT are turned into text on the server (DOCX = zip → word/document.xml, read with node:zlib, no
// extra dependency). PDFs are passed to the model as a file part (OpenRouter parses them).
import { inflateRawSync } from "node:zlib"
import { recordAiCall } from "./db"

export const EXTRACT_MAX_BYTES = 25 * 1024 * 1024
const MAX_TEXT_CHARS = 120_000
const MAX_SCENARIOS = 60
const MAX_REQUIREMENTS = 100
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = process.env.KLAV_REQ_EXTRACT_MODEL || "google/gemini-2.5-flash"

export class ExtractError extends Error {
  constructor(msg: string, public status = 400) { super(msg); this.name = "ExtractError" }
}

export type DocKind = "pdf" | "docx" | "text"

/** One functional requirement / business rule found in the document (DEV-01/02). */
export type ExtractedRequirement = {
  ref: string                 // REQ-001… (unique within the document)
  title: string
  description: string
  type: "functional" | "business_rule"
  feature: string             // feature / module it belongs to ("" = unknown)
  section: string             // where in the document it comes from (heading / section number / page)
  quote: string               // short verbatim excerpt from the document (source reference)
  preconditions: string
  expectedResult: string
  ambiguous: boolean
  clarification: string       // what is unclear (when ambiguous)
}

export type ExtractedScenario = {
  id: string                  // TS-001…
  title: string
  requirementRefs: string[]   // REQ-… this scenario verifies (DEV-03 link)
  preconditions: string       // state that must hold before the steps (DEV-03)
  steps: string               // numbered, plain language — becomes the test case's Execution steps
  expectedResult: string      // what must be observed for the scenario to pass (DEV-03/05)
  startUrl: string | null
  needsLogin: boolean
  missing: string[]           // details the document did not give (shown to the user to fill)
  status: "ready" | "needs_info"
}

export type ExtractResult = {
  documentTitle: string
  startUrl: string | null
  counts: { requirements: number; features: number; workflows: number; clarifications: number }
  features: string[]
  workflows: string[]
  /** Problems with the document itself (unreadable parts, missing sections, not a requirements doc). */
  documentIssues: string[]
  clarifications: string[]
  requirements: ExtractedRequirement[]
  scenarios: ExtractedScenario[]
}

export function docKind(filename: string, contentType = ""): DocKind | null {
  const n = filename.toLowerCase()
  if (n.endsWith(".pdf") || contentType === "application/pdf") return "pdf"
  if (n.endsWith(".docx") || contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx"
  if (/\.(txt|md|markdown)$/.test(n) || contentType.startsWith("text/")) return "text"
  return null
}

// ── DOCX → text ────────────────────────────────────────────────────────────────────────────────────
/** Read one entry out of a zip archive (stored or deflated). Returns null when absent/unsupported. */
export function readZipEntry(buf: Uint8Array, wanted: string): Uint8Array | null {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  // End of central directory: last occurrence of PK\x05\x06 (comment can follow it, max 64 KB).
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) return null
  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true)
  const dec = new TextDecoder()
  for (let n = 0; n < count && p + 46 <= buf.length; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) return null
    const method = dv.getUint16(p + 10, true)
    const csize = dv.getUint32(p + 20, true)
    const nameLen = dv.getUint16(p + 28, true), extraLen = dv.getUint16(p + 30, true), commentLen = dv.getUint16(p + 32, true)
    const local = dv.getUint32(p + 42, true)
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen))
    if (name === wanted) {
      if (dv.getUint32(local, true) !== 0x04034b50) return null
      const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true)
      const data = buf.subarray(start, start + csize)
      if (method === 0) return data
      if (method === 8) return new Uint8Array(inflateRawSync(data))
      return null
    }
    p += 46 + nameLen + extraLen + commentLen
  }
  return null
}

function decodeXmlEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    const k = e.toLowerCase()
    if (k === "amp") return "&"; if (k === "lt") return "<"; if (k === "gt") return ">"
    if (k === "quot") return '"'; if (k === "apos") return "'"
    const cp = k.startsWith("#x") ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)
    return Number.isFinite(cp) ? String.fromCodePoint(cp) : ""
  })
}

/** Plain text of a .docx (paragraphs → lines, tabs/breaks kept). */
export function docxText(buf: Uint8Array): string {
  const xml = readZipEntry(buf, "word/document.xml")
  if (!xml) throw new ExtractError("This .docx file could not be read. Save it again as .docx or PDF and retry.")
  const s = new TextDecoder().decode(xml)
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:(br|cr)\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
  return decodeXmlEntities(s).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

// ── LLM call ───────────────────────────────────────────────────────────────────────────────────────
const SYSTEM = `You analyse a software functional-requirements document and turn it into end-to-end UI test scenarios for a browser automation agent.
Return ONLY a JSON object with this shape:
{
  "documentTitle": string,
  "startUrl": string | null,          // the application's URL if the document gives one (http/https), else null
  "documentIssues": string[],         // problems with the document itself: unreadable/garbled parts, missing sections, not a requirements document; [] if none
  "features": string[],               // distinct features / modules
  "workflows": string[],              // distinct end-to-end user workflows
  "clarifications": string[],         // general questions about things the document leaves ambiguous or missing
  "requirements": [
    {
      "ref": string,                  // your own short id, e.g. "R1", "R2" (used to link scenarios)
      "title": string,                // short name of the requirement (max 100 chars)
      "description": string,          // what the system must do, in plain words
      "type": "functional" | "business_rule",
      "feature": string,              // which feature/module it belongs to
      "section": string,              // where it is in the document: section number / heading / page
      "quote": string,                // a short VERBATIM excerpt (max 200 chars) from the document that states it
      "preconditions": string,        // state that must hold first ("" if none)
      "expectedResult": string,       // the observable outcome the document requires ("" if the document does not say)
      "ambiguous": boolean,           // true if it is unclear, contradictory or untestable as written
      "clarification": string         // when ambiguous: what needs clarifying
    }
  ],
  "scenarios": [
    {
      "title": string,                // short, e.g. "User login with valid credentials" (max 100 chars)
      "requirementRefs": string[],    // refs of the requirement(s) above that this scenario verifies
      "preconditions": string,        // state that must hold before the steps ("" if none)
      "steps": string,                // numbered steps, one per line, plain language a tester can follow
      "expectedResult": string,       // what must be observed at the end for this scenario to PASS (concrete and checkable)
      "startUrl": string | null,      // page this scenario starts on, if the document says; else null
      "needsLogin": boolean,          // true if the user must be signed in
      "missing": string[]             // concrete details needed to run it that the document does not give (e.g. "valid username", "file to upload"); [] if none
    }
  ]
}
Rules: every scenario must link to at least one requirement. Cover the main positive flows first, then important negative/validation cases.
Do not invent URLs, credentials, data values or expected results; list what is missing in "missing" instead. At most ${MAX_REQUIREMENTS} requirements and ${MAX_SCENARIOS} scenarios.`

function httpUrl(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : ""
  return /^https?:\/\/\S+$/.test(s) && s.length <= 500 ? s : null
}
function str(v: unknown, max: number): string { return typeof v === "string" ? v.trim().slice(0, max) : "" }
function strList(v: unknown, max: number, n: number): string[] {
  return (Array.isArray(v) ? v : []).map((x: unknown) => str(typeof x === "object" && x ? (x as any).name : x, max)).filter(Boolean).slice(0, n)
}
const pad3 = (n: number) => String(n).padStart(3, "0")

/** Validate/clamp the model's JSON into an ExtractResult (exported for tests). Our own REQ-/TS- ids are
 *  assigned here; the model's refs are only used to map scenario → requirement links. */
export function normalizeExtract(raw: any, filename: string): ExtractResult {
  const requirements: ExtractedRequirement[] = []
  const refMap = new Map<string, string>()   // model ref (lower-cased) → REQ-xxx
  for (const r of (Array.isArray(raw?.requirements) ? raw.requirements : []).slice(0, MAX_REQUIREMENTS)) {
    const title = str(r?.title, 120) || str(r?.description, 120)
    if (!title) continue
    const ref = "REQ-" + pad3(requirements.length + 1)
    const theirs = str(r?.ref, 40).toLowerCase()
    if (theirs) refMap.set(theirs, ref)
    refMap.set(ref.toLowerCase(), ref)
    const ambiguous = !!r?.ambiguous
    requirements.push({
      ref, title,
      description: str(r?.description, 2000),
      type: r?.type === "business_rule" ? "business_rule" : "functional",
      feature: str(r?.feature, 120),
      section: str(r?.section, 200),
      quote: str(r?.quote, 400),
      preconditions: str(r?.preconditions, 1000),
      expectedResult: str(r?.expectedResult, 1000),
      ambiguous,
      clarification: ambiguous ? (str(r?.clarification, 400) || "This requirement is unclear as written.") : "",
    })
  }

  const scenarios: ExtractedScenario[] = []
  for (const s of (Array.isArray(raw?.scenarios) ? raw.scenarios : []).slice(0, MAX_SCENARIOS)) {
    const title = str(s?.title, 120)
    const steps = str(Array.isArray(s?.steps) ? s.steps.join("\n") : s?.steps, 4000)
    if (!title || !steps) continue
    const missing = strList(s?.missing, 200, 10)
    const expectedResult = str(s?.expectedResult, 1000)
    if (!expectedResult && !missing.some(m => /expected/i.test(m))) missing.push("expected result")
    const requirementRefs = [...new Set(strList(s?.requirementRefs, 40, 10).map(x => refMap.get(x.toLowerCase())).filter((x): x is string => !!x))]
    scenarios.push({
      id: "TS-" + pad3(scenarios.length + 1),
      title, requirementRefs,
      preconditions: str(s?.preconditions, 1000),
      steps, expectedResult,
      startUrl: httpUrl(s?.startUrl),
      needsLogin: !!s?.needsLogin,
      missing,
      // Runnable once it has real steps, a checkable expected result and nothing the document left out.
      status: missing.length === 0 && steps.length >= 10 && !!expectedResult ? "ready" : "needs_info",
    })
  }

  const general = strList(raw?.clarifications, 300, 30)
  const clarifications = [...general, ...requirements.filter(r => r.ambiguous).map(r => `${r.ref}: ${r.clarification}`)]
  const features = strList(raw?.features, 120, 100)
  const workflows = strList(raw?.workflows, 160, 100)
  return {
    documentTitle: str(raw?.documentTitle, 200) || filename,
    startUrl: httpUrl(raw?.startUrl),
    counts: {
      requirements: requirements.length,
      features: features.length || new Set(requirements.map(r => r.feature).filter(Boolean)).size,
      workflows: workflows.length,
      clarifications: clarifications.length,
    },
    features, workflows,
    documentIssues: strList(raw?.documentIssues, 300, 20),
    clarifications,
    requirements,
    scenarios,
  }
}

export async function extractRequirements(opts: {
  bytes: Uint8Array; filename: string; contentType?: string
  projectId: string; actorEmail: string
  fetchImpl?: typeof fetch
}): Promise<ExtractResult> {
  const { bytes, filename } = opts
  if (!bytes.length) throw new ExtractError("The file is empty.")
  if (bytes.length > EXTRACT_MAX_BYTES) throw new ExtractError("The file is larger than 25 MB.", 413)
  const kind = docKind(filename, opts.contentType || "")
  if (!kind) throw new ExtractError("Upload a PDF, DOCX or TXT file.")
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new ExtractError("Document extraction is not configured on this server.", 503)

  let userContent: any
  if (kind === "pdf") {
    const b64 = Buffer.from(bytes).toString("base64")
    userContent = [
      { type: "text", text: `Requirements document "${filename}" is attached. Extract the test scenarios.` },
      { type: "file", file: { filename, file_data: `data:application/pdf;base64,${b64}` } },
    ]
  } else {
    const text = (kind === "docx" ? docxText(bytes) : new TextDecoder().decode(bytes)).slice(0, MAX_TEXT_CHARS)
    if (text.trim().length < 20) throw new ExtractError("No readable text was found in this document.")
    userContent = `Requirements document "${filename}":\n\n${text}`
  }

  let ok = true, inputTokens: number | null = null, outputTokens: number | null = null
  try {
    const resp = await (opts.fetchImpl ?? fetch)(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://klavity.in" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userContent }],
        response_format: { type: "json_object" },
        max_tokens: 16000,
      }),
    })
    if (!resp.ok) {
      ok = false
      console.warn(`[requirements-extract] OpenRouter ${resp.status}: ${(await resp.text().catch(() => "?")).slice(0, 300)}`)
      throw new ExtractError("Couldn't analyse the document right now. Please try again.", 502)
    }
    const data: any = await resp.json()
    inputTokens = data.usage?.prompt_tokens ?? null
    outputTokens = data.usage?.completion_tokens ?? null
    let raw: any
    try {
      const content = String(data.choices?.[0]?.message?.content || "").replace(/^```(?:json)?\s*|\s*```$/g, "")
      raw = JSON.parse(content)
    } catch {
      ok = false
      throw new ExtractError("Couldn't read the extraction result. Please try again.", 502)
    }
    const out = normalizeExtract(raw, filename)
    if (!out.scenarios.length) throw new ExtractError("No test scenarios could be found in this document. Check it describes the application's behaviour.", 422)
    return out
  } catch (e) {
    if (e instanceof ExtractError) throw e
    ok = false   // network failure etc.
    console.warn(`[requirements-extract] ${String((e as any)?.message || e).slice(0, 300)}`)
    throw new ExtractError("Couldn't analyse the document right now. Please try again.", 502)
  } finally {
    recordAiCall({
      type: "requirements-extract", feature: "requirements-extract", model: MODEL,
      projectId: opts.projectId, actorEmail: opts.actorEmail, inputTokens, outputTokens, ok,
    }).catch(() => {})
  }
}
