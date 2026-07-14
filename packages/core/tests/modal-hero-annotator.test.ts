// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { buildModal } from '../src/modal'

const ok = async () => ({ issueKey: '1', issueUrl: '' })
// 1x1 transparent PNG
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('hero inline annotator', () => {
  it('shows the empty state before any screenshot', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    expect(c.shadowRoot.querySelector('#klavity-hero-stage .kl-hero-empty')).toBeTruthy()
    c.close()
  })

  it('mounts a canvas + always-on toolbar when a screenshot is added', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    // canvas + tools render on Image.onload (async in jsdom) — wait a tick
    await new Promise(r => setTimeout(r, 0))
    const root = c.shadowRoot
    expect(root.querySelector('#klavity-hero-stage canvas')).toBeTruthy()
    const tools = root.querySelector('#klavity-hero-tools')!
    expect(tools.querySelector('[data-tool="pen"]')).toBeTruthy()
    expect(tools.querySelector('[data-tool="rect"]')).toBeTruthy()
    expect(tools.querySelector('[data-tool="text"]')).toBeTruthy()
    // pen is the default active tool
    expect(tools.querySelector('[data-tool="pen"]')!.classList.contains('kl-on')).toBe(true)
    c.close()
  })

  it('marks the first thumbnail active by default', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    await new Promise(r => setTimeout(r, 0))
    expect(c.shadowRoot.querySelector('.klavity-thumb.kl-thumb-active')).toBeTruthy()
    c.close()
  })
})
