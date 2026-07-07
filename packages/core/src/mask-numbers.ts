const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'])

interface SavedText { parent: Node; original: Text; replacements: Node[] }
interface SavedInput { el: HTMLInputElement | HTMLSelectElement; original: string }

export function maskNumbers(root: Element): () => void {
  const savedTexts: SavedText[] = []
  const savedInputs: SavedInput[] = []

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let el: Element | null = node.parentElement
      while (el) {
        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT
        el = el.parentElement
      }
      return /\d/.test(node.textContent ?? '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    }
  })

  const toMask: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) toMask.push(n as Text)

  for (const textNode of toMask) {
    const content = textNode.textContent ?? ''
    const parts = content.split(/(\d+)/)
    if (parts.length <= 1) continue
    const parent = textNode.parentNode!
    const anchor = textNode.nextSibling
    const replacements: Node[] = parts.map((part, i) => {
      if (i % 2 === 1) {
        const span = document.createElement('span')
        span.style.cssText = 'background:#111;color:transparent;border-radius:2px;'
        span.textContent = '█'.repeat(part.length)
        span.dataset.original = part
        return span
      }
      return document.createTextNode(part)
    })
    parent.removeChild(textNode)
    for (const r of replacements) parent.insertBefore(r, anchor)
    savedTexts.push({ parent, original: textNode, replacements })
  }

  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach(el => {
    const v = el.value
    if (/\d/.test(v)) {
      savedInputs.push({ el, original: v })
      el.value = '█'.repeat(v.length)
    }
  })

  return () => {
    for (const { parent, original, replacements } of savedTexts) {
      const first = replacements[0]
      if (first?.parentNode === parent) {
        parent.insertBefore(original, first)
        for (const r of replacements) if (r.parentNode === parent) parent.removeChild(r)
      }
    }
    for (const { el, original } of savedInputs) {
      el.value = original
    }
  }
}
