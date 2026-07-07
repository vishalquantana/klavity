// AutoSims F1 — named per-project Test Accounts (ADR-0001). The password is AES-GCM-encrypted at
// rest via lib/crypto.ts (KLAV_SECRET). Only getTestAccountSecret ever decrypts, and only the
// runner/authoring engine may call it at run time. No API returns the plaintext.
import { db } from "./db"
import { encryptSecret, decryptSecret } from "./crypto"

export interface TestAccount {
  id: string; projectId: string; name: string; loginEmail: string
  createdBy: string | null; createdAt: number; updatedAt: number
}

const row2acc = (r: any): TestAccount => ({
  id: String(r.id), projectId: String(r.project_id), name: String(r.name),
  loginEmail: String(r.login_email), createdBy: r.created_by ? String(r.created_by) : null,
  createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
})

export async function createTestAccount(
  projectId: string,
  input: { name: string; loginEmail: string; password: string; createdBy?: string },
): Promise<string> {
  const id = "tacc_" + crypto.randomUUID()
  const now = Date.now()
  const enc = await encryptSecret(input.password)
  await db!.execute({
    sql: `INSERT INTO test_accounts (id,project_id,name,login_email,password_enc,created_by,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [id, projectId, input.name, input.loginEmail, enc, input.createdBy ?? null, now, now],
  })
  return id
}

export async function listTestAccounts(projectId: string): Promise<TestAccount[]> {
  const r = await db!.execute({
    sql: `SELECT id,project_id,name,login_email,created_by,created_at,updated_at
          FROM test_accounts WHERE project_id=? ORDER BY created_at`,
    args: [projectId],
  })
  return r.rows.map(row2acc)
}

export async function getTestAccountByName(projectId: string, name: string): Promise<TestAccount | null> {
  const r = await db!.execute({
    sql: `SELECT id,project_id,name,login_email,created_by,created_at,updated_at
          FROM test_accounts WHERE project_id=? AND name=?`,
    args: [projectId, name],
  })
  return r.rows.length ? row2acc(r.rows[0]) : null
}

/** Run-time only (runner / authoring engine). Never expose through a route. */
export async function getTestAccountSecret(
  projectId: string, name: string,
): Promise<{ loginEmail: string; password: string } | null> {
  const r = await db!.execute({
    sql: `SELECT login_email, password_enc FROM test_accounts WHERE project_id=? AND name=?`,
    args: [projectId, name],
  })
  if (!r.rows.length) return null
  const row: any = r.rows[0]
  return { loginEmail: String(row.login_email), password: await decryptSecret(String(row.password_enc)) }
}

export async function getTestAccountById(projectId: string, id: string): Promise<TestAccount | null> {
  const r = await db!.execute({
    sql: `SELECT id,project_id,name,login_email,created_by,created_at,updated_at
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

/** Returns true if the email is registered as a login_email in ANY project's test accounts. */
export async function isTestAccountEmail(email: string): Promise<boolean> {
  const r = await db!.execute({
    sql: `SELECT 1 FROM test_accounts WHERE LOWER(login_email)=? LIMIT 1`,
    args: [email.trim().toLowerCase()],
  })
  return r.rows.length > 0
}
