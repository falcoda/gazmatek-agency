import "./ContractSection.scss";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { Button, Card, Checkbox } from "@/covaltech-react-ui";
import {
  type EngagementContractDto,
  fetchArtistEngagementContract,
  signArtistEngagementContract,
} from "@/Utils/Services/Authenticated/artistAreaApi";

const SIGNING_POLL_INTERVAL_MS = 3000;
const SIGNING_POLL_MAX_MS = 10 * 60 * 1000;

const ContractSection = () => {
  const { t } = useTranslation();
  const [contract, setContract] = useState<EngagementContractDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [awaitingWebhook, setAwaitingWebhook] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = async () => {
    const res = await fetchArtistEngagementContract();
    setContract(res);
    setLoading(false);
    return res;
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

  const startPollingForSignature = () => {
    setAwaitingWebhook(true);
    const startedAt = Date.now();
    pollTimerRef.current = setInterval(async () => {
      const fresh = await reload();
      if (fresh?.status === "signed") {
        stopPolling();
        toast.success(t("artistProfile.contract.signed"));
      } else if (Date.now() - startedAt > SIGNING_POLL_MAX_MS) {
        stopPolling();
      }
    }, SIGNING_POLL_INTERVAL_MS);
  };

  const sign = async () => {
    if (!accepted) {
      toast.error(t("artistProfile.contract.errors.mustAccept"));
      return;
    }
    setSubmitting(true);
    const res = await signArtistEngagementContract();
    setSubmitting(false);

    if (!res) return;

    if (res.status === "signed") {
      toast.success(t("artistProfile.contract.signed"));
      await reload();
      return;
    }

    if (res.signingUrl) {
      window.open(res.signingUrl, "_blank", "noopener,noreferrer");
      await reload();
      startPollingForSignature();
    } else {
      toast.error(t("artistProfile.contract.errors.noSigningUrl"));
    }
  };

  if (loading) {
    return (
      <Card className="panel">
        <h2>{t("artistProfile.sections.contract")}</h2>
        <p>{t("common.loading")}</p>
      </Card>
    );
  }

  const isSigned = contract?.status === "signed";
  const isPending = contract?.status === "pending_signature";

  return (
    <Card className="panel">
      <h2>{t("artistProfile.sections.contract")}</h2>
      <p>
        {isSigned
          ? t("artistProfile.contract.statusSigned", {
              date: new Date(contract.signedAt ?? "").toLocaleDateString(),
            })
          : isPending
            ? t("artistProfile.contract.statusAwaitingSignature")
            : t("artistProfile.contract.statusPending")}
      </p>

      {!isSigned ? (
        <>
          <p className="mutedNote">
            {t("artistProfile.contract.providerNote")}
          </p>
          <Checkbox
            checked={accepted}
            onChange={setAccepted}
            label={t("artistProfile.contract.acceptTerms")}
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
                  ? t("artistProfile.contract.resumeSigning")
                  : t("artistProfile.contract.sign")
              }
              style="blue"
              isLoading={submitting}
              onClick={sign}
            />
          </div>
          {awaitingWebhook ? (
            <p className="mutedNote italic webhookNote">
              {t("artistProfile.contract.waitingForWebhook")}
            </p>
          ) : null}
        </>
      ) : contract?.signedPdfUrl ? (
        <a
          href={contract.signedPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="accentLink"
        >
          {t("artistProfile.contract.downloadSigned")}
        </a>
      ) : null}
    </Card>
  );
};

export default ContractSection;
