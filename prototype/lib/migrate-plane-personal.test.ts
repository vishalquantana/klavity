// KLAVITYKLA-288 regression: migrateConnectorsPlanePersonal.
//
// The inline Plane push in POST /api/feedback used to read the per-user "personal connection"
// (integrations, scope='user'). That path is gone, so anyone who had one would silently stop
// filing to Plane unless this migration folds it into the connector system. Runs against a local
// libsql file DB — never production Turso.
import { test, expect } from "bun:test"
import { createClient, type Client } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import { migrateConnectorsPlanePersonal } from "./db"

async function seed(c: Client) {
  await c.execute(`CREATE TABLE schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
  await c.execute(`CREATE TABLE integrations (scope TEXT NOT NULL, owner_id TEXT NOT NULL, integration TEXT NOT NULL, config_json TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (scope, owner_id))`)
  await c.execute(`CREATE TABLE accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, created_at INTEGER NOT NULL)`)
  await c.execute(`CREATE TABLE projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
  await c.execute(`CREATE TABLE connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)

  // Alice owns an account with two projects — one already has a Plane connector.
  await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: ["acct_a", "Alice Co", "alice@acme.com", 1000] })
  await c.execute({ sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", args: ["proj_a1", "acct_a", "A1", 1000, 1000] })
  await c.execute({ sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", args: ["proj_a2", "acct_a", "A2", 1000, 1000] })
  await c.execute({ sql: "INSERT INTO connectors (id,project_id,type,name,config,auto_copy,enabled,created_at,created_by) VALUES (?,?,?,?,?,?,?,?,?)", args: ["conn_existing", "proj_a2", "plane", "Plane (migrated)", "{}", 1, 1, 1000, null] })

  // Bob owns nothing — he is only a member of Alice's account (his token must not leak into it).
  await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: ["acct_c", "Carol Co", "carol@acme.com", 1000] })
  await c.execute({ sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", args: ["proj_c1", "acct_c", "C1", 1000, 1000] })

  await c.execute({ sql: "INSERT INTO integrations (scope,owner_id,integration,config_json,updated_at) VALUES (?,?,?,?,?)", args: ["user", "alice@acme.com", "plane", JSON.stringify({ token_enc: "iv:alice", workspace: "acme", projectId: "plane_p1", host: "https://plane.acme.com" }), 1400] })
  await c.execute({ sql: "INSERT INTO integrations (scope,owner_id,integration,config_json,updated_at) VALUES (?,?,?,?,?)", args: ["user", "bob@acme.com", "plane", JSON.stringify({ token_enc: "iv:bob", workspace: "acme", projectId: "plane_p2" }), 1400] })
  // An incomplete personal connection (no token) could never have filed — must be skipped entirely.
  await c.execute({ sql: "INSERT INTO integrations (scope,owner_id,integration,config_json,updated_at) VALUES (?,?,?,?,?)", args: ["user", "carol@acme.com", "plane", JSON.stringify({ workspace: "acme", projectId: "plane_p3" }), 1400] })
}

test("migrateConnectorsPlanePersonal folds personal Plane connections into owned projects only", async () => {
  const file = join(tmpdir(), `klav-planepersonal-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
  const c = createClient({ url: "file:" + file })
  try {
    await seed(c)
    await migrateConnectorsPlanePersonal(c)

    const all = (await c.execute("SELECT id, project_id, type, name, config, auto_copy, enabled, created_by FROM connectors ORDER BY project_id")).rows as any[]

    // proj_a1 (owned by Alice, no prior Plane connector) gains one carrying her ENCRYPTED token.
    const a1 = all.filter((r) => r.project_id === "proj_a1")
    expect(a1.length).toBe(1)
    expect(String(a1[0].type)).toBe("plane")
    expect(Number(a1[0].auto_copy)).toBe(1)
    expect(Number(a1[0].enabled)).toBe(1)
    expect(String(a1[0].created_by)).toBe("alice@acme.com")
    const cfg = JSON.parse(String(a1[0].config))
    expect(cfg).toEqual({ token: "iv:alice", workspace: "acme", project_id: "plane_p1", host: "https://plane.acme.com" })

    // proj_a2 already had a Plane connector — a second one would double-file. Still exactly one.
    const a2 = all.filter((r) => r.project_id === "proj_a2")
    expect(a2.length).toBe(1)
    expect(String(a2[0].id)).toBe("conn_existing")

    // Carol's project gets nothing: her personal connection had no token, and Bob (a non-owner)
    // must never have his token copied into anyone else's account.
    const c1 = all.filter((r) => r.project_id === "proj_c1")
    expect(c1.length).toBe(0)
    const bobLeak = all.filter((r) => String(r.config).includes("iv:bob"))
    expect(bobLeak.length).toBe(0)

    // Idempotent: a second run (and a run after the flag is cleared) adds nothing.
    await migrateConnectorsPlanePersonal(c)
    await c.execute("DELETE FROM schema_meta WHERE key='connectors_plane_personal_migrated'")
    await migrateConnectorsPlanePersonal(c)
    const after = (await c.execute("SELECT COUNT(*) AS n FROM connectors")).rows[0] as any
    expect(Number(after.n)).toBe(all.length)
  } finally {
    c.close()
    try { unlinkSync(file) } catch { /* best-effort */ }
  }
})
