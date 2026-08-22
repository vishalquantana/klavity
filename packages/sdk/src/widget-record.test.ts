import { describe, it, expect } from 'vitest'
import { resolveComposerRecord } from './widget-lib'

// KLAVITYKLA-438 "Record me" is DEFAULT-ON for every project (opt-out, not opt-in). It only ever shows
// where the browser can screen-record, and is hidden only when a project EXPLICITLY disables it.
describe('resolveComposerRecord — default-on, opt-out', () => {
  it('no composer config → true when supported', () => {
    expect(resolveComposerRecord(null, true)).toBe(true)
    expect(resolveComposerRecord(undefined, true)).toBe(true)
  })

  it('empty composer config (no record flag) → true when supported', () => {
    expect(resolveComposerRecord({}, true)).toBe(true)
  })

  it('composer.record:true → true when supported', () => {
    expect(resolveComposerRecord({ record: true }, true)).toBe(true)
  })

  it('composer.record:false → false (explicit opt-out)', () => {
    expect(resolveComposerRecord({ record: false }, true)).toBe(false)
  })

  it('composer.allowRecording:false → false (explicit opt-out)', () => {
    expect(resolveComposerRecord({ allowRecording: false }, true)).toBe(false)
  })

  it('never shows when the browser cannot screen-record, regardless of config', () => {
    expect(resolveComposerRecord(null, false)).toBe(false)
    expect(resolveComposerRecord({ record: true }, false)).toBe(false)
    expect(resolveComposerRecord({}, false)).toBe(false)
  })
})
