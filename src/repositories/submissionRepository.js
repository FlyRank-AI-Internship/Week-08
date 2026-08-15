import { db } from "../db/pool.js";

export async function createSubmission({
  widgetId,
  tenantId,
  payload,
  ipAddress,
  country,
  city,
  userAgent,
  isSpam,
  idempotencyKey,
}) {
  const result = await db.query(
    `
    INSERT INTO submissions (
      widget_id,
      tenant_id,
      payload,
      ip_address,
      country,
      city,
      user_agent,
      is_spam,
      idempotency_key
    )
    VALUES (
      $1,
      $2,
      $3::jsonb,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9
    )
    ON CONFLICT (widget_id, idempotency_key)
      WHERE idempotency_key IS NOT NULL
    DO NOTHING
    RETURNING *
    `,
    [
      widgetId,
      tenantId,
      JSON.stringify(payload),
      ipAddress,
      country ?? null,
      city ?? null,
      userAgent,
      isSpam,
      idempotencyKey ?? null,
    ]
  );

  return result.rows[0] ?? null;
}