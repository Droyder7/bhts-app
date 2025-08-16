import { redirect } from "@tanstack/react-router";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RouterAppContext } from "@/routes/__root";
import type { Role } from "../../../server/src/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roleGuard(role: Role) {
  return async ({ context }: { context: RouterAppContext }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
      });
    }
    if (context.auth.user?.role !== role) {
      throw redirect({
        to: "/",
      });
    }
  };
}
