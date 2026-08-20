import {
  findPublicWidgetById,
} from "../repositories/publicWidgetRepository.js";

import {
  createSubmission,
} from "../repositories/submissionRepository.js";

import {
  validateAgainstWidgetFields,
} from "./submissionValidationService.js";

import {
  detectSpam,
} from "./spamService.js";

import {
  enrichIp,
} from "./geoService.js";

import {
  sendSubmissionNotification,
} from "./sideEffectService.js";

import {
  publishSubmissionCreated,
} from "./dashboardEventService.js";

export async function handlePublicSubmission({
  widgetId,
  body,
  ipAddress,
  userAgent,
  idempotencyKey,
}) {
  const widget =
    await findPublicWidgetById(widgetId);

  if (!widget) {
    return {
      status: 404,
      body: {
        error: "Widget not found",
      },
    };
  }

  const spamResult = detectSpam(body);

  if (spamResult.spam) {
    return {
      status: 202,
      body: {
        accepted: true,
      },
    };
  }

  const fieldValidation =
    validateAgainstWidgetFields(
      widget.fields,
      body.data
    );

  if (!fieldValidation.valid) {
    return {
      status: 400,
      body: {
        error: "Invalid submission",
        fields: fieldValidation.errors,
      },
    };
  }

  // Geo enrichment is allowed to degrade.
  const geo = await enrichIp(ipAddress);

  const submission =
    await createSubmission({
      widgetId: widget.id,
      tenantId: widget.tenant_id,
      payload: body.data,
      ipAddress,
      country: geo.country,
      city: geo.city,
      userAgent,
      isSpam: false,
      idempotencyKey,
    });

  if (!submission && idempotencyKey) {
    return {
      status: 200,
      body: {
        accepted: true,
        duplicate: true,
      },
    };
  }

  // Notify only the owning tenant after durable storage.
  publishSubmissionCreated(submission);

  // Important:
  // side effect happens AFTER durable storage.
  try {
    await sendSubmissionNotification({
      submission,
      widget,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "side_effect_failure",
        submissionId: submission.id,
        error: error.message,
      })
    );

    // Deliberately do NOT throw.
  }

  return {
    status: 201,
    body: {
      accepted: true,
      submissionId: submission.id,
    },
  };
}
