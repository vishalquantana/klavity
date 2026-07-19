// site/bug-check-xss.test.mjs — KLAVITYKLA-341
// Run from packages/core: npx vitest run ../../site/bug-check-xss.test.mjs
//
// Proves the REAL shipped page script (site/bug-check.html) escapes hostile fetched-page content
// before it ever reaches the DOM. People will paste OTHER people's sites into this tool, and an AI
// can (mis)quote hostile page content verbatim into a finding — that's the realistic worst case
// this test drives.
//
// Follows the same pattern as attr.test.mjs / kit.icon.test.mjs (see vitest.config.ts
// environmentMatchGlobs): the REAL markup is loaded into vitest's jsdom `document`, and the page's
// OWN inline <script> source is extracted and executed via `new Function(SRC)()` — not
// re-implemented — so this exercises the exact escHtml()/innerHTML code that ships to production.
// window.fetch is stubbed to return findings whose what/where/why fields contain literal
// <script>/<img onerror=...> payloads; the form is submitted the way a user would; the rendered
// report is asserted to contain ZERO executable script elements or event-handler attributes
// derived from that payload — only inert, escaped text.
import { test, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const HTML = readFileSync(join(dir, 'bug-check.html'), 'utf8')

const bodyMatch = HTML.match(/<body[^>]*>([\s\S]*)<\/body>/i)
if (!bodyMatch) throw new Error('bug-check.html: could not locate <body>...</body>')
const bodyHtml = bodyMatch[1]
const scriptMatches = [...bodyHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
if (!scriptMatches.length) throw new Error('bug-check.html: no inline <script> found in <body>')
const PAGE_SCRIPT = scriptMatches[scriptMatches.length - 1][1]
// Everything in <body> EXCEPT the final inline script — real markup (form, results, finding-list,
// gate, etc.), executed separately below via new Function so it isn't inert innerHTML-inserted JS.
const BODY_MARKUP = bodyHtml.slice(0, scriptMatches[scriptMatches.length - 1].index)

// jsdom's sessionStorage (like localStorage — see attr.test.mjs) isn't reliably exposed as a bare
// global in this environment; polyfill defensively so `sessionStorage.getItem(...)` resolves.
function installSessionStorage() {
  const store = new Map()
  Object.defineProperty(globalThis, 'sessionStorage', {
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

beforeEach(() => {
  document.body.innerHTML = BODY_MARKUP
  installSessionStorage()
  if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== 'function') {
    globalThis.crypto = globalThis.crypto || {}
    globalThis.crypto.randomUUID = () => 'test-uuid-' + Math.random().toString(36).slice(2)
  }
})

/** Load the page's real script, stub fetch to answer /api/cro/analyze with `findings`, submit the
 *  real form, and return once the async handler has settled. */
async function renderWithFindings(findings) {
  let capturedBody = null
  globalThis.fetch = (url, init) => {
    const u = String(url)
    if (u.includes('/api/track')) return Promise.resolve({ ok: true, json: async () => ({ ok: true }) })
    if (u.includes('/api/cro/analyze')) {
      capturedBody = init && init.body ? JSON.parse(init.body) : null
      return Promise.resolve({ ok: true, json: async () => ({ findings, url: 'https://attacker-controlled.example.com' }) })
    }
    return Promise.resolve({ ok: true, json: async () => ({}) })
  }

  new Function(PAGE_SCRIPT)()

  const form = document.getElementById('bugcheck-form')
  const urlInput = document.getElementById('site-url')
  urlInput.value = 'https://attacker-controlled.example.com'
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

  // The submit handler is async (await fetch(...) + await res.json()) — pump the microtask queue.
  for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 0))

  return { capturedBody }
}

test('the page sends mode: "qa" to /api/cro/analyze (not the CRO contract)', async () => {
  const { capturedBody } = await renderWithFindings([])
  expect(capturedBody).toBeTruthy()
  expect(capturedBody.mode).toBe('qa')
})

test('a hostile <img onerror=...> payload in `what` never creates a live <img> and never executes', async () => {
  const payload = '<img src=x onerror=alert(1)>Broken hero button'
  await renderWithFindings([{ what: payload, where: '.hero-cta', why: 'blocks checkout', severity: 'high' }])
  const list = document.getElementById('finding-list')
  expect(list).toBeTruthy()
  // No live <img> element was created from the payload — it must appear ONLY as escaped text.
  expect(list.querySelectorAll('img').length).toBe(0)
  expect(list.innerHTML).toContain('&lt;img')
  expect(list.textContent).toContain(payload)
})

test('a hostile <script>...</script> payload in `where` never creates a live, executing <script> element', async () => {
  const payload = '<script>window.__xss_fired = true</script>.hero-cta'
  window.__xss_fired = undefined
  await renderWithFindings([{ what: 'Broken button', where: payload, why: 'blocks checkout', severity: 'high' }])
  const list = document.getElementById('finding-list')
  expect(list.querySelectorAll('script').length).toBe(0)
  expect(window.__xss_fired).toBeUndefined()
  expect(list.innerHTML).toContain('&lt;script&gt;')
})

test('an onerror-bearing payload in `why` is rendered as inert text, not a live attribute', async () => {
  const payload = '"><img src=x onerror=alert(document.cookie)>'
  await renderWithFindings([{ what: 'Broken button', where: '.cta', why: payload, severity: 'medium' }])
  const list = document.getElementById('finding-list')
  expect(list.querySelectorAll('img').length).toBe(0)
  expect(list.innerHTML).not.toMatch(/<img[^>]*onerror=/)
  expect(list.textContent).toContain(payload)
})

test('a non-enum severity value cannot break out of the severity-chip attribute or its label text', async () => {
  const payload = 'high"><img src=x onerror=alert(1)>'
  window.__xss_fired = undefined
  await renderWithFindings([{ what: 'Broken button', where: '.cta', why: 'blocks checkout', severity: payload }])
  const list = document.getElementById('finding-list')
  // The only structural properties that matter for exploitability: no live <img>/<script> element
  // and no element carrying a live onerror/onload/... handler attribute was created anywhere in
  // the report. (The severity-chip's class value and label text DO still contain the payload's
  // characters once the parser decodes the escaped entities back — that's expected and harmless:
  // it's inert attribute/text content, never re-parsed as markup, which is exactly why these
  // structural checks — not substring matching on serialized HTML — are the correct safety proof.)
  expect(list.querySelectorAll('img').length).toBe(0)
  expect(list.querySelectorAll('script').length).toBe(0)
  expect(list.querySelectorAll('[onerror],[onload],[onclick]').length).toBe(0)
  expect(list.querySelector('.severity-chip')).toBeTruthy()
})
