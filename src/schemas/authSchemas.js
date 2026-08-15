import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("A valid email address is required"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters"),
});