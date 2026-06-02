import "@/pages/AccountSignup/AccountSignup.scss";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  StyledInputEmail,
  StyledInputPassword,
} from "@/covaltech-react-ui";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useClientAuthStore } from "@/stores/ClientAuthStore";
import { loginAccount } from "@/Utils/Services/Authenticated/accountApi";

const AccountLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const setSession = useClientAuthStore((s) => s.setSession);
  const token = useClientAuthStore((s) => s.token);
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");
  const nextSuffix = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already-authenticated clients shouldn't see the login form: bounce them to
  // the `next` target or the dashboard. (#52)
  useEffect(() => {
    if (token) {
      navigate(nextPath ?? getPagePath("accountDashboard", language), {
        replace: true,
      });
    }
  }, [token, nextPath, navigate, language]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await loginAccount(email, password);
    setSubmitting(false);
    if (!result) {
      toast.error(t("auth.invalidCredentials"));
      return;
    }
    setSession({
      token: result.token,
      refreshToken: result.refreshToken,
      client: result.client,
    });
    navigate(nextPath ?? getPagePath("accountDashboard", language));
  };

  return (
    <div className="accountSignupPage">
      <SeoHead
        title={t("account.login.title")}
        description=""
        path="/account/login"
      />
      <Card className="accountSignupCard">
        <header className="signupHeader">
          <h1>{t("account.login.title")}</h1>
        </header>
        <form className="signupStep" onSubmit={onSubmit}>
          <StyledInputEmail
            label={t("contact.form.email")}
            placeholder={t("account.signup.placeholders.email")}
            value={email}
            setValue={setEmail}
            required
            width="100%"
          />
          <StyledInputPassword
            label={t("auth.password")}
            placeholder={t("account.signup.placeholders.password")}
            value={password}
            setValue={setPassword}
            required
            width="100%"
          />
          <div className="stepActions">
            <Button
              type="submit"
              label={t("auth.signIn")}
              style="blue"
              isLoading={submitting}
              width="100%"
            />
          </div>
        </form>
        <div className="authLinks">
          <Link
            className="forgotLink"
            to={getPagePath("accountForgotPassword", language)}
          >
            {t("account.login.forgotLink")}
          </Link>
          {" · "}
          <Link
            className="signupLink"
            to={`${getPagePath("accountSignup", language)}${nextSuffix}`}
          >
            {t("account.login.signupLink")}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AccountLogin;
