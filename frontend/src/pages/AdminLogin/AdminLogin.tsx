import { useNavigate } from "react-router-dom";

import AuthLoginForm from "@/components/AuthLoginForm/AuthLoginForm";
import { getPagePath } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import { loginAdmin } from "@/Utils/Services/Authenticated/adminAreaApi";

const AdminLogin = () => {
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const setAdmin = useAdminAuthStore((s) => s.setAdmin);

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    const result = await loginAdmin(email, password);
    if (!result) return false;
    setAdmin(result.admin);
    navigate(getPagePath("adminArtists", language));
    return true;
  };

  return (
    <AuthLoginForm
      titleKey="auth.admin.title"
      seoPath="/admin/login"
      onSubmit={handleLogin}
    />
  );
};

export default AdminLogin;
