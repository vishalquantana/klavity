# Image-Hero Report Composer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the bug-report composer modal so the screenshot is the hero (large left pane with an always-on annotation toolbar) and all controls live in a right column, with keyboard shortcuts for every tool.

**Architecture:** Restructure `buildModal`'s single-column card in `packages/core/src/modal.ts` into a two-pane CSS grid — `.kl-hero` (left: big canvas + inline toolbar + thumbnail switcher) and `.kl-side` (right: existing toggle/capture/mask/desc/email/submit controls). The existing fullscreen `openAnnotator` tool/pointer logic is extracted into an always-on inline annotator mounted in the hero on the active screenshot. All existing `klavity-*` element IDs are preserved so `content.ts`/`widget.ts` wiring and the current tests keep working. New `line`, `count`, and text-style additions extend the `Shape` union + `Annotator.drawShape`.

**Tech Stack:** TypeScript, Shadow DOM, canvas 2D, Vitest, Vite (IIFE widget bundle).

## Global Constraints

- NEVER commit/push to master; work only on branch `feat/image-hero-modal` in worktree `klav-snap-wt-image-hero-modal`.
- Do NOT bump version / edit CHANGELOG version lines / manifests — orchestrator owns those.
- Preserve every existing `klavity-*` element ID and the `ModalController`/`ModalCallbacks` contract — extension + widget + tests depend on them.
- Keep extension⇄widget parity: both consume the same `buildModal`; no per-consumer branching in layout.
- Tests must stay green: `cd packages/core && pnpm test` and `cd packages/sdk && pnpm test`.
- Annotations stay STRUCTURED (clean screenshot + overlay shapes in `annotationsByIndex`), except Crop which is destructive by nature (Task 6).
- Respect `prefers-reduced-motion`; follow the existing button micro-animation convention.

---

### Task 1: Two-pane layout shell

Turn the modal into a wide two-column grid without changing behavior: existing controls move into a right column `.kl-side`; a new empty `.kl-hero` sits on the left. Annotation still opens via the current thumbnail→fullscreen path for now.

**Files:**
- Modify: `packages/core/src/modal.ts` (CSS block ~208-407; innerHTML ~415-440)
- Test: `packages/core/tests/modal-layout.test.ts` (new)

**Interfaces:**
- Consumes: existing `buildModal(initialType, callbacks, config)`.
- Produces: modal DOM containing `.kl-hero` and `.kl-side`; `.kl-side` wraps all pre-existing control nodes (IDs unchanged).

- [ ] **Step 1: Write failing test** — assert the rebuilt modal exposes hero + side panes and still contains the key control IDs.

```ts
// packages/core/tests/modal-layout.test.ts
import { describe, it, expect } from 'vitest'
import { buildModal } from '../src/modal'

describe('image-hero layout', () => {
  it('renders a hero pane and a side pane holding the existing controls', () => {
    const c = buildModal('bug', { onCaptureFull: async () => {}, onSubmit: async () => ({ ok: true }) } as any, {})
    const root = c.shadowRoot
    const modal = root.querySelector('.klavity-modal')!
    expect(modal.querySelector('.kl-hero')).toBeTruthy()
    const side = modal.querySelector('.kl-side')!
    expect(side).toBeTruthy()
    // existing controls must live inside the side column
    expect(side.querySelector('#klavity-desc')).toBeTruthy()
    expect(side.querySelector('#klavity-submit')).toBeTruthy()
    expect(side.querySelector('.klavity-toggle')).toBeTruthy()
    c.close()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd packages/core && pnpm test -- modal-layout`
Expected: FAIL — `.kl-hero` / `.kl-side` not found.

- [ ] **Step 3: Wrap the control markup in `.kl-side` and add `.kl-hero`.** In `modal.ts` innerHTML (~415), keep the close button top-level, then structure the body as two panes. Move the toggle, page, proof, actions, mask row, file input, counter, error, desc, hint, email, submit into `.kl-side`. Put `.klavity-strip` and a new `.kl-hero-stage`/`.kl-hero-tools` scaffold into `.kl-hero`.

```ts
modal.innerHTML = `
  <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${icon('x', { size: 16 })}</button>
  <div class="kl-hero" id="klavity-hero">
    <div class="kl-hero-tools" id="klavity-hero-tools"></div>
    <div class="kl-hero-stage" id="klavity-hero-stage"></div>
    <div class="klavity-strip" id="klavity-strip"></div>
  </div>
  <div class="kl-side" id="klavity-side">
    <div class="klavity-toggle">…unchanged…</div>
    <div class="klavity-page">…unchanged…</div>
    ${callbacks.replayState ? `<div class="klavity-proof">…unchanged…</div>` : ''}
    <div class="klavity-actions">…unchanged capture buttons…</div>
    <label class="klav-mask-row">…unchanged…</label>
    <input type="file" id="klavity-file" …>
    <div class="klavity-counter" id="klavity-counter">0/5 images</div>
    <div class="klavity-error" id="klavity-err"></div>
    <textarea class="klavity-desc" id="klavity-desc" …></textarea>
    <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>…</div>
    ${callbacks.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" …>' : ''}
    <button class="klavity-submit" id="klavity-submit" disabled>Submit</button>
    <div class="klavity-progress" id="klavity-progress" …></div>
  </div>
`
```

- [ ] **Step 4: Add grid CSS.** Widen `.klavity-modal` and lay out the two panes. Collapse to a single column under ~720px so mobile still works.

```css
.klavity-modal{max-width:min(1160px,92vw);width:92vw;max-height:94vh;padding:0;display:grid;grid-template-columns:1fr 380px;overflow:hidden;}
.kl-hero{display:flex;flex-direction:column;min-width:0;background:var(--kl-hero-bg,#0e1424);}
.kl-hero-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px;}
.kl-side{display:flex;flex-direction:column;min-width:0;border-left:1px solid var(--kl-border);padding:20px;overflow-y:auto;}
@media (max-width:720px){.klavity-modal{grid-template-columns:1fr;max-height:96vh;}.kl-hero{max-height:42vh;}}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `cd packages/core && pnpm test`
Expected: PASS (new layout test + existing `modal.test.ts`).

- [ ] **Step 6: Run widget tests**

Run: `cd packages/sdk && pnpm test`
Expected: PASS (`modal-email-gate.test.ts` still green — email input still present in side pane).

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/modal.ts packages/core/tests/modal-layout.test.ts
git commit -m "feat(modal): two-pane image-hero layout shell"
```

---

### Task 2: Always-on inline annotator in the hero

Mount an inline annotator on the active screenshot inside `.kl-hero-stage`, with the toolbar rendered into `.kl-hero-tools` and ALWAYS visible. Thumbnails in `.klavity-strip` switch the active image; clicking a thumbnail selects it (no longer opens the fullscreen editor). Reuse the `Annotator` class and the pointer/tool logic currently inside `openAnnotator`.

**Files:**
- Modify: `packages/core/src/modal.ts` (`updateStrip` ~515; extract a new `mountHeroAnnotator(index)`; repoint thumbnail click)
- Test: `packages/core/tests/modal-hero-annotator.test.ts` (new)

**Interfaces:**
- Consumes: `Annotator` from `./annotator`; `annotationsByIndex`, `screenshots` closures.
- Produces: `mountHeroAnnotator(index: number): void` — renders active image big into `#klavity-hero-stage`, wires tools into `#klavity-hero-tools`, persists shapes into `annotationsByIndex[index]` live (no explicit Save step). `activeIndex` closure tracks the selected screenshot.

- [ ] **Step 1: Write failing test** — after adding a screenshot, the hero stage holds a canvas and the tools bar has the tool buttons.

```ts
// packages/core/tests/modal-hero-annotator.test.ts
import { describe, it, expect } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('hero annotator', () => {
  it('mounts a canvas + always-on tools when a screenshot is present', async () => {
    const c = buildModal('bug', { onSubmit: async () => ({ ok: true }) } as any, {})
    c.addScreenshot(PNG)
    const root = c.shadowRoot
    expect(root.querySelector('#klavity-hero-stage canvas')).toBeTruthy()
    const tools = root.querySelector('#klavity-hero-tools')!
    expect(tools.querySelector('[data-tool="pen"]')).toBeTruthy()
    c.close()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd packages/core && pnpm test -- modal-hero-annotator`
Expected: FAIL — no canvas in `#klavity-hero-stage`.

- [ ] **Step 3: Extract inline annotator.** Add `let activeIndex = 0`. Write `mountHeroAnnotator(index)` that (a) clears `#klavity-hero-stage`, builds a canvas sized to the image, `new Annotator(canvas, dataUrl)`, seeds it from `annotationsByIndex[index]?.shapes`, `applyScale(fit)`; (b) renders the tool/color/undo/clear buttons into `#klavity-hero-tools` (reuse the toolbar innerHTML + `selectTool` + pointer handlers from `openAnnotator`, minus the fullscreen chrome); (c) on every `addShape/undo/clear` writes `annotationsByIndex[index] = { w, h, shapes: [...] }` (or deletes when empty) so there's no separate Save. Keep the tool keydown handler scoped to while the modal is open.

- [ ] **Step 4: Repoint thumbnail behavior in `updateStrip`.** Replace `img.addEventListener('click', () => openAnnotator(i))` with `img.addEventListener('click', () => { activeIndex = i; mountHeroAnnotator(i) })`; mark the active thumb. After `addScreenshot`, call `mountHeroAnnotator(activeIndex)`.

- [ ] **Step 5: Run tests, verify pass**

Run: `cd packages/core && pnpm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/modal.ts packages/core/tests/modal-hero-annotator.test.ts
git commit -m "feat(modal): always-on inline annotator in hero pane"
```

---

### Task 3: New tools — Line + Numbers(count), full shortcut set

Add `line` and `count` shapes and wire the full shortcut set to match the approved mock: **P** pen · **L** line · **R** rect · **O** circle · **T** text · **C** numbers · **K** crop(Task 6) · **⌘Z** undo · **S** submit(Task 7). (`arrow` stays available but drops its `a` key to free `o`→circle per mock; keep an Arrow button.)

**Files:**
- Modify: `packages/core/src/types.ts:158-164` (Shape union)
- Modify: `packages/core/src/annotator.ts:49-87` (drawShape)
- Modify: `packages/core/src/modal.ts` (tools innerHTML, `TOOL_KEYS`, pointer commit, count click)
- Test: `packages/core/tests/annotator.test.ts` (extend)

**Interfaces:**
- Consumes: `Annotator.addShape`.
- Produces: `Shape` gains `{ type:'line'; color; x1;y1;x2;y2 }` and `{ type:'count'; color; x; y; n:number }`; `Annotator.drawShape` renders both.

- [ ] **Step 1: Write failing test** for line + count rendering (jsdom canvas is stubbed; assert no throw + shape recorded).

```ts
// append to packages/core/tests/annotator.test.ts
it('records line and numbered-count shapes', () => {
  const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 300
  const a = new Annotator(canvas, 'data:image/png;base64,')
  a.addShape({ type: 'line', color: '#f00', x1: 1, y1: 2, x2: 3, y2: 4 } as any)
  a.addShape({ type: 'count', color: '#f00', x: 5, y: 6, n: 1 } as any)
  expect(a.shapes.map(s => s.type)).toEqual(['line', 'count'])
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd packages/core && pnpm test -- annotator`
Expected: FAIL — TS/shape not accepted or type error.

- [ ] **Step 3: Extend `Shape` union** in `types.ts`:

```ts
  | { type: 'line'; color: string; x1: number; y1: number; x2: number; y2: number }
  | { type: 'count'; color: string; x: number; y: number; n: number }
```

- [ ] **Step 4: Render them** in `annotator.ts` `drawShape`:

```ts
} else if (shape.type === 'line') {
  ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x2, shape.y2); ctx.stroke()
} else if (shape.type === 'count') {
  const r = Math.max(12, this.computeFontSize())
  ctx.beginPath(); ctx.arc(shape.x, shape.y, r, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(shape.n), shape.x, shape.y)
  ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
}
```

- [ ] **Step 5: Wire tools + shortcuts** in the hero toolbar: add Line + Numbers buttons; `TOOL_KEYS = { p:'pen', l:'line', r:'rect', o:'circle', t:'text', c:'count' }`. In pointer handlers: `line` commits `{type:'line',...}`; `count` is click-to-drop with an incrementing `countN` closure (`{type:'count', x, y, n: ++countN}`).

- [ ] **Step 6: Run tests, verify pass**

Run: `cd packages/core && pnpm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/types.ts packages/core/src/annotator.ts packages/core/src/modal.ts packages/core/tests/annotator.test.ts
git commit -m "feat(annotator): line + numbered-count tools with shortcuts P/L/R/O/T/C"
```

---

### Task 4: Text options (size + outline)

Extend the `text` shape with optional `size` and `outline` ('black'|'white'|'none'); show a contextual size/outline group in the hero toolbar only when the Text tool is active.

**Files:**
- Modify: `packages/core/src/types.ts` (text shape), `packages/core/src/annotator.ts` (text render), `packages/core/src/modal.ts` (contextual controls)
- Test: `packages/core/tests/annotator.test.ts`

- [ ] **Step 1:** Test that a text shape with `size`+`outline` records and renders without throwing.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** `text` shape gains `size?: number; outline?: 'black'|'white'|'none'`. Render: `ctx.font = bold ${size ?? computeFontSize()}px`; if outline !== 'none', `ctx.lineJoin='round'; ctx.lineWidth=max(3,size*0.18); ctx.strokeStyle = outline==='white'?'#fff':'#111'; ctx.strokeText(...)` before fill.
- [ ] **Step 4:** Hero toolbar `#klavity-text-opts` group (Outline: Black/White/None; Size: S16/M24/L36), `display:none` unless active tool is `text`; store `textSize`/`textOutline` closures fed into the text shape on commit.
- [ ] **Step 5:** Run → PASS.
- [ ] **Step 6:** Commit `feat(annotator): text size + outline options`.

---

### Task 5: Thumbnails-below + shortcut hint polish

Confirm thumbnails render as a horizontal strip under the hero image with active-selection + remove, and the tools/shortcut legend sit above the image (already positioned by Task 1/2). Add the shortcut legend to `#klavity-hero-tools`.

**Files:** Modify `packages/core/src/modal.ts` (strip CSS + legend). Test: extend `modal-hero-annotator.test.ts` to assert `.klavity-strip` is inside `.kl-hero` and the legend text is present.

- [ ] Steps: failing test → verify fail → implement strip CSS + legend → verify pass → commit `feat(modal): thumbnail strip below hero + shortcut legend`.

---

### Task 6: Crop tool (K)

Add a destructive Crop tool: drag a region, dim outside; on release, replace `screenshots[index]` with the cropped data URL and clear/rebase that image's shapes. Reuse the compressed-array update path. Shortcut **K**.

**Files:** Modify `packages/core/src/modal.ts` (crop pointer mode + `applyCrop`). Test: `packages/core/tests/modal-crop.test.ts` verifying `screenshots[index]` changes after a programmatic crop helper.

- [ ] Steps: failing test on a `cropActive(index, rect)` helper → verify fail → implement crop (canvas draw region → `toDataURL`) → verify pass → commit `feat(modal): crop tool (K)`.

---

### Task 7: Submit shortcut (S) + defaults

`S` submits when not typing in a field (reuse the `INPUT/TEXTAREA/contentEditable` guard). Confirm annotation tools default ON (pen active on mount) and reword the confusing hint to "No title needed — we'll auto-generate one for you".

**Files:** Modify `packages/core/src/modal.ts` (keydown handler, hint copy). Test: extend layout test to assert the hint copy + that pen is the default active tool.

- [ ] Steps: failing test → verify fail → implement `S`-submit + default pen + hint copy → verify pass → commit `feat(modal): S-to-submit, default pen, clearer title hint`.

---

## Self-Review

- **Spec coverage:** hero image (T1), controls in right column w/ Submit (T1), tools on by default + shortcuts p/l/o/c (T2/T3/T7), rectangle R + text T (T3/existing), STT voice (already exists as `#klavity-voice`; surfaced in side pane by T1), thumbnails below (T5), shortcuts above (T2/T5), text outline+size (T4), crop K (T6), S-submit (T7), reword confusing hint (T7). ✔ All mock requests mapped.
- **Placeholder scan:** Tasks 1-3 carry concrete code; Tasks 4-7 give exact shapes/handlers/copy — refine rendering during TDD. No TBDs.
- **Type consistency:** `mountHeroAnnotator(index)`, `activeIndex`, `countN`, `textSize`/`textOutline`, Shape `line`/`count`/text-`size`/`outline` used consistently across tasks.
