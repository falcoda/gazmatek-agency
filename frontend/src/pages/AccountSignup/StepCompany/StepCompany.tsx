import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Button, StyledInputText } from "@/covaltech-react-ui";

export interface CompanyStepData {
  companyName: string;
  companyNumber: string;
  vatNumber: string;
}

interface StepCompanyProps {
  data: CompanyStepData;
  onChange: (data: CompanyStepData) => void;
  onNext: () => void;
  onBack: () => void;
}

const BCE_REGEX = /^0\d{3}\.\d{3}\.\d{3}$/;

const formatBce = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`;
};

const StepCompany = ({ data, onChange, onNext, onBack }: StepCompanyProps) => {
  const { t } = useTranslation();

  // Mirror the BCE into the VAT field (Belgian convention: VAT = BE + BCE).
  useEffect(() => {
    if (BCE_REGEX.test(data.companyNumber) && !data.vatNumber.trim()) {
      onChange({ ...data, vatNumber: `BE${data.companyNumber}` });
    }
  }, [data.companyNumber]);

  return (
    <div className="signupStep">
      <p className="stepHint">{t("account.signup.companyHint")}</p>

      <StyledInputText
        label={t("account.signup.companyName")}
        placeholder={t("account.signup.placeholders.companyName")}
        value={data.companyName}
        setValue={(v) => onChange({ ...data, companyName: v })}
        width="100%"
      />

      <StyledInputText
        label={t("account.signup.companyNumber")}
        value={data.companyNumber}
        setValue={(v) => onChange({ ...data, companyNumber: formatBce(v) })}
        placeholder="0XXX.XXX.XXX"
        width="100%"
      />

      <StyledInputText
        label={t("account.signup.vatNumber")}
        value={data.vatNumber}
        setValue={(v) => onChange({ ...data, vatNumber: v.toUpperCase() })}
        placeholder="BE0XXX.XXX.XXX"
        width="100%"
      />

      <div className="stepActions">
        <Button
          type="button"
          label={t("account.signup.back")}
          style="bordered"
          onClick={onBack}
          width="100%"
        />
        <Button
          type="button"
          label={t("account.signup.next")}
          style="blue"
          onClick={onNext}
          width="100%"
        />
      </div>
    </div>
  );
};

export default StepCompany;
