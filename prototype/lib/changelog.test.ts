import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('CHANGELOG.md exists and is non-trivial', () => {
  const p = path.join(ROOT, 'CHANGELOG.md');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(200);
});
