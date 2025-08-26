import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Welcome to Admin Dashboard</div>;
}
