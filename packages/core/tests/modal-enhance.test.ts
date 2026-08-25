// @vitest-environment jsdom
// KLA-586: AI "Enhance" + the WhatsApp-style Markdown description field.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal, renderInlineMarkdown, descPlainText, renderDraftToWhatsApp, type EnhanceDraftLike } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
const base = { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) }

const DRAFT: EnhanceDraftLike = {
  summary: 'Checkout button is unresponsive on click',
  actualResult: 'Clicking Place order does nothing; a TypeError fires in the console.',
  expectedResult: 'The order submits and navigates to the confirmation page.',
  stepsToReproduce: ['Add an item to the cart', 'Go to /checkout', 'Click Place order'],
  suggestedSeverity: 'C2',
  suggestedPriority: 'P2',
  confidence: 0.72,
}

// ── Pure helpers ─────────────────────────────────────────────────────────────────────────────────────
describe('renderInlineMarkdown (WhatsApp live format)', () => {
  it('renders *bold* _italic_ ~strike~ `code` while KEEPING the markers (dimmed)', () => {
    const html = renderInlineMarkdown('a *b* _i_ ~s~ `c`')
    expect(html).toContain('<b>b</b>')
    expect(html).toContain('<i>i</i>')
    expect(html).toContain('<s>s</s>')
    expect(html).toContain('<code>c</code>')
    // markers are preserved (not stripped), wrapped in dimmed spans
    expect(html).toContain('kl-mk')
    expect((html.match(/kl-mk/g) || []).length).toBe(8) // 4 pairs of markers
  })
  it('is HTML-safe (escapes angle brackets before formatting)', () => {
    expect(renderInlineMarkdown('<script>alert(1)</script>')).not.toContain('<script>')
    expect(renderInlineMarkdown('<b>x</b>')).toContain('&lt;b&gt;')
  })
  it('turns newlines into <br>', () => {
    expect(renderInlineMarkdown('a\nb')).toBe('a<br>b')
  })
})

describe('descPlainText', () => {
  it('round-trips text + <br> back to raw source', () => {
    const el = document.createElement('div')
    el.innerHTML = renderInlineMarkdown('hello *world*\nsecond')
    expect(descPlainText(el)).toBe('hello *world*\nsecond')
  })
  it('treats a browser-inserted <div> as a newline', () => {
    const el = document.createElement('div')
    el.innerHTML = 'line1<div>line2</div>'
    expect(descPlainText(el)).toBe('line1\nline2')
  })
})

describe('renderDraftToWhatsApp', () => {
  it('composes a Markdown block: bold summary, Actual/Expected, numbered steps, severity line', () => {
    const out = renderDraftToWhatsApp(DRAFT)
    expect(out).toContain('*Checkout button is unresponsive on click*')
    expect(out).toContain('*Actual:*')
    expect(out).toContain('*Expected:*')
    expect(out).toContain('*Steps to reproduce:*')
    expect(out).toContain('1. Add an item to the cart')
    expect(out).toContain('3. Click Place order')
    expect(out).toContain('*Severity: C2* · Priority: P2')
  })
  it('skips empty sections', () => {
    const out = renderDraftToWhatsApp({ summary: 'x', actualResult: '', expectedResult: '', stepsToReproduce: [], suggestedSeverity: 'C3', suggestedPriority: 'P3' })
    expect(out).not.toContain('*Actual:*')
    expect(out).not.toContain('*Steps to reproduce:*')
    expect(out).toContain('*Severity: C3* · Priority: P3')
  })
})

// ── The field integrated in the composer ─────────────────────────────────────────────────────────────
describe('description field (contenteditable, textarea-shaped .value)', () => {
  it('is a contenteditable div, NOT a <textarea>, with no syntax-hint line', () => {
    const ctrl = buildModal('bug', base)
    const desc = q(ctrl, '#klavity-desc')!
    expect(desc.tagName).toBe('DIV')
    expect(desc.getAttribute('contenteditable')).toBe('true')
    // founder ask: no "*bold* · _italic_" synhint line under the field
    expect(ctrl.shadowRoot.querySelector('.synhint')).toBeNull()
    ctrl.close()
  })
  it('raw Markdown round-trips through .value (get returns raw, set renders formatting)', () => {
    const ctrl = buildModal('bug', base)
    const desc = q(ctrl, '#klavity-desc') as any
    desc.value = 'fix the *bold* thing'
    expect(desc.value).toBe('fix the *bold* thing')          // raw source round-trips
    expect(desc.innerHTML).toContain('<b>bold</b>')          // and renders live
    ctrl.close()
  })
  it('live-renders formatting on input while keeping the raw text as .value', () => {
    const ctrl = buildModal('bug', base)
    const desc = q(ctrl, '#klavity-desc') as any
    desc.textContent = 'a `code` b'
    desc.dispatchEvent(new Event('input', { bubbles: true }))
    expect(desc.value).toBe('a `code` b')
    expect(desc.innerHTML).toContain('<code>code</code>')
    ctrl.close()
  })
  it('empty field renders nothing (so the :empty placeholder holds)', () => {
    const ctrl = buildModal('bug', base)
    const desc = q(ctrl, '#klavity-desc') as any
    desc.value = ''
    expect(desc.innerHTML).toBe('')
    expect(desc.getAttribute('data-ph')).toContain('Describe the bug')
    ctrl.close()
  })
})

describe('AI Enhance flow', () => {
  const enhanceOpts = (onEnhance: any) => ({ ...base, onEnhance })

  it('renders the Enhance button only when onEnhance is wired', () => {
    const without = buildModal('bug', base)
    expect(q(without, '#klavity-enhance')).toBeNull()
    without.close()
    const withE = buildModal('bug', enhanceOpts(async () => null))
    expect(q(withE, '#klavity-enhance')).not.toBeNull()
    withE.close()
  })

  it('button → spinner → replaces the field in place, shows Undo/Regenerate', async () => {
    let resolveDraft: (d: EnhanceDraftLike | null) => void = () => {}
    const onEnhance = vi.fn(() => new Promise<EnhanceDraftLike | null>(r => { resolveDraft = r }))
    const ctrl = buildModal('bug', enhanceOpts(onEnhance))
    const desc = q(ctrl, '#klavity-desc') as any
    desc.value = 'checkout button does nothing'
    ;(q(ctrl, '#klavity-enhance') as HTMLButtonElement).click()
    // spinner shows while in flight
    expect((q(ctrl, '#klavity-enhance-spin') as HTMLElement).hidden).toBe(false)
    expect((q(ctrl, '#klavity-enhance') as HTMLButtonElement).disabled).toBe(true)
    expect(onEnhance).toHaveBeenCalledTimes(1)
    resolveDraft(DRAFT)
    await new Promise(r => setTimeout(r, 0))
    // replaced in place with the drafted Markdown
    expect(desc.value).toContain('*Steps to reproduce:*')
    expect(desc.innerHTML).toContain('<b>Checkout button is unresponsive on click</b>')
    expect((q(ctrl, '#klavity-enhance-spin') as HTMLElement).hidden).toBe(true)
    expect((q(ctrl, '#klavity-enhance-undo') as HTMLElement).hidden).toBe(false)
    expect((q(ctrl, '#klavity-enhance-regen') as HTMLElement).hidden).toBe(false)
    ctrl.close()
  })

  it('Undo restores the reporter\'s original pre-enhance text', async () => {
    const onEnhance = vi.fn(async () => DRAFT)
    const ctrl = buildModal('bug', enhanceOpts(onEnhance))
    const desc = q(ctrl, '#klavity-desc') as any
    desc.value = 'my original note'
    ;(q(ctrl, '#klavity-enhance') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    expect(desc.value).not.toBe('my original note')
    ;(q(ctrl, '#klavity-enhance-undo') as HTMLButtonElement).click()
    expect(desc.value).toBe('my original note')
    expect((q(ctrl, '#klavity-enhance-undo') as HTMLElement).hidden).toBe(true)
    ctrl.close()
  })

  it('null draft is a silent no-op (leaves the reporter text untouched, no error)', async () => {
    const onEnhance = vi.fn(async () => null)
    const ctrl = buildModal('bug', enhanceOpts(onEnhance))
    const desc = q(ctrl, '#klavity-desc') as any
    desc.value = 'keep me'
    ;(q(ctrl, '#klavity-enhance') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    expect(desc.value).toBe('keep me')
    expect((q(ctrl, '#klavity-enhance-undo') as HTMLElement).hidden).toBe(true)
    ctrl.close()
  })

  it('stale-guards (seq): a slow Regenerate response is ignored once a newer run started', async () => {
    const drafts: Array<(d: EnhanceDraftLike | null) => void> = []
    const onEnhance = vi.fn(() => new Promise<EnhanceDraftLike | null>(r => drafts.push(r)))
    const ctrl = buildModal('bug', enhanceOpts(onEnhance))
    const desc = q(ctrl, '#klavity-desc') as any
    desc.value = 'seed'
    // First enhance completes so Regenerate becomes available (the Enhance button disables during flight).
    ;(q(ctrl, '#klavity-enhance') as HTMLButtonElement).click()          // run 1 → drafts[0]
    drafts[0]({ ...DRAFT, summary: 'FIRST' })
    await new Promise(r => setTimeout(r, 0))
    // Regenerate isn't disabled during flight, so two overlapping runs are possible → exercises the seq guard.
    ;(q(ctrl, '#klavity-enhance-regen') as HTMLButtonElement).click()    // run 2 → drafts[1]
    ;(q(ctrl, '#klavity-enhance-regen') as HTMLButtonElement).click()    // run 3 → drafts[2] (bumps seq)
    drafts[2]({ ...DRAFT, summary: 'FRESH' })   // newest run resolves first
    await new Promise(r => setTimeout(r, 0))
    drafts[1]({ ...DRAFT, summary: 'STALE' })   // older run resolves late — must be ignored
    await new Promise(r => setTimeout(r, 0))
    expect(desc.value).toContain('FRESH')
    expect(desc.value).not.toContain('STALE')
    ctrl.close()
  })

  it('accepted severity/priority ride the submit payload as structured fields', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, onEnhance: async () => DRAFT })
    const desc = q(ctrl, '#klavity-desc') as any
    desc.value = 'note'
    desc.dispatchEvent(new Event('input', { bubbles: true }))
    ;(q(ctrl, '#klavity-enhance') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.suggestedSeverity).toBe('C2')
    expect(payload.suggestedPriority).toBe('P2')
    ctrl.close()
  })
})

describe('stray amber bar fix', () => {
  it('the composer stylesheet restores [hidden] semantics for .klavity-capmsg', () => {
    const ctrl = buildModal('bug', { ...base, allowFileAttachments: true })
    const css = Array.from(ctrl.shadowRoot.querySelectorAll('style')).map((s: any) => s.textContent).join('\n')
    expect(css).toContain('.klavity-capmsg[hidden]{display:none;}')
    // and the box is hidden by default (no stray empty amber pill on open)
    const capmsg = q(ctrl, '#klavity-capmsg') as HTMLElement
    expect(capmsg.hidden).toBe(true)
    ctrl.close()
  })
})
