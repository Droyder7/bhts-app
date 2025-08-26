import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { gender, id, timeStamps, userId } from "../common";

export type Interest = "music" | "art" | "sports" | "technology" | "other";

export const customer = pgTable(
  "customer",
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
