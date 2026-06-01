import "@/pages/ArtistDashboard/ArtistDashboard.scss";
import "./ArtistOnboardingContract.scss";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import { Button, Card, Checkbox, StyledInputText } from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import {
  type ArtistProfileDto,
  type EngagementContractDto,
  fetchArtistEngagementContract,
  fetchArtistProfile,
  patchArtistProfile,
  signArtistEngagementContract,
} from "@/Utils/Services/Authenticated/artistAreaApi";

const SIGNING_POLL_INTERVAL_MS = 3000;
const SIGNING_POLL_MAX_MS = 10 * 60 * 1000;

interface PersonalInfoForm {
  fullName: string;
  phone: string;
  address: string;
  country: string;
  vatNumber: string;
  companyNumber: string;
}

const emptyInfo = (): PersonalInfoForm => ({
  fullName: "",
  phone: "",
  address: "",
  country: "",
  vatNumber: "",
  companyNumber: "",
});

const profileToInfo = (profile: ArtistProfileDto): PersonalInfoForm => ({
  fullName: profile.full_name ?? "",
  phone: profile.phone ?? "",
  address: profile.address ?? "",
  country: profile.country ?? "",
  vatNumber: profile.vat_number ?? "",
  companyNumber: profile.company_number ?? "",
});

const requiredFieldsFilled = (info: PersonalInfoForm): boolean =>
  info.fullName.trim() !== "" &&
  info.phone.trim() !== "" &&
  info.address.trim() !== "" &&
  info.country.trim() !== "";

const ArtistOnboardingContract = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguage();

  const [contract, setContract] = useState<EngagementContractDto | null>(null);
  const [info, setInfo] = useState<PersonalInfoForm>(emptyInfo);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [awaitingWebhook, setAwaitingWebhook] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = async () => {
    const [contractRes, profileRes] = await Promise.all([
      fetchArtistEngagementContract(),
      fetchArtistProfile(),
    ]);
    setContract(contractRes);
    if (profileRes) setInfo(profileToInfo(profileRes));
    setLoading(false);
    return contractRes;
  };

  useEffect(() => {
    void reload();
  }, []);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setAwaitingWebhook(false);
  };

  useEffect(() => stopPolling, []);

  useEffect(() => {
    if (contract?.status === "signed") {
      const timer = setTimeout(() => {
        navigate(getPagePath("artistBookings", language));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [contract?.status, language, navigate]);

  const startPollingForSignature = () => {
    setAwaitingWebhook(true);
    const startedAt = Date.now();
    pollTimerRef.current = setInterval(async () => {
      const fresh = await reload();
      if (fresh?.status === "signed") {
        stopPolling();
        toast.success(t("onboarding.signed"));
      } else if (Date.now() - startedAt > SIGNING_POLL_MAX_MS) {
        stopPolling();
      }
    }, SIGNING_POLL_INTERVAL_MS);
  };

  const saveInfo = async () => {
    setSavingInfo(true);
    const updated = await patchArtistProfile({
      full_name: info.fullName.trim() || null,
      phone: info.phone.trim() || null,
      address: info.address.trim() || null,
      country: info.country.trim() || null,
      vat_number: info.vatNumber.trim() || null,
      company_number: info.companyNumber.trim() || null,
    });
    setSavingInfo(false);
    if (updated) {
      setInfo(profileToInfo(updated));
      toast.success(t("onboarding.infoSaved"));
    } else {
      toast.error(t("onboarding.errors.saveFailed"));
    }
  };

  const sign = async () => {
    if (!accepted) {
      toast.error(t("onboarding.errors.mustAccept"));
      return;
    }
    if (!requiredFieldsFilled(info)) {
      toast.error(t("onboarding.infoIncomplete"));
      return;
    }
    setSubmitting(true);
    const res = await signArtistEngagementContract();
    setSubmitting(false);

    if (!res) return;

    if (res.status === "signed") {
      toast.success(t("onboarding.signed"));
      await reload();
      return;
    }

    if (res.signingUrl) {
      window.open(res.signingUrl, "_blank", "noopener,noreferrer");
      await reload();
      startPollingForSignature();
    } else {
      toast.error(t("onboarding.errors.noSigningUrl"));
    }
  };

  if (loading) {
    return (
      <div className="artistDashboard">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  const isSigned = contract?.status === "signed";
  const isPending = contract?.status === "pending_signature";
  const canSign = accepted && requiredFieldsFilled(info);

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("onboarding.title")}
        description=""
        path="/artist/onboarding/contract"
      />
      <h1>{t("onboarding.title")}</h1>

      <Card className="panel">
        <h2>{t("onboarding.statusTitle")}</h2>
        <p>
          {isSigned
            ? t("onboarding.statusSigned", {
                date: new Date(contract.signedAt ?? "").toLocaleDateString(),
              })
            : isPending
              ? t("onboarding.statusAwaitingSignature")
              : t("onboarding.statusPending")}
        </p>
      </Card>

      {!isSigned ? (
        <>
          <Card className="panel">
            <h2>{t("onboarding.infoTitle")}</h2>
            <p className="mutedNote">{t("onboarding.infoBody")}</p>
            <div className="adminFormGrid">
              <StyledInputText
                label={t("onboarding.fields.fullName")}
                value={info.fullName}
                setValue={(v) => setInfo({ ...info, fullName: v })}
                placeholder="Jean Dupont"
                required
              />
              <StyledInputText
                label={t("onboarding.fields.phone")}
                value={info.phone}
                setValue={(v) => setInfo({ ...info, phone: v })}
                placeholder="+32 4xx xx xx xx"
                required
              />
              <StyledInputText
                label={t("onboarding.fields.address")}
                value={info.address}
                setValue={(v) => setInfo({ ...info, address: v })}
                placeholder="Rue, numéro, code postal, ville"
                required
              />
              <StyledInputText
                label={t("onboarding.fields.country")}
                value={info.country}
                setValue={(v) => setInfo({ ...info, country: v })}
                placeholder="Belgique"
                required
              />
              <StyledInputText
                label={t("onboarding.fields.vatNumber")}
                value={info.vatNumber}
                setValue={(v) => setInfo({ ...info, vatNumber: v })}
                placeholder="BE0123456789"
              />
              <StyledInputText
                label={t("onboarding.fields.companyNumber")}
                value={info.companyNumber}
                setValue={(v) => setInfo({ ...info, companyNumber: v })}
                placeholder="0123.456.789"
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Button
                label={t("common.save")}
                style="blue"
                isLoading={savingInfo}
                onClick={saveInfo}
              />
            </div>
          </Card>

          <Card className="panel">
            <h2>{t("onboarding.contractPreview")}</h2>
            <p>{t("onboarding.contractPreviewBody")}</p>
            <p className="mutedNote">{t("onboarding.providerNote")}</p>
            {!requiredFieldsFilled(info) ? (
              <p className="warningNote">{t("onboarding.infoIncomplete")}</p>
            ) : null}
            <Checkbox
              checked={accepted}
              onChange={setAccepted}
              label={t("onboarding.acceptTerms")}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Button
                label={
                  isPending
                    ? t("onboarding.resumeSigning")
                    : t("onboarding.sign")
                }
                style="blue"
                isLoading={submitting}
                disabled={!canSign}
                onClick={sign}
              />
            </div>
            {awaitingWebhook ? (
              <p className="mutedNote italic webhookNote">
                {t("onboarding.waitingForWebhook")}
              </p>
            ) : null}
          </Card>
        </>
      ) : (
        <Card className="panel">
          {contract?.signedPdfUrl ? (
            <a
              href={contract.signedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="accentLink"
            >
              {t("onboarding.downloadSigned")}
            </a>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default ArtistOnboardingContract;
