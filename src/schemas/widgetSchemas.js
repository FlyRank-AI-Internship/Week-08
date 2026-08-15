import { z } from "zod";

const widgetFieldSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(150),
  type: z.enum([
    "text",
    "email",
    "tel",
    "textarea",
  ]),
  required: z.boolean().default(false),
});

export const createWidgetSchema = z.object({
  type: z.enum([
    "signup",
    "contact",
    "cta",
    "popover",
  ]),

  title: z.string().min(1).max(200),

  description: z
    .string()
    .max(1000)
    .optional()
    .nullable(),

  buttonText: z
    .string()
    .min(1)
    .max(100)
    .default("Submit"),

  fields: z
    .array(widgetFieldSchema)
    .max(20)
    .default([]),

  displayOptions: z
    .record(z.string(), z.unknown())
    .default({}),

  isActive: z.boolean().default(true),
});

export const updateWidgetSchema =
  createWidgetSchema.partial();