import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');

function load(rel: string): string {
  return fs.readFileSync(path.join(SITE, rel.replace(/^\.\//, ''), '').toLowerCase(), 'utf8').toLowerCase();
}

test('privacy.html exists and is non-trivial', () => {
  const p = path.join(SITE, 'privacy.html');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(500);
});

test('terms.html exists and is non-trivial', () => {
  const p = path.join(SITE, 'terms.html');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(500);
});

test('privacy.html contains keyword "privacy"', () => {
  const html = load('../site/privacy.html');
  expect(html).toContain('privacy');
});

test('terms.html contains keyword "terms"', () => {
  const html = load('../site/terms.html');
  expect(html).toContain('terms');
});
