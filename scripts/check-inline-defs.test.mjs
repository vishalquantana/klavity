#!/usr/bin/env node
// Standalone assertions for the inline-defs guard (KLAVITYKLA-390).
// Run:  node scripts/check-inline-defs.test.mjs   (also runnable via `bun`)
// Exits 0 = all pass, 1 = a failure (prints which).
import assert from 'node:assert'
import { scanFile, run, strip } from './check-inline-defs.mjs'

let passed = 0
function it(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1 }
}
const html = (js, attrs = '') => `<!doctype html><script${attrs}>${js}</script>`
const names = (js, attrs) => scanFile('fixture.html', html(js, attrs))

// --- catches the merge-eaten-definition bug -------------------------------
it('flags a bare call to an undefined function', () => {
  assert.deepStrictEqual(names('foo()'), ['foo()'])
})
it('flags the real prod signature (renderTriageBulkBar call, no def)', () => {
  const bad = names('function draw(){ const el = document.getElementById("x"); renderTriageBulkBar(el) }')
  assert.deepStrictEqual(bad, ['renderTriageBulkBar()'])
})

// --- does NOT flag a defined / guarded function ---------------------------
it('passes when the function is defined (declaration)', () => {
  assert.deepStrictEqual(names('function foo(){} foo()'), [])
})
it('passes when defined as const arrow', () => {
  assert.deepStrictEqual(names('const foo = () => 1; foo()'), [])
})
it('passes when typeof-guarded (optional call)', () => {
  assert.deepStrictEqual(names('if (typeof loadDashboard === "function") loadDashboard()'), [])
})

// --- false-positive categories that MUST stay clean -----------------------
it('destructuring binding counts as defined', () => {
  assert.deepStrictEqual(names('const { createSim, injectSimStyles } = window.KlavitySim; injectSimStyles(document); createSim({})'), [])
})
it('array destructuring counts as defined', () => {
  assert.deepStrictEqual(names('function split(){return [1,2]} const [head, tail] = split(); head(); tail()'), [])
})
it('method shorthand is a definition, not a call', () => {
  assert.deepStrictEqual(names('const o = { ensure() { return 1 }, start() { this.ensure() } }; o.start()'), [])
})
it('object-method (name: function) is defined', () => {
  assert.deepStrictEqual(names('const o = { run: function(){ helper() } }; function helper(){}'), [])
})
it('function parameters are bound', () => {
  assert.deepStrictEqual(names('[1].forEach(function(cb){ cb() })'), [])
})
it('arrow single param is bound', () => {
  assert.deepStrictEqual(names('const f = g => g(); f(x => x())'), [])
})
it('$ helper and browser globals are allowed', () => {
  assert.deepStrictEqual(names('$("id"); new EventSource("/s"); addEventListener("x", () => {})'), [])
})
it('call name inside a string is NOT a call', () => {
  assert.deepStrictEqual(names('const msg = "too few frames to scrub (page changed)"; alert(msg)'), [])
})
it('call name inside a comment is NOT a call', () => {
  assert.deepStrictEqual(names('// from recentWalks (newest-first)\nconst x = 1'), [])
})
it('regex containing a quote inside ${} does not desync the scanner', () => {
  // This is the exact construct that broke the /tmp prototype and leaked template text.
  const js = "const initials = n => n.replace(/\\(.*?\\)/g,'')\n"
    + "function card(s){ return `<div style=\"background:linear-gradient(135deg,${s.accent},${shade(s.name.replace(/'/g,''))})\">${initials(s.name)}</div>` }\n"
    + "function shade(h){ return h } card({accent:'#000',name:'a b'})"
  assert.deepStrictEqual(names(js), [])
})
it('external src= scripts are skipped', () => {
  assert.deepStrictEqual(scanFile('f.html', '<script src="/app.js">foo()</script>'), [])
})

// --- the real tree must be clean (the whole point: exit 0 on master) ------
it('current tree (prototype/public + site) is clean', () => {
  const findings = run(['prototype/public', 'site'])
  assert.deepStrictEqual(findings, [], 'expected no findings, got: ' + JSON.stringify(findings))
})

if (process.exitCode) console.error(`\n${passed} passed, some FAILED`)
else console.log(`\nAll ${passed} inline-defs guard assertions passed.`)
