import {
  listTenantSubmissions,
  getTenantSummaryStats,
  getTenantWidgetStats,
  getTenantGeoStats,
  getTenantDailyStats,
  getWidgetStatsById,
} from "../repositories/dashboardRepository.js";

export async function getDashboardSubmissions(
  tenantId,
  options
) {
  return listTenantSubmissions(
    tenantId,
    options
  );
}

export async function getDashboardStats(
  tenantId
) {
  const [
    summary,
    widgets,
    geo,
    daily,
  ] = await Promise.all([
    getTenantSummaryStats(tenantId),
    getTenantWidgetStats(tenantId),
    getTenantGeoStats(tenantId),
    getTenantDailyStats(tenantId),
  ]);

  return {
    summary,
    widgets,
    geo,
    daily,
  };
}

export async function getDashboardWidgetStats(
  tenantId,
  widgetId
) {
  return getWidgetStatsById(
    tenantId,
    widgetId
  );
}