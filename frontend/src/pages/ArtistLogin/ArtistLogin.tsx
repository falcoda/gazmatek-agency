import { useNavigate } from "react-router-dom";

import AuthLoginForm from "@/components/AuthLoginForm/AuthLoginForm";
import { getPagePath } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import {
  fetchArtistMe,
  loginArtist,
} from "@/Utils/Services/Authenticated/artistAreaApi";

const ArtistLogin = () => {
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const setSession = useArtistAuthStore((s) => s.setSession);

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    const result = await loginArtist(email, password);
    if (!result) return false;
    setSession({
      token: result.token,
      refreshToken: result.refreshToken,
      artist: result.artist,
    });
    // Route to onboarding when the engagement contract is still unsigned so the
    // flow is discoverable right after the invitation. (#34)
    const me = await fetchArtistMe();
    const destination =
      me && me.onboardingCompletedAt === null
        ? "artistOnboardingContract"
        : "artistBookings";
    navigate(getPagePath(destination, language));
    return true;
  };

  return (
    <AuthLoginForm
      titleKey="auth.artist.title"
      seoPath="/artist/login"
      onSubmit={handleLogin}
    />
  );
};

export default ArtistLogin;
