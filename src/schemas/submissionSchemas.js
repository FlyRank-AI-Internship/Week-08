import { z } from "zod";

export const publicSubmissionSchema = z.object({
  data: z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
    ])
  ),

  // Hidden field for honeypot spam detection.
  website: z
    .string()
    .max(200)
    .optional()
    .default(""),

  idempotencyKey: z
    .string()
    .min(8)
    .max(255)
    .optional(),
});