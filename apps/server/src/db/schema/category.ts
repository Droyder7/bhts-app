import {
  type AnyPgColumn,
  boolean,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { id, isActive, timeStamps } from "../common";

export const category = pgTable("category", {
  id,
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive,
  isPrimary: boolean("is_primary").notNull().default(false),
  parentCategoryId: uuid("parent_category_id").references(
    (): AnyPgColumn => category.id,
  ),
  ...timeStamps,
});
