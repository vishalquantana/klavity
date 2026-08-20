// Blog publish helper — called by POST /api/blog/publish.
// Accepts an injectable git runner so tests can mock git without spawning real processes.

export const SLUG_RE = /^[a-z0-9-]+$/

export interface PublishInput {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  html: string
}

export interface GitResult {
  code: number
  stdout: string
  stderr: string
}

export type GitRunner = (args: string[], opts: { cwd: string }) => Promise<GitResult>

// KLAVITYKLA analytics — verbatim copy of the <head> analytics block from site/index.html
// (GA4 gtag.js + Microsoft Clarity + PostHog). Keep __POSTHOG_KEY__ as a placeholder: it is
// substituted server-side by htmlPage() (see server.ts) at request time, not here.
export const ANALYTICS_BLOCK = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Q9H005LW9K"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-Q9H005LW9K');
</script>
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "xyncb9awww");
</script>
<script>!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.people.toString()+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init("__POSTHOG_KEY__",{api_host:"https://us.i.posthog.com",person_profiles:"identified_only"})</script>`

// Ensures every post (and the index.html listing) published through this pipeline carries
// analytics, even though posts are written verbatim from externally-authored HTML with no
// template file to patch (see ensureAttrScript below for the same pattern). Idempotent — a
// no-op if the block (detected via the GA4 id) is already present — and best-effort: HTML with
// no recognizable </head> is left untouched rather than risk corrupting a post.
export function ensureAnalyticsBlock(html: string): string {
  if (html.includes("G-Q9H005LW9K")) return html
  const headCloseIdx = html.indexOf("</head>")
  if (headCloseIdx === -1) return html
  return html.slice(0, headCloseIdx) + ANALYTICS_BLOCK + "\n" + html.slice(headCloseIdx)
}

export interface PublishResult {
  ok: true
  sha: string
  url: string
}

// KLAVITYKLA-324: this function IS the "blog generator" — posts are authored externally (the daily
// remote routine) and their raw HTML is written verbatim below, so there is no template file in this
// repo to patch. Instead, inject the attribution include here so every post published through this
// path carries first-touch UTM/referrer capture without the external author needing to know about it.
// Idempotent (no-op if already present) and best-effort: unrecognized HTML shapes are left untouched
// rather than risk corrupting a post — publishing must never fail because of this.
export function ensureAttrScript(html: string): string {
  if (html.includes("/attr.js")) return html
  const kitTag = '<script src="/kit.js" defer></script>'
  const kitIdx = html.indexOf(kitTag)
  if (kitIdx !== -1) {
    const insertAt = kitIdx + kitTag.length
    return html.slice(0, insertAt) + '<script src="/attr.js" defer></script>' + html.slice(insertAt)
  }
  const headCloseIdx = html.indexOf("</head>")
  if (headCloseIdx !== -1) {
    return html.slice(0, headCloseIdx) + '<script src="/attr.js" defer></script>' + html.slice(headCloseIdx)
  }
  return html // no recognizable head/kit.js hook — leave unchanged rather than guess
}

export async function spawnGit(args: string[], opts: { cwd: string }): Promise<GitResult> {
  const proc = Bun.spawn(["git", ...args], {
    cwd: opts.cwd,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { code, stdout: stdout.trim(), stderr: stderr.trim() }
}

export async function publishBlogPost(
  input: PublishInput,
  repoRoot: string,
  ghToken: string,
  runGit: GitRunner = spawnGit,
): Promise<PublishResult> {
  const { slug, title, excerpt, category, date, html: rawHtml } = input
  const blogDir = repoRoot + "/site/blog"
  const html = ensureAnalyticsBlock(ensureAttrScript(rawHtml))

  // 1. Write the HTML file (attribution include injected if the post didn't already have one)
  await Bun.write(blogDir + "/" + slug + ".html", html)

  // 2. Upsert index.json — dedupe by slug, newest entry first
  let entries: Array<{ slug: string; title: string; excerpt: string; category: string; date: string }> = []
  try {
    entries = JSON.parse(await Bun.file(blogDir + "/index.json").text())
    if (!Array.isArray(entries)) entries = []
  } catch { /* first post or corrupt — start fresh */ }
  entries = entries.filter((e) => e.slug !== slug)
  entries.unshift({ slug, title, excerpt, category, date })
  await Bun.write(blogDir + "/index.json", JSON.stringify(entries, null, 2) + "\n")

  // 3. Upsert index.html listing — remove existing card for this slug, insert new one at top of .bgrid
  let indexHtml = ""
  try { indexHtml = await Bun.file(blogDir + "/index.html").text() } catch { /* no file yet */ }

  const safeSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  // Remove any existing card for this slug (handles re-publish / idempotency)
  indexHtml = indexHtml.replace(
    new RegExp(`\\n?\\s*<a class="bcard reveal" href="/blog/${safeSlug}">[\\s\\S]*?</a>`, "g"),
    "",
  )
  const newCard = `\n    <a class="bcard reveal" href="/blog/${slug}"><div class="bcat">${category} · ${date}</div><h2>${title}</h2><p>${excerpt}</p></a>`
  indexHtml = indexHtml.replace('<div class="bgrid">', `<div class="bgrid">${newCard}`)
  indexHtml = ensureAnalyticsBlock(indexHtml)
  await Bun.write(blogDir + "/index.html", indexHtml)

  // 4. Git: pull, stage, commit, push (retry once on non-fast-forward)
  const blogFiles = [
    "site/blog/" + slug + ".html",
    "site/blog/index.json",
    "site/blog/index.html",
  ]
  const gitOpts = { cwd: repoRoot }

  // Pull before staging to reduce fast-forward conflicts
  await runGit(["pull", "--rebase"], gitOpts)

  const addRes = await runGit(["add", ...blogFiles], gitOpts)
  if (addRes.code !== 0) throw new Error("git add failed: " + addRes.stderr)

  const commitRes = await runGit(
    ["commit", "-m", `blog: publish ${slug} (${date})\n\nPublished via /api/blog/publish`],
    gitOpts,
  )
  if (commitRes.code !== 0) throw new Error("git commit failed: " + commitRes.stderr)

  const shaRes = await runGit(["rev-parse", "HEAD"], gitOpts)
  const sha = shaRes.stdout

  // Push via inline URL — token is in the URL arg only, never written to git config.
  // Sanitize any error output before surfacing it so the token can't leak.
  const sanitize = (s: string) => s.replace(new RegExp(ghToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "<TOKEN>")
  const pushUrl = `https://x-access-token:${ghToken}@github.com/vishalquantana/klav-snap.git`

  let pushRes = await runGit(["push", pushUrl, "HEAD:master"], gitOpts)

  // Retry once on non-fast-forward (the local merge-train is also writing master)
  if (pushRes.code !== 0 && (pushRes.stderr.includes("non-fast-forward") || pushRes.stderr.includes("rejected"))) {
    await runGit(["pull", "--rebase"], gitOpts)
    pushRes = await runGit(["push", pushUrl, "HEAD:master"], gitOpts)
  }

  if (pushRes.code !== 0) throw new Error("git push failed: " + sanitize(pushRes.stderr))

  return { ok: true, sha, url: `https://klavity.in/blog/${slug}` }
}
