import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import z from "zod";
import { ROLES } from "@/lib/types";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  logger: {
    level: "debug",
    log: (level, message, ...args) => {
      console.log(`[${level}] ${message}`, ...args);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        required: true,
        defaultValue: ROLES[0],
        validator: {
          input: z.enum(ROLES),
          output: z.enum(ROLES),
        },
      },
    },
  },
});
