import { db } from "../../src/db/pool.js";

export async function createTestTenant(
  name = "Test Tenant"
) {
  const result = await db.query(
    `
    INSERT INTO tenants (name)
    VALUES ($1)
    RETURNING *
    `,
    [name]
  );

  return result.rows[0];
}

export async function createTestWidget(
  tenantId
) {
  const result = await db.query(
    `
    INSERT INTO widgets (
      tenant_id,
      type,
      title,
      description,
      button_text,
      fields,
      display_options,
      is_active
    )
    VALUES (
      $1,
      'contact',
      'Test Contact Form',
      'Test widget',
      'Send',
      $2::jsonb,
      '{}'::jsonb,
      TRUE
    )
    RETURNING *
    `,
    [
      tenantId,
      JSON.stringify([
        {
          name: "name",
          label: "Name",
          type: "text",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
        },
      ]),
    ]
  );

  return result.rows[0];
}

export async function cleanupTenant(
  tenantId
) {
  await db.query(
    `
    DELETE FROM tenants
    WHERE id = $1
    `,
    [tenantId]
  );
}