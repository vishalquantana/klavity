import { describe, it, expect } from 'vitest'
import { parseComposerOpts } from './composer-opts'

// PX4 #411/#425: the extension parses modalConfig.composer identically to the widget
// (packages/sdk/src/widget.ts) so the enhanced composer is at parity across both surfaces.
describe('parseComposerOpts (ext↔widget composer parity)', () => {
  it('defaults everything off for empty / missing / malformed config', () => {
    for (const c of [undefined, null, {}, { composer: null }, { composer: 'nope' }, { composer: 42 }]) {
      expect(parseComposerOpts(c as any)).toEqual({ showTitleField: false, allowFileAttachments: false })
    }
  })

  it('enables the Title field via either alias (title / showTitleField)', () => {
    expect(parseComposerOpts({ composer: { title: true } }).showTitleField).toBe(true)
    expect(parseComposerOpts({ composer: { showTitleField: true } }).showTitleField).toBe(true)
    expect(parseComposerOpts({ composer: { title: false } }).showTitleField).toBe(false)
  })

  it('enables file attachments via either alias (fileAttach / allowFileAttachments)', () => {
    expect(parseComposerOpts({ composer: { fileAttach: true } }).allowFileAttachments).toBe(true)
    expect(parseComposerOpts({ composer: { allowFileAttachments: true } }).allowFileAttachments).toBe(true)
    expect(parseComposerOpts({ composer: {} }).allowFileAttachments).toBe(false)
  })

  it('passes through the four valid issue types with labels', () => {
    const opts = parseComposerOpts({
      composer: {
        issueTypes: [
          { value: 'bug', label: 'Bug' },
          { value: 'feature', label: 'Feature' },
          { value: 'task', label: 'Task', mappingLabel: 'Jira Task' },
          { value: 'query', label: 'Query' },
        ],
      },
    })
    expect(opts.issueTypes?.map((t) => t.value)).toEqual(['bug', 'feature', 'task', 'query'])
    expect(opts.issueTypes?.find((t) => t.value === 'task')?.mappingLabel).toBe('Jira Task')
  })

  it('drops unknown issue-type values and falls back when the cleaned list is empty', () => {
    const mixed = parseComposerOpts({ composer: { issueTypes: [{ value: 'bug', label: 'B' }, { value: 'nope', label: 'X' }, { label: 'no value' }] } })
    expect(mixed.issueTypes?.map((t) => t.value)).toEqual(['bug'])
    // All-invalid list → undefined (classic Bug/Feature toggle), not an empty array.
    const allBad = parseComposerOpts({ composer: { issueTypes: [{ value: 'nope' }, { foo: 1 }] } })
    expect(allBad.issueTypes).toBeUndefined()
    // Non-array issueTypes is ignored.
    expect(parseComposerOpts({ composer: { issueTypes: 'bug' } }).issueTypes).toBeUndefined()
  })

  it('caps label + mappingLabel lengths and defaults label to the value', () => {
    const opts = parseComposerOpts({
      composer: { issueTypes: [{ value: 'bug', label: 'x'.repeat(50), mappingLabel: 'y'.repeat(50) }, { value: 'task' }] },
    })
    expect(opts.issueTypes?.[0].label.length).toBe(24)
    expect(opts.issueTypes?.[0].mappingLabel?.length).toBe(32)
    // No label provided → falls back to the value string.
    expect(opts.issueTypes?.[1].label).toBe('task')
  })
})
