/**
 * Paste-a-URL helpers — let users paste a tracker's project/board/issue URL and
 * auto-split it into the fields each integration needs. Pure + dependency-free.
 *
 * Each parser returns null when the URL doesn't match, so callers can leave the
 * existing field values untouched.
 */

export interface PlaneUrlParts { host: string; workspace: string; projectId: string }
export interface JiraUrlParts { baseUrl: string; projectKey: string }
export interface GithubUrlParts { repo: string }

function segments(u: URL): string[] {
  return u.pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s))
}

/**
 * Plane — cloud or self-hosted. Examples:
 *   https://plane.quantana.top/qbuilder/projects/<uuid>/issues/   (self-hosted)
 *   https://app.plane.so/acme/projects/<uuid>/issues/             (cloud)
 *
 * `host` is the API base: the origin for self-hosted, and api.plane.so for cloud
 * (cloud serves its UI on app.plane.so but its API on api.plane.so).
 */
export function parsePlaneUrl(input: string): PlaneUrlParts | null {
  try {
    const u = new URL(input.trim())
    const segs = segments(u)
    const i = segs.indexOf('projects')
    if (i >= 1 && segs[i + 1]) {
      const cloud = /(^|\.)(app|api)\.plane\.so$/i.test(u.hostname)
      return {
        host: cloud ? 'https://api.plane.so' : u.origin,
        workspace: segs[i - 1],
        projectId: segs[i + 1],
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Jira Cloud. Examples:
 *   https://acme.atlassian.net/jira/software/projects/PROJ/boards/1
 *   https://acme.atlassian.net/browse/PROJ-128
 */
export function parseJiraUrl(input: string): JiraUrlParts | null {
  try {
    const u = new URL(input.trim())
    const segs = segments(u)
    let projectKey = ''
    const p = segs.indexOf('projects')
    if (p >= 0 && segs[p + 1]) {
      projectKey = segs[p + 1]
    } else {
      const b = segs.indexOf('browse')
      if (b >= 0 && segs[b + 1]) projectKey = segs[b + 1].split('-')[0]
    }
    return { baseUrl: u.origin, projectKey: projectKey.toUpperCase() }
  } catch {
    return null
  }
}

/**
 * GitHub. Examples:
 *   https://github.com/acme/webapp
 *   https://github.com/acme/webapp/issues/42
 */
export function parseGithubUrl(input: string): GithubUrlParts | null {
  try {
    const u = new URL(input.trim())
    const segs = segments(u)
    if (segs.length >= 2) {
      return { repo: `${segs[0]}/${segs[1].replace(/\.git$/, '')}` }
    }
    return null
  } catch {
    return null
  }
}
