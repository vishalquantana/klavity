// @vitest-environment jsdom
//
// KLA-772 — the inline annotator's drawn overlay must round-trip out of the modal (getAnnotations) and back
// in (addScreenshot(..., annotations)) so a report restored after minimize + navigation repaints the shapes.
import { describe, it, expect, vi } from 'vitest'
import { buildModal } from '../src/modal'

const ok = async () => ({ issueKey: '1', issueUrl: '' })
// 1x1 transparent PNG
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const overlay = (n: number) => ({
  w: 100,
  h: 100,
  shapes: [{ type: 'text', color: '#ef4444', x: n, y: n, text: 'note ' + n, size: 26, outline: 'black' }],
})

describe('modal annotation persistence (KLA-772)', () => {
  it('getAnnotations starts empty and returns {} with no shots', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    expect(c.getAnnotations()).toEqual({})
    c.close()
  })

  it('addScreenshot(annotations) repopulates the overlay and getAnnotations reflects it', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    // Seed two shots; only the first carries a saved overlay.
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, overlay(3))
    c.addScreenshot(PNG)
    const got = c.getAnnotations()
    expect(got[0]).toEqual(overlay(3))
    expect(got[1]).toBeUndefined()
    c.close()
  })

  it('getAnnotations returns a deep clone — mutating it does not corrupt modal state', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, overlay(1))
    const snap = c.getAnnotations()
    ;(snap[0].shapes[0] as any).text = 'HACKED'
    // A second read is unaffected by the caller mutating the first snapshot.
    expect(c.getAnnotations()[0].shapes[0].text).toBe('note 1')
    c.close()
  })

  it('does not seed an overlay when the annotations payload has no shapes', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, { w: 100, h: 100, shapes: [] })
    expect(c.getAnnotations()).toEqual({})
    c.close()
  })

  it('the round-tripped snapshot is JSON-safe (structured-clone / IndexedDB storable)', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, overlay(2))
    const snap = c.getAnnotations()
    // No throw + a faithful copy => contains no functions / DOM nodes.
    expect(JSON.parse(JSON.stringify(snap))).toEqual(snap)
    c.close()
  })

  it('removing a MIDDLE shot re-aligns overlays BEFORE onShotRemoved reads them (KLA-772 index shift)', () => {
    // Shots 0/1/2 carry overlays note0/note1/note2. Removing shot 1 must leave the host seeing the SHIFTED
    // map {0:note0, 1:note2} — not the pre-shift {0,1,2} which would store note1 onto shot2 and drop note2.
    let seenAtRemoval: any = null
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x', onSubmit: ok, onMinimize: () => {},
      onShotRemoved: () => { seenAtRemoval = c.getAnnotations() }, // host reads getAnnotations() here
    })
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, overlay(0))
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, overlay(1))
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, overlay(2))
    const removeBtns = Array.from(c.shadowRoot.querySelectorAll('.klavity-rm')) as HTMLButtonElement[]
    removeBtns[1].click() // remove the middle shot
    expect(seenAtRemoval[0]).toEqual(overlay(0))
    expect(seenAtRemoval[1]).toEqual(overlay(2)) // shot-after-deleted keeps ITS own overlay, not note1
    expect(seenAtRemoval[2]).toBeUndefined()     // no stale trailing index
    // And the live map matches.
    expect(c.getAnnotations()[1]).toEqual(overlay(2))
    c.close()
  })

  it('fires onAnnotationsChanged(index, null) when the annotator commits a clear', async () => {
    // Seed an overlay so the hero mounts with one shape, then Clear → the modal must re-persist (now empty).
    const onAnnotationsChanged = vi.fn()
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, onMinimize: () => {}, onAnnotationsChanged })
    c.addScreenshot(PNG, undefined, undefined, undefined, undefined, overlay(4))
    await new Promise(r => setTimeout(r, 0)) // let the hero mount
    const clearBtn = c.shadowRoot.getElementById('kl-hero-clear') as HTMLButtonElement
    clearBtn.click()
    expect(onAnnotationsChanged).toHaveBeenCalled()
    expect(onAnnotationsChanged.mock.calls[0][0]).toBe(0)
    // Cleared → the overlay is gone from the snapshot too.
    expect(c.getAnnotations()[0]).toBeUndefined()
    c.close()
  })
})
