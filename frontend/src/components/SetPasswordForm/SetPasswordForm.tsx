import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import { Button, Card, StyledInputPassword } from "@/covaltech-react-ui";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import {
  isPasswordTooShort,
  PASSWORD_MIN_LENGTH,
} from "@/Utils/passwordPolicy";
import { resetAccountPassword } from "@/Utils/Services/Authenticated/accountApi";

interface SetPasswordFormProps {
  /** i18n key prefix, e.g. `account.claim` or `account.reset`. */
  i18nNamespace: string;
  /** Canonical path passed to {@link SeoHead}. */
  seoPath: string;
}

/**
 * Shared "set a new password from a one-time token" screen used by both the
 * account-claim and password-reset flows. They differ only in their i18n keys
 * and SEO path, so the entire form lives here once.
 */
const SetPasswordForm = ({ i18nNamespace, seoPath }: SetPasswordFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const k = (suffix: string) => `${i18nNamespace}.${suffix}`;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t(k("missingToken")));
      return;
    }
    if (isPasswordTooShort(password)) {
      toast.error(
        t("account.signup.errors.passwordTooShort", {
          min: PASSWORD_MIN_LENGTH,
        }),
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("account.signup.errors.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    const result = await resetAccountPassword(token, password);
    setSubmitting(false);
    if (!result) {
      return;
    }
    toast.success(t(k("success")));
    navigate(getPagePath("accountLogin", language));
  };

  return (
    <div className="accountSignupPage">
      <SeoHead title={t(k("title"))} description="" path={seoPath} />
      <Card className="accountSignupCard">
        <header className="signupHeader">
          <h1>{t(k("title"))}</h1>
          <p className="signupIntro">{t(k("hint"))}</p>
        </header>
        <form className="signupStep" onSubmit={onSubmit}>
          <StyledInputPassword
            label={t("auth.password")}
            placeholder={t("account.signup.placeholders.password")}
            value={password}
            setValue={setPassword}
            required
            width="100%"
          />
          <StyledInputPassword
            label={t("account.signup.confirmPassword")}
            placeholder={t("account.signup.placeholders.confirmPassword")}
            value={confirmPassword}
            setValue={setConfirmPassword}
            required
            width="100%"
          />
          <div className="stepActions">
            <Button
              type="submit"
              label={t(k("submit"))}
              style="blue"
              isLoading={submitting}
              width="100%"
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SetPasswordForm;
