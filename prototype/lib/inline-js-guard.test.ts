import { test, expect } from 'bun:test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECKER = path.join(PROTO, 'scripts', 'check-inline-js.mjs');

test('inline JS checker exits 0 (all inline scripts parse)', () => {
  let threw: unknown = null;
  try {
    execFileSync('node', [CHECKER], { cwd: PROTO, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    threw = e;
  }
  expect(threw).toBeNull();
});
