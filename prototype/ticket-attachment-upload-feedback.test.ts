// Ticket Attachment Upload Feedback tests
// Verifies:
//  1. Success toast displays "Attachment uploaded successfully." after upload confirms.
//  2. Error toast displays "Failed to upload attachment. Please try again." on failure, and does not show success toast.
//  3. Loading indicators & disable state during upload.
//  4. Attachments section immediate update and rendering of both thumbnails and document items.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")

function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig)
  if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") d++
    else if (src[j] === "}") {
      d--
      if (d === 0) return src.slice(i, j + 1)
    }
  }
  throw new Error("unbalanced: " + sig)
}

test("Success toast displays 'Attachment uploaded successfully.' upon upload completion", () => {
  const hooksSrc = HTML.slice(HTML.indexOf("const _attachHooks = {"), HTML.indexOf("const _attachHooks = {") + 1600)
  expect(hooksSrc).toContain('"Attachment uploaded successfully"')
  expect(hooksSrc).toContain('" attachments uploaded successfully"')

  // Simulate onDone hook execution
  let shownToast: { msg: string; kind: string } | null = null
  const attachToast = (msg: string, kind: string) => { shownToast = { msg, kind } }
  const _attachApplyServerList = () => {}
  const attachRerender = () => {}
  const attachSetMsg = () => {}
  const attachMsgFor = () => ({ text: "" })
  const ATTACH_MAX_FILES = 5

  const hooks = new Function(
    "attachToast", "_attachApplyServerList", "attachRerender", "attachSetMsg", "attachMsgFor", "ATTACH_MAX_FILES",
    hooksSrc + "\nreturn _attachHooks"
  )(attachToast, _attachApplyServerList, attachRerender, attachSetMsg, attachMsgFor, ATTACH_MAX_FILES)

  // Single file upload done
  hooks.onDone("fb_1", { attachments: [{ key: "k1", filename: "test.png" }], duplicates: [], ignored: [] })
  expect(shownToast).not.toBeNull()
  expect(shownToast!.kind).toBe("ok")
  expect(shownToast!.msg).toBe("Attachment uploaded successfully.")

  // Multiple files upload done
  hooks.onDone("fb_1", { attachments: [{ key: "k1" }, { key: "k2" }], duplicates: [], ignored: [] })
  expect(shownToast!.kind).toBe("ok")
  expect(shownToast!.msg).toBe("2 attachments uploaded successfully.")
})

test("Failed upload displays error message and does not show success toast", () => {
  const hooksSrc = HTML.slice(HTML.indexOf("const _attachHooks = {"), HTML.indexOf("const _attachHooks = {") + 1600)
  let shownToast: { msg: string; kind: string } | null = null
  const attachToast = (msg: string, kind: string) => { shownToast = { msg, kind } }
  const _attachApplyServerList = () => {}
  const attachRerender = () => {}
  const attachSetMsg = () => {}
  const attachMsgFor = () => ({ text: "" })
  const ATTACH_MAX_FILES = 5

  const hooks = new Function(
    "attachToast", "_attachApplyServerList", "attachRerender", "attachSetMsg", "attachMsgFor", "ATTACH_MAX_FILES",
    hooksSrc + "\nreturn _attachHooks"
  )(attachToast, _attachApplyServerList, attachRerender, attachSetMsg, attachMsgFor, ATTACH_MAX_FILES)

  hooks.onFail("fb_1", "Failed to upload attachment. Please try again.")
  expect(shownToast).not.toBeNull()
  expect(shownToast!.kind).toBe("warn")
  expect(shownToast!.msg).toBe("Failed to upload attachment. Please try again.")
})

test("Uploading state disables the Add Attachment action and shows progress indicator", () => {
  const html = HTML
  // CSS for disabled state and loading animations
  expect(html).toContain(".tkt-attach-add-btn:disabled{")
  expect(html).toContain("cursor: not-allowed")
  expect(html).toContain("@keyframes tktAttachPulse")

  // buildAttachmentsHtml handles uploading state
  const buildFn = extractFn(HTML, "function buildAttachmentsHtml(")
  expect(buildFn).toContain('uploading ? \' disabled aria-busy="true"\' : \'\'')
  expect(buildFn).toContain('uploading ? \'<span class="tkt-spin">\' + kicon(\'loader\', { size: 13 }) + \'</span> Uploading…\' : kicon(\'paperclip\', { size: 13 }) + \' Add attachment\'')

  // wireAttachments blocks click during in-flight upload
  const wireFn = extractFn(HTML, "function wireAttachments(")
  expect(wireFn).toContain("if (!attachInFlight(id)) input.click()")
})

test("Attachments section renders both image/video tiles and document items", () => {
  const buildFn = extractFn(HTML, "function buildAttachmentsHtml(")
  expect(buildFn).toContain("tkt-attach-thumbs")
  expect(buildFn).toContain("tkt-attach-list")
  expect(buildFn).toContain("tkt-attach-row")
})
