/**
 * KLAVITYKLA-345 — FAQPage JSON-LD coverage on the marketing pages.
 *
 * FAQPage is the most heavily weighted structure for AI answer extraction
 * (ChatGPT / Claude / Perplexity / AI Overviews). Regression guard:
 *   1. every page that is supposed to carry FAQPage actually does (the defect:
 *      site/index.html had zero FAQPage occurrences),
 *   2. every JSON-LD block still parses (a broken block silently kills ALL
 *      structured data on the page),
 *   3. every marked-up question/answer is ACTUALLY VISIBLE in the page body.
 *      Invisible FAQ schema is a structured-data violation and risks a manual
 *      action, so this is the guard that keeps the markup honest.
 */
import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = join(import.meta.dir, '..', 'site');

// Pages that must carry FAQPage markup.
const FAQ_PAGES = ['index.html', 'pricing.html', 'bug-check.html'];

function read(page: string): string {
  return readFileSync(join(SITE, page), 'utf8');
}

/** All application/ld+json payloads on a page. */
function ldBlocks(html: string): string[] {
  const out: string[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

/** Flatten a JSON-LD payload (which may use @graph) into a node list. */
function ldNodes(raw: string): any[] {
  const parsed = JSON.parse(raw);
  const roots = Array.isArray(parsed) ? parsed : [parsed];
  const nodes: any[] = [];
  for (const r of roots) {
    if (r && Array.isArray(r['@graph'])) nodes.push(...r['@graph']);
    else nodes.push(r);
  }
  return nodes;
}

function faqNodes(html: string): any[] {
  return ldBlocks(html)
    .flatMap(ldNodes)
    .filter((n) => n && n['@type'] === 'FAQPage');
}

/** Visible text of the page: markup, <script>, <style> and comments removed. */
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Normalize for grounding comparison: typographic quotes/dashes used as visual
 * decoration must not make a faithful answer look "invisible".
 */
function norm(s: string): string {
  return s
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    // Stripping an inline tag (e.g. <a href="/privacy">privacy policy</a>.)
    // leaves a space before the trailing punctuation — not a real gap.
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim()
    .toLowerCase();
}

describe('marketing site FAQPage JSON-LD', () => {
  for (const page of FAQ_PAGES) {
    describe(page, () => {
      it('carries at least one FAQPage node with real Q&A', () => {
        const html = read(page);
        const faqs = faqNodes(html);
        expect(faqs.length).toBeGreaterThan(0);

        const questions = faqs.flatMap((f) =>
          Array.isArray(f.mainEntity) ? f.mainEntity : f.mainEntity ? [f.mainEntity] : [],
        );
        expect(questions.length).toBeGreaterThan(0);

        for (const q of questions) {
          expect(q['@type']).toBe('Question');
          expect(typeof q.name).toBe('string');
          expect(q.name.trim().length).toBeGreaterThan(0);
          expect(q.acceptedAnswer?.['@type']).toBe('Answer');
          expect(typeof q.acceptedAnswer?.text).toBe('string');
          expect(q.acceptedAnswer.text.trim().length).toBeGreaterThan(0);
        }
      });

      it('every JSON-LD block on the page parses', () => {
        const blocks = ldBlocks(read(page));
        expect(blocks.length).toBeGreaterThan(0);
        for (const b of blocks) expect(() => JSON.parse(b)).not.toThrow();
      });

      it('every marked-up question and answer is visible on the page', () => {
        const html = read(page);
        const body = norm(visibleText(html));
        const questions = faqNodes(html).flatMap((f) =>
          Array.isArray(f.mainEntity) ? f.mainEntity : [f.mainEntity],
        );

        for (const q of questions) {
          expect({ page, missing: 'question', text: q.name, found: body.includes(norm(q.name)) })
            .toEqual({ page, missing: 'question', text: q.name, found: true });
          expect({
            page,
            missing: 'answer',
            text: q.acceptedAnswer.text,
            found: body.includes(norm(q.acceptedAnswer.text)),
          }).toEqual({
            page,
            missing: 'answer',
            text: q.acceptedAnswer.text,
            found: true,
          });
        }
      });
    });
  }

  it('site/index.html specifically has FAQPage (the KLAVITYKLA-345 defect)', () => {
    expect(read('index.html')).toContain('FAQPage');
  });

  it('uses no smart/curly quotes inside the FAQPage JSON-LD payloads', () => {
    // Curly quotes inside JSON-LD have broken this site before.
    for (const page of FAQ_PAGES) {
      for (const block of ldBlocks(read(page))) {
        if (!block.includes('FAQPage')) continue;
        // Structural characters only — decorative curly quotes in the *values*
        // would also change the JSON string, so require them absent entirely.
        expect({ page, curly: /[‘’“”]/.test(block) }).toEqual({
          page,
          curly: false,
        });
      }
    }
  });
});
