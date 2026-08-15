import express from "express";
import cors from "cors";

import {
  publicSubmissionSchema,
} from "../schemas/submissionSchemas.js";

import {
  publicCorsOptions,
} from "../config/cors.js";

import {
  submissionRateLimit,
} from "../middleware/submissionRateLimit.js";

import {
  handlePublicSubmission,
} from "../services/submissionService.js";

const router = express.Router();

router.options(
  "/widgets/:id/submissions",
  cors(publicCorsOptions)
);

router.post(
  "/widgets/:id/submissions",
  cors(publicCorsOptions),
  submissionRateLimit,
  async (req, res) => {
    const validation =
      publicSubmissionSchema.safeParse(req.body);

    if (!validation.success) {
      const issue =
        validation.error.issues[0];

      return res.status(400).json({
        error: "Invalid request",
        field:
          issue.path.join(".") || "body",
        message: issue.message,
      });
    }

    try {
      const result =
        await handlePublicSubmission({
          widgetId: req.params.id,

          body: validation.data,

          ipAddress:
            req.ip ||
            req.socket.remoteAddress,

          userAgent:
            req.get("user-agent") ?? null,

          idempotencyKey:
            req.get("Idempotency-Key") ??
            validation.data.idempotencyKey,
        });

      return res
        .status(result.status)
        .json(result.body);
    } catch (error) {
      console.error(
        "Public submission failed:",
        error
      );

      return res.status(500).json({
        error: "Unable to process submission",
      });
    }
  }
);

export default router;