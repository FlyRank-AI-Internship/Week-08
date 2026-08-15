import express from "express";

import { loginSchema } from "../schemas/authSchemas.js";
import { loginUser } from "../services/authService.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    const issue = validation.error.issues[0];

    return res.status(400).json({
      error: "Invalid request",
      field: issue.path.join("."),
      message: issue.message,
    });
  }

  try {
    const result = await loginUser(validation.data);

    if (!result) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      error: "Unable to login",
    });
  }
});

export default router;