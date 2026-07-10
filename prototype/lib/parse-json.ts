/** parseJSON -- strips LLM output noise then parses/repairs the JSON it contains.
 *
 * Extracted from server.ts so it can be unit-tested without starting the server.
 * The server imports this function; all callers (reconcile, react, autosim, ...)
 * are unaffected.
 *
 * Repair ladder (each step retries JSON.parse on failure):
 *   1. Strip <think>...</think> traces and markdown code fences, then parse.
 *   2. Extract the outermost JSON object OR array (some prompts return a top-level array).
 *   3. Repair common LLM glitches: smart quotes, trailing commas, unquoted bare property names.
 *   4. Throw "Model did not return valid JSON" -- caller wraps in HTTP 500 via oops().
 */
// Smart-quote character sets used in the repair regexes below.
// Built via fromCharCode so ASCII source files remain free of ambiguous curly-quote bytes.
const CURLY_DQ = new RegExp(
  "[" + String.fromCharCode(0x201C) + String.fromCharCode(0x201D) + "]", "g"
)
const CURLY_SQ = new RegExp(
  "[" + String.fromCharCode(0x2018) + String.fromCharCode(0x2019) + "]", "g"
)

export function parseJSON(s: string): any {
  // Strip thinking-model traces (<think>...</think>) and ALL markdown code fences (models put
  // them anywhere, not just line-anchored). Greedy {...} extraction breaks on thinking traces,
  // so tags go first.
  const tag = "think"
  const open = new RegExp("<" + tag + "[^>]*>[\\s\\S]*?<\\/" + tag + ">", "gi")
  const cleaned = s
    .replace(open, "")
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim()
  const tryParse = (str: string): { ok: true; val: any } | { ok: false } => {
    try { return { ok: true, val: JSON.parse(str) } } catch { return { ok: false } }
  }
  // 1) straight parse.
  let r = tryParse(cleaned); if (r.ok) return r.val
  // 2) extract the outermost JSON object OR array (some prompts return a top-level array).
  const obj = cleaned.match(/\{[\s\S]*\}/)
  const arr = cleaned.match(/\[[\s\S]*\]/)
  const candidate = obj && (!arr || obj.index! <= arr.index!) ? obj[0] : (arr ? arr[0] : cleaned)
  r = tryParse(candidate); if (r.ok) return r.val
  // 3) repair the common LLM JSON glitches that throw "Property name must be a string literal":
  //    smart quotes, trailing commas before } or ], AND unquoted bare property names
  //    (e.g. {reactions:[...]}). Then retry.
  const repaired = candidate
    .replace(CURLY_DQ, '"')
    .replace(CURLY_SQ, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3')
  r = tryParse(repaired); if (r.ok) return r.val
  console.error("parseJSON: unrecoverable model output:", JSON.stringify(s.slice(0, 500)))
  throw new Error("Model did not return valid JSON")
}
