const tenantStreams = new Map();

function writeEvent(response, event, data) {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function subscribeToTenant(tenantId, response) {
  let streams = tenantStreams.get(tenantId);

  if (!streams) {
    streams = new Set();
    tenantStreams.set(tenantId, streams);
  }

  streams.add(response);
  writeEvent(response, "connected", {
    tenantId,
    connectedAt: new Date().toISOString(),
  });

  return () => {
    streams.delete(response);

    if (streams.size === 0) {
      tenantStreams.delete(tenantId);
    }
  };
}

export function publishSubmissionCreated(submission) {
  const streams = tenantStreams.get(
    submission.tenant_id
  );

  if (!streams) {
    return 0;
  }

  const event = {
    id: submission.id,
    widgetId: submission.widget_id,
    payload: submission.payload,
    country: submission.country,
    city: submission.city,
    createdAt: submission.created_at,
  };

  for (const response of streams) {
    writeEvent(response, "submission.created", event);
  }

  return streams.size;
}
