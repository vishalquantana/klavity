// KLAVITYKLA-298 — Server-derived activation state + lifecycle nudges [JTBD 6.8]
//
// Activation used to be inferred client-side from loose, inconsistent signals
// (e.g. onboarded-detection keyed off an OPTIONAL account domain field). This
// module makes activation state canonical and SERVER-derived: given the real
// account/project signals, it returns ONE activation object — an ordered set of
// steps (each done/not-done), a lifecycle stage, and the single next best action
// (nextNudge) to move the account forward.
//
// deriveActivation is PURE: no DB, no I/O. The /api/activation route gathers the
// signals from the DB and hands them here, which keeps the ladder logic unit-
// testable with plain fixtures (see activation.test.ts) and gives the dashboard/
// onboarding one authoritative value to render instead of re-deriving ticks.

export type ActivationSignals = {
  /** account has at least one project */
  projectCount: number
  /** /widget.js has phoned home at least once for this project (heartbeat) */
  hasWidgetHeartbeat: boolean
  /** total feedback/reports captured for the project (widget, extension, manual) */
  reportCount: number
  /** number of Sims (personas) configured for the project */
  simCount: number
  /** at least one Sim actually reacted — a sim_id-bearing feedback row exists */
  hasSimReaction: boolean
  /** at least one outbound connector (Plane/GitHub/Jira/Linear/webhook) is linked */
  connectorCount: number
  /** project roster size, INCLUDING the owner (so >1 means a teammate was added) */
  memberCount: number
}

export type ActivationStepKey =
  | "create_project"
  | "install_widget"
  | "first_report"
  | "add_sim"
  | "sim_reacted"
  | "link_connector"
  | "invite_team"

export type ActivationStep = {
  key: ActivationStepKey
  label: string
  done: boolean
  /** core steps gate "activated"; non-core steps are expansion/optional */
  core: boolean
}

export type ActivationStage = "new" | "activating" | "activated" | "expanding"

export type ActivationNudge = {
  key: ActivationStepKey
  /** short imperative for the CTA button */
  cta: string
  /** one-line "why now" for the account */
  title: string
  /** where the CTA points in the app */
  href: string
}

export type ActivationState = {
  steps: ActivationStep[]
  stage: ActivationStage
  /** count of DONE steps (all steps, core + expansion) */
  completedCount: number
  totalCount: number
  /** core-only completion, the number that gates "activated" */
  coreCompletedCount: number
  coreTotalCount: number
  /** the single next best action, or null when everything is done */
  nextNudge: ActivationNudge | null
}

// Copy for the next-best-action nudge, keyed by step. Kept here (not in the UI)
// so the server owns the lifecycle messaging and every surface stays in sync.
const NUDGES: Record<ActivationStepKey, Omit<ActivationNudge, "key">> = {
  create_project: {
    cta: "Create your project",
    title: "Create a project to start collecting reports.",
    href: "/onboarding",
  },
  install_widget: {
    cta: "Install the widget",
    title: "Add the Snap widget to your site so real users can report bugs.",
    href: "/dashboard#install",
  },
  first_report: {
    cta: "Capture a report",
    title: "File your first report to see how issues land in Klavity.",
    href: "/dashboard#install",
  },
  add_sim: {
    cta: "Add a Sim",
    title: "Add a Sim from a customer call so Klavity can review like your users.",
    href: "/dashboard#sims",
  },
  sim_reacted: {
    cta: "Run a review",
    title: "Run a Sim review to watch it react to your site.",
    href: "/dashboard#sims",
  },
  link_connector: {
    cta: "Connect a tracker",
    title: "Link Plane/Jira/GitHub so reports flow to where your team works.",
    href: "/dashboard#connectors",
  },
  invite_team: {
    cta: "Invite a teammate",
    title: "Invite a teammate so issues get triaged, not lost.",
    href: "/dashboard#team",
  },
}

/**
 * Derive the canonical activation state for an account from its real signals.
 * Pure — same input always yields the same output.
 */
export function deriveActivation(s: ActivationSignals): ActivationState {
  const done = {
    create_project: s.projectCount > 0,
    install_widget: s.hasWidgetHeartbeat,
    first_report: s.reportCount > 0,
    add_sim: s.simCount > 0,
    sim_reacted: s.hasSimReaction,
    link_connector: s.connectorCount > 0,
    invite_team: s.memberCount > 1,
  } as const

  // Ordered ladder. The first four are CORE (they gate "activated"); the last
  // three are expansion levers. nextNudge always points at the earliest
  // not-done step in THIS order, so we lead with the highest-leverage action.
  const steps: ActivationStep[] = [
    { key: "create_project", label: "Create your project", done: done.create_project, core: true },
    { key: "install_widget", label: "Install the Snap widget", done: done.install_widget, core: true },
    { key: "first_report", label: "Capture your first report", done: done.first_report, core: true },
    { key: "add_sim", label: "Add your first Sim", done: done.add_sim, core: true },
    { key: "sim_reacted", label: "See a Sim react", done: done.sim_reacted, core: false },
    { key: "link_connector", label: "Connect your tracker", done: done.link_connector, core: false },
    { key: "invite_team", label: "Invite a teammate", done: done.invite_team, core: false },
  ]

  const completedCount = steps.filter(st => st.done).length
  const coreSteps = steps.filter(st => st.core)
  const coreCompletedCount = coreSteps.filter(st => st.done).length
  const coreTotalCount = coreSteps.length

  // First not-done step (core first by ordering) is the next best action.
  const next = steps.find(st => !st.done) ?? null
  const nextNudge: ActivationNudge | null = next
    ? { key: next.key, ...NUDGES[next.key] }
    : null

  // Lifecycle stage:
  //   new        — nothing / only a project exists (not really doing anything yet)
  //   activating — mid-core: at least one core step beyond project, not all core done
  //   activated   — all core steps done (project + widget + first report + a Sim)
  //   expanding  — activated AND at least one expansion lever engaged
  const anyExpansion = steps.some(st => !st.core && st.done)
  let stage: ActivationStage
  if (coreCompletedCount >= coreTotalCount) {
    stage = anyExpansion ? "expanding" : "activated"
  } else if (coreCompletedCount <= 1) {
    stage = "new"
  } else {
    stage = "activating"
  }

  return {
    steps,
    stage,
    completedCount,
    totalCount: steps.length,
    coreCompletedCount,
    coreTotalCount,
    nextNudge,
  }
}
