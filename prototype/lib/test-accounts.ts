// AutoSims F1 — named per-project Test Accounts (ADR-0001). The password is AES-GCM-encrypted at
// rest via lib/crypto.ts (KLAV_SECRET). Only getTestAccountSecret ever decrypts, and only the
// runner/authoring engine may call it at run time. No API returns the plaintext.
// KLA-103: auth_shape field supports "password" (email+password) and "otp" (email+OTP bypass).
import { db } from "./db"
import { encryptSecret, decryptSecret } from "./crypto"

export type AuthShape = "password" | "otp"

export interface TestAccount {
  id: string; projectId: string; name: string; loginEmail: string
  authShape: AuthShape
  createdBy: string | null; createdAt: number; updatedAt: number
}

const row2acc = (r: any): TestAccount => ({
  id: String(r.id), projectId: String(r.project_id), name: String(r.name),
  loginEmail: String(r.login_email),
  authShape: (r.auth_shape === "otp" ? "otp" : "password") as AuthShape,
  createdBy: r.created_by ? String(r.created_by) : null,
  createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
})

export interface CreateTestAccountInput {
  name: string
  loginEmail: string
  /** Required when authShape is "password". Ignored for "otp". */
  password?: string
  authShape?: AuthShape
  createdBy?: string
}

export async function createTestAccount(
  projectId: string,
  input: CreateTestAccountInput,
): Promise<string> {
  const authShape: AuthShape = input.authShape ?? "password"
  if (authShape === "password" && !input.password) {
    throw new Error("password is required for password auth shape")
  }
  const id = "tacc_" + crypto.randomUUID()
  const now = Date.now()
  // OTP accounts store an empty string in password_enc (no secret to encrypt).
  const enc = authShape === "password" ? await encryptSecret(input.password!) : ""
  await db!.execute({
    sql: `INSERT INTO test_accounts (id,project_id,name,login_email,password_enc,auth_shape,created_by,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [id, projectId, input.name, input.loginEmail, enc, authShape, input.createdBy ?? null, now, now],
  })
  return id
}

export async function listTestAccounts(projectId: string): Promise<TestAccount[]> {
  const r = await db!.execute({
    sql: `SELECT id,project_id,name,login_email,auth_shape,created_by,created_at,updated_at
          FROM test_accounts WHERE project_id=? ORDER BY created_at`,
    args: [projectId],
  })
  return r.rows.map(row2acc)
}

export async function getTestAccountByName(projectId: string, name: string): Promise<TestAccount | null> {
  const r = await db!.execute({
    sql: `SELECT id,project_id,name,login_email,auth_shape,created_by,created_at,updated_at
          FROM test_accounts WHERE project_id=? AND name=?`,
    args: [projectId, name],
  })
  return r.rows.length ? row2acc(r.rows[0]) : null
}

export interface TestAccountSecret {
  loginEmail: string
  authShape: AuthShape
  /** Present for "password" shape only. */
  password?: string
  /** Present for "otp" shape only: the fixed test OTP code (requires KLAV_TEST_OTP=1). */
  otpCode?: string
}

/** Run-time only (runner / authoring engine). Never expose through a route. */
export async function getTestAccountSecret(
  projectId: string, name: string,
): Promise<TestAccountSecret | null> {
  const r = await db!.execute({
    sql: `SELECT login_email, password_enc, auth_shape FROM test_accounts WHERE project_id=? AND name=?`,
    args: [projectId, name],
  })
  if (!r.rows.length) return null
  const row: any = r.rows[0]
  const authShape: AuthShape = row.auth_shape === "otp" ? "otp" : "password"
  if (authShape === "otp") {
    // OTP bypass: the caller must have KLAV_TEST_OTP=1 enabled. We surface the fixed code so the
    // runner can fill the OTP field without accessing live email. Fail-loud if bypass is not active.
    if (process.env.KLAV_TEST_OTP !== "1") {
      throw new Error(`test account "${name}" uses OTP auth but KLAV_TEST_OTP is not enabled`)
    }
    const otpCode = process.env.KLAV_TEST_OTP_CODE || "666666"
    return { loginEmail: String(row.login_email), authShape, otpCode }
  }
  return { loginEmail: String(row.login_email), authShape, password: await decryptSecret(String(row.password_enc)) }
}

export async function getTestAccountById(projectId: string, id: string): Promise<TestAccount | null> {
  const r = await db!.execute({
    sql: `SELECT id,project_id,name,login_email,auth_shape,created_by,created_at,updated_at
          FROM test_accounts WHERE project_id=? AND id=?`,
    args: [projectId, id],
  })
  return r.rows.length ? row2acc(r.rows[0]) : null
}

export async function deleteTestAccount(projectId: string, id: string): Promise<boolean> {
  const r = await db!.execute({
    sql: `DELETE FROM test_accounts WHERE project_id=? AND id=?`, args: [projectId, id],
  })
  return Number(r.rowsAffected) > 0
}
