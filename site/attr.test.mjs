// site/attr.test.mjs
// Run from packages/core: npx vitest run ../../site/attr.test.mjs --environment jsdom
// KLAVITYKLA-324 — first-touch UTM/referrer attribution capture (site/attr.js).
import { test, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const SRC = readFileSync(join(dir, 'attr.js'), 'utf8')

// jsdom's location is a special native binding — history.pushState is the standard way to move
// the test document to a new path/query WITHOUT a real navigation (which jsdom can't do). The
// vitest config pins the jsdom origin to https://klavity.in/ so location.hostname is stable,
// letting the self-referral test assert against a known value.
function nav(pathAndSearch, referrer) {
  window.history.pushState({}, '', pathAndSearch)
  Object.defineProperty(document, 'referrer', { value: referrer || '', configurable: true })
}

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim()
    if (name) document.cookie = name + '=; Max-Age=0; Path=/'
  })
}

// jsdom (at least this version, under Node's own experimental `localStorage` global) doesn't
// reliably expose a working window.localStorage — `typeof localStorage` comes back `undefined`
// even inside a jsdom environment. Define an own-property in-memory polyfill directly on
// globalThis so the bare `localStorage` identifier attr.js references resolves consistently.
function installLocalStorage() {
  const store = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)) },
      removeItem: (k) => { store.delete(k) },
      clear: () => { store.clear() },
    },
  })
}

// Re-evaluates attr.js fresh (it runs its capture logic once, at load, like the real page load) —
// each test needs a clean load against its own location/referrer/storage state.
function loadAttr() {
  delete window.KlavAttr
  new Function(SRC)()
  return window.KlavAttr
}

beforeEach(() => {
  installLocalStorage()
  clearCookies()
  nav('/')
})

test('utm params are captured and become the stored first touch', () => {
  nav('/pricing?utm_source=reddit&utm_medium=social&utm_campaign=launch&utm_term=bugs&utm_content=banner')
  const rec = loadAttr().get()
  expect(rec.source).toBe('reddit')
  expect(rec.medium).toBe('social')
  expect(rec.campaign).toBe('launch')
  expect(rec.term).toBe('bugs')
  expect(rec.content).toBe('banner')
  expect(rec.landing_page).toBe('/pricing')
  expect(typeof rec.first_seen_at).toBe('number')
})

test('click ids (gclid/fbclid) are captured', () => {
  nav('/?gclid=abc123&fbclid=xyz789')
  const rec = loadAttr().get()
  expect(rec.gclid).toBe('abc123')
  expect(rec.fbclid).toBe('xyz789')
})

test('?ref= alias maps to source=<ref>, medium=referral', () => {
  nav('/?ref=reddit')
  const rec = loadAttr().get()
  expect(rec.source).toBe('reddit')
  expect(rec.medium).toBe('referral')
})

test('referrer fallback: known hosts get friendly source names', () => {
  nav('/', 'https://www.reddit.com/r/saas/')
  let rec = loadAttr().get()
  expect(rec.source).toBe('reddit')
  expect(rec.medium).toBe('referral')

  localStorage.clear()
  nav('/', 'https://x.com/someone/status/1')
  rec = loadAttr().get()
  expect(rec.source).toBe('x')

  localStorage.clear()
  nav('/', 'https://news.ycombinator.com/item?id=1')
  rec = loadAttr().get()
  expect(rec.source).toBe('hackernews')

  localStorage.clear()
  nav('/', 'https://www.google.com/search?q=klavity')
  rec = loadAttr().get()
  expect(rec.source).toBe('google')

  localStorage.clear()
  nav('/', 'https://www.linkedin.com/feed/')
  rec = loadAttr().get()
  expect(rec.source).toBe('linkedin')
})

test('referrer fallback: unknown host falls back to the bare hostname', () => {
  nav('/', 'https://news.example.com/post')
  const rec = loadAttr().get()
  expect(rec.source).toBe('news.example.com')
  expect(rec.medium).toBe('referral')
})

test('self-referral (same hostname as location) is ignored — stays direct', () => {
  nav('/', 'https://klavity.in/pricing')
  const rec = loadAttr().get()
  expect(rec.source).toBe('direct')
  expect(rec.medium).toBe('none')
})

test('no params + no referrer → direct/none', () => {
  nav('/')
  const rec = loadAttr().get()
  expect(rec.source).toBe('direct')
  expect(rec.medium).toBe('none')
})

test('FIRST TOUCH WINS: a later visit with different utm params does not overwrite it', () => {
  nav('/?utm_source=reddit&utm_medium=social')
  loadAttr()
  nav('/?utm_source=google&utm_medium=cpc')
  const attr = loadAttr()
  expect(attr.get().source).toBe('reddit') // first touch unchanged
  expect(attr.getLast().source).toBe('google') // last touch DOES update
})

test('a referrer-derived first touch is not overwritten by a later plain-direct visit', () => {
  nav('/', 'https://www.reddit.com/')
  loadAttr()
  nav('/') // returning visit, no referrer this time
  const rec = loadAttr().get()
  expect(rec.source).toBe('reddit')
})

test('field clamping: values are capped at 200 chars and control chars are stripped', () => {
  const long = 'x'.repeat(500)
  nav('/?utm_campaign=' + encodeURIComponent(long))
  let rec = loadAttr().get()
  expect(rec.campaign.length).toBe(200)

  localStorage.clear()
  nav('/?utm_content=' + encodeURIComponent('\x07\x1Bhello\x00world'))
  rec = loadAttr().get()
  expect(rec.content).toBe('helloworld')
})

test('attach(body) merges attr onto an existing object without mutating it', () => {
  nav('/?utm_source=reddit')
  const attr = loadAttr()
  const body = { email: 'a@b.com' }
  const merged = attr.attach(body)
  expect(merged.email).toBe('a@b.com')
  expect(merged.attr.source).toBe('reddit')
  expect(body.attr).toBeUndefined() // original object untouched
})

test('attach() with no body still returns an attr-only object', () => {
  nav('/?utm_source=reddit')
  const attr = loadAttr()
  const merged = attr.attach()
  expect(merged.attr.source).toBe('reddit')
})

test('clear() removes stored first/last touch and the cookie', () => {
  nav('/?utm_source=reddit')
  const attr = loadAttr()
  expect(localStorage.getItem('klav_attr')).not.toBeNull()
  attr.clear()
  expect(localStorage.getItem('klav_attr')).toBeNull()
  expect(localStorage.getItem('klav_attr_last')).toBeNull()
  expect(document.cookie).not.toContain('klav_attr=')
})

test('mirrors first touch into a klav_attr cookie', () => {
  nav('/?utm_source=reddit&utm_medium=social')
  loadAttr()
  expect(document.cookie).toContain('klav_attr=')
})
