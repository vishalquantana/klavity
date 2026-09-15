#!/usr/bin/env bun
// Deterministic blog publisher. Claude (the scheduled routine) authors a JSON
// { meta, bodyHtml } of GENUINELY HELPFUL content; this script assembles the
// full static HTML page (kit.css + Article/FAQ/Breadcrumb/Speakable JSON-LD),
// writes site/blog/<slug>.html, registers it in site/blog/index.json, and
// regenerates the /blog index page. No LLM here — pure assembly.
//
// Usage:  bun scripts/blog-publish.ts <path-to-post.json>
//   post.json = { meta: BlogMeta, bodyHtml: string }
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"

const SITE = join(import.meta.dir, "..", "..", "site")
const BLOG = join(SITE, "blog")
const REG = join(BLOG, "index.json")
const BASE = "https://klavity.in"

export interface BlogFaq { question: string; answer: string }
export interface BlogMeta {
  title: string          // 50–65 chars, SEO
  slug: string           // kebab-case
  excerpt: string        // 120–155 chars
  category: string       // e.g. "Guides" | "Insights" | "Compare" | "Learn"
  date: string           // ISO YYYY-MM-DD
  author?: string
  tldr: string           // 2–3 sentences, the most citable benchmark — Speakable target
  faqs?: BlogFaq[]
  takeaways?: string[]
  relatedSlugs?: string[]
}
interface RegEntry { slug: string; title: string; excerpt: string; category: string; date: string }

const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70)

// ── canonical site nav/footer (kept consistent with the marketing pages) ──
const MARK = `<span class="mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M10 3C6 7 6 17 10 21"/><path d="M14 3C18 7 18 17 14 21"/><path d="M7.5 8h9M7.5 16h9" stroke-width="1.2" opacity=".5"/></svg></span>`
const NAV = `<nav class="nav" aria-label="Primary"><div class="wrap nav-in">
  <a class="brand" href="/">${MARK}Klavity</a>
  <div class="nav-links">
    <a href="/#how">How it works</a><a class="s-snap" href="/snap">Snap</a>
    <a class="s-sims" href="/sims">Sims</a><a class="s-autosim" href="/autosim">AutoSim</a>
    <a href="/blog" aria-current="page">Blog</a>
    <a href="https://github.com/vishalquantana/klav-snap" target="_blank" rel="noopener">GitHub ↗</a>
  </div>
  <div class="nav-cta"><a class="btn btn-ghost" href="/login">Log in</a><a class="btn btn-primary" href="/onboarding">Get started</a></div>
</div></nav>`
const FOOTER = `<footer class="footer"><div class="wrap foot-in">
  <a class="brand" href="/">${MARK}Klavity</a>
  <div class="foot-links"><a href="/">Home</a><a href="/snap">Snap</a><a href="/sims">Sims</a><a href="/autosim">AutoSim</a><a href="/blog">Blog</a><a href="https://github.com/vishalquantana/klav-snap" target="_blank" rel="noopener">GitHub</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
  <span class="sp"></span><span class="mono">© <span data-year>${new Date().getFullYear()}</span> Klavity</span>
</div></footer>`

function head(meta: BlogMeta, jsonld: object[]): string {
  const url = `${BASE}/blog/${meta.slug}`
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)} · Klavity</title>
<meta name="description" content="${esc(meta.excerpt)}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any">
<meta property="og:type" content="article"><meta property="og:site_name" content="Klavity">
<meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.excerpt)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/favicon.svg">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(meta.title)}"><meta name="twitter:description" content="${esc(meta.excerpt)}"><meta name="twitter:image" content="${BASE}/favicon.svg">
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/kit.css"><script src="/kit.js" defer></script>
<style>
.post{max-width:680px;margin:0 auto;padding:40px 22px 80px}
.post .crumb{font-family:var(--mono);font-size:12.5px;color:var(--paper-faint);letter-spacing:.04em;margin-bottom:18px}
.post h1{font-family:var(--display);font-weight:600;font-size:clamp(30px,5.5vw,48px);line-height:1.07;letter-spacing:-.02em;margin:0 0 12px}
.post-meta{display:flex;align-items:center;gap:0;margin-bottom:28px;flex-wrap:wrap}
.post-meta .by,.post-meta .rt{font-family:var(--mono);font-size:12.5px;color:var(--paper-faint)}
.post-meta .rt::before{content:'·';margin:0 10px}
.post .by{font-family:var(--mono);font-size:12.5px;color:var(--paper-faint);margin-bottom:26px}
.tldr-box{background:var(--ink-2,#efe9df);border:1px solid var(--line);border-left:4px solid var(--accent-text,var(--indigo));border-radius:14px;padding:18px 20px;margin:0 0 32px;font-size:16.5px;line-height:1.58}
.tldr-box b{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--paper-faint);display:block;margin-bottom:7px}
.prose{font-size:17.5px;line-height:1.75;color:var(--paper-dim)}
.prose h2{font-family:var(--display);font-weight:600;font-size:26px;color:var(--paper);margin:44px 0 10px;line-height:1.18}
.prose h3{font-weight:700;font-size:19px;color:var(--paper);margin:28px 0 8px}
.prose p{margin:0 0 16px}.prose ul,.prose ol{margin:0 0 16px;padding-left:22px}.prose li{margin:5px 0}
.prose a{color:var(--accent-text,var(--indigo));text-decoration:underline}
.prose strong{color:var(--paper)}
.bug-card{border:1px solid var(--line);border-radius:16px;padding:26px 26px 18px;margin:32px 0}
.bug-card h2{margin-top:6px !important;font-size:23px !important}
.bug-badge{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;display:flex;align-items:center;gap:10px;margin-bottom:2px}
.bug-badge::before{content:'';display:inline-block;width:16px;height:1px;background:currentColor;flex-shrink:0}
.sev-high{border-left:3px solid #ef4444}.sev-high .bug-badge{color:#ef4444}
.sev-med{border-left:3px solid #f59e0b}.sev-med .bug-badge{color:#b45309}
.sev-low{border-left:3px solid var(--paper-faint)}.sev-low .bug-badge{color:var(--paper-faint)}
.illus{margin:18px 0 20px;border-radius:10px;background:var(--ink-2,#efe9df);overflow:hidden;display:flex;align-items:center;justify-content:center;padding:22px 16px}
.illus svg{display:block;max-width:100%;height:auto}
.callout{border-radius:0 8px 8px 0;padding:11px 16px;margin:10px 0;font-size:15px;line-height:1.62}
.callout-label{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;display:block;margin-bottom:5px;font-weight:700}
.callout-check{background:rgba(99,102,241,.06);border-left:3px solid #6366f1}
.callout-check .callout-label{color:#6366f1}
.callout-cause{background:rgba(245,158,11,.07);border-left:3px solid #f59e0b}
.callout-cause .callout-label{color:#b45309}
.scan-list{list-style:none;padding:0;margin:16px 0 0;counter-reset:scan}
.scan-list li{counter-increment:scan;display:flex;gap:14px;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--line);font-size:16px;line-height:1.6}
.scan-list li:last-child{border-bottom:none}
.scan-list li::before{content:counter(scan,'decimal-leading-zero');font-family:var(--mono);font-size:11px;font-weight:700;color:#6366f1;min-width:26px;margin-top:2px}
.toc-rail{display:none}
@media(min-width:1140px){.toc-rail{display:block;position:fixed;left:max(16px,calc(50vw - 450px));top:96px;width:156px}.toc-rail-label{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--paper-faint);margin-bottom:10px;display:block}.toc-rail a{display:block;color:var(--paper-faint);text-decoration:none;padding:3px 0 3px 10px;border-left:2px solid var(--line);margin-bottom:2px;font-size:12.5px;line-height:1.45;transition:color .12s,border-color .12s}.toc-rail a:hover,.toc-rail a.toc-active{color:var(--indigo,#6366f1);border-left-color:var(--indigo,#6366f1)}}
.faq{margin:48px 0 0;border-top:1px solid var(--line);padding-top:30px}
.faq h2{font-family:var(--display);font-size:26px;margin:0 0 16px}
.faq details{border-bottom:1px solid var(--line);padding:14px 0}.faq summary{font-weight:600;cursor:pointer;font-size:17px}
.faq p{margin:10px 0 0;color:var(--paper-dim);line-height:1.6}
.takeaways{margin:40px 0 0;background:var(--ink-2,#efe9df);border-radius:16px;padding:24px 26px}
.takeaways h2{font-family:var(--display);font-size:22px;margin:0 0 12px}.takeaways ul{margin:0;padding-left:20px}.takeaways li{margin:8px 0;line-height:1.5}
.cta{margin:48px 0 0;text-align:center;padding:34px;border:1px solid var(--line);border-radius:18px}
.cta h2{font-family:var(--display);font-size:24px;margin:0 0 8px}.cta p{color:var(--paper-dim);margin:0 0 18px}
</style>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head><body style="--accent:var(--indigo);--accent-text:var(--indigo-text)">
<a class="skip-link" href="#main">Skip to content</a>${NAV}<main id="main">`
}

export function renderPost(meta: BlogMeta, bodyHtml: string): string {
  const url = `${BASE}/blog/${meta.slug}`
  const jsonld: object[] = [
    { "@context": "https://schema.org", "@type": "Article", headline: meta.title, description: meta.excerpt,
      datePublished: meta.date, dateModified: meta.date, author: { "@type": "Person", name: meta.author || "Klavity" },
      publisher: { "@type": "Organization", name: "Klavity", logo: { "@type": "ImageObject", url: `${BASE}/favicon.svg` } },
      mainEntityOfPage: url, inLanguage: "en" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
      { "@type": "ListItem", position: 3, name: meta.title, item: url } ] },
    { "@context": "https://schema.org", "@type": "WebPage", speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".tldr-box", ".prose > p:first-of-type"] }, url },
  ]
  if (meta.faqs?.length) jsonld.push({ "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: meta.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) })

  const faqHtml = meta.faqs?.length ? `<section class="faq"><h2>FAQ</h2>${meta.faqs.map((f) => `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join("")}</section>` : ""
  const takeHtml = meta.takeaways?.length ? `<section class="takeaways"><h2>Key takeaways</h2><ul>${meta.takeaways.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>` : ""
  return head(meta, jsonld) + `
  <article class="post">
    <div class="crumb"><a href="/blog">Blog</a> · ${esc(meta.category)} · ${esc(meta.date)}</div>
    <h1>${esc(meta.title)}</h1>
    <div class="post-meta"><span class="by">${esc(meta.author || "Klavity")}</span><span class="rt">${Math.max(2, Math.ceil(bodyHtml.replace(/<[^>]+>/g, " ").split(/\s+/).length / 200))} min read</span></div>
    <div class="tldr-box"><b>TL;DR</b>${esc(meta.tldr)}</div>
    <div class="prose">${bodyHtml}</div>
    ${takeHtml}${faqHtml}
    <section class="cta"><h2>Catch bugs the moment a human sees them</h2><p>Klavity: right-click bug reports, AI personas that review your product, and self-healing tests.</p><a class="btn btn-primary" href="/onboarding">Get started free</a></section>
  </article></main>${FOOTER}</body></html>`
}

function loadReg(): RegEntry[] { return existsSync(REG) ? JSON.parse(readFileSync(REG, "utf8")) : [] }

function renderIndex(reg: RegEntry[]): string {
  const cards = reg.sort((a, b) => b.date.localeCompare(a.date)).map((p) => `
    <a class="bcard reveal" href="/blog/${p.slug}"><div class="bcat">${esc(p.category)} · ${esc(p.date)}</div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></a>`).join("")
  const metaIndex: BlogMeta = { title: "Klavity Blog — AI bug reporting, QA & testing", slug: "", excerpt: "Helpful, specific guides on AI bug reporting, user-persona testing, and self-healing QA — from the team building Klavity.", category: "Blog", date: new Date().toISOString().slice(0, 10), tldr: "" }
  return head(metaIndex, [{ "@context": "https://schema.org", "@type": "Blog", url: `${BASE}/blog`, name: "Klavity Blog" }]).replace('aria-current="page">Blog', 'aria-current="page">Blog') + `
  <div class="wrap" style="max-width:900px;padding:48px 22px 80px">
    <p class="eyebrow">The Klavity blog</p>
    <h1 style="font-family:var(--display);font-weight:600;font-size:clamp(34px,6vw,52px);letter-spacing:-.02em;margin:8px 0 8px">Helpful, specific, no fluff.</h1>
    <p style="color:var(--paper-dim);font-size:18px;max-width:60ch;margin:0 0 36px">Practical guides on AI bug reporting, persona-driven testing, and self-healing QA.</p>
    <div class="bgrid">${cards || '<p style="color:var(--paper-faint)">First post coming soon.</p>'}</div>
  </div>
  <style>.bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}
  .bcard{display:block;border:1px solid var(--line);border-radius:16px;padding:22px;transition:transform .15s,border-color .2s}
  .bcard:hover{transform:translateY(-3px);border-color:var(--paper-faint)}
  .bcard .bcat{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--paper-faint)}
  .bcard h3{font-family:var(--display);font-weight:600;font-size:21px;margin:8px 0 6px;color:var(--paper)}
  .bcard p{color:var(--paper-dim);font-size:15px;line-height:1.5;margin:0}</style>
  </main>${FOOTER}</body></html>`
}

// ── main ──
if (import.meta.main) {
  const inPath = process.argv[2]
  if (!inPath) { console.error("usage: bun scripts/blog-publish.ts <post.json>"); process.exit(1) }
  const { meta, bodyHtml } = JSON.parse(readFileSync(inPath, "utf8")) as { meta: BlogMeta; bodyHtml: string }
  if (!meta?.title || !bodyHtml) { console.error("post.json needs meta.title + bodyHtml"); process.exit(1) }
  meta.slug = slugify(meta.slug || meta.title)
  meta.date = meta.date || new Date().toISOString().slice(0, 10)
  if (!existsSync(BLOG)) mkdirSync(BLOG, { recursive: true })
  let reg = loadReg()
  if (reg.some((r) => r.slug === meta.slug)) meta.slug = `${meta.slug}-${Date.now().toString(36).slice(-4)}`
  writeFileSync(join(BLOG, `${meta.slug}.html`), renderPost(meta, bodyHtml))
  reg = reg.filter((r) => r.slug !== meta.slug)
  reg.push({ slug: meta.slug, title: meta.title, excerpt: meta.excerpt, category: meta.category, date: meta.date })
  writeFileSync(REG, JSON.stringify(reg, null, 2))
  writeFileSync(join(BLOG, "index.html"), renderIndex(reg))
  console.log(`published: site/blog/${meta.slug}.html  (${reg.length} posts in registry)`)
}
