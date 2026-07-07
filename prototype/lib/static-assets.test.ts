import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');

test('favicon.svg exists', () => {
  const p = path.join(SITE, 'favicon.svg');
  expect(fs.existsSync(p)).toBe(true);
});

test('index.html references favicon', () => {
  const html = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8').toLowerCase();
  expect(html).toContain('favicon');
});
