import { pgTable, text } from "drizzle-orm/pg-core";
import { id, isActive, timeStamps } from "../common";

export const specialization = pgTable("specialization", {
  id,
  isActive,
  name: text("name").notNull().unique(),
  description: text("description"),
  ...timeStamps,
});
