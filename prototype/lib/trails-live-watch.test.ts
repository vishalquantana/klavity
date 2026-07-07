import { test, expect } from "bun:test"
import { endLiveWatchRun, liveWatchSnapshot, openLiveWatchStream, publishLiveWatchFrame, startLiveWatchRun } from "./trails-live-watch"

test("live watch stream emits hello, frame, and end events for a run", async () => {
  const projectId = "proj_live_unit"
  const runId = "walk_live_unit"
  const stream = openLiveWatchStream(projectId, runId)
  const reader = stream.getReader()

  const first = await reader.read()
  expect(new TextDecoder().decode(first.value)).toContain("event: hello")

  startLiveWatchRun(projectId, runId)
  publishLiveWatchFrame(projectId, runId, "data:image/jpeg;base64,abc")
  endLiveWatchRun(projectId, runId)

  const chunks: string[] = []
  for (let i = 0; i < 3; i++) {
    const next = await reader.read()
    chunks.push(new TextDecoder().decode(next.value))
  }
  await reader.cancel()

  const body = chunks.join("")
  expect(body).toContain("event: status")
  expect(body).toContain("event: frame")
  expect(body).toContain("data:image/jpeg;base64,abc")
  expect(body).toContain("event: end")
  expect(liveWatchSnapshot(projectId, runId).active).toBe(false)
})
