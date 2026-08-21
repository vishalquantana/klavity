// CRUD + click-count tests for short_links / link_clicks (Task 2).
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-shortlinks-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import {
  applySchema, reconnectDb,
  createShortLink, getShortLinkByCodeOrSlug, listShortLinks, getShortLinkDetail,
  updateShortLink, recordLinkClick, linkClickStats, ShortLinkConflictError,
} from "./db"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c) // must create short_links + link_clicks via migrateShortLinks
})

test("createShortLink → getShortLinkByCodeOrSlug by code and by slug", async () => {
  const { id, code } = await createShortLink({
    code: "abc123", slug: "launch-q3", destinationUrl: "https://example.com/l",
    utm: { source: "reddit", medium: "post", campaign: "q3" },
    label: "Q3 launch", kind: "campaign", createdBy: "vishal@quantana.com.au",
  })
  expect(id).toBeTruthy()
  expect(code).toBe("abc123")

  const byCode = await getShortLinkByCodeOrSlug("abc123")
  expect(byCode?.id).toBe(id)
  expect(byCode?.destinationUrl).toBe("https://example.com/l")
  expect(byCode?.utm.source).toBe("reddit")

  const bySlug = await getShortLinkByCodeOrSlug("launch-q3")
  expect(bySlug?.id).toBe(id)
})

test("getShortLinkByCodeOrSlug hides inactive unless includeInactive", async () => {
  const { id, code } = await createShortLink({
    code: "inact1", destinationUrl: "https://example.com/x", utm: {}, kind: "campaign", createdBy: null,
  })
  await updateShortLink(id, { active: false })
  expect(await getShortLinkByCodeOrSlug(code)).toBe(null)
  expect((await getShortLinkByCodeOrSlug(code, { includeInactive: true }))?.id).toBe(id)
})

test("listShortLinks returns rows with click_count", async () => {
  const rows = await listShortLinks()
  expect(Array.isArray(rows)).toBe(true)
  expect(rows.length).toBeGreaterThanOrEqual(2)
  expect(rows[0]).toHaveProperty("clickCount")
})

test("updateShortLink edits destination/utm/label but code stays stable; toggles active", async () => {
  const { id, code } = await createShortLink({
    code: "edit01", destinationUrl: "https://example.com/a", utm: { source: "old" }, kind: "campaign", createdBy: null,
  })
  await updateShortLink(id, { destinationUrl: "https://example.com/b", utm: { source: "new", campaign: "c" }, label: "L2" })
  const got = await getShortLinkDetail(id)
  expect(got?.code).toBe(code) // code immutable
  expect(got?.destinationUrl).toBe("https://example.com/b")
  expect(got?.utm.source).toBe("new")
  expect(got?.utm.campaign).toBe("c")
  expect(got?.label).toBe("L2")

  await updateShortLink(id, { active: false })
  expect((await getShortLinkDetail(id))?.active).toBe(false)
  await updateShortLink(id, { active: true })
  expect((await getShortLinkDetail(id))?.active).toBe(true)
})

test("recordLinkClick inserts a click AND increments click_count", async () => {
  const { id, code } = await createShortLink({
    code: "clk001", destinationUrl: "https://example.com/c", utm: {}, kind: "campaign", createdBy: null,
  })
  await recordLinkClick({ linkId: id, code, ipHash: "hh", ua: "Mozilla", referer: "https://t.co", country: null, isBot: false })
  await recordLinkClick({ linkId: id, code, ipHash: "hh2", ua: "Googlebot", referer: null, country: null, isBot: true })

  const detail = await getShortLinkDetail(id)
  expect(detail?.clickCount).toBe(2)

  const stats = await linkClickStats(id)
  expect(stats.total).toBe(2)
  expect(stats.bots).toBe(1)
  expect(stats.humans).toBe(1)
  // Referer is normalized to host at the data layer, so "https://t.co" is stored/returned as "t.co".
  expect(stats.topReferers.find((r) => r.referer === "t.co")?.count).toBe(1)
  expect(stats.byDay.length).toBeGreaterThanOrEqual(1)
})

test("recordLinkClick strips referer PII to host-only (no query/email/token persisted) — Codex HIGH", async () => {
  const { id, code } = await createShortLink({
    code: "pii001", destinationUrl: "https://example.com/pii", utm: {}, kind: "campaign", createdBy: null,
  })
  await recordLinkClick({
    linkId: id, code, ipHash: "hh",
    ua: "Mozilla/5.0 (X) Chrome/120.0.6099.71 Safari/537.36",
    referer: "https://x.com/p?email=a@b.com&token=123", country: null, isBot: false,
  })
  const stats = await linkClickStats(id)
  const refs = stats.topReferers.map((r) => r.referer)
  expect(refs).toContain("x.com")
  for (const r of refs) {
    expect(r).not.toContain("email")
    expect(r).not.toContain("a@b.com")
    expect(r).not.toContain("token")
    expect(r).not.toContain("123")
  }
})

test("createShortLink: a code may not collide with an existing SLUG (cross-column namespace) — Codex LOW", async () => {
  await createShortLink({ code: "xcol01", slug: "shared-x", destinationUrl: "https://example.com/x", utm: {}, kind: "campaign", createdBy: null })
  // New row whose CODE equals the existing SLUG must be rejected (would make /s/shared-x ambiguous).
  let err: any = null
  try {
    await createShortLink({ code: "shared-x", destinationUrl: "https://example.com/y", utm: {}, kind: "campaign", createdBy: null })
  } catch (e) { err = e }
  expect(err).toBeInstanceOf(ShortLinkConflictError)
  expect(err.which).toBe("code")

  // And a new SLUG equal to an existing CODE is likewise rejected.
  let err2: any = null
  try {
    await createShortLink({ code: "xcol02", slug: "xcol01", destinationUrl: "https://example.com/z", utm: {}, kind: "campaign", createdBy: null })
  } catch (e) { err2 = e }
  expect(err2).toBeInstanceOf(ShortLinkConflictError)
  expect(err2.which).toBe("slug")
})

test("migrateShortLinks is idempotent (re-applySchema does not throw)", async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  expect((await listShortLinks()).length).toBeGreaterThan(0)
})
