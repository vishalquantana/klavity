// The ticket's Comments tab follows Jira's layout: avatar + bold name + time (+ "Edited") on one line, the text, then plain
// "Edit · Delete" links; a one-line "Add a comment…" bar on top that expands to an editor with Save / Cancel; a Newest / Oldest
// first toggle; delete asks inline instead of with a browser popup.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function extractFn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const esc = (x: any) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const api = new Function("esc", "ago",
  extractFn(HTML, "function cmtAvatarHtml(") + "\n" + extractFn(HTML, "function cmtHeadHtml(") + "\nreturn { cmtAvatarHtml, cmtHeadHtml }")(esc, () => "3 wks ago") as any

test("avatar: the person's initial on a colour that is the same every time for the same address", () => {
  const a = api.cmtAvatarHtml("balaji.genji@quantana.in")
  expect(a).toContain('class="tkt-jc-av"'); expect(a).toContain(">B</div>")
  expect(api.cmtAvatarHtml("balaji.genji@quantana.in")).toBe(a)                       // stable
  const colour = (h: string) => /background:(#[0-9a-f]{6})/.exec(h)![1]
  const colours = new Set(["arun@x.io", "raghu@x.io", "vishal@x.io", "ritu@x.io", "divya@x.io", "sushma@x.io"].map(e => colour(api.cmtAvatarHtml(e))))
  expect(colours.size).toBeGreaterThan(1)                                               // different people are not all the same colour
  expect(api.cmtAvatarHtml(null)).toContain(">?</div>"); expect(api.cmtAvatarHtml("")).toContain(">?</div>")
})
test("header: bold name (handle), time with the full date on hover, and an 'Edited' tag only when edited", () => {
  const plain = api.cmtHeadHtml({ author: "balaji.genji@quantana.in", createdAt: Date.UTC(2026, 9, 12, 8, 30), editedAt: null })
  expect(plain).toContain('<span class="tkt-jc-name">balaji.genji</span>')
  expect(plain).toContain('class="tkt-jc-time" title="'); expect(plain).toContain(">3 wks ago</span>")
  expect(plain).not.toContain("Edited")
  expect(api.cmtHeadHtml({ author: "a@b.c", createdAt: 1, editedAt: 5 })).toContain('<span class="tkt-cmt-edited">Edited</span>')
  expect(api.cmtHeadHtml({ author: null, createdAt: 1 })).toContain(">Anonymous</span>")
  expect(api.cmtHeadHtml({ author: "<img onerror=x>@b.c", createdAt: 1 })).not.toContain("<img")      // escaped
})
test("each comment: avatar column + main column, with plain Edit and Delete links (no hover icons) and an inline delete confirmation", () => {
  expect(HTML).toContain("el.className = \"tkt-tl-item tkt-jc\"")
  expect(HTML).toContain("el.innerHTML = cmtAvatarHtml(item.author) + '<div class=\"tkt-jc-main\">' + bodyHtml + '</div>'")
  expect(HTML).toContain('class="tkt-jc-edit" aria-label="Edit comment">Edit</button>')
  expect(HTML).toContain('class="tkt-jc-del" aria-label="Delete comment">Delete</button>')
  expect(HTML).toContain('Delete this comment? <button type="button" class="tkt-jc-del-yes">Delete</button><button type="button" class="tkt-jc-del-no">Cancel</button>')
  expect(HTML).not.toContain("window.confirm(\"Delete this comment?")                  // no browser popup any more
})
test("composer: one-line bar that expands on focus, with Save / Cancel / Attach; Escape closes only the box", () => {
  expect(HTML).toContain('<div class="tkt-comment-form collapsed">')
  expect(HTML).toContain('placeholder="Add a comment… @ to tag"')
  expect(HTML).toContain('<button class="btn btn-indigo btn-sm tkt-comment-submit">Save</button>')
  expect(HTML).toContain('class="btn btn-ghost btn-sm tkt-comment-cancel">Cancel</button>')
  expect(HTML).toContain('if (ta) ta.addEventListener("focus", expandComposer)')
  expect(HTML).toContain('else if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); collapseComposer() }')   // must not also leave the page
  expect(HTML).toContain('if (cmtForm) cmtForm.classList.add("collapsed")')           // back to the bar after posting
  expect(HTML).toContain(".tkt-comment-form.collapsed .tkt-comment-row,")
})
test("the Comments tab puts the composer above the list, with a Newest / Oldest first toggle remembered per browser", () => {
  const i = HTML.indexOf('<div class="t3-tabpanel hide" data-panel="comments" role="tabpanel">')
  const panel = HTML.slice(i, i + 700)
  expect(panel.indexOf("${_composerHtml}")).toBeGreaterThan(-1)
  expect(panel.indexOf("${_composerHtml}")).toBeLessThan(panel.indexOf("tkt-cmt-list"))
  expect(panel).toContain('class="tkt-cmt-sort"')
  expect(HTML).toContain('localStorage.getItem("klav.cmtOrder") !== "oldest"')
  expect(HTML).toContain('if (cmtNewestFirst) cmts.reverse()')
  expect(HTML).toContain('cmtNewestFirst ? "Newest first ↓" : "Oldest first ↑"')
})
