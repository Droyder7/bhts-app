import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  expert,
  expertSpecializations,
  specializationCategories,
} from "@/db/schema";
import type { AccountStatus, VerificationStatus } from "@/db/schema/expert";
import { Procedures } from "../lib/orpc";

// Input validation schemas
const createExpertSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  pinCode: z.string().max(10).optional(),
  bio: z.string().max(1000).optional(),
  demoVideoUrl: z.string().url().optional(),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.enum(["hindi", "english"])).default([]),
  socialMediaLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url(),
      }),
    )
    .default([]),
  experiences: z
    .array(
      z.object({
        company: z.string(),
        position: z.string(),
        start_date: z.string(),
        end_date: z.string().nullable(),
        description: z.string(),
        skills: z.array(z.string()),
        employment_type: z.enum([
          "full-time",
          "part-time",
          "contract",
          "freelance",
        ]),
        is_current: z.boolean(),
      }),
    )
    .default([]),
  paymentAccount: z
    .object({
      account_type: z.enum(["bank", "upi"]),
      account_number: z.string().optional(),
      ifsc_code: z.string().optional(),
      bank_name: z.string().optional(),
      branch_name: z.string().optional(),
      upi_id: z.string().optional(),
      account_holder_name: z.string(),
      is_verified: z.boolean().default(false),
    })
    .optional(),
  perHourRate: z.number().min(0).optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

const updateExpertSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  pinCode: z.string().max(10).optional(),
  bio: z.string().max(1000).optional(),
  demoVideoUrl: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.enum(["hindi", "english"])).optional(),
  socialMediaLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
  experiences: z
    .array(
      z.object({
        company: z.string(),
        position: z.string(),
        start_date: z.string(),
        end_date: z.string().nullable(),
        description: z.string(),
        skills: z.array(z.string()),
        employment_type: z.enum([
          "full-time",
          "part-time",
          "contract",
          "freelance",
        ]),
        is_current: z.boolean(),
      }),
    )
    .optional(),
  paymentAccount: z
    .object({
      account_type: z.enum(["bank", "upi"]),
      account_number: z.string().optional(),
      ifsc_code: z.string().optional(),
      bank_name: z.string().optional(),
      branch_name: z.string().optional(),
      upi_id: z.string().optional(),
      account_holder_name: z.string(),
      is_verified: z.boolean().default(false),
    })
    .optional(),
  perHourRate: z.number().min(0).optional(),
  yearsOfExperience: z.number().min(0).optional(),
  accountStatus: z.enum(["active", "inactive", "suspended"]).optional(),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).optional(),
});

const expertIdSchema = z.object({
  id: z.string().uuid(),
});

const userIdSchema = z.object({
  userId: z.string().uuid(),
});

const expertPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  categoryId: z.uuid().optional(),
  sortBy: z
    .enum([
      "firstName",
      "lastName",
      "createdAt",
      "updatedAt",
      "averageRating",
      "totalSessions",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  searchKeyword: z.string().optional(),
  accountStatus: z.enum(["active", "inactive", "suspended"]).optional(),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxRating: z.number().min(0).max(5).optional(),
  minRate: z.number().min(0).optional(),
  maxRate: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.enum(["hindi", "english"])).optional(),
  minYearsOfExperience: z.number().min(0).optional(),
});

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  accountStatus: z.enum(["active", "inactive", "suspended"]).optional(),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).optional(),
});

const updateRatingSchema = z.object({
  id: z.string().uuid(),
  averageRating: z.number().min(0).max(5),
  totalSessions: z.number().min(0),
});

export const expertRouter = {
  // Get all expert with pagination and filtering
  getAll: Procedures.public
    .input(expertPaginationSchema)
    .handler(async ({ input }) => {
      const {
        page,
        limit,
        categoryId,
        sortBy,
        sortOrder,
        searchKeyword,
        accountStatus,
        verificationStatus,
        city,
        state,
        minRating,
        maxRating,
        minRate,
        maxRate,
        skills,
        languages,
        minYearsOfExperience,
      } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (searchKeyword) {
        whereConditions.push(
          or(
            ilike(expert.firstName, `%${searchKeyword}%`),
            ilike(expert.lastName, `%${searchKeyword}%`),
            ilike(expert.bio, `%${searchKeyword}%`),
          ),
        );
      }

      if (accountStatus) {
        whereConditions.push(eq(expert.accountStatus, accountStatus));
      }

      if (verificationStatus) {
        whereConditions.push(eq(expert.verificationStatus, verificationStatus));
      }

      if (city) {
        whereConditions.push(ilike(expert.city, `%${city}%`));
      }

      if (state) {
        whereConditions.push(ilike(expert.state, `%${state}%`));
      }

      if (categoryId) {
        // get specializations by categoryId
        const specializations = await db
          .select()
          .from(specializationCategories)
          .where(eq(specializationCategories.categoryId, categoryId));
        // get expert ids by specializations
        const expertIds = await db
          .select({
            expertId: expertSpecializations.expertId,
          })
          .from(expertSpecializations)
          .where(
            inArray(
              expertSpecializations.specializationId,
              specializations.map((spec) => spec.specializationId),
            ),
          );
        // add expert ids to where conditions
        whereConditions.push(
          inArray(
            expert.id,
            expertIds.map((id) => id.expertId),
          ),
        );
      }

      // Additional filters for skills and languages (if they are arrays)
      if (skills && skills.length > 0) {
        // Assuming skills is stored as an array in the database
        whereConditions.push(
          sql`${expert.skills} && ${skills}`, // PostgreSQL array overlap operator
        );
      }

      if (languages && languages.length > 0) {
        // Check if any of the expert's languages match any of the given languages
        whereConditions.push(
          sql`EXISTS (
      SELECT 1 
      FROM unnest(${expert.languages}) AS expert_lang 
      WHERE expert_lang = ANY(${sql`ARRAY[${sql.join(
        languages.map((lang) => sql`${lang}`),
        sql`, `,
      )}]`})
    )`,
        );
      }

      // Rating filters (using SQL for proper decimal comparison)
      if (minRating) {
        whereConditions.push(gte(expert.averageRating, minRating.toString()));
      }

      if (maxRating) {
        whereConditions.push(lte(expert.averageRating, maxRating.toString()));
      }

      // Rate filters (using SQL for proper decimal comparison)
      if (minRate) {
        whereConditions.push(gte(expert.perHourRate, minRate.toString()));
      }

      if (maxRate) {
        whereConditions.push(lte(expert.perHourRate, maxRate.toString()));
      }

      if (minYearsOfExperience) {
        whereConditions.push(
          gte(expert.yearsOfExperience, minYearsOfExperience),
        );
      }

      // Note: Rating and rate filtering would need custom SQL for proper comparison
      // This is a simplified version - in production, you'd want to use sql`` for complex conditions

      // Build order by
      const orderBy =
        sortOrder === "desc" ? desc(expert[sortBy]) : asc(expert[sortBy]);

      const [expertData, totalCount] = await Promise.all([
        db.query.expert.findMany({
          where:
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          orderBy,
          limit,
          offset,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                image: true,
              },
            },
            expertSpecializations: {
              with: {
                specialization: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        db.$count(
          expert,
          whereConditions.length > 0 ? and(...whereConditions) : undefined,
        ),
      ]);

      return {
        experts: expertData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Get expert by ID
  getById: Procedures.public
    .input(expertIdSchema)
    .handler(async ({ input }) => {
      const record = await db.query.expert.findFirst({
        where: eq(expert.id, input.id),
        with: {
          expertSpecializations: {
            with: {
              specialization: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!record) {
        throw new Error("Expert not found");
      }

      return record;
    }),

  getByIdWithUser: Procedures.public
    .input(expertIdSchema)
    .handler(async ({ input }) => {
      const record = await db.query.expert.findFirst({
        where: eq(expert.id, input.id),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              image: true,
            },
          },
          expertSpecializations: {
            with: {
              specialization: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!record) {
        throw new Error("Expert not found");
      }

      return record;
    }),

  // Get expert by user ID
  getByUserId: Procedures.public
    .input(userIdSchema)
    .handler(async ({ input }) => {
      const record = await db.query.expert.findFirst({
        where: eq(expert.userId, input.userId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          expertSpecializations: {
            with: {
              specialization: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!record) {
        throw new Error("Expert not found");
      }

      return record;
    }),

  // Get verified expert only
  getVerified: Procedures.public
    .input(expertPaginationSchema)
    .handler(async ({ input }) => {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        accountStatus,
        verificationStatus,
        city,
        state,
        searchKeyword,
      } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (verificationStatus) {
        whereConditions.push(eq(expert.verificationStatus, verificationStatus));
      }

      if (searchKeyword) {
        whereConditions.push(
          or(
            ilike(expert.firstName, `%${searchKeyword}%`),
            ilike(expert.lastName, `%${searchKeyword}%`),
            ilike(expert.bio, `%${searchKeyword}%`),
          ),
        );
      }

      if (accountStatus) {
        whereConditions.push(eq(expert.accountStatus, accountStatus));
      }

      if (city) {
        whereConditions.push(ilike(expert.city, `%${city}%`));
      }

      if (state) {
        whereConditions.push(ilike(expert.state, `%${state}%`));
      }

      // Build order by
      const orderBy =
        sortOrder === "desc" ? desc(expert[sortBy]) : asc(expert[sortBy]);

      const [expertData, totalCount] = await Promise.all([
        db.query.expert.findMany({
          where: and(...whereConditions),
          orderBy,
          limit,
          offset,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            expertSpecializations: {
              with: {
                specialization: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        db.$count(expert, and(...whereConditions)),
      ]);

      return {
        expert: expertData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Create expert profile (Protected - users can create their own expert profile)
  create: Procedures.protected
    .input(createExpertSchema)
    .handler(async ({ input, context }) => {
      // Check if expert profile already exists for this user
      const existingExpert = await db.query.expert.findFirst({
        where: eq(expert.userId, input.userId),
      });

      if (existingExpert) {
        throw new Error("Expert profile already exists for this user");
      }

      // Ensure user can only create profile for themselves (unless admin)
      if (
        context.auth.user.role !== "admin" &&
        context.auth.user.id !== input.userId
      ) {
        throw new Error("You can only create your own expert profile");
      }

      const [newExpert] = await db
        .insert(expert)
        .values({
          ...input,
          perHourRate: input.perHourRate?.toString(),
          verificationStatus: "pending" as VerificationStatus,
          accountStatus: "active" as AccountStatus,
        })
        .returning();

      return newExpert;
    }),

  // Update expert profile (Protected - expert can update their own profile)
  update: Procedures.protected
    .input(updateExpertSchema)
    .handler(async ({ input, context }) => {
      const { id, ...updateData } = input;

      // Get current expert to check ownership
      const currentExpert = await db.query.expert.findFirst({
        where: eq(expert.id, id),
      });

      if (!currentExpert) {
        throw new Error("Expert not found");
      }

      // Ensure user can only update their own profile (unless admin)
      if (
        context.auth.user.role !== "admin" &&
        context.auth.user.id !== currentExpert.userId
      ) {
        throw new Error("You can only update your own expert profile");
      }

      // Remove admin-only fields if user is not admin
      if (context.auth.user.role !== "admin") {
        delete updateData.accountStatus;
        delete updateData.verificationStatus;
      }

      const [updatedExpert] = await db
        .update(expert)
        .set({
          ...updateData,
          perHourRate: updateData.perHourRate?.toString(),
        })
        .where(eq(expert.id, id))
        .returning();

      if (!updatedExpert) {
        throw new Error("Expert not found");
      }

      return updatedExpert;
    }),

  // Update expert status (Admin only)
  updateStatus: Procedures.roleGuard.admin
    .input(updateStatusSchema)
    .handler(async ({ input }) => {
      const { id, ...statusData } = input;

      const [updatedExpert] = await db
        .update(expert)
        .set(statusData)
        .where(eq(expert.id, id))
        .returning();

      if (!updatedExpert) {
        throw new Error("Expert not found");
      }

      return updatedExpert;
    }),

  // Update expert rating and session count (Protected - typically called by session service)
  updateRating: Procedures.protected
    .input(updateRatingSchema)
    .handler(async ({ input }) => {
      const { id, averageRating, totalSessions } = input;

      const [updatedExpert] = await db
        .update(expert)
        .set({
          averageRating: averageRating.toString(),
          totalSessions,
        })
        .where(eq(expert.id, id))
        .returning();

      if (!updatedExpert) {
        throw new Error("Expert not found");
      }

      return updatedExpert;
    }),

  // Delete expert profile (Admin only)
  delete: Procedures.roleGuard.admin
    .input(expertIdSchema)
    .handler(async ({ input }) => {
      // Check if expert has active specializations
      const hasSpecializations = await db.query.expertSpecializations.findFirst(
        {
          where: eq(expertSpecializations.expertId, input.id),
        },
      );

      if (hasSpecializations) {
        throw new Error(
          "Cannot delete expert with active specializations. Remove specializations first.",
        );
      }

      const [deletedExpert] = await db
        .delete(expert)
        .where(eq(expert.id, input.id))
        .returning();

      if (!deletedExpert) {
        throw new Error("Expert not found");
      }

      return { success: true, deletedExpert };
    }),

  // Get expert statistics (Admin only)
  getStatistics: Procedures.roleGuard.admin.handler(async () => {
    const [totalexpert, verifiedexpert, pendingexpert, activeexpert] =
      await Promise.all([
        db.$count(expert),
        db.$count(expert, eq(expert.verificationStatus, "verified")),
        db.$count(expert, eq(expert.verificationStatus, "pending")),
        db.$count(expert, eq(expert.accountStatus, "active")),
      ]);

    return {
      totalexpert,
      verifiedexpert,
      pendingexpert,
      activeexpert,
      rejectedexpert: totalexpert - verifiedexpert - pendingexpert,
      inactiveexpert: totalexpert - activeexpert,
    };
  }),
};

export type ExpertRouter = typeof expertRouter;
