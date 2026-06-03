import "./AdminSettings.scss";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import SeoHead from "@/components/SeoHead/SeoHead";
import SignaturePad from "@/components/SignaturePad/SignaturePad";
import { Button, Card, Modal, StyledInputText } from "@/covaltech-react-ui";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import {
  type AdminAgencyInfo,
  deleteAdminAgencySignature,
  fetchAdminAgencyInfo,
  fetchAdminAgencySignature,
  putAdminAgencyInfo,
  uploadAdminAgencySignature,
} from "@/Utils/Services/Authenticated/adminAreaApi";

// Decode a PNG `data:` URL produced by the SignaturePad canvas back into a
// binary Blob so we can submit it via multipart upload.
const dataUrlToBlob = (dataUrl: string): Blob => {
  const [meta, base64] = dataUrl.split(",");
  const match = meta.match(/data:(.+);base64/);
  const mime = match?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
};

const EMPTY_INFO: AdminAgencyInfo = {
  name: "",
  representative: "",
  address: "",
  city: "",
  companyNumber: "",
  vatNumber: "",
  email: "",
  iban: "",
};

const normalize = (info: AdminAgencyInfo | null): AdminAgencyInfo => ({
  name: info?.name ?? "",
  representative: info?.representative ?? "",
  address: info?.address ?? "",
  city: info?.city ?? "",
  companyNumber: info?.companyNumber ?? "",
  vatNumber: info?.vatNumber ?? "",
  email: info?.email ?? "",
  iban: info?.iban ?? "",
});

const AdminSettings = () => {
  const { t } = useTranslation();
  const admin = useAdminAuthStore((s) => s.admin);

  // Signature state
  const [currentDataUrl, setCurrentDataUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [isLoadingSignature, setIsLoadingSignature] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [isRemovingSignature, setIsRemovingSignature] = useState(false);

  // Company info state
  const [info, setInfo] = useState<AdminAgencyInfo>(EMPTY_INFO);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  useEffect(() => {
    if (!admin) return;

    setIsLoadingSignature(true);
    fetchAdminAgencySignature()
      .then((res) => {
        setCurrentDataUrl(res?.signature_image_data_url ?? null);
      })
      .finally(() => setIsLoadingSignature(false));

    setIsLoadingInfo(true);
    fetchAdminAgencyInfo()
      .then((res) => {
        setInfo(normalize(res));
      })
      .finally(() => setIsLoadingInfo(false));
  }, [admin]);

  const handleSaveSignature = async (onClose: () => void) => {
    if (!draft) return;
    setIsSavingSignature(true);
    try {
      const blob = dataUrlToBlob(draft);
      const res = await uploadAdminAgencySignature(blob);
      if (res) {
        setCurrentDataUrl(res.signature_image_data_url);
        setDraft(null);
        setResetKey((k) => k + 1);
        toast.success(t("admin.settings.signature.saved"));
        onClose();
      } else {
        toast.error(t("admin.settings.signature.saveFailed"));
      }
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleRemoveSignature = async () => {
    setIsRemovingSignature(true);
    try {
      const res = await deleteAdminAgencySignature();
      if (res) {
        setCurrentDataUrl(null);
        toast.success(t("admin.settings.signature.removed"));
      }
    } finally {
      setIsRemovingSignature(false);
    }
  };

  const updateInfoField = (key: keyof AdminAgencyInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    try {
      const res = await putAdminAgencyInfo(info);
      if (res) {
        setInfo(normalize(res));
        toast.success(t("admin.settings.companyInfo.saved"));
      } else {
        toast.error(t("admin.settings.companyInfo.saveFailed"));
      }
    } finally {
      setIsSavingInfo(false);
    }
  };

  return (
    <div className="adminSettings">
      <SeoHead
        title={t("admin.settings.title")}
        description=""
        path="/admin/settings"
      />
      <h1>{t("admin.settings.title")}</h1>

      <Card className="panel signatureSection">
        <h2>{t("admin.settings.signature.title")}</h2>
        <p className="sectionCopy">{t("admin.settings.signature.copy")}</p>

        <div className="signaturePreviewBox">
          {isLoadingSignature ? (
            <p>{t("admin.settings.signature.loading")}</p>
          ) : currentDataUrl ? (
            <img
              src={currentDataUrl}
              alt={t("admin.settings.signature.previewAlt")}
            />
          ) : (
            <p>{t("admin.settings.signature.empty")}</p>
          )}
        </div>

        <div className="signatureActions">
          <Modal
            className="signatureModal"
            modalTitle={t("admin.settings.signature.title")}
            modalCloseIcon
            modalButton={({ onClick }) => (
              <Button
                label={
                  currentDataUrl
                    ? t("admin.settings.signature.replace")
                    : t("admin.settings.signature.create")
                }
                style="blue"
                onClick={onClick}
              />
            )}
            modalContent={
              <SignaturePad
                resetKey={resetKey}
                onChange={setDraft}
                hint={t("admin.settings.signature.hint")}
              />
            }
            modalFooterButton={({ onClose }) => (
              <Button
                label={t("admin.settings.signature.save")}
                style="blue"
                isLoading={isSavingSignature}
                disabled={!draft}
                onClick={() => void handleSaveSignature(onClose)}
              />
            )}
            onClick={() => {
              setDraft(null);
              setResetKey((k) => k + 1);
            }}
          />
          <Button
            label={t("admin.settings.signature.remove")}
            style="white"
            onClick={() => void handleRemoveSignature()}
            isLoading={isRemovingSignature}
            disabled={!currentDataUrl}
          />
        </div>
      </Card>

      <Card className="panel companyInfoSection">
        <h2>{t("admin.settings.companyInfo.title")}</h2>
        <p className="sectionCopy">{t("admin.settings.companyInfo.copy")}</p>

        <div className="companyInfoGrid">
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.name")}
            value={info.name ?? ""}
            setValue={(v: string) => updateInfoField("name", v)}
            width="100%"
          />
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.representative")}
            value={info.representative ?? ""}
            setValue={(v: string) => updateInfoField("representative", v)}
            width="100%"
          />
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.address")}
            value={info.address ?? ""}
            setValue={(v: string) => updateInfoField("address", v)}
            width="100%"
          />
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.city")}
            value={info.city ?? ""}
            setValue={(v: string) => updateInfoField("city", v)}
            width="100%"
          />
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.companyNumber")}
            value={info.companyNumber ?? ""}
            setValue={(v: string) => updateInfoField("companyNumber", v)}
            width="100%"
          />
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.vatNumber")}
            value={info.vatNumber ?? ""}
            setValue={(v: string) => updateInfoField("vatNumber", v)}
            width="100%"
          />
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.email")}
            value={info.email ?? ""}
            setValue={(v: string) => updateInfoField("email", v)}
            width="100%"
          />
          <StyledInputText
            label={t("admin.settings.companyInfo.fields.iban")}
            value={info.iban ?? ""}
            setValue={(v: string) => updateInfoField("iban", v)}
            width="100%"
          />
        </div>

        <div className="formActions">
          <Button
            label={t("admin.settings.companyInfo.save")}
            style="blue"
            isLoading={isSavingInfo}
            disabled={isLoadingInfo}
            onClick={() => void handleSaveInfo()}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
