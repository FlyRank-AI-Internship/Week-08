import { db } from "../db/pool.js";

export async function findPublicWidgetById(widgetId) {
  const result = await db.query(
    `
    SELECT
      id,
      tenant_id,
      type,
      title,
      description,
      button_text,
      fields,
      display_options,
      is_active
    FROM widgets
    WHERE id = $1
      AND is_active = TRUE
    LIMIT 1
    `,
    [widgetId]
  );

  return result.rows[0] ?? null;
}