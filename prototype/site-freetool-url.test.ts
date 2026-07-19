/**
 * Free-tool URL normalisation regression guard (bug-check + cro).
 *
 * THE BUG: site/bug-check.html and site/cro.html shipped
 *   <input type="url" ... required>
 * so the BROWSER's own HTML5 validation rejected a bare domain ("klavity.in")
 * with a native "Please enter a URL." tooltip BEFORE any JS ran. The scan never
 * fired. These are the two lead-gen front doors, so it cost signups directly.
 *
 * This test does two things:
 *   1. Guards the markup: the field must NOT go back to type="url", must keep
 *      its id/class/placeholder/autocomplete (CSS + JS depend on them), and the
 *      inline error must stay screen-reader reachable.
 *   2. Extracts the REAL normalizeUrl() implementation out of each shipped page
 *      and executes it, so the behaviour asserted here is the behaviour users
 *      actually get — not a copy that can drift.
 */
import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = join(import.meta.dir, '..', 'site');
const PAGES = ['bug-check.html', 'cro.html'] as const;

function read(page: string): string {
  return readFileSync(join(SITE, page), 'utf8');
}

type Result = { ok: true; url: string } | { ok: false; error: string };

/** Pull the literal normalizeUrl() source out of the page and make it callable. */
function extractNormalizeUrl(html: string): (raw: unknown) => Result {
  const start = html.indexOf('function normalizeUrl(');
  expect(start).toBeGreaterThan(-1);
  // brace-match to the end of the function body
  let depth = 0;
  let i = html.indexOf('{', start);
  const bodyStart = i;
  for (; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  expect(depth).toBe(0);
  const src = html.slice(start, i + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`${src}; return normalizeUrl;`)() as (raw: unknown) => Result;
}

/**
 * Speed-claim detector. Returns every "seconds"-style or "instant" promise in a
 * page. <style> blocks are stripped first so CSS durations (`transition:.15s`,
 * `animation:spin .7s`) are not false positives, and "15 min with the founder"
 * (a meeting length, not a scan-time promise) is explicitly allowed.
 */
export function findSpeedClaims(html: string): string[] {
  const withoutCss = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  const patterns = [
    /\bseconds?\b/gi, // "in seconds", "<30 seconds"
    /\bsecs?\b/gi, // "30 secs", "~5 sec"
    /\b\d+\s*s\b/gi, // "30s", "~30 s"
    /\binstantly\b/gi, // "instantly discover..."
    /\binstant\b/gi, // "an instant AI bug scan"
    /\bin real[- ]time\b/gi,
    /\bimmediately\b/gi,
  ];
  const hits: string[] = [];
  for (const re of patterns) {
    for (const m of withoutCss.matchAll(re)) {
      const ctx = withoutCss.slice(Math.max(0, m.index! - 40), m.index! + 40);
      if (/\d+\s*min\b/i.test(ctx) && /founder|booking|call/i.test(ctx)) continue; // "Book 15 min"
      hits.push(m[0]);
    }
  }
  return hits;
}

describe('speed-claim detector', () => {
  it('flags the exact wordings that shipped before this fix', () => {
    expect(findSpeedClaims('<p>Results in &lt;30 seconds</p>').length).toBeGreaterThan(0);
    expect(findSpeedClaims('<p>friction audit in seconds</p>').length).toBeGreaterThan(0);
    expect(findSpeedClaims('<meta content="an instant AI bug scan">').length).toBeGreaterThan(0);
    expect(findSpeedClaims('{"description":"instantly discover friction"}').length).toBeGreaterThan(0);
    expect(findSpeedClaims('<p>done in ~30s</p>').length).toBeGreaterThan(0);
    expect(findSpeedClaims('<p>scan takes 45 secs</p>').length).toBeGreaterThan(0);
    expect(findSpeedClaims('<script>const eta = "about 20 seconds"</script>').length).toBeGreaterThan(0);
  });

  it('does not flag CSS durations, the booking length, or minutes framing', () => {
    expect(findSpeedClaims('<style>a{transition:background .15s;animation:spin .7s}</style>')).toEqual([]);
    expect(findSpeedClaims('<a class="booking-link">Book 15 min with the founder</a>')).toEqual([]);
    expect(findSpeedClaims('<p>Results in minutes</p>')).toEqual([]);
    expect(findSpeedClaims('<p>try again in a few minutes</p>')).toEqual([]);
  });
});

describe('free-tool URL input markup', () => {
  for (const page of PAGES) {
    describe(page, () => {
      const html = read(page);

      it('does not use type="url" on the scan field (the original defect)', () => {
        expect(html).not.toMatch(/<input[^>]*type="url"[^>]*id="site-url"/);
        expect(html).not.toMatch(/<input[^>]*id="site-url"[^>]*type="url"/);
      });

      it('uses type="text" + inputmode="url" and keeps the hooks CSS/JS rely on', () => {
        const m = html.match(/<input[^>]*id="site-url"[^>]*>/);
        expect(m).not.toBeNull();
        const tag = m![0];
        expect(tag).toContain('type="text"');
        expect(tag).toContain('inputmode="url"');
        expect(tag).toContain('class="url-input"');
        expect(tag).toContain('autocomplete="url"');
        expect(tag).toContain('required');
        expect(tag).toContain('placeholder="https://');
      });

      it('keeps the inline error reachable by screen readers', () => {
        const err = html.match(/<div class="error-msg" id="error-msg"[^>]*>/);
        expect(err).not.toBeNull();
        expect(err![0]).toContain('aria-live');
        expect(err![0]).toContain('role="alert"');
        // the field points at it, and the form defers validation to our JS
        expect(html).toMatch(/id="site-url"[^>]*aria-describedby="error-msg"/);
        expect(html).toMatch(/<form id="(bugcheck|cro)-form" novalidate>/);
      });

      it('never blocks the page with alert()/confirm()/prompt() on bad input', () => {
        expect(html).not.toMatch(/\balert\(/);
        expect(html).not.toMatch(/\bconfirm\(/);
        expect(html).not.toMatch(/\bprompt\(/);
      });

      it('carries the minutes framing in the trust row', () => {
        expect(html).toContain('Results in minutes');
      });

      // The founder dropped exact-second claims: sim-run durations were never
      // measured. This sweeps the WHOLE page — visible copy, meta description,
      // og/twitter tags, JSON-LD and inline JS strings — because the first pass
      // fixed only the trust row and left "in seconds" in the cro hero plus
      // "instant"/"instantly" in four meta/schema fields.
      it('has no seconds-style or "instant" speed claim anywhere', () => {
        const found = findSpeedClaims(html);
        expect(found).toEqual([]);
      });

      it('runs the submit path through normalizeUrl before fetching', () => {
        expect(html).toMatch(/const normalized = normalizeUrl\(urlInput\.value\)/);
        expect(html).toMatch(/const rawUrl = normalized\.url/);
        // and the normalized value is what reaches the analyse endpoint
        expect(html).toMatch(/\/api\/cro\/analyze[\s\S]{0,300}url: rawUrl/);
      });
    });
  }

  it('both pages carry the identical normalizeUrl implementation', () => {
    const [a, b] = PAGES.map((p) => {
      const html = read(p);
      const start = html.indexOf('function normalizeUrl(');
      return html.slice(start, html.indexOf('\n  }\n', start));
    });
    expect(a).toBe(b);
  });
});

describe('normalizeUrl behaviour (extracted from the shipped pages)', () => {
  for (const page of PAGES) {
    describe(page, () => {
      const normalizeUrl = extractNormalizeUrl(read(page));

      it('accepts a bare domain and makes it absolute https (the reported bug)', () => {
        expect(normalizeUrl('klavity.in')).toEqual({ ok: true, url: 'https://klavity.in' });
      });

      it('still accepts an explicit https URL unchanged', () => {
        expect(normalizeUrl('https://klavity.in')).toEqual({ ok: true, url: 'https://klavity.in' });
      });

      it('preserves an explicit http scheme (does not force https)', () => {
        expect(normalizeUrl('http://x.com')).toEqual({ ok: true, url: 'http://x.com' });
      });

      it('trims surrounding whitespace', () => {
        expect(normalizeUrl('  klavity.in  ')).toEqual({ ok: true, url: 'https://klavity.in' });
        expect(normalizeUrl('\n https://klavity.in/pricing \t')).toEqual({
          ok: true,
          url: 'https://klavity.in/pricing',
        });
      });

      it('keeps bare domains with a path, port, query or subdomain', () => {
        expect(normalizeUrl('klavity.in/bug-check')).toEqual({ ok: true, url: 'https://klavity.in/bug-check' });
        expect(normalizeUrl('app.klavity.in')).toEqual({ ok: true, url: 'https://app.klavity.in' });
        expect(normalizeUrl('klavity.in:8080')).toEqual({ ok: true, url: 'https://klavity.in:8080' });
        expect(normalizeUrl('klavity.in/x?a=1')).toEqual({ ok: true, url: 'https://klavity.in/x?a=1' });
      });

      it('rejects garbage with a friendly inline message and does not submit', () => {
        for (const bad of ['not a url', 'hello', '???', 'http://', '.', 'a..b']) {
          const r = normalizeUrl(bad);
          expect(r.ok).toBe(false);
          expect((r as { error: string }).error).toBe(
            "That doesn't look like a web address. Try example.com",
          );
        }
      });

      it('rejects non-http schemes instead of gluing https:// onto them', () => {
        for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'ftp://x.com']) {
          expect(normalizeUrl(bad).ok).toBe(false);
        }
      });

      it('gives a friendly required message on an empty field', () => {
        for (const empty of ['', '   ', null, undefined]) {
          const r = normalizeUrl(empty);
          expect(r.ok).toBe(false);
          expect((r as { error: string }).error).toBe(
            'Enter a web address to scan — for example example.com',
          );
        }
      });
    });
  }
});
