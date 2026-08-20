import { db } from "../db/pool.js";

export async function listTenantSubmissions(
  tenantId,
  { limit = 50, offset = 0 } = {}
) {
  const result = await db.query(
    `
    SELECT
      s.id,
      s.widget_id,
      w.title AS widget_title,
      s.payload,
      s.country,
      s.city,
      s.created_at
    FROM submissions s
    JOIN widgets w
      ON w.id = s.widget_id
    WHERE s.tenant_id = $1
      AND w.tenant_id = $1
    ORDER BY s.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [
      tenantId,
      limit,
      offset,
    ]
  );

  return result.rows;
}

export async function getTenantSummaryStats(
  tenantId
) {
  const result = await db.query(
    `
    SELECT
      COUNT(*)::int AS total_submissions,
      COUNT(DISTINCT widget_id)::int
        AS widgets_with_submissions,

      COUNT(*) FILTER (
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      )::int AS last_24_hours,

      COUNT(*) FILTER (
        WHERE created_at >= NOW() - INTERVAL '7 days'
      )::int AS last_7_days

    FROM submissions
    WHERE tenant_id = $1
    `,
    [tenantId]
  );

  return result.rows[0];
}

export async function getTenantWidgetStats(
  tenantId
) {
  const result = await db.query(
    `
    SELECT
      w.id AS widget_id,
      w.title,
      w.type,

      COUNT(s.id)::int
        AS submission_count,

      MAX(s.created_at)
        AS latest_submission_at

    FROM widgets w

    LEFT JOIN submissions s
      ON s.widget_id = w.id
      AND s.tenant_id = $1

    WHERE w.tenant_id = $1

    GROUP BY
      w.id,
      w.title,
      w.type

    ORDER BY submission_count DESC
    `,
    [tenantId]
  );

  return result.rows;
}

export async function getTenantGeoStats(
  tenantId
) {
  const result = await db.query(
    `
    SELECT
      COALESCE(country, 'Unknown')
        AS country,

      COUNT(*)::int
        AS submission_count

    FROM submissions

    WHERE tenant_id = $1

    GROUP BY
      COALESCE(country, 'Unknown')

    ORDER BY submission_count DESC
    `,
    [tenantId]
  );

  return result.rows;
}

export async function getTenantDailyStats(
  tenantId
) {
  const result = await db.query(
    `
    SELECT
      DATE(created_at) AS date,
      COUNT(*)::int AS submission_count

    FROM submissions

    WHERE tenant_id = $1
      AND created_at >= NOW() - INTERVAL '30 days'

    GROUP BY DATE(created_at)

    ORDER BY date ASC
    `,
    [tenantId]
  );

  return result.rows;
}

export async function getWidgetStatsById(
  tenantId,
  widgetId
) {
  const result = await db.query(
    `
    SELECT
      w.id AS widget_id,
      w.title,
      w.type,

      COUNT(s.id)::int
        AS submission_count,

      COUNT(s.id) FILTER (
        WHERE s.created_at >= NOW() - INTERVAL '24 hours'
      )::int AS last_24_hours,

      COUNT(s.id) FILTER (
        WHERE s.created_at >= NOW() - INTERVAL '7 days'
      )::int AS last_7_days,

      MAX(s.created_at)
        AS latest_submission_at

    FROM widgets w

    LEFT JOIN submissions s
      ON s.widget_id = w.id
      AND s.tenant_id = $1

    WHERE w.id = $2
      AND w.tenant_id = $1

    GROUP BY
      w.id,
      w.title,
      w.type
    `,
    [
      tenantId,
      widgetId,
    ]
  );

  return result.rows[0] ?? null;
}