import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")

function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig)
  if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") d++
    else if (src[j] === "}") {
      d--
      if (d === 0) return src.slice(i, j + 1)
    }
  }
  throw new Error("unbalanced: " + sig)
}

test("Filter dropdown options are structured as clickable items with role option", () => {
  const updateFn = extractFn(HTML, "function updateTktMultiSelect(")
  expect(updateFn).toContain('class="tkt-ms-item')
  expect(updateFn).toContain('role="option"')
  expect(updateFn).toContain('class="tkt-ms-txt"')
  expect(updateFn).toContain('input type="checkbox"')
  // Ensures clicks on the filter name / row toggle the checkbox and prevent double-event interference
  expect(updateFn).toContain("if (e.target !== cb)")
  expect(updateFn).toContain("e.preventDefault()")
  expect(updateFn).toContain("cb.checked = !cb.checked")
})

test("Filter dropdown click simulation: clicking filter name, checkbox, or row toggles selection", () => {
  // Simulate DOM elements and events
  const filters: Record<string, string[]> = { status: [] }
  let updatedCount = 0

  const options = [
    { value: "", textContent: "All statuses" },
    { value: "open", textContent: "Open" },
    { value: "in_progress", textContent: "In Progress" },
    { value: "done", textContent: "Done" },
  ]

  const cfg = { id: "fbStatus", key: "status", defaultLabel: "All statuses", title: "Status" }

  function renderAndBind() {
    const current = filters[cfg.key] || []
    const isAllChecked = current.length === 0

    const items: Array<{
      el: any
      cb: any
      txt: any
      val: string
      click: (target?: any) => void
    }> = []

    options.forEach(opt => {
      const val = opt.value
      const isAll = (val === "")
      const checked = isAll ? isAllChecked : current.includes(val)

      const cb = { checked, type: "checkbox" }
      const txt = { textContent: opt.textContent }
      const itemEl = {
        getAttribute: (attr: string) => (attr === "data-val" ? val : null),
        querySelector: (sel: string) => (sel.includes("checkbox") ? cb : null),
        classList: {
          contains: (cls: string) => (cls === "selected" ? checked : false)
        }
      }

      const clickHandler = (e: { target: any; preventDefault: () => void; stopPropagation: () => void }) => {
        e.stopPropagation()
        const targetVal = itemEl.getAttribute("data-val")
        if (e.target !== cb) {
          e.preventDefault()
          cb.checked = !cb.checked
        }
        const isNowChecked = cb.checked

        if (targetVal === "") {
          filters[cfg.key] = []
        } else {
          let arr = [...filters[cfg.key]]
          if (isNowChecked) {
            if (!arr.includes(targetVal)) arr.push(targetVal)
          } else {
            arr = arr.filter(x => x !== targetVal)
          }
          filters[cfg.key] = arr
        }
        updatedCount++
      }

      items.push({
        el: itemEl,
        cb,
        txt,
        val,
        click: (target = itemEl) => {
          let defaultPrevented = false
          let stopped = false
          // If clicking checkbox directly, browser toggles checked state first
          if (target === cb) {
            cb.checked = !cb.checked
          }
          clickHandler({
            target,
            preventDefault: () => { defaultPrevented = true },
            stopPropagation: () => { stopped = true }
          })
        }
      })
    })

    return items
  }

  // 1. Initially "All statuses" is checked, specific statuses are empty
  let items = renderAndBind()
  expect(filters.status).toEqual([])
  expect(items[0].cb.checked).toBe(true)
  expect(items[1].cb.checked).toBe(false)

  // 2. Click on the filter name (txt) of "Open" -> should select "Open"
  items[1].click(items[1].txt)
  expect(filters.status).toEqual(["open"])

  // Re-render
  items = renderAndBind()
  expect(items[0].cb.checked).toBe(false) // "All" is unselected
  expect(items[1].cb.checked).toBe(true)  // "Open" is selected

  // 3. Click directly on the checkbox of "In Progress" -> should add "In Progress"
  items[2].click(items[2].cb)
  expect(filters.status).toEqual(["open", "in_progress"])

  // Re-render
  items = renderAndBind()
  expect(items[1].cb.checked).toBe(true)
  expect(items[2].cb.checked).toBe(true)

  // 4. Click on the row element (padding/container) of "Done" -> should add "Done"
  items[3].click(items[3].el)
  expect(filters.status).toEqual(["open", "in_progress", "done"])

  // 5. Click on the filter name (txt) of "Open" again -> should deselect "Open"
  items = renderAndBind()
  items[1].click(items[1].txt)
  expect(filters.status).toEqual(["in_progress", "done"])

  // 6. Click on "All statuses" name -> should reset filters to empty []
  items = renderAndBind()
  items[0].click(items[0].txt)
  expect(filters.status).toEqual([])
})
