import { relations } from "drizzle-orm";
import { user } from "./auth";
import { category } from "./category";
import { expert } from "./expert";
import {
  expertSpecializations,
  specializationCategories,
} from "./junction-tables";
import { specialization } from "./specialization";

// Expert to User relation (one-to-one)
export const expertRelations = relations(expert, ({ one, many }) => ({
  user: one(user, {
    fields: [expert.userId],
    references: [user.id],
  }),
  expertSpecializations: many(expertSpecializations),
}));

// User to Expert relation (one-to-one)
export const userRelations = relations(user, ({ one }) => ({
  expert: one(expert, {
    fields: [user.id],
    references: [expert.userId],
  }),
}));

// Specialization to Expert via expert_specializations (many-to-many)
export const specializationRelations = relations(
  specialization,
  ({ many }) => ({
    expertSpecializations: many(expertSpecializations),
    specializationCategories: many(specializationCategories),
  }),
);

// Category to Specialization via specialization_categories (many-to-many)
// Also includes self-referential parent-child relationship
export const categoryRelations = relations(category, ({ one, many }) => ({
  specializationCategories: many(specializationCategories),
  // Parent category relation (many-to-one)
  parent: one(category, {
    fields: [category.parentCategoryId],
    references: [category.id],
    relationName: "parentChild",
  }),
  // Child categories relation (one-to-many)
  children: many(category, {
    relationName: "parentChild",
  }),
}));

// Junction table relations for expert_specializations
export const expertSpecializationsRelations = relations(
  expertSpecializations,
  ({ one }) => ({
    expert: one(expert, {
      fields: [expertSpecializations.expertId],
      references: [expert.id],
    }),
    specialization: one(specialization, {
      fields: [expertSpecializations.specializationId],
      references: [specialization.id],
    }),
  }),
);

// Junction table relations for specialization_categories
export const specializationCategoriesRelations = relations(
  specializationCategories,
  ({ one }) => ({
    specialization: one(specialization, {
      fields: [specializationCategories.specializationId],
      references: [specialization.id],
    }),
    category: one(category, {
      fields: [specializationCategories.categoryId],
      references: [category.id],
    }),
  }),
);
