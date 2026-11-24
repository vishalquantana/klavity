// KD-3143: activating a Sim shows a confirmation popup (it used to flip silently; only Deactivate confirmed).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extract(name: string) {
  const start = html.indexOf("function " + name + "(")
  let i = html.indexOf("{", start), depth = 0
  for (; i < html.length; i++) { if (html[i] === "{") depth++; else if (html[i] === "}" && --depth === 0) break }
  return html.slice(start, i + 1)
}

async function run(makeActive: boolean, answer: boolean) {
  const asked: any[] = [], fetched: any[] = []
  const state = { active: { id: "p1", name: "PX4 QA" }, sims: [{ id: "s1", name: "Dina" }] }
  const fn = new Function("state", "curProjId", "klavConfirm", "applySimActiveOptimistic", "fetch", "esc", "confirmSimEdit", "renderSimsFeed", "klavToast", "window", "swrWrite", "dashCacheKey", "_simExec",
    "async " + extract("toggleSimActive") + "\nreturn toggleSimActive")(
      state, () => "p1", async (o: any) => { asked.push(o); return answer }, () => () => { },
      async (...a: any[]) => { fetched.push(a); return { ok: true, json: async () => ({}) } },
      (s: string) => s, () => { }, () => { }, () => { }, { dispatchEvent() { } }, () => { }, () => "", { states: {} })
  await fn("s1", makeActive, null)
  return { asked, fetched }
}

test("Activate asks first, naming the Sim and the project", async () => {
  const { asked, fetched } = await run(true, true)
  expect(asked.length).toBe(1)
  expect(asked[0].title).toBe("Activate Sim “Dina”?")
  expect(asked[0].message).toContain("the project “PX4 QA”")
  expect(asked[0].confirmText).toBe("Activate")
  expect(fetched.length).toBe(1)
  expect(JSON.parse(fetched[0][1].body)).toEqual({ active: true })
})

test("cancelling the popup leaves the Sim untouched", async () => {
  const { asked, fetched } = await run(true, false)
  expect(asked.length).toBe(1)
  expect(fetched.length).toBe(0)
})

test("Deactivate still confirms with its own wording", async () => {
  const { asked } = await run(false, true)
  expect(asked[0].title).toBe("Deactivate Sim “Dina”?")
  expect(asked[0].confirmText).toBe("Deactivate")
})
