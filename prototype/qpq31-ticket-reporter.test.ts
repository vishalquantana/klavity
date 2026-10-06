// QPQ-31: the email the reporter types into the composer's Email field must surface in the ticket
// detail popup as "Reporter", directly below Assignee.
//
// The chain is: composer Email field -> reporter_email (multipart) -> setFeedbackContactEmail writes
// feedback.contact_email -> rowToFeedback maps it to FeedbackRow.contactEmail -> the /api/dashboard
// ticket projection sends it as `reporterEmail` -> the detail panel renders the Reporter pair.
// Before this change the dashboard payload carried NO email field at all, so the panel had nothing to
// show — these tests pin each link so a future refactor can't quietly drop one.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const SERVER = await Bun.file(import.meta.dir + "/server.ts").text()
const DB = await Bun.file(import.meta.dir + "/lib/db.ts").text()
const rule = (sel: string) => HTML.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\{[^}]*\\}"))?.[0] || ""

test("the detail panel renders a Reporter property pair", () => {
  expect(HTML).toContain('<span class="tkt-prop-lb">Reporter</span>')
  expect(HTML).toContain('class="tkt-reporter"')
})

test("Reporter sits BELOW Assignee and above Labels in the property grid", () => {
  const assignee = HTML.indexOf('<span class="tkt-prop-lb">Assignee</span>')
  const reporter = HTML.indexOf('<span class="tkt-prop-lb">Reporter</span>')
  const labels = HTML.indexOf('<span class="tkt-prop-lb">Labels</span>')
  expect(assignee).toBeGreaterThan(-1)
  expect(reporter).toBeGreaterThan(assignee)
  expect(labels).toBeGreaterThan(reporter)
})

test("the whole pair is omitted when the reporter stayed anonymous (no dangling empty label)", () => {
  // The label and value must live INSIDE the ${t.reporterEmail ? ... : ""} guard, so an anonymous
  // report renders neither half.
  const guard = HTML.match(/\$\{t\.reporterEmail \? `<span class="tkt-prop-lb">Reporter<\/span>[\s\S]*?` : ""\}/)
  expect(guard).not.toBeNull()
  expect(guard![0]).toContain('class="tkt-reporter"')
})

test("the address is plain escaped text, not a link", () => {
  const guard = HTML.match(/\$\{t\.reporterEmail \? `<span class="tkt-prop-lb">Reporter<\/span>[\s\S]*?` : ""\}/)![0]
  // Reporter is a fact about the report, shown as text at the same size as Assignee -- no mailto.
  expect(guard).not.toContain("mailto:")
  expect(guard).not.toContain("<a ")
  // QPQ-31 contacts: the link text is the contact's NAME when we know one, else the address — either way
  // it goes through esc(). The address itself also appears beneath the name, likewise escaped.
  expect(guard).toContain("${esc(contactNameFor(t.reporterEmail) || t.reporterEmail)}</span>")
  expect(guard).toContain('<span class="tkt-reporter-sub">${esc(t.reporterEmail)}</span>')
  // nothing in the pair interpolates the address (or a contact name) un-escaped
  expect(guard).not.toContain("${t.reporterEmail}")
  expect(guard).not.toContain("${contactNameFor(t.reporterEmail)}")
})

test("the Reporter value truncates instead of widening the property grid", () => {
  const css = rule(".tkt-reporter")
  expect(css).toContain("text-overflow:ellipsis")
  expect(css).toContain("white-space:nowrap")
  expect(css).toContain("min-width:0")
})

test("/api/dashboard projects reporterEmail onto every ticket", () => {
  expect(SERVER).toContain("reporterEmail: f.contactEmail || f.actorEmail || null,")
})

test("the TYPED address wins over the signed-in filer, on every surface", () => {
  // The reporter's own email is the attribution people want; the signed-in account is only a fallback
  // for when they typed nothing. All four projections must agree or the surfaces contradict each other.
  expect(SERVER).toContain("reporterEmail: f.contactEmail || f.actorEmail || null,")          // /api/dashboard
  expect(SERVER).toContain("reporterEmail: fbRow.contactEmail || fbRow.actorEmail || null,")  // /api/feedback/:id
  expect(SERVER).toContain("reporterEmail: r.contactEmail || r.actorEmail || null,")          // page-bugs (extension)
  expect(DB).toContain("(x.contact_email ?? x.actor_email)")                                  // board/list
  // and none of them may still be actor-first
  expect(SERVER).not.toContain("reporterEmail: f.actorEmail || f.contactEmail")
  expect(SERVER).not.toContain("reporterEmail: fbRow.actorEmail || fbRow.contactEmail")
  expect(SERVER).not.toContain("reporterEmail: r.actorEmail || r.contactEmail")
  expect(DB).not.toContain("(x.actor_email ?? x.contact_email)")
})

test("the board/list endpoint projects it too — the popup opens from there as well", () => {
  // buildTktDetail(t, ...) is called from the list row, the single-ticket view AND the kanban card, so a
  // projection that only covered /api/dashboard would leave Reporter blank on the board.
  expect(DB).toContain("reporterEmail: (x.contact_email ?? x.actor_email) != null ? String(x.contact_email ?? x.actor_email) : null,")
})

test("FeedbackRow carries contactEmail and rowToFeedback maps the column", () => {
  expect(DB).toContain("contactEmail: string | null")
  expect(DB).toContain("contactEmail: x.contact_email != null ? String(x.contact_email) : null,")
})

test("the reporter email is still persisted from the submit path", () => {
  // Guards the far end of the chain: an email that never reaches contact_email can never be shown.
  expect(SERVER).toContain("setFeedbackContactEmail(feedbackId, projectId, reporterEmail)")
})

test("Reporter uses the same type as the Assignee control, so the rows read as siblings", () => {
  const rep = HTML.match(/\.tkt-reporter\{[^}]*\}/)?.[0] || ""
  const asg = HTML.match(/\.tkt-assignee-ctrl\{[^}]*\}/)?.[0] || ""
  for (const decl of ["font-size:13px", "font-weight:600", "font-family:var(--body)"]) {
    expect(asg).toContain(decl)   // the reference
    expect(rep).toContain(decl)   // and Reporter matches it
  }
})
