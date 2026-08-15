import bcrypt from "bcryptjs";
import { db } from "./pool.js";

async function seed() {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      DELETE FROM submissions;
      DELETE FROM widgets;
      DELETE FROM users;
      DELETE FROM tenants;
    `);

    const tenantAResult = await client.query(
      `
      INSERT INTO tenants (name)
      VALUES ($1)
      RETURNING id, name
      `,
      ["Alpha Company"]
    );

    const tenantBResult = await client.query(
      `
      INSERT INTO tenants (name)
      VALUES ($1)
      RETURNING id, name
      `,
      ["Beta Company"]
    );

    const tenantA = tenantAResult.rows[0];
    const tenantB = tenantBResult.rows[0];

    const passwordHashA = await bcrypt.hash("Password123!", 12);
    const passwordHashB = await bcrypt.hash("Password123!", 12);

    await client.query(
      `
      INSERT INTO users (
        tenant_id,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      `,
      [
        tenantA.id,
        "owner-a@example.com",
        passwordHashA,
      ]
    );

    await client.query(
      `
      INSERT INTO users (
        tenant_id,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      `,
      [
        tenantB.id,
        "owner-b@example.com",
        passwordHashB,
      ]
    );

    await client.query("COMMIT");

    console.log("Seed completed.");
    console.log("Tenant A login: owner-a@example.com");
    console.log("Tenant B login: owner-b@example.com");
    console.log("Password: Password123!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

seed();