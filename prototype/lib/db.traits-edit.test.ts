import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-traitedit-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { db, applySchema, insertTrait, insertTraitEvent, listTraitEvents, updateTrait, listTraits, logTraitEdit } =
  await import("./db")

await applySchema(db!)

test("trait_events round-trips actor + manual op", async () => {
  const now = Date.now()
  await insertTrait({
    id: "trait_x", simId: "sim_x", projectId: "proj_x", kind: "pain",
    text: "v1", status: "active", strength: 1, srcTranscriptId: "tr_x", srcQuote: "q",
    srcQuoteOffset: null, srcSpeaker: null, createdAt: now, updatedAt: now,
  })
  await insertTraitEvent({
    traitId: "trait_x", simId: "sim_x", transcriptId: "tr_x",
    op: "edit", beforeText: "v1", afterText: "v2", quote: "q", quoteOffset: null,
    speaker: null, sourceDate: now, reason: "manual", actor: "dev2@quantana.com.au", createdAt: now,
  })
  const evs = await listTraitEvents("sim_x", { traitId: "trait_x" })
  expect(evs.length).toBe(1)
  expect(evs[0].op).toBe("edit")
  expect(evs[0].actor).toBe("dev2@quantana.com.au")
})

test("logTraitEdit(edit) updates trait text AND appends an edit event", async () => {
  const now = Date.now()
  await insertTrait({
    id: "trait_e", simId: "sim_e", projectId: "proj_e", kind: "want",
    text: "old", status: "active", strength: 1, srcTranscriptId: "tr_e", srcQuote: "q",
    srcQuoteOffset: null, srcSpeaker: null, createdAt: now, updatedAt: now,
  })
  const updated = {
    id: "trait_e", simId: "sim_e", projectId: "proj_e", kind: "want" as const,
    text: "new", status: "active" as const, strength: 1, srcTranscriptId: "tr_e", srcQuote: "q",
    srcQuoteOffset: null, srcSpeaker: null, createdAt: now, updatedAt: now + 1,
  }
  await logTraitEdit({ op: "edit", trait: updated, beforeText: "old", actor: "a@b.com", now: now + 1 })
  const traits = await listTraits("sim_e")
  expect(traits[0].text).toBe("new")
  const evs = await listTraitEvents("sim_e", { traitId: "trait_e" })
  expect(evs.at(-1)!.op).toBe("edit")
  expect(evs.at(-1)!.beforeText).toBe("old")
  expect(evs.at(-1)!.afterText).toBe("new")
  expect(evs.at(-1)!.actor).toBe("a@b.com")
})
