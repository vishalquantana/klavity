// KD-3148: the human ticket label the dashboard shows everywhere (mirrors ticketKeyLabel in dashboard.html):
//   ticket                  → "KD-232"  (project ticket key + ticket number), "#232" when the project has no key
//   untriaged Sim Report    → "KD-SIM-12" (its own Sim sequence), "SIM-12" without a key
// Returns null when the row has no number yet — callers then show nothing rather than an internal id.
export function ticketKeyLabel(t: { ticketKey?: string | null; seqNum?: number | null; simSeqNum?: number | null; status?: string | null }): string | null {
  const key = t.ticketKey ? String(t.ticketKey) : ""
  const status = String(t.status || "").toLowerCase()
  if (t.simSeqNum != null) {
    // An accepted Sim Report has become a ticket and carries the ticket number instead.
    const accepted = t.seqNum != null && status !== "new" && status !== "dismissed"
    if (!accepted) return (key ? key + "-" : "") + "SIM-" + t.simSeqNum
  }
  if (t.seqNum != null) return key ? key + "-" + t.seqNum : "#" + t.seqNum
  return null
}
