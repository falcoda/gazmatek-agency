import { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { getPagePath } from "@/config/pages";
import type { AppLanguage } from "@/i18n/config";
import { isSupportedLanguage } from "@/i18n/routing";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { useClientAuthStore } from "@/stores/ClientAuthStore";

interface ProtectedKindRouteProps {
  kind: "artist" | "admin" | "client";
  children: ReactNode;
}

const LOGIN_PAGE_KEY = {
  artist: "artistLogin",
  admin: "adminLogin",
  client: "accountLogin",
} as const;

const ProtectedKindRoute = ({ kind, children }: ProtectedKindRouteProps) => {
  const { lang } = useParams<{ lang: string }>();
  const language: AppLanguage | undefined = isSupportedLanguage(lang)
    ? lang
    : undefined;

  // Auth lives in httpOnly cookies; the store holds only the (optimistically
  // hydrated) identity object, which is enough to gate the route.
  const artist = useArtistAuthStore((s) => s.artist);
  const admin = useAdminAuthStore((s) => s.admin);
  const client = useClientAuthStore((s) => s.client);

  let isAuthed = false;
  if (kind === "artist") isAuthed = !!artist;
  else if (kind === "admin") isAuthed = !!admin;
  else isAuthed = !!client;

  if (!isAuthed) {
    return (
      <Navigate to={getPagePath(LOGIN_PAGE_KEY[kind], language)} replace />
    );
  }
  return <>{children}</>;
};

export default ProtectedKindRoute;
