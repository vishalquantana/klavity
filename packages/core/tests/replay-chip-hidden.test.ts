// KLA-493 — the 'Replay · 60s' chip must NEVER re-enter the composer UI, while session-replay
// CAPTURE stays fully ON (the widget keeps feeding replayEvents into the submit payload).
//
// Two layers of regression guard:
//   1. SOURCE-LEVEL: modal.ts must not render any replay-chip markup — the only occurrences of the
//      chip string are the explanatory comments that document WHY it is hidden. If someone reintroduces
//      the visible chip, this fails with a pointed message.
//   2. BUNDLE-LEVEL: the SHIPPED widget IIFE must not contain the chip string at all (a stale/partial
//      rebuild would otherwise silently resurrect it for every embedded widget).

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const CHIP = 'Replay · 60s'

describe('KLA-493 — Replay chip stays hidden', () => {
  it('modal.ts contains no rendered replay-chip markup (comments explaining the removal are fine)', () => {
    const src = readFileSync(join(here, '../src/modal.ts'), 'utf8')
    // Strip line comments + block comments before scanning: the removal rationale mentions the chip.
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(stripped).not.toContain(CHIP)
    // The old chip element id must be gone entirely (no markup, no querySelector for it).
    expect(stripped).not.toContain('#klavity-replay-chip')
  })

  it('the shipped widget IIFE bundle contains no replay-chip string (capture still wired, chip gone)', () => {
    const bundle = readFileSync(join(here, '../../sdk/dist/klavity-widget.iife.js'), 'utf8')
    expect(bundle).not.toContain(CHIP)
    // Capture must stay ON: the submit path keeps merging the rrweb buffer into the payload.
    expect(bundle).toContain('replayEvents')
  })
})
