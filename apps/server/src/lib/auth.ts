import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";
import z from "zod";
import { ROLES } from "@/lib/types";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const PORT = Number(process.env.PORT || 3000);

const rawOrigins = process.env.CORS_ORIGIN || "";
export const origins = rawOrigins.includes(",")
  ? rawOrigins.split(",").map((o) => o.trim())
  : [rawOrigins];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [...origins],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => {
        // TODO: Implement sending OTP code via SMS
        console.log(`Sending OTP code ${code} to ${phoneNumber}`);
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber}@temp.com`,
        getTempName: (phoneNumber) => phoneNumber.replace("+91", ""),
      },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: `http://localhost:${PORT}`,
  logger: {
    level: "debug",
    log: (level, message, ...args) => {
      console.log(`[${level}] ${message}`, ...args);
    },
  },
  user: {
    modelName: "users",
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
  advanced: {
    defaultCookieAttributes: {
      secure: true,
      sameSite: "None",
    },
  },
  telemetry: { enabled: false },
});
