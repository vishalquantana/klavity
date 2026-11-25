import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: "prototype/.env" });
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const res = await client.execute("SELECT id, seq_num, title, priority, status FROM feedback WHERE seq_num = 117 OR title LIKE '%interesting%' LIMIT 5");
console.log(res.rows);
