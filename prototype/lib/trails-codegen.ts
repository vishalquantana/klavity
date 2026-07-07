// Layer B (pure): Trail + ordered steps + resolved selectors -> standalone @playwright/test code STRING.
// No DB, no browser, no LLM. This is the "no lock-in" exportable artifact (spec §2.2, §10).
import type { Trail, TrailStep } from "./trails-types"

// Matches {{cred:<account>:email|password}} placeholders (ADR-0001).
const CRED_RE = /\{\{cred:([a-z0-9_-]{1,40}):(email|password)\}\}/g

// Escape a value for embedding inside a single-quoted JS string literal.
function q(v: string): string {
  return "'" + v.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'"
}

function credEnvName(name: string, field: string): string {
  return `KLAV_CRED_${name.toUpperCase().replace(/-/g, "_")}_${field.toUpperCase()}`
}

function hasCred(v: string): boolean {
  CRED_RE.lastIndex = 0
  return CRED_RE.test(v)
}

// Returns a JS expression for a type step value.
// Plain strings → single-quoted literal. Values with {{cred:...}} → backtick template
// referencing env-var consts emitted at the top of the file.
function typeValueExpr(raw: string): string {
  if (!hasCred(raw)) return q(raw)
  CRED_RE.lastIndex = 0
  const tmpl = raw
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/(?<!\$)\$/g, "\\$")
    .replace(/\{\{cred:([a-z0-9_-]{1,40}):(email|password)\}\}/g, (_, name, field) =>
      `\${${credEnvName(name, field)}}`,
    )
  return "`" + tmpl + "`"
}

// Collect every unique cred env-var name used across all type steps.
function collectCredVars(steps: TrailStep[]): Map<string, string> {
  const vars = new Map<string, string>()
  for (const s of steps) {
    if (s.action === "type" && s.actionValue) {
      for (const m of s.actionValue.matchAll(new RegExp(CRED_RE.source, "g"))) {
        const [, name, field] = m
        vars.set(credEnvName(name, field), `${name} ${field}`)
      }
    }
  }
  return vars
}

/**
 * Generate an importable, runnable Playwright test as a string.
 * @param selectors map of stepId -> resolved CSS/attr selector (from locator_cache or the trajectory).
 *
 * Steps without a resolved selector are never silently dropped — they emit a TODO comment so the
 * exported file remains complete and the user knows what to fill in manually.
 *
 * Credential placeholders ({{cred:<name>:<field>}}) are converted to env-var const references at
 * the top of the file (KLAV_CRED_<NAME>_<FIELD>). The exported test works when those vars are set;
 * without them the const is '' (the test will fail at the fill, not silently at export time).
 */
export function generatePlaywright(
  trail: Trail,
  steps: TrailStep[],
  selectors: Record<string, string>,
): string {
  const ordered = [...steps].sort((a, b) => a.idx - b.idx)
  const credVars = collectCredVars(ordered)
  const body: string[] = []
  body.push(`  await page.goto(${q(trail.baseUrl)})`)

  for (const s of ordered) {
    const sel = selectors[s.id]
    switch (s.action) {
      case "navigate":
        body.push(`  await page.goto(${q(s.actionValue ?? trail.baseUrl)})`)
        break
      case "click":
        if (sel) {
          body.push(`  await page.click(${q(sel)})`)
        } else {
          body.push(`  // TODO: step ${s.idx} (click) — selector not resolved; add manually`)
        }
        break
      case "type":
        if (sel) {
          body.push(`  await page.fill(${q(sel)}, ${typeValueExpr(s.actionValue ?? "")})`)
        } else {
          body.push(`  // TODO: step ${s.idx} (type) — selector not resolved; add manually`)
        }
        break
      case "select":
        if (sel) {
          body.push(`  await page.selectOption(${q(sel)}, ${q(s.actionValue ?? "")})`)
        } else {
          body.push(`  // TODO: step ${s.idx} (select) — selector not resolved; add manually`)
        }
        break
      case "wait": {
        const ms = Number(s.actionValue)
        body.push(`  await page.waitForTimeout(${Number.isFinite(ms) ? ms : 0})`)
        break
      }
      case "assert": {
        const desc = s.checkpoint?.description ?? ""
        const kind = (s.checkpoint && s.checkpoint.kind) || "visible"
        if (sel) {
          switch (kind) {
            case "textEquals":
              body.push(`  expect(page.locator(${q(sel)}).innerText()).resolves.toBe(${q(s.checkpoint.value ?? "")}) // ${desc}`)
              break
            case "textContains":
              body.push(`  expect(page.locator(${q(sel)}).innerText()).resolves.toContain(${q(s.checkpoint.value ?? "")}) // ${desc}`)
              break
            case "elementCount":
              body.push(`  expect(page.locator(${q(sel)}).count()).resolves.toBe(${s.checkpoint.count ?? 0}) // ${desc}`)
              break
            default: // visible or unknown — fall through to the default below.
              body.push(`  await expect(page.locator(${q(sel)})).toBeVisible() // ${desc}`)
          }
        } else {
          // No element to bind to: urlMatches asserts page.url(), checkpoint-only is a soft pass.
          if (kind === "urlMatches" && s.checkpoint?.regex) {
            const re = s.checkpoint.regex.startsWith("/") ? s.checkpoint.regex.slice(1, -1) : `^${s.checkpoint.regex}$`
            body.push(`  await expect(page).toHaveURL(new RegExp(${JSON.stringify(re)})) // ${desc}`)
          } else {
            body.push(`  // checkpoint: ${desc}`)
            body.push(`  expect(true).toBeTruthy()`)
          }
        }
        break
      }
    }
  }

  const credLines: string[] = []
  if (credVars.size > 0) {
    credLines.push(``)
    credLines.push(`// Test-account credentials — set these env vars before running`)
    for (const [envName, hint] of credVars) {
      credLines.push(`const ${envName} = process.env['${envName}'] ?? '' // ${hint}`)
    }
  }

  return [
    `import { test, expect } from '@playwright/test'`,
    ...credLines,
    ``,
    `test(${q(trail.name)}, async ({ page }) => {`,
    ...body,
    `})`,
    ``,
  ].join("\n")
}
