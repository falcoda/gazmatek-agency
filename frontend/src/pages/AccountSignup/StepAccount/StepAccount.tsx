import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  ButtonSwitcher,
  type ButtonSwitcherValue,
  StyledInputEmail,
  StyledInputPassword,
  StyledInputText,
} from "@/covaltech-react-ui";
import {
  isPasswordTooShort,
  PASSWORD_MIN_LENGTH,
} from "@/Utils/passwordPolicy";

export type SignupAccountType = "individual" | "company";

interface AccountTypeOption extends ButtonSwitcherValue {
  id: SignupAccountType;
}

export interface AccountStepData {
  accountType: SignupAccountType;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface StepAccountProps {
  data: AccountStepData;
  onChange: (data: AccountStepData) => void;
  onNext: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrors = (data: AccountStepData) => ({
  displayName: !data.displayName.trim() ? "displayNameRequired" : null,
  email: !data.email.trim()
    ? "emailRequired"
    : !EMAIL_REGEX.test(data.email)
      ? "emailInvalid"
      : null,
  password: isPasswordTooShort(data.password) ? "passwordTooShort" : null,
  confirmPassword:
    data.confirmPassword !== data.password ? "passwordMismatch" : null,
});

const StepAccount = ({ data, onChange, onNext }: StepAccountProps) => {
  const { t } = useTranslation();
  const [attempted, setAttempted] = useState(false);

  const accountTypeOptions = useMemo<AccountTypeOption[]>(
    () => [
      { id: "individual", name: t("account.signup.accountType.individual") },
      { id: "company", name: t("account.signup.accountType.company") },
    ],
    [t],
  );

  const selectedAccountType =
    accountTypeOptions.find((o) => o.id === data.accountType) ??
    accountTypeOptions[0];

  const handleNext = () => {
    setAttempted(true);
    const errs = getErrors(data);
    if (Object.values(errs).every((e) => e === null)) {
      onNext();
    }
  };

  const errors = attempted
    ? getErrors(data)
    : { displayName: null, email: null, password: null, confirmPassword: null };

  return (
    <div className="signupStep">
      <div className="accountTypeField">
        <span className="accountTypeLabel">
          {t("account.signup.accountType.label")}
        </span>
        <ButtonSwitcher<AccountTypeOption>
          value={selectedAccountType}
          setValue={(next) => {
            const resolved =
              typeof next === "function" ? next(selectedAccountType) : next;
            onChange({ ...data, accountType: resolved.id });
          }}
          datas={accountTypeOptions}
          width="100%"
        />
      </div>

      <StyledInputText
        label={`${t("account.signup.displayName")} *`}
        placeholder={t("account.signup.placeholders.displayName")}
        value={data.displayName}
        setValue={(v) => onChange({ ...data, displayName: v })}
        required
        width="100%"
      />
      {errors.displayName ? (
        <p className="fieldError">
          {t(`account.signup.errors.${errors.displayName}`)}
        </p>
      ) : null}

      <StyledInputEmail
        label={`${t("contact.form.email")} *`}
        placeholder={t("account.signup.placeholders.email")}
        value={data.email}
        setValue={(v) => onChange({ ...data, email: v })}
        required
        width="100%"
      />
      {errors.email ? (
        <p className="fieldError">
          {t(`account.signup.errors.${errors.email}`)}
        </p>
      ) : null}

      <StyledInputPassword
        label={`${t("auth.password")} *`}
        placeholder={t("account.signup.placeholders.password")}
        value={data.password}
        setValue={(v) => onChange({ ...data, password: v })}
        required
        width="100%"
      />
      {errors.password ? (
        <p className="fieldError">
          {t(`account.signup.errors.${errors.password}`, {
            min: PASSWORD_MIN_LENGTH,
          })}
        </p>
      ) : null}

      <StyledInputPassword
        label={`${t("account.signup.confirmPassword")} *`}
        placeholder={t("account.signup.placeholders.confirmPassword")}
        value={data.confirmPassword}
        setValue={(v) => onChange({ ...data, confirmPassword: v })}
        required
        width="100%"
      />
      {errors.confirmPassword ? (
        <p className="fieldError">
          {t(`account.signup.errors.${errors.confirmPassword}`)}
        </p>
      ) : null}

      <div className="stepActions">
        <Button
          type="button"
          label={t("account.signup.next")}
          style="blue"
          onClick={handleNext}
          width="100%"
        />
      </div>
    </div>
  );
};

export default StepAccount;
