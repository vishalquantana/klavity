import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');

function load(relPath: string): string {
  return fs.readFileSync(path.join(SITE, relPath.replace(/^\.\//, '')), 'utf8');
}

test('index.html keeps hero-primary-cta id', () => {
  const html = load('../site/index.html');
  expect(html).toContain('id="hero-primary-cta"');
});

test('index.html keeps cta-primary-cta id', () => {
  const html = load('../site/index.html');
  expect(html).toContain('id="cta-primary-cta"');
});

test('index.html keeps nav-get-started testid', () => {
  const html = load('../site/index.html');
  expect(html).toContain('data-testid="nav-get-started"');
});

test('index.html keeps hero-add-to-chrome testid', () => {
  const html = load('../site/index.html');
  expect(html).toContain('data-testid="hero-add-to-chrome"');
});

test('index.html keeps hero-explore-sims testid', () => {
  const html = load('../site/index.html');
  expect(html).toContain('data-testid="hero-explore-sims"');
});

test('snap.html keeps snap-login testid', () => {
  const html = load('../site/snap.html');
  expect(html).toContain('data-testid="snap-login"');
});

test('snap.html keeps snap-hero-add-widget testid', () => {
  const html = load('../site/snap.html');
  expect(html).toContain('data-testid="snap-hero-add-widget"');
});

test('sims.html keeps sims-nav-get-started testid', () => {
  const html = load('../site/sims.html');
  expect(html).toContain('data-testid="sims-nav-get-started"');
});

test('sims.html keeps sims-hero-build testid', () => {
  const html = load('../site/sims.html');
  expect(html).toContain('data-testid="sims-hero-build"');
});

test('autosim.html keeps autosim-nav-get-started testid', () => {
  const html = load('../site/autosim.html');
  expect(html).toContain('data-testid="autosim-nav-get-started"');
});

test('autosim.html keeps autosim-hero-trails testid', () => {
  const html = load('../site/autosim.html');
  expect(html).toContain('data-testid="autosim-hero-trails"');
});
