/**
 * record-sims-demo.ts
 *
 * Records a video of the live on-page Sims flow on bigidea.quantana.top:
 *   1. Load the page
 *   2. Right-click → Klavity context menu (Deploy all Sims)
 *   3. Sim avatars dock bottom-right in WATCHING state
 *   4. Sims react with inline observations
 *
 * AUTH STRATEGY (tried in order):
 *   A. KLAV_BEARER_TOKEN env var  — fastest, paste a pre-minted extension/widget token
 *   B. KLAV_SESSION env var       — raw klav_session value, script mints bearer token via API
 *   C. Headed login               — opens klavity.quantana.top, you enter email + OTP in the
 *                                   browser window, then the script continues automatically
 *   D. Anonymous fallback         — records deploy + dock animation only (no AI reactions)
 *
 * Output: ~/Downloads/sims-bigidea-demo.webm (or KLAV_VIDEO_OUT env var)
 *
 * Usage:
 *   cd prototype
 *   KLAV_BEARER_TOKEN=ext_xxx bun scripts/record-sims-demo.ts
 *   # or just:
 *   bun scripts/record-sims-demo.ts   # headful login prompt
 */

import { chromium } from "@playwright/test"
import { existsSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { homedir } from "os"

const BIGIDEA_URL = "https://bigidea.quantana.top"
const KLAV_URL    = "https://klavity.quantana.top"
const PROJECT_ID  = "proj_6d574acf-c927-48c8-b2d8-88364af3ca3a"
const WIDGET_TOKEN_KEY = "klavity_widget_token"

const VIDEO_OUT = process.env.KLAV_VIDEO_OUT
  || resolve(homedir(), "Downloads", "sims-bigidea-demo.webm")

// ── helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`[sims-demo] ${msg}`) }

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

/** Try to mint a bearer token from a session cookie value via /api/extension/config */
async function mintTokenFromSession(session: string): Promise<string | null> {
  try {
    const res = await fetch(`${KLAV_URL}/api/extension/config`, {
      headers: { cookie: `klav_session=${session}` },
    })
    if (!res.ok) { log(`extension/config returned ${res.status}`); return null }
    const data = await res.json()
    if (data?.token) { log("Got Bearer token via extension/config"); return data.token }
  } catch (e: any) { log(`mintTokenFromSession error: ${e.message}`) }
  return null
}

/**
 * OTP-based auth: request OTP for email, verify with provided code,
 * return the session value from the Set-Cookie header.
 * Usage: KLAV_EMAIL=you@example.com KLAV_OTP=123456
 *   Step 1: run with KLAV_EMAIL only -> script requests OTP and exits
 *   Step 2: run with KLAV_EMAIL + KLAV_OTP -> script verifies and records
 */
async function otpAuth(email: string, otp: string | null): Promise<string | null> {
  if (!otp) {
    // Request OTP and tell the user to re-run with KLAV_OTP=<code>
    log(`Requesting OTP for ${email}...`)
    const r = await fetch(`${KLAV_URL}/api/auth/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) { log(`OTP request failed: ${JSON.stringify(d)}`); return null }
    log(`OTP sent to ${email}. Re-run with:`)
    log(`  KLAV_EMAIL=${email} KLAV_OTP=<code-from-email> bun scripts/record-sims-demo.ts`)
    process.exit(0)
  }
  // Verify OTP
  log(`Verifying OTP for ${email}...`)
  const r2 = await fetch(`${KLAV_URL}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: otp }),
  })
  if (!r2.ok) { log(`OTP verify failed: ${r2.status}`); return null }
  const setCookie = r2.headers.get("set-cookie") || ""
  const m = setCookie.match(/klav_session=([^;]+)/)
  if (!m) { log("No klav_session in Set-Cookie"); return null }
  log("OTP verified — session obtained")
  return m[1]
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── Resolve auth ──
  // Set KLAV_ANON=1 to skip auth and record anonymous deploy+dock flow only.
  const forceAnon = process.env.KLAV_ANON === "1"
  let bearerToken: string | null = forceAnon ? null : (process.env.KLAV_BEARER_TOKEN || null)
  let authMethod = bearerToken ? "env-bearer" : "none"

  if (!forceAnon && !bearerToken && process.env.KLAV_SESSION) {
    log("KLAV_SESSION found — minting bearer token...")
    bearerToken = await mintTokenFromSession(process.env.KLAV_SESSION)
    if (bearerToken) authMethod = "session->bearer"
  }

  // OTP-based auth: KLAV_EMAIL alone triggers OTP send + exits; KLAV_EMAIL+KLAV_OTP verifies
  if (!forceAnon && !bearerToken && process.env.KLAV_EMAIL) {
    const session = await otpAuth(
      process.env.KLAV_EMAIL,
      process.env.KLAV_OTP || null
    )
    if (session) {
      bearerToken = await mintTokenFromSession(session)
      if (bearerToken) authMethod = "otp->bearer"
    }
  }

  // Only do headed login when no token, not forcing anon, and no other method worked
  const needsHeadedLogin = !forceAnon && !bearerToken

  // ── Launch browser ──
  log(`Launching ${(needsHeadedLogin || forceAnon) ? "headless" : "headless"} Chromium...`)
  const videoDir = dirname(VIDEO_OUT)
  mkdirSync(videoDir, { recursive: true })

  // Use a temp dir for video capture; Playwright names files by UUID
  const tmpVideoDir = resolve(videoDir, ".klav-video-tmp")
  mkdirSync(tmpVideoDir, { recursive: true })

  const browser = await chromium.launch({
    headless: !needsHeadedLogin,  // headed only for interactive OTP login
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  let session: string | null = null

  // ── Strategy C: headed login to get session ──
  if (needsHeadedLogin) {
    log("No token found — opening klavity.quantana.top for login...")
    log("-> Enter your email, get OTP, paste it in the browser. Script continues automatically once you reach /dashboard.")
    const loginCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const loginPage = await loginCtx.newPage()
    await loginPage.goto(`${KLAV_URL}/dashboard`, { waitUntil: "networkidle" })

    // Wait until we're actually on /dashboard (i.e. logged in)
    await loginPage.waitForURL(/\/dashboard/, { timeout: 3 * 60 * 1000 }).catch(() => {
      throw new Error("Timed out waiting for dashboard — did you complete login?")
    })
    log("Logged in! Extracting session cookie...")

    const cookies = await loginCtx.cookies()
    const sessionCookie = cookies.find(c => c.name === "klav_session")
    session = sessionCookie?.value || null
    if (session) {
      bearerToken = await mintTokenFromSession(session)
      if (bearerToken) authMethod = "headed-login→bearer"
    }
    await loginCtx.close()
  }

  if (!bearerToken) {
    log("WARN: Could not obtain auth token — recording anonymous fallback (deploy+dock only, no AI reactions).")
    authMethod = "anonymous"
  }

  log(`Auth method: ${authMethod}`)

  // ── Recording context ──
  log(`Recording to: ${VIDEO_OUT}`)
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: tmpVideoDir, size: { width: 1440, height: 900 } },
    // Inject bearer token into localStorage on bigidea.quantana.top
    ...(bearerToken ? {
      storageState: {
        origins: [{
          origin: BIGIDEA_URL,
          localStorage: [
            { name: WIDGET_TOKEN_KEY, value: bearerToken },
          ],
        }],
        cookies: [],
      },
    } : {}),
  })

  const page = await ctx.newPage()

  // ── Navigate to bigidea ──
  log(`Navigating to ${BIGIDEA_URL}...`)
  await page.goto(BIGIDEA_URL, { waitUntil: "domcontentloaded", timeout: 30_000 })

  // Wait for widget to load (look for the host element)
  log("Waiting for Klavity widget to initialise...")
  await page.waitForFunction(
    () => !!document.getElementById("klavity-widget-host"),
    { timeout: 15_000 }
  ).catch(() => log("Widget host not found after 15s — continuing anyway"))

  // Verify token is in localStorage (injected correctly)
  if (bearerToken) {
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      WIDGET_TOKEN_KEY
    )
    if (stored) {
      log(`Token confirmed in localStorage (${stored.slice(0, 12)}...)`)
    } else {
      // localStorage injection via storageState may not have worked — set it directly
      await page.evaluate(
        ([key, val]) => localStorage.setItem(key, val),
        [WIDGET_TOKEN_KEY, bearerToken]
      )
      log("Token injected via page.evaluate fallback")
    }
  }

  // Give the page a moment to settle visually
  await sleep(2_000)

  // ── Right-click to open Klavity context menu ──
  log("Right-clicking page to open Klavity context menu...")
  // Click in the middle of the page, away from the widget launcher
  await page.mouse.move(720, 400)
  await sleep(300)
  await page.mouse.click(720, 400, { button: "right" })

  // Wait for the context menu to appear (it's in a shadow root)
  log("Waiting for context menu...")
  await sleep(1_200)

  // Find "Deploy all Sims" — Playwright can pierce shadow DOM with getByText
  const deployBtn = page.getByText("Deploy all Sims", { exact: true })
  const visible = await deployBtn.isVisible({ timeout: 8_000 }).catch(() => false)

  if (!visible) {
    log('WARN: "Deploy all Sims" button not visible — trying evaluate click fallback...')
    // Fallback: find via shadow DOM traversal
    await page.evaluate(() => {
      const host = document.getElementById("klavity-widget-host")
      if (!host?.shadowRoot) return
      const all = host.shadowRoot.querySelectorAll("button, [role=button]")
      for (const el of all) {
        if (el.textContent?.includes("Deploy all Sims")) {
          (el as HTMLElement).click()
          return
        }
      }
    })
  } else {
    log('Clicking "Deploy all Sims"...')
    await deployBtn.click()
  }

  // ── Wait for Sims dock to appear + reactions ──
  log("Waiting for Sims to dock (WATCHING state)...")
  await sleep(2_500)

  // Wait for at least one reaction/observation (or fallback timeout)
  if (bearerToken) {
    log("Waiting for AI reactions to arrive (up to 45s)...")
    await page.waitForFunction(
      () => {
        // Look for any reaction bubbles or observation DOM nodes in the Sims dock
        const dockHost = document.getElementById("kl-sims-dock-host") ||
          document.querySelector("[id^='klavity-sims']")
        if (dockHost?.shadowRoot) {
          const bubbles = dockHost.shadowRoot.querySelectorAll(".ksl-pin, .ksl-walker, .ksl-obs, [class*=react]")
          if (bubbles.length > 0) return true
        }
        // Also check if any new feedback was rendered inside the widget
        const host = document.getElementById("klavity-widget-host")
        if (host?.shadowRoot) {
          const obs = host.shadowRoot.querySelectorAll(".obs, .reaction, .feedback-row, [class*=observat]")
          if (obs.length > 0) return true
        }
        return false
      },
      { timeout: 45_000 }
    ).catch(() => log("No reaction DOM found in 45s — recording whatever is visible"))
  } else {
    // Anonymous: just record the dock animation for ~20s
    log("Anonymous mode: recording dock animation for 20s...")
    await sleep(20_000)
  }

  // Extra 5s to show the dock/reactions in steady state
  await sleep(5_000)

  // ── Save video ──
  log("Closing page and saving video...")
  const videoPath = await page.video()?.path()
  await ctx.close()
  await browser.close()

  if (videoPath && existsSync(videoPath)) {
    // Move/rename from UUID filename to the target path
    const { renameSync } = await import("fs")
    try {
      renameSync(videoPath, VIDEO_OUT)
      log(`DONE: Video saved: ${VIDEO_OUT}`)
    } catch {
      // If cross-device, copy then delete
      const { copyFileSync, unlinkSync } = await import("fs")
      copyFileSync(videoPath, VIDEO_OUT)
      unlinkSync(videoPath)
      log(`DONE: Video saved (copy): ${VIDEO_OUT}`)
    }
    // Cleanup temp dir
    try { (await import("fs")).rmdirSync(tmpVideoDir) } catch {}
  } else {
    log(`WARN: No video captured. Raw path: ${videoPath}`)
    log("Tip: ensure Playwright has video codec support (chromium typically saves .webm)")
  }

  log(`Auth: ${authMethod}`)
  log(bearerToken ? "DONE: Full authed flow (AI reactions)" : "WARN: Anonymous fallback (deploy+dock animation only)")
}

main().catch(e => { console.error(e); process.exit(1) })
