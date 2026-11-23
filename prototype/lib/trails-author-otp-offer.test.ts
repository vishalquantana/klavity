// Bug: PX4 login → "Security code" page. With KLAV_TEST_OTP on, every recording was offered {{cred:<acc>:otp}}
// — even for a PASSWORD credential, which can't resolve it ("does not have an OTP code"). The model filled the
// security-code field with that placeholder and failed every time, although the code (147852) was in the steps.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { buildAuthorMessages } from "./trails-author-model"

const author = readFileSync(join(import.meta.dir, "trails-author.ts"), "utf8").replace(/\r\n/g, "\n")

test("the :otp placeholder is offered only for OTP credentials; :password only for non-OTP ones", () => {
  expect(author).toContain('if (process.env.KLAV_TEST_OTP && acc.authShape === "otp") credFields.push(`{{cred:${acc.name}:otp}}`)')
  expect(author).toContain('if (acc.authShape !== "otp") credFields.push(`{{cred:${acc.name}:password}}`)')
  expect(author).not.toContain("if (process.env.KLAV_TEST_OTP) credFields.push(")
})

test("the prompt tells the model to type a code the objective gives (e.g. PX4 security code) literally", () => {
  const msgs = buildAuthorMessages({
    objective: "1. Log in\n2. Security code: 147852\n3. Choose PX4 Softwaress", history: [], pageUrl: "https://x.test/login",
    domSnapshot: "[e1] input Security code", credFields: ["{{cred:test:email}}", "{{cred:test:password}}"],
  } as any)
  const text = JSON.stringify(msgs)
  expect(text).toContain("If the OBJECTIVE itself gives a value for a field")
  expect(text).toContain("only use a placeholder that is listed above; never invent one")
  expect(text).not.toContain("{{cred:test:otp}}")
})

test("the model is told never to guess a code and to stall naming the missing value", () => {
  const msgs = buildAuthorMessages({ objective: "1. Open the project list", history: [], pageUrl: "https://x.test/verify", domSnapshot: "[e1] input VerificationCode", credFields: [] } as any)
  const text = JSON.stringify(msgs)
  expect(text).toContain("NEVER guess a security / verification code, OTP, PIN or password")
  expect(text).toContain('use op \\"stall\\" with a rationale naming the missing value')
})
