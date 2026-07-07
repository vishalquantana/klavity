import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'packages', 'sdk', 'dist');

function findBundle(): string | null {
  const expected = path.join(DIST, 'klavity-widget.iife.js');
  if (fs.existsSync(expected)) return expected;
  try {
    const files = fs.readdirSync(DIST);
    const iife = files.find((f: string) => f.endsWith('.iife.js'));
    return iife ? path.join(DIST, iife) : null;
  } catch {
    return null;
  }
}

test('widget bundle exists and is non-empty', () => {
  const bundlePath = findBundle();
  expect(bundlePath).not.toBeNull();
  const code = fs.readFileSync(bundlePath!, 'utf8');
  expect(code.length).toBeGreaterThan(0);
});

test('widget bundle parses as valid JavaScript via new Function', () => {
  const bundlePath = findBundle();
  expect(bundlePath).not.toBeNull();
  const code = fs.readFileSync(bundlePath!, 'utf8');
  let threw: unknown = null;
  try {
    // eslint-disable-next-line no-new-func
    new Function(code);
  } catch (e) {
    threw = e;
  }
  expect(threw).toBeNull();
});
