import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');

function loadHome(): string {
  return fs.readFileSync(path.join(SITE, 'index.html').replace(/^\.\//, ''), 'utf8');
}

test('home page has <title', () => {
  expect(loadHome()).toContain('<title');
});

test('home page has meta name="description"', () => {
  expect(loadHome()).toContain('name="description"');
});

test('home page has og:title', () => {
  expect(loadHome()).toContain('property="og:title"');
});

test('home page has og:image', () => {
  expect(loadHome()).toContain('property="og:image"');
});

test('home page has og:description', () => {
  expect(loadHome()).toContain('property="og:description"');
});

test('home page has rel="canonical"', () => {
  expect(loadHome()).toContain('rel="canonical"');
});
