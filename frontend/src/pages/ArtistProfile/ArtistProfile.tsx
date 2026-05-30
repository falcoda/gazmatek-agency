import "@/pages/ArtistDashboard/ArtistDashboard.scss";
import "./ArtistProfile.scss";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import SeoHead from "@/components/SeoHead/SeoHead";
import {
  Button,
  Card,
  StyledInputFile,
  StyledInputPassword,
  StyledInputText,
  StyledInputTextArea,
} from "@/covaltech-react-ui";
import ContractSection from "@/pages/ArtistProfile/ContractSection/ContractSection";
import {
  isPasswordTooShort,
  PASSWORD_MIN_LENGTH,
} from "@/Utils/passwordPolicy";
import {
  changeArtistPassword,
  fetchArtistProfile,
  patchArtistProfile,
  uploadArtistCoverImage,
} from "@/Utils/Services/Authenticated/artistAreaApi";

const SOCIAL_NETWORK_KEYS = [
  "instagram",
  "soundcloud",
  "spotify",
  "youtube",
  "tiktok",
  "facebook",
  "bandcamp",
  "website",
] as const;

type SocialNetworkKey = (typeof SOCIAL_NETWORK_KEYS)[number];
type SocialLinksForm = Record<SocialNetworkKey, string>;

const SOCIAL_PLACEHOLDERS: Record<SocialNetworkKey, string> = {
  instagram: "https://instagram.com/…",
  soundcloud: "https://soundcloud.com/…",
  spotify: "https://open.spotify.com/artist/…",
  youtube: "https://youtube.com/@…",
  tiktok: "https://tiktok.com/@…",
  facebook: "https://facebook.com/…",
  bandcamp: "https://….bandcamp.com",
  website: "https://…",
};

interface ProfileForm extends Record<string, unknown> {
  stageName: string;
  slug: string;
  coverImageUrl: string;
  fullName: string;
  phone: string;
  address: string;
  country: string;
  vatNumber: string;
  companyNumber: string;
  bioFr: string;
  bioNl: string;
  bioEn: string;
  technicalInfoFr: string;
  technicalInfoNl: string;
  technicalInfoEn: string;
  socialLinks: SocialLinksForm;
}

function buildEmptySocialLinks(): SocialLinksForm {
  return SOCIAL_NETWORK_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {} as SocialLinksForm);
}

function mapSocialLinks(
  existing?: Record<string, unknown> | null,
): SocialLinksForm {
  const form = buildEmptySocialLinks();
  if (!existing) return form;
  for (const key of SOCIAL_NETWORK_KEYS) {
    const value = existing[key];
    if (typeof value === "string") form[key] = value;
  }
  return form;
}

const EMPTY: ProfileForm = {
  stageName: "",
  slug: "",
  coverImageUrl: "",
  fullName: "",
  phone: "",
  address: "",
  country: "",
  vatNumber: "",
  companyNumber: "",
  bioFr: "",
  bioNl: "",
  bioEn: "",
  technicalInfoFr: "",
  technicalInfoNl: "",
  technicalInfoEn: "",
  socialLinks: buildEmptySocialLinks(),
};

const ArtistProfile = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    void fetchArtistProfile().then((res) => {
      if (res) {
        setForm({
          stageName: res.stage_name ?? "",
          slug: res.slug ?? "",
          coverImageUrl: res.cover_image_url ?? "",
          fullName: res.full_name ?? "",
          phone: res.phone ?? "",
          address: res.address ?? "",
          country: res.country ?? "",
          vatNumber: res.vat_number ?? "",
          companyNumber: res.company_number ?? "",
          bioFr: res.bio_fr ?? "",
          bioNl: res.bio_nl ?? "",
          bioEn: res.bio_en ?? "",
          technicalInfoFr: res.technical_info_fr ?? "",
          technicalInfoNl: res.technical_info_nl ?? "",
          technicalInfoEn: res.technical_info_en ?? "",
          socialLinks: mapSocialLinks(res.social_links),
        });
      }
      setLoading(false);
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const socialLinksParsed: Record<string, string> = {};
    for (const key of SOCIAL_NETWORK_KEYS) {
      const value = form.socialLinks[key].trim();
      if (value) socialLinksParsed[key] = value;
    }
    setSaving(true);
    const result = await patchArtistProfile({
      bio_fr: form.bioFr,
      bio_nl: form.bioNl,
      bio_en: form.bioEn,
      technical_info_fr: form.technicalInfoFr,
      technical_info_nl: form.technicalInfoNl,
      technical_info_en: form.technicalInfoEn,
      social_links: socialLinksParsed,
      full_name: form.fullName || null,
      phone: form.phone || null,
      address: form.address || null,
      country: form.country || null,
      vat_number: form.vatNumber || null,
      company_number: form.companyNumber || null,
    });
    setSaving(false);
    if (result) {
      toast.success(t("artistProfile.saved"));
    }
  };

  const handleCoverUpload = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("artistProfile.errors.fileTooLarge"));
      return;
    }
    setUploading(true);
    const res = await uploadArtistCoverImage(file);
    setUploading(false);
    if (res) {
      setForm((prev) => ({ ...prev, coverImageUrl: res.url }));
      toast.success(t("artistProfile.uploadSuccess"));
    } else {
      toast.error(t("artistProfile.errors.uploadFailed"));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordTooShort(newPassword)) {
      toast.error(
        t("artistProfile.errors.passwordTooShort", {
          min: PASSWORD_MIN_LENGTH,
        }),
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("artistProfile.errors.passwordMismatch"));
      return;
    }
    setChangingPassword(true);
    const ok = await changeArtistPassword(currentPassword, newPassword);
    setChangingPassword(false);
    if (ok) {
      toast.success(t("artistProfile.passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(t("artistProfile.errors.passwordChangeFailed"));
    }
  };

  if (loading) {
    return (
      <div className="artistDashboard">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("artistProfile.title")}
        description=""
        path="/artist/profile"
      />
      <h1>{t("artistProfile.title")}</h1>

      <Card className="panel">
        <h2>{t("artistProfile.sections.identity")}</h2>
        <div className="adminFormGrid">
          <StyledInputText
            label={t("artistProfile.fields.stageName")}
            value={form.stageName}
            setValue={() => undefined}
            disabled
          />
          <StyledInputText
            label={t("artistProfile.fields.slug")}
            value={form.slug}
            setValue={() => undefined}
            disabled
          />
        </div>
      </Card>

      <Card className="panel">
        <h2>{t("artistProfile.sections.personal")}</h2>
        <div className="adminFormGrid">
          <StyledInputText
            label={t("artistProfile.fields.fullName")}
            value={form.fullName}
            setValue={(v) => setForm({ ...form, fullName: v })}
            placeholder="Jean Dupont"
          />
          <StyledInputText
            label={t("artistProfile.fields.phone")}
            value={form.phone}
            setValue={(v) => setForm({ ...form, phone: v })}
            placeholder="+32 4xx xx xx xx"
          />
          <StyledInputText
            label={t("artistProfile.fields.address")}
            value={form.address}
            setValue={(v) => setForm({ ...form, address: v })}
            placeholder="Rue, numéro, code postal, ville"
          />
          <StyledInputText
            label={t("artistProfile.fields.country")}
            value={form.country}
            setValue={(v) => setForm({ ...form, country: v })}
            placeholder="Belgique"
          />
          <StyledInputText
            label={t("artistProfile.fields.vatNumber")}
            value={form.vatNumber}
            setValue={(v) => setForm({ ...form, vatNumber: v })}
            placeholder="BE0123456789"
          />
          <StyledInputText
            label={t("artistProfile.fields.companyNumber")}
            value={form.companyNumber}
            setValue={(v) => setForm({ ...form, companyNumber: v })}
            placeholder="0123.456.789"
          />
        </div>
      </Card>

      <Card className="panel">
        <h2>{t("artistProfile.sections.password")}</h2>
        <form onSubmit={handleChangePassword}>
          <div className="adminFormGrid">
            <StyledInputPassword
              label={t("artistProfile.fields.currentPassword")}
              value={currentPassword}
              setValue={setCurrentPassword}
              required
              width="100%"
            />
            <StyledInputPassword
              label={t("artistProfile.fields.newPassword", {
                min: PASSWORD_MIN_LENGTH,
              })}
              value={newPassword}
              setValue={setNewPassword}
              required
              width="100%"
            />
            <StyledInputPassword
              label={t("artistProfile.fields.confirmPassword")}
              value={confirmPassword}
              setValue={setConfirmPassword}
              required
              width="100%"
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
              type="submit"
              label={t("artistProfile.changePassword")}
              style="blue"
              isLoading={changingPassword}
            />
          </div>
        </form>
      </Card>

      <ContractSection />

      <form onSubmit={save} className="panelStack">
        <Card className="panel">
          <h2>{t("artistProfile.sections.cover")}</h2>
          {form.coverImageUrl ? (
            <img
              src={form.coverImageUrl}
              alt={form.stageName}
              style={{
                width: "100%",
                maxWidth: "320px",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
          ) : (
            <p className="coverHint">{t("artistProfile.coverHint")}</p>
          )}
          <StyledInputFile
            label={t("artistProfile.fields.coverUpload")}
            accept="image/jpeg,image/png,image/webp"
            setValue={(file) => {
              void handleCoverUpload(file);
            }}
          />
        </Card>

        <Card className="panel">
          <h2>{t("artistProfile.sections.bios")}</h2>
          <div className="adminContentGrid">
            <StyledInputTextArea
              label={t("artistProfile.fields.bioFr")}
              value={form.bioFr}
              setValue={(v) => setForm({ ...form, bioFr: v })}
              style={{ minHeight: "140px" }}
            />
            <StyledInputTextArea
              label={t("artistProfile.fields.bioNl")}
              value={form.bioNl}
              setValue={(v) => setForm({ ...form, bioNl: v })}
              style={{ minHeight: "140px" }}
            />
            <StyledInputTextArea
              label={t("artistProfile.fields.bioEn")}
              value={form.bioEn}
              setValue={(v) => setForm({ ...form, bioEn: v })}
              style={{ minHeight: "140px" }}
            />
          </div>
        </Card>

        <Card className="panel">
          <h2>{t("artistProfile.sections.technical")}</h2>
          <div className="adminContentGrid">
            <StyledInputTextArea
              label={t("artistProfile.fields.technicalFr")}
              value={form.technicalInfoFr}
              setValue={(v) => setForm({ ...form, technicalInfoFr: v })}
              style={{ minHeight: "100px" }}
            />
            <StyledInputTextArea
              label={t("artistProfile.fields.technicalNl")}
              value={form.technicalInfoNl}
              setValue={(v) => setForm({ ...form, technicalInfoNl: v })}
              style={{ minHeight: "100px" }}
            />
            <StyledInputTextArea
              label={t("artistProfile.fields.technicalEn")}
              value={form.technicalInfoEn}
              setValue={(v) => setForm({ ...form, technicalInfoEn: v })}
              style={{ minHeight: "100px" }}
            />
          </div>
        </Card>

        <Card className="panel">
          <h2>{t("artistProfile.sections.social")}</h2>
          <div className="adminFormGrid">
            {SOCIAL_NETWORK_KEYS.map((key) => (
              <StyledInputText
                key={key}
                label={t(`artistProfile.fields.social.${key}`)}
                value={form.socialLinks[key]}
                setValue={(v) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, [key]: v },
                  })
                }
                placeholder={SOCIAL_PLACEHOLDERS[key]}
              />
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button
            type="submit"
            label={t("common.save")}
            style="blue"
            isLoading={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default ArtistProfile;
