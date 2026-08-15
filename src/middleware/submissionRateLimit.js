import rateLimit from "express-rate-limit";

export const submissionRateLimit = rateLimit({
  windowMs: 60 * 1000,

  // For development/testing.
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error: "Too many submissions",
    message:
      "Too many requests. Please try again later.",
  },
});