import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: "prototype/.env" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

const res = await client.execute({
  sql: "SELECT id, seq_num, title, sim_id, actor_email, status, priority, project_id, observation FROM feedback WHERE title LIKE '%interesting%' OR observation LIKE '%interesting%' OR observation LIKE '%creator%' OR title LIKE '%creator%' LIMIT 5",
  args: []
});

for (const row of res.rows) {
  console.log("Found:", {
    id: row.id,
    seq_num: row.seq_num,
    title: row.title,
    sim_id: row.sim_id,
    actor_email: row.actor_email,
    priority: row.priority,
    status: row.status,
    observation: String(row.observation).slice(0, 80)
  });
}
