import { expect, test } from "bun:test"
import { buildStatusChangeEmail, notifyStatusChange, statusChangeRecipients } from "./status-notification"

// KD-221: a status change emails the ticket's assignee and reporter — never the person who made the change.
const A = "dev@acme.test", R = "customer@client.test", X = "lead@acme.test"

test("someone else changes status → assignee AND reporter are emailed", () => {
  expect(statusChangeRecipients({ actorEmail: X, assignee: A, reporter: R })).toEqual([
    { email: A, role: "assignee" }, { email: R, role: "reporter" },
  ])
})

test("the assignee changes status → only the reporter is emailed", () => {
  expect(statusChangeRecipients({ actorEmail: A, assignee: A, reporter: R })).toEqual([{ email: R, role: "reporter" }])
})

test("the reporter changes status → only the assignee is emailed", () => {
  expect(statusChangeRecipients({ actorEmail: R, assignee: A, reporter: R })).toEqual([{ email: A, role: "assignee" }])
})

test("actor matching is case-insensitive; missing/invalid addresses are skipped; one person in both roles gets one email", () => {
  expect(statusChangeRecipients({ actorEmail: "DEV@acme.test", assignee: A, reporter: R })).toEqual([{ email: R, role: "reporter" }])
  expect(statusChangeRecipients({ actorEmail: X, assignee: null, reporter: "not-an-email" })).toEqual([])
  expect(statusChangeRecipients({ actorEmail: X, assignee: A, reporter: A })).toEqual([{ email: A, role: "assignee" }])
  expect(statusChangeRecipients({ actorEmail: null, assignee: A, reporter: R }).length).toBe(2) // tracker sync: no actor
})

test("the email names the transition, the ticket, who changed it and why the recipient got it", () => {
  const m = buildStatusChangeEmail({ role: "reporter", ticketTitle: "Pay <button> broken", projectName: "Shop", fromStatus: "open", toStatus: "in_progress", changedBy: A, ticketUrl: "https://k.test/t/fb_1" })
  expect(m.subject).toBe("Status changed to In Progress: Pay <button> broken")
  expect(m.text).toContain("A ticket you reported in Shop moved from Open to In Progress by dev@acme.test.")
  expect(m.html).toContain("Pay &lt;button&gt; broken") // escaped
  expect(m.html).toContain("https://k.test/t/fb_1")
  expect(m.html).toContain("you're the reporter")
  expect(buildStatusChangeEmail({ role: "assignee", ticketTitle: "T", toStatus: "blocked", ticketUrl: "u" }).text).toContain("A ticket assigned to you moved to Blocked.")
})

const deps = (sent: any[]) => ({
  send: async (to: string, mail: any) => { sent.push({ to, subject: mail.subject }) },
  linkFor: async (e: string) => `https://k.test/${e === R ? "t/fb_1" : "acme/KD-1"}`,
  canEmail: () => true,
})

test("notifyStatusChange sends one email per recipient, with a per-recipient link", async () => {
  const sent: any[] = []
  const links: string[] = []
  const d = deps(sent)
  const r = await notifyStatusChange({ actorEmail: X, assignee: A, reporter: R, fromStatus: "open", toStatus: "blocked", ticketTitle: "T" },
    { ...d, linkFor: async (e) => { const l = await d.linkFor(e); links.push(l); return l } })
  expect(r.map(x => x.email)).toEqual([A, R])
  expect(sent.map(s => s.to)).toEqual([A, R])
  expect(links).toEqual(["https://k.test/acme/KD-1", "https://k.test/t/fb_1"])
})

test("→ Done: a reporter already getting the 'Fixed' email isn't emailed twice; the assignee still is", async () => {
  const sent: any[] = []
  await notifyStatusChange({ actorEmail: X, assignee: A, reporter: R, contactEmail: R, fromStatus: "in_progress", toStatus: "done", ticketTitle: "T" }, deps(sent))
  expect(sent.map(s => s.to)).toEqual([A])
  // …but when the reporter is only the filer (no contact email → no Fixed email), they get the status email
  const sent2: any[] = []
  await notifyStatusChange({ actorEmail: X, assignee: A, reporter: R, contactEmail: null, fromStatus: "in_progress", toStatus: "done", ticketTitle: "T" }, deps(sent2))
  expect(sent2.map(s => s.to)).toEqual([A, R])
})

test("nothing is sent without an email key, for a no-op change, and a failed send doesn't stop the others", async () => {
  const sent: any[] = []
  expect(await notifyStatusChange({ actorEmail: X, assignee: A, reporter: R, fromStatus: "open", toStatus: "done", ticketTitle: "T" }, { ...deps(sent), canEmail: () => false })).toEqual([])
  expect(await notifyStatusChange({ actorEmail: X, assignee: A, reporter: R, fromStatus: "open", toStatus: "open", ticketTitle: "T" }, deps(sent))).toEqual([])
  expect(sent.length).toBe(0)
  const warns: any[] = []
  const r = await notifyStatusChange({ actorEmail: X, assignee: A, reporter: R, fromStatus: "open", toStatus: "blocked", ticketTitle: "T" }, {
    ...deps(sent), warn: (...a: any[]) => warns.push(a),
    send: async (to) => { if (to === A) throw new Error("SendGrid 500"); sent.push({ to }) },
  })
  expect(r.map(x => x.email)).toEqual([R])
  expect(warns.length).toBe(1)
})

test("the existing 'Fixed' email isn't sent to a reporter who closed the ticket themselves", async () => {
  const { shouldNotifyReporterOnFix } = await import("./fixed-notification")
  expect(shouldNotifyReporterOnFix({ contactEmail: R, previousStatus: "open", nextStatus: "done", actorEmail: X })).toBe(true)
  expect(shouldNotifyReporterOnFix({ contactEmail: R, previousStatus: "open", nextStatus: "done", actorEmail: "Customer@Client.test" })).toBe(false)
  expect(shouldNotifyReporterOnFix({ contactEmail: R, previousStatus: "open", nextStatus: "done" })).toBe(true) // tracker sync
})
