import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const filePath = path.join(
    __dirname,
    "migrations",
    "001_initial_schema.sql"
  );

  const sql = await fs.readFile(filePath, "utf8");

  try {
    await db.query(sql);

    console.log("Database migration completed.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

migrate();