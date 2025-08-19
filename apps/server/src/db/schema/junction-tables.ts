import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { category } from "./category";
import { expert } from "./expert";
import { specialization } from "./specialization";

export const specializationCategories = pgTable(
  "specialization_categories",
  {
    specializationId: uuid("specialization_id")
      .notNull()
      .references(() => specialization.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.specializationId, t.categoryId] }),
    index("specialization_categories_specialization_id_idx").on(
      t.specializationId,
    ),
    index("specialization_categories_category_id_idx").on(t.categoryId),
  ],
);

export const expertSpecializations = pgTable(
  "expert_specializations",
  {
    expertId: uuid("expert_id")
      .notNull()
      .references(() => expert.id, { onDelete: "cascade" }),
    specializationId: uuid("specialization_id")
      .notNull()
      .references(() => specialization.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.expertId, t.specializationId] }),
    index("expert_specializations_expert_id_idx").on(t.expertId),
    index("expert_specializations_specialization_id_idx").on(
      t.specializationId,
    ),
  ],
);
