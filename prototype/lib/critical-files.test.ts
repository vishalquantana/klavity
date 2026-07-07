import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('server.ts exists and is non-empty', () => {
  const p = path.join(ROOT, 'server.ts');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(0);
});

test('package.json exists and is non-empty', () => {
  const p = path.join(ROOT, '..', 'package.json');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(0);
});

test('public/dashboard.html exists and is non-empty', () => {
  const p = path.join(ROOT, 'public', 'dashboard.html');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(0);
});

test('../site/index.html exists and is non-empty', () => {
  const p = path.join(ROOT, '..', 'site', 'index.html');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(0);
});

test('../packages/sdk/dist/klavity-widget.iife.js exists and is non-empty', () => {
  const p = path.join(ROOT, '..', 'packages', 'sdk', 'dist', 'klavity-widget.iife.js');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size).toBeGreaterThan(0);
});
