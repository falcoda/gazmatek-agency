import { useNavigate } from "react-router-dom";

import AuthLoginForm from "@/components/AuthLoginForm/AuthLoginForm";
import { getPagePath } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { loginArtist } from "@/Utils/Services/Authenticated/artistAreaApi";

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
    navigate(getPagePath("artistBookings", language));
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
