import { ORPCError, os } from "@orpc/server";
import type { Role } from "@/lib/types";
import type { AuthenticatedContext, Context } from "../types";

export const o = os.$context<Context>();

export const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.auth?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  // After auth check, we can guarantee auth is not null
  return next({
    context: context as AuthenticatedContext,
  });
});

// Role-based middleware that can be used with protectedProcedure
export const createRoleMiddleware = (role: Role) =>
  o.$context<AuthenticatedContext>().middleware(async ({ context, next }) => {
    // This middleware should be used after requireAuth
    const userRole = context.auth.user.role;

    if (userRole === role || userRole === "admin") {
      return next();
    }

    throw new ORPCError("FORBIDDEN", {
      message: `${role} or admin role required`,
    });
  });
