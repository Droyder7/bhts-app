import { boolean, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./schema/auth";

export const timeStamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export type Gender = "male" | "female" | "other";

export const gender = text("gender").$type<Gender>();

export const id = uuid("id").defaultRandom().primaryKey();

export const userId = text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" });

export const isActive = boolean("is_active").notNull().default(true);
