// QPQ-31 project contacts: a reporter who types a new address in the Snap composer can ask to be
// added as a project CONTACT — visible and taggable inside the project, with NO access to it.
//
// The security property is the whole point of the design, so it is tested first and hardest: the
// composer is anonymous and cross-origin, so if contact creation could mint a project_members (or
// account_members) row, any visitor to the customer's site could grant themselves the project's
// ticket board. These tests pin that it cannot.
import { test, expect } from "bun:test"

const DB = await Bun.file(import.meta.dir + "/lib/db.ts").text()
const SERVER = await Bun.file(import.meta.dir + "/server.ts").text()
const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const MODAL = await Bun.file(import.meta.dir + "/../packages/core/src/modal.ts").text()
const WIDGET = await Bun.file(import.meta.dir + "/../packages/sdk/src/widget.ts").text()

// ── the security property ────────────────────────────────────────────────────
test("creating a contact never writes a membership row", () => {
  // Isolate the submit-path block that reacts to the flag and assert it only upserts a contact.
  const block = SERVER.match(/if \(wantsContact\) \{[\s\S]*?\n                \}/)
  expect(block).not.toBeNull()
  expect(block![0]).toContain("upsertProjectContact(")
  expect(block![0]).not.toContain("addProjectMember")
  expect(block![0]).not.toContain("ensureAccountMember")
  expect(block![0]).not.toContain("account_members")
  expect(block![0]).not.toContain("project_members")
  expect(block![0]).not.toContain("upsertUser")
})

test("the contacts table grants nothing — no role column, separate from members", () => {
  const schema = DB.match(/CREATE TABLE IF NOT EXISTS project_contacts \(([\s\S]*?)\)`/)
  expect(schema).not.toBeNull()
  const cols = schema![1]
  expect(cols).toContain("project_id")
  expect(cols).toContain("email")
  expect(cols).toContain("UNIQUE(project_id, email)")
  // A role/permission column would make this a membership table by the back door.
  expect(cols).not.toContain("role")
})

test("contact creation requires a VALID reporter email and the explicit flag", () => {
  expect(SERVER).toContain('const wantsContact = String(form.get("create_contact") || "") === "1"')
  // Nested inside the validReporterEmail branch, so a junk or absent address registers nothing.
  const persist = SERVER.match(/if \(feedbackId && validReporterEmail\) \{[\s\S]*?\n              \}/)
  expect(persist).not.toBeNull()
  expect(persist![0]).toContain("if (wantsContact) {")
})

test("there is no standalone anonymous endpoint that mints contacts", () => {
  // Creation is tied to an actual report so it inherits the submit path's rate limits. A bare
  // POST /api/.../contact(s) route would let anyone bulk-create rows without filing anything.
  expect(SERVER).not.toMatch(/path === "\/api\/widget\/contact"/)
  expect(SERVER).not.toMatch(/path === "\/api\/contacts"/)
})

test("the composer never asks the server whether an email exists (no enumeration oracle)", () => {
  // The suggestion is offered for any well-formed address; nothing queries existence.
  expect(MODAL).not.toContain("/api/widget/known-email")
  expect(MODAL).not.toMatch(/email-exists|emailExists|checkEmail\(/)
})

// ── the upsert ───────────────────────────────────────────────────────────────
test("upsertProjectContact is idempotent and validates the address", () => {
  const fn = DB.match(/export async function upsertProjectContact\([\s\S]*?\n\}/)
  expect(fn).not.toBeNull()
  expect(fn![0]).toContain("ON CONFLICT(project_id, email) DO UPDATE SET")
  expect(fn![0]).toContain("COALESCE(excluded.name, project_contacts.name)")  // never blanks a known name
  expect(fn![0]).toContain("toLowerCase()")                                    // one row per address
  expect(fn![0]).toMatch(/\^\[\^@/)                                            // shape-checked
  expect(fn![0]).toContain("length > 200")                                     // bounded
})

// ── the composer UI ──────────────────────────────────────────────────────────
test("the suggestion sits under the Email field and names the typed address", () => {
  const emailIdx = MODAL.indexOf('id="klavity-remail"')
  const suggIdx = MODAL.indexOf('id="klavity-remail-sugg"')
  expect(emailIdx).toBeGreaterThan(-1)
  expect(suggIdx).toBeGreaterThan(emailIdx)
  expect(MODAL).toContain('id="klavity-remail-addcontact"')
  expect(MODAL).toContain("as a contact")
})

test("the choice is a toggle and cannot outlive the address it was made for", () => {
  expect(MODAL).toContain("createContact = !createContact")
  // retyping the address clears a pending choice (vl is the lower-cased current value)
  expect(MODAL).toContain("if (createContact && vl !== contactFor) { createContact = false; contactFor = '' }")
  // and the submit snapshot re-checks the pairing
  expect(MODAL).toContain("emailSnapshot.toLowerCase() === contactFor")
})

test("the flag only ships alongside an email", () => {
  expect(WIDGET).toContain('if (payload.reporterEmail && payload.createContact) fd.set("create_contact", "1")')
})

// ── visible + taggable in the project ────────────────────────────────────────
test("contacts feed the @mention and assignee pickers", () => {
  const fn = HTML.match(/function projectMemberEmails\(\)[\s\S]*?\n\}/)
  expect(fn).not.toBeNull()
  expect(fn![0]).toContain("state.contacts")
  expect(fn![0]).toContain("fromContacts")
})

test("the dashboard payload sends contacts as their own array, not merged into members", () => {
  expect(SERVER).toContain("const contacts = (await listProjectContacts(projectId))")
  expect(SERVER).toContain("members, contacts,")
  // the empty-project early return carries the key too, so the client never reads undefined
  expect(SERVER).toContain("members: [], contacts: [],")
})

test("a contact is labelled as such so nobody mistakes one for a teammate", () => {
  expect(HTML).toContain("tkt-contact-tag")
  expect(HTML).toContain("function isProjectContact(")
  // isProjectContact must exclude real members, or a teammate would be mislabelled
  const fn = HTML.match(/function isProjectContact\(email\)[\s\S]*?\n\}/)
  expect(fn![0]).toContain("state.members")
  expect(fn![0]).toContain("return false")
})

test("the ticket shows the contact's name when known, with the address beneath", () => {
  expect(HTML).toContain("function contactNameFor(")
  expect(HTML).toContain("contactNameFor(t.reporterEmail) || t.reporterEmail")
  expect(HTML).toContain("tkt-reporter-sub")
})
