import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),

  ACCESS_SECRET: z
    .string()
    .min(32, "ACCESS_SECRET must be at least 32 characters"),
  REFRESH_SECRET: z
    .string()
    .min(32, "REFRESH_SECRET must be at least 32 characters"),
  PEPPER: z.string().min(32, "PEPPER must be at least 32 characters long"),

  DATABASE_URL: z.string().url(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
