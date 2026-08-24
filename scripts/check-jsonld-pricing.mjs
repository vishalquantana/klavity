// scripts/check-jsonld-pricing.mjs — ENFORCING: exits non-zero on stale JSON-LD pricing.
// Run via: node scripts/check-jsonld-pricing.mjs   (or: pnpm check:jsonld-pricing)
//
// Structured-data Offer prices surface directly in Google / AI results, so they must
// stay in lockstep with the canonical pricing ladder on /pricing. This guard parses
// every <script type="application/ld+json"> block under site/, and fails if:
//   1. any block is not valid JSON, or
//   2. any Offer carries a USD price NOT in the canonical set below.
// Canonical ladder (KLAVITYKLA-379): Free $0 / Solo $49 / Team $249 / Scale $599.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const CANONICAL = new Set(['0', '49', '249', '599']);
const BLOCK = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

const files = execSync('git ls-files site', { encoding: 'utf8' })
  .split('\n').filter((f) => f.endsWith('.html'));

const badJson = [];
const badPrice = [];

// Recursively collect every object with @type "Offer" (offers may be a single
// object or an array, possibly nested inside @graph).
function collectOffers(node, out) {
  if (Array.isArray(node)) { node.forEach((n) => collectOffers(n, out)); return; }
  if (!node || typeof node !== 'object') return;
  if (node['@type'] === 'Offer' && 'price' in node) out.push(node);
  for (const v of Object.values(node)) collectOffers(v, out);
}

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  let m;
  while ((m = BLOCK.exec(html)) !== null) {
    let data;
    try {
      data = JSON.parse(m[1].trim());
    } catch (e) {
      badJson.push(`${f}: invalid JSON-LD block — ${e.message}`);
      continue;
    }
    const offers = [];
    collectOffers(data, offers);
    for (const o of offers) {
      const price = String(o.price).trim();
      if (!CANONICAL.has(price)) {
        badPrice.push(`${f}: Offer "${o.name || '(unnamed)'}" price="${price}" (not in {0,49,249,599})`);
      }
    }
  }
}

if (badJson.length || badPrice.length) {
  if (badJson.length) {
    console.error(`\nJSON-LD parse FAILED — ${badJson.length} unparsable block(s):`);
    badJson.forEach((h) => console.error('  ' + h));
  }
  if (badPrice.length) {
    console.error(`\nJSON-LD pricing guard FAILED — ${badPrice.length} stale Offer price(s):`);
    badPrice.forEach((h) => console.error('  ' + h));
    console.error('\nFix: match the canonical ladder on /pricing — Free $0 / Solo $49 / Team $249 / Scale $599.');
  }
  console.error('');
  process.exit(1);
}

console.log('JSON-LD pricing guard passed — all Offer prices match the canonical ladder.');
