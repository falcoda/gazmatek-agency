import "@/pages/AccountSignup/AccountSignup.scss";

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

const AccountClaim = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("account.claim.missingToken"));
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
    toast.success(t("account.claim.success"));
    navigate(getPagePath("accountLogin", language));
  };

  return (
    <div className="accountSignupPage">
      <SeoHead
        title={t("account.claim.title")}
        description=""
        path="/account/claim"
      />
      <Card className="accountSignupCard">
        <header className="signupHeader">
          <h1>{t("account.claim.title")}</h1>
          <p className="signupIntro">{t("account.claim.hint")}</p>
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
              label={t("account.claim.submit")}
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

export default AccountClaim;
