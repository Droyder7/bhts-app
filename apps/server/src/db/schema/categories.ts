import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timeStamps } from "../common";
import { experts } from "./profiles";

export const categories = pgTable("categories", {
  id,
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: uuid("parent_category_id"),
  isActive: boolean("is_active").notNull().default(true),
  isPrimary: boolean("is_primary").notNull().default(false),
  ...timeStamps,
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
    relationName: "CategoryParent",
  }),
  children: many(categories, {
    relationName: "CategoryParent",
  }),
}));

export const specializations = pgTable(
  "specializations",
  {
    id,
    expertId: uuid("expert_id")
      .notNull()
      .references(() => experts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(false),
    ...timeStamps,
  },
  (table) => [
    index("specializations_expert_idx").on(table.expertId),
    index("specializations_category_idx").on(table.categoryId),
  ],
);

export const specializationsRelations = relations(
  specializations,
  ({ one }) => ({
    expert: one(experts, {
      fields: [specializations.expertId],
      references: [experts.id],
    }),
    category: one(categories, {
      fields: [specializations.categoryId],
      references: [categories.id],
    }),
  }),
);
