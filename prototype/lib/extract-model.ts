/** Returns the model ID to use for the EXTRACT (persona-extraction) step.
 *  Set KLAV_EXTRACT_MODEL in the environment to override the default.
 *  Kept separate from the weighted-random mix used by react/reconcile calls
 *  because extraction quality is highly sensitive to model capability and
 *  cheaper models mis-sign sarcastic/negated insights. */
export function getExtractModel(): string {
  return process.env.KLAV_EXTRACT_MODEL ?? "google/gemini-2.5-flash"
}
