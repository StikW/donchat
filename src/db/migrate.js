import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getPool, closePool } from "./pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  const pool = getPool();
  await pool.query(sql);
  console.log("Migración aplicada correctamente.");
  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
