// KLA-582 (data-loss regression fix): console/network logs travel as a single text-file attachment
// (LOG_ATTACHMENT_FILENAME) instead of inline in the ticket body. Connectors that can upload
// attachments natively (Jira/Plane/Linear) keep it as a file. But connectors with NO attachment
// upload capability (GitHub Issues — see github.ts) would otherwise DROP the logs entirely: they
// ignore ticket.attachments, and KLA-582 removed the inline body copy. That is a silent data-loss
// regression (before KLA-582 the logs were inline in the body for every connector).
//
// This helper restores parity: when a connector cannot upload the log file, it falls back to
// appending the log content into the issue BODY. The bytes are already the REDACTED log text
// (buildLogAttachmentText reads from the sanitized/stored context — see feedback.ts KLA-582
// redaction), so nothing sensitive is re-introduced by inlining.

import type { TicketAttachment } from "./index"
import { LOG_ATTACHMENT_FILENAME } from "../feedback"

const decoder = new TextDecoder()

/**
 * Given a ticket body and its attachment array, pull out the console/network log text-file
 * attachment (if present) and append its content into the body as a collapsed GitHub-markdown
 * <details> block. Returns the (possibly) augmented body plus the attachments array with the log
 * file removed (so the connector never re-attempts an upload it can't do).
 *
 * Best-effort: any decode failure leaves body + attachments untouched (never blocks the export).
 * No-op when there is no log attachment.
 */
export function inlineLogAttachmentIntoBody(
  body: string,
  attachments: TicketAttachment[] | undefined,
): { body: string; attachments: TicketAttachment[] } {
  const list = Array.isArray(attachments) ? attachments : []
  const logAtt = list.find((a) => a?.filename === LOG_ATTACHMENT_FILENAME)
  if (!logAtt) return { body, attachments: list }

  const remaining = list.filter((a) => a !== logAtt)
  let logText = ""
  try {
    logText = decoder.decode(logAtt.bytes).trim()
  } catch {
    return { body, attachments: remaining } // undecodable — just drop the un-uploadable file
  }
  if (!logText) return { body, attachments: remaining }

  // GitHub renders <details>; keep the ``` fence so the log formatting survives markdown. The log
  // text is our own already-redacted, capped output (never attacker markdown that needs escaping
  // beyond breaking a code fence — and it can't, it's plain console/network lines).
  const section = `<details>\n<summary>Console / network logs (${LOG_ATTACHMENT_FILENAME})</summary>\n\n\`\`\`\n${logText}\n\`\`\`\n</details>`
  const newBody = body ? `${body}\n\n${section}` : section
  return { body: newBody, attachments: remaining }
}
