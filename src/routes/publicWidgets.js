import express from "express";
import cors from "cors";

import {
  findPublicWidgetById,
} from "../repositories/publicWidgetRepository.js";

import {
  publicCorsOptions,
} from "../config/cors.js";

const router = express.Router();

router.get(
  "/widgets/:id/config",
  cors(publicCorsOptions),
  async (req, res) => {
    try {
      const widget = await findPublicWidgetById(
        req.params.id
      );

      if (!widget) {
        return res.status(404).json({
          error: "Widget not found",
        });
      }

      // Config changes may happen, so short cache.
      res.setHeader(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300"
      );

      return res.status(200).json({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        description: widget.description,
        buttonText: widget.button_text,
        fields: widget.fields,
        displayOptions:
          widget.display_options,
      });
    } catch (error) {
      console.error(
        "Public widget config failed:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load widget configuration",
      });
    }
  }
);

export default router;