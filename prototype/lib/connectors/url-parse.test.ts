import { test, expect } from "bun:test"
import { parsePlaneUrl, parseJiraUrl, parseLinearUrl, parseTrackerUrl } from "./url-parse"

// ── Plane ───────────────────────────────────────────────────────────────────
const PLANE_UUID = "3f8a1c2d-4b5e-6a7f-8091-a2b3c4d5e6f7"

test("plane: full issues URL → host + workspace + project_id", () => {
  expect(
    parsePlaneUrl(`https://plane.quantana.top/qbuilder/projects/${PLANE_UUID}/issues/`),
  ).toEqual({
    host: "https://plane.quantana.top",
    workspace: "qbuilder",
    project_id: PLANE_UUID,
  })
})

test("plane: no trailing slash", () => {
  expect(
    parsePlaneUrl(`https://plane.quantana.top/qbuilder/projects/${PLANE_UUID}`),
  ).toEqual({
    host: "https://plane.quantana.top",
    workspace: "qbuilder",
    project_id: PLANE_UUID,
  })
})

test("plane: deeper path (single issue) still resolves", () => {
  expect(
    parsePlaneUrl(`https://plane.quantana.top/qbuilder/projects/${PLANE_UUID}/issues/42/`),
  ).toEqual({
    host: "https://plane.quantana.top",
    workspace: "qbuilder",
    project_id: PLANE_UUID,
  })
})

test("plane: Plane Cloud host", () => {
  expect(
    parsePlaneUrl(`https://app.plane.so/my-workspace/projects/${PLANE_UUID}/issues/`),
  ).toEqual({
    host: "https://app.plane.so",
    workspace: "my-workspace",
    project_id: PLANE_UUID,
  })
})

test("plane: scheme-less input gets https prepended", () => {
  expect(
    parsePlaneUrl(`plane.quantana.top/qbuilder/projects/${PLANE_UUID}/issues/`),
  ).toEqual({
    host: "https://plane.quantana.top",
    workspace: "qbuilder",
    project_id: PLANE_UUID,
  })
})

test("plane: non-UUID project segment → project_id omitted, host+workspace kept", () => {
  const out = parsePlaneUrl("https://plane.quantana.top/qbuilder/projects/not-a-uuid/issues/")
  expect(out.host).toBe("https://plane.quantana.top")
  expect(out.workspace).toBe("qbuilder")
  expect(out.project_id).toBeUndefined()
})

test("plane: bare origin → host only", () => {
  expect(parsePlaneUrl("https://plane.quantana.top")).toEqual({
    host: "https://plane.quantana.top",
  })
})

// ── Jira ────────────────────────────────────────────────────────────────────
test("jira: software project URL → host + project_key", () => {
  expect(
    parseJiraUrl("https://myorg.atlassian.net/jira/software/projects/PROJ/boards/1"),
  ).toEqual({
    host: "https://myorg.atlassian.net",
    project_key: "PROJ",
  })
})

test("jira: browse issue URL → host + project_key (strip issue number)", () => {
  expect(parseJiraUrl("https://myorg.atlassian.net/browse/ABC-123")).toEqual({
    host: "https://myorg.atlassian.net",
    project_key: "ABC",
  })
})

test("jira: company-managed /c/projects path", () => {
  expect(
    parseJiraUrl("https://myorg.atlassian.net/jira/software/c/projects/DEV/issues"),
  ).toEqual({
    host: "https://myorg.atlassian.net",
    project_key: "DEV",
  })
})

test("jira: lowercase key is uppercased", () => {
  expect(parseJiraUrl("https://myorg.atlassian.net/browse/team-7")).toEqual({
    host: "https://myorg.atlassian.net",
    project_key: "TEAM",
  })
})

test("jira: bare origin → host only, no key", () => {
  const out = parseJiraUrl("https://myorg.atlassian.net")
  expect(out.host).toBe("https://myorg.atlassian.net")
  expect(out.project_key).toBeUndefined()
})

// ── Linear ──────────────────────────────────────────────────────────────────
test("linear: project URL → workspace + project", () => {
  expect(
    parseLinearUrl("https://linear.app/acme/project/website-redesign-9f2c"),
  ).toEqual({
    workspace: "acme",
    project: "website-redesign-9f2c",
  })
})

test("linear: team URL → workspace + team", () => {
  expect(parseLinearUrl("https://linear.app/acme/team/ENG/active")).toEqual({
    workspace: "acme",
    team: "ENG",
  })
})

test("linear: issue URL → workspace + team (strip issue number)", () => {
  expect(
    parseLinearUrl("https://linear.app/acme/issue/ENG-123/some-title"),
  ).toEqual({
    workspace: "acme",
    team: "ENG",
  })
})

test("linear: non-linear host → empty", () => {
  expect(parseLinearUrl("https://notlinear.example.com/acme/team/ENG")).toEqual({})
})

// ── Junk / edge inputs → empty ────────────────────────────────────────────────
for (const junk of ["", "   ", "not a url", "hello", "randomtext", "://///"]) {
  test(`junk → empty: ${JSON.stringify(junk)}`, () => {
    expect(parsePlaneUrl(junk)).toEqual({})
    expect(parseJiraUrl(junk)).toEqual({})
    expect(parseLinearUrl(junk)).toEqual({})
  })
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
test("parseTrackerUrl dispatches by type", () => {
  expect(
    parseTrackerUrl("plane", `https://plane.quantana.top/qbuilder/projects/${PLANE_UUID}/issues/`),
  ).toEqual({
    host: "https://plane.quantana.top",
    workspace: "qbuilder",
    project_id: PLANE_UUID,
  })
  expect(parseTrackerUrl("jira", "https://myorg.atlassian.net/browse/ABC-1")).toEqual({
    host: "https://myorg.atlassian.net",
    project_key: "ABC",
  })
  expect(parseTrackerUrl("github", "https://github.com/owner/repo")).toEqual({})
  expect(parseTrackerUrl("webhook", "https://example.com/hook")).toEqual({})
})
