import "./AccountSignup.scss";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import StepIndicator from "@/components/StepIndicator/StepIndicator";
import { getPagePath } from "@/config/pages";
import { Card } from "@/covaltech-react-ui";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useClientAuthStore } from "@/stores/ClientAuthStore";
import { registerAccount } from "@/Utils/Services/Authenticated/accountApi";

import StepAccount, { type AccountStepData } from "./StepAccount/StepAccount";
import StepAddress, { type AddressStepData } from "./StepAddress/StepAddress";
import StepCompany, { type CompanyStepData } from "./StepCompany/StepCompany";

const EMPTY_ACCOUNT: AccountStepData = {
  accountType: "individual",
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const EMPTY_COMPANY: CompanyStepData = {
  companyName: "",
  companyNumber: "",
  vatNumber: "",
};
const EMPTY_ADDRESS: AddressStepData = {
  addressStreet: "",
  addressNumber: "",
  addressZip: "",
  addressCity: "",
  addressCountry: "",
  phone: "",
};

const AccountSignup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const setSession = useClientAuthStore((s) => s.setSession);
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");
  const nextSuffix = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";

  const [step, setStep] = useState(0);
  const [account, setAccount] = useState<AccountStepData>(EMPTY_ACCOUNT);
  const [company, setCompany] = useState<CompanyStepData>(EMPTY_COMPANY);
  const [address, setAddress] = useState<AddressStepData>(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);

  const isCompany = account.accountType === "company";

  const stepLabels = useMemo(
    () =>
      isCompany
        ? [
            t("account.signup.steps.account"),
            t("account.signup.steps.company"),
            t("account.signup.steps.address"),
          ]
        : [
            t("account.signup.steps.account"),
            t("account.signup.steps.address"),
          ],
    [isCompany, t],
  );

  const goAfterAccount = () => setStep(1);
  const goAfterCompany = () => setStep(isCompany ? 2 : 1);
  const goBackFromAddress = () => setStep(isCompany ? 1 : 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await registerAccount({
      email: account.email.trim(),
      password: account.password,
      displayName: account.displayName.trim(),
      phone: address.phone.trim() || undefined,
      companyName: isCompany
        ? company.companyName.trim() || undefined
        : undefined,
      companyNumber: isCompany
        ? company.companyNumber.trim() || undefined
        : undefined,
      vatNumber: isCompany ? company.vatNumber.trim() || undefined : undefined,
      addressStreet: address.addressStreet.trim() || undefined,
      addressNumber: address.addressNumber.trim() || undefined,
      addressZip: address.addressZip.trim() || undefined,
      addressCity: address.addressCity.trim() || undefined,
      addressCountry: address.addressCountry.trim() || undefined,
    });
    setSubmitting(false);
    if (!result) {
      toast.error(t("account.signup.failed"));
      return;
    }
    setSession({
      token: result.token,
      refreshToken: result.refreshToken,
      client: result.client,
    });
    toast.success(t("account.signup.success"));
    navigate(nextPath ?? getPagePath("accountDashboard", language));
  };

  const showCompanyStep = isCompany && step === 1;
  const showAddressStep =
    (isCompany && step === 2) || (!isCompany && step === 1);

  return (
    <div className="accountSignupPage">
      <SeoHead
        title={t("account.signup.title")}
        description=""
        path="/account/signup"
      />
      <Card className="accountSignupCard">
        <header className="signupHeader">
          <h1>{t("account.signup.title")}</h1>
          <p className="signupIntro">{t("account.signup.hint")}</p>
        </header>

        <StepIndicator
          current={step}
          total={stepLabels.length}
          labels={stepLabels}
        />

        {step === 0 && (
          <StepAccount
            data={account}
            onChange={setAccount}
            onNext={goAfterAccount}
          />
        )}
        {showCompanyStep && (
          <StepCompany
            data={company}
            onChange={setCompany}
            onNext={goAfterCompany}
            onBack={() => setStep(0)}
          />
        )}
        {showAddressStep && (
          <StepAddress
            data={address}
            onChange={setAddress}
            onSubmit={handleSubmit}
            onBack={goBackFromAddress}
            isLoading={submitting}
          />
        )}

        <div className="authLinks">
          <Link to={`${getPagePath("accountLogin", language)}${nextSuffix}`}>
            {t("account.signup.loginLink")}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AccountSignup;
