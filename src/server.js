import express from "express";

import { db } from "./db/pool.js";

import authRouter from "./routes/auth.js";
import widgetsRouter from "./routes/widgets.js";

const app = express();

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Widget Platform API running on http://localhost:${PORT}`
  );
});