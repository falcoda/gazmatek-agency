import "./index.scss";

import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import { useThemeStore } from "./covaltech-react-ui";
import { useAdminAuthStore } from "./stores/AdminAuthStore";
import { useArtistAuthStore } from "./stores/ArtistAuthStore";
import { useClientAuthStore } from "./stores/ClientAuthStore";

useThemeStore.getState().init();

// Restore each actor's session from its httpOnly cookie via /me. Fire-and-forget:
// the optimistic identity from localStorage already gates routes synchronously,
// and these reconcile against the server (or clear a stale identity).
void useAdminAuthStore.getState().hydrate();
void useArtistAuthStore.getState().hydrate();
void useClientAuthStore.getState().hydrate();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
