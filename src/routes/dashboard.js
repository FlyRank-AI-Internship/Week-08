import express from "express";

import {
  authenticate,
} from "../middleware/authenticate.js";

import {
  getDashboardSubmissions,
  getDashboardStats,
  getDashboardWidgetStats,
} from "../services/dashboardService.js";

import {
  subscribeToTenant,
} from "../services/dashboardEventService.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/events",
  (req, res) => {
    res.status(200);
    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );
    res.setHeader(
      "Cache-Control",
      "no-cache, no-transform"
    );
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const unsubscribe = subscribeToTenant(
      req.auth.tenantId,
      res
    );

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 25000);
    heartbeat.unref();

    req.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  }
);

router.get(
  "/submissions",
  async (req, res) => {
    try {
      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 50,
          1
        ),
        100
      );

      const offset = Math.max(
        Number(req.query.offset) || 0,
        0
      );

      const items =
        await getDashboardSubmissions(
          req.auth.tenantId,
          {
            limit,
            offset,
          }
        );

      return res.status(200).json({
        items,
        limit,
        offset,
      });
    } catch (error) {
      console.error(
        "Dashboard submissions failed:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load submissions",
      });
    }
  }
);

router.get(
  "/stats",
  async (req, res) => {
    try {
      const stats =
        await getDashboardStats(
          req.auth.tenantId
        );

      return res
        .status(200)
        .json(stats);
    } catch (error) {
      console.error(
        "Dashboard stats failed:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load dashboard stats",
      });
    }
  }
);

router.get(
  "/widgets/:id/stats",
  async (req, res) => {
    try {
      const stats =
        await getDashboardWidgetStats(
          req.auth.tenantId,
          req.params.id
        );

      if (!stats) {
        return res.status(404).json({
          error: "Widget not found",
        });
      }

      return res
        .status(200)
        .json(stats);
    } catch (error) {
      console.error(
        "Widget stats failed:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load widget stats",
      });
    }
  }
);

export default router;
