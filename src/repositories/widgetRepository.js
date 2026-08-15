import { db } from "../db/pool.js";

export async function createWidget(
  tenantId,
  widget
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
      $2,
      $3,
      $4,
      $5,
      $6::jsonb,
      $7::jsonb,
      $8
    )
    RETURNING *
    `,
    [
      tenantId,
      widget.type,
      widget.title,
      widget.description ?? null,
      widget.buttonText,
      JSON.stringify(widget.fields),
      JSON.stringify(widget.displayOptions),
      widget.isActive,
    ]
  );

  return result.rows[0];
}

export async function listWidgets(tenantId) {
  const result = await db.query(
    `
    SELECT *
    FROM widgets
    WHERE tenant_id = $1
    ORDER BY created_at DESC
    `,
    [tenantId]
  );

  return result.rows;
}

export async function findWidgetById(
  tenantId,
  widgetId
) {
  const result = await db.query(
    `
    SELECT *
    FROM widgets
    WHERE id = $1
      AND tenant_id = $2
    LIMIT 1
    `,
    [
      widgetId,
      tenantId,
    ]
  );

  return result.rows[0] ?? null;
}

export async function updateWidget(
  tenantId,
  widgetId,
  updates
) {
  const existing = await findWidgetById(
    tenantId,
    widgetId
  );

  if (!existing) {
    return null;
  }

  const result = await db.query(
    `
    UPDATE widgets
    SET
      type = $3,
      title = $4,
      description = $5,
      button_text = $6,
      fields = $7::jsonb,
      display_options = $8::jsonb,
      is_active = $9,
      updated_at = NOW()
    WHERE id = $1
      AND tenant_id = $2
    RETURNING *
    `,
    [
      widgetId,
      tenantId,
      updates.type ?? existing.type,
      updates.title ?? existing.title,
      updates.description !== undefined
        ? updates.description
        : existing.description,
      updates.buttonText ??
        existing.button_text,
      JSON.stringify(
        updates.fields ?? existing.fields
      ),
      JSON.stringify(
        updates.displayOptions ??
          existing.display_options
      ),
      updates.isActive ??
        existing.is_active,
    ]
  );

  return result.rows[0];
}

export async function deleteWidget(
  tenantId,
  widgetId
) {
  const result = await db.query(
    `
    DELETE FROM widgets
    WHERE id = $1
      AND tenant_id = $2
    RETURNING id
    `,
    [
      widgetId,
      tenantId,
    ]
  );

  return result.rows[0] ?? null;
}