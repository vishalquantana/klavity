import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'server.ts');

function loadServer(): string {
  return fs.readFileSync(SRC, 'utf8');
}

test('server.ts exposes /api/feedback route', () => {
  expect(loadServer()).toContain('/api/feedback');
});

test('server.ts exposes /api/health route', () => {
  expect(loadServer()).toContain('/api/health');
});

test('server.ts exposes /api/persona/site route', () => {
  expect(loadServer()).toContain('/api/persona/site');
});

test('server.ts exposes /api/sim/review route', () => {
  expect(loadServer()).toContain('/api/sim/review');
});

test('server.ts exposes /api/trails route', () => {
  expect(loadServer()).toContain('/api/trails');
});

test('server.ts exposes /pricing route', () => {
  expect(loadServer()).toContain('/pricing');
});

test('server.ts exposes ops tenant cost summary endpoint', () => {
  const src = loadServer();
  expect(src).toContain('/api/opsadmin/cost-summary');
  expect(src).toContain('opsTenantCostSummary');
  expect(src).toContain('isOpsAdmin');
});

test('server.ts exposes ticket comment and timeline endpoints', () => {
  const src = loadServer();
  expect(src).toContain('/comments');
  expect(src).toContain('/timeline');
  expect(src).toContain('insertTicketComment');
  expect(src).toContain('ticketActivityTimeline');
});
