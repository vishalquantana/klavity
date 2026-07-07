import { test, expect } from 'bun:test';
import fs from 'node:fs';

const ROOT = process.cwd();

test('prototype/package.json parses as valid JSON', () => {
  const raw = fs.readFileSync(`${ROOT}/package.json`, 'utf8');
  let threw: unknown = null;
  try {
    JSON.parse(raw);
  } catch (e) {
    threw = e;
  }
  expect(threw).toBeNull();
});

test('prototype/package.json has non-empty .name', () => {
  const pkg = JSON.parse(fs.readFileSync(`${ROOT}/package.json`, 'utf8'));
  expect(typeof pkg.name).toBe('string');
  expect(pkg.name.length).toBeGreaterThan(0);
});
