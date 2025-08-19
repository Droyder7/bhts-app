import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { specialization, specializationCategories } from "@/db/schema";
import { Procedures } from "../lib/orpc";

export const createSpecializationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const idSchema = z.object({
  id: z.uuid(),
});

// UpdateSpecializationDto Schema
export const updateSpecializationSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  categoryIds: z
    .array(z.string().uuid("Invalid category ID format"))
    .optional(),
});

// SpecializationWithCategories Schema (for response validation)
export const specializationWithCategoriesSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      isActive: z.boolean(),
      isPrimary: z.boolean(),
    }),
  ),
});

const createSpecializationCategorySchema = z.object({
  specializationId: z.string().uuid(),
  categoryIds: z.array(z.string().uuid()),
});

function getSpecializationById(id: string) {
  return db.query.specialization.findFirst({
    where: eq(specialization.id, id),
    with: {
      specializationCategories: {
        columns: {
          specializationId: false,
          categoryId: false,
        },
        with: {
          category: true,
        },
      },
    },
  });
}

// const paginationSchema = z.object({
//   page: z.number().min(1).default(1),
//   limit: z.number().min(1).max(100).default(20),
//   sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
//   sortOrder: z.enum(["asc", "desc"]).default("asc"),
//   activeOnly: z.boolean().default(true),
// });

export const specializationRouter = {
  // Get all specializations with pagination and filtering
  // getAll: Procedures.public
  //   .input(paginationSchema)
  //   .handler(async ({ input }) => {

  //   }),

  // Get specialization by ID
  getById: Procedures.public
    .input(idSchema)
    .handler(async ({ input: { id } }) => {
      try {
        const result = await getSpecializationById(id);
        if (!result) return null;

        return {
          ...result,
          categories: result.specializationCategories.map(
            (item) => item.category,
          ),
        };
      } catch (error) {
        console.error("Error fetching specialization by ID:", error);
        throw new Error("Failed to fetch specialization");
      }
    }),

  // Get specializations by category
  getByCategory: Procedures.public
    .input(idSchema)
    .handler(async ({ input: { id } }) => {
      try {
        // First get the specialization IDs that belong to this category
        const specializationIds = await db
          .select({
            specializationId: specializationCategories.specializationId,
          })
          .from(specializationCategories)
          .where(eq(specializationCategories.categoryId, id));

        if (specializationIds.length === 0) {
          return [];
        }

        const ids = specializationIds.map((item) => item.specializationId);

        // Then get the specializations with all their categories
        const results = await db.query.specialization.findMany({
          where: inArray(specialization.id, ids),
          with: {
            specializationCategories: {
              with: {
                category: true,
              },
            },
          },
        });

        return results.map((spec) => ({
          ...spec,
          categories: spec.specializationCategories.map(
            (item) => item.category,
          ),
        }));
      } catch (error) {
        console.error("Error fetching specializations by category ID:", error);
        throw new Error("Failed to fetch specializations by category");
      }
    }),

  // Create new specialization
  create: Procedures.roleGuard.admin
    .input(createSpecializationSchema)
    .handler(async ({ input }) => {
      const [newSpecialization] = await db
        .insert(specialization)
        .values(input)
        .returning();

      return newSpecialization;
    }),

  // Update specialization
  update: Procedures.roleGuard.admin
    .input(updateSpecializationSchema)
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;

      const [updatedSpecialization] = await db
        .update(specialization)
        .set(updateData)
        .where(eq(specialization.id, id))
        .returning();

      if (!updatedSpecialization) {
        throw new Error("Specialization not found");
      }

      return updatedSpecialization;
    }),

  // Delete specialization
  delete: Procedures.roleGuard.admin
    .input(idSchema)
    .handler(async ({ input }) => {
      // Note: Related records in junction tables will be deleted automatically due to cascade delete
      const [deletedSpecialization] = await db
        .delete(specialization)
        .where(eq(specialization.id, input.id))
        .returning();

      if (!deletedSpecialization) {
        throw new Error("Specialization not found");
      }

      return { success: true, deletedSpecialization };
    }),

  // Add category to specialization (Protected)
  addCategory: Procedures.protected
    .input(createSpecializationCategorySchema)
    .handler(async ({ input: { specializationId, categoryIds } }) => {
      // Check if specialization exists
      const existing = await getSpecializationById(specializationId);
      if (!existing) throw new Error("Specialization not found");

      // Get existing category associations to avoid duplicates
      const existingAssociations = await db
        .select()
        .from(specializationCategories)
        .where(eq(specializationCategories.specializationId, specializationId));

      const existingCategoryIds = existingAssociations.map(
        (assoc) => assoc.categoryId,
      );
      const newCategoryIds = categoryIds.filter(
        (id) => !existingCategoryIds.includes(id),
      );

      if (newCategoryIds.length < 1) {
        throw new Error("No new categories to add");
      }

      const categoryAssociations = newCategoryIds.map((categoryId) => ({
        specializationId,
        categoryId,
      }));

      const [newRelations] = await db
        .insert(specializationCategories)
        .values(categoryAssociations)
        .returning();

      return { success: true, newRelations };
    }),

  // Remove category from specialization (Protected)
  removeCategory: Procedures.protected
    .input(createSpecializationCategorySchema)
    .handler(async ({ input }) => {
      const [deletedRelation] = await db
        .delete(specializationCategories)
        .where(
          and(
            eq(
              specializationCategories.specializationId,
              input.specializationId,
            ),
            inArray(specializationCategories.categoryId, input.categoryIds),
          ),
        )
        .returning();

      if (!deletedRelation) {
        throw new Error("Specialization-category relationship not found");
      }

      return { success: true, deletedRelation };
    }),
};

export type SpecializationRouter = typeof specializationRouter;
