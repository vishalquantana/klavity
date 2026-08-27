import { describe, it, expect, afterEach } from 'vitest'
import { widgetPresent } from './coexist'

const realDoc = (globalThis as any).document

afterEach(() => { (globalThis as any).document = realDoc })

// Minimal DOM stub: getElementById matches by id, querySelector matches [data-klavity-ui].
function stubDoc(opts: { ids?: string[]; klavityUi?: boolean } = {}) {
  const ids = new Set(opts.ids ?? [])
  ;(globalThis as any).document = {
    getElementById: (id: string) => (ids.has(id) ? {} : null),
    querySelector: (sel: string) => (sel === '[data-klavity-ui]' && opts.klavityUi ? {} : null),
  }
}

describe('widgetPresent', () => {
  it('false when no Klavity in-page surface exists', () => {
    stubDoc()
    expect(widgetPresent()).toBe(false)
  })

  it('true when #klavity-widget-host exists (full embeddable widget)', () => {
    stubDoc({ ids: ['klavity-widget-host'] })
    expect(widgetPresent()).toBe(true)
  })

  it('true when #klavity-sdk-host exists (KlavitySnap.init script-tag SDK) — KLA-725', () => {
    stubDoc({ ids: ['klavity-sdk-host'] })
    expect(widgetPresent()).toBe(true)
  })

  it('true when any [data-klavity-ui] element exists', () => {
    stubDoc({ klavityUi: true })
    expect(widgetPresent()).toBe(true)
  })
})
