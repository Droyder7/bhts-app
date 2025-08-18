import type { RouterClient } from "@orpc/server";
import { checkDbConnection } from "@/db";
import { Procedures } from "../lib/orpc";
import { categoryRouter } from "./category";
import { expertRouter } from "./expert";
import { specializationRouter } from "./specialization";

export const appRouter = {
  healthCheck: Procedures.public.handler(async () => {
    const isDbConnected = await checkDbConnection();

    return {
      status: isDbConnected ? "healthy" : "unhealthy",
      message: isDbConnected
        ? "Database is connected"
        : "Database is disconnected",
      timestamp: new Date().toISOString(),
    };
  }),
  privateData: Procedures.protected.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.auth?.user,
    };
  }),
  category: categoryRouter,
  expert: expertRouter,
  specialization: specializationRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
