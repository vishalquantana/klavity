// KD-983: a Jira issue filed by Klavity names the Klavity reporter when that email belongs to a Jira
// user in the project — always as a "Reported by @Name" mention in the description, and in the Reporter
// field too when the integration account holds "Modify Reporter". Otherwise the integration user stays
// the reporter (Jira's default). A reporter Jira refuses must never cost the issue.
import { test, expect, beforeAll, afterAll, beforeEach } from "bun:test"
import { jiraConnector } from "./jira"
process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"

let server: any, base = ""
// Per-test fake Jira state.
let users: any[] = []          // what /user/assignable/search returns
let searchStatus = 200
let canModifyReporter = true   // what /mypermissions reports for MODIFY_REPORTER
let rejectReporter = false     // 400 {errors:{reporter}} when the create carries a reporter
let searches: URL[] = []
let creates: any[] = []

beforeAll(() => {
  server = Bun.serve({ port: 0, async fetch(req) {
    const u = new URL(req.url)
    if (u.pathname.endsWith("/user/assignable/search")) {
      searches.push(u)
      return searchStatus === 200 ? Response.json(users) : new Response("forbidden", { status: searchStatus })
    }
    if (u.pathname.endsWith("/mypermissions")) {
      return Response.json({ permissions: { MODIFY_REPORTER: { key: "MODIFY_REPORTER", havePermission: canModifyReporter } } })
    }
    if (u.pathname.endsWith("/issue")) {
      const body = await req.json()
      creates.push(body)
      if (rejectReporter && body.fields.reporter) {
        return Response.json({ errors: { reporter: "Field 'reporter' cannot be set. It is not on the appropriate screen, or unknown." } }, { status: 400 })
      }
      return Response.json({ key: "PROJ-1" })
    }
    return new Response("no", { status: 404 })
  }})
  base = `http://127.0.0.1:${server.port}`
})
afterAll(() => server.stop(true))
beforeEach(() => { users = []; searchStatus = 200; canModifyReporter = true; rejectReporter = false; searches = []; creates = [] })

const cfg = () => ({ host: base, email: "bot@x.co", token: "t", project_key: "PROJ" })
const ticket = (reporterEmail: string | null) =>
  ({ title: "t", body: "b", priority: null, url: null, simName: null, createdAt: Date.now(), klavityUrl: "k", reporterEmail }) as any
const jiraUser = (accountId: string, emailAddress?: string, displayName = "Balaji Genji") =>
  ({ accountId, accountType: "atlassian", active: true, displayName, ...(emailAddress ? { emailAddress } : {}) })
// The description's leading "Reported by @Name" mention node, if any.
const mentionOf = (create: any) =>
  create.fields.description.content[0].content?.find((n: any) => n.type === "mention")?.attrs ?? null

test("a reporter who is a Jira user in the project becomes the issue's reporter + is @mentioned", async () => {
  users = [jiraUser("acc-balaji", "Balaji.Genji@quantana.in")]
  const r = await jiraConnector.createIssue(ticket("balaji.genji@quantana.in"), cfg())
  expect(r.externalKey).toBe("PROJ-1")
  expect(creates).toHaveLength(1)
  expect(creates[0].fields.reporter).toEqual({ accountId: "acc-balaji" })
  expect(mentionOf(creates[0])).toEqual({ id: "acc-balaji", text: "@Balaji Genji" })
  // The lookup is scoped to users of THIS project.
  expect(searches[0].searchParams.get("query")).toBe("balaji.genji@quantana.in")
  expect(searches[0].searchParams.get("project")).toBe("PROJ")
})

test("without Modify Reporter: the reporter is @mentioned, the Reporter field is left alone (one request)", async () => {
  users = [jiraUser("acc-balaji", "balaji.genji@quantana.in")]
  canModifyReporter = false
  const r = await jiraConnector.createIssue(ticket("balaji.genji@quantana.in"), cfg())
  expect(r.externalKey).toBe("PROJ-1")
  expect(creates).toHaveLength(1)
  expect(creates[0].fields.reporter).toBeUndefined()
  expect(mentionOf(creates[0])).toEqual({ id: "acc-balaji", text: "@Balaji Genji" })
  // The original body still follows the mention line.
  expect(creates[0].fields.description.content[1].content[0].text).toBe("b")
})

test("an email with no matching Jira user leaves the default reporter and no mention", async () => {
  users = []
  await jiraConnector.createIssue(ticket("stranger@elsewhere.com"), cfg())
  expect(creates[0].fields.reporter).toBeUndefined()
  expect(mentionOf(creates[0])).toBeNull()
  expect(creates[0].fields.description.content).toHaveLength(1)
})

test("a different user's email in the results is not taken as a match", async () => {
  users = [jiraUser("acc-other", "someone.else@quantana.in"), jiraUser("acc-third", "third@quantana.in")]
  await jiraConnector.createIssue(ticket("balaji.genji@quantana.in"), cfg())
  expect(creates[0].fields.reporter).toBeUndefined()
  expect(mentionOf(creates[0])).toBeNull()
})

test("a single hit with a privacy-hidden email is accepted for the full address", async () => {
  users = [jiraUser("acc-hidden")]
  await jiraConnector.createIssue(ticket("balaji.genji@quantana.in"), cfg())
  expect(creates[0].fields.reporter).toEqual({ accountId: "acc-hidden" })
})

test("app / inactive accounts are never used as the reporter", async () => {
  users = [
    { accountId: "acc-app", accountType: "app", active: true, emailAddress: "balaji.genji@quantana.in" },
    { accountId: "acc-gone", accountType: "atlassian", active: false, emailAddress: "balaji.genji@quantana.in" },
  ]
  await jiraConnector.createIssue(ticket("balaji.genji@quantana.in"), cfg())
  expect(creates[0].fields.reporter).toBeUndefined()
  expect(mentionOf(creates[0])).toBeNull()
})

test("an anonymous report skips the lookup entirely", async () => {
  await jiraConnector.createIssue(ticket(null), cfg())
  expect(searches).toHaveLength(0)
  expect(creates[0].fields.reporter).toBeUndefined()
  expect(mentionOf(creates[0])).toBeNull()
})

test("a failed user lookup falls back to the default reporter and still files the issue", async () => {
  searchStatus = 403
  const r = await jiraConnector.createIssue(ticket("balaji.genji@quantana.in"), cfg())
  expect(r.externalKey).toBe("PROJ-1")
  expect(creates[0].fields.reporter).toBeUndefined()
})

test("if Jira refuses the reporter field anyway, the issue is re-filed once without it (mention kept)", async () => {
  users = [jiraUser("acc-balaji", "balaji.genji@quantana.in")]
  rejectReporter = true
  const r = await jiraConnector.createIssue(ticket("balaji.genji@quantana.in"), cfg())
  expect(r.externalKey).toBe("PROJ-1")
  expect(creates).toHaveLength(2)
  expect(creates[0].fields.reporter).toEqual({ accountId: "acc-balaji" })
  expect(creates[1].fields.reporter).toBeUndefined()
  expect(mentionOf(creates[1])).toEqual({ id: "acc-balaji", text: "@Balaji Genji" })
})
