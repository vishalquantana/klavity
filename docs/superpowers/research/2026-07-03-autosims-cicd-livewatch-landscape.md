# AutoSims — CI/CD, live-watch & OSS landscape delta research (2026-07-03)

Delta on the 2026-06-20 147-product research (which locked author-once →
crystallize → zero-LLM replay → gated heal). New questions from the user:
CI/CD connectivity, real-time watching of server-run Walks, current OSS
landscape, LLM+Playwright vs alternatives. Two-agent sweep: internal
synthesis re-mine + fresh web research (20+ sources, claims cross-verified).

## 1. Landscape verdict (mid-2026): our architecture WON — and is no longer unique

Stagehand v3 (MIT, ~22k★), Skyvern code-caching (AGPL), browser-use action
caching (Python), midscene.js (MIT, ByteDance), and Passmark/bug0 (FSL) all
converged during late-2025/early-2026 on exactly our loop: AI discovers once
→ cached deterministic replay zero-LLM → AI re-enters only on break.
Every-step-LLM survives only for one-off agentic workflows, not regression.
Dead/pivoted: Magnitude (repo now a coding agent), Shortest (low momentum),
Octomind (died May 2026 — self-healing alone is not a moat).

**Differentiation that remains ours:** never-silent-heal review workflow
(heal-as-reviewable-diff + AMBER + findings gate — no OSS tool has it;
Stagehand heals automatically with no review gate), drift-vs-regression
diagnosis-first, self-hosted tiny-VPS footprint (nobody targets 1GB), and
the Sims-family persona story.

**Borrowable (MIT/Apache):** Stagehand act-cache/self-heal code paths;
midscene cache-key design (instruction + page-context stability) + visual
run-report format; Microsoft Playwright healer-agent loop/prompts (can mark
"legitimately broken" instead of healing — our RED); Steel session-viewer UI;
Vercel agent-browser screencast module (Rust ref impl). **Not borrowable:**
Skyvern (AGPL), Passmark/Expect (FSL). **Steal the idea:** Passmark's
multi-model consensus on heal decisions (use Tier-2 vision model as
verifier, not just resolver — cheap FP reduction; matches our live Qwen3-VL
vs Gemini-Flash disagreement data).

**Self-heal best-practice deltas to adopt:**
- mabl-style **multi-signal fingerprint JSON per step** in the locator cache
  (attributes + text + role + DOM neighborhood + visual position), not just
  a selector fallback list.
- mabl's **fail-on-low-confidence** (never heal to a poor match) — we
  already do this via AMBER; keep threshold ≥0.9 (Healenium's 0.5 default is
  the cautionary tale).
- QA Wolf taxonomy check: selector drift ≈ only 28% of real failures
  (timing ~30%, data ~14%…) — diagnosis-first remains non-negotiable.

## 2. CI/CD integration — minimal credible v1 (all precedented)

Dominant shapes: Momentic (Action triggers cloud run → poll → JUnit → exit
code), Checkly (CLI in runner + deploy-hook webhooks), Meticulous (gates PR
on diff approval). For a self-hosted HTTP-API product:

1. `POST /api/runs {suite|trail_ids, base_url, git_sha}` → `{run_id}`
   (API-token auth) — thin layer over the existing walk-trigger.
2. `GET /api/runs/:id` (status/summary) + `GET /api/runs/:id/junit.xml`.
3. ~40-line composite **GitHub Action** (curl trigger → poll w/ timeout →
   download JUnit → exit 1 on RED) — JUnit in the runner gives PR
   annotations for free via existing reporters.
4. Optional **commit-status callback** (plain Status API POST w/ stored
   PAT, `target_url` → our run page). Checks-API/GitHub-App = later.
5. Default **advisory, not blocking** (`blocking:false`) + flake
   quarantine: step flipping ≥N times in M runs → advisory until a human
   clears it (flip-rate >0.2–0.3 = flaky; healthy suites <1–2%).
6. `POST /api/hooks/deploy` deploy-hook trigger — near-free, matches how
   Checkly users actually run post-deploy validation.

**Verdict mapping:** GREEN passes, RED fails; **AMBER must not pass a
blocking gate silently** — report as failure-with-heal-diff (or "neutral"
once on Checks API). This preserves never-silent-green in CI.

## 3. Real-time watching — build the CDP screencast relay, skip VNC

- **CDP `Page.startScreencast`** rides the existing Chrome+CDP WS: JPEG
  q60 @1024w, `everyNthFrame:2`, per-frame ack backpressure; <10MB marginal
  on the 1GB box; on-demand only (zero cost when nobody watches). One Bun
  WS route → client canvas. Vercel agent-browser has an Apache-2.0
  reference implementation; Browserbase Session Live View is the UX
  blueprint (iframe embed, disconnect handling).
- **VNC/noVNC = skip**: Xvfb + VNC + websockify + noVNC headful stack,
  hundreds of MB — wrong for 1GB.
- Why build despite rrweb replay: live view covers the two moments rrweb
  can't — **watching the AI author a Trail in real time** (the trust/demo
  moment; same philosophy as live Sims "customers in the room") and
  mid-run debugging of a stuck heal.
- Input takeover (Browserbase-style human rescue for 2FA) = v2, plain
  CDP `Input.*` when needed.

## 4. Sequencing implication

CI/CD and live-watch are both thin layers over shipped seams (walk trigger,
CDP session). Suggested: F1 (authoring) → screencast relay (pairs naturally
with F1's live authoring progress) → CI v1 (needs real Trails to gate
anything) → F2 recorder/hybrid-auth → Plan H Client Sims.

Sources: see agent transcripts; key links — Stagehand v3 blog, Skyvern
code-caching docs, browser-use "Leaving Playwright for CDP", midscene
caching docs, mabl auto-heal docs, QA Wolf 6-failure-types, Momentic CLI
docs, Checkly monitoring-as-code, GitHub Status-vs-Checks, Browserbase
Session Live View, CDP Page domain, agent-browser screencast internals.
