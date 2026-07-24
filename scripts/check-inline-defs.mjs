#!/usr/bin/env node
// Inline-JS UNDEFINED-CALL guard (KLAVITYKLA-390) — catches the "merge-eaten inline
// function DEFINITION" bug class: a bare `foo(...)` CALL whose `function foo`/`const foo`
// definition was silently dropped by a `-X theirs` merge while the call site survived.
//
// WHY this exists alongside the other gates:
//   * tsc / check-ts-bindings.mjs only see TypeScript — inline <script> in .html is NOT
//     type-checked, so a dropped inline definition is invisible to them.
//   * check-inline-js.mjs only PARSES each inline <script> (node --check) — a call to an
//     undefined function is perfectly valid syntax, so it passes clean.
//   Both real 2026-07 prod crashes (`renderTriageBulkBar`, `resetRunNow` in dashboard.html)
//   slipped exactly this gap: valid syntax, no types, ReferenceError only at click time —
//   the server booted fine so health-rollback never fired.
//
// WHAT it does: for every inline <script> (skips src= externals, JSON, templates) in
//   prototype/public/*.html and site/*.html, it strips strings/comments/regex, collects every
//   name that is DEFINED or BOUND (function decls, const/let/var incl. destructuring, params,
//   arrow params, method shorthand, object-method, window.x =, catch/labels, classes), and
//   flags any BARE call `name(` whose name is neither defined, nor a known global, nor guarded
//   by `typeof name === "function"`.
//
// Usage:  node scripts/check-inline-defs.mjs [dir ...]   (default dirs: prototype/public, site)
//   exit 0 = every called inline function is defined / global / typeof-guarded
//   exit 1 = undefined bare call(s) found (prints file + name)
//
// It MUST exit 0 on a healthy tree — a crying-wolf gate wedges the merge-train. The merge-train
// wires it with a baseline (origin/master) net-new comparison so a stray future FP degrades
// gracefully rather than freezing the train.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// ---- Known globals + libraries used on these pages. Curated to be thorough: every one of
//      these is a legitimate bare call on at least one page, so listing them keeps FPs at zero.
const GLOBALS = new Set([
  // language keywords / statement heads that can precede `(`
  'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'instanceof',
  'new', 'await', 'void', 'delete', 'in', 'of', 'do', 'else', 'yield', 'throw', 'case',
  'with', 'var', 'const', 'let', 'async', 'super', 'class', 'extends',
  // built-in constructors / namespaces
  'Array', 'Object', 'String', 'Number', 'Boolean', 'BigInt', 'Math', 'JSON', 'Date',
  'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Symbol', 'Error', 'TypeError',
  'RangeError', 'Proxy', 'Reflect', 'Intl',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
  'encodeURI', 'decodeURI', 'escape', 'unescape', 'structuredClone', 'queueMicrotask',
  // DOM / browser globals
  'window', 'document', 'console', 'fetch', 'setTimeout', 'setInterval', 'clearTimeout',
  'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback',
  'cancelIdleCallback', 'alert', 'confirm', 'prompt', 'localStorage', 'sessionStorage',
  'navigator', 'location', 'history', 'screen', 'top', 'parent', 'self', 'globalThis',
  'URL', 'URLSearchParams', 'FormData', 'Blob', 'File', 'FileReader', 'Image', 'Audio',
  'IntersectionObserver', 'MutationObserver', 'ResizeObserver', 'PerformanceObserver',
  'getComputedStyle', 'matchMedia', 'btoa', 'atob', 'CustomEvent', 'Event', 'MouseEvent',
  'KeyboardEvent', 'AbortController', 'AbortSignal', 'crypto', 'performance', 'WebSocket',
  'EventSource', 'Notification', 'Worker', 'Headers', 'Request', 'Response', 'TextEncoder',
  'TextDecoder', 'DOMParser', 'XMLHttpRequest', 'HTMLElement', 'Node', 'NodeList',
  'addEventListener', 'removeEventListener', 'dispatchEvent', 'getSelection', 'scrollTo',
  'scrollBy', 'open', 'close', 'print', 'postMessage',
  // Promise executor / common callback param names that surface as bare calls
  'resolve', 'reject',
  // CSS-ish function names that can appear inside template/style strings (defensive)
  'rgba', 'rgb', 'hsl', 'hsla', 'url', 'calc', 'translate', 'rotate', 'scale', 'blur',
  // the getElementById helper defined on nearly every page as `const $ = id => ...`
  '$', '$$',
  // third-party libs loaded on these pages
  'posthog', 'gtag', 'dataLayer', 'Replayer', 'rrweb', 'rrwebPlayer', 'Chart', 'confetti',
  'KlavityKit', 'Klavity', 'KlavitySim', 'kicon', 'icon', 'toPng', 'toBlob', 'toSvg',
])

// ---- Strip strings, template literals (keep ${} expressions), comments, and regex literals.
//      A naive stripper that does not understand regex literals swallows a `'` or `"` that
//      lives INSIDE a regex, corrupting the string state for the rest of the file — that is
//      exactly why the /tmp prototype leaked `scrub`/`recentWalks` out of a string and a
//      comment in trails.html. So we detect regex literals via the standard prev-token rule.
const KW_BEFORE_REGEX = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'do', 'else', 'case', 'yield', 'await', 'throw'])
function regexAllowed(out) {
  // Decide whether a `/` starts a regex literal or is division, from the last emitted token.
  let j = out.length - 1
  while (j >= 0 && /\s/.test(out[j])) j--
  if (j < 0) return true // start of input → regex
  const c = out[j]
  // After a value (identifier/number/`)`/`]`/`0`-string-placeholder) a `/` is division…
  if (/[\w$)\]]/.test(c)) {
    // …unless the trailing word is a keyword like `return` / `typeof` (then it's a regex).
    let k = j, word = ''
    while (k >= 0 && /[\w$]/.test(out[k])) { word = out[k] + word; k-- }
    return KW_BEFORE_REGEX.has(word)
  }
  return true
}

// Unified scanner: replaces strings, comments, regex literals, and template-literal TEXT with a
// neutral placeholder while KEEPING template `${…}` interpolation expressions (recursively) so
// calls inside them are still analysed. A stack tracks template↔interpolation nesting, which is
// what makes it immune to the desync that killed the /tmp prototype: a regex containing a quote
// INSIDE a `${…}` interpolation (`${s.name.replace(/'/g,'')}`) no longer opens a fake string that
// swallows the interpolation's closing brace and everything after it.
function strip(code) {
  let out = ''
  let i = 0
  const n = code.length
  // Each frame: { kind:'tmpl' } (inside template-literal text) or { kind:'code', depth } (top
  // level or inside an interpolation; depth = unmatched `{` seen so a `}` at depth 0 in an
  // interpolation returns us to template-text mode).
  const stack = [{ kind: 'code', depth: 0 }]
  while (i < n) {
    const top = stack[stack.length - 1]
    const c = code[i], d = code[i + 1]
    if (top.kind === 'tmpl') {
      if (c === '\\') { i += 2; continue }
      if (c === '`') { stack.pop(); out += ' '; i++; continue }             // close template literal
      if (c === '$' && d === '{') { stack.push({ kind: 'code', depth: 0 }); out += ' '; i += 2; continue } // enter ${…}
      i++; continue                                                          // literal text → emit nothing
    }
    // code frame
    if (c === '/' && d === '/') { i += 2; while (i < n && code[i] !== '\n') i++; continue }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++; i += 2; continue }
    if (c === '"' || c === "'") { const q = c; i++; while (i < n) { if (code[i] === '\\') { i += 2; continue } if (code[i] === q) { i++; break } i++ } out += '0'; continue }
    if (c === '`') { stack.push({ kind: 'tmpl' }); out += ' '; i++; continue } // open template literal
    if (c === '/' && regexAllowed(out)) {
      i++; let inClass = false
      while (i < n) {
        const rc = code[i]
        if (rc === '\\') { i += 2; continue }
        if (rc === '\n') break
        if (rc === '[') inClass = true
        else if (rc === ']') inClass = false
        else if (rc === '/' && !inClass) { i++; break }
        i++
      }
      while (i < n && /[gimsuy]/.test(code[i])) i++
      out += '0'; continue
    }
    if (c === '{') { top.depth++; out += c; i++; continue }
    if (c === '}') {
      if (top.depth === 0 && stack.length > 1) { stack.pop(); out += ' '; i++; continue } // close ${…} → back to template text
      top.depth--; out += c; i++; continue
    }
    out += c; i++
  }
  return out
}

// ---- Extract inline <script> bodies (skip external src=, JSON, templates).
const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
function inlineScripts(html) {
  const bodies = []
  let m
  while ((m = SCRIPT_RE.exec(html))) {
    const attrs = m[1] || ''
    if (/\bsrc\s*=/.test(attrs)) continue
    if (/ld\+json|application\/json|text\/template/.test(attrs)) continue
    if (!m[2].trim()) continue
    bodies.push(m[2])
  }
  return bodies.join('\n;\n')
}

const IDENT = /[A-Za-z_$][\w$]*/g
// Names that appear in binding positions but are keywords, not real bindings.
const PATTERN_SKIP = new Set(['const', 'let', 'var', 'in', 'of', 'true', 'false', 'null', 'undefined', 'new', 'await', 'async', 'function', 'this', 'default'])

function collectDefined(code) {
  const def = new Set()
  const add = (s) => { if (s && !PATTERN_SKIP.has(s)) def.add(s) }
  const addPattern = (pat) => { let mm; IDENT.lastIndex = 0; while ((mm = IDENT.exec(pat))) add(mm[0]) }
  let m

  // function declarations / named function expressions
  for (const re = /\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)/g; (m = re.exec(code));) add(m[1])
  // class declarations
  for (const re = /\bclass\s+([A-Za-z_$][\w$]*)/g; (m = re.exec(code));) add(m[1])
  // simple const/let/var  (first identifier)
  for (const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g; (m = re.exec(code));) add(m[1])
  // destructuring: const { a, b: c, ...r } =  /  const [a, , b] =
  for (const re = /\b(?:const|let|var)\s*([{[][^=;]*?[}\]])\s*=/g; (m = re.exec(code));) addPattern(m[1])
  // NAME = function|(...)=>|x=>  and  NAME: function|(...)=>  (object methods / assignments)
  for (const re = /([A-Za-z_$][\w$]*)\s*[:=]\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g; (m = re.exec(code));) add(m[1])
  // window.NAME = / globalThis.NAME =
  for (const re = /\b(?:window|globalThis|self)\.([A-Za-z_$][\w$]*)\s*=/g; (m = re.exec(code));) add(m[1])
  // single-identifier arrow param:  x => ...
  for (const re = /(^|[^.\w$])([A-Za-z_$][\w$]*)\s*=>/g; (m = re.exec(code));) add(m[2])
  // method shorthand / object method / function with body:  NAME(params) {   → NAME defined + params bound
  for (const re = /([A-Za-z_$][\w$]*)\s*\(([^()]*)\)\s*\{/g; (m = re.exec(code));) { add(m[1]); addPattern(m[2]) }
  // any parenthesized param list immediately preceding `=>` or `{` (arrow / function params)
  for (const re = /\(([^()]*)\)\s*(?:=>|\{)/g; (m = re.exec(code));) addPattern(m[1])
  // catch (e) / catch(e)
  for (const re = /\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/g; (m = re.exec(code));) add(m[1])
  // labels:  name:   (loop/statement labels can look like calls in weird code — cheap to allow)
  for (const re = /(^|[;{}])\s*([A-Za-z_$][\w$]*)\s*:/g; (m = re.exec(code));) add(m[2])

  return def
}

// bare call:  name(  not preceded by `.` (member call) or `\w$` (part of a longer name)
const CALL_RE = /(^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g

function scanFile(file, html) {
  const raw = inlineScripts(html)
  if (!raw.trim()) return []
  const code = strip(raw)
  const defined = collectDefined(code)
  const calls = new Map()
  let m
  while ((m = CALL_RE.exec(code))) {
    const name = m[2]
    if (GLOBALS.has(name) || defined.has(name)) continue
    // typeof-guarded optional call is safe:  if (typeof foo === "function") foo()
    if (new RegExp('typeof\\s+' + name.replace(/[$]/g, '\\$&') + '\\s*===?\\s*0').test(code)) continue
    calls.set(name, (calls.get(name) || 0) + 1)
  }
  return [...calls.entries()].map(([n, c]) => `${n}()${c > 1 ? ' x' + c : ''}`)
}

export function run(dirs) {
  const findings = []
  for (const dir of dirs) {
    let entries = []
    try { entries = readdirSync(dir) } catch { continue }
    for (const name of entries) {
      if (!name.endsWith('.html')) continue
      const file = join(dir, name)
      let html
      try { html = readFileSync(file, 'utf-8') } catch { continue }
      const bad = scanFile(file, html)
      if (bad.length) findings.push({ file, bad })
    }
  }
  return findings
}

// --- CLI entry (only when run directly, so tests can `import { scanFile, run }`) ---
const isMain = process.argv[1] && (import.meta.url === 'file://' + process.argv[1] || import.meta.url.endsWith(process.argv[1].split('/').pop()))
if (isMain) {
  const args = process.argv.slice(2)
  const dirs = args.length ? args : ['prototype/public', 'site']
  const findings = run(dirs)
  let total = 0
  for (const { file, bad } of findings) {
    total += bad.length
    // Machine-countable line per file:name so the merge-train can do a net-new (head vs
    // origin/master) comparison — `grep -c "UNDEFINED-CALL"` — exactly like the ts-bindings
    // gate greps "error TS2304". A stray future FP then degrades to "no net increase" instead
    // of wedging the whole train.
    for (const name of bad) console.error(`UNDEFINED-CALL ${file} ${name}`)
    console.error(`FAIL ${file}:  ${bad.join(', ')}`)
  }
  if (total) {
    console.error(`\nInline-defs guard FAILED — ${total} bare call(s) to an undefined inline function.`)
    console.error('This is the merge-eaten-definition signature (ReferenceError at call time; not caught by tsc or the parse-only inline-js guard). Fix or rebase before merging.')
    process.exit(1)
  }
  console.log('Inline-defs guard passed — every called inline function is defined, global, or typeof-guarded.')
}

export { scanFile, collectDefined, strip }
