import express from "express";

import { authenticate } from "../middleware/authenticate.js";

import {
  createWidgetSchema,
  updateWidgetSchema,
} from "../schemas/widgetSchemas.js";

import {
  createTenantWidget,
  getTenantWidgets,
  getTenantWidget,
  updateTenantWidget,
  deleteTenantWidget,
  generateEmbedSnippet,
} from "../services/widgetService.js";

const router = express.Router();

router.use(authenticate);

// CREATE
router.post("/", async (req, res) => {
  const validation =
    createWidgetSchema.safeParse(req.body);

  if (!validation.success) {
    const issue =
      validation.error.issues[0];

    return res.status(400).json({
      error: "Invalid request",
      field: issue.path.join("."),
      message: issue.message,
    });
  }

  try {
    const widget =
      await createTenantWidget(
        req.auth.tenantId,
        validation.data
      );

    return res.status(201).json(widget);
  } catch (error) {
    console.error(
      "Create widget failed:",
      error
    );

    return res.status(500).json({
      error: "Unable to create widget",
    });
  }
});

// LIST
router.get("/", async (req, res) => {
  try {
    const widgets =
      await getTenantWidgets(
        req.auth.tenantId
      );

    return res.status(200).json({
      items: widgets,
    });
  } catch (error) {
    console.error(
      "List widgets failed:",
      error
    );

    return res.status(500).json({
      error: "Unable to load widgets",
    });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  const widget = await getTenantWidget(
    req.auth.tenantId,
    req.params.id
  );

  if (!widget) {
    return res.status(404).json({
      error: "Widget not found",
    });
  }

  return res.status(200).json(widget);
});

// UPDATE
router.patch("/:id", async (req, res) => {
  const validation =
    updateWidgetSchema.safeParse(req.body);

  if (!validation.success) {
    const issue =
      validation.error.issues[0];

    return res.status(400).json({
      error: "Invalid request",
      field: issue.path.join("."),
      message: issue.message,
    });
  }

  const widget =
    await updateTenantWidget(
      req.auth.tenantId,
      req.params.id,
      validation.data
    );

  if (!widget) {
    return res.status(404).json({
      error: "Widget not found",
    });
  }

  return res.status(200).json(widget);
});

// EMBED SNIPPET
router.get("/:id/embed", async (req, res) => {
  const widget = await getTenantWidget(
    req.auth.tenantId,
    req.params.id
  );

  if (!widget) {
    return res.status(404).json({
      error: "Widget not found",
    });
  }

  const baseUrl =
    `${req.protocol}://${req.get("host")}`;

  return res.status(200).json({
    widgetId: widget.id,
    snippet: generateEmbedSnippet(
      widget.id,
      baseUrl
    ),
  });
});

// DELETE
router.delete("/:id", async (req, res) => {
  const deleted =
    await deleteTenantWidget(
      req.auth.tenantId,
      req.params.id
    );

  if (!deleted) {
    return res.status(404).json({
      error: "Widget not found",
    });
  }

  return res.status(204).send();
});

export default router;