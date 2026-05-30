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

  const artistToken = useArtistAuthStore((s) => s.token);
  const adminToken = useAdminAuthStore((s) => s.token);
  const clientToken = useClientAuthStore((s) => s.token);

  let isAuthed = false;
  if (kind === "artist") isAuthed = !!artistToken;
  else if (kind === "admin") isAuthed = !!adminToken;
  else isAuthed = !!clientToken;

  if (!isAuthed) {
    return (
      <Navigate to={getPagePath(LOGIN_PAGE_KEY[kind], language)} replace />
    );
  }
  return <>{children}</>;
};

export default ProtectedKindRoute;
