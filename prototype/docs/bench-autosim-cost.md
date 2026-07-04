# AutoSim cost & stability benchmark — 2026-07-04

Goal: make AutoSims **cheaper** (LLM spend per authoring drive / reheal) and **more stable**
(dead-Chromium incidents on the 1GB prod box). Bench script: `scripts/bench-autosim-cost.ts`
(`bun scripts/bench-autosim-cost.ts --live`). All costs are REAL OpenRouter `usage.cost`.

## What was compared

Per authoring step (mirrors `lib/trails-author.ts` payloads):

| Variant | Model | Page state | Screenshot |
|---|---|---|---|
| **A current** | qwen3-vl-235b | raw `page.content()` capped 16KB | JPEG q60 |
| **B compact-vision** | qwen3-vl-235b | compact kref element tree | JPEG q60 |
| **C text-only-vl** | qwen3-vl-235b | compact kref element tree | none |
| **D text-only-lite** | gemini-2.5-flash-lite | compact kref element tree | none |

"kref tree" = in-page serializer emitting `role "name" [ref=eN]` lines for visible
interactive/semantic elements, stamping `data-kref="eN"` on each — so every ref the model
returns is a **real, unique CSS selector** (`[data-kref="e10"]`), no re-resolution needed.
(Playwright 1.61's `ariaSnapshot({ref:true})` silently ignores `ref` — hence our own.)

## Results (3 pages × 2 iters, klavity.in home + onboarding + github login)

### Size: kref tree vs raw HTML

| page | rawHTML | cap16k | krefTree | saving vs cap16k |
|---|---|---|---|---|
| klavity.in/ | 87,305 | 16,000 | 1,638 | 89.8% |
| klavity.in/onboarding | 59,074 | 16,000 | 461 | 97.1% |
| github.com/login | 73,238 | 16,000 | 711 | 95.6% |

App/form pages (the AutoSim case) shrink 90–97%. Dense content pages shrink less
(blog 78%); a per-snapshot cap is still advisable.

### Cost, latency, selector validity (avg per step; validated live on the page)

| Variant | avg inTok | avg cost/step | avg latency | valid actions | 40-step session |
|---|---|---|---|---|---|
| A current | 6,886 | $0.001381 | 1227ms | **2/6** | $0.055 |
| B compact-vision | 1,734 | $0.000502 | 1029ms | 6/6 | $0.020 (−64%) |
| C text-only-vl | 731 | $0.000195 | 567ms | 6/6 | $0.008 (−86%) |
| D text-only-lite | 786 | $0.000097 | 1019ms | 5/6 | $0.004 (−93%) |

### Key findings

1. **The raw-HTML dump is not just expensive — it's the main quality problem.** The 16KB cap
   is eaten by `<head>`/CSS on real pages, so the model invents selectors from the screenshot
   (`button.goaltile[data-goal='snap']` — matches 0; `button:has-text='…'` — invalid syntax).
   4/6 variant-A steps produced non-resolving selectors. The kref tree resolved 17/18.
2. **Dropping the screenshot (page-agent style) is the single biggest cost lever** — the
   image is ~4–5k input tokens. Text-only qwen3-vl is 86% cheaper and ~2x faster per step.
3. **A cheap text model (flash-lite) handles single-step action-picking fine** (5/6 valid,
   93% cheaper), but qwen3-vl text-only is the safer default; flash-lite as a weighted mix.
4. Screenshot still has value for visual states (spinners, layout breakage). Pragmatic shape:
   **text-first with screenshot escalation** — author steps run text-only; on a miss/stall,
   retry once with the screenshot attached. Reheal (Tier 2) keeps vision.

## Recommendation

- **Adopt now (cheap, safe):** replace `domSnapshot` in `trails-author.ts` +
  `trails-vision.ts` with the kref tree (keep a ~24KB snapshot cap for dense pages), and let
  models answer with `[data-kref="eN"]` selectors; persist a stable selector afterwards via
  the existing `persistableSelector()` path. Expected: ~64% cheaper with screenshot kept,
  fewer hallucinated-selector misses (the current #1 authoring failure).
- **Next (bigger win):** text-first authoring with screenshot escalation → ~86–93% cheaper,
  faster steps. Benchmark multi-step end-to-end before making it the default.
- **Stability is a separate lever:** LLM savings don't fix dead-Chromium-on-1GB. See the
  cloud-browser evaluation (Steel.dev Launch ≈ $4.50/mo at current volume, `connectOverCDP`
  one-line change, Apache-2.0 self-host escape hatch) — cheaper than upgrading the Vultr box
  and removes the ops burden. Gate via env (`AUTOSIM_CDP_URL`, fallback to local launch).

## Caveats

- Single-step bench (first action from a fresh page), not full multi-step drives; history
  growth and mid-flow states not covered. Run a full authored-Trail A/B before switching
  defaults.
- The kref serializer is minimal (no plain-text blocks) — assertions that need page text may
  want a short visible-text digest appended.
- news.ycombinator.com capture was rate-limited during the run (excluded from live phase).

## Full authored-Trail A/B (scripts/bench-author-ab.ts)

Arm A = kref snapshot + screenshot every step. Arm B = KLAV_AUTHOR_TEXT_FIRST (text-first,
screenshot only on the retry after a miss). Same objective, real OpenRouter spend.
Run: `bun scripts/bench-author-ab.ts` — append the console.table rows here per run.
Decision rule: flip the default only if arm B is ≥50% cheaper AND status/verdict are not worse
across 3 runs.

### Results 2026-07-04 (objective: open most recent post from /blog + assert heading)

| run | arm | status | verdict | llmCalls | cost | secs |
|---|---|---|---|---|---|---|
| 1 | A current | crystallized | green | 14 | $0.01181 | 44 |
| 1 | B text-first | crystallized | green | 6 | $0.00237 | 15 |
| 2 | A current | crystallized | green | 7 | $0.00563 | 28 |
| 2 | B text-first | crystallized | green | 13 (1 miss) | $0.00676 | 27 |
| 3 | A current | crystallized | green | 7 | $0.00474 | 24 |
| 3 | B text-first | crystallized | green | 4 | $0.00196 | 10 |

**Aggregate: A $0.02218 vs B $0.01109 → B 50.0% cheaper; verdicts equal (6/6 green).**
Per-run: B won 2 of 3 (−80%, −59%); run 2 B wandered (+20%, 13 calls incl. 1 escalation).
Reading: quality is NOT worse (all green, and in the earlier impossible-objective runs both
arms stalled honestly); cost sits exactly at the ≥50% rule's edge with high path-length
variance. Bigger sessions amplify the saving (per-call: A $0.00079 vs B $0.00048).
Earlier flawed-objective runs (home page has no blog link — both arms honestly stalled):
$0.0027/$0.0012, $0.0024/$0.0009, $0.0026/$0.0007, $0.0014/$0.0016 — B cheaper in 3 of 4.
**Recommendation: flip-worthy, but owner's call — enable via `KLAV_AUTHOR_TEXT_FIRST=1` in
/etc/klav/klav.env (instant revert by unsetting).**

**DECISION 2026-07-04: text-first is now the DEFAULT** (owner flipped arm B on). `authorTrail`
runs text-only on the happy path and escalates a screenshot only after a miss. Kill-switch:
set `KLAV_AUTHOR_TEXT_FIRST=0` in `/etc/klav/klav.env` to revert to arm A (screenshot every
step). Reheal Tier-2 still uses vision regardless.
