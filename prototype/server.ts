// Klavity app server (Bun). Marketing on /, demo + dashboard behind email-OTP login.
import { insertSimRun, getSimRun, listSimRuns } from "./lib/db"
import { buildMemberExport, membersToCsv, MEMBER_EXPORT_FIELDS } from "./lib/member-export"
import { initDb, db, createOtp, verifyOtp, upsertUser, createSession, getSession, deleteSession, ensureAccount, setAccountDomain, markAccountOnboarded, isAccountOnboarded, membershipsFor, hasAnyMembership, membersOf, roleIn, listPersonas, listPersonasForProject, setPersonaGlobal, upsertPersona, deletePersona, insertPersonaEdit, listPersonaEdits, insertScreenshot, insertFeedback, insertActivity, updateFeedbackTracker, listActivity, listFeedback, dashboardCounts, projectAccess, listProjects, createProject, renameProject, projectById, membersOfProject, addProjectMember, upsertTicketAssignmentInvite, hasPendingTicketAssignmentInvite, acceptPendingTicketAssignmentInvites, insertTranscript, listTranscripts, listTraits, listTraitEvents, insertTrait, updateTrait, insertTraitEvent, logTraitEdit, hasReconcileRun, markReconcileRun, rebuildInsightsJson, ensureTraitsSeeded, listMonitoredUrls, addMonitoredUrl, setMonitoredUrlEnabled, setMonitoredUrlPattern, removeMonitoredUrl, getExtensionTokenEmail, getExtensionTokenInfo, issueExtensionToken, issueCIToken, matchMonitored, getConsent, setConsent, getReviewMode, setReviewMode, tryConsumeReviewBudget, reviewGate, reviewDedupeKey, reviewDay, screenshotById, recordAiCall, opsTotals, opsDaily, opsByProject, opsByTypeModel, opsRecentCalls, opsTodaySpend, opsTenantCostSummary, getModelWeights, setModelWeights, listConnectors, getConnectorById, createConnector, updateConnector, removeConnector, listAutoCopyConnectors, touchConnectorHeartbeat, updateFeedbackMeta, feedbackById, addTicketExport, listTicketExports, exportsForFeedbackIds, findExportByExternalKey, findPriorSuccessfulExport, insertTicketComment, listTicketComments, ticketActivityTimeline, getRecentlyResolvedTraits, type RecentlyResolvedTrait, transcriptById, sourceTranscriptsForSim, originAllowedForProject, findFeedbackByIssueKey, listRecentFeedbackForDedup, bumpFeedbackRecurrence, insertFeedbackOccurrence, listFeedbackOccurrences, mergeFeedbackClusters, splitOccurrenceToNewTicket, addDedupExclusion, excludedDedupIds, DEFAULT_AI_CALL_EST_USD, tryReserveDailySpend, reconcileDailySpend, tryReserveFreeToolSpend, reconcileFreeToolSpend, getProjectModalConfig, setProjectModalConfig, isAccountPro, setAccountPlan, accountPlan, isAccountUnlimited, getWidgetConfig, getWidgetNotifyEmail, setWidgetConfig, recordWidgetPing, latestWidgetPing, setFeedbackContactEmail, exportUserData, eraseUser, computeDashboardInsights, listTriageFeedback, listFeedbackForSim, simAcceptRate, recordSimDismissEvents, listTicketsPaginated, resolveAutosimAuthSetupToken, registerAutosimAuthConfig, getAutosimAuthConfigEncrypted, createAutosimAuthSetupToken, previousSimRunForUrl, usagePeriod, getAccountUsage, accountBillingState, updateAccountBillingState, accountIdForStripeCustomer, accountIdForStripeSubscription, accountIdForOwnerEmail, insertPendingSimMatch, listPendingSimMatches, getPendingSimMatch, confirmPendingSimMatch, rejectPendingSimMatch, listInboxForProjects, setProjectTrailsAutofile, setUserAttribution, recordPartnerCodeRedemption, listPartnerCodeRedemptions, countPartnerCodeRedemptions, accountIdForAiCall, getAccountUsageByProject, tenantTodaySpendByProject } from "./lib/db"
import { checkTenantBudget, tenantBudgetEnforcementEnabled, tenantBudgetRemaining, TenantBudgetExceededError } from "./lib/tenant-budget"
import { sanitizeAttr } from "./lib/attr"
import { deriveActivation, type ActivationSignals } from "./lib/activation"
import { issueKeyFor, chooseDedup, humanReportIssueKeyFor } from "./lib/dedup"
import { classifySimObservation } from "./lib/sim-bug-classify"
import { getConnector, listConnectorTypes, type TicketPayload, type TicketAttachment } from "./lib/connectors/index"
import { inboundSupported, verifyGithubSignature, verifyLinearSignature, extractExternalKey, mapExternalStatus } from "./lib/connectors/inbound"
import { pushCommentToLinkedIssues } from "./lib/connectors/comment-sync"
import { syncFieldsToLinkedIssues } from "./lib/connectors/field-sync"
import { importExternalIssues } from "./lib/connectors/import"
import { deriveHealth } from "./lib/connectors/health"
import { applyReconcileOps, recurrenceFromEvents, pickCitation, type ReconcileOp, type Trait, type TraitEventRow } from "./lib/provenance"
import { sendOtp, sendLeadAlert, sendTicketAssignmentEmail, sendTicketAssignmentInviteEmail, sendMemberInviteEmail } from "./lib/mail"
// First-class member invites + visibility (JTBD 6.4 / KLAVITYKLA-294) — composes existing tables, no migration.
import { listProjectInvites, revokeProjectInvite, getPendingInvite } from "./lib/member-invites"
import { notifyReporterOnFix } from "./lib/fixed-notification"
import { notifyTicketComment } from "./lib/notify"
import { guardCaughtForFeedback, latestReceiptForFeedback, sendRegressionCaughtReceipt } from "./lib/regression-receipt"
import { token, otp, emailAllowed, cookie, clearCookie, parseCookies, isOpsAdmin, projectCookie } from "./lib/auth"
import { uploadScreenshotMeta, presignGet, deleteObject, getObjectBytes, type UploadedScreenshot } from "./lib/s3"
import { signImageToken, verifyImageToken } from "./lib/imgsign"
import { runRetentionSweep } from "./lib/retention"
import { SCREENSHOTS, resolveScreenshotConfig, mbLabel } from "./lib/screenshot-config"
import { buildIssueHtml, escapeHtml, sanitizeClientContext, clientContextLines } from "./lib/feedback"
import { encryptSecret, decryptSecret } from "./lib/crypto"
import { createTestAccount, listTestAccounts, getTestAccountById, getTestAccountByName, deleteTestAccount, isTestAccountEmail, getTestAccountRefs, rotateTestAccountSecret } from "./lib/test-accounts"
import { assertSafeUrl } from "./lib/url-guard"
import { safeFetch } from "./lib/safe-fetch"
import { extConfigVersion, type ExtProjectConfig } from "./lib/ext-config-version"
import { verifyTurnstile, turnstileEnabled, turnstileSiteKey } from "./lib/turnstile"
import { screenshotUrl, authedScreenshotUrl, projectHasHeadlessAuth, defaultPreviewPersona } from "./lib/sim-preview"
import { publishRegressionEvent, listRegressionEvents, acknowledgeRegressionEvent } from "./lib/regression-events"
import { buildAssertUserPrompt } from "./lib/assertion-spec"
import { judgeWalk } from "./lib/trails-judge"
import { WEEK_MS as TRUST_REPORT_WEEK_MS, sendTrustReport, type TrustReportDeps } from "./lib/trust-report"
import type { TrailStatus } from "./lib/trails-types"
import type { RecurrenceMemory } from "./lib/recurrence-memory"
import { allow as rlAllow, record as rlRecord, count as rlCount, clear as rlClear } from "./lib/ratelimit"
import { wrapUntrusted, UNTRUSTED_GUARD } from "./lib/prompt-safety"
import { notifyNewSignup } from "./lib/signup-alert"
import { notifyNewReport } from "./lib/report-alert"
import { notifyBudgetResumeRequest } from "./lib/budget-resume-alert"
import { reportError } from "./lib/error-alert"
import { validateModalConfigInput, resolveModalConfig } from "../packages/core/src/modal-theme"
import { MODEL_CHOICES, MODEL_CHOICE_IDS, DEFAULT_WEIGHTS, pickModel, parseWeightsForm, weightsToPct } from "./lib/models"
import { AsyncLocalStorage } from "node:async_hooks"

// Per-request context. A project-bound Bearer token (widget token) records its bound project here so
// resolveProject can constrain it to that project (F5) — without threading state through every route.
const reqCtx = new AsyncLocalStorage<{ boundProject?: string | null }>()
import { ingestSnapOrSim } from "./lib/expectations-ingest"
import { runSimReviews, decodeDataUrl as decodeDataUrlLib, splitUrl as splitUrlLib, buildSimRunSummary, diffSimRuns, activeReviewIndexes, type SimReview } from "./lib/sim-review"
import { trailsDashboardData, walkTrends } from "./lib/trails-dashboard"
import { fileFindingById, dismissFinding, realFiler } from "./lib/trails-findings-gate"
import { getReplay, runsWithReplay } from "./lib/trails-replay"
import { saveFeedbackReplay, getFeedbackReplay, feedbackIdsWithReplay, pruneOldFeedbackReplays } from "./lib/feedback-replay"
import { listRunSteps, listTrails, getTrail, getWalk, setTrailStatus, listTrailSteps, insertAssertStep, deleteTrailStep, updateTrailStep, updateTrail, countRunSteps, countTrailSteps, listTrailRunHistory, listFindings, recordFinding, getWalkJudgment, type TrailPatch, type StepPatch, resumeWalk, listWalksPaged } from "./lib/trails"
import { runWalkNow } from "./lib/trails-trigger"
import { startTrailScheduler, isValidCron } from "./lib/trails-scheduler"
import { startCrashReaper } from "./lib/trails-reaper"
import { runAuthorNow, getAuthorSession, getActiveAuthorSession, listStalledAuthorSessions, listNeedsAuthSessionsForAutoResume, AUTOSIM_DEADLINE_MS_DEFAULT } from "./lib/trails-author"
import { WalkBusyError, cancelCurrentWalk, cancelCurrentAuthor, PdfBusyError, walkPoolStats } from "./lib/trails-browser"
import { mintShareToken, resolveShareToken, renderWalkPdf, revokeShareToken, listShareTokens, extendShareToken, recordShareView, checkSharePasscode } from "./lib/trails-share"
import { gatherWalkReport } from "./lib/trails-report"
import { liveWatchSseResponse, openLiveWatchStream } from "./lib/trails-live-watch"
import { normalizeTrailViewport } from "./lib/trails-viewport"
import { seedDemoTrails } from "./lib/trails-demo-seed"
import { listExpectations, getExpectation, setExpectationStatus, setExpectationEnforced, demoteExpectationToValidated, setExpectationAwaitingTrail, resumeAwaitingTrailExpectations, upsertExpectationFromTicket } from "./lib/expectations-db"
import { pickDefaultTrail, type TrailForPick } from "./lib/expectations"
import { enrichExpectation } from "./lib/expectations-enrich"
import { getTrailStepById } from "./lib/trails"
import { nearMissSummary } from "./lib/expectations-nearmiss"
import { createLabel, listLabels, updateLabel, deleteLabel, attachLabel, detachLabel, labelsForFeedback, labelsForFeedbackBatch, setSuggestedLabels, getSuggestedLabels } from "./lib/db"
import { suggestLabelsForFeedback, draftTitleForFeedback, fallbackDraftTitle } from "./lib/label-suggest"
import { validateAssertionDraft, normalizeCheckpointInput } from "./lib/assertion-spec"
import { buildRecurrenceMemory, listProjectRecurringIssues } from "./lib/recurrence-memory"
import { findKnownIssue } from "./lib/known-issue"
import { publishBlogPost, SLUG_RE, type PublishInput } from "./lib/blog-publish"
import { getExtractModel } from "./lib/extract-model"
import { parseJSON } from "./lib/parse-json"
import { EXTRACT_SYS as EXTRACT_SYS_PROMPT, normalizeExtractedPersonas } from "./lib/extract-pipeline"
import { billingEnforcementEnabled, buildProjectUsage, buildUsageMeters, createStripeCheckoutSession, createStripePortalSession, intervalFromPrice, normalizeInterval, normalizePlan, PLAN_QUOTAS, planFromPrice, quotasForPlan, retrieveStripeSubscription, verifyStripeWebhook } from "./lib/billing"
import { sanitizeInsight } from "./lib/extract-sanitize"
import { runAutosimAuthProbe } from "./lib/autosim-auth-probe"
import { generateAuthPrompt } from "./lib/autosim-auth-prompt"
import { mintProjectShareToken, revokeProjectShareToken, resolveProjectShareToken, gatherProjectStatusData } from "./lib/project-status-portal"
import { runDueSchedules, buildProductionDeps } from "./lib/sim-review-schedule"
import { trackFunnel, CLIENT_INGESTABLE } from "./lib/funnel"
import { gatherGrowthScorecard } from "./lib/growth-scorecard"
import { TEST_OTP_CODE, TEST_OTP_DURATIONS_H, testOtpDecision, getTestOtpGate, enableTestOtpGate, disableTestOtpGate, recordTestOtpUse, listTestOtpUses, type TestOtpGate, type TestOtpUse } from "./lib/test-otp-gate"
import { capturePosthog } from "./lib/posthog"
import { createSimReviewSchedule, listSimReviewSchedules, getSimReviewSchedule, deleteSimReviewSchedule, setSimReviewScheduleEnabled, type SimReviewScheduleFrequency } from "./lib/db"
import { startSimsDigestScheduler, sendSimsDigest, type SimsDigestDeps, DAY_MS as SIMS_DIGEST_DAY_MS } from "./lib/sims-digest"
import { sendReportAlertEmail } from "./lib/mail"
import { diagnoseHeartbeat, renderDeveloperEmail, type HeartbeatSignals } from "./lib/heartbeat-diagnosis"
import { countRecentFeedback } from "./lib/db"
import { enrollLead, buildNurtureEmail, recordNurtureEmailSent, recordSendgridEvents, startLeadNurtureScheduler } from "./lib/lead-nurture"
import { extractInventory, extractLinks, verifyLinks, brokenLinkFindings, filterModelFindings, checkedSummary, MAX_LINKS_CHECKED } from "./lib/bugcheck"

const KEY = process.env.OPENROUTER_API_KEY
const MODEL = process.env.KLAV_MODEL || "google/gemini-2.5-flash"
const PORT = Number(process.env.PORT || 4317)
const BASE = (process.env.KLAV_BASE_URL || `http://localhost:${PORT}`)
  .replace("klavity.quantana.top", "klavity.in")
const SECURE = BASE.startsWith("https")
const DEV_SHOW_OTP = process.env.KLAV_DEV_SHOW_OTP === "1"
const ENDPOINT = process.env.OPENROUTER_ENDPOINT || "https://openrouter.ai/api/v1/chat/completions"
const OPS_DAILY_CAP_USD = Number(process.env.OPS_DAILY_CAP_USD || 50)
// KLAVITYKLA-341 — bounded slice of OPS_DAILY_CAP_USD reserved for the anonymous free-tool AI calls
// (CRO + bug-check). Default $5/day (~500 calls at DEFAULT_AI_CALL_EST_USD) — enough to absorb a
// front-page launch spike while guaranteeing paid Sims/AutoSims can never be starved by it.
const FREETOOL_DAILY_CAP_USD = Number(process.env.KLAV_FREETOOL_DAILY_CAP_USD || 5)
const SITE = import.meta.dir + "/../site"
const PUB = import.meta.dir + "/public"
const REPO_ROOT = import.meta.dir + "/.."
const SESSION_DAYS = 90 // 90-day sessions — matches projectCookie precedent in lib/auth.ts
// KLA-210 (JTBD 7.5): the expiry choices the Share manager offers at mint / extend time.
const ALLOWED_SHARE_TTL_DAYS = new Set([7, 30, 90])
// Screenshots embedded in external tracker tickets use a PERMANENT signed link (`/img/<id>.<hmac>`,
// see lib/imgsign.ts) — never expires, revocable, S3 stays private. (Replaces the old 7-day presign.)

/**
 * The extension-visible project config for `email` (KLAVITYKLA-320). Shared by
 * GET /api/extension/config and its /version sibling so the hash the extension
 * revalidates against is computed over EXACTLY the payload it caches.
 */
async function extensionProjectConfig(email: string): Promise<ExtProjectConfig[]> {
  const out: ExtProjectConfig[] = []
  for (const p of await listProjects(email)) {
    if (!(await projectAccess(email, p.id))) continue // project-scoped via projectAccess
    const patterns = (await listMonitoredUrls(p.id, { enabledOnly: true })).map(m => m.urlPattern)
    out.push({ id: p.id, name: p.name, reviewMode: p.reviewMode, monitoredUrls: patterns })
  }
  return out
}

function normalizeAssigneeEmail(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const email = String(value).trim().toLowerCase()
  if (!email) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ""
}

async function canAssignTicketTo(projectId: string, actorAccess: "admin" | "member" | null, assignee: string | null): Promise<boolean> {
  if (!assignee) return true
  if (actorAccess === "admin") return true
  return !!(await projectAccess(assignee, projectId).catch(() => null))
}

// JTBD 2.15: per-ticket deep link. When a feedbackId is supplied the URL carries ?ticket=<id>,
// which maybeOpenDeepLinkTicket() honors to open that ticket's detail (matches the JTBD 2.4
// permalink shape). Without a feedbackId it lands on the tickets board as before.
function ticketDashboardUrl(projectId: string, feedbackId?: string | null): string {
  const base = `${BASE.replace(/\/+$/, "")}/dashboard?project=${encodeURIComponent(projectId)}`
  const withTicket = feedbackId ? `${base}&ticket=${encodeURIComponent(feedbackId)}` : base
  return `${withTicket}#tickets`
}

// JTBD 2.15: the post-login invite redirect carries the assigned ticket forward so first login
// lands directly on it. The stored feedbackId is threaded through so the login flow can preserve it.
function ticketInviteUrl(projectId: string, email: string, feedbackId?: string | null): string {
  const t = feedbackId ? `&ticket=${encodeURIComponent(feedbackId)}` : ""
  return `${BASE.replace(/\/+$/, "")}/login?email=${encodeURIComponent(email)}&project=${encodeURIComponent(projectId)}${t}#tickets`
}

// Returns whether an assignment notification email was actually dispatched. When SENDGRID_API_KEY
// is unset the send is skipped (nothing is emailed) and emailSent is false, so the caller can surface
// a visible "assigned, but no email was sent" warning instead of pretending success (JTBD 2.15).
async function notifyTicketAssignee(input: { projectId: string; feedbackId: string; assignee: string; ticketTitle: string; projectName?: string | null; assignedBy?: string | null }): Promise<{ emailSent: boolean }> {
  if (!input.assignee) return { emailSent: false }
  const canEmail = !!process.env.SENDGRID_API_KEY
  const access = await projectAccess(input.assignee, input.projectId).catch(() => null)
  if (!access) {
    await upsertTicketAssignmentInvite(input.projectId, input.assignee, input.assignedBy ?? null, input.feedbackId)
    if (canEmail) {
      void sendTicketAssignmentInviteEmail({
        to: input.assignee,
        ticketTitle: input.ticketTitle,
        projectName: input.projectName ?? null,
        assignedBy: input.assignedBy ?? null,
        ticketUrl: ticketDashboardUrl(input.projectId, input.feedbackId),
        joinUrl: ticketInviteUrl(input.projectId, input.assignee, input.feedbackId),
      }).catch((e: any) => console.warn("ticket assignment invite email skipped:", e?.message || e))
    }
    return { emailSent: canEmail }
  }
  if (canEmail) {
    void sendTicketAssignmentEmail({
      to: input.assignee,
      ticketTitle: input.ticketTitle,
      projectName: input.projectName ?? null,
      assignedBy: input.assignedBy ?? null,
      ticketUrl: ticketDashboardUrl(input.projectId, input.feedbackId),
    }).catch((e: any) => console.warn("ticket assignment email skipped:", e?.message || e))
  }
  return { emailSent: canEmail }
}

await initDb()

// Model mix (/opsadmin): in-process cache of the weighted model selection. Seed the qwen3-heavy
// default on first boot ONLY (never clobber weights set later via the UI).
let weightsCache: Record<string, number> = {}
let weightsCacheAt = 0
async function refreshWeightsCache() { weightsCache = await getModelWeights(); weightsCacheAt = Date.now() }
async function getActiveWeights(): Promise<Record<string, number>> {
  if (Date.now() - weightsCacheAt > 30_000) await refreshWeightsCache()
  return weightsCache
}
if (db) {
  if (Object.keys(await getModelWeights()).length === 0) await setModelWeights(DEFAULT_WEIGHTS)
  await refreshWeightsCache()
}

// Plan G — env-gated demo-Trail seed. When TRAILS_DEMO_PROJECT_ID is set, idempotently seed the demo
// Trails (GREEN baseline / AMBER drift / RED regression + dogfood) for that project so /trails has
// live data. Best-effort: a seed failure is logged but never blocks boot. Fixture Trails point at
// this app's own /trails-demo/* (KLAV_BASE_URL origin); the dogfood walks the real public landing.
if (db && process.env.TRAILS_DEMO_PROJECT_ID) {
  try {
    const r = await seedDemoTrails(process.env.TRAILS_DEMO_PROJECT_ID, BASE)
    if (r.created) console.log(`[trails-demo] seeded ${r.created} demo trail(s) for ${process.env.TRAILS_DEMO_PROJECT_ID}`)
  } catch (e) {
    console.warn("[trails-demo] seed failed (continuing):", String(e))
  }
}

// ── AI (OpenRouter) ──
// EXTRACT_SYS is now the canonical prompt from lib/extract-pipeline (single source of truth
// for both /api/extract and /api/transcripts). Alias it locally so all existing callsites
// below that reference EXTRACT_SYS continue to work unchanged.
const EXTRACT_SYS = EXTRACT_SYS_PROMPT

const REACT_SYS =
  "You ARE the given user persona, reviewing a screenshot of a product page as if really using it. " +
  "React in FIRST PERSON, grounded in this persona's documented pains, wants, and loves.\n\n" +
  "REACT THROUGH THE PERSONA'S CORE. The persona carries a \"core\" object — goals (jobs-to-be-done), " +
  "expertise, temperament, voice, and watchFor (the things this persona scrutinizes on ANY page). " +
  "Scrutinize the page through its watchFor lens, judge it against its goals, and MATCH its voice and " +
  "temperament in every observation. If a core is present, it — not generic UX opinion — drives what you notice.\n\n" +
  "ADAPT TO simClass:\n" +
  "- simClass \"user\": you OPERATE the product hands-on. React to concrete UI and interaction friction — " +
  "specific elements, labels, controls, layout, latency you can see. Point at the exact thing (set region).\n" +
  "- simClass \"client\": you judge OUTCOMES, not buttons. React at the outcome level — does this page deliver the " +
  "business result you care about, seen through your goals + watchFor? Do NOT nitpick individual controls or pixels; " +
  "region will usually be null because your reaction is page/outcome-level, not element-level.\n" +
  "When simClass is absent, default to hands-on user behaviour.\n\n" +
  "Give 1-3 reactions, most important first. For each reaction, set \"region\" to the normalised 0..1 bounding box " +
  "of the specific element or area you are reacting to (x,y = top-left corner; w,h = size; all values 0..1), " +
  "or null for page-level/general observations where no single element is the focus (clients usually null). " +
  "suggestedBug is filled only when it's a real problem worth filing to an issue tracker, else null. " +
  "Stay in character and be specific to what you actually see.\n\n" +
  "The persona's insights each carry a stable \"traitId\". For every reaction, set citedTraitIds to the list of traitIds " +
  "of the persona's documented traits that actually drove that reaction (the pains/wants/loves it stems from). " +
  "Use [] if no documented trait applies. Only ever cite traitIds present in the persona you are given.\n\n" +
  "Some traits in the persona carry a \"recurrenceMemory\" field. When recurrenceMemory.regressed is true, the trait was " +
  "previously resolved (the team addressed it) but has since resurfaced. In that case and ONLY that case, voice " +
  "disappointment and include a line like \"I raised this before (YYYY-MM-DD) and it's happening again (YYYY-MM-DD)\". " +
  "Do NOT voice disappointment or mention recurrence for traits where recurrenceMemory is absent, null, or regressed is false — " +
  "a frequently-reinforced trait that was never resolved does not warrant disappointment.\n\n" +
  "Respond with ONLY a JSON object, no prose, in exactly this shape:\n" +
  '{"reactions":[{"observation":string(<=240 chars, first person),"sentiment":"frustrated"|"confused"|"satisfied"|"delighted"|"neutral",' +
  '"emoji":string,"targetDescription":string,"region":{"x":number,"y":number,"w":number,"h":number}|null,' +
  '"citedTraitIds":string[],' +
  '"suggestedBug":{"title":string,"body":string,"priority":"urgent"|"high"|"medium"|"low"}|null}]}'

// RECONCILE: given a Sim's CURRENT traits (each with a stable traitId) + a new transcript, emit the
// minimal structured op list that evolves the Sim. One LLM call per matched Sim per transcript (§5
// cost guard — gated by reconcile_runs, never the whole library).
const RECONCILE_SYS =
  "You maintain a durable, provenance-tracked profile of ONE user persona (\"Sim\") as new interview/call " +
  "transcripts arrive. You are given the Sim's CURRENT traits (each a typed pain|want|love with a stable " +
  "traitId) and ONE new transcript. You may also receive a RECENTLY_RESOLVED list of traits that were " +
  "previously contradicted or superseded (resolved). Emit the MINIMAL list of operations that evolves this " +
  "Sim to reflect the new transcript — do NOT restate unchanged traits, and do NOT invent traits the " +
  "transcript does not support. Every op MUST be anchored to a short verbatim quote from the transcript.\n\n" +
  "Operations:\n" +
  "- add: a genuinely NEW pain/want/love not already covered (omit traitId).\n" +
  "- reinforce: the transcript restates/confirms an existing trait (set traitId; text may echo the existing text).\n" +
  "- refine: the transcript sharpens/expands an existing trait's wording (set traitId; text = the improved text).\n" +
  "- contradict: the transcript shows the Sim no longer holds an existing trait (set traitId).\n" +
  "- supersede: an existing trait is REPLACED by a changed preference (set traitId; text = the replacement).\n" +
  "- reopen: a previously-resolved issue (from RECENTLY_RESOLVED) has resurfaced. Set traitId to the id of " +
  "  the resolved trait. This reactivates the SAME trait id — use this INSTEAD of add when the transcript " +
  "  clearly describes the same issue that was previously resolved.\n\n" +
  "For every op, also set: area (short UI/domain area descriptor), " +
  "issueType (EXACTLY ONE of: label-copy|layout|performance|flow|error-handling|accessibility|visual, or null), " +
  "priority (urgent|high|medium|low based on expressed impact, or null), " +
  "scope (EXACTLY ONE of: ui|feature|workflow|strategy — ui = a granular defect on a specific artifact; " +
  "feature = a missing/requested capability; workflow = a change to a multi-step process, role, or permission; " +
  "strategy = a higher-level product direction), and " +
  "portability (portable = a durable persona trait/need that also applies on other products; " +
  "site-specific = a finding about THIS product).\n\n" +
  "Be conservative: only emit an op when the transcript clearly supports it. quote is verbatim from the transcript; " +
  "speaker is who said it; reason is a short why.\n\n" +
  "Respond with ONLY a JSON object, no prose, in exactly this shape:\n" +
  '{"ops":[{"op":"add"|"reinforce"|"refine"|"contradict"|"supersede"|"reopen","kind":"pain"|"want"|"love",' +
  '"text":string,"quote":string,"speaker":string,"traitId":string|null,"reason":string,' +
  '"area":string|null,"issueType":"label-copy"|"layout"|"performance"|"flow"|"error-handling"|"accessibility"|"visual"|null,"priority":"urgent"|"high"|"medium"|"low"|null,' +
  '"scope":"ui"|"feature"|"workflow"|"strategy"|null,"portability":"portable"|"site-specific"|null}]}'

const ASSERT_SYS =
  "You convert a VALIDATED product issue into ONE deterministic UI assertion for an existing end-to-end Trail. " +
  "The only supported checkpoint is that a target element must be VISIBLE on the page. " +
  "Pick the Trail step (afterStepIdx) AFTER which the assertion should run, and describe the target by role+accessible-name " +
  "(preferred), visible text, or a CSS selector (last resort). Be specific to the issue's screen.\n\n" +
  "Respond with ONLY a JSON object in exactly this shape:\n" +
  '{"trailId":string,"afterStepIdx":number,"action":"assert","target":{"role"?:string,"name"?:string,"text"?:string,"selector"?:string},' +
  '"checkpoint":{"kind":"visible","description":string}}'

// jsonMode forces structured output — safe for text calls, but Gemini's vision path
// via OpenRouter often returns empty content under json_object, so leave it OFF for
// image calls and rely on the prompt + parseJSON's extraction instead.
// `ctx.temperature` (KLAVITYKLA-342) pins sampling for callers that must be REPRODUCIBLE — a user
// re-running the same free scan has to get the same answer. Omit it everywhere else to keep the
// existing (provider-default) behaviour untouched.
async function chat(messages: any[], maxTokens: number, jsonMode = false, ctx?: { type: string; feature?: string | null; email?: string | null; projectId?: string | null; model?: string; temperature?: number }) {
  const t0 = Date.now()
  const label = ctx?.type || "chat"
  // M5/LLM10: enforce the daily spend cap server-side, ATOMICALLY. The old `opsTodaySpend() >= cap`
  // read-then-act check raced — N concurrent callers all saw under-cap and all spent, overshooting the
  // wallet. We now RESERVE the estimated cost up-front via a single conditional UPDATE (fails CLOSED if
  // the reservation would cross the cap), then reconcile to the real cost after the call returns.
  const spendEst = DEFAULT_AI_CALL_EST_USD
  // KLA-314 (JTBD 8.10): per-tenant AI budget gate UNDER the global cap. Ship-dark — a complete
  // no-op unless KLAV_TENANT_BUDGET_ENFORCEMENT=1. Checked BEFORE the global reservation so a denial
  // here never touches (nor has to release) the shared daily budget, and one runaway tenant can't
  // exhaust OPS_DAILY_CAP_USD for everyone else. Resolves the SAME account the call is billed to.
  if (db && ctx && tenantBudgetEnforcementEnabled()) {
    try {
      const acct = await accountIdForAiCall(ctx.projectId ?? null, null, ctx.email ?? null)
      if (acct) {
        const tb = await checkTenantBudget(acct)
        if (tb.blocked) {
          console.warn(`AI[${label}] blocked: tenant ${acct} over daily budget $${tb.budget} (spent $${tb.spent})`)
          throw new TenantBudgetExceededError(tb.reason || "AI budget reached for this account.")
        }
      }
    } catch (e: any) {
      if (e instanceof TenantBudgetExceededError) throw e
      // A failing budget query must not silently break every call — log and fall through to the
      // global cap, which is the shared backstop.
      console.error("tenant budget check failed:", e?.message || e)
    }
  }
  let spendReserved = false
  if (db) {
    try {
      if (!(await tryReserveDailySpend(spendEst, OPS_DAILY_CAP_USD))) {
        console.warn(`AI[${label}] blocked: daily cap $${OPS_DAILY_CAP_USD} reached`)
        throw new Error("Daily AI budget reached — please try again tomorrow.")
      }
      spendReserved = true
    } catch (e: any) {
      if (e?.message?.includes("Daily AI budget")) throw e
      // A failing reservation query must not silently disable the cap, but also shouldn't hard-break
      // every call on a transient DB hiccup — log and proceed (the per-key OpenRouter cap is the backstop).
      console.error("tryReserveDailySpend check failed:", e?.message || e)
    }
  }
  const model = ctx?.model ?? pickModel(await getActiveWeights(), MODEL_CHOICE_IDS, MODEL, Math.random())
  const recordFailure = (reason: string) => {
    if (!ctx) return
    void recordAiCall({
      type: ctx.type, feature: ctx.feature ?? null, model, actorEmail: ctx.email ?? null, projectId: ctx.projectId ?? null,
      inputTokens: null, outputTokens: null, costUsd: 0, ok: false,
    }).catch((e: any) => console.error(`recordAiCall failed for ${reason}:`, e?.message || e))
  }
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 90_000)  // never hang a request forever
  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json", "HTTP-Referer": BASE, "X-Title": "Klavity" },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages, usage: { include: true }, ...(typeof ctx?.temperature === "number" ? { temperature: ctx.temperature } : {}), ...(jsonMode ? { response_format: { type: "json_object" } } : {}) }),
      signal: ctl.signal,
    })
  } catch (e: any) {
    clearTimeout(timer)
    // The call never produced a billable response → release the reservation back to today's budget.
    if (spendReserved) void reconcileDailySpend(spendEst, 0).catch(() => {})
    recordFailure("fetch")
    const ms = Date.now() - t0
    if (e?.name === "AbortError") { console.error(`AI[${label}] TIMEOUT after ${ms}ms`); throw new Error("The model took too long (>90s). Please try again.") }
    console.error(`AI[${label}] network error after ${ms}ms:`, e?.message || e); throw e
  }
  clearTimeout(timer)
  if (!res.ok) {
    if (spendReserved) void reconcileDailySpend(spendEst, 0).catch(() => {})
    recordFailure("http")
    const body = (await res.text()).slice(0, 300)
    console.error(`AI[${label}] OpenRouter ${res.status} after ${Date.now() - t0}ms: ${body}`)
    throw new Error(`OpenRouter ${res.status}: ${body}`)
  }
  let data: any
  try {
    data = await res.json()
  } catch (e: any) {
    if (spendReserved) void reconcileDailySpend(spendEst, 0).catch(() => {})
    recordFailure("json")
    throw e
  }
  const content: string = data?.choices?.[0]?.message?.content ?? ""
  const u = data?.usage || {}
  console.log(`AI[${label}] ok in ${Date.now() - t0}ms · ${u.prompt_tokens ?? "?"}/${u.completion_tokens ?? "?"} tok · $${u.cost ?? "?"}`)
  // Best-effort credit ledger — FIRE-AND-FORGET so a slow/stuck insert can never hang the response.
  if (ctx) {
    void recordAiCall({
      type: ctx.type, feature: ctx.feature ?? null, model, actorEmail: ctx.email ?? null, projectId: ctx.projectId ?? null,
      inputTokens: typeof u.prompt_tokens === "number" ? u.prompt_tokens : null,
      outputTokens: typeof u.completion_tokens === "number" ? u.completion_tokens : null,
      costUsd: typeof u.cost === "number" ? u.cost : null,
    }).catch((e: any) => console.error("recordAiCall failed:", e?.message || e))
  }
  // M5/LLM10: reconcile the up-front reservation to the REAL cost so the cap tracks actual spend.
  // Fire-and-forget — a slow reconcile must never hang the response; the reservation already gated us.
  if (spendReserved) {
    void reconcileDailySpend(spendEst, typeof u.cost === "number" ? u.cost : 0)
      .catch((e: any) => console.error("reconcileDailySpend failed:", e?.message || e))
  }
  return { content, usage: { input_tokens: u.prompt_tokens, output_tokens: u.completion_tokens } }
}
// parseJSON is imported from ./lib/parse-json (extracted for unit-testability).
// All callers below use the imported function; behaviour is identical.
// sanitizeTypedFields: alias for sanitizeInsight (imported from lib/extract-sanitize).
// Both names are kept so existing callsites in reconcileSim continue to work without
// touching every call site — the logic is now the single source of truth in extract-sanitize.ts.
const sanitizeTypedFields = sanitizeInsight

async function extractPersonas(transcript: string, ctx?: { email?: string | null; projectId?: string | null }) {
  // H4/LLM01: the transcript is untrusted — delimit it and tell the model to treat it as data.
  // EXTRACT_MAX_OUTPUT_TOKENS (16 000) replaces the old hard-coded 4 000. Long transcripts with
  // 5+ speakers and many insights were hitting the 4 000-token ceiling → truncated JSON → 500.
  const { content, usage } = await chat([{ role: "system", content: EXTRACT_SYS + UNTRUSTED_GUARD }, { role: "user", content: "TRANSCRIPT:\n" + wrapUntrusted(transcript) }], EXTRACT_MAX_OUTPUT_TOKENS, false, { type: "extract", model: getExtractModel(), ...ctx })
  const data = parseJSON(content)
  // Delegate post-processing to the shared canonical normalizer (lib/extract-pipeline).
  // This is the SAME logic used by /api/transcripts — both entry points now go through
  // normalizeExtractedPersonas for: (1) backward-compat .type shim, (2) insight field sanitization.
  normalizeExtractedPersonas(data)
  return { data, usage }
}
async function reactToPage(persona: any, imageB64: string, mediaType: string, pageUrl: string, ctx?: { email?: string | null; projectId?: string | null }) {
  // H4/LLM01: the persona is our own trusted data, but the page URL and the screenshot itself are
  // attacker-influenceable — delimit the URL and instruct the model to ignore instructions in page data.
  // Current-date awareness: without this the model assumes its training-era "current year" (e.g. 2024)
  // and wrongly flags valid future-looking dates on the page as errors (a 2026 "Founded Year" reported as
  // "impossible, it's 2024"). Stamp today's real date at call time so date reasoning is grounded in now.
  const today = new Date().toISOString().slice(0, 10)
  const { content, usage } = await chat([
    { role: "system", content: REACT_SYS + UNTRUSTED_GUARD },
    { role: "user", content: [
      { type: "text", text: `Today's date is ${today}. Treat this as the current date and year when judging whether any dates shown on the page are valid, impossible, or out of range — do NOT assume an earlier year.\n\n` + "You are this persona:\n" + JSON.stringify(persona, null, 2) + `\n\nReact to this screenshot. The page URL (untrusted) is:\n` + wrapUntrusted(pageUrl || "(unknown URL)") },
      { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageB64}` } },
    ] },
  ], 2500, false, { type: "react", feature: "sim-react", ...ctx })
  return { data: parseJSON(content), usage }
}

async function draftAssertion(expectation: any, trail: any, steps: any[], ctx?: { email?: string | null; projectId?: string | null }) {
  // B.13: feed the originating grounded quote (the actual complaint/evidence the expectation was born
  // from) so the drafted assert reflects what the user/Sim/AutoSim actually reported, not just a title.
  // Prompt building lives in the pure, unit-tested buildAssertUserPrompt.
  const { content, usage } = await chat([
    { role: "system", content: ASSERT_SYS },
    { role: "user", content: buildAssertUserPrompt(expectation, trail, steps) },
  ], 800, true, { type: "assert-gen", ...ctx })
  return { content, usage }
}

// B.5 (KLA-245): a short human label for a Trail step so the Enforce confirm card can show WHERE
// the assert lands (e.g. "after step 4: Submit signup") and the step picker is meaningful.
function stepLabel(s: any): string {
  const t = s?.target || {}
  const named = t.accessibleName || t.name || t.text || t.testId
  if (named) return `${s.action} ${named}`
  if (s.action === "navigate" && s.actionValue) return `navigate ${s.actionValue}`
  return String(s.action || "step")
}

// B.5 (KLA-245): map DB trails+steps into the DB-free TrailForPick shape used by pickDefaultTrail,
// plus a UI payload the dashboard renders in the repoint dropdown / step picker.
async function trailsForEnforce(projectId: string): Promise<{
  pick: TrailForPick[]
  ui: Array<{ id: string; name: string; steps: Array<{ afterStepIdx: number; label: string }> }>
}> {
  const trails = await listTrails(projectId)
  const pick: TrailForPick[] = []
  const ui: Array<{ id: string; name: string; steps: Array<{ afterStepIdx: number; label: string }> }> = []
  for (const t of trails) {
    const steps = await listTrailSteps(projectId, t.id)
    pick.push({ id: t.id, baseUrl: t.baseUrl, stepUrls: steps.map((s) => (s.action === "navigate" ? s.actionValue : null)) })
    // Step-position options: "after step N: <label>" (afterStepIdx = the step's idx; the assert
    // lands at idx+1). Only steps at idx >= 0 qualify — validateAssertionDraft rejects negatives.
    const stepOpts = steps.map((s) => ({ afterStepIdx: s.idx, label: `after step ${s.idx + 1}: ${stepLabel(s)}` }))
    ui.push({ id: t.id, name: t.name, steps: stepOpts })
  }
  return { pick, ui }
}

// ── P3a reconcile: one LLM call that evolves ONE Sim against ONE transcript (§5 cost guard). ──
// currentTraits is the Sim's ACTIVE sim_traits; recentlyResolved feeds RECONCILE_SYS the recently
// contradicted/superseded traits so it can emit a `reopen` targeting the same trait id when the
// issue resurfaces. The route MUST gate this on hasReconcileRun() so we never re-reconcile a
// (sim,transcript) pair nor touch the whole library.
async function reconcileSim(
  currentTraits: Trait[],
  transcript: string,
  opts?: { email?: string | null; projectId?: string | null; recentlyResolved?: RecentlyResolvedTrait[] },
) {
  const traitsForLLM = currentTraits.map((t) => ({ traitId: t.id, kind: t.kind, text: t.text, strength: t.strength }))
  const recentlyResolved = opts?.recentlyResolved ?? []
  const resolvedForLLM = recentlyResolved.map((t) => ({ traitId: t.id, kind: t.kind, text: t.text, status: t.status }))
  const userMsg =
    "CURRENT TRAITS (JSON):\n" + JSON.stringify(traitsForLLM, null, 2) +
    (resolvedForLLM.length
      ? "\n\nRECENTLY_RESOLVED (contradicted/superseded — emit 'reopen' targeting these traitIds if the issue resurfaces):\n" +
        JSON.stringify(resolvedForLLM, null, 2)
      : "") +
    // H4/LLM01: the new transcript is untrusted — delimit it (the CURRENT TRAITS above are our own data).
    "\n\nNEW TRANSCRIPT:\n" + wrapUntrusted(transcript)
  const { content, usage } = await chat([
    { role: "system", content: RECONCILE_SYS + UNTRUSTED_GUARD },
    { role: "user", content: userMsg },
  ], 3000, false, { type: "reconcile", email: opts?.email, projectId: opts?.projectId })
  const data = parseJSON(content)
  const rawOps: any[] = Array.isArray(data?.ops) ? data.ops : []
  const valid = new Set(["add", "reinforce", "refine", "contradict", "supersede", "reopen"])
  const kinds = new Set(["pain", "want", "love"])
  // Sanitize: drop malformed ops, normalize traitId (null → undefined so applyReconcileOps treats add correctly).
  // reopen MUST have a traitId (targeting a resolved trait); drop it if absent.
  const ops: ReconcileOp[] = rawOps
    .filter((o) => {
      if (!o || !valid.has(o.op) || !kinds.has(o.kind)) return false
      if (typeof o.text !== "string" || !o.text.trim()) return false
      if (typeof o.quote !== "string" || !o.quote.trim()) return false
      if (o.op === "reopen" && (o.traitId == null || !String(o.traitId).trim())) return false
      return true
    })
    .map((o) => {
      const typed = sanitizeTypedFields(o)
      return {
        op: o.op, kind: o.kind, text: String(o.text), quote: String(o.quote),
        speaker: o.speaker != null ? String(o.speaker) : null,
        traitId: o.op === "add" || o.traitId == null ? undefined : String(o.traitId),
        reason: o.reason != null ? String(o.reason) : undefined,
        ...typed,
      }
    })
  return { ops, usage }
}

// Conservative persona→Sim matching (§3/§4: "Sim-matching corrupting provenance → conservative match").
// Exact (case/space-insensitive) name match → confident auto-apply. A name-token overlap with a DIFFERENT
// role, or an ambiguous (>1 candidate) match → return for admin confirmation rather than silently merging.
function normName(s: string): string { return String(s || "").trim().toLowerCase().replace(/\s+/g, " ") }
function matchPersonaToSim(extracted: { name: string; role?: string }, sims: { id: string; name: string; role: string }[]): { simId: string } | { needsConfirm: { name: string; candidates: { simId: string; name: string; role: string }[] } } | null {
  const en = normName(extracted.name)
  if (!en) return null
  const exact = sims.filter((s) => normName(s.name) === en)
  if (exact.length === 1) return { simId: exact[0].id } // confident
  if (exact.length > 1) {
    // same name on multiple Sims → ambiguous, never silently merge.
    return { needsConfirm: { name: extracted.name, candidates: exact.map((s) => ({ simId: s.id, name: s.name, role: s.role })) } }
  }
  // fuzzy: any Sim sharing a first/last name token → confirm, don't auto-apply.
  const tokens = en.split(" ").filter((t) => t.length >= 3)
  const fuzzy = sims.filter((s) => { const sn = normName(s.name).split(" "); return tokens.some((t) => sn.includes(t)) })
  if (fuzzy.length) return { needsConfirm: { name: extracted.name, candidates: fuzzy.map((s) => ({ simId: s.id, name: s.name, role: s.role })) } }
  return null // no match → a brand-new persona (not auto-created in P3a step 2; surfaced as needsConfirm-free non-match)
}

// Resolve LLM-returned citedTraitIds → persisted citation fields ({quote, speaker, sourceDate, transcriptId}).
// Defensive: ignores ids that don't belong to the Sim (no crash); returns empty citation when nothing matches.
// Also computes per-trait recurrence (from trait_events) and surfaces the STRONGEST regression across all
// matched traits (strongest = regressed=true, else pick by timesRaised).
// A07/A01: projectId (when supplied) scopes every trait/transcript read to the caller's project, so a
// cited trait id belonging to ANOTHER tenant's Sim can never resolve to a verbatim quote/provenance.
// Callers should ALSO verify the sim itself belongs to the project (pass simId=null otherwise); this
// is the defense-in-depth layer that ensures even a leaked trait id can't read cross-project.
// Preloaded, sim-scoped trait data a caller can hand in so resolveCitations does NOT re-query per
// reaction. The review loops build this ONCE per Sim (they already fetch the events for recurrence
// memory) and pass it for every reaction → collapses the old per-reaction N+1 on listTraits /
// listTraitEvents into a single read per Sim.
type CitationPreload = { traits: Trait[]; eventsByTrait: Map<string, TraitEventRow[]> }

async function resolveCitations(simId: string | null, citedTraitIds: any, projectId?: string | null, pre?: CitationPreload): Promise<{
  citedTraitIds: string[]; sourceQuote: string | null; speaker: string | null; sourceTranscriptId: string | null; sourceDate: number | null;
  issueType: string | null; sourceQuoteVerified: boolean | null;
  recurrence: { timesRaised: number; regressed: boolean; firstRaised: number | null; lastRaised: number | null; priorResolvedAt: number | null } | null
}> {
  const empty = { citedTraitIds: [] as string[], sourceQuote: null, speaker: null, sourceTranscriptId: null, sourceDate: null, issueType: null, sourceQuoteVerified: null, recurrence: null }
  if (!simId || !Array.isArray(citedTraitIds) || !citedTraitIds.length) return empty

  // Traits + per-trait events: use the caller's preloaded copy when present (review loops), else
  // fetch on demand for one-off callers. eventsByTrait stays null on a DB-read failure so the
  // recurrence stays null (matches the original no-DB-mode behavior).
  const traits = pre?.traits ?? await listTraits(simId, projectId ? { projectId } : {}) // all statuses — a cited trait may have since been superseded
  let eventsByTrait: Map<string, TraitEventRow[]> | null = pre?.eventsByTrait ?? null
  if (!pre) {
    try {
      const allEvents: TraitEventRow[] = await listTraitEvents(simId, projectId ? { projectId } : {})
      eventsByTrait = new Map<string, TraitEventRow[]>()
      for (const e of allEvents) {
        const arr = eventsByTrait.get(e.traitId) ?? []
        arr.push(e)
        eventsByTrait.set(e.traitId, arr)
      }
    } catch {
      // Non-fatal: if DB is absent (test/no-db mode), skip recurrence (null → no regression voice).
      eventsByTrait = null
    }
  }

  const pick = pickCitation(traits, eventsByTrait, citedTraitIds)
  if (!pick) return empty

  // source_date comes from the primary trait's originating transcript (drives "(Sarah, 2026-06-12)").
  let sourceDate: number | null = null
  if (pick.sourceTranscriptId) {
    // Scope the transcript read to the project too (defense-in-depth) when projectId is known.
    const tr = projectId
      ? await db!.execute({ sql: "SELECT source_date FROM transcripts WHERE id=? AND project_id=?", args: [pick.sourceTranscriptId, projectId] })
      : await db!.execute({ sql: "SELECT source_date FROM transcripts WHERE id=?", args: [pick.sourceTranscriptId] })
    if (tr.rows.length) sourceDate = Number((tr.rows[0] as any).source_date)
  }
  return { ...pick, sourceDate }
}

// Decide whether a suggested bug duplicates an existing project report. Returns the existing
// feedback id to collapse into, or null to insert fresh. Pure decision over DB lookups.
async function findDuplicateFeedback(args: {
  projectId: string; urlPath: string | null; issueType?: string | null
  citedTraitIds?: string[]; title: string; observation: string; issueKey?: string | null
}): Promise<string | null> {
  const issueKey = args.issueKey ?? issueKeyFor({
    projectId: args.projectId, urlPath: args.urlPath ?? "/",
    issueType: args.issueType ?? null, citedTraitIds: args.citedTraitIds ?? [],
  })
  const exact = await findFeedbackByIssueKey(args.projectId, issueKey)
  const recent = exact ? [] : await listRecentFeedbackForDedup(args.projectId, 50)
  const target = chooseDedup({ title: args.title, observation: args.observation }, exact, recent)
  if (!target) return null
  // A.10: honour a manual split. If an operator split content matching this candidate out of the
  // matched head into a standalone ticket (recorded as a dedup exclusion + carried on the split
  // ticket's issue_key), route this repeat to that standalone ticket instead of re-collapsing into
  // the head — so the next intake pass does not undo the split.
  const split = await splitTicketForExcludedHead(args.projectId, target, issueKey).catch(() => null)
  return split ?? target
}
// Given a dedup TARGET head and the incoming candidate's issue_key, find a ticket the operator split
// OUT of that head whose own issue_key equals the candidate's — i.e. the standalone ticket that now
// owns this content. Returns that ticket's id (re-route the repeat there) or null (no such split).
async function splitTicketForExcludedHead(projectId: string, headId: string, candidateIssueKey: string): Promise<string | null> {
  const excluded = await excludedDedupIds(projectId, headId)
  if (!excluded.size) return null
  const byKey = await findFeedbackByIssueKey(projectId, candidateIssueKey)
  if (byKey && byKey.id !== headId && excluded.has(byKey.id)) return byKey.id
  return null
}
// Re-export the key so insert sites store it on new rows.
function issueKeyForFeedback(projectId: string, urlPath: string | null, issueType: string | null, citedTraitIds: string[]): string {
  return issueKeyFor({ projectId, urlPath: urlPath ?? "/", issueType, citedTraitIds })
}

// One-line human citation for the Plane issue body: "Cited from Sarah's profile: "…" (Sarah, 2026-06-12)".
// When recurrence.regressed is true, appends a "Raised before YYYY-MM-DD → recurred YYYY-MM-DD" line.
function citationLine(c: {
  sourceQuote: string | null; speaker?: string | null; sourceDate: number | null;
  recurrence?: { regressed: boolean; firstRaised: number | null; lastRaised: number | null; priorResolvedAt: number | null } | null
}): string | null {
  if (!c.sourceQuote) return null
  const date = c.sourceDate ? new Date(c.sourceDate).toISOString().slice(0, 10) : null
  const who = c.speaker || null
  const attr = who && date ? ` (${who}, ${date})` : who ? ` (${who})` : date ? ` (${date})` : ""
  let line = `Cited from Sim profile: "${c.sourceQuote}"${attr}`
  // Append regression annotation only when regressed (not on mere recurrence).
  // X = firstRaised (when the issue was originally raised), Y = lastRaised (when it recurred).
  if (c.recurrence?.regressed && c.recurrence.firstRaised && c.recurrence.lastRaised) {
    const raisedDate = new Date(c.recurrence.firstRaised).toISOString().slice(0, 10)
    const againDate = new Date(c.recurrence.lastRaised).toISOString().slice(0, 10)
    line += ` | Raised before ${raisedDate} → again ${againDate}`
  }
  return line
}

// ── http helpers ──
const WIDGET_CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-max-age": "600",
}

// ── Cross-origin widget CORS ──────────────────────────────────────────────────
// The embeddable widget runs on the CUSTOMER's own domain (e.g. bigidea.example.com) and calls
// these PUBLIC, project-scoped endpoints cross-origin. Without CORS the browser blocks every call,
// so the widget is dead on every customer site (works only same-origin on klavity.in).
// These endpoints are public + project_id/widget-token-scoped — NEVER add any authed/admin/dashboard
// path here. We REFLECT the request Origin (safer than "*", and required if a caller ever sends
// credentials) and emit it from a single chokepoint (withWidgetCors) so coverage can't be silently
// reverted by a stale-base merge that drops a per-handler header.
function isWidgetCorsPath(path: string): boolean {
  switch (path) {
    case "/api/widget/ping":
    case "/api/widget/lead":
    case "/api/widget/sims":
    case "/api/feedback":
    case "/api/consent":
    case "/api/sim/review":
    case "/api/personas":
    // The extension content-script runs on the CUSTOMER's domain and calls this bearer-gated,
    // project-scoped endpoint cross-origin on each page load (content.ts klavFetchServerMatch).
    // Without CORS on the actual GET response (the OPTIONS preflight alone isn't enough) the
    // browser drops the body → the extension's live server-match is dead on every third-party site.
    case "/api/extension/match":
      return true
  }
  if (path.startsWith("/api/personas/")) return true
  return /^\/api\/projects\/[^/]+\/config$/.test(path)
}
// KLAVITYKLA-318: legacy domain. Kept alive for /api/* (with CORS) so unmigrated extensions/widgets
// keep working; site paths still 301 to klavity.in for SEO. Retirement gate: legacy /api hits ~0
// for a full week (see docs/legacy-domain-retirement.md), then delete this whole block.
const LEGACY_HOST = "klavity.quantana.top"
const legacyHostApiHits = new Map<string, number>()
function noteLegacyHostApiHit(path: string): void {
  const n = (legacyHostApiHits.get(path) || 0) + 1
  legacyHostApiHits.set(path, n)
  // Log the first hit per path per process, then every 100th — visible but not a log flood.
  if (n === 1 || n % 100 === 0) console.warn(`[legacy-domain] ${LEGACY_HOST}${path} served in place (hit #${n}) — client not yet migrated to klavity.in`)
}
export function _legacyHostApiHitsForTest(): Record<string, number> {
  return Object.fromEntries(legacyHostApiHits)
}
function widgetCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin")
  return {
    "access-control-allow-origin": origin || "*",
    "vary": "Origin",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-credentials": "true",
    "access-control-max-age": "600",
  }
}
// Single chokepoint: attach reflected-Origin CORS to EVERY response on a widget path (success,
// 4xx, 401, even a 302) and to the /api/ OPTIONS preflight — so the widget can always read the
// reply cross-origin regardless of which handler produced it.
function withWidgetCors(req: Request, res: Response): Response {
  try {
    const path = new URL(req.url).pathname
    const apply = req.method === "OPTIONS" ? path.startsWith("/api/") : isWidgetCorsPath(path)
    if (apply) for (const [k, v] of Object.entries(widgetCorsHeaders(req))) res.headers.set(k, v)
  } catch { /* immutable headers / bad url — skip */ }
  return res
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } })
}
async function readJsonLimited(req: Request, maxBytes: number): Promise<{ ok: true; data: any } | { ok: false; status: number; error: string }> {
  const len = Number(req.headers.get("content-length") || 0)
  if (Number.isFinite(len) && len > maxBytes) return { ok: false, status: 413, error: "payload too large" }
  const raw = await req.text().catch(() => "")
  if (raw.length > maxBytes) return { ok: false, status: 413, error: "payload too large" }
  try { return { ok: true, data: raw ? JSON.parse(raw) : {} } }
  catch { return { ok: false, status: 400, error: "invalid json" } }
}
// M4/A10: never echo internal exception text (DB errors, stack traces, upstream bodies) to clients.
// Log it server-side with a short correlation id; return a generic message + that id so a user can
// quote it for support without leaking internals.
function oops(e: unknown, label: string): { error: string; id: string } {
  const id = crypto.randomUUID().slice(0, 8)
  const message = (e as any)?.message || String(e) || "unknown error"
  console.error(`[${label} ${id}]`, message)
  void reportError({ where: "backend", message, traceId: id, route: label, stack: (e as any)?.stack })
  return { error: "Something went wrong. Please try again.", id }
}
// Widget-scoped json: always attaches WIDGET_CORS so every response (success AND error) is
// readable cross-origin. Used for /api/personas, /api/sim/review, /api/consent only.
function wjson(body: unknown, status = 200) { return json(body, status, WIDGET_CORS) }
// Constant-time string compare for shared-secret webhook headers (Plane). Avoids leaking the
// secret length-by-length / byte-by-byte via response timing. (GitHub uses HMAC in inbound.ts.)
function timingSafeStrEqual(a: string, b: string): boolean {
  if (!a || !b) return false
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
function parseAttribution(raw: unknown): { source: string | null; medium: string | null; campaign: string | null; referrer: string | null; anonId: string | null } {
  const a = (raw != null && typeof raw === "object" && !Array.isArray(raw)) ? (raw as Record<string, unknown>) : {}
  const s = (v: unknown, max: number) => { const t = String(v ?? "").trim(); return t.length ? t.slice(0, max) : null }
  return { source: s(a.source, 100), medium: s(a.medium, 100), campaign: s(a.campaign, 100), referrer: s(a.referrer, 500), anonId: s(a.anonId, 500) }
}
function file(path: string) { return new Response(Bun.file(path)) }
// Serve the dashboard with the app version injected into its sidebar-footer placeholder
// (__APP_VERSION__). Sourced from package.json — the orchestrator's single version stamp —
// so we never hardcode it. Read+patched once and cached; the prod box restarts on deploy,
// so the cached value refreshes once per release.
let DASHBOARD_HTML: string | null = null
async function dashboardPage(): Promise<Response> {
  if (DASHBOARD_HTML === null) {
    let version = ""
    try { version = String((await Bun.file(import.meta.dir + "/../package.json").json())?.version || "") } catch { /* fall back to empty */ }
    const raw = await Bun.file(PUB + "/dashboard.html").text()
    DASHBOARD_HTML = raw.replaceAll("__APP_VERSION__", version).replaceAll("__POSTHOG_KEY__", _PH_KEY)
  }
  return new Response(DASHBOARD_HTML, { headers: { "content-type": "text/html; charset=utf-8" } })
}
// Serve HTML pages with __POSTHOG_KEY__ substituted from KLAV_POSTHOG_KEY env var and
// __CAL_BOOKING_URL__ from CAL_BOOKING_URL (KLAVITYKLA-331 — founder booking CTA).
// Cached per path — refreshes on process restart (i.e. every deploy).
const _htmlCache = new Map<string, string>()
const _PH_KEY = process.env.KLAV_POSTHOG_KEY || ""
// Default is the founder's 15-minute Cal.com link; override per environment with CAL_BOOKING_URL.
export const DEFAULT_CAL_BOOKING_URL = "https://cal.com/klavity/15min"
export function normalizeCalBookingUrl(raw?: string | null): string {
  const v = String(raw || "").trim()
  if (!v) return DEFAULT_CAL_BOOKING_URL
  // Only http(s) — a javascript:/data: value here would be injected straight into an href.
  if (!/^https?:\/\//i.test(v)) return DEFAULT_CAL_BOOKING_URL
  // Escape the few characters that could break out of the href="" attribute.
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
export const CAL_BOOKING_URL = normalizeCalBookingUrl(process.env.CAL_BOOKING_URL)
async function htmlPage(path: string, extraHeaders?: Record<string, string>): Promise<Response> {
  if (!_htmlCache.has(path)) {
    const raw = await Bun.file(path).text()
    let out = raw
    if (_PH_KEY) out = out.replaceAll("__POSTHOG_KEY__", _PH_KEY)
    out = out.replaceAll("__CAL_BOOKING_URL__", CAL_BOOKING_URL)
    _htmlCache.set(path, out)
  }
  return new Response(_htmlCache.get(path)!, {
    headers: { "content-type": "text/html; charset=utf-8", ...extraHeaders },
  })
}
function redirect(loc: string, headers: Record<string, string> = {}) { return new Response(null, { status: 302, headers: { Location: loc, ...headers } }) }
function fmtUsd(n: number): string { return "$" + (Number(n) || 0).toFixed(4) }
function renderOpsAdmin(d: {
  totals: { totalCost: number; totalInputTokens: number; totalOutputTokens: number; callCount: number }
  daily: { day: string; cost: number; calls: number }[]
  byProject: { projectId: string | null; projectName: string | null; cost: number; calls: number }[]
  byTypeModel: { type: string; model: string; cost: number; calls: number }[]
  recent: { id: string; createdAt: number; type: string; model: string; actorEmail: string | null; projectId: string | null; inputTokens: number | null; outputTokens: number | null; costUsd: number | null; ok: boolean }[]
  today: number; cap: number; offset: number
  modelMix: { choices: { id: string; label: string; price: string; weight: number; pct: number }[] }
  testOtp: { gate: TestOtpGate; uses: TestOtpUse[]; envOn: boolean; envEmails: string }
}): string {
  const maxDaily = Math.max(0.0001, ...d.daily.map(x => x.cost))
  const bars = d.daily.slice().reverse().map(x => {
    const h = Math.round((x.cost / maxDaily) * 100)
    return `<div class="bar" title="${escapeHtml(x.day)} · ${fmtUsd(x.cost)} · ${x.calls} calls"><i style="height:${h}%"></i><small>${escapeHtml(x.day.slice(5))}</small></div>`
  }).join("")
  const projRows = d.byProject.map(p =>
    `<tr><td>${escapeHtml(p.projectName || p.projectId || "—")}</td><td class="r">${fmtUsd(p.cost)}</td><td class="r">${p.calls}</td></tr>`).join("") || `<tr><td colspan="3">No data</td></tr>`
  const tmRows = d.byTypeModel.map(t =>
    `<tr><td>${escapeHtml(t.type)}</td><td>${escapeHtml(t.model)}</td><td class="r">${fmtUsd(t.cost)}</td><td class="r">${t.calls}</td></tr>`).join("") || `<tr><td colspan="4">No data</td></tr>`
  const recRows = d.recent.map(c => {
    const when = new Date(c.createdAt).toISOString().replace("T", " ").slice(0, 19)
    return `<tr><td>${escapeHtml(when)}</td><td>${escapeHtml(c.type)}</td><td>${escapeHtml(c.actorEmail || "—")}</td><td>${escapeHtml(c.projectId || "—")}</td><td class="r">${c.inputTokens ?? "—"}/${c.outputTokens ?? "—"}</td><td class="r">${c.costUsd != null ? fmtUsd(c.costUsd) : "—"}</td></tr>`
  }).join("") || `<tr><td colspan="6">No calls yet</td></tr>`
  const prev = d.offset > 0 ? `<a href="/opsadmin?offset=${Math.max(0, d.offset - 50)}">← newer</a>` : ""
  const next = d.recent.length === 50 ? `<a href="/opsadmin?offset=${d.offset + 50}">older →</a>` : ""
  const todayPct = Math.min(100, Math.round((d.today / Math.max(0.0001, d.cap)) * 100))
  // ── Test-OTP gate (KLAVITYKLA-304) ── runtime toggle + expiry + bypass-login audit view.
  const tGate = d.testOtp.gate
  const tActive = tGate.enabledUntil > Date.now()
  const tUntil = tActive ? new Date(tGate.enabledUntil).toISOString().replace("T", " ").slice(0, 19) + " UTC" : ""
  const tMinsLeft = tActive ? Math.max(1, Math.round((tGate.enabledUntil - Date.now()) / 60000)) : 0
  const tStatus = tActive
    ? `<b style="color:#f59e0b">ENABLED</b> until ${escapeHtml(tUntil)} (${tMinsLeft} min left)`
    : `<b style="color:#22c55e">Disabled</b>`
  const tEmails = tGate.emails.length ? tGate.emails.map(escapeHtml).join(", ") : "—"
  const tDurOpts = TEST_OTP_DURATIONS_H.map((h) => `<option value="${h}">${h} hour${h === 1 ? "" : "s"}</option>`).join("")
  const tUseRows = d.testOtp.uses.map((u) => {
    const when = new Date(u.createdAt).toISOString().replace("T", " ").slice(0, 19)
    return `<tr><td>${escapeHtml(when)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(u.via)}</td><td>${escapeHtml(u.ip || "\u2014")}</td></tr>`
  }).join("") || `<tr><td colspan="4">No bypass logins recorded</td></tr>`
  const tEnvNote = d.testOtp.envOn
    ? `<p class="sub" style="margin:8px 0 0;color:#f59e0b">KLAV_TEST_OTP is ALSO set in the environment (allowlist: ${escapeHtml(d.testOtp.envEmails || "none")}). That bootstrap override never expires and can only be removed by editing the env — use it for local dev only.</p>`
    : `<p class="sub" style="margin:8px 0 0">KLAV_TEST_OTP is not set in the environment. This toggle is the only way the bypass can be active here.</p>`
  return `<!doctype html><html><head><meta charset="utf-8"><title>Klavity Ops</title>
<style>
  :root{--bg:#0b0c10;--card:#15171e;--ink:#e8eaf0;--mut:#9aa3b2;--line:#262a35;--accent:#6366f1}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,sans-serif}
  .wrap{max-width:1040px;margin:0 auto;padding:32px 20px}
  h1{font-size:20px;margin:0 0 4px}.sub{color:var(--mut);margin:0 0 24px}
  .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}
  .card b{display:block;font-size:22px}.card span{color:var(--mut);font-size:12px}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;margin-bottom:20px}
  .panel h2{font-size:14px;margin:0 0 12px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em}
  table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)}
  th{color:var(--mut);font-weight:600}.r{text-align:right;font-variant-numeric:tabular-nums}
  .chart{display:flex;align-items:flex-end;gap:4px;height:140px}
  .bar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
  .bar i{display:block;width:70%;background:var(--accent);border-radius:3px 3px 0 0;min-height:2px}
  .bar small{color:var(--mut);font-size:9px;margin-top:4px;transform:rotate(-45deg);white-space:nowrap}
  .meter{height:8px;background:var(--line);border-radius:4px;overflow:hidden;margin-top:8px}
  .meter i{display:block;height:100%;background:var(--accent)}
  .pager{margin-top:10px;display:flex;gap:16px}.pager a{color:var(--accent);text-decoration:none}
  input[type=number]{background:#0b0c10;color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:4px 6px;width:80px;text-align:right}
  button{background:var(--accent);color:#fff;border:0;border-radius:6px;padding:8px 14px;font-weight:600;cursor:pointer}
  .tabs{display:flex;gap:8px;margin-bottom:24px;border-bottom:1px solid var(--line);padding-bottom:0}
  .tab-btn{background:none;border:none;border-bottom:2px solid transparent;color:var(--mut);font:600 13px/1 system-ui,sans-serif;padding:8px 16px 10px;cursor:pointer;border-radius:0;margin-bottom:-1px}
  .tab-btn.active{color:var(--accent);border-bottom-color:var(--accent)}
  .tab-btn:hover:not(.active){color:var(--ink)}
  #growth-loading{color:var(--mut);padding:48px 0;text-align:center}
</style></head><body><div class="wrap">
  <h1>Ops</h1><p class="sub">Private to ops admins.</p>
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('ai')">AI Credits</button>
    <button class="tab-btn" onclick="switchTab('growth')">Growth</button>
    <button class="tab-btn" onclick="switchTab('testotp')">Test-OTP${tActive ? " \u25cf" : ""}</button>
  </div>
  <div id="tab-ai">
  <div class="cards">
    <div class="card"><b>${fmtUsd(d.totals.totalCost)}</b><span>Total spend</span></div>
    <div class="card"><b>${d.totals.callCount}</b><span>Total calls</span></div>
    <div class="card"><b>${d.totals.totalInputTokens.toLocaleString()}</b><span>Input tokens</span></div>
    <div class="card"><b>${d.totals.totalOutputTokens.toLocaleString()}</b><span>Output tokens</span></div>
  </div>
  <div class="panel"><h2>Model mix</h2>
    <p class="sub" style="margin:-4px 0 12px">Relative weights — each AI call picks a model at random by weight. Set 0 to disable. Saved live (no redeploy).</p>
    <form method="POST" action="/opsadmin/model-mix">
      <table><thead><tr><th>Model</th><th>Price in/out /Mtok</th><th class="r">Weight</th><th class="r">Share</th></tr></thead><tbody>
      ${d.modelMix.choices.map(c => `<tr><td>${escapeHtml(c.label)}<br><small class="sub">${escapeHtml(c.id)}</small></td><td class="sub">${escapeHtml(c.price)}</td><td class="r"><input type="number" name="${escapeHtml(c.id)}" value="${c.weight}" min="0" step="1"></td><td class="r">${c.pct}%</td></tr>`).join("")}
      </tbody></table>
      <div style="margin-top:12px"><button type="submit">Save mix</button></div>
    </form>
  </div>
  <div class="panel"><h2>Today vs daily cap</h2>
    <div>${fmtUsd(d.today)} <span style="color:var(--mut)">/ ${fmtUsd(d.cap)} (${todayPct}%)</span></div>
    <div class="meter"><i style="width:${todayPct}%"></i></div>
    <p class="sub" style="margin:8px 0 0">Enforced server-side — AI calls fail closed once today's spend reaches the cap.</p>
  </div>
  <div class="panel"><h2>Daily spend (30d)</h2><div class="chart">${bars || '<span class="sub">No data</span>'}</div></div>
  <div class="panel"><h2>By project</h2><table><thead><tr><th>Project</th><th class="r">Cost</th><th class="r">Calls</th></tr></thead><tbody>${projRows}</tbody></table></div>
  <div class="panel"><h2>By type &amp; model</h2><table><thead><tr><th>Type</th><th>Model</th><th class="r">Cost</th><th class="r">Calls</th></tr></thead><tbody>${tmRows}</tbody></table></div>
  <div class="panel"><h2>Recent calls</h2><table><thead><tr><th>When (UTC)</th><th>Type</th><th>Actor</th><th>Project</th><th class="r">In/Out tok</th><th class="r">Cost</th></tr></thead><tbody>${recRows}</tbody></table>
    <div class="pager">${prev}${next}</div>
  </div>
  </div><!-- /tab-ai -->
  <div id="tab-growth" style="display:none">
    <div id="growth-loading">Loading growth scorecard...</div>
    <div id="growth-content" style="display:none">
      <div class="panel">
        <h2>Weekly GTM Scorecard — last 8 weeks</h2>
        <p class="sub" style="margin:-4px 0 14px;font-size:12px">Reach=check_started · Runs=check_completed · Leads=lead_captured · Activ=app_connected/continuous_enabled · Paid=subscription_created · MRR est from plan price · D30=still active after 30d</p>
        <div id="growth-table" style="overflow-x:auto"></div>
      </div>
    </div>
  </div><!-- /tab-growth -->
  <div id="tab-testotp" style="display:none">
    <div class="panel">
      <h2>Test-OTP gate</h2>
      <p class="sub" style="margin:-4px 0 12px">When enabled, the fixed code <code>${escapeHtml(TEST_OTP_CODE)}</code> logs in any allowlisted email (and any registered Test Account email) without an emailed code. Always time-boxed: it turns itself off at the expiry with no restart.</p>
      <div style="margin-bottom:14px">Status: ${tStatus}<br><span class="sub">Allowlist: ${tEmails}</span></div>
      <form method="POST" action="/opsadmin/test-otp">
        <input type="hidden" name="action" value="enable">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <input type="text" name="emails" placeholder="tester@example.com, other@example.com" value="${escapeHtml(tGate.emails.join(", "))}" style="flex:1;min-width:260px;background:#0b0c10;color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:8px 10px">
          <select name="hours" style="background:#0b0c10;color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:8px 10px">${tDurOpts}</select>
          <button type="submit">${tActive ? "Extend / update" : "Enable"}</button>
        </div>
      </form>
      ${tActive ? `<form method="POST" action="/opsadmin/test-otp" style="margin-top:10px"><input type="hidden" name="action" value="disable"><button type="submit" style="background:#374151">Disable now</button></form>` : ""}
      ${tEnvNote}
    </div>
    <div class="panel"><h2>[TEST-OTP-USED] recent bypass logins</h2>
      <table><thead><tr><th>When (UTC)</th><th>Email</th><th>Via</th><th>IP</th></tr></thead><tbody>${tUseRows}</tbody></table>
    </div>
  </div><!-- /tab-testotp -->
</div>
<script>
var _growthLoaded=false;
var _tabs=['ai','growth','testotp'];
function switchTab(t){
  var btns=document.querySelectorAll('.tab-btn');
  for(var i=0;i<_tabs.length;i++){
    var el=document.getElementById('tab-'+_tabs[i]);
    if(el)el.style.display=_tabs[i]===t?'':'none';
    if(btns[i])btns[i].classList.toggle('active',_tabs[i]===t);
  }
  if(t==='growth'&&!_growthLoaded){_growthLoaded=true;_loadGrowth();}
}
async function _loadGrowth(){
  try{
    var r=await fetch('/api/opsadmin/growth');
    if(!r.ok)throw new Error('HTTP '+r.status);
    var d=await r.json();
    _renderGrowth(d);
  }catch(e){
    document.getElementById('growth-loading').textContent='Failed to load: '+e;
  }
}
function _renderGrowth(d){
  var rows=d.weeks||[];
  if(!rows.length){document.getElementById('growth-loading').textContent='No data yet.';return;}
  var h='<table><thead><tr><th>Week</th><th class="r">Reach</th><th class="r">Runs</th><th class="r">Compl%</th><th class="r">Leads</th><th class="r">Activ%</th><th class="r">New Paid</th><th class="r">MRR+</th><th class="r">D30 Ret%</th><th>Best Chan</th></tr></thead><tbody>';
  for(var i=0;i<rows.length;i++){
    var w=rows[i];
    h+='<tr><td>'+_e(w.week)+'</td>'
      +'<td class="r">'+w.reach+'</td>'
      +'<td class="r">'+w.runs+'</td>'
      +'<td class="r">'+_e(w.completionPct)+'</td>'
      +'<td class="r">'+w.leads+'</td>'
      +'<td class="r">'+_e(w.activationPct)+'</td>'
      +'<td class="r">'+w.newPaid+'</td>'
      +'<td class="r">'+(w.mrrUsd>0?'$'+w.mrrUsd:'—')+'</td>'
      +'<td class="r">'+_e(w.d30RetainedPct)+'</td>'
      +'<td>'+_e(w.bestChannel)+'</td></tr>';
  }
  h+='</tbody></table>';
  document.getElementById('growth-table').innerHTML=h;
  document.getElementById('growth-loading').style.display='none';
  document.getElementById('growth-content').style.display='';
}
function _e(s){return String(s||'').replace(/[<>&"]/g,function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]||c;});}
</script>
</body></html>`
}
async function sessionEmail(req: Request): Promise<string | null> {
  if (!db) return null
  const sid = parseCookies(req.headers.get("cookie"))["klav_session"]
  if (!sid) return null
  return getSession(sid)
}
// Identify a request authenticated by an `Authorization: Bearer <token>` header (the extension).
// Bearer credentials MUST be a dedicated narrow-scope extension token (ext_…) — the raw session id is
// no longer accepted here (M2). First-party browser requests authenticate via the HttpOnly cookie.
async function bearerEmail(req: Request): Promise<string | null> {
  const h = req.headers.get("authorization") || ""
  const m = h.match(/^Bearer\s+(.+)$/i)
  if (!m || !db) return null
  // M2 closed: only dedicated, revocable extension tokens (`ext_…`) are accepted as Bearer credentials.
  // The raw session id is no longer honored as a Bearer — it remains valid only as a first-party
  // HttpOnly cookie via sessionEmail(). A leaked Bearer is now always narrow-scope and revocable.
  const info = await getExtensionTokenInfo(m[1])
  if (!info) return null
  // F5: if this token is bound to a project (widget token), record it so resolveProject constrains the
  // request to that project. Account-wide extension tokens (projectId null) leave the context unset.
  const ctx = reqCtx.getStore(); if (ctx) ctx.boundProject = info.projectId ?? null
  return info.email
}

// Resolve the project a request targets: explicit ?project=:id if accessible, else the caller's
// first accessible project. Returns null if the caller has no accessible project. Gated by projectAccess.
async function resolveProject(email: string, requested?: string | null): Promise<{ id: string; access: 'admin' | 'member' } | null> {
  // F5: a project-bound Bearer token may ONLY act on its bound project. Reject a mismatched explicit
  // request, and force the bound project when none was requested — so a leaked widget token can't reach
  // the owner's other projects via ?project= or the first-project fallback.
  const bound = reqCtx.getStore()?.boundProject
  if (bound) {
    if (requested && requested !== bound) return null
    const a = await projectAccess(email, bound)
    return a ? { id: bound, access: a } : null
  }
  if (requested) {
    const a = await projectAccess(email, requested)
    if (a) return { id: requested, access: a }
    return null
  }
  const projects = await listProjects(email)
  for (const p of projects) {
    const a = await projectAccess(email, p.id)
    if (a) return { id: p.id, access: a }
  }
  return null
}

// ── KLA-306/307: flag-gated free-plan quota enforcement ────────────────────────────────────────
// ONLY active when KLAV_BILLING_ENFORCEMENT=1 (default OFF — shipping this changes NO prod
// behavior). Checks the account plan's PLAN_QUOTAS limit for one metric at the two creation choke
// points (POST /api/projects, POST /api/personas). `count` is a lazy getter so the counting query
// only runs when enforcement is actually on. A null quota = unlimited. Returns the 402 payload to
// send (caller wraps in json()/wjson() to keep the right CORS behavior per route), or null to allow.
async function quotaExceeded(accountId: string, kind: "projects" | "sims", count: () => Promise<number>): Promise<{ error: string; code: "quota_exceeded"; upgradeUrl: string } | null> {
  if (!billingEnforcementEnabled()) return null
  const plan = normalizePlan(await accountPlan(accountId))
  const limit = PLAN_QUOTAS[plan][kind]
  if (limit == null) return null
  if ((await count()) < limit) return null
  const noun = kind === "projects" ? (limit === 1 ? "project" : "projects") : (limit === 1 ? "Sim" : "Sims")
  return {
    error: `Your ${plan} plan includes ${limit} ${noun} — upgrade to add more.`,
    code: "quota_exceeded",
    upgradeUrl: "/dashboard?upgrade=pro",
  }
}

// ── /api/sim/review dedupe cache (§5: promote the klav_dev_react_* hash). In-process LRU-ish set keyed
// by reviewDedupeKey(sim,urlPath,domSig); a page isn't re-reviewed for a Sim until its DOM sig changes.
// Bounded so it can't grow unbounded across a long-lived SW; eviction is best-effort (dedupe is a cost
// guard, not a correctness gate — a miss at worst spends one extra budgeted review).
const REVIEW_SEEN = new Map<string, number>()
const REVIEW_SEEN_MAX = 5000
const REVIEW_SEEN_TTL = 6 * 60 * 60 * 1000 // 6h
function reviewSeen(key: string): boolean {
  const t = REVIEW_SEEN.get(key)
  if (t == null) return false
  if (Date.now() - t > REVIEW_SEEN_TTL) { REVIEW_SEEN.delete(key); return false }
  return true
}
function markReviewSeen(key: string) {
  if (REVIEW_SEEN.size >= REVIEW_SEEN_MAX) {
    // drop the oldest ~10% (insertion order ≈ age) to bound memory.
    let n = Math.ceil(REVIEW_SEEN_MAX * 0.1)
    for (const k of REVIEW_SEEN.keys()) { REVIEW_SEEN.delete(k); if (--n <= 0) break }
  }
  REVIEW_SEEN.set(key, Date.now())
}

// Decode a data: URL (e.g. captureVisibleTab's "data:image/png;base64,…") → bytes + media type +
// the raw base64 payload (so the vision call can reuse it without re-encoding multi-MB arrays, which
// would overflow the call stack via String.fromCharCode(...)).
function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string; base64: string } | null {
  const m = String(dataUrl || "").match(/^data:([^;,]+)?(;base64)?,(.*)$/s)
  if (!m) return null
  const contentType = m[1] || "image/png"
  const isB64 = !!m[2]
  const data = m[3] || ""
  try {
    const bytes = isB64 ? Uint8Array.from(atob(data), (c) => c.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(data))
    const base64 = isB64 ? data : Buffer.from(bytes).toString("base64")
    return { bytes, contentType, base64 }
  } catch { return null }
}

// Path-only URL split (privacy by structure, §5c): {host, path} with query+fragment stripped.
function splitUrl(pageUrl: string): { urlHost: string | null; urlPath: string | null } {
  if (!pageUrl) return { urlHost: null, urlPath: null }
  try { const u = new URL(pageUrl); return { urlHost: u.host, urlPath: u.pathname } }
  catch { return { urlHost: null, urlPath: pageUrl.split(/[?#]/)[0] || null } }
}

// Normalize a persona accent to a strict #rrggbb hex, falling back to brand indigo (H5/LLM05).
// `accent` is often model-generated and is interpolated into a style attribute in the dashboard —
// validating it here is the primary defense against a colour value that breaks out of the attribute.
function normAccent(v: unknown): string {
  const s = String(v ?? "")
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : "#6366f1"
}

// v3 persona classification enums (mirror EXTRACT_SYS). Anything off-enum → null.
const SIM_CLASS_ENUM = new Set(["client", "user"])
const SIDE_ENUM = new Set(["external", "internal"])
// Normalize a POST/PUT /api/personas body into the v3 persona fields the DB expects:
// { type (legacy shim), simClass, side, core|null }. simClass/side are validated against their
// enums; core is assembled only when the body carries one. The legacy `type` (client|internal) is
// derived from simClass/side when present so pre-v3 consumers keep working, else falls back to body.type.
function v3PersonaFields(body: any): { type: string; simClass: string | null; side: string | null; core: import("./lib/db").PersonaCore | null } {
  const simClass = SIM_CLASS_ENUM.has(String(body?.simClass)) ? String(body.simClass) : null
  const side = SIDE_ENUM.has(String(body?.side)) ? String(body.side) : null
  // Legacy type shim: client-class OR external-side → "client"; a user/internal persona → "internal".
  let type: string
  if (simClass) type = simClass === "client" ? "client" : "internal"
  else if (side) type = side === "external" ? "client" : "internal"
  else type = body?.type === "internal" ? "internal" : "client"
  const c = body?.core
  const core = c && typeof c === "object"
    ? {
        goals: Array.isArray(c.goals) ? c.goals.map((x: any) => String(x)) : [],
        expertise: c.expertise != null ? String(c.expertise) : "",
        temperament: c.temperament != null ? String(c.temperament) : "",
        voice: c.voice != null ? String(c.voice) : "",
        watchFor: Array.isArray(c.watchFor) ? c.watchFor.map((x: any) => String(x)) : [],
      }
    : null
  return { type, simClass, side, core }
}

// A.8: render a RecurrenceMemory's occurrence receipts as an exportable/quotable timeline block —
// each occurrence's OWN wording + date, e.g.
//   This issue was reported 3 times:
//   • Jun 10: "checkout button does nothing"
//   • Jul 3: "STILL can't check out"
// Returns "" when there's nothing worth quoting (single occurrence). Used in connector export text
// AND surfaced to the dashboard "Copy timeline" action.
function occurrenceTimelineText(mem: RecurrenceMemory | null): string {
  if (!mem) return ""
  const occ = (mem.occurrences || []).filter((o) => (o.observation || "").trim())
  if (occ.length < 2) return ""
  const day = (ms: number) => new Date(ms).toISOString().slice(0, 10)
  const lines = occ.map((o) => `• ${day(o.seenAt)}: "${String(o.observation).trim().replace(/\s+/g, " ").slice(0, 240)}"`)
  return `This issue was reported ${occ.length} times:\n${lines.join("\n")}`
}

// Build a normalized TicketPayload from a feedback row for the connector adapters. Async because it
// resolves the screenshot into a permanent signed link (body fallback) + bytes (for native attachment).
async function feedbackToTicketPayload(fb: any, project: { id: string; name?: string }, simName: string | null = null): Promise<TicketPayload> {
  const title = fb.observation || "Sim report"
  const lines: string[] = []
  if (fb.observation) lines.push(fb.observation)
  if (simName) lines.push(`Sim: ${simName}`)
  else if (fb.simId) lines.push(`Sim: ${fb.simId}`)
  // Source site = the embed page (host + path). Prefer the stored host so the external ticket shows
  // WHICH site the report came from, not just the path.
  const urlVal = fb.urlHost ? `${fb.urlHost}${fb.urlPath || ""}` : (fb.pageUrl ?? fb.urlPath ?? null)
  if (urlVal) lines.push(`URL: ${urlVal}`)
  // Where the visitor came from (document.referrer), when captured.
  if (fb.sourceReferrer) lines.push(`Referred from: ${fb.sourceReferrer}`)
  // JTBD 2.16: resolve the ticket's Klavity labels so the export carries the classification.
  // Passed as the structured `labels` field on the payload; each connector surfaces them in its
  // own idiomatic way (GitHub/Jira native label field, Plane/Linear description line, webhook
  // structured array) — see the connector adapters. Best-effort; never blocks the export.
  let labelNames: string[] = []
  if (fb.id) {
    try {
      labelNames = (await labelsForFeedback(String(fb.id))).map((l: any) => String(l.name)).filter(Boolean)
    } catch (e: any) { console.warn("label lookup failed for ticket payload (non-fatal):", e?.message || e) }
  }
  // G2/G3/G5: append captured dev-tools context (console + network + env + identity/metadata) so the
  // external ticket carries the same technical context the extension path does.
  if (fb.clientContext) {
    const ctxLines = clientContextLines(fb.clientContext)
    if (ctxLines.length) lines.push(ctxLines.join("\n"))
  }
  // Screenshot: connectors natively attach `bytes` when they can; the permanent `url` is the body
  // fallback so the image shows even if native upload is unavailable/fails. Best-effort — a failure
  // here must never block the ticket. Only the feedback's primary screenshot is carried.
  const attachments: TicketAttachment[] = []
  if (fb.screenshotId) {
    try {
      const shot = await screenshotById(fb.screenshotId)
      if (shot) {
        const url = `${BASE}/img/${signImageToken(shot.id)}`
        lines.push(`Screenshot: ${url}`)
        try {
          const { bytes, contentType } = await getObjectBytes(shot.s3Key)
          const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png"
          attachments.push({ filename: `screenshot.${ext}`, contentType, bytes, url })
        } catch (e: any) { console.warn("attachment bytes fetch failed (link still in body):", e?.message || e) }
      }
    } catch (e: any) { console.warn("screenshot lookup failed for ticket:", e?.message || e) }
  }
  // A.8: occurrence timeline — when this report recurred, append each occurrence's own verbatim
  // wording + date so the external ticket carries the receipts ("you said X on Y, then Y2, then Y3").
  // Best-effort: a memory lookup failure must never block the export.
  if (db && (fb.id || fb.projectId)) {
    try {
      const mem = await buildRecurrenceMemory(db, String(fb.id), String(fb.projectId))
      const tl = occurrenceTimelineText(mem)
      if (tl) lines.push(tl)
    } catch (e: any) { console.warn("occurrence timeline for export skipped (non-fatal):", e?.message || e) }
  }
  lines.push("Filed by Klavity")
  const body = lines.join("\n\n")
  return {
    title,
    body,
    priority: fb.priority ?? null,
    url: urlVal,
    simName,
    createdAt: fb.createdAt,
    klavityUrl: `${BASE}/dashboard?project=${project.id}`,
    attachments,
    labels: labelNames,
  }
}

// Resolve a Sim's display name from its id (best-effort; null if unknown). Used to enrich
// both the manual export and the auto-copy payloads so external tickets show "Sim: <name>".
async function resolveSimName(projectId: string, simId: string | null | undefined): Promise<string | null> {
  if (!simId) return null
  try { return (await listPersonas(projectId)).find((p) => p.id === simId)?.name ?? null } catch { return null }
}

// Redact secret fields in a connector config for client responses.
// For each connector field marked secret, replaces value with "" and adds has<Key>=true.
function redactConnectorConfig(type: string, config: Record<string, string>): Record<string, any> {
  const connector = getConnector(type)
  if (!connector) return config
  const out: Record<string, any> = { ...config }
  for (const f of connector.fields) {
    if (f.secret) {
      const hasKey = "has" + f.key.charAt(0).toUpperCase() + f.key.slice(1)
      out[hasKey] = !!(config[f.key])
      out[f.key] = ""
    }
  }
  return out
}

// Format a connector row for a client response (always redacted).
// Also derives + attaches connector health from the heartbeat fields stored in config.
function connectorToClient(c: any): Record<string, any> {
  const health = deriveHealth(c.config || {})
  return {
    id: c.id,
    type: c.type,
    name: c.name,
    autoCopy: c.autoCopy,
    enabled: c.enabled,
    config: redactConnectorConfig(c.type, c.config),
    createdAt: c.createdAt,
    health: {
      status: health.status,
      lastOutboundAt: health.lastOutboundAt,
      lastInboundAt: health.lastInboundAt,
      lastErrorAt: health.lastErrorAt,
      lastError: health.lastError,
    },
  }
}

// OTP throttling knobs (H1). Windows are per-process; see lib/ratelimit.ts.
const OTP_REQ_WINDOW = 15 * 60 * 1000  // 15 min
const OTP_REQ_PER_EMAIL = 5            // code requests per email / window
const OTP_REQ_PER_IP = 30             // code requests per IP / window (shared NAT headroom)
const OTP_FAIL_WINDOW = 15 * 60 * 1000
const OTP_FAIL_MAX = 5                 // wrong codes per (email,IP) before lockout
// IP-INDEPENDENT per-email lockout (H1/A07): the per-(email,IP) counter alone is defeated by an
// attacker rotating X-Forwarded-For (or genuinely distributing source IPs) to get a fresh 5-attempt
// budget and brute-force the 6-digit code. This second counter caps total wrong codes per email
// regardless of source IP, so the email's brute-force surface is bounded end-to-end.
const OTP_FAIL_EMAIL_WINDOW = 15 * 60 * 1000
const OTP_FAIL_EMAIL_MAX = 10          // wrong codes per email / window across ALL IPs before lockout

// LLM-endpoint abuse limits (M5/LLM10). /api/transcripts fires two LLM calls and was previously
// unbudgeted/unbounded — cap the input size and rate per user+project.
const TRANSCRIPT_MAX_CHARS = 100_000   // ~25k tokens; reject larger payloads outright
const TRANSCRIPT_WINDOW = 60 * 60 * 1000
const TRANSCRIPT_PER_USER = 30         // transcript submissions per user / hour
const TRANSCRIPT_PER_PROJECT = 60      // per project / hour

const AUTOSIM_AUTH_CONFIG_MAX_BODY = 16 * 1024
const AUTOSIM_AUTH_CONFIG_WINDOW = 60 * 60 * 1000
const AUTOSIM_AUTH_CONFIG_PER_IP = 30
const AUTOSIM_AUTH_CONFIG_PER_TOKEN = 10

const BILLING_WINDOW = 60 * 60 * 1000
const BILLING_PER_USER = 20
const BILLING_WEBHOOK_MAX_BYTES = 256 * 1024

function effectivePlanForStripeStatus(plan: string | null, status: string | null): string {
  const normalized = plan === "pro" || plan === "team" || plan === "founding" || plan === "scale" ? plan : "free"
  return status === "active" || status === "trialing" ? normalized : "free"
}

async function accountIdFromStripeSubscriptionObject(sub: any): Promise<string | null> {
  const metaAccount = sub?.metadata?.account_id ? String(sub.metadata.account_id) : ""
  if (metaAccount) return metaAccount
  const subId = sub?.id ? String(sub.id) : ""
  if (subId) {
    const bySub = await accountIdForStripeSubscription(subId)
    if (bySub) return bySub
  }
  const customer = sub?.customer ? String(sub.customer) : ""
  return customer ? accountIdForStripeCustomer(customer) : null
}

// KLAVITYKLA-336: invoice events (invoice.paid / invoice.payment_failed) carry the subscription +
// customer but never account_id metadata — resolve the same way as accountIdFromStripeSubscriptionObject
// minus the metadata step (invoices don't have their own metadata.account_id in our flow).
async function accountIdFromStripeInvoiceObject(invoice: any): Promise<string | null> {
  const subId = invoice?.subscription ? String(invoice.subscription) : ""
  if (subId) {
    const bySub = await accountIdForStripeSubscription(subId)
    if (bySub) return bySub
  }
  const customer = invoice?.customer ? String(invoice.customer) : ""
  return customer ? accountIdForStripeCustomer(customer) : null
}

// fallbackAccountId: used by the hosted-Payment-Link checkout path (KLAVITYKLA-336), where the
// subscription carries no account_id metadata (Payment Links don't set subscription_data metadata)
// and the account was just resolved/provisioned by email instead.
async function applyStripeSubscriptionState(sub: any, fallbackAccountId?: string | null): Promise<void> {
  const accountId = (await accountIdFromStripeSubscriptionObject(sub)) || fallbackAccountId || null
  if (!accountId) throw new Error("Stripe subscription is missing account_id metadata")
  const price = sub?.items?.data?.[0]?.price
  const resolvedPlan = planFromPrice(price) || (sub?.metadata?.plan ? String(sub.metadata.plan) : null)
  const interval = intervalFromPrice(price) || (sub?.metadata?.interval ? normalizeInterval(String(sub.metadata.interval)) : null)
  const status = sub?.status ? String(sub.status) : null
  await updateAccountBillingState(accountId, {
    plan: effectivePlanForStripeStatus(resolvedPlan, status),
    stripeCustomerId: sub?.customer ? String(sub.customer) : null,
    stripeSubscriptionId: sub?.id ? String(sub.id) : null,
    billingStatus: status,
    billingInterval: interval,
    billingCurrentPeriodEnd: sub?.current_period_end ? Number(sub.current_period_end) * 1000 : null,
    billingCancelAtPeriodEnd: !!sub?.cancel_at_period_end,
  })
}

// KLAVITYKLA-336: resolve the account for a hosted Payment-Link checkout.session.completed — these
// have NO account_id metadata (unlike our own /api/billing/checkout sessions, which always set
// metadata.account_id / client_reference_id). Fall back to the buyer's checkout email: reuse an
// existing account owned by that email, or provision a brand-new one so a cold Payment-Link buyer
// still gets entitled without ever visiting the dashboard first.
async function resolveOrProvisionAccountForCheckoutSession(session: any): Promise<string | null> {
  const email = session?.customer_details?.email ? String(session.customer_details.email).trim().toLowerCase() : ""
  if (!email) return null
  const existing = await accountIdForOwnerEmail(email)
  if (existing) return existing
  const memberships = await ensureAccount(email)
  return memberships[0]?.workspaceId || null
}

// Returns the accountId the session was applied to (or null if the session was ignored/unmappable) so
// the caller can decide whether to log a subscription_created funnel event.
async function applyStripeCheckoutSession(session: any): Promise<string | null> {
  const directAccountId = session?.metadata?.account_id || session?.client_reference_id
  const subscriptionId = session?.subscription ? String(session.subscription) : ""
  const sub = subscriptionId ? await retrieveStripeSubscription(subscriptionId) : null

  if (directAccountId) {
    // Our own /api/billing/checkout flow — always carries account_id metadata.
    if (sub) {
      await applyStripeSubscriptionState(sub, String(directAccountId))
      return String(directAccountId)
    }
    const plan = session?.metadata?.plan ? String(session.metadata.plan) : "free"
    await updateAccountBillingState(String(directAccountId), {
      plan,
      stripeCustomerId: session?.customer ? String(session.customer) : null,
      stripeSubscriptionId: null,
      billingStatus: "checkout_completed",
      billingInterval: session?.metadata?.interval ? normalizeInterval(String(session.metadata.interval)) : null,
      billingCurrentPeriodEnd: null,
      billingCancelAtPeriodEnd: false,
    })
    return String(directAccountId)
  }

  // Hosted Payment Link (no account_id metadata). Only treat this as ours when it's explicitly
  // tagged (metadata.plan === "klavity", set on the Payment Link) or the purchased price resolves to
  // a known Klavity price ID — anything else (WALI / other Stripe products on the same account) is
  // ignored. NEVER throw here: an unmappable session must still 200 so Stripe doesn't retry forever.
  const price = sub?.items?.data?.[0]?.price
  const isKlavitySession = session?.metadata?.plan === "klavity" || !!planFromPrice(price)
  if (!isKlavitySession) {
    console.warn("[billing webhook] ignoring non-klavity checkout.session.completed", session?.id)
    return null
  }
  if (!sub) {
    console.warn("[billing webhook] klavity Payment-Link session has no subscription to apply", session?.id)
    return null
  }
  const accountId = await resolveOrProvisionAccountForCheckoutSession(session)
  if (!accountId) {
    console.warn("[billing webhook] could not resolve/provision account for Payment-Link session", session?.id)
    return null
  }
  await applyStripeSubscriptionState(sub, accountId)
  return accountId
}

// Auto-copy flood cap (M6): max external tickets auto-filed per project per hour.
const AUTOCOPY_WINDOW = 60 * 60 * 1000
const AUTOCOPY_PER_PROJECT = 60

// Priority rank: higher number = higher priority. Used for min-priority threshold checks.
const PRIORITY_RANK: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }

// Returns true when the feedback's effective priority meets the connector's minimum threshold.
// If the connector has no `auto_copy_min_priority` config key (or an unrecognised value),
// EVERY priority passes (backward-compatible: existing connectors copy everything).
// `effectivePriority` is the priority on the feedback row at the time of triage-accept.
function priorityMeetsThreshold(effectivePriority: string | null | undefined, connectorConfig: Record<string, string>): boolean {
  const minKey = connectorConfig["auto_copy_min_priority"]
  if (!minKey || !(minKey in PRIORITY_RANK)) return true  // no threshold — pass all
  const feedbackRank = effectivePriority && effectivePriority in PRIORITY_RANK ? PRIORITY_RANK[effectivePriority] : 1
  return feedbackRank >= PRIORITY_RANK[minKey]
}

// Auto-copy a triaged/accepted feedback row to every enabled auto-copy connector on its project.
// TRIAGE-GATED: this function is ONLY called when a report is triage-accepted (status transitions
// to "open"). It is NOT called on raw submit. Each connector may carry an `auto_copy_min_priority`
// key in its config JSON; feedback below that threshold is skipped for that connector.
// Fire-and-forget: never blocks the response, never throws. On a successful Plane export it also
// writes plane_issue_key/url back onto the feedback row.
// effectivePriority: caller may pass the priority from the same PATCH request (which may update
// priority and status together). If omitted, the value is read from the persisted row.
// KLAVITYKLA-286 (JTBD 5.7): fire outbound labels/priority sync for a ticket that already has export
// records. Fire-and-forget wrapper around syncFieldsToLinkedIssues — it resolves the ticket's CURRENT
// full label set + priority and pushes them to every linked external issue. Never throws into the
// caller's edit path; field-sync catches all errors and records them as activity events.
//   effectivePriority: pass the priority from the same PATCH (when priority + something else change
//   together); omit to read the persisted row's priority.
function syncTicketFields(feedbackId: string, projectId: string, actor: string | null, effectivePriority?: string | null): void {
  void (async () => {
    try {
      // Resolve current priority: caller-supplied (same edit) wins, else the persisted row.
      let priority: string | null
      if (effectivePriority !== undefined) priority = effectivePriority ?? null
      else {
        const fb = await feedbackById(projectId, feedbackId).catch(() => null)
        priority = fb?.priority ?? null
      }
      const labels = (await labelsForFeedback(feedbackId).catch(() => []))
        .map((l: any) => String(l.name)).filter(Boolean)
      await syncFieldsToLinkedIssues(projectId, feedbackId, { labels, priority }, { actorEmail: actor })
    } catch (e: any) {
      console.warn("[field-sync] syncTicketFields top-level error (non-fatal):", e?.message || e)
    }
  })()
}

function autoCopyFeedback(feedbackId: string, projectId: string, actor: string | null, effectivePriority?: string | null): void {
  void (async () => {
    try {
      const connectors = await listAutoCopyConnectors(projectId)
      if (!connectors.length) return
      // M6/ASI: bound auto-filed tickets per project so a burst of feedback can't flood the tracker.
      if (!rlAllow(`autocopy:${projectId}`, AUTOCOPY_PER_PROJECT, AUTOCOPY_WINDOW)) {
        console.warn(`auto-copy rate cap hit for project ${projectId} — skipping`)
        return
      }
      // Build the SAME rich payload the manual export uses, once, from the persisted row.
      const fb = await feedbackById(projectId, feedbackId)
      if (!fb) return
      // Use caller-supplied priority if provided (same-patch update), else fall back to the row.
      const resolvedPriority = effectivePriority !== undefined ? effectivePriority : fb.priority
      const simName = await resolveSimName(projectId, fb.simId)
      const ticketPayload = await feedbackToTicketPayload(fb, { id: projectId }, simName)
      let trackerWritten = !!fb.planeIssueKey   // don't overwrite a key set manually / by a prior export
      for (const c of connectors) {
        const adapter = getConnector(c.type)
        if (!adapter) continue
        // Triage-gated priority threshold: skip this connector when feedback priority is below the
        // connector's configured minimum. A connector with no `auto_copy_min_priority` passes all.
        if (!priorityMeetsThreshold(resolvedPriority, c.config)) {
          console.log(`[auto-copy] skipping connector ${c.id} (priority ${resolvedPriority || "null"} below threshold ${c.config["auto_copy_min_priority"]})`)
          continue
        }
        // Decrypt secret fields.
        const cfg: Record<string, string> = { ...c.config }
        for (const f of adapter.fields) {
          if (f.secret && c.config[f.key]) {
            try { cfg[f.key] = await decryptSecret(c.config[f.key]) } catch { cfg[f.key] = "" }
          }
        }
        try {
          const result = await adapter.createIssue(ticketPayload, cfg)
          await addTicketExport({
            feedbackId, projectId, connectorId: c.id,
            type: c.type, externalKey: result.externalKey, externalUrl: result.externalUrl,
            // KLA-285: the export succeeded (status stays "ok" so the already-exported guard and the
            // timeline both treat it as filed), but if the native screenshot upload degraded to the
            // body link we record WHY on the row instead of letting it fail invisibly.
            status: "ok", error: result.attachmentWarning ?? null, createdBy: actor,
          })
          // Record successful outbound heartbeat (fire-and-forget, non-fatal).
          touchConnectorHeartbeat(c.id, { kind: "outbound", success: true })
            .catch((e: any) => console.warn("heartbeat record failed (non-fatal):", e?.message || e))
          // Plane is the primary tracker (feedback.plane_issue_*). Backfill it so /dashboard shows
          // the row as filed — this is the bit that was missing for connector auto-copy.
          if (c.type === "plane" && !trackerWritten) {
            try {
              await updateFeedbackTracker(feedbackId, result.externalKey || null, result.externalUrl || null)
              trackerWritten = true
            } catch (e: any) { console.warn("auto-copy tracker writeback failed (non-fatal):", e?.message || e) }
          }
        } catch (e: any) {
          await addTicketExport({
            feedbackId, projectId, connectorId: c.id,
            type: c.type, externalKey: null, externalUrl: null,
            status: "failed", error: e?.message || "auto-copy failed", createdBy: actor,
          })
          // Record failed outbound heartbeat (fire-and-forget, non-fatal).
          touchConnectorHeartbeat(c.id, { kind: "outbound", success: false, error: e?.message || "auto-copy failed" })
            .catch((err: any) => console.warn("heartbeat record failed (non-fatal):", err?.message || err))
        }
      }
    } catch (err: any) {
      console.error("auto-copy hook (non-fatal):", err?.message || err)
    }
  })().catch((err: any) => console.error("auto-copy hook outer (non-fatal):", err?.message || err))
}

// Anonymous feedback rate limits (per hour). Per-IP guards a single abuser; per-project caps the
// total anonymous intake for one project so a leaked project_id can't be used to flood a tenant.
const FEEDBACK_ANON_WINDOW = 60 * 60 * 1000
const FEEDBACK_ANON_PER_IP = 20
const FEEDBACK_ANON_PER_PROJECT = 200

// ── Free-tool analyze cache — KLAVITYKLA-342 ─────────────────────────────────────────────────────
// The bug-check scan MUST be reproducible: re-running the same URL cannot return a different set of
// findings (it did — 0, then 8, then 0). Combined with a pinned model + temperature 0, a short
// in-memory TTL cache makes a re-run within the window byte-identical, and collapses a launch spike
// on one URL to a single LLM call. In-memory on purpose: one box, and staleness beyond a few
// minutes is undesirable anyway (the user is fixing the page).
const ANALYZE_CACHE_TTL_MS = 10 * 60 * 1000
const ANALYZE_CACHE_MAX = 500
const analyzeCache = new Map<string, { at: number; body: any; props: Record<string, unknown> }>()
function analyzeCacheGet(key: string): { body: any; props: Record<string, unknown> } | null {
  const hit = analyzeCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > ANALYZE_CACHE_TTL_MS) { analyzeCache.delete(key); return null }
  return { body: hit.body, props: hit.props }
}
function analyzeCacheSet(key: string, body: any, props: Record<string, unknown>) {
  // Bounded, oldest-first eviction — a Map iterates in insertion order.
  if (analyzeCache.size >= ANALYZE_CACHE_MAX) {
    const oldest = analyzeCache.keys().next().value
    if (oldest !== undefined) analyzeCache.delete(oldest)
  }
  analyzeCache.set(key, { at: Date.now(), body, props })
}

// Legacy AI demo endpoints (/api/persona/brief, /api/extract, /api/react) — each makes an LLM call but
// had no per-user throttle or input cap (only the daily $ cap). Bound them per user/hour + size.
const AI_DEMO_WINDOW = 60 * 60 * 1000
const AI_DEMO_PER_USER = 40            // LLM demo calls per user / hour
const AI_DEMO_MAX_CHARS = 100_000      // brief / site-text char cap
// Transcripts are whole call recordings — a 1-hour meeting is easily >100k chars. The extract model
// (gemini-2.5-flash, ~1M-token context) handles this comfortably, and the per-user hourly throttle +
// daily $ cap already bound abuse, so give transcripts a much larger ceiling than a one-line brief.
const EXTRACT_TRANSCRIPT_MAX_CHARS = 300_000  // ~75k tokens — fits ~2–3 hour meeting transcripts
// Output budget for persona extraction. 4 000 was enough for a 2-persona transcript but truncated
// larger calls (5+ speakers, many insights) → incomplete JSON → 500. gemini-2.5-flash supports up
// to 65 536 output tokens, so 16 000 gives ample headroom for the richest transcripts while keeping
// cost ~4× lower than the ceiling. React/reconcile calls use their own (smaller) budgets.
const EXTRACT_MAX_OUTPUT_TOKENS = 16_000
const AI_DEMO_MAX_IMG_B64 = 12_000_000 // ~9 MB decoded — cap the react screenshot payload
// Throttle key for an AI demo call: prefer the authed email, else the abuse-safe client IP.
function aiDemoLimited(meEmail: string | null, req: Request, server: any): boolean {
  const key = meEmail ? `aidemo:u:${meEmail}` : `aidemo:ip:${clientIp(req, server)}`
  return !rlAllow(key, AI_DEMO_PER_USER, AI_DEMO_WINDOW)
}
// Pre-signup "instant aha" (site/onboarding.html step 0) endpoints, intentionally ANONYMOUS:
// each carries its own protection (aiDemoLimited per-IP throttle, SSRF-guarded safeFetch,
// payload caps) so the blanket /api/* login gate exempts exactly this set — nothing else.
const ANON_AI_DEMO_ROUTES = new Set(["POST /api/persona/site", "POST /api/sim/preview"])

// True when an address is loopback or RFC1918/link-local private — i.e. a trusted reverse proxy on
// the same box (Caddy). Only such a peer may set X-Forwarded-For; a public peer's XFF is forged.
function isTrustedProxyPeer(addr: string | null | undefined): boolean {
  if (!addr) return false
  let a = String(addr).trim().toLowerCase()
  // Normalize IPv6-mapped IPv4 (e.g. ::ffff:127.0.0.1) and bracketed forms.
  a = a.replace(/^\[|\]$/g, "").replace(/^::ffff:/, "")
  if (a === "::1" || a === "127.0.0.1" || a === "localhost") return true
  if (a.startsWith("127.")) return true
  if (a.startsWith("10.")) return true
  if (a.startsWith("192.168.")) return true
  if (a.startsWith("169.254.")) return true       // link-local
  // 172.16.0.0 – 172.31.255.255
  const m = a.match(/^172\.(\d{1,3})\./)
  if (m) { const o = Number(m[1]); if (o >= 16 && o <= 31) return true }
  // IPv6 unique-local (fc00::/7) and link-local (fe80::/10)
  if (a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe8") || a.startsWith("fe9") || a.startsWith("fea") || a.startsWith("feb")) return true
  return false
}

// Client IP for ABUSE THROTTLING ONLY (never authorization). X-Forwarded-For is client-controlled,
// so trusting it blindly lets an attacker rotate XFF to mint fresh per-IP rate-limit budgets (H1/A07
// OTP-lockout bypass). We therefore trust the first XFF hop ONLY when the socket peer is a trusted
// reverse proxy (loopback/private — i.e. behind Caddy on the same box). For a direct public peer we
// use the peer address itself and ignore any XFF it sent.
function clientIp(req: Request, server?: { requestIP?: (r: Request) => { address?: string } | null }): string {
  let peer: string | undefined
  try { peer = server?.requestIP?.(req)?.address || undefined } catch { peer = undefined }
  if (isTrustedProxyPeer(peer)) {
    const xff = req.headers.get("x-forwarded-for")
    if (xff) { const first = xff.split(",")[0].trim(); if (first) return first }
  }
  return peer || "unknown"
}

// ── Security response headers (M-2 / A02): applied to EVERY response. The CSP is permissive enough not
// to break the dashboard / Trails replay / marketing (Google Fonts + inline styles+scripts + blob/data
// for rrweb and images + esm.sh for the index page's html-to-image module import), while still locking
// frame-ancestors (clickjacking), object-src and base-uri,
// and blocking third-party script origins. Tighten script-src to nonces in a later, browser-tested pass.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://esm.sh https://us-assets.i.posthog.com",
  // Fonts are self-hosted (site/fonts/) — no third-party font origins needed.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ")
const SEC_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": CSP,
  ...(SECURE ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" } : {}),
}
function withSecurityHeaders(res: Response): Response {
  try { for (const [k, v] of Object.entries(SEC_HEADERS)) if (!res.headers.has(k)) res.headers.set(k, v) } catch { /* immutable headers — skip */ }
  return res
}

async function handle(req: Request, server: { requestIP?: (r: Request) => { address?: string } | null }): Promise<Response> {
    const url = new URL(req.url)
    const path = url.pathname

    // ── CORS preflight for cross-origin widget calls (reflect Origin) ──
    if (req.method === "OPTIONS" && path.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: widgetCorsHeaders(req) })
    }

    if (req.method === "GET" && path === "/api/health") {
      return json({ ok: true, db: !!db })
    }

    // KLAVITYKLA-346 — busy-check for the zero-downtime autodeploy drain step. The deploy polls this on
    // the OLD slot before stopping it; `busy: 0` means no AutoSim/Sim/author/PDF work is in flight and
    // the slot is safe to stop. Intentionally cheap (in-memory counters), no auth (loopback-only signal).
    if (req.method === "GET" && path === "/api/health/busy") {
      const s = walkPoolStats()
      return json({ ok: true, busy: s.busy, idle: s.busy === 0, ...s })
    }

    if (req.method === "POST" && path === "/api/billing/webhook") {
      try {
        const len = Number(req.headers.get("content-length") || 0)
        if (Number.isFinite(len) && len > BILLING_WEBHOOK_MAX_BYTES) return json({ error: "payload too large" }, 413)
        const raw = await req.text()
        if (raw.length > BILLING_WEBHOOK_MAX_BYTES) return json({ error: "payload too large" }, 413)
        const event = await verifyStripeWebhook(raw, req.headers.get("stripe-signature"))
        if (event.type === "checkout.session.completed") {
          const sess = event.data?.object
          const acctId = await applyStripeCheckoutSession(sess)
          if (acctId) {
            const subEmail = sess?.customer_details?.email ? String(sess.customer_details.email) : undefined
            void trackFunnel(db!, {
              event: "subscription_created",
              email: subEmail,
              accountId: String(acctId),
              props: {
                plan: sess?.metadata?.plan ?? undefined,
                interval: sess?.metadata?.interval ?? undefined,
                stripeSessionId: sess?.id ? String(sess.id) : undefined,
              },
            })
          }
        } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
          await applyStripeSubscriptionState(event.data?.object)
        } else if (event.type === "customer.subscription.deleted") {
          const sub = event.data?.object
          const accountId = await accountIdFromStripeSubscriptionObject(sub)
          if (accountId) {
            await updateAccountBillingState(accountId, {
              plan: "free",
              stripeCustomerId: sub?.customer ? String(sub.customer) : null,
              stripeSubscriptionId: sub?.id ? String(sub.id) : null,
              billingStatus: sub?.status ? String(sub.status) : "canceled",
              billingInterval: null,
              billingCurrentPeriodEnd: sub?.current_period_end ? Number(sub.current_period_end) * 1000 : null,
              billingCancelAtPeriodEnd: false,
            })
            void trackFunnel(db!, {
              event: "subscription_canceled",
              accountId,
              props: {
                plan: sub?.metadata?.plan ?? undefined,
                stripeSubscriptionId: sub?.id ? String(sub.id) : undefined,
              },
            })
          }
        } else if (event.type === "invoice.paid") {
          // KLAVITYKLA-336: a recurring renewal charge succeeded — refresh billing_status to
          // "active" and the period end, but keep the plan Stripe already told us via the
          // subscription.updated event (never invent a plan from an invoice alone).
          const invoice = event.data?.object
          const accountId = await accountIdFromStripeInvoiceObject(invoice)
          if (accountId) {
            const current = await accountBillingState(accountId)
            const periodEnd = invoice?.lines?.data?.[0]?.period?.end ? Number(invoice.lines.data[0].period.end) * 1000 : current.billingCurrentPeriodEnd
            await updateAccountBillingState(accountId, {
              plan: current.plan,
              stripeCustomerId: invoice?.customer ? String(invoice.customer) : current.stripeCustomerId,
              stripeSubscriptionId: invoice?.subscription ? String(invoice.subscription) : current.stripeSubscriptionId,
              billingStatus: "active",
              billingInterval: current.billingInterval,
              billingCurrentPeriodEnd: periodEnd,
              billingCancelAtPeriodEnd: current.billingCancelAtPeriodEnd,
            })
          }
        } else if (event.type === "invoice.payment_failed") {
          // A renewal charge failed. Stripe auto-retries per its Smart Retries schedule — mark the
          // account past_due for visibility (e.g. in-app banners) but do NOT downgrade the plan here;
          // only customer.subscription.deleted / .updated (status=canceled/unpaid) does that, once
          // Stripe gives up retrying.
          const invoice = event.data?.object
          const accountId = await accountIdFromStripeInvoiceObject(invoice)
          if (accountId) {
            const current = await accountBillingState(accountId)
            await updateAccountBillingState(accountId, {
              plan: current.plan,
              stripeCustomerId: invoice?.customer ? String(invoice.customer) : current.stripeCustomerId,
              stripeSubscriptionId: invoice?.subscription ? String(invoice.subscription) : current.stripeSubscriptionId,
              billingStatus: "past_due",
              billingInterval: current.billingInterval,
              billingCurrentPeriodEnd: current.billingCurrentPeriodEnd,
              billingCancelAtPeriodEnd: current.billingCancelAtPeriodEnd,
            })
          }
        }
        return json({ received: true })
      } catch (err: any) {
        console.warn("stripe webhook rejected:", err?.message || err)
        return json({ error: "invalid webhook" }, 400)
      }
    }

    // ── Phase-out 301: old domain → new canonical domain ──
    // DELIBERATE BACKWARD-COMPAT: klavity.quantana.top is the legacy domain; keep this redirect
    // so existing bookmarks, embeds, and API callers on the old domain still work.
    // Do NOT remove until all known consumers have migrated.
    // KLAVITYKLA-318: /api/* must NEVER be 301'd here. A redirected cross-origin fetch loses the
    // Access-Control-Allow-Origin header, so any extension/widget still pointed at the legacy host
    // fails with an opaque "No 'Access-Control-Allow-Origin' header is present" instead of working.
    // Serve legacy-host API calls in place (the withWidgetCors chokepoint attaches reflected-Origin
    // CORS exactly as on klavity.in) and count the hits so we can tell when it's safe to retire.
    if (req.headers.get("host") === LEGACY_HOST && path !== "/widget.js") {
      if (path.startsWith("/api/")) {
        noteLegacyHostApiHit(path)
      } else {
        const dest = "https://klavity.in" + path + (url.search || "")
        return new Response(null, { status: 301, headers: { location: dest } })
      }
    }

    // ── favicon ──
    if (req.method === "GET" && path === "/favicon.svg") return file(PUB + "/favicon.svg")
    if (req.method === "GET" && path === "/favicon.ico") return file(PUB + "/favicon.ico")

    // ── brand assets (PNG) ──
    if (req.method === "GET" && path === "/og.png")
      return new Response(Bun.file(SITE + "/og.png"), { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } })
    if (req.method === "GET" && path === "/logo.png")
      return new Response(Bun.file(SITE + "/logo.png"), { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } })
    if (req.method === "GET" && path === "/app-icon-1024.png")
      return new Response(Bun.file(SITE + "/app-icon-1024.png"), { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } })
    if (req.method === "GET" && path === "/apple-touch-icon.png")
      return new Response(Bun.file(SITE + "/apple-touch-icon.png"), { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } })

    // ── public marketing + login ──
    if (req.method === "GET" && path === "/") return htmlPage(SITE + "/index.html")
    if (req.method === "GET" && path === "/local") return redirect("/")
    if (req.method === "GET" && path === "/home") return redirect("/")
    if (req.method === "GET" && path === "/login") {
      // Already signed in → skip the login page and land on the dashboard.
      if (await sessionEmail(req)) return redirect("/dashboard")
      return htmlPage(PUB + "/login.html")
    }
    if (req.method === "GET" && path === "/sim-emotions") return file(PUB + "/sim-emotions.html")
    if (req.method === "GET" && path === "/sim-identity") return file(PUB + "/sim-identity.html")
    if (req.method === "GET" && path === "/sim-options") return file(PUB + "/sim-options.html")
    if (req.method === "GET" && path === "/sim-component") return file(PUB + "/sim-component.html")
    if (req.method === "GET" && path === "/sim-studio-a") return file(PUB + "/sim-studio-a-triptych.html")
    if (req.method === "GET" && path === "/sim-studio-b") return file(PUB + "/sim-studio-b-mailbox.html")
    if (req.method === "GET" && path === "/sim-studio-c") return file(PUB + "/sim-studio-c-evidence.html")
    if (req.method === "GET" && path === "/sim-studio-hybrid") return file(PUB + "/sim-studio-hybrid.html")
    if (req.method === "GET" && path === "/snap-popup") return file(PUB + "/snap-popup.html")
    // Right-click menu mockups demo — durable public link. The server has no generic static handler,
    // so the file in public/ needs an explicit route to be served.
    if (req.method === "GET" && path === "/rightclick-mockups.html") return file(PUB + "/rightclick-mockups.html")
    if (req.method === "GET" && path === "/widget-connect") {
      return new Response(Bun.file(PUB + "/widget-connect.html"), {
        headers: { "content-type": "text/html; charset=utf-8" },
      })
    }
    if (req.method === "GET" && path === "/intro-reel") return file(SITE + "/intro-reel.html")
    if (req.method === "GET" && path === "/privacy") return htmlPage(SITE + "/privacy.html")
    if (req.method === "GET" && path === "/terms") return htmlPage(SITE + "/terms.html")
    // ── marketing product pages + shared kit assets ──
    if (req.method === "GET" && path === "/snap") return htmlPage(SITE + "/snap.html")
    if (req.method === "GET" && path === "/sims") return htmlPage(SITE + "/sims.html")
    if (req.method === "GET" && path === "/autosim") return htmlPage(SITE + "/autosim.html")
    if (req.method === "GET" && path === "/pricing") return htmlPage(SITE + "/pricing.html")
    if (req.method === "GET" && path === "/cro") return htmlPage(SITE + "/cro.html")
    // KLAVITYKLA-341 — QA-flavoured sibling of /cro for a Reddit dev-team launch.
    if (req.method === "GET" && path === "/bug-check") return htmlPage(SITE + "/bug-check.html")
    // KLAVITYKLA-337 — /alternatives/* competitor comparison pages (keystone: marker-io).
    // Same htmlPage() path as the other marketing pages so __POSTHOG_KEY__ substitution applies.
    if (req.method === "GET" && path === "/alternatives/marker-io") return htmlPage(SITE + "/alternatives/marker-io.html")
    // ── POST /api/blog/publish — authenticated blog post publish + git push (Plan B path) ──
    // Auth: Authorization: Bearer <BLOG_PUBLISH_TOKEN>. The GH_TOKEN env var is used for the push URL
    // inline (never stored in git config) and must NEVER appear in any log or response body.
    if (req.method === "POST" && path === "/api/blog/publish") {
      const publishToken = process.env.BLOG_PUBLISH_TOKEN || ""
      const authHeader = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1] ?? ""
      if (!publishToken || !timingSafeStrEqual(authHeader, publishToken)) {
        return json({ error: "unauthorized" }, 401)
      }
      const ghToken = process.env.GH_TOKEN || ""
      if (!ghToken) return json({ error: "server misconfigured: GH_TOKEN not set" }, 500)
      let body: Partial<PublishInput>
      try { body = await req.json() } catch { return json({ error: "invalid JSON body" }, 400) }
      const { slug, title, excerpt, category, date, html } = body
      if (!slug || !title || !excerpt || !category || !date || !html) {
        return json({ error: "missing required fields: slug, title, excerpt, category, date, html" }, 400)
      }
      if (!SLUG_RE.test(slug)) {
        return json({ error: "invalid slug: must match ^[a-z0-9-]+$" }, 400)
      }
      try {
        const result = await publishBlogPost({ slug, title, excerpt, category, date, html }, REPO_ROOT, ghToken)
        return json(result)
      } catch (e: any) {
        const msg = String(e?.message || e)
        console.error("[blog/publish] error:", msg)
        return json({ error: "publish failed" }, 500)
      }
    }
    // ── blog (Claude-authored, auto-published; static files under site/blog/) ──
    if (req.method === "GET" && path === "/blog") return file(SITE + "/blog/index.html")
    if (req.method === "GET" && path.startsWith("/blog/") && /^[a-z0-9-]+$/.test(path.slice(6))) {
      const bf = Bun.file(SITE + "/blog/" + path.slice(6) + ".html")
      if (await bf.exists()) return new Response(bf, { headers: { "content-type": "text/html; charset=utf-8" } })
    }
    if (req.method === "GET" && path === "/kit.css") return new Response(Bun.file(SITE + "/kit.css"), { headers: { "content-type": "text/css; charset=utf-8" } })
    if (req.method === "GET" && path === "/kit.js") return new Response(Bun.file(SITE + "/kit.js"), { headers: { "content-type": "text/javascript; charset=utf-8" } })
    // KLAVITYKLA-324: first-touch acquisition attribution capture, defer-loaded on every marketing page.
    if (req.method === "GET" && path === "/attr.js") return new Response(Bun.file(SITE + "/attr.js"), { headers: { "content-type": "text/javascript; charset=utf-8" } })
    // ── generated icon bundle (Lucide SVGs, from scripts/gen-icons.mjs) ──
    // EVERY served page does <script src="/icons.generated.js"> and calls kicon()/window.KLAV_ICONS.
    // Serve the prototype/public copy: it is a strict superset (same icon data PLUS the self-contained
    // window.kicon() helper), so it satisfies both the app pages (which don't load kit.js) and the site
    // pages (which read window.KLAV_ICONS via kit.js). Without this route the script 404s and every page
    // throws "kicon is not defined".
    if (req.method === "GET" && path === "/icons.generated.js") return new Response(Bun.file(PUB + "/icons.generated.js"), { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=3600" } })
    // ── self-hosted fonts (replaces Google Fonts CDN; same-origin under default-src 'self') ──
    if (req.method === "GET" && path === "/fonts/fonts.css") return new Response(Bun.file(SITE + "/fonts/fonts.css"), { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=31536000, immutable" } })
    // ── shared design tokens (canonical token set, sourced from the dashboard) ──
    if (req.method === "GET" && path === "/tokens.css") return new Response(Bun.file(PUB + "/tokens.css"), { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=3600" } })
    if (req.method === "GET" && path.startsWith("/fonts/") && /^[a-z0-9-]+\.woff2$/.test(path.slice(7))) {
      return new Response(Bun.file(SITE + "/fonts/" + path.slice(7)), { headers: { "content-type": "font/woff2", "cache-control": "public, max-age=31536000, immutable" } })
    }
    // ── permanent signed screenshot link (for external tracker tickets, never expires, revocable) ──
    // /img/<screenshotId>.<hmac> — HMAC-gated (KLAV_SECRET), streams the PRIVATE S3 object. Token is
    // unforgeable; revoked by deleting the screenshots row (→ 404). Keeps the bucket private while the
    // ticket <img> renders forever (vs SigV4's 7-day presign cap). No DB session needed by design.
    if (req.method === "GET" && path.startsWith("/img/")) {
      const id = verifyImageToken(decodeURIComponent(path.slice(5)))
      if (!id) return new Response("Not found", { status: 404 })
      const shot = await screenshotById(id)
      if (!shot) return new Response("Not found", { status: 404 })
      try {
        const { bytes, contentType } = await getObjectBytes(shot.s3Key)
        return new Response(bytes, { headers: { "content-type": contentType, "cache-control": "public, max-age=86400" } })
      } catch (e: any) { console.error("img stream failed:", e?.message || e); return new Response("Not found", { status: 404 }) }
    }
    if (req.method === "GET" && path === "/sitemap.xml") {
      const core = ["/", "/snap", "/sims", "/autosim", "/blog", "/alternatives/marker-io", "/privacy", "/terms"]
      let blog: Array<{ slug: string; date: string }> = []
      try { blog = JSON.parse(await Bun.file(SITE + "/blog/index.json").text()) } catch { /* no posts yet */ }
      const urls = [
        ...core.map((p) => `<url><loc>https://klavity.in${p}</loc></url>`),
        ...blog.map((b) => `<url><loc>https://klavity.in/blog/${b.slug}</loc><lastmod>${b.date}</lastmod></url>`),
      ].join("")
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "content-type": "text/xml; charset=utf-8" } })
    }
    if (req.method === "GET" && path === "/robots.txt") return new Response(Bun.file(SITE + "/robots.txt"), { headers: { "content-type": "text/plain; charset=utf-8" } })
    if (req.method === "GET" && path === "/klavity-sim.js") return file(PUB + "/klavity-sim.js")
    // Unified OTP-input helper (window.KlavityOTP), shared by login.html + widget-connect.html.
    // Built from packages/core/src/otp-input.global.ts. No generic static handler → explicit route.
    if (req.method === "GET" && path === "/otp-input.js") return new Response(Bun.file(PUB + "/otp-input.js"), { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=3600" } })
    // ── vendored driver.js (dashboard first-run guided tour) — pinned v1.6.0, MIT. Served locally
    // because the CSP only allows 'self' + esm.sh script origins (no CDN hotlinking). ──
    if (req.method === "GET" && path === "/vendor/driver.min.js") {
      return new Response(Bun.file(PUB + "/vendor/driver.min.js"), {
        headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=86400" },
      })
    }
    if (req.method === "GET" && path === "/vendor/driver.css") {
      return new Response(Bun.file(PUB + "/vendor/driver.css"), {
        headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=86400" },
      })
    }
    // ── vendored session-replay PLAYER (Trails Walk + ticket replay scrubber) ──
    // Served under NEUTRAL filenames (klv-view.*): ad-blockers (uBlock/EasyPrivacy/Brave) block ANY URL
    // containing "rrweb"/"record", which silently broke replay for a large share of real users. The old
    // /vendor/rrweb-player.* paths are kept as compat aliases for pages cached before this rename.
    if (req.method === "GET" && (path === "/vendor/klv-view.min.js" || path === "/vendor/rrweb-player.umd.min.js")) {
      return new Response(Bun.file(PUB + "/vendor/klv-view.min.js"), {
        headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=86400" },
      })
    }
    if (req.method === "GET" && (path === "/vendor/klv-view.css" || path === "/vendor/rrweb-player.css")) {
      return new Response(Bun.file(PUB + "/vendor/klv-view.css"), {
        headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=86400" },
      })
    }
    // ── vendored session-replay RECORDER (lazy-loaded by the embeddable widget; kept OUT of the widget
    // IIFE so the no-install widget's initial payload stays small). CORS-open: the widget runs cross-origin
    // on customers' sites and injects this <script src> from the Klavity backend origin. Served under a
    // NEUTRAL filename (klv-buffer.min.js) so ad-blockers don't block it (they match "rrweb"/"record");
    // the old /vendor/rrweb-record.min.js path is kept as a compat alias for widgets cached before the rename. ──
    if (req.method === "GET" && (path === "/vendor/klv-buffer.min.js" || path === "/vendor/rrweb-record.min.js")) {
      return new Response(Bun.file(PUB + "/vendor/klv-buffer.min.js"), {
        headers: {
          "content-type": "text/javascript; charset=utf-8",
          "cache-control": "public, max-age=86400",
          "access-control-allow-origin": "*",
        },
      })
    }

    // ── embeddable widget bundle ──
    if (req.method === "GET" && path === "/widget.js") {
      return new Response(Bun.file("../packages/sdk/dist/klavity-widget.iife.js"), {
        headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=300" },
      })
    }

    // ── widget lead capture: attach email to a filed report + fire-and-forget alert ──
    if (req.method === "POST" && path === "/api/widget/lead") {
      // Project-scoped, NOT first-party only: the widget runs cross-origin on the customer's site, so
      // a lead must be attachable from any origin. Abuse is bounded by the per-IP rate limit and by the
      // (project_id, feedback_id) pair — the email only lands if that exact row exists for that project.
      if (!rlAllow(`lead:ip:${clientIp(req, server)}`, 20, 60 * 60 * 1000)) return wjson({ error: "rate limited" }, 429)
      const body: any = await req.json().catch(() => ({}))
      const projectId = String(body.project_id || ""), feedbackId = String(body.feedback_id || ""), email = String(body.email || "").trim()
      if (!projectId || !feedbackId || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return wjson({ error: "invalid" }, 400)
      // Optional source attribution forwarded by the widget (fallback if the linked feedback row didn't
      // capture it). Sanitized: kept only as an http(s) URL, capped.
      const leadReferrerRaw = String(body.referrer || "").trim().slice(0, 500)
      const leadReferrer = /^https?:\/\//i.test(leadReferrerRaw) ? leadReferrerRaw : ""
      // JTBD 1.13 — durably persist the lead's email BEFORE the best-effort alert, and never claim success
      // if the write fails. A DB error must surface as a real 5xx (client retries) instead of bubbling
      // uncaught or being masked as a success — and it must be logged with lead context, not swallowed.
      let ok: boolean
      try {
        ok = await setFeedbackContactEmail(feedbackId, projectId, email)
      } catch (e: any) {
        console.error(`[lead] persist failed project=${projectId} feedback=${feedbackId}:`, e?.message || e)
        return wjson({ error: "could not save lead" }, 503)
      }
      if (!ok) return wjson({ error: "not found" }, 404)
      // fire-and-forget alert (never blocks / fails the response)
      void (async () => {
        try {
          const notify = await getWidgetNotifyEmail(projectId)
          if (!notify) return
          const fb = await feedbackById(projectId, feedbackId)
          const proj = await projectById(projectId)
          await sendLeadAlert(notify, {
            email,
            description: fb?.observation || "(no description)",
            pageUrl: (fb?.urlHost ? `https://${fb.urlHost}` : "") + (fb?.urlPath || ""),
            // Source attribution: where the visitor came from. Prefer what the feedback row captured at
            // submit; fall back to the value posted with the lead.
            referrer: fb?.sourceReferrer || leadReferrer || "",
            projectName: proj?.name || projectId,
            feedbackUrl: `${BASE}/dashboard?project=${encodeURIComponent(projectId)}`,
          })
        } catch (e: any) { console.error("lead alert (non-fatal):", e?.message || e) }
      })().catch(() => {})
      return wjson({ ok: true })
    }

    // ── client-error relay: browser posts uncaught JS errors here; we forward to Slack ──
    // Anonymous, no auth required. Rate-limited per-IP (5/min) and body-size-capped.
    // Keeps sensitive internals off the client — we only accept a small structured payload.
    if (req.method === "POST" && path === "/api/client-error") {
      const CLIENT_ERROR_MAX_BODY = 4_096  // 4 KB — small structured payload only
      const ip = clientIp(req, server)
      if (!rlAllow(`clierr:ip:${ip}`, 5, 60_000)) return json({ error: "rate limited" }, 429)
      const parsed = await readJsonLimited(req, CLIENT_ERROR_MAX_BODY)
      if (!parsed.ok) return json({ error: parsed.error }, parsed.status)
      const b = parsed.data as Record<string, unknown>
      const message = String(b.message || "").trim().slice(0, 500)
      if (!message) return json({ error: "message required" }, 400)
      const url = String(b.url || "").trim().slice(0, 300)
      const stack = b.stack ? String(b.stack).slice(0, 1_500) : undefined
      const traceId = b.traceId ? String(b.traceId).slice(0, 40) : undefined
      // fire-and-forget — never blocks the browser
      void reportError({ where: "frontend", message, route: url || undefined, traceId, stack })
      return json({ ok: true })
    }

    // ── widget heartbeat (TASK #5): the embedded /widget.js pings this once on load so the dashboard can
    //    show "Widget: active — last seen … on <host>". Public + cross-origin (the widget runs on the
    //    customer's own domain, NOT our origin), so there's no Origin allowlist here — the only thing it
    //    records is (project_id, host, last_seen), which is non-sensitive presence telemetry. Project-scoped
    //    (unknown project → 404), rate-limited per source IP, and the host is derived from the request's
    //    Origin/Referer (not blindly trusted body input). Best-effort: failures never surface to the page. ──
    if (req.method === "POST" && path === "/api/widget/ping") {
      if (!rlAllow(`wping:ip:${clientIp(req, server)}`, 120, 60 * 1000)) return wjson({ error: "rate limited" }, 429)
      const body: any = await req.json().catch(() => ({}))
      const projectId = String(body.project_id || "")
      if (!projectId) return wjson({ error: "invalid" }, 400)
      const proj = await projectById(projectId)
      if (!proj) return wjson({ error: "not found" }, 404)
      // Derive the host from the request itself (Origin first, then Referer) — never the body — so a caller
      // can't spoof a "seen on" host. Fall back to a body-supplied host only for hosts the request can't
      // reveal (e.g. file://). Normalize to lowercase host[:port], ≤200 chars.
      const hostFrom = (s: string) => { try { return new URL(s).host.toLowerCase().slice(0, 200) } catch { return "" } }
      let host = hostFrom(req.headers.get("origin") || "") || hostFrom(req.headers.get("referer") || "")
      if (!host) host = String(body.host || "").toLowerCase().replace(/[^a-z0-9.:_-]/g, "").slice(0, 200)
      if (!host) host = "(unknown)"
      // First-party pages (dashboard/onboarding mount /widget.js for dogfooding) must NOT satisfy
      // install verification: a ping whose derived host is this app's own host (request Host or the
      // public BASE origin) is acknowledged but never recorded, so the "Widget detected" chip only
      // flips green on a real external install.
      const ownHosts = new Set([
        url.host.toLowerCase(),
        (() => { try { return new URL(BASE).host.toLowerCase() } catch { return "" } })(),
      ].filter(Boolean))
      if (ownHosts.has(host)) return wjson({ ok: true })
      try { await recordWidgetPing(projectId, host) } catch (e: any) { console.error("widget ping (non-fatal):", e?.message || e) }
      return wjson({ ok: true })
    }

    // ── /api/widget/sims — anonymous, project-scoped, CORS-gated: returns minimal Sim descriptors
    // (id, name, initials, accent) so the embedded widget can populate the Deploy / Select-Sims menu
    // without an authenticated session. No persona internals (insights, traits, summary) are returned.
    // Rate-limited per source IP; unknown project → 404 (project_id is already in the widget script tag
    // so this doesn't leak existence beyond what the embedding site already reveals).
    if (req.method === "GET" && path === "/api/widget/sims") {
      if (!rlAllow(`wsims:ip:${clientIp(req, server)}`, 60, 60_000)) return wjson({ error: "rate limited" }, 429)
      const projectId = String(url.searchParams.get("project") || "")
      if (!projectId) return wjson({ error: "project required" }, 400)
      const proj = await projectById(projectId)
      if (!proj) return wjson({ error: "not found" }, 404)
      const personas = await listPersonas(projectId)
      const sims = personas.map((p) => ({
        id: p.id, name: p.name,
        initials: p.initials ?? null,
        accent: p.accent ?? null,
      }))
      return wjson({ sims })
    }

    // ── /api/widget/known-check — anonymous, project-scoped, CORS-gated pre-submit "known issue"
    // lookup (KLAVITYKLA-241, JTBD A.11). Given the reporter's in-progress composer text, returns the
    // closest matching known/recurring issue for the project (reusing the same char-trigram similarity
    // the server-side dedup uses), so the composer can show "Already reported — status: X" BEFORE
    // submit. Read-only; never writes. Rate-limited per IP. No match (or no DB) → { match: null }.
    if (req.method === "POST" && path === "/api/widget/known-check") {
      if (!rlAllow(`wknown:ip:${clientIp(req, server)}`, 120, 60_000)) return wjson({ error: "rate limited" }, 429)
      let body: any = null
      try { body = await req.json() } catch { return wjson({ error: "invalid" }, 400) }
      const projectId = String(body?.project || "")
      const text = String(body?.text || "").slice(0, 5000)
      if (!projectId) return wjson({ error: "project required" }, 400)
      if (!db) return wjson({ match: null })
      const proj = await projectById(projectId)
      if (!proj) return wjson({ error: "not found" }, 404)
      const match = await findKnownIssue(db, projectId, text)
      return wjson({ match })
    }

    // ── inbound two-way status sync (G4): external tracker → Klavity ticket ──
    // POST /api/connectors/:type/webhook — UNAUTHENTICATED on purpose (the external provider
    // calls it). Trust is established per-request by verifying the provider's webhook signature
    // against the secret stored on the matching connector. Supported: github (HMAC X-Hub-Signature-256),
    // plane (shared-secret X-Plane-Signature), linear (HMAC Linear-Signature), jira (shared-secret
    // token via ?token= or X-Klavity-Token). Unsupported types return 404 via inboundSupported.
    const inboundMatch = req.method === "POST" && path.match(/^\/api\/connectors\/([a-z]+)\/webhook$/)
    if (inboundMatch) {
      const type = inboundMatch[1]
      // Unknown / stubbed connector type → 404 (don't reveal which are wired).
      if (!inboundSupported(type)) return json({ error: "Not found" }, 404)

      // Abuse cap: this is a public, unauthenticated endpoint. Bound per source IP.
      if (!rlAllow(`inbound:${type}:${clientIp(req, server)}`, 120, 60 * 1000)) {
        return json({ error: "rate limited" }, 429)
      }

      // Read the RAW body (needed verbatim for HMAC). Hard size cap before any parse/HMAC work.
      const raw = await req.text().catch(() => "")
      if (raw.length > 128 * 1024) return json({ error: "payload too large" }, 413)

      let payload: any
      try { payload = JSON.parse(raw) } catch { return json({ error: "invalid json" }, 400) }

      // Map the external issue id (exactly as we stored it on outbound copy) → our export → feedback.
      const externalKey = extractExternalKey(type, payload)
      if (!externalKey) return json({ ok: true, ignored: "no-external-key" }) // not an issue event we track

      const exportRow = await findExportByExternalKey(type, externalKey)
      // Accept-and-ignore unknown issues so the endpoint isn't an oracle for which ids exist.
      if (!exportRow) return json({ ok: true, ignored: "unknown-issue" })

      // Load the connector that produced this export and decrypt its inbound secret.
      const connector = await getConnectorById(exportRow.projectId, exportRow.connectorId)
      if (!connector) return json({ ok: true, ignored: "connector-gone" })
      let inboundSecret = ""
      if (connector.config.inbound_secret) {
        try { inboundSecret = await decryptSecret(connector.config.inbound_secret) } catch { inboundSecret = "" }
      }
      // No secret configured → two-way sync is opt-in; refuse unsigned/unverifiable callbacks.
      if (!inboundSecret) return json({ error: "unauthorized" }, 401)

      // ── Verify the provider signature (spoofing guard) ──
      let verified = false
      if (type === "github") {
        verified = await verifyGithubSignature(inboundSecret, raw, req.headers.get("x-hub-signature-256"))
      } else if (type === "plane") {
        // Plane sends the configured secret back in a header; constant-time compare.
        const sent = req.headers.get("x-plane-signature") || ""
        verified = timingSafeStrEqual(sent, inboundSecret)
      } else if (type === "linear") {
        // Linear signs the raw body: hex(HMAC_SHA256(secret, body)) in Linear-Signature.
        verified = await verifyLinearSignature(inboundSecret, raw, req.headers.get("linear-signature"))
      } else if (type === "jira") {
        // Jira Cloud webhooks aren't HMAC-signed by default. Auth via a shared secret token sent in a
        // request HEADER (Authorization: Bearer … OR X-Klavity-Token). Constant-time compare.
        // A3: the ?token=… query param is DEPRECATED (it leaks the secret into URLs/logs/referrers) and
        // is accepted only as a transitional fallback — configure Jira to send the header instead.
        const authHeader = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1] || ""
        const headerToken = authHeader || req.headers.get("x-klavity-token") || ""
        const queryToken = url.searchParams.get("token") || ""
        if (!headerToken && queryToken) {
          console.warn("⚠  jira inbound webhook authenticated via DEPRECATED ?token= query param — switch to the X-Klavity-Token (or Authorization: Bearer) header; the query param will be removed.")
        }
        const sent = headerToken || queryToken
        verified = timingSafeStrEqual(sent, inboundSecret)
      }
      if (!verified) return json({ error: "unauthorized" }, 401)

      // Map the provider's state → Klavity status. null = a non-status event → no-op.
      const newStatus = mapExternalStatus(type, payload)
      if (!newStatus) return json({ ok: true, ignored: "no-status-change" })

      const beforeFeedback = await feedbackById(exportRow.projectId, exportRow.feedbackId).catch(() => null)
      const updated = await updateFeedbackMeta(exportRow.projectId, exportRow.feedbackId, { status: newStatus })
      if (!updated) return json({ ok: true, ignored: "feedback-gone" })
      // Record successful inbound heartbeat (fire-and-forget, non-fatal).
      touchConnectorHeartbeat(exportRow.connectorId, { kind: "inbound", success: true })
        .catch((e: any) => console.warn("heartbeat record failed (non-fatal):", e?.message || e))
      if (beforeFeedback?.status !== newStatus) {
        await insertActivity({
          projectId: exportRow.projectId,
          type: "ticket_status_changed",
          actorEmail: null,
          feedbackId: exportRow.feedbackId,
          meta: { from: beforeFeedback?.status ?? null, to: newStatus, source: "connector_webhook", connectorType: type, externalKey },
        }).catch((e: any) => console.warn("ticket status activity skipped:", e?.message || e))
        const proj = beforeFeedback?.contactEmail ? await projectById(exportRow.projectId).catch(() => null) : null
        void notifyReporterOnFix({
          contactEmail: beforeFeedback?.contactEmail ?? null,
          previousStatus: beforeFeedback?.status ?? null,
          nextStatus: newStatus,
          title: String(beforeFeedback?.observation || "Bug report"),
          projectName: proj?.name ?? "your project",
          ticketUrl: ticketDashboardUrl(exportRow.projectId),
        })
      }
      return json({ ok: true, status: newStatus })
    }

    // ── AutoSim Auth AT3: write-only auth config registration via AT2 setup token. ──
    // AT2 should call createAutosimAuthSetupToken(projectId, actor) when it renders the setup prompt
    // and hand the raw token to this route. Only the hash is stored; successful registration consumes it.
    if (req.method === "POST" && path === "/api/autosim/auth-config") {
      try {
        if (!db) return json({ error: "Auth setup is not configured on this server." }, 500)
        const ip = clientIp(req, server)
        if (!rlAllow(`autosim-auth-config:ip:${ip}`, AUTOSIM_AUTH_CONFIG_PER_IP, AUTOSIM_AUTH_CONFIG_WINDOW)) {
          return json({ error: "rate limited" }, 429, { "Retry-After": "3600" })
        }
        const setupToken = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || ""
        if (!setupToken) return json({ error: "setup token required" }, 401)
        if (!rlAllow(`autosim-auth-config:tok:${setupToken.slice(-16)}`, AUTOSIM_AUTH_CONFIG_PER_TOKEN, AUTOSIM_AUTH_CONFIG_WINDOW)) {
          return json({ error: "rate limited" }, 429, { "Retry-After": "3600" })
        }

        const tokenInfo = await resolveAutosimAuthSetupToken(setupToken)
        if (!tokenInfo) return json({ error: "invalid or expired setup token" }, 401)

        const parsed = await readJsonLimited(req, AUTOSIM_AUTH_CONFIG_MAX_BODY)
        if (!parsed.ok) return json({ error: parsed.error }, parsed.status)
        const body = parsed.data
        const method = String(body.method || "")
        if (method !== "fixed_otp" && method !== "mint_link") return json({ error: "method must be fixed_otp or mint_link" }, 400)
        const email = String(body.email || "").trim().toLowerCase()
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json({ error: "Enter a valid email." }, 400)
        const secret = String(body.secret || "").trim()
        if (!secret) return json({ error: "secret is required" }, 400)
        if (secret.length > 4000) return json({ error: "secret too large" }, 413)
        if (method === "mint_link") {
          if (/^https?:\/\//i.test(secret)) return json({ error: "mint_link secret must be an opaque token or same-origin /test-login path, not an absolute URL" }, 400)
          if (secret.startsWith("/")) {
            let mintPath = ""
            try { mintPath = new URL(secret, "https://example.invalid").pathname } catch {}
            if (mintPath !== "/test-login") return json({ error: "mint_link path must be /test-login" }, 400)
          }
        }
        const notesRaw = body.notes == null ? null : String(body.notes).trim()
        if (notesRaw && notesRaw.length > 2000) return json({ error: "notes too large" }, 413)

        const registered = await registerAutosimAuthConfig(tokenInfo.projectId, tokenInfo.id, {
          method,
          email,
          secret,
          notes: notesRaw || null,
        })
        if (!registered) return json({ error: "invalid or expired setup token" }, 401)
        const { probeId } = registered
        void runAutosimAuthProbe(probeId).catch((e: any) => {
          console.warn("autosim auth probe failed:", e?.message || e)
        })
        return json({ ok: true, projectId: tokenInfo.projectId, authStatus: "registered", probe: { id: probeId, status: "queued" } }, 201)
      } catch (err: any) {
        return json(oops(err, "autosim-auth-config"), 500)
      }
    }

    // ── auth: request OTP ──
    if (req.method === "POST" && path === "/api/auth/request") {
      try {
        if (!db) return json({ error: "Login is not configured on this server." }, 500)
        const { email } = await req.json()
        const e = String(email || "").trim().toLowerCase()
        if (!e || !e.includes("@")) return json({ error: "Enter a valid email." }, 400)
        // Test-OTP short-circuit: when KLAV_TEST_OTP is set AND the email is a registered test
        // account email, skip rate-limiting and skip sending a real OTP email entirely. AutoSim
        // login Trails use the fixed code 666666 (accepted by /api/auth/verify below), so running
        // many login Trails in succession never exhausts the 5/email/15min request rate limit.
        // KLAVITYKLA-304: the gate is now runtime-checked (env bootstrap OR an /opsadmin toggle with
        // a required auto-expiry) rather than read once at boot.
        const reqDecision = await testOtpDecision(e, () => isTestAccountEmail(e))
        if (reqDecision.allowed) {
          console.warn(`[TEST-OTP-REQUEST] email=${e} via=${reqDecision.via} — test-OTP active: skipping rate limit + email send, advancing client to code entry`)
          // testOtp:true tells the login page to advance to the code field even though no email was
          // sent (emailed:false), instead of showing "we couldn't send your code" and dead-ending.
          return json({ ok: true, emailed: false, testOtp: true })
        }
        // Throttle issuance per email AND per IP (H1): stops OTP/email bombing and shrinks the window
        // an attacker has to brute-force a code. Both must pass.
        const reqIp = clientIp(req, server)
        if (!rlAllow(`otpreq:e:${e}`, OTP_REQ_PER_EMAIL, OTP_REQ_WINDOW) || !rlAllow(`otpreq:ip:${reqIp}`, OTP_REQ_PER_IP, OTP_REQ_WINDOW))
          return json({ error: "Too many code requests. Please wait a few minutes and try again." }, 429, { "Retry-After": "900" })
        const invited = await hasAnyMembership(e)
        const pendingAssignmentInvite = invited ? false : await hasPendingTicketAssignmentInvite(e)
        if (!emailAllowed(e) && !invited && !pendingAssignmentInvite) return json({ error: "This email isn't on the access list. Ask an admin to invite you." }, 403)
        const code = otp()
        await createOtp(e, code, Date.now() + 10 * 60 * 1000)
        let emailed = false
        // Never log the live code in normal operation (M3) — only when the dev flag is explicitly set.
        try { await sendOtp(e, code); emailed = true } catch (err: any) { console.error("OTP email failed:", err.message); if (DEV_SHOW_OTP) console.log(`OTP for ${e} → ${code}`) }
        return json({ ok: true, emailed, ...(DEV_SHOW_OTP ? { devCode: code } : {}) })
      } catch (err: any) { return json(oops(err, "auth"), 500) }
    }

    // ── auth: verify OTP ──
    if (req.method === "POST" && path === "/api/auth/verify") {
      try {
        if (!db) return json({ error: "Login is not configured." }, 500)
        const { email, code, attribution, attr } = await req.json()
        const e = String(email || "").trim().toLowerCase()
        const c = String(code || "").trim()
        // Brute-force lockout (H1): after OTP_FAIL_MAX wrong codes for this (email,IP) within the
        // window, refuse further attempts until it resets. Successful verify clears the counter.
        const vIp = clientIp(req, server)
        const failKey = `otpfail:${e}:${vIp}`
        // IP-independent per-email lockout (H1/A07): fires regardless of source IP / spoofed XFF, so
        // rotating the X-Forwarded-For header can't buy a fresh brute-force budget against one email.
        const failEmailKey = `otpfail:e:${e}`
        if (rlCount(failKey) >= OTP_FAIL_MAX || rlCount(failEmailKey) >= OTP_FAIL_EMAIL_MAX)
          return json({ error: "Too many attempts. Please wait a few minutes and try again." }, 429, { "Retry-After": "900" })
        // ── TEST-OTP bypass (gated: env bootstrap OR the /opsadmin runtime toggle) ──
        // Fixed code 666666 is accepted ONLY when the code matches AND testOtpDecision grants it:
        //   (a) KLAV_TEST_OTP env var is set/truthy (local dev + CI bootstrap; OFF in production), OR
        //   (b) an ops admin enabled the runtime gate from /opsadmin and it hasn't expired yet
        //       (KLAVITYKLA-304 — checked per request, so it auto-disables with no restart), AND
        //   the email is on the matching allowlist OR is a registered test account login_email in
        //   the DB (so AutoSim login Trails never need the allowlist kept manually in sync).
        // Any other email, or with both gates off, 666666 is rejected by the normal verifyOtp path.
        // This is server-side-gated only — no URL param or header can enable it.
        const testOtpDec = c === TEST_OTP_CODE
          ? await testOtpDecision(e, () => isTestAccountEmail(e))
          : { allowed: false, via: null as null | string }
        const testOtpGranted = testOtpDec.allowed
        if (!(testOtpGranted || await verifyOtp(e, c))) {
          rlRecord(failKey, OTP_FAIL_WINDOW)
          rlRecord(failEmailKey, OTP_FAIL_EMAIL_WINDOW)
          return json({ error: "Invalid or expired code." }, 401)
        }
        if (testOtpGranted) {
          // Loud audit trail so test-OTP usage is always visible in logs — plus a durable row so the
          // /opsadmin Test-OTP panel can list recent bypass logins without shell access.
          console.warn(`[TEST-OTP-USED] email=${e} accepted test bypass code (via=${testOtpDec.via}) — audit this if unexpected`)
          await recordTestOtpUse(e, String(testOtpDec.via ?? "unknown"), vIp)
        }
        // Successful verify clears BOTH the per-(email,IP) and the per-email counters.
        rlClear(failKey)
        rlClear(failEmailKey)
        await upsertUser(e)
        // First-run funnel: capture whether this is a brand-new account BEFORE ensureAccount bootstraps
        // a default membership (which it always does on first login). A genuinely new user starts in the
        // signup wizard, not a cold empty dashboard; returning users go straight to the dashboard.
        const wasNew = (await membershipsFor(e)).length === 0
        // KLAVITYKLA-324: first-touch UTM/referrer attribution — genuinely-new-signup only (never
        // re-derived/overwritten on a returning login, even though setUserAttribution/ensureAccount
        // are themselves COALESCE-guarded first-touch-wins). Prefer the body field (site/attr.js
        // attach()); fall back to the `klav_attr` cookie so attribution survives even if the caller
        // never wired attach() into its fetch. sanitizeAttr is the ONE choke point — raw client
        // input never reaches a column unsanitized. Best-effort: a bad attr never breaks login.
        let signupAttr: ReturnType<typeof sanitizeAttr> = null
        if (wasNew) {
          try {
            let attrSource: unknown = attr ?? attribution
            if (!attrSource) {
              const rawCookie = parseCookies(req.headers.get("cookie"))["klav_attr"]
              if (rawCookie) { try { attrSource = JSON.parse(decodeURIComponent(rawCookie)) } catch { attrSource = null } }
            }
            signupAttr = sanitizeAttr(attrSource)
            await setUserAttribution(e, signupAttr)
          } catch (err: any) { console.error("signup attribution (non-fatal):", err?.message || err) }
        }
        // Fire-and-forget Slack alert on genuinely new signups (enriched with geo/device/domain + source).
        // Best-effort: never blocks or fails the signup. No-op unless SLACK_SIGNUP_WEBHOOK_URL is set.
        if (wasNew) {
          const sUa = req.headers.get("user-agent") || undefined
          const sRef = req.headers.get("referer") || req.headers.get("origin") || undefined
          const attrForSlack = attribution != null ? parseAttribution(attribution) : null
          void notifyNewSignup({ email: e, ip: vIp, userAgent: sUa, referer: sRef, utmSource: attrForSlack?.source || undefined, at: Date.now() })
            .catch((err: any) => console.error("signup slack alert (non-fatal):", err?.message || err))
          // PostHog activation: signup_completed — fire for genuinely new accounts only.
          void capturePosthog(e, "signup_completed", {
            email: e,
            source: sRef ? (() => { try { return new URL(sRef).hostname.replace(/^www\./, "") } catch { return "direct" } })() : "direct",
            referrer: sRef ?? null,
          })
        }
        const acceptedAssignmentInvites = await acceptPendingTicketAssignmentInvites(e)
        const newMemberships = acceptedAssignmentInvites.length ? null : await ensureAccount(e, signupAttr)
        const postSignupMs = newMemberships ?? (await membershipsFor(e))
        // The caller's own default project — ensureAccount creates it as "proj_"+<first membership's
        // account id>. Returned so the onboarding wizard targets the RIGHT project instead of
        // guessing (its old ".pop()" heuristic picked the wrong one for multi-project users).
        const defaultProjectId = postSignupMs[0] ? "proj_" + postSignupMs[0].workspaceId : null
        if (wasNew && attribution != null) {
          const accountId = postSignupMs[0]?.workspaceId
          if (accountId) {
            const attr = parseAttribution(attribution)
            void db!.execute({
              sql: "UPDATE accounts SET first_source=?,first_medium=?,first_campaign=?,first_referrer=?,anon_id=? WHERE id=?",
              args: [attr.source, attr.medium, attr.campaign, attr.referrer, attr.anonId, accountId],
            }).catch((err: any) => console.error("attribution persist (non-fatal):", err?.message || err))
          }
        }
        const sid = token()
        await createSession(sid, e, Date.now() + SESSION_DAYS * 86400 * 1000)
        // JTBD 2.15: land the new assignee directly on the ticket they were assigned. The invite row
        // stores the feedbackId; when present we deep-link with ?ticket=<id> (honored by
        // maybeOpenDeepLinkTicket) so they don't have to re-find the ticket on the board.
        const firstInvite = acceptedAssignmentInvites[0]
        const dest = firstInvite
          ? `/dashboard?project=${encodeURIComponent(firstInvite.projectId)}${firstInvite.feedbackId ? `&ticket=${encodeURIComponent(firstInvite.feedbackId)}` : ""}#tickets`
          : wasNew ? "/onboarding" : "/dashboard"
        return json({ ok: true, redirect: dest, token: sid, projectId: defaultProjectId }, 200, { "Set-Cookie": cookie("klav_session", sid, SESSION_DAYS * 86400, SECURE) })
      } catch (err: any) { return json(oops(err, "auth"), 500) }
    }
    if (req.method === "POST" && path === "/api/auth/logout") {
      const sid = parseCookies(req.headers.get("cookie"))["klav_session"]
      if (sid && db) await deleteSession(sid).catch(() => {})
      return json({ ok: true }, 200, { "Set-Cookie": clearCookie("klav_session", SECURE) })
    }

    // ── GDPR: data export (Art. 15/20) ── authenticated (cookie OR bearer); acts on the caller's OWN
    // data. An ops-admin may target another user via ?email= (for DSAR fulfilment); everyone else is
    // pinned to their own email regardless of the param.
    if (req.method === "GET" && path === "/api/me/export") {
      if (!db) return json({ error: "Not configured." }, 500)
      const meE = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meE) return json({ error: "unauthorized" }, 401)
      const requested = url.searchParams.get("email")?.trim().toLowerCase()
      const target = requested && isOpsAdmin(meE) ? requested : meE
      try {
        const data = await exportUserData(target)
        return json(data, 200, { "Content-Disposition": `attachment; filename="klavity-export-${target}.json"` })
      } catch (err: any) { return json(oops(err, "export"), 500) }
    }

    // ── GDPR: account erasure (Art. 17) ── authenticated; erases the caller's OWN account (or, for an
    // ops-admin, the ?email= target). Deletes feedback/screenshots (incl. S3 objects), memberships,
    // sessions/OTPs/extension tokens, then the user row. Idempotent. Clears the session cookie.
    if ((req.method === "POST" && path === "/api/me/delete") || (req.method === "DELETE" && path === "/api/me")) {
      if (!db) return json({ error: "Not configured." }, 500)
      const meD = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meD) return json({ error: "unauthorized" }, 401)
      const reqEmail = url.searchParams.get("email")?.trim().toLowerCase()
      const victim = reqEmail && isOpsAdmin(meD) ? reqEmail : meD
      try {
        const { s3Keys } = await eraseUser(victim)
        // Best-effort: purge the backing S3 objects. A failure here doesn't block erasure of the DB rows
        // (the ledger row is already gone); we just log so the object can be reaped by the retention sweep.
        for (const key of s3Keys) {
          await deleteObject(key).catch((e) => console.warn(`erase: S3 delete failed for ${key}: ${e?.message || e}`))
        }
        // If the caller erased themselves, clear their session cookie too.
        const clearSelf = victim === meD
        return json({ ok: true, erased: victim, screenshots: s3Keys.length }, 200, clearSelf ? { "Set-Cookie": clearCookie("klav_session", SECURE) } : undefined)
      } catch (err: any) { return json(oops(err, "delete"), 500) }
    }

    // ── feedback intake (extension backend mode) ──
    if (req.method === "POST" && path === "/api/feedback") {
      try {
        // Anonymous browser path: browser requests always carry an Origin header. The embeddable
        // report widget runs cross-origin on customers' own sites, so an end-user must be able to
        // file a ticket WITHOUT a Klavity account. We no longer block foreign origins outright —
        // instead each project declares a report gate (anonymous | email | login) that decides what
        // identity an anonymous report must carry. Requests with NO Origin header are non-browser
        // API calls (extension direct mode, curl) and stay on the existing unauthenticated path.
        // reqOrigin/baseOrigin are computed ONCE so the gate AND the persist branch below can reuse them.
        const reqOrigin = req.headers.get("origin") || ""
        const baseOrigin = (() => { try { return new URL(BASE).origin } catch { return "" } })()
        const anonActor = !(await bearerEmail(req)) && !(await sessionEmail(req))

        const form = await req.formData()
        const description = String(form.get("description") || "").trim()
        const pageUrl = String(form.get("page_url") || "")
        // Source attribution: where the visitor came FROM (document.referrer of the embed page). Capped;
        // kept only if it parses as an http(s) URL so a junk/oversized value never poisons the row/ticket.
        const referrerRaw = String(form.get("referrer") || "").trim().slice(0, 500)
        const sourceReferrer = /^https?:\/\//i.test(referrerRaw) ? referrerRaw : ""
        const reporterEmail = String(form.get("reporter_email") || "").trim()
        const validReporterEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reporterEmail) && reporterEmail.length <= 200
        // Report type from the composer's Bug/Feature toggle (packages/core submit payload `type`).
        // Anything other than the literal "feature" is treated as a bug report.
        const reportType: "bug" | "feature" = String(form.get("type") || "") === "feature" ? "feature" : "bug"
        // JTBD 1.10: accept screenshot-only (or replay-only) reports. Requiring typed prose even when the
        // reporter attached perfect visual evidence is a typing tax during which the bug moment ages out of
        // the replay buffer. Detect attached evidence cheaply BEFORE the 400: at least one screenshot File
        // or a non-empty replay buffer suffices. A report with NEITHER description NOR evidence still 400s.
        const hasScreenshotEvidence = form.getAll("screenshots").some((f) => f instanceof File && f.size > 0)
        const replayRawEarly = String(form.get("replay_events") || "")
        const hasReplayEvidence = replayRawEarly.length > 2 && replayRawEarly !== "[]" && replayRawEarly !== "null"
        const hasEvidence = hasScreenshotEvidence || hasReplayEvidence
        if (!description && !hasEvidence) return wjson({ error: "Add a description or attach a screenshot." }, 400)
        if (description.length > 5000) return wjson({ error: "Description too long." }, 400)

        // Anonymous browser report → enforce the project's report gate (project-scoped, rate-limited).
        // anonWidgetAllowed unlocks the cross-origin anonymous persist branch further below.
        let anonWidgetAllowed = false
        if (anonActor && reqOrigin) {
          const ip = clientIp(req, server)
          if (!rlAllow(`fbanon:ip:${ip}`, FEEDBACK_ANON_PER_IP, FEEDBACK_ANON_WINDOW)) return wjson({ error: "rate limited" }, 429)
          // Cross-origin widget report (the customer's own site) → enforce the project's report gate so
          // an end-user can file WITHOUT a Klavity account. First-party anonymous (our own pages — e.g.
          // the leadgen marketing widget) keeps the existing low-friction path; identity is captured
          // after submit. A logged-in dashboard user isn't anonymous, so the gate never applies to them.
          if (reqOrigin !== baseOrigin) {
            const reqProjectId = String(form.get("project_id") || "")
            const gateProj = reqProjectId ? await projectById(reqProjectId) : null
            if (!gateProj) return wjson({ error: "Unknown project." }, 404)
            if (!rlAllow(`fbanon:proj:${reqProjectId}`, FEEDBACK_ANON_PER_PROJECT, FEEDBACK_ANON_WINDOW)) return wjson({ error: "rate limited" }, 429)
            // Default gate is now 'anonymous' (JTBD 1.7): identity is no longer demanded before value is
            // delivered on the highest-volume path. Projects that explicitly chose 'email'/'login' keep
            // their setting. An unrecognized/missing value resolves to 'anonymous'.
            const gate = (await getWidgetConfig(reqProjectId))?.reportGate || "anonymous"
            if (gate === "login") return wjson({ error: "Sign in to Klavity to report on this project." }, 401)
            if (gate === "email" && !validReporterEmail) return wjson({ error: "A valid email is required to submit." }, 400)
            // Turnstile replaces the email gate's accidental spam-shield role on the anonymous path.
            // When TURNSTILE_SECRET_KEY is configured, an anonymous submit MUST carry a valid token
            // (verifyTurnstile fails closed on a missing/invalid token). When Turnstile is unset, this is
            // a no-op and the per-IP/per-project rate limits above remain the bound. Email/login gates
            // already carry identity, so we only require the token where no other identity is demanded.
            if (gate === "anonymous" && turnstileEnabled()) {
              const tsToken = String(form.get("cf_turnstile_token") || "")
              if (!(await verifyTurnstile(tsToken, ip))) return wjson({ error: "Verification failed. Please try again." }, 403)
            }
            anonWidgetAllowed = true
          }
        }

        // G2/G3/G5: captured dev-tools context (console + network + env + identity/metadata). Optional
        // JSON form field; sanitized + capped so a malformed/oversized blob never poisons the row.
        let clientContext: any = null
        const ctxRaw = String(form.get("context") || "")
        if (ctxRaw && ctxRaw.length <= 200_000) {
          try { clientContext = sanitizeClientContext(JSON.parse(ctxRaw)) } catch { clientContext = null }
        }

        // Annotation overlay (KLAVITYKLA-1 / KLAVITYKLA-217): structured markup { w, h, shapes:[], region?,
        // selector?, byIndex? } so the ticket can re-render the highlight over EACH screenshot. Optional,
        // size-capped, sanitized defensively (coords coerced to finite numbers, shape types allowlisted, strings
        // clamped) since it renders into the DOM. The `byIndex` map carries every annotated image (2–5 no longer
        // dropped); the hoisted top-level fields mirror index-0 for backward-compatible single-image consumers.
        let annotations: any = null
        const annRaw = String(form.get("annotations_json") || "")
        if (annRaw && annRaw.length <= 500_000) {
          try {
            const a = JSON.parse(annRaw)
            const num = (v: any) => (typeof v === "number" && isFinite(v)) ? v : 0
            // Keep in lockstep with the modal's Shape union (packages/core/src/types.ts) — every tool the
            // hero toolbar exposes (pen/line/rect/circle/arrow/text/count) must survive sanitize, else the
            // reporter's markup is silently dropped. `line` + `count` were missing, so those two tools' output
            // never reached the ticket. `pin` is retained for forward-compat though nothing emits it today.
            const okTypes = new Set(["rect", "arrow", "circle", "pen", "line", "text", "count", "pin"])
            // Sanitize a single image's markup entry ({ w, h, shapes, region, selector }) → null when empty.
            const sanitizeEntry = (a: any): any => {
              const shapes = Array.isArray(a?.shapes) ? a.shapes.slice(0, 50).filter((s: any) => s && okTypes.has(s.type)).map((s: any) => {
                const o: any = { type: String(s.type) }
                for (const k of ["x", "y", "w", "h", "x1", "y1", "x2", "y2", "rx", "ry", "n"]) if (s[k] != null) o[k] = num(s[k])
                if (s.color != null) o.color = String(s.color).slice(0, 24)
                if (s.label != null) o.label = String(s.label).slice(0, 200)
                if (s.type === "text") o.text = String(s.text ?? "").slice(0, 200)
                if (Array.isArray(s.points)) o.points = s.points.slice(0, 400).map((p: any) => ({ x: num(p?.x), y: num(p?.y) }))
                return o
              }) : []
              const region = a?.region ? { x: num(a.region.x), y: num(a.region.y), w: num(a.region.w), h: num(a.region.h) } : null
              const selector = a?.selector != null ? String(a.selector).slice(0, 300) : null
              return (shapes.length || region || selector) ? { w: num(a?.w), h: num(a?.h), shapes, region, selector } : null
            }
            const base = sanitizeEntry(a)
            // Per-image map: sanitize each entry independently (capped at MAX_IMAGES=5 keys). Every image's
            // shapes are validated — not just index 0 — so no screenshot's markup escapes sanitization.
            let byIndex: Record<string, any> | null = null
            if (a?.byIndex && typeof a.byIndex === "object" && !Array.isArray(a.byIndex)) {
              const keys = Object.keys(a.byIndex).filter(k => /^\d+$/.test(k)).slice(0, 5)
              for (const k of keys) {
                const entry = sanitizeEntry(a.byIndex[k])
                if (entry) { (byIndex ||= {})[k] = entry }
              }
            }
            if (base && byIndex) annotations = { ...base, byIndex }
            else if (base) annotations = byIndex ? { ...base, byIndex } : base
            else if (byIndex) {
              // No usable index-0 entry but later images are annotated — hoist the lowest-index entry so the
              // existing single-image drawer still shows something while byIndex carries the full set.
              const lowest = Object.keys(byIndex).map(Number).sort((x, y) => x - y)[0]
              annotations = { ...byIndex[String(lowest)], byIndex }
            } else {
              annotations = null
            }
          } catch { annotations = null }
        }

        // ── G1 session replay: the widget/SDK attaches a rolling rrweb event buffer as `replay_events`
        // (a JSON array string). Parse defensively here; an oversize/garbage field must NEVER fail the
        // bug submission. The per-event-buffer byte cap below is a coarse pre-parse guard; the durable
        // size cap (oldest-first trim) lives in saveFeedbackReplay.
        const REPLAY_RAW_CAP = 6 * 1024 * 1024 // 6MB of raw JSON before gzip — reject anything larger outright
        let replayEvents: unknown[] | null = null
        const replayRaw = String(form.get("replay_events") || "")
        if (replayRaw && replayRaw.length <= REPLAY_RAW_CAP) {
          try { const parsed = JSON.parse(replayRaw); if (Array.isArray(parsed) && parsed.length) replayEvents = parsed } catch { /* ignore bad replay */ }
        }

        // KLAVITYKLA-288: the legacy inline Plane push is GONE. Every external filing now flows
        // through the connector system (auto-copy on triage-accept / explicit export), which is the
        // only surface the dashboard can see and manage. Consequences:
        //   • personal (scope='user') and team (scope='project') `integrations` rows are no longer
        //     read here — they were migrated to connectors (migrateConnectorsPlane*, lib/db.ts);
        //   • form-forwarded creds (plane_token / plane_workspace / plane_project_id / plane_host)
        //     from the extension's old "direct mode" are accepted by the parser but IGNORED — we
        //     never make an outbound tracker call from this endpoint;
        //   • the double-file guard that used to skip the inline push when an auto-copy Plane
        //     connector existed is deleted with the path it guarded.
        // A tracker connection remains OPTIONAL: Klavity owns the feedback, Plane is a downstream sink.
        const email = await bearerEmail(req)

        // Upload screenshots to object storage. Caps/MIME/ACL come from the central screenshot config
        // (lib/screenshot-config.ts) instead of scattered literals.
        const files = form.getAll("screenshots").filter((f): f is File => f instanceof File).slice(0, SCREENSHOTS.maxFiles)
        const imageUrls: string[] = []
        const uploaded: Array<UploadedScreenshot & { bytes: number; id: string }> = []
        for (const f of files) {
          if (f.type && !f.type.startsWith(SCREENSHOTS.allowedTypePrefix)) return wjson({ error: `Screenshot ${f.name} is not an image.` }, 400)
          if (f.size > SCREENSHOTS.maxBytes) return wjson({ error: `Screenshot ${f.name} exceeds ${mbLabel(SCREENSHOTS.maxBytes)}.` }, 400)
          const buf = await f.arrayBuffer()
          // Upload PRIVATE (no public bucket exposure). The dashboard reads via the membership-checked
          // /api/screenshots/:id endpoint; the external tracker ticket embeds the PERMANENT signed link
          // /img/<id>.<hmac> (never expires, revocable, served from our domain) so the <img> renders
          // forever without making the object world-readable. Mint the id now so we can sign the link.
          const sid = "shot_" + crypto.randomUUID()
          // JTBD 1.10: a single screenshot upload failure (S3 outage / misconfig) must not 500 the whole
          // report — especially the new screenshot-only path where the reporter typed nothing. Persist the
          // report anyway (this shot is simply dropped) rather than losing the whole submission.
          let meta: UploadedScreenshot
          try { meta = await uploadScreenshotMeta(buf, f.type || "image/png", SCREENSHOTS.defaultAcl) }
          catch (upErr: any) { console.error("screenshot upload failed (non-fatal):", upErr?.message || upErr); continue }
          imageUrls.push(`${BASE}/img/${signImageToken(sid)}`)
          uploaded.push({ ...meta, bytes: buf.byteLength, id: sid })
        }

        // ── persist to our durable ledger (P0) FIRST, always — best-effort, never fails the submission.
        // Runs whether or not a tracker is connected, so the dashboard always gets a row.
        let feedbackId: string | null = null
        let citation: Awaited<ReturnType<typeof resolveCitations>> | null = null
        let recurrenceMem: any = null // populated on dedup hits so callers know the issue recurred
        let knownDuplicate = false
        if (db) {
          try {
            // Actor: Bearer (extension) or cookie session (studio). Resolve to a real project
            // (?project= if accessible, else the caller's first project).
            const actor = email || (await sessionEmail(req))
            const reqProject = String(form.get("project_id") || "") || url.searchParams.get("project")
            // firstParty: the request carries our own Origin (verified browser, same base). Only
            // such requests may use the anonymous projectById path — no-Origin and foreign-Origin
            // anonymous requests must NOT reach projectById (deferred surface stays closed).
            const firstParty = reqOrigin !== "" && reqOrigin === baseOrigin
            let resolved = actor ? await resolveProject(actor, reqProject) : null
            // Anonymous widget intake: no actor, but a known project_id. Allowed when the request is
            // either first-party (our own site) OR a cross-origin browser report that already passed
            // the project's report gate above (anonWidgetAllowed). no-Origin (curl/script) anonymous
            // calls still never reach projectById — the deferred surface stays closed.
            if (!resolved && !actor && reqProject && (firstParty || anonWidgetAllowed)) resolved = await projectById(reqProject)
            if (resolved) {
              const projectId = resolved.id
              // Path-only URL: strip query + fragment (privacy by structure).
              let urlHost: string | null = null, urlPath: string | null = null
              if (pageUrl) { try { const u = new URL(pageUrl); urlHost = u.host; urlPath = u.pathname } catch { urlPath = pageUrl.split(/[?#]/)[0] || null } }

              // Persist a ledger row for EVERY uploaded screenshot using its pre-minted id, so each
              // permanent /img link resolves (the dashboard still references screenshotId = the first).
              let screenshotId: string | null = null
              // Per-project screenshot config = central server defaults merged with this project's
              // settings (modal_config_json.screenshots). A project may disable storage entirely — drop
              // the just-uploaded objects and persist no ledger rows. Retention TTL (if set) stamps expires_at.
              const scfg = resolveScreenshotConfig(await getProjectModalConfig(projectId).catch(() => ({})))
              if (!scfg.enabled) {
                for (const u of uploaded) { await deleteObject(u.key).catch(() => {}) }
                uploaded.length = 0; imageUrls.length = 0
              }
              const shotExpiresAt = scfg.retentionDays > 0 ? Date.now() + scfg.retentionDays * 86400000 : null
              for (const u of uploaded) {
                await insertScreenshot({
                  id: u.id, projectId, s3Key: u.key, bucket: u.bucket,
                  contentType: u.contentType, acl: u.acl,
                  bytes: u.bytes, ownerEmail: actor, expiresAt: shotExpiresAt,
                })
              }
              if (uploaded[0]) screenshotId = uploaded[0].id

              // A01/IDOR: the sim_id is attacker-supplied. Before any trait/citation lookup, verify it
              // belongs to THIS project; if not, treat the persona as ephemeral (simId=null) so no
              // cross-tenant trait read happens. The report still persists with no citation (no 500).
              const rawSimId = String(form.get("sim_id") || "") || null
              const simId = rawSimId && (await listPersonas(projectId)).some((p) => p.id === rawSimId) ? rawSimId : null
              // JTBD 1.10: a screenshot-only report has no typed prose. Seed the observation (which drives the
              // triage title) with a deterministic fallback so the row never shows "Untitled report"; the
              // post-intake AI drafter (below) refines it in place from the captured page context. Reports
              // that DID carry text keep it verbatim.
              const draftedTitle = !description && !String(form.get("observation") || "") && hasEvidence
              const observation = String(form.get("observation") || "") || description ||
                (draftedTitle ? fallbackDraftTitle({ reportType, pageUrl }) : "")
              const sentiment = String(form.get("sentiment") || "") || null
              const priority = String(form.get("priority") || "") || null
              let suggestedBug: any = null
              const sbRaw = String(form.get("suggested_bug") || "")
              if (sbRaw) { try { suggestedBug = JSON.parse(sbRaw) } catch { /* keep null */ } }

              // R8 citations: the studio/extension forwards the reaction's citedTraitIds (JSON array or
              // CSV). Resolve → {quote, speaker, sourceDate, transcriptId} from sim_traits; gracefully
              // empty when the Sim has no matching trait (no crash, citation fields stay null).
              let citedRaw: any = null
              const ctRaw = String(form.get("cited_trait_ids") || "")
              if (ctRaw) { try { citedRaw = JSON.parse(ctRaw) } catch { citedRaw = ctRaw.split(",").map((s) => s.trim()).filter(Boolean) } }
              citation = await resolveCitations(simId, citedRaw, projectId)

              let dedupedInto: string | null = null
              const newIssueKey = suggestedBug
                ? issueKeyForFeedback(projectId, urlPath, citation.issueType, citation.citedTraitIds)
                : humanReportIssueKeyFor({ projectId, urlPath: urlPath ?? "/", text: observation })
              if (suggestedBug) {
                dedupedInto = await findDuplicateFeedback({
                  projectId, urlPath, issueType: citation.issueType,
                  citedTraitIds: citation.citedTraitIds,
                  title: String(suggestedBug?.title || ""), observation,
                })
              } else {
                dedupedInto = await findDuplicateFeedback({
                  projectId, urlPath, title: observation.slice(0, 120), observation,
                  issueKey: newIssueKey,
                })
              }
              if (dedupedInto) {
                const seenAt = Date.now()
                await bumpFeedbackRecurrence(dedupedInto, seenAt)
                feedbackId = dedupedInto
                knownDuplicate = true
                // A.8 occurrence receipts: keep THIS repeat-report's own verbatim description, its
                // screenshot, and its date instead of discarding them on the counter-bump. Powers the
                // per-ticket occurrence timeline ("you said X on Y, then Y2, then Y3"). Best-effort —
                // an occurrence-persist failure must never fail or slow the submission.
                try {
                  await insertFeedbackOccurrence({
                    feedbackId: dedupedInto, projectId, seenAt,
                    observation: observation || null,
                    screenshotId: screenshotId || null,
                    sourceQuote: citation.sourceQuote || null,
                    reporterEmail: validReporterEmail ? reporterEmail : null,
                  })
                } catch (e: any) { console.warn("[occurrence] persist skipped:", e?.message || e) }
                // Build recurrence memory so callers know this is a recurring issue and who originally
                // filed it (the "cited virtual customer" — a Sim persona or a previous human reporter).
                try { recurrenceMem = await buildRecurrenceMemory(db!, dedupedInto, projectId) }
                catch (e: any) { console.warn("[recurrence-memory] build skipped:", e?.message || e) }
                // B.6 unified regression alarm — MEMORY detector: this repeat deduped back onto a
                // cluster that was already resolved (resurfaced after a fix). Publish into the shared
                // regression stream (throttled/deduped per issue) → dashboard banner + Slack/email.
                if (db && recurrenceMem?.regressed && recurrenceMem.issueKey) {
                  void publishRegressionEvent({
                    projectId, issueKey: recurrenceMem.issueKey, source: "memory",
                    title: recurrenceMem.occurrences?.[0]?.title || observation || "recurring issue",
                    feedbackId: dedupedInto, expectationId: recurrenceMem.expectationId,
                    firstFixedAt: recurrenceMem.resolvedAt, at: seenAt,
                    baseUrl: process.env.KLAV_BASE_URL || "",
                    evidence: { occurrences: recurrenceMem.count, firstSeenAt: recurrenceMem.firstSeenAt },
                  }, { db }).catch(() => {})
                }
              } else {
                // PostHog activation: first_bug_filed / first_widget_report — check BEFORE insert.
                let priorFeedbackCount = 1 // safe default: assume not-first if query fails
                if (db) {
                  try {
                    const r = await db.execute({ sql: "SELECT COUNT(*) AS n FROM feedback WHERE project_id=?", args: [projectId] })
                    priorFeedbackCount = Number((r.rows[0] as any)?.n ?? 1)
                  } catch { /* non-fatal */ }
                }
                feedbackId = await insertFeedback({
                  projectId, simId, actorEmail: actor, urlHost, urlPath, sourceReferrer: sourceReferrer || null,
                  observation, sentiment, priority, screenshotId, suggestedBug,
                  citedTraitIds: citation.citedTraitIds.length ? citation.citedTraitIds : null,
                  sourceQuote: citation.sourceQuote, sourceTranscriptId: citation.sourceTranscriptId, sourceDate: citation.sourceDate,
                  planeIssueKey: null, planeIssueUrl: null,
                  issueKey: newIssueKey,
                  clientContext, annotations,
                })
                if (priorFeedbackCount === 0 && feedbackId) {
                  const fbSource = anonWidgetAllowed ? "widget" : (simId ? "sim" : "extension")
                  // first_bug_filed: very first report for this project (any source)
                  void capturePosthog(actor ?? "anonymous", "first_bug_filed", { project_id: projectId, source: fbSource })
                  // first_widget_report: first report arriving via widget token (cross-origin anonymous submit)
                  if (anonWidgetAllowed) {
                    void capturePosthog("anonymous", "first_widget_report", { project_id: projectId })
                  }
                }
              }
              // Reporter email (from the widget's "log in or email" gate): persist as the contact so
              // it shows in the dashboard and drives notify-on-fix. Fires on new + deduped rows.
              if (feedbackId && validReporterEmail) {
                try { await setFeedbackContactEmail(feedbackId, projectId, reporterEmail) }
                catch (e: any) { console.warn("reporter email save (non-fatal):", e?.message || e) }
              }
              // ── expectations spine ingest: best-effort, fires on both deduped and new branches ──
              if (suggestedBug && feedbackId && db) {
                await ingestSnapOrSim(db, {
                  projectId, feedbackId, isSnap: !simId,
                  title: (suggestedBug?.title ?? observation ?? "").slice(0, 200),
                  dedupKey: issueKeyForFeedback(projectId, urlPath, citation.issueType, citation.citedTraitIds),
                  urlPath: urlPath ?? null, issueType: citation.issueType ?? null,
                  citedTraitIds: Array.isArray(citation.citedTraitIds) ? citation.citedTraitIds.map(String) : [],
                  // B.13: carry the originating complaint quote through graduation. For a Sim report this is
                  // the verified trait provenance (tri-state); for an anonymous Snap the observation text is
                  // the reporter's own words (unverified — no page text to check against).
                  sourceQuote: citation.sourceQuote ?? (simId ? null : (observation || null)),
                  sourceQuoteVerified: citation.sourceQuote ? citation.sourceQuoteVerified : (simId ? null : false),
                })
              }
              if (!dedupedInto) {
                await insertActivity({
                  projectId, type: "feedback_filed", actorEmail: actor, simId,
                  urlHost, urlPath, feedbackId, screenshotId,
                })
              }

              // ── G1 session replay attach: store the rolling rrweb buffer keyed to this feedback row.
              // Best-effort + size-capped (oldest-first trim) inside saveFeedbackReplay — a replay
              // failure must never fail or slow the submission. Fires for both new and deduped rows so a
              // recurring bug's freshest replay is available.
              if (replayEvents && feedbackId) {
                try { await saveFeedbackReplay(projectId, feedbackId, replayEvents) }
                catch (re: any) { console.warn("feedback replay save (non-fatal):", re?.message || re) }
              }

              // Note: auto-copy is TRIAGE-GATED — it fires when a report is accepted (status→open),
              // NOT on raw submit. See the PATCH /api/feedback/:id handler below.

              // KLA-175: AI label suggestion — fire-and-forget, never blocks the response.
              if (feedbackId && !dedupedInto) {
                const suggestText = (suggestedBug?.title ? `${suggestedBug.title}\n${observation || ""}` : observation || "").slice(0, 2000)
                void suggestLabelsForFeedback({ feedbackId, projectId, text: suggestText })
                  .catch((err: any) => console.warn("[label-suggest] non-fatal:", err?.message || err))
                // JTBD 1.10: screenshot-only report → refine the fallback title from captured page context.
                // Fire-and-forget; the row already carries a deterministic fallback observation.
                if (draftedTitle) {
                  void draftTitleForFeedback({ feedbackId, projectId, reportType, pageUrl, clientContext })
                    .catch((err: any) => console.warn("[title-draft] non-fatal:", err?.message || err))
                }
              }

              // ── founder notifications (P0 retention loop): email to account owner/admins
              // (throttled: max 1/project/10min, DB-backed state) + optional per-project Slack
              // webhook (modal_config_json.slack_webhook_url, per report). Fire-and-forget —
              // follows the signup-alert pattern; must never block or fail the feedback insert.
              if (feedbackId) {
                void notifyNewReport({
                  projectId, projectName: resolved.name, accountId: resolved.accountId,
                  feedbackId, reportType, description, pageUrl: pageUrl || null,
                  reporterEmail: validReporterEmail ? reporterEmail : null,
                  isRecurrence: !!dedupedInto, baseUrl: BASE, at: Date.now(),
                }).catch((err: any) => console.error("report alert (non-fatal):", err?.message || err))
              }
            }
          } catch (persistErr: any) {
            console.error("feedback persistence (non-fatal):", persistErr?.message || persistErr)
          }
        }

        // Always return success. Auto-copy (if enabled) fires on triage-accept (PATCH status→open),
        // not here — there is no longer any inline external filing on this endpoint (KLAVITYKLA-288),
        // so this is the ONE exit for a successful submission.
        //
        // Success-screen deep link: ONLY authed reporters (extension Bearer / logged-in session)
        // get a dashboard URL — anonymous widget end-users on a customer's site have no dashboard
        // access, so handing them a link would be useless (and leak our app structure). They get
        // just the reference id to quote to support. The dashboard has no per-ticket route yet, so
        // the deepest stable link is the Tickets board of the submitting project.
        const dashBase = baseOrigin || reqOrigin
        const linkProject = String(form.get("project_id") || "") || url.searchParams.get("project") || ""
        const issueUrl = (!anonActor && feedbackId && dashBase)
          ? `${dashBase}/dashboard${linkProject ? `?project=${encodeURIComponent(linkProject)}` : ""}#tickets`
          : ""
        return wjson({ id: feedbackId ?? "", saved: true, ...(knownDuplicate ? { known: true, deduped: true } : {}), ...(issueUrl ? { issue_url: issueUrl } : {}), ...(recurrenceMem ? { recurrence: recurrenceMem } : {}) })
      } catch (e: any) {
        return json(oops(e, "feedback"), 500)
      }
    }

    // ── personas (Sims library) — cookie OR Bearer ──
    if (path === "/api/personas" || path.startsWith("/api/personas/")) {
      const me2 = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!me2) return wjson({ error: "Sign in to continue." }, 401)
      const proj2 = await resolveProject(me2, url.searchParams.get("project"))
      if (!proj2) return wjson({ error: "No project." }, 400)
      const wid = proj2.id

      if (req.method === "GET" && path === "/api/personas") {
        // Use listPersonasForProject to include global Sims from sibling projects in the same account.
        // Each persona in the response carries isGlobal:true/false so the UI can badge globals.
        const personas = await listPersonasForProject(wid)
        return wjson({ personas })
      }
      if (req.method === "POST" && path === "/api/personas") {
        try {
          const body = await req.json()
          const incomingName = String(body.name || "Unnamed")
          const incomingRole = String(body.role || "")
          // Dedup guard: if a persona with the same normalized name (+ role) already exists in this
          // project, return the existing one instead of creating a duplicate. This prevents the
          // Add-a-Sim flow and repeated extract/site-suggest "Add" clicks from creating N identical rows.
          // Normalization mirrors normName() used in matchPersonaToSim (trim + lowercase + collapse spaces).
          const normIncomingName = incomingName.trim().toLowerCase().replace(/\s+/g, " ")
          const normIncomingRole = incomingRole.trim().toLowerCase().replace(/\s+/g, " ")
          const existing = await listPersonas(wid)
          const dupe = existing.find(p =>
            p.name.trim().toLowerCase().replace(/\s+/g, " ") === normIncomingName &&
            p.role.trim().toLowerCase().replace(/\s+/g, " ") === normIncomingRole
          )
          if (dupe) return wjson({ persona: dupe, existing: true }, 200)

          // KLA-307: flag-gated Sim quota (no-op unless KLAV_BILLING_ENFORCEMENT=1). This POST is
          // the single server-side Sim creation choke point (every Add-a-Sim flow lands here; PUT is
          // edit-only), so enforcing here covers them all. Count Sims across ALL of the account's
          // projects — the account is the billing unit. Checked AFTER the dedup guard: returning an
          // already-existing Sim never counts as creation.
          const homeProj = await projectById(wid)
          const simQuota = homeProj ? await quotaExceeded(homeProj.accountId, "sims", async () => {
            const accountProjects = (await listProjects(me2)).filter((p) => p.accountId === homeProj.accountId)
            let n = 0
            for (const p of accountProjects) n += p.id === wid ? existing.length : (await listPersonas(p.id)).length
            return n
          }) : null
          if (simQuota) return wjson(simQuota, 402)

          const id = "sim_" + crypto.randomUUID()
          const v3 = v3PersonaFields(body)
          // KLAVITYKLA-301: stamp the creation path so the checklist can tick honestly.
          // The client sends simSource: 'describe' | 'from-site' | 'transcript' depending on
          // which Add-a-Sim modal tab was active. Unknown/missing → null (legacy back-compat).
          const SIM_SOURCE_VALID = new Set(["describe", "from-site", "transcript"])
          const simSource = SIM_SOURCE_VALID.has(String(body.simSource || "")) ? String(body.simSource) : null
          await upsertPersona(id, wid, {
            name: incomingName, role: incomingRole,
            type: v3.type,
            initials: String(body.initials || "").slice(0, 2).toUpperCase(),
            accent: normAccent(body.accent),
            summary: String(body.summary || ""),
            insights: Array.isArray(body.insights) ? body.insights : [],
            avatar: body.avatar ? String(body.avatar) : null,
            simClass: v3.simClass, side: v3.side, core: v3.core,
            simSource,
          })
          const [saved] = (await listPersonas(wid)).filter(p => p.id === id)
          return wjson({ persona: saved }, 201)
        } catch (e: any) { return wjson(oops(e, "persona"), 500) }
      }
      const idMatch = path.match(/^\/api\/personas\/([^/]+)$/)
      if (idMatch) {
        const pid = idMatch[1]
        if (req.method === "PUT") {
          try {
            const body = await req.json()
            // Access control (C2): PUT is edit-only — the persona MUST belong to the caller's OWN project
            // (not just appear via global union). Only the home project can mutate a persona's fields.
            // listPersonas (project-scoped, no union) is the right check here.
            const before = (await listPersonas(wid)).find(p => p.id === pid)
            if (!before) return wjson({ error: "Not found" }, 404)
            const now = Date.now()
            const v3 = v3PersonaFields(body)
            // Edit-preserve: a legacy identity-only PUT (no simClass/side/core in the body) must NOT
            // wipe a Sim's existing v3 core — fall back to the stored values when the body omits them.
            const simClass = v3.simClass ?? before.simClass ?? null
            const side = v3.side ?? before.side ?? null
            const core = v3.core ?? before.core ?? null
            const type = (v3.simClass || v3.side) ? v3.type
              : (body?.type === "internal" ? "internal" : (body?.type === "client" ? "client" : before.type))
            await upsertPersona(pid, wid, {
              name: String(body.name || "Unnamed"), role: String(body.role || ""),
              type,
              initials: String(body.initials || "").slice(0, 2).toUpperCase(),
              accent: normAccent(body.accent),
              summary: String(body.summary || ""),
              insights: Array.isArray(body.insights) ? body.insights : [],
              avatar: body.avatar ? String(body.avatar) : null,
              simClass, side, core,
            })
            // Global Sims v1: if the body carries `isGlobal`, toggle the flag on the home-project row.
            // Only home-project owners can set this (already guarded above by listPersonas(wid) check).
            if (typeof body.isGlobal === "boolean") {
              await setPersonaGlobal(pid, wid, body.isGlobal)
            }
            // Version each changed identity field in the append-only persona_edits audit.
            const fields: Array<[string, string | null, string | null]> = [
              ["name", before.name, String(body.name ?? "")],
              ["role", before.role, String(body.role ?? "")],
              ["summary", before.summary, String(body.summary ?? "")],
              ["type", before.type, String(body.type ?? "")],
              ["accent", before.accent, String(body.accent ?? "")],
            ]
            // JTBD 3.13 (KLAVITYKLA-265): the v3 core (goals / watchFor / voice / expertise / temperament)
            // is what drives review quality — make edits to it versioned too, not just identity. Only
            // record when the body actually carried a v3 core (v3.core != null), so a legacy identity-only
            // PUT (which preserves the stored core) doesn't spuriously log a no-op. Arrays are compared
            // as JSON so reorders/adds/removes register as a change.
            if (v3.core) {
              const bc = before.core
              const norm = (v: any) => Array.isArray(v) ? JSON.stringify(v) : String(v ?? "")
              const coreFields: Array<[string, any, any]> = [
                ["goals", bc?.goals ?? [], v3.core.goals ?? []],
                ["watchFor", bc?.watchFor ?? [], v3.core.watchFor ?? []],
                ["voice", bc?.voice ?? "", v3.core.voice ?? ""],
                ["expertise", bc?.expertise ?? "", v3.core.expertise ?? ""],
                ["temperament", bc?.temperament ?? "", v3.core.temperament ?? ""],
              ]
              for (const [field, b, a] of coreFields) {
                if (norm(b) !== norm(a)) fields.push([field, norm(b), norm(a)])
              }
            }
            for (const [field, b, a] of fields) {
              if ((b ?? "") !== (a ?? "")) await insertPersonaEdit({ personaId: pid, projectId: wid, field, beforeVal: b, afterVal: a, actor: me2, createdAt: now })
            }
            return wjson({ ok: true })
          } catch (e: any) { return wjson(oops(e, "persona"), 500) }
        }
        if (req.method === "DELETE") {
          // DELETE: only the home-project can delete. listPersonas is project-scoped (no global union).
          const ownPersona = (await listPersonas(wid)).some(p => p.id === pid)
          if (!ownPersona) return wjson({ error: "Not found" }, 404)
          await deletePersona(pid, wid)
          return wjson({ ok: true })
        }
      }
      const editsMatch = path.match(/^\/api\/personas\/([^/]+)\/edits$/)
      if (editsMatch && req.method === "GET") {
        const pid = editsMatch[1]
        // Access control (C1): listPersonaEdits is keyed only by persona id — verify the persona
        // belongs to the caller's project before returning its edit history (no cross-tenant leak).
        if (!(await listPersonas(wid)).some(p => p.id === pid)) return wjson({ error: "Not found" }, 404)
        return wjson({ personaId: pid, edits: await listPersonaEdits(pid) })
      }
      return wjson({ error: "Not found" }, 404)
    }

    // ── extension config sync (P3b) — cookie OR Bearer. Returns, for every project the caller can see,
    // the enabled monitored url patterns + that project's review_mode, plus a freshly-issued dedicated
    // extension token bound to the caller. The extension caches this to decide where to auto-activate.
    if (req.method === "GET" && path === "/api/extension/config") {
      const meX = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meX) return json({ error: "Sign in to continue." }, 401)
      const out = await extensionProjectConfig(meX)
      // Dedicated narrow-scope token (R5): replaces reusing the raw session id as the Bearer.
      const extToken = await issueExtensionToken(meX, null, SESSION_DAYS * 24 * 60 * 60 * 1000)
      // configVersion (KLAVITYKLA-320): lets the extension detect a dashboard-side config
      // change and drop its cache instead of serving stale review modes / monitored URLs.
      return json({ email: meX, token: extToken, projects: out, configVersion: extConfigVersion(out) })
    }

    // ── extension config VERSION (KLAVITYKLA-320) — cheap revalidation endpoint.
    // Same auth as /api/extension/config but mints NO token and returns only the hash,
    // so the extension can poll it on a short TTL and do the full (token-minting) sync
    // only when the admin has actually changed something.
    if (req.method === "GET" && path === "/api/extension/config/version") {
      const meCV = (await bearerEmail(req)) || (await sessionEmail(req))
      if (!meCV) return json({ error: "Sign in to continue." }, 401)
      const tokCV = (req.headers.get("authorization") || "").slice(7, 15)
      if (!rlAllow(`extcfgver:tok:${tokCV}`, 60, 60_000)) return json({ error: "rate limited" }, 429)
      if (!rlAllow(`extcfgver:ip:${clientIp(req, server)}`, 120, 60_000)) return json({ error: "rate limited" }, 429)
      return json({ configVersion: extConfigVersion(await extensionProjectConfig(meCV)) })
    }

    // ── extension URL match (R5b) — bearer-gated real-time allowlist check.
    // Returns the caller's accessible projects whose enabled monitored-URL patterns
    // match the supplied url. Designed for the extension content-script: call on
    // each page load with the ext_ token; use result to activate when the cached
    // config is stale or hasn't yet synced.
    // SECURITY: missing auth → 401 (no project info). Authenticated non-member →
    // { projects: [] } — never discloses whether a project monitors the URL.
    if (req.method === "GET" && path === "/api/extension/match") {
      const meM = (await bearerEmail(req)) || (await sessionEmail(req))
      if (!meM) return json({ error: "Sign in to continue." }, 401)
      // Rate-limit: per token prefix (60/min) and per IP (120/min).
      const tok8 = (req.headers.get("authorization") || "").slice(7, 15)
      if (!rlAllow(`extmatch:tok:${tok8}`, 60, 60_000)) return json({ error: "rate limited" }, 429)
      if (!rlAllow(`extmatch:ip:${clientIp(req, server)}`, 120, 60_000)) return json({ error: "rate limited" }, 429)
      const rawUrl = url.searchParams.get("url") || ""
      if (!rawUrl || rawUrl.length > 2048 || !/^https?:\/\//i.test(rawUrl)) {
        return json({ projects: [] })
      }
      // F5: if the Bearer is a project-bound widget token, constrain to that project only —
      // same guard resolveProject enforces, preventing a leaked widget token from probing
      // the owner's other projects' allowlists.
      const boundProj = reqCtx.getStore()?.boundProject ?? null
      const accessible = (await listProjects(meM)).filter(p => !boundProj || p.id === boundProj)
      const matched: { projectId: string; name: string }[] = []
      for (const p of accessible) {
        if (!(await projectAccess(meM, p.id))) continue
        if (await matchMonitored(p.id, rawUrl)) matched.push({ projectId: p.id, name: p.name })
      }
      return json({ projects: matched })
    }

    // ── monitoring consent (P3b) — grant / pause / revoke for the CALLER on a project. Cookie OR Bearer.
    // 'granted' = allow capture; 'paused' = user-pause (instant, reversible); 'revoked' = withdraw consent.
    // This is the per-member-per-project consent row that gate (c) requires before the first capture (§5b).
    if (req.method === "POST" && path === "/api/consent") {
      const meC = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meC) return wjson({ error: "Sign in to continue." }, 401)
      const body = await req.json().catch(() => ({}))
      const projC = await resolveProject(meC, String(body.projectId || "") || url.searchParams.get("project"))
      if (!projC) return wjson({ error: "No project." }, 400)
      const status = String(body.status || "").trim()
      if (!["granted", "paused", "revoked"].includes(status)) return wjson({ error: "status must be granted|paused|revoked." }, 400)
      await setConsent(projC.id, meC, status as "granted" | "paused" | "revoked")
      const cur = await getConsent(projC.id, meC)
      return wjson({ ok: true, projectId: projC.id, consent: cur?.status ?? status })
    }

    // ── widget token — mints a per-user extension token for the embeddable widget. Session-cookie gated
    // (first-party popup only). Validates project access and that the request origin is on the allowlist.
    if (req.method === "POST" && path === "/api/widget/token") {
      const meW = await sessionEmail(req)            // first-party popup → cookie only
      if (!meW) return json({ error: "Sign in to continue." }, 401)
      const body = await req.json().catch(() => ({}))
      const projW = await resolveProject(meW, String(body.projectId || ""))
      if (!projW) return json({ error: "No access to this project." }, 403)
      const origin = String(body.origin || "")
      if (!(await originAllowedForProject(projW.id, origin))) {
        // Tell an ADMIN caller they can self-serve add this origin from the connect popup (matches the
        // existing admin-only POST /monitored-urls gate), instead of dead-ending them on a bare 403.
        let host = ""
        try { host = new URL(origin).host.toLowerCase() } catch { /* non-URL origin → no add offer */ }
        return json({
          error: "This origin is not on the project's watch list.",
          code: "origin_not_allowed",
          canAdd: projW.access === "admin" && !!host,
          host,
          projectId: projW.id,
        }, 403)
      }
      const widgetToken = await issueExtensionToken(meW, projW.id, SESSION_DAYS * 24 * 60 * 60 * 1000)
      return json({ token: widgetToken })
    }

    // ── admin pause (P3b) — project-wide review_mode 'paused' (admin pause) | 'auto' (resume). Cookie OR
    // Bearer; PROJECT ADMIN ONLY. This is gate (b)'s admin side; user pause is /api/consent (status 'paused').
    {
      const pauseMatch = path.match(/^\/api\/projects\/([^/]+)\/pause$/)
      if (req.method === "POST" && pauseMatch) {
        const meP = (await sessionEmail(req)) || (await bearerEmail(req))
        if (!meP) return json({ error: "Sign in to continue." }, 401)
        const pid = pauseMatch[1]
        const access = await projectAccess(meP, pid)
        if (!access) return json({ error: "No access to this project." }, 403)
        if (access !== "admin") return json({ error: "Only project admins can pause/resume reviews." }, 403)
        const body = await req.json().catch(() => ({}))
        // accept { paused: true } or { mode: 'paused'|'auto' }
        const mode: "paused" | "auto" = body.mode === "auto" || body.paused === false ? "auto" : body.mode === "paused" || body.paused === true ? "paused" : "paused"
        await setReviewMode(pid, mode)
        await insertActivity({ projectId: pid, type: "review_mode_changed", actorEmail: meP, meta: { mode } })
        if (mode === "auto") void trackFunnel(db!, { event: "continuous_enabled", email: meP, accountId: pid, props: { projectId: pid } })
        return json({ ok: true, projectId: pid, reviewMode: mode })
      }
    }

    // ── member "request resume" (JTBD 3.11) — the counterpart to admin pause. When the daily Sim
    // budget auto-pauses a project (POST /api/sim/review gate f), a non-admin member has no way to
    // un-pause. This lets ANY project member notify a project admin (email + optional Slack) that
    // they're blocked and want reviews resumed. It never changes review_mode itself — resuming stays
    // an admin action — it just closes the notification gap so the wall is no longer a dead end.
    // Cookie OR Bearer. Best-effort notify (fire-and-forget); the request always succeeds for members.
    {
      const resumeMatch = path.match(/^\/api\/sim\/request-resume$/)
      if (req.method === "POST" && resumeMatch) {
        const meRR = (await sessionEmail(req)) || (await bearerEmail(req))
        if (!meRR) return json({ error: "Sign in to continue." }, 401)
        // Light abuse guard: at most a few requests per member per minute (the alert lib itself
        // throttles email to 1/project/10min, so this only caps the cheap route churn).
        if (!rlAllow(`simresume:${meRR}`, 5, 60_000)) return json({ error: "Please wait a moment before requesting again." }, 429)
        const rbody = await req.json().catch(() => ({}))
        // Resolve the project the same way the review endpoint does: explicit projectId, else the
        // first accessible project whose allowlist matches the page the member was blocked on.
        const rReqProject = String(rbody.projectId || "") || url.searchParams.get("project")
        const rPageUrl = rbody.url != null ? String(rbody.url) : null
        let rPid: string | null = null
        if (rReqProject) {
          const a = await resolveProject(meRR, rReqProject)
          if (a) rPid = a.id
        } else if (rPageUrl) {
          for (const p of await listProjects(meRR)) {
            if (!(await projectAccess(meRR, p.id))) continue
            if (await matchMonitored(p.id, rPageUrl)) { rPid = p.id; break }
          }
        }
        if (!rPid) return json({ error: "Pick a project to request a resume for." }, 400)
        const rProj = await projectById(rPid)
        if (!rProj) return json({ error: "Project not found." }, 404)
        // Record the request on the activity feed so admins see it in the dashboard even if email
        // or Slack is unconfigured. Distinct type from the auto `admin_notify` so both are visible.
        await insertActivity({ projectId: rPid, type: "admin_resume_requested", actorEmail: meRR, meta: { reason: "budget_exhausted", pageUrl: rPageUrl } })
        // Fire-and-forget notify (email owner/admins + optional Slack); never blocks the response.
        const rBase = process.env.KLAV_BASE_URL || ""
        const notified = await notifyBudgetResumeRequest({
          projectId: rPid, projectName: rProj.name, accountId: rProj.accountId,
          requesterEmail: meRR, pageUrl: rPageUrl, baseUrl: rBase, at: Date.now(),
        }).catch(() => ({ emailed: false, recipients: 0 }))
        return json({
          ok: true, projectId: rPid,
          message: notified.emailed
            ? "We've let a project admin know you're waiting to run Sims."
            : "Request recorded — a project admin will see it in the dashboard.",
        })
      }
    }

    // ── signed screenshot URL (P3b, R7) — membership-checked. PRIVATE Sim screenshots return a short-lived
    // presigned GET; the existing public-read Snap screenshots return their direct public URL. Cookie OR Bearer.
    {
      const shotMatch = path.match(/^\/api\/screenshots\/([^/]+)$/)
      if (req.method === "GET" && shotMatch) {
        const meS = (await sessionEmail(req)) || (await bearerEmail(req))
        if (!meS) return json({ error: "Sign in to continue." }, 401)
        const shot = await screenshotById(shotMatch[1])
        if (!shot) return json({ error: "Not found." }, 404)
        // Membership check: the screenshot's project must be one the caller can access.
        if (!shot.projectId || !(await projectAccess(meS, shot.projectId))) return json({ error: "No access to this screenshot." }, 403)
        try {
          if (shot.acl === "public-read") {
            const pub = `${(process.env.S3_ENDPOINT || "").replace(/\/+$/, "")}/${shot.bucket}/${shot.s3Key}`
            return json({ id: shot.id, url: pub, acl: shot.acl })
          }
          const url = presignGet(shot.s3Key, SCREENSHOTS.presignTtlSec)
          return json({ id: shot.id, url, acl: shot.acl, expiresInSec: SCREENSHOTS.presignTtlSec })
        } catch (e: any) { return json(oops(e, "signurl"), 500) }
      }
    }

    // ── /api/sim/review (P3b, R5) — the core AUTO-COMMENT endpoint the extension calls on a monitored visit.
    // Body: { projectId?, url, screenshotDataUrl, domSig?, simIds? }. GUARDRAILS run IN ORDER (§5, binding);
    // each is a hard gate that returns a clear `reason` if blocked. NOTHING is captured/reviewed off-allowlist
    // and no screenshot/vision work happens until every gate passes. Cookie OR Bearer.
    if (req.method === "POST" && path === "/api/sim/review") {
      const meR = (await sessionEmail(req)) || (await bearerEmail(req))
      try {
        const benchStart = Date.now()
        const body = await req.json().catch(() => ({}))
        const benchBodyReadAt = Date.now()
        const pageUrl = String(body.url || "")
        const domSig = body.domSig != null ? String(body.domSig) : null
        const screenshotDataUrl = String(body.screenshotDataUrl || "")
        const reqSimIds: string[] = Array.isArray(body.simIds) ? body.simIds.map(String) : []
        const adhoc = body.adhoc === true
        // Session dedup: client sends a sessionId (opaque string; scoped to one browse session) and
        // the set of observation hashes already shown so we never repeat observations in one session.
        const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : null
        const seenHashes = new Set<string>(
          Array.isArray(body.seenHashes) ? body.seenHashes.map(String).filter((h: string) => /^[0-9a-f]{16}$/.test(h)) : []
        )
        // Feedback mode: "all" (default) | "positive" | "critical". Unknown values fall back to "all".
        const VALID_MODES = new Set(["all", "positive", "critical"])
        const mode = (VALID_MODES.has(body.mode) ? body.mode : "all") as "all" | "positive" | "critical"
        // Per-session throttle: cap continuous-mode calls to 1 req/2s per (session, project) to
        // prevent runaway AI spend while still feeling live. Uses the same ratelimit infra as other
        // rate-limited endpoints. No-op when sessionId is absent (passive/one-shot mode).
        if (sessionId && !rlAllow(`simreview:${sessionId}`, 1, 2000)) {
          return wjson({ ok: true, reason: "throttled", projectId: body.projectId || null, reviews: [] }, 200)
        }

        // (a) AUTH + project access. Resolve project by matchMonitored(url) when projectId is absent — but
        //     only across projects the caller can access (no cross-project leakage / off-account capture).
        if (!meR) return wjson({ ok: false, reason: "unauthorized", error: "Sign in to continue." }, 401)
        let projectId: string | null = null
        const requestedProject = String(body.projectId || "") || url.searchParams.get("project")
        // Adhoc reviews must always supply a projectId — auto-resolution via allowlist is passive-only.
        if (adhoc && !requestedProject) return wjson({ ok: false, reason: "unauthorized", error: "Pick a project to analyze this page." }, 401)
        if (requestedProject) {
          const a = await resolveProject(meR, requestedProject)
          if (a) projectId = a.id
        } else if (pageUrl) {
          // pick the first accessible project whose allowlist matches this url.
          for (const p of await listProjects(meR)) {
            if (!(await projectAccess(meR, p.id))) continue
            if (await matchMonitored(p.id, pageUrl)) { projectId = p.id; break }
          }
        }
        if (!projectId) {
          // An explicit project was requested but access failed → a genuine authz miss (keep the
          // legacy `unauthorized` reason so gate tests + the extension's "sign in" path are stable).
          if (requestedProject) return wjson({ ok: false, reason: "unauthorized", error: "No accessible project for this URL." }, 401)
          // Otherwise passive auto-resolution ran and no monitored-URL allowlist entry across the
          // caller's accessible projects matched this URL. Point them at the fix instead of dead-
          // ending: add this URL to a project's allowlist in Settings (JTBD 3.11 — the "No accessible
          // project" error must explain how to fix it and point at allowlist setup).
          const base = (process.env.KLAV_BASE_URL || "").replace(/\/+$/, "")
          const settingsUrl = base ? `${base}/dashboard#settings` : null
          return wjson({
            ok: false,
            reason: "noAllowlistMatch",
            error: "This page isn't on any of your projects' monitored-URL allowlists, so Sims won't run here. Add it in project Settings → Monitored URLs.",
            hint: "allowlist_setup",
            settingsUrl,
          }, 401)
        }

        // Resolve the inputs the pure gate needs (in gate order; cheap reads, no AI/S3 yet).
        const reviewMode = await getReviewMode(projectId)
        const consent = await getConsent(projectId, meR)
        const consentStatus = consent?.status ?? null
        const allowlist = pageUrl ? await matchMonitored(projectId, pageUrl) : null
        const { urlHost, urlPath } = splitUrl(pageUrl)

        // (e) dedupe is computed across the Sims we'd review; if ALL are already-seen we short-circuit.
        // Use listPersonasForProject (not listPersonas) so global Sims from sibling projects in the
        // same account are included in reviews — they surface via the UNION query in listPersonasForProject.
        // listPersonas is project-scoped only and silently excludes global Sims, causing them to never
        // react to a project's pages even though they're listed in that project's UI (KLAVITYKLA-257).
        const projectSims = await listPersonasForProject(projectId)
        const targetSims = reqSimIds.length ? projectSims.filter((p) => reqSimIds.includes(p.id)) : projectSims

        const seenKeys = targetSims.map((s) => reviewDedupeKey(s.id, urlPath || "", domSig))
        const allSeen = targetSims.length > 0 && seenKeys.every((k) => reviewSeen(k))

        // (f) budget is the LAST gate and is the ONLY side-effecting pre-check (atomic consume). We only
        //     attempt it once gates a–e pass, so a blocked request never burns budget. Pre-evaluate a–e
        //     with budgetConsumed=true to find any earlier block without consuming.
        const pre = reviewGate({ authed: true, reviewMode, consentStatus, allowlistMatch: !!allowlist, alreadyReviewed: allSeen, budgetConsumed: true, adhoc })
        if (!pre.ok) { console.log(`[review] blocked reason=${pre.reason} path=${urlPath || "/"} sims=${targetSims.length}`); return wjson({ ok: false, reason: pre.reason, error: pre.message, projectId }, pre.status) }

        // No sims to review (all gates a–e passed) → return success without consuming a budget slot.
        if (targetSims.length === 0) return wjson({ ok: true, projectId, reviews: [] }, 200)

        // All of a–e passed → atomically consume one budget slot (f).
        const proj = await projectById(projectId)
        const budget = proj?.reviewBudgetDaily ?? 0
        const day = reviewDay()
        const budgetConsumed = await tryConsumeReviewBudget(projectId, day, budget ?? 0)
        const gate = reviewGate({ authed: true, reviewMode, consentStatus, allowlistMatch: !!allowlist, alreadyReviewed: allSeen, budgetConsumed, adhoc })
        if (!gate.ok) {
          if (gate.reason === "budgetExhausted") {
            // auto-pause the project + notify the admin (§5 cost guard).
            await setReviewMode(projectId, "paused")
            await insertActivity({ projectId, type: "admin_notify", actorEmail: meR, urlHost, urlPath, meta: { reason: "budget_exhausted", day, budget } })
            // JTBD 3.11 — don't dead-end the member with "try again tomorrow". Tell them WHY the
            // project paused and hand them a one-click "request resume" path (POST /api/sim/request-
            // resume) that notifies a project admin. Admins can also resume directly from Settings.
            console.log(`[review] blocked reason=budgetExhausted path=${urlPath || "/"}`)
            const base = (process.env.KLAV_BASE_URL || "").replace(/\/+$/, "")
            return wjson({
              ok: false, reason: "budgetExhausted", projectId,
              error: "Daily Sim budget reached — this project's reviews are paused. Ask an admin to resume, or raise the daily budget in Settings.",
              canRequestResume: true,
              requestResumeUrl: "/api/sim/request-resume",
              settingsUrl: base ? `${base}/dashboard?project=${encodeURIComponent(projectId)}#settings` : null,
            }, gate.status)
          }
          console.log(`[review] blocked reason=${gate.reason} path=${urlPath || "/"}`)
          return wjson({ ok: false, reason: gate.reason, error: gate.message, projectId }, gate.status)
        }

        // ── ALL GATES PASSED. Only now do we review. ──
        console.log(`[review] running sims=${targetSims.length} path=${urlPath || "/"}`)
        const benchGatesAt = Date.now()
        if (!screenshotDataUrl) return wjson({ ok: false, reason: "noScreenshot", error: "screenshotDataUrl is required." }, 400)
        const decoded = decodeDataUrlLib(screenshotDataUrl)
        if (!decoded) return wjson({ ok: false, reason: "badScreenshot", error: "screenshotDataUrl could not be decoded." }, 400)

        // Store the screenshot PRIVATE (acl='private') + record the durable ledger row (P0).
        // Non-fatal: if S3 is not configured (e.g. test/dev env), review proceeds with a
        // placeholder screenshotId so the observation pipeline still runs end-to-end.
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // private Sim screenshots: 30-day (§6)
        let screenshotId: string
        try {
          const upload = await uploadScreenshotMeta(decoded.bytes, decoded.contentType, "private")
          screenshotId = await insertScreenshot({
            projectId, s3Key: upload.key, bucket: upload.bucket, contentType: upload.contentType,
            acl: "private", bytes: decoded.bytes.byteLength, ownerEmail: meR, expiresAt,
          })
        } catch (e: any) {
          // S3 not configured — use a placeholder so the review pipeline still executes.
          console.warn("[review] screenshot storage skipped (no S3):", e?.message || e)
          screenshotId = "no-s3-" + Date.now().toString(36)
        }
        const benchScreenshotAt = Date.now()

        // Run all Sim reviews via the extracted lib function. Each Sim reacts to the page,
        // observations are session-deduped by hash, feedback rows are inserted/bumped, and the
        // expectations spine is updated. Recurring issues carry RecurrenceMemory (KLA-2).
        const activeIndexes = activeReviewIndexes(seenKeys, reviewSeen, adhoc)
        const benchReviewStart = Date.now()
        const reviews = await runSimReviews({
          projectId, urlPath, urlHost, pageUrl, imageB64: decoded.base64, mediaType: decoded.contentType,
          targetSims: activeIndexes.map((i) => targetSims[i]),
          actorEmail: meR, screenshotId,
          seenKeys: activeIndexes.map((i) => seenKeys[i]),
          seenHashes, sessionId: sessionId ?? undefined, mode,
          adhoc,  // bypass seenHashes + near-dup dedup for manual/boot deploys
          reactFn: (sim, b64, mt, pu) => reactToPage(sim, b64, mt, pu, { email: meR, projectId }),
          resolveCitationsFn: resolveCitations,
          // autoCopy intentionally omitted: Sim findings are triage-gated. Auto-copy fires on
          // PATCH /api/feedback/:id when a member accepts (status → open), not on Sim insert.
          markSeen: markReviewSeen,
          db: db ?? null,
        })
        const benchReviewDoneAt = Date.now()

        // Persist a lightweight sim_runs record for run history and dashboard correlation.
        // Best-effort — a record failure never fails the HTTP response.
        if (db) {
          try {
            // PostHog activation: first_sim_run — check BEFORE inserting the new row.
            const priorRunCount = await db.execute({
              sql: "SELECT COUNT(*) AS n FROM sim_runs WHERE project_id=?",
              args: [projectId],
            }).then((r: any) => Number(r.rows[0]?.n ?? 0)).catch(() => 1)
            await insertSimRun({
              projectId, url: pageUrl,
              simIds: reqSimIds.length ? reqSimIds : null,  // null = all Sims
              screenshotId, reactions: reviews,
              actorEmail: meR, status: "done", finishedAt: Date.now(),
            })
            if (priorRunCount === 0) {
              void capturePosthog(meR ?? "server", "first_sim_run", { project_id: projectId })
            }
          } catch (e: any) { console.warn("[review] sim_runs insert skipped:", e?.message || e) }
        }
        const benchRunInsertAt = Date.now()

        const { simCount, totalObservations } = buildSimRunSummary(reviews)
        const timing = {
          bodyMs: benchBodyReadAt - benchStart,
          gatesMs: benchGatesAt - benchBodyReadAt,
          screenshotMs: benchScreenshotAt - benchGatesAt,
          reviewMs: benchReviewDoneAt - benchReviewStart,
          receiveToReviewDoneMs: benchReviewDoneAt - benchStart,
          runInsertMs: benchRunInsertAt - benchReviewDoneAt,
          totalMs: benchRunInsertAt - benchStart,
        }
        console.log(
          `[bench-sim-review] server project=${projectId} path=${urlPath || "/"} sims=${targetSims.length} ` +
          `active=${activeIndexes.length} reviewed=${simCount} observations=${totalObservations} ` +
          `bodyMs=${timing.bodyMs} gatesMs=${timing.gatesMs} screenshotMs=${timing.screenshotMs} ` +
          `reviewMs=${timing.reviewMs} receiveToReviewDoneMs=${timing.receiveToReviewDoneMs} ` +
          `runInsertMs=${timing.runInsertMs} totalMs=${timing.totalMs}`,
        )
        console.log(`[review] done path=${urlPath || "/"} sims_reviewed=${simCount} observations=${totalObservations}`)
        return wjson({ ok: true, projectId, screenshotId, reviews, timing: { simReview: timing } })
      } catch (e: any) {
        return wjson({ ok: false, reason: "error", error: e?.message || "review failed" }, 500)
      }
    }

    // ── GET /api/sims — list project Sims for the widget/extension Sim picker (Dev 6 menu). ──
    // Returns the lightweight summary the picker needs: id, name, initials, accent, role.
    // Auth: cookie OR Bearer (same as /api/personas but at the /api/sims path so Dev 6 has a
    // stable contract without coupling to the Sim Studio /api/personas shape).
    if (req.method === "GET" && path === "/api/sims") {
      const meS2 = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meS2) return json({ error: "Sign in to continue." }, 401)
      const projS = await resolveProject(meS2, url.searchParams.get("project"))
      if (!projS) return json({ error: "No accessible project." }, 404)
      const personas = await listPersonas(projS.id)
      const sims = personas.map((p) => ({ id: p.id, name: p.name, initials: p.initials ?? null, accent: p.accent ?? null, role: p.role ?? null }))
      return json({ sims })
    }

    // ── /api/sims/runs — Sim run history (v1 manual trigger). Auth: cookie OR Bearer. ──
    // GET /api/sims/runs?project=<id>&limit=<n>  — list recent runs for a project (default 20).
    // GET /api/sims/runs/:runId                  — fetch a single run with full reactions payload.
    if (path === "/api/sims/runs" || path.startsWith("/api/sims/runs/")) {
      const meS = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meS) return json({ error: "Sign in to continue." }, 401)
      if (!db) return json({ error: "Database unavailable." }, 503)

      const runIdMatch = path.match(/^\/api\/sims\/runs\/([^/]+)$/)

      // GET /api/sims/runs/:runId/diff — what changed versus the previous done run of the SAME url
      // (JTBD 3.8, Loop B). Returns { current, previous, diff:{ newFindings, resolvedFindings, changedReactions } }.
      const runDiffMatch = path.match(/^\/api\/sims\/runs\/([^/]+)\/diff$/)
      if (req.method === "GET" && runDiffMatch) {
        const run = await getSimRun(runDiffMatch[1])
        if (!run) return json({ error: "Run not found." }, 404)
        const access = await projectAccess(meS, run.projectId)
        if (!access) return json({ error: "Access denied." }, 403)
        const prev = await previousSimRunForUrl(run.projectId, run.url, run.createdAt, run.id)
        const diff = diffSimRuns(run.reactions, prev ? prev.reactions : null)
        return json({
          current: { id: run.id, url: run.url, createdAt: run.createdAt },
          previous: prev ? { id: prev.id, url: prev.url, createdAt: prev.createdAt } : null,
          diff,
        })
      }

      if (req.method === "GET" && runIdMatch) {
        const runId = runIdMatch[1]
        const run = await getSimRun(runId)
        if (!run) return json({ error: "Run not found." }, 404)
        // Project-access gate: caller must have access to the run's project.
        const access = await projectAccess(meS, run.projectId)
        if (!access) return json({ error: "Access denied." }, 403)
        return json({ run })
      }

      if (req.method === "GET" && path === "/api/sims/runs") {
        const projR = await resolveProject(meS, url.searchParams.get("project"))
        if (!projR) return json({ error: "No accessible project." }, 404)
        const limitRaw = Number(url.searchParams.get("limit") || "20")
        const limit = Math.max(1, Math.min(limitRaw, 100))
        const runs = await listSimRuns(projR.id, limit)
        return json({ runs })
      }
    }

    // ── transcripts → list (Sim Studio col 1) — project-scoped; cookie OR Bearer; newest-first by sourceDate ──
    if (req.method === "GET" && path === "/api/transcripts") {
      const me2 = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!me2) return json({ error: "Sign in to continue." }, 401)
      const proj2 = await resolveProject(me2, url.searchParams.get("project"))
      if (!proj2) return json({ error: "No project." }, 400)
      const transcripts = await listTranscripts(proj2.id)
      return json({ transcripts }, 200)
    }

    // ── transcripts → reconcile (P3a) — project-scoped via resolveProject; cookie OR Bearer; admin or member ──
    if (req.method === "POST" && path === "/api/transcripts") {
      const meT = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meT) return json({ error: "Sign in to continue." }, 401)
      const projT = await resolveProject(meT, url.searchParams.get("project"))
      if (!projT) return json({ error: "No project." }, 400)
      const projectId = projT.id
      // M5: rate-limit this 2-LLM-call endpoint per user AND per project (it has no daily budget gate).
      if (!rlAllow(`tx:u:${meT}`, TRANSCRIPT_PER_USER, TRANSCRIPT_WINDOW) || !rlAllow(`tx:p:${projectId}`, TRANSCRIPT_PER_PROJECT, TRANSCRIPT_WINDOW))
        return json({ error: "Too many transcript submissions. Please wait and try again." }, 429, { "Retry-After": "3600" })
      try {
        const body = await req.json().catch(() => ({}))
        const text = String(body.transcript || body.raw_text || "").trim()
        if (text.length < 20) return json({ error: "Transcript too short" }, 400)
        if (text.length > TRANSCRIPT_MAX_CHARS) return json({ error: `Transcript too large (max ${TRANSCRIPT_MAX_CHARS.toLocaleString()} characters).` }, 413)
        const title = body.title ? String(body.title) : null
        const sourceDate = Number(body.sourceDate || body.source_date) || Date.now()

        // 1) persist the transcript (provenance anchor for every trait it produces).
        const transcriptId = await insertTranscript({
          projectId, title, rawText: text, sourceDate,
          speakers: Array.isArray(body.speakers) ? body.speakers.map(String) : null, addedBy: meT,
        })
        // activity: a transcript was added to the project (actor = adder).
        await insertActivity({ projectId, type: "transcript_added", actorEmail: meT, meta: { transcriptId, title } })

        // 2) AI CALL #1: extract personas from the transcript (existing helper).
        const { data: extractData, usage: extractUsage } = await extractPersonas(text, { email: meT, projectId })
        const extracted: any[] = Array.isArray(extractData?.personas) ? extractData.personas : []

        // 3) conservative match → existing project Sims. Confident → auto-apply; fuzzy/ambiguous → needsConfirm.
        const sims = (await listPersonas(projectId)).map((p) => ({ id: p.id, name: p.name, role: p.role }))
        const matched: { simId: string }[] = []
        const needsConfirm: { name: string; candidates: { simId: string; name: string; role: string }[] }[] = []
        for (const p of extracted) {
          const m = matchPersonaToSim({ name: String(p?.name || ""), role: p?.role ? String(p.role) : undefined }, sims)
          if (m && "simId" in m) matched.push({ simId: m.simId })
          else if (m && "needsConfirm" in m) needsConfirm.push(m.needsConfirm)
        }
        // de-dup matched Sims (two extracted personas could both map to one Sim — reconcile it once).
        const matchedSimIds = [...new Set(matched.map((m) => m.simId))]

        // KLA-255: persist needsConfirm items so they appear in the confirmation queue.
        // Fire-and-forget (non-fatal) — the response still carries them for immediate UI use.
        for (const nc of needsConfirm) {
          insertPendingSimMatch({
            projectId,
            transcriptId,
            personaName: nc.name,
            candidates: nc.candidates,
          }).catch((e: any) => console.warn("insertPendingSimMatch failed (non-fatal):", e?.message || e))
        }

        // 4) AI CALL #2 (per matched Sim, gated): reconcileSim → applyReconcileOps → persist + audit + cache.
        let opsApplied = 0
        const reconcileUsages: any[] = []
        for (const simId of matchedSimIds) {
          if (await hasReconcileRun(simId, transcriptId)) continue // COST GUARD: never re-reconcile a (sim,transcript) pair
          // Legacy backfill BEFORE reconcile: a pre-P3a Sim has insights_json but zero sim_traits.
          // Seed them first so the LLM reconcile sees existing traits (real reinforce/refine/contradict
          // evolution) and rebuildInsightsJson never wipes the Sim's prior insights. Idempotent.
          await ensureTraitsSeeded(simId)
          const current = await listTraits(simId, { activeOnly: true })
          // Feed the recently-resolved traits to RECONCILE_SYS so it can emit `reopen` targeting
          // the same trait id when a previously-resolved issue resurfaces.
          const recentlyResolved = await getRecentlyResolvedTraits(simId)
          const { ops, usage } = await reconcileSim(current, text, { email: meT, projectId, recentlyResolved })
          reconcileUsages.push(usage)
          // Ensure reopen target traits are included in the set passed to applyReconcileOps so they
          // can be reactivated. They are not in `current` (activeOnly) so we load them separately.
          const reopenIds = new Set(ops.filter((o) => o.op === "reopen" && o.traitId).map((o) => o.traitId!))
          let traitsForApply = current
          if (reopenIds.size > 0) {
            const allTraits = await listTraits(simId) // all statuses
            const resolvedTargets = allTraits.filter((t) => reopenIds.has(t.id) && t.status !== "active")
            traitsForApply = [...current, ...resolvedTargets]
          }
          const res = applyReconcileOps(traitsForApply, ops, { simId, projectId, transcriptId, sourceDate, rawText: text })
          for (const w of res.traitWrites) {
            if (w.mode === "insert") await insertTrait(w.trait)
            else await updateTrait(w.trait)
          }
          for (const e of res.traitEvents) await insertTraitEvent(e)
          await markReconcileRun(simId, transcriptId)
          await rebuildInsightsJson(simId)
          opsApplied += res.traitWrites.length
          await insertActivity({ projectId, type: "sim_evolved", actorEmail: meT, simId, meta: { transcriptId, ops: res.traitWrites.length } })
          // B.6 unified regression alarm — SIM-REOPEN detector: the reconcile emitted a `reopen` op,
          // meaning a Sim raised a previously-resolved complaint again. Publish into the shared
          // regression stream (deduped per issue) → dashboard banner + Slack/email within the hour.
          if (db && reopenIds.size > 0) {
            for (const traitId of reopenIds) {
              const reopened = res.traitWrites.find((w) => w.trait.id === traitId)
              void publishRegressionEvent({
                projectId, issueKey: `sim-reopen:${simId}:${traitId}`, source: "sim-reopen",
                title: (reopened?.trait?.text || "resolved complaint resurfaced").slice(0, 200),
                feedbackId: null, at: Date.now(), baseUrl: process.env.KLAV_BASE_URL || "",
                evidence: { simId, traitId, transcriptId },
              }, { db }).catch(() => {})
            }
          }
        }

        return json({
          transcriptId,
          matched: matchedSimIds,
          opsApplied,
          needsConfirm,
          usage: { extract: extractUsage, reconcile: reconcileUsages },
        }, 201)
      } catch (e: any) { return json(oops(e, "transcript"), 500) }
    }

    // ── Sim evolution timeline (P3a step 3) — project-scoped; cookie OR Bearer; admin or member. ──
    // Returns this Sim's trait_events newest-first (what changed + new text + driving quote/transcript/date),
    // enriched with the originating transcript's title so the studio can render the "Evolution" timeline.
    // Graceful: a Sim with no transcript-driven history returns an empty events array.
    {
      const evoMatch = path.match(/^\/api\/sims\/([^/]+)\/evolution$/)
      if (req.method === "GET" && evoMatch) {
        const meE = (await sessionEmail(req)) || (await bearerEmail(req))
        if (!meE) return json({ error: "Sign in to continue." }, 401)
        const projE = await resolveProject(meE, url.searchParams.get("project"))
        if (!projE) return json({ error: "No project." }, 400)
        const simId = evoMatch[1]
        // Authorize: the Sim must belong to the resolved project (no cross-project leakage).
        const sims = await listPersonas(projE.id)
        const sim = sims.find((p) => p.id === simId)
        if (!sim) return json({ error: "Not found" }, 404)
        try {
          const events = await listTraitEvents(simId) // ASC from db
          // Map transcript_id → title for human-readable provenance ("from <transcript>, <date>").
          const titleById = new Map<string, string | null>()
          for (const tr of await listTranscripts(projE.id)) titleById.set(tr.id, tr.title)

          // Compute per-trait recurrence so we can annotate each event with a regression marker.
          // Group events by traitId (already ASC), then re-scan to detect post-resolution raises.
          const eventsByTrait = new Map<string, TraitEventRow[]>()
          for (const e of events) {
            const arr = eventsByTrait.get(e.traitId) ?? []
            arr.push(e)
            eventsByTrait.set(e.traitId, arr)
          }
          // For each trait, compute which events are the "regression" event (first raise after a resolve).
          // Key is composite "traitId:createdAt" to avoid collision when two events share a timestamp.
          const regressionEventKeys = new Set<string>()
          for (const [traitId, traitEvents] of eventsByTrait) {
            const rec = recurrenceFromEvents(traitEvents)
            if (!rec.regressed || rec.priorResolvedAt == null) continue
            // The regression event is the first raise-op event whose sourceDate > priorResolvedAt.
            const RAISE_OPS_SET = new Set(["create", "reinforce", "refine", "reopen"])
            for (const te of traitEvents) {
              if (RAISE_OPS_SET.has(te.op) && te.sourceDate > rec.priorResolvedAt) {
                regressionEventKeys.add(`${te.traitId}:${te.createdAt}`)
                break
              }
            }
          }

          const timeline = events
            .slice()
            .reverse() // newest-first for the timeline view
            .map((e) => ({
              op: e.op,
              traitId: e.traitId,
              afterText: e.afterText,
              beforeText: e.beforeText,
              quote: e.quote,
              speaker: e.speaker,
              sourceDate: e.sourceDate,
              transcriptId: e.transcriptId,
              transcriptTitle: titleById.has(e.transcriptId) ? titleById.get(e.transcriptId) : null,
              reason: e.reason,
              createdAt: e.createdAt,
              actor: e.actor ?? null,
              area: e.area ?? null,
              issueType: e.issueType ?? null,
              priority: e.priority ?? null,
              // isRegression: true marks a post-resolution reopen/reinforce so the UI can highlight it.
              isRegression: regressionEventKeys.has(`${e.traitId}:${e.createdAt}`),
            }))
          return json({ simId, name: sim.name, events: timeline })
        } catch (e: any) { return json(oops(e, "evolution"), 500) }
      }
    }

    // ── Sim Studio: versioned trait editing (list / manual create) — project-scoped, cookie OR Bearer ──
    {
      const m = path.match(/^\/api\/sims\/([^/]+)\/traits$/)
      if (m && (req.method === "GET" || req.method === "POST")) {
        const me2 = (await sessionEmail(req)) || (await bearerEmail(req))
        if (!me2) return json({ error: "Sign in to continue." }, 401)
        const proj2 = await resolveProject(me2, url.searchParams.get("project"))
        if (!proj2) return json({ error: "No project." }, 400)
        const simId = m[1]
        // Access control (C1): trait routes are keyed only by sim id — verify the Sim belongs to the
        // caller's resolved project before reading or writing its traits (no cross-tenant IDOR).
        if (!(await listPersonas(proj2.id)).some(p => p.id === simId)) return json({ error: "Not found" }, 404)
        if (req.method === "POST") {
          const body = await req.json().catch(() => ({}))
          const kind = ["pain", "want", "love"].includes(body.kind) ? body.kind : "pain"
          const now = Date.now()
          const trait = {
            id: "trait_" + crypto.randomUUID(), simId, projectId: proj2.id,
            kind, text: String(body.text || "").trim(), status: "active" as const, strength: 1,
            srcTranscriptId: String(body.srcTranscriptId || "manual"),
            srcQuote: String(body.srcQuote || ""), srcQuoteOffset: null,
            srcSpeaker: body.srcSpeaker ? String(body.srcSpeaker) : null,
            area: body.area ? String(body.area) : null, issueType: null,
            priority: body.priority ? String(body.priority) : null,
            createdAt: now, updatedAt: now,
          }
          if (!trait.text) return json({ error: "text required" }, 400)
          await logTraitEdit({ op: "manual_create", trait, beforeText: null, actor: me2, now })
          return json({ trait }, 201)
        }
        const traits = await listTraits(simId, { activeOnly: true })
        return json({ simId, traits })
      }
    }
    // ── Sim Studio: edit / soft-archive a single trait (versioned) — project-scoped ──
    {
      const m = path.match(/^\/api\/sims\/([^/]+)\/traits\/([^/]+)$/)
      if (m && (req.method === "PUT" || req.method === "DELETE")) {
        const me2 = (await sessionEmail(req)) || (await bearerEmail(req))
        if (!me2) return json({ error: "Sign in to continue." }, 401)
        const proj2 = await resolveProject(me2, url.searchParams.get("project"))
        if (!proj2) return json({ error: "No project." }, 400)
        const [, simId, traitId] = m
        // Access control (C1): verify the Sim belongs to the caller's project before editing/archiving
        // its traits — listTraits is keyed only by sim id, so without this an attacker could mutate
        // another tenant's traits by id (cross-tenant IDOR).
        if (!(await listPersonas(proj2.id)).some(p => p.id === simId)) return json({ error: "Not found" }, 404)
        const current = (await listTraits(simId)).find(t => t.id === traitId)
        if (!current) return json({ error: "Trait not found." }, 404)
        const now = Date.now()
        if (req.method === "DELETE") {
          await logTraitEdit({ op: "manual_archive", trait: { ...current, status: "archived", updatedAt: now }, beforeText: current.text, actor: me2, now })
          return json({ ok: true })
        }
        const body = await req.json().catch(() => ({}))
        const next = {
          ...current,
          text: body.text != null ? String(body.text).trim() : current.text,
          kind: ["pain", "want", "love"].includes(body.kind) ? body.kind : current.kind,
          priority: body.priority != null ? String(body.priority) : current.priority,
          area: body.area != null ? String(body.area) : current.area,
          updatedAt: now,
        }
        await logTraitEdit({ op: "edit", trait: next, beforeText: current.text, actor: me2, now })
        return json({ trait: next })
      }
    }

    // ── Sim source transcripts (the calls that shaped this Sim) — project-scoped, read-only ──
    const simTxMatch = path.match(/^\/api\/sims\/([^/]+)\/transcripts$/)
    if (req.method === "GET" && simTxMatch) {
      const meST = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meST) return json({ error: "Sign in to continue." }, 401)
      const projST = await resolveProject(meST, url.searchParams.get("project"))
      if (!projST) return json({ error: "No project." }, 400)
      const sim = (await listPersonas(projST.id)).find(p => p.id === simTxMatch[1])
      if (!sim) return json({ error: "Not found" }, 404)
      try { return json({ simId: sim.id, transcripts: await sourceTranscriptsForSim(sim.id, projST.id) }) }
      catch (e: any) { return json(oops(e, "transcripts"), 500) }
    }
    // ── Sim Profile aggregate: persona + traits + feedback(w/ triage outcome) + source transcripts ──
    // One round-trip for the /sim/:id page. Reuses the same helpers Sim Studio uses; the Sim must
    // belong to the caller's resolved project (no cross-tenant IDOR — same guard as the trait routes).
    const simProfileMatch = path.match(/^\/api\/sims\/([^/]+)\/profile$/)
    if (req.method === "GET" && simProfileMatch) {
      const meSP = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meSP) return json({ error: "Sign in to continue." }, 401)
      const projSP = await resolveProject(meSP, url.searchParams.get("project"))
      if (!projSP) return json({ error: "No project." }, 400)
      try {
        const sim = (await listPersonas(projSP.id)).find(p => p.id === simProfileMatch[1])
        if (!sim) return json({ error: "Not found" }, 404)
        const [traits, feedback, transcripts] = await Promise.all([
          listTraits(sim.id, { activeOnly: true }),
          listFeedbackForSim(projSP.id, sim.id),
          sourceTranscriptsForSim(sim.id, projSP.id),
        ])
        // JTBD 3.13: per-Sim precision — accepted / (accepted + dismissed) of its triaged findings.
        const acceptRate = simAcceptRate(feedback)
        return json({ sim, traits, feedback, transcripts, acceptRate })
      } catch (e: any) { return json(oops(e, "profile"), 500) }
    }
    // ── One transcript's raw text — project-scoped, read-only ──
    const txMatch = path.match(/^\/api\/transcripts\/([^/]+)$/)
    if (req.method === "GET" && txMatch) {
      const meT2 = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meT2) return json({ error: "Sign in to continue." }, 401)
      const projT2 = await resolveProject(meT2, url.searchParams.get("project"))
      if (!projT2) return json({ error: "No project." }, 400)
      const tr = await transcriptById(projT2.id, txMatch[1])
      if (!tr) return json({ error: "Not found" }, 404)
      return json({ id: tr.id, title: tr.title, rawText: tr.rawText, sourceDate: tr.sourceDate, addedBy: tr.addedBy, speakers: tr.speakers })
    }

    // Public widget appearance config (non-sensitive; project-scoped). Lets the widget theme itself pre-auth.
    // When ?admin=1 is present the request is from the admin UI and must fall through to the session-gated
    // projMatch block which returns { modalConfig, pro } — do NOT handle it here.
    {
      const m = path.match(/^\/api\/projects\/([^/]+)\/config$/)
      if (req.method === "GET" && m && new URL(req.url).searchParams.get("admin") !== "1") {
        // CORS-open: the widget fetches this cross-origin from the customer's own site to theme
        // itself and learn its report gate BEFORE any auth. Non-sensitive, project-scoped.
        const proj = await projectById(m[1])
        if (!proj) return json({ error: "Not found." }, 404, WIDGET_CORS)
        // turnstileSiteKey (public by design) tells the widget whether to render a Turnstile challenge
        // on the anonymous submit path. Empty string when Turnstile isn't provisioned → widget skips it.
        return json({ modalConfig: resolveModalConfig(await getProjectModalConfig(m[1])), widget: (await getWidgetConfig(m[1])) || { mode: "support", ctaUrl: "https://klavity.in/onboarding", reportGate: "anonymous" }, turnstileSiteKey: turnstileSiteKey() }, 200, WIDGET_CORS)
      }
    }

    // ── GTM funnel ingest — KLAVITYKLA-327 ──────────────────────────────────────────────────────────
    // Anonymous; rate-limited per IP. Accepts only CLIENT_INGESTABLE events so clients can't fake
    // server-owned conversion events (check_completed, lead_captured, …).
    if (req.method === "POST" && path === "/api/track") {
      const ip = clientIp(req, server)
      if (!rlAllow(`track:ip:${ip}`, 60, 60_000)) return json({ error: "rate limited" }, 429)
      const CRO_MAX = 2_048
      const parsed = await readJsonLimited(req, CRO_MAX)
      if (!parsed.ok) return json({ error: parsed.error }, parsed.status)
      const b = parsed.data as Record<string, unknown>
      const event = String(b.event ?? "")
      if (!CLIENT_INGESTABLE.includes(event)) return json({ error: "Unknown event." }, 400)
      const anonId = b.anonId ? String(b.anonId).slice(0, 64) : undefined
      const bodyUrl = b.url ? String(b.url).slice(0, 500) : undefined
      const source = b.source ? String(b.source).slice(0, 100) : undefined
      const referrer = b.referrer ? String(b.referrer).slice(0, 500) : undefined
      const props = b.props && typeof b.props === "object" && !Array.isArray(b.props) ? b.props as Record<string, unknown> : undefined
      void trackFunnel(db!, { event: event as any, anonId, url: bodyUrl, source, referrer, props })
      return json({ ok: true })
    }

    // ── CRO / Vibe Check free tool — KLAVITYKLA-327 (mode=cro, default) ─────────────────────────────
    // ── Bug Check free tool — KLAVITYKLA-341 (mode=qa) ───────────────────────────────────────────────
    // POST /api/cro/analyze — SSRF-guarded page fetch + AI analysis. Anonymous (no login).
    // `mode` in the JSON body selects the prompt/response contract: default/omitted = "cro" (the
    // ORIGINAL, unchanged friction behaviour — /cro is unaffected), "qa" = breakage-hunting variant
    // for /bug-check. Both share the same fetch pipeline, SSRF guard, per-IP rate limit, and spend
    // caps below — only the system prompt and response shape differ by mode.
    if (req.method === "POST" && path === "/api/cro/analyze") {
      const ip = clientIp(req, server)
      if (!rlAllow(`cro:ip:${ip}`, 10, 60_000)) return json({ error: "Too many requests. Please try again in a minute." }, 429)
      const parsed = await readJsonLimited(req, 4_096)
      if (!parsed.ok) return json({ error: parsed.error }, parsed.status)
      const b = parsed.data as Record<string, unknown>
      const mode: "cro" | "qa" = b.mode === "qa" ? "qa" : "cro"
      let siteUrl = String(b.url ?? "").trim()
      if (!siteUrl) return json({ error: "Enter your site URL." }, 400)
      if (!/^https?:\/\//i.test(siteUrl)) siteUrl = "https://" + siteUrl
      const anonId = b.anonId ? String(b.anonId).slice(0, 64) : undefined
      const source = b.source ? String(b.source).slice(0, 100) : undefined
      const referrer = b.referrer ? String(b.referrer).slice(0, 500) : undefined
      // KLAVITYKLA-342 (determinism): a user who re-runs the same scan must get the same answer.
      // Serve an identical, already-computed result for a short window instead of re-rolling the
      // model. Also makes a Reddit spike on one URL cost exactly one LLM call.
      const cacheKey = `${mode}|${siteUrl}`
      const cached = mode === "qa" ? analyzeCacheGet(cacheKey) : null
      if (cached) {
        void trackFunnel(db!, { event: "check_completed", anonId, url: siteUrl, source, referrer, props: { ...cached.props, cached: true } })
        return json(cached.body)
      }

      let siteText = ""
      let siteHtml = ""
      try {
        const res = await safeFetch(siteUrl, { headers: { "user-agent": "KlavityBot/1.0 (+https://klavity.in)" }, signal: AbortSignal.timeout(8_000) }, { allowLoopbackInTest: true })
        if (!res.ok) return json({ error: `Couldn't read that page (HTTP ${res.status}).` }, 400)
        const html = (await res.text()).slice(0, 300_000)
        siteHtml = html
        siteText = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&[a-z#0-9]+;/gi, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, AI_DEMO_MAX_CHARS)
      } catch {
        return json({ error: "Couldn't reach that URL. Make sure it's a public https page." }, 400)
      }
      if (siteText.length < 40) return json({ error: "That page didn't have enough text to analyse." }, 400)

      // KLAVITYKLA-341 LAUNCH-BLOCKING: free-tool daily sub-cap. A bounded slice of the shared
      // OPS_DAILY_CAP_USD budget, reserved BEFORE (and gating) the LLM call below — a viral Reddit
      // spike on /bug-check or /cro can only ever consume this slice, never starve paid Sims/
      // AutoSims of the rest of today's budget. Denial short-circuits before chat() runs, so no
      // budget (free-tool OR global) is touched by a blocked request.
      const freetoolEst = DEFAULT_AI_CALL_EST_USD
      if (!(await tryReserveFreeToolSpend(freetoolEst, FREETOOL_DAILY_CAP_USD))) {
        console.warn(`[freetool-cap] BLOCKED ${mode} analyze — daily free-tool budget $${FREETOOL_DAILY_CAP_USD} reached (ip=${ip})`)
        return json({ error: "The scanner is busy right now — please try again in a few minutes." }, 429)
      }

      // ── KLAVITYKLA-342: mechanical link verification (qa mode only) ────────────────────────────
      // The model used to be handed tag-stripped text and asked to spot "broken links" — it can't
      // know, and it was wrong on real sites (flagged a link that returns 200). We resolve the
      // page's real hrefs OURSELVES and only ever report the ones that actually fail; the model is
      // told link health is already covered, and any link claim it makes anyway is dropped below.
      const inventory = mode === "qa" ? extractInventory(siteHtml) : null
      let linkChecks: Awaited<ReturnType<typeof verifyLinks>> = []
      if (mode === "qa") {
        const links = extractLinks(siteHtml, siteUrl, MAX_LINKS_CHECKED)
        linkChecks = await verifyLinks(
          links,
          (u, init) => safeFetch(u, init, { allowLoopbackInTest: true }),
        ).catch(() => [])
      }
      const verifiedBroken = brokenLinkFindings(linkChecks)

      const sys = mode === "qa"
        ? "You are a QA engineer reviewing a live web page for USER-FACING BREAKAGE — things that are visibly " +
          "broken for a real visitor, not conversion-copy nitpicks. Analyse the page text and identify SPECIFIC " +
          "breakage: obvious error states " +
          "(e.g. \"undefined\", \"NaN\", stack traces, 404/500 text leaked into the page), layout/content that " +
          "looks collapsed or duplicated, empty or placeholder states shown where real content should be, and " +
          "other signs the page is not working as intended. Do NOT report conversion/marketing friction (that's a " +
          "different tool) — only report things that look genuinely BROKEN. NEVER report links as broken, dead or " +
          "404: every link on this page has already been resolved mechanically by a separate checker, so any link " +
          "claim from you would be a guess and will be discarded. NEVER report a finding that is merely an " +
          "inventory of an element that exists (e.g. \"'Log in' link\", \"'Sign up' button\") — an element merely " +
          "being present is not a bug. Report a finding ONLY if the page text itself is evidence it is broken; if " +
          "you are not sure, leave it out. Returning zero findings for a healthy page is the correct answer. " +
          // KLAVITYKLA-342 (false positives): every finding must carry a VERBATIM quote from the
          // supplied page text. The server re-checks that the quote actually occurs in the page and
          // DISCARDS any finding whose quote it cannot find, so speculation is not merely
          // discouraged here — it is mechanically unable to reach the user.
          "EVERY finding MUST include an \"evidence\" field containing a VERBATIM, character-for-character " +
          "quote (at least 6 characters) COPIED from the page text above that demonstrates the breakage. Do not " +
          "paraphrase, summarise, translate or invent the quote. If you cannot copy an exact quote from the page " +
          "text proving the problem, DO NOT report that finding — a finding without a real quote will be " +
          "automatically discarded. Never speculate about behaviour you cannot see in the text (what happens on " +
          "click, whether a form submits, whether an image loads, what a script does). " +
          "For each finding give: what broke " +
          "(short, ≤10 words), where it is (a CSS selector, element description, or the exact visible text near " +
          "it — ≤80 chars), the verbatim evidence quote, why a real user would care (one sentence), and a " +
          "severity (high/medium/low). " +
          "Respond with ONLY valid JSON: {\"findings\":[{\"what\":string,\"where\":string,\"evidence\":string," +
          "\"why\":string,\"severity\":\"high\"|\"medium\"|\"low\"}]} with 0-8 findings (0 if the page looks healthy). " +
          "No prose outside the JSON."
        : "You are a conversion-rate optimisation (CRO) expert reviewing a web page for friction. " +
          "Analyse the page text and identify SPECIFIC friction points that reduce conversion. " +
          "For each, provide: a short title (≤8 words), severity (high/medium/low), and a one-sentence fix. " +
          "Focus on: unclear CTAs, missing social proof, confusing copy, friction in the signup/purchase flow, " +
          "missing value proposition, and mobile-unfriendly patterns. " +
          "Respond with ONLY valid JSON: {\"frictions\":[{\"title\":string,\"severity\":\"high\"|\"medium\"|\"low\",\"fix\":string}]} " +
          "with 4-8 friction items. No prose outside the JSON."
      let content = ""
      try {
        ;({ content } = await chat(
          [{ role: "system", content: sys }, { role: "user", content: `Page URL: ${siteUrl}\n\nPage text:\n${siteText}` }],
          800, true, mode === "qa"
            // Determinism (KLAVITYKLA-342): pin BOTH the model and the temperature. The default
            // path weight-picks a model at random per call, which alone made two identical scans
            // disagree (0 findings vs 8). /cro keeps the original random-routing behaviour.
            ? { type: "bugcheck-analyze", email: null, model: MODEL, temperature: 0 }
            : { type: "cro-analyze", email: null },
        ))
      } catch (e: any) {
        // The reservation above never converted into a real LLM spend — release it back to today's slice.
        void reconcileFreeToolSpend(freetoolEst, 0).catch(() => {})
        console.error(`[${mode}/analyze] AI call failed:`, e?.message || e)
        return json({ error: "Analysis failed. Please try again." }, 503)
      }
      const data = parseJSON(content)

      if (mode === "qa") {
        const modelFindings: Array<{ what: string; where: string; why: string; severity: string; evidence?: string }> = (data.findings ?? [])
          .slice(0, 8)
          .map((f: any) => ({
            what: String(f.what ?? "").slice(0, 100),
            where: String(f.where ?? "").slice(0, 120),
            why: String(f.why ?? "").slice(0, 200),
            evidence: String(f.evidence ?? "").slice(0, 200),
            severity: ["high", "medium", "low"].includes(String(f.severity)) ? String(f.severity) : "medium",
          }))
        // Verified-broken links first (facts), then whatever model findings survive the link-claim
        // filter AND the evidence-grounding gate. Every broken-link claim we ship has been resolved
        // over HTTP; every model finding we ship quotes text that provably exists on the page
        // (KLAVITYKLA-342 false positives). `siteText` is exactly what the model was shown.
        const findings = [...verifiedBroken, ...filterModelFindings(modelFindings, verifiedBroken, siteText)].slice(0, 8)
        // Zero findings is a RESULT, not an empty page — tell the user what was actually checked.
        const checked = {
          links: linkChecks.length,
          forms: inventory?.forms ?? 0,
          buttons: inventory?.buttons ?? 0,
          summary: checkedSummary(inventory ?? { links: 0, forms: 0, buttons: 0, inputs: 0 }, linkChecks.length),
        }
        const body = { findings, url: siteUrl, tool: "bugcheck", checked }
        const props = { tool: "bugcheck", findings: findings.length, linksChecked: linkChecks.length, brokenLinks: verifiedBroken.length }
        analyzeCacheSet(cacheKey, body, props)
        void trackFunnel(db!, { event: "check_completed", anonId, url: siteUrl, source, referrer, props })
        return json(body)
      }

      const frictions: Array<{ title: string; severity: string; fix: string }> = (data.frictions ?? [])
        .slice(0, 8)
        .map((f: any) => ({
          title: String(f.title ?? "").slice(0, 80),
          severity: ["high", "medium", "low"].includes(String(f.severity)) ? String(f.severity) : "medium",
          fix: String(f.fix ?? "").slice(0, 200),
        }))
      void trackFunnel(db!, { event: "check_completed", anonId, url: siteUrl, source, referrer, props: { tool: "cro", frictions: frictions.length } })
      return json({ frictions, url: siteUrl })
    }

    // POST /api/cro/unlock — capture email to unlock the full report. Anonymous. Shared by /cro and
    // /bug-check (KLAVITYKLA-341); the `tool` field ("cro" | "bugcheck") segments leads through the
    // funnel event, the Slack alert text, and the nurture-sequence enrollment.
    if (req.method === "POST" && path === "/api/cro/unlock") {
      const ip = clientIp(req, server)
      if (!rlAllow(`crounlock:ip:${ip}`, 20, 60 * 60_000)) return json({ error: "rate limited" }, 429)
      const parsed = await readJsonLimited(req, 2_048)
      if (!parsed.ok) return json({ error: parsed.error }, parsed.status)
      const b = parsed.data as Record<string, unknown>
      const email = String(b.email ?? "").trim().toLowerCase()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json({ error: "Enter a valid email." }, 400)
      const siteUrl = b.url ? String(b.url).slice(0, 500) : undefined
      const anonId = b.anonId ? String(b.anonId).slice(0, 64) : undefined
      const source = b.source ? String(b.source).slice(0, 100) : undefined
      const referrer = b.referrer ? String(b.referrer).slice(0, 500) : undefined
      const tool: "cro" | "bugcheck" = b.tool === "bugcheck" ? "bugcheck" : "cro"
      void trackFunnel(db!, { event: "lead_captured", anonId, email, url: siteUrl, source, referrer, props: { tool } })
      // Fire-and-forget lead alert (same pattern as widget lead).
      void (async () => {
        try {
          const slackUrl = process.env.SLACK_SIGNUP_WEBHOOK_URL
          if (!slackUrl) return
          const toolLabel = tool === "bugcheck" ? "Bug Check" : "CRO"
          const body = JSON.stringify({ text: `🎯 ${toolLabel} tool lead: *${email}* analysed \`${siteUrl ?? "unknown"}\` (source: ${source ?? "direct"})` })
          await fetch(slackUrl, { method: "POST", headers: { "content-type": "application/json" }, body })
        } catch {}
      })()
      // Fire-and-forget: enroll in nurture sequence + send step 1 immediately.
      void (async () => {
        try {
          const { enrolled, sequenceId } = await enrollLead(db!, email, { url: siteUrl, source, tool })
          if (enrolled && process.env.SENDGRID_API_KEY) {
            const content = buildNurtureEmail(1, { analyzedUrl: siteUrl, baseUrl: BASE, tool })
            await sendReportAlertEmail([email], content.subject, content.html, content.text)
            await recordNurtureEmailSent(db!, sequenceId, 1)
          }
        } catch (e: any) {
          console.warn("[lead-nurture] enroll/step1 failed:", e?.message || e)
        }
      })()
      return json({ ok: true })
    }

    // POST /api/sendgrid/events — SendGrid event webhook for nurture email open/click tracking.
    // Requires SENDGRID_WEBHOOK_TOKEN env var and matching ?token= query param.
    if (req.method === "POST" && path === "/api/sendgrid/events") {
      const expectedToken = process.env.SENDGRID_WEBHOOK_TOKEN
      if (!expectedToken) return json({ error: "not configured" }, 403)
      if (url.searchParams.get("token") !== expectedToken) return json({ error: "unauthorized" }, 401)
      const parsed = await readJsonLimited(req, 512_000)
      if (!parsed.ok) return json({ error: parsed.error }, parsed.status)
      const evts = Array.isArray(parsed.data) ? (parsed.data as any[]) : []
      void recordSendgridEvents(db!, evts.map((ev: any) => ({
        sgMessageId: String(ev?.sg_message_id || ev?.["sg-message-id"] || ""),
        eventType: String(ev?.event || ""),
        timestampMs: Number(ev?.timestamp || 0) * 1000,
      })).filter((ev) => ev.sgMessageId))
      return json({ ok: true })
    }

    // GET /unsubscribe — one-click unsubscribe from nurture emails.
    if (req.method === "GET" && path === "/unsubscribe") {
      const unsubEmail = (url.searchParams.get("email") || "").trim().toLowerCase()
      if (unsubEmail && db) {
        void db!.execute({
          sql: `UPDATE lead_nurture_sequences SET unsubscribed_at=?, next_at=NULL
                WHERE email=? AND unsubscribed_at IS NULL`,
          args: [Date.now(), unsubEmail],
        })
      }
      const f2 = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed — Klavity</title></head>
<body style="margin:0;padding:48px 16px;background:#f4f3f7;${f2};color:#3f3a52;text-align:center">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:18px;padding:40px 32px;box-shadow:0 2px 10px rgba(20,16,40,.10)">
<div style="font-size:22px;font-weight:800;color:#1e1b4b;margin-bottom:8px">Klavity</div>
<h2 style="font-size:20px;font-weight:700;color:#3f3a52;margin:24px 0 12px">You've been unsubscribed.</h2>
<p style="font-size:14px;color:#6b6678;line-height:1.6;margin:0 0 24px">You won't receive any more nurture emails from Klavity.</p>
<a href="/" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 24px;border-radius:8px">Return to Klavity</a>
</div>
</body></html>`,
        { headers: { "content-type": "text/html;charset=utf-8" } },
      )
    }

    // ── everything below requires a session ──
    const me = await sessionEmail(req)
    const needLogin = () => (req.method === "GET" ? redirect("/login") : json({ error: "Sign in to continue." }, 401))

    if (req.method === "GET" && path === "/dashboard") return me ? await dashboardPage() : redirect("/login")
    if (req.method === "GET" && path === "/trails") {
      const qs = url.search || ""
      return new Response(null, { status: 301, headers: { Location: "/autosims" + qs } })
    }
    if (req.method === "GET" && path === "/autosims") return me ? htmlPage(PUB + "/trails.html") : redirect("/login")
    if (req.method === "GET" && path === "/autosims/walks") return me ? htmlPage(PUB + "/autosims-walks.html") : redirect("/login")
    if (req.method === "GET" && /^\/autosims\/walk\/[^/]+$/.test(path)) return me ? htmlPage(PUB + "/autosims-walk.html") : redirect("/login")
    // AT2 auth setup router — "Give your Sims a key" (KLAVITYKLA-267)
    if (req.method === "GET" && path === "/autosims/auth") return me ? htmlPage(PUB + "/auth-router.html") : redirect("/login")
    if (req.method === "GET" && path === "/sim-runs") return me ? htmlPage(PUB + "/sim-runs.html") : redirect("/login")
    // KLAVITYKLA-201: cross-project inbox — the agency's "morning screen"
    if (req.method === "GET" && path === "/inbox") return me ? htmlPage(PUB + "/inbox.html") : redirect("/login")

    // GET /shared/walk/:token — public interactive AutoSim walk report page.
    const sharedWalkPageMatch = path.match(/^\/shared\/walk\/([a-f0-9]{64})$/)
    if (req.method === "GET" && sharedWalkPageMatch) {
      if (!rlAllow("sharewalkpage:" + clientIp(req, server), 120, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveShareToken(sharedWalkPageMatch[1])
      if (!resolved) return new Response("Not found", { status: 404 })
      return htmlPage(PUB + "/autosims-walk-report.html")
    }

    // GET /shared/walk/:token/data — token-scoped walk metadata, steps, replay availability, and findings.
    // KLA-210 (JTBD 7.5): if the token carries a passcode, no data is served until the correct passcode is
    // supplied (?pc= or x-share-passcode header); wrong attempts are rate-limited per token+IP. Every
    // successful serve bumps last_viewed_at / view_count → the "client opened the report" signal.
    const sharedWalkDataMatch = path.match(/^\/shared\/walk\/([a-f0-9]{64})\/data$/)
    if (req.method === "GET" && sharedWalkDataMatch) {
      const rawToken = sharedWalkDataMatch[1]
      if (!rlAllow("sharewalkdata:" + clientIp(req, server), 120, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveShareToken(rawToken)
      if (!resolved) return json({ error: "Not found" }, 404)
      if (resolved.passcodeHash) {
        const supplied = url.searchParams.get("pc") || req.headers.get("x-share-passcode") || ""
        if (!checkSharePasscode(resolved.passcodeHash, supplied)) {
          // Tight per-token+IP limit so passcodes can't be brute-forced.
          if (!rlAllow("sharepc:" + resolved.id + ":" + clientIp(req, server), 8, 60_000)) return new Response("Rate limited", { status: 429 })
          return json({ error: "Passcode required", needsPasscode: true }, 401)
        }
      }
      try {
        const [walk, steps] = await Promise.all([
          getWalk(resolved.projectId, resolved.runId),
          listRunSteps(resolved.projectId, resolved.runId),
        ])
        if (!walk) return json({ error: "Not found" }, 404)
        const [trail, replaySet, findings, judgment] = await Promise.all([
          getTrail(resolved.projectId, walk.trailId),
          runsWithReplay(resolved.projectId, [resolved.runId]),
          listFindings(resolved.projectId, { runId: resolved.runId, limit: 1000 }),
          // KLA-73 / JTBD 7.6: the persona-voiced verdict so the public share page can show it.
          getWalkJudgment(resolved.projectId, resolved.runId),
        ])
        // View signal — fire-and-forget so a write failure never blocks the report.
        recordShareView(resolved.id).catch(() => {})
        return json({
          walk,
          trail,
          steps,
          findings,
          judgment: judgment ?? null,
          hasReplay: replaySet.has(resolved.runId),
          replayUrl: replaySet.has(resolved.runId) ? "/shared/walk-replay/" + rawToken : null,
          liveUrl: walk.status === "running" ? "/shared/walk-live/" + rawToken : null,
          pdfUrl: "/shared/walk-report/" + rawToken,
        })
      } catch (e) {
        return json(oops(e, "shared-walk-data"), 500)
      }
    }

    // GET /shared/walk-live/:token — public token-scoped live CDP screencast for running walks.
    const sharedWalkLiveMatch = path.match(/^\/shared\/walk-live\/([a-f0-9]{64})$/)
    if (req.method === "GET" && sharedWalkLiveMatch) {
      const rawToken = sharedWalkLiveMatch[1]
      if (!rlAllow("sharewalklive:" + clientIp(req, server), 120, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveShareToken(rawToken)
      if (!resolved) return json({ error: "Not found" }, 404)
      const walk = await getWalk(resolved.projectId, resolved.runId)
      if (!walk) return json({ error: "Walk not found." }, 404)
      return liveWatchSseResponse(resolved.projectId, resolved.runId)
    }

    // POST /shared/walk/:token/findings — add a manual bug/finding to this shared walk.
    const sharedFindingAddMatch = path.match(/^\/shared\/walk\/([a-f0-9]{64})\/findings$/)
    if (req.method === "POST" && sharedFindingAddMatch) {
      const rawToken = sharedFindingAddMatch[1]
      if (!rlAllow("sharewalkadd:" + clientIp(req, server), 30, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveShareToken(rawToken)
      if (!resolved) return json({ error: "Not found" }, 404)
      try {
        const walk = await getWalk(resolved.projectId, resolved.runId)
        if (!walk) return json({ error: "Walk not found." }, 404)
        const body = await req.json().catch(() => ({}))
        const title = String(body.title || "").trim().slice(0, 160)
        const detail = String(body.detail || "").trim().slice(0, 2000)
        if (!title) return json({ error: "title required" }, 400)
        const id = crypto.randomUUID()
        const result = await recordFinding(resolved.projectId, {
          runId: resolved.runId,
          trailId: walk.trailId,
          kind: "regression",
          title,
          evidence: { reason: "manual_bug", detail, source: "shared_walk_report" },
          groundQuote: detail || title,
          confidence: 0.75,
          dedupKey: `manual:${resolved.runId}:${id}`,
        })
        return json({ ok: true, id: result.id })
      } catch (e) {
        return json(oops(e, "shared-walk-add-finding"), 500)
      }
    }

    // POST /shared/walk/:token/findings/:id/(file|dismiss) — token-scoped review actions.
    const sharedFindingActionMatch = path.match(/^\/shared\/walk\/([a-f0-9]{64})\/findings\/([^/]+)\/(file|dismiss)$/)
    if (req.method === "POST" && sharedFindingActionMatch) {
      const rawToken = sharedFindingActionMatch[1]
      const findingId = sharedFindingActionMatch[2]
      const action = sharedFindingActionMatch[3]
      if (!rlAllow("sharewalkfinding:" + clientIp(req, server), 60, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveShareToken(rawToken)
      if (!resolved) return json({ error: "Not found" }, 404)
      try {
        const finding = (await listFindings(resolved.projectId, { runId: resolved.runId, limit: 1000 })).find((f) => f.id === findingId)
        if (!finding) return json({ ok: false, error: "No such finding." }, 404)
        if (action === "dismiss") {
          const ok = await dismissFinding(resolved.projectId, findingId)
          if (!ok) return json({ ok: false, error: "No such queued finding." }, 404)
          return json({ ok: true })
        }
        const r = await fileFindingById(resolved.projectId, findingId, { filer: realFiler })
        if (!r.ok) return json({ ok: false, error: "Could not file (no connector or no such finding)." }, 400)
        return json({ ok: true, connectorRef: r.connectorRef })
      } catch (e) {
        return json(oops(e, "shared-walk-finding-action"), 500)
      }
    }

    // GET /shared/walk-replay/:token — serve the rrweb replay JSON for a valid, unexpired share token.
    // Unauthenticated. Returns { runId, segments, steps } — same shape as the auth'd /replay endpoint.
    // 404 when token is bad/expired OR the walk has no saved replay (capture was off).
    const sharedWalkReplayMatch = path.match(/^\/shared\/walk-replay\/([a-f0-9]{64})$/)
    if (req.method === "GET" && sharedWalkReplayMatch) {
      const rawToken = sharedWalkReplayMatch[1]
      if (!rlAllow("sharereplay:" + clientIp(req, server), 30, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveShareToken(rawToken)
      if (!resolved) return new Response("Not found", { status: 404 })
      // KLA-210 (JTBD 7.5): a passcode-protected link gates the replay too (can't bypass via this URL).
      if (resolved.passcodeHash && !checkSharePasscode(resolved.passcodeHash, url.searchParams.get("pc") || req.headers.get("x-share-passcode") || "")) {
        if (!rlAllow("sharepc:" + resolved.id + ":" + clientIp(req, server), 8, 60_000)) return new Response("Rate limited", { status: 429 })
        return new Response("Passcode required", { status: 401 })
      }
      try {
        const segments = await getReplay(resolved.projectId, resolved.runId)
        if (!segments) return json({ error: "No replay for this walk." }, 404)
        const steps = await listRunSteps(resolved.projectId, resolved.runId)
        return json({ runId: resolved.runId, segments, steps })
      } catch (e) {
        return json(oops(e, "trails-share-replay"), 500)
      }
    }

    // GET /shared/walk-report/:token — serve the walk PDF for a valid, unexpired share token.
    // Unauthenticated (no session required). 404 on bad/expired/tampered token (not 401).
    const sharedWalkMatch = path.match(/^\/shared\/walk-report\/([a-f0-9]{64})$/)
    if (req.method === "GET" && sharedWalkMatch) {
      const rawToken = sharedWalkMatch[1]
      if (!rlAllow("sharepdf:" + clientIp(req, server), 30, 60_000)) return new Response("Rate limited", { status: 429 })
      const resolved = await resolveShareToken(rawToken)
      if (!resolved) return new Response("Not found", { status: 404 })
      // KLA-210 (JTBD 7.5): passcode-protected links gate the PDF too (can't bypass via this URL).
      if (resolved.passcodeHash && !checkSharePasscode(resolved.passcodeHash, url.searchParams.get("pc") || req.headers.get("x-share-passcode") || "")) {
        if (!rlAllow("sharepc:" + resolved.id + ":" + clientIp(req, server), 8, 60_000)) return new Response("Rate limited", { status: 429 })
        return new Response("Passcode required", { status: 401 })
      }
      try {
        const replaySet = await runsWithReplay(resolved.projectId, [resolved.runId])
        const replayUrl = replaySet.has(resolved.runId) ? BASE + "/shared/walk-replay/" + rawToken : undefined
        const pdfBytes = await renderWalkPdf(resolved.projectId, resolved.runId, BASE, { replayUrl })
        const shortId = resolved.runId.slice(0, 8)
        return new Response(pdfBytes, {
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `inline; filename="klavity-walk-${shortId}.pdf"`,
            "content-length": String(pdfBytes.byteLength),
          },
        })
      } catch (e: any) {
        // PdfBusyError: PDF queue timed out (KLAVITYKLA-207 — queue-backed, never from walk slot).
        if (e instanceof PdfBusyError) {
          return new Response("PDF generator busy", {
            status: 429,
            headers: { "retry-after": "5" },
          })
        }
        return new Response("Internal error", { status: 500 })
      }
    }

    // ── Client Status Portal (KLAVITYKLA-205) ────────────────────────────────────────────────────
    // GET /shared/project/:token       — serve the read-only project status HTML (no auth)
    // GET /shared/project/:token/data  — return JSON portal data (no auth)
    // Token format: 64-char lowercase hex (32 random bytes); 404 on bad/unknown token.
    // Rate-limited per source IP; noindex + no-store headers; no PII or cross-project data.
    const sharedProjectPageMatch = path.match(/^\/shared\/project\/([a-f0-9]{64})$/)
    if (req.method === "GET" && sharedProjectPageMatch) {
      if (!rlAllow("shareproj:page:" + clientIp(req, server), 120, 60_000)) return new Response("Rate limited", { status: 429 })
      const projectId = await resolveProjectShareToken(sharedProjectPageMatch[1])
      if (!projectId) return new Response("Not found", { status: 404 })
      const _psPath = PUB + "/project-status.html"
      if (!(await Bun.file(_psPath).exists())) return new Response("Not found", { status: 404 })
      return htmlPage(_psPath, { "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" })
    }

    const sharedProjectDataMatch = path.match(/^\/shared\/project\/([a-f0-9]{64})\/data$/)
    if (req.method === "GET" && sharedProjectDataMatch) {
      if (!rlAllow("shareproj:data:" + clientIp(req, server), 120, 60_000)) return new Response("Rate limited", { status: 429 })
      const projectId = await resolveProjectShareToken(sharedProjectDataMatch[1])
      if (!projectId) return json({ error: "Not found" }, 404)
      try {
        const data = await gatherProjectStatusData(projectId)
        if (!data) return json({ error: "Not found" }, 404)
        return json(data, 200, { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" })
      } catch (e) {
        return json(oops(e, "shared-project-data"), 500)
      }
    }
    // ── End Client Status Portal public routes ────────────────────────────────────────────────────

    // Plan G — served demo fixtures the seeded demo Trails walk against (public, non-sensitive HTML).
    // Sanitized: reject path traversal; serve only from PUB/trails-demo. No auth (a Walk hits these
    // unauthenticated, same-origin) — the files are bundled static fixtures, never user data.
    if (req.method === "GET" && path.startsWith("/trails-demo/")) {
      const rel = decodeURIComponent(path.slice("/trails-demo/".length))
      if (rel.includes("..") || rel.includes("\\") || rel.startsWith("/")) return new Response("Not found", { status: 404 })
      // Derive the content-type from the file extension (Bun.file(...).type), falling back to text/html
      // for extensionless/unknown fixtures, so a bundled .css/.js/.svg demo asset isn't mis-served as HTML.
      const demoFile = Bun.file(PUB + "/trails-demo/" + rel)
      return new Response(demoFile, { headers: { "content-type": demoFile.type || "text/html; charset=utf-8" } })
    }
    if (req.method === "GET" && path === "/opsadmin") {
      if (!me || !isOpsAdmin(me)) return new Response("Not found", { status: 404 }) // hide route from non-ops
      const offset = Math.max(0, Number(url.searchParams.get("offset") || 0) || 0)
      const [totals, daily, byProject, byTypeModel, recent, today] = await Promise.all([
        opsTotals(), opsDaily(30), opsByProject(), opsByTypeModel(), opsRecentCalls(50, offset), opsTodaySpend(),
      ])
      const weights = await getActiveWeights()
      const pct = weightsToPct(weights, MODEL_CHOICE_IDS)
      const modelMix = { choices: MODEL_CHOICES.map(c => ({ id: c.id, label: c.label, price: c.price, weight: Number(weights[c.id]) || 0, pct: pct[c.id] })) }
      const [testOtpGate, testOtpUses] = await Promise.all([getTestOtpGate(), listTestOtpUses(50)])
      const testOtp = {
        gate: testOtpGate, uses: testOtpUses,
        envOn: !!process.env.KLAV_TEST_OTP, envEmails: process.env.KLAV_TEST_OTP_EMAILS ?? "",
      }
      const html = renderOpsAdmin({ totals, daily, byProject, byTypeModel, recent, today, cap: OPS_DAILY_CAP_USD, offset, modelMix, testOtp })
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } })
    }
    if (req.method === "GET" && path === "/api/opsadmin/cost-summary") {
      if (!me || !isOpsAdmin(me)) return new Response("Not found", { status: 404 }) // hide route from non-ops
      const days = Math.max(1, Math.min(366, Number(url.searchParams.get("days") || 30) || 30))
      return json(await opsTenantCostSummary(days))
    }
    // KLAVITYKLA-332: weekly GTM growth scorecard
    if (req.method === "GET" && path === "/api/opsadmin/growth") {
      if (!me || !isOpsAdmin(me)) return new Response("Not found", { status: 404 })
      return json(await gatherGrowthScorecard(db!))
    }
    // KLAVITYKLA-304: enable/disable the Test-OTP bypass from the UI (no SSH, no restart). Enabling
    // ALWAYS carries an expiry — there is no "on forever" option, so it can't be left on by accident.
    if (req.method === "POST" && path === "/opsadmin/test-otp") {
      if (!me || !isOpsAdmin(me)) return new Response("Not found", { status: 404 }) // hide route from non-ops
      const form = await req.formData()
      const action = String(form.get("action") || "")
      try {
        if (action === "disable") {
          const g = await disableTestOtpGate(me)
          console.warn(`[TEST-OTP-GATE] disabled by ${me}`)
          void g
        } else {
          const g = await enableTestOtpGate(String(form.get("emails") || ""), Number(form.get("hours") || 0), me)
          console.warn(`[TEST-OTP-GATE] enabled by ${me} for ${g.emails.join(",")} until ${new Date(g.enabledUntil).toISOString()}`)
        }
      } catch (err: any) {
        return new Response(escapeHtml(err?.message || "Could not update the Test-OTP gate."), { status: 400, headers: { "content-type": "text/plain; charset=utf-8" } })
      }
      return redirect("/opsadmin")
    }
    if (req.method === "POST" && path === "/opsadmin/model-mix") {
      if (!me || !isOpsAdmin(me)) return new Response("Not found", { status: 404 }) // hide route from non-ops
      const form = await req.formData()
      const raw: Record<string, unknown> = {}
      for (const id of MODEL_CHOICE_IDS) raw[id] = form.get(id)
      await setModelWeights(parseWeightsForm(raw, MODEL_CHOICE_IDS))
      await refreshWeightsCache()
      return redirect("/opsadmin")
    }
    if (req.method === "GET" && path === "/app") return me ? file(PUB + "/index.html") : redirect("/login")
    // Sim Profile page — clicking a Sim row in the dashboard opens /sim/:id (read-only persona +
    // its triaged feedback + the calls that seeded it). The id is read client-side from the path.
    if (req.method === "GET" && /^\/sim\/[^/]+$/.test(path)) return me ? htmlPage(PUB + "/sim-profile.html") : redirect("/login")
    if (req.method === "GET" && path === "/onboarding") {
      // The onboarding wizard is the signup flow for new users (email → OTP → name project → add URL →
      // install extension → pick Sims, inline). ensureAccount gives every verified user a default
      // membership on first login, so "has a membership" can't tell new from returning. Instead a user
      // who has ALREADY been through setup carries an EXPLICIT accounts.onboarded_at flag, stamped at a
      // wizard exit via POST /api/account/onboarded (KLA-297); they skip to the dashboard. Fresh accounts
      // and logged-out visitors get the wizard.
      // ?again=1 is the deliberate re-entry door (e.g. "New client project") — an onboarded user asking
      // for the wizard by name always gets it.
      // Wrapped in try/catch: a DB hang here must never produce a 502 — fall through to serve the page.
      const reentry = url.searchParams.get("again") === "1"
      try {
        if (me && !reentry) {
          const ms = await membershipsFor(me)
          if (ms.length && await isAccountOnboarded(ms[0].workspaceId)) return redirect("/dashboard")
        }
      } catch { /* DB error — serve onboarding.html rather than crashing */ }
      return htmlPage(SITE + "/onboarding.html")
    }

    // ── CI API (KLA-90) — machine-to-machine, project-scoped bearer tokens (kci_*). ──
    // Token issuance: POST /api/ci/token       (session-gated; returns kci_* bound to a project)
    // Walk trigger:   POST /api/ci/trails/:id/trigger?project=:id  (CI-bearer-gated)
    // Verdict poll:   GET  /api/ci/runs/:runId?project=:id         (CI-bearer-gated)
    if (path === "/api/ci/token" || path.startsWith("/api/ci/trails/") || path.startsWith("/api/ci/runs/")) {

      // POST /api/ci/token — session-gated; issue a kci_* token bound to a project.
      if (req.method === "POST" && path === "/api/ci/token") {
        const me = await sessionEmail(req)
        if (!me) return json({ error: "Unauthorized" }, 401)
        const body = await req.json().catch(() => ({}))
        const projectId = String(body.project || "").trim()
        if (!projectId) return json({ error: "project required" }, 400)
        const access = await projectAccess(me, projectId)
        if (!access) return json({ error: "Forbidden" }, 403)
        const ciToken = await issueCIToken(me, projectId)
        return json({ token: ciToken, project: projectId }, 201)
      }

      // CI bearer auth: extract + validate a kci_* token, return its bound project.
      const ciRaw = (req.headers.get("authorization") || "").match(/^Bearer\s+(kci_\S+)$/i)?.[1] ?? ""
      if (!ciRaw) return json({ error: "Unauthorized" }, 401)
      const ciInfo = await getExtensionTokenInfo(ciRaw)
      if (!ciInfo || !ciInfo.projectId) return json({ error: "Unauthorized" }, 401)
      const ciProject = ciInfo.projectId
      const requestedProject = url.searchParams.get("project") || ""
      if (ciProject !== requestedProject) return json({ error: "Forbidden" }, 403)

      // POST /api/ci/trails/:trailId/trigger — trigger a walk, return runId immediately.
      const ciTriggerMatch = path.match(/^\/api\/ci\/trails\/([^/]+)\/trigger$/)
      if (req.method === "POST" && ciTriggerMatch) {
        const trailId = ciTriggerMatch[1]
        try {
          const { runId } = await runWalkNow(ciProject, trailId)
          return json({ runId }, 202)
        } catch (e: any) {
          if (e instanceof WalkBusyError) return json({ error: "A walk is already running" }, 409)
          if (String(e?.message || e) === "trail not found") return json({ error: "Not found" }, 404)
          if (String(e?.message || e) === "trail is paused") return json({ error: "Trail is paused" }, 409)
          return json(oops(e, "ci-trigger"), 500)
        }
      }

      // GET /api/ci/runs/:runId — poll walk status/verdict (KLAVITYKLA-219: enriched response).
      // Returns verdict, failingStep (first finding for red runs), reportUrl, and shareUrl in
      // addition to the existing runId/status/startedAt/finishedAt fields for back-compat.
      const ciRunMatch = path.match(/^\/api\/ci\/runs\/([^/]+)$/)
      if (req.method === "GET" && ciRunMatch) {
        const runId = ciRunMatch[1]
        const walk = await getWalk(ciProject, runId)
        if (!walk) return json({ error: "Not found" }, 404)

        // verdict — the terminal status when finished; null while running/paused/needs_auth.
        const TERMINAL_VERDICTS = new Set(["green", "amber", "red", "skip"])
        const verdict: string | null = TERMINAL_VERDICTS.has(walk.status) ? walk.status : null

        // failingStep — first finding for this run when the verdict is red (or amber).
        // Null for passing/in-progress runs. Derived from the findings table (same source the
        // walk report and dashboard replay use to surface issues).
        let failingStep: { title: string; summary: string } | null = null
        if (verdict === "red" || verdict === "amber") {
          try {
            const findings = await listFindings(ciProject, { runId, limit: 1 })
            if (findings.length > 0) {
              const f = findings[0]
              failingStep = {
                title: f.title,
                summary: f.groundQuote ?? f.title,
              }
            }
          } catch { /* findings are best-effort — don't fail the response */ }
        }

        // reportUrl — authenticated PDF download for this walk (requires CI token in the header).
        const reportUrl = `${BASE}/api/trails/walks/${runId}/report.pdf`

        // shareUrl — public, token-scoped walk report page. walk_share_tokens stores only the
        // SHA-256 hash of each token — the raw bytes are never persisted — so we can't reconstruct
        // a URL from an existing token. Mint a fresh one on every CI poll (30-day TTL, matching the
        // standard walk-share window). Old tokens remain valid and are not revoked.
        // TODO(KLAVITYKLA-219): the Settings CI drawer in dashboard.html should display the enriched
        //   fields (verdict, shareUrl, failingStep) returned here. Add a "last run summary" row in
        //   the CI section that fetches GET /api/ci/runs/:id and renders them inline.
        let shareUrl: string | null = null
        try {
          const freshToken = await mintShareToken(ciProject, runId, /* createdBy */ undefined)
          shareUrl = `${BASE}/shared/walk/${freshToken}`
        } catch { /* share URL is best-effort; don't fail the whole response */ }

        return json({
          runId: walk.id,
          status: walk.status,
          startedAt: walk.startedAt,
          finishedAt: walk.finishedAt,
          verdict,
          failingStep,
          reportUrl,
          shareUrl,
        })
      }

      return json({ error: "Not found" }, 404)
    }

    // ── Expectations graduation endpoints (Layer E, Task 6) — project-scoped, authed. ──
    // Placed before the generic /api/ gate so unauthenticated calls return JSON 401, not a login redirect.
    if (path === "/api/expectations" || path.startsWith("/api/expectations/")) {
      const meE = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meE) return json({ error: "auth" }, 401)
      const projE = await resolveProject(meE, url.searchParams.get("project"))
      if (!projE) return json({ error: "no project" }, 404)

      // B.10 (KLA-250): shared source/step lookups for enrichExpectation, used by BOTH the list and
      // the single-row GET so cards render Trail name + step position (not raw ts_ UUIDs) and — for
      // Seen-once rows — a progress hint. Every lookup is best-effort (returns null on any error).
      const expEnrichLookups = {
        getReport: async (id: string) => {
          try {
            const fb = await feedbackById(projE.id, id)
            if (!fb) return null
            // feedbackById doesn't carry the grounded quote — fetch it directly (best-effort).
            let groundedQuote: string | null = null
            try {
              const q = await db!.execute({ sql: "SELECT source_quote FROM feedback WHERE project_id=? AND id=?", args: [projE.id, id] })
              if (q.rows.length) groundedQuote = (q.rows[0] as any).source_quote != null ? String((q.rows[0] as any).source_quote) : null
            } catch { /* column/table absent — no quote */ }
            return { title: fb.observation ?? null, urlPath: fb.urlPath ?? null, groundedQuote }
          } catch { return null }
        },
        getFinding: async (id: string) => {
          try {
            const r = await db!.execute({ sql: "SELECT title, ground_quote FROM findings WHERE project_id=? AND id=?", args: [projE.id, id] })
            if (!r.rows.length) return null
            const row = r.rows[0] as any
            return { title: row.title != null ? String(row.title) : null, urlPath: null,
              groundedQuote: row.ground_quote != null ? String(row.ground_quote) : null }
          } catch { return null }
        },
        getStep: async (stepId: string) => {
          try {
            const step = await getTrailStepById(projE.id, stepId)
            if (!step) return null
            const trail = await getTrail(projE.id, step.trailId).catch(() => null)
            const steps = await listTrailSteps(projE.id, step.trailId).catch(() => [])
            const position = steps.length ? (steps.findIndex((s) => s.id === stepId) + 1) || null : null
            return { trailId: step.trailId, trailName: trail?.name ?? null,
              position: position && position > 0 ? position : null, total: steps.length || null }
          } catch { return null }
        },
      }

      // GET /api/expectations?project=&status= — list expectations for the project, optionally filtered.
      if (req.method === "GET" && path === "/api/expectations") {
        const rawStatus = url.searchParams.get("status")
        const status = (["candidate", "validated", "enforced", "retired"] as const).includes(rawStatus as any) ? (rawStatus as "candidate" | "validated" | "enforced" | "retired") : undefined
        // B.5 (KLA-245): lazily resume any awaiting-Trail expectations now covered by a Trail, so the
        // Enforce offer resurfaces on the next board load regardless of how the Trail was created.
        // Best-effort — a resume failure must never break the list.
        try {
          const { pick } = await trailsForEnforce(projE.id)
          if (pick.length) await resumeAwaitingTrailExpectations(db!, projE.id, pick)
        } catch (e) { console.warn("[expectations] awaiting-trail resume skipped:", String(e)) }
        const rows = await listExpectations(db!, projE.id, status)
        // B.10: enrich each row so the Guards board shows Trail name + step position and progress
        // hints without a follow-up fetch per card. Best-effort — never let one bad row break the list.
        const enrichedRows = await Promise.all(rows.map((r) => enrichExpectation(r, expEnrichLookups).catch(() => r)))
        return json({ expectations: enrichedRows })
      }

      // GET /api/expectations/near-misses?project=&days= — KLA-251 (B.11): cross-source-matching
      // instrumentation report. Summarizes how often the 0.82 lexical thread DECLINED a pair that
      // landed in the near-miss band (candidate under-matches), with a few high-score samples for
      // human sampling. Read-only ops view; MUST precede the /:id route so "near-misses" is not
      // parsed as an expectation id.
      if (req.method === "GET" && path === "/api/expectations/near-misses") {
        const daysRaw = Number(url.searchParams.get("days"))
        const days = Number.isFinite(daysRaw) && daysRaw > 0 ? Math.min(daysRaw, 365) : null
        const sinceMs = days ? Date.now() - days * 24 * 60 * 60 * 1000 : undefined
        return json({ summary: await nearMissSummary(db!, projE.id, { sinceMs }) })
      }

      // GET /api/expectations/:id — fetch a single expectation, TRULY enriched (B.10 / KLA-250).
      // Hydrates each source ref into a linkable report/finding (title, urlPath, grounded quote),
      // resolves the enforced guard's step id → its Trail name + step position ("step N of M", never
      // a raw ts_ UUID, consistent with B.2), and — for a Seen-once (candidate) row — the plain
      // progress-to-Confirmed hint. Every lookup is best-effort so the route stays a stable 200.
      const singleExpMatch = path.match(/^\/api\/expectations\/([^/]+)$/)
      if (req.method === "GET" && singleExpMatch && !singleExpMatch[1].includes("/")) {
        const expId = singleExpMatch[1]
        const exp = await getExpectation(db!, expId)
        if (!exp || exp.projectId !== projE.id) return json({ error: "not found" }, 404)
        const enriched = await enrichExpectation(exp, expEnrichLookups)
        return json({ expectation: enriched })
      }

      // POST /api/expectations/:id/enforce — draft an assertion (calls LLM). Persists nothing.
      // B.5 (KLA-245): returns the full Trail picker payload (`trails`) + a urlPath-match default
      // (`defaultTrailId`) so the confirm card can show WHICH Trail and WHERE the step lands, and
      // let the user repoint. With zero Trails we return `zeroTrails:true` at 200 (never a 422 dead
      // end) so the UI can offer the record-a-guard-Trail / hold-as-awaiting fallbacks.
      const enforceMatch = path.match(/^\/api\/expectations\/([^/]+)\/enforce$/)
      if (req.method === "POST" && enforceMatch) {
        const id = enforceMatch[1]
        const exp = await getExpectation(db!, id)
        if (!exp || exp.projectId !== projE.id) return json({ error: "not found" }, 404)
        if (exp.status !== "validated") return json({ error: "not validated" }, 409)
        const body = await req.json().catch(() => ({}))
        const { pick, ui } = await trailsForEnforce(projE.id)
        if (!pick.length) {
          // No Trail to attach to — offer fallbacks instead of a 422 dead end (B.5 acceptance).
          return json({ zeroTrails: true, trails: [], defaultTrailId: null })
        }
        // Default = the Trail whose recorded steps best match the expectation's urlPath (never the
        // silent "first Trail" the old code used). An explicit body.trailId still wins (repoint).
        const { trailId: matchedDefault } = pickDefaultTrail(exp.urlPath, pick)
        const requested = typeof body.trailId === "string" && body.trailId ? body.trailId : ""
        const trailId = requested || matchedDefault || pick[0].id
        const trail = await getTrail(projE.id, trailId)
        if (!trail) return json({ error: "trail not found" }, 422)
        const steps = await listTrailSteps(projE.id, trailId)
        const { content } = await draftAssertion(exp, trail, steps, { email: meE, projectId: projE.id })
        const draft = validateAssertionDraft({ ...parseJSON(content), trailId })
        return json({ draft, trails: ui, defaultTrailId: matchedDefault ?? trailId })
      }

      // POST /api/expectations/:id/enforce/confirm — write the assert step, mark expectation enforced.
      // B.5 (KLA-245): the assert lands in the trail the DRAFT carries (draft.trailId is required by
      // validateAssertionDraft) — the server no longer falls back to the project's first Trail. The
      // draft's afterStepIdx may have been repointed by the user in the picker.
      const confirmMatch = path.match(/^\/api\/expectations\/([^/]+)\/enforce\/confirm$/)
      if (req.method === "POST" && confirmMatch) {
        const id = confirmMatch[1]
        const exp = await getExpectation(db!, id)
        if (!exp || exp.projectId !== projE.id) return json({ error: "not found" }, 404)
        if (exp.status !== "validated") return json({ error: "not validated" }, 409)
        const reqBody = await req.json().catch(() => ({}))
        const draft = validateAssertionDraft(reqBody.draft)
        if (!draft) return json({ error: "invalid draft" }, 400)
        const trail = await getTrail(projE.id, draft.trailId)
        if (!trail) return json({ error: "trail not found" }, 422)
        const stepId = await insertAssertStep(projE.id, draft.trailId, draft.afterStepIdx, draft.target, draft.checkpoint)
        await setExpectationEnforced(db!, id, stepId)
        return json({ stepId, trailId: draft.trailId })
      }

      // POST /api/expectations/:id/hold-awaiting-trail — B.5 (KLA-245): the zero-Trail fallback.
      // Keeps the expectation validated but flags it awaiting a Trail; the enforce offer is
      // suppressed until a Trail covering its urlPath is created (auto-resumed on the next board load).
      const holdMatch = path.match(/^\/api\/expectations\/([^/]+)\/hold-awaiting-trail$/)
      if (req.method === "POST" && holdMatch) {
        const id = holdMatch[1]
        const exp = await getExpectation(db!, id)
        if (!exp || exp.projectId !== projE.id) return json({ error: "not found" }, 404)
        if (exp.status !== "validated") return json({ error: "not validated" }, 409)
        await setExpectationAwaitingTrail(db!, id, true)
        return json({ ok: true, awaitingTrail: true })
      }

      // POST /api/expectations/:id/unenforce — B.9 (KLA-249): demote an enforced guard back to
      // validated WITHOUT deleting the expectation's history. Removes the underlying assert step so
      // the Trail no longer runs the check, then flips status → validated (enforced_step_id cleared).
      // The user can re-enforce later (repointed/repositioned). 409 if the row isn't enforced.
      const unenforceMatch = path.match(/^\/api\/expectations\/([^/]+)\/unenforce$/)
      if (req.method === "POST" && unenforceMatch) {
        const id = unenforceMatch[1]
        const exp = await getExpectation(db!, id)
        if (!exp || exp.projectId !== projE.id) return json({ error: "not found" }, 404)
        if (exp.status !== "enforced") return json({ error: "not enforced" }, 409)
        // Remove the assert step so the Trail stops running the check (best-effort — a missing step
        // must not block the demotion). History (corroboration / source_refs) is preserved.
        if (exp.enforcedStepId) { try { await deleteTrailStep(projE.id, exp.enforcedStepId) } catch (e) { console.warn("[expectations] unenforce step delete skipped:", String(e)) } }
        await demoteExpectationToValidated(db!, id)
        return json({ ok: true, status: "validated" })
      }

      // PATCH /api/expectations/:id/guard-step — B.9 (KLA-249): edit an enforced guard's assert step
      // IN PLACE (target and/or checkpoint description) rather than retire-and-recreate, which would
      // destroy the enforced history. 409 if the row isn't enforced or has no step to edit.
      const editGuardMatch = path.match(/^\/api\/expectations\/([^/]+)\/guard-step$/)
      if (req.method === "PATCH" && editGuardMatch) {
        const id = editGuardMatch[1]
        const exp = await getExpectation(db!, id)
        if (!exp || exp.projectId !== projE.id) return json({ error: "not found" }, 404)
        if (exp.status !== "enforced" || !exp.enforcedStepId) return json({ error: "not enforced" }, 409)
        const body = await req.json().catch(() => null)
        if (!body || typeof body !== "object") return json({ error: "invalid body" }, 400)
        const patch: StepPatch = {}
        if ("target" in body) {
          const t = (body as any).target
          if (t == null) return json({ error: "target cannot be cleared on an assert step" }, 400)
          if (typeof t !== "object" || Array.isArray(t)) return json({ error: "target must be an object" }, 400)
          const clean: Record<string, string> = {}
          for (const [k, v] of Object.entries(t)) { if (typeof v === "string") clean[k] = v }
          if (!Object.keys(clean).length) return json({ error: "target must have at least one string field" }, 400)
          patch.target = clean
        }
        if ("checkpoint" in body) {
          const cpIn = (body as any).checkpoint
          if (cpIn == null) return json({ error: "an assert step needs a checkpoint" }, 400)
          if (typeof cpIn === "object" && typeof cpIn.description === "string") {
            const cp = normalizeCheckpointInput(cpIn)
            if (!cp) return json({ error: "invalid checkpoint" }, 400)
            patch.checkpoint = cp
          } else return json({ error: "checkpoint must be an object with a description" }, 400)
        }
        if (Object.keys(patch).length === 0) return json({ error: "nothing to edit" }, 400)
        const ok = await updateTrailStep(projE.id, exp.enforcedStepId, patch)
        if (!ok) return json({ error: "guard step not found" }, 404)
        // Touch updated_at so the board reflects the edit; the row stays enforced on the same step.
        await setExpectationStatus(db!, id, "enforced")
        return json({ ok: true, stepId: exp.enforcedStepId })
      }

      // POST /api/expectations/:id/retire — mark expectation as retired.
      const retireMatch = path.match(/^\/api\/expectations\/([^/]+)\/retire$/)
      if (req.method === "POST" && retireMatch) {
        const id = retireMatch[1]
        const exp = await getExpectation(db!, id)
        if (!exp || exp.projectId !== projE.id) return json({ error: "not found" }, 404)
        if (exp.enforcedStepId) { try { await deleteTrailStep(projE.id, exp.enforcedStepId) } catch (e) { console.warn("[expectations] retire step delete skipped:", String(e)) } }
        await setExpectationStatus(db!, id, "retired")
        return json({ ok: true })
      }

      return json({ error: "Not found" }, 404)
    }

    // ── Klavity OS Trails (Layer E) — project-scoped, authed. Placed before the generic /api/ gate so
    // unauthenticated API calls return a JSON 401 (not a /login redirect), mirroring resolveProject usage.
    if (path === "/api/trails/dashboard" || path === "/api/trails/trends" || path === "/api/trails/walks" || path.startsWith("/api/trails/findings/") || path.startsWith("/api/trails/walks/")
        || path === "/api/trails/author" || path.startsWith("/api/trails/author/")
        || /^\/api\/trails\/[^/]+$/.test(path)
        || /^\/api\/trails\/[^/]+\/(walk|approve|steps|judge-persona)$/.test(path)
        || /^\/api\/trails\/[^/]+\/steps\/[^/]+$/.test(path)) {
      const meT = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!meT) return json({ error: "Unauthorized" }, 401)
      const resolved = await resolveProject(meT, url.searchParams.get("project"))
      if (!resolved) return json({ error: "No access" }, 403)
      const projectId = resolved.id

      // GET /api/trails/dashboard — trails + recent walks + review queue + precision.
      if (req.method === "GET" && path === "/api/trails/dashboard") {
        try {
          const data = await trailsDashboardData(projectId)
          // Annotate each recent Walk with whether it has a saved rrweb replay (one project-scoped
          // query) so the dashboard shows the "▶ Replay" affordance only where there's a recording.
          const haveReplay = await runsWithReplay(projectId, data.recentWalks.map((w) => w.id))
          const recentWalks = data.recentWalks.map((w) => ({ ...w, hasReplay: haveReplay.has(w.id) }))
          return json({ email: meT, project: { id: projectId, role: resolved.access }, ...data, recentWalks })
        } catch (e) {
          return json(oops(e, "trails-dashboard"), 500)
        }
      }

      // GET /api/trails/trends — KLA-78: walk metrics bucketed by calendar day for a project/trail.
      // Returns { buckets: TrendBucket[] } ordered oldest→newest over the last ?days=N (default 30).
      // Optional ?trail=<trailId> scopes to a single Trail. Running walks are excluded (non-terminal).
      if (req.method === "GET" && path === "/api/trails/trends") {
        try {
          const params = new URL(req.url).searchParams
          const rawDays = params.get("days")
          const bucketDays = rawDays ? Math.max(1, Math.min(365, Number(rawDays) || 30)) : 30
          const trailId = params.get("trail") || undefined
          const buckets = await walkTrends(projectId, { trailId, bucketDays })
          return json({ buckets })
        } catch (e) {
          return json(oops(e, "trails-trends"), 500)
        }
      }

      // GET /api/trails/walks — KLA-158: paginated walk list for the All Walks page.
      // ?page=N (1-based, default 1) ?limit=M (10–50, default 20). Returns { walks, total, page, limit, pages }.
      if (req.method === "GET" && path === "/api/trails/walks") {
        try {
          const params = new URL(req.url).searchParams
          const page = Math.max(1, Number(params.get("page") || "1") || 1)
          const limit = Math.min(50, Math.max(10, Number(params.get("limit") || "20") || 20))
          const { walks, total } = await listWalksPaged(projectId, page, limit)
          const haveReplay = await runsWithReplay(projectId, walks.map((w) => w.id))
          const annotated = walks.map((w) => ({ ...w, hasReplay: haveReplay.has(w.id) }))
          return json({ walks: annotated, total, page, limit, pages: Math.ceil(total / limit) || 1 })
        } catch (e) {
          return json(oops(e, "walks-paged"), 500)
        }
      }

      // GET /api/trails/walks/:runId/live — authenticated near-real-time CDP screencast frames.
      // Project-scoped via getWalk(projectId, runId); the stream is in-memory and only active while
      // the current server process is driving that walk.
      const liveMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/live$/)
      if (req.method === "GET" && liveMatch) {
        const runId = liveMatch[1]
        const walk = await getWalk(projectId, runId)
        if (!walk) return json({ error: "Walk not found." }, 404)
        return liveWatchSseResponse(projectId, runId)
      }

      // GET /api/trails/walks/:runId/replay — the saved rrweb session-replay segments for a Walk +
      // its run_steps (so the player can mark verdicts / seek to the failing step). Project-scoped;
      // 404 when the Walk has no replay (capture was off, or this runId is foreign/nonexistent).
      const replayMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/replay$/)
      if (req.method === "GET" && replayMatch) {
        try {
          const runId = replayMatch[1]
          const segments = await getReplay(projectId, runId)
          if (!segments) return json({ error: "No replay for this walk." }, 404)
          const steps = await listRunSteps(projectId, runId)
          return json({ runId, segments, steps })
        } catch (e) {
          return json(oops(e, "trails-replay"), 500)
        }
      }

      // GET /api/trails/walks/:runId/progress — lightweight live progress for an in-flight walk.
      // Returns { status, stepsDone, totalSteps } using COUNT queries (no evidence blobs loaded).
      // Polled by the UI every ~1.5s while the walk is running to show "step N/M" feedback.
      const progressMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/progress$/)
      if (req.method === "GET" && progressMatch) {
        try {
          const runId = progressMatch[1]
          const walk = await getWalk(projectId, runId)
          if (!walk) return json({ error: "Walk not found." }, 404)
          const [stepsDone, totalSteps] = await Promise.all([
            countRunSteps(projectId, runId),
            countTrailSteps(projectId, walk.trailId),
          ])
          return json({ status: walk.status, stepsDone, totalSteps })
        } catch (e) {
          return json(oops(e, "trails-progress"), 500)
        }
      }

      // GET /api/trails/walks/:runId — walk metadata + trail name + steps for the full-page walk detail.
      // Lighter than /replay (no rrweb segments). Returns hasReplay so the page knows whether to show player.
      // KLA-73: also returns the latest persona judgment (judgment field, null if none yet).
      // GET /api/trails/walks/shared-links — KLA-210 (JTBD 7.5): every active share token across the
      // project (the Share manager's list). Placed BEFORE walkDetailMatch so its /:runId regex can't
      // swallow "shared-links". Walk-scoped; project-portal tokens land once JTBD 7.2 ships.
      if (req.method === "GET" && path === "/api/trails/walks/shared-links") {
        try {
          const tokens = await listShareTokens(projectId)
          return json({ tokens })
        } catch (e) {
          return json(oops(e, "trails-share-list-all"), 500)
        }
      }

      const walkDetailMatch = path.match(/^\/api\/trails\/walks\/([^/]+)$/)
      if (req.method === "GET" && walkDetailMatch) {
        try {
          const runId = walkDetailMatch[1]
          const [walk, steps] = await Promise.all([
            getWalk(projectId, runId),
            listRunSteps(projectId, runId),
          ])
          if (!walk) return json({ error: "Walk not found." }, 404)
          const [trail, replaySet, judgment, findings] = await Promise.all([
            getTrail(projectId, walk.trailId),
            runsWithReplay(projectId, [runId]),
            getWalkJudgment(projectId, runId),
            listFindings(projectId, { runId, limit: 1000 }),
          ])
          return json({ walk, trail, steps, hasReplay: replaySet.has(runId), judgment: judgment ?? null, findings })
        } catch (e) {
          return json(oops(e, "trails-walk-detail"), 500)
        }
      }

      // POST /api/trails/walks/:runId/judge — KLA-73: invoke a persona to judge this Walk's findings.
      // Body: { personaId?: string } — if omitted, falls back to the Trail's judgePersonaId.
      // Returns the created WalkJudgment.
      {
        const judgeMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/judge$/)
        if (req.method === "POST" && judgeMatch) {
          const runId = judgeMatch[1]
          try {
            const walk = await getWalk(projectId, runId)
            if (!walk) return json({ error: "Walk not found" }, 404)
            const body = await req.json().catch(() => ({}))
            const trail = await getTrail(projectId, walk.trailId)
            const personaId = (body as any)?.personaId || trail?.judgePersonaId
            if (!personaId) return json({ error: "No persona selected — pass personaId in body or set a judge persona on the Trail" }, 400)
            const personas = await listPersonas(projectId)
            const persona = personas.find(p => p.id === personaId)
            if (!persona) return json({ error: "Persona not found in this project" }, 404)

            const llmFn = async (systemPrompt: string, userContent: string) => {
              const apiKey = process.env.KLAV_OPENROUTER_KEY
              if (!apiKey) throw new Error("KLAV_OPENROUTER_KEY not configured")
              const model = process.env.KLAV_JUDGE_MODEL || "openai/gpt-4o-mini"
              const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://klavity.in" },
                body: JSON.stringify({
                  model,
                  messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
                  response_format: { type: "json_object" },
                }),
              })
              if (!resp.ok) throw new Error(`OpenRouter ${resp.status}: ${await resp.text().catch(() => "?")}`)
              const data: any = await resp.json()
              const raw = JSON.parse(data.choices?.[0]?.message?.content || "{}")
              return { verdicts: Array.isArray(raw.verdicts) ? raw.verdicts : [], overall_note: raw.overall_note ?? null }
            }

            const judgment = await judgeWalk({ projectId, runId, persona, llmFn })
            return json({ judgment })
          } catch (e: any) {
            return json(oops(e, "trails-judge"), 500)
          }
        }
      }

      // PATCH /api/trails/:trailId/judge-persona — KLA-73: set (or clear) the default judge persona for a Trail.
      // Body: { personaId: string | null }
      {
        const jpMatch = path.match(/^\/api\/trails\/([^/]+)\/judge-persona$/)
        if (req.method === "PATCH" && jpMatch) {
          const trail = await getTrail(projectId, jpMatch[1])
          if (!trail) return json({ error: "Not found" }, 404)
          const body = await req.json().catch(() => null)
          if (!body || typeof body !== "object") return json({ error: "Invalid body" }, 400)
          const pid = (body as any).personaId
          if (pid !== null && pid !== undefined && typeof pid !== "string") return json({ error: "personaId must be a string or null" }, 400)
          if (pid) {
            const personas = await listPersonas(projectId)
            if (!personas.some(p => p.id === pid)) return json({ error: "Persona not found in this project" }, 404)
          }
          await updateTrail(projectId, trail.id, { judgePersonaId: pid ?? null })
          return json({ ok: true })
        }
      }

      // POST /api/trails/findings/:id/file — human files a queued finding to the project connector.
      const fileMatch = path.match(/^\/api\/trails\/findings\/([^/]+)\/file$/)
      if (req.method === "POST" && fileMatch) {
        try {
          const r = await fileFindingById(projectId, fileMatch[1], { filer: realFiler })
          if (!r.ok) return json({ ok: false, error: "Could not file (no connector or no such finding)." }, 400)
          return json({ ok: true, connectorRef: r.connectorRef })
        } catch (e) {
          return json(oops(e, "trails-file"), 500)
        }
      }

      // POST /api/trails/findings/:id/dismiss — human dismisses a queued finding.
      // dismissFinding only acts on an existing, in-project, currently-queued finding; a no-op (missing /
      // foreign-project / non-queued id) returns 404 rather than a misleading 200, and a cross-project
      // write is impossible because the lookup is project-scoped.
      const dismissMatch = path.match(/^\/api\/trails\/findings\/([^/]+)\/dismiss$/)
      if (req.method === "POST" && dismissMatch) {
        try {
          const ok = await dismissFinding(projectId, dismissMatch[1])
          if (!ok) return json({ ok: false, error: "No such queued finding." }, 404)
          return json({ ok: true })
        } catch (e) {
          return json(oops(e, "trails-dismiss"), 500)
        }
      }

      // PATCH /api/trails/:id — rename, pause/resume, set/clear a cron schedule, or archive.
      // Accepts: { name?: string, status?: "active"|"paused"|"archived", schedule?: string|null }
      // draft→active promotion is handled by the dedicated /approve endpoint; archived is terminal.
      {
        const mPatchTrail = path.match(/^\/api\/trails\/([^/]+)$/)
        if (req.method === "PATCH" && mPatchTrail) {
          const trail = await getTrail(projectId, mPatchTrail[1])
          if (!trail) return json({ error: "Not found" }, 404)
          const body = await req.json().catch(() => null)
          if (!body || typeof body !== "object") return json({ error: "Invalid body" }, 400)
          const patch: TrailPatch = {}
          if ("name" in body) {
            const n = typeof body.name === "string" ? body.name.trim() : ""
            if (!n || n.length > 80) return json({ error: "name must be 1–80 characters" }, 400)
            patch.name = n
          }
          if ("status" in body) {
            const allowedStatuses: TrailStatus[] = ["active", "paused", "archived"]
            if (!allowedStatuses.includes(body.status))
              return json({ error: "status must be 'active', 'paused' or 'archived'" }, 400)
            if (trail.status === "draft") {
              if (body.status === "archived") {
                // Allow archiving drafts directly — no need to activate first.
              } else if (body.status !== "active") {
                return json({ error: "Use /approve to activate a draft trail" }, 409)
              }
            }
            patch.status = body.status
          }
          if ("schedule" in body) {
            if (body.schedule === null || body.schedule === "") {
              patch.schedule = null
              patch.scheduleTz = null // clearing the schedule clears its timezone too
            } else {
              const expr = typeof body.schedule === "string" ? body.schedule.trim() : ""
              if (!isValidCron(expr)) return json({ error: "Invalid cron expression (5 fields required, e.g. '0 9 * * *')" }, 400)
              patch.schedule = expr
              // KLA-277 (JTBD 4.13): DST-safe schedules — when the client supplies scheduleTz the cron
              // is stored as LOCAL wall-clock in that IANA zone and the UTC fire instant is computed per
              // occurrence. Validate the zone via Intl; reject unknown zones so we never store garbage.
              if ("scheduleTz" in body) {
                const tz = typeof body.scheduleTz === "string" ? body.scheduleTz.trim() : ""
                if (tz) {
                  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }) }
                  catch { return json({ error: "Invalid timezone" }, 400) }
                  patch.scheduleTz = tz
                } else {
                  patch.scheduleTz = null
                }
              }
            }
          }
          if ("viewport" in body) {
            try { patch.viewport = normalizeTrailViewport((body as any).viewport) }
            catch (e: any) { return json({ error: e?.message || "Invalid viewport" }, 400) }
          }
          if (!Object.keys(patch).length) return json({ error: "Nothing to patch" }, 400)
          await updateTrail(projectId, trail.id, patch)
          return json({ ok: true })
        }
      }

      // GET /api/trails/:trailId/runs — KLA-85: per-trail run history, newest-first, bounded by ?limit=N.
      // Returns { runs: TrailRunHistoryEntry[] } with timestamp, status, stepCount, durationMs per run.
      // 404 when the trail does not exist in this project (also guards cross-project access).
      {
        const runsMatch = path.match(/^\/api\/trails\/([^/]+)\/runs$/)
        if (req.method === "GET" && runsMatch) {
          try {
            const trailId = runsMatch[1]
            const trail = await getTrail(projectId, trailId)
            if (!trail) return json({ error: "Trail not found" }, 404)
            const rawLimit = new URL(req.url).searchParams.get("limit")
            const limit = rawLimit ? Math.max(1, Math.min(200, Number(rawLimit) || 20)) : 20
            const runs = await listTrailRunHistory(projectId, trailId, limit)
            return json({ runs })
          } catch (e) {
            return json(oops(e, "trails-run-history"), 500)
          }
        }
      }

      // POST /api/trails/:id/walk — trigger an on-demand Walk. runWalkNow reserves the single walk-slot
      // and returns a runId immediately (the walk runs in the background, crash-isolated); the
      // dashboard polls /api/trails/dashboard until the verdict lands. A 2nd concurrent trigger → 409
      // (never a 2nd browser on the 1GB box); an unknown trail → 404.
      const walkMatch = path.match(/^\/api\/trails\/([^/]+)\/walk$/)
      if (req.method === "POST" && walkMatch) {
        try {
          const { runId } = await runWalkNow(projectId, walkMatch[1])
          return json({ runId })
        } catch (e: any) {
          if (e instanceof WalkBusyError) return json({ error: "A walk is already running" }, 409)
          if (String(e?.message || e) === "trail not found") return json({ error: "No such trail" }, 404)
          if (String(e?.message || e) === "trail is paused") return json({ error: "Trail is paused — resume it first" }, 409)
          return json(oops(e, "trails-walk"), 500)
        }
      }

      // ── AutoSims F1: LLM-drive authoring ──
      if (req.method === "POST" && path === "/api/trails/author") {
        const body = await req.json().catch(() => ({}))
        const name = String(body.name || "").trim().slice(0, 80)
        const objective = String(body.objective || "").trim()
        const baseUrl = String(body.base_url || "").trim()
        let viewport: ReturnType<typeof normalizeTrailViewport> = null
        if ("viewport" in body) {
          try { viewport = normalizeTrailViewport((body as any).viewport) }
          catch (e: any) { return json({ error: e?.message || "Invalid viewport" }, 400) }
        }
        const testAccount = body.test_account ? String(body.test_account) : undefined
        if (!name) return json({ error: "name required" }, 400)
        if (objective.length < 10 || objective.length > 2000) return json({ error: "objective must be 10-2000 chars" }, 400)
        if (!/^https?:\/\//.test(baseUrl) || baseUrl.length > 500) return json({ error: "base_url must be an http(s) URL" }, 400)
        if (testAccount && !(await getTestAccountByName(projectId, testAccount))) return json({ error: `unknown test account "${testAccount}"` }, 400)
        try {
          const { sessionId } = await runAuthorNow(projectId, { name, objective, baseUrl, viewport, testAccountName: testAccount, createdBy: meT })
          return json({ sessionId }, 202)
        } catch (e) {
          if (e instanceof WalkBusyError) return json({ error: "An AutoSim is already running — try again shortly." }, 409)
          return json(oops(e, "trails-author"), 500)
        }
      }
      if (req.method === "GET" && path === "/api/trails/author/active") {
        // "No active session" is a NORMAL empty result, not a not-found error: the dashboard polls this
        // on every load, so a 404 spammed the console/network tab (reported as a bug) even though the
        // clients treat it as "nothing running". Return 200 with a null session; the clients already
        // guard on `!s || s.status !== "running"`, so { active: null } is a compatible payload.
        const s = await getActiveAuthorSession(projectId)
        return s
          ? json({ ...s, active: true, limitMs: AUTOSIM_DEADLINE_MS_DEFAULT })
          : json({ active: null })
      }
      // GET /api/trails/author/stalled — KLA-152: list recent stalled sessions with a checkpoint or partial draft.
      if (req.method === "GET" && path === "/api/trails/author/stalled") {
        const sessions = await listStalledAuthorSessions(projectId)
        return json({ sessions })
      }
      // POST /api/trails/author/:sessionId/cancel — KLA-151: abort the in-flight author drive at the next step boundary.
      {
        const authorCancelMatch = path.match(/^\/api\/trails\/author\/([^/]+)\/cancel$/)
        if (req.method === "POST" && authorCancelMatch) {
          const sessionId = authorCancelMatch[1]
          const s = await getAuthorSession(projectId, sessionId)
          if (!s) return json({ error: "Not found" }, 404)
          if (s.status !== "running") return json({ error: "Session is not running" }, 409)
          const signalled = cancelCurrentAuthor(sessionId)
          return json({ ok: signalled, queued: !signalled })
        }
      }
      // POST /api/trails/author/:sessionId/resume — KLA-152: resume a stalled session from its checkpoint.
      {
        const resumeMatch = path.match(/^\/api\/trails\/author\/([^/]+)\/resume$/)
        if (req.method === "POST" && resumeMatch) {
          const priorId = resumeMatch[1]
          const prior = await getAuthorSession(projectId, priorId)
          if (!prior) return json({ error: "Session not found" }, 404)
          if (prior.status !== "stalled") return json({ error: `Session is ${prior.status}, not stalled` }, 409)
          if (!prior.checkpoint) return json({ error: "Session has no checkpoint to resume from" }, 409)
          try {
            const { sessionId } = await runAuthorNow(projectId, {
              name: prior.name, objective: prior.objective, baseUrl: prior.baseUrl,
              viewport: null, testAccountName: prior.testAccount ?? undefined, createdBy: meT,
            }, { resumeSessionId: priorId })
            return json({ sessionId }, 202)
          } catch (e) {
            if (e instanceof WalkBusyError) return json({ error: "An AutoSim is already running — try again shortly." }, 409)
            return json(oops(e, "trails-author-resume"), 500)
          }
        }
      }
      // GET /api/trails/author/:sessionId/live — KLA-150: SSE live screencast for the authoring drive.
      {
        const authorLiveMatch = path.match(/^\/api\/trails\/author\/([^/]+)\/live$/)
        if (req.method === "GET" && authorLiveMatch) {
          const sessionId = authorLiveMatch[1]
          const s = await getAuthorSession(projectId, sessionId)
          if (!s) return json({ error: "Not found" }, 404)
          return new Response(openLiveWatchStream(projectId, sessionId), {
            headers: {
              "content-type": "text/event-stream; charset=utf-8",
              "cache-control": "no-cache, no-transform",
              "connection": "keep-alive",
              "x-accel-buffering": "no",
            },
          })
        }
      }
      // GET /api/trails/author/:sessionId/steps/:stepIdx/screenshot — KLA-150: serve a step screenshot from S3.
      {
        const authorStepShotMatch = path.match(/^\/api\/trails\/author\/([^/]+)\/steps\/(\d+)\/screenshot$/)
        if (req.method === "GET" && authorStepShotMatch) {
          const [, sessionId, stepIdxStr] = authorStepShotMatch
          const s = await getAuthorSession(projectId, sessionId)
          if (!s) return json({ error: "Not found" }, 404)
          const stepIdx = Number(stepIdxStr)
          const step = s.steps.find((st) => st.idx === stepIdx)
          const key = (step as any)?.screenshotKey as string | undefined
          if (!key) return json({ error: "No screenshot for this step" }, 404)
          try {
            const { getObjectBytes } = await import("./lib/s3")
            const obj = await getObjectBytes(key)
            const ct = obj.contentType?.startsWith("image/") ? obj.contentType : "image/jpeg"
            return new Response(obj.bytes, { headers: { "Content-Type": ct, "Cache-Control": "private,max-age=86400" } })
          } catch (e) {
            return json(oops(e, "author-step-screenshot"), 500)
          }
        }
      }
      if (req.method === "GET" && path.startsWith("/api/trails/author/")) {
        const s = await getAuthorSession(projectId, path.slice("/api/trails/author/".length))
        return s ? json({ ...s, limitMs: AUTOSIM_DEADLINE_MS_DEFAULT }) : json({ error: "Not found" }, 404)
      }

      // GET /api/trails/:id/steps — return a draft trail's steps so the UI can show a review before Activate.
      {
        const mS = path.match(/^\/api\/trails\/([^/]+)\/steps$/)
        if (req.method === "GET" && mS) {
          const trail = await getTrail(projectId, mS[1])
          if (!trail) return json({ error: "Not found" }, 404)
          const steps = await listTrailSteps(projectId, trail.id)
          return json({ trail, steps })
        }
      }

      // PATCH /api/trails/:id/steps/:stepId — edit a draft trail step's actionValue or checkpoint.
      // KLA-244: the checkpoint accepts all 5 kinds (visible / textEquals / textContains /
      // urlMatches / elementCount) so an edited guard round-trips its full assertion, not just
      // a description. A bare {description} stays valid (persisted as a "visible" checkpoint).
      {
        const mPatch = path.match(/^\/api\/trails\/([^/]+)\/steps\/([^/]+)$/)
        if (req.method === "PATCH" && mPatch) {
          const trail = await getTrail(projectId, mPatch[1])
          if (!trail) return json({ error: "Not found" }, 404)
          if (trail.status !== "draft") return json({ error: "Trail is not a draft" }, 409)
          const body = await req.json().catch(() => null)
          if (!body || typeof body !== "object") return json({ error: "Invalid body" }, 400)
          const patch: StepPatch = {}
          if ("actionValue" in body) patch.actionValue = typeof body.actionValue === "string" ? body.actionValue : (body.actionValue == null ? null : undefined)
          if ("checkpoint" in body) {
            const cpIn = (body as any).checkpoint
            if (cpIn == null) patch.checkpoint = null
            else if (typeof cpIn === "object" && typeof cpIn.description === "string") {
              const cp = normalizeCheckpointInput(cpIn)
              if (!cp) return json({ error: "invalid checkpoint" }, 400)
              patch.checkpoint = cp
            }
            else return json({ error: "checkpoint must be null or a checkpoint object with a description" }, 400)
          }
          if (Object.keys(patch).length === 0) return json({ error: "Nothing to patch" }, 400)
          const updated = await updateTrailStep(projectId, mPatch[2], patch)
          if (!updated) return json({ error: "Step not found" }, 404)
          return json({ ok: true })
        }
      }

      // DELETE /api/trails/:id/steps/:stepId — remove a step from a draft trail.
      {
        const mDel = path.match(/^\/api\/trails\/([^/]+)\/steps\/([^/]+)$/)
        if (req.method === "DELETE" && mDel) {
          const trail = await getTrail(projectId, mDel[1])
          if (!trail) return json({ error: "Not found" }, 404)
          if (trail.status !== "draft") return json({ error: "Trail is not a draft" }, 409)
          const steps = await listTrailSteps(projectId, trail.id)
          const target = steps.find((s) => s.id === mDel[2])
          if (!target) return json({ error: "Step not found" }, 404)
          await deleteTrailStep(projectId, mDel[2])
          return json({ ok: true })
        }
      }

      // ── AutoSims F1: approve a Draft Trail → Active (only Active trails file findings) ──
      {
        const mA = path.match(/^\/api\/trails\/([^/]+)\/approve$/)
        if (req.method === "POST" && mA) {
          const trail = await getTrail(projectId, mA[1])
          if (!trail) return json({ error: "Not found" }, 404)
          if (trail.status !== "draft") return json({ error: `Trail is ${trail.status}, not draft` }, 409)
          await setTrailStatus(projectId, trail.id, "active")
          return json({ ok: true })
        }
      }

      // GET /api/trails/walks/:runId/report.pdf — download the walk as a PDF.
      // 404 for unknown/cross-project walk; 409 if Chromium walk slot is busy.
      const reportPdfMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/report\.pdf$/)
      if (req.method === "GET" && reportPdfMatch) {
        const runId = reportPdfMatch[1]
        // IDOR guard: gatherWalkReport is project-scoped; null = not in this project
        const check = await gatherWalkReport(projectId, runId)
        if (!check) return json({ error: "Not found" }, 404)
        try {
          const replaySet = await runsWithReplay(projectId, [runId])
          const replayUrl = replaySet.has(runId) ? BASE + "/api/trails/walks/" + runId + "/replay" : undefined
          const pdfBytes = await renderWalkPdf(projectId, runId, BASE, { replayUrl })
          const shortId = runId.slice(0, 8)
          return new Response(pdfBytes as unknown as BodyInit, {
            headers: {
              "content-type": "application/pdf",
              "content-disposition": `attachment; filename="klavity-walk-${shortId}.pdf"`,
              "content-length": String(pdfBytes.byteLength),
            },
          })
        } catch (e: any) {
          // PdfBusyError: PDF queue timed out (KLAVITYKLA-207 — queue-backed, never from walk slot).
          if (e instanceof PdfBusyError) {
            return new Response(JSON.stringify({ error: "PDF generator busy" }), {
              status: 429,
              headers: { "content-type": "application/json", "retry-after": "5" },
            })
          }
          return json(oops(e, "trails-report-pdf"), 500)
        }
      }

      // POST /api/trails/walks/:runId/findings — KLA-155: owner adds a manual bug/finding to a walk.
      // Mirrors the shared-token version but uses session auth instead. Project-scoped.
      const ownerFindingAddMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/findings$/)
      if (req.method === "POST" && ownerFindingAddMatch) {
        const runId = ownerFindingAddMatch[1]
        try {
          const walk = await getWalk(projectId, runId)
          if (!walk) return json({ error: "Walk not found." }, 404)
          const body = await req.json().catch(() => ({}))
          const title = String((body as any).title || "").trim().slice(0, 160)
          const detail = String((body as any).detail || "").trim().slice(0, 2000)
          if (!title) return json({ error: "title required" }, 400)
          const id = crypto.randomUUID()
          const result = await recordFinding(projectId, {
            runId, trailId: walk.trailId, kind: "regression", title,
            evidence: { reason: "manual_bug", detail, source: "owner_walk_page" },
            groundQuote: detail || title, confidence: 0.75,
            dedupKey: `manual:${runId}:${id}`,
          })
          return json({ ok: true, id: result.id })
        } catch (e) {
          return json(oops(e, "owner-walk-add-finding"), 500)
        }
      }

      // GET /api/trails/walks/:runId/steps/:stepId/screenshot — KLA-155: serve screenshot stored in S3
      // for a run_step. Project-scoped. Returns the image as binary (Content-Type: image/*).
      const stepShotMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/steps\/([^/]+)\/screenshot$/)
      if (req.method === "GET" && stepShotMatch) {
        const [, runId, stepId] = stepShotMatch
        try {
          const r = await db!.execute({
            sql: `SELECT evidence_json FROM run_steps WHERE project_id=? AND run_id=? AND id=? LIMIT 1`,
            args: [projectId, runId, stepId],
          })
          if (!r.rows.length) return json({ error: "Step not found" }, 404)
          const ev: any = JSON.parse(String((r.rows[0] as any).evidence_json || "{}"))
          const key = ev?.screenshotKey as string | undefined
          if (!key) return json({ error: "No screenshot for this step" }, 404)
          const { getObjectBytes } = await import("./lib/s3")
          const obj = await getObjectBytes(key)
          const ct = obj.contentType?.startsWith("image/") ? obj.contentType : "image/png"
          return new Response(obj.bytes, { headers: { "Content-Type": ct, "Cache-Control": "private,max-age=86400" } })
        } catch (e) {
          return json(oops(e, "walk-step-screenshot"), 500)
        }
      }

      // POST /api/trails/walks/:runId/cancel — KLA-100: abort an in-flight Walk at the next step boundary.
      // IDOR guard: walk must belong to this project. 409 when walk is not running (already finished).
      // Returns { ok: true } if the signal was fired, { ok: false, queued: true } if the walk is "running"
      // in the DB but no in-process signal exists (e.g. server restarted mid-walk — extremely rare).
      const cancelMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/cancel$/)
      if (req.method === "POST" && cancelMatch) {
        const runId = cancelMatch[1]
        const walk = await getWalk(projectId, runId)
        if (!walk) return json({ error: "Not found" }, 404)
        if (walk.status !== "running") return json({ error: "Walk is not running" }, 409)
        const signalled = cancelCurrentWalk(runId)
        return json({ ok: signalled, queued: !signalled })
      }

      // POST /api/trails/walks/:runId/resume — KLA-104: provide a secret to a paused Walk.
      // Body: { secretKey: string, secretValue: string }. secretKey must match the challenge key
      // stored when the walk paused. Returns { ok: true } on success, 409 when not paused / wrong key.
      const resumeMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/resume$/)
      if (req.method === "POST" && resumeMatch) {
        const runId = resumeMatch[1]
        const walk = await getWalk(projectId, runId)
        if (!walk) return json({ error: "Not found" }, 404)
        if (walk.status !== "paused") return json({ error: "Walk is not paused" }, 409)
        let body: any = {}
        try { body = await req.json() } catch { /* empty body = wrong key → 409 below */ }
        const { secretKey, secretValue } = body
        if (!secretKey || !secretValue) return json({ error: "secretKey and secretValue are required" }, 400)
        const ok = await resumeWalk(projectId, runId, secretKey, secretValue)
        if (!ok) return json({ error: "Invalid secretKey or walk no longer paused" }, 409)
        return json({ ok: true })
      }

      // GET /api/trails/walks/:runId/share — list active (non-revoked, non-expired) share tokens.
      // POST /api/trails/walks/:runId/share — mint an expiring share link for a walk.
      const shareMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/share$/)
      if (shareMatch) {
        const runId = shareMatch[1]

        if (req.method === "GET") {
          try {
            const tokens = await listShareTokens(projectId, runId)
            return json({ tokens })
          } catch (e) {
            return json(oops(e, "trails-share-list"), 500)
          }
        }

        // POST — mint. Returns { url, replayUrl, expiresAt, hasPasscode } — replayUrl non-null when a
        // replay exists. KLA-210 (JTBD 7.5): honors an optional {ttlDays} expiry choice (7/30/90) and
        // an optional {passcode} that gates the public data endpoint.
        if (req.method === "POST") {
          const check = await gatherWalkReport(projectId, runId)
          if (!check) return json({ error: "Not found" }, 404)
          try {
            const body = await req.json().catch(() => ({}))
            const ttlDays = ALLOWED_SHARE_TTL_DAYS.has(Number((body as any).ttlDays)) ? Number((body as any).ttlDays) : 30
            const ttlMs = ttlDays * 24 * 3600e3
            const passcode = typeof (body as any).passcode === "string" ? (body as any).passcode.trim().slice(0, 64) : ""
            const [rawToken, replaySet] = await Promise.all([
              mintShareToken(projectId, runId, meT, ttlMs, { passcode: passcode || null }),
              runsWithReplay(projectId, [runId]),
            ])
            const expiresAt = Date.now() + ttlMs
            const replayUrl = replaySet.has(runId) ? BASE + "/shared/walk-replay/" + rawToken : null
            return json({ url: BASE + "/shared/walk/" + rawToken, pdfUrl: BASE + "/shared/walk-report/" + rawToken, replayUrl, expiresAt, ttlDays, hasPasscode: !!passcode })
          } catch (e) {
            return json(oops(e, "trails-share-mint"), 500)
          }
        }
      }

      // DELETE /api/trails/walks/:runId/share/:tokenId — revoke a share token by its row id.
      // PATCH  /api/trails/walks/:runId/share/:tokenId — KLA-210 (JTBD 7.5): bump the token's expiry to
      //   now+{ttlDays} (7/30/90). Project+run scoped so a caller can only extend their own token.
      const shareRevokeMatch = path.match(/^\/api\/trails\/walks\/([^/]+)\/share\/([^/]+)$/)
      if (req.method === "DELETE" && shareRevokeMatch) {
        const tokenId = shareRevokeMatch[2]
        try {
          const revoked = await revokeShareToken(tokenId)
          if (!revoked) return json({ error: "Token not found or already revoked" }, 404)
          return json({ ok: true })
        } catch (e) {
          return json(oops(e, "trails-share-revoke"), 500)
        }
      }
      if (req.method === "PATCH" && shareRevokeMatch) {
        const runId = shareRevokeMatch[1]
        const tokenId = shareRevokeMatch[2]
        try {
          const body = await req.json().catch(() => ({}))
          const ttlDays = ALLOWED_SHARE_TTL_DAYS.has(Number((body as any).ttlDays)) ? Number((body as any).ttlDays) : 30
          const extended = await extendShareToken(projectId, runId, tokenId, ttlDays * 24 * 3600e3)
          if (!extended) return json({ error: "Token not found, revoked, or expired" }, 404)
          return json({ ok: true, ttlDays, expiresAt: Date.now() + ttlDays * 24 * 3600e3 })
        } catch (e) {
          return json(oops(e, "trails-share-extend"), 500)
        }
      }

      return json({ error: "Not found" }, 404)
    }

    if (path.startsWith("/api/")) {
      // ANON_AI_DEMO_ROUTES power the pre-signup onboarding aha and are safe anonymously
      // (own rate limit + SSRF guard + caps) — their handlers below re-derive auth themselves.
      if (!me && !ANON_AI_DEMO_ROUTES.has(`${req.method} ${path}`)) return needLogin()

      // dashboard data
      if (req.method === "GET" && path === "/api/me") {
        const ms = await membershipsFor(me)
        const active = ms[0] || null
        const members = active ? await membersOf(active.workspaceId) : []
        return json({ email: me, workspaces: ms, active, members })
      }
      // ── dashboard-on-login aggregate (P1): one round-trip, reads only, no AI/vision. ──
      // Derived single project ('proj_'+workspaceId) until the P2 schema lands; UI is already project-shaped.
      if (req.method === "GET" && path === "/api/dashboard") {
        try {
          // Real projects (P2). Honor ?project=:id (projectAccess-gated); default to the first.
          const allProjects = await listProjects(me)
          if (!allProjects.length) {
            // No project yet — return an empty-but-valid shape so the UI renders skeleton/empty states.
            return json({ email: me, projects: [], active: null, members: [], sims: [], saying: [], tickets: [], activity: [], counts: { feedback: 0, tickets: 0, activity: 0 } })
          }
          // KLAVITYKLA-299: when no ?project= param is present, fall back to the klav_proj cookie
          // (set on a previous successful load) so the user's selection persists across reloads.
          // Explicit ?project= always wins; cookie is only consulted when the param is absent.
          const paramProject = url.searchParams.get("project")
          const cookieProject = !paramProject
            ? decodeURIComponent(parseCookies(req.headers.get("cookie"))["klav_proj"] || "") || null
            : null
          const requested = paramProject || cookieProject
          const resolved = await resolveProject(me, requested)
          if (!resolved) return json({ error: "No access to this project." }, 403)
          const projectId = resolved.id
          const access = resolved.access
          const role = access === "admin" ? "admin" : "user" // legacy vocab for the dashboard UI
          const isAdmin = access === "admin"

          // projects / active — REAL projects from the projects table.
          const activeProj = await projectById(projectId)
          const projectName = activeProj?.name || "Default Project"
          const projects = allProjects.map(p => ({ id: p.id, name: p.name }))
          // siteUrl: exposed so the Add-a-Sim "Run a review now" panel (JTBD 6.10) can prefill the URL.
          const activeOut = { id: projectId, name: projectName, role, siteUrl: activeProj?.siteUrl || null }

          // members — project roster (project_members), mapped to legacy admin|user for the UI.
          const members = (await membersOfProject(projectId)).map(m => ({ email: m.email, role: m.role === "admin" ? "admin" : "user", createdAt: m.createdAt }))
          const wid = projectId // reads below are all project-scoped on the project id

          // Reads run in parallel (each is an indexed query).
          const [personas, feedbackTickets, activityRows, simObservations] = await Promise.all([
            listPersonas(wid),
            // All recent feedback (not just withTicketOnly) — Klavity Cloud is the primary ticket system.
            listFeedback(projectId, { limit: 12 }),
            // Non-admins see only their own activity (own-rows-only); admins see all.
            listActivity(projectId, { actorEmail: isAdmin ? null : me, limit: 25 }),
            // Only Sim-generated observations (sim_id IS NOT NULL) — bugs never bleed into the Sims feeds.
            listFeedback(projectId, { simOnly: true, limit: 100 }),
          ])

          // Index personas for name/role/accent lookups by sim_id.
          const personaById = new Map(personas.map(p => [p.id, p]))
          const lastActiveBySim = new Map<string, number>()
          for (const ev of activityRows) {
            if (ev.simId && !lastActiveBySim.has(ev.simId)) lastActiveBySim.set(ev.simId, ev.createdAt)
          }

          // sims — the project's personas with a last-active hint from activity_events.
          const sims = personas.map(p => ({
            id: p.id, name: p.name, role: p.role, type: p.type,
            initials: p.initials || p.name.slice(0, 2).toUpperCase(),
            accent: p.accent || "#6366f1",
            insightsCount: Array.isArray(p.insights) ? p.insights.length : 0,
            lastActiveAt: lastActiveBySim.get(p.id) ?? null,
          }))

          // saying — "what your Sims are saying" overview feed: only Sim observations, newest-first.
          // simObservations is already sim_id IS NOT NULL, so no bug-without-sim can appear.
          let saying = simObservations
            .filter(f => f.observation && f.simId && personaById.has(f.simId))
            .slice(0, 12)
            .map(f => {
              const p = personaById.get(f.simId!)
              return {
                source: "feedback" as const,
                simId: f.simId, simName: p!.name,
                initials: p!.initials || p!.name.slice(0, 2).toUpperCase(),
                accent: p!.accent || "#6366f1",
                text: f.observation, sentiment: f.sentiment,
                urlPath: f.urlPath, createdAt: f.createdAt,
              }
            })
          if (!saying.length) {
            // fallback: most recent insight per persona (so it's never blank for a fresh project).
            const fb: any[] = []
            for (const p of personas) {
              const ins = Array.isArray(p.insights) ? p.insights : []
              const top = ins[0]
              if (top && (top.text || top.quote)) {
                fb.push({
                  source: "insight" as const,
                  simId: p.id, simName: p.name,
                  initials: p.initials || p.name.slice(0, 2).toUpperCase(),
                  accent: p.accent || "#6366f1",
                  text: top.text || top.quote, kind: top.kind || null,
                  createdAt: p.updatedAt,
                })
              }
            }
            saying = fb.slice(0, 12) as any
          }

          // simFeedback — per-Sim observation map for the Sims tab; covers all 100 most recent
          // Sim observations grouped by simId so the Sims page can show each Sim's full history.
          const simFeedback: Record<string, Array<{ id: string; text: string; sentiment: string | null; urlPath: string | null; createdAt: number }>> = {}
          for (const f of simObservations) {
            if (!f.simId || !f.observation || !personaById.has(f.simId)) continue
            if (!simFeedback[f.simId]) simFeedback[f.simId] = []
            simFeedback[f.simId].push({ id: f.id, text: f.observation, sentiment: f.sentiment, urlPath: f.urlPath, createdAt: f.createdAt })
          }

          // tickets — all recent feedback (Klavity Cloud is the primary tracker), newest-first.
          // Enriched with status/assignee (management state) and exports (connector push history).
          const ticketIds = feedbackTickets.map(f => f.id)
          // G1: which tickets carry a session replay → show the "▶ Session replay" affordance only there.
          const ticketsWithReplay = ticketIds.length ? await feedbackIdsWithReplay(projectId, ticketIds) : new Set<string>()
          const [ticketExportsMap, ticketMetaRows] = await Promise.all([
            ticketIds.length ? exportsForFeedbackIds(ticketIds) : Promise.resolve({} as Record<string, any[]>),
            // Fetch mutable state + recurrence-memory columns in one batch.
            // recurrence_dates_json / last_seen_at / resolved_at / created_at power the four
            // KLA-2 dashboard fields: recurrenceCount, firstSeen, lastSeen, isRegression.
            db && ticketIds.length
              ? db.execute({
                  sql: `SELECT id, status, assignee, notes, recurrence_count,
                               recurrence_dates_json, last_seen_at, resolved_at, created_at
                        FROM feedback WHERE id IN (${ticketIds.map(() => "?").join(",")})`,
                  args: ticketIds,
                }).then(r => {
                  const m: Record<string, { status: string; assignee: string | null; notes: string | null; recurrence: number; recurrenceDatesJson: string | null; lastSeenAt: number | null; resolvedAt: number | null; createdAt: number }> = {}
                  for (const x of r.rows) {
                    m[String((x as any).id)] = {
                      status: (x as any).status ? String((x as any).status) : "open",
                      assignee: (x as any).assignee != null ? String((x as any).assignee) : null,
                      notes: (x as any).notes != null ? String((x as any).notes) : null,
                      recurrence: Number((x as any).recurrence_count ?? 1),
                      recurrenceDatesJson: (x as any).recurrence_dates_json != null ? String((x as any).recurrence_dates_json) : null,
                      lastSeenAt: (x as any).last_seen_at != null ? Number((x as any).last_seen_at) : null,
                      resolvedAt: (x as any).resolved_at != null ? Number((x as any).resolved_at) : null,
                      createdAt: Number((x as any).created_at),
                    }
                  }
                  return m
                })
              : Promise.resolve({} as Record<string, { status: string; assignee: string | null; notes: string | null; recurrence: number; recurrenceDatesJson: string | null; lastSeenAt: number | null; resolvedAt: number | null; createdAt: number }>),
          ])
          const tickets = feedbackTickets.map(f => {
            const p = f.simId ? personaById.get(f.simId) : null
            const meta = ticketMetaRows[f.id] ?? { status: "open", assignee: null, notes: null, recurrence: 1, recurrenceDatesJson: null, lastSeenAt: null, resolvedAt: null, createdAt: f.createdAt }
            // Build exports: latest attempt per connector (rows arrive newest-first). A success
            // always wins over an older failure for the same connector; a connector whose LATEST
            // attempt failed and never succeeded surfaces as a failed badge so the UI can offer
            // Retry (KLA-283). connectorId + status ride along for that retry call.
            const rawExports = ticketExportsMap[f.id] ?? []
            const okConnectors = new Set<string>()
            const seenConnector = new Set<string>()
            const exports: { type: string; externalKey: string | null; externalUrl: string | null; connectorId: string; status: string }[] = []
            for (const exp of rawExports) if (exp.status === "ok") okConnectors.add(exp.connectorId)
            for (const exp of rawExports) {
              // A later failed retry must not hide an issue that already exists in the tracker.
              if (exp.status !== "ok" && okConnectors.has(exp.connectorId)) continue
              if (seenConnector.has(exp.connectorId)) continue
              seenConnector.add(exp.connectorId)
              exports.push({ type: exp.type, externalKey: exp.externalKey, externalUrl: exp.externalUrl, connectorId: exp.connectorId, status: exp.status })
            }
            return {
              id: f.id, simName: p?.name ?? null,
              title: f.observation, priority: f.priority,
              urlPath: f.urlPath, urlHost: f.urlHost, sourceReferrer: f.sourceReferrer,
              planeIssueKey: f.planeIssueKey,
              planeIssueUrl: f.planeIssueUrl, createdAt: f.createdAt,
              status: meta.status, assignee: meta.assignee, exports,
              observation: f.observation, suggestedBug: f.suggestedBug,
              sentiment: f.sentiment, screenshotId: f.screenshotId,
              sourceQuote: f.sourceQuote, sourceDate: f.sourceDate,
              notes: meta.notes, hasReplay: ticketsWithReplay.has(f.id),
              recurrence: meta.recurrence, annotations: f.annotations,
              // KLA-2 regression-memory fields — consumed by dashboard UI via recurBadgeHtml/regrBannerHtml
              recurrenceCount: meta.recurrence,
              firstSeen: meta.createdAt,
              lastSeen: meta.lastSeenAt ?? meta.createdAt,
              isRegression: meta.resolvedAt != null && (meta.lastSeenAt ?? meta.createdAt) > meta.resolvedAt,
            }
          })

          // activity — recent events (already own-rows-scoped for non-admins above).
          const activity = activityRows.map(ev => {
            const p = ev.simId ? personaById.get(ev.simId) : null
            return {
              id: ev.id, type: ev.type, actorEmail: ev.actorEmail,
              simName: p?.name ?? null, urlPath: ev.urlPath, createdAt: ev.createdAt,
            }
          })

          const [counts, insights, widgetPing] = await Promise.all([
            dashboardCounts(projectId),
            computeDashboardInsights(projectId),
            // Widget heartbeat — drives the Snap-aware first-run checklist ("Install the report
            // widget" ticks the moment /widget.js phones home from the founder's site).
            latestWidgetPing(projectId),
          ])
          const widgetStatus = widgetPing ? { host: widgetPing.host, lastSeen: widgetPing.lastSeen } : null
          // KLAVITYKLA-299: stamp the resolved project in a cookie so the server can restore
          // the user's selection on the next bare /api/dashboard call (no ?project= param).
          // KLAVITYKLA-301: honest checklist signals.
          // hasTranscriptSim: at least one Sim with simSource='transcript' exists (step 4).
          // hasSimReaction: at least one sim_id IS NOT NULL feedback row exists (step 1).
          const hasTranscriptSim = personas.some(p => p.simSource === "transcript")
          const hasSimReaction = simObservations.length > 0
          return json(
            { email: me, projects, active: activeOut, members, sims, saying, simFeedback, tickets, activity, counts, insights, widgetStatus, hasTranscriptSim, hasSimReaction },
            200,
            { "Set-Cookie": projectCookie(projectId, SECURE) },
          )
        } catch (e: any) {
          return json(oops(e, "dashboard"), 500)
        }
      }

      // Returns the current session ID as a Bearer token — the extension uses this to sync sims.
      if (req.method === "GET" && path === "/api/extension-token") {
        // M2: mint a dedicated, revocable ext_ token bound to the session's user instead of handing the
        // raw session id to the extension. A leaked ext_ token is narrow-scope and revocable; a
        // leaked session id is full account access.
        const sid = parseCookies(req.headers.get("cookie"))["klav_session"]
        if (!sid) return json({ error: "No session." }, 401)
        const tokEmail = await getSession(sid)
        if (!tokEmail) return json({ error: "No session." }, 401)
        const extToken = await issueExtensionToken(tokEmail, null, SESSION_DAYS * 24 * 60 * 60 * 1000)
        return json({ token: extToken })
      }

      // ── RETIRED (KLAVITYKLA-288): the legacy inline Plane connection endpoints. ──
      // /api/integration (project/team) and /api/integration/personal (per-user, extension-only) used to
      // store a Plane workspace/project/token in the `integrations` table, which POST /api/feedback then
      // pushed to inline. That whole path is gone: Plane is now just another connector, managed in the
      // dashboard, so what a user configures is what the dashboard shows.
      // Existing rows were folded into connectors by migrateConnectorsPlane / migrateConnectorsPlanePersonal
      // (lib/db.ts). These endpoints answer 410 Gone with a pointer rather than 404, so an old extension
      // build gets an actionable message instead of a silent failure. Writes are refused outright — the
      // integrations table must not gain new rows that nothing reads.
      if (path === "/api/integration" || path === "/api/integration/personal") {
        return json({
          error: "The Plane connection moved to Connectors. Open Settings → Connectors in the Klavity dashboard to manage it.",
          retired: true,
          connectors_url: `${BASE}/dashboard#connectors`,
        }, 410)
      }
      // ── member-roster export WITH POLICY (JTBD 5.8 / KLAVITYKLA-287) ──────────────────────────────
      // Data-governance export: only an effective admin (owner/admin) may export; the file carries ONLY
      // the allow-listed, PII-minimized field set (email, role, joined_at, status). The export is
      // recorded on the activity feed as an audit event. CSV by default, ?format=json for JSON.
      if (req.method === "GET" && path === "/api/team/export") {
        const proj = await resolveProject(me, url.searchParams.get("project"))
        if (!proj) return json({ error: "No project." }, 400)
        const result = buildMemberExport(proj.access, await membersOfProject(proj.id))
        if (!result.ok) return json({ error: result.error }, result.status)
        const format = (url.searchParams.get("format") || "csv").toLowerCase()
        // Audit trail (best-effort — never fail the export on a logging hiccup).
        await insertActivity({
          projectId: proj.id, type: "member_export", actorEmail: me,
          meta: { count: result.rows.length, fields: [...MEMBER_EXPORT_FIELDS], format },
        }).catch((e: any) => console.warn("member_export activity skipped:", e?.message || e))
        if (format === "json") {
          return json(
            { project: proj.id, fields: [...MEMBER_EXPORT_FIELDS], members: result.rows },
            200,
            { "Content-Disposition": `attachment; filename="klavity-members-${proj.id}.json"` },
          )
        }
        return new Response(membersToCsv(result.rows), {
          status: 200,
          headers: {
            "content-type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="klavity-members-${proj.id}.csv"`,
          },
        })
      }

      // ── first-class member invite (JTBD 6.4 / KLAVITYKLA-294) ──
      // Admin invites someone by email+role. This is now an explicit, durable, VISIBLE action:
      //   • project_members carries the durable membership (role + invited_by + invited_at). Because
      //     login requires an OTP to the invited inbox, the row existing before "accept" is not a
      //     privilege leak — nobody reaches the project without controlling that mailbox.
      //   • ticket_assignment_invites carries the invite LIFECYCLE (status pending→accepted, resend
      //     via last_sent_at). Its on-login accept path flips pending→accepted and preserves the
      //     invited role (addProjectMember ON CONFLICT DO NOTHING).
      // A member-invite email is sent (best-effort; emailSent reflects whether SendGrid was reachable
      // for a config, mirroring notifyTicketAssignee's honesty). Re-inviting an already-pending person
      // just re-sends (resend). Inviting an already-active member updates their role.
      if (req.method === "POST" && path === "/api/team/invite") {
        const { email, role, project } = await req.json().catch(() => ({}))
        const inv = String(email || "").trim().toLowerCase()
        if (!inv.includes("@")) return json({ error: "Enter a valid email." }, 400)
        const proj = await resolveProject(me, project ? String(project) : null)
        if (!proj) return json({ error: "No project." }, 400)
        if (proj.access !== "admin") return json({ error: "Only admins can invite." }, 403)
        const p = await projectById(proj.id)
        const wantRole = role === "admin" ? "admin" : "member"
        // Was this person already an active member before we touched anything? (Determines pending vs accepted.)
        const priorAccess = await projectAccess(inv, proj.id)
        await addProjectMember(proj.id, p!.accountId, inv, wantRole, me)
        let status: "pending" | "accepted" = "accepted"
        let emailSent = false
        if (!priorAccess) {
          // New teammate → durable PENDING invite + email until they accept (sign in).
          status = "pending"
          await upsertTicketAssignmentInvite(proj.id, inv, me, null)
          if (process.env.SENDGRID_API_KEY) {
            emailSent = true
            void sendMemberInviteEmail({
              to: inv,
              projectName: p?.name ?? null,
              invitedBy: me,
              role: wantRole,
              joinUrl: `${BASE.replace(/\/+$/, "")}/login?email=${encodeURIComponent(inv)}&project=${encodeURIComponent(proj.id)}`,
            }).catch((e: any) => console.warn("member invite email skipped:", e?.message || e))
          }
        }
        return json({ ok: true, invite: { email: inv, role: wantRole, status }, emailSent, members: await membersOfProject(proj.id) })
      }

      // ── invite visibility: list who's invited + their status (JTBD 6.4 / KLAVITYKLA-294) ──
      // Any member with project access can see the roster + pending/accepted status. Read-only.
      if (req.method === "GET" && path === "/api/team/invites") {
        const proj = await resolveProject(me, url.searchParams.get("project"))
        if (!proj) return json({ error: "No project." }, 400)
        return json({ invites: await listProjectInvites(proj.id) })
      }

      // ── resend a still-pending invite (JTBD 6.4 / KLAVITYKLA-294) — admin only ──
      if (req.method === "POST" && path === "/api/team/invite/resend") {
        const { email, project } = await req.json().catch(() => ({}))
        const inv = String(email || "").trim().toLowerCase()
        const proj = await resolveProject(me, project ? String(project) : null)
        if (!proj) return json({ error: "No project." }, 400)
        if (proj.access !== "admin") return json({ error: "Only admins can resend invites." }, 403)
        const pending = await getPendingInvite(proj.id, inv)
        if (!pending) return json({ error: "No pending invite for that email." }, 404)
        const p = await projectById(proj.id)
        // Re-stamp last_sent_at (keeps status pending) and re-send the email.
        await upsertTicketAssignmentInvite(proj.id, inv, me, null)
        let emailSent = false
        if (process.env.SENDGRID_API_KEY) {
          emailSent = true
          void sendMemberInviteEmail({
            to: inv,
            projectName: p?.name ?? null,
            invitedBy: me,
            role: pending.role,
            joinUrl: `${BASE.replace(/\/+$/, "")}/login?email=${encodeURIComponent(inv)}&project=${encodeURIComponent(proj.id)}`,
          }).catch((e: any) => console.warn("member invite resend email skipped:", e?.message || e))
        }
        return json({ ok: true, emailSent, invites: await listProjectInvites(proj.id) })
      }

      // ── revoke a still-pending invite (JTBD 6.4 / KLAVITYKLA-294) — admin only ──
      // Only removes PENDING invites (never yanks an accepted/active member — that's a different action).
      if (req.method === "POST" && path === "/api/team/invite/revoke") {
        const { email, project } = await req.json().catch(() => ({}))
        const inv = String(email || "").trim().toLowerCase()
        const proj = await resolveProject(me, project ? String(project) : null)
        if (!proj) return json({ error: "No project." }, 400)
        if (proj.access !== "admin") return json({ error: "Only admins can revoke invites." }, 403)
        const revoked = await revokeProjectInvite(proj.id, inv)
        if (!revoked) return json({ error: "No pending invite for that email." }, 404)
        return json({ ok: true, invites: await listProjectInvites(proj.id) })
      }

      // ── account domain (onboarding step 1: tells clients from your own team) ──
      if (req.method === "POST" && path === "/api/account/domain") {
        const ms = await membershipsFor(me); const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        if (active.role !== "admin") return json({ error: "Admin only." }, 403)
        const { domain } = await req.json().catch(() => ({}))
        await setAccountDomain(active.workspaceId, String(domain || "").trim().toLowerCase())
        return json({ ok: true })
      }

      // ── onboarding-completed flag (KLA-297) ──
      // Called by the wizard at every EXIT (Open the Studio / Finish → reports / Skip for now), so
      // finishing without filling the optional website field still counts. Any member may set it —
      // it records "this workspace has been through setup", not an admin-only setting. Idempotent.
      if (req.method === "POST" && path === "/api/account/onboarded") {
        const ms = await membershipsFor(me); const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        await markAccountOnboarded(active.workspaceId)
        return json({ ok: true })
      }

      // ── canonical activation state + lifecycle nudge (KLAVITYKLA-298, JTBD 6.8) ──
      // Server-DERIVED activation: instead of the frontend re-inferring "onboarded"
      // from loose signals, we gather the real signals here (project created, widget
      // heartbeat, first report, first Sim + reaction, connector linked, teammate
      // invited) and hand them to the pure deriveActivation() ladder. The dashboard/
      // onboarding read this one authoritative value. Signals aggregate across ALL of
      // the account's projects so "the account has done X" is honest regardless of
      // which project the user is currently viewing.
      if (req.method === "GET" && path === "/api/activation") {
        try {
          const projects = await listProjects(me)
          const projectCount = projects.length

          let hasWidgetHeartbeat = false
          let reportCount = 0
          let simCount = 0
          let hasSimReaction = false
          let connectorCount = 0
          let memberCount = 0

          for (const p of projects) {
            const [ping, counts, personas, simFb, connectors, members] = await Promise.all([
              latestWidgetPing(p.id),
              dashboardCounts(p.id),
              listPersonas(p.id),
              listFeedback(p.id, { simOnly: true, limit: 1 }),
              listConnectors(p.id),
              membersOfProject(p.id),
            ])
            if (ping) hasWidgetHeartbeat = true
            reportCount += counts.feedback ?? 0
            simCount += personas.length
            if (simFb.length > 0) hasSimReaction = true
            connectorCount += connectors.length
            memberCount = Math.max(memberCount, members.length)
          }

          const signals: ActivationSignals = {
            projectCount, hasWidgetHeartbeat, reportCount,
            simCount, hasSimReaction, connectorCount, memberCount,
          }
          const activation = deriveActivation(signals)
          return json({ email: me, signals, activation })
        } catch (e: any) {
          return json(oops(e, "activation"), 500)
        }
      }

      // Redeem a partner/internal access code → sets the account to the 'partner' (unlimited) plan.
      // Accepted codes come from env KLAV_PARTNER_CODES (comma-separated, case-insensitive) — never
      // hardcoded in-repo, so codes can be rotated/added without a deploy. Admin-only.
      if (req.method === "POST" && path === "/api/account/redeem-code") {
        const ms = await membershipsFor(me); const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        if (active.role !== "admin") return json({ error: "Admin only." }, 403)
        const { code } = await req.json().catch(() => ({}))
        // Each entry is CODE or CODE:MAX (per-code redemption cap). Map normalized code → cap (0 = unlimited).
        const caps = new Map<string, number>()
        for (const raw of (process.env.KLAV_PARTNER_CODES || "").split(",")) {
          const [c, max] = raw.trim().split(":")
          const norm = String(c || "").trim().toUpperCase()
          if (norm) caps.set(norm, Math.max(0, Number(max) || 0))
        }
        const given = String(code || "").trim().toUpperCase()
        if (!given || !caps.has(given)) return json({ ok: false, error: "Invalid or expired code." }, 400)
        // KLAVITYKLA-315: enforce per-code redemption cap against the ledger before granting.
        const cap = caps.get(given) || 0
        if (cap > 0 && (await countPartnerCodeRedemptions(given)) >= cap) {
          return json({ ok: false, error: "This code has reached its redemption limit." }, 400)
        }
        await setAccountPlan(active.workspaceId, "partner")
        // KLAVITYKLA-315: durable, auditable ledger row for this redemption.
        await recordPartnerCodeRedemption({
          code: given, accountId: active.workspaceId, redeemedBy: me, grantedPlan: "partner", source: "api",
        }).catch((e: any) => console.warn("partner redemption ledger write skipped:", e?.message || e))
        return json({ ok: true, plan: "partner", message: "Partner access unlocked — unlimited use." })
      }

      // Current account plan (for the UI to show tier + gate the redeem panel).
      if (req.method === "GET" && path === "/api/account/plan") {
        const ms = await membershipsFor(me); const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        const billing = await accountBillingState(active.workspaceId)
        return json({
          plan: billing.plan,
          unlimited: await isAccountUnlimited(active.workspaceId),
          billing,
          quotas: quotasForPlan(billing.plan),
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
        })
      }

      // Current-period usage meters (KLAVITYKLA-305). MEASUREMENT ONLY — reports the billable
      // value-metric counts (Sims + guarded AutoSim flows) for this account for the current UTC
      // month. Read-only; performs NO quota check / blocking / charge (KLA-306/307 own enforcement).
      if (req.method === "GET" && path === "/api/account/usage") {
        const ms = await membershipsFor(me); const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        const period = url.searchParams.get("period") || usagePeriod()
        const metrics = await getAccountUsage(active.workspaceId, { period })
        const usage: Record<string, number> = { sim_review: 0, autosim_walk: 0 }
        for (const m of metrics) usage[m.metric] = m.count
        // KLAVITYKLA-309: attach the current plan + per-metric display meters (used/limit/pct) so the
        // billing drawer can render usage-vs-allowance progress bars from this single call.
        const billing = await accountBillingState(active.workspaceId)
        const meters = buildUsageMeters(billing.plan, usage)
        // KLAVITYKLA-276: customer-facing cost + per-project breakdown. Attribute the metered usage
        // (this period) and AI spend (today) to each project, and surface the account plan quotas +
        // the tenant daily AI budget so the drawer can show "which project spent what, vs allowance".
        const [projUsageRows, projSpendRows, budget] = await Promise.all([
          getAccountUsageByProject(active.workspaceId, { period }),
          tenantTodaySpendByProject(active.workspaceId),
          tenantBudgetRemaining(active.workspaceId),
        ])
        const projects = buildProjectUsage(projUsageRows, projSpendRows)
        const quotas = PLAN_QUOTAS[normalizePlan(billing.plan)]
        const cost = {
          today: budget.spent,
          budget: budget.budget,
          remaining: budget.remaining,
          overBudget: budget.overBudget,
        }
        return json({ accountId: active.workspaceId, period, plan: billing.plan, usage, metrics, meters, quotas, cost, projects })
      }

      if (req.method === "POST" && path === "/api/billing/checkout") {
        const ms = await membershipsFor(me); const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        if (active.role !== "admin") return json({ error: "Admin only." }, 403)
        if (!rlAllow(`billing:${me}`, BILLING_PER_USER, BILLING_WINDOW)) return json({ error: "rate limited" }, 429)
        const parsed = await readJsonLimited(req, 8 * 1024)
        if (!parsed.ok) return json({ error: parsed.error }, parsed.status)
        const plan = String(parsed.data?.plan || "")
        if (plan === "scale") return json({ error: "Scale is sales-assisted. Contact vishal@quantana.com.au." }, 400)
        if (plan !== "pro" && plan !== "team" && plan !== "founding") return json({ error: "Choose Pro, Team, or Founding." }, 400)
        // Founding Team is annual-only (STRIPE_PRICE_CATALOG.founding has no "month" entry) — force
        // the interval to "year" regardless of what the client sent so checkout can never miss the
        // catalog. Pro/Team keep the caller's choice.
        const interval = plan === "founding" ? "year" : normalizeInterval(String(parsed.data?.interval || "month"))
        const billing = await accountBillingState(active.workspaceId)
        const session = await createStripeCheckoutSession({
          accountId: active.workspaceId,
          email: me,
          plan,
          interval,
          customerId: billing.stripeCustomerId,
          successUrl: `${BASE}/dashboard?billing=success`,
          cancelUrl: `${BASE}/dashboard?billing=cancelled`,
        })
        if (session.customerId && !billing.stripeCustomerId) {
          await updateAccountBillingState(active.workspaceId, {
            plan: billing.plan,
            stripeCustomerId: session.customerId,
            stripeSubscriptionId: billing.stripeSubscriptionId,
            billingStatus: billing.billingStatus,
            billingInterval: billing.billingInterval,
            billingCurrentPeriodEnd: billing.billingCurrentPeriodEnd,
            billingCancelAtPeriodEnd: billing.billingCancelAtPeriodEnd,
          })
        }
        void trackFunnel(db!, { event: "checkout_started", email: me, accountId: active.workspaceId, props: { plan, interval } })
        return json({ ok: true, url: session.url, sessionId: session.id })
      }

      if (req.method === "POST" && path === "/api/billing/portal") {
        const ms = await membershipsFor(me); const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        if (active.role !== "admin") return json({ error: "Admin only." }, 403)
        if (!rlAllow(`billing:${me}`, BILLING_PER_USER, BILLING_WINDOW)) return json({ error: "rate limited" }, 429)
        const billing = await accountBillingState(active.workspaceId)
        if (!billing.stripeCustomerId) return json({ error: "No Stripe customer yet." }, 400)
        const session = await createStripePortalSession({ customerId: billing.stripeCustomerId, returnUrl: `${BASE}/dashboard?billing=portal` })
        return json({ ok: true, url: session.url, sessionId: session.id })
      }

      // ── Ticket management: PATCH /api/feedback/:id and POST /api/feedback/:id/export ──
      // Resolve the feedback's project via feedbackById across accessible projects.
      const feedbackIdMatch = path.match(/^\/api\/feedback\/([^/]+?)(\/export|\/replay|\/memory|\/merge|\/split|\/comments|\/timeline|\/activity|\/regression-receipt|\/labels(?:\/([^/]+))?|\/suggest-labels)?$/)
      if (feedbackIdMatch) {
        const fid = feedbackIdMatch[1]
        const feedbackSubroute = feedbackIdMatch[2]?.replace(/\/labels\/[^/]+$/, "/labels") || ""
        const labelIdParam = feedbackIdMatch[3] || null
        const isExport = feedbackSubroute === "/export"
        const isReplay = feedbackSubroute === "/replay"
        const isMemory = feedbackSubroute === "/memory"
        const isComments = feedbackSubroute === "/comments"
        const isTimeline = feedbackSubroute === "/timeline" || feedbackSubroute === "/activity"
        const isLabels = feedbackSubroute === "/labels"
        const isSuggestLabels = feedbackSubroute === "/suggest-labels"
        const isGuard = feedbackSubroute === "/guard"
        const isMerge = feedbackSubroute === "/merge"
        const isSplit = feedbackSubroute === "/split"
        const isRegressionReceipt = feedbackSubroute === "/regression-receipt"

        // Resolve which project this feedback belongs to and check the caller has access.
        let fbRow: any = null
        let fbAccess: "admin" | "member" | null = null
        const allProjects = await listProjects(me)
        for (const p of allProjects) {
          const a = await projectAccess(me, p.id)
          if (!a) continue
          const row = await feedbackById(p.id, fid)
          if (row) { fbRow = row; fbAccess = a; break }
        }
        if (!fbRow) return json({ error: "Feedback not found or not accessible." }, 404)

        // GET /api/feedback/:id/replay — the stored rrweb session-replay events for a ticket, so the
        // dashboard viewer can play them. Project-scoped (access already verified via fbRow above);
        // 404 when this ticket has no recording (widget didn't capture, or buffer was empty).
        if (req.method === "GET" && isReplay) {
          const replay = await getFeedbackReplay(fbRow.projectId, fid)
          if (!replay) return json({ error: "No replay for this report." }, 404)
          return json({ feedbackId: fid, events: replay.events, nEvents: replay.nEvents, trimmed: replay.trimmed, createdAt: replay.createdAt })
        }

        if (req.method === "GET" && isComments) {
          return json({ feedbackId: fid, comments: await listTicketComments(fid) })
        }

        if (req.method === "POST" && isComments) {
          const body = await req.json().catch(() => ({}))
          const text = String(body.body ?? body.comment ?? "").trim()
          if (!text) return json({ error: "Comment body is required." }, 400)
          if (text.length > 5000) return json({ error: "Comment body must be 5000 characters or fewer." }, 400)
          const comment = await insertTicketComment(fid, me, text)

          // KLAVITYKLA-290 Phase 1 — outbound comment sync (fire-and-forget).
          // Push this Klavity-authored comment to every linked external tracker. The push runs
          // asynchronously and NEVER blocks or throws into this response path — a sync failure
          // is recorded as an activity event and visible in the timeline.
          // INBOUND SEAM: source is always "klavity" here (Phase 1). When inbound sync (Phase 2)
          // is built, comments echoed from the tracker will carry source:"inbound" and will be
          // skipped by pushCommentToLinkedIssues to prevent loops.
          pushCommentToLinkedIssues(fbRow.projectId, fid, text, {
            authorEmail: me,
            klavityCommentId: comment.id,
            source: "klavity",
          }).catch((e) => {
            // Double-guard: pushCommentToLinkedIssues already catches internally.
            console.warn("[comment-sync] unexpected top-level error:", e)
          })

          // KLAVITYKLA-209 (JTBD 2.12) — notify the assignee + reporter + prior
          // commenters (watchers) that a new comment landed. Fire-and-forget: the
          // recipient gather + email/Slack sends never block or throw into this
          // response. The actor (me) is excluded and recipients are deduped inside
          // notifyTicketComment.
          void (async () => {
            const priorCommenters = (await listTicketComments(fid).catch(() => [])).map((c) => c.author)
            const projName = allProjects.find((p: any) => p.id === fbRow.projectId)?.name ?? null
            await notifyTicketComment({
              feedbackId: fid,
              ticketTitle: fbRow.observation ?? null,
              projectName: projName,
              commentBody: text,
              ticketUrl: ticketDashboardUrl(fbRow.projectId, fid),
              author: me,
              assignee: fbRow.assignee,
              contactEmail: fbRow.contactEmail,
              priorCommenters,
            })
          })().catch((e: any) => console.warn("[notify] comment notification failed:", e?.message || e))

          return json({ comment }, 201)
        }

        if (req.method === "GET" && isTimeline) {
          return json({ feedbackId: fid, items: await ticketActivityTimeline(fbRow.projectId, fid) })
        }

        // GET /api/feedback/:id/memory — recurring-issue memory: how many times this issue has been
        // seen, when, and who originally filed it (the "cited virtual customer" — a Sim persona or a
        // previous human reporter). Useful for the dashboard to surface "4th occurrence" context.
        if (req.method === "GET" && isMemory) {
          if (!db) return json({ error: "Database unavailable." }, 503)
          const memory = await buildRecurrenceMemory(db, fid, fbRow.projectId).catch(() => null)
          if (!memory) return json({ error: "No recurrence memory for this report." }, 404)
          return json({ memory })
        }

        // GET /api/feedback/:id — single enriched report with KLA-2 recurrence-memory fields.
        // Returns the same shape as each ticket in the dashboard /api/dashboard response, plus the
        // full RecurrenceMemory block (recurrenceCount, firstSeen, lastSeen, isRegression).
        if (req.method === "GET" && !feedbackSubroute) {
          const lastSeen = fbRow.lastSeenAt ?? fbRow.createdAt
          const isRegression = fbRow.resolvedAt != null && lastSeen > fbRow.resolvedAt
          // A.8 occurrence timeline: per-report verbatim receipts (description/screenshot/date) so the
          // detail view can render "you said X on Y, then Y2, then Y3" without a second round-trip.
          const occurrenceMemory = db
            ? await buildRecurrenceMemory(db, fid, fbRow.projectId).catch(() => null)
            : null
          // B.7: is this ticket auto-filed from a guard-caught (checkpoint-gone) regression, and has a
          // "caught & fixed" receipt already been sent to the original reporter? Drives the one-click
          // receipt offer on close. Best-effort — never blocks the detail read.
          const guardInfo = db ? await guardCaughtForFeedback(db, fbRow.projectId, fid).catch(() => null) : null
          const receiptRec = db && guardInfo?.guardCaught
            ? await latestReceiptForFeedback(db, fbRow.projectId, fid).catch(() => null)
            : null
          const report = {
            id: fbRow.id,
            projectId: fbRow.projectId,
            title: fbRow.observation,
            observation: fbRow.observation,
            sentiment: fbRow.sentiment,
            priority: fbRow.priority,
            status: fbRow.status,
            assignee: fbRow.assignee,
            notes: fbRow.notes,
            urlPath: fbRow.urlPath,
            urlHost: fbRow.urlHost,
            sourceReferrer: fbRow.sourceReferrer,
            sourceQuote: fbRow.sourceQuote,
            sourceDate: fbRow.sourceDate,
            screenshotId: fbRow.screenshotId,
            simId: fbRow.simId,
            planeIssueKey: fbRow.planeIssueKey,
            planeIssueUrl: fbRow.planeIssueUrl,
            issueKey: fbRow.issueKey,
            createdAt: fbRow.createdAt,
            updatedAt: fbRow.updatedAt,
            // KLA-2 recurrence-memory fields (same names consumed by the dashboard UI)
            recurrenceCount: fbRow.recurrenceCount,
            firstSeen: fbRow.createdAt,
            lastSeen,
            isRegression,
            labels: await labelsForFeedback(fid),
            // KLA-175: ghost chips — AI-suggested labels not yet attached
            suggestedLabels: await getSuggestedLabels(fid, fbRow.projectId),
            // KLA-200: human-readable sequential number
            seqNum: fbRow.seqNum ?? null,
            // A.8: chronological per-occurrence receipts (own wording + screenshot + date).
            occurrences: occurrenceMemory?.occurrences ?? [],
            // B.7: guard-caught receipt offer state. guardCaught gates the "Send regression-caught
            // receipt" action (only guard-caught tickets); receiptSent reflects a prior explicit send.
            guardCaught: guardInfo?.guardCaught ?? false,
            receiptSent: receiptRec != null,
            receiptSentAt: receiptRec?.sentAt ?? null,
            receiptRecipientCount: receiptRec?.recipients?.length ?? 0,
          }
          return json({ report })
        }

        // PATCH /api/feedback/:id — any project member may edit status/assignee/notes/priority
        if (req.method === "PATCH" && !feedbackSubroute) {
          const body = await req.json().catch(() => ({}))
          const VALID_STATUS = ["new", "open", "in_progress", "done", "dismissed"]
          if (body.status !== undefined && !VALID_STATUS.includes(body.status)) {
            return json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400)
          }
          const VALID_PRI = ["urgent", "high", "medium", "low"]
          if (body.priority !== undefined && body.priority !== null && !VALID_PRI.includes(body.priority)) {
            return json({ error: `priority must be one of: ${VALID_PRI.join(", ")}` }, 400)
          }
          const meta: Partial<{ status: string; assignee: string | null; notes: string | null; priority: string | null }> = {}
          if (body.status !== undefined) meta.status = body.status
          if (body.assignee !== undefined) {
            const assignee = normalizeAssigneeEmail(body.assignee)
            if (assignee === "") return json({ error: "assignee must be a valid email address." }, 400)
            if (!(await canAssignTicketTo(fbRow.projectId, fbAccess, assignee))) {
              return json({ error: "Only project admins can assign tickets to non-members." }, 403)
            }
            meta.assignee = assignee
          }
          if (body.notes !== undefined) meta.notes = body.notes ?? null
          if (body.priority !== undefined) meta.priority = body.priority ?? null
          const updated = await updateFeedbackMeta(fbRow.projectId, fid, meta)
          if (!updated) return json({ error: "Update failed." }, 500)
          const activityWrites: Promise<any>[] = []
          if (meta.status !== undefined && meta.status !== fbRow.status) {
            activityWrites.push(insertActivity({
              projectId: fbRow.projectId,
              type: "ticket_status_changed",
              actorEmail: me,
              feedbackId: fid,
              meta: { from: fbRow.status, to: meta.status },
            }).catch((e: any) => console.warn("ticket status activity skipped:", e?.message || e)))
          }
          // JTBD 3.13 (KLAVITYKLA-265): dismiss-with-reason teaches the Sim. When a human dismisses a
          // Sim-generated finding and supplies a reason, append it as a trait event on each cited trait
          // so repeated dismissals visibly accumulate in the Sim's evolution history and shape future
          // reviews. Only on a fresh transition INTO "dismissed"; best-effort (never blocks the PATCH).
          if (meta.status === "dismissed" && fbRow.status !== "dismissed" && fbRow.simId && body.reason) {
            const cited = Array.isArray(fbRow.citedTraitIds) ? fbRow.citedTraitIds.map((x: any) => String(x)) : []
            await recordSimDismissEvents({
              simId: fbRow.simId, projectId: fbRow.projectId, feedbackId: fid,
              reason: String(body.reason), citedTraitIds: cited, actor: me, now: Date.now(),
            }).catch((e: any) => console.warn("sim dismiss-reason event skipped:", e?.message || e))
          }
          if (meta.priority !== undefined && meta.priority !== fbRow.priority) {
            activityWrites.push(insertActivity({
              projectId: fbRow.projectId,
              type: "ticket_priority_changed",
              actorEmail: me,
              feedbackId: fid,
              meta: { from: fbRow.priority, to: meta.priority },
            }).catch((e: any) => console.warn("ticket priority activity skipped:", e?.message || e)))
            // KLAVITYKLA-286 (JTBD 5.7): mirror the new priority to any linked external issues.
            // Fire-and-forget; pass the just-updated priority so the sync uses the merged value.
            syncTicketFields(fid, fbRow.projectId, me, meta.priority ?? null)
          }
          // JTBD 2.15: track whether the assignment notification email actually went out so the
          // response can warn the assigning UI when it was silently skipped (SENDGRID_API_KEY unset).
          let assigneeEmailSent: boolean | null = null
          if (meta.assignee !== undefined && meta.assignee !== fbRow.assignee) {
            activityWrites.push(insertActivity({
              projectId: fbRow.projectId,
              type: "ticket_assignee_changed",
              actorEmail: me,
              feedbackId: fid,
              meta: { from: fbRow.assignee, to: meta.assignee },
            }).catch((e: any) => console.warn("ticket assignee activity skipped:", e?.message || e)))
            if (meta.assignee) {
              const proj = await projectById(fbRow.projectId).catch(() => null)
              const notify = await notifyTicketAssignee({
                projectId: fbRow.projectId,
                feedbackId: fid,
                assignee: meta.assignee,
                ticketTitle: String(fbRow.observation || "Untitled ticket"),
                projectName: proj?.name ?? null,
                assignedBy: me,
              })
              assigneeEmailSent = notify.emailSent
            }
          }
          if (activityWrites.length) await Promise.all(activityWrites)
          if (meta.status !== undefined && meta.status !== fbRow.status) {
            const proj = fbRow.contactEmail ? await projectById(fbRow.projectId).catch(() => null) : null
            void notifyReporterOnFix({
              contactEmail: fbRow.contactEmail,
              previousStatus: fbRow.status,
              nextStatus: meta.status,
              title: String(fbRow.observation || "Bug report"),
              projectName: proj?.name ?? "your project",
              ticketUrl: ticketDashboardUrl(fbRow.projectId),
            })
          }
          // ── Triage-gated auto-copy (KLA-282) ─────────────────────────────────────────────────────
          // Fire auto-copy when a report is triage-ACCEPTED: status transitions to "open" from either
          // "new" (first triage) or "dismissed" (re-accept after dismissal). This is the point at which
          // a human has reviewed the report and deemed it actionable. Status transitions from
          // "in_progress" or "done" back to "open" do NOT re-trigger (those are workflow reversals,
          // not fresh accepts). The connector's `auto_copy_min_priority` config key gates on priority.
          // The effective priority may have been updated in the SAME patch — use the merged value.
          const triageAcceptSources = new Set(["new", "dismissed"])
          if (meta.status === "open" && triageAcceptSources.has(String(fbRow.status))) {
            const effectivePriority = meta.priority !== undefined ? meta.priority : fbRow.priority
            autoCopyFeedback(fid, fbRow.projectId, me, effectivePriority)
          }
          // B.7: when this close is on a guard-caught (checkpoint-gone) ticket, tell the UI to OFFER the
          // one-click "regression-caught receipt" (offer, not silent auto-send). Only surfaced on a real
          // transition into done, when a receipt hasn't already been sent. Best-effort — never blocks.
          let offerReceipt = false
          if (db && meta.status === "done" && fbRow.status !== "done") {
            const g = await guardCaughtForFeedback(db, fbRow.projectId, fid).catch(() => null)
            if (g?.guardCaught) {
              const prior = await latestReceiptForFeedback(db, fbRow.projectId, fid).catch(() => null)
              offerReceipt = prior == null
            }
          }
          return json({ ok: true, offerRegressionReceipt: offerReceipt, assigneeEmailSent })
        }

        // POST /api/feedback/:id/regression-receipt — B.7 (KLAVITYKLA-247) "regression-caught receipt".
        // Explicit one-click send, offered when a guard-caught ticket is closed. Emails the original
        // reporter contact(s) on the issue's dedup cluster a forwardable "caught & fixed before it
        // reached your users" receipt (first-fixed date + catch time + fix confirmation), reusing A.4's
        // mail transport. Records the send for audit. Gracefully skips (sent:false) for ordinary tickets
        // or when no reporter contact exists — the UI surfaces the skip reason.
        if (req.method === "POST" && isRegressionReceipt) {
          if (!db) return json({ error: "Database unavailable." }, 503)
          const proj = await projectById(fbRow.projectId).catch(() => null)
          const res = await sendRegressionCaughtReceipt({
            projectId: fbRow.projectId, feedbackId: fid,
            projectName: proj?.name ?? "your project",
            ticketTitle: String(fbRow.observation || fbRow.suggestedBug?.title || "the reported issue"),
            sentBy: me,
          }, { db })
          if (!res.ok) return json({ error: res.error }, 500)
          if (!res.sent) {
            const reason = res.reason === "not_guard_caught"
              ? "This ticket wasn't auto-filed from a guard-caught regression."
              : "No original reporter contact email is on file for this issue."
            return json({ ok: true, sent: false, reason: res.reason, message: reason })
          }
          await insertActivity({
            projectId: fbRow.projectId, type: "regression_receipt_sent", actorEmail: me, feedbackId: fid,
            meta: { recipients: res.recipients.length, expectationId: res.record.expectationId },
          }).catch((e: any) => console.warn("regression receipt activity skipped:", e?.message || e))
          return json({ ok: true, sent: true, recipients: res.recipients, sentAt: res.record.sentAt })
        }

        // POST /api/feedback/:id/guard — KLA-242 "Guard this fix".
        // Any project member can call this on a resolved ticket (status=done).
        // Creates or upserts an expectation from the ticket and marks it validated,
        // ready to be enforced as an AutoSim assert step.
        // Returns { expectationId, status } — callers use this to deep-link to the guards board.
        if (req.method === "POST" && isGuard) {
          const ticketTitle = String(fbRow.observation || fbRow.suggestedBug?.title || "").trim()
          if (!ticketTitle) return json({ error: "Ticket has no title to guard." }, 422)
          if (fbRow.status !== "done" && fbRow.status !== "dismissed") {
            return json({ error: "Only resolved (done) tickets can be guarded." }, 409)
          }
          const exp = await upsertExpectationFromTicket(db!, {
            projectId: fbRow.projectId,
            feedbackId: fid,
            title: ticketTitle,
            urlPath: fbRow.urlPath ?? null,
          })
          return json({ ok: true, expectationId: exp.id, status: exp.status })
        }

        // POST /api/feedback/:id/merge — A.10 human dedup override. Merge ANOTHER ticket (body.mergeId)
        // INTO this one (the surviving cluster). Sums recurrence counts + dates, carries every reporter
        // email and occurrence receipt across, keeps this row's issue_key (so future intake dedup and
        // the expectation link both land on it). Any project member may correct the matcher.
        if (req.method === "POST" && isMerge) {
          if (!db) return json({ error: "Database unavailable." }, 503)
          const body = await req.json().catch(() => ({}))
          const mergeId = String(body.mergeId ?? body.merge_id ?? "").trim()
          if (!mergeId) return json({ error: "mergeId is required." }, 400)
          if (mergeId === fid) return json({ error: "Cannot merge a ticket into itself." }, 400)
          // The ticket being merged in must belong to the SAME project (no cross-tenant merge).
          const other = await feedbackById(fbRow.projectId, mergeId)
          if (!other) return json({ error: "Ticket to merge not found in this project." }, 404)
          const result = await mergeFeedbackClusters(fbRow.projectId, fid, mergeId, me)
          if (!result) return json({ error: "Merge failed." }, 500)
          await insertActivity({
            projectId: fbRow.projectId, type: "ticket_merged", actorEmail: me, feedbackId: fid,
            meta: { mergedFrom: mergeId, recurrenceCount: result.recurrenceCount },
          }).catch((e: any) => console.warn("ticket merge activity skipped:", e?.message || e))
          return json({ ok: true, survivorId: result.survivorId, recurrenceCount: result.recurrenceCount, contactEmails: result.contactEmails })
        }

        // POST /api/feedback/:id/split — A.10 human dedup override. Split one wrongly-collapsed
        // occurrence (body.occurrenceId) out of THIS cluster into its own standalone ticket carrying
        // that occurrence's date/evidence/reporter email. Decrements this cluster's count/dates and
        // records a "distinct issues" decision so the next intake pass never re-merges the pair.
        if (req.method === "POST" && isSplit) {
          if (!db) return json({ error: "Database unavailable." }, 503)
          const body = await req.json().catch(() => ({}))
          const occurrenceId = String(body.occurrenceId ?? body.occurrence_id ?? "").trim()
          if (!occurrenceId) return json({ error: "occurrenceId is required." }, 400)
          // Compute the split-out occurrence's CONTENT issue_key so a future re-report of that content
          // routes to the new standalone ticket (honouring the split) rather than back into the head.
          const occs = await listFeedbackOccurrences(fid)
          const occ = occs.find((o) => o.id === occurrenceId)
          if (!occ) return json({ error: "Occurrence not found on this ticket." }, 404)
          const contentKey = humanReportIssueKeyFor({
            projectId: fbRow.projectId, urlPath: fbRow.urlPath ?? "/",
            text: occ.observation ?? fbRow.observation ?? "",
          })
          const result = await splitOccurrenceToNewTicket(fbRow.projectId, fid, occurrenceId, { actor: me, issueKey: contentKey })
          if (!result) return json({ error: "Split failed." }, 500)
          await insertActivity({
            projectId: fbRow.projectId, type: "ticket_split", actorEmail: me, feedbackId: fid,
            meta: { newTicketId: result.newFeedbackId, occurrenceId, recurrenceCount: result.sourceRecurrenceCount },
          }).catch((e: any) => console.warn("ticket split activity skipped:", e?.message || e))
          return json({ ok: true, newFeedbackId: result.newFeedbackId, sourceRecurrenceCount: result.sourceRecurrenceCount })
        }

        // POST /api/feedback/:id/export — admin only
        if (req.method === "POST" && isExport) {
          if (fbAccess !== "admin") return json({ error: "Only project admins can export tickets." }, 403)
          const body = await req.json().catch(() => ({}))
          const connectorId = String(body.connectorId || "")
          if (!connectorId) return json({ error: "connectorId is required." }, 400)
          const connector = await getConnectorById(fbRow.projectId, connectorId)
          if (!connector) return json({ error: "Connector not found." }, 404)
          const adapter = getConnector(connector.type)
          if (!adapter) return json({ error: "Unknown connector type." }, 400)

          // KLA-283 (JTBD 5.4): already-exported guard — SERVER-enforced so the UI can't silently
          // bypass it. If this ticket already has a successful export to this connector, refuse with
          // 409 + the prior export's key/url so the client can offer "open it / export anyway".
          // The caller re-sends { force: true } to proceed (which still records a new export row, so
          // timeline history keeps every attempt). First-time exports are untouched.
          const force = body.force === true
          if (!force) {
            const prior = await findPriorSuccessfulExport(fid, connectorId)
            if (prior) {
              return json({
                error: `Already exported to ${connector.name}${prior.externalKey ? ` as ${prior.externalKey}` : ""}.`,
                alreadyExported: {
                  type: prior.type, externalKey: prior.externalKey,
                  externalUrl: prior.externalUrl, createdAt: prior.createdAt,
                  connectorName: connector.name,
                },
              }, 409)
            }
          }

          // Decrypt secret fields before calling createIssue
          const decryptedConfig: Record<string, string> = { ...connector.config }
          for (const f of adapter.fields) {
            if (f.secret && connector.config[f.key]) {
              try { decryptedConfig[f.key] = await decryptSecret(connector.config[f.key]) }
              catch { decryptedConfig[f.key] = "" }
            }
          }

          const exportSimName = await resolveSimName(fbRow.projectId, fbRow.simId)
          const payload = await feedbackToTicketPayload(fbRow, { id: fbRow.projectId }, exportSimName)
          let exportResult: { type: string; externalKey: string | null; externalUrl: string | null; status: "ok" | "failed"; error: string | null }

          try {
            const result = await adapter.createIssue(payload, decryptedConfig)
            await addTicketExport({
              feedbackId: fid, projectId: fbRow.projectId, connectorId,
              type: connector.type, externalKey: result.externalKey, externalUrl: result.externalUrl,
              // KLA-285: see auto-copy hook — "ok" export, but a degraded screenshot attach is
              // recorded rather than swallowed.
              status: "ok", error: result.attachmentWarning ?? null, createdBy: me,
            })
            // Record successful outbound heartbeat (fire-and-forget, non-fatal).
            touchConnectorHeartbeat(connectorId, { kind: "outbound", success: true })
              .catch((e: any) => console.warn("heartbeat record failed (non-fatal):", e?.message || e))
            exportResult = { type: connector.type, externalKey: result.externalKey, externalUrl: result.externalUrl, status: "ok", error: result.attachmentWarning ?? null }
          } catch (e: any) {
            // A10: log the raw error server-side (with a correlation id) and store it on the export row,
            // but return ONLY a generic message + id to the client so guard/internal text can't leak.
            const o = oops(e, "export")
            await addTicketExport({
              feedbackId: fid, projectId: fbRow.projectId, connectorId,
              type: connector.type, externalKey: null, externalUrl: null,
              status: "failed", error: (e as any)?.message || "Export failed", createdBy: me,
            })
            // Record failed outbound heartbeat (fire-and-forget, non-fatal).
            touchConnectorHeartbeat(connectorId, { kind: "outbound", success: false, error: (e as any)?.message || "Export failed" })
              .catch((err: any) => console.warn("heartbeat record failed (non-fatal):", err?.message || err))
            exportResult = { type: connector.type, externalKey: null, externalUrl: null, status: "failed", error: `${o.error} (ref ${o.id})` }
          }
          return json({ ok: true, export: exportResult })
        }

        // GET /api/feedback/:id/labels — list labels on this ticket
        if (req.method === "GET" && isLabels && !labelIdParam) {
          return json({ labels: await labelsForFeedback(fid) })
        }

        // POST /api/feedback/:id/labels — attach label to ticket { labelId }
        if (req.method === "POST" && isLabels && !labelIdParam) {
          const body = await req.json().catch(() => ({}))
          const labelId = String(body.labelId || "").trim()
          if (!labelId) return json({ error: "labelId is required." }, 400)
          // Verify label belongs to this project
          const projectLabels = await listLabels(fbRow.projectId)
          if (!projectLabels.find(l => l.id === labelId)) return json({ error: "Label not found in this project." }, 404)
          await attachLabel(labelId, fid)
          // KLAVITYKLA-286 (JTBD 5.7): mirror the ticket's now-current label set to linked external
          // issues. Fire-and-forget; syncTicketFields re-reads the full label set after the attach.
          syncTicketFields(fid, fbRow.projectId, me)
          return json({ ok: true })
        }

        // DELETE /api/feedback/:id/labels/:labelId — detach label from ticket
        if (req.method === "DELETE" && isLabels && labelIdParam) {
          await detachLabel(labelIdParam, fid)
          // KLAVITYKLA-286 (JTBD 5.7): mirror the ticket's now-current label set to linked external
          // issues after removal. Fire-and-forget.
          syncTicketFields(fid, fbRow.projectId, me)
          return json({ ok: true })
        }

        // GET /api/feedback/:id/suggest-labels — KLA-175: return AI-suggested labels (ghost chips).
        // Returns cached suggestions; if none exist yet, triggers generation synchronously.
        if (req.method === "GET" && isSuggestLabels) {
          let suggestions = await getSuggestedLabels(fid, fbRow.projectId)
          if (!suggestions.length) {
            const text = (fbRow.suggestedBug?.title
              ? `${fbRow.suggestedBug.title}\n${fbRow.observation || ""}`
              : fbRow.observation || ""
            ).slice(0, 2000)
            await suggestLabelsForFeedback({ feedbackId: fid, projectId: fbRow.projectId, text })
              .catch((e: any) => console.warn("[suggest-labels] on-demand (non-fatal):", e?.message || e))
            suggestions = await getSuggestedLabels(fid, fbRow.projectId)
          }
          // Filter out already-attached labels so ghost chips never duplicate real chips
          const attached = new Set((await labelsForFeedback(fid)).map(l => l.id))
          return json({ suggestions: suggestions.filter(l => !attached.has(l.id)) })
        }

        return json({ error: "Not found" }, 404)
      }

      // ── KLAVITYKLA-201: cross-project inbox ──
      // GET /api/inbox — aggregated new-report + regression counts across ALL projects the
      // authed user can access, grouped by project.  No path params; auth via session cookie.
      // Optional ?window=<hours> (default 48).
      if (req.method === "GET" && path === "/api/inbox") {
        const windowHours = Math.min(168, Math.max(1, Number(url.searchParams.get("window") || "48")))
        const windowMs = windowHours * 3600 * 1000
        const projects = await listProjects(me)
        const projectIds = projects.map((p) => p.id)
        const rows = await listInboxForProjects(projectIds, { windowMs })
        // Annotate each row with the project name and role for the UI
        const projectMeta: Record<string, { name: string; role: string | null }> = {}
        for (const p of projects) {
          const role = await projectAccess(me, p.id)
          projectMeta[p.id] = { name: p.name, role }
        }
        const out = rows.map((r) => ({
          projectId: r.projectId,
          projectName: projectMeta[r.projectId]?.name ?? r.projectId,
          role: projectMeta[r.projectId]?.role ?? null,
          newReportCount: r.newReportCount,
          regressionCount: r.regressionCount,
          topReports: r.topReports,
        }))
        const totalNew = out.reduce((s, r) => s + r.newReportCount, 0)
        const totalReg = out.reduce((s, r) => s + r.regressionCount, 0)
        return json({ projects: out, totalNew, totalReg, windowHours })
      }

      // ── projects (P2) ──
      // List the caller's projects.
      if (req.method === "GET" && path === "/api/projects") {
        const projects = await listProjects(me)
        const out = []
        for (const p of projects) {
          const access = await projectAccess(me, p.id)
          out.push({ id: p.id, name: p.name, accountId: p.accountId, status: p.status, role: access })
        }
        return json({ projects: out })
      }
      // Create a project (account owner/admin only).
      if (req.method === "POST" && path === "/api/projects") {
        const ms = await membershipsFor(me)
        const active = ms[0]
        if (!active) return json({ error: "No account." }, 400)
        if ((await roleIn(active.workspaceId, me)) !== "admin") return json({ error: "Only owners/admins can create projects." }, 403)
        // KLA-306: flag-gated project quota (no-op unless KLAV_BILLING_ENFORCEMENT=1).
        const projQuota = await quotaExceeded(active.workspaceId, "projects", async () =>
          (await listProjects(me)).filter((p) => p.accountId === active.workspaceId).length)
        if (projQuota) return json(projQuota, 402)
        const body = await req.json().catch(() => ({}))
        const name = String(body.name || "").trim()
        if (!name) return json({ error: "Project name is required." }, 400)
        let siteUrl: string | null = null
        if (body.siteUrl) {
          const raw = String(body.siteUrl).trim()
          if (raw) {
            const normalised = /^https?:\/\//i.test(raw) ? raw : "https://" + raw
            try { new URL(normalised) } catch { return json({ error: "Client site URL is not a valid URL." }, 400) }
            siteUrl = normalised
          }
        }
        const created = await createProject(active.workspaceId, name, siteUrl)
        // The creator is an account admin → implicit project-admin via projectAccess; no extra row needed.
        void trackFunnel(db!, { event: "app_connected", email: me, accountId: active.workspaceId, url: siteUrl ?? undefined })
        // PostHog activation: project_created.
        void capturePosthog(me, "project_created", { project_id: created.id, account_id: created.accountId })
        return json({ project: { id: created.id, name: created.name, accountId: created.accountId, status: created.status, siteUrl: created.siteUrl, role: "admin" } }, 201)
      }
      // Project detail + members (projectAccess-gated) and project-scoped invite (R4) + monitored-urls (P3b) + connectors.
      const projMatch = path.match(/^\/api\/projects\/([^/]+?)(\/members|\/invite|\/activity|\/rename|\/config|\/branding|\/triage|\/tickets(?:\/bulk)?|\/recurring|\/replays|\/widget-status|\/heartbeat-diagnosis(?:\/email)?|\/share-token|\/labels(?:\/[^/]+)?|\/monitored-urls(?:\/[^/]+)?|\/connectors(?:\/[^/]+)?(?:\/test)?|\/test-accounts(?:\/[^/]+)?|\/sim-matches(?:\/[^/]+(?:\/(?:confirm|reject))?)?|\/autosim-auth(?:\/setup-token)?|\/trust-report\/send|\/sims-digest\/send|\/trails-autofile|\/regression-events(?:\/[^/]+\/ack)?)?$/)
      if (projMatch) {
        const pid = projMatch[1]
        const sub = projMatch[2] || ""
        const access = await projectAccess(me, pid)
        if (!access) return json({ error: "No access to this project." }, 403)
        const proj = await projectById(pid)
        if (!proj) return json({ error: "Not found." }, 404)

        // DELETE /api/projects/:id/replays — prune old session-replay recordings (admin-only, privacy).
        // Accepts optional ?before=<epoch-ms> to prune before a specific timestamp; defaults to 90 days.
        // Sensitive DOM recordings should not accumulate indefinitely — this gives admins control.
        if (req.method === "DELETE" && sub === "/replays") {
          if (access !== "admin") return json({ error: "Only project admins can prune replays." }, 403)
          const beforeParam = url.searchParams.get("before")
          const beforeMs = beforeParam ? Number(beforeParam) : null
          if (beforeMs !== null && (!Number.isFinite(beforeMs) || beforeMs <= 0)) {
            return json({ error: "before must be a positive epoch-ms timestamp." }, 400)
          }
          const maxAgeMs = beforeMs ? Date.now() - beforeMs : undefined
          const deleted = await pruneOldFeedbackReplays(pid, maxAgeMs)
          return json({ ok: true, deleted })
        }

        // ── Client Status Portal share-token management (KLAVITYKLA-205) ──────────────────────────
        // GET    /api/projects/:pid/share-token — returns { hasToken, shareUrl } (admin only)
        // POST   /api/projects/:pid/share-token — generate (or regenerate) the token; returns { shareUrl, token }
        // DELETE /api/projects/:pid/share-token — revoke the token
        if (sub === "/share-token") {
          if (access !== "admin") return json({ error: "Only project admins can manage the client status portal link." }, 403)
          if (req.method === "GET") {
            const { hasProjectShareToken: hasTok } = await import("./lib/project-status-portal")
            const has = await hasTok(pid)
            return json({ hasToken: has, shareUrl: null })
          }
          if (req.method === "POST") {
            const rawToken = await mintProjectShareToken(pid)
            const shareUrl = `${BASE}/shared/project/${rawToken}`
            return json({ ok: true, shareUrl, token: rawToken }, 201)
          }
          if (req.method === "DELETE") {
            const wasRevoked = await revokeProjectShareToken(pid)
            return json({ ok: true, revoked: wasRevoked })
          }
          return json({ error: "Method not allowed" }, 405)
        }
        // ── End share-token management ────────────────────────────────────────────────────────────

        // Monitored URLs (R5 allowlist) — admin-only manage; project-scoped via projectAccess.
        if (sub.startsWith("/monitored-urls")) {
          if (access !== "admin") return json({ error: "Only project admins can manage monitored URLs." }, 403)
          const midMatch = sub.match(/^\/monitored-urls\/([^/]+)$/)
          if (req.method === "GET" && !midMatch) {
            return json({ monitoredUrls: await listMonitoredUrls(pid) })
          }
          if (req.method === "POST" && !midMatch) {
            const body = await req.json().catch(() => ({}))
            const pattern = String(body.urlPattern || body.url_pattern || "").trim()
            if (!pattern) return json({ error: "urlPattern is required." }, 400)
            if (/[?#]/.test(pattern)) return json({ error: "Patterns are path-only (no query/fragment)." }, 400)
            const enabled = body.enabled === undefined ? true : !!body.enabled
            await addMonitoredUrl(pid, pattern, enabled)
            return json({ ok: true, monitoredUrls: await listMonitoredUrls(pid) }, 201)
          }
          if (req.method === "DELETE" && midMatch) {
            await removeMonitoredUrl(pid, midMatch[1])
            return json({ ok: true, monitoredUrls: await listMonitoredUrls(pid) })
          }
          if (req.method === "POST" && midMatch) {
            const body = await req.json().catch(() => ({}))
            // urlPattern present → rename the pattern in place; else toggle enabled.
            if (body.urlPattern !== undefined || body.url_pattern !== undefined) {
              const pattern = String(body.urlPattern || body.url_pattern || "").trim()
              if (!pattern) return json({ error: "urlPattern is required." }, 400)
              if (/[?#]/.test(pattern)) return json({ error: "Patterns are path-only (no query/fragment)." }, 400)
              try {
                await setMonitoredUrlPattern(pid, midMatch[1], pattern)
              } catch (e: any) {
                return json({ error: /UNIQUE|constraint/i.test(String(e?.message)) ? "That pattern already exists for this project." : "Couldn't update the pattern." }, 400)
              }
            } else {
              await setMonitoredUrlEnabled(pid, midMatch[1], !!body.enabled)
            }
            return json({ ok: true, monitoredUrls: await listMonitoredUrls(pid) })
          }
          return json({ error: "Not found" }, 404)
        }

        // ── Connector CRUD (admin-only write; member-readable) ──
        if (sub.startsWith("/connectors")) {
          // Test-connection routes must be matched BEFORE the generic /connectors/:cid handling,
          // because `^\/connectors\/([^/]+)$` would otherwise capture cid="test".
          const testNoCid = sub === "/connectors/test"
          const cidTestMatch = sub.match(/^\/connectors\/([^/]+)\/test$/)
          // JTBD 5.10 (KLA-289): import external-first issues from a saved connector. Matched before
          // the generic /connectors/:cid handler for the same reason as the test routes.
          const cidImportMatch = sub.match(/^\/connectors\/([^/]+)\/import$/)

          // A clearly-labelled test ticket used by both test endpoints to genuinely verify connectivity.
          const TEST_PAYLOAD: TicketPayload = {
            title: "✅ Klavity connection test",
            body: "This is a test ticket created by Klavity to verify this connector is configured correctly. It's safe to close or delete.",
            priority: null,
            url: null,
            simName: "Klavity",
            createdAt: Date.now(),
            klavityUrl: `${BASE}/dashboard`,
          }

          // POST /api/projects/:pid/connectors/test — test an UNSAVED config from the add-destination form (admin only)
          if (req.method === "POST" && testNoCid) {
            if (access !== "admin") return json({ error: "Only project admins can manage connectors." }, 403)
            const body = await req.json().catch(() => ({}))
            const type = String(body.type || "")
            const config: Record<string, string> = (body.config && typeof body.config === "object") ? body.config : {}
            const adapter = getConnector(type)
            if (!adapter) return json({ error: `Unknown connector type: ${type}` }, 400)
            const validation = adapter.validate(config)
            if (!validation.ok) return json({ error: validation.error || "Invalid connector config." }, 400)
            try {
              const result = await adapter.createIssue(TEST_PAYLOAD, config)
              return json({ ok: true, externalKey: result.externalKey, externalUrl: result.externalUrl })
            } catch (e: any) {
              // A10: never echo guard/upstream/internal text — generic message + logged correlation id.
              const o = oops(e, "connector-test")
              return json({ ok: false, error: o.error, id: o.id })
            }
          }

          // POST /api/projects/:pid/connectors/:cid/test — test an ALREADY-SAVED connector (admin only)
          if (req.method === "POST" && cidTestMatch) {
            if (access !== "admin") return json({ error: "Only project admins can manage connectors." }, 403)
            const connector = await getConnectorById(pid, cidTestMatch[1])
            if (!connector) return json({ error: "Connector not found." }, 404)
            const adapter = getConnector(connector.type)
            if (!adapter) return json({ error: "Unknown connector type." }, 400)

            // Decrypt secret fields before calling createIssue
            const decryptedConfig: Record<string, string> = { ...connector.config }
            for (const f of adapter.fields) {
              if (f.secret && connector.config[f.key]) {
                try { decryptedConfig[f.key] = await decryptSecret(connector.config[f.key]) }
                catch { decryptedConfig[f.key] = "" }
              }
            }

            try {
              const result = await adapter.createIssue(TEST_PAYLOAD, decryptedConfig)
              return json({ ok: true, externalKey: result.externalKey, externalUrl: result.externalUrl })
            } catch (e: any) {
              // A10: generic message + logged correlation id (no guard/upstream leak).
              const o = oops(e, "connector-test")
              return json({ ok: false, error: o.error, id: o.id })
            }
          }

          // POST /api/projects/:pid/connectors/:cid/import — JTBD 5.10: pull recent external-first
          // issues from this connector's tracker and upsert them as Klavity tickets, deduping on
          // (type, externalKey) so re-import never creates duplicates (admin only).
          if (req.method === "POST" && cidImportMatch) {
            if (access !== "admin") return json({ error: "Only project admins can import tickets." }, 403)
            const connector = await getConnectorById(pid, cidImportMatch[1])
            if (!connector) return json({ error: "Connector not found." }, 404)
            const adapter = getConnector(connector.type)
            if (!adapter) return json({ error: "Unknown connector type." }, 400)
            if (typeof adapter.listIssues !== "function") {
              return json({ error: `Importing is not supported for ${connector.type} connectors yet.` }, 400)
            }
            const body = await req.json().catch(() => ({}))
            // Optional caller cap; clamp defensively (adapters also clamp).
            let limit: number | undefined
            const rawLimit = Number(body?.limit)
            if (Number.isFinite(rawLimit) && rawLimit > 0) limit = Math.min(100, Math.floor(rawLimit))
            try {
              const summary = await importExternalIssues(pid, connector.id, { actorEmail: me, limit })
              // Successful import counts as an inbound heartbeat (fire-and-forget, non-fatal).
              touchConnectorHeartbeat(connector.id, { kind: "inbound", success: true })
                .catch((e: any) => console.warn("heartbeat record failed (non-fatal):", e?.message || e))
              return json({ ok: true, import: summary })
            } catch (e: any) {
              // A10: log raw error with a correlation id; return only a generic message + id.
              const o = oops(e, "connector-import")
              touchConnectorHeartbeat(connector.id, { kind: "inbound", success: false, error: (e as any)?.message || "Import failed" })
                .catch((err: any) => console.warn("heartbeat record failed (non-fatal):", err?.message || err))
              return json({ ok: false, error: o.error, id: o.id }, 502)
            }
          }

          const cidMatch = sub.match(/^\/connectors\/([^/]+)$/)
          const cid = cidMatch ? cidMatch[1] : null

          // GET /api/projects/:id/connectors — list (redacted) + type catalog
          if (req.method === "GET" && !cid) {
            const rows = await listConnectors(pid)
            return json({ connectors: rows.map(connectorToClient), types: listConnectorTypes() })
          }

          // POST /api/projects/:id/connectors — create (admin only)
          if (req.method === "POST" && !cid) {
            if (access !== "admin") return json({ error: "Only project admins can manage connectors." }, 403)
            const body = await req.json().catch(() => ({}))
            const type = String(body.type || "")
            const name = String(body.name || "").trim()
            const rawConfig: Record<string, string> = (body.config && typeof body.config === "object") ? body.config : {}
            const autoCopy = !!body.autoCopy

            const adapter = getConnector(type)
            if (!adapter) return json({ error: `Unknown connector type: ${type}` }, 400)
            if (!name) return json({ error: "name is required." }, 400)

            // Validate config using raw secrets before encrypting
            const validation = adapter.validate(rawConfig)
            if (!validation.ok) return json({ error: validation.error || "Invalid connector config." }, 400)

            // Encrypt all secret fields
            const encConfig: Record<string, string> = { ...rawConfig }
            for (const f of adapter.fields) {
              if (f.secret && rawConfig[f.key]) {
                encConfig[f.key] = await encryptSecret(rawConfig[f.key])
              }
            }

            const id = await createConnector(pid, { type: type as any, name, config: encConfig, autoCopy, createdBy: me })
            const created = await getConnectorById(pid, id)
            return json({ ok: true, connector: connectorToClient(created!) }, 201)
          }

          // PATCH /api/projects/:id/connectors/:cid — update (admin only)
          if (req.method === "PATCH" && cid) {
            if (access !== "admin") return json({ error: "Only project admins can manage connectors." }, 403)
            const existing = await getConnectorById(pid, cid)
            if (!existing) return json({ error: "Connector not found." }, 404)
            const body = await req.json().catch(() => ({}))

            const patch: Partial<{ name: string; config: Record<string, string>; autoCopy: boolean; enabled: boolean }> = {}
            if (body.name !== undefined) patch.name = String(body.name)
            if (body.autoCopy !== undefined) patch.autoCopy = !!body.autoCopy
            if (body.enabled !== undefined) patch.enabled = !!body.enabled

            if (body.config !== undefined && typeof body.config === "object") {
              const adapter = getConnector(existing.type)
              const newRaw: Record<string, string> = body.config
              const encConfig: Record<string, string> = { ...existing.config }
              // Merge non-secret fields directly; for secret fields: blank = keep existing, non-blank = re-encrypt
              for (const [k, v] of Object.entries(newRaw)) {
                const field = adapter?.fields.find(f => f.key === k)
                if (field?.secret) {
                  if (v) encConfig[k] = await encryptSecret(v)
                  // else keep existing (blank = "keep")
                } else {
                  encConfig[k] = v
                }
              }
              patch.config = encConfig
            }

            await updateConnector(pid, cid, patch)
            return json({ ok: true })
          }

          // DELETE /api/projects/:id/connectors/:cid — remove (admin only)
          if (req.method === "DELETE" && cid) {
            if (access !== "admin") return json({ error: "Only project admins can manage connectors." }, 403)
            const existing = await getConnectorById(pid, cid)
            if (!existing) return json({ error: "Connector not found." }, 404)
            await removeConnector(pid, cid)
            return json({ ok: true })
          }

          return json({ error: "Not found" }, 404)
        }

        // Report widget appearance config — admin-only write; also carries widget mode/cta/notify.
        if (sub === "/config") {
          if (req.method === "POST") {
            if (access !== "admin") return json({ error: "Only project admins can change widget appearance." }, 403)
            const body = await req.json().catch(() => ({}))
            const pro = await isAccountPro(proj.accountId)
            const v = validateModalConfigInput(body, { isPro: pro })
            if (!v.ok) return json({ error: (v as { ok: false; error: string }).error }, 400)
            // SERVER-OWNED config keys ride alongside the validated appearance config inside
            // modal_config_json and must survive appearance saves (the validator strips unknown keys):
            //   - screenshots      (per-project screenshot storage config, lib/screenshot-config.ts)
            //   - slack_webhook_url (per-project report-alert Slack webhook, lib/report-alert.ts)
            // slack_webhook_url is settable here (admin-only, API-only — no dashboard UI yet):
            // pass a https://hooks.slack.com/... URL to set, "" to clear, omit to keep as-is.
            const prevCfg = await getProjectModalConfig(pid)
            const nextCfg: Record<string, unknown> = { ...(v.config as any) }
            if (prevCfg.screenshots !== undefined) nextCfg.screenshots = prevCfg.screenshots
            if (typeof body.slack_webhook_url === "string") {
              const swu = String(body.slack_webhook_url).trim()
              if (swu !== "") {
                if (!/^https:\/\/hooks\.slack\.com\//.test(swu) || swu.length > 500) {
                  return json({ error: "slack_webhook_url must be an https://hooks.slack.com/... URL." }, 400)
                }
                nextCfg.slack_webhook_url = swu
              } // "" → clear (key simply not carried forward)
            } else if (prevCfg.slack_webhook_url !== undefined) {
              nextCfg.slack_webhook_url = prevCfg.slack_webhook_url
            }
            await setProjectModalConfig(pid, nextCfg)
            // Persist widget mode/cta/notify if any were provided (partial update).
            const hasWidget = body.mode !== undefined || body.cta_url !== undefined || body.notify_email !== undefined || body.report_gate !== undefined
            if (hasWidget) {
              const wCfg: { mode?: string; ctaUrl?: string | null; notifyEmail?: string | null; reportGate?: string } = {}
              if (body.mode !== undefined) wCfg.mode = body.mode
              if (body.cta_url !== undefined) wCfg.ctaUrl = body.cta_url
              if (body.notify_email !== undefined) wCfg.notifyEmail = body.notify_email
              if (body.report_gate !== undefined) wCfg.reportGate = body.report_gate
              await setWidgetConfig(pid, wCfg)
            }
            return json({ ok: true, modalConfig: v.config, pro })
          }
          // GET here (session-authed) returns current + pro flag + widget config for the admin UI.
          // widgetStatus = the heartbeat: when /widget.js last loaded and on which host (null = never seen).
          const ping = await latestWidgetPing(pid)
          const curCfg = await getProjectModalConfig(pid)
          return json({
            modalConfig: resolveModalConfig(curCfg),
            pro: await isAccountPro(proj.accountId),
            widget: await getWidgetConfig(pid),
            widgetStatus: ping ? { host: ping.host, lastSeen: ping.lastSeen, firstSeen: ping.firstSeen, hits: ping.hits } : null,
            // Report-alert Slack webhook — admin-eyes only (it is a capability URL). The public
            // (CORS-open) config GET earlier in this file never returns it: resolveModalConfig strips it.
            ...(access === "admin" ? { slackWebhookUrl: typeof curCfg.slack_webhook_url === "string" ? curCfg.slack_webhook_url : null } : {}),
          })
        }

        // ── Agency branding / white-label (KLAVITYKLA-223, JTBD 7.10) ─────────────────────────────
        // GET  /api/projects/:id/branding — current branding + pro flag (admin-only; renders on public pages)
        // POST /api/projects/:id/branding — set { name?, accent?, logoDataUrl?, whiteLabel? }; validated + Pro-gated
        // Branding lives inside modal_config_json under `agency_branding` (no migration). White-label is
        // Pro-gated exactly like widget custom-colors. All inputs are untrusted (public-page render).
        if (sub === "/branding") {
          if (access !== "admin") return json({ error: "Only project admins can change branding." }, 403)
          const { sanitizeBrandingInput, setProjectBranding, getProjectBranding } = await import("./lib/trails-branding")
          if (req.method === "POST") {
            const body = await req.json().catch(() => ({}))
            const pro = await isAccountPro(proj.accountId)
            const v = sanitizeBrandingInput(body, { isPro: pro })
            if (!v.ok) return json({ error: (v as { ok: false; error: string }).error }, 400)
            await setProjectBranding(pid, v.branding)
            return json({ ok: true, branding: await getProjectBranding(pid), pro })
          }
          // GET
          return json({ branding: await getProjectBranding(pid), pro: await isAccountPro(proj.accountId) })
        }

        // ── Trust Report digest (KLAVITYKLA-203): POST /api/projects/:id/trust-report/send ──
        // Generates and emails the branded weekly Trust Report to the project owner + admins.
        // Admin-only. Optional body: { window_start?: number, window_end?: number } — if omitted,
        // defaults to the past 7 days (epoch ms). Safe for ad-hoc "send now" + cron use.
        // Schedule note: call this from a weekly cron / setInterval targeting each active project.
        if (req.method === "POST" && sub === "/trust-report/send") {
          if (access !== "admin") return json({ error: "Only project admins can send Trust Reports." }, 403)
          if (!process.env.SENDGRID_API_KEY) return json({ error: "Email delivery not configured (SENDGRID_API_KEY missing)." }, 503)
          const body = await req.json().catch(() => ({}))
          const nowMs = Date.now()
          const windowEnd = typeof body.window_end === "number" && body.window_end > 0 ? body.window_end : nowMs
          const windowStart = typeof body.window_start === "number" && body.window_start > 0 ? body.window_start : windowEnd - TRUST_REPORT_WEEK_MS
          if (windowStart >= windowEnd) return json({ error: "window_start must be before window_end." }, 400)
          const trustDeps: TrustReportDeps = {
            db: db!,
            sendEmail: sendReportAlertEmail,
          }
          try {
            const result = await sendTrustReport(trustDeps, pid, proj.accountId, windowStart, windowEnd)
            return json({
              ok: true,
              sent: result.sent,
              to: result.to,
              isQuietWeek: result.data.isQuietWeek,
              counts: {
                snapReports: result.data.snapReportsTotal,
                regressions: result.data.regressionsTotal,
                simFindings: result.data.simFindingsTotal,
                recurringIssues: result.data.recurringIssuesTotal,
              },
            })
          } catch (err: any) {
            console.error("trust-report send error:", err)
            return json({ error: "Failed to send Trust Report: " + String(err?.message || err) }, 500)
          }
        }

        // ── Daily Sims digest (KLAVITYKLA-261): POST /api/projects/:id/sims-digest/send ──
        // Generates and emails/Slacks the daily Sims digest to the project owner + admins.
        // Admin-only. Optional body: { window_start?: number, window_end?: number } — if omitted,
        // defaults to the past 24 h. force_quiet: true sends even on a quiet day (for testing).
        if (req.method === "POST" && sub === "/sims-digest/send") {
          if (access !== "admin") return json({ error: "Only project admins can send the Sims digest." }, 403)
          if (!process.env.SENDGRID_API_KEY) return json({ error: "Email delivery not configured (SENDGRID_API_KEY missing)." }, 503)
          const body = await req.json().catch(() => ({}))
          const nowMs = Date.now()
          const windowEnd = typeof body.window_end === "number" && body.window_end > 0 ? body.window_end : nowMs
          const windowStart = typeof body.window_start === "number" && body.window_start > 0 ? body.window_start : windowEnd - SIMS_DIGEST_DAY_MS
          if (windowStart >= windowEnd) return json({ error: "window_start must be before window_end." }, 400)
          const digestDeps: SimsDigestDeps = { db: db!, sendEmail: sendReportAlertEmail }
          try {
            const result = await sendSimsDigest(
              digestDeps,
              pid,
              proj.accountId,
              windowStart,
              windowEnd,
              { skipIfQuiet: body.force_quiet !== true },
            )
            return json({
              ok: true,
              sent: result.sent,
              to: result.to,
              slackSent: result.slackSent,
              isQuietDay: result.data.isQuietDay,
              counts: {
                reviewSessions: result.data.reviewSessionsTotal,
                pagesReviewed: result.data.pagesReviewedTotal,
                issuesFound: result.data.issuesFoundTotal,
                recurringIssues: result.data.recurringIssuesTotal,
                regressionsReconfirmed: result.data.regressionsReconfirmedTotal,
              },
            })
          } catch (err: any) {
            console.error("sims-digest send error:", err)
            return json({ error: "Failed to send Sims digest: " + String(err?.message || err) }, 500)
          }
        }

        // ── AutoSims F1: named Test Accounts (ADR-0001). Secret write-only; never returned. ──
        if (sub === "/test-accounts" || sub.startsWith("/test-accounts/")) {
          if (req.method === "GET" && sub === "/test-accounts") {
            return json({ accounts: await listTestAccounts(pid) })
          }
          if (req.method === "POST" && sub === "/test-accounts") {
            if (access !== "admin") return json({ error: "Only project admins can manage test accounts." }, 403)
            const body = await req.json().catch(() => ({}))
            const name = String(body.name || "").trim()
            const loginEmail = String(body.login_email || "").trim()
            const password = body.password !== undefined ? String(body.password) : ""
            const authShape = String(body.auth_shape || "password")
            if (!/^[a-z0-9_-]{1,40}$/.test(name)) return json({ error: "name must be 1-40 chars: a-z 0-9 _ -" }, 400)
            if (!loginEmail || loginEmail.length > 200 || !loginEmail.includes("@")) return json({ error: "login_email required" }, 400)
            if (authShape !== "password" && authShape !== "otp" && authShape !== "token") return json({ error: "auth_shape must be 'password', 'otp', or 'token'" }, 400)
            if (authShape === "password" && (!password || password.length > 200)) return json({ error: "password required (max 200 chars)" }, 400)
            if (authShape === "token" && (!password || password.length > 2000)) return json({ error: "token required (max 2000 chars)" }, 400)
            if (await getTestAccountByName(pid, name)) return json({ error: `A test account named "${name}" already exists.` }, 409)
            const id = await createTestAccount(pid, { name, loginEmail, password: (authShape === "password" || authShape === "token") ? password : undefined, authShape: authShape as "password" | "otp" | "token", createdBy: me })
            const account = await getTestAccountById(pid, id)
            if (!account) return json({ error: "Internal error: account vanished after insert" }, 500)
            return json({ account }, 201)
          }
          if (req.method === "DELETE" && sub.startsWith("/test-accounts/")) {
            if (access !== "admin") return json({ error: "Only project admins can manage test accounts." }, 403)
            const accId = sub.slice("/test-accounts/".length)
            // Look up account first to get its name for the reference check.
            const acc = await getTestAccountById(pid, accId)
            if (!acc) return json({ error: "Not found" }, 404)
            // Block deletion when active Trails reference this account's credentials.
            const { trailNames } = await getTestAccountRefs(pid, acc.name)
            if (trailNames.length > 0) {
              const sample = trailNames.slice(0, 3).join(", ") + (trailNames.length > 3 ? "…" : "")
              return json({
                error: `Cannot delete: ${trailNames.length} trail${trailNames.length !== 1 ? "s" : ""} use {{cred:${acc.name}:…}} (${sample}). Remove the references first.`,
                refs: trailNames,
              }, 409)
            }
            const ok = await deleteTestAccount(pid, accId)
            return ok ? json({ ok: true }) : json({ error: "Not found" }, 404)
          }
          if (req.method === "PATCH" && sub.startsWith("/test-accounts/")) {
            if (access !== "admin") return json({ error: "Only project admins can manage test accounts." }, 403)
            const accId = sub.slice("/test-accounts/".length)
            const body = await req.json().catch(() => ({}))
            const newSecret = body.password !== undefined ? String(body.password) : ""
            if (!newSecret || newSecret.length > 2000) return json({ error: "password required (max 2000 chars)" }, 400)
            const acc = await getTestAccountById(pid, accId)
            if (!acc) return json({ error: "Not found" }, 404)
            if (acc.authShape === "otp") return json({ error: "OTP accounts have no stored secret to rotate." }, 400)
            const ok = await rotateTestAccountSecret(pid, accId, newSecret)
            return ok ? json({ ok: true }) : json({ error: "Not found" }, 404)
          }
          return json({ error: "Method not allowed" }, 405)
        }

        // ── AutoSim Auth AT2 router endpoints (KLAVITYKLA-267) ──────────────────────────
        // GET  /api/projects/:id/autosim-auth       → current auth status + paused session count
        // POST /api/projects/:id/autosim-auth/setup-token → issue a fresh aset_ token + agent prompt
        if (sub === "/autosim-auth" || sub === "/autosim-auth/setup-token") {
          // GET /api/projects/:id/autosim-auth — read-only status panel for the AT2 router screen.
          // Returns: authStatus (unregistered/registered/verified), method, email (masked), pausedCount,
          // latestProbe (id, status, error, finishedAt) so the UI knows whether probe passed/failed.
          if (req.method === "GET" && sub === "/autosim-auth") {
            try {
              const cfg = await getAutosimAuthConfigEncrypted(pid)
              const pausedSessions = await listNeedsAuthSessionsForAutoResume(pid, 20)
              const pausedCount = pausedSessions.length
              // Latest probe: look at the probe queue for the project (most recent).
              let latestProbe: { id: string; status: string; error: string | null; finishedAt: number | null } | null = null
              if (cfg) {
                // We don't store a "latest probe ID" on the project row, so find it from the db directly.
                const probeRows = await db!.execute({
                  sql: `SELECT id, status, error, finished_at FROM autosim_auth_probe_queue
                        WHERE project_id=? ORDER BY created_at DESC LIMIT 1`,
                  args: [pid],
                })
                if (probeRows.rows.length) {
                  const pr = probeRows.rows[0] as any
                  latestProbe = {
                    id: String(pr.id),
                    status: String(pr.status),
                    error: pr.error ? String(pr.error) : null,
                    finishedAt: pr.finished_at ? Number(pr.finished_at) : null,
                  }
                }
              }
              const maskedEmail = cfg ? cfg.email.replace(/^(.{1,3}).*@/, (_, p) => p + "***@") : null
              return json({
                authStatus: proj.autosimAuthStatus,
                method: cfg?.method ?? null,
                email: maskedEmail,
                pausedCount,
                pausedSessions: pausedSessions.slice(0, 5).map((s) => ({
                  id: s.id,
                  name: s.name,
                  baseUrl: s.baseUrl,
                  updatedAt: s.updatedAt,
                })),
                latestProbe,
              })
            } catch (e: any) {
              return json(oops(e, "autosim-auth-status"), 500)
            }
          }

          // POST /api/projects/:id/autosim-auth/setup-token (admin only)
          // Issues a fresh aset_ setup token (7-day TTL) for the AT2 router UI and returns
          // the ready-to-paste agent prompt for the chosen method. The dashboard calls this
          // when the user picks a method (fixed_otp or mint_link) in the router wizard.
          // Rate-limited: same bucket as the config-write endpoint.
          if (req.method === "POST" && sub === "/autosim-auth/setup-token") {
            if (access !== "admin") return json({ error: "Only project admins can configure AutoSim auth." }, 403)
            try {
              const body = await req.json().catch(() => ({}))
              const method = String(body.method || "")
              if (method !== "fixed_otp" && method !== "mint_link") {
                return json({ error: "method must be fixed_otp or mint_link" }, 400)
              }
              const ip = clientIp(req, server)
              if (!rlAllow(`autosim-setup-tok:ip:${ip}`, 20, 60 * 60 * 1000)) {
                return json({ error: "rate limited" }, 429, { "Retry-After": "3600" })
              }
              const issued = await createAutosimAuthSetupToken(pid, me)
              const testEmail = me // The Sim will log in using the founder's own test email.
              const prompt = generateAuthPrompt({
                method,
                testEmail,
                setupToken: issued.token,
                projectName: proj.name,
              })
              return json({
                ok: true,
                setupToken: issued.token,
                tokenId: issued.id,
                expiresAt: issued.expiresAt,
                prompt,
              }, 201)
            } catch (e: any) {
              return json(oops(e, "autosim-auth-setup-token"), 500)
            }
          }

          return json({ error: "Method not allowed" }, 405)
        }

        // Named observability (R6) — admin-only Activity view: WHO ran WHICH Sim on WHICH path, with the
        // private screenshot id (viewable via signed GET /api/screenshots/:id). Default focus = review_run
        // rows (live auto-comment runs) per the locked "named" decision; ?type=all widens to every event.
        // observability_mode='aggregate' (future sellability toggle) strips actor_email server-side.
        if (sub === "/activity") {
          if (req.method !== "GET") return json({ error: "Not found" }, 404)
          if (access !== "admin") return json({ error: "Only project admins can view observability." }, 403)
          const typeParam = (url.searchParams.get("type") || "review_run").trim()
          const types = typeParam === "all" ? undefined : [typeParam]
          const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50))
          const rows = await listActivity(pid, { types, limit })
          const personas = await listPersonas(pid)
          const pById = new Map(personas.map((p) => [p.id, p]))
          const named = proj.observabilityMode !== "aggregate" // founder default 'named'
          const events = rows.map((ev) => {
            const p = ev.simId ? pById.get(ev.simId) : null
            return {
              id: ev.id, type: ev.type,
              actorEmail: named ? ev.actorEmail : null, // (f) aggregate mode strips identity
              simId: ev.simId, simName: p?.name ?? null,
              urlPath: ev.urlPath, urlHost: ev.urlHost,
              screenshotId: ev.screenshotId, meta: ev.meta, createdAt: ev.createdAt,
            }
          })
          return json({ observabilityMode: proj.observabilityMode, named, events })
        }

        // GET /api/projects/:id/widget-status — lightweight authed heartbeat probe (any project member).
        // Polled (~3s) by onboarding step 2 and read by the dashboard first-run checklist to flip
        // "Waiting for your site…" → "Widget detected on <host>" the moment /widget.js phones home
        // via POST /api/widget/ping. Deliberately tiny (one indexed row read) so polling is cheap.
        if (req.method === "GET" && sub === "/widget-status") {
          const ping = await latestWidgetPing(pid)
          return json({ seen: !!ping, host: ping?.host ?? null, last_seen_at: ping?.lastSeen ?? null })
        }

        // ── Heartbeat diagnosis + "email my developer" (KLAVITYKLA-295, JTBD 6.5) ──────────────────
        // GET  /api/projects/:id/heartbeat-diagnosis        — diagnose WHY the widget went silent (any member)
        // POST /api/projects/:id/heartbeat-diagnosis/email  — email the diagnosis + fix steps to a developer
        // Both derive their signals the same way (latest ping + config + recent-report count) so the email
        // sends exactly what the UI showed. Pure mapping lives in lib/heartbeat-diagnosis.ts (unit-tested).
        if (sub === "/heartbeat-diagnosis" || sub === "/heartbeat-diagnosis/email") {
          const staleAfterMs = 24 * 60 * 60 * 1000
          const buildSignals = async (): Promise<HeartbeatSignals> => {
            const now = Date.now()
            const ping = await latestWidgetPing(pid)
            let recentReportCount = 0
            try { recentReportCount = await countRecentFeedback(pid, now - staleAfterMs) } catch { /* non-fatal */ }
            const cfg = await getWidgetConfig(pid)
            return {
              now,
              everSeen: !!ping,
              lastSeen: ping?.lastSeen ?? null,
              firstSeen: ping?.firstSeen ?? null,
              pingHost: ping?.host ?? null,
              expectedHost: proj.siteUrl ?? null,
              widgetMode: cfg?.mode ?? proj.widgetMode ?? "support",
              reportGate: cfg?.reportGate ?? proj.widgetReportGate ?? "anonymous",
              recentReportCount,
              staleAfterMs,
            }
          }

          if (req.method === "GET" && sub === "/heartbeat-diagnosis") {
            const diagnosis = diagnoseHeartbeat(await buildSignals())
            return json({ diagnosis })
          }

          if (req.method === "POST" && sub === "/heartbeat-diagnosis/email") {
            if (access !== "admin") return json({ error: "Only project admins can email a developer." }, 403)
            const body = await req.json().catch(() => ({}))
            const devEmail = String(body?.developer_email || "").trim()
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(devEmail) || devEmail.length > 200) {
              return json({ error: "A valid developer_email is required." }, 400)
            }
            const diagnosis = diagnoseHeartbeat(await buildSignals())
            const origin = process.env.KLAV_PUBLIC_ORIGIN || "https://klavity.in"
            const mail = renderDeveloperEmail({
              projectName: proj.name,
              diagnosis,
              dashboardUrl: `${origin}/app`,
              fromName: me,
            })
            if (!process.env.SENDGRID_API_KEY) {
              // No transport configured — return the composed diagnosis so the caller can copy/paste it,
              // and flag that nothing was actually sent (parity with other "email skipped" surfaces).
              return json({ ok: false, sent: false, reason: "email_not_configured", diagnosis, preview: mail })
            }
            try {
              await sendReportAlertEmail([devEmail], mail.subject, mail.html, mail.text)
            } catch (e: any) {
              console.warn("heartbeat email skipped (non-fatal):", e?.message || e)
              return json({ ok: false, sent: false, reason: "send_failed", diagnosis }, 502)
            }
            return json({ ok: true, sent: true, to: devEmail, diagnosis })
          }
        }

        // GET /api/projects/:id/triage — un-triaged feedback queue (any project member)
        if (req.method === "GET" && sub === "/triage") {
          const triage = await listTriageFeedback(proj.id)
          return json({ triage })
        }

        // ── KLA-255: needsConfirm / pending sim-match queue ───────────────────────────────────────
        // GET  /api/projects/:id/sim-matches          — list pending items (any project member)
        // POST /api/projects/:id/sim-matches/:mid/confirm — pick a candidate, trigger reconcile
        // POST /api/projects/:id/sim-matches/:mid/reject  — discard (any project member)

        if (sub === "/sim-matches" && req.method === "GET") {
          const matches = await listPendingSimMatches(proj.id, { status: "pending" })
          return json({ matches })
        }

        {
          const smConfirm = sub.match(/^\/sim-matches\/([^/]+)\/confirm$/)
          if (smConfirm && req.method === "POST") {
            const matchId = smConfirm[1]
            const body = await req.json().catch(() => ({}))
            const chosenSimId = String(body.simId ?? "").trim()
            if (!chosenSimId) return json({ error: "simId is required." }, 400)
            const matchRow = await getPendingSimMatch(proj.id, matchId)
            if (!matchRow) return json({ error: "Not found." }, 404)
            if (matchRow.status !== "pending") return json({ error: "Already resolved." }, 409)
            // Validate that chosenSimId is one of the candidates (not an arbitrary id injection).
            const validCandidateIds = new Set(matchRow.candidates.map((c) => c.simId))
            if (!validCandidateIds.has(chosenSimId)) return json({ error: "chosenSimId must be one of the listed candidates." }, 400)
            // Mark confirmed.
            const ok = await confirmPendingSimMatch(proj.id, matchId, chosenSimId, me)
            if (!ok) return json({ error: "Update failed." }, 500)
            // Trigger reconcile for the chosen Sim + originating transcript (same logic as the
            // auto-matched path in POST /api/transcripts, but on-demand via this confirmation).
            const tr = await transcriptById(proj.id, matchRow.transcriptId)
            if (tr) {
              // Fire-and-forget: non-fatal if the reconcile itself fails (the match is already confirmed).
              ;(async () => {
                try {
                  const sourceDate = tr.sourceDate ?? Date.now()
                  const transcriptId = tr.id
                  await ensureTraitsSeeded(chosenSimId)
                  const current = await listTraits(chosenSimId, { activeOnly: true })
                  const recentlyResolved = await getRecentlyResolvedTraits(chosenSimId)
                  const { ops, usage } = await reconcileSim(current, tr.rawText, { email: me, projectId: proj.id, recentlyResolved })
                  const reopenIds = new Set(ops.filter((o: any) => o.op === "reopen" && o.traitId).map((o: any) => o.traitId!))
                  let traitsForApply = current
                  if (reopenIds.size > 0) {
                    const allTraits = await listTraits(chosenSimId)
                    const resolvedTargets = allTraits.filter((t) => reopenIds.has(t.id) && t.status !== "active")
                    traitsForApply = [...current, ...resolvedTargets]
                  }
                  const res = applyReconcileOps(traitsForApply, ops, { simId: chosenSimId, projectId: proj.id, transcriptId, sourceDate, rawText: tr.rawText })
                  for (const w of res.traitWrites) {
                    if (w.mode === "insert") await insertTrait(w.trait)
                    else await updateTrait(w.trait)
                  }
                  for (const e of res.traitEvents) await insertTraitEvent(e)
                  await markReconcileRun(chosenSimId, transcriptId)
                  await rebuildInsightsJson(chosenSimId)
                  await insertActivity({ projectId: proj.id, type: "sim_evolved", actorEmail: me, simId: chosenSimId, meta: { transcriptId, ops: res.traitWrites.length, via: "sim_match_confirm" } })
                  void recordAiCall({ type: "reconcile", model: "unknown", accountId: proj.accountId, feature: "sim_match_confirm", actorEmail: me, projectId: proj.id, inputTokens: usage?.input_tokens ?? 0, outputTokens: usage?.output_tokens ?? 0, costUsd: null })
                } catch (err: any) {
                  console.warn("sim_match_confirm reconcile failed (non-fatal):", err?.message || err)
                }
              })()
            }
            return json({ ok: true, matchId, chosenSimId })
          }
        }

        {
          const smReject = sub.match(/^\/sim-matches\/([^/]+)\/reject$/)
          if (smReject && req.method === "POST") {
            const matchId = smReject[1]
            const matchRow = await getPendingSimMatch(proj.id, matchId)
            if (!matchRow) return json({ error: "Not found." }, 404)
            if (matchRow.status !== "pending") return json({ error: "Already resolved." }, 409)
            const ok = await rejectPendingSimMatch(proj.id, matchId, me)
            if (!ok) return json({ error: "Update failed." }, 500)
            return json({ ok: true, matchId })
          }
        }

        // GET /api/projects/:id/tickets — paginated, filterable ticket list (any project member, KLA-169)
        if (req.method === "GET" && sub === "/tickets") {
          const sp = url.searchParams
          const statuses = sp.get("status") ? sp.get("status")!.split(",").filter(Boolean) : []
          const priorities = sp.get("priority") ? sp.get("priority")!.split(",").filter(Boolean) : []
          const assignee = sp.has("assignee") ? (sp.get("assignee") ?? "") : undefined
          const rawSource = sp.get("source") ?? ""
          const source = rawSource === "sim" ? "sim" : rawSource === "manual" ? "manual" : rawSource === "human" ? "human" : undefined
          const label = sp.get("label")?.trim() || undefined
          // `q` performs project-scoped, paginated server-side text search. Keep the bound
          // modest to avoid unexpectedly expensive broad LIKE queries.
          const search = (sp.get("q") ?? "").trim().slice(0, 500) || undefined
          const page = Math.max(1, Number(sp.get("page") || "1"))
          const limit = Math.min(200, Math.max(1, Number(sp.get("limit") || "50")))
          const result = await listTicketsPaginated(proj.id, { statuses, priorities, assignee, source, label, search, page, limit })
          const ticketIds = result.tickets.map((t: any) => t.id)
          const labelsMap = await labelsForFeedbackBatch(ticketIds)
          result.tickets = result.tickets.map((t: any) => ({ ...t, labels: labelsMap[t.id] || [] }))
          return json(result)
        }

        // POST /api/projects/:id/tickets — manually create a ticket (KLA-173).
        // Any project member may create; ticket is immediately open (skips triage queue).
        if (req.method === "POST" && sub === "/tickets") {
          const body = await req.json().catch(() => ({}))
          const title = String(body.title ?? "").trim()
          if (!title) return json({ error: "Title is required." }, 400)
          if (title.length > 500) return json({ error: "Title must be 500 characters or fewer." }, 400)
          const bodyText = String(body.body ?? body.description ?? "").trim()
          if (bodyText.length > 5000) return json({ error: "Body must be 5000 characters or fewer." }, 400)
          const VALID_PRI = ["urgent", "high", "medium", "low"]
          const priority = VALID_PRI.includes(body.priority) ? body.priority : "medium"
          const assignee = normalizeAssigneeEmail(body.assignee)
          if (assignee === "") return json({ error: "assignee must be a valid email address." }, 400)
          if (!(await canAssignTicketTo(proj.id, access, assignee))) {
            return json({ error: "Only project admins can assign tickets to non-members." }, 403)
          }
          const observation = bodyText ? `${title}\n\n${bodyText}` : title
          const id = await insertFeedback({
            projectId: proj.id,
            actorEmail: me,
            observation,
            priority,
            assignee: assignee || null,
            source: "manual",
          })
          // Manual tickets start as "open" regardless of priority (override initial "new" status).
          await updateFeedbackMeta(proj.id, id, { status: "open" })
          // Emit an activity event so the timeline shows who created it.
          await insertActivity({
            projectId: proj.id,
            type: "ticket_created",
            actorEmail: me,
            feedbackId: id,
            meta: { title, priority, source: "manual" },
          }).catch((e: any) => console.warn("ticket_created activity skipped:", e?.message || e))
          let createEmailSent: boolean | null = null
          if (assignee) {
            const notify = await notifyTicketAssignee({
              projectId: proj.id,
              feedbackId: id,
              assignee,
              ticketTitle: title,
              projectName: proj.name,
              assignedBy: me,
            })
            createEmailSent = notify.emailSent
          }
          // JTBD 2.15: surface a silently-skipped notification email so the UI can warn.
          return json({ ok: true, ticketId: id, ...(createEmailSent === false ? { assigneeEmailSent: false } : {}) }, 201)
        }

        // PATCH /api/projects/:id/tickets/bulk — KLA-178: apply one action to multiple tickets at once.
        // Body: { ticketIds: string[], status?, priority?, assignee?, addLabelId?, removeLabelId? }
        // Any member may change status/priority/assignee/labels; up to 200 tickets per call.
        if (req.method === "PATCH" && sub === "/tickets/bulk") {
          const body = await req.json().catch(() => ({}))
          const ticketIds: string[] = Array.isArray(body.ticketIds) ? body.ticketIds.slice(0, 200).map(String) : []
          if (!ticketIds.length) return json({ error: "ticketIds must be a non-empty array." }, 400)

          const VALID_STATUS = ["new", "open", "in_progress", "done", "dismissed"]
          const VALID_PRI = ["urgent", "high", "medium", "low"]

          const hasStatus = body.status !== undefined
          const hasPriority = body.priority !== undefined
          const hasAssignee = body.assignee !== undefined
          const hasAddLabel = body.addLabelId !== undefined
          const hasRemoveLabel = body.removeLabelId !== undefined

          if (!hasStatus && !hasPriority && !hasAssignee && !hasAddLabel && !hasRemoveLabel) {
            return json({ error: "Specify at least one of: status, priority, assignee, addLabelId, removeLabelId." }, 400)
          }
          if (hasStatus && !VALID_STATUS.includes(body.status)) {
            return json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400)
          }
          if (hasPriority && body.priority !== null && !VALID_PRI.includes(body.priority)) {
            return json({ error: `priority must be one of: ${VALID_PRI.join(", ")}` }, 400)
          }

          let labelToAdd: string | null = null
          let labelToRemove: string | null = null
          if (hasAddLabel || hasRemoveLabel) {
            const projectLabels = await listLabels(proj.id)
            const labelIds = new Set(projectLabels.map(l => l.id))
            if (hasAddLabel) {
              if (!labelIds.has(String(body.addLabelId))) return json({ error: "addLabelId not found in this project." }, 404)
              labelToAdd = String(body.addLabelId)
            }
            if (hasRemoveLabel) {
              if (!labelIds.has(String(body.removeLabelId))) return json({ error: "removeLabelId not found in this project." }, 404)
              labelToRemove = String(body.removeLabelId)
            }
          }

          const assigneeVal = hasAssignee ? normalizeAssigneeEmail(body.assignee) : undefined
          if (hasAssignee && assigneeVal === "") return json({ error: "assignee must be a valid email address or null." }, 400)
          if (hasAssignee && !(await canAssignTicketTo(proj.id, access, assigneeVal ?? null))) {
            return json({ error: "Only project admins can assign tickets to non-members." }, 403)
          }

          let updated = 0
          // JTBD 2.15: flip true if any assignment notification email was silently skipped (SendGrid
          // unconfigured), so the bulk response can warn instead of pretending everyone was emailed.
          let assigneeEmailSkipped = false
          const failures: Array<{ ticketId: string; operation: string; error: string }> = []
          // JTBD 2.14: per-ticket pre-mutation snapshot of the fields that were changed, so the
          // client can offer an Undo that restores exact prior values (not a blind reverse).
          const prior: Array<{ ticketId: string; status?: string | null; priority?: string | null; assignee?: string | null }> = []
          for (const tid of ticketIds) {
            const row = await feedbackById(proj.id, tid).catch(() => null)
            if (!row) continue  // skip tickets not in this project
            const meta: Partial<{ status: string; priority: string | null; assignee: string | null }> = {}
            if (hasStatus) meta.status = body.status
            if (hasPriority) meta.priority = body.priority ?? null
            if (hasAssignee) meta.assignee = assigneeVal ?? null
            if (Object.keys(meta).length) {
              const changed = await updateFeedbackMeta(proj.id, tid, meta).catch(() => false)
              if (!changed) {
                failures.push({ ticketId: tid, operation: "metadata", error: "Update failed." })
                continue
              }
              // Record the prior value of each mutated metadata field for undo.
              const snap: { ticketId: string; status?: string | null; priority?: string | null; assignee?: string | null } = { ticketId: tid }
              if (hasStatus) snap.status = row.status ?? null
              if (hasPriority) snap.priority = row.priority ?? null
              if (hasAssignee) snap.assignee = row.assignee ?? null
              prior.push(snap)
              const activityWrites: Promise<any>[] = []
              if (changed && hasStatus && meta.status !== row.status) {
                activityWrites.push(insertActivity({
                  projectId: proj.id,
                  type: "ticket_status_changed",
                  actorEmail: me,
                  feedbackId: tid,
                  meta: { from: row.status, to: meta.status },
                }).catch((e: any) => console.warn("bulk ticket status activity skipped:", e?.message || e)))
              }
              if (changed && hasPriority && meta.priority !== row.priority) {
                activityWrites.push(insertActivity({
                  projectId: proj.id,
                  type: "ticket_priority_changed",
                  actorEmail: me,
                  feedbackId: tid,
                  meta: { from: row.priority, to: meta.priority },
                }).catch((e: any) => console.warn("bulk ticket priority activity skipped:", e?.message || e)))
              }
              if (changed && hasAssignee && meta.assignee !== row.assignee) {
                activityWrites.push(insertActivity({
                  projectId: proj.id,
                  type: "ticket_assignee_changed",
                  actorEmail: me,
                  feedbackId: tid,
                  meta: { from: row.assignee, to: meta.assignee },
                }).catch((e: any) => console.warn("bulk ticket assignee activity skipped:", e?.message || e)))
                if (meta.assignee) {
                  const notify = await notifyTicketAssignee({
                    projectId: proj.id,
                    feedbackId: tid,
                    assignee: meta.assignee,
                    ticketTitle: String(row.observation || "Untitled ticket"),
                    projectName: proj.name,
                    assignedBy: me,
                  })
                  if (!notify.emailSent) assigneeEmailSkipped = true
                }
              }
              if (activityWrites.length) await Promise.all(activityWrites)
              if (changed && hasStatus && meta.status !== row.status) {
                void notifyReporterOnFix({
                  contactEmail: row.contactEmail,
                  previousStatus: row.status,
                  nextStatus: meta.status,
                  title: String(row.observation || "Bug report"),
                  projectName: proj.name,
                  ticketUrl: ticketDashboardUrl(proj.id),
                })
              }
            }
            if (labelToAdd) {
              try { await attachLabel(labelToAdd, tid) }
              catch (e: any) { failures.push({ ticketId: tid, operation: "addLabel", error: String(e?.message || e) }) }
            }
            if (labelToRemove) {
              try { await detachLabel(labelToRemove, tid) }
              catch (e: any) { failures.push({ ticketId: tid, operation: "removeLabel", error: String(e?.message || e) }) }
            }
            updated++
          }
          return json({ ok: failures.length === 0, updated, failures, prior, ...(assigneeEmailSkipped ? { assigneeEmailSent: false } : {}) }, failures.length ? 207 : 200)
        }

        // ── KLA-174: Label management endpoints ────────────────────────────────────────────────────
        // GET /api/projects/:id/labels — list all labels for this project (any member)
        if (req.method === "GET" && sub === "/labels") {
          return json({ labels: await listLabels(proj.id) })
        }

        // POST /api/projects/:id/labels — create label (admin only) { name, color? }
        if (req.method === "POST" && sub === "/labels") {
          if (access !== "admin") return json({ error: "Only project admins can create labels." }, 403)
          const body = await req.json().catch(() => ({}))
          const name = String(body.name ?? "").trim()
          if (!name) return json({ error: "name is required." }, 400)
          if (name.length > 100) return json({ error: "name must be 100 characters or fewer." }, 400)
          const color = /^#[0-9a-fA-F]{6}$/.test(String(body.color ?? "")) ? String(body.color) : "#6366f1"
          const label = await createLabel(proj.id, name, color)
          return json({ label }, 201)
        }

        // PATCH /api/projects/:id/labels/:lid — update label (admin only) { name?, color? }
        const labelSubMatch = sub.match(/^\/labels\/([^/]+)$/)
        if (labelSubMatch) {
          const lid = labelSubMatch[1]
          if (req.method === "PATCH") {
            if (access !== "admin") return json({ error: "Only project admins can update labels." }, 403)
            const body = await req.json().catch(() => ({}))
            const name = String(body.name ?? "").trim()
            if (!name) return json({ error: "name is required." }, 400)
            if (name.length > 100) return json({ error: "name must be 100 characters or fewer." }, 400)
            const color = /^#[0-9a-fA-F]{6}$/.test(String(body.color ?? "")) ? String(body.color) : "#6366f1"
            const ok = await updateLabel(proj.id, lid, name, color)
            if (!ok) return json({ error: "Label not found." }, 404)
            return json({ ok: true })
          }
          if (req.method === "DELETE") {
            if (access !== "admin") return json({ error: "Only project admins can delete labels." }, 403)
            const ok = await deleteLabel(proj.id, lid)
            if (!ok) return json({ error: "Label not found." }, 404)
            return json({ ok: true })
          }
        }

        // GET /api/projects/:id/recurring — corpus-wide recurring/regression memory for this project.
        // Read-only, project-scoped, and citation-grounded in real feedback rows.
        if (req.method === "GET" && sub === "/recurring") {
          if (!db) return json({ error: "Database unavailable." }, 503)
          const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || "50")))
          const recurring = await listProjectRecurringIssues(db, proj.id, { limit })
          return json({ projectId: proj.id, recurring })
        }

        // B.6 unified Regression alarm feed — GET /api/projects/:id/regression-events
        // Recent regression events (all three detectors: memory / sim-reopen / guard) for the
        // dashboard red banner. Unacknowledged by default; ?all=1 includes dismissed. Project-scoped.
        if (req.method === "GET" && sub === "/regression-events") {
          if (!db) return json({ error: "Database unavailable." }, 503)
          const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "20")))
          const includeAcknowledged = url.searchParams.get("all") === "1"
          const events = await listRegressionEvents(db, proj.id, { limit, includeAcknowledged })
          return json({ projectId: proj.id, events })
        }
        // POST /api/projects/:id/regression-events/:eid/ack — dismiss a regression banner. Any member.
        {
          const ackMatch = sub.match(/^\/regression-events\/([^/]+)\/ack$/)
          if (req.method === "POST" && ackMatch) {
            if (!db) return json({ error: "Database unavailable." }, 503)
            const ok = await acknowledgeRegressionEvent(db, proj.id, ackMatch[1], Date.now())
            if (!ok) return json({ error: "Not found." }, 404)
            return json({ ok: true })
          }
        }

        if (req.method === "GET" && sub === "") {
          return json({ project: { id: proj.id, name: proj.name, accountId: proj.accountId, status: proj.status, reviewMode: proj.reviewMode, observabilityMode: proj.observabilityMode, reviewBudgetDaily: proj.reviewBudgetDaily }, role: access, members: await membersOfProject(pid) })
        }
        if (req.method === "GET" && sub === "/members") {
          return json({ members: await membersOfProject(pid) })
        }
        if (req.method === "POST" && sub === "/invite") {
          if (access !== "admin") return json({ error: "Only project admins can invite." }, 403)
          const body = await req.json().catch(() => ({}))
          const inv = String(body.email || "").trim().toLowerCase()
          const role = body.role === "admin" ? "admin" : "member"
          if (!inv.includes("@")) return json({ error: "Enter a valid email." }, 400)
          await addProjectMember(pid, proj.accountId, inv, role, me)
          return json({ ok: true, members: await membersOfProject(pid) })
        }
        // Rename a project (name only) — admin-gated. The signup onboarding calls this on the user's
        // auto-created Default Project to set the name they chose, instead of creating a duplicate.
        if (sub === "/rename") {
          if (req.method !== "POST" && req.method !== "PATCH") return json({ error: "Not found" }, 404)
          if (access !== "admin") return json({ error: "Only project admins can rename." }, 403)
          const body = await req.json().catch(() => ({}))
          const name = String(body.name || "").trim()
          if (!name) return json({ error: "Project name is required." }, 400)
          const updated = await renameProject(pid, name)
          return json({ project: { id: updated!.id, name: updated!.name, accountId: updated!.accountId, status: updated!.status, role: access } })
        }

        // ── KLAVITYKLA-248: Trails subjective auto-file toggle ────────────────────────────────────
        // GET  /api/projects/:id/trails-autofile — returns { trailsAutofileEnabled: boolean }
        // POST /api/projects/:id/trails-autofile — { enabled: boolean } — set the per-project flag.
        //   Admin-only write. Guard-caught regressions (kind=regression && confidence>=0.9) always
        //   auto-file regardless of this flag; this setting controls only subjective findings.
        if (sub === "/trails-autofile") {
          if (req.method === "GET") {
            return json({ trailsAutofileEnabled: !!proj.trailsAutofileEnabled })
          }
          if (req.method === "POST") {
            if (access !== "admin") return json({ error: "Only project admins can change auto-file settings." }, 403)
            const body = await req.json().catch(() => ({}))
            if (typeof body.enabled !== "boolean") return json({ error: "enabled (boolean) is required." }, 400)
            await setProjectTrailsAutofile(pid, body.enabled)
            return json({ ok: true, trailsAutofileEnabled: body.enabled })
          }
          return json({ error: "Method not allowed" }, 405)
        }

        return json({ error: "Not found" }, 404)
      }
      // brief → one persona (no transcript needed)
      if (req.method === "POST" && path === "/api/persona/brief") {
        try {
          const { brief } = await req.json()
          if (!brief || String(brief).trim().length < 4) return json({ error: "Describe your user in a sentence." }, 400)
          if (String(brief).length > AI_DEMO_MAX_CHARS) return json({ error: "Brief too long." }, 413)
          // simClass: "user" = operates the product hands-on (UI/interaction focus); "client" = judges outcomes/business results.
          // Default described Sims to "user" unless the brief clearly indicates an outcome-judging stakeholder (exec, buyer, decision-maker).
          const sys = "Create ONE believable user persona (a \"Sim\") from the user's brief. Invent a plausible first+last name and a role. " +
            "Classify on two axes: simClass (\"user\" = actually OPERATES the product hands-on, feedback skews UI/interaction; " +
            "\"client\" = evaluates OVERALL outcomes and business results, feedback skews feature/workflow/strategy — only assign \"client\" when the brief clearly describes an executive, buyer, or outcome-judging stakeholder) " +
            "and side (\"external\" = customer/partner outside the team; \"internal\" = on the product/company team). " +
            "Respond with ONLY a JSON object, no prose: {\"persona\":{\"name\":string,\"role\":string,\"simClass\":\"user\"|\"client\",\"side\":\"external\"|\"internal\",\"initials\":string(2 uppercase letters),\"accent\":string(hex colour like #6366f1),\"summary\":string,\"insights\":[{\"kind\":\"pain\"|\"want\"|\"love\",\"text\":string,\"quote\":string}]}} with exactly 3 insights; each quote is a short first-person line this persona might actually say."
          const meB = (await sessionEmail(req)) || (await bearerEmail(req))
          if (aiDemoLimited(meB, req, server)) return json({ error: "Too many requests. Please wait and try again." }, 429, { "Retry-After": "3600" })
          const { content, usage } = await chat([{ role: "system", content: sys }, { role: "user", content: "Brief: " + brief }], 1200, true, { type: "persona", email: meB })
          const data = parseJSON(content)
          // Ensure simClass is always set: default to "user" for described Sims when the model omits it.
          if (data.persona) {
            if (!SIM_CLASS_ENUM.has(String(data.persona.simClass))) data.persona.simClass = "user"
            if (!SIDE_ENUM.has(String(data.persona.side))) data.persona.side = "external"
          }
          return json({ persona: data.persona, usage })
        } catch (e: any) { return json(oops(e, "create"), 500) }
      }
      // site URL → up to 3 personas inferred from the public home page (no transcript needed)
      if (req.method === "POST" && path === "/api/persona/site") {
        try {
          let { url: siteUrl } = await req.json()
          siteUrl = String(siteUrl || "").trim()
          if (!siteUrl) return json({ error: "Enter your product's URL." }, 400)
          if (!/^https?:\/\//i.test(siteUrl)) siteUrl = "https://" + siteUrl
          const meS = (await sessionEmail(req)) || (await bearerEmail(req))
          if (aiDemoLimited(meS, req, server)) return json({ error: "Too many requests. Please wait and try again." }, 429, { "Retry-After": "3600" })
          // SSRF-guarded fetch of the public page (private/loopback hosts rejected by the guard).
          let html = ""
          try {
            const res = await safeFetch(siteUrl, { headers: { "user-agent": "KlavitySimBot/1.0 (+https://klavity.in)" }, signal: AbortSignal.timeout(8000) })
            if (!res.ok) return json({ error: `Couldn't read that page (HTTP ${res.status}).` }, 400)
            html = (await res.text()).slice(0, 300_000)
          } catch {
            return json({ error: "Couldn't reach that URL. Make sure it's a public https page." }, 400)
          }
          // Strip scripts/styles/tags/entities to plain readable text, then cap for the model.
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&[a-z#0-9]+;/gi, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, AI_DEMO_MAX_CHARS)
          if (text.length < 40) return json({ error: "That page didn't have enough text to read." }, 400)
          // simClass: "user" = operates the product hands-on; "client" = judges outcomes/business results.
          // Site-inferred Sims default to "user" unless the page clearly targets exec/buyer audiences.
          const sys = "From the text of a product's public web page, infer 2-3 DISTINCT believable user personas (\"Sims\") who would use or evaluate it, grounded in what the page actually says (audience, pricing, features). Invent plausible first+last names and roles. " +
            "Classify each on two axes: simClass (\"user\" = actually OPERATES the product hands-on, feedback skews UI/interaction; " +
            "\"client\" = evaluates OVERALL outcomes and business results, feedback skews feature/workflow/strategy — only assign \"client\" when the persona clearly describes an executive, buyer, or outcome-judging stakeholder) " +
            "and side (\"external\" = customer/partner outside the team; \"internal\" = on the product/company team). " +
            "Respond with ONLY a JSON object, no prose: {\"personas\":[{\"name\":string,\"role\":string,\"simClass\":\"user\"|\"client\",\"side\":\"external\"|\"internal\",\"initials\":string(2 uppercase letters),\"accent\":string(hex colour like #6366f1),\"summary\":string,\"insights\":[{\"kind\":\"pain\"|\"want\"|\"love\",\"text\":string,\"quote\":string}]}]} with 2-3 personas, each with exactly 3 insights; each quote is a short first-person line that persona might say."
          const { content, usage } = await chat([{ role: "system", content: sys }, { role: "user", content: "Page URL: " + siteUrl + "\n\nPage text:\n" + text }], 1600, true, { type: "persona", email: meS })
          const data = parseJSON(content)
          // Ensure simClass/side are always set on each persona: default to "user"/"external" for site-inferred Sims.
          const personas = (data.personas || []).slice(0, 3).map((p: any) => {
            if (!SIM_CLASS_ENUM.has(String(p?.simClass))) p.simClass = "user"
            if (!SIDE_ENUM.has(String(p?.side))) p.side = "external"
            return p
          })
          return json({ personas, usage })
        } catch (e: any) { return json(oops(e, "create"), 500) }
      }
      // site URL → live headless screenshot → Sim reactions.
      //
      // TWO BRANCHES:
      //
      // AUTHENTICATED + projectId branch ("URL preview with real Sims"):
      //   When a signed-in caller supplies a projectId they own, this runs the project's Sims through
      //   the SAME pipeline as /api/sim/review (runSimReviews), persists reactions to the feedback table
      //   (tagged adhoc=true, source=url-preview), inserts a sim_runs record, and returns all reviews.
      //   Results appear in the dashboard "New reports" exactly like extension-triggered reviews.
      //   Auth: cookie OR Bearer. Access check: resolveProject. Rate-limited per-user (aiDemoLimited).
      //
      // EPHEMERAL (unauthenticated or no projectId) branch ("onboarding aha"):
      //   ONE ephemeral persona reacts to the URL; nothing is persisted; no cross-tenant lookup.
      //   Powers site/onboarding.html — kept UNCHANGED.
      if (req.method === "POST" && path === "/api/sim/preview") {
        try {
          let { url: pvUrl, persona, projectId: pvProjectId } = await req.json()
          pvUrl = String(pvUrl || "").trim()
          if (!pvUrl) return json({ error: "Enter your product's URL." }, 400)
          if (!/^https?:\/\//i.test(pvUrl)) pvUrl = "https://" + pvUrl
          const mePv = (await sessionEmail(req)) || (await bearerEmail(req))
          if (aiDemoLimited(mePv, req, server)) return json({ error: "Too many requests. Please wait and try again." }, 429, { "Retry-After": "3600" })

          // ── AUTHENTICATED branch: resolve project + Sims BEFORE SSRF/screenshot ─────
          // Access check and Sims-presence check come FIRST so auth failures never burn
          // SSRF quota or a browser slot. SSRF and screenshotUrl run only if gates pass.
          let pvProj: { id: string; access: "admin" | "member" } | null = null
          let projectSims: any[] = []
          if (mePv && pvProjectId) {
            const pvProjId = String(pvProjectId).trim()
            pvProj = await resolveProject(mePv, pvProjId)
            if (!pvProj) return json({ error: "No accessible project found." }, 403)
            projectSims = await listPersonas(pvProj.id)
            if (!projectSims.length) return json({ error: "This project has no Sims yet. Add a Sim first." }, 400)
          }

          // SSRF preflight: reuse safeFetch's guard (rejects private/loopback + validates each redirect
          // hop) AND confirm the page is reachable BEFORE we point a real browser at it.
          try {
            const pre = await safeFetch(pvUrl, { headers: { "user-agent": "KlavitySimBot/1.0 (+https://klavity.in)" }, signal: AbortSignal.timeout(8000) })
            if (!pre.ok) return json({ error: `Couldn't reach that page (HTTP ${pre.status}).` }, 400)
          } catch {
            return json({ error: "Couldn't reach that URL. Make sure it's a public https page." }, 400)
          }
          // ── KLA-264 (JTBD 3.12): behind-auth previews ─────────────────────────────
          // For an authenticated project, reuse its encrypted AutoSim auth method (ADR-0001) to log
          // in BEFORE the shot so the logged-in app (the highest-value surface) is previewable.
          // Falls back to a public shot when no headless auth method is configured; credentials are
          // decrypted at execution time only and never returned to the client or logged.
          let shot: { imageB64: string; mediaType: "image/jpeg"; authed?: boolean }
          try {
            if (pvProj) {
              shot = await authedScreenshotUrl(pvUrl, pvProj.id)
            } else {
              shot = await screenshotUrl(pvUrl)
            }
          } catch {
            // A behind-login page without a configured Test Account is the most common failure here:
            // explain the limitation and point at Test Account setup, otherwise a generic hint.
            if (pvProj && !(await projectHasHeadlessAuth(pvProj.id).catch(() => false))) {
              return json({
                error: "Couldn't preview that page. If it's behind a login, configure an AutoSim Test Account for this project so Sims can sign in before reviewing it — then try again.",
                needsTestAccount: true,
              }, 400)
            }
            return json({ error: "Couldn't open that page to preview it. Try a public page." }, 400)
          }

          // ── AUTHENTICATED branch: run real Sims, persist results ─────────────
          if (pvProj && mePv && projectSims.length) {
            const authenticatedProjectId = pvProj.id
            const { urlHost, urlPath } = splitUrl(pvUrl)

            // Store the screenshot (non-fatal if S3 not configured).
            let screenshotId: string
            try {
              const shotBytes = Buffer.from(shot.imageB64, "base64")
              const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
              const upload = await uploadScreenshotMeta(shotBytes, shot.mediaType, "private")
              screenshotId = await insertScreenshot({
                projectId: authenticatedProjectId, s3Key: upload.key, bucket: upload.bucket,
                contentType: upload.contentType, acl: "private",
                bytes: shotBytes.byteLength,
                ownerEmail: mePv, expiresAt,
              })
            } catch (e: any) {
              console.warn("[sim-preview] screenshot storage skipped (no S3):", e?.message || e)
              screenshotId = "no-s3-" + Date.now().toString(36)
            }

            // Run all Sims through the SAME pipeline as /api/sim/review.
            // adhoc=true: bypass seenHashes + near-dup dedup so all current Sim reactions surface.
            const seenKeys = projectSims.map((s) => `urlprev:${s.id}:${urlPath || "/"}`)
            const reviews = await runSimReviews({
              projectId: authenticatedProjectId, urlPath, urlHost, pageUrl: pvUrl,
              imageB64: shot.imageB64, mediaType: shot.mediaType,
              targetSims: projectSims,
              actorEmail: mePv, screenshotId,
              seenKeys, seenHashes: new Set(), sessionId: undefined,
              mode: "all", adhoc: true,
              reactFn: (sim, b64, mt, pu) => reactToPage(sim, b64, mt, pu, { email: mePv, projectId: authenticatedProjectId }),
              resolveCitationsFn: resolveCitations,
              // autoCopy intentionally omitted: triage-gated (fires on PATCH status→open, not on insert).
              markSeen: () => {},  // no seen-key bookkeeping for one-shot URL previews
              db: db ?? null,
            })

            // Persist a sim_runs record for the dashboard run history.
            if (db) {
              try {
                await insertSimRun({
                  projectId: authenticatedProjectId, url: pvUrl,
                  simIds: null,  // null = all Sims
                  screenshotId, reactions: reviews,
                  actorEmail: mePv, status: "done", finishedAt: Date.now(),
                })
              } catch (e: any) { console.warn("[sim-preview] sim_runs insert skipped:", e?.message || e) }
            }

            const { simCount, totalObservations } = buildSimRunSummary(reviews)
            console.log(`[sim-preview] authed project=${authenticatedProjectId} url=${pvUrl} sims=${simCount} observations=${totalObservations}`)
            return json({ ok: true, projectId: authenticatedProjectId, reviews, screenshotId, simCount, totalObservations, persisted: true })
          }

          // ── EPHEMERAL branch: one persona, nothing persisted ─────────────────
          // Kept UNCHANGED — powers onboarding.html "instant aha".
          const p = persona && typeof persona === "object" ? persona : defaultPreviewPersona()
          // An LLM hiccup here lands mid-aha (homepage/onboarding step 0) — return a friendly,
          // retryable 400 instead of a raw 500 so the clients' soft-fail copy stays accurate.
          let rr: Awaited<ReturnType<typeof reactToPage>>
          try { rr = await reactToPage(p, shot.imageB64, shot.mediaType, pvUrl, { email: mePv }) }
          catch { return json({ error: "The Sim couldn't finish reading that page — try again in a moment." }, 400) }
          const reaction = (rr.data.reactions || [])[0] || null
          return json({ reaction, personaName: p?.name || null, usage: rr.usage })
        } catch (e: any) { return json(oops(e, "preview"), 500) }
      }

      // ── KLA-254: Scheduled Sim reviews ─────────────────────────────────────────────────────────
      //
      // POST /api/projects/:projectId/sim-review-schedules
      //   Body: { targetUrl, frequency: "daily"|"weekly", simIds?: string[], firstRunAt?: number }
      //   Creates a schedule. Auth: cookie or Bearer; access-checks project ownership.
      //
      // GET  /api/projects/:projectId/sim-review-schedules
      //   Lists all schedules for the project.
      //
      // DELETE /api/projects/:projectId/sim-review-schedules/:id
      //   Deletes a schedule.
      //
      // PATCH /api/projects/:projectId/sim-review-schedules/:id
      //   Body: { enabled: boolean }  — pause/resume a schedule.
      //
      // POST /api/sim-review-schedules/tick
      //   Runs all due schedules immediately. Callable by an external cron, the trail
      //   scheduler loop, or integration tests. Returns { ran: ScheduleRunResult[] }.
      //   Auth: same cookie/Bearer as the caller; validates the user has access to
      //   at least one project (prevents open invocation). For production wiring via
      //   OS cron, protect this with a shared secret via X-Tick-Secret header.
      //
      // Implementation: POST + GET on /api/projects/:id/sim-review-schedules
      const srsMatch = path.match(/^\/api\/projects\/([^/]+)\/sim-review-schedules(?:\/([^/]+))?$/)
      if (srsMatch) {
        const srsProjectId = srsMatch[1]
        const srsScheduleId = srsMatch[2] ?? null
        try {
          const meSrs = (await sessionEmail(req)) || (await bearerEmail(req))
          if (!meSrs) return json({ error: "Login required." }, 401)
          const srsProj = await resolveProject(meSrs, srsProjectId)
          if (!srsProj) return json({ error: "No accessible project found." }, 403)

          if (req.method === "GET" && !srsScheduleId) {
            const schedules = await listSimReviewSchedules(srsProj.id)
            return json({ schedules })
          }

          if (req.method === "POST" && !srsScheduleId) {
            const body = await req.json()
            const targetUrl = String(body?.targetUrl || "").trim()
            if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) return json({ error: "targetUrl must be a valid https URL." }, 400)
            const frequency: SimReviewScheduleFrequency = body?.frequency === "weekly" ? "weekly" : "daily"
            const simIds: string[] | null = Array.isArray(body?.simIds) && body.simIds.length
              ? body.simIds.map(String)
              : null
            const firstRunAt: number | undefined = typeof body?.firstRunAt === "number" ? body.firstRunAt : undefined
            const schedule = await createSimReviewSchedule({
              projectId: srsProj.id, targetUrl, frequency, simIds,
              createdBy: meSrs, firstRunAt,
            })
            return json({ schedule }, 201)
          }

          if (req.method === "DELETE" && srsScheduleId) {
            const deleted = await deleteSimReviewSchedule(srsProj.id, srsScheduleId)
            if (!deleted) return json({ error: "Schedule not found." }, 404)
            return json({ ok: true })
          }

          if (req.method === "PATCH" && srsScheduleId) {
            const body = await req.json()
            const existing = await getSimReviewSchedule(srsProj.id, srsScheduleId)
            if (!existing) return json({ error: "Schedule not found." }, 404)
            if (typeof body?.enabled === "boolean") {
              await setSimReviewScheduleEnabled(srsProj.id, srsScheduleId, body.enabled)
            }
            const updated = await getSimReviewSchedule(srsProj.id, srsScheduleId)
            return json({ schedule: updated })
          }

          return json({ error: "Method not allowed." }, 405)
        } catch (e: any) { return json(oops(e, "sim-review-schedules"), 500) }
      }

      // POST /api/sim-review-schedules/tick — run all due schedules
      if (req.method === "POST" && path === "/api/sim-review-schedules/tick") {
        try {
          const meTick = (await sessionEmail(req)) || (await bearerEmail(req))
          if (!meTick) return json({ error: "Login required." }, 401)
          // Caller must have at least one project — a light anti-abuse guard.
          const tickProjects = await listProjects(meTick)
          if (!tickProjects.length) return json({ error: "No projects found for this account." }, 403)

          const storeScreenshot = async (bytes: Buffer, mediaType: string, projectId: string) => {
            const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
            const upload = await uploadScreenshotMeta(bytes, mediaType, "private")
            return insertScreenshot({
              projectId, s3Key: upload.key, bucket: upload.bucket,
              contentType: upload.contentType, acl: "private",
              bytes: bytes.byteLength, ownerEmail: meTick, expiresAt,
            })
          }

          const deps = buildProductionDeps(
            (sim, b64, mt, pu) => reactToPage(sim, b64, mt, pu, { email: meTick }),
            resolveCitations,
            db ?? null,
            storeScreenshot,
          )
          const ran = await runDueSchedules(deps)
          return json({ ok: true, ran })
        } catch (e: any) { return json(oops(e, "sim-review-schedules-tick"), 500) }
      }

      // gated AI
      if (req.method === "POST" && path === "/api/extract") {
        try {
          const { transcript } = await req.json()
          if (!transcript || transcript.trim().length < 20) return json({ error: "Transcript too short" }, 400)
          if (String(transcript).length > EXTRACT_TRANSCRIPT_MAX_CHARS) return json({ error: `Transcript too large (max ${EXTRACT_TRANSCRIPT_MAX_CHARS.toLocaleString()} characters). Paste the most relevant part of the call.` }, 413)
          const meE = (await sessionEmail(req)) || (await bearerEmail(req))
          if (aiDemoLimited(meE, req, server)) return json({ error: "Too many requests. Please wait and try again." }, 429, { "Retry-After": "3600" })
          const { data, usage } = await extractPersonas(transcript, { email: meE })
          return json({ personas: data.personas || [], usage })
        } catch (e: any) {
          // Surface a more actionable message for the two most common failure modes:
          //   • model timeout  → tell user to try a shorter transcript
          //   • JSON parse err → tell user the model response was garbled (include trace id)
          const msg: string = (e as any)?.message || ""
          const isTimeout = msg.toLowerCase().includes("too long") || msg.toLowerCase().includes("timeout")
          const isParseErr = msg.includes("valid JSON")
          const oopsResult = oops(e, "extract")
          if (isTimeout) {
            return json({ ...oopsResult, error: `The AI took too long on this transcript — try a shorter excerpt (ref: ${oopsResult.id}).` }, 500)
          }
          if (isParseErr) {
            return json({ ...oopsResult, error: `The AI returned an unreadable response — please try again (ref: ${oopsResult.id}).` }, 500)
          }
          return json(oopsResult, 500)
        }
      }
      if (req.method === "POST" && path === "/api/react") {
        try {
          const { persona, imageB64, mediaType, pageUrl } = await req.json()
          if (!persona || !imageB64) return json({ error: "persona and imageB64 required" }, 400)
          if (String(imageB64).length > AI_DEMO_MAX_IMG_B64) return json({ error: "Image too large." }, 413)
          const meRx = (await sessionEmail(req)) || (await bearerEmail(req))
          if (aiDemoLimited(meRx, req, server)) return json({ error: "Too many requests. Please wait and try again." }, 429, { "Retry-After": "3600" })
          // A01/IDOR: persona.id is attacker-supplied. Resolve the caller's project and only treat the
          // id as a real Sim when it belongs to that project — otherwise it's an EPHEMERAL persona
          // (simId=null) so no cross-tenant trait/citation lookup happens. The AI call still proceeds.
          const projRx = meRx ? await resolveProject(meRx, url.searchParams.get("project")) : null
          const rawSimId = persona?.id ? String(persona.id) : null
          const simId = rawSimId && projRx && (await listPersonas(projRx.id)).some((p) => p.id === rawSimId) ? rawSimId : null

          // Build regression-gated recurrence memory for this Sim's traits before calling reactToPage.
          // Only attach recurrenceMemory when regressed=true; mere recurrence does not warrant disappointment.
          let personaWithMemory = persona
          // Built ONCE per Sim and reused for every reaction's resolveCitations (avoids the N+1).
          let citePre: { traits: Trait[]; eventsByTrait: Map<string, TraitEventRow[]> } | undefined
          if (simId) {
            try {
              const allSimEvents: TraitEventRow[] = await listTraitEvents(simId, projRx ? { projectId: projRx.id } : {})
              const eventsByTrait = new Map<string, TraitEventRow[]>()
              for (const e of allSimEvents) {
                const arr = eventsByTrait.get(e.traitId) ?? []
                arr.push(e)
                eventsByTrait.set(e.traitId, arr)
              }
              citePre = { traits: await listTraits(simId, projRx ? { projectId: projRx.id } : {}), eventsByTrait }
              const insights = Array.isArray(persona.insights) ? persona.insights : []
              const insightsWithMemory = insights.map((ins: any) => {
                const traitId = ins.traitId
                if (!traitId) return ins
                const evts = eventsByTrait.get(traitId) ?? []
                const rec = recurrenceFromEvents(evts)
                if (!rec.regressed) return ins
                return {
                  ...ins,
                  recurrenceMemory: {
                    regressed: true,
                    firstRaised: rec.firstRaised,
                    lastRaised: rec.lastRaised,
                    priorResolvedAt: rec.priorResolvedAt,
                    timesRaised: rec.timesRaised,
                  },
                }
              })
              personaWithMemory = { ...persona, insights: insightsWithMemory }
            } catch {
              // Non-fatal: if DB unavailable fall back to plain persona.
            }
          }

          const { data, usage } = await reactToPage(personaWithMemory, imageB64, mediaType || "image/png", pageUrl || "", { email: meRx })
          const reactions = data.reactions || []
          // Resolve each reaction's citedTraitIds → {quote, speaker, sourceDate, transcriptId, recurrence} so the
          // studio review→feedback path can carry citations forward.
          for (const r of reactions) {
            const cited = await resolveCitations(simId, r?.citedTraitIds, projRx?.id, citePre)
            r.citation = cited.citedTraitIds.length
              ? { citedTraitIds: cited.citedTraitIds, sourceQuote: cited.sourceQuote, speaker: cited.speaker, sourceTranscriptId: cited.sourceTranscriptId, sourceDate: cited.sourceDate, recurrence: cited.recurrence }
              : null
          }
          return json({ reactions, usage })
        } catch (e: any) { return json(oops(e, "react"), 500) }
      }
      return json({ error: "Not found" }, 404)
    }

    return new Response("Not found", { status: 404 })
}

Bun.serve({
  port: PORT,
  idleTimeout: 180,
  async fetch(req, server) {
    // Establish per-request context (for F5 token-project binding) and apply security headers to every
    // response from a single chokepoint.
    return reqCtx.run({}, async () => withWidgetCors(req, withSecurityHeaders(await handle(req, server))))
  },
})

console.log(`\n⚡ Klavity app → ${BASE}`)
console.log(`   model: ${MODEL} · auth: ${db ? "Turso OTP" : "DISABLED (no Turso)"} · dev-otp: ${DEV_SHOW_OTP}\n`)

// C1: data-retention TTL sweep. Run once shortly after boot, then every 6h. GUARDED so it never fires
// under tests (NODE_ENV==='test', which spawned-server tests inherit) — keeps the suite deterministic
// and stops the interval from holding the test process open.
if (db && process.env.NODE_ENV !== "test") {
  setTimeout(() => { runRetentionSweep().catch((e) => console.warn("retention sweep failed:", e?.message || e)) }, 30_000)
  setInterval(() => { runRetentionSweep().catch((e) => console.warn("retention sweep failed:", e?.message || e)) }, 6 * 60 * 60 * 1000)
  // KLA-88: trail cron scheduler — ticks every minute, fires scheduled walks.
  startTrailScheduler()
  // KLA-55: crash reaper — sweeps stale-heartbeat walks/sessions every 60s.
  startCrashReaper(db!)
  // KLAVITYKLA-261: daily Sims digest — ticks every hour, sends per-project digest.
  startSimsDigestScheduler({ db: db!, sendEmail: sendReportAlertEmail })
  // KLAVITYKLA-330: lead nurture scheduler — ticks every hour, sends steps 2 + 3.
  startLeadNurtureScheduler({
    db: db!,
    sendEmail: (to, subject, html, text) => sendReportAlertEmail([to], subject, html, text),
    baseUrl: BASE,
  })
}
