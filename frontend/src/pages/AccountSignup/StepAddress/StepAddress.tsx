import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, StyledInputText } from "@/covaltech-react-ui";

export interface AddressStepData {
  addressStreet: string;
  addressNumber: string;
  addressZip: string;
  addressCity: string;
  addressCountry: string;
  phone: string;
}

interface StepAddressProps {
  data: AddressStepData;
  onChange: (data: AddressStepData) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const getErrors = (data: AddressStepData) => ({
  addressStreet: !data.addressStreet.trim() ? "addressStreetRequired" : null,
  addressNumber: !data.addressNumber.trim() ? "addressNumberRequired" : null,
  addressZip: !data.addressZip.trim() ? "addressZipRequired" : null,
  addressCity: !data.addressCity.trim() ? "addressCityRequired" : null,
  addressCountry: !data.addressCountry.trim() ? "addressCountryRequired" : null,
});

const StepAddress = ({
  data,
  onChange,
  onSubmit,
  onBack,
  isLoading,
}: StepAddressProps) => {
  const { t } = useTranslation();
  const [attempted, setAttempted] = useState(false);

  const handleSubmit = () => {
    setAttempted(true);
    const errs = getErrors(data);
    if (Object.values(errs).every((e) => e === null)) {
      onSubmit();
    }
  };

  const errors = attempted
    ? getErrors(data)
    : {
        addressStreet: null,
        addressNumber: null,
        addressZip: null,
        addressCity: null,
        addressCountry: null,
      };

  return (
    <div className="signupStep">
      <div className="rowFields">
        <div className="grow">
          <StyledInputText
            label={`${t("account.signup.addressStreet")} *`}
            placeholder={t("account.signup.placeholders.addressStreet")}
            value={data.addressStreet}
            setValue={(v) => onChange({ ...data, addressStreet: v })}
            required
            width="100%"
          />
          {errors.addressStreet ? (
            <p className="fieldError">
              {t(`account.signup.errors.${errors.addressStreet}`)}
            </p>
          ) : null}
        </div>
        <div className="narrow">
          <StyledInputText
            label={`${t("account.signup.addressNumber")} *`}
            placeholder={t("account.signup.placeholders.addressNumber")}
            value={data.addressNumber}
            setValue={(v) => onChange({ ...data, addressNumber: v })}
            required
            width="100%"
          />
          {errors.addressNumber ? (
            <p className="fieldError">
              {t(`account.signup.errors.${errors.addressNumber}`)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rowFields">
        <div className="narrow">
          <StyledInputText
            label={`${t("account.signup.addressZip")} *`}
            value={data.addressZip}
            setValue={(v) => onChange({ ...data, addressZip: v })}
            placeholder="1000"
            required
            width="100%"
          />
          {errors.addressZip ? (
            <p className="fieldError">
              {t(`account.signup.errors.${errors.addressZip}`)}
            </p>
          ) : null}
        </div>
        <div className="grow">
          <StyledInputText
            label={`${t("account.signup.addressCity")} *`}
            placeholder={t("account.signup.placeholders.addressCity")}
            value={data.addressCity}
            setValue={(v) => onChange({ ...data, addressCity: v })}
            required
            width="100%"
          />
          {errors.addressCity ? (
            <p className="fieldError">
              {t(`account.signup.errors.${errors.addressCity}`)}
            </p>
          ) : null}
        </div>
      </div>

      <StyledInputText
        label={`${t("account.signup.addressCountry")} *`}
        value={data.addressCountry}
        setValue={(v) => onChange({ ...data, addressCountry: v })}
        placeholder="Belgique"
        required
        width="100%"
      />
      {errors.addressCountry ? (
        <p className="fieldError">
          {t(`account.signup.errors.${errors.addressCountry}`)}
        </p>
      ) : null}

      <StyledInputText
        label={t("account.signup.phone")}
        placeholder={t("account.signup.placeholders.phone")}
        value={data.phone}
        setValue={(v) => onChange({ ...data, phone: v })}
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
          label={t("account.signup.submit")}
          style="blue"
          onClick={handleSubmit}
          isLoading={isLoading}
          width="100%"
        />
      </div>
    </div>
  );
};

export default StepAddress;
