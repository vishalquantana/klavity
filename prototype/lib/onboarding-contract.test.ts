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
