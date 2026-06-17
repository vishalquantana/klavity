// P3a provenance core — PURE, LLM-free, DB-free reconcile logic.
// `applyReconcileOps` takes a Sim's current ACTIVE trait set + a list of structured ops
// (the shape an LLM reconcile call would emit, but this function never calls an LLM) and
// returns the trait writes, the append-only trait_event rows, and the rebuilt active-trait set.
// The route layer (P3a step 2/3) persists these via the db helpers; the test layer asserts them.

export type TraitKind = "pain" | "want" | "love"
export type TraitStatus = "active" | "superseded" | "contradicted"
export type ReconcileOpName = "add" | "reinforce" | "refine" | "contradict" | "supersede"
export type TraitEventOp = "create" | "reinforce" | "refine" | "contradict" | "supersede"

// A trait as it lives in `sim_traits`.
export type Trait = {
  id: string
  simId: string
  projectId: string
  kind: TraitKind
  text: string
  status: TraitStatus
  strength: number
  srcTranscriptId: string
  srcQuote: string
  srcQuoteOffset: number | null
  srcSpeaker: string | null
  createdAt: number
  updatedAt: number
}

// The structured op an LLM reconcile returns. `traitId` targets an existing trait for
// reinforce/refine/contradict/supersede; `add` creates a new trait (traitId ignored).
export type ReconcileOp = {
  op: ReconcileOpName
  kind: TraitKind
  text: string
  quote: string
  quoteOffset?: number | null
  speaker?: string | null
  traitId?: string
  reason?: string
}

// Context the caller supplies: the transcript this reconcile pass is grounded in + id/clock fns.
export type ReconcileCtx = {
  simId: string
  projectId: string
  transcriptId: string
  sourceDate: number
  now?: number
  newId?: () => string // injectable for deterministic tests
}

// A pending write to `sim_traits`. `mode='insert'` is a brand-new active trait; `mode='update'`
// updates an existing trait's mutable columns (text/status/strength/provenance/updatedAt).
export type TraitWrite = {
  mode: "insert" | "update"
  trait: Trait
}

// A row destined for the append-only `trait_events` audit table.
export type TraitEventRow = {
  traitId: string
  simId: string
  transcriptId: string
  op: TraitEventOp
  beforeText: string | null
  afterText: string | null
  quote: string
  quoteOffset: number | null
  speaker: string | null
  sourceDate: number
  reason: string | null
  createdAt: number
}

export type ReconcileResult = {
  traitWrites: TraitWrite[]
  traitEvents: TraitEventRow[]
  activeTraits: Trait[] // rebuilt set: ACTIVE traits only, after applying every op
}

let _counter = 0
function defaultNewId(): string {
  // deterministic-ish fallback; tests inject newId for stable assertions.
  _counter += 1
  return "trait_" + Date.now().toString(36) + "_" + _counter
}

/**
 * Apply a list of reconcile ops to a Sim's current trait set.
 *
 * Rules:
 *  - 'add'        → new active trait (insert) + 'create' event.
 *  - 'reinforce'  → same trait, strength+1, provenance refreshed to the new quote + 'reinforce' event.
 *  - 'refine'     → same trait, text replaced (before/after captured), strength+1 + 'refine' event.
 *  - 'contradict' → old trait marked 'contradicted' (NOT deleted) + 'contradict' event. Append-only.
 *  - 'supersede'  → old trait marked 'superseded' (NOT deleted), a NEW active trait carries the
 *                   replacement text + a 'supersede' event on the OLD trait referencing the new one.
 *  - The rebuilt active-trait set contains only status==='active' traits after all ops.
 *  - A target traitId that is missing (or already inactive) is treated defensively as an 'add'.
 */
export function applyReconcileOps(
  currentTraits: Trait[],
  ops: ReconcileOp[],
  ctx: ReconcileCtx,
): ReconcileResult {
  const now = ctx.now ?? Date.now()
  const newId = ctx.newId ?? defaultNewId
  const traitWrites: TraitWrite[] = []
  const traitEvents: TraitEventRow[] = []

  // working copy keyed by id; we mutate clones, never the inputs.
  const byId = new Map<string, Trait>()
  for (const t of currentTraits) byId.set(t.id, { ...t })

  const baseEvt = (
    traitId: string,
    op: TraitEventOp,
    beforeText: string | null,
    afterText: string | null,
    o: ReconcileOp,
    reason?: string | null,
  ): TraitEventRow => ({
    traitId,
    simId: ctx.simId,
    transcriptId: ctx.transcriptId,
    op,
    beforeText,
    afterText,
    quote: o.quote,
    quoteOffset: o.quoteOffset ?? null,
    speaker: o.speaker ?? null,
    sourceDate: ctx.sourceDate,
    reason: reason ?? o.reason ?? null,
    createdAt: now,
  })

  const mkTrait = (o: ReconcileOp): Trait => ({
    id: newId(),
    simId: ctx.simId,
    projectId: ctx.projectId,
    kind: o.kind,
    text: o.text,
    status: "active",
    strength: 1,
    srcTranscriptId: ctx.transcriptId,
    srcQuote: o.quote,
    srcQuoteOffset: o.quoteOffset ?? null,
    srcSpeaker: o.speaker ?? null,
    createdAt: now,
    updatedAt: now,
  })

  const addNew = (o: ReconcileOp) => {
    const t = mkTrait(o)
    byId.set(t.id, t)
    traitWrites.push({ mode: "insert", trait: { ...t } })
    traitEvents.push(baseEvt(t.id, "create", null, t.text, o))
  }

  for (const o of ops) {
    const target = o.traitId ? byId.get(o.traitId) : undefined
    const targetActive = target && target.status === "active" ? target : undefined

    switch (o.op) {
      case "add": {
        addNew(o)
        break
      }
      case "reinforce": {
        if (!targetActive) { addNew(o); break }
        targetActive.strength += 1
        targetActive.srcTranscriptId = ctx.transcriptId
        targetActive.srcQuote = o.quote
        targetActive.srcQuoteOffset = o.quoteOffset ?? null
        targetActive.srcSpeaker = o.speaker ?? null
        targetActive.updatedAt = now
        traitWrites.push({ mode: "update", trait: { ...targetActive } })
        traitEvents.push(baseEvt(targetActive.id, "reinforce", targetActive.text, targetActive.text, o))
        break
      }
      case "refine": {
        if (!targetActive) { addNew(o); break }
        const before = targetActive.text
        targetActive.text = o.text
        targetActive.strength += 1
        targetActive.srcTranscriptId = ctx.transcriptId
        targetActive.srcQuote = o.quote
        targetActive.srcQuoteOffset = o.quoteOffset ?? null
        targetActive.srcSpeaker = o.speaker ?? null
        targetActive.updatedAt = now
        traitWrites.push({ mode: "update", trait: { ...targetActive } })
        traitEvents.push(baseEvt(targetActive.id, "refine", before, targetActive.text, o))
        break
      }
      case "contradict": {
        if (!targetActive) {
          // nothing to contradict; defensively record as a new active trait so we don't lose the signal.
          addNew(o)
          break
        }
        const before = targetActive.text
        targetActive.status = "contradicted"
        targetActive.updatedAt = now
        traitWrites.push({ mode: "update", trait: { ...targetActive } })
        traitEvents.push(baseEvt(targetActive.id, "contradict", before, before, o))
        break
      }
      case "supersede": {
        if (!targetActive) { addNew(o); break }
        const before = targetActive.text
        // 1) mark the OLD trait superseded (kept, not deleted).
        targetActive.status = "superseded"
        targetActive.updatedAt = now
        traitWrites.push({ mode: "update", trait: { ...targetActive } })
        // 2) create the NEW replacement active trait.
        const replacement = mkTrait(o)
        byId.set(replacement.id, replacement)
        traitWrites.push({ mode: "insert", trait: { ...replacement } })
        // 3) supersede event on the OLD trait, referencing the new one.
        traitEvents.push(
          baseEvt(targetActive.id, "supersede", before, o.text, o, `superseded_by:${replacement.id}`),
        )
        // and a create event for the new trait's provenance.
        traitEvents.push(baseEvt(replacement.id, "create", null, replacement.text, o))
        break
      }
    }
  }

  const activeTraits = [...byId.values()].filter((t) => t.status === "active")
  return { traitWrites, traitEvents, activeTraits }
}

// Recompute a persona's insights_json cache from a set of ACTIVE traits.
// Shape matches what the studio/dashboard already read (kind/text/quote), plus the stable traitId
// so the UI can render citation chips. Pure so it is reused both at write-time and in tests.
export type InsightCacheItem = {
  traitId: string
  kind: TraitKind
  text: string
  quote: string
  speaker: string | null
  sourceTranscriptId: string
  strength: number
}
export function insightsFromTraits(activeTraits: Trait[]): InsightCacheItem[] {
  return activeTraits
    .filter((t) => t.status === "active")
    .map((t) => ({
      traitId: t.id,
      kind: t.kind,
      text: t.text,
      quote: t.srcQuote,
      speaker: t.srcSpeaker,
      sourceTranscriptId: t.srcTranscriptId,
      strength: t.strength,
    }))
}
