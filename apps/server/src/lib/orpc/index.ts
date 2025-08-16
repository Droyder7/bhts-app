import type { Role } from "@/lib/types";
import { createRoleMiddleware, o, requireAuth } from "./middleware";

const publicProcedure = o;
const protectedProcedure = publicProcedure.use(requireAuth);

const roleGuard = (minRole: Role) =>
  protectedProcedure.use(createRoleMiddleware(minRole));

const adminProcedure = roleGuard("admin");
const memberProcedure = roleGuard("member");
const userProcedure = roleGuard("customer");

export const Procedures = {
  public: publicProcedure,
  protected: protectedProcedure,
  roleGuard: {
    admin: adminProcedure,
    member: memberProcedure,
    user: userProcedure,
  },
};
