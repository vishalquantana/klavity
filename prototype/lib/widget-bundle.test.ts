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

// KLA-592 regression guard: the committed widget bundle carries the RENDERED-path font fix
// (real-face font embedding + blanking un-embeddable icon-font ligatures). A future rebuild from a
// pre-592 base (as feat/attachment-gallery accidentally did at v0.79.0, dropping the font fix from the
// shipped bundle) would silently strip these markers. Assert they survive so any such regression fails
// loudly in CI instead of shipping a degraded bundle. These are data-string literals (icon-font family
// names) + stable identifiers that survive minification — see packages/sdk/src/capture.ts (KLA-592).
test('widget bundle contains the KLA-592 font-fix renderer markers (not rebuilt from a pre-592 base)', () => {
  const bundlePath = findBundle();
  expect(bundlePath).not.toBeNull();
  const code = fs.readFileSync(bundlePath!, 'utf8');
  // The onCloneEachNode hook + font-embed cssText option are the load-bearing renderer plumbing.
  expect(code).toContain('onCloneEachNode');
  expect(code).toContain('cssText');
  // The icon-font allow-list — the heart of failure-mode (B), blanking un-embeddable icon glyphs.
  // Require the full set: a partial/old bundle that dropped the list would fail on the first missing one.
  for (const family of ['material icons', 'material symbols', 'font awesome', 'glyphicons', 'ionicons', 'icomoon']) {
    expect(code).toContain(family);
  }
});
