// Turso / libSQL access: users, email-OTP login, sessions, accounts, projects, memberships.
import { createClient, type Client } from "@libsql/client"
import { insightsFromTraits, type Trait, type TraitKind, type TraitStatus, type TraitEventRow } from "./provenance"
import { encryptSecret, sha256hex } from "./crypto"
import type { SanitizedAttr } from "./attr"

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
export let db: Client | null = url ? createClient({ url, authToken }) : null

const accountAttributionColumns: Array<[string, string]> = [
  ["first_source", "TEXT"],
  ["first_medium", "TEXT"],
  ["first_campaign", "TEXT"],
  ["first_referrer", "TEXT"],
  ["anon_id", "TEXT"],
]

const accountBillingColumns: Array<[string, string]> = [
  ["stripe_customer_id", "TEXT"],
  ["stripe_subscription_id", "TEXT"],
  ["billing_status", "TEXT"],
  ["billing_interval", "TEXT"],
  ["billing_current_period_end", "INTEGER"],
  ["billing_cancel_at_period_end", "INTEGER NOT NULL DEFAULT 0"],
  ["billing_updated_at", "INTEGER"],
]

// Test-only: re-point the shared client at a specific DB file. All test files run in ONE
// Bun process with a shared module registry, so `db` is created exactly once at first import
// (capturing whichever file imported it first). Without this, every DB-backed test file would
// collide on that single DB. Each test file calls reconnectDb(its own file:) in a beforeAll so
// its tests run against an isolated database. Never called in production.
export function reconnectDb(dbUrl: string, token?: string): Client {
  db = createClient({ url: dbUrl, authToken: token })
  void tuneFileDb(db, dbUrl)
  return db
}

// For file:-backed libSQL (tests, local), make concurrent writers WAIT on the write lock instead
// of throwing `SQLITE_BUSY: database is locked`, and use WAL so readers never block writers. The
// test harness has a spawned server AND the test's rawClient writing the SAME file concurrently;
// under CI contention SQLite returns BUSY without this. No-op on remote Turso (libsql:// / https://).
export async function tuneFileDb(c: Client, dbUrl?: string | null): Promise<void> {
  if (!dbUrl || !dbUrl.startsWith("file:")) return
  await c.execute("PRAGMA journal_mode=WAL").catch(() => {})
  await c.execute("PRAGMA busy_timeout=5000").catch(() => {})
}

export async function initDb() {
  if (!db) { console.warn("⚠  No TURSO_DATABASE_URL — login is disabled."); return }
  await tuneFileDb(db, url)
  await applySchema(db)
  await migrateV2(db)
  // additive (idempotent): accounts.domain — added after the P2 migration, so existing prod
  // accounts need it ALTERed in; fresh DBs already have it from the accounts CREATE above.
  if (!(await columnExists(db, "accounts", "domain"))) {
    await db.execute("ALTER TABLE accounts ADD COLUMN domain TEXT").catch((e) => console.warn("accounts.domain ALTER skipped:", e?.message || e))
  }
  // Batch-check these 3 additive columns before ALTERing (avoids 3 round-trips on established DBs).
  const _initCols = await loadTableColumns(db, ["projects", "accounts", "test_accounts"])
  if (!_initCols.get("projects")?.has("modal_config_json"))
    await db!.execute("ALTER TABLE projects ADD COLUMN modal_config_json TEXT DEFAULT '{}'").catch((e: any) => console.warn("projects.modal_config_json ALTER skipped:", e?.message || e))
  if (!_initCols.get("projects")?.has("autosim_auth_status"))
    await db!.execute("ALTER TABLE projects ADD COLUMN autosim_auth_status TEXT NOT NULL DEFAULT 'unregistered'").catch((e: any) => console.warn("projects.autosim_auth_status ALTER skipped:", e?.message || e))
  if (!_initCols.get("accounts")?.has("plan"))
    await db!.execute("ALTER TABLE accounts ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'").catch((e: any) => console.warn("accounts.plan ALTER skipped:", e?.message || e))
  // KLA-297: explicit onboarding-completed flag (ms epoch). Replaces inferring "has been through
  // setup" from the OPTIONAL accounts.domain field.
  if (!_initCols.get("accounts")?.has("onboarded_at"))
    await db!.execute("ALTER TABLE accounts ADD COLUMN onboarded_at INTEGER").catch((e: any) => console.warn("accounts.onboarded_at ALTER skipped:", e?.message || e))
  for (const [col, def] of accountBillingColumns) {
    if (!_initCols.get("accounts")?.has(col))
      await db!.execute(`ALTER TABLE accounts ADD COLUMN ${col} ${def}`).catch((e: any) => console.warn(`accounts.${col} ALTER skipped:`, e?.message || e))
  }
  for (const [col, def] of accountAttributionColumns) {
    if (!_initCols.get("accounts")?.has(col))
      await db!.execute(`ALTER TABLE accounts ADD COLUMN ${col} ${def}`).catch((e: any) => console.warn(`accounts.${col} ALTER skipped:`, e?.message || e))
  }
  // KLA-103: add auth_shape to test_accounts for OTP/passwordless support (existing rows get default 'password').
  if (!_initCols.get("test_accounts")?.has("auth_shape"))
    await db!.execute("ALTER TABLE test_accounts ADD COLUMN auth_shape TEXT NOT NULL DEFAULT 'password'").catch((e: any) => console.warn("test_accounts.auth_shape ALTER skipped:", e?.message || e))
  await migrateConnectorsPlane(db)
  await migrateConnectorsPlanePersonal(db)
  await backfillTriageV1(db)
  await backfillTrailStatus(db)
  await backfillOnboardedAt(db)
  await sweepOrphanedWalks(db)
  await sweepOrphanedAuthorSessions(db)
  console.log("✓ Turso connected, schema ready")
}

// applySchema + migrateV2 take an explicit client so they can run against a LOCAL libsql
// file (file:…) or :memory: DB in tests — no production Turso needed for migration verification.
export async function applySchema(c: Client) {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS login_otps (email TEXT NOT NULL, code TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS memberships (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(workspace_id, email))`,
    `CREATE TABLE IF NOT EXISTS integrations (
       scope TEXT NOT NULL,            -- 'workspace' | 'user'
       owner_id TEXT NOT NULL,         -- workspace_id or email
       integration TEXT NOT NULL,      -- 'plane' | 'jira' | ...
       config_json TEXT NOT NULL,      -- non-secret fields + encrypted token
       updated_at INTEGER NOT NULL,
       PRIMARY KEY (scope, owner_id)
     )`,
    // CANONICAL personas shape (§2.2, project-scoped). This is the single source of truth.
    // On a FRESH install this creates the project-scoped table directly (no workspace_id), so
    // migrateV2's rename guard (columnExists personas.workspace_id) is FALSE → no junk personas_v1.
    // On an EXISTING prod DB the live workspace_id-shaped `personas` already exists, so this
    // CREATE … IF NOT EXISTS no-ops and migrateV2 renames it to personas_v1, then re-creates this shape.
    `CREATE TABLE IF NOT EXISTS personas (
       id TEXT PRIMARY KEY,             -- sim_<uuid>
       project_id TEXT NOT NULL,
       source_transcript_id TEXT,
       name TEXT NOT NULL,
       role TEXT,
       type TEXT NOT NULL DEFAULT 'client',
       initials TEXT,
       accent TEXT,
       summary TEXT,
       insights_json TEXT,
       avatar TEXT,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    // NOTE: persona_proj_idx is created in migrateV2 (after any v1→personas_v1 rename), not here:
    // on an EXISTING prod DB this CREATE TABLE no-ops over the live workspace_id-shaped `personas`,
    // so a project_id index here would fail until migrateV2 swaps in the canonical table.

    // ── Sims-dashboard P0 (additive): durable ledger for screenshots + feedback + activity feed ──
    // Rows carry a denormalized project_id string ('proj_'+workspaceId); no FK, projects table lands in P2.
    `CREATE TABLE IF NOT EXISTS screenshots (
       id TEXT PRIMARY KEY,
       project_id TEXT,
       s3_key TEXT NOT NULL,
       bucket TEXT NOT NULL,
       content_type TEXT NOT NULL,
       acl TEXT NOT NULL DEFAULT 'private',
       bytes INTEGER,
       owner_email TEXT,
       expires_at INTEGER,
       created_at INTEGER NOT NULL
     )`,
    `CREATE TABLE IF NOT EXISTS feedback (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       sim_id TEXT,
       actor_email TEXT,
       url_host TEXT,
       url_path TEXT,
       observation TEXT,
       sentiment TEXT,
       severity TEXT,
       screenshot_id TEXT,
       suggested_bug_json TEXT,
       cited_trait_ids_json TEXT,
       source_quote TEXT,
       source_transcript_id TEXT,
       source_date INTEGER,
       plane_issue_key TEXT,
       plane_issue_url TEXT,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS fb_proj_idx ON feedback (project_id, created_at)`,
    `CREATE INDEX IF NOT EXISTS fb_sim_idx ON feedback (sim_id, created_at)`,
    // Partial index for the "Tickets filed" count — only rows that reached the tracker, so the
    // dashboardCounts tickets COUNT is an index range-scan over a small subset, not the full table.
    `CREATE INDEX IF NOT EXISTS fb_proj_plane_idx ON feedback (project_id) WHERE plane_issue_key IS NOT NULL`,
    `CREATE TABLE IF NOT EXISTS activity_events (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       type TEXT NOT NULL,
       actor_email TEXT,
       sim_id TEXT,
       url_host TEXT,
       url_path TEXT,
       feedback_id TEXT,
       screenshot_id TEXT,
       meta_json TEXT,
       created_at INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS evt_proj_idx ON activity_events (project_id, created_at)`,
    `CREATE INDEX IF NOT EXISTS evt_actor_idx ON activity_events (project_id, actor_email, created_at)`,
    // GTM funnel — KLAVITYKLA-327: check_started → check_completed → lead_captured → app_connected → continuous_enabled
    `CREATE TABLE IF NOT EXISTS funnel_events (
       id TEXT PRIMARY KEY,
       event TEXT NOT NULL,
       anon_id TEXT,
       email TEXT,
       account_id TEXT,
       source TEXT,
       medium TEXT,
       campaign TEXT,
       referrer TEXT,
       url TEXT,
       props_json TEXT,
       created_at INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS fe_event_idx ON funnel_events (event, created_at)`,
    `CREATE INDEX IF NOT EXISTS fe_anon_idx ON funnel_events (anon_id)`,
    `CREATE INDEX IF NOT EXISTS fe_email_idx ON funnel_events (email)`,
    `CREATE TABLE IF NOT EXISTS ticket_comments (
       id TEXT PRIMARY KEY,
       feedback_id TEXT NOT NULL,
       author TEXT,
       body TEXT NOT NULL,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS ticket_comments_feedback_idx ON ticket_comments (feedback_id, created_at)`,
    // ── A.8 occurrence receipts (additive): each deduped repeat-report keeps its OWN verbatim
    // description, screenshot, and date instead of being discarded on the dedup counter-bump.
    // Attached to the cluster head feedback row (feedback_id). Powers the per-ticket occurrence
    // timeline ("Jun 10: 'checkout button does nothing' · Jul 3: 'STILL can't check out'").
    `CREATE TABLE IF NOT EXISTS feedback_occurrences (
       id TEXT PRIMARY KEY,
       feedback_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       seen_at INTEGER NOT NULL,
       observation TEXT,
       screenshot_id TEXT,
       source_quote TEXT,
       reporter_email TEXT,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS feedback_occ_idx ON feedback_occurrences (feedback_id, seen_at)`,
    // ── A.10 dedup override memory (additive): records human merge/split decisions so intake
    // dedup honours the operator instead of re-collapsing (or re-splitting) a pair automatically.
    // A "split" row records that feedback a and feedback b are DISTINCT issues (never re-merge);
    // stored order-independently by consulting both (a,b) and (b,a) at intake. Best-effort — a
    // missing/failed row degrades to the pre-A.10 automatic behaviour, never blocks intake.
    `CREATE TABLE IF NOT EXISTS dedup_exclusions (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       feedback_a TEXT NOT NULL,
       feedback_b TEXT NOT NULL,
       reason TEXT,
       created_by TEXT,
       created_at INTEGER NOT NULL,
       UNIQUE(project_id, feedback_a, feedback_b)
     )`,
    `CREATE INDEX IF NOT EXISTS dedup_excl_idx ON dedup_exclusions (project_id)`,
    `CREATE TABLE IF NOT EXISTS ticket_assignment_invites (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       email TEXT NOT NULL,
       invited_by TEXT,
       feedback_id TEXT,
       status TEXT NOT NULL DEFAULT 'pending',
       created_at INTEGER NOT NULL,
       last_sent_at INTEGER,
       accepted_at INTEGER,
       UNIQUE(project_id, email)
     )`,
    `CREATE INDEX IF NOT EXISTS ticket_assignment_invites_email_idx ON ticket_assignment_invites (email, status)`,
    `CREATE INDEX IF NOT EXISTS ticket_assignment_invites_project_idx ON ticket_assignment_invites (project_id, status)`,

    // ── Sims-dashboard P2 (additive): company → projects → Sims model. ──
    // schema_meta gates the one-time, idempotent v2 migration (see migrateV2).
    `CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`,
    // COMPANY (was workspaces; accounts.id REUSES old workspace id — no re-login, no integrations rewrite).
    `CREATE TABLE IF NOT EXISTS accounts (
       id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT NOT NULL, domain TEXT,
       plan TEXT NOT NULL DEFAULT 'free',
       stripe_customer_id TEXT,
       stripe_subscription_id TEXT,
       billing_status TEXT,
       billing_interval TEXT,
       billing_current_period_end INTEGER,
       billing_cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
       billing_updated_at INTEGER,
       created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS account_members (
       id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL,
       account_role TEXT NOT NULL,           -- 'owner' | 'admin' | 'member'
       created_at INTEGER NOT NULL, UNIQUE(account_id, email))`,
    `CREATE INDEX IF NOT EXISTS acct_mem_email_idx ON account_members (email)`,
    // PROJECTS — first project id is DETERMINISTIC: 'proj_'||account_id (no event backfill).
    `CREATE TABLE IF NOT EXISTS projects (
       id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL,
       status TEXT NOT NULL DEFAULT 'active',
       url_patterns_json TEXT,
       review_mode TEXT NOT NULL DEFAULT 'auto',
       review_budget_daily INTEGER DEFAULT 200,
       observability_mode TEXT NOT NULL DEFAULT 'named',
       autosim_auth_status TEXT NOT NULL DEFAULT 'unregistered',
       billing_plan TEXT NOT NULL DEFAULT 'free',
       billing_status TEXT,
       billing_updated_at INTEGER,
       created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS project_acct_idx ON projects (account_id, created_at)`,
    `CREATE TABLE IF NOT EXISTS project_members (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL,
       project_role TEXT NOT NULL,           -- 'admin' | 'member'
       invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`,
    `CREATE INDEX IF NOT EXISTS proj_mem_email_idx ON project_members (email)`,

    // ── Sims-dashboard P3a (additive): provenance — transcripts + normalized sim_traits + append-only audit. ──
    // No live/consent/extension surface here (that is P3b). project_id is the canonical 'proj_'+account id.
    // TRANSCRIPTS — now persisted; source_date drives "(Sarah, 2026-06-12)" citations.
    `CREATE TABLE IF NOT EXISTS transcripts (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT, raw_text TEXT NOT NULL,
       source_date INTEGER NOT NULL, speakers_json TEXT, added_by TEXT NOT NULL, created_at INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS transcript_proj_idx ON transcripts (project_id, source_date)`,
    // SIM TRAITS — normalized insight w/ provenance (trait_id is the STABLE citation key).
    `CREATE TABLE IF NOT EXISTS sim_traits (
       id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL,
       kind TEXT NOT NULL,                    -- 'pain'|'want'|'love'
       text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', -- active|superseded|contradicted
       strength INTEGER NOT NULL DEFAULT 1,
       src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER,
       src_speaker TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS trait_sim_idx ON sim_traits (sim_id, status)`,
    // TRAIT EVENTS — append-only audit: which transcript changed which trait.
    `CREATE TABLE IF NOT EXISTS trait_events (
       id TEXT PRIMARY KEY, trait_id TEXT NOT NULL, sim_id TEXT NOT NULL, transcript_id TEXT NOT NULL,
       op TEXT NOT NULL,                      -- create|reinforce|refine|contradict|supersede
       before_text TEXT, after_text TEXT, quote TEXT NOT NULL, quote_offset INTEGER,
       speaker TEXT, source_date INTEGER NOT NULL, reason TEXT, created_at INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS trait_evt_idx ON trait_events (trait_id, created_at)`,
    // RECONCILE RUNS — cost-guard cache: skip re-running reconcile for a (sim,transcript) pair (§5).
    `CREATE TABLE IF NOT EXISTS reconcile_runs (
       sim_id TEXT NOT NULL, transcript_id TEXT NOT NULL, created_at INTEGER NOT NULL,
       PRIMARY KEY (sim_id, transcript_id))`,

    // ── Sims-dashboard P3b (additive): live URL activation surface (§2.2). ──
    // MONITORED URLS — allowlist of url patterns (prefix/glob only, NO regex) where Sims may auto-comment.
    `CREATE TABLE IF NOT EXISTS monitored_urls (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, url_pattern TEXT NOT NULL,
       enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL,
       UNIQUE(project_id, url_pattern))`,
    `CREATE INDEX IF NOT EXISTS mon_url_proj_idx ON monitored_urls (project_id)`,
    // MONITORING CONSENT — per-member-per-project consent before first capture (privacy, binding §5).
    `CREATE TABLE IF NOT EXISTS monitoring_consent (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL,
       status TEXT NOT NULL,                  -- 'granted' | 'paused' | 'revoked'
       granted_at INTEGER, updated_at INTEGER NOT NULL, UNIQUE(project_id, email))`,
    // REVIEW COUNTS — per-project-per-day atomic budget counter (the cost-cap spine, §5).
    `CREATE TABLE IF NOT EXISTS review_counts (
       project_id TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (project_id, day))`,
    // EXTENSION TOKENS — dedicated narrow-scope Bearer (R5 security pre-req): bound to email (+optional
    // project), replaces reusing the raw session id. resolveBearer accepts these alongside sessions.
    `CREATE TABLE IF NOT EXISTS extension_tokens (
       token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT,
       created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`,
    `CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens (email)`,
    // AI-CALL LEDGER — one row per OpenRouter call for the /opsadmin credit dashboard. Additive,
    // idempotent. cost_usd comes from OpenRouter's usage.cost (real credit $); null if absent.
    `CREATE TABLE IF NOT EXISTS ai_calls (
       id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, type TEXT NOT NULL, model TEXT NOT NULL,
       account_id TEXT, feature TEXT,
       actor_email TEXT, project_id TEXT, input_tokens INTEGER, output_tokens INTEGER,
       cost_usd REAL, ok INTEGER NOT NULL DEFAULT 1)`,
    `CREATE INDEX IF NOT EXISTS ai_calls_created_idx ON ai_calls (created_at)`,
    `CREATE INDEX IF NOT EXISTS ai_calls_proj_idx ON ai_calls (project_id, created_at)`,
    `CREATE INDEX IF NOT EXISTS ai_calls_type_idx ON ai_calls (type, created_at)`,
    // TEST-OTP AUDIT (KLAVITYKLA-304) — one row per accepted test-OTP bypass login, so the
    // /opsadmin Test-OTP panel can show recent bypass logins without grepping server logs. The
    // [TEST-OTP-USED] console.warn is kept alongside this table.
    `CREATE TABLE IF NOT EXISTS test_otp_uses (
       id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, email TEXT NOT NULL,
       via TEXT NOT NULL, ip TEXT)`,
    `CREATE INDEX IF NOT EXISTS test_otp_uses_created_idx ON test_otp_uses (created_at)`,
    // DAILY AI SPEND — ATOMIC global daily-spend reservation ledger (cost-cap race fix, FIX A). One row
    // per UTC day ('YYYY-MM-DD'). reserved_usd is incremented BEFORE each LLM call via an atomic
    // conditional upsert (tryReserveDailySpend) and reconciled to the real cost after (reconcileDailySpend).
    // Distinct from ai_calls (the after-the-fact audit ledger): this is the pre-flight cap gate.
    `CREATE TABLE IF NOT EXISTS daily_ai_spend (
       day TEXT PRIMARY KEY, reserved_usd REAL NOT NULL DEFAULT 0)`,
    // FREE-TOOL DAILY SUB-CAP (KLAVITYKLA-341) — a bounded slice of the global daily_ai_spend cap
    // reserved exclusively for the anonymous free-tool AI calls (CRO + bug-check). A viral Reddit
    // post hitting the free tool can never starve paid Sims/AutoSims of the shared OPS_DAILY_CAP_USD
    // budget: this sub-cap gates BEFORE the global reservation, using its own tiny slice of budget
    // (KLAV_FREETOOL_DAILY_CAP_USD). Same atomic reserve/reconcile shape as daily_ai_spend, just a
    // separate row keyed by day so the two caps never contend on the same UPDATE.
    `CREATE TABLE IF NOT EXISTS daily_freetool_spend (
       day TEXT PRIMARY KEY, reserved_usd REAL NOT NULL DEFAULT 0)`,
    // PER-TENANT AI BUDGET OVERRIDES (KLAVITYKLA-314) — optional per-account override of the default
    // daily AI budget that lives UNDER the global OPS_DAILY_CAP_USD. One row per account that has a
    // custom budget; accounts WITHOUT a row fall back to the env default (KLAV_TENANT_DAILY_BUDGET_USD).
    // A tenant's spend-in-window is computed from ai_calls (SUM cost_usd for today), so no per-tenant
    // reservation ledger is needed here — this table only holds the (rare) explicit override.
    `CREATE TABLE IF NOT EXISTS tenant_ai_budgets (
       account_id TEXT PRIMARY KEY, daily_budget_usd REAL NOT NULL, updated_at INTEGER NOT NULL)`,
    // USAGE METERS (KLAVITYKLA-305) — billable value-metric counters. MEASUREMENT ONLY: this ledger
    // COUNTS the billable events (meter = Sims + guarded AutoSim flows) per account, per billing
    // period (UTC month 'YYYY-MM'), per metric type (e.g. 'sim_review', 'autosim_walk'). It never
    // enforces, blocks, or charges — quota checks / Stripe live in KLA-306/307. One row per
    // (account_id, project_id, period, metric); `count` is incremented atomically via upsert by the
    // fire-and-forget incrementUsageMeter helper so a meter write NEVER blocks the metered action.
    // project_id is stored ('' when unknown) so we can report per-project usage without a join.
    `CREATE TABLE IF NOT EXISTS usage_meters (
       account_id TEXT NOT NULL, project_id TEXT NOT NULL DEFAULT '',
       period TEXT NOT NULL, metric TEXT NOT NULL,
       count INTEGER NOT NULL DEFAULT 0,
       first_at INTEGER NOT NULL, last_at INTEGER NOT NULL,
       PRIMARY KEY (account_id, project_id, period, metric))`,
    `CREATE INDEX IF NOT EXISTS usage_meters_acct_period_idx ON usage_meters (account_id, period)`,
    `CREATE INDEX IF NOT EXISTS usage_meters_metric_idx ON usage_meters (metric, period)`,
    `CREATE TABLE IF NOT EXISTS error_tickets (
       signature TEXT PRIMARY KEY,
       ticket_key TEXT,
       ticket_url TEXT,
       count INTEGER NOT NULL DEFAULT 1,
       first_seen INTEGER NOT NULL,
       last_seen INTEGER NOT NULL
     )`,

    // ── Cloud tickets + connectors (Task 1, additive). ──
    // CONNECTORS — per-project external destinations (webhook/plane/github/jira/linear).
    // config stores secret fields encrypted (callers encrypt before create/update).
    `CREATE TABLE IF NOT EXISTS connectors (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL,
       config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0,
       enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT )`,
    `CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`,
    // TICKET EXPORTS — one row per copy-to-external action.
    `CREATE TABLE IF NOT EXISTS ticket_exports (
       id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL,
       type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL,
       error TEXT, created_at INTEGER NOT NULL, created_by TEXT )`,
    `CREATE INDEX IF NOT EXISTS idx_texports_feedback ON ticket_exports(feedback_id)`,
    `CREATE INDEX IF NOT EXISTS idx_texports_project ON ticket_exports(project_id)`,
    // PERSONA EDITS — append-only audit of human persona identity edits (Sim Studio). One row per
    // changed field per PUT, tagged with the actor email.
    `CREATE TABLE IF NOT EXISTS persona_edits (
       id TEXT PRIMARY KEY, persona_id TEXT NOT NULL, project_id TEXT NOT NULL,
       field TEXT NOT NULL, before_val TEXT, after_val TEXT, actor TEXT NOT NULL, created_at INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS persona_edits_idx ON persona_edits (persona_id, created_at)`,
    // ── Klavity OS "Trails" (test automation): authored flows, steps, locator cache, walks, run-steps, findings ──
    `CREATE TABLE IF NOT EXISTS trails (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       name TEXT NOT NULL,
       intent TEXT NOT NULL DEFAULT '',
       base_url TEXT NOT NULL,
       viewport_json TEXT,
       baseline_ref TEXT,
       author_kind TEXT NOT NULL DEFAULT 'human',
       status TEXT NOT NULL DEFAULT 'draft',
       created_by TEXT,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL,
       objective_verified INTEGER
     )`,
    `CREATE INDEX IF NOT EXISTS trail_proj_idx ON trails(project_id, status)`,
    `CREATE TABLE IF NOT EXISTS trail_steps (
       id TEXT PRIMARY KEY,
       trail_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       idx INTEGER NOT NULL,
       action TEXT NOT NULL,
       action_value TEXT,
       target_json TEXT,
       checkpoint_json TEXT,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS tstep_trail_idx ON trail_steps(trail_id, idx)`,
    // ── KLA-106: Trail Modules — named reusable step-groups ──
    `CREATE TABLE IF NOT EXISTS trail_modules (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       name TEXT NOT NULL,
       description TEXT NOT NULL DEFAULT '',
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS tmod_proj_idx ON trail_modules(project_id)`,
    `CREATE TABLE IF NOT EXISTS trail_module_steps (
       id TEXT PRIMARY KEY,
       module_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       idx INTEGER NOT NULL,
       action TEXT NOT NULL,
       action_value TEXT,
       target_json TEXT,
       checkpoint_json TEXT,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS tmodstep_mod_idx ON trail_module_steps(module_id, idx)`,
    `CREATE TABLE IF NOT EXISTS locator_cache (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       trail_id TEXT NOT NULL,
       step_id TEXT NOT NULL,
       cache_key TEXT NOT NULL,
       resolved_selector TEXT NOT NULL,
       fingerprint_json TEXT,
       confidence REAL NOT NULL DEFAULT 1.0,
       source TEXT NOT NULL DEFAULT 'crystallize',
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    // Per-step identity: one cache row per (project, step). cache_key is a stored page-state
    // fingerprint column but NOT the uniqueness key (removes Layer B's salt hack). Greenfield table,
    // no prod data — changing the CREATE INDEX is sufficient (additive/idempotent).
    `CREATE UNIQUE INDEX IF NOT EXISTS lc_key_uq ON locator_cache(project_id, step_id)`,
    `CREATE TABLE IF NOT EXISTS trail_runs (
       id TEXT PRIMARY KEY,
       trail_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       trigger TEXT NOT NULL DEFAULT 'manual',
       status TEXT NOT NULL DEFAULT 'running',
       llm_calls INTEGER NOT NULL DEFAULT 0,
       summary_json TEXT,
       started_at INTEGER NOT NULL,
       finished_at INTEGER,
       paused_secret_key TEXT
     )`,
    `CREATE INDEX IF NOT EXISTS walk_trail_idx ON trail_runs(trail_id, started_at)`,
    `CREATE TABLE IF NOT EXISTS run_steps (
       id TEXT PRIMARY KEY,
       run_id TEXT NOT NULL,
       trail_id TEXT NOT NULL,
       step_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       idx INTEGER NOT NULL,
       tier TEXT NOT NULL DEFAULT 'none',
       verdict TEXT NOT NULL DEFAULT 'skip',
       confidence REAL NOT NULL DEFAULT 0,
       diagnosis TEXT,
       healed INTEGER NOT NULL DEFAULT 0,
       evidence_json TEXT,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS rstep_run_idx ON run_steps(run_id, idx)`,
    `CREATE TABLE IF NOT EXISTS findings (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       run_id TEXT NOT NULL,
       step_id TEXT,
       trail_id TEXT NOT NULL,
       kind TEXT NOT NULL,
       title TEXT NOT NULL,
       evidence_json TEXT,
       ground_quote TEXT,
       confidence REAL NOT NULL DEFAULT 0,
       dedup_key TEXT NOT NULL,
       recurrence INTEGER NOT NULL DEFAULT 1,
       status TEXT NOT NULL DEFAULT 'queued',
       connector_ref TEXT,
       connector_error TEXT,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS finding_dedup_idx ON findings(project_id, dedup_key)`,
    // ── Klavity OS Trails (Plan E2): walk_replays — gzipped rrweb session-replay segments per Walk. ──
    // segments_gz is base64(gzip(JSON.stringify(ReplaySegment[]))); one row per saved replay (opt-in
    // capture). Project-scoped; the route reads the latest row for a (project_id, run_id).
    `CREATE TABLE IF NOT EXISTS walk_replays (
       id TEXT PRIMARY KEY,
       run_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       segments_gz TEXT NOT NULL,
       n_segments INTEGER,
       n_events INTEGER,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS walk_replay_run_idx ON walk_replays(project_id, run_id)`,
    // ── AutoSims F1: named per-project Test Accounts. password_enc is AES-GCM via lib/crypto.ts
    //    (KLAV_SECRET envelope key). The plaintext secret is NEVER stored or returned by any API.
    //    KLA-103: auth_shape ('password'|'otp') allows OTP/passwordless accounts; password_enc is
    //    empty string for OTP accounts (no secret to store). ──
    `CREATE TABLE IF NOT EXISTS test_accounts (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL,
       login_email TEXT NOT NULL, password_enc TEXT NOT NULL,
       auth_shape TEXT NOT NULL DEFAULT 'password',
       created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
       UNIQUE(project_id, name))`,
    `CREATE INDEX IF NOT EXISTS test_acc_proj_idx ON test_accounts (project_id)`,
    // ── AutoSim auth setup (AT3): short-lived write-only setup token + encrypted login config. ──
    `CREATE TABLE IF NOT EXISTS autosim_auth_setup_tokens (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       token_hash TEXT NOT NULL UNIQUE,
       created_by TEXT,
       created_at INTEGER NOT NULL,
       expires_at INTEGER NOT NULL,
       revoked_at INTEGER,
       used_at INTEGER
     )`,
    `CREATE INDEX IF NOT EXISTS autosim_auth_setup_token_hash_idx ON autosim_auth_setup_tokens (token_hash)`,
    `CREATE INDEX IF NOT EXISTS autosim_auth_setup_project_idx ON autosim_auth_setup_tokens (project_id, expires_at)`,
    `CREATE TABLE IF NOT EXISTS autosim_auth_configs (
       project_id TEXT PRIMARY KEY,
       method TEXT NOT NULL,
       email TEXT NOT NULL,
       secret_enc TEXT NOT NULL,
       notes TEXT,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    `CREATE TABLE IF NOT EXISTS autosim_auth_probe_queue (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       method TEXT NOT NULL,
       email TEXT NOT NULL,
       status TEXT NOT NULL DEFAULT 'queued',
       error TEXT,
       resume_summary_json TEXT,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL,
       finished_at INTEGER
     )`,
    `CREATE INDEX IF NOT EXISTS autosim_auth_probe_project_idx ON autosim_auth_probe_queue (project_id, status, created_at)`,
    // ── G1 session replay: rrweb DOM-event recording attached to a bug report (free vs Marker's $149). ──
    // events_gz = base64(gzip(JSON.stringify(events))); trimmed=1 when the buffer was capped oldest-first.
    `CREATE TABLE IF NOT EXISTS feedback_replays (
       id TEXT PRIMARY KEY,
       feedback_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       events_gz TEXT NOT NULL,
       n_events INTEGER,
       bytes INTEGER,
       trimmed INTEGER NOT NULL DEFAULT 0,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS feedback_replay_idx ON feedback_replays(project_id, feedback_id)`,
    // ── Expectations spine (discover→enforce): unifies Snap/Sim/AutoSim findings into one issue identity. ──
    `CREATE TABLE IF NOT EXISTS expectations (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       title TEXT NOT NULL,
       area TEXT,
       url_path TEXT,
       status TEXT NOT NULL DEFAULT 'candidate',     -- candidate | validated | enforced | retired
       source_refs_json TEXT NOT NULL DEFAULT '[]',  -- [{kind:'snap'|'sim'|'finding', id}]
       corroboration_json TEXT NOT NULL DEFAULT '{}',-- {snap:bool, sim:bool, recurrence:int}
       dedup_key TEXT NOT NULL,
       enforced_step_id TEXT,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS exp_proj_status_idx ON expectations(project_id, status)`,
    `CREATE INDEX IF NOT EXISTS exp_proj_dedup_idx ON expectations(project_id, dedup_key)`,
    // ── KLA-251 (B.11): declined near-miss log — cross-source matching instrumentation. ──
    // Every candidate pair that scores in the near-miss BAND (below the 0.82 accept threshold but
    // above the noise floor) is recorded here so we can MEASURE how often the lexical threshold
    // under-matches Snap↔AutoSim pairs before deciding to build the embeddings upgrade. This is a
    // pure observability sink — no user-visible behavior depends on it and upsert never reads it back.
    `CREATE TABLE IF NOT EXISTS expectation_near_misses (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       cand_title TEXT NOT NULL,
       existing_id TEXT NOT NULL,
       existing_title TEXT NOT NULL,
       cand_kind TEXT,                 -- source kind of the incoming candidate ('snap'|'sim'|'autosim')
       existing_kinds_json TEXT,       -- source kinds already on the existing expectation, deduped
       score REAL NOT NULL,            -- lexical similarity of the declined pair (band.min..threshold)
       threshold REAL NOT NULL,        -- accept threshold in force when this pair was declined
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS exp_nearmiss_proj_idx ON expectation_near_misses(project_id, created_at)`,
    // ── widget heartbeat: one row per (project, host) recording the last time /widget.js loaded there.
    //    Powers the dashboard "Widget: active — last seen … on …" / "not detected yet" indicator. ──
    `CREATE TABLE IF NOT EXISTS widget_pings (
       project_id TEXT NOT NULL,
       host TEXT NOT NULL,
       first_seen INTEGER NOT NULL,
       last_seen INTEGER NOT NULL,
       hits INTEGER NOT NULL DEFAULT 1,
       PRIMARY KEY (project_id, host)
     )`,
    `CREATE INDEX IF NOT EXISTS widget_pings_proj_idx ON widget_pings(project_id, last_seen)`,
    // ── sim_runs: one row per on-demand Sim run (manual trigger from dashboard / extension).
    //    v1 runs are synchronous (screenshot comes from the browser, server runs and returns in one round-trip).
    //    status is always 'done' or 'error' by the time the HTTP response is returned.
    `CREATE TABLE IF NOT EXISTS sim_runs (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       url TEXT NOT NULL,
       status TEXT NOT NULL DEFAULT 'done',   -- done | error
       sim_ids_json TEXT,                      -- null = all project Sims at run time
       screenshot_id TEXT,
       reactions_json TEXT,                    -- full SimReview[] array as JSON
       label TEXT,
       error_msg TEXT,
       actor_email TEXT,
       created_at INTEGER NOT NULL,
       finished_at INTEGER,
       paused_secret_key TEXT
     )`,
    `CREATE INDEX IF NOT EXISTS sim_runs_proj_idx ON sim_runs(project_id, created_at DESC)`,
    // ── AutoSims F1: authoring sessions — one row per "New Trail" attempt; polled by the UI. ──
    `CREATE TABLE IF NOT EXISTS author_sessions (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, objective TEXT NOT NULL,
       base_url TEXT NOT NULL, test_account TEXT, status TEXT NOT NULL DEFAULT 'running',
       steps_json TEXT NOT NULL DEFAULT '[]', stall_reason TEXT, trail_id TEXT,
       verification_run_id TEXT, verification_verdict TEXT,
       llm_calls INTEGER NOT NULL DEFAULT 0, cost_usd REAL NOT NULL DEFAULT 0,
       created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
       objective_verified INTEGER, resumed_by TEXT)`,
    `CREATE INDEX IF NOT EXISTS author_sess_proj_idx ON author_sessions (project_id, created_at)`,
    // ── One-time guarded migrations (C1 etc.) use this table instead of schema_meta so the
    // migration namespace is separate from runtime KV. ──
    `CREATE TABLE IF NOT EXISTS schema_migrations (key TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)`,
    // ── Walk share tokens: unguessable expiring links that serve a walk PDF without login. ──
    // token_hash = sha256hex(rawToken); the raw 32-byte hex token is NEVER stored, only returned once.
    `CREATE TABLE IF NOT EXISTS walk_share_tokens (
       id TEXT PRIMARY KEY,
       token_hash TEXT NOT NULL UNIQUE,
       run_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       created_by TEXT,
       expires_at INTEGER NOT NULL,
       created_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS wst_token_hash_idx ON walk_share_tokens (token_hash)`,
    // ── KLA-174: Flat per-project ticket labels ──────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS labels (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       name TEXT NOT NULL,
       color TEXT NOT NULL DEFAULT '#6366f1',
       created_at INTEGER NOT NULL,
       UNIQUE(project_id, name)
     )`,
    `CREATE INDEX IF NOT EXISTS labels_proj_idx ON labels (project_id)`,
    `CREATE TABLE IF NOT EXISTS ticket_labels (
       label_id TEXT NOT NULL,
       feedback_id TEXT NOT NULL,
       created_at INTEGER NOT NULL,
       PRIMARY KEY (label_id, feedback_id)
     )`,
    `CREATE INDEX IF NOT EXISTS ticket_labels_feedback_idx ON ticket_labels (feedback_id)`,
    // ── KLA-255: needsConfirm queue — fuzzy/ambiguous persona→Sim match results that need human
    // confirmation before the transcript reconcile is applied. One row per persona extracted from
    // a transcript that matched fuzzily. status: 'pending' | 'confirmed' | 'rejected'.
    // candidates_json = JSON array of { simId, name, role }. On confirm, chosen_sim_id records
    // which candidate the human picked (used to trigger reconcile). No FK constraints (additive).
    `CREATE TABLE IF NOT EXISTS pending_sim_matches (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       transcript_id TEXT NOT NULL,
       persona_name TEXT NOT NULL,
       candidates_json TEXT NOT NULL,
       status TEXT NOT NULL DEFAULT 'pending',
       chosen_sim_id TEXT,
       resolved_by TEXT,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS psm_proj_status_idx ON pending_sim_matches (project_id, status, created_at)`,
    `CREATE INDEX IF NOT EXISTS psm_transcript_idx ON pending_sim_matches (transcript_id)`,
    // ── KLA-254: Scheduled Sim reviews — one row per per-project review schedule.
    // frequency: 'daily' | 'weekly' (v1 simple cadence — use cron for advanced scheduling).
    // target_url: the URL to screenshot + review on each tick.
    // sim_ids_json: JSON array of persona IDs to run, or NULL = all project Sims.
    // next_run_at: epoch ms of the next due tick; updated by the runner after each fire.
    // last_run_at: epoch ms of the last successful fire (NULL = never run).
    // enabled: 0 = paused, 1 = active.
    // created_by: email of the user who created the schedule.
    `CREATE TABLE IF NOT EXISTS sim_review_schedules (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       target_url TEXT NOT NULL,
       frequency TEXT NOT NULL DEFAULT 'daily',   -- daily | weekly
       sim_ids_json TEXT,                          -- NULL = all project Sims
       enabled INTEGER NOT NULL DEFAULT 1,
       next_run_at INTEGER NOT NULL,
       last_run_at INTEGER,
       created_by TEXT NOT NULL,
       created_at INTEGER NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS srs_proj_idx ON sim_review_schedules (project_id, enabled, next_run_at)`,
    `CREATE INDEX IF NOT EXISTS srs_due_idx ON sim_review_schedules (enabled, next_run_at)`,
    // KLAVITYKLA-330: lead nurture sequences — one row per (email, sequence) enrollment.
    // step = next scheduled step to send (2 or 3); NULL = sequence complete.
    // next_at = when to fire the next step (ms); NULL = done or unsubscribed.
    `CREATE TABLE IF NOT EXISTS lead_nurture_sequences (
       id TEXT PRIMARY KEY,
       email TEXT NOT NULL,
       sequence TEXT NOT NULL DEFAULT 'cro',
       step INTEGER,
       source TEXT,
       url TEXT,
       next_at INTEGER,
       enrolled_at INTEGER NOT NULL,
       completed_at INTEGER,
       unsubscribed_at INTEGER,
       UNIQUE(email, sequence))`,
    `CREATE INDEX IF NOT EXISTS lns_next_idx ON lead_nurture_sequences (next_at)`,
    `CREATE INDEX IF NOT EXISTS lns_email_idx ON lead_nurture_sequences (email)`,
    // KLAVITYKLA-330: one row per nurture email sent; sg_message_id enables open/click webhook tracking.
    `CREATE TABLE IF NOT EXISTS lead_nurture_emails (
       id TEXT PRIMARY KEY,
       sequence_id TEXT NOT NULL,
       step INTEGER NOT NULL,
       sg_message_id TEXT,
       sent_at INTEGER NOT NULL,
       opened_at INTEGER,
       clicked_at INTEGER)`,
    `CREATE INDEX IF NOT EXISTS lne_seq_idx ON lead_nurture_emails (sequence_id, step)`,
    `CREATE INDEX IF NOT EXISTS lne_sg_idx ON lead_nurture_emails (sg_message_id)`,
    // ── KLAVITYKLA-315: partner-code redemption ledger [JTBD 8.11]. One durable row per successful
    // partner/discount code redemption so redemptions are auditable and per-code caps can be
    // enforced/reported. Additive only — no FK constraints, no existing table touched.
    //   code          = the normalized (UPPERCASE) partner code that was redeemed.
    //   account_id    = the workspace/account the entitlement was applied to.
    //   redeemed_by   = email of the user who redeemed (NULL for legacy/system redemptions).
    //   granted_plan  = the plan/entitlement the code granted (e.g. 'partner').
    //   source        = where the redemption came from (e.g. 'api', 'admin', 'test').
    //   redeemed_at   = epoch ms of the redemption.
    `CREATE TABLE IF NOT EXISTS partner_code_redemptions (
       id TEXT PRIMARY KEY,
       code TEXT NOT NULL,
       account_id TEXT NOT NULL,
       redeemed_by TEXT,
       granted_plan TEXT NOT NULL,
       source TEXT NOT NULL DEFAULT 'api',
       redeemed_at INTEGER NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS pcr_code_idx ON partner_code_redemptions (code, redeemed_at)`,
    `CREATE INDEX IF NOT EXISTS pcr_account_idx ON partner_code_redemptions (account_id, redeemed_at)`,
  ]
  // Boot-time fix: run the whole static CREATE TABLE/INDEX block as ONE batched round-trip instead
  // of ~150 sequential `await c.execute(s)` calls. Against REMOTE Turso those 150 round-trips cost
  // ~25-30s of the ~34s boot (site 502s the whole time on every deploy). `stmts` is a pure static
  // array of `CREATE … IF NOT EXISTS` strings with NO bound args and NO runtime introspection, so
  // batching is order-preserving and side-effect-identical — the statements run in array order
  // inside one write transaction. Works on remote Turso AND file:/:memory: (tests) — sqlite3, http
  // and ws clients all implement Client.batch(stmts, mode). Conditional needCol/ALTER migrations
  // below are intentionally NOT batched (they depend on per-DB column introspection).
  await c.batch(stmts, "write")

  // ── Load all table column sets in one parallel batch ──────────────────────────────────────────
  // An established DB has most/all columns already. By reading PRAGMA table_info for all tables
  // in parallel upfront, we replace ~50 serial ALTER-then-catch round-trips to remote Turso with
  // one parallel batch + O(1) in-memory Set lookups — cutting boot time from ~40s to <1s.
  const ALTERED_TABLES = [
    "sim_traits", "trait_events", "personas",
    "feedback", "projects", "accounts", "trails", "trail_runs",
    "trail_steps", "walk_share_tokens", "findings", "author_sessions",
    "ai_calls", "autosim_auth_probe_queue", "expectations", "users",
  ]
  const _cols = await loadTableColumns(c, ALTERED_TABLES)
  const needCol = (table: string, col: string) => !(_cols.get(table)?.has(col) ?? false)

  // ── additive (idempotent) columns — added after the P3a tables were deployed, so existing prod
  // DBs need these ALTERed in on every boot (migrateV2 early-returns when migrated_v2 is already
  // set, so these MUST live here, mirroring the accounts.domain pattern in initDb). ──
  const newTraitCols: Array<[string, string]> = [
    ["sim_traits", "area"],
    ["sim_traits", "issue_type"],
    ["sim_traits", "severity"],
    ["trait_events", "area"],
    ["trait_events", "issue_type"],
    ["trait_events", "severity"],
    ["trait_events", "actor"],
    ["sim_traits", "src_verified"],
    ["trait_events", "verified"],
    // v3 persona wiring: finding altitude + durability on each trait row.
    ["sim_traits", "scope"],
    ["sim_traits", "portability"],
    // v3 persona core (portable persona identity) + two-axis classification. goals_json /
    // watchfor_json store JSON string arrays; the rest are plain TEXT. All null-default so
    // pre-v3 personas keep working (legacy `type` shim stays authoritative until backfilled).
    ["personas", "sim_class"],
    ["personas", "side"],
    ["personas", "goals_json"],
    ["personas", "expertise"],
    ["personas", "temperament"],
    ["personas", "voice"],
    ["personas", "watchfor_json"],
  ]
  for (const [table, col] of newTraitCols) {
    if (needCol(table, col)) {
      await c.execute(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`).catch((e) =>
        console.warn(`${table}.${col} ALTER skipped:`, e?.message || e),
      )
    }
  }
  // Global Sims v1 (KLA-global): is_global=1 marks a Sim as available across all sibling projects
  // in the same account. INTEGER NOT NULL DEFAULT 0 so existing rows default to project-scoped
  // without any data migration. Must be done outside the TEXT-only newTraitCols loop.
  if (needCol("personas", "is_global")) {
    await c.execute("ALTER TABLE personas ADD COLUMN is_global INTEGER NOT NULL DEFAULT 0")
      .catch((e: any) => console.warn("personas.is_global ALTER skipped:", e?.message || e))
  }
  // Additive idempotent ALTERs for new feedback management columns.
  const feedbackAlters: [string, string][] = [
    ["status",     "TEXT NOT NULL DEFAULT 'open'"],
    ["assignee",   "TEXT"],
    ["notes",      "TEXT"],
    ["updated_at", "INTEGER"],
    ["issue_key",             "TEXT"],
    ["recurrence_count",      "INTEGER NOT NULL DEFAULT 1"],
    ["recurrence_dates_json", "TEXT"],
    ["last_seen_at",          "INTEGER"],
    ["resolved_at",           "INTEGER"],
    // G2/G3/G5: captured dev-tools context (console + network + UA/screen/viewport) and custom
    // identity/metadata, persisted as a JSON blob so every widget/SDK/extension report carries it.
    ["client_context_json",   "TEXT"],
    ["annotations_json",      "TEXT"],
    // KLA-173: explicit source tag so manual tickets are distinguishable from widget/sim reports.
    ["source",                "TEXT"],
    // KLA-175: AI-suggested label IDs (JSON array of label IDs), stored on capture for ghost-chip display.
    ["suggested_label_ids_json", "TEXT"],
  ]
  for (const [col, def] of feedbackAlters) {
    if (needCol("feedback", col)) {
      await c.execute(`ALTER TABLE feedback ADD COLUMN ${col} ${def}`).catch((e: any) =>
        console.warn(`feedback.${col} ALTER skipped:`, e?.message || e))
    }
  }
  await c.execute(`CREATE INDEX IF NOT EXISTS feedback_issue_idx ON feedback (project_id, issue_key)`)
    .catch((e: any) => console.warn("feedback_issue_idx skipped:", e?.message || e))

  // ── widget-config columns (leadgen integration task-1) ──
  if (needCol("projects", "widget_mode")) await c.execute("ALTER TABLE projects ADD COLUMN widget_mode TEXT NOT NULL DEFAULT 'support'").catch((e) => console.warn("projects.widget_mode ALTER skipped:", e?.message || e))
  if (needCol("projects", "widget_cta_url")) await c.execute("ALTER TABLE projects ADD COLUMN widget_cta_url TEXT").catch((e) => console.warn("projects.widget_cta_url ALTER skipped:", e?.message || e))
  if (needCol("projects", "widget_notify_email")) await c.execute("ALTER TABLE projects ADD COLUMN widget_notify_email TEXT").catch((e) => console.warn("projects.widget_notify_email ALTER skipped:", e?.message || e))
  // report-identity gate: how an end-user is identified before a widget ticket is accepted.
  // 'anonymous' (default, JTBD 1.7) = open (identity asked post-submit); 'email' = logged-in OR a valid
  // email; 'login' = Klavity token required. New DBs get 'anonymous' by default; an existing prod column
  // (created earlier with DEFAULT 'email') is left untouched — createProject sets the value explicitly.
  if (needCol("projects", "widget_report_gate")) await c.execute("ALTER TABLE projects ADD COLUMN widget_report_gate TEXT NOT NULL DEFAULT 'anonymous'").catch((e) => console.warn("projects.widget_report_gate ALTER skipped:", e?.message || e))
  // KLA-102: per-project instructions.md — freeform guidance the author drops in to shape how
  // AutoSim trails are authored for that project (test conventions, environment quirks, etc.).
  if (needCol("projects", "instructions_md")) await c.execute("ALTER TABLE projects ADD COLUMN instructions_md TEXT").catch((e) => console.warn("projects.instructions_md ALTER skipped:", e?.message || e))
  if (needCol("feedback", "contact_email")) await c.execute("ALTER TABLE feedback ADD COLUMN contact_email TEXT").catch((e) => console.warn("feedback.contact_email ALTER skipped:", e?.message || e))
  // Source attribution: document.referrer of the embed page (where the visitor came FROM). The embed
  // page itself is already captured as url_host/url_path; this records the upstream traffic source so
  // we can see which external site each widget interaction/lead originated from.
  if (needCol("feedback", "source_referrer")) await c.execute("ALTER TABLE feedback ADD COLUMN source_referrer TEXT").catch((e) => console.warn("feedback.source_referrer ALTER skipped:", e?.message || e))
  // KLA-94: opt-in auto-file flag. When enabled AND a finding meets the confidence/severity threshold,
  // the walk executor automatically creates a ticket via the project's connector. Default OFF (back-compat).
  if (needCol("projects", "trails_autofile_enabled")) await c.execute("ALTER TABLE projects ADD COLUMN trails_autofile_enabled INTEGER NOT NULL DEFAULT 0").catch((e) => console.warn("projects.trails_autofile_enabled ALTER skipped:", e?.message || e))

  // KLA-117: optional per-Trail viewport/device config for AutoSim walks.
  if (needCol("trails", "viewport_json"))
    await c.execute("ALTER TABLE trails ADD COLUMN viewport_json TEXT").catch((e) => console.warn("trails.viewport_json ALTER skipped:", e?.message || e))

  if (needCol("findings", "connector_error"))
    await c.execute("ALTER TABLE findings ADD COLUMN connector_error TEXT").catch((e: any) =>
      console.warn("findings.connector_error ALTER skipped:", e?.message || e))
  // KLA-92: Trail step versioning — step_version bumps whenever steps change; trail_version
  // pins the version a Walk ran against so past runs never drift from the steps they executed.
  if (needCol("trails", "step_version")) await c.execute("ALTER TABLE trails ADD COLUMN step_version INTEGER NOT NULL DEFAULT 1").catch((e) => console.warn("trails.step_version ALTER skipped:", e?.message || e))
  if (needCol("trail_runs", "trail_version")) await c.execute("ALTER TABLE trail_runs ADD COLUMN trail_version INTEGER NOT NULL DEFAULT 1").catch((e) => console.warn("trail_runs.trail_version ALTER skipped:", e?.message || e))
  // KLA-88: per-Trail cron schedule — schedule_cron stores a 5-field UTC cron expression;
  // scheduled_last_run_at guards against double-fire within the same minute window.
  if (needCol("trails", "schedule_cron")) await c.execute("ALTER TABLE trails ADD COLUMN schedule_cron TEXT").catch((e) => console.warn("trails.schedule_cron ALTER skipped:", e?.message || e))
  if (needCol("trails", "scheduled_last_run_at")) await c.execute("ALTER TABLE trails ADD COLUMN scheduled_last_run_at INTEGER").catch((e) => console.warn("trails.scheduled_last_run_at ALTER skipped:", e?.message || e))
  // KLA-277 (JTBD 4.13): DST-safe schedules — schedule_tz holds the IANA zone the cron is expressed
  // in. When set, schedule_cron is LOCAL wall-clock and the UTC fire instant is computed per tick so
  // a 9am-local guard survives DST. Null = legacy baked-UTC cron (unchanged behavior).
  if (needCol("trails", "schedule_tz")) await c.execute("ALTER TABLE trails ADD COLUMN schedule_tz TEXT").catch((e) => console.warn("trails.schedule_tz ALTER skipped:", e?.message || e))
  // KLA-70: dedup-race fix — enforce UNIQUE(project_id, dedup_key) so recordFinding's
  // INSERT ON CONFLICT is atomic. Pre-collapse any legacy duplicates (keep oldest rowid) first.
  await c.execute("DELETE FROM findings WHERE rowid NOT IN (SELECT MIN(rowid) FROM findings GROUP BY project_id, dedup_key)")
    .catch((e: any) => console.warn("findings dedup pre-collapse skipped:", e?.message || e))
  await c.execute("CREATE UNIQUE INDEX IF NOT EXISTS finding_dedup_uq ON findings(project_id, dedup_key)")
    .catch((e: any) => console.warn("finding_dedup_uq skipped:", e?.message || e))
  // KLA-73: persona-judged walks — which persona judges this Trail's results.
  if (needCol("trails", "judge_persona_id")) await c.execute("ALTER TABLE trails ADD COLUMN judge_persona_id TEXT").catch((e: any) =>
    console.warn("trails.judge_persona_id ALTER skipped:", e?.message || e))
  // KLA-73: walk_judgments — one row per (run, persona) judgment session.
  await c.execute(`CREATE TABLE IF NOT EXISTS walk_judgments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    persona_id TEXT NOT NULL,
    persona_name TEXT NOT NULL,
    verdicts_json TEXT NOT NULL,
    overall_note TEXT,
    created_at INTEGER NOT NULL
  )`).catch((e: any) => console.warn("walk_judgments CREATE skipped:", e?.message || e))
  await c.execute("CREATE INDEX IF NOT EXISTS wj_run_idx ON walk_judgments (project_id, run_id, created_at)")
    .catch((e: any) => console.warn("wj_run_idx skipped:", e?.message || e))
  // KLA-55: crash-reaper heartbeat columns — updated by active walks/author drives so the reaper
  // can distinguish a stale-running row from a genuinely-running one even without a restart.
  if (needCol("trail_runs", "last_beat_at")) await c.execute("ALTER TABLE trail_runs ADD COLUMN last_beat_at INTEGER")
    .catch((e: any) => console.warn("trail_runs.last_beat_at ALTER skipped:", e?.message || e))
  if (needCol("author_sessions", "last_beat_at")) await c.execute("ALTER TABLE author_sessions ADD COLUMN last_beat_at INTEGER")
    .catch((e: any) => console.warn("author_sessions.last_beat_at ALTER skipped:", e?.message || e))
  // KLA-57: partial-trajectory checkpoint (traj+history+cost+url) persisted after each step so
  // a stalled drive is resumable without discarding accumulated progress.
  if (needCol("author_sessions", "checkpoint_json")) await c.execute("ALTER TABLE author_sessions ADD COLUMN checkpoint_json TEXT")
    .catch((e: any) => console.warn("author_sessions.checkpoint_json ALTER skipped:", e?.message || e))
  // KLA-57: back-link to the session this one was resumed from (null for fresh starts).
  if (needCol("author_sessions", "resumed_from")) await c.execute("ALTER TABLE author_sessions ADD COLUMN resumed_from TEXT")
    .catch((e: any) => console.warn("author_sessions.resumed_from ALTER skipped:", e?.message || e))
  if (needCol("author_sessions", "resumed_by")) await c.execute("ALTER TABLE author_sessions ADD COLUMN resumed_by TEXT")
    .catch((e: any) => console.warn("author_sessions.resumed_by ALTER skipped:", e?.message || e))
  if (needCol("trails", "objective_verified")) await c.execute("ALTER TABLE trails ADD COLUMN objective_verified INTEGER")
    .catch((e: any) => console.warn("trails.objective_verified ALTER skipped:", e?.message || e))
  if (needCol("author_sessions", "objective_verified")) await c.execute("ALTER TABLE author_sessions ADD COLUMN objective_verified INTEGER")
    .catch((e: any) => console.warn("author_sessions.objective_verified ALTER skipped:", e?.message || e))
  // KLA-77: cross-trail finding dedup — content signature column so the same broken element
  // surfaced from two different Trails collapses to ONE finding with a recurrence bump.
  if (needCol("findings", "content_sig")) await c.execute("ALTER TABLE findings ADD COLUMN content_sig TEXT")
    .catch((e: any) => console.warn("findings.content_sig ALTER skipped:", e?.message || e))
  await c.execute("CREATE INDEX IF NOT EXISTS finding_content_sig_idx ON findings(project_id, content_sig) WHERE content_sig IS NOT NULL")
    .catch((e: any) => console.warn("finding_content_sig_idx skipped:", e?.message || e))
  // KLA-67: per-step action timeout override (ms). NULL = runner uses adaptive default (min 5s, max 15s).
  if (needCol("trail_steps", "timeout_ms")) await c.execute("ALTER TABLE trail_steps ADD COLUMN timeout_ms INTEGER")
    .catch((e: any) => console.warn("trail_steps.timeout_ms ALTER skipped:", e?.message || e))
  // KLA-93: per-trail named environments (staging/prod/etc.) stored as JSON array [{name,baseUrl}].
  if (needCol("trails", "environments_json")) await c.execute("ALTER TABLE trails ADD COLUMN environments_json TEXT")
    .catch((e: any) => console.warn("trails.environments_json ALTER skipped:", e?.message || e))
  // KLA-93: which named environment a run was executed against. NULL = default (trail.baseUrl).
  if (needCol("trail_runs", "environment_name")) await c.execute("ALTER TABLE trail_runs ADD COLUMN environment_name TEXT")
    .catch((e: any) => console.warn("trail_runs.environment_name ALTER skipped:", e?.message || e))
  // KLA-104: pause-for-secret — opaque key stored while a walk is paused; cleared on resume or expiry.
  if (needCol("trail_runs", "paused_secret_key")) await c.execute("ALTER TABLE trail_runs ADD COLUMN paused_secret_key TEXT")
    .catch((e: any) => console.warn("trail_runs.paused_secret_key ALTER skipped:", e?.message || e))
  // KLA-121: share-token lifecycle — revocation timestamp (NULL = active).
  if (needCol("walk_share_tokens", "revoked_at")) await c.execute("ALTER TABLE walk_share_tokens ADD COLUMN revoked_at INTEGER")
    .catch((e: any) => console.warn("walk_share_tokens.revoked_at ALTER skipped:", e?.message || e))
  // KLA-210 (JTBD 7.5): Share-link manager — optional passcode gate + last-viewed / view-count signal.
  // passcode_hash = sha256hex(passcode) (NULL = open link). last_viewed_at / view_count bump each time
  // token-scoped data is served, surfacing "client opened the report" in the Share manager.
  if (needCol("walk_share_tokens", "passcode_hash")) await c.execute("ALTER TABLE walk_share_tokens ADD COLUMN passcode_hash TEXT")
    .catch((e: any) => console.warn("walk_share_tokens.passcode_hash ALTER skipped:", e?.message || e))
  if (needCol("walk_share_tokens", "last_viewed_at")) await c.execute("ALTER TABLE walk_share_tokens ADD COLUMN last_viewed_at INTEGER")
    .catch((e: any) => console.warn("walk_share_tokens.last_viewed_at ALTER skipped:", e?.message || e))
  if (needCol("walk_share_tokens", "view_count")) await c.execute("ALTER TABLE walk_share_tokens ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0")
    .catch((e: any) => console.warn("walk_share_tokens.view_count ALTER skipped:", e?.message || e))
  if (needCol("projects", "autosim_auth_status")) await c.execute("ALTER TABLE projects ADD COLUMN autosim_auth_status TEXT NOT NULL DEFAULT 'unregistered'")
    .catch((e: any) => console.warn("projects.autosim_auth_status ALTER skipped:", e?.message || e))
  if (needCol("autosim_auth_probe_queue", "error")) await c.execute("ALTER TABLE autosim_auth_probe_queue ADD COLUMN error TEXT")
    .catch((e: any) => console.warn("autosim_auth_probe_queue.error ALTER skipped:", e?.message || e))
  if (needCol("autosim_auth_probe_queue", "resume_summary_json")) await c.execute("ALTER TABLE autosim_auth_probe_queue ADD COLUMN resume_summary_json TEXT")
    .catch((e: any) => console.warn("autosim_auth_probe_queue.resume_summary_json ALTER skipped:", e?.message || e))
  if (needCol("autosim_auth_probe_queue", "finished_at")) await c.execute("ALTER TABLE autosim_auth_probe_queue ADD COLUMN finished_at INTEGER")
    .catch((e: any) => console.warn("autosim_auth_probe_queue.finished_at ALTER skipped:", e?.message || e))
  for (const [col, def] of accountBillingColumns) {
    if (needCol("accounts", col)) await c.execute(`ALTER TABLE accounts ADD COLUMN ${col} ${def}`)
      .catch((e: any) => console.warn(`accounts.${col} ALTER skipped:`, e?.message || e))
  }
  // KLA-297: explicit onboarding-completed flag (ms epoch, NULL = wizard not finished).
  if (needCol("accounts", "onboarded_at")) await c.execute("ALTER TABLE accounts ADD COLUMN onboarded_at INTEGER")
    .catch((e: any) => console.warn("accounts.onboarded_at ALTER skipped:", e?.message || e))
  if (needCol("projects", "billing_plan")) await c.execute("ALTER TABLE projects ADD COLUMN billing_plan TEXT NOT NULL DEFAULT 'free'")
    .catch((e: any) => console.warn("projects.billing_plan ALTER skipped:", e?.message || e))
  if (needCol("projects", "billing_status")) await c.execute("ALTER TABLE projects ADD COLUMN billing_status TEXT")
    .catch((e: any) => console.warn("projects.billing_status ALTER skipped:", e?.message || e))
  if (needCol("projects", "billing_updated_at")) await c.execute("ALTER TABLE projects ADD COLUMN billing_updated_at INTEGER")
    .catch((e: any) => console.warn("projects.billing_updated_at ALTER skipped:", e?.message || e))
  // KLA-292: client site URL — the primary URL of the client's product, set at project creation.
  if (needCol("projects", "site_url")) await c.execute("ALTER TABLE projects ADD COLUMN site_url TEXT")
    .catch((e: any) => console.warn("projects.site_url ALTER skipped:", e?.message || e))
  // KLA-81: computed severity stored at finding-creation time so ticket-filers + UIs don't have
  // to re-derive it. NULL on legacy rows → callers fall back to severityForKind(kind).
  if (needCol("findings", "severity")) await c.execute("ALTER TABLE findings ADD COLUMN severity TEXT")
    .catch((e: any) => console.warn("findings.severity ALTER skipped:", e?.message || e))
  // KLA-168: rename severity → priority. Add priority column + backfill from severity.
  if (needCol("feedback", "priority")) await c.execute("ALTER TABLE feedback ADD COLUMN priority TEXT").catch((e: any) => console.warn("feedback.priority ALTER skipped:", e?.message || e))
  await c.execute("UPDATE feedback SET priority = severity WHERE priority IS NULL").catch((e: any) => console.warn("feedback.priority backfill skipped:", e?.message || e))
  if (needCol("sim_traits", "priority")) await c.execute("ALTER TABLE sim_traits ADD COLUMN priority TEXT").catch((e: any) => console.warn("sim_traits.priority ALTER skipped:", e?.message || e))
  await c.execute("UPDATE sim_traits SET priority = severity WHERE priority IS NULL").catch((e: any) => console.warn("sim_traits.priority backfill skipped:", e?.message || e))
  if (needCol("trait_events", "priority")) await c.execute("ALTER TABLE trait_events ADD COLUMN priority TEXT").catch((e: any) => console.warn("trait_events.priority ALTER skipped:", e?.message || e))
  await c.execute("UPDATE trait_events SET priority = severity WHERE priority IS NULL").catch((e: any) => console.warn("trait_events.priority backfill skipped:", e?.message || e))
  if (needCol("findings", "priority")) await c.execute("ALTER TABLE findings ADD COLUMN priority TEXT").catch((e: any) => console.warn("findings.priority ALTER skipped:", e?.message || e))
  await c.execute("UPDATE findings SET priority = CASE severity WHEN 'critical' THEN 'urgent' ELSE severity END WHERE priority IS NULL").catch((e: any) => console.warn("findings.priority backfill skipped:", e?.message || e))
  // KLA-200: per-project sequential ticket numbers (human-readable #N).
  // Additive: add seq_num column (nullable initially), then backfill with a per-project rank
  // derived from created_at so older rows get lower numbers and the sequence is stable.
  if (needCol("feedback", "seq_num")) await c.execute("ALTER TABLE feedback ADD COLUMN seq_num INTEGER")
    .catch((e: any) => console.warn("feedback.seq_num ALTER skipped:", e?.message || e))
  await c.execute(`
    UPDATE feedback SET seq_num = (
      SELECT COUNT(*) FROM feedback f2
      WHERE f2.project_id = feedback.project_id
        AND (f2.created_at < feedback.created_at
          OR (f2.created_at = feedback.created_at AND f2.id <= feedback.id))
    ) WHERE seq_num IS NULL
  `).catch((e: any) => console.warn("feedback.seq_num backfill skipped:", e?.message || e))
  await c.execute("CREATE INDEX IF NOT EXISTS feedback_seq_idx ON feedback (project_id, seq_num)")
    .catch((e: any) => console.warn("feedback_seq_idx skipped:", e?.message || e))
  // KLA-145: tenant COGS columns for the AI-call ledger. Keep these before any tenant summary
  // query/index can reference them, or established DBs boot with "no such column: account_id".
  if (needCol("ai_calls", "account_id")) await c.execute("ALTER TABLE ai_calls ADD COLUMN account_id TEXT")
    .catch((e: any) => console.warn("ai_calls.account_id ALTER skipped:", e?.message || e))
  if (needCol("ai_calls", "feature")) await c.execute("ALTER TABLE ai_calls ADD COLUMN feature TEXT")
    .catch((e: any) => console.warn("ai_calls.feature ALTER skipped:", e?.message || e))
  await c.execute("CREATE INDEX IF NOT EXISTS ai_calls_acct_idx ON ai_calls (account_id, created_at)")
    .catch((e: any) => console.warn("ai_calls_acct_idx skipped:", e?.message || e))
  await c.execute("CREATE INDEX IF NOT EXISTS ai_calls_feature_idx ON ai_calls (feature, created_at)")
    .catch((e: any) => console.warn("ai_calls_feature_idx skipped:", e?.message || e))
  // KLA-243: finding↔expectation linkage — which expectation a finding is associated with.
  // NULL on legacy rows (pre-linkage). Set by recordFinding when ingestFinding returns an exp id.
  if (needCol("findings", "expectation_id")) await c.execute("ALTER TABLE findings ADD COLUMN expectation_id TEXT")
    .catch((e: any) => console.warn("findings.expectation_id ALTER skipped:", e?.message || e))
  await c.execute("CREATE INDEX IF NOT EXISTS finding_exp_idx ON findings(project_id, expectation_id) WHERE expectation_id IS NOT NULL")
    .catch((e: any) => console.warn("finding_exp_idx skipped:", e?.message || e))
  // KLA-243: saves_count — how many times this guard has caught a regression (an enforced
  // expectation that triggered a finding). Surfaces as the "saves" counter in the guards UI.
  if (needCol("expectations", "saves_count")) await c.execute("ALTER TABLE expectations ADD COLUMN saves_count INTEGER NOT NULL DEFAULT 0")
    .catch((e: any) => console.warn("expectations.saves_count ALTER skipped:", e?.message || e))
  // KLA-242: source_ticket_id — the resolved feedback ticket this expectation was created from
  // via "Guard this fix". NULL for expectations discovered by the normal spine ingest path.
  if (needCol("expectations", "source_ticket_id")) await c.execute("ALTER TABLE expectations ADD COLUMN source_ticket_id TEXT")
    .catch((e: any) => console.warn("expectations.source_ticket_id ALTER skipped:", e?.message || e))
  // KLA-245 (B.5): awaiting_trail — a validated expectation the user chose to "hold as
  // validated-awaiting-Trail" from the Enforce flow because the project had no Trail (or none
  // covering its path) to attach an assert step to. Status stays 'validated'; this flag only
  // suppresses the Enforce offer until a Trail covering the expectation's urlPath is created,
  // at which point the enforce list route clears the flag and the offer resurfaces. 0 = not held.
  if (needCol("expectations", "awaiting_trail")) await c.execute("ALTER TABLE expectations ADD COLUMN awaiting_trail INTEGER NOT NULL DEFAULT 0")
    .catch((e: any) => console.warn("expectations.awaiting_trail ALTER skipped:", e?.message || e))
  // KLAVITYKLA-301: sim_source — records which Add-a-Sim path created this Sim so the first-run
  // checklist can tick honestly. Values: 'describe' | 'from-site' | 'transcript'. NULL on legacy
  // rows = unknown origin; these are NOT treated as transcript Sims (step 4 stays unticked).
  if (needCol("personas", "sim_source")) await c.execute("ALTER TABLE personas ADD COLUMN sim_source TEXT")
    .catch((e: any) => console.warn("personas.sim_source ALTER skipped:", e?.message || e))
  // KLAVITYKLA-253 (JTBD B.13): carry the ORIGINATING grounded quote through graduation.
  // source_quote      — the verbatim complaint/evidence the expectation was born from (Snap/Sim/AutoSim).
  // source_quote_verified — 1 = verified against source text (trait provenance / page text), 0 = present but
  //                         not verified, NULL = never had a quote. Rendered on Guard cards + fed to draftAssertion.
  // source_quote_ref  — the source ref id (feedback/finding id) the quote came from, for auditability.
  // NULL on all legacy rows — every read tolerates null.
  if (needCol("expectations", "source_quote")) await c.execute("ALTER TABLE expectations ADD COLUMN source_quote TEXT")
    .catch((e: any) => console.warn("expectations.source_quote ALTER skipped:", e?.message || e))
  if (needCol("expectations", "source_quote_verified")) await c.execute("ALTER TABLE expectations ADD COLUMN source_quote_verified INTEGER")
    .catch((e: any) => console.warn("expectations.source_quote_verified ALTER skipped:", e?.message || e))
  if (needCol("expectations", "source_quote_ref")) await c.execute("ALTER TABLE expectations ADD COLUMN source_quote_ref TEXT")
    .catch((e: any) => console.warn("expectations.source_quote_ref ALTER skipped:", e?.message || e))
  // KLAVITYKLA-253 (JTBD B.13): findings ground_quote_verified — 1 = the ground_quote passed verification
  // against captured page text; 0/NULL = self-referential/synthesized rationale that must NOT be labeled
  // "Grounded:" in external tickets. Legacy rows are NULL → treated as unverified (relabeled "Reason:").
  if (needCol("findings", "ground_quote_verified")) await c.execute("ALTER TABLE findings ADD COLUMN ground_quote_verified INTEGER")
    .catch((e: any) => console.warn("findings.ground_quote_verified ALTER skipped:", e?.message || e))
  // KLAVITYKLA-324: first-touch UTM/referrer attribution — captured on signup (site/attr.js →
  // POST /api/auth/verify), persisted FIRST-TOUCH-WINS onto both the signup row (users) and the
  // subscription row (accounts, so "which channel produced paid customers" is one query, no joins).
  const userAttrCols: [string, string][] = [
    ["utm_source", "TEXT"], ["utm_medium", "TEXT"], ["utm_campaign", "TEXT"],
    ["utm_term", "TEXT"], ["utm_content", "TEXT"],
    ["attr_referrer", "TEXT"], ["attr_landing_page", "TEXT"],
    ["attr_first_seen_at", "INTEGER"],
  ]
  for (const [col, def] of userAttrCols) {
    if (needCol("users", col)) await c.execute(`ALTER TABLE users ADD COLUMN ${col} ${def}`)
      .catch((e: any) => console.warn(`users.${col} ALTER skipped:`, e?.message || e))
  }
  const accountAttrCols: [string, string][] = [["utm_source", "TEXT"], ["utm_medium", "TEXT"], ["utm_campaign", "TEXT"]]
  for (const [col, def] of accountAttrCols) {
    if (needCol("accounts", col)) await c.execute(`ALTER TABLE accounts ADD COLUMN ${col} ${def}`)
      .catch((e: any) => console.warn(`accounts.${col} ALTER skipped:`, e?.message || e))
  }
}

// ── schema_meta helpers ──
async function metaGet(c: Client, key: string): Promise<string | null> {
  const r = await c.execute({ sql: "SELECT value FROM schema_meta WHERE key=?", args: [key] })
  return r.rows.length ? String((r.rows[0] as any).value) : null
}
async function metaSet(c: Client, key: string, value: string) {
  await c.execute({ sql: "INSERT INTO schema_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", args: [key, value] })
}

// ── §2.4 migration: single-workspace → accounts/projects. ──
// SAFE: additive only, never drops in this release. IDEMPOTENT: guarded by the migrated_v2 flag,
// and every write is INSERT OR IGNORE / existence-checked so a partial run (flag unset) re-runs
// cleanly with no duplicates. Old personas_v1 / workspaces / memberships are preserved untouched.
export async function migrateV2(c: Client) {
  if (await metaGet(c, "migrated_v2")) return // already migrated — fast no-op on every boot

  // 1. Migrate EXISTING v1 personas only. applySchema owns the canonical project-scoped `personas`
  //    shape; here we only handle a live workspace_id-shaped table from an existing prod DB.
  //    FRESH install: applySchema already created the project-scoped `personas` (no workspace_id),
  //    so the guard below is FALSE → no rename, no junk personas_v1.
  //    EXISTING prod: the live `personas` has workspace_id → rename it to personas_v1, then the
  //    redundant-but-safe CREATE … IF NOT EXISTS re-creates the canonical project-scoped table.
  const hasV1 = await tableExists(c, "personas_v1")
  const hasPersonas = await tableExists(c, "personas")
  if (!hasV1 && hasPersonas && (await columnExists(c, "personas", "workspace_id"))) {
    await c.execute("ALTER TABLE personas RENAME TO personas_v1")
  }
  // Redundant on a fresh install (applySchema already made it); required after the rename above.
  await c.execute(`CREATE TABLE IF NOT EXISTS personas (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, source_transcript_id TEXT,
       name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client',
       initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT,
       created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
  await c.execute("CREATE INDEX IF NOT EXISTS persona_proj_idx ON personas (project_id, created_at)")

  // 2. workspaces → accounts + default project. owner_email = first admin (membership created_at ASC).
  const wsRows = (await c.execute("SELECT id, name, created_at FROM workspaces")).rows as any[]
  for (const w of wsRows) {
    const wid = String(w.id)
    const firstAdmin = (await c.execute({
      sql: "SELECT email FROM memberships WHERE workspace_id=? AND role='admin' ORDER BY created_at ASC LIMIT 1",
      args: [wid],
    })).rows[0] as any
    const ownerEmail = firstAdmin ? String(firstAdmin.email) : ""
    await c.execute({
      sql: "INSERT OR IGNORE INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)",
      args: [wid, String(w.name), ownerEmail, Number(w.created_at)],
    })
    await c.execute({
      sql: `INSERT OR IGNORE INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      args: ["proj_" + wid, wid, "Default Project", "active", "auto", 200, "named", Number(w.created_at), Number(w.created_at)],
    })
  }

  // 3. memberships → account_members (first admin→owner, other admins→admin, user→member)
  //    + project_members (admin→admin, else member).
  for (const w of wsRows) {
    const wid = String(w.id)
    const mems = (await c.execute({
      sql: "SELECT email, role, created_at FROM memberships WHERE workspace_id=? ORDER BY created_at ASC",
      args: [wid],
    })).rows as any[]
    let firstAdminSeen = false
    for (const m of mems) {
      const email = String(m.email), role = String(m.role), createdAt = Number(m.created_at)
      let acctRole: string
      if (role === "admin") {
        if (!firstAdminSeen) { acctRole = "owner"; firstAdminSeen = true } else acctRole = "admin"
      } else acctRole = "member"
      await c.execute({
        sql: "INSERT OR IGNORE INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)",
        args: ["am_" + wid + "_" + email, wid, email, acctRole, createdAt],
      })
      await c.execute({
        sql: "INSERT OR IGNORE INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?)",
        args: ["pm_" + wid + "_" + email, "proj_" + wid, email, role === "admin" ? "admin" : "member", null, createdAt],
      })
    }
  }

  // 4. personas_v1 → project-scoped personas (keep insights_json as-is; P3 normalizes to sim_traits).
  if (await tableExists(c, "personas_v1")) {
    const ps = (await c.execute("SELECT * FROM personas_v1")).rows as any[]
    for (const p of ps) {
      const wid = String(p.workspace_id)
      await c.execute({
        sql: `INSERT OR IGNORE INTO personas
              (id,project_id,source_transcript_id,name,role,type,initials,accent,summary,insights_json,avatar,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [String(p.id), "proj_" + wid, null, String(p.name), p.role ?? null,
               String(p.type || "client"), p.initials ?? null, p.accent ?? null, p.summary ?? null,
               p.insights_json ?? null, p.avatar ?? null, Number(p.created_at), Number(p.updated_at)],
      })
    }
  }

  // 5. re-scope workspace integrations → project (owner_id reuses id: 'proj_'||workspace_id).
  //    Collision-safe + idempotent + non-lossy: copy each workspace row to a project row via
  //    INSERT OR IGNORE (a pre-existing 'proj_'+wid project row is PRESERVED — no PK throw on a
  //    half-migrated/retried state), then drop the now-redundant workspace rows. A second run finds
  //    no scope='workspace' rows → both statements are no-ops: zero duplicates, zero errors, no loss.
  await c.execute(
    `INSERT OR IGNORE INTO integrations (scope, owner_id, integration, config_json, updated_at)
     SELECT 'project', 'proj_'||owner_id, integration, config_json, updated_at
     FROM integrations WHERE scope='workspace'`,
  )
  await c.execute("DELETE FROM integrations WHERE scope='workspace'")

  // 6. flag LAST — only after every step above succeeded.
  await metaSet(c, "migrated_v2", String(Date.now()))
}

// ── Plane→connector one-time migration (guarded by schema_meta flag). ──
// For every integrations row with scope='project' and integration='plane', insert a connectors
// row (type='plane', auto_copy=1, enabled=1, config carries the existing encrypted token verbatim).
// Idempotent: guarded by the connectors_plane_migrated flag.
export async function migrateConnectorsPlane(c: Client) {
  if (await metaGet(c, "connectors_plane_migrated")) return // already done — fast no-op on every boot

  const rows = (await c.execute(
    "SELECT owner_id, config_json FROM integrations WHERE scope='project' AND integration='plane'"
  )).rows as any[]
  for (const row of rows) {
    const projectId = String(row.owner_id)
    const rawCfg = row.config_json ? JSON.parse(String(row.config_json)) : {}
    // carry token_enc across as key 'token' (encrypted — not decrypted here)
    const config: Record<string, string> = {}
    if (rawCfg.token_enc) config.token = String(rawCfg.token_enc)
    if (rawCfg.host) config.host = String(rawCfg.host)
    if (rawCfg.workspace) config.workspace = String(rawCfg.workspace)
    if (rawCfg.projectId) config.project_id = String(rawCfg.projectId)
    const id = "conn_" + crypto.randomUUID()
    await c.execute({
      sql: `INSERT OR IGNORE INTO connectors (id,project_id,type,name,config,auto_copy,enabled,created_at,created_by)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [id, projectId, "plane", "Plane (migrated)", JSON.stringify(config), 1, 1, Date.now(), null],
    })
  }
  await metaSet(c, "connectors_plane_migrated", String(Date.now()))
}

// ── KLAVITYKLA-288: retire the legacy PERSONAL (per-user) Plane connection. ──
// The extension options page used to store a Plane connection at scope='user', owner_id=<email>,
// and POST /api/feedback pushed inline with it. That inline path is gone — so any user who still
// has a personal connection would silently stop filing to Plane. This one-time migration folds
// each personal connection into the connector system so nothing is lost.
//
// Scoping rule (deliberate, security-relevant): a personal token is only ever copied into projects
// belonging to an account the user OWNS (accounts.owner_email = their email). We never push someone's
// personal API token into a project owned by a different account — that would leak the secret to
// teammates who could read it back through the connector surface.
//
// Double-file safety: a project that already has ANY type='plane' connector is skipped, so a project
// can never end up with two Plane connectors both auto-copying the same report.
// Idempotent: guarded by the connectors_plane_personal_migrated flag, and re-running after the flag
// is cleared is still safe because of the per-project "already has a plane connector" check.
export async function migrateConnectorsPlanePersonal(c: Client) {
  if (await metaGet(c, "connectors_plane_personal_migrated")) return // already done — fast no-op

  const rows = (await c.execute(
    "SELECT owner_id, config_json FROM integrations WHERE scope='user' AND integration='plane'"
  )).rows as any[]
  for (const row of rows) {
    const email = String(row.owner_id || "").toLowerCase()
    if (!email) continue
    const rawCfg = row.config_json ? JSON.parse(String(row.config_json)) : {}
    // An incomplete personal connection could never have filed anything — don't materialize it.
    if (!rawCfg.token_enc || !rawCfg.workspace || !rawCfg.projectId) continue
    const config: Record<string, string> = {
      token: String(rawCfg.token_enc), // stays ENCRYPTED — never decrypted here
      workspace: String(rawCfg.workspace),
      project_id: String(rawCfg.projectId),
    }
    if (rawCfg.host) config.host = String(rawCfg.host)

    const projects = (await c.execute({
      sql: `SELECT p.id AS id FROM projects p
              JOIN accounts a ON a.id = p.account_id
             WHERE LOWER(a.owner_email) = ?`,
      args: [email],
    })).rows as any[]
    for (const p of projects) {
      const projectId = String(p.id)
      const existing = (await c.execute({
        sql: "SELECT id FROM connectors WHERE project_id=? AND type='plane' LIMIT 1",
        args: [projectId],
      })).rows
      if (existing.length) continue // already covered — adding another would double-file
      await c.execute({
        sql: `INSERT INTO connectors (id,project_id,type,name,config,auto_copy,enabled,created_at,created_by)
              VALUES (?,?,?,?,?,?,?,?,?)`,
        args: ["conn_" + crypto.randomUUID(), projectId, "plane", "Plane (migrated from personal connection)",
               JSON.stringify(config), 1, 1, Date.now(), email],
      })
    }
  }
  await metaSet(c, "connectors_plane_personal_migrated", String(Date.now()))
}

// ── One-time retroactive triage backfill (guarded by schema_meta flag). ──
// Legacy rows were all 'open'. Re-apply the auto-accept rule so non-high, non-recurring items
// move into the triage queue. Idempotent via flag.
export async function backfillTriageV1(c: Client) {
  if (await metaGet(c, "triage_backfill_v1")) return
  await c.execute({
    sql: `UPDATE feedback SET status='new'
          WHERE status='open' AND COALESCE(priority, severity, '') NOT IN ('high', 'urgent') AND recurrence_count < 3`,
  })
  await metaSet(c, "triage_backfill_v1", String(Date.now()))
}

// ── C1 fix: one-time backfill of pre-existing 'draft' trails to 'active'. ──
// Context: trails.status defaulted 'draft' and nothing ever set 'active' before the AutoSims F1
// branch shipped the draft-gate. Every pre-existing trail was therefore silently 'draft', causing
// walkTrail to suppress ALL findings for ALL live trails. This one-time guarded backfill promotes
// every draft trail that was NOT intentionally created through the new LLM authoring flow (those
// are identified by a corresponding author_sessions row with trail_id set).
// Idempotent: guarded by schema_migrations key 'trails_status_backfill_2026_07_03'.
export async function backfillTrailStatus(c: Client): Promise<{ activated: number }> {
  const migKey = "trails_status_backfill_2026_07_03"
  const already = await c.execute({ sql: "SELECT key FROM schema_migrations WHERE key=?", args: [migKey] })
  if (already.rows.length) return { activated: 0 }
  const r = await c.execute({
    sql: `UPDATE trails SET status='active', updated_at=?
          WHERE status='draft'
            AND id NOT IN (SELECT trail_id FROM author_sessions WHERE trail_id IS NOT NULL)`,
    args: [Date.now()],
  })
  const activated = Number(r.rowsAffected ?? 0)
  await c.execute({ sql: "INSERT INTO schema_migrations (key, applied_at) VALUES (?, ?)", args: [migKey, Date.now()] })
  console.log(`[backfillTrailStatus] activated ${activated} pre-existing draft trail(s) → active`)
  return { activated }
}

// Authoring runs in-process holding the walk slot; a service restart (the merge-train restarts on
// every deploy) kills it mid-flight and leaves its author_sessions row 'running' forever — the UI
// polls a zombie. At boot no authoring can legitimately be in flight (single-process design), so
// mark every 'running' session failed with an honest reason. Observed live 2026-07-04.
export async function sweepOrphanedAuthorSessions(c: Client): Promise<{ swept: number }> {
  const r = await c.execute({
    sql: `UPDATE author_sessions SET status='failed',
            stall_reason='interrupted by a server restart - please retry', updated_at=?
          WHERE status='running'`,
    args: [Date.now()],
  })
  const swept = Number(r.rowsAffected ?? 0)
  if (swept) console.log(`[author-sessions] swept ${swept} orphaned running session(s) → failed`)
  return { swept }
}

// KLA-55: Boot sweep for trail_runs — finalize any walk left 'running' from a previous process.
// At boot no walk can legitimately be in flight (single-process, walk slot model), so every
// 'running' row is from a crashed/OOM-killed process. Mark them red with a clear reason.
export async function sweepOrphanedWalks(c: Client): Promise<{ swept: number }> {
  const now = Date.now()
  const r = await c.execute({
    sql: `UPDATE trail_runs SET status='red', finished_at=?,
            summary_json=JSON_OBJECT('failureKind','crash','error','interrupted by a server restart')
          WHERE status='running'`,
    args: [now],
  })
  const swept = Number(r.rowsAffected ?? 0)
  if (swept) console.log(`[trail-runs] swept ${swept} orphaned running walk(s) → red`)
  return { swept }
}

// KLA-55: Heartbeat touches — updated at the start of each step/iteration so the stale-reaper
// can distinguish a live walk from a crashed one without needing a restart signal.
export async function touchWalkHeartbeat(runId: string, c?: Client): Promise<void> {
  await (c ?? db!).execute({ sql: `UPDATE trail_runs SET last_beat_at=? WHERE id=?`, args: [Date.now(), runId] })
}

export async function touchAuthorHeartbeat(sessionId: string, c?: Client): Promise<void> {
  await (c ?? db!).execute({ sql: `UPDATE author_sessions SET last_beat_at=? WHERE id=?`, args: [Date.now(), sessionId] })
}

// KLA-55: Stale-heartbeat reaper — sweeps rows whose heartbeat is older than thresholdMs.
// Only reaps rows that HAVE a heartbeat (last_beat_at IS NOT NULL) — pre-KLA-55 rows without
// a beat are left for the boot sweep to handle on next restart, not silently reaped here.
const DEFAULT_STALE_MS = Number(process.env.WALK_STALE_MS) || 3 * 60 * 1000

export async function sweepStaleWalks(c: Client, thresholdMs = DEFAULT_STALE_MS): Promise<{ swept: number }> {
  const cutoff = Date.now() - thresholdMs
  const now = Date.now()
  const r = await c.execute({
    sql: `UPDATE trail_runs SET status='red', finished_at=?,
            summary_json=JSON_OBJECT('failureKind','crash','error','stale heartbeat — process may have crashed')
          WHERE status='running' AND last_beat_at IS NOT NULL AND last_beat_at < ?`,
    args: [now, cutoff],
  })
  const swept = Number(r.rowsAffected ?? 0)
  if (swept) console.log(`[trail-runs] stale reaper swept ${swept} walk(s) → red`)
  return { swept }
}

export async function sweepStaleAuthorSessions(c: Client, thresholdMs = DEFAULT_STALE_MS): Promise<{ swept: number }> {
  const cutoff = Date.now() - thresholdMs
  const now = Date.now()
  const r = await c.execute({
    sql: `UPDATE author_sessions SET status='failed', updated_at=?,
            stall_reason='stale heartbeat — process may have crashed, please retry'
          WHERE status='running' AND last_beat_at IS NOT NULL AND last_beat_at < ?`,
    args: [now, cutoff],
  })
  const swept = Number(r.rowsAffected ?? 0)
  if (swept) console.log(`[author-sessions] stale reaper swept ${swept} session(s) → failed`)
  return { swept }
}

async function tableExists(c: Client, name: string): Promise<boolean> {
  const r = await c.execute({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?", args: [name] })
  return r.rows.length > 0
}
async function columnExists(c: Client, table: string, col: string): Promise<boolean> {
  try {
    const r = await c.execute(`PRAGMA table_info(${table})`)
    return r.rows.some((x: any) => String(x.name) === col)
  } catch { return false }
}
/** Batch-fetch column sets for multiple tables in parallel (one PRAGMA per table, all concurrent).
 *  Returns a Map<tableName, Set<columnName>>. Unknown/nonexistent tables get an empty Set. */
export async function loadTableColumns(c: Client, tables: string[]): Promise<Map<string, Set<string>>> {
  const entries = await Promise.all(
    tables.map(async (table) => {
      try {
        const r = await c.execute(`PRAGMA table_info(${table})`)
        return [table, new Set(r.rows.map((x: any) => String(x.name)))] as const
      } catch {
        return [table, new Set<string>()] as const
      }
    }),
  )
  return new Map(entries)
}

// ── OTP ──
export async function createOtp(email: string, code: string, expiresAt: number) {
  // Single live code per email (M1): retire any prior unused codes so only the newest can verify.
  // Shrinks the brute-force surface and enforces clean single-use semantics.
  // E2: store sha256hex(code), never the raw 6-digit code — a DB read can't reveal a live login code.
  // OTPs are short-lived + single-live, so no dual-read fallback is needed.
  await db!.execute({ sql: "UPDATE login_otps SET used=1 WHERE email=? AND used=0", args: [email] })
  await db!.execute({ sql: "INSERT INTO login_otps (email,code,expires_at,used) VALUES (?,?,?,0)", args: [email, sha256hex(code), expiresAt] })
}
export async function verifyOtp(email: string, code: string): Promise<boolean> {
  // E2: hash the presented code and compare against the stored hash.
  const r = await db!.execute({ sql: "SELECT rowid FROM login_otps WHERE email=? AND code=? AND used=0 AND expires_at>? ORDER BY expires_at DESC LIMIT 1", args: [email, sha256hex(code), Date.now()] })
  if (!r.rows.length) return false
  await db!.execute({ sql: "UPDATE login_otps SET used=1 WHERE rowid=?", args: [(r.rows[0] as any).rowid] })
  return true
}

// ── users / sessions ──
export async function upsertUser(email: string) {
  await db!.execute({ sql: "INSERT INTO users (email,created_at) VALUES (?,?) ON CONFLICT(email) DO NOTHING", args: [email, Date.now()] })
}

// KLAVITYKLA-324: FIRST-TOUCH WINS. Every SET clause is COALESCE(col, ?) so this only ever fills
// in a currently-NULL column — a returning user who logs back in from a different campaign link
// never has their original acquisition source overwritten. No-op (not even a round-trip) when
// `attr` is null/empty, so a signup with no attribution at all is unaffected.
export async function setUserAttribution(email: string, attr: SanitizedAttr | null): Promise<void> {
  if (!attr) return
  await db!.execute({
    sql: `UPDATE users SET
            utm_source = COALESCE(utm_source, ?),
            utm_medium = COALESCE(utm_medium, ?),
            utm_campaign = COALESCE(utm_campaign, ?),
            utm_term = COALESCE(utm_term, ?),
            utm_content = COALESCE(utm_content, ?),
            attr_referrer = COALESCE(attr_referrer, ?),
            attr_landing_page = COALESCE(attr_landing_page, ?),
            attr_first_seen_at = COALESCE(attr_first_seen_at, ?)
          WHERE email = ?`,
    args: [
      attr.source ?? null, attr.medium ?? null, attr.campaign ?? null, attr.term ?? null, attr.content ?? null,
      attr.referrer ?? null, attr.landing_page ?? null, attr.first_seen_at ?? null,
      email,
    ],
  })
}
// E1: sessions.id stores sha256hex(raw token), never the raw bearer. The caller keeps the RAW `id`
// (it generated it) for the HttpOnly cookie; we only ever persist its hash, so a DB read can't be
// replayed as a session.
export async function createSession(id: string, email: string, expiresAt: number) {
  await db!.execute({ sql: "INSERT INTO sessions (id,email,created_at,expires_at) VALUES (?,?,?,?)", args: [sha256hex(id), email, Date.now(), expiresAt] })
}
export async function getSession(id: string): Promise<string | null> {
  // Primary: look up by hash. Dual-read migration fallback: if no hashed row matches, try the raw id
  // so legacy plaintext sessions minted before E1 keep working until they expire. REMOVE the raw
  // fallback once all pre-E1 sessions have aged out (≤ SESSION_DAYS after deploy).
  let r = await db!.execute({ sql: "SELECT email,expires_at FROM sessions WHERE id=?", args: [sha256hex(id)] })
  if (!r.rows.length) r = await db!.execute({ sql: "SELECT email,expires_at FROM sessions WHERE id=?", args: [id] })
  if (!r.rows.length) return null
  const row = r.rows[0] as any
  if (Number(row.expires_at) < Date.now()) return null
  return String(row.email)
}
export async function deleteSession(id: string) {
  // Delete both the hashed row (E1) and any legacy plaintext row so logout/revoke works during the
  // dual-read migration window.
  await db!.execute({ sql: "DELETE FROM sessions WHERE id=? OR id=?", args: [sha256hex(id), id] })
}

// ── data-retention / TTL sweep helpers (C1) ──
// Each returns the number of rows deleted (or, for screenshots, the s3 keys to delete) so the sweep
// can log a summary and remove the backing S3 objects.
export async function deleteExpiredOtps(now = Date.now()): Promise<number> {
  const r = await db!.execute({ sql: "DELETE FROM login_otps WHERE expires_at < ?", args: [now] })
  return Number(r.rowsAffected || 0)
}
export async function deleteExpiredSessions(now = Date.now()): Promise<number> {
  const r = await db!.execute({ sql: "DELETE FROM sessions WHERE expires_at < ?", args: [now] })
  return Number(r.rowsAffected || 0)
}
// Screenshots are deleted in two steps so the caller can purge the S3 object too: first collect the keys
// of rows past their (non-null) expires_at, then DELETE those rows. Rows with a NULL expires_at never expire.
export async function expiredScreenshotKeys(now = Date.now()): Promise<{ id: string; s3Key: string }[]> {
  const r = await db!.execute({ sql: "SELECT id, s3_key FROM screenshots WHERE expires_at IS NOT NULL AND expires_at < ?", args: [now] })
  return r.rows.map((x: any) => ({ id: String(x.id), s3Key: String(x.s3_key) }))
}
export async function deleteScreenshotRow(id: string): Promise<void> {
  await db!.execute({ sql: "DELETE FROM screenshots WHERE id=?", args: [id] })
}

// ── accounts / projects / two-tier roles (P2) ──
// Back-compat: `workspaceId` in Membership is the ACCOUNT id (== old workspace id), `role` is the
// effective account-level role mapped to the legacy admin|user vocabulary so old callers keep working.
export type Membership = { workspaceId: string; role: string; name: string }
export type ProjectRow = {
  id: string; accountId: string; name: string; status: string
  reviewMode: string; reviewBudgetDaily: number | null; observabilityMode: string
  autosimAuthStatus: string
  createdAt: number; updatedAt: number
  widgetMode: string; widgetCtaUrl: string | null; widgetNotifyEmail: string | null
  widgetReportGate: string
  instructionsMd?: string | null
  trailsAutofileEnabled: boolean
  siteUrl: string | null
}
function rowToProject(x: any): ProjectRow {
  return {
    id: String(x.id), accountId: String(x.account_id), name: String(x.name),
    status: String(x.status || "active"), reviewMode: String(x.review_mode || "auto"),
    reviewBudgetDaily: x.review_budget_daily != null ? Number(x.review_budget_daily) : null,
    observabilityMode: String(x.observability_mode || "named"),
    autosimAuthStatus: String(x.autosim_auth_status || "unregistered"),
    createdAt: Number(x.created_at), updatedAt: Number(x.updated_at),
    widgetMode: String(x.widget_mode || "support"),
    widgetCtaUrl: x.widget_cta_url != null ? String(x.widget_cta_url) : null,
    widgetNotifyEmail: x.widget_notify_email != null ? String(x.widget_notify_email) : null,
    widgetReportGate: ["anonymous", "email", "login"].includes(String(x.widget_report_gate)) ? String(x.widget_report_gate) : "anonymous",
    instructionsMd: x.instructions_md != null ? String(x.instructions_md) : undefined,
    trailsAutofileEnabled: !!x.trails_autofile_enabled,
    siteUrl: x.site_url != null ? String(x.site_url) : null,
  }
}

// SHIM over the new model so legacy callsites (membershipsFor(me)[0]) keep working.
// Returns one row per ACCOUNT the user belongs to, role mapped owner|admin→'admin', member→'user'.
export async function membershipsFor(email: string): Promise<Membership[]> {
  const r = await db!.execute({
    sql: `SELECT am.account_id, am.account_role, a.name, am.created_at
          FROM account_members am JOIN accounts a ON a.id=am.account_id
          WHERE am.email=? ORDER BY am.created_at ASC`,
    args: [email],
  })
  return r.rows.map((x: any) => ({
    workspaceId: String(x.account_id),
    role: String(x.account_role) === "member" ? "user" : "admin",
    name: String(x.name),
  }))
}

// "Has any account_members/project_members row" — used for the OTP allowlist bypass.
export async function hasAnyMembership(email: string): Promise<boolean> {
  const r = await db!.execute({
    sql: `SELECT 1 FROM account_members WHERE email=? UNION SELECT 1 FROM project_members WHERE email=? LIMIT 1`,
    args: [email, email],
  })
  return r.rows.length > 0
}

// On first login: ensure account + owner account_member + default project + project-admin member. Idempotent.
// Persist the company domain on an account (used to tell clients from your own team).
export async function setAccountDomain(accountId: string, domain: string): Promise<void> {
  if (!db) return
  await db.execute({ sql: "UPDATE accounts SET domain=? WHERE id=?", args: [domain || null, accountId] })
}

// ── KLA-297: explicit onboarding-completed flag ──────────────────────────────────────────────
// Before this, "has this account been through setup?" was inferred from accounts.domain — but the
// wizard labels that field "Your website · optional", so the signal was wrong in BOTH directions:
// skip it and every /onboarding visit restarted the wizard; fill it and the wizard was unreachable
// forever. onboarded_at (ms epoch, NULL = not finished) is set once, at a wizard EXIT.
export async function markAccountOnboarded(accountId: string, at = Date.now()): Promise<void> {
  if (!db) return
  // COALESCE keeps the FIRST completion timestamp — deliberate re-entry (?again=1) must not
  // rewrite when this account originally finished setup.
  await db.execute({ sql: "UPDATE accounts SET onboarded_at=COALESCE(onboarded_at,?) WHERE id=?", args: [at, accountId] })
}

export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  if (!db) return false
  const r = await db.execute({ sql: "SELECT onboarded_at FROM accounts WHERE id=?", args: [accountId] })
  return r.rows.length > 0 && (r.rows[0] as any).onboarded_at != null
}

// One-shot backfill so no CURRENTLY-onboarded account suddenly gets thrown back into the wizard
// on the deploy that introduces onboarded_at. "Already onboarded" = the old domain signal, OR
// demonstrable prior activity (any feedback in any of the account's projects) — which catches the
// users the domain heuristic was wrong about (they finished the wizard but skipped the optional
// website field). Stamped with created_at: an honest "we don't know exactly when, but before now".
export async function backfillOnboardedAt(c: Client): Promise<{ backfilled: number }> {
  const migKey = "accounts_onboarded_at_backfill_kla297"
  const already = await c.execute({ sql: "SELECT key FROM schema_migrations WHERE key=?", args: [migKey] })
  if (already.rows.length) return { backfilled: 0 }
  const r = await c.execute({
    sql: `UPDATE accounts SET onboarded_at = created_at
          WHERE onboarded_at IS NULL
            AND ( (domain IS NOT NULL AND TRIM(domain) <> '')
               OR id IN (SELECT p.account_id FROM projects p JOIN feedback f ON f.project_id = p.id) )`,
  })
  const backfilled = Number(r.rowsAffected ?? 0)
  await c.execute({ sql: "INSERT INTO schema_migrations (key, applied_at) VALUES (?, ?)", args: [migKey, Date.now()] })
  console.log(`[backfillOnboardedAt] marked ${backfilled} pre-existing account(s) onboarded`)
  return { backfilled }
}

// `attr` (optional): the signing-up user's sanitized first-touch attribution (KLAVITYKLA-324),
// stamped onto the brand-new account row so "which channel produced this paying account" is a
// single query against accounts, no joins. Only applied when THIS call actually creates the
// account (existing.length === 0) — a returning user hitting ensureAccount as a no-op never
// touches account attribution.
export async function ensureAccount(email: string, attr?: SanitizedAttr | null): Promise<Membership[]> {
  const existing = await membershipsFor(email)
  if (existing.length) return existing
  const aid = crypto.randomUUID()
  const local = email.split("@")[0]
  const now = Date.now()
  await db!.execute({ sql: "INSERT OR IGNORE INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: [aid, `${local}'s Workspace`, email, now] })
  await db!.execute({ sql: "INSERT OR IGNORE INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", args: ["am_" + aid + "_" + email, aid, email, "owner", now] })
  await db!.execute({
    sql: `INSERT OR IGNORE INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: ["proj_" + aid, aid, "Default Project", "active", "auto", 200, "named", now, now],
  })
  await db!.execute({ sql: "INSERT OR IGNORE INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?)", args: ["pm_" + aid + "_" + email, "proj_" + aid, email, "admin", null, now] })
  if (attr) await setAccountAttribution(aid, attr)
  return membershipsFor(email)
}

// KLAVITYKLA-324: FIRST-TOUCH WINS (same COALESCE contract as setUserAttribution) — a later login
// from a different campaign link never clobbers the account's original acquisition source.
export async function setAccountAttribution(accountId: string, attr: SanitizedAttr | null): Promise<void> {
  if (!attr) return
  await db!.execute({
    sql: `UPDATE accounts SET
            utm_source = COALESCE(utm_source, ?),
            utm_medium = COALESCE(utm_medium, ?),
            utm_campaign = COALESCE(utm_campaign, ?)
          WHERE id = ?`,
    args: [attr.source ?? null, attr.medium ?? null, attr.campaign ?? null, accountId],
  })
}

// Read helper: which channel produced this (paid or free) account. One query, no joins — the
// entire point of persisting the utm trio onto accounts rather than only onto users.
export async function attributionForAccount(accountId: string): Promise<{ utmSource: string | null; utmMedium: string | null; utmCampaign: string | null } | null> {
  const r = await db!.execute({ sql: "SELECT utm_source, utm_medium, utm_campaign FROM accounts WHERE id=?", args: [accountId] })
  if (!r.rows.length) return null
  const row = r.rows[0] as any
  return {
    utmSource: row.utm_source != null ? String(row.utm_source) : null,
    utmMedium: row.utm_medium != null ? String(row.utm_medium) : null,
    utmCampaign: row.utm_campaign != null ? String(row.utm_campaign) : null,
  }
}

export async function accountRole(accountId: string, email: string): Promise<string | null> {
  const r = await db!.execute({ sql: "SELECT account_role FROM account_members WHERE account_id=? AND email=?", args: [accountId, email] })
  return r.rows.length ? String((r.rows[0] as any).account_role) : null
}

export async function projectById(projectId: string): Promise<ProjectRow | null> {
  const r = await db!.execute({ sql: "SELECT * FROM projects WHERE id=?", args: [projectId] })
  return r.rows.length ? rowToProject(r.rows[0]) : null
}

// Projects the caller can see: every project in an account they belong to (owner/admin see all),
// plus any project with an explicit project_members row (plain members).
export async function listProjects(email: string): Promise<ProjectRow[]> {
  const r = await db!.execute({
    sql: `SELECT DISTINCT p.* FROM projects p
          WHERE p.account_id IN (SELECT account_id FROM account_members WHERE email=?)
             OR p.id IN (SELECT project_id FROM project_members WHERE email=?)
          ORDER BY p.created_at ASC`,
    args: [email, email],
  })
  return r.rows.map(rowToProject)
}

export async function createProject(accountId: string, name: string, siteUrl?: string | null): Promise<ProjectRow> {
  const id = "proj_" + crypto.randomUUID()
  const now = Date.now()
  await db!.execute({
    // JTBD 1.7: new projects default to the 'anonymous' report gate (identity is asked post-submit, not
    // as a wall). Set explicitly rather than relying on the column DEFAULT — existing prod DBs created the
    // column with DEFAULT 'email', so an explicit value is the only way to flip the default for new rows
    // without a destructive column change. Owners who choose 'email'/'login' later keep their setting.
    sql: `INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,site_url,widget_report_gate,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, accountId, name, "active", "auto", 200, "named", siteUrl ?? null, "anonymous", now, now],
  })
  const p = await projectById(id)
  return p!
}

export type AutosimAuthMethod = "fixed_otp" | "mint_link"
export type AutosimAuthSetupToken = { id: string; projectId: string; token: string; expiresAt: number }
export type AutosimAuthSetupTokenInfo = { id: string; projectId: string; expiresAt: number }
export type AutosimAuthConfigEncrypted = {
  projectId: string
  method: AutosimAuthMethod
  email: string
  secretEnc: string
  notes: string | null
  createdAt: number
  updatedAt: number
}
export type AutosimAuthProbeRow = {
  id: string
  projectId: string
  method: AutosimAuthMethod
  email: string
  status: string
  error: string | null
  resumeSummary: unknown | null
  createdAt: number
  updatedAt: number
  finishedAt: number | null
}

function randomHex(bytes = 32): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes))
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function createAutosimAuthSetupToken(
  projectId: string,
  createdBy: string | null = null,
  ttlMs = 7 * 24 * 60 * 60 * 1000,
): Promise<AutosimAuthSetupToken> {
  const token = "aset_" + randomHex(32)
  const now = Date.now()
  const expiresAt = now + ttlMs
  const id = "aset_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO autosim_auth_setup_tokens
            (id, project_id, token_hash, created_by, created_at, expires_at, revoked_at, used_at)
          VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)`,
    args: [id, projectId, sha256hex(token), createdBy, now, expiresAt],
  })
  return { id, projectId, token, expiresAt }
}

export async function resolveAutosimAuthSetupToken(token: string): Promise<AutosimAuthSetupTokenInfo | null> {
  if (!token || !token.startsWith("aset_")) return null
  const r = await db!.execute({
    sql: `SELECT id, project_id, expires_at
          FROM autosim_auth_setup_tokens
          WHERE token_hash=? AND revoked_at IS NULL AND used_at IS NULL AND expires_at>?`,
    args: [sha256hex(token), Date.now()],
  })
  if (!r.rows.length) return null
  const row: any = r.rows[0]
  return { id: String(row.id), projectId: String(row.project_id), expiresAt: Number(row.expires_at) }
}

export async function revokeAutosimAuthSetupToken(projectId: string, tokenId: string): Promise<boolean> {
  const r = await db!.execute({
    sql: `UPDATE autosim_auth_setup_tokens SET revoked_at=?
          WHERE id=? AND project_id=? AND revoked_at IS NULL AND used_at IS NULL`,
    args: [Date.now(), tokenId, projectId],
  })
  return Number(r.rowsAffected || 0) > 0
}

export async function registerAutosimAuthConfig(
  projectId: string,
  tokenId: string,
  input: { method: AutosimAuthMethod; email: string; secret: string; notes?: string | null },
): Promise<{ probeId: string } | null> {
  if (input.method === "mint_link") {
    const s = input.secret.trim()
    if (/^https?:\/\//i.test(s)) throw new Error("mint_link secret must be an opaque token or same-origin /test-login path")
    if (s.startsWith("/")) {
      let pathname = ""
      try { pathname = new URL(s, "https://example.invalid").pathname } catch {}
      if (pathname !== "/test-login") throw new Error("mint_link path must be /test-login")
    }
  }
  const now = Date.now()
  const secretEnc = await encryptSecret(input.secret)
  const consumed = await db!.execute({
    sql: `UPDATE autosim_auth_setup_tokens SET used_at=?
          WHERE id=? AND project_id=? AND revoked_at IS NULL AND used_at IS NULL AND expires_at>?`,
    args: [now, tokenId, projectId, now],
  })
  if (Number(consumed.rowsAffected || 0) <= 0) return null
  await db!.execute({
    sql: `INSERT INTO autosim_auth_configs (project_id, method, email, secret_enc, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(project_id) DO UPDATE SET
            method=excluded.method,
            email=excluded.email,
            secret_enc=excluded.secret_enc,
            notes=excluded.notes,
            updated_at=excluded.updated_at`,
    args: [projectId, input.method, input.email, secretEnc, input.notes ?? null, now, now],
  })
  await db!.execute({ sql: "UPDATE projects SET autosim_auth_status='registered', updated_at=? WHERE id=?", args: [now, projectId] })
  const probeId = "aatp_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO autosim_auth_probe_queue (id, project_id, method, email, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'queued', ?, ?)`,
    args: [probeId, projectId, input.method, input.email, now, now],
  })
  return { probeId }
}

/** Backward-compat alias — autosim-auth-exec.ts (AT6) uses this name; probe-verify uses AutosimAuthConfigEncrypted. */
export type AutosimAuthConfigRow = AutosimAuthConfigEncrypted

function rowToAutosimAuthConfig(row: any): AutosimAuthConfigEncrypted {
  return {
    projectId: String(row.project_id),
    method: String(row.method) as AutosimAuthMethod,
    email: String(row.email),
    secretEnc: String(row.secret_enc),
    notes: row.notes == null ? null : String(row.notes),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }
}

function rowToAutosimAuthProbe(row: any): AutosimAuthProbeRow {
  let resumeSummary: unknown | null = null
  try { if (row.resume_summary_json) resumeSummary = JSON.parse(String(row.resume_summary_json)) } catch {}
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    method: String(row.method) as AutosimAuthMethod,
    email: String(row.email),
    status: String(row.status),
    error: row.error == null ? null : String(row.error),
    resumeSummary,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    finishedAt: row.finished_at == null ? null : Number(row.finished_at),
  }
}

export async function getAutosimAuthConfigEncrypted(projectId: string): Promise<AutosimAuthConfigEncrypted | null> {
  const r = await db!.execute({
    sql: `SELECT project_id, method, email, secret_enc, notes, created_at, updated_at
          FROM autosim_auth_configs WHERE project_id=?`,
    args: [projectId],
  })
  if (!r.rows.length) return null
  return rowToAutosimAuthConfig(r.rows[0])
}

/** Alias — AT6 (autosim-auth-exec.ts) imports this name. */
export const getAutosimAuthConfigRaw = getAutosimAuthConfigEncrypted

export async function getAutosimAuthProbe(probeId: string): Promise<AutosimAuthProbeRow | null> {
  const r = await db!.execute({ sql: `SELECT * FROM autosim_auth_probe_queue WHERE id=?`, args: [probeId] })
  if (!r.rows.length) return null
  return rowToAutosimAuthProbe(r.rows[0])
}

export async function markAutosimAuthProbeRunning(probeId: string): Promise<AutosimAuthProbeRow | null> {
  const now = Date.now()
  const updated = await db!.execute({
    sql: `UPDATE autosim_auth_probe_queue
          SET status='running', updated_at=?, error=NULL, resume_summary_json=NULL, finished_at=NULL
          WHERE id=? AND status IN ('queued','red','failed')`,
    args: [now, probeId],
  })
  if (Number(updated.rowsAffected || 0) <= 0) return getAutosimAuthProbe(probeId)
  return getAutosimAuthProbe(probeId)
}

export async function finishAutosimAuthProbe(input: {
  probeId: string
  projectId: string
  ok: boolean
  error?: string | null
  /** ok=true but no real login was performed (fixed_otp format-check) — do NOT promote to verified. */
  unverifiedLogin?: boolean
  resumeSummary?: unknown
}): Promise<void> {
  const now = Date.now()
  const status = input.ok ? "green" : "red"
  await db!.execute({
    sql: `UPDATE autosim_auth_probe_queue
          SET status=?, error=?, resume_summary_json=?, updated_at=?, finished_at=?
          WHERE id=? AND project_id=?`,
    args: [
      status,
      input.error ?? null,
      input.resumeSummary === undefined ? null : JSON.stringify(input.resumeSummary),
      now,
      now,
      input.probeId,
      input.projectId,
    ],
  })
  if (input.ok && !input.unverifiedLogin) {
    await db!.execute({ sql: "UPDATE projects SET autosim_auth_status='verified', updated_at=? WHERE id=?", args: [now, input.projectId] })
  } else if (input.ok) {
    // Probe passed format checks only (fixed_otp): stay "registered" until a walk truly logs in.
    await db!.execute({ sql: "UPDATE projects SET autosim_auth_status='registered', updated_at=? WHERE id=? AND autosim_auth_status!='verified'", args: [now, input.projectId] })
  } else {
    await db!.execute({ sql: "UPDATE projects SET autosim_auth_status='registered', updated_at=? WHERE id=? AND autosim_auth_status!='verified'", args: [now, input.projectId] })
  }
}

// Rename a project (name only). Used by the signup onboarding to name the auto-created Default Project
// without spawning a duplicate. Caller must enforce projectAccess('admin'). Returns the updated row.
export async function renameProject(projectId: string, name: string): Promise<ProjectRow | null> {
  await db!.execute({ sql: "UPDATE projects SET name=?, updated_at=? WHERE id=?", args: [name, Date.now(), projectId] })
  return projectById(projectId)
}

export async function getProjectModalConfig(projectId: string): Promise<Record<string, unknown>> {
  const r = await db!.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
  if (!r.rows.length) return {}
  try { return JSON.parse(String((r.rows[0] as any).modal_config_json || "{}")) || {} } catch { return {} }
}

export async function setProjectModalConfig(projectId: string, config: Record<string, unknown>): Promise<void> {
  await db!.execute({ sql: "UPDATE projects SET modal_config_json=?, updated_at=? WHERE id=?", args: [JSON.stringify(config || {}), Date.now(), projectId] })
}

// Paid/partner plans that unlock Pro-gated features. 'partner' = unlimited internal/partner access.
// 'founding' = Founding Team annual supporter tier (KLAVITYKLA-336) — treated as a paid plan.
const PRO_PLANS = new Set(["pro", "team", "agency", "founding", "scale", "partner"])

export function planIsPro(plan: string): boolean { return PRO_PLANS.has(plan) }
export function planIsUnlimited(plan: string): boolean { return plan === 'partner' || plan === 'scale' }

export async function accountPlan(accountId: string): Promise<string> {
  const r = await db!.execute({ sql: "SELECT plan FROM accounts WHERE id=?", args: [accountId] })
  return r.rows.length ? String((r.rows[0] as any).plan || "free") : "free"
}
export async function isAccountPro(accountId: string): Promise<boolean> {
  return planIsPro(await accountPlan(accountId))
}
// 'partner' is the unlimited tier — use for any usage/quota gate that should be fully bypassed.
export async function isAccountUnlimited(accountId: string): Promise<boolean> {
  return planIsUnlimited(await accountPlan(accountId))
}
export async function setAccountPlan(accountId: string, plan: string): Promise<void> {
  await db!.execute({ sql: "UPDATE accounts SET plan=? WHERE id=?", args: [String(plan || "free"), accountId] })
  await db!.execute({
    sql: "UPDATE projects SET billing_plan=?, billing_updated_at=? WHERE account_id=?",
    args: [String(plan || "free"), Date.now(), accountId],
  })
}

// ── KLAVITYKLA-315: partner-code redemption ledger [JTBD 8.11] ──────────────────
// A durable, auditable record of every successful partner/discount code redemption.
export type PartnerCodeRedemption = {
  id: string
  code: string
  accountId: string
  redeemedBy: string | null
  grantedPlan: string
  source: string
  redeemedAt: number
}

function rowToRedemption(row: any): PartnerCodeRedemption {
  return {
    id: String(row.id),
    code: String(row.code),
    accountId: String(row.account_id),
    redeemedBy: row.redeemed_by != null ? String(row.redeemed_by) : null,
    grantedPlan: String(row.granted_plan),
    source: String(row.source),
    redeemedAt: Number(row.redeemed_at),
  }
}

// Record one redemption row. Code is normalized (trim + UPPERCASE) so the ledger is
// consistent with how codes are matched at redemption time. Returns the stored row.
export async function recordPartnerCodeRedemption(input: {
  code: string
  accountId: string
  redeemedBy?: string | null
  grantedPlan: string
  source?: string
}): Promise<PartnerCodeRedemption> {
  const row: PartnerCodeRedemption = {
    id: "pcr_" + crypto.randomUUID(),
    code: String(input.code || "").trim().toUpperCase(),
    accountId: String(input.accountId),
    redeemedBy: input.redeemedBy != null ? String(input.redeemedBy) : null,
    grantedPlan: String(input.grantedPlan || "partner"),
    source: String(input.source || "api"),
    redeemedAt: Date.now(),
  }
  await db!.execute({
    sql: `INSERT INTO partner_code_redemptions (id, code, account_id, redeemed_by, granted_plan, source, redeemed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [row.id, row.code, row.accountId, row.redeemedBy, row.grantedPlan, row.source, row.redeemedAt],
  })
  return row
}

// List redemptions, newest first. Filter by code and/or account when provided.
export async function listPartnerCodeRedemptions(opts: {
  code?: string
  accountId?: string
  limit?: number
} = {}): Promise<PartnerCodeRedemption[]> {
  const where: string[] = []
  const args: any[] = []
  if (opts.code != null) { where.push("code = ?"); args.push(String(opts.code).trim().toUpperCase()) }
  if (opts.accountId != null) { where.push("account_id = ?"); args.push(String(opts.accountId)) }
  const limit = Math.max(1, Math.min(1000, Number(opts.limit) || 500))
  const sql = `SELECT * FROM partner_code_redemptions${where.length ? " WHERE " + where.join(" AND ") : ""}
               ORDER BY redeemed_at DESC LIMIT ?`
  const r = await db!.execute({ sql, args: [...args, limit] })
  return r.rows.map(rowToRedemption)
}

// Total number of tool users (rows in `users`). Used to gate PostHog session replay
// to roughly the first ~50 users (KLAVITYKLA-329). Degrades to 0 when there's no DB.
export async function countUsers(): Promise<number> {
  if (!db) return 0
  const r = await db.execute({ sql: "SELECT COUNT(*) AS n FROM users" })
  return Number((r.rows[0] as any)?.n || 0)
}

// How many times a given code has been redeemed (for per-code cap enforcement/reporting).
export async function countPartnerCodeRedemptions(code: string): Promise<number> {
  const r = await db!.execute({
    sql: "SELECT COUNT(*) AS n FROM partner_code_redemptions WHERE code = ?",
    args: [String(code || "").trim().toUpperCase()],
  })
  return Number((r.rows[0] as any)?.n || 0)
}

export type AccountBillingState = {
  accountId: string
  plan: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  billingStatus: string | null
  billingInterval: string | null
  billingCurrentPeriodEnd: number | null
  billingCancelAtPeriodEnd: boolean
  billingUpdatedAt: number | null
}

function rowToAccountBilling(row: any, accountId: string): AccountBillingState {
  return {
    accountId,
    plan: String(row?.plan || "free"),
    stripeCustomerId: row?.stripe_customer_id != null ? String(row.stripe_customer_id) : null,
    stripeSubscriptionId: row?.stripe_subscription_id != null ? String(row.stripe_subscription_id) : null,
    billingStatus: row?.billing_status != null ? String(row.billing_status) : null,
    billingInterval: row?.billing_interval != null ? String(row.billing_interval) : null,
    billingCurrentPeriodEnd: row?.billing_current_period_end != null ? Number(row.billing_current_period_end) : null,
    billingCancelAtPeriodEnd: Number(row?.billing_cancel_at_period_end || 0) === 1,
    billingUpdatedAt: row?.billing_updated_at != null ? Number(row.billing_updated_at) : null,
  }
}

export async function accountBillingState(accountId: string): Promise<AccountBillingState> {
  const r = await db!.execute({
    sql: `SELECT plan, stripe_customer_id, stripe_subscription_id, billing_status, billing_interval,
                 billing_current_period_end, billing_cancel_at_period_end, billing_updated_at
          FROM accounts WHERE id=?`,
    args: [accountId],
  })
  return rowToAccountBilling(r.rows[0] as any, accountId)
}

export async function accountIdForStripeCustomer(customerId: string): Promise<string | null> {
  const r = await db!.execute({ sql: "SELECT id FROM accounts WHERE stripe_customer_id=? LIMIT 1", args: [customerId] })
  return r.rows.length ? String((r.rows[0] as any).id) : null
}

// KLAVITYKLA-336: resolve an account by its owner_email — used to entitle a cold hosted-Payment-Link
// purchase (no account_id metadata) via the buyer's checkout email. Oldest matching account wins if
// somehow more than one row shares an owner_email (shouldn't happen — owner_email is set once at
// ensureAccount time — but stay deterministic rather than picking an arbitrary row).
export async function accountIdForOwnerEmail(email: string): Promise<string | null> {
  const e = String(email || "").trim().toLowerCase()
  if (!e) return null
  const r = await db!.execute({ sql: "SELECT id FROM accounts WHERE lower(owner_email)=? ORDER BY created_at ASC LIMIT 1", args: [e] })
  return r.rows.length ? String((r.rows[0] as any).id) : null
}

export async function accountIdForStripeSubscription(subscriptionId: string): Promise<string | null> {
  const r = await db!.execute({ sql: "SELECT id FROM accounts WHERE stripe_subscription_id=? LIMIT 1", args: [subscriptionId] })
  return r.rows.length ? String((r.rows[0] as any).id) : null
}

export async function updateAccountBillingState(
  accountId: string,
  state: {
    plan: string
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    billingStatus?: string | null
    billingInterval?: string | null
    billingCurrentPeriodEnd?: number | null
    billingCancelAtPeriodEnd?: boolean
  },
): Promise<void> {
  const now = Date.now()
  await db!.execute({
    sql: `UPDATE accounts SET
            plan=?,
            stripe_customer_id=COALESCE(?, stripe_customer_id),
            stripe_subscription_id=?,
            billing_status=?,
            billing_interval=?,
            billing_current_period_end=?,
            billing_cancel_at_period_end=?,
            billing_updated_at=?
          WHERE id=?`,
    args: [
      String(state.plan || "free"),
      state.stripeCustomerId ?? null,
      state.stripeSubscriptionId ?? null,
      state.billingStatus ?? null,
      state.billingInterval ?? null,
      state.billingCurrentPeriodEnd ?? null,
      state.billingCancelAtPeriodEnd ? 1 : 0,
      now,
      accountId,
    ],
  })
  await db!.execute({
    sql: "UPDATE projects SET billing_plan=?, billing_status=?, billing_updated_at=? WHERE account_id=?",
    args: [String(state.plan || "free"), state.billingStatus ?? null, now, accountId],
  })
}

// ── widget-config helpers (leadgen integration task-1) ──
const DEFAULT_WIDGET_CTA = "https://klavity.in/onboarding"

export async function getWidgetConfig(projectId: string): Promise<{ mode: string; ctaUrl: string; reportGate: string } | null> {
  const p = await projectById(projectId)
  if (!p) return null
  const mode = ["support", "leadgen", "off"].includes(p.widgetMode) ? p.widgetMode : "support"
  const reportGate = ["anonymous", "email", "login"].includes(p.widgetReportGate) ? p.widgetReportGate : "anonymous"
  return { mode, ctaUrl: p.widgetCtaUrl || DEFAULT_WIDGET_CTA, reportGate }
}

export async function getWidgetNotifyEmail(projectId: string): Promise<string | null> {
  const p = await projectById(projectId)
  return p?.widgetNotifyEmail || null
}

export async function setWidgetConfig(projectId: string, cfg: { mode?: string; ctaUrl?: string | null; notifyEmail?: string | null; reportGate?: string }): Promise<void> {
  const sets: string[] = [], args: any[] = []
  if (cfg.mode !== undefined) { sets.push("widget_mode=?"); args.push(["support", "leadgen", "off"].includes(cfg.mode) ? cfg.mode : "support") }
  if (cfg.ctaUrl !== undefined) { sets.push("widget_cta_url=?"); args.push(cfg.ctaUrl || null) }
  if (cfg.notifyEmail !== undefined) { sets.push("widget_notify_email=?"); args.push(cfg.notifyEmail || null) }
  if (cfg.reportGate !== undefined) { sets.push("widget_report_gate=?"); args.push(["anonymous", "email", "login"].includes(cfg.reportGate) ? cfg.reportGate : "anonymous") }
  if (!sets.length) return
  sets.push("updated_at=?"); args.push(Date.now()); args.push(projectId)
  await db!.execute({ sql: `UPDATE projects SET ${sets.join(", ")} WHERE id=?`, args })
}

export async function setProjectTrailsAutofile(projectId: string, enabled: boolean): Promise<void> {
  await db!.execute({ sql: "UPDATE projects SET trails_autofile_enabled=?, updated_at=? WHERE id=?", args: [enabled ? 1 : 0, Date.now(), projectId] })
}

export async function setFeedbackContactEmail(feedbackId: string, projectId: string, email: string): Promise<boolean> {
  const r = await db!.execute({ sql: "UPDATE feedback SET contact_email=? WHERE id=? AND project_id=?", args: [email, feedbackId, projectId] })
  return (r.rowsAffected ?? 0) > 0
}

// ── widget heartbeat helpers ──
// recordWidgetPing: upsert the (project, host) row, bumping last_seen + hits. Best-effort idempotent.
// The host is already validated/normalized by the caller; we store it verbatim (lowercased, ≤200 chars).
export async function recordWidgetPing(projectId: string, host: string): Promise<void> {
  const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO widget_pings (project_id, host, first_seen, last_seen, hits)
          VALUES (?,?,?,?,1)
          ON CONFLICT(project_id, host) DO UPDATE SET last_seen=excluded.last_seen, hits=hits+1`,
    args: [projectId, host, now, now],
  })
}

// latestWidgetPing: the most-recently-seen host for a project (drives the dashboard indicator), or null
// if the widget has never phoned home for this project.
export async function latestWidgetPing(projectId: string): Promise<{ host: string; lastSeen: number; firstSeen: number; hits: number } | null> {
  const r = await db!.execute({
    sql: "SELECT host, last_seen, first_seen, hits FROM widget_pings WHERE project_id=? ORDER BY last_seen DESC LIMIT 1",
    args: [projectId],
  })
  if (!r.rows.length) return null
  const row = r.rows[0] as any
  return { host: String(row.host), lastSeen: Number(row.last_seen), firstSeen: Number(row.first_seen), hits: Number(row.hits) }
}

// countRecentFeedback: how many reports landed for a project since `sinceMs` (epoch ms). Powers the
// heartbeat diagnosis (KLA-295) — "widget loads but no reports arrived" is a distinct failure from
// "widget never loaded". Indexed COUNT(*) on fb_proj_idx; best-effort (throws bubble to the caller).
export async function countRecentFeedback(projectId: string, sinceMs: number): Promise<number> {
  const r = await db!.execute({
    sql: "SELECT COUNT(*) AS n FROM feedback WHERE project_id=? AND created_at>=?",
    args: [projectId, sinceMs],
  })
  return Number((r.rows[0] as any).n)
}

// §2.3 effective role: max(account_role, project_role); account owner/admin ⇒ implicit project-admin.
export async function projectAccess(email: string, projectId: string): Promise<'admin' | 'member' | null> {
  const proj = await projectById(projectId)
  if (!proj) return null
  const acctRole = await accountRole(proj.accountId, email)
  if (acctRole === "owner" || acctRole === "admin") return "admin"
  const r = await db!.execute({ sql: "SELECT project_role FROM project_members WHERE project_id=? AND email=?", args: [projectId, email] })
  if (r.rows.length) return String((r.rows[0] as any).project_role) === "admin" ? "admin" : "member"
  if (acctRole === "member") return null // account member with no explicit project row sees nothing
  return null
}

// Project roster (project_members). Returns email/role/createdAt for the dashboard team panel.
export async function membersOfProject(projectId: string) {
  const r = await db!.execute({ sql: "SELECT email, project_role, created_at FROM project_members WHERE project_id=? ORDER BY created_at ASC", args: [projectId] })
  return r.rows.map((x: any) => ({ email: String(x.email), role: String(x.project_role), createdAt: Number(x.created_at) }))
}

// Invite/add a member to a project. Also ensures an account_members(member) row for account visibility.
export async function addProjectMember(projectId: string, accountId: string, email: string, projectRole: string, invitedBy?: string | null) {
  await upsertUser(email)
  const now = Date.now()
  await db!.execute({ sql: "INSERT OR IGNORE INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", args: ["am_" + accountId + "_" + email, accountId, email, "member", now] })
  await db!.execute({ sql: "INSERT INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(project_id,email) DO NOTHING", args: ["pm_" + projectId + "_" + email, projectId, email, projectRole === "admin" ? "admin" : "member", invitedBy ?? null, now] })
}

export type TicketAssignmentInvite = {
  id: string
  projectId: string
  email: string
  invitedBy: string | null
  feedbackId: string | null
  status: string
  createdAt: number
  lastSentAt: number | null
  acceptedAt: number | null
}

function rowToTicketAssignmentInvite(x: any): TicketAssignmentInvite {
  return {
    id: String(x.id),
    projectId: String(x.project_id),
    email: String(x.email),
    invitedBy: x.invited_by != null ? String(x.invited_by) : null,
    feedbackId: x.feedback_id != null ? String(x.feedback_id) : null,
    status: String(x.status),
    createdAt: Number(x.created_at),
    lastSentAt: x.last_sent_at != null ? Number(x.last_sent_at) : null,
    acceptedAt: x.accepted_at != null ? Number(x.accepted_at) : null,
  }
}

export async function upsertTicketAssignmentInvite(projectId: string, email: string, invitedBy: string | null, feedbackId: string | null): Promise<TicketAssignmentInvite> {
  const now = Date.now()
  const normalizedEmail = email.trim().toLowerCase()
  await db!.execute({
    sql: `INSERT INTO ticket_assignment_invites (id,project_id,email,invited_by,feedback_id,status,created_at,last_sent_at)
          VALUES (?,?,?,?,?,'pending',?,?)
          ON CONFLICT(project_id,email) DO UPDATE SET
            invited_by=excluded.invited_by,
            feedback_id=excluded.feedback_id,
            status='pending',
            last_sent_at=excluded.last_sent_at`,
    args: ["tai_" + crypto.randomUUID(), projectId, normalizedEmail, invitedBy, feedbackId, now, now],
  })
  const r = await db!.execute({
    sql: "SELECT * FROM ticket_assignment_invites WHERE project_id=? AND email=?",
    args: [projectId, normalizedEmail],
  })
  return rowToTicketAssignmentInvite(r.rows[0])
}

export async function hasPendingTicketAssignmentInvite(email: string): Promise<boolean> {
  const r = await db!.execute({
    sql: "SELECT 1 FROM ticket_assignment_invites WHERE email=? AND status='pending' LIMIT 1",
    args: [email.trim().toLowerCase()],
  })
  return r.rows.length > 0
}

export async function acceptPendingTicketAssignmentInvites(email: string): Promise<Array<{ projectId: string; projectName: string; feedbackId: string | null }>> {
  const normalizedEmail = email.trim().toLowerCase()
  const r = await db!.execute({
    sql: `SELECT i.project_id, i.feedback_id, i.invited_by, p.account_id, p.name
          FROM ticket_assignment_invites i
          JOIN projects p ON p.id=i.project_id
          WHERE i.email=? AND i.status='pending'
          ORDER BY i.created_at ASC`,
    args: [normalizedEmail],
  })
  const accepted: Array<{ projectId: string; projectName: string; feedbackId: string | null }> = []
  const now = Date.now()
  for (const row of r.rows as any[]) {
    const projectId = String(row.project_id)
    await addProjectMember(projectId, String(row.account_id), normalizedEmail, "member", row.invited_by != null ? String(row.invited_by) : "assignment-invite")
    await db!.execute({
      sql: "UPDATE ticket_assignment_invites SET status='accepted', accepted_at=? WHERE project_id=? AND email=? AND status='pending'",
      args: [now, projectId, normalizedEmail],
    })
    accepted.push({ projectId, projectName: String(row.name), feedbackId: row.feedback_id != null ? String(row.feedback_id) : null })
  }
  return accepted
}

// ── legacy shims (kept so any un-migrated callsite still compiles/behaves) ──
export async function ensureWorkspace(email: string): Promise<Membership[]> { return ensureAccount(email) }
// Account roster mapped to legacy admin|user vocabulary (owner/admin → 'admin', member → 'user').
export async function membersOf(accountId: string) {
  const r = await db!.execute({ sql: "SELECT email, account_role, created_at FROM account_members WHERE account_id=? ORDER BY created_at ASC", args: [accountId] })
  return r.rows.map((x: any) => ({ email: String(x.email), role: String(x.account_role) === "member" ? "user" : "admin", createdAt: Number(x.created_at) }))
}
export async function roleIn(accountId: string, email: string): Promise<string | null> {
  const role = await accountRole(accountId, email)
  if (role == null) return null
  return role === "member" ? "user" : "admin"
}

// ── integrations (tracker connections) ──
export type IntegrationScope = 'account' | 'project' | 'user' | 'workspace'
export type StoredIntegration = { integration: string; config: any; updatedAt: number }
export async function getIntegration(scope: IntegrationScope, ownerId: string): Promise<StoredIntegration | null> {
  const r = await db!.execute({ sql: "SELECT integration, config_json, updated_at FROM integrations WHERE scope=? AND owner_id=?", args: [scope, ownerId] })
  if (!r.rows.length) return null
  const x = r.rows[0] as any
  return { integration: String(x.integration), config: JSON.parse(String(x.config_json)), updatedAt: Number(x.updated_at) }
}
export async function setIntegration(scope: IntegrationScope, ownerId: string, integration: string, config: any) {
  await db!.execute({
    sql: "INSERT INTO integrations (scope,owner_id,integration,config_json,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(scope,owner_id) DO UPDATE SET integration=excluded.integration, config_json=excluded.config_json, updated_at=excluded.updated_at",
    args: [scope, ownerId, integration, JSON.stringify(config), Date.now()],
  })
}
export async function deleteIntegration(scope: IntegrationScope, ownerId: string) {
  await db!.execute({ sql: "DELETE FROM integrations WHERE scope=? AND owner_id=?", args: [scope, ownerId] })
}

// ── personas (Sims) — project-scoped as of P2 (insights_json kept; P3 normalizes to sim_traits) ──
// v3 persona CORE — the portable persona identity that travels to any product/site. REACT grounds
// reactions in it (see REACT_SYS). goals / watchFor are string arrays; the rest are short strings.
export type PersonaCore = {
  goals: string[]; expertise: string; temperament: string; voice: string; watchFor: string[]
}
export type PersonaRow = {
  id: string; projectId: string; name: string; role: string; type: string
  initials: string; accent: string; summary: string; insights: any[]; avatar: string | null
  createdAt: number; updatedAt: number; traitCount?: number
  // v3 two-axis classification + portable core. Optional so pre-v3 rows/callers keep working.
  simClass?: string | null; side?: string | null; core?: PersonaCore | null
  // Global Sims v1: is_global=1 means this Sim is available across all projects in the same account.
  // isGlobal=true on a row returned for a sibling project means it came from another project.
  isGlobal?: boolean
  // KLAVITYKLA-301: which Add-a-Sim path created this Sim. NULL = legacy/unknown.
  simSource?: string | null
}
// Parse a JSON string-array column defensively (bad/absent JSON → []).
function parseStrArray(raw: any): string[] {
  if (raw == null) return []
  try { const a = JSON.parse(String(raw)); return Array.isArray(a) ? a.map((x) => String(x)) : [] } catch { return [] }
}
function rowToPersona(x: any): PersonaRow {
  const simClass = x.sim_class != null ? String(x.sim_class) : null
  const side = x.side != null ? String(x.side) : null
  // Assemble the core only when at least one core field is populated; otherwise leave it null so
  // REACT can tell a v3 persona (has core) from a legacy one (no core) at runtime.
  const goals = parseStrArray(x.goals_json)
  const watchFor = parseStrArray(x.watchfor_json)
  const expertise = x.expertise != null ? String(x.expertise) : ""
  const temperament = x.temperament != null ? String(x.temperament) : ""
  const voice = x.voice != null ? String(x.voice) : ""
  const hasCore = goals.length || watchFor.length || expertise || temperament || voice
  return {
    id: String(x.id), projectId: String(x.project_id), name: String(x.name),
    role: String(x.role || ""), type: String(x.type || "client"),
    initials: String(x.initials || ""), accent: String(x.accent || "#6366f1"),
    summary: String(x.summary || ""), insights: x.insights_json ? JSON.parse(String(x.insights_json)) : [],
    avatar: x.avatar ? String(x.avatar) : null, createdAt: Number(x.created_at), updatedAt: Number(x.updated_at),
    traitCount: x.trait_count != null ? Number(x.trait_count) : undefined,
    simClass, side,
    core: hasCore ? { goals, expertise, temperament, voice, watchFor } : null,
    isGlobal: !!x.is_global,
    simSource: x.sim_source != null ? String(x.sim_source) : null,
  }
}
export async function listPersonas(projectId: string): Promise<PersonaRow[]> {
  const r = await db!.execute({
    sql: `SELECT p.*, (SELECT COUNT(*) FROM sim_traits t WHERE t.sim_id=p.id AND t.status='active') AS trait_count
          FROM personas p WHERE p.project_id=? ORDER BY p.created_at ASC`,
    args: [projectId],
  })
  const all = r.rows.map(rowToPersona)
  // Defensive read-side dedup: collapse exact name+role duplicates (case/space-insensitive),
  // keeping the earliest-created row. Fixes already-duplicated projects (e.g. Charantra) without
  // a data migration. Prevention happens at write time in POST /api/personas, but this is a
  // belt-and-suspenders guard that makes the list always clean regardless of DB state.
  const seen = new Map<string, boolean>()
  return all.filter(p => {
    const key = String(p.name || "").trim().toLowerCase().replace(/\s+/g, " ") +
                "\x00" +
                String(p.role || "").trim().toLowerCase().replace(/\s+/g, " ")
    if (seen.has(key)) return false
    seen.set(key, true)
    return true
  })
}

// ── Global Sims v1: list personas for a project INCLUDING global Sims from sibling projects. ──
// Ownership / tenant safety: a global Sim is ONLY surfaced in projects that share the SAME account_id
// as the Sim's home project. The query joins via the projects table on account_id — so a global Sim
// can never leak to a different account even if the caller somehow knows another project's id.
//
// Dedup policy (explicit, to avoid ambiguity):
//   1. The home project sees the Sim as a normal row (isGlobal=true on the row, but it's "home").
//   2. Sibling projects see global Sims tagged isGlobal=true.
//   3. If a sibling already has its OWN Sim with the same normalized name+role, we prefer the
//      project's own Sim and SKIP the global — "local wins". This prevents a global "Power User"
//      from shadowing a project-specific "Power User" that has different traits.
//   4. In the home project itself the global Sim appears once (same as any own Sim; the read-side
//      dedup below handles any DB duplicates).
//
// The function resolves the account_id for `projectId` in one round-trip (projectById is cached-ish
// by the in-memory SQLite file), then does a UNION ALL query: own rows + sibling global rows.
export async function listPersonasForProject(projectId: string): Promise<PersonaRow[]> {
  // Step 1: resolve the account this project belongs to (needed for tenant-safe global lookup).
  const projRow = await db!.execute({ sql: "SELECT account_id FROM projects WHERE id=?", args: [projectId] })
  if (!projRow.rows.length) {
    // Unknown project → fall back to project-scoped list (safe: returns nothing if project is unknown).
    return listPersonas(projectId)
  }
  const accountId = String((projRow.rows[0] as any).account_id)

  // Step 2: UNION own personas + global personas from sibling projects in the same account.
  // 'is_own' distinguishes them so we can apply the local-wins rule before returning.
  // Sibling globals: home project_id != this project, same account, is_global=1.
  // Trait count subquery is the same as listPersonas; NULLs on the sibling globals are fine
  // since they show trait_count=0 (traits stay project-scoped in v1).
  const r = await db!.execute({
    sql: `SELECT p.*, 1 AS is_own,
               (SELECT COUNT(*) FROM sim_traits t WHERE t.sim_id=p.id AND t.status='active') AS trait_count
          FROM personas p
          WHERE p.project_id=?
          UNION ALL
          SELECT p.*, 0 AS is_own,
               (SELECT COUNT(*) FROM sim_traits t WHERE t.sim_id=p.id AND t.status='active') AS trait_count
          FROM personas p
          JOIN projects pr ON pr.id = p.project_id
          WHERE p.is_global=1
            AND pr.account_id=?
            AND p.project_id != ?
          ORDER BY is_own DESC, created_at ASC`,
    args: [projectId, accountId, projectId],
  })

  // Step 3: Convert rows + apply local-wins dedup.
  // We process own rows first (is_own=1, ORDER BY is_own DESC), so the seen map gets populated
  // by own rows before any global rows are considered. This naturally implements "local wins":
  // a sibling global with the same normalized name+role is filtered out if the project already
  // has its own Sim with that identity.
  const seen = new Map<string, boolean>()
  const result: PersonaRow[] = []
  for (const x of r.rows) {
    const row = rowToPersona(x)
    // If this came from a sibling project (is_own=0), mark it as global in the response.
    // Own global Sims (is_global=1 AND is_own=1) also carry isGlobal=true — correct, since the
    // flag reflects the DB column, not whether it's "from elsewhere".
    const isOwn = !!(x as any).is_own
    if (!isOwn) row.isGlobal = true  // sibling global: surface the tag regardless of DB value

    // Dedup key: normalize name+role. Own rows win via insertion order (own rows come first).
    const key = String(row.name || "").trim().toLowerCase().replace(/\s+/g, " ") +
                "\x00" +
                String(row.role || "").trim().toLowerCase().replace(/\s+/g, " ")
    if (seen.has(key)) continue
    seen.set(key, true)
    result.push(row)
  }
  return result
}

// Set or clear the is_global flag on a persona. Caller must verify ownership before calling.
export async function setPersonaGlobal(id: string, projectId: string, isGlobal: boolean): Promise<void> {
  await db!.execute({
    sql: "UPDATE personas SET is_global=?, updated_at=? WHERE id=? AND project_id=?",
    args: [isGlobal ? 1 : 0, Date.now(), id, projectId],
  })
}
export async function upsertPersona(id: string, projectId: string, data: Omit<PersonaRow, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now()
  const core = data.core ?? null
  await db!.execute({
    sql: `INSERT INTO personas (id,project_id,name,role,type,initials,accent,summary,insights_json,avatar,sim_class,side,goals_json,expertise,temperament,voice,watchfor_json,sim_source,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name,role=excluded.role,type=excluded.type,
          initials=excluded.initials,accent=excluded.accent,summary=excluded.summary,
          insights_json=excluded.insights_json,avatar=excluded.avatar,
          sim_class=excluded.sim_class,side=excluded.side,goals_json=excluded.goals_json,
          expertise=excluded.expertise,temperament=excluded.temperament,voice=excluded.voice,
          watchfor_json=excluded.watchfor_json,updated_at=excluded.updated_at`,
    args: [id, projectId, data.name, data.role, data.type, data.initials, data.accent, data.summary,
           JSON.stringify(data.insights), data.avatar ?? null,
           data.simClass ?? null, data.side ?? null,
           core ? JSON.stringify(core.goals ?? []) : null,
           core?.expertise ?? null, core?.temperament ?? null, core?.voice ?? null,
           core ? JSON.stringify(core.watchFor ?? []) : null,
           data.simSource ?? null,
           now, now],
  })
}
export async function deletePersona(id: string, projectId: string) {
  await db!.execute({ sql: "DELETE FROM personas WHERE id=? AND project_id=?", args: [id, projectId] })
}

// ── screenshots / feedback / activity (Sims-dashboard ledger, P0) ──
// project_id is the denormalized 'proj_'+workspaceId string (no FK; projects table lands in P2).
export type ScreenshotInsert = {
  id?: string; projectId?: string | null; s3Key: string; bucket: string; contentType: string
  acl?: string; bytes?: number | null; ownerEmail?: string | null; expiresAt?: number | null
}
export async function insertScreenshot(s: ScreenshotInsert): Promise<string> {
  // Caller may pre-supply the id (so it can mint the permanent /img signed link before insert).
  const id = s.id ?? "shot_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO screenshots (id,project_id,s3_key,bucket,content_type,acl,bytes,owner_email,expires_at,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?)`,
    args: [id, s.projectId ?? null, s.s3Key, s.bucket, s.contentType, s.acl ?? "private",
           s.bytes ?? null, s.ownerEmail ?? null, s.expiresAt ?? null, Date.now()],
  })
  return id
}

export type ScreenshotRow = {
  id: string; projectId: string | null; s3Key: string; bucket: string
  contentType: string; acl: string; bytes: number | null; ownerEmail: string | null
  expiresAt: number | null; createdAt: number
}
// Look up one screenshot ledger row by id (for the membership-checked signed-URL endpoint).
export async function screenshotById(id: string): Promise<ScreenshotRow | null> {
  const r = await db!.execute({ sql: "SELECT * FROM screenshots WHERE id=?", args: [id] })
  if (!r.rows.length) return null
  const x = r.rows[0] as any
  return {
    id: String(x.id), projectId: x.project_id != null ? String(x.project_id) : null,
    s3Key: String(x.s3_key), bucket: String(x.bucket), contentType: String(x.content_type),
    acl: String(x.acl || "private"), bytes: x.bytes != null ? Number(x.bytes) : null,
    ownerEmail: x.owner_email != null ? String(x.owner_email) : null,
    expiresAt: x.expires_at != null ? Number(x.expires_at) : null, createdAt: Number(x.created_at),
  }
}

export type FeedbackInsert = {
  projectId: string; simId?: string | null; actorEmail?: string | null
  urlHost?: string | null; urlPath?: string | null; sourceReferrer?: string | null
  observation?: string | null; sentiment?: string | null; priority?: string | null
  screenshotId?: string | null; suggestedBug?: any; citedTraitIds?: any
  sourceQuote?: string | null; sourceTranscriptId?: string | null; sourceDate?: number | null
  planeIssueKey?: string | null; planeIssueUrl?: string | null
  issueKey?: string | null
  clientContext?: any  // captured ReportContext (console/network/env + identity/metadata), G2/G3/G5
  annotations?: any    // structured markup: { w, h, shapes:Shape[], region?, selector? } — re-rendered as the ticket overlay
  source?: string | null  // KLA-173: 'manual' | 'widget' | null (null → derived from sim_id at read time)
}

// Triage gate: new feedback is "new" (needs triage) unless it's a high-priority
// signal, which is auto-accepted straight to an open bug. Recurrence ≥3 promotes
// a still-"new" item later (see bumpFeedbackRecurrence).
export function initialFeedbackStatus(priority: string | null | undefined): "new" | "open" {
  return (priority === "urgent" || priority === "high") ? "open" : "new"
}

export async function insertFeedback(f: FeedbackInsert): Promise<string> {
  const id = "fb_" + crypto.randomUUID()
  const now = Date.now()
  const status = initialFeedbackStatus(f.priority)
  await db!.execute({
    sql: `INSERT INTO feedback (id,project_id,sim_id,actor_email,url_host,url_path,source_referrer,observation,sentiment,priority,
          screenshot_id,suggested_bug_json,cited_trait_ids_json,source_quote,source_transcript_id,source_date,
          plane_issue_key,plane_issue_url,issue_key,recurrence_count,recurrence_dates_json,last_seen_at,client_context_json,annotations_json,source,created_at,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, f.projectId, f.simId ?? null, f.actorEmail ?? null, f.urlHost ?? null, f.urlPath ?? null, f.sourceReferrer ?? null,
           f.observation ?? null, f.sentiment ?? null, f.priority ?? null, f.screenshotId ?? null,
           f.suggestedBug != null ? JSON.stringify(f.suggestedBug) : null,
           f.citedTraitIds != null ? JSON.stringify(f.citedTraitIds) : null,
           f.sourceQuote ?? null, f.sourceTranscriptId ?? null, f.sourceDate ?? null,
           f.planeIssueKey ?? null, f.planeIssueUrl ?? null,
           f.issueKey ?? null, 1, JSON.stringify([now]), now,
           f.clientContext != null ? JSON.stringify(f.clientContext) : null,
           f.annotations != null ? JSON.stringify(f.annotations) : null,
           f.source ?? null, now, status],
  })
  // KLA-200: assign per-project sequential number immediately after insert
  await db!.execute({
    sql: `UPDATE feedback SET seq_num = (
      SELECT COUNT(*) FROM feedback f2
      WHERE f2.project_id = ? AND (f2.created_at < ? OR (f2.created_at = ? AND f2.id <= ?))
    ) WHERE id = ? AND seq_num IS NULL`,
    args: [f.projectId, now, now, id, id],
  }).catch((e: any) => console.warn("seq_num assign skipped:", e?.message || e))
  return id
}

// Record the downstream tracker issue on a feedback row after it is filed (tracker is optional/best-effort).
export async function updateFeedbackTracker(id: string, planeIssueKey: string | null, planeIssueUrl: string | null) {
  await db!.execute({
    sql: "UPDATE feedback SET plane_issue_key=?, plane_issue_url=? WHERE id=?",
    args: [planeIssueKey, planeIssueUrl, id],
  })
}

export type ActivityInsert = {
  projectId: string; type: string; actorEmail?: string | null; simId?: string | null
  urlHost?: string | null; urlPath?: string | null
  feedbackId?: string | null; screenshotId?: string | null; meta?: any
}
export async function insertActivity(a: ActivityInsert): Promise<string> {
  const id = "evt_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO activity_events (id,project_id,type,actor_email,sim_id,url_host,url_path,feedback_id,screenshot_id,meta_json,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, a.projectId, a.type, a.actorEmail ?? null, a.simId ?? null, a.urlHost ?? null, a.urlPath ?? null,
           a.feedbackId ?? null, a.screenshotId ?? null, a.meta != null ? JSON.stringify(a.meta) : null, Date.now()],
  })
  return id
}

// ── dashboard reads (P1) — indexed, project-scoped, newest-first. Reads only. ──
export type ActivityRow = {
  id: string; projectId: string; type: string; actorEmail: string | null; simId: string | null
  urlHost: string | null; urlPath: string | null; feedbackId: string | null
  screenshotId: string | null; meta: any; createdAt: number
}
function rowToActivity(x: any): ActivityRow {
  return {
    id: String(x.id), projectId: String(x.project_id), type: String(x.type),
    actorEmail: x.actor_email != null ? String(x.actor_email) : null,
    simId: x.sim_id != null ? String(x.sim_id) : null,
    urlHost: x.url_host != null ? String(x.url_host) : null,
    urlPath: x.url_path != null ? String(x.url_path) : null,
    feedbackId: x.feedback_id != null ? String(x.feedback_id) : null,
    screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
    meta: x.meta_json ? JSON.parse(String(x.meta_json)) : null,
    createdAt: Number(x.created_at),
  }
}
// Recent activity for a project, newest-first. Non-admins pass actorEmail to see only their own rows
// (uses evt_actor_idx); admins omit it to see all (uses evt_proj_idx).
export async function listActivity(projectId: string, opts: { actorEmail?: string | null; types?: string[]; limit?: number } = {}): Promise<ActivityRow[]> {
  const limit = opts.limit ?? 20
  // Optional type filter (R6 named observability: e.g. types=['review_run']). Inlined IN-list — values are
  // server-controlled enum strings, never user input.
  const typeFilter = opts.types && opts.types.length
    ? ` AND type IN (${opts.types.map(() => "?").join(",")})`
    : ""
  const typeArgs = opts.types && opts.types.length ? opts.types : []
  const r = opts.actorEmail
    ? await db!.execute({ sql: `SELECT * FROM activity_events WHERE project_id=? AND actor_email=?${typeFilter} ORDER BY created_at DESC LIMIT ?`, args: [projectId, opts.actorEmail, ...typeArgs, limit] })
    : await db!.execute({ sql: `SELECT * FROM activity_events WHERE project_id=?${typeFilter} ORDER BY created_at DESC LIMIT ?`, args: [projectId, ...typeArgs, limit] })
  return r.rows.map(rowToActivity)
}

export type TicketCommentRow = {
  id: string; feedbackId: string; author: string | null; body: string; createdAt: number
}
function rowToTicketComment(x: any): TicketCommentRow {
  return {
    id: String(x.id),
    feedbackId: String(x.feedback_id),
    author: x.author != null ? String(x.author) : null,
    body: String(x.body),
    createdAt: Number(x.created_at),
  }
}
export async function insertTicketComment(feedbackId: string, author: string | null, body: string): Promise<TicketCommentRow> {
  const trimmed = String(body || "").trim()
  if (!trimmed) throw new Error("comment body required")
  const id = "tc_" + crypto.randomUUID()
  const createdAt = Date.now()
  await db!.execute({
    sql: "INSERT INTO ticket_comments (id,feedback_id,author,body,created_at) VALUES (?,?,?,?,?)",
    args: [id, feedbackId, author ?? null, trimmed, createdAt],
  })
  return { id, feedbackId, author: author ?? null, body: trimmed, createdAt }
}
export async function listTicketComments(feedbackId: string): Promise<TicketCommentRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM ticket_comments WHERE feedback_id=? ORDER BY created_at ASC, id ASC",
    args: [feedbackId],
  })
  return r.rows.map(rowToTicketComment)
}

export type TicketTimelineItem =
  | { id: string; kind: "comment"; type: "comment"; author: string | null; body: string; createdAt: number }
  | { id: string; kind: "activity"; type: string; actorEmail: string | null; meta: any; createdAt: number }
  | { id: string; kind: "ticket_export"; type: "connector_export"; actorEmail: string | null; meta: any; createdAt: number }

export async function ticketActivityTimeline(projectId: string, feedbackId: string): Promise<TicketTimelineItem[]> {
  const [comments, activity, exports] = await Promise.all([
    listTicketComments(feedbackId),
    db!.execute({
      sql: "SELECT * FROM activity_events WHERE project_id=? AND feedback_id=? ORDER BY created_at ASC, id ASC",
      args: [projectId, feedbackId],
    }),
    db!.execute({
      sql: "SELECT * FROM ticket_exports WHERE feedback_id=? ORDER BY created_at ASC, id ASC",
      args: [feedbackId],
    }),
  ])
  const items: TicketTimelineItem[] = [
    ...comments.map((c): TicketTimelineItem => ({
      id: c.id, kind: "comment", type: "comment", author: c.author, body: c.body, createdAt: c.createdAt,
    })),
    ...activity.rows.map((r: any): TicketTimelineItem => ({
      id: String(r.id),
      kind: "activity",
      type: String(r.type),
      actorEmail: r.actor_email != null ? String(r.actor_email) : null,
      meta: r.meta_json ? safeJsonParse(r.meta_json) : null,
      createdAt: Number(r.created_at),
    })),
    ...exports.rows.map((r: any): TicketTimelineItem => ({
      id: String(r.id),
      kind: "ticket_export",
      type: "connector_export",
      actorEmail: r.created_by != null ? String(r.created_by) : null,
      meta: {
        connectorId: String(r.connector_id),
        connectorType: String(r.type),
        externalKey: r.external_key != null ? String(r.external_key) : null,
        externalUrl: r.external_url != null ? String(r.external_url) : null,
        status: String(r.status),
        error: r.error != null ? String(r.error) : null,
      },
      createdAt: Number(r.created_at),
    })),
  ]
  return items.sort((a, b) => (a.createdAt - b.createdAt) || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id))
}

export type FeedbackRow = {
  id: string; projectId: string; simId: string | null; actorEmail: string | null
  urlHost: string | null; urlPath: string | null; sourceReferrer: string | null; observation: string | null
  sentiment: string | null; priority: string | null; screenshotId: string | null
  suggestedBug: any | null; sourceQuote: string | null; citedTraitIds: any | null; sourceDate: number | null
  planeIssueKey: string | null; planeIssueUrl: string | null; annotations: any | null; createdAt: number
}
function safeJsonParse(s: any): any { try { return s ? JSON.parse(String(s)) : null } catch { return null } }
function rowToFeedback(x: any): FeedbackRow {
  return {
    id: String(x.id), projectId: String(x.project_id),
    simId: x.sim_id != null ? String(x.sim_id) : null,
    actorEmail: x.actor_email != null ? String(x.actor_email) : null,
    urlHost: x.url_host != null ? String(x.url_host) : null,
    urlPath: x.url_path != null ? String(x.url_path) : null,
    sourceReferrer: x.source_referrer != null ? String(x.source_referrer) : null,
    observation: x.observation != null ? String(x.observation) : null,
    sentiment: x.sentiment != null ? String(x.sentiment) : null,
    priority: (x.priority ?? x.severity) != null ? String(x.priority ?? x.severity) : null,
    screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
    suggestedBug: safeJsonParse(x.suggested_bug_json),
    sourceQuote: x.source_quote != null ? String(x.source_quote) : null,
    citedTraitIds: safeJsonParse(x.cited_trait_ids_json),
    sourceDate: x.source_date != null ? Number(x.source_date) : null,
    planeIssueKey: x.plane_issue_key != null ? String(x.plane_issue_key) : null,
    planeIssueUrl: x.plane_issue_url != null ? String(x.plane_issue_url) : null,
    annotations: safeJsonParse(x.annotations_json),
    createdAt: Number(x.created_at),
  }
}
// Recent feedback for a project, newest-first (uses fb_proj_idx). withTicketOnly → only rows that
// reached the tracker (plane_issue_key set) — i.e. filed tickets. simOnly → only Sim-generated rows.
export async function listFeedback(projectId: string, opts: { withTicketOnly?: boolean; limit?: number; simOnly?: boolean } = {}): Promise<FeedbackRow[]> {
  const limit = opts.limit ?? 20
  let sql: string
  if (opts.withTicketOnly) {
    sql = "SELECT * FROM feedback WHERE project_id=? AND plane_issue_key IS NOT NULL ORDER BY created_at DESC LIMIT ?"
  } else if (opts.simOnly) {
    sql = "SELECT * FROM feedback WHERE project_id=? AND sim_id IS NOT NULL ORDER BY created_at DESC LIMIT ?"
  } else {
    sql = "SELECT * FROM feedback WHERE project_id=? ORDER BY created_at DESC LIMIT ?"
  }
  const r = await db!.execute({ sql, args: [projectId, limit] })
  return r.rows.map(rowToFeedback)
}

// ── Sim Profile: a Sim's own feedback, annotated with its TRIAGE OUTCOME ──
// Maps the feedback lifecycle status onto a coarse triage verdict the profile page shows so the
// user can watch a Sim "get better": confirmed (a human accepted it as a real bug — a "yes"),
// dismissed (triaged as not-a-bug — a "no"), or pending (still in the triage queue).
export type SimTriageOutcome = "confirmed" | "dismissed" | "pending"
export function triageOutcome(status: string | null | undefined): SimTriageOutcome {
  const s = String(status || "new")
  if (s === "dismissed") return "dismissed"
  if (s === "new") return "pending"
  return "confirmed" // open | in_progress | done — accepted into the bug pipeline
}

export type SimFeedbackRow = {
  id: string; title: string; observation: string | null; sentiment: string | null
  priority: string | null; urlPath: string | null; sourceQuote: string | null
  status: string; outcome: SimTriageOutcome; createdAt: number
}
// All feedback a given Sim has filed, newest-first (uses fb_sim_idx), each tagged with its triage outcome.
export async function listFeedbackForSim(projectId: string, simId: string): Promise<SimFeedbackRow[]> {
  const r = await db!.execute({
    sql: `SELECT id, observation, sentiment, COALESCE(priority, severity) AS priority, url_path, suggested_bug_json, source_quote, status, created_at
          FROM feedback WHERE project_id=? AND sim_id=? ORDER BY created_at DESC LIMIT 200`,
    args: [projectId, simId],
  })
  return r.rows.map((x: any) => {
    let title = ""
    try { title = String(JSON.parse(x.suggested_bug_json || "{}")?.title || "") } catch { title = "" }
    if (!title) title = x.observation != null ? String(x.observation).slice(0, 80) : "Observation"
    return {
      id: String(x.id), title,
      observation: x.observation != null ? String(x.observation) : null,
      sentiment: x.sentiment != null ? String(x.sentiment) : null,
      priority: x.priority != null ? String(x.priority) : null,
      urlPath: x.url_path != null ? String(x.url_path) : null,
      sourceQuote: x.source_quote != null ? String(x.source_quote) : null,
      status: String(x.status || "new"),
      outcome: triageOutcome(x.status),
      createdAt: Number(x.created_at),
    }
  })
}

// ── JTBD 3.13 (KLAVITYKLA-265): per-Sim precision from stored triage outcomes ──
// accept rate = accepted / (accepted + dismissed) of a Sim's findings. Pending (untriaged) rows are
// EXCLUDED from the denominator so an unreviewed backlog doesn't drag the score. accepted/dismissed
// mirror the triageOutcome() verdicts. Returns rate=null when there is nothing decided yet (0/0), so
// the UI can show "not enough signal yet" instead of a misleading 0%.
export type SimAcceptRate = { accepted: number; dismissed: number; pending: number; decided: number; rate: number | null }
export function simAcceptRate(rows: Pick<SimFeedbackRow, "outcome">[]): SimAcceptRate {
  let accepted = 0, dismissed = 0, pending = 0
  for (const r of rows) {
    if (r.outcome === "confirmed") accepted++
    else if (r.outcome === "dismissed") dismissed++
    else pending++
  }
  const decided = accepted + dismissed
  return { accepted, dismissed, pending, decided, rate: decided > 0 ? accepted / decided : null }
}

// ── JTBD 3.13: dismiss-with-reason teaches the Sim ──
// When a human dismisses a Sim-generated finding with a reason, append that reason as an append-only
// trait event on each trait the finding cited (op:"edit", reason:"dismiss: …"). This surfaces in the
// Sim's evolution history so repeated dismissals visibly accumulate — the signal that shapes future
// reviews. It does NOT mutate the trait text/state (no updateTrait): the trait stands, but its
// dismissal record grows. Only cited, in-Sim traits get an event; findings citing no trait are a
// graceful no-op (the accept-rate stat already reflects the dismissal). Returns the events written.
export async function recordSimDismissEvents(args: {
  simId: string; projectId: string; feedbackId: string; reason: string; citedTraitIds: string[]; actor: string; now: number
}): Promise<number> {
  const { simId, projectId, feedbackId, reason, citedTraitIds, actor, now } = args
  const cleanReason = String(reason || "").trim().slice(0, 500)
  if (!cleanReason || !citedTraitIds.length) return 0
  // Only write events for traits that actually belong to this Sim (guards a stale/foreign citedTraitId).
  const owned = new Set((await listTraits(simId)).map((t) => t.id))
  let written = 0
  for (const traitId of citedTraitIds) {
    if (!owned.has(traitId)) continue
    await insertTraitEvent({
      traitId, simId, transcriptId: "triage:" + feedbackId,
      op: "edit", beforeText: null, afterText: null,
      quote: cleanReason, quoteOffset: null, speaker: null,
      sourceDate: now, reason: "dismiss: " + cleanReason, actor, createdAt: now,
    })
    written++
  }
  return written
}

export async function findFeedbackByIssueKey(projectId: string, issueKey: string): Promise<{ id: string } | null> {
  if (!issueKey) return null
  const r = await db!.execute({
    sql: "SELECT id FROM feedback WHERE project_id=? AND issue_key=? ORDER BY created_at DESC LIMIT 1",
    args: [projectId, issueKey],
  })
  return r.rows.length ? { id: String((r.rows[0] as any).id) } : null
}

export async function listRecentFeedbackForDedup(projectId: string, limit = 50): Promise<Array<{ id: string; title: string; observation: string }>> {
  const r = await db!.execute({
    sql: `SELECT id, observation, suggested_bug_json FROM feedback
          WHERE project_id=?
          ORDER BY created_at DESC LIMIT ?`,
    args: [projectId, limit],
  })
  return r.rows.map((x: any) => {
    let title = ""
    try { title = String(JSON.parse(x.suggested_bug_json || "{}")?.title || "") } catch { title = "" }
    const observation = x.observation != null ? String(x.observation) : ""
    return { id: String(x.id), title: title || observation.slice(0, 120), observation }
  })
}

export async function bumpFeedbackRecurrence(id: string, atMs: number): Promise<void> {
  const r = await db!.execute({ sql: "SELECT recurrence_count, recurrence_dates_json, status FROM feedback WHERE id=?", args: [id] })
  if (!r.rows.length) return
  const row = r.rows[0] as any
  const count = Number(row.recurrence_count ?? 1) + 1
  let dates: number[] = []
  try { dates = JSON.parse(row.recurrence_dates_json || "[]") } catch { dates = [] }
  dates.push(atMs)
  // A still-untriaged item that recurs ≥3 times is a strong signal — auto-accept it.
  const promote = count >= 3 && String(row.status) === "new"
  await db!.execute({
    sql: promote
      ? "UPDATE feedback SET recurrence_count=?, recurrence_dates_json=?, last_seen_at=?, status='open' WHERE id=?"
      : "UPDATE feedback SET recurrence_count=?, recurrence_dates_json=?, last_seen_at=? WHERE id=?",
    args: [count, JSON.stringify(dates), atMs, id],
  })
}

// ── A.8 occurrence receipts ──
// Persist one repeat-report's OWN verbatim evidence (description, screenshot, quote, date) against
// the cluster-head feedback row. Called on the deduped intake branch so occurrences 2..N are not
// discarded when the recurrence counter is bumped. Best-effort — never throws into the submit path.
export type FeedbackOccurrenceInsert = {
  feedbackId: string; projectId: string; seenAt: number
  observation?: string | null; screenshotId?: string | null
  sourceQuote?: string | null; reporterEmail?: string | null
}
export async function insertFeedbackOccurrence(o: FeedbackOccurrenceInsert): Promise<string> {
  const id = "occ_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO feedback_occurrences (id, feedback_id, project_id, seen_at, observation, screenshot_id, source_quote, reporter_email, created_at)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [
      id, o.feedbackId, o.projectId, o.seenAt,
      o.observation ?? null, o.screenshotId ?? null, o.sourceQuote ?? null, o.reporterEmail ?? null,
      Date.now(),
    ],
  })
  return id
}

export type FeedbackOccurrenceRow = {
  id: string; feedbackId: string; projectId: string; seenAt: number
  observation: string | null; screenshotId: string | null
  sourceQuote: string | null; reporterEmail: string | null; createdAt: number
}
// All stored occurrences for a cluster head, chronological. Empty array when none / on error.
export async function listFeedbackOccurrences(feedbackId: string): Promise<FeedbackOccurrenceRow[]> {
  try {
    const r = await db!.execute({
      sql: `SELECT * FROM feedback_occurrences WHERE feedback_id=? ORDER BY seen_at ASC, created_at ASC`,
      args: [feedbackId],
    })
    return r.rows.map((x: any): FeedbackOccurrenceRow => ({
      id: String(x.id), feedbackId: String(x.feedback_id), projectId: String(x.project_id),
      seenAt: Number(x.seen_at),
      observation: x.observation != null ? String(x.observation) : null,
      screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
      sourceQuote: x.source_quote != null ? String(x.source_quote) : null,
      reporterEmail: x.reporter_email != null ? String(x.reporter_email) : null,
      createdAt: Number(x.created_at),
    }))
  } catch { return [] }
}

// ── A.10 dedup override: merge / split controls ──────────────────────────────
// Human operators can correct the automatic matcher: MERGE two tickets it missed, or SPLIT an
// occurrence the matcher wrongly buried. Both preserve recurrence counts, dates, per-occurrence
// evidence and reporter emails so notify-on-fix (A.4) still reaches every reporter, and both keep
// the expectations-spine link consistent (linkage follows issue_key = expectations.dedup_key).

function parseDates(json: string | null | undefined): number[] {
  let d: number[] = []
  try { d = JSON.parse(json || "[]") } catch { d = [] }
  if (!Array.isArray(d)) d = []
  return d.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)
}

/** Record a manual "these two are DISTINCT issues" decision so intake dedup never re-merges them. */
export async function addDedupExclusion(
  projectId: string, feedbackA: string, feedbackB: string,
  opts: { reason?: string | null; createdBy?: string | null } = {},
): Promise<void> {
  // Store both orderings so a lookup keyed on either side hits (matcher order isn't guaranteed).
  const pairs: [string, string][] = [[feedbackA, feedbackB], [feedbackB, feedbackA]]
  for (const [a, b] of pairs) {
    await db!.execute({
      sql: `INSERT INTO dedup_exclusions (id, project_id, feedback_a, feedback_b, reason, created_by, created_at)
            VALUES (?,?,?,?,?,?,?)
            ON CONFLICT(project_id, feedback_a, feedback_b) DO NOTHING`,
      args: ["dex_" + crypto.randomUUID(), projectId, a, b, opts.reason ?? null, opts.createdBy ?? null, Date.now()],
    }).catch((e: any) => console.warn("dedup exclusion skipped:", e?.message || e))
  }
}

/** The set of feedback ids that must NOT be collapsed into `feedbackId` (manual split decisions). */
export async function excludedDedupIds(projectId: string, feedbackId: string): Promise<Set<string>> {
  try {
    const r = await db!.execute({
      sql: `SELECT feedback_b FROM dedup_exclusions WHERE project_id=? AND feedback_a=?`,
      args: [projectId, feedbackId],
    })
    return new Set(r.rows.map((x: any) => String(x.feedback_b)))
  } catch { return new Set() }
}

export type MergeResult = { survivorId: string; recurrenceCount: number; contactEmails: string[] }

/**
 * Merge the `mergedId` cluster INTO the `survivorId` cluster. The survivor keeps its id + issue_key
 * (so future intake dedup lands on it AND the expectation link — dedup_key = survivor.issue_key —
 * survives). Sums recurrence_count, unions recurrence_dates_json, carries every stored contact/
 * reporter email across, re-homes both the merged head's own evidence AND its stored occurrences
 * onto the survivor, then deletes the merged head row. Returns null when either row is missing or
 * they belong to different projects (defensive — the caller already scoped both to one project).
 */
export async function mergeFeedbackClusters(
  projectId: string, survivorId: string, mergedId: string, actor?: string | null,
): Promise<MergeResult | null> {
  if (survivorId === mergedId) return null
  const survivor = await feedbackById(projectId, survivorId)
  const merged = await feedbackById(projectId, mergedId)
  if (!survivor || !merged) return null

  // Combined recurrence count = both cluster counts summed (each ≥1 for the original report).
  const survCount = Math.max(1, Number(survivor.recurrenceCount ?? 1))
  const mergedCount = Math.max(1, Number(merged.recurrenceCount ?? 1))
  const combinedCount = survCount + mergedCount

  // Union the recurrence dates (both heads' created_at + all stored recurrence dates), dedup + sort.
  const survDates = new Set(parseDates(survivor.recurrenceDatesJson))
  survDates.add(Number(survivor.createdAt))
  for (const d of parseDates(merged.recurrenceDatesJson)) survDates.add(d)
  survDates.add(Number(merged.createdAt))
  const dates = [...survDates].filter((d) => Number.isFinite(d) && d > 0).sort((a, b) => a - b)
  const lastSeen = dates.length ? dates[dates.length - 1] : Number(survivor.createdAt)

  // Carry the merged head's OWN report body/screenshot/date across as a survivor occurrence, so its
  // evidence is not lost when its row is deleted (mirrors the A.8 intake occurrence receipt).
  await insertFeedbackOccurrence({
    feedbackId: survivorId, projectId, seenAt: Number(merged.createdAt),
    observation: merged.observation ?? null,
    screenshotId: merged.screenshotId ?? null,
    sourceQuote: null,
    reporterEmail: merged.contactEmail ?? null,
  }).catch((e: any) => console.warn("merge head-occurrence skipped:", e?.message || e))

  // Re-home the merged cluster's stored occurrence receipts onto the survivor head.
  await db!.execute({
    sql: `UPDATE feedback_occurrences SET feedback_id=? WHERE feedback_id=? AND project_id=?`,
    args: [survivorId, mergedId, projectId],
  }).catch((e: any) => console.warn("merge occurrence re-home skipped:", e?.message || e))

  // Persist the summed count + unioned dates onto the survivor.
  await db!.execute({
    sql: `UPDATE feedback SET recurrence_count=?, recurrence_dates_json=?, last_seen_at=? WHERE id=? AND project_id=?`,
    args: [combinedCount, JSON.stringify(dates), lastSeen, survivorId, projectId],
  })

  // Carry the contact email: keep the survivor's if present, else adopt the merged one. Every distinct
  // reporter email is preserved on the occurrences above so notify-on-fix (A.4) reaches them all.
  if (!survivor.contactEmail && merged.contactEmail) {
    await db!.execute({
      sql: `UPDATE feedback SET contact_email=? WHERE id=? AND project_id=?`,
      args: [merged.contactEmail, survivorId, projectId],
    }).catch((e: any) => console.warn("merge contact carry skipped:", e?.message || e))
  }

  // Collect the distinct reporter emails now attached to the survivor cluster (for the caller/notify).
  const survivorAfter = await feedbackById(projectId, survivorId)
  const occs = await listFeedbackOccurrences(survivorId)
  const emails = new Set<string>()
  if (survivorAfter?.contactEmail) emails.add(survivorAfter.contactEmail)
  if (merged.contactEmail) emails.add(merged.contactEmail)
  for (const o of occs) if (o.reporterEmail) emails.add(o.reporterEmail)

  // Delete the now-empty merged head row (its evidence lives on as survivor occurrences).
  await db!.execute({ sql: `DELETE FROM feedback WHERE id=? AND project_id=?`, args: [mergedId, projectId] })
  // The merged head's issue_key had its own expectation link (dedup_key = merged.issue_key). Re-point
  // that expectation onto the survivor's key so the spine neither orphans nor double-links.
  if (merged.issueKey && survivor.issueKey && merged.issueKey !== survivor.issueKey) {
    // Only repoint if the survivor doesn't already own an expectation on its key (avoid duplicate keys).
    await db!.execute({
      sql: `UPDATE expectations SET dedup_key=? WHERE project_id=? AND dedup_key=?
              AND NOT EXISTS (SELECT 1 FROM expectations e2 WHERE e2.project_id=? AND e2.dedup_key=?)`,
      args: [survivor.issueKey, projectId, merged.issueKey, projectId, survivor.issueKey],
    }).catch((e: any) => console.warn("merge expectation repoint skipped:", e?.message || e))
  }

  return { survivorId, recurrenceCount: combinedCount, contactEmails: [...emails] }
}

export type SplitResult = { newFeedbackId: string; sourceRecurrenceCount: number }

/**
 * Split ONE stored occurrence out of the `headId` cluster into its own standalone ticket. The new
 * ticket carries that occurrence's date + evidence + reporter email; the source cluster's count and
 * dates decrease accordingly. The new ticket gets a FRESH distinct issue_key ("split:"-prefixed) so
 * intake dedup's exact-key path can never re-collapse it, and a dedup exclusion pair is recorded so
 * the lexical fallback won't either. Returns null when the occurrence isn't found under this head.
 */
export async function splitOccurrenceToNewTicket(
  projectId: string, headId: string, occurrenceId: string,
  opts: { actor?: string | null; issueKey?: string | null } = {},
): Promise<SplitResult | null> {
  const actor = opts.actor
  const head = await feedbackById(projectId, headId)
  if (!head) return null
  const occs = await listFeedbackOccurrences(headId)
  const occ = occs.find((o) => o.id === occurrenceId)
  if (!occ) return null

  // The split ticket carries the occurrence's own CONTENT issue_key when the caller supplies it (so a
  // future re-report of the same content routes to THIS standalone ticket, honouring the split, rather
  // than re-collapsing into the head). Falls back to a synthetic "split:"-key when no content key is
  // given — still distinct from the head so the exact-match path can never re-merge the pair.
  const splitKey = opts.issueKey || ("split:" + sha256hex(`${headId}|${occurrenceId}|${occ.seenAt}`).slice(0, 26))
  const newId = "fb_" + crypto.randomUUID()
  const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO feedback (id,project_id,sim_id,actor_email,url_host,url_path,observation,sentiment,priority,
          screenshot_id,source_quote,issue_key,recurrence_count,recurrence_dates_json,last_seen_at,source,created_at,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      newId, projectId, null, actor ?? null, head.urlHost ?? null, head.urlPath ?? null,
      occ.observation ?? head.observation ?? null, head.sentiment ?? null, head.priority ?? null,
      occ.screenshotId ?? null, occ.sourceQuote ?? null, splitKey,
      1, JSON.stringify([occ.seenAt]), occ.seenAt, "split",
      occ.seenAt, initialFeedbackStatus(head.priority),
    ],
  })
  // Carry the split occurrence's reporter email onto the new standalone ticket (A.4 notify-on-fix).
  if (occ.reporterEmail) {
    await db!.execute({
      sql: `UPDATE feedback SET contact_email=? WHERE id=? AND project_id=?`,
      args: [occ.reporterEmail, newId, projectId],
    }).catch((e: any) => console.warn("split contact carry skipped:", e?.message || e))
  }
  await db!.execute({
    sql: `UPDATE feedback SET seq_num = (
      SELECT COUNT(*) FROM feedback f2 WHERE f2.project_id = ? AND (f2.created_at < ? OR (f2.created_at = ? AND f2.id <= ?))
    ) WHERE id = ? AND seq_num IS NULL`,
    args: [projectId, now, now, newId, newId],
  }).catch((e: any) => console.warn("split seq_num skipped:", e?.message || e))

  // Remove the occurrence from the source cluster and decrement its recurrence count/dates.
  await db!.execute({ sql: `DELETE FROM feedback_occurrences WHERE id=? AND feedback_id=?`, args: [occurrenceId, headId] })
  const remainingCount = Math.max(1, Math.max(1, Number(head.recurrenceCount ?? 1)) - 1)
  const remainingDates = parseDates(head.recurrenceDatesJson).filter((d) => d !== occ.seenAt)
  // Never strip the head's own created_at date; keep at least the original occurrence.
  if (!remainingDates.includes(Number(head.createdAt))) remainingDates.unshift(Number(head.createdAt))
  const uniqDates = [...new Set(remainingDates)].sort((a, b) => a - b)
  const lastSeen = uniqDates.length ? uniqDates[uniqDates.length - 1] : Number(head.createdAt)
  await db!.execute({
    sql: `UPDATE feedback SET recurrence_count=?, recurrence_dates_json=?, last_seen_at=? WHERE id=? AND project_id=?`,
    args: [remainingCount, JSON.stringify(uniqDates), lastSeen, headId, projectId],
  })

  // Record the manual "distinct issues" decision so intake dedup won't lexically re-merge the pair.
  await addDedupExclusion(projectId, headId, newId, { reason: "manual-split", createdBy: actor ?? null })

  return { newFeedbackId: newId, sourceRecurrenceCount: remainingCount }
}

// Cheap headline counts for the dashboard (indexed scans).
// Overview metric counts. All three are indexed COUNT(*)s scoped to one project:
//   feedback → fb_proj_idx(project_id,…); tickets → fb_proj_plane_idx (partial, plane_issue_key
//   NOT NULL); activity → evt_proj_idx(project_id,…). Resilient by design: a single slow/failing
//   count resolves to `null` (rendered as "—" client-side) instead of rejecting and taking the
//   whole /api/dashboard payload down with it — a decorative number must never break the page.
export async function dashboardCounts(projectId: string): Promise<{ feedback: number | null; tickets: number | null; activity: number | null }> {
  const q = (sql: string) => db!.execute({ sql, args: [projectId] })
  const settled = await Promise.allSettled([
    q("SELECT COUNT(*) AS n FROM feedback WHERE project_id=?"),
    q("SELECT COUNT(*) AS n FROM feedback WHERE project_id=? AND plane_issue_key IS NOT NULL"),
    q("SELECT COUNT(*) AS n FROM activity_events WHERE project_id=?"),
  ])
  const num = (s: PromiseSettledResult<any>): number | null =>
    s.status === "fulfilled" ? Number((s.value.rows[0] as any).n) : null
  return { feedback: num(settled[0]), tickets: num(settled[1]), activity: num(settled[2]) }
}

// ── AI-call ledger (/opsadmin) ── one row per OpenRouter call; reads are global (not project-scoped).
export type AiCallInsert = {
  type: string; model: string; actorEmail?: string | null; projectId?: string | null
  accountId?: string | null; feature?: string | null
  inputTokens?: number | null; outputTokens?: number | null; costUsd?: number | null; ok?: boolean
}
export type AiCallRow = {
  id: string; createdAt: number; type: string; model: string
  actorEmail: string | null; projectId: string | null; accountId: string | null; feature: string | null
  inputTokens: number | null; outputTokens: number | null; costUsd: number | null; ok: boolean
}

function aiFeatureFor(type: string, feature?: string | null): string {
  const raw = String(feature || type || "unknown").trim()
  if (raw === "react" || raw === "sim-react") return "sim-react"
  if (raw === "extract") return "extract"
  if (raw === "author-drive") return "author-drive"
  if (raw === "heal" || raw === "reheal") return "heal"
  return raw || "unknown"
}

export async function accountIdForAiCall(projectId?: string | null, accountId?: string | null, actorEmail?: string | null): Promise<string | null> {
  if (accountId) return accountId
  try {
    if (projectId) {
      const r = await db!.execute({ sql: "SELECT account_id FROM projects WHERE id=?", args: [projectId] })
      const v = (r.rows[0] as any)?.account_id
      if (v != null) return String(v)
    }
    if (actorEmail) {
      const r = await db!.execute({ sql: "SELECT account_id FROM account_members WHERE email=? ORDER BY created_at ASC LIMIT 1", args: [actorEmail] })
      const v = (r.rows[0] as any)?.account_id
      if (v != null) return String(v)
    }
  } catch {
    return null
  }
  return null
}

// ── Usage meters (KLAVITYKLA-305) ──────────────────────────────────────────────────────────────
// Billable value-metric counters. MEASUREMENT ONLY — count usage; never enforce/block/charge here
// (that is KLA-306/307). The billing meter = Sims + guarded AutoSim flows, so callers record the
// events 'sim_review' (one per Sim review run) and 'autosim_walk' (one per AutoSim/Trail walk).

// Billing period = UTC calendar month, 'YYYY-MM'. One stable string per account per month.
export function usagePeriod(atMs: number = Date.now()): string {
  return new Date(atMs).toISOString().slice(0, 7)
}

export type UsageMeterMetric = "sim_review" | "autosim_walk"

export type UsageMeterInc = {
  metric: UsageMeterMetric | string
  accountId?: string | null
  projectId?: string | null
  actorEmail?: string | null
  by?: number
  atMs?: number
}

// Fire-and-forget: increment a usage counter for the metered event. Resolves the owning account
// from projectId/actorEmail (same resolver as the AI-call ledger) and upserts the period+metric
// row atomically. NEVER throws — a metering failure must not break the metered action, so callers
// invoke this WITHOUT awaiting (or with a .catch). No-op when no account can be resolved.
export async function incrementUsageMeter(inc: UsageMeterInc): Promise<void> {
  try {
    const accountId = await accountIdForAiCall(inc.projectId, inc.accountId, inc.actorEmail)
    if (!accountId) return // nothing to attribute usage to — skip (measurement is best-effort)
    const at = inc.atMs ?? Date.now()
    const period = usagePeriod(at)
    const by = Number.isFinite(inc.by) ? Math.max(1, Math.trunc(inc.by as number)) : 1
    const projectId = inc.projectId ? String(inc.projectId) : ""
    await db!.execute({
      sql: `INSERT INTO usage_meters (account_id, project_id, period, metric, count, first_at, last_at)
            VALUES (?,?,?,?,?,?,?)
            ON CONFLICT(account_id, project_id, period, metric)
            DO UPDATE SET count = count + excluded.count, last_at = excluded.last_at`,
      args: [accountId, projectId, period, String(inc.metric), by, at, at],
    })
  } catch (e: any) {
    // Best-effort: log and swallow. A meter write must never bubble into the metered code path.
    console.warn("[usage-meter] increment skipped:", e?.message || e)
  }
}

export type UsageMeterTotal = { metric: string; count: number }

// Read current-period (default: this UTC month) usage totals for an account, summed across all
// projects, one entry per metric. Read-only; safe to call anywhere. Optionally scope to one project.
export async function getAccountUsage(
  accountId: string,
  opts: { period?: string; projectId?: string } = {},
): Promise<UsageMeterTotal[]> {
  const period = opts.period ?? usagePeriod()
  const where = ["account_id = ?", "period = ?"]
  const args: any[] = [accountId, period]
  if (opts.projectId != null) { where.push("project_id = ?"); args.push(String(opts.projectId)) }
  const r = await db!.execute({
    sql: `SELECT metric, COALESCE(SUM(count),0) AS n FROM usage_meters
          WHERE ${where.join(" AND ")} GROUP BY metric ORDER BY metric`,
    args,
  })
  return r.rows.map((x: any) => ({ metric: String(x.metric), count: Number(x.n) }))
}

// Convenience: current-period usage as a metric→count map (metrics with zero usage are absent).
export async function getAccountUsageMap(
  accountId: string,
  opts: { period?: string; projectId?: string } = {},
): Promise<Record<string, number>> {
  const rows = await getAccountUsage(accountId, opts)
  const out: Record<string, number> = {}
  for (const r of rows) out[r.metric] = r.count
  return out
}

// ── Per-project usage + cost breakdown (KLAVITYKLA-276) ─────────────────────────────────────────
// Read-only reporting for the customer-facing billing drawer: which project consumed the metered
// value-metric allowance, and what each project cost in AI spend today. Both are pure reads over
// the same ledgers the account-level meters/budget use — no enforcement here.

export type ProjectUsageRow = { projectId: string; name: string | null; metric: string; count: number }

// Per-project current-period usage breakdown for an account: one row per (project, metric). The
// project name is joined from `projects` (null when the project row is gone or usage was recorded
// with an empty project_id — i.e. "unattributed"). Read-only.
export async function getAccountUsageByProject(
  accountId: string,
  opts: { period?: string } = {},
): Promise<ProjectUsageRow[]> {
  const period = opts.period ?? usagePeriod()
  const r = await db!.execute({
    sql: `SELECT u.project_id AS pid, p.name AS name, u.metric AS metric, COALESCE(SUM(u.count),0) AS n
          FROM usage_meters u LEFT JOIN projects p ON p.id = u.project_id
          WHERE u.account_id = ? AND u.period = ?
          GROUP BY u.project_id, u.metric
          ORDER BY u.project_id, u.metric`,
    args: [accountId, period],
  })
  return r.rows.map((x: any) => ({
    projectId: String(x.pid ?? ""),
    name: x.name != null ? String(x.name) : null,
    metric: String(x.metric),
    count: Number(x.n),
  }))
}

export type ProjectSpendRow = { projectId: string; cost: number }

// Per-project AI spend TODAY (UTC day, same window as the tenant daily budget) for an account,
// summed from the ai_calls ledger and grouped by project_id ('' when the call had no project).
// Read-only.
export async function tenantTodaySpendByProject(accountId: string): Promise<ProjectSpendRow[]> {
  if (!accountId) return []
  const r = await db!.execute({
    sql: `SELECT COALESCE(project_id,'') AS pid, COALESCE(SUM(cost_usd),0) AS cost FROM ai_calls
          WHERE account_id = ? AND date(created_at/1000,'unixepoch') = date('now')
          GROUP BY COALESCE(project_id,'')`,
    args: [accountId],
  })
  return r.rows.map((x: any) => ({ projectId: String(x.pid ?? ""), cost: Number(x.cost) }))
}

// Resolve the account that owns a given project. Used by quota.ts and any other module that
// has a projectId but needs an accountId. Returns null if the project is not found.
export async function accountIdForProject(projectId: string): Promise<string | null> {
  try {
    const r = await db!.execute({ sql: "SELECT account_id FROM projects WHERE id=?", args: [projectId] })
    const v = (r.rows[0] as any)?.account_id
    return v != null ? String(v) : null
  } catch {
    return null
  }
}

export async function recordAiCall(a: AiCallInsert): Promise<void> {
  const id = "ai_" + crypto.randomUUID()
  const accountId = await accountIdForAiCall(a.projectId, a.accountId, a.actorEmail)
  const feature = aiFeatureFor(a.type, a.feature)
  await db!.execute({
    sql: `INSERT INTO ai_calls (id,created_at,type,model,account_id,feature,actor_email,project_id,input_tokens,output_tokens,cost_usd,ok)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, Date.now(), a.type, a.model, accountId, feature, a.actorEmail ?? null, a.projectId ?? null,
           a.inputTokens ?? null, a.outputTokens ?? null, a.costUsd ?? null, a.ok === false ? 0 : 1],
  })
}

export async function opsTotals(): Promise<{ totalCost: number; totalInputTokens: number; totalOutputTokens: number; callCount: number }> {
  const r = await db!.execute(
    `SELECT COALESCE(SUM(cost_usd),0) AS cost, COALESCE(SUM(input_tokens),0) AS inp,
            COALESCE(SUM(output_tokens),0) AS outp, COUNT(*) AS n FROM ai_calls`)
  const x = r.rows[0] as any
  return { totalCost: Number(x.cost), totalInputTokens: Number(x.inp), totalOutputTokens: Number(x.outp), callCount: Number(x.n) }
}

export async function opsDaily(days = 30): Promise<{ day: string; cost: number; calls: number }[]> {
  const sinceMs = Date.now() - days * 86400000
  const r = await db!.execute({
    sql: `SELECT date(created_at/1000,'unixepoch') AS day, COALESCE(SUM(cost_usd),0) AS cost, COUNT(*) AS calls
          FROM ai_calls WHERE created_at >= ? GROUP BY day ORDER BY day DESC`,
    args: [sinceMs],
  })
  return r.rows.map((x: any) => ({ day: String(x.day), cost: Number(x.cost), calls: Number(x.calls) }))
}

export async function opsByProject(): Promise<{ projectId: string | null; projectName: string | null; cost: number; calls: number }[]> {
  const r = await db!.execute(
    `SELECT a.project_id AS pid, p.name AS name, COALESCE(SUM(a.cost_usd),0) AS cost, COUNT(*) AS calls
     FROM ai_calls a LEFT JOIN projects p ON p.id = a.project_id
     GROUP BY a.project_id, p.name ORDER BY cost DESC`)
  return r.rows.map((x: any) => ({
    projectId: x.pid != null ? String(x.pid) : null,
    projectName: x.name != null ? String(x.name) : null,
    cost: Number(x.cost), calls: Number(x.calls),
  }))
}

export async function opsByTypeModel(): Promise<{ type: string; model: string; cost: number; calls: number }[]> {
  const r = await db!.execute(
    `SELECT type, model, COALESCE(SUM(cost_usd),0) AS cost, COUNT(*) AS calls
     FROM ai_calls GROUP BY type, model ORDER BY cost DESC`)
  return r.rows.map((x: any) => ({ type: String(x.type), model: String(x.model), cost: Number(x.cost), calls: Number(x.calls) }))
}

export async function opsTenantCostSummary(days = 30): Promise<{
  days: number
  tenants: { accountId: string | null; accountName: string | null; cost: number; calls: number; inputTokens: number; outputTokens: number }[]
  features: { accountId: string | null; accountName: string | null; projectId: string | null; projectName: string | null; feature: string; cost: number; calls: number; inputTokens: number; outputTokens: number }[]
}> {
  const clampedDays = Math.max(1, Math.min(366, Math.floor(Number(days) || 30)))
  const sinceMs = Date.now() - clampedDays * 86400000
  const tenantSql = `
    SELECT COALESCE(a.account_id, p.account_id) AS aid, acc.name AS account_name,
           COALESCE(SUM(a.cost_usd),0) AS cost, COUNT(*) AS calls,
           COALESCE(SUM(a.input_tokens),0) AS input_tokens,
           COALESCE(SUM(a.output_tokens),0) AS output_tokens
    FROM ai_calls a
    LEFT JOIN projects p ON p.id = a.project_id
    LEFT JOIN accounts acc ON acc.id = COALESCE(a.account_id, p.account_id)
    WHERE a.created_at >= ?
    GROUP BY aid, account_name
    ORDER BY cost DESC, calls DESC`
  const featureSql = `
    SELECT COALESCE(a.account_id, p.account_id) AS aid, acc.name AS account_name,
           a.project_id AS pid, p.name AS project_name, COALESCE(a.feature, a.type, 'unknown') AS feature,
           COALESCE(SUM(a.cost_usd),0) AS cost, COUNT(*) AS calls,
           COALESCE(SUM(a.input_tokens),0) AS input_tokens,
           COALESCE(SUM(a.output_tokens),0) AS output_tokens
    FROM ai_calls a
    LEFT JOIN projects p ON p.id = a.project_id
    LEFT JOIN accounts acc ON acc.id = COALESCE(a.account_id, p.account_id)
    WHERE a.created_at >= ?
    GROUP BY aid, account_name, pid, project_name, feature
    ORDER BY cost DESC, calls DESC`
  const [tenantRows, featureRows] = await Promise.all([
    db!.execute({ sql: tenantSql, args: [sinceMs] }),
    db!.execute({ sql: featureSql, args: [sinceMs] }),
  ])
  return {
    days: clampedDays,
    tenants: tenantRows.rows.map((x: any) => ({
      accountId: x.aid != null ? String(x.aid) : null,
      accountName: x.account_name != null ? String(x.account_name) : null,
      cost: Number(x.cost), calls: Number(x.calls),
      inputTokens: Number(x.input_tokens), outputTokens: Number(x.output_tokens),
    })),
    features: featureRows.rows.map((x: any) => ({
      accountId: x.aid != null ? String(x.aid) : null,
      accountName: x.account_name != null ? String(x.account_name) : null,
      projectId: x.pid != null ? String(x.pid) : null,
      projectName: x.project_name != null ? String(x.project_name) : null,
      feature: String(x.feature || "unknown"),
      cost: Number(x.cost), calls: Number(x.calls),
      inputTokens: Number(x.input_tokens), outputTokens: Number(x.output_tokens),
    })),
  }
}

function rowToAiCall(x: any): AiCallRow {
  return {
    id: String(x.id), createdAt: Number(x.created_at), type: String(x.type), model: String(x.model),
    actorEmail: x.actor_email != null ? String(x.actor_email) : null,
    projectId: x.project_id != null ? String(x.project_id) : null,
    accountId: x.account_id != null ? String(x.account_id) : null,
    feature: x.feature != null ? String(x.feature) : aiFeatureFor(String(x.type)),
    inputTokens: x.input_tokens != null ? Number(x.input_tokens) : null,
    outputTokens: x.output_tokens != null ? Number(x.output_tokens) : null,
    costUsd: x.cost_usd != null ? Number(x.cost_usd) : null,
    ok: Number(x.ok) === 1,
  }
}

export async function opsRecentCalls(limit = 50, offset = 0): Promise<AiCallRow[]> {
  const r = await db!.execute({ sql: `SELECT * FROM ai_calls ORDER BY created_at DESC LIMIT ? OFFSET ?`, args: [limit, offset] })
  return r.rows.map(rowToAiCall)
}

export async function opsTodaySpend(): Promise<number> {
  const r = await db!.execute(
    `SELECT COALESCE(SUM(cost_usd),0) AS cost FROM ai_calls WHERE date(created_at/1000,'unixepoch') = date('now')`)
  return Number((r.rows[0] as any).cost)
}

// ── daily-spend reservation (FIX A: cost-cap race) ──────────────────────────────────────────────
// Atomic per-UTC-day spend gate, modeled on tryConsumeReviewBudget. The pre-existing cap was a
// non-atomic read (opsTodaySpend) + compare + fire-and-forget recordAiCall, so N concurrent LLM
// calls could all pass the check before any spend landed → unbounded overshoot. Here the day's
// reserved total is bumped BEFORE the call by a single conditional upsert, so concurrent callers
// serialize on the row and can never both push reserved_usd past the cap.
//
// Recommended default estimate: DEFAULT_AI_CALL_EST_USD (0.01) — a single screenshot/react or
// reconcile call is empirically ~$0.0014–0.005, so 0.01 is a safe over-estimate that fails closed.
// The caller passes its own per-call-type estimate where known; this is the fallback.
//
// ACCOUNTING CHOICE: today's row is SEEDED from opsTodaySpend (the real spend already recorded in
// ai_calls today) on the first reservation of the day, via the INSERT branch. This means the
// reservation total starts from reality, so a process restart mid-day (which loses in-flight
// reservations) still respects spend that actually happened. The caller therefore only needs to
// gate on tryReserveDailySpend's boolean — no separate max(reserved, actualToday) needed.
export const DEFAULT_AI_CALL_EST_USD = 0.01

// Today's date as a UTC 'YYYY-MM-DD' string (matches date('now') / unixepoch grouping used elsewhere).
function utcDay(): string {
  return new Date().toISOString().slice(0, 10)
}

// Atomically reserve `estUsd` against today's cap. Returns true iff the reservation succeeded, i.e.
// reserved_usd + estUsd <= capUsd AFTER seeding the day from real ai_calls spend. A single
// INSERT … ON CONFLICT DO UPDATE … WHERE statement is the atomic gate (mirrors tryConsumeReviewBudget):
//   • INSERT branch (first call of the day): seed reserved = today's real spend, then the row only
//     materializes the reservation if (seed + estUsd) <= cap — enforced by re-checking below.
//   • UPDATE branch: increment ONLY WHERE reserved_usd + estUsd <= cap, so a near-cap row can't be
//     pushed over by two concurrent callers.
// estUsd<=0 or cap<=0 → deny (fail closed). Caller must NOT make the LLM call when this returns false.
export async function tryReserveDailySpend(estUsd: number, capUsd: number): Promise<boolean> {
  if (!Number.isFinite(estUsd) || estUsd <= 0) return false
  if (!Number.isFinite(capUsd) || capUsd <= 0) return false
  const day = utcDay()
  // Seed today's row from real spend already recorded in ai_calls (idempotent: only the first call
  // of the day inserts; later calls hit the conflict and leave the seed intact).
  const seed = await opsTodaySpend()
  await db!.execute({
    sql: "INSERT INTO daily_ai_spend (day,reserved_usd) VALUES (?,?) ON CONFLICT(day) DO NOTHING",
    args: [day, seed],
  })
  // Atomic conditional increment: succeeds for exactly the callers whose estUsd still fits under cap.
  const r = await db!.execute({
    sql: "UPDATE daily_ai_spend SET reserved_usd = reserved_usd + ? WHERE day=? AND reserved_usd + ? <= ?",
    args: [estUsd, day, estUsd, capUsd],
  })
  return Number(r.rowsAffected) > 0
}

// After the LLM call returns its real cost, adjust today's reservation by (actualUsd - estUsd) so the
// running total tracks reality (a cheap call frees headroom; an expensive one consumes more). Clamped
// at >= 0 so floating-point drift / refunds can never make reserved_usd negative. No-op if no row yet.
export async function reconcileDailySpend(estUsd: number, actualUsd: number): Promise<void> {
  const e = Number.isFinite(estUsd) ? estUsd : 0
  const a = Number.isFinite(actualUsd) ? actualUsd : 0
  const delta = a - e
  if (delta === 0) return
  const day = utcDay()
  await db!.execute({
    sql: "UPDATE daily_ai_spend SET reserved_usd = MAX(0, reserved_usd + ?) WHERE day=?",
    args: [delta, day],
  })
}

// Read today's reserved spend (0 if no row yet) — for the /opsadmin dashboard + tests.
export async function reservedDailySpend(): Promise<number> {
  const r = await db!.execute({ sql: "SELECT reserved_usd FROM daily_ai_spend WHERE day=?", args: [utcDay()] })
  return r.rows.length ? Number((r.rows[0] as any).reserved_usd) : 0
}

// ── free-tool daily sub-cap (KLAVITYKLA-341) ────────────────────────────────────────────────────
// `ai_calls.type` values that count against the free-tool sub-cap. Both the CRO friction tool and
// its QA/bug-check sibling share one bounded slice of the global daily budget — keep this list in
// sync with the `type` passed to chat(...) at the /api/cro/analyze call sites in server.ts.
export const FREETOOL_AI_TYPES = ["cro-analyze", "bugcheck-analyze"] as const

export async function freeToolTodaySpend(): Promise<number> {
  const placeholders = FREETOOL_AI_TYPES.map(() => "?").join(",")
  const r = await db!.execute({
    sql: `SELECT COALESCE(SUM(cost_usd),0) AS cost FROM ai_calls
          WHERE date(created_at/1000,'unixepoch') = date('now') AND type IN (${placeholders})`,
    args: [...FREETOOL_AI_TYPES],
  })
  return Number((r.rows[0] as any).cost)
}

// Same atomic reserve/reconcile shape as tryReserveDailySpend/reconcileDailySpend (see comments
// above), but against the SEPARATE daily_freetool_spend row so a viral free-tool spike can only
// ever consume its own bounded slice (KLAV_FREETOOL_DAILY_CAP_USD) — never the shared global cap
// that paid Sims/AutoSims also draw from. Callers MUST check this BEFORE the global
// tryReserveDailySpend gate (and before making the LLM call) so a denial here never touches the
// global budget either.
export async function tryReserveFreeToolSpend(estUsd: number, capUsd: number): Promise<boolean> {
  if (!Number.isFinite(estUsd) || estUsd <= 0) return false
  if (!Number.isFinite(capUsd) || capUsd <= 0) return false
  const day = utcDay()
  const seed = await freeToolTodaySpend()
  await db!.execute({
    sql: "INSERT INTO daily_freetool_spend (day,reserved_usd) VALUES (?,?) ON CONFLICT(day) DO NOTHING",
    args: [day, seed],
  })
  const r = await db!.execute({
    sql: "UPDATE daily_freetool_spend SET reserved_usd = reserved_usd + ? WHERE day=? AND reserved_usd + ? <= ?",
    args: [estUsd, day, estUsd, capUsd],
  })
  return Number(r.rowsAffected) > 0
}

// Release (or true-up) a free-tool reservation, e.g. back to 0 when the call ultimately failed
// after the reservation succeeded — mirrors reconcileDailySpend.
export async function reconcileFreeToolSpend(estUsd: number, actualUsd: number): Promise<void> {
  const e = Number.isFinite(estUsd) ? estUsd : 0
  const a = Number.isFinite(actualUsd) ? actualUsd : 0
  const delta = a - e
  if (delta === 0) return
  const day = utcDay()
  await db!.execute({
    sql: "UPDATE daily_freetool_spend SET reserved_usd = MAX(0, reserved_usd + ?) WHERE day=?",
    args: [delta, day],
  })
}

// Read today's reserved free-tool spend (0 if no row yet) — for tests + future /opsadmin surfacing.
export async function reservedFreeToolSpend(): Promise<number> {
  const r = await db!.execute({ sql: "SELECT reserved_usd FROM daily_freetool_spend WHERE day=?", args: [utcDay()] })
  return r.rows.length ? Number((r.rows[0] as any).reserved_usd) : 0
}

// ── per-tenant AI budget (KLAVITYKLA-314) ────────────────────────────────────────────────────────
// A tenant's (account's) AI spend today, summed from the real ai_calls ledger. Same UTC-day window
// as the global daily cap (date('now')). Used by lib/tenant-budget.ts to gate a single tenant's AI
// consumption so one account can never exhaust the whole global OPS_DAILY_CAP_USD.
export async function tenantTodaySpend(accountId: string): Promise<number> {
  if (!accountId) return 0
  const r = await db!.execute({
    sql: `SELECT COALESCE(SUM(cost_usd),0) AS cost FROM ai_calls
          WHERE account_id = ? AND date(created_at/1000,'unixepoch') = date('now')`,
    args: [accountId],
  })
  return Number((r.rows[0] as any).cost)
}

// Read an account's explicit daily-budget override (null → account uses the env default).
export async function getTenantBudgetOverride(accountId: string): Promise<number | null> {
  if (!accountId) return null
  const r = await db!.execute({ sql: "SELECT daily_budget_usd FROM tenant_ai_budgets WHERE account_id=?", args: [accountId] })
  if (!r.rows.length) return null
  const v = Number((r.rows[0] as any).daily_budget_usd)
  return Number.isFinite(v) ? v : null
}

// Upsert (or clear, when budgetUsd is null) an account's explicit daily-budget override.
export async function setTenantBudgetOverride(accountId: string, budgetUsd: number | null): Promise<void> {
  if (!accountId) return
  if (budgetUsd == null || !Number.isFinite(budgetUsd) || budgetUsd < 0) {
    await db!.execute({ sql: "DELETE FROM tenant_ai_budgets WHERE account_id=?", args: [accountId] })
    return
  }
  await db!.execute({
    sql: `INSERT INTO tenant_ai_budgets (account_id, daily_budget_usd, updated_at) VALUES (?,?,?)
          ON CONFLICT(account_id) DO UPDATE SET daily_budget_usd=excluded.daily_budget_usd, updated_at=excluded.updated_at`,
    args: [accountId, budgetUsd, Date.now()],
  })
}

// ── model mix (/opsadmin) ── persisted weighted model selection, stored in schema_meta. ──
export async function getModelWeights(): Promise<Record<string, number>> {
  const r = await db!.execute({ sql: "SELECT value FROM schema_meta WHERE key=?", args: ["model_weights"] })
  if (!r.rows.length) return {}
  try {
    const o = JSON.parse(String((r.rows[0] as any).value))
    return o && typeof o === "object" && !Array.isArray(o) ? o : {}
  } catch { return {} }
}
export async function setModelWeights(weights: Record<string, number>): Promise<void> {
  await db!.execute({
    sql: "INSERT INTO schema_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    args: ["model_weights", JSON.stringify(weights)],
  })
}

// ── transcripts / sim_traits / trait_events (P3a provenance) ──
// project_id is the canonical 'proj_'+account id. No live/consent/extension surface here (P3b).

export type TranscriptRow = {
  id: string; projectId: string; title: string | null; rawText: string
  sourceDate: number; speakers: string[] | null; addedBy: string; createdAt: number
}
function rowToTranscript(x: any): TranscriptRow {
  return {
    id: String(x.id), projectId: String(x.project_id),
    title: x.title != null ? String(x.title) : null, rawText: String(x.raw_text),
    sourceDate: Number(x.source_date),
    speakers: x.speakers_json ? JSON.parse(String(x.speakers_json)) : null,
    addedBy: String(x.added_by), createdAt: Number(x.created_at),
  }
}
export type TranscriptInsert = {
  projectId: string; title?: string | null; rawText: string
  sourceDate: number; speakers?: string[] | null; addedBy: string; id?: string
}
export async function insertTranscript(t: TranscriptInsert): Promise<string> {
  const id = t.id ?? "tr_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO transcripts (id,project_id,title,raw_text,source_date,speakers_json,added_by,created_at)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [id, t.projectId, t.title ?? null, t.rawText, t.sourceDate,
           t.speakers != null ? JSON.stringify(t.speakers) : null, t.addedBy, Date.now()],
  })
  return id
}
export async function listTranscripts(projectId: string): Promise<TranscriptRow[]> {
  const r = await db!.execute({ sql: "SELECT * FROM transcripts WHERE project_id=? ORDER BY source_date DESC", args: [projectId] })
  return r.rows.map(rowToTranscript)
}

// Return a single transcript only if it belongs to projectId (parameterized WHERE id=? AND project_id=?).
// Returns null when the transcript does not exist or belongs to a different project.
export async function transcriptById(projectId: string, id: string): Promise<TranscriptRow | null> {
  const r = await db!.execute({ sql: "SELECT * FROM transcripts WHERE id=? AND project_id=?", args: [id, projectId] })
  return r.rows.length ? rowToTranscript(r.rows[0]) : null
}

// Distinct transcripts referenced by the sim's trait_events.transcriptId, excluding the
// "legacy_import" sentinel, joined to the project's transcript rows, newest-first by sourceDate.
export async function sourceTranscriptsForSim(
  simId: string,
  projectId: string,
): Promise<{ id: string; title: string | null; sourceDate: number; addedBy: string }[]> {
  const events = await listTraitEvents(simId)
  const ids = [...new Set(events.map((e) => e.transcriptId).filter((t): t is string => !!t && t !== "legacy_import"))]
  if (!ids.length) return []
  const byId = new Map((await listTranscripts(projectId)).map((t) => [t.id, t]))
  return ids
    .map((id) => byId.get(id))
    .filter((t): t is TranscriptRow => !!t)
    .map((t) => ({ id: t.id, title: t.title, sourceDate: t.sourceDate, addedBy: t.addedBy }))
    .sort((a, b) => b.sourceDate - a.sourceDate)
}

function rowToTrait(x: any): Trait {
  return {
    id: String(x.id), simId: String(x.sim_id), projectId: String(x.project_id),
    kind: String(x.kind) as TraitKind, text: String(x.text),
    status: String(x.status || "active") as TraitStatus, strength: Number(x.strength ?? 1),
    srcTranscriptId: String(x.src_transcript_id), srcQuote: String(x.src_quote),
    srcQuoteOffset: x.src_quote_offset != null ? Number(x.src_quote_offset) : null,
    srcVerified: x.src_verified != null ? Number(x.src_verified) === 1 : null,
    srcSpeaker: x.src_speaker != null ? String(x.src_speaker) : null,
    createdAt: Number(x.created_at), updatedAt: Number(x.updated_at),
    area: x.area != null ? String(x.area) : null,
    issueType: x.issue_type != null ? String(x.issue_type) : null,
    priority: (x.priority ?? x.severity) != null ? String(x.priority ?? x.severity) : null,
    scope: x.scope != null ? String(x.scope) : null,
    portability: x.portability != null ? String(x.portability) : null,
  }
}
// Insert a brand-new trait. Accepts a fully-formed Trait (e.g. a TraitWrite{mode:'insert'}.trait).
export async function insertTrait(t: Trait): Promise<string> {
  await db!.execute({
    sql: `INSERT INTO sim_traits (id,sim_id,project_id,kind,text,status,strength,src_transcript_id,src_quote,src_quote_offset,src_verified,src_speaker,area,issue_type,priority,scope,portability,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [t.id, t.simId, t.projectId, t.kind, t.text, t.status, t.strength,
           t.srcTranscriptId, t.srcQuote, t.srcQuoteOffset ?? null,
           t.srcVerified == null ? null : (t.srcVerified ? 1 : 0),
           t.srcSpeaker ?? null,
           t.area ?? null, t.issueType ?? null, t.priority ?? null,
           t.scope ?? null, t.portability ?? null, t.createdAt, t.updatedAt],
  })
  return t.id
}
// Update a trait's mutable columns (text/status/strength/provenance/updatedAt + typed fields) — used by reconcile writes.
export async function updateTrait(t: Trait): Promise<void> {
  await db!.execute({
    sql: `UPDATE sim_traits SET kind=?,text=?,status=?,strength=?,src_transcript_id=?,src_quote=?,src_quote_offset=?,src_verified=?,src_speaker=?,area=?,issue_type=?,priority=?,scope=?,portability=?,updated_at=? WHERE id=?`,
    args: [t.kind, t.text, t.status, t.strength, t.srcTranscriptId, t.srcQuote,
           t.srcQuoteOffset ?? null, t.srcVerified == null ? null : (t.srcVerified ? 1 : 0),
           t.srcSpeaker ?? null,
           t.area ?? null, t.issueType ?? null, t.priority ?? null,
           t.scope ?? null, t.portability ?? null, t.updatedAt, t.id],
  })
}
// FIX B (citation IDOR defense-in-depth): pass projectId to scope the read to a single project —
// adds `AND project_id=?` so a sim_id from another project can never leak its traits. Omitting
// projectId is fully backward-compatible (behaves exactly as before).
export async function listTraits(simId: string, opts: { activeOnly?: boolean; projectId?: string } = {}): Promise<Trait[]> {
  const projClause = opts.projectId ? " AND project_id=?" : ""
  const projArg = opts.projectId ? [opts.projectId] : []
  const r = opts.activeOnly
    ? await db!.execute({ sql: `SELECT * FROM sim_traits WHERE sim_id=? AND status='active'${projClause} ORDER BY created_at ASC`, args: [simId, ...projArg] })
    : await db!.execute({ sql: `SELECT * FROM sim_traits WHERE sim_id=?${projClause} ORDER BY created_at ASC`, args: [simId, ...projArg] })
  return r.rows.map(rowToTrait)
}

// Append a trait_event audit row (append-only — never updated/deleted).
export async function insertTraitEvent(e: TraitEventRow): Promise<string> {
  const id = "tev_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO trait_events (id,trait_id,sim_id,transcript_id,op,before_text,after_text,quote,quote_offset,verified,speaker,source_date,reason,area,issue_type,priority,actor,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, e.traitId, e.simId, e.transcriptId, e.op, e.beforeText ?? null, e.afterText ?? null,
           e.quote, e.quoteOffset ?? null, e.verified == null ? null : (e.verified ? 1 : 0),
           e.speaker ?? null, e.sourceDate, e.reason ?? null,
           e.area ?? null, e.issueType ?? null, e.priority ?? null, e.actor ?? null, e.createdAt],
  })
  return id
}

// Human edit/create/archive of a trait — persists the trait state AND appends a matching
// append-only audit event. The frontend Sim Studio writes go through here so every manual
// change is versioned alongside AI reconcile history.
export async function logTraitEdit(args: {
  op: "manual_create" | "edit" | "manual_archive"
  trait: Trait
  beforeText: string | null
  actor: string
  now: number
}): Promise<void> {
  const { op, trait, beforeText, actor, now } = args
  if (op === "manual_create") await insertTrait(trait)
  else await updateTrait(trait)
  await insertTraitEvent({
    traitId: trait.id, simId: trait.simId, transcriptId: trait.srcTranscriptId,
    op, beforeText, afterText: trait.text, quote: trait.srcQuote, quoteOffset: trait.srcQuoteOffset ?? null,
    speaker: trait.srcSpeaker ?? null, sourceDate: now, reason: "manual:" + op, actor,
    area: trait.area ?? null, issueType: trait.issueType ?? null, priority: trait.priority ?? null,
    createdAt: now,
  })
}

// ── persona_edits: append-only audit of human persona identity edits (Sim Studio). ──
export type PersonaEditRow = { id: string; personaId: string; projectId: string; field: string; beforeVal: string | null; afterVal: string | null; actor: string; createdAt: number }
export async function insertPersonaEdit(e: Omit<PersonaEditRow, "id">): Promise<string> {
  const id = "ped_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO persona_edits (id,persona_id,project_id,field,before_val,after_val,actor,created_at) VALUES (?,?,?,?,?,?,?,?)`,
    args: [id, e.personaId, e.projectId, e.field, e.beforeVal ?? null, e.afterVal ?? null, e.actor, e.createdAt],
  })
  return id
}
export async function listPersonaEdits(personaId: string): Promise<PersonaEditRow[]> {
  const r = await db!.execute({ sql: "SELECT * FROM persona_edits WHERE persona_id=? ORDER BY created_at ASC", args: [personaId] })
  return r.rows.map((x: any) => ({ id: String(x.id), personaId: String(x.persona_id), projectId: String(x.project_id),
    field: String(x.field), beforeVal: x.before_val != null ? String(x.before_val) : null,
    afterVal: x.after_val != null ? String(x.after_val) : null, actor: String(x.actor), createdAt: Number(x.created_at) }))
}

function rowToTraitEvent(x: any): TraitEventRow {
  return {
    traitId: String(x.trait_id), simId: String(x.sim_id), transcriptId: String(x.transcript_id),
    op: String(x.op) as TraitEventRow["op"],
    beforeText: x.before_text != null ? String(x.before_text) : null,
    afterText: x.after_text != null ? String(x.after_text) : null,
    quote: String(x.quote), quoteOffset: x.quote_offset != null ? Number(x.quote_offset) : null,
    verified: x.verified != null ? Number(x.verified) === 1 : null,
    speaker: x.speaker != null ? String(x.speaker) : null,
    sourceDate: Number(x.source_date),
    reason: x.reason != null ? String(x.reason) : null,
    createdAt: Number(x.created_at),
    area: x.area != null ? String(x.area) : null,
    issueType: x.issue_type != null ? String(x.issue_type) : null,
    priority: (x.priority ?? x.severity) != null ? String(x.priority ?? x.severity) : null,
    actor: x.actor != null ? String(x.actor) : null,
  }
}

// List trait_events for a sim. Optional { traitId } narrows to a single trait's events (react path
// can fetch one trait's audit chain without a full sim scan).
// FIX B (citation IDOR defense-in-depth): pass projectId to scope events to a single project.
// trait_events has no project_id column, so scoping is enforced via the parent sim_traits row
// (`AND trait_id IN (SELECT id FROM sim_traits WHERE project_id=?)`) — events whose trait belongs
// to another project are excluded. Omitting projectId is fully backward-compatible (unchanged).
export async function listTraitEvents(simId: string, opts: { traitId?: string; projectId?: string } = {}): Promise<TraitEventRow[]> {
  const args: any[] = [simId]
  let sql = "SELECT * FROM trait_events WHERE sim_id=?"
  if (opts.traitId) { sql += " AND trait_id=?"; args.push(opts.traitId) }
  if (opts.projectId) { sql += " AND trait_id IN (SELECT id FROM sim_traits WHERE project_id=?)"; args.push(opts.projectId) }
  sql += " ORDER BY created_at ASC"
  const r = await db!.execute({ sql, args })
  return r.rows.map(rowToTraitEvent)
}

// Return recently contradicted/superseded traits for the reopen feed (RECONCILE_SYS context).
// Ordered newest-first by updated_at; limit defaults to 20.
export type RecentlyResolvedTrait = {
  id: string
  kind: string
  text: string
  area: string | null
  issueType: string | null
  priority: string | null
  status: string
  updatedAt: number
}
export async function getRecentlyResolvedTraits(simId: string, limit = 20): Promise<RecentlyResolvedTrait[]> {
  const r = await db!.execute({
    sql: `SELECT id, kind, text, area, issue_type, COALESCE(priority, severity) AS priority, status, updated_at
          FROM sim_traits WHERE sim_id=? AND status IN ('contradicted','superseded')
          ORDER BY updated_at DESC LIMIT ?`,
    args: [simId, limit],
  })
  return r.rows.map((x: any): RecentlyResolvedTrait => ({
    id: String(x.id),
    kind: String(x.kind),
    text: String(x.text),
    area: x.area != null ? String(x.area) : null,
    issueType: x.issue_type != null ? String(x.issue_type) : null,
    priority: x.priority != null ? String(x.priority) : null,
    status: String(x.status),
    updatedAt: Number(x.updated_at),
  }))
}

// ── reconcile_runs cost-guard cache (§5): skip re-reconciling a (sim,transcript) pair. ──
export async function hasReconcileRun(simId: string, transcriptId: string): Promise<boolean> {
  const r = await db!.execute({ sql: "SELECT 1 FROM reconcile_runs WHERE sim_id=? AND transcript_id=? LIMIT 1", args: [simId, transcriptId] })
  return r.rows.length > 0
}
export async function markReconcileRun(simId: string, transcriptId: string): Promise<void> {
  await db!.execute({
    sql: "INSERT OR IGNORE INTO reconcile_runs (sim_id,transcript_id,created_at) VALUES (?,?,?)",
    args: [simId, transcriptId, Date.now()],
  })
}

// Lazy "legacy import" backfill (§2.4 step 4 semantics, applied at reconcile time so it also covers
// Sims saved after the P2 migration). A Sim created/saved before P3a has a populated `insights_json`
// but ZERO `sim_traits` rows — so the first reconcile could only `add` (no traits to evolve) and
// `rebuildInsightsJson` would then OVERWRITE insights_json with only the freshly-extracted traits,
// silently discarding the Sim's prior insights. This seeds one active trait + a 'create' trait_event
// per existing insight, anchored to a synthetic `legacy_import` transcript id (source_date ≈ the
// persona's created_at, so citations render "(legacy import)"). IDEMPOTENT: only runs when the Sim
// has zero existing traits, so a second call is a no-op. Returns the number of traits seeded.
//
// Accepts BOTH insight shapes seen in the wild:
//  - legacy EXTRACT_SYS / brief shape: { kind, text, quote }
//  - P3a cache shape (insightsFromTraits): { traitId, kind, text, quote, speaker, sourceTranscriptId, strength }
export async function ensureTraitsSeeded(simId: string): Promise<number> {
  // Guard: only seed when there are NO traits at all (any status) — so reinforce/refine evolution
  // is possible afterward and we never double-seed.
  const existing = await listTraits(simId) // all statuses
  if (existing.length) return 0

  const r = await db!.execute({ sql: "SELECT project_id, insights_json, created_at FROM personas WHERE id=?", args: [simId] })
  if (!r.rows.length) return 0
  const row = r.rows[0] as any
  const projectId = String(row.project_id)
  const createdAt = Number(row.created_at) || Date.now()
  let insights: any[] = []
  try { insights = row.insights_json ? JSON.parse(String(row.insights_json)) : [] } catch { insights = [] }
  if (!Array.isArray(insights) || !insights.length) return 0

  const validKinds = new Set(["pain", "want", "love"])
  let seeded = 0
  for (const ins of insights) {
    const kind = String(ins?.kind || "")
    if (!validKinds.has(kind)) continue
    const text = String(ins?.text || ins?.quote || "").trim()
    if (!text) continue
    const quote = String(ins?.quote || ins?.text || "").trim() || text
    const now = Date.now()
    const trait: Trait = {
      id: "trait_" + crypto.randomUUID(),
      simId, projectId, kind: kind as TraitKind, text,
      status: "active", strength: Number(ins?.strength) > 0 ? Number(ins.strength) : 1,
      srcTranscriptId: "legacy_import", srcQuote: quote, srcQuoteOffset: null,
      srcSpeaker: ins?.speaker != null ? String(ins.speaker) : null,
      createdAt, updatedAt: now,
      // Carry v3 finding-altitude/durability from the cached insight onto the seeded trait row.
      area: ins?.area != null ? String(ins.area) : null,
      issueType: ins?.issueType != null ? String(ins.issueType) : null,
      priority: (ins?.priority ?? ins?.severity) != null ? String(ins?.priority ?? ins?.severity) : null,
      scope: ins?.scope != null ? String(ins.scope) : null,
      portability: ins?.portability != null ? String(ins.portability) : null,
    }
    await insertTrait(trait)
    await insertTraitEvent({
      traitId: trait.id, simId, transcriptId: "legacy_import", op: "create",
      beforeText: null, afterText: text, quote, quoteOffset: null,
      speaker: trait.srcSpeaker, sourceDate: createdAt, reason: "legacy import", createdAt: now,
    })
    seeded += 1
  }
  return seeded
}

// Recompute a persona's insights_json read cache from its ACTIVE sim_traits and persist it.
// Keeps insights_json as the denormalized cache the dashboard/studio render from. Returns the cache.
// DEFENSIVE no-op: if the active-trait set is empty while insights_json is currently non-empty, do
// NOT overwrite — a zero-trait rebuild must never silently wipe a Sim's prior insights (C1 guard).
export async function rebuildInsightsJson(simId: string) {
  const active = await listTraits(simId, { activeOnly: true })
  const insights = insightsFromTraits(active)
  if (!insights.length) {
    const cur = await db!.execute({ sql: "SELECT insights_json FROM personas WHERE id=?", args: [simId] })
    const curJson = cur.rows.length ? (cur.rows[0] as any).insights_json : null
    let curArr: any[] = []
    try { curArr = curJson ? JSON.parse(String(curJson)) : [] } catch { curArr = [] }
    if (Array.isArray(curArr) && curArr.length) return curArr // keep existing — don't wipe
  }
  await db!.execute({
    sql: "UPDATE personas SET insights_json=?, updated_at=? WHERE id=?",
    args: [JSON.stringify(insights), Date.now(), simId],
  })
  return insights
}

// ── monitored_urls / consent / review budget / extension tokens (P3b live activation) ──
// project_id is the canonical 'proj_'+account id. Patterns are prefix/glob ONLY (no regex).

export type MonitoredUrlRow = { id: string; projectId: string; urlPattern: string; enabled: boolean; createdAt: number }
function rowToMonitoredUrl(x: any): MonitoredUrlRow {
  return { id: String(x.id), projectId: String(x.project_id), urlPattern: String(x.url_pattern), enabled: Number(x.enabled) === 1, createdAt: Number(x.created_at) }
}
// All patterns for a project (admin view). enabledOnly → only rows the extension should act on.
export async function listMonitoredUrls(projectId: string, opts: { enabledOnly?: boolean } = {}): Promise<MonitoredUrlRow[]> {
  const r = opts.enabledOnly
    ? await db!.execute({ sql: "SELECT * FROM monitored_urls WHERE project_id=? AND enabled=1 ORDER BY created_at ASC", args: [projectId] })
    : await db!.execute({ sql: "SELECT * FROM monitored_urls WHERE project_id=? ORDER BY created_at ASC", args: [projectId] })
  return r.rows.map(rowToMonitoredUrl)
}
// Add (or re-enable) a pattern. Idempotent via UNIQUE(project_id,url_pattern). Returns the row id.
export async function addMonitoredUrl(projectId: string, urlPattern: string, enabled = true): Promise<string> {
  const id = "mon_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO monitored_urls (id,project_id,url_pattern,enabled,created_at) VALUES (?,?,?,?,?)
          ON CONFLICT(project_id,url_pattern) DO UPDATE SET enabled=excluded.enabled`,
    args: [id, projectId, urlPattern, enabled ? 1 : 0, Date.now()],
  })
  const r = await db!.execute({ sql: "SELECT id FROM monitored_urls WHERE project_id=? AND url_pattern=?", args: [projectId, urlPattern] })
  return r.rows.length ? String((r.rows[0] as any).id) : id
}
export async function setMonitoredUrlEnabled(projectId: string, id: string, enabled: boolean): Promise<void> {
  await db!.execute({ sql: "UPDATE monitored_urls SET enabled=? WHERE project_id=? AND id=?", args: [enabled ? 1 : 0, projectId, id] })
}
// Edit a pattern in place. UNIQUE(project_id,url_pattern) means renaming onto an existing
// pattern throws a constraint error — the caller surfaces that as a friendly message.
export async function setMonitoredUrlPattern(projectId: string, id: string, urlPattern: string): Promise<void> {
  await db!.execute({ sql: "UPDATE monitored_urls SET url_pattern=? WHERE project_id=? AND id=?", args: [urlPattern, projectId, id] })
}
export async function removeMonitoredUrl(projectId: string, id: string): Promise<void> {
  await db!.execute({ sql: "DELETE FROM monitored_urls WHERE project_id=? AND id=?", args: [projectId, id] })
}

// matchMonitored: prefix/glob ONLY (NO regex). A pattern matches `url` on host+path when, after
// normalizing both (strip scheme, query, fragment, trailing slash), the url starts with the pattern's
// literal prefix — with '*' acting as a wildcard for any run of characters. Examples:
//   'app.example.com/billing'   matches 'https://app.example.com/billing/invoices?x=1'
//   'app.example.com/*/settings' matches 'app.example.com/team/settings'
// Returns the matched MonitoredUrlRow (first enabled match) or null.
function normForMatch(u: string): string {
  let s = String(u || "").trim()
  s = s.replace(/^https?:\/\//i, "")          // strip scheme
  s = s.replace(/[?#].*$/, "")                // strip query + fragment (path-only, §5)
  s = s.replace(/\/+$/, "")                   // strip trailing slash(es)
  return s.toLowerCase()
}
function globToRegExp(pattern: string): RegExp {
  // Escape everything except '*', which becomes '.*'. Anchored at start (prefix match), open at end.
  // Bound the input and collapse runs of '*' so a pathological pattern can't build a regex with
  // many overlapping '.*' groups (catastrophic-backtracking / ReDoS hardening — OWASP A05).
  const safe = String(pattern || "").slice(0, 512).replace(/\*{2,}/g, "*")
  const esc = safe.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")
  return new RegExp("^" + esc)
}
export function patternMatchesUrl(pattern: string, url: string): boolean {
  const p = normForMatch(pattern)
  const u = normForMatch(url)
  if (!p) return false
  if (!p.includes("*")) return u === p || u.startsWith(p + "/")  // prefix on a path boundary
  return globToRegExp(p).test(u)
}
export async function matchMonitored(projectId: string, url: string): Promise<MonitoredUrlRow | null> {
  const rows = await listMonitoredUrls(projectId, { enabledOnly: true })
  for (const row of rows) if (patternMatchesUrl(row.urlPattern, url)) return row
  return null
}

export function hostOfPattern(pattern: string): string {
  return String(pattern || "").trim()
    .replace(/^https?:\/\//i, "")
    .replace(/[?#].*$/, "")
    .split("/")[0]
    .replace(/\*+$/, "")
    .toLowerCase()
}

export async function originAllowedForProject(projectId: string, origin: string): Promise<boolean> {
  let host = ""
  try { host = new URL(origin).host.toLowerCase() } catch { return false }
  if (!host) return false
  const rows = await listMonitoredUrls(projectId, { enabledOnly: true })
  return rows.some(r => hostOfPattern(r.urlPattern) === host)
}

// ── monitoring consent (per-member-per-project) ──
export type ConsentRow = { projectId: string; email: string; status: string; grantedAt: number | null; updatedAt: number }
export async function getConsent(projectId: string, email: string): Promise<ConsentRow | null> {
  const r = await db!.execute({ sql: "SELECT * FROM monitoring_consent WHERE project_id=? AND email=?", args: [projectId, email] })
  if (!r.rows.length) return null
  const x = r.rows[0] as any
  return { projectId: String(x.project_id), email: String(x.email), status: String(x.status), grantedAt: x.granted_at != null ? Number(x.granted_at) : null, updatedAt: Number(x.updated_at) }
}
// Upsert consent status. granted_at is stamped the first time status becomes 'granted' and preserved after.
export async function setConsent(projectId: string, email: string, status: 'granted' | 'paused' | 'revoked'): Promise<void> {
  const now = Date.now()
  const existing = await getConsent(projectId, email)
  const grantedAt = status === "granted" ? (existing?.grantedAt ?? now) : (existing?.grantedAt ?? null)
  await db!.execute({
    sql: `INSERT INTO monitoring_consent (id,project_id,email,status,granted_at,updated_at) VALUES (?,?,?,?,?,?)
          ON CONFLICT(project_id,email) DO UPDATE SET status=excluded.status, granted_at=excluded.granted_at, updated_at=excluded.updated_at`,
    args: ["con_" + projectId + "_" + email, projectId, email, status, grantedAt, now],
  })
}

// ── project review_mode (user/admin pause) ──
export async function getReviewMode(projectId: string): Promise<string | null> {
  const r = await db!.execute({ sql: "SELECT review_mode FROM projects WHERE id=?", args: [projectId] })
  return r.rows.length ? String((r.rows[0] as any).review_mode) : null
}
export async function setReviewMode(projectId: string, mode: 'auto' | 'ready' | 'paused'): Promise<void> {
  await db!.execute({ sql: "UPDATE projects SET review_mode=?, updated_at=? WHERE id=?", args: [mode, Date.now(), projectId] })
}

// tryConsumeReviewBudget: ATOMIC per-project-per-day budget cap (§5). Returns true iff it incremented
// the day's count to a value <= budget (i.e. the caller is allowed to spend one review); false when the
// day is already at/over budget. The UPDATE … WHERE count<budget is the atomic gate: only one writer can
// take the row from (budget-1)→budget. budget<=0 always denies. Row is lazily created at count=0 first.
export async function tryConsumeReviewBudget(projectId: string, day: string, budget: number): Promise<boolean> {
  if (!Number.isFinite(budget) || budget <= 0) return false
  await db!.execute({
    sql: "INSERT INTO review_counts (project_id,day,count) VALUES (?,?,0) ON CONFLICT(project_id,day) DO NOTHING",
    args: [projectId, day],
  })
  const r = await db!.execute({
    sql: "UPDATE review_counts SET count=count+1 WHERE project_id=? AND day=? AND count<?",
    args: [projectId, day, budget],
  })
  return Number(r.rowsAffected) > 0
}
// Read the current day's consumed count (0 if no row yet).
export async function reviewBudgetUsed(projectId: string, day: string): Promise<number> {
  const r = await db!.execute({ sql: "SELECT count FROM review_counts WHERE project_id=? AND day=?", args: [projectId, day] })
  return r.rows.length ? Number((r.rows[0] as any).count) : 0
}

// ── extension tokens (dedicated narrow-scope Bearer, R5 pre-req) ──
// Issue (or rotate) a token bound to email (+optional project). Replaces reusing the raw session id.
export async function issueExtensionToken(email: string, projectId?: string | null, ttlMs?: number | null): Promise<string> {
  // E1: return the RAW token to the caller (the extension/widget holds it as its Bearer), but persist
  // only sha256hex(token) so a DB read can't be replayed as a credential.
  const token = "ext_" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  const now = Date.now()
  const expiresAt = ttlMs && ttlMs > 0 ? now + ttlMs : null
  await db!.execute({
    sql: "INSERT INTO extension_tokens (token,email,project_id,created_at,expires_at,revoked) VALUES (?,?,?,?,?,0)",
    args: [sha256hex(token), email, projectId ?? null, now, expiresAt],
  })
  return token
}
// Resolve a dedicated extension token → email, honoring revoked + expiry. Returns null if not an ext token.
// Resolve a Bearer extension token to its owner AND the project it is bound to (null = account-wide).
// Widget tokens (minted via /api/widget/token) carry a project_id and MUST be constrained to it (F5);
// the extension's own token is account-wide (project_id null).
export async function getExtensionTokenInfo(token: string): Promise<{ email: string; projectId: string | null } | null> {
  // E1: look up by hash. Dual-read migration fallback to the raw value keeps tokens minted before E1
  // working until they expire/are revoked. REMOVE the raw fallback once all pre-E1 tokens have aged out.
  let r = await db!.execute({ sql: "SELECT email, project_id, expires_at, revoked FROM extension_tokens WHERE token=?", args: [sha256hex(token)] })
  if (!r.rows.length) r = await db!.execute({ sql: "SELECT email, project_id, expires_at, revoked FROM extension_tokens WHERE token=?", args: [token] })
  if (!r.rows.length) return null
  const x = r.rows[0] as any
  if (Number(x.revoked) === 1) return null
  if (x.expires_at != null && Number(x.expires_at) < Date.now()) return null
  return { email: String(x.email), projectId: x.project_id != null ? String(x.project_id) : null }
}
export async function getExtensionTokenEmail(token: string): Promise<string | null> {
  return (await getExtensionTokenInfo(token))?.email ?? null
}
export async function revokeExtensionToken(token: string): Promise<void> {
  // Revoke both the hashed row (E1) and any legacy plaintext row during the dual-read migration window.
  await db!.execute({ sql: "UPDATE extension_tokens SET revoked=1 WHERE token=? OR token=?", args: [sha256hex(token), token] })
}

// ── CI tokens (KLA-90) — machine-to-machine, project-bound Bearer tokens with kci_ prefix.
// Stored in extension_tokens (same security guarantees: sha256hex-hashed, revocable, expiry-aware).
// Distinct from extension tokens by prefix so callers can tell them apart without a DB round-trip.
export async function issueCIToken(email: string, projectId: string): Promise<string> {
  const token = "kci_" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  await db!.execute({
    sql: "INSERT INTO extension_tokens (token,email,project_id,created_at,expires_at,revoked) VALUES (?,?,?,?,?,0)",
    args: [sha256hex(token), email, projectId, Date.now(), null],
  })
  return token
}

// ── /api/sim/review guardrail ordering (§5, binding) ──
// PURE decision function: given the already-resolved state for one review attempt, return the FIRST
// failing gate (or { ok:true } if all pass). Kept pure + side-effect-free so the ordering is unit-testable
// without mocking HTTP/AI/S3. The endpoint resolves each input via the async helpers above, in this order,
// and short-circuits on the first block — so an off-allowlist URL is NEVER captured/reviewed (gate d), and
// no vision/screenshot work happens until every gate passes.
//
// Gate order (each a hard gate):
//   a. auth        — caller authenticated + has project access            → 401 'unauthorized'
//   b. paused      — admin pause (review_mode==='paused') OR user pause
//                    (consent 'paused'|'revoked')                          → 423 'paused' / 'userPaused'
//   c. consent     — consent must be 'granted' (else needs first capture)  → 412 'needsConsent'
//   d. allowlist   — url matches an enabled monitored pattern (ALLOWLIST
//                    ONLY — never review off-allowlist)                    → 403 'offAllowlist'
//   e. dedupe      — (sim,urlPath,domSig) already reviewed                 → 200 'alreadyReviewed'
//   f. budget      — per-project daily atomic cap not exhausted            → 429 'budgetExhausted'
export type ReviewGateInput = {
  authed: boolean
  reviewMode: string | null            // project's review_mode ('auto'|'ready'|'paused')
  consentStatus: string | null         // caller's monitoring_consent status ('granted'|'paused'|'revoked'|null)
  allowlistMatch: boolean              // url matched an ENABLED monitored pattern
  alreadyReviewed: boolean             // (sim,urlPath,domSig) dedupe hit
  budgetConsumed: boolean              // tryConsumeReviewBudget succeeded (a slot was taken)
  adhoc?: boolean                      // explicit user-initiated "Analyze this page" — bypasses passive gates
}
export type ReviewGateResult = { ok: true } | { ok: false; reason: string; status: number; message: string }
export function reviewGate(i: ReviewGateInput): ReviewGateResult {
  if (!i.authed) return { ok: false, reason: "unauthorized", status: 401, message: "Sign in to continue." }
  // Ad-hoc "Analyze this page" is an explicit, user-initiated one-shot review. It bypasses the passive-
  // monitoring gates (admin/user pause, consent, allowlist, dedupe) — the extension's per-domain confirm
  // covers consent — but the daily budget cost guard (gate f) still applies.
  if (i.adhoc) {
    if (!i.budgetConsumed) return { ok: false, reason: "budgetExhausted", status: 429, message: "The project's daily review budget is exhausted; reviews were auto-paused." }
    return { ok: true }
  }
  if (i.reviewMode === "paused") return { ok: false, reason: "paused", status: 423, message: "Reviews are paused for this project by an admin." }
  if (i.consentStatus === "paused" || i.consentStatus === "revoked") return { ok: false, reason: "userPaused", status: 423, message: "You have paused Sim reviews. Resume to continue." }
  if (i.consentStatus !== "granted") return { ok: false, reason: "needsConsent", status: 412, message: "Consent is required before Sims can review pages you visit." }
  if (!i.allowlistMatch) return { ok: false, reason: "offAllowlist", status: 403, message: "This URL is not on the project's monitored allowlist." }
  if (i.alreadyReviewed) return { ok: false, reason: "alreadyReviewed", status: 200, message: "This page was already reviewed." }
  if (!i.budgetConsumed) return { ok: false, reason: "budgetExhausted", status: 429, message: "The project's daily review budget is exhausted; reviews were auto-paused." }
  return { ok: true }
}

// Stable dedupe key for a single review: (sim_id, normalized url path, dom signature). Promotes the
// existing `klav_dev_react_*` hash pattern — a page isn't re-reviewed for the same Sim until its DOM
// signature changes. domSig is the caller-supplied content hash ('' when absent → path-level dedupe).
export function reviewDedupeKey(simId: string, urlPath: string, domSig: string | null | undefined): string {
  return `${simId}|${(urlPath || "").replace(/\/+$/, "").toLowerCase()}|${domSig || ""}`
}

// UTC day string (YYYY-MM-DD) for the per-project budget counter row.
export function reviewDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

// ── Connectors + ticket_exports (Task 1: cloud tickets + connectors) ──

export type ConnectorType = "webhook" | "plane" | "github" | "jira" | "linear"
export type ConnectorRow = {
  id: string
  projectId: string
  type: ConnectorType
  name: string
  config: Record<string, string>  // secret fields still encrypted — callers decrypt before use
  autoCopy: boolean
  enabled: boolean
  createdAt: number
  createdBy: string | null
}
export type TicketExportRow = {
  id: string
  feedbackId: string
  projectId: string
  connectorId: string
  type: string
  externalKey: string | null
  externalUrl: string | null
  status: "ok" | "failed"
  error: string | null
  createdAt: number
  createdBy: string | null
}

function rowToConnector(x: any): ConnectorRow {
  let config: Record<string, string> = {}
  try { config = x.config ? JSON.parse(String(x.config)) : {} } catch { config = {} }
  return {
    id: String(x.id),
    projectId: String(x.project_id),
    type: String(x.type) as ConnectorType,
    name: String(x.name),
    config,
    autoCopy: Number(x.auto_copy) === 1,
    enabled: Number(x.enabled) === 1,
    createdAt: Number(x.created_at),
    createdBy: x.created_by != null ? String(x.created_by) : null,
  }
}

function rowToTicketExport(x: any): TicketExportRow {
  return {
    id: String(x.id),
    feedbackId: String(x.feedback_id),
    projectId: String(x.project_id),
    connectorId: String(x.connector_id),
    type: String(x.type),
    externalKey: x.external_key != null ? String(x.external_key) : null,
    externalUrl: x.external_url != null ? String(x.external_url) : null,
    status: String(x.status) as "ok" | "failed",
    error: x.error != null ? String(x.error) : null,
    createdAt: Number(x.created_at),
    createdBy: x.created_by != null ? String(x.created_by) : null,
  }
}

// config secrets are stored encrypted (callers encrypt before calling create/update).
// listConnectors does NOT decrypt.
export async function listConnectors(projectId: string): Promise<ConnectorRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM connectors WHERE project_id=? ORDER BY created_at ASC",
    args: [projectId],
  })
  return r.rows.map(rowToConnector)
}

export async function getConnectorById(projectId: string, id: string): Promise<ConnectorRow | null> {
  const r = await db!.execute({
    sql: "SELECT * FROM connectors WHERE project_id=? AND id=?",
    args: [projectId, id],
  })
  return r.rows.length ? rowToConnector(r.rows[0]) : null
}

export async function createConnector(
  projectId: string,
  c: { type: ConnectorType; name: string; config: Record<string, string>; autoCopy: boolean; createdBy: string | null }
): Promise<string> {
  const id = "conn_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO connectors (id,project_id,type,name,config,auto_copy,enabled,created_at,created_by)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [id, projectId, c.type, c.name, JSON.stringify(c.config), c.autoCopy ? 1 : 0, 1, Date.now(), c.createdBy ?? null],
  })
  return id
}

export async function updateConnector(
  projectId: string,
  id: string,
  patch: Partial<{ name: string; config: Record<string, string>; autoCopy: boolean; enabled: boolean }>
): Promise<void> {
  const sets: string[] = []
  const args: any[] = []
  if (patch.name !== undefined) { sets.push("name=?"); args.push(patch.name) }
  if (patch.config !== undefined) { sets.push("config=?"); args.push(JSON.stringify(patch.config)) }
  if (patch.autoCopy !== undefined) { sets.push("auto_copy=?"); args.push(patch.autoCopy ? 1 : 0) }
  if (patch.enabled !== undefined) { sets.push("enabled=?"); args.push(patch.enabled ? 1 : 0) }
  if (!sets.length) return
  args.push(projectId, id)
  await db!.execute({ sql: `UPDATE connectors SET ${sets.join(",")} WHERE project_id=? AND id=?`, args })
}

export async function removeConnector(projectId: string, id: string): Promise<void> {
  await db!.execute({ sql: "DELETE FROM connectors WHERE project_id=? AND id=?", args: [projectId, id] })
}

// Only connectors that are both enabled=1 AND auto_copy=1.
export async function listAutoCopyConnectors(projectId: string): Promise<ConnectorRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM connectors WHERE project_id=? AND enabled=1 AND auto_copy=1 ORDER BY created_at ASC",
    args: [projectId],
  })
  return r.rows.map(rowToConnector)
}

// Persist a heartbeat event into the connector's existing config JSON column.
// No schema migration needed — heartbeat fields are stored as "_last_*" keys inside config.
// Fire-and-forget: callers should void this call; a DB failure is non-fatal.
// `event.kind`    — "outbound" (we pushed a ticket) or "inbound" (we received a webhook)
// `event.success` — true = record last_outbound_at or last_inbound_at; false = record last_error
// `event.error`   — error message on failure (ignored when success=true)
export async function touchConnectorHeartbeat(
  connectorId: string,
  event: { kind: "outbound" | "inbound"; success: boolean; error?: string },
): Promise<void> {
  // Inline import to avoid a circular dependency chain: db.ts → connectors/ → db.ts.
  // Using a dynamic import here so the module graph stays acyclic at compile time.
  const { applyHeartbeat } = await import("./connectors/health")
  const r = await db!.execute({
    sql: "SELECT config FROM connectors WHERE id=?",
    args: [connectorId],
  })
  if (!r.rows.length) return
  let existing: Record<string, string> = {}
  try { existing = JSON.parse(String((r.rows[0] as any).config || "{}")) } catch { existing = {} }
  const updated = applyHeartbeat(existing, event)
  await db!.execute({
    sql: "UPDATE connectors SET config=? WHERE id=?",
    args: [JSON.stringify(updated), connectorId],
  })
}

// Update feedback management columns. Always sets updated_at. Returns true if a row was updated
// (i.e. the feedback belongs to the given project), false if no rows matched (cross-project guard).
export async function updateFeedbackMeta(
  projectId: string,
  feedbackId: string,
  meta: Partial<{ status: string; assignee: string | null; notes: string | null; priority: string | null }>
): Promise<boolean> {
  const now = Date.now()
  const sets: string[] = ["updated_at=?"]
  const args: any[] = [now]
  if (meta.status !== undefined) {
    sets.push("status=?"); args.push(meta.status)
    if (meta.status === "done") { sets.push("resolved_at=?"); args.push(now) }
  }
  if ("assignee" in meta) { sets.push("assignee=?"); args.push(meta.assignee ?? null) }
  if ("notes" in meta) { sets.push("notes=?"); args.push(meta.notes ?? null) }
  if ("priority" in meta) { sets.push("priority=?"); args.push(meta.priority ?? null) }
  args.push(projectId, feedbackId)
  const r = await db!.execute({
    sql: `UPDATE feedback SET ${sets.join(",")} WHERE project_id=? AND id=?`,
    args,
  })
  return Number(r.rowsAffected) > 0
}

// Fetch a single feedback row scoped to a project. Returns null if not found in this project.
// Maps to camelCase including the new status/assignee/notes/updatedAt columns.
export async function feedbackById(projectId: string, id: string): Promise<any | null> {
  const r = await db!.execute({
    sql: "SELECT * FROM feedback WHERE project_id=? AND id=?",
    args: [projectId, id],
  })
  if (!r.rows.length) return null
  const x = r.rows[0] as any
  return {
    id: String(x.id),
    projectId: String(x.project_id),
    simId: x.sim_id != null ? String(x.sim_id) : null,
    actorEmail: x.actor_email != null ? String(x.actor_email) : null,
    urlHost: x.url_host != null ? String(x.url_host) : null,
    urlPath: x.url_path != null ? String(x.url_path) : null,
    sourceReferrer: x.source_referrer != null ? String(x.source_referrer) : null,
    pageUrl: x.url_path != null ? String(x.url_path) : null,
    observation: x.observation != null ? String(x.observation) : null,
    sentiment: x.sentiment != null ? String(x.sentiment) : null,
    priority: (x.priority ?? x.severity) != null ? String(x.priority ?? x.severity) : null,
    screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
    // JTBD 3.13: expose the Sim's cited traits + source quote so triage actions (e.g. dismiss-with-reason)
    // can teach the originating trait. Additive — existing callers ignore these.
    citedTraitIds: safeJsonParse(x.cited_trait_ids_json),
    sourceQuote: x.source_quote != null ? String(x.source_quote) : null,
    planeIssueKey: x.plane_issue_key != null ? String(x.plane_issue_key) : null,
    planeIssueUrl: x.plane_issue_url != null ? String(x.plane_issue_url) : null,
    status: x.status != null ? String(x.status) : "open",
    assignee: x.assignee != null ? String(x.assignee) : null,
    notes: x.notes != null ? String(x.notes) : null,
    updatedAt: x.updated_at != null ? Number(x.updated_at) : null,
    resolvedAt: x.resolved_at != null ? Number(x.resolved_at) : null,
    createdAt: Number(x.created_at),
    issueKey: x.issue_key != null ? String(x.issue_key) : null,
    recurrenceCount: Number(x.recurrence_count ?? 1),
    recurrenceDatesJson: x.recurrence_dates_json != null ? String(x.recurrence_dates_json) : null,
    lastSeenAt: x.last_seen_at != null ? Number(x.last_seen_at) : null,
    clientContext: x.client_context_json != null ? safeJsonParse(x.client_context_json) : null,
    contactEmail: x.contact_email != null ? String(x.contact_email) : null,
    seqNum: x.seq_num != null ? Number(x.seq_num) : null,
  }
}

export async function addTicketExport(
  x: Omit<TicketExportRow, "id" | "createdAt">
): Promise<string> {
  const id = "exp_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO ticket_exports (id,feedback_id,project_id,connector_id,type,external_key,external_url,status,error,created_at,created_by)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, x.feedbackId, x.projectId, x.connectorId, x.type, x.externalKey ?? null,
           x.externalUrl ?? null, x.status, x.error ?? null, Date.now(), x.createdBy ?? null],
  })
  return id
}

export async function listTicketExports(feedbackId: string): Promise<TicketExportRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM ticket_exports WHERE feedback_id=? ORDER BY created_at DESC",
    args: [feedbackId],
  })
  return r.rows.map(rowToTicketExport)
}

// KLA-283 (JTBD 5.4): already-exported guard. Returns the most-recent SUCCESSFUL export of this
// ticket to this connector, so a repeat manual "Copy to…" can warn ("Already in Jira as ACME-42")
// instead of silently creating a second external issue. Failed attempts are ignored — they never
// produced an external issue, so re-exporting after a failure must stay friction-free (that's Retry).
// Scoped to connectorId (not type): two Jira connectors are two destinations, both legitimate.
export async function findPriorSuccessfulExport(
  feedbackId: string, connectorId: string
): Promise<TicketExportRow | null> {
  if (!feedbackId || !connectorId) return null
  const r = await db!.execute({
    sql: `SELECT * FROM ticket_exports
          WHERE feedback_id=? AND connector_id=? AND status='ok'
          ORDER BY created_at DESC LIMIT 1`,
    args: [feedbackId, connectorId],
  })
  return r.rows.length ? rowToTicketExport(r.rows[0]) : null
}

// INBOUND two-way sync (G4): reverse-map an external tracker issue back to its Klavity export.
// Matches on (type, external_key) — the EXACT key the outbound createIssue stored — and ignores
// failed exports (which never produced an external issue, so external_key is null). Returns the
// most-recent successful export for that key so a webhook can resolve feedbackId + projectId.
export async function findExportByExternalKey(type: string, externalKey: string): Promise<TicketExportRow | null> {
  if (!externalKey) return null
  const r = await db!.execute({
    sql: `SELECT * FROM ticket_exports
          WHERE type=? AND external_key=? AND status='ok'
          ORDER BY created_at DESC LIMIT 1`,
    args: [type, externalKey],
  })
  return r.rows.length ? rowToTicketExport(r.rows[0]) : null
}

// Batch fetch exports for a list of feedback ids. Groups newest-first per feedback id.
// Returns a map feedbackId → TicketExportRow[].
export async function exportsForFeedbackIds(ids: string[]): Promise<Record<string, TicketExportRow[]>> {
  if (!ids.length) return {}
  const placeholders = ids.map(() => "?").join(",")
  const r = await db!.execute({
    sql: `SELECT * FROM ticket_exports WHERE feedback_id IN (${placeholders}) ORDER BY created_at DESC`,
    args: ids,
  })
  const result: Record<string, TicketExportRow[]> = {}
  for (const row of r.rows) {
    const x = rowToTicketExport(row as any)
    if (!result[x.feedbackId]) result[x.feedbackId] = []
    result[x.feedbackId].push(x)
  }
  return result
}

// ── GDPR: data export (Art. 15/20) + account erasure (Art. 17) ──
// All scoped to ONE email. The user only ever sees/erases their OWN data: rows are matched on the
// identity columns that carry the user's email (users.email, *_members.email, feedback.actor_email,
// screenshots.owner_email, ai_calls.actor_email, sessions/login_otps/extension_tokens.email). We do NOT
// touch other tenants' rows.

export type UserDataExport = {
  email: string
  account: any | null
  accountMemberships: any[]
  projectMemberships: any[]
  feedback: any[]
  screenshots: any[]
  aiCalls: any[]
  exportedAt: number
}

export async function exportUserData(email: string): Promise<UserDataExport> {
  const e = email.toLowerCase()
  const rows = async (sql: string, args: any[]) => (await db!.execute({ sql, args })).rows.map((r) => ({ ...(r as any) }))
  const userR = await db!.execute({ sql: "SELECT * FROM users WHERE email=?", args: [e] })
  return {
    email: e,
    account: userR.rows.length ? { ...(userR.rows[0] as any) } : null,
    accountMemberships: await rows("SELECT * FROM account_members WHERE email=?", [e]),
    projectMemberships: await rows("SELECT * FROM project_members WHERE email=?", [e]),
    feedback: await rows("SELECT * FROM feedback WHERE actor_email=?", [e]),
    screenshots: await rows("SELECT id,project_id,s3_key,bucket,content_type,acl,bytes,owner_email,expires_at,created_at FROM screenshots WHERE owner_email=?", [e]),
    aiCalls: await rows("SELECT * FROM ai_calls WHERE actor_email=?", [e]),
    exportedAt: Date.now(),
  }
}

// Erase all of the user's PERSONAL data and return the S3 keys of the screenshots that were deleted so
// the caller can purge the underlying objects. Order: collect screenshot keys → delete dependent rows
// (ticket_exports of the user's feedback) → feedback → screenshots → memberships → credentials → user.
export async function eraseUser(email: string): Promise<{ s3Keys: string[] }> {
  const e = email.toLowerCase()
  const shots = await db!.execute({ sql: "SELECT s3_key FROM screenshots WHERE owner_email=?", args: [e] })
  const s3Keys = shots.rows.map((r: any) => String(r.s3_key))
  // ticket_exports of feedback this user authored (FK-less, so clean up explicitly).
  await db!.execute({ sql: "DELETE FROM ticket_exports WHERE feedback_id IN (SELECT id FROM feedback WHERE actor_email=?)", args: [e] })
  await db!.execute({ sql: "DELETE FROM feedback WHERE actor_email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM screenshots WHERE owner_email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM ai_calls WHERE actor_email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM account_members WHERE email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM project_members WHERE email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM monitoring_consent WHERE email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM extension_tokens WHERE email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM login_otps WHERE email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM sessions WHERE email=?", args: [e] })
  await db!.execute({ sql: "DELETE FROM users WHERE email=?", args: [e] })
  return { s3Keys }
}

// Aggregate "so what" insights for the Overview, computed across ALL of a project's feedback
// (not just the recent 12 the dashboard lists). Cheap GROUP BY queries; degrades to zeros with no DB.
// created_at is stored as a millisecond epoch integer.
// Triage-aware: openBySeverity/hotspots count only accepted (status IN ('open','in_progress'));
// recurring and sentiment exclude dismissed; needsTriage counts status='new'.
export async function computeDashboardInsights(projectId: string) {
  const empty = {
    openBySeverity: { high: 0, medium: 0, low: 0, none: 0 },
    recurring: 0,
    needsTriage: 0,
    sentiment: { neg: 0, pos: 0, total: 0 },
    hotspots: [] as { area: string; count: number }[],
    volume7d: [] as number[],
    opened7d: 0, resolved7d: 0,
  }
  if (!db) return empty
  try {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const [sevRows, sentRows, hotRows, volRows, recRow, throughputRows, triageRow] = await Promise.all([
      db.execute({ sql: `SELECT COALESCE(priority,severity,'none') sev, COUNT(*) n FROM feedback WHERE project_id=? AND status IN ('open','in_progress') GROUP BY sev`, args: [projectId] }),
      db.execute({ sql: `SELECT COALESCE(sentiment,'') s, COUNT(*) n FROM feedback WHERE project_id=? AND status!='dismissed' GROUP BY s`, args: [projectId] }),
      db.execute({ sql: `SELECT COALESCE(NULLIF(url_path,''),'(unknown)') area, COUNT(*) n FROM feedback WHERE project_id=? AND status IN ('open','in_progress') GROUP BY area ORDER BY n DESC LIMIT 6`, args: [projectId] }),
      db.execute({ sql: `SELECT CAST(created_at/86400000 AS INTEGER) d, COUNT(*) n FROM feedback WHERE project_id=? AND created_at>? GROUP BY d`, args: [projectId, weekAgo] }),
      db.execute({ sql: `SELECT COUNT(*) n FROM feedback WHERE project_id=? AND recurrence_count>=3 AND status!='dismissed'`, args: [projectId] }),
      db.execute({ sql: `SELECT (CASE WHEN status='done' THEN 'resolved' ELSE 'opened' END) k, COUNT(*) n FROM feedback WHERE project_id=? AND created_at>? AND status!='dismissed' GROUP BY k`, args: [projectId, weekAgo] }),
      db.execute({ sql: `SELECT COUNT(*) n FROM feedback WHERE project_id=? AND status='new'`, args: [projectId] }),
    ])
    const out = JSON.parse(JSON.stringify(empty))
    for (const r of sevRows.rows) { const k = String((r as any).sev); if (k in out.openBySeverity) out.openBySeverity[k] = Number((r as any).n) }
    for (const r of sentRows.rows) { const s = String((r as any).s); const n = Number((r as any).n); out.sentiment.total += n; if (s === "frustrated" || s === "confused") out.sentiment.neg += n; else if (s) out.sentiment.pos += n }
    out.hotspots = hotRows.rows.map((r: any) => ({ area: String(r.area), count: Number(r.n) }))
    out.recurring = recRow.rows.length ? Number((recRow.rows[0] as any).n) : 0
    out.needsTriage = triageRow.rows.length ? Number((triageRow.rows[0] as any).n) : 0
    const byDay: Record<number, number> = {}
    for (const r of volRows.rows) byDay[Number((r as any).d)] = Number((r as any).n)
    const todayIdx = Math.floor(now / 86400000)
    for (let i = 6; i >= 0; i--) out.volume7d.push(byDay[todayIdx - i] || 0)
    for (const r of throughputRows.rows) { const k = String((r as any).k); if (k === "resolved") out.resolved7d = Number((r as any).n); else out.opened7d = Number((r as any).n) }
    return out
  } catch { return empty }
}

// All un-triaged ("new") feedback for a project, newest first — feeds the Triage inbox.
export async function listTriageFeedback(projectId: string): Promise<any[]> {
  const r = await db!.execute({
    sql: `SELECT f.*, p.name AS sim_name FROM feedback f
          LEFT JOIN personas p ON p.id = f.sim_id
          WHERE f.project_id=? AND f.status='new' ORDER BY f.created_at DESC LIMIT 200`,
    args: [projectId],
  })
  // JTBD 2.8: the triage inbox now expands each row inline to full evidence (screenshot, replay,
  // console/network context, grounding quote) before you decide. Enrich each row with `hasReplay`
  // (so the row can offer the ▶ Session replay affordance) and the sanitized `clientContext`
  // (console/network/browser context captured at report time). Batch-fetch which of these rows
  // carry a session replay in ONE query — mirrors feedbackIdsWithReplay but kept local to avoid a
  // circular import (feedback-replay.ts imports ./db).
  const ids = r.rows.map((x: any) => String(x.id))
  const replaySet = new Set<string>()
  if (ids.length) {
    const ph = ids.map(() => "?").join(",")
    const rr = await db!.execute({
      sql: `SELECT DISTINCT feedback_id FROM feedback_replays WHERE project_id=? AND feedback_id IN (${ph})`,
      args: [projectId, ...ids],
    }).catch(() => ({ rows: [] as any[] }))
    for (const row of rr.rows) replaySet.add(String((row as any).feedback_id))
  }
  return r.rows.map((x: any) => {
    let bug: any = null
    try { bug = x.suggested_bug_json ? JSON.parse(x.suggested_bug_json) : null } catch { bug = null }
    return {
      id: String(x.id),
      title: String(bug?.title || x.observation || "Untitled report"),
      observation: x.observation != null ? String(x.observation) : null,
      sentiment: x.sentiment != null ? String(x.sentiment) : null,
      // KLA-168: use priority (renamed from severity); fall back to severity for legacy rows
      priority: (x.priority ?? x.severity) != null ? String(x.priority ?? x.severity) : null,
      urlPath: x.url_path != null ? String(x.url_path) : null,
      urlHost: x.url_host != null ? String(x.url_host) : null,
      screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
      suggestedBug: bug,
      sourceQuote: x.source_quote != null ? String(x.source_quote) : null,
      simName: x.sim_name != null ? String(x.sim_name) : null,
      recurrence: Number(x.recurrence_count ?? 1),
      createdAt: Number(x.created_at),
      // KLA-200: human-readable sequential number
      seqNum: x.seq_num != null ? Number(x.seq_num) : null,
      // JTBD 2.8: inline-evidence fields for the expandable triage row.
      hasReplay: replaySet.has(String(x.id)),
      clientContext: x.client_context_json != null ? safeJsonParse(x.client_context_json) : null,
    }
  })
}

// ── KLAVITYKLA-201: Cross-project inbox ──────────────────────────────────────
// Returns per-project new-report counts + top items + regression counts for
// every project in `projectIds`.  Designed to be called once with all IDs the
// caller is authorised to see (auth is enforced by the caller — listProjects).
// We do one query per data type rather than N-per-project to keep this O(1) at
// the DB level regardless of project count.
export async function listInboxForProjects(
  projectIds: string[],
  opts?: { windowMs?: number; topN?: number },
): Promise<{
  projectId: string
  newReportCount: number
  regressionCount: number
  topReports: Array<{ id: string; title: string; priority: string | null; createdAt: number; seqNum: number | null }>
}[]> {
  if (!projectIds.length) return []
  const windowMs = opts?.windowMs ?? 48 * 3600 * 1000   // 48-hour default window
  const topN = Math.min(opts?.topN ?? 5, 10)
  const since = Date.now() - windowMs
  const ph = projectIds.map(() => "?").join(",")

  // 1. Count new reports per project in the time window
  const countR = await db!.execute({
    sql: `SELECT project_id, COUNT(*) AS cnt FROM feedback
          WHERE project_id IN (${ph}) AND status='new' AND created_at >= ?
          GROUP BY project_id`,
    args: [...projectIds, since],
  })
  const newCounts: Record<string, number> = {}
  for (const row of countR.rows) {
    newCounts[String((row as any).project_id)] = Number((row as any).cnt)
  }

  // 2. Count regression findings per project in the time window
  const regR = await db!.execute({
    sql: `SELECT project_id, COUNT(*) AS cnt FROM findings
          WHERE project_id IN (${ph}) AND kind='regression' AND created_at >= ?
          GROUP BY project_id`,
    args: [...projectIds, since],
  })
  const regCounts: Record<string, number> = {}
  for (const row of regR.rows) {
    regCounts[String((row as any).project_id)] = Number((row as any).cnt)
  }

  // 3. Top N new reports per project (window-filtered, ordered newest first)
  // We use a window-function approach: rank per project, take top N.
  // libSQL/SQLite supports ROW_NUMBER() so we use it.
  const topR = await db!.execute({
    sql: `SELECT id, project_id, suggested_bug_json, observation, priority, severity, created_at, seq_num
          FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at DESC) AS rn
            FROM feedback
            WHERE project_id IN (${ph}) AND status='new' AND created_at >= ?
          ) WHERE rn <= ?`,
    args: [...projectIds, since, topN],
  })
  const topMap: Record<string, Array<{ id: string; title: string; priority: string | null; createdAt: number; seqNum: number | null }>> = {}
  for (const x of topR.rows) {
    const pid = String((x as any).project_id)
    let bug: any = null
    try { bug = (x as any).suggested_bug_json ? JSON.parse(String((x as any).suggested_bug_json)) : null } catch { bug = null }
    const title = String(bug?.title || (x as any).observation || "Untitled report")
    if (!topMap[pid]) topMap[pid] = []
    topMap[pid].push({
      id: String((x as any).id),
      title,
      priority: (x as any).priority ?? (x as any).severity != null ? String((x as any).priority ?? (x as any).severity) : null,
      createdAt: Number((x as any).created_at),
      seqNum: (x as any).seq_num != null ? Number((x as any).seq_num) : null,
    })
  }

  return projectIds.map((pid) => ({
    projectId: pid,
    newReportCount: newCounts[pid] ?? 0,
    regressionCount: regCounts[pid] ?? 0,
    topReports: topMap[pid] ?? [],
  }))
}

// ── Agency per-client OUTCOMES rollup (KLAVITYKLA-310) ──────────────────────────────────────────
// For every project in `projectIds` (caller authorises the list), return the trust-loop outcomes in
// a time window: reports found (all Snap/Sim feedback), regressions caught (findings kind='regression'),
// and guarded-flow walk counts by verdict (green/amber/red) so the caller can compute a pass rate.
// One query per data type (O(1) in project count), mirroring listInboxForProjects. Read-only.
export type AgencyOutcomeRow = {
  projectId: string
  reportsFound: number
  regressionsCaught: number
  guardedGreen: number
  guardedAmber: number
  guardedRed: number
  guardedTotal: number
}

export async function agencyClientOutcomes(
  projectIds: string[],
  opts?: { windowMs?: number },
): Promise<AgencyOutcomeRow[]> {
  if (!projectIds.length) return []
  const windowMs = opts?.windowMs ?? 30 * 24 * 3600 * 1000 // 30-day default window
  const since = Date.now() - windowMs
  const ph = projectIds.map(() => "?").join(",")

  // 1. Reports found per project (every filed report in the window, not just untriaged).
  const repR = await db!.execute({
    sql: `SELECT project_id, COUNT(*) AS cnt FROM feedback
          WHERE project_id IN (${ph}) AND created_at >= ?
          GROUP BY project_id`,
    args: [...projectIds, since],
  })
  const reports: Record<string, number> = {}
  for (const row of repR.rows) reports[String((row as any).project_id)] = Number((row as any).cnt)

  // 2. Regressions caught per project ("why are fixed things breaking again").
  const regR = await db!.execute({
    sql: `SELECT project_id, COUNT(*) AS cnt FROM findings
          WHERE project_id IN (${ph}) AND kind='regression' AND created_at >= ?
          GROUP BY project_id`,
    args: [...projectIds, since],
  })
  const regs: Record<string, number> = {}
  for (const row of regR.rows) regs[String((row as any).project_id)] = Number((row as any).cnt)

  // 3. Guarded-flow walk verdicts per project (green=pass, amber=warn, red=fail).
  const walkR = await db!.execute({
    sql: `SELECT project_id,
                 SUM(CASE WHEN status='green' THEN 1 ELSE 0 END) AS g,
                 SUM(CASE WHEN status='amber' THEN 1 ELSE 0 END) AS a,
                 SUM(CASE WHEN status='red'   THEN 1 ELSE 0 END) AS r,
                 COUNT(*) AS t
          FROM trail_runs
          WHERE project_id IN (${ph}) AND status IN ('green','amber','red') AND started_at >= ?
          GROUP BY project_id`,
    args: [...projectIds, since],
  })
  const walks: Record<string, { g: number; a: number; r: number; t: number }> = {}
  for (const row of walkR.rows) {
    walks[String((row as any).project_id)] = {
      g: Number((row as any).g ?? 0), a: Number((row as any).a ?? 0),
      r: Number((row as any).r ?? 0), t: Number((row as any).t ?? 0),
    }
  }

  return projectIds.map((pid) => {
    const w = walks[pid] ?? { g: 0, a: 0, r: 0, t: 0 }
    return {
      projectId: pid,
      reportsFound: reports[pid] ?? 0,
      regressionsCaught: regs[pid] ?? 0,
      guardedGreen: w.g, guardedAmber: w.a, guardedRed: w.r, guardedTotal: w.t,
    }
  })
}

// Paginated, filterable ticket list for the /tickets view (KLA-169).
// Returns triaged tickets (status != 'new') with optional filters.
export async function listTicketsPaginated(
  projectId: string,
  opts: {
    statuses?: string[]      // e.g. ["open","in_progress"]; empty = all non-new
    priorities?: string[]    // e.g. ["urgent","high"]
    assignee?: string        // exact email match; empty string = unassigned; omit = all
    source?: "sim" | "human" | "manual" // sim = sim_id IS NOT NULL; human = sim_id IS NULL and not manual; manual = source='manual'
    label?: string           // exact label id; omit = all labels
    search?: string          // case-insensitive text search across ticket content
    page?: number            // 1-indexed, default 1
    limit?: number           // default 50, max 200
  }
): Promise<{ tickets: any[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(200, Math.max(1, opts.limit ?? 50))
  const offset = (page - 1) * limit

  const conditions: string[] = ["f.project_id=?"]
  const args: any[] = [projectId]

  // Exclude 'new' (un-triaged) by default
  const statuses = (opts.statuses ?? []).filter(Boolean)
  if (statuses.length) {
    conditions.push(`f.status IN (${statuses.map(() => "?").join(",")})`)
    args.push(...statuses)
  } else {
    conditions.push("f.status != 'new'")
  }

  if (opts.priorities && opts.priorities.length) {
    conditions.push(`f.priority IN (${opts.priorities.map(() => "?").join(",")})`)
    args.push(...opts.priorities)
  }

  if (opts.assignee !== undefined) {
    if (opts.assignee === "") {
      conditions.push("(f.assignee IS NULL OR f.assignee='')")
    } else {
      conditions.push("f.assignee=?")
      args.push(opts.assignee)
    }
  }

  if (opts.source === "sim") conditions.push("f.sim_id IS NOT NULL")
  else if (opts.source === "manual") conditions.push("f.source='manual'")
  else if (opts.source === "human") conditions.push("f.sim_id IS NULL AND (f.source IS NULL OR f.source != 'manual')")

  if (opts.label) {
    // Scope the label through the ticket's project too: a label from another tenant can never
    // influence this result, even if its ID were somehow supplied by a caller.
    conditions.push(`EXISTS (SELECT 1 FROM ticket_labels tl
                             JOIN labels l ON l.id = tl.label_id
                             WHERE tl.feedback_id = f.id AND l.project_id = f.project_id AND tl.label_id = ?)`)
    args.push(opts.label)
  }

  const search = opts.search?.trim()
  if (search) {
    // Treat %, _, and backslash as literal user input rather than LIKE wildcards.
    const escaped = search.replace(/[\\%_]/g, "\\\\$&")
    const pattern = `%${escaped}%`
    // Titles and descriptions generated by Sims live in suggested_bug_json; manual-ticket
    // descriptions live in observation, while notes are the editable ticket description.
    conditions.push(`(LOWER(COALESCE(f.observation, '')) LIKE LOWER(?) ESCAPE '\\'
                      OR LOWER(COALESCE(f.notes, '')) LIKE LOWER(?) ESCAPE '\\'
                      OR LOWER(COALESCE(f.suggested_bug_json, '')) LIKE LOWER(?) ESCAPE '\\')`)
    args.push(pattern, pattern, pattern)
  }

  const where = "WHERE " + conditions.join(" AND ")

  const countRow = await db!.execute({
    sql: `SELECT COUNT(*) AS n FROM feedback f ${where}`,
    args,
  })
  const total = Number((countRow.rows[0] as any).n ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const rows = await db!.execute({
    sql: `SELECT f.*, p.name AS sim_name FROM feedback f
          LEFT JOIN personas p ON p.id = f.sim_id
          ${where} ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })

  const tickets = rows.rows.map((x: any) => {
    let bug: any = null
    try { bug = x.suggested_bug_json ? JSON.parse(String(x.suggested_bug_json)) : null } catch { bug = null }
    return {
      id: String(x.id),
      title: String(bug?.title || x.observation || "Untitled report"),
      observation: x.observation != null ? String(x.observation) : null,
      sentiment: x.sentiment != null ? String(x.sentiment) : null,
      priority: (x.priority ?? x.severity) != null ? String(x.priority ?? x.severity) : null,
      status: x.status != null ? String(x.status) : "open",
      assignee: x.assignee != null ? String(x.assignee) : null,
      notes: x.notes != null ? String(x.notes) : null,
      urlPath: x.url_path != null ? String(x.url_path) : null,
      urlHost: x.url_host != null ? String(x.url_host) : null,
      screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
      suggestedBug: bug,
      sourceQuote: x.source_quote != null ? String(x.source_quote) : null,
      simId: x.sim_id != null ? String(x.sim_id) : null,
      simName: x.sim_name != null ? String(x.sim_name) : null,
      planeIssueKey: x.plane_issue_key != null ? String(x.plane_issue_key) : null,
      planeIssueUrl: x.plane_issue_url != null ? String(x.plane_issue_url) : null,
      recurrence: Number(x.recurrence_count ?? 1),
      recurrenceCount: Number(x.recurrence_count ?? 1),
      createdAt: Number(x.created_at),
      updatedAt: x.updated_at != null ? Number(x.updated_at) : null,
      source: x.sim_id != null ? "sim" : (x.source === "manual" ? "manual" : "human"),
      // KLA-200: human-readable sequential number
      seqNum: x.seq_num != null ? Number(x.seq_num) : null,
    }
  })

  return { tickets, total, page, totalPages }
}

// ── sim_runs — on-demand Sim run records ─────────────────────────────────────
// One row per manual trigger: captures who ran, what URL, which Sims, and the
// full reactions payload so the dashboard can show run history.

export type SimRunStatus = "done" | "error"

export type SimRunRow = {
  id: string
  projectId: string
  url: string
  status: SimRunStatus
  simIds: string[] | null   // null = all project Sims
  screenshotId: string | null
  reactions: any[] | null   // SimReview[]
  label: string | null
  errorMsg: string | null
  actorEmail: string | null
  createdAt: number
  finishedAt: number | null
}

function rowToSimRun(x: any): SimRunRow {
  let reactions: any[] | null = null
  try { reactions = x.reactions_json ? JSON.parse(String(x.reactions_json)) : null } catch { reactions = null }
  let simIds: string[] | null = null
  try { simIds = x.sim_ids_json ? JSON.parse(String(x.sim_ids_json)) : null } catch { simIds = null }
  return {
    id: String(x.id),
    projectId: String(x.project_id),
    url: String(x.url),
    status: String(x.status ?? "done") as SimRunStatus,
    simIds,
    screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
    reactions,
    label: x.label != null ? String(x.label) : null,
    errorMsg: x.error_msg != null ? String(x.error_msg) : null,
    actorEmail: x.actor_email != null ? String(x.actor_email) : null,
    createdAt: Number(x.created_at),
    finishedAt: x.finished_at != null ? Number(x.finished_at) : null,
  }
}

export async function insertSimRun(input: {
  projectId: string; url: string; simIds?: string[] | null; screenshotId?: string | null
  reactions?: any[] | null; label?: string | null; errorMsg?: string | null
  actorEmail?: string | null; status?: SimRunStatus; finishedAt?: number | null
}): Promise<string> {
  const id = "simrun_" + crypto.randomUUID()
  const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO sim_runs (id,project_id,url,status,sim_ids_json,screenshot_id,reactions_json,label,error_msg,actor_email,created_at,finished_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, input.projectId, input.url, input.status ?? "done",
           input.simIds != null ? JSON.stringify(input.simIds) : null,
           input.screenshotId ?? null,
           input.reactions != null ? JSON.stringify(input.reactions) : null,
           input.label ?? null, input.errorMsg ?? null, input.actorEmail ?? null,
           now, input.finishedAt ?? now],
  })
  return id
}

export async function getSimRun(id: string): Promise<SimRunRow | null> {
  const r = await db!.execute({ sql: "SELECT * FROM sim_runs WHERE id=?", args: [id] })
  return r.rows.length ? rowToSimRun(r.rows[0]) : null
}

export async function listSimRuns(projectId: string, limit = 20): Promise<SimRunRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM sim_runs WHERE project_id=? ORDER BY created_at DESC LIMIT ?",
    args: [projectId, limit],
  })
  return r.rows.map(rowToSimRun)
}

// The most recent 'done' run of the SAME url in this project that finished BEFORE the given
// run — the baseline the run-history diff compares against (JTBD 3.8: "why is this broken again").
// Returns null when there is no earlier same-url run to compare to.
export async function previousSimRunForUrl(
  projectId: string, url: string, beforeCreatedAt: number, beforeId: string,
): Promise<SimRunRow | null> {
  const r = await db!.execute({
    sql: `SELECT * FROM sim_runs
          WHERE project_id=? AND url=? AND status='done' AND (created_at < ? OR (created_at = ? AND id <> ?))
          ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, url, beforeCreatedAt, beforeCreatedAt, beforeId],
  })
  return r.rows.length ? rowToSimRun(r.rows[0]) : null
}

// ── KLA-174: Flat per-project ticket labels ──────────────────────────────────

export type LabelRow = { id: string; projectId: string; name: string; color: string; createdAt: number }

function rowToLabel(x: any): LabelRow {
  return { id: String(x.id), projectId: String(x.project_id), name: String(x.name), color: String(x.color), createdAt: Number(x.created_at) }
}

export async function createLabel(projectId: string, name: string, color: string): Promise<LabelRow> {
  const id = "lbl_" + crypto.randomUUID()
  const now = Date.now()
  await db!.execute({
    sql: "INSERT INTO labels (id, project_id, name, color, created_at) VALUES (?,?,?,?,?)",
    args: [id, projectId, name.trim(), color, now],
  })
  return { id, projectId, name: name.trim(), color, createdAt: now }
}

export async function listLabels(projectId: string): Promise<LabelRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM labels WHERE project_id=? ORDER BY name ASC",
    args: [projectId],
  })
  return r.rows.map(rowToLabel)
}

export async function updateLabel(projectId: string, labelId: string, name: string, color: string): Promise<boolean> {
  const r = await db!.execute({
    sql: "UPDATE labels SET name=?, color=? WHERE id=? AND project_id=?",
    args: [name.trim(), color, labelId, projectId],
  })
  return Number(r.rowsAffected) > 0
}

export async function deleteLabel(projectId: string, labelId: string): Promise<boolean> {
  const owned = await db!.execute({
    sql: "SELECT 1 FROM labels WHERE id=? AND project_id=? LIMIT 1",
    args: [labelId, projectId],
  })
  if (!owned.rows.length) return false
  await db!.execute({ sql: "DELETE FROM ticket_labels WHERE label_id=?", args: [labelId] })
  const r = await db!.execute({ sql: "DELETE FROM labels WHERE id=? AND project_id=?", args: [labelId, projectId] })
  return Number(r.rowsAffected) > 0
}

export async function attachLabel(labelId: string, feedbackId: string): Promise<void> {
  await db!.execute({
    sql: "INSERT OR IGNORE INTO ticket_labels (label_id, feedback_id, created_at) VALUES (?,?,?)",
    args: [labelId, feedbackId, Date.now()],
  })
}

export async function detachLabel(labelId: string, feedbackId: string): Promise<void> {
  await db!.execute({
    sql: "DELETE FROM ticket_labels WHERE label_id=? AND feedback_id=?",
    args: [labelId, feedbackId],
  })
}

export async function labelsForFeedback(feedbackId: string): Promise<LabelRow[]> {
  const r = await db!.execute({
    sql: `SELECT l.* FROM labels l
          JOIN ticket_labels tl ON tl.label_id = l.id
          WHERE tl.feedback_id=? ORDER BY l.name ASC`,
    args: [feedbackId],
  })
  return r.rows.map(rowToLabel)
}

// Batch: returns map feedbackId → LabelRow[]
export async function labelsForFeedbackBatch(feedbackIds: string[]): Promise<Record<string, LabelRow[]>> {
  if (!feedbackIds.length) return {}
  const placeholders = feedbackIds.map(() => "?").join(",")
  const r = await db!.execute({
    sql: `SELECT tl.feedback_id, l.id, l.project_id, l.name, l.color, l.created_at
          FROM ticket_labels tl JOIN labels l ON l.id = tl.label_id
          WHERE tl.feedback_id IN (${placeholders}) ORDER BY l.name ASC`,
    args: feedbackIds,
  })
  const out: Record<string, LabelRow[]> = {}
  for (const x of r.rows as any[]) {
    const fid = String(x.feedback_id)
    if (!out[fid]) out[fid] = []
    out[fid].push({ id: String(x.id), projectId: String(x.project_id), name: String(x.name), color: String(x.color), createdAt: Number(x.created_at) })
  }
  return out
}

// KLA-175: persist AI-suggested label IDs for a feedback row (ghost chips).
export async function setSuggestedLabels(feedbackId: string, labelIds: string[]): Promise<void> {
  await db!.execute({
    sql: "UPDATE feedback SET suggested_label_ids_json=? WHERE id=?",
    args: [JSON.stringify(labelIds), feedbackId],
  })
}

// JTBD 1.10: overwrite a feedback row's observation (used by the post-intake AI title drafter for a
// screenshot-only report that was inserted with a deterministic fallback title). Project-scoped so a
// stray/attacker-supplied feedbackId can't rewrite another tenant's row.
export async function setFeedbackObservation(feedbackId: string, projectId: string, observation: string): Promise<void> {
  await db!.execute({
    sql: "UPDATE feedback SET observation=? WHERE id=? AND project_id=?",
    args: [observation, feedbackId, projectId],
  })
}

// KLA-175: return the suggested LabelRows for a feedback item (resolves IDs → full rows).
export async function getSuggestedLabels(feedbackId: string, projectId: string): Promise<LabelRow[]> {
  const r = await db!.execute({
    sql: "SELECT suggested_label_ids_json FROM feedback WHERE id=? AND project_id=?",
    args: [feedbackId, projectId],
  })
  const row = r.rows[0] as any
  if (!row) return []
  let ids: string[] = []
  try { ids = JSON.parse(String(row.suggested_label_ids_json || "[]")) } catch { return [] }
  if (!Array.isArray(ids) || !ids.length) return []
  const all = await listLabels(projectId)
  const idSet = new Set(ids)
  return all.filter(l => idSet.has(l.id))
}

// ── KLA-255: needsConfirm queue — pending_sim_matches CRUD ──────────────────

export type PendingSimMatch = {
  id: string
  projectId: string
  transcriptId: string
  personaName: string
  candidates: { simId: string; name: string; role: string }[]
  status: "pending" | "confirmed" | "rejected"
  chosenSimId: string | null
  resolvedBy: string | null
  createdAt: number
  updatedAt: number
}

function rowToPendingSimMatch(x: any): PendingSimMatch {
  let candidates: { simId: string; name: string; role: string }[] = []
  try { candidates = JSON.parse(String(x.candidates_json || "[]")) } catch { candidates = [] }
  return {
    id: String(x.id),
    projectId: String(x.project_id),
    transcriptId: String(x.transcript_id),
    personaName: String(x.persona_name),
    candidates,
    status: (String(x.status || "pending")) as PendingSimMatch["status"],
    chosenSimId: x.chosen_sim_id != null ? String(x.chosen_sim_id) : null,
    resolvedBy: x.resolved_by != null ? String(x.resolved_by) : null,
    createdAt: Number(x.created_at),
    updatedAt: Number(x.updated_at),
  }
}

// Insert one pending match item. Returns the generated id.
export async function insertPendingSimMatch(args: {
  projectId: string
  transcriptId: string
  personaName: string
  candidates: { simId: string; name: string; role: string }[]
}): Promise<string> {
  const id = "psm_" + crypto.randomUUID()
  const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO pending_sim_matches (id, project_id, transcript_id, persona_name, candidates_json, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    args: [id, args.projectId, args.transcriptId, args.personaName, JSON.stringify(args.candidates), now, now],
  })
  return id
}

// List pending (or all) sim matches for a project, newest first.
export async function listPendingSimMatches(projectId: string, opts?: { status?: string }): Promise<PendingSimMatch[]> {
  const status = opts?.status ?? "pending"
  const r = await db!.execute({
    sql: `SELECT * FROM pending_sim_matches WHERE project_id=? AND status=? ORDER BY created_at DESC`,
    args: [projectId, status],
  })
  return r.rows.map(rowToPendingSimMatch)
}

// Get one match by id, scoped to project (tenant safety).
export async function getPendingSimMatch(projectId: string, id: string): Promise<PendingSimMatch | null> {
  const r = await db!.execute({
    sql: `SELECT * FROM pending_sim_matches WHERE id=? AND project_id=?`,
    args: [id, projectId],
  })
  if (!r.rows.length) return null
  return rowToPendingSimMatch(r.rows[0])
}

// Confirm: record chosen simId, set status = 'confirmed'.
export async function confirmPendingSimMatch(projectId: string, id: string, chosenSimId: string, resolvedBy: string): Promise<boolean> {
  const now = Date.now()
  const r = await db!.execute({
    sql: `UPDATE pending_sim_matches SET status='confirmed', chosen_sim_id=?, resolved_by=?, updated_at=?
          WHERE id=? AND project_id=? AND status='pending'`,
    args: [chosenSimId, resolvedBy, now, id, projectId],
  })
  return (r.rowsAffected ?? 0) > 0
}

// Reject: set status = 'rejected', clear any chosen_sim_id.
export async function rejectPendingSimMatch(projectId: string, id: string, resolvedBy: string): Promise<boolean> {
  const now = Date.now()
  const r = await db!.execute({
    sql: `UPDATE pending_sim_matches SET status='rejected', chosen_sim_id=NULL, resolved_by=?, updated_at=?
          WHERE id=? AND project_id=? AND status='pending'`,
    args: [resolvedBy, now, id, projectId],
  })
  return (r.rowsAffected ?? 0) > 0
}

// ── KLA-254: sim_review_schedules — per-project recurring Sim review schedules ─────────────
// frequency: 'daily' | 'weekly'. next_run_at is advanced by the runner after each fire.

export type SimReviewScheduleFrequency = "daily" | "weekly"

export type SimReviewScheduleRow = {
  id: string
  projectId: string
  targetUrl: string
  frequency: SimReviewScheduleFrequency
  simIds: string[] | null   // null = all project Sims
  enabled: boolean
  nextRunAt: number
  lastRunAt: number | null
  createdBy: string
  createdAt: number
  updatedAt: number
}

function rowToSimReviewSchedule(x: any): SimReviewScheduleRow {
  let simIds: string[] | null = null
  try { simIds = x.sim_ids_json ? JSON.parse(String(x.sim_ids_json)) : null } catch { simIds = null }
  return {
    id: String(x.id),
    projectId: String(x.project_id),
    targetUrl: String(x.target_url),
    frequency: (String(x.frequency || "daily")) as SimReviewScheduleFrequency,
    simIds,
    enabled: Number(x.enabled) !== 0,
    nextRunAt: Number(x.next_run_at),
    lastRunAt: x.last_run_at != null ? Number(x.last_run_at) : null,
    createdBy: String(x.created_by),
    createdAt: Number(x.created_at),
    updatedAt: Number(x.updated_at),
  }
}

/** Compute next_run_at from a base timestamp and a frequency. */
export function nextRunAfter(baseMs: number, frequency: SimReviewScheduleFrequency): number {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000
  const ONE_WEEK_MS = 7 * ONE_DAY_MS
  return baseMs + (frequency === "weekly" ? ONE_WEEK_MS : ONE_DAY_MS)
}

export async function createSimReviewSchedule(input: {
  projectId: string
  targetUrl: string
  frequency: SimReviewScheduleFrequency
  simIds?: string[] | null
  createdBy: string
  firstRunAt?: number
}): Promise<SimReviewScheduleRow> {
  const id = "srs_" + crypto.randomUUID()
  const now = Date.now()
  const nextRunAt = input.firstRunAt ?? now   // default: due immediately (first run ASAP)
  await db!.execute({
    sql: `INSERT INTO sim_review_schedules
            (id, project_id, target_url, frequency, sim_ids_json, enabled, next_run_at, last_run_at, created_by, created_at, updated_at)
          VALUES (?,?,?,?,?,1,?,NULL,?,?,?)`,
    args: [
      id, input.projectId, input.targetUrl, input.frequency,
      input.simIds != null ? JSON.stringify(input.simIds) : null,
      nextRunAt, input.createdBy, now, now,
    ],
  })
  return {
    id, projectId: input.projectId, targetUrl: input.targetUrl, frequency: input.frequency,
    simIds: input.simIds ?? null, enabled: true, nextRunAt, lastRunAt: null,
    createdBy: input.createdBy, createdAt: now, updatedAt: now,
  }
}

export async function listSimReviewSchedules(projectId: string): Promise<SimReviewScheduleRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM sim_review_schedules WHERE project_id=? ORDER BY created_at DESC",
    args: [projectId],
  })
  return r.rows.map(rowToSimReviewSchedule)
}

/** Fetch all enabled schedules whose next_run_at <= nowMs (across ALL projects). */
export async function listDueSimReviewSchedules(nowMs: number): Promise<SimReviewScheduleRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM sim_review_schedules WHERE enabled=1 AND next_run_at<=? ORDER BY next_run_at ASC",
    args: [nowMs],
  })
  return r.rows.map(rowToSimReviewSchedule)
}

export async function getSimReviewSchedule(projectId: string, id: string): Promise<SimReviewScheduleRow | null> {
  const r = await db!.execute({
    sql: "SELECT * FROM sim_review_schedules WHERE id=? AND project_id=?",
    args: [id, projectId],
  })
  return r.rows.length ? rowToSimReviewSchedule(r.rows[0]) : null
}

/** Advance next_run_at + record last_run_at after a successful fire. */
export async function touchSimReviewScheduleRan(id: string, ranAt: number, frequency: SimReviewScheduleFrequency): Promise<void> {
  const now = Date.now()
  await db!.execute({
    sql: `UPDATE sim_review_schedules SET last_run_at=?, next_run_at=?, updated_at=? WHERE id=?`,
    args: [ranAt, nextRunAfter(ranAt, frequency), now, id],
  })
}

export async function setSimReviewScheduleEnabled(projectId: string, id: string, enabled: boolean): Promise<boolean> {
  const now = Date.now()
  const r = await db!.execute({
    sql: "UPDATE sim_review_schedules SET enabled=?, updated_at=? WHERE id=? AND project_id=?",
    args: [enabled ? 1 : 0, now, id, projectId],
  })
  return (r.rowsAffected ?? 0) > 0
}

export async function deleteSimReviewSchedule(projectId: string, id: string): Promise<boolean> {
  const r = await db!.execute({
    sql: "DELETE FROM sim_review_schedules WHERE id=? AND project_id=?",
    args: [id, projectId],
  })
  return (r.rowsAffected ?? 0) > 0
}
