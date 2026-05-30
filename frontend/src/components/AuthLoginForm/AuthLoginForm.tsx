import "./AuthLoginForm.scss";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import SeoHead from "@/components/SeoHead/SeoHead";
import {
  Button,
  StyledInputEmail,
  StyledInputPassword,
} from "@/covaltech-react-ui";

interface AuthLoginFormProps {
  /** i18n key used for both the page heading and the SEO title. */
  titleKey: string;
  /** Canonical path passed to {@link SeoHead}. */
  seoPath: string;
  /**
   * Performs the login request. The caller persists the session and navigates
   * on success. Resolve to `false` to surface the invalid-credentials toast.
   */
  onSubmit: (email: string, password: string) => Promise<boolean>;
}

/**
 * Shared email + password sign-in screen used by the admin and artist back
 * offices. The page-specific store, request and redirect live in `onSubmit`.
 */
const AuthLoginForm = ({ titleKey, seoPath, onSubmit }: AuthLoginFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onSubmit(email, password);
    setSubmitting(false);
    if (!ok) {
      toast.error(t("auth.invalidCredentials"));
    }
  };

  return (
    <div className="authPage">
      <SeoHead title={t(titleKey)} description="" path={seoPath} />
      <h1>{t(titleKey)}</h1>
      <form className="authForm" onSubmit={handleSubmit}>
        <StyledInputEmail
          label={t("contact.form.email")}
          value={email}
          setValue={setEmail}
          required
          className="input"
        />
        <StyledInputPassword
          label={t("auth.password")}
          value={password}
          setValue={setPassword}
          required
          className="input"
          width="100%"
        />
        <Button
          type="submit"
          label={t("auth.signIn")}
          style="blue"
          isLoading={submitting}
          width="100%"
        />
      </form>
    </div>
  );
};

export default AuthLoginForm;
