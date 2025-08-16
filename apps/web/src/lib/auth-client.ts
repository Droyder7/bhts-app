import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export type AuthContextType = {
  user: typeof authClient.$Infer.Session.user | null;
  session: typeof authClient.$Infer.Session.session | null;
  isAuthenticated: boolean;
};
