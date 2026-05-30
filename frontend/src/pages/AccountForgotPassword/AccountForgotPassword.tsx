import "@/pages/AccountSignup/AccountSignup.scss";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import { Button, Card, StyledInputEmail } from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { forgotAccountPassword } from "@/Utils/Services/Authenticated/accountApi";

const AccountForgotPassword = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await forgotAccountPassword(email, language);
    setSubmitting(false);
    setSent(true);
  };

  return (
    <div className="accountSignupPage">
      <SeoHead
        title={t("account.forgot.title")}
        description=""
        path="/account/forgot-password"
      />
      <Card className="accountSignupCard">
        <header className="signupHeader">
          <h1>{t("account.forgot.title")}</h1>
          {!sent && <p className="signupIntro">{t("account.forgot.hint")}</p>}
        </header>
        {sent ? (
          <p className="signupIntro">{t("account.forgot.sent")}</p>
        ) : (
          <form className="signupStep" onSubmit={onSubmit}>
            <StyledInputEmail
              label={t("contact.form.email")}
              placeholder={t("account.signup.placeholders.email")}
              value={email}
              setValue={setEmail}
              required
              width="100%"
            />
            <div className="stepActions">
              <Button
                type="submit"
                label={t("account.forgot.submit")}
                style="blue"
                isLoading={submitting}
                width="100%"
              />
            </div>
          </form>
        )}
        <div className="authLinks">
          <Link to={getPagePath("accountLogin", language)}>
            {t("account.forgot.loginLink")}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AccountForgotPassword;
