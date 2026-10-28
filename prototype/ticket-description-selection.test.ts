import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const TICKET_HTML = await Bun.file(import.meta.dir + "/public/ticket.html").text()

function extractFn(src: string, sig: string) {
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
  throw new Error("unbalanced")
}

const api = new Function(
  "linkifyDescription", "kicon",
  [extractFn(HTML, "function descObsInner("), extractFn(HTML, "function descriptionBlockHtml(")].join("\n")
  + "\nreturn { descObsInner, descriptionBlockHtml }",
)((t: string) => "<linked>" + t + "</linked>", () => "<i/>") as any

test("descriptionBlockHtml: does NOT mark non-empty descriptions with title='Click to edit'", () => {
  const withText = api.descriptionBlockHtml("Sample bug description here")
  expect(withText).not.toContain('title="Click to edit"')
  expect(withText).toContain('class="tkt-desc"')
  expect(withText).toContain('Sample bug description')
  expect(withText).toContain('class="tkt-desc-edit"')
})

test("dashboard.html: obsEl click handler guards against text selection and non-empty clicks", () => {
  const buildFn = extractFn(HTML, "function buildTktDetail(t, admin, onChange, isSingle = false)")
  // Ensures selection guard is present
  expect(buildFn).toContain("const hasSelection = window.getSelection ? window.getSelection().toString().trim().length > 0 : false")
  expect(buildFn).toContain("if (hasSelection) return")
  // Ensures smartlink guard is preserved
  expect(buildFn).toContain('if (ev.target.closest("a.tkt-smartlink")) return')
  // Ensures empty-state placeholder click triggers edit mode
  expect(buildFn).toContain('if (ev.target.closest(".tkt-desc-placeholder") || descEl.classList.contains("tkt-desc-empty"))')
  // Ensures pencil icon triggers edit mode
  expect(buildFn).toContain('if (descEditBtn) descEditBtn.addEventListener("click", ev => { ev.stopPropagation(); enterDescEdit() })')
})

test("ticket.html: observation block does not have title='Click to edit' and guards against text selection", () => {
  expect(TICKET_HTML).not.toContain('<div class="body-text" id="observation" title="Click to edit">')
  expect(TICKET_HTML).toContain('<div class="body-text" id="observation">')
  expect(TICKET_HTML).toContain('$("obsEditBtn").addEventListener("click", openObsEdit);')
  expect(TICKET_HTML).toContain("var hasSelection = window.getSelection ? window.getSelection().toString().trim().length > 0 : false;")
})
