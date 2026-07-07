import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');

function load(rel: string): string {
  return fs.readFileSync(path.join(SITE, rel.replace(/^\.\//, '')), 'utf8');
}

test('index.html has <title', () => expect(load('../site/index.html')).toContain('<title'));
test('index.html has name="description"', () => expect(load('../site/index.html')).toContain('name="description"'));

test('snap.html has <title', () => expect(load('../site/snap.html')).toContain('<title'));
test('snap.html has name="description"', () => expect(load('../site/snap.html')).toContain('name="description"'));

test('sims.html has <title', () => expect(load('../site/sims.html')).toContain('<title'));
test('sims.html has name="description"', () => expect(load('../site/sims.html')).toContain('name="description"'));

test('autosim.html has <title', () => expect(load('../site/autosim.html')).toContain('<title'));
test('autosim.html has name="description"', () => expect(load('../site/autosim.html')).toContain('name="description"'));

test('onboarding.html has <title', () => expect(load('../site/onboarding.html')).toContain('<title'));
test('onboarding.html has name="description"', () => expect(load('../site/onboarding.html')).toContain('name="description"'));
