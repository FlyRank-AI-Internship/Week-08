import {
  createWidget,
  listWidgets,
  findWidgetById,
  updateWidget,
  deleteWidget,
} from "../repositories/widgetRepository.js";

export async function createTenantWidget(
  tenantId,
  data
) {
  return createWidget(tenantId, data);
}

export async function getTenantWidgets(
  tenantId
) {
  return listWidgets(tenantId);
}

export async function getTenantWidget(
  tenantId,
  widgetId
) {
  return findWidgetById(
    tenantId,
    widgetId
  );
}

export async function updateTenantWidget(
  tenantId,
  widgetId,
  updates
) {
  return updateWidget(
    tenantId,
    widgetId,
    updates
  );
}

export async function deleteTenantWidget(
  tenantId,
  widgetId
) {
  return deleteWidget(
    tenantId,
    widgetId
  );
}

export function generateEmbedSnippet(
  widgetId,
  baseUrl
) {
  return `<script src="${baseUrl}/widget.v1.js?id=${widgetId}"></script>`;
}