import { relations, sql } from "drizzle-orm";
import {
  check,
  decimal,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { gender, id, timeStamps, userId } from "../common";
import { user } from "./auth";
import { specializations } from "./categories";

export interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  description: string;
  skills: string[];
  employment_type: "full-time" | "part-time" | "contract" | "freelance";
  is_current: boolean;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface PaymentAccount {
  account_type: "bank" | "upi";
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  branch_name?: string;
  upi_id?: string;
  account_holder_name: string;
  is_verified: boolean;
}

export type Language = "hindi" | "english";

export type Interest = "music" | "art" | "sports" | "technology" | "other";

export type AccountStatus = "active" | "inactive" | "suspended";

export type VerificationStatus = "pending" | "verified" | "rejected";

export const customers = pgTable(
  "customers",
  {
    id,
    userId,
    gender,
    address: text("address"),
    examPreferences: text("exam_preferences").array(),
    interestPreferences: text("interest_preferences")
      .$type<Interest[]>()
      .array(),
    accountStatus: text("account_status").notNull().default("active"),
    lastLogin: timestamp("last_login"),
    ...timeStamps,
  },
  (table) => [index("customers_user_id_idx").on(table.userId)],
);

export const experts = pgTable(
  "experts",
  {
    id,
    userId,
    firstName: text("first_name"),
    lastName: text("last_name"),
    dob: text("dob"),
    gender,
    state: text("state"),
    city: text("city"),
    pinCode: text("pin_code"),
    bio: text("bio"),
    demoVideoUrl: text("demo_video_url"),
    skills: text("skills").array(),
    languages: text("languages").array().$type<Language[]>(),
    socialMediaLinks: json("social_media_links").$type<SocialMediaLink[]>(),
    experiences: json("experiences").$type<Experience[]>(),
    paymentAccount: json("payment_account").$type<PaymentAccount>(),
    accountStatus: text("account_status")
      .notNull()
      .$type<AccountStatus>()
      .default("active"),
    verificationStatus: text("verification_status")
      .notNull()
      .$type<VerificationStatus>()
      .default("pending"),
    totalSessions: integer("total_sessions").default(0),
    perHourRate: decimal("per_hour_rate", { precision: 10, scale: 2 }),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
    lastLogin: timestamp("last_login"),
    ...timeStamps,
  },
  (table) => [
    index("experts_user_id_idx").on(table.userId),
    check(
      "average_rating_check",
      sql`${table.averageRating} >= 0 AND ${table.averageRating} <= 5`,
    ),
    check("per_hour_rate_check", sql`${table.perHourRate} >= 0`),
  ],
);

export const expertsRelations = relations(experts, ({ one, many }) => ({
  user: one(user, {
    fields: [experts.userId],
    references: [user.id],
  }),
  specializations: many(specializations),
}));
