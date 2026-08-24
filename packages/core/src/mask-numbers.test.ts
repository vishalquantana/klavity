// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { maskNumbers } from './mask-numbers'

function make(html: string): HTMLDivElement {
  const div = document.createElement('div')
  div.innerHTML = html
  document.body.appendChild(div)
  return div
}

describe('maskNumbers', () => {
  const cleanup: HTMLElement[] = []
  afterEach(() => { cleanup.splice(0).forEach(el => el.remove()) })

  it('wraps digit runs in opaque spans', () => {
    const root = make('<p>Price: $1,234.56</p>')
    cleanup.push(root)
    const restore = maskNumbers(root)
    const spans = Array.from(root.querySelectorAll('span'))
    expect(spans.length).toBeGreaterThan(0)
    expect(spans[0].style.backgroundColor).toBe('rgb(17, 17, 17)')
    expect(spans[0].style.color).toBe('transparent')
    restore()
  })

  it('restores original text structure after restore()', () => {
    const root = make('<p>Total: 999</p>')
    cleanup.push(root)
    const original = root.textContent
    const restore = maskNumbers(root)
    // textContent is unchanged because the span contains the original digits (hidden by color:transparent)
    expect(root.textContent).toBe(original)
    // But the DOM structure changed (spans were inserted)
    expect(root.querySelectorAll('span').length).toBeGreaterThan(0)
    restore()
    expect(root.textContent).toBe(original)
    expect(root.querySelectorAll('span').length).toBe(0)
  })

  it('leaves non-digit chars ($ , . %) in plain text nodes', () => {
    const root = make('<p>$1,200.00</p>')
    cleanup.push(root)
    const restore = maskNumbers(root)
    const textNodes: string[] = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let n: Node | null
    while ((n = walker.nextNode())) textNodes.push(n.textContent ?? '')
    const plain = textNodes.join('')
    expect(plain).toContain('$')
    expect(plain).toContain(',')
    expect(plain).toContain('.')
    restore()
  })

  it('handles nested elements correctly', () => {
    const root = make('<p><strong>$1,200</strong> balance</p>')
    cleanup.push(root)
    const original = root.textContent
    const restore = maskNumbers(root)
    restore()
    expect(root.textContent).toBe(original)
    expect(root.querySelectorAll('span').length).toBe(0)
  })

  it('masks input values and restores them', () => {
    const root = make('<input type="text">')
    cleanup.push(root)
    const input = root.querySelector('input') as HTMLInputElement
    input.value = '12345'
    const restore = maskNumbers(root)
    expect(/\d/.test(input.value)).toBe(false)
    expect(input.value.length).toBe(5)
    restore()
    expect(input.value).toBe('12345')
  })

  it('skips text inside script tags', () => {
    const root = make('<p>visible 456</p>')
    cleanup.push(root)
    const s = document.createElement('script')
    s.textContent = 'var x = 123'
    root.appendChild(s)
    const restore = maskNumbers(root)
    expect(s.textContent).toBe('var x = 123')
    restore()
  })

  it('is a no-op on elements with no digits', () => {
    const root = make('<p>hello world</p>')
    cleanup.push(root)
    const restore = maskNumbers(root)
    expect(root.querySelectorAll('span').length).toBe(0)
    restore()
  })

  // KLA-560 (item 7): a hostile page can poison Node.prototype.removeChild. maskNumbers now routes its
  // removals through safeRemove, which swallows the poisoned throw — so mask + restore complete instead
  // of aborting the whole capture handler mid-flight (the real harm). Removal fidelity is best-effort
  // under active poisoning; the load-bearing guarantee is: NEVER throw.
  it('survives a poisoned Node.prototype.removeChild (mask + restore never throw)', () => {
    const originalRemoveChild = Node.prototype.removeChild
    try {
      // A broken polyfill with no null guard — throws whenever it is invoked.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(Node.prototype as any).removeChild = function (this: any) { throw new TypeError('poisoned removeChild') }

      const root = make('<p>Total: 999</p>')
      cleanup.push(root)

      let restore!: () => void
      expect(() => { restore = maskNumbers(root) }).not.toThrow()   // capture path completes, no crash
      expect(root.querySelectorAll('span').length).toBeGreaterThan(0)  // masking spans were inserted
      expect(() => restore()).not.toThrow()                         // restore path also survives
    } finally {
      Node.prototype.removeChild = originalRemoveChild
    }
  })

  // Clean-page behavior must be IDENTICAL after routing through safeRemove (regression guard for item 7).
  it('still fully restores on a clean page (safeRemove == removeChild when unpoisoned)', () => {
    const root = make('<p>Amount: 4242</p>')
    cleanup.push(root)
    const original = root.textContent
    const restore = maskNumbers(root)
    expect(root.querySelectorAll('span').length).toBeGreaterThan(0)
    restore()
    expect(root.textContent).toBe(original)
    expect(root.querySelectorAll('span').length).toBe(0)   // replacements fully removed
  })
})

import { resolveModalConfig } from './modal-theme'

describe('resolveModalConfig maskNumbers', () => {
  it('accepts maskNumbers: true', () => {
    const cfg = resolveModalConfig({ maskNumbers: true })
    expect(cfg.maskNumbers).toBe(true)
  })

  it('defaults maskNumbers to undefined when absent', () => {
    const cfg = resolveModalConfig({})
    expect(cfg.maskNumbers).toBeUndefined()
  })
})
