// @vitest-environment jsdom
//
// KLA-725: after KlavitySnap.init() the script-tag SDK must leave a DOM-detectable marker
// (#klavity-sdk-host and/or [data-klavity-ui]) so the browser extension yields its context
// menu and the user never sees two right-click menus. This mirrors the extension's
// widgetPresent() detector in packages/extension/src/coexist.ts.

import { describe, it, expect, beforeEach } from 'vitest'
import { init } from './index'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('KlavitySnap.init marker (extension coexistence)', () => {
  it('no marker exists before init()', () => {
    expect(document.querySelector('#klavity-sdk-host, [data-klavity-ui]')).toBeNull()
  })

  it('after init() the extension-detectable marker exists in the DOM', () => {
    init({})
    // This is exactly what the extension queries to yield.
    expect(document.querySelector('#klavity-sdk-host, [data-klavity-ui]')).not.toBeNull()
    const host = document.getElementById('klavity-sdk-host')
    expect(host).not.toBeNull()
    expect(host!.getAttribute('data-klavity-ui')).toBe('sdk')
  })

  it('init() is idempotent — does not stack duplicate host nodes', () => {
    init({})
    init({})
    expect(document.querySelectorAll('#klavity-sdk-host').length).toBe(1)
  })
})
