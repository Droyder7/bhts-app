import {
  inferAdditionalFields,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { SERVER_URL } from "@/utils/orpc";
import type { auth } from "../../../server/src/lib/auth";

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  plugins: [inferAdditionalFields<typeof auth>(), phoneNumberClient()],
});

export type AuthContextType = {
  user: typeof authClient.$Infer.Session.user | null;
  session: typeof authClient.$Infer.Session.session | null;
  isAuthenticated: boolean;
};
