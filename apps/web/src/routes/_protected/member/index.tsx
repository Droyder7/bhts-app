import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/member/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Welcome to Member Dashboard</div>;
}
