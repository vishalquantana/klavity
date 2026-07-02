// Opt-in real-key smoke for the author-drive model. NOT part of `bun test`.
//   OPENROUTER_API_KEY=<key> bun run scripts/smoke-author.ts
import { openRouterAuthorModel } from "../lib/trails-author-model"
if (!process.env.OPENROUTER_API_KEY) { console.log("SKIPPED: set OPENROUTER_API_KEY."); process.exit(0) }
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
const out = await openRouterAuthorModel({
  objective: "click the Sign in button", pageUrl: "https://example.test/login",
  screenshotB64: PNG, mediaType: "image/png",
  domSnapshot: "<button id='go'>Sign in</button>", history: [], credFields: [],
}, { projectId: "proj_smoke" })
console.log("AuthorAction:", JSON.stringify(out, null, 2))
console.log("OK — check ai_calls for a type=author-drive row.")
