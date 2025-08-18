import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { experts, specializations } from "@/db/schema";
import type { AccountStatus, VerificationStatus } from "@/db/schema/profiles";
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
  search: z.string().optional(),
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
  // Get all experts with pagination and filtering
  getAll: Procedures.public
    .input(expertPaginationSchema)
    .handler(async ({ input }) => {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
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
      } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            ilike(experts.firstName, `%${search}%`),
            ilike(experts.lastName, `%${search}%`),
            ilike(experts.bio, `%${search}%`),
          ),
        );
      }

      if (accountStatus) {
        whereConditions.push(eq(experts.accountStatus, accountStatus));
      }

      if (verificationStatus) {
        whereConditions.push(
          eq(experts.verificationStatus, verificationStatus),
        );
      }

      if (city) {
        whereConditions.push(ilike(experts.city, `%${city}%`));
      }

      if (state) {
        whereConditions.push(ilike(experts.state, `%${state}%`));
      }

      // Note: Rating and rate filtering would need custom SQL for proper comparison
      // This is a simplified version - in production, you'd want to use sql`` for complex conditions

      // Build order by
      const orderBy =
        sortOrder === "desc" ? desc(experts[sortBy]) : asc(experts[sortBy]);

      const [expertsData, totalCount] = await Promise.all([
        db.query.experts.findMany({
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
                image: true,
              },
            },
            specializations: {
              with: {
                category: true,
              },
            },
          },
        }),
        db.$count(
          experts,
          whereConditions.length > 0 ? and(...whereConditions) : undefined,
        ),
      ]);

      return {
        experts: expertsData,
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
      const expert = await db.query.experts.findFirst({
        where: eq(experts.id, input.id),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          specializations: {
            with: {
              category: {
                with: {
                  parent: true,
                },
              },
            },
          },
        },
      });

      if (!expert) {
        throw new Error("Expert not found");
      }

      return expert;
    }),

  // Get expert by user ID
  getByUserId: Procedures.public
    .input(userIdSchema)
    .handler(async ({ input }) => {
      const expert = await db.query.experts.findFirst({
        where: eq(experts.userId, input.userId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          specializations: {
            with: {
              category: {
                with: {
                  parent: true,
                },
              },
            },
          },
        },
      });

      if (!expert) {
        throw new Error("Expert not found");
      }

      return expert;
    }),

  // Get verified experts only
  getVerified: Procedures.public
    .input(expertPaginationSchema.omit({ verificationStatus: true }))
    .handler(async ({ input }) => {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        accountStatus,
        city,
        state,
      } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [eq(experts.verificationStatus, "verified")];

      // if (search) {
      //   whereConditions.push(
      //     or(
      //       ilike(experts.firstName, `%${search}%`),
      //       ilike(experts.lastName, `%${search}%`),
      //       ilike(experts.bio, `%${search}%`),
      //     ),
      //   );
      // }

      if (accountStatus) {
        whereConditions.push(eq(experts.accountStatus, accountStatus));
      }

      if (city) {
        whereConditions.push(ilike(experts.city, `%${city}%`));
      }

      if (state) {
        whereConditions.push(ilike(experts.state, `%${state}%`));
      }

      // Build order by
      const orderBy =
        sortOrder === "desc" ? desc(experts[sortBy]) : asc(experts[sortBy]);

      const [expertsData, totalCount] = await Promise.all([
        db.query.experts.findMany({
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
            specializations: {
              with: {
                category: true,
              },
            },
          },
        }),
        db.$count(experts, and(...whereConditions)),
      ]);

      return {
        experts: expertsData,
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
      const existingExpert = await db.query.experts.findFirst({
        where: eq(experts.userId, input.userId),
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
        .insert(experts)
        .values({
          ...input,
          perHourRate: input.perHourRate?.toString(),
          verificationStatus: "pending" as VerificationStatus,
          accountStatus: "active" as AccountStatus,
        })
        .returning();

      return newExpert;
    }),

  // Update expert profile (Protected - experts can update their own profile)
  update: Procedures.protected
    .input(updateExpertSchema)
    .handler(async ({ input, context }) => {
      const { id, ...updateData } = input;

      // Get current expert to check ownership
      const currentExpert = await db.query.experts.findFirst({
        where: eq(experts.id, id),
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
        .update(experts)
        .set({
          ...updateData,
          perHourRate: updateData.perHourRate?.toString(),
        })
        .where(eq(experts.id, id))
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
        .update(experts)
        .set(statusData)
        .where(eq(experts.id, id))
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
        .update(experts)
        .set({
          averageRating: averageRating.toString(),
          totalSessions,
        })
        .where(eq(experts.id, id))
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
      const hasSpecializations = await db.query.specializations.findFirst({
        where: eq(specializations.expertId, input.id),
      });

      if (hasSpecializations) {
        throw new Error(
          "Cannot delete expert with active specializations. Remove specializations first.",
        );
      }

      const [deletedExpert] = await db
        .delete(experts)
        .where(eq(experts.id, input.id))
        .returning();

      if (!deletedExpert) {
        throw new Error("Expert not found");
      }

      return { success: true, deletedExpert };
    }),

  // Get expert statistics (Admin only)
  getStatistics: Procedures.roleGuard.admin.handler(async () => {
    const [totalExperts, verifiedExperts, pendingExperts, activeExperts] =
      await Promise.all([
        db.$count(experts),
        db.$count(experts, eq(experts.verificationStatus, "verified")),
        db.$count(experts, eq(experts.verificationStatus, "pending")),
        db.$count(experts, eq(experts.accountStatus, "active")),
      ]);

    return {
      totalExperts,
      verifiedExperts,
      pendingExperts,
      activeExperts,
      rejectedExperts: totalExperts - verifiedExperts - pendingExperts,
      inactiveExperts: totalExperts - activeExperts,
    };
  }),

  // Get top-rated experts
  getTopRated: Procedures.public
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        minSessions: z.number().min(0).default(5),
      }),
    )
    .handler(async ({ input }) => {
      const { limit, minSessions } = input;

      const topExperts = await db.query.experts.findMany({
        where: and(
          eq(experts.verificationStatus, "verified"),
          eq(experts.accountStatus, "active"),
        ),
        orderBy: [desc(experts.averageRating), desc(experts.totalSessions)],
        limit,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          specializations: {
            with: {
              category: true,
            },
            where: eq(specializations.isPrimary, true),
          },
        },
      });

      return topExperts;
    }),
};

export type ExpertRouter = typeof expertRouter;
