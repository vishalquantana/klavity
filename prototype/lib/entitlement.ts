// Snap-only project gating: a project's plan_override column can lock it to Snap-only regardless
// of the account's billing plan. NULL (or any value other than "snap") inherits — all features open.
export type ProjectEntitlement = { snapOnly: boolean; canSims: boolean; canAutoSim: boolean; canAiSettings: boolean }

export function projectEntitlement(planOverride: string | null | undefined): ProjectEntitlement {
  const snapOnly = planOverride === "snap"
  return { snapOnly, canSims: !snapOnly, canAutoSim: !snapOnly, canAiSettings: !snapOnly }
}
