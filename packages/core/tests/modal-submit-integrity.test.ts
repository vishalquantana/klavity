// @vitest-environment jsdom
// #467 — post-submit lock left payload MUTATORS active (Title, email, issue-type, mask, attachments,
// thumbnail Remove/Markup). Removing a shot during slow compression spliced the parallel arrays after
// the payload was captured → the submitted annotation attached to the WRONG image. Fix: snapshot every
// payload-shaping array/field at submit-START (and disable the remaining mutators) so post-submit mutation
// can't misalign the report.
// #468 — Escape/X/backdrop stayed usable during submit; a later submit resolution then rendered the
// confirmation + armed the 4s timer on an ALREADY-detached modal → close()+onClose fired again, tearing
// down a reopened session. Fix: close() is idempotent and a resolution after close renders nothing.
import { describe, it, expect, vi } from 'vitest'
import { buildModal } from '../src/modal'

const PNG_A = 'data:image/png;base64,QUFB'
const PNG_B = 'data:image/png;base64,QkJC'
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const tick = () => new Promise(r => setTimeout(r, 0))

describe('#467 payload snapshot at submit-start', () => {
  it('freezes the mutator controls AND survives a shot removed mid-compression without misaligning the payload', async () => {
    // Controllable compression: each dataUrl gets a pending promise we resolve by hand.
    const resolvers: Record<string, (v: string) => void> = {}
    const compressImage = (d: string) => new Promise<string>(res => { resolvers[d] = res })
    let submitted: any = null
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x',
      compressImage,
      onSubmit: async (p: any) => { submitted = p; return { issueKey: '1', issueUrl: '' } },
    })
    c.addScreenshot(PNG_A)
    c.addScreenshot(PNG_B)
    await tick()

    const submit = q(c, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    submit.click()

    // #467: the thumbnail Remove buttons are frozen while the submit is in flight.
    const removeBtns = c.shadowRoot.querySelectorAll('.klavity-rm') as NodeListOf<HTMLButtonElement>
    expect(removeBtns.length).toBe(2)
    removeBtns.forEach(b => expect(b.disabled).toBe(true))

    // Now FORCE a removal of shot #0 mid-submit (bypass the disabled guard) to prove the snapshot protects
    // the payload even if a mutation slips through: without the snapshot this would drop PNG_A's compressed
    // output and submit only one image.
    removeBtns[0].disabled = false
    removeBtns[0].click()
    await tick()

    // Resolve BOTH compressions (order irrelevant — the snapshot captured both promises at submit-start).
    resolvers[PNG_A]('CA')
    resolvers[PNG_B]('CB')
    await tick(); await tick()

    expect(submitted).not.toBeNull()
    // Both original shots travel, in order — the mid-flight removal did not misalign or drop anything.
    expect(submitted.screenshots).toEqual(['CA', 'CB'])
  })
})

describe('#468 detached auto-close timer + double onClose', () => {
  it('closing the modal mid-submit does not double-fire onClose or render a confirmation on the detached modal', async () => {
    vi.useFakeTimers()
    let resolveSubmit!: () => void
    const onSubmit = vi.fn(() => new Promise<{ issueKey: string; issueUrl: string }>(res => {
      resolveSubmit = () => res({ issueKey: 'X-1', issueUrl: '' })
    }))
    const onClose = vi.fn()
    // Legacy in-modal path (no backgroundUpload, no success) — the one that renders the confirmation + arms
    // the 4s auto-close, i.e. the path that could double-close.
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, onClose })
    c.addScreenshot(PNG)
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(0) // flush pre-compress await → onSubmit invoked (stays pending)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    // The user closes the modal WHILE the upload is still in flight (Esc / X / backdrop stay usable).
    c.close()
    expect(onClose).toHaveBeenCalledTimes(1)

    // The upload now resolves on the already-detached modal: NO confirmation card, NO second close.
    resolveSubmit()
    await vi.advanceTimersByTimeAsync(0)
    expect(q(c, '.klavity-sent')).toBeNull()
    // Advance well past the 4s auto-close window the resolution would have armed — onClose must stay at 1.
    await vi.advanceTimersByTimeAsync(6000)
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('close() is idempotent — a second close never re-fires onClose', () => {
    const onClose = vi.fn()
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }), onClose })
    c.close()
    c.close()
    c.close()
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
