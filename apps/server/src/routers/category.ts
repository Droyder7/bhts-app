import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, specializations } from "@/db/schema";
import { Procedures } from "../lib/orpc";

// Input validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  parentCategoryId: z.string().uuid().optional(),
  isPrimary: z.boolean().default(false),
});

const updateCategorySchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().optional(),
  parentCategoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
});

const categoryIdSchema = z.object({
  id: z.uuid(),
});

const parentCategorySchema = z.object({
  parentId: z.string().uuid(),
  activeOnly: z.boolean().default(true),
});

const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  parentId: z.string().uuid().optional(),
  activeOnly: z.boolean().default(true),
});

export const categoryRouter = {
  // Get all categories with pagination and filtering
  getAll: Procedures.public
    .input(paginationSchema)
    .handler(async ({ input }) => {
      const { page, limit, sortBy, sortOrder, parentId, activeOnly } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];
      if (activeOnly) {
        whereConditions.push(eq(categories.isActive, true));
      }
      if (parentId !== undefined) {
        whereConditions.push(
          parentId === null
            ? isNull(categories.parentCategoryId)
            : eq(categories.parentCategoryId, parentId),
        );
      }

      // Build order by
      const orderBy =
        sortOrder === "desc"
          ? desc(categories[sortBy])
          : asc(categories[sortBy]);

      const [categoriesData, totalCount] = await Promise.all([
        db.query.categories.findMany({
          where:
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          orderBy,
          limit,
          offset,
          with: {
            parent: true,
            children: {
              where: activeOnly ? eq(categories.isActive, true) : undefined,
            },
          },
        }),
        db.$count(
          categories,
          whereConditions.length > 0 ? and(...whereConditions) : undefined,
        ),
      ]);

      return {
        categories: categoriesData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Get category by ID
  getById: Procedures.public
    .input(categoryIdSchema)
    .handler(async ({ input }) => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.id, input.id),
        with: {
          parent: true,
          children: {
            where: eq(categories.isActive, true),
          },
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    }),

  // Get root categories (categories without parent)
  getRootCategories: Procedures.public.handler(async () => {
    const rootCategories = await db.query.categories.findMany({
      where: and(
        isNull(categories.parentCategoryId),
        eq(categories.isActive, true),
      ),
      orderBy: asc(categories.name),
      with: {
        children: {
          where: eq(categories.isActive, true),
          orderBy: asc(categories.name),
        },
      },
    });

    return rootCategories;
  }),

  // Get all categories by parent ID
  getAllByParent: Procedures.public
    .input(parentCategorySchema)
    .handler(async ({ input }) => {
      const { parentId, activeOnly } = input;

      // Build where conditions
      const whereConditions = [eq(categories.parentCategoryId, parentId)];
      if (activeOnly) {
        whereConditions.push(eq(categories.isActive, true));
      }

      const childCategories = await db.query.categories.findMany({
        where: and(...whereConditions),
        orderBy: asc(categories.name),
        with: {
          parent: true,
          children: {
            where: activeOnly ? eq(categories.isActive, true) : undefined,
            orderBy: asc(categories.name),
          },
        },
      });

      return childCategories;
    }),

  // Create new category (Admin only)
  create: Procedures.roleGuard.admin
    .input(createCategorySchema)
    .handler(async ({ input }) => {
      // Validate parent category exists if provided
      if (input.parentCategoryId) {
        const parentExists = await db.query.categories.findFirst({
          where: eq(categories.id, input.parentCategoryId),
        });
        if (!parentExists) {
          throw new Error("Parent category not found");
        }
      }

      const [newCategory] = await db
        .insert(categories)
        .values(input)
        .returning();

      return newCategory;
    }),

  // Update category (Admin only)
  update: Procedures.roleGuard.admin
    .input(updateCategorySchema)
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;

      // Validate parent category exists if provided
      if (updateData.parentCategoryId) {
        const parentExists = await db.query.categories.findFirst({
          where: eq(categories.id, updateData.parentCategoryId),
        });
        if (!parentExists) {
          throw new Error("Parent category not found");
        }

        // Prevent circular reference
        if (updateData.parentCategoryId === id) {
          throw new Error("Category cannot be its own parent");
        }
      }

      const [updatedCategory] = await db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory) {
        throw new Error("Category not found");
      }

      return updatedCategory;
    }),

  // Delete category (Admin only)
  delete: Procedures.roleGuard.admin
    .input(categoryIdSchema)
    .handler(async ({ input }) => {
      // Check if category has children
      const hasChildren = await db.query.categories.findFirst({
        where: eq(categories.parentCategoryId, input.id),
      });

      if (hasChildren) {
        throw new Error("Cannot delete category with subcategories");
      }

      // Check if category has specializations
      const hasSpecializations = await db.query.specializations.findFirst({
        where: eq(specializations.categoryId, input.id),
      });

      if (hasSpecializations) {
        throw new Error("Cannot delete category with active specializations");
      }

      const [deletedCategory] = await db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning();

      if (!deletedCategory) {
        throw new Error("Category not found");
      }

      return { success: true, deletedCategory };
    }),

  // Get categories with expert count
  getCategoriesWithExpertCount: Procedures.public.handler(async () => {
    const categoriesWithCount = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        parentCategoryId: categories.parentCategoryId,
        isActive: categories.isActive,
        isPrimary: categories.isPrimary,
        expertCount: db.$count(
          specializations,
          eq(specializations.categoryId, categories.id),
        ),
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name));

    return categoriesWithCount;
  }),
};

export type CategoryRouter = typeof categoryRouter;
