// e2e (KLAV_E2E=1): the `upload` and `waitForSelector` ops driven through the real authoring engine
// against data: URL fixtures. Mirrors trails-author.textfirst.test.ts DB setup.
import { describe, test, expect, beforeAll } from "bun:test"
import type { AuthorModel } from "./trails-author-model"
import { authorTrail } from "./trails-author"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { writeFile } from "node:fs/promises"

const file = join(tmpdir(), `klav-uploadbot-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-test-secret-key-32bytes").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const projectId = "proj_uploadbot_test"
const RUN_BROWSER = !!process.env.KLAV_E2E

describe.if(RUN_BROWSER)("upload op", () => {
  // A file input that writes the chosen filename into #chosen on change — proves the upload landed.
  const FIXTURE = "data:text/html," + encodeURIComponent(
    `<html><body><input type="file" id="f" onchange="document.getElementById('chosen').textContent=this.files[0]?this.files[0].name:''"/><div id="chosen"></div></body></html>`)

  test("drives an upload step, records it in the trajectory, and the file lands on the input", async () => {
    const tmpFixture = join(tmpdir(), `klav-fixture-${Date.now()}.txt`)
    await writeFile(tmpFixture, "hello fixture")
    let call = 0
    const model: AuthorModel = async () => {
      call++
      if (call === 1) return { action: { op: "upload", selector: "#f", value: "notes.txt", url: null, checkpoint: null, rationale: "attach the file" }, costUsd: 0 }
      if (call === 2) return { action: { op: "assert", selector: "#chosen", value: null, url: null, checkpoint: "file chosen", rationale: "file attached" }, costUsd: 0 }
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    const out = await authorTrail(
      projectId,
      { name: "upl", objective: "upload the notes file", baseUrl: FIXTURE, attachments: { "notes.txt": { key: "k", filename: "notes.txt" } } },
      { model, textFirst: false, fileResolver: async () => [tmpFixture], uploadNames: ["notes.txt"] },
    )
    expect(out.status).toBe("crystallized")
    const uploadStep = out.steps.find((s) => s.op === "upload")
    expect(uploadStep).toBeTruthy()
    expect(uploadStep!.ok).toBe(true)
  }, 60_000)

  test("upload op with no fileResolver stalls with a clear message", async () => {
    const model: AuthorModel = async () => ({ action: { op: "upload", selector: "#f", value: "x.txt", url: null, checkpoint: null, rationale: "attach" }, costUsd: 0 })
    const out = await authorTrail(projectId, { name: "upl-nofile", objective: "upload a file", baseUrl: FIXTURE }, { model, textFirst: false })
    // The failed upload step surfaces the "no attached file" error; the drive does not crystallize.
    expect(out.status).not.toBe("crystallized")
    expect(JSON.stringify(out.steps)).toContain("no attached file")
  }, 60_000)
})

describe.if(RUN_BROWSER)("waitForSelector op (chatbot reply)", () => {
  // Clicking #send reveals #reply after 300ms — a stand-in for a chatbot response rendering.
  const FIXTURE = "data:text/html," + encodeURIComponent(
    `<html><body><button id="send">Send</button><div id="reply" style="display:none">Bot: hi</div>` +
    `<script>document.getElementById('send').addEventListener('click',function(){setTimeout(function(){document.getElementById('reply').style.display='block'},300)})</script></body></html>`)

  test("waits for a dynamically-rendered reply and records the wait step", async () => {
    let call = 0
    const model: AuthorModel = async () => {
      call++
      if (call === 1) return { action: { op: "click", selector: "#send", value: null, url: null, checkpoint: null, rationale: "send message" }, costUsd: 0 }
      if (call === 2) return { action: { op: "waitForSelector", selector: "#reply", value: null, url: null, checkpoint: null, rationale: "wait for the bot reply" }, costUsd: 0 }
      if (call === 3) return { action: { op: "assert", selector: "#reply", value: null, url: null, checkpoint: "reply shown", rationale: "reply visible" }, costUsd: 0 }
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    const out = await authorTrail(projectId, { name: "bot", objective: "send a message and wait for the reply", baseUrl: FIXTURE }, { model, textFirst: false })
    expect(out.status).toBe("crystallized")
    expect(out.steps.find((s) => s.op === "waitForSelector")?.ok).toBe(true)
  }, 60_000)
})
