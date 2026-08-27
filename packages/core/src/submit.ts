import type { KlavitySettings, SubmitReportPayload, SubmitResult, IntegrationConfig } from './types'
import { DEFAULT_BACKEND_URL } from './types'

type Handler = (config: IntegrationConfig) => Promise<SubmitResult>

// KLA-720: the legacy "client-direct" submit modes (jira/linear/github/plane — the browser POSTing a
// report straight to an external tracker with an API key) have been REMOVED. They bypassed the Klavity
// server, so no `feedback` row was persisted and the report never appeared on the Klavity dashboard.
// The ONLY submit path now is `backend` (persist-first via /api/feedback), which fans out to the
// configured connector server-side. The handlers map therefore only carries `backend`.
interface Handlers {
  backend?: Handler
}

export async function dispatchSubmit(
  payload: SubmitReportPayload,
  settings: KlavitySettings,
  handlers: Handlers,
): Promise<SubmitResult> {
  // KLA-720: never post straight to a tracker. If no explicit backend is configured, default to the
  // canonical Klavity backend so a report is ALWAYS persisted (and never silently dropped).
  const effectiveSettings: KlavitySettings = settings.backendUrl
    ? settings
    : { ...settings, backendUrl: DEFAULT_BACKEND_URL }

  const config: IntegrationConfig = {
    type: payload.type,
    description: payload.description,
    context: payload.context,
    screenshots: payload.screenshots,
    settings: effectiveSettings,
    ...(payload.projectId ? { projectId: payload.projectId } : {}),
    replayEvents: payload.replayEvents,
  }

  // Persist-first is the only mode. If there is genuinely no backend handler wired up, throw a clear
  // error rather than silently dropping the report or falling back to a client-direct tracker POST.
  if (!handlers.backend) {
    throw new Error('No backend handler: cannot submit report (client-direct mode removed — KLA-720)')
  }
  return handlers.backend(config)
}
