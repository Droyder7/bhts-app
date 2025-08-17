import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, specializations } from "@/db/schema";
import { Procedures } from "../lib/orpc";

// Input validation schemas
const createSpecializationSchema = z.object({
  expertId: z.string().uuid(),
  categoryId: z.string().uuid(),
  isPrimary: z.boolean().default(false),
});

const updateSpecializationSchema = z.object({
  id: z.string().uuid(),
  isPrimary: z.boolean().optional(),
});

const specializationIdSchema = z.object({
  id: z.string().uuid(),
});

const expertSpecializationsSchema = z.object({
  expertId: z.string().uuid(),
});

const categorySpecializationsSchema = z.object({
  categoryId: z.string().uuid(),
});

export const specializationRouter = {
  // Get all specializations for an expert
  getByExpert: Procedures.public
    .input(expertSpecializationsSchema)
    .handler(async ({ input }) => {
      const expertSpecializations = await db.query.specializations.findMany({
        where: eq(specializations.expertId, input.expertId),
        with: {
          category: {
            with: {
              parent: true,
            },
          },
        },
        orderBy: [
          desc(specializations.isPrimary),
          asc(specializations.createdAt),
        ],
      });

      return expertSpecializations;
    }),

  // Get all specializations for a category
  getByCategory: Procedures.public
    .input(categorySpecializationsSchema)
    .handler(async ({ input }) => {
      const categorySpecializations = await db.query.specializations.findMany({
        where: eq(specializations.categoryId, input.categoryId),
        with: {
          expert: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          category: true,
        },
        orderBy: [
          desc(specializations.isPrimary),
          asc(specializations.createdAt),
        ],
      });

      return categorySpecializations;
    }),

  // Get specialization by ID
  getById: Procedures.public
    .input(specializationIdSchema)
    .handler(async ({ input }) => {
      const specialization = await db.query.specializations.findFirst({
        where: eq(specializations.id, input.id),
        with: {
          expert: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          category: {
            with: {
              parent: true,
            },
          },
        },
      });

      if (!specialization) {
        throw new Error("Specialization not found");
      }

      return specialization;
    }),

  // Get all specializations with pagination
  getAll: Procedures.public
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        expertId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { page, limit, expertId, categoryId, isPrimary } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];
      if (expertId) {
        whereConditions.push(eq(specializations.expertId, expertId));
      }
      if (categoryId) {
        whereConditions.push(eq(specializations.categoryId, categoryId));
      }
      if (isPrimary !== undefined) {
        whereConditions.push(eq(specializations.isPrimary, isPrimary));
      }

      const [specializationsData, totalCount] = await Promise.all([
        db.query.specializations.findMany({
          where:
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          limit,
          offset,
          with: {
            expert: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
            category: {
              with: {
                parent: true,
              },
            },
          },
          orderBy: [
            desc(specializations.isPrimary),
            asc(specializations.createdAt),
          ],
        }),
        db.$count(
          specializations,
          whereConditions.length > 0 ? and(...whereConditions) : undefined,
        ),
      ]);

      return {
        specializations: specializationsData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Create specialization (Protected - experts can add their own)
  create: Procedures.protected
    .input(createSpecializationSchema)
    .handler(async ({ input }) => {
      // Verify category exists and is active
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.categoryId),
          eq(categories.isActive, true),
        ),
      });

      if (!category) {
        throw new Error("Category not found or inactive");
      }

      // Check if specialization already exists
      const existingSpecialization = await db.query.specializations.findFirst({
        where: and(
          eq(specializations.expertId, input.expertId),
          eq(specializations.categoryId, input.categoryId),
        ),
      });

      if (existingSpecialization) {
        throw new Error("Specialization already exists");
      }

      // If this is marked as primary, unset other primary specializations
      if (input.isPrimary) {
        await db
          .update(specializations)
          .set({ isPrimary: false })
          .where(
            and(
              eq(specializations.expertId, input.expertId),
              eq(specializations.isPrimary, true),
            ),
          );
      }

      const [newSpecialization] = await db
        .insert(specializations)
        .values(input)
        .returning();

      return newSpecialization;
    }),

  // Update specialization (Protected)
  update: Procedures.protected
    .input(updateSpecializationSchema)
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;

      // If setting as primary, get the expert ID first
      if (updateData.isPrimary) {
        const currentSpecialization = await db.query.specializations.findFirst({
          where: eq(specializations.id, id),
        });

        if (!currentSpecialization) {
          throw new Error("Specialization not found");
        }

        // Unset other primary specializations for this expert
        await db
          .update(specializations)
          .set({ isPrimary: false })
          .where(
            and(
              eq(specializations.expertId, currentSpecialization.expertId),
              eq(specializations.isPrimary, true),
            ),
          );
      }

      const [updatedSpecialization] = await db
        .update(specializations)
        .set(updateData)
        .where(eq(specializations.id, id))
        .returning();

      if (!updatedSpecialization) {
        throw new Error("Specialization not found");
      }

      return updatedSpecialization;
    }),

  // Delete specialization (Protected)
  delete: Procedures.protected
    .input(specializationIdSchema)
    .handler(async ({ input }) => {
      const [deletedSpecialization] = await db
        .delete(specializations)
        .where(eq(specializations.id, input.id))
        .returning();

      if (!deletedSpecialization) {
        throw new Error("Specialization not found");
      }

      return { success: true, deletedSpecialization };
    }),

  // Set primary specialization for an expert
  setPrimary: Procedures.protected
    .input(specializationIdSchema)
    .handler(async ({ input }) => {
      // Get the specialization to find the expert ID
      const specialization = await db.query.specializations.findFirst({
        where: eq(specializations.id, input.id),
      });

      if (!specialization) {
        throw new Error("Specialization not found");
      }

      // Unset all primary specializations for this expert
      await db
        .update(specializations)
        .set({ isPrimary: false })
        .where(eq(specializations.expertId, specialization.expertId));

      // Set this specialization as primary
      const [updatedSpecialization] = await db
        .update(specializations)
        .set({ isPrimary: true })
        .where(eq(specializations.id, input.id))
        .returning();

      return updatedSpecialization;
    }),

  // Get primary specialization for an expert
  getPrimaryByExpert: Procedures.public
    .input(expertSpecializationsSchema)
    .handler(async ({ input }) => {
      const primarySpecialization = await db.query.specializations.findFirst({
        where: and(
          eq(specializations.expertId, input.expertId),
          eq(specializations.isPrimary, true),
        ),
        with: {
          category: {
            with: {
              parent: true,
            },
          },
        },
      });

      return primarySpecialization;
    }),
};

export type SpecializationRouter = typeof specializationRouter;
