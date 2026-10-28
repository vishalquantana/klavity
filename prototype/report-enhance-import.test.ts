import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"

// POST /api/report/enhance threw "ReferenceError: formatAnnotationsForPrompt is not defined" (HTTP 500) because server.ts
// called it without importing it. Every helper server.ts calls from lib/report-enhance must be in its import line.
const SERVER = readFileSync(new URL("./server.ts", import.meta.url), "utf8")
const LIB = readFileSync(new URL("./lib/report-enhance.ts", import.meta.url), "utf8")

test("server.ts imports every report-enhance helper it calls", () => {
  const imp = SERVER.match(/import \{([^}]*)\} from "\.\/lib\/report-enhance"/)
  expect(imp).not.toBeNull()
  const imported = imp![1].split(",").map((x) => x.trim())
  const exported = [...LIB.matchAll(/^export (?:async )?function (\w+)/gm)].map((m) => m[1])
  const called = exported.filter((n) => new RegExp("\\b" + n + "\\(").test(SERVER.replace(imp![0], "")))
  expect(called.length).toBeGreaterThan(0)
  for (const n of called) expect(imported).toContain(n)
})
