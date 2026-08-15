import { db } from "../db/pool.js";

export async function findUserByEmail(email) {
  const result = await db.query(
    `
    SELECT
      u.id,
      u.tenant_id,
      u.email,
      u.password_hash,
      t.name AS tenant_name
    FROM users u
    JOIN tenants t
      ON t.id = u.tenant_id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}