import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');

function load(rel: string): string {
  return fs.readFileSync(path.join(SITE, rel.replace(/^\.\//, ''), '').toLowerCase(), 'utf8').toLowerCase();
}

const PAGE_FILES = ['index.html', 'snap.html', 'sims.html', 'autosim.html'];
const BAD_PATTERNS = ['lorem ipsum', 'undefined undefined', 'null null'];

for (const file of PAGE_FILES) {
  const name = file.replace('.html', '');
  test(`${name}.html has no placeholder content`, () => {
    const html = load(`../site/${file}`);
    for (const pattern of BAD_PATTERNS) {
      expect(html).not.toContain(pattern);
    }
  });
}
