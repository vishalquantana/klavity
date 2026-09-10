// KLA-820: per-project AutoSim instructions steer BOTH the driver and the objective verifier.
// Hermetic (own libsql file, matching the db.connectors.test.ts / loop-recovery pattern).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { BrowserPage, BrowserHandle } from "./trails-browser-page"
import type { TrailViewport } from "./trails-types"
import type { AuthorModel } from "./trails-author-model"

const file = join(tmpdir(), `klav-instr-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-instr-test-32byteslongxx").toString("base64").slice(0, 44)

const { reconnectDb, applySchema, migrateV2, createProject, setProjectInstructions, listProjectInstructionEdits, projectById } = await import("./db")
const { buildVerifyMessages, buildAuthorMessages, projectInstructionsBlock, VERIFY_SYS, AUTHOR_SYS } = await import("./trails-author-model")
const { authorTrail } = await import("./trails-author")

beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const VERIFY_INPUT = { objective: "save the customer notes", pageUrl: "https://example.com/c/42", domSnapshot: "<html><body><p>notes</p></body></html>" }
const sysOf = (msgs: any[]) => String(msgs.find((m) => m.role === "system")?.content ?? "")

// ── (A) pure prompt-assembly ──────────────────────────────────────────────────────────────────────

test("(A1) buildVerifyMessages is a no-op when instructions are empty/whitespace", () => {
  expect(sysOf(buildVerifyMessages(VERIFY_INPUT))).toBe(VERIFY_SYS)
  expect(sysOf(buildVerifyMessages(VERIFY_INPUT, ""))).toBe(VERIFY_SYS)
  expect(sysOf(buildVerifyMessages(VERIFY_INPUT, "   \n  "))).toBe(VERIFY_SYS)
})

test("(A2) buildVerifyMessages appends instructions to the VERIFIER system prompt when present", () => {
  const inst = "Save confirmations appear as a dismissable toast — treat that as success."
  const sys = sysOf(buildVerifyMessages(VERIFY_INPUT, inst))
  expect(sys.startsWith(VERIFY_SYS)).toBe(true)
  expect(sys).toContain("PROJECT INSTRUCTIONS")
  expect(sys).toContain(inst)
  // page data still rides in the fenced UNTRUSTED user block, not the system block
  expect(sys).not.toContain("<<<")
})

test("(A3) the verifier guard clause forbids instructions from flipping the verdict without evidence", () => {
  const sys = sysOf(buildVerifyMessages(VERIFY_INPUT, "treat as success"))
  expect(sys).toContain("achieved:true without visible")
  expect(sys.toLowerCase()).toContain("must not")
})

test("(A4) the driver prompt still receives instructions with its own hint-only guard", () => {
  const sys = sysOf(buildAuthorMessages({ objective: "x", history: [], credFields: [], pageUrl: "u", domSnapshot: "d" } as any, "dismiss the cookie banner first"))
  expect(sys.startsWith(AUTHOR_SYS)).toBe(true)
  expect(sys).toContain("PROJECT INSTRUCTIONS")
  expect(sys).toContain("dismiss the cookie banner first")
  expect(sys).toContain("MUST NOT")
})

test("(A5) projectInstructionsBlock: empty in -> empty out; verify vs author headers differ", () => {
  expect(projectInstructionsBlock("verify", "")).toBe("")
  expect(projectInstructionsBlock("verify", "   ")).toBe("")
  expect(projectInstructionsBlock("verify", "hi")).toContain("success signals to honor")
  expect(projectInstructionsBlock("author", "hi")).toContain("add context")
})

// ── (B) persistence + append-only audit ─────────────────────────────────────────────────────────────

test("(B1) setProjectInstructions writes the column and appends an audit row (before/after/actor)", async () => {
  const proj = await createProject("acc_instr_test", "Instr Test", "https://example.com")
  await setProjectInstructions(proj.id, "First guidance.", "admin@quantana.com.au")
  expect((await projectById(proj.id))?.instructionsMd).toBe("First guidance.")

  await setProjectInstructions(proj.id, "Second guidance.", "admin@quantana.com.au")
  const edits = await listProjectInstructionEdits(proj.id)
  expect(edits.length).toBe(2)
  expect(edits[0].beforeVal).toBeNull()
  expect(edits[0].afterVal).toBe("First guidance.")
  expect(edits[1].beforeVal).toBe("First guidance.")
  expect(edits[1].afterVal).toBe("Second guidance.")
  expect(edits[1].actor).toBe("admin@quantana.com.au")
})

test("(B2) clearing (empty) nulls the column and is audited", async () => {
  const proj = await createProject("acc_instr_test", "Instr Clear", "https://example.com")
  await setProjectInstructions(proj.id, "temp", "a@b.com")
  await setProjectInstructions(proj.id, "   ", "a@b.com") // whitespace -> cleared
  expect((await projectById(proj.id))?.instructionsMd ?? null).toBeNull()
  const edits = await listProjectInstructionEdits(proj.id)
  expect(edits[edits.length - 1].afterVal).toBeNull()
})

// ── (C) authorTrail forwards the project's instructions to the verifier ctx (the BookJoy fix path) ──

function toastPage(): BrowserPage {
  const DOM = `<html><body><form><textarea aria-label="Notes" id="notes">x</textarea><button type="submit" id="save" data-kref="e2">Save</button></form><div role="status">Customer notes updated</div></body></html>`
  return {
    url: () => "https://example.com/c/42",
    goto: async () => {}, screenshotJpeg: async () => "",
    krefSnapshot: async () => DOM,
    count: async (sel: string) => (sel === "#save" || sel === '[data-kref="e2"]' ? 1 : 0),
    fingerprint: async (sel: string) => ({ domPath: sel, ariaLabel: "Save", tagName: "BUTTON", innerText: "", inputType: null, dataTestId: null, id: null, classNames: [], isInteractive: true }),
    stableSelector: async (sel: string) => sel.replace(/\[data-kref="e\d+"\]/g, ""),
    click: async () => {},
    fill: async () => {}, selectOption: async () => {}, hover: async () => {}, keyPress: async () => {}, clearField: async () => {},
    assertVisible: async () => {}, assertTextEquals: async () => {}, assertTextContains: async () => {}, assertUrlMatches: async () => {}, assertElementCount: async () => {},
    waitMs: async () => {}, settleNetwork: async () => {}, interceptNetwork: async () => {}, guardNavigations: async () => {},
    drainDialogs: () => [],
  } as any
}

test("(C1) the verifier ctx receives the same per-project instructions the driver does", async () => {
  const proj = await createProject("acc_instr_test", "Instr Plumb", "https://example.com")
  const INSTR = "Save confirmations appear as a dismissable toast ('X updated') — treat that as success."
  await setProjectInstructions(proj.id, INSTR, "admin@quantana.com.au")

  let capturedCtx: any = null
  const verifier = async (_input: any, ctx: any) => { capturedCtx = ctx; return { achieved: true, evidenceSelector: '[role="status"]', reason: "toast seen", costUsd: 0 } }
  const page = toastPage()
  const handle: BrowserHandle = { newPage: async (_v?: TrailViewport | null) => page, close: async () => {}, kind: "local" }
  const model: AuthorModel = async () => ({ action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "saved" }, costUsd: 0 })

  await authorTrail(proj.id, { name: "Save note", objective: "save the customer notes", baseUrl: "https://example.com/c/42" }, {
    model, verifier, browserFactory: async () => handle, shotUploader: async () => ({ key: "t" }),
    sleepMs: () => Promise.resolve(), verificationVision: false as const, headless: true,
  } as any)

  expect(capturedCtx).not.toBeNull()
  expect(capturedCtx.projectInstructions).toBe(INSTR)
  // end-to-end: that captured value, fed to the verifier prompt, reaches the verifier SYSTEM block
  expect(sysOf(buildVerifyMessages(VERIFY_INPUT, capturedCtx.projectInstructions))).toContain(INSTR)
})
