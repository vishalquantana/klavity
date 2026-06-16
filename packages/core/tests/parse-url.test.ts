// packages/core/tests/parse-url.test.ts
import { describe, it, expect } from 'vitest'
import { parsePlaneUrl, parseJiraUrl, parseGithubUrl } from '../src/parse-url'

describe('parsePlaneUrl', () => {
  it('splits a self-hosted Plane project URL (the real one)', () => {
    expect(parsePlaneUrl('https://plane.quantana.top/qbuilder/projects/b6f1d657-5bec-466c-aefe-738311001d8f/issues/'))
      .toEqual({ host: 'https://plane.quantana.top', workspace: 'qbuilder', projectId: 'b6f1d657-5bec-466c-aefe-738311001d8f' })
  })
  it('handles trailing/extra path segments and no trailing slash', () => {
    expect(parsePlaneUrl('https://plane.quantana.top/qbuilder/projects/b6f1d657-5bec-466c-aefe-738311001d8f'))
      .toEqual({ host: 'https://plane.quantana.top', workspace: 'qbuilder', projectId: 'b6f1d657-5bec-466c-aefe-738311001d8f' })
    expect(parsePlaneUrl('https://plane.quantana.top/qbuilder/projects/ABC/issues/issue-xyz')?.projectId).toBe('ABC')
  })
  it('maps Plane Cloud (app.plane.so) UI host to the api.plane.so API base', () => {
    expect(parsePlaneUrl('https://app.plane.so/acme/projects/xyz/issues/'))
      .toEqual({ host: 'https://api.plane.so', workspace: 'acme', projectId: 'xyz' })
  })
  it('returns null for non-project / garbage URLs', () => {
    expect(parsePlaneUrl('https://plane.quantana.top/qbuilder')).toBeNull()
    expect(parsePlaneUrl('not a url')).toBeNull()
    expect(parsePlaneUrl('')).toBeNull()
  })
})

describe('parseJiraUrl', () => {
  it('extracts base + project key from a board/project URL', () => {
    expect(parseJiraUrl('https://acme.atlassian.net/jira/software/projects/PROJ/boards/1'))
      .toEqual({ baseUrl: 'https://acme.atlassian.net', projectKey: 'PROJ' })
  })
  it('extracts the project key from a browse/issue URL', () => {
    expect(parseJiraUrl('https://acme.atlassian.net/browse/PROJ-128'))
      .toEqual({ baseUrl: 'https://acme.atlassian.net', projectKey: 'PROJ' })
  })
  it('uppercases the key and is null-safe', () => {
    expect(parseJiraUrl('https://acme.atlassian.net/browse/proj-9')?.projectKey).toBe('PROJ')
    expect(parseJiraUrl('garbage')).toBeNull()
  })
})

describe('parseGithubUrl', () => {
  it('extracts owner/repo from any GitHub URL', () => {
    expect(parseGithubUrl('https://github.com/acme/webapp')).toEqual({ repo: 'acme/webapp' })
    expect(parseGithubUrl('https://github.com/acme/webapp/issues/42')).toEqual({ repo: 'acme/webapp' })
    expect(parseGithubUrl('https://github.com/acme/webapp.git')).toEqual({ repo: 'acme/webapp' })
  })
  it('returns null when there is no owner/repo', () => {
    expect(parseGithubUrl('https://github.com/acme')).toBeNull()
    expect(parseGithubUrl('nope')).toBeNull()
  })
})
