import type { RouterClient } from "@orpc/server";
import { checkDbConnection } from "@/db";
import { protectedProcedure, publicProcedure } from "../lib/orpc";

export const appRouter = {
  healthCheck: publicProcedure.handler(async () => {
    const isDbConnected = await checkDbConnection();

    return {
      status: isDbConnected ? "healthy" : "unhealthy",
      message: isDbConnected
        ? "Database is connected"
        : "Database is disconnected",
      timestamp: new Date().toISOString(),
    };
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
