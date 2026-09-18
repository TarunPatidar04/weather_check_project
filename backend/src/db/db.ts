import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const pool = new Pool({
  user: "neondb_owner",
  password: "npg_mflh6zJNjv7t",
  host: "52.95.251.153",
  port: 5432,
  database: "neondb",

  ssl: {
    rejectUnauthorized: false,
    servername: "ep-restless-field-b4a5pt6m-pooler.c-6.us-east-2.aws.neon.tech",
  },

  connectionTimeoutMillis: 10000,
});

export const db = pool;

db.query("SELECT NOW()")
  .then((result) => {
    console.log("Database Connected!");
    console.log("DB Time:", result.rows[0].now);
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });