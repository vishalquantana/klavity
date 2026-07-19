/**
 * KLAVITYKLA-316 — One sales contact, one price presentation [JTBD 8.12].
 *
 * The pricing page is the single canonical place a prospect decides to buy or
 * to talk to a human. Two regressions this guards:
 *
 *   1. ONE sales contact. Sales enquiries must all route to the canonical brand
 *      contact (hello@quantana.com.au) — the same address terms/privacy use.
 *      The defect: the Scale card "Contact sales" button pointed at a personal
 *      inbox (vishal@quantana.com.au, our internal TEST address), so the public
 *      sales path and the rest of the site disagreed, and the pricing FAQ's
 *      "contact us" was dead text with no affordance at all.
 *
 *   2. ONE price presentation. Prices are stated in exactly one place —
 *      pricing.html's single pricing grid. No other marketing page restates a
 *      price (they link to /pricing), so the numbers can never drift.
 */
import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = join(import.meta.dir, '..', 'site');
const CANONICAL_CONTACT = 'hello@quantana.com.au';

function read(page: string): string {
  return readFileSync(join(SITE, page), 'utf8');
}

/** Every mailto: target on a page (address only, subject stripped). */
function mailtos(html: string): string[] {
  const out: string[] = [];
  const re = /href=["']mailto:([^"'?]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1].toLowerCase());
  return out;
}

describe('KLAVITYKLA-316 one sales contact', () => {
  it('every sales/contact mailto on pricing.html routes to the canonical address', () => {
    const targets = mailtos(read('pricing.html'));
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) {
      expect({ target: t }).toEqual({ target: CANONICAL_CONTACT });
    }
  });

  it('pricing.html never exposes the internal test inbox as a public contact', () => {
    // vishal@quantana.com.au is our internal test email, not a sales channel.
    expect(read('pricing.html')).not.toContain('mailto:vishal@');
  });

  it('the "Contact sales" CTA links to the canonical sales mailto', () => {
    const html = read('pricing.html');
    // Anchor whose visible text is "Contact sales" must be a canonical mailto.
    const m = /<a\b[^>]*href=["']mailto:([^"'?]+)[^>]*>\s*Contact sales\s*<\/a>/i.exec(html);
    expect(m).not.toBeNull();
    expect(m![1].toLowerCase()).toBe(CANONICAL_CONTACT);
  });

  it('the sales contact matches the address terms & privacy already use', () => {
    // The whole point of "one sales contact" — no divergence across the site.
    expect(read('terms.html')).toContain(CANONICAL_CONTACT);
    expect(read('privacy.html')).toContain(CANONICAL_CONTACT);
  });
});

describe('KLAVITYKLA-316 one price presentation', () => {
  it('prices are presented in exactly one grid, on pricing.html', () => {
    const grids = read('pricing.html').match(/<div class="pricing-grid/g) || [];
    expect(grids.length).toBe(1);
  });

  it('no other marketing page restates a dollar price (they link to /pricing)', () => {
    // Guards against a second, drift-prone price presentation appearing elsewhere.
    const others = ['index.html', 'snap.html', 'sims.html', 'autosim.html'];
    for (const page of others) {
      const html = read(page);
      expect({ page, linksToPricing: html.includes('/pricing') }).toEqual({
        page,
        linksToPricing: true,
      });
      // A per-month dollar figure is a price presentation; only pricing.html may have one.
      expect({ page, hasPrice: /\$\s*\d+\s*\/\s*(month|mo\b)/i.test(html) }).toEqual({
        page,
        hasPrice: false,
      });
    }
  });
});
