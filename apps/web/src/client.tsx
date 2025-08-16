import { StartClient } from "@tanstack/react-start";
import { hydrateRoot } from "react-dom/client";
import { authClient } from "./lib/auth-client";
import { createRouter } from "./router";

function App() {
  const { data, isPending, error } = authClient.useSession();
  const hasData = data !== null && error === null && !isPending;

  const router = createRouter({
    user: hasData ? data.user : null,
    session: hasData ? data.session : null,
    isAuthenticated: hasData,
  });

  return <StartClient router={router} />;
}

hydrateRoot(document, <App />);
