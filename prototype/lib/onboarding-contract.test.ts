import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');
const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

function loadSite(rel: string): string {
  return fs.readFileSync(path.join(SITE, rel.replace(/^\.\//, '')), 'utf8');
}

function loadPublic(rel: string): string {
  return fs.readFileSync(path.join(PUBLIC, rel.replace(/^\.\//, '')), 'utf8');
}

test('onboarding.html keeps onb-add-url id', () => {
  expect(loadSite('../site/onboarding.html')).toContain('id="onb-add-url"');
});

test('onboarding.html keeps onb-open-studio id', () => {
  expect(loadSite('../site/onboarding.html')).toContain('id="onb-open-studio"');
});

test('onboarding.html keeps onb-use-different-email id', () => {
  expect(loadSite('../site/onboarding.html')).toContain('id="onb-use-different-email"');
});

test('onboarding.html keeps onb-pick-later id', () => {
  expect(loadSite('../site/onboarding.html')).toContain('id="onb-pick-later"');
});

test('onboarding.html keeps email input id', () => {
  expect(loadSite('../site/onboarding.html')).toContain('id="email"');
});

test('onboarding.html keeps projectName input id', () => {
  expect(loadSite('../site/onboarding.html')).toContain('id="projectName"');
});

test('onboarding.html keeps code input id', () => {
  expect(loadSite('../site/onboarding.html')).toContain('id="code"');
});

// ── KLAVITYKLA-291: persist aha personas ─────────────────────────────────────
// Verify that the onboarding.html JS stashes aha personas and persists them
// after sign-in — checked by scanning the source for the key symbols.

test('onboarding.html stashes aha personas in window._ahaPersonas after uhShowPersonas', () => {
  const src = loadSite('onboarding.html')
  expect(src).toContain('window._ahaPersonas = personas')
})

test('onboarding.html defines persistAhaPersonas function', () => {
  const src = loadSite('onboarding.html')
  expect(src).toContain('async function persistAhaPersonas(')
})

test('onboarding.html calls persistAhaPersonas inside applyProjectName', () => {
  const src = loadSite('onboarding.html')
  // Both must appear; the call must come AFTER function definition
  const defIdx = src.indexOf('async function persistAhaPersonas(')
  const callIdx = src.indexOf('persistAhaPersonas()')
  expect(defIdx).toBeGreaterThanOrEqual(0)
  expect(callIdx).toBeGreaterThan(defIdx)
})

test('onboarding.html persistAhaPersonas posts to /api/personas with project param', () => {
  const src = loadSite('onboarding.html')
  // Must POST to /api/personas with the project query param
  expect(src).toContain('/api/personas?project=')
})

test('onboarding.html persistAhaPersonas consumes _ahaPersonas once to prevent double-persist', () => {
  const src = loadSite('onboarding.html')
  expect(src).toContain('window._ahaPersonas = null')
})

// ── QA #2: the completion POST must survive the exit navigation ──────────────
// A plain fetch races a 1.2s timer against navigation and gets aborted on a slow
// connection, so onboarded_at never persists and the wizard reappears. markOnboarded
// must send the POST with keepalive (and a sendBeacon fallback) so it survives.

test('onboarding.html markOnboarded posts with keepalive so it survives navigation', () => {
  const src = loadSite('onboarding.html')
  const idx = src.indexOf('function markOnboarded(')
  expect(idx).toBeGreaterThanOrEqual(0)
  const body = src.slice(idx, idx + 600)
  expect(body).toContain('/api/account/onboarded')
  expect(body).toContain('keepalive:true')
  expect(body).toContain('sendBeacon')
})

test('dashboard.html keeps data-go=overview', () => {
  expect(loadPublic('../public/dashboard.html')).toContain('data-go="overview"');
});

test('dashboard.html keeps data-go=sims', () => {
  expect(loadPublic('../public/dashboard.html')).toContain('data-go="sims"');
});

test('dashboard.html keeps data-go=autosims', () => {
  expect(loadPublic('../public/dashboard.html')).toContain('data-go="autosims"');
});

test('dashboard.html keeps data-go=tickets', () => {
  expect(loadPublic('../public/dashboard.html')).toContain('data-go="tickets"');
});

// ── Tightened onboarding: honest sequential progress ─────────────────────────
// The wizard used to show four consecutive "Step 4" screens (looked frozen). Progress must now
// count honestly and sequentially ("Step N of M") across the real critical-path screens.

test('onboarding.html progress is sequential "Step N of 5" across the critical path', () => {
  const src = loadSite('onboarding.html')
  expect(src).toContain('Step 1 of 5 · Your goals')
  expect(src).toContain('Step 2 of 5 · Connect your product')
  expect(src).toContain('Step 3 of 5 · See it work')
  expect(src).toContain('Step 4 of 5 · Create your account')
  expect(src).toContain('Step 5 of 5 · Install')
})

test('onboarding.html no longer shows the frozen "Step 4 · Insights" plateau', () => {
  const src = loadSite('onboarding.html')
  // The old bug: multiple visible kickers reading "Step 4 · Insights ·". None may remain in markup.
  expect(src).not.toContain('Step 4 · Insights')
})

test('onboarding.html derives the kicker from the rail so it always matches (applyKicker)', () => {
  const src = loadSite('onboarding.html')
  expect(src).toContain('function applyKicker(')
  expect(src).toContain("'Step ' + (p + 1) + ' of ' + m.labels.length")
  // The rail itself is the 5-phase tightened path.
  expect(src).toContain("labels:['Goal','Product URL','See it work','Create account','Install']")
})

// ── Deferred setup: tracker / plan / AutoSim / more-Sims move OUT of the wizard ───────────────
// After the account is created the wizard goes straight to Install (the activation moment). It must
// no longer route signup into the tracker step.

test('onboarding.html routes account creation straight to Install (no wizard tracker/plan detour)', () => {
  const src = loadSite('onboarding.html')
  // Old routing branched to the tracker step for the sims fork — it must be gone.
  expect(src).not.toContain("go(goal === 'snap' ? S.INSTALL : S.TRACKER)")
  // verifyCode + requestCode now both advance to Install.
  expect(src).toContain('go(S.INSTALL)')
})

// ── "Snap is always free" + 30-day guarantee copy ────────────────────────────

test('onboarding.html surfaces "Snap is free forever" near Install', () => {
  const src = loadSite('onboarding.html')
  expect(src).toContain('id="snapFreeBadge"')
  expect(src).toContain('free forever')
})

// ── Dashboard "Finish setting up Klavity" checklist (relocated wizard steps) ──

test('dashboard.html has the "Finish setting up Klavity" checklist with the four deferred tasks', () => {
  const src = loadPublic('dashboard.html')
  expect(src).toContain('id="finishSetup"')
  expect(src).toContain('Finish setting up Klavity')
  expect(src).toContain('id="fsInstall"')
  expect(src).toContain('id="fsTracker"')
  expect(src).toContain('id="fsAutosim"')
  expect(src).toContain('id="fsPlan"')
})

test('dashboard.html "Connect your tracker" task reuses #445 openTrackerConnect()', () => {
  const src = loadPublic('dashboard.html')
  expect(src).toContain('$("fsTrackerBtn").onclick')
  expect(src).toMatch(/fsTrackerBtn"\)\.onclick[\s\S]{0,80}openTrackerConnect\(\)/)
})

test('dashboard.html checklist is dismissible and re-openable via a "Getting started" sidebar entry', () => {
  const src = loadPublic('dashboard.html')
  expect(src).toContain('id="finishSetupX"')
  expect(src).toContain('klav-finish-setup-x')
  expect(src).toContain('data-go="getting-started"')
  expect(src).toContain('Getting started')
})

test('dashboard.html plan task carries "Snap is always free" + 30-day guarantee', () => {
  const src = loadPublic('dashboard.html')
  expect(src).toContain('Snap is always free')
  expect(src).toContain('30-day money-back guarantee')
})
