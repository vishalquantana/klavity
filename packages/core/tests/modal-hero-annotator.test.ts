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

  it('offers red/orange/green/blue/white/black colour swatches + a custom picker', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    await new Promise(r => setTimeout(r, 0))
    const tools = c.shadowRoot.getElementById('klavity-hero-tools')!
    for (const col of ['#ef4444', '#f97316', '#16a34a', '#3b82f6', '#ffffff', '#111827']) {
      expect(tools.querySelector(`[data-color="${col}"]`)).toBeTruthy()
    }
    // Custom picker: a rainbow swatch + a native <input type="color">.
    expect(tools.querySelector('.kl-hcolor-custom')).toBeTruthy()
    expect(tools.querySelector('input.kl-hcolor-input[type="color"]')).toBeTruthy()
    c.close()
  })

  it('selecting the green swatch marks it as the active swatch', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    await new Promise(r => setTimeout(r, 0))
    const tools = c.shadowRoot.getElementById('klavity-hero-tools')!
    const green = tools.querySelector('[data-color="#16a34a"]') as HTMLElement
    green.click()
    expect(green.classList.contains('kl-on')).toBe(true)
    // Only one swatch is active at a time.
    expect(tools.querySelectorAll('.kl-hcolor.kl-on').length).toBe(1)
    c.close()
  })

  it('#626: keeps the whole palette on one non-wrapping row', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    await new Promise(r => setTimeout(r, 0))
    const tools = c.shadowRoot.getElementById('klavity-hero-tools')!
    const group = tools.querySelector('.kl-hcolors') as HTMLElement
    expect(group).toBeTruthy()
    // All six presets + the custom picker live inside the single group span.
    for (const col of ['#ef4444', '#f97316', '#16a34a', '#3b82f6', '#ffffff', '#111827']) {
      expect(group.querySelector(`[data-color="${col}"]`)).toBeTruthy()
    }
    expect(group.querySelector('.kl-hcolor-custom')).toBeTruthy()
    c.close()
  })

  it('#627: replaces the zoom hint text with − / + zoom buttons', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    await new Promise(r => setTimeout(r, 0))
    const tools = c.shadowRoot.getElementById('klavity-hero-tools')!
    // Old text hint is gone…
    expect(tools.querySelector('.kl-hhint')).toBeFalsy()
    expect(tools.textContent || '').not.toContain('scroll to zoom')
    // …replaced by two labelled icon buttons.
    const zin = tools.querySelector('#kl-hero-zoomin') as HTMLElement
    const zout = tools.querySelector('#kl-hero-zoomout') as HTMLElement
    expect(zin).toBeTruthy()
    expect(zout).toBeTruthy()
    expect(zin.getAttribute('aria-label')).toBe('Zoom in')
    expect(zout.getAttribute('aria-label')).toBe('Zoom out')
    c.close()
  })

  it('#627: bare Z toggles zoom between fit (1×) and 2×', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    await new Promise(r => setTimeout(r, 0))
    const canvas = c.shadowRoot.querySelector('#klavity-hero-stage canvas') as HTMLCanvasElement
    expect(canvas.style.transform).toBe('') // starts at fit
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))
    expect(canvas.style.transform).toContain('scale(2)') // → 2×
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))
    expect(canvas.style.transform).toBe('') // → back to fit
    c.close()
  })

  it('custom picker adopts the chosen colour as the active swatch', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    await new Promise(r => setTimeout(r, 0))
    const tools = c.shadowRoot.getElementById('klavity-hero-tools')!
    const customBtn = tools.querySelector('.kl-hcolor-custom') as HTMLElement
    const input = tools.querySelector('.kl-hcolor-input') as HTMLInputElement
    input.value = '#00ffcc'
    input.dispatchEvent(new Event('input'))
    expect(customBtn.classList.contains('kl-on')).toBe(true)          // custom is now the active swatch
    expect(customBtn.style.background).toContain('rgb(0, 255, 204)')  // swatch reflects the chosen colour
    // Picking a preset afterwards de-selects the custom swatch.
    ;(tools.querySelector('[data-color="#ef4444"]') as HTMLElement).click()
    expect(customBtn.classList.contains('kl-on')).toBe(false)
    c.close()
  })
})
