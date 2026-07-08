// Regression guard for the mangled-arrow corruption class (KLA: dead /autosims/walk page).
// `.replace(/re/g, c=({...})[c]||c)` — an arrow `c=>(...)` that lost its `>` — still PARSES
// as valid JS (an assignment expression reading undeclared `c` → ReferenceError at runtime),
// so `node --check` / check-inline-js.mjs can't catch it. This test scans every inline
// <script> in public/*.html for a bare-identifier assignment used as a .replace() callback.
import { describe, expect, test } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const PUBLIC_DIR = join(import.meta.dir, "..", "public")

// `.replace(/…/flags, ident=(` — a callback position holding `ident=(` instead of `ident=>(`
// or `function(ident)`. The `[^>]` ensures we don't flag legitimate arrows `ident=>(`.
const MANGLED_ARROW = /\.replace\(\s*\/(?:[^/\\\n]|\\.)+\/[a-z]*\s*,\s*[A-Za-z_$][\w$]*\s*=\s*[^>=]/g

describe("no mangled-arrow .replace callbacks in public html", () => {
  const htmlFiles = readdirSync(PUBLIC_DIR).filter(f => f.endsWith(".html"))
  test("found html files to scan", () => {
    expect(htmlFiles.length).toBeGreaterThan(0)
  })
  for (const f of htmlFiles) {
    test(f, () => {
      const src = readFileSync(join(PUBLIC_DIR, f), "utf8")
      const hits: string[] = []
      let m: RegExpExecArray | null
      while ((m = MANGLED_ARROW.exec(src)) !== null) {
        const line = src.slice(0, m.index).split("\n").length
        hits.push(`${f}:${line} → ${src.slice(m.index, m.index + 80)}`)
      }
      expect(hits).toEqual([])
    })
  }
})
