// KLAVITYKLA-330 — lead nurture sequence tests.
// Covers: pure renderers, enrollLead idempotency, tickLeadNurture scheduling,
// unsubscribe guard, and recordSendgridEvents open/click tracking.
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import {
  buildNurtureEmail,
  buildStep1Email, buildStep2Email, buildStep3Email,
  enrollLead,
  recordNurtureEmailSent,
  recordSendgridEvents,
  tickLeadNurture,
  STEP2_DELAY_MS,
  STEP3_DELAY_MS,
} from "./lead-nurture"

const { getClient } = useIsolatedDb("klav-lead-nurture")

// ── Pure renderers ────────────────────────────────────────────────────────────

test("buildStep1Email: renders subject + HTML without throwing", () => {
  const c = buildStep1Email({ analyzedUrl: "https://example.com", baseUrl: "https://klavity.in" })
  expect(c.subject).toContain("example.com")
  expect(c.html).toContain("friction report")
  expect(c.html).toContain("Klavity")
  expect(c.text).toBeTruthy()
})

test("buildStep2Email: renders step 2 nudge", () => {
  const c = buildStep2Email({ analyzedUrl: "acme.com", baseUrl: "https://klavity.in" })
  expect(c.subject).toContain("breaks silently")
  expect(c.html).toContain("cro-step2")
  expect(c.html).toContain("acme.com")
})

test("buildStep3Email: renders step 3 social proof", () => {
  const c = buildStep3Email({ baseUrl: "https://klavity.in" })
  expect(c.subject).toContain("breaks silently")
  expect(c.html).toContain("cro-step3")
  expect(c.text).toContain("No credit card")
})

test("buildNurtureEmail: dispatches to correct step builder", () => {
  expect(buildNurtureEmail(1, {}).html).toContain("friction report")
  expect(buildNurtureEmail(2, {}).html).toContain("cro-step2")
  expect(buildNurtureEmail(3, {}).html).toContain("cro-step3")
})

test("buildNurtureEmail: throws for unknown step", () => {
  expect(() => buildNurtureEmail(99, {})).toThrow("Unknown nurture step")
})

test("all steps include unsubscribe link", () => {
  for (const step of [1, 2, 3]) {
    const c = buildNurtureEmail(step, { baseUrl: "https://klavity.in" })
    expect(c.html).toContain("/unsubscribe")
    expect(c.text).toContain("/unsubscribe")
  }
})

// ── enrollLead ────────────────────────────────────────────────────────────────

test("enrollLead: inserts a new sequence row and returns enrolled=true", async () => {
  const c = getClient()
  const now = Date.now()
  const result = await enrollLead(c, "new@example.com", { url: "https://acme.io", source: "test", nowMs: now })
  expect(result.enrolled).toBe(true)
  expect(result.sequenceId).toMatch(/^lns_/)

  const rows = await c.execute({ sql: "SELECT * FROM lead_nurture_sequences WHERE email=?", args: ["new@example.com"] })
  expect(rows.rows.length).toBe(1)
  const row = rows.rows[0] as any
  expect(row.step).toBe(2)
  expect(Number(row.next_at)).toBeCloseTo(now + STEP2_DELAY_MS, -3)
  expect(row.url).toBe("https://acme.io")
})

test("enrollLead: second call is a no-op (idempotent)", async () => {
  const c = getClient()
  const first = await enrollLead(c, "dup@example.com")
  const second = await enrollLead(c, "dup@example.com")
  expect(second.enrolled).toBe(false)
  expect(second.sequenceId).toBe(first.sequenceId)

  const rows = await c.execute({ sql: "SELECT count(*) as n FROM lead_nurture_sequences WHERE email=?", args: ["dup@example.com"] })
  expect(Number((rows.rows[0] as any).n)).toBe(1)
})

// ── recordNurtureEmailSent ────────────────────────────────────────────────────

test("recordNurtureEmailSent: writes lead_nurture_emails row + funnel_event", async () => {
  const c = getClient()
  const { sequenceId } = await enrollLead(c, "sent@example.com")
  await recordNurtureEmailSent(c, sequenceId, 1, "sg_abc123", Date.now())

  const emails = await c.execute({ sql: "SELECT * FROM lead_nurture_emails WHERE sequence_id=?", args: [sequenceId] })
  expect(emails.rows.length).toBe(1)
  expect((emails.rows[0] as any).step).toBe(1)
  expect((emails.rows[0] as any).sg_message_id).toBe("sg_abc123")

  const funnel = await c.execute({ sql: "SELECT * FROM funnel_events WHERE event='email_sent'", args: [] })
  expect(funnel.rows.length).toBeGreaterThan(0)
  expect((funnel.rows[0] as any).email).toBe("sent@example.com")
})

// ── tickLeadNurture ───────────────────────────────────────────────────────────

test("tickLeadNurture: sends step 2 when due and advances to step 3", async () => {
  const c = getClient()
  const sentTo: string[] = []
  const deps = {
    db: c,
    sendEmail: async (to: string) => { sentTo.push(to) },
    baseUrl: "https://klavity.in",
  }

  const now = 1_700_000_000_000
  await enrollLead(c, "step2@example.com", { nowMs: now })

  // Tick too early — nothing sent
  await tickLeadNurture({ ...deps, nowMs: () => now + STEP2_DELAY_MS - 1000 })
  expect(sentTo.length).toBe(0)

  // Tick when step 2 is due
  const tickNow = now + STEP2_DELAY_MS + 1000
  await tickLeadNurture({ ...deps, nowMs: () => tickNow })
  expect(sentTo).toContain("step2@example.com")

  // Sequence advances to step 3
  const seq = await c.execute({ sql: "SELECT step, next_at FROM lead_nurture_sequences WHERE email=?", args: ["step2@example.com"] })
  expect((seq.rows[0] as any).step).toBe(3)
  expect(Number((seq.rows[0] as any).next_at)).toBeCloseTo(tickNow + STEP3_DELAY_MS, -3)
})

test("tickLeadNurture: sends step 3 when due and marks sequence complete", async () => {
  const c = getClient()
  const sent: string[] = []
  const deps = {
    db: c,
    sendEmail: async (to: string) => { sent.push(to) },
    baseUrl: "https://klavity.in",
  }

  const now = 1_700_100_000_000
  await enrollLead(c, "step3@example.com", { nowMs: now })

  // Fast-forward sequence to step 3 manually
  await c.execute({
    sql: `UPDATE lead_nurture_sequences SET step=3, next_at=? WHERE email=?`,
    args: [now + 1000, "step3@example.com"],
  })

  const tickNow = now + 5000
  await tickLeadNurture({ ...deps, nowMs: () => tickNow })
  expect(sent).toContain("step3@example.com")

  // Sequence is complete
  const seq = await c.execute({ sql: "SELECT step, next_at, completed_at FROM lead_nurture_sequences WHERE email=?", args: ["step3@example.com"] })
  expect((seq.rows[0] as any).step).toBeNull()
  expect((seq.rows[0] as any).next_at).toBeNull()
  expect(Number((seq.rows[0] as any).completed_at)).toBe(tickNow)
})

test("tickLeadNurture: skips unsubscribed leads", async () => {
  const c = getClient()
  const sent: string[] = []
  const deps = {
    db: c,
    sendEmail: async (to: string) => { sent.push(to) },
  }

  const now = 1_700_200_000_000
  await enrollLead(c, "unsub@example.com", { nowMs: now })
  // Mark as unsubscribed
  await c.execute({
    sql: `UPDATE lead_nurture_sequences SET unsubscribed_at=?, next_at=NULL WHERE email=?`,
    args: [now + 1, "unsub@example.com"],
  })

  await tickLeadNurture({ ...deps, nowMs: () => now + STEP2_DELAY_MS + 1000 })
  expect(sent).not.toContain("unsub@example.com")
})

test("tickLeadNurture: does not send if next_at is in the future", async () => {
  const c = getClient()
  const sent: string[] = []
  const deps = { db: c, sendEmail: async (to: string) => { sent.push(to) } }

  const now = 1_700_300_000_000
  await enrollLead(c, "future@example.com", { nowMs: now })
  await tickLeadNurture({ ...deps, nowMs: () => now + 1000 })  // way before next_at
  expect(sent).not.toContain("future@example.com")
})

// ── recordSendgridEvents ──────────────────────────────────────────────────────

test("recordSendgridEvents: sets opened_at on open event", async () => {
  const c = getClient()
  const { sequenceId } = await enrollLead(c, "open@example.com")
  await recordNurtureEmailSent(c, sequenceId, 1, "sg_open_001", Date.now())

  const openTs = 1_700_000_050_000
  await recordSendgridEvents(c, [{ sgMessageId: "sg_open_001", eventType: "open", timestampMs: openTs }])

  const row = await c.execute({ sql: "SELECT opened_at FROM lead_nurture_emails WHERE sg_message_id=?", args: ["sg_open_001"] })
  expect(Number((row.rows[0] as any).opened_at)).toBe(openTs)
})

test("recordSendgridEvents: sets clicked_at on click event", async () => {
  const c = getClient()
  const { sequenceId } = await enrollLead(c, "click@example.com")
  await recordNurtureEmailSent(c, sequenceId, 1, "sg_click_001", Date.now())

  const clickTs = 1_700_000_060_000
  await recordSendgridEvents(c, [{ sgMessageId: "sg_click_001", eventType: "click", timestampMs: clickTs }])

  const row = await c.execute({ sql: "SELECT clicked_at FROM lead_nurture_emails WHERE sg_message_id=?", args: ["sg_click_001"] })
  expect(Number((row.rows[0] as any).clicked_at)).toBe(clickTs)
})

test("recordSendgridEvents: ignores unknown message IDs gracefully", async () => {
  const c = getClient()
  await expect(
    recordSendgridEvents(c, [{ sgMessageId: "sg_nonexistent", eventType: "open", timestampMs: Date.now() }])
  ).resolves.toBeUndefined()
})

test("recordSendgridEvents: open is idempotent (opened_at not overwritten)", async () => {
  const c = getClient()
  const { sequenceId } = await enrollLead(c, "idempotent@example.com")
  await recordNurtureEmailSent(c, sequenceId, 1, "sg_idem_001", Date.now())

  const firstOpen = 1_700_000_010_000
  await recordSendgridEvents(c, [{ sgMessageId: "sg_idem_001", eventType: "open", timestampMs: firstOpen }])
  await recordSendgridEvents(c, [{ sgMessageId: "sg_idem_001", eventType: "open", timestampMs: firstOpen + 1000 }])

  const row = await c.execute({ sql: "SELECT opened_at FROM lead_nurture_emails WHERE sg_message_id=?", args: ["sg_idem_001"] })
  expect(Number((row.rows[0] as any).opened_at)).toBe(firstOpen)
})
