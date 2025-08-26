import type { auth } from "./auth";

export const ROLES = ["customer", "member", "admin"] as const;
export type Role = (typeof ROLES)[number];

export type Session = typeof auth.$Infer.Session;

export type Context = {
  auth: Session | null;
};

export type AuthenticatedContext = {
  auth: Session;
};
