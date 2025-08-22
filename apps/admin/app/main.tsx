import { KottsterApp } from "@kottster/react";
import React from "react";
import ReactDOM from "react-dom/client";
import "@kottster/react/dist/style.css";

const pageEntries = import.meta.glob("./pages/**/index.{jsx,tsx}", {
  eager: true,
});

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <KottsterApp pageEntries={pageEntries} />
  </React.StrictMode>,
);
