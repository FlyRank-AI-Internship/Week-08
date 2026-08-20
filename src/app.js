import express from "express";

import { db } from "./db/pool.js";

import authRouter from "./routes/auth.js";
import widgetsRouter from "./routes/widgets.js";
import publicWidgetsRouter from "./routes/publicWidgets.js";
import publicSubmissionsRouter from "./routes/publicSubmissions.js";
import dashboardRouter from "./routes/dashboard.js";

export const app = express();

app.use(
  express.json({
    limit: "20kb",
  })
);

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    return res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

// Versioned public asset
app.get("/widget.v1.js", (req, res) => {
  res.setHeader(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  return res.sendFile("widget.v1.js", {
    root: process.cwd() + "/public",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/widgets", widgetsRouter);

app.use(
  "/api/public",
  publicWidgetsRouter
);

app.use(
  "/api/public",
  publicSubmissionsRouter
);

app.use(
  "/api/dashboard",
  dashboardRouter
);

// Error handling
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      error: "Payload too large",
    });
  }

  if (
    err instanceof SyntaxError &&
    err.status === 400
  ) {
    return res.status(400).json({
      error: "Invalid JSON",
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    error: "Internal server error",
  });
});

app.get("/demo/dashboard", (req, res) => {
  return res.sendFile("dashboard.html", {
    root: process.cwd() + "/test-site",
  });
});
