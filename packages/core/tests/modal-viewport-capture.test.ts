// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

const tick = () => new Promise(r => setTimeout(r, 0))
function strip(ctrl: any) { return ctrl.shadowRoot.getElementById('klavity-strip') as HTMLElement }
function imgs(ctrl: any) { return Array.from(strip(ctrl).querySelectorAll('img')) as HTMLImageElement[] }
const base = { onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) }

// KLAVITYKLA-509 (viewport-first capture): when onCaptureViewport is wired, "Full Page" (and auto-capture)
// show the fast viewport preview immediately, then swap the full-page render in from the background.
describe('viewport-first capture — fast preview, full-page swap in the background', () => {
  it('Full Page: shows the viewport preview first, then swaps in the full-page render', async () => {
    const onCaptureViewport = vi.fn(async () => 'data:image/png;base64,VIEWPORT')
    let resolveFull: (v: string) => void = () => {}
    const onCaptureFull = vi.fn(() => new Promise<string>(r => { resolveFull = r }))
    const ctrl = buildModal('bug', { ...base, onCaptureFull, onCaptureViewport })

    ;(ctrl.shadowRoot.querySelector('#klavity-full') as HTMLButtonElement).click()
    await tick()
    // Phase 1: the fast preview is on the strip already, before the full render resolves.
    expect(onCaptureViewport).toHaveBeenCalledTimes(1)
    expect(imgs(ctrl).length).toBe(1)
    expect(imgs(ctrl)[0].src).toContain('VIEWPORT')

    // Phase 2: the full-page render finishes in the background and swaps in place (still ONE shot).
    resolveFull('data:image/png;base64,FULLPAGE')
    await tick()
    expect(onCaptureFull).toHaveBeenCalledTimes(1)
    expect(imgs(ctrl).length).toBe(1)
    expect(imgs(ctrl)[0].src).toContain('FULLPAGE')
    ctrl.close()
  })

  it('does not block the composer: Submit works while the full-page render is still pending', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const onCaptureViewport = vi.fn(async () => 'data:image/png;base64,VIEWPORT')
    const onCaptureFull = vi.fn(() => new Promise<string>(() => { /* never resolves */ }))
    const ctrl = buildModal('bug', { ...base, onSubmit, onCaptureFull, onCaptureViewport })

    ;(ctrl.shadowRoot.querySelector('#klavity-full') as HTMLButtonElement).click()
    await tick()
    const submit = ctrl.shadowRoot.querySelector('#klavity-submit') as HTMLButtonElement
    // Composer is unlocked (only the fast preview was awaited) and there IS evidence → Submit is enabled.
    expect(submit.disabled).toBe(false)
    submit.click()
    await tick()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    ctrl.close()
  })

  it('respects a user who removed the preview before the full render lands (no resurrection)', async () => {
    const onCaptureViewport = vi.fn(async () => 'data:image/png;base64,VIEWPORT')
    let resolveFull: (v: string) => void = () => {}
    const onCaptureFull = vi.fn(() => new Promise<string>(r => { resolveFull = r }))
    const ctrl = buildModal('bug', { ...base, onCaptureFull, onCaptureViewport })

    ;(ctrl.shadowRoot.querySelector('#klavity-full') as HTMLButtonElement).click()
    await tick()
    expect(imgs(ctrl).length).toBe(1)
    // User removes the preview thumbnail before the background full render resolves.
    ;(strip(ctrl).querySelector('.klavity-rm') as HTMLButtonElement).click()
    expect(imgs(ctrl).length).toBe(0)
    // The background full render lands — it must NOT resurrect a shot the user deleted.
    resolveFull('data:image/png;base64,FULLPAGE')
    await tick()
    expect(imgs(ctrl).length).toBe(0)
    ctrl.close()
  })

  it('falls back to the direct full-page capture when onCaptureViewport is absent (unchanged behavior)', async () => {
    const onCaptureFull = vi.fn(async () => 'data:image/png;base64,FULLONLY')
    const ctrl = buildModal('bug', { ...base, onCaptureFull })
    ;(ctrl.shadowRoot.querySelector('#klavity-full') as HTMLButtonElement).click()
    await tick()
    expect(onCaptureFull).toHaveBeenCalledTimes(1)
    expect(imgs(ctrl).length).toBe(1)
    expect(imgs(ctrl)[0].src).toContain('FULLONLY')
    ctrl.close()
  })
})
