import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

type AuthSearchParams = {
  redirect?: string;
};

export const Route = createFileRoute("/_auth")({
  validateSearch: (search): AuthSearchParams => ({
    redirect: search.redirect as string,
  }),
  beforeLoad: async ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: search.redirect || "/",
      });
    }
  },
  component: () => <Outlet />,
});
