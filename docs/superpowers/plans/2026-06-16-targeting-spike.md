# Element-Targeting De-Risk Spike — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Determine whether a vision LLM, given a screenshot **plus a client-shipped element map**, can return the *correct* DOM element for a plausible persona reaction often enough (≥70% on dense pages) to justify the precise "finger-on-the-button" UX — and ship the selector-primary targeting contract into the prototype so the answer is measured on real code, not vibes.

**Why this is Plan 1 of the series:** The spec (`docs/superpowers/specs/2026-06-16-klav-sims-design.md` §1.2, §6.2, §14) makes this spike a hard prerequisite to all backend/infra work. Its go/no-go decides whether `@klav/character` points precisely or degrades to region-reactions. Plans 2+ (`@klav/sims-core`, transcript extraction, character dock, backend, web app) are written **after** this spike returns a number.

**Architecture:** Extend `prototype/` (the existing Bun core-loop prototype). Add (a) a pure, unit-tested targeting module (`ElementTarget`/`ElementMap` types + rect/direction resolution — the canonical contract from spec §6.2), (b) a browser DOM extractor that ships an element map alongside the screenshot, (c) an updated `/api/react` that asks the model for a **ref-primary** target, and (d) a Bun benchmark runner that measures correct-element accuracy over labeled cases. Pure logic is tested with `bun:test`; vision accuracy is measured by the benchmark.

**Tech Stack:** Bun + `bun:test`, TypeScript, OpenRouter (Claude vision: `anthropic/claude-sonnet-4.6` default), `html-to-image` (already used).

---

## File structure

| File | Responsibility |
|---|---|
| `prototype/src/targeting.ts` (create) | Canonical `ElementMap`/`ElementTarget` types + pure resolvers: `resolveTargetRect`, `pickPointDirection`, `rankAndCap`, `buildSelector`. The contract every later package imports. |
| `prototype/src/targeting.test.ts` (create) | `bun:test` unit tests for every pure function above. |
| `prototype/public/elementMap.js` (create) | Browser-only: `extractElementMap(root)` walks the DOM into an `ElementMap` (selector + rect + text + role per candidate). |
| `prototype/server.ts` (modify) | `/api/react` accepts an `elementMap`, prompts for a ref-primary `ElementTarget`, returns it per reaction. |
| `prototype/public/index.html` (modify) | Extract map → screenshot → send both; render the pointer via `ref → rect`. |
| `prototype/bench/run.ts` (create) | Load `bench/cases/*.json`, call the model, compute accuracy, print a report. |
| `prototype/bench/cases/demo-dashboard.json` (create) | One seed case (the built-in dashboard) so the bench runs out of the box. |
| `prototype/bench/README.md` (create) | How to add real-page cases (the human-in-the-loop measurement step). |
| `prototype/package.json` (modify) | Add `"test": "bun test"` and `"bench": "bun run bench/run.ts"`. |

---

## Task 1: Canonical targeting types + pure resolvers (TDD)

**Files:**
- Create: `prototype/src/targeting.ts`
- Test: `prototype/src/targeting.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// prototype/src/targeting.test.ts
import { test, expect } from "bun:test"
import { resolveTargetRect, pickPointDirection, rankAndCap, buildSelector } from "./targeting"
import type { ElementMap, ElementTarget } from "./targeting"

const vp = { w: 1000, h: 600 }
const map: ElementMap = [
  { ref: 0, selector: "#a", rect: { x: 10, y: 10, w: 100, h: 40 }, text: "A", role: "button" },
  { ref: 1, selector: "#b", rect: { x: 500, y: 500, w: 80, h: 30 }, text: "B", role: "a" },
]

test("resolveTargetRect: ref wins and returns the map entry's rect", () => {
  const t: ElementTarget = { ref: 1, selector: "#x", rect: null, bboxNorm: { x: 0, y: 0, w: 0.1, h: 0.1 }, pointDirection: "up", confidence: 0.9 }
  expect(resolveTargetRect(t, map, vp)).toEqual({ x: 500, y: 500, w: 80, h: 30 })
})

test("resolveTargetRect: unknown ref falls back to explicit rect", () => {
  const t: ElementTarget = { ref: 99, selector: null, rect: { x: 1, y: 2, w: 3, h: 4 }, bboxNorm: null, pointDirection: "up", confidence: 0.5 }
  expect(resolveTargetRect(t, map, vp)).toEqual({ x: 1, y: 2, w: 3, h: 4 })
})

test("resolveTargetRect: bboxNorm is denormalised against the viewport", () => {
  const t: ElementTarget = { ref: null, selector: null, rect: null, bboxNorm: { x: 0.5, y: 0.5, w: 0.1, h: 0.2 }, pointDirection: "up", confidence: 0.3 }
  expect(resolveTargetRect(t, map, vp)).toEqual({ x: 500, y: 300, w: 100, h: 120 })
})

test("resolveTargetRect: all-null returns null", () => {
  const t: ElementTarget = { ref: null, selector: null, rect: null, bboxNorm: null, pointDirection: "up", confidence: 0 }
  expect(resolveTargetRect(t, map, vp)).toBeNull()
})

test("pickPointDirection: room below → point up", () => {
  expect(pickPointDirection({ x: 100, y: 100, w: 50, h: 20 }, vp)).toBe("up")
})

test("pickPointDirection: no room below, room above → point down", () => {
  expect(pickPointDirection({ x: 100, y: 560, w: 50, h: 30 }, vp)).toBe("down")
})

test("rankAndCap: caps to n and returns ref-sorted", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ ref: i, selector: `#e${i}`, rect: { x: 0, y: 0, w: i + 1, h: 1 }, text: "", role: "div" }))
  const out = rankAndCap(many, 3)
  expect(out.length).toBe(3)
  expect(out.map((e) => e.ref)).toEqual([...out.map((e) => e.ref)].sort((a, b) => a - b))
})

test("buildSelector: prefers id, then data-testid, then nth-of-type path", () => {
  expect(buildSelector({ id: "save", dataset: {}, tagName: "BUTTON", parent: null, indexAmongType: 1 })).toBe("#save")
  expect(buildSelector({ dataset: { testid: "row-3" }, tagName: "DIV", parent: null, indexAmongType: 1 })).toBe('[data-testid="row-3"]')
  const parent = { dataset: {}, tagName: "SECTION", parent: null, indexAmongType: 2 }
  expect(buildSelector({ dataset: {}, tagName: "BUTTON", parent, indexAmongType: 1 })).toBe("section:nth-of-type(2) > button:nth-of-type(1)")
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd prototype && bun test src/targeting.test.ts`
Expected: FAIL — `Cannot find module "./targeting"`.

- [ ] **Step 3: Write the implementation**

```ts
// prototype/src/targeting.ts
export interface Rect { x: number; y: number; w: number; h: number }
export type PointDirection = "up" | "down" | "left" | "right"

export interface ElementMapEntry {
  ref: number
  selector: string
  rect: Rect      // viewport CSS px at capture time
  text: string    // truncated visible text
  role: string    // tag name or aria role
}
export type ElementMap = ElementMapEntry[]

// Canonical element-targeting contract (spec §6.2). ref is PRIMARY; bboxNorm is FALLBACK only.
export interface ElementTarget {
  ref: number | null
  selector: string | null
  rect: Rect | null
  bboxNorm: Rect | null          // 0..1 of viewport
  pointDirection: PointDirection
  label?: string
  confidence: number
}

export interface Viewport { w: number; h: number }

export function resolveTargetRect(t: ElementTarget, map: ElementMap, vp: Viewport): Rect | null {
  if (t.ref != null) {
    const e = map.find((m) => m.ref === t.ref)
    if (e) return e.rect
  }
  if (t.rect) return t.rect
  if (t.bboxNorm) return { x: t.bboxNorm.x * vp.w, y: t.bboxNorm.y * vp.h, w: t.bboxNorm.w * vp.w, h: t.bboxNorm.h * vp.h }
  return null
}

export function pickPointDirection(rect: Rect, vp: Viewport): PointDirection {
  const below = vp.h - (rect.y + rect.h)
  const above = rect.y
  if (below >= 60) return "up"
  if (above >= 60) return "down"
  const right = vp.w - (rect.x + rect.w)
  return right >= 60 ? "left" : "right"
}

export function rankAndCap(entries: ElementMapEntry[], n: number): ElementMapEntry[] {
  const score = (e: ElementMapEntry) =>
    e.rect.w * e.rect.h * (e.text ? 1.5 : 1) * (/(button|^a$|input|select|textarea)/i.test(e.role) ? 1.3 : 1)
  return [...entries].sort((a, b) => score(b) - score(a)).slice(0, n).sort((a, b) => a.ref - b.ref)
}

export interface SelNode {
  id?: string
  dataset?: Record<string, string>
  tagName: string
  parent: SelNode | null
  indexAmongType: number // 1-based nth-of-type among same-tag siblings
}

export function buildSelector(node: SelNode): string {
  if (node.id) return `#${node.id}`
  if (node.dataset && node.dataset.testid) return `[data-testid="${node.dataset.testid}"]`
  const seg = (n: SelNode) => `${n.tagName.toLowerCase()}:nth-of-type(${n.indexAmongType})`
  const parts: string[] = []
  let cur: SelNode | null = node
  let depth = 0
  while (cur && depth < 4) {
    if (cur.id) { parts.unshift(`#${cur.id}`); break }
    parts.unshift(seg(cur))
    cur = cur.parent
    depth++
  }
  return parts.join(" > ")
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd prototype && bun test src/targeting.test.ts`
Expected: PASS — 8 pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add prototype/src/targeting.ts prototype/src/targeting.test.ts
git commit -m "feat(spike): canonical element-targeting contract + pure resolvers"
```

---

## Task 2: Wire `bun test` script

**Files:**
- Modify: `prototype/package.json`

- [ ] **Step 1: Add the test + bench scripts**

Edit `prototype/package.json` so `"scripts"` reads:

```json
"scripts": { "start": "bun run server.ts", "test": "bun test", "bench": "bun run bench/run.ts" }
```

- [ ] **Step 2: Run the suite**

Run: `cd prototype && bun test`
Expected: PASS — the `src/targeting.test.ts` suite runs green.

- [ ] **Step 3: Commit**

```bash
git add prototype/package.json
git commit -m "chore(spike): add bun test + bench scripts"
```

---

## Task 3: Browser DOM element-map extractor

**Files:**
- Create: `prototype/public/elementMap.js`

This runs in the browser (no unit test — the pure selector/ranking logic it relies on is already tested in Task 1). It produces the `ElementMap` shipped to the model.

- [ ] **Step 1: Write the extractor**

```js
// prototype/public/elementMap.js  — browser ES module
// Walk the rendered DOM under `root` into a compact ElementMap (spec §6.2 ElementMapEntry[]).
const CANDIDATE = "button, a, input, select, textarea, [role], h1, h2, h3, .kpi, .card, .ap"

function indexAmongType(el) {
  let i = 1, sib = el
  while ((sib = sib.previousElementSibling)) if (sib.tagName === el.tagName) i++
  return i
}
function selNode(el) {
  return { id: el.id || undefined, dataset: { testid: el.dataset?.testid }, tagName: el.tagName,
           parent: el.parentElement ? selNode(el.parentElement) : null, indexAmongType: indexAmongType(el) }
}
// Inlined copy of buildSelector (Task 1) — the browser can't import the .ts directly here.
function buildSelector(node) {
  if (node.id) return `#${node.id}`
  if (node.dataset && node.dataset.testid) return `[data-testid="${node.dataset.testid}"]`
  const seg = (n) => `${n.tagName.toLowerCase()}:nth-of-type(${n.indexAmongType})`
  const parts = []; let cur = node, depth = 0
  while (cur && depth < 4) { if (cur.id) { parts.unshift(`#${cur.id}`); break } parts.unshift(seg(cur)); cur = cur.parent; depth++ }
  return parts.join(" > ")
}

export function extractElementMap(root, max = 60) {
  const rootRect = root.getBoundingClientRect()
  const els = [...root.querySelectorAll(CANDIDATE)]
  const entries = []
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width < 8 || r.height < 8) continue // skip invisibles
    entries.push({
      ref: 0, // assigned after ranking
      selector: buildSelector(selNode(el)),
      rect: { x: Math.round(r.left - rootRect.left), y: Math.round(r.top - rootRect.top), w: Math.round(r.width), h: Math.round(r.height) },
      text: (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 80),
      role: el.getAttribute("role") || el.tagName.toLowerCase(),
    })
  }
  // rank by area*text*interactivity, cap, then assign stable refs by reading order (top-to-bottom)
  const score = (e) => e.rect.w * e.rect.h * (e.text ? 1.5 : 1) * (/(button|^a$|input|select|textarea)/i.test(e.role) ? 1.3 : 1)
  const capped = entries.sort((a, b) => score(b) - score(a)).slice(0, max)
  capped.sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x)
  capped.forEach((e, i) => (e.ref = i))
  return capped
}
```

- [ ] **Step 2: Manual smoke check**

Run: `cd prototype && bun run server.ts` (with the `.env` key present), open `http://localhost:4317`, then in the browser console:
```js
const m = await import("/elementMap.js"); console.log(m.extractElementMap(document.getElementById("stage")))
```
Expected: an array of ~15–40 entries, each with `ref`, `selector`, `rect`, `text`, `role`; the "Pending Approvals" card and the KPI tiles appear with sensible rects.

- [ ] **Step 3: Commit**

```bash
git add prototype/public/elementMap.js
git commit -m "feat(spike): browser DOM element-map extractor"
```

---

## Task 4: `/api/react` consumes the element map and returns a ref-primary target

**Files:**
- Modify: `prototype/server.ts`

- [ ] **Step 1: Replace the reaction prompt + handler to use the element map**

In `prototype/server.ts`, replace the `REACT_SYS` constant and the `reactToPage` function with:

```ts
const REACT_SYS =
  "You ARE the given user persona, reviewing a screenshot of a product page as if really using it. " +
  "React in FIRST PERSON, grounded in this persona's documented pains, wants, and loves. " +
  "You are also given an ELEMENT MAP: a numbered list of on-screen elements (ref, role, text). " +
  "For each reaction, set target.ref to the ref of the element you are reacting to (PRIMARY). " +
  "Only if NO element matches, set ref to null and fill target.bboxNorm with a normalised 0..1 box; otherwise bboxNorm must be null. " +
  "Give 1-3 reactions, most important first. suggestedBug is filled only for a real problem worth filing, else null.\n\n" +
  "Respond with ONLY a JSON object, no prose, in exactly this shape:\n" +
  '{"reactions":[{"observation":string(<=240 chars, first person),"sentiment":"frustrated"|"confused"|"satisfied"|"delighted"|"neutral",' +
  '"emoji":string,"target":{"ref":number|null,"bboxNorm":{"x":number,"y":number,"w":number,"h":number}|null,"label":string,"confidence":number},' +
  '"suggestedBug":{"title":string,"body":string,"severity":"high"|"medium"|"low"}|null}]}'

async function reactToPage(persona: any, imageB64: string, mediaType: string, pageUrl: string, elementMap: any[]) {
  const mapText = (elementMap || [])
    .map((e) => `#${e.ref} [${e.role}] ${JSON.stringify(e.text)}`)
    .join("\n")
  const { content, usage } = await chat(
    [
      { role: "system", content: REACT_SYS },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "You are this persona:\n" + JSON.stringify(persona, null, 2) +
              `\n\nELEMENT MAP (ref → role/text):\n${mapText}\n\nReact to this screenshot of ${pageUrl || "(unknown URL)"}.`,
          },
          { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageB64}` } },
        ],
      },
    ],
    2500,
  )
  return { data: parseJSON(content), usage }
}
```

- [ ] **Step 2: Update the `/api/react` route to pass `elementMap` through**

In the `POST /api/react` handler, change the destructure and call:

```ts
const { persona, imageB64, mediaType, pageUrl, elementMap } = await req.json()
if (!persona || !imageB64) return json({ error: "persona and imageB64 required" }, 400)
const { data, usage } = await reactToPage(persona, imageB64, mediaType || "image/png", pageUrl || "", elementMap || [])
return json({ reactions: data.reactions || [], usage })
```

- [ ] **Step 3: Verify the server still boots**

Run: `cd prototype && (bun run server.ts &) && sleep 2 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4317/ ; pkill -f "bun run server.ts"`
Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add prototype/server.ts
git commit -m "feat(spike): reaction endpoint takes element map, returns ref-primary target"
```

---

## Task 5: Front-end ships the map and points via `ref → rect`

**Files:**
- Modify: `prototype/public/index.html`

- [ ] **Step 1: Import the extractor and send the map; resolve the pointer by ref**

In the `<script type="module">` of `prototype/public/index.html`:

1. Add to the imports at the top:
```js
import { extractElementMap } from "/elementMap.js"
```

2. In `review(i)`, build the map from the stage **before** screenshotting, and include it in the POST body. Replace the body line with:
```js
const elementMap = extractElementMap($("stage"))
const r = await fetch("/api/react", { method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ persona: sim, imageB64, mediaType: "image/png", pageUrl: "acme-finance/overview", elementMap }) })
```
and stash the map for playback: after the response, call `playReactions(sim, data.reactions, elementMap)`.

3. Change `playReactions(sim, reactions)` to `playReactions(sim, reactions, elementMap)` and resolve each reaction's rect from the map by ref, falling back to bboxNorm:
```js
async function playReactions(sim, reactions, elementMap) {
  const stage = $("stage"); const W = stage.clientWidth, H = stage.clientHeight
  const char = makeChar(sim); stage.appendChild(char)
  char.style.left = "8px"; char.style.top = (H - 56) + "px"; await sleep(60)
  for (const rx of reactions) {
    const t = rx.target || {}
    let rect = null
    if (t.ref != null) { const e = (elementMap || []).find(m => m.ref === t.ref); if (e) rect = e.rect }
    if (!rect && t.bboxNorm) rect = { x: t.bboxNorm.x * W, y: t.bboxNorm.y * H, w: t.bboxNorm.w * W, h: t.bboxNorm.h * H }
    let cx = W * 0.5, cy = H * 0.5, hi = null
    if (rect) {
      cx = rect.x + rect.w / 2; cy = rect.y + rect.h / 2
      hi = document.createElement("div"); hi.className = "hilite"
      hi.style.left = rect.x + "px"; hi.style.top = rect.y + "px"; hi.style.width = rect.w + "px"; hi.style.height = rect.h + "px"
      stage.appendChild(hi)
    }
    char.classList.add("walking"); char.classList.remove("pointing")
    char.style.left = Math.max(4, Math.min(W - 42, cx - 19)) + "px"
    char.style.top = Math.max(4, Math.min(H - 56, cy + 8)) + "px"
    await sleep(950)
    char.classList.remove("walking"); char.classList.add("pointing")
    showBubble(char, sim, rx); await sleep(4200)
    hideBubble(char); if (hi) hi.style.opacity = "0"; await sleep(350)
  }
  char.classList.add("walking"); char.classList.remove("pointing"); char.style.left = (W + 30) + "px"
  await sleep(900); char.remove(); clearOverlays()
}
```

- [ ] **Step 2: Manual end-to-end check (needs the OpenRouter key in `.env`)**

Run: `cd prototype && bun run server.ts`, open `http://localhost:4317`, click **Extract Sims**, then **Have Sarah review this page →**.
Expected: Sarah walks to (and highlights) the **Pending Approvals** card or a KPI tile via the returned ref — not a random spot — and bubbles a grounded, in-character reaction. The highlight box hugs a real element.

- [ ] **Step 3: Commit**

```bash
git add prototype/public/index.html
git commit -m "feat(spike): front-end ships element map and points via ref→rect"
```

---

## Task 6: Benchmark runner + seed case

**Files:**
- Create: `prototype/bench/run.ts`
- Create: `prototype/bench/cases/demo-dashboard.json`
- Create: `prototype/bench/README.md`

- [ ] **Step 1: Write the seed case**

A case = a screenshot (base64 PNG), its element map, a persona-reaction context, and the human-labeled `correctRefs` (one or more acceptable element refs). For the seed, capture the demo dashboard once and hand-label. Create `prototype/bench/cases/demo-dashboard.json`:

```json
{
  "name": "demo-dashboard / Sarah / sorting",
  "pageUrl": "acme-finance/overview",
  "persona": { "name": "Sarah Chen", "role": "CFO", "insights": [
    { "kind": "pain", "text": "Approval list not sorted by urgency", "quote": "I cannot find overdue items" } ] },
  "imagePath": "cases/demo-dashboard.png",
  "elementMapPath": "cases/demo-dashboard.map.json",
  "correctRefs": [],
  "note": "Fill correctRefs after capturing: the ref(s) of the Pending Approvals card / overdue rows. Capture with the browser console snippet in bench/README.md."
}
```

- [ ] **Step 2: Write the runner**

```ts
// prototype/bench/run.ts — Bun. Measures correct-element accuracy of /api/react over labeled cases.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const PORT = Number(process.env.PORT || 4317)
const dir = join(import.meta.dir, "cases")

const cases = readdirSync(dir).filter((f) => f.endsWith(".json") && !f.endsWith(".map.json"))
let total = 0, correct = 0, localizable = 0
const rows: string[] = []

for (const f of cases) {
  const c = JSON.parse(readFileSync(join(dir, f), "utf8"))
  if (!c.correctRefs || c.correctRefs.length === 0) { rows.push(`SKIP  ${c.name} (no correctRefs labeled)`); continue }
  const imageB64 = readFileSync(join(import.meta.dir, c.imagePath)).toString("base64")
  const elementMap = JSON.parse(readFileSync(join(import.meta.dir, c.elementMapPath), "utf8"))
  const res = await fetch(`http://localhost:${PORT}/api/react`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ persona: c.persona, imageB64, mediaType: "image/png", pageUrl: c.pageUrl, elementMap }),
  })
  const data = await res.json()
  const top = (data.reactions || [])[0]
  const ref = top?.target?.ref
  total++
  if (ref != null) localizable++
  const hit = ref != null && c.correctRefs.includes(ref)
  if (hit) correct++
  rows.push(`${hit ? "✅" : "❌"}  ${c.name}  → ref=${ref} (correct: ${c.correctRefs.join(",")})`)
}

console.log("\n" + rows.join("\n"))
console.log(`\nCases scored: ${total} · localizable: ${localizable} · CORRECT-ELEMENT ACCURACY: ${total ? Math.round((correct / total) * 100) : 0}%`)
console.log(total && correct / total >= 0.7 ? "→ GO: precise-point UX is viable." : "→ NO-GO (or thin data): degrade to region-reaction; add more cases.")
```

- [ ] **Step 3: Write `bench/README.md` (the human measurement step)**

```markdown
# Targeting benchmark

Measures how often the vision model returns the *correct* element ref for a persona reaction.

## Add a real-page case
1. Start the server: `bun run server.ts`. Open the page you want to test (or paste a screenshot into the prototype stage).
2. In the browser console capture the map + screenshot for the element under test:
   ```js
   const { extractElementMap } = await import("/elementMap.js")
   const stage = document.getElementById("stage")
   const map = extractElementMap(stage)
   copy(JSON.stringify(map))            // → save as bench/cases/<name>.map.json
   const { toPng } = await import("https://esm.sh/html-to-image@1.11.13")
   const url = await toPng(stage, { pixelRatio: 1 }); console.log(url) // save the PNG as bench/cases/<name>.png
   ```
3. Look at the map, find the ref(s) a reasonable persona reaction *should* point at, and put them in `correctRefs`.
4. Repeat for ~15 elements across 3 dense real apps.

## Run
`bun run bench` (server must be running). Reads every `cases/*.json`, prints per-case hit/miss and the overall accuracy + GO/NO-GO.
```

- [ ] **Step 4: Verify the runner executes (skips unlabeled seed gracefully)**

Run: `cd prototype && (bun run server.ts &) && sleep 2 && bun run bench ; pkill -f "bun run server.ts"`
Expected: prints `SKIP demo-dashboard ... (no correctRefs labeled)` and `Cases scored: 0 ... ACCURACY: 0%` — confirming the harness runs end to end before any real cases exist.

- [ ] **Step 5: Commit**

```bash
git add prototype/bench/
git commit -m "feat(spike): benchmark runner + seed case + measurement guide"
```

---

## Task 7: Run the spike and record the decision (human-in-the-loop)

**Files:**
- Create: `docs/superpowers/specs/2026-06-16-targeting-spike-results.md`

This is the deliverable that gates Plans 2+. It requires real screenshots and human labels (see `bench/README.md`) — it cannot be fully automated.

- [ ] **Step 1: Build ~15 labeled cases** across 3 dense real SaaS apps following `bench/README.md`.

- [ ] **Step 2: Run** `cd prototype && bun run bench` and capture the accuracy number + per-case output.

- [ ] **Step 3: Write the results doc** recording: the accuracy %, the failure patterns (which element kinds the model missed), and the **decision**:
  - **≥70%** → GO: precise-point UX stands; Plan 3 (`@klav/character`) implements walk-and-point with `ref`-primary `ElementTarget`.
  - **<70%** → NO-GO: degrade to region-reaction (bubble near the area, no finger); `@klav/character` ships the region variant; revisit precise-point later.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-06-16-targeting-spike-results.md
git commit -m "docs(spike): targeting accuracy results + precise-point go/no-go decision"
```

---

## Self-review notes

- **Spec coverage:** Implements spec §1.2 (the mandatory de-risk spike), §6.2 (the canonical `ElementTarget`/`ElementMap` contract, selector-primary with bbox fallback), and SC2 (≥70% targeting accuracy, else graceful region fallback). Downstream sections (data model, backend, web app, push) are intentionally **out of scope** — they belong to Plans 2+ and are gated on Task 7's decision.
- **No placeholders:** every code step contains complete, runnable code; the only intentionally-empty value is `correctRefs: []` in the seed case, which the README's Step explains is filled by the human labeler (Task 7).
- **Type consistency:** `ElementTarget`/`ElementMapEntry`/`Rect` are defined once in Task 1 and reused verbatim in Tasks 4–6; the front-end uses `rx.target.ref`/`rx.target.bboxNorm` matching the Task 4 prompt schema; the bench runner reads `top.target.ref` matching the same schema.
