import { sendFixedNotification } from "./mail"

export type FixNotificationInput = {
  contactEmail?: string | null
  previousStatus?: string | null
  nextStatus?: string | null
  title: string
  projectName: string
  ticketUrl: string
}

export function shouldNotifyReporterOnFix(input: Pick<FixNotificationInput, "contactEmail" | "previousStatus" | "nextStatus">): boolean {
  const email = String(input.contactEmail || "").trim()
  if (!email) return false
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false
  return input.nextStatus === "done" && input.previousStatus !== "done"
}

export async function notifyReporterOnFix(
  input: FixNotificationInput,
  deps: { send?: typeof sendFixedNotification; warn?: (...args: any[]) => void } = {},
): Promise<void> {
  if (!shouldNotifyReporterOnFix(input)) return
  if (!process.env.SENDGRID_API_KEY) return
  const send = deps.send ?? sendFixedNotification
  const warn = deps.warn ?? console.warn
  try {
    await send(String(input.contactEmail).trim(), {
      title: input.title,
      projectName: input.projectName,
      ticketUrl: input.ticketUrl,
    })
  } catch (e: any) {
    warn("notify-on-fix skipped:", e?.message || e)
  }
}
