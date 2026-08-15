import express from "express";

import { db } from "./db/pool.js";

import authRouter from "./routes/auth.js";
import widgetsRouter from "./routes/widgets.js";
import publicSubmissionsRouter
  from "./routes/publicSubmissions.js";

const app = express();

app.use(
  express.json({
    limit: "20kb",
  })
);
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

  next(err);
});
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error(
      "Health check failed:",
      error
    );

    return res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/widgets", widgetsRouter);
app.use(
  "/api/public",
  publicSubmissionsRouter
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Widget Platform API running on http://localhost:${PORT}`
  );
});