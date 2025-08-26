import { createFileRoute, Outlet } from "@tanstack/react-router";
import { roleGuard } from "@/lib/utils";

export const Route = createFileRoute("/_protected/member")({
  beforeLoad: roleGuard("member"),
  component: () => <Outlet />,
});
