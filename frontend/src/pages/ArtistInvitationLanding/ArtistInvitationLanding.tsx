import "@/pages/ArtistLogin/ArtistLogin.scss";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  Checkbox,
  StyledInputPassword,
} from "@/covaltech-react-ui";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import {
  isPasswordTooShort,
  PASSWORD_MIN_LENGTH,
} from "@/Utils/passwordPolicy";
import {
  acceptArtistInvitation,
  fetchArtistInvitation,
} from "@/Utils/Services/Public/invitationApi";

interface InvitationMeta {
  email: string;
  stageName: string;
}

const ArtistInvitationLanding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const setSession = useArtistAuthStore((s) => s.setSession);

  const [meta, setMeta] = useState<InvitationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [cgu, setCgu] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(t("invitation.errors.missingToken"));
      setLoading(false);
      return;
    }
    void fetchArtistInvitation(token).then((res) => {
      if (!res) {
        setError(t("invitation.errors.invalid"));
      } else {
        setMeta({ email: res.email, stageName: res.stage_name });
      }
      setLoading(false);
    });
  }, [token, t]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordTooShort(password)) {
      toast.error(
        t("invitation.errors.passwordTooShort", {
          min: PASSWORD_MIN_LENGTH,
        }),
      );
      return;
    }
    if (password !== confirm) {
      toast.error(t("invitation.errors.passwordMismatch"));
      return;
    }
    if (!cgu || !privacy) {
      toast.error(t("invitation.errors.acceptRequired"));
      return;
    }
    setSubmitting(true);
    const result = await acceptArtistInvitation(token, {
      password,
      cguAccepted: cgu,
      privacyAccepted: privacy,
    });
    setSubmitting(false);
    if (!result) return;
    setSession({
      token: result.token,
      refreshToken: result.refreshToken,
      artist: result.artist,
    });
    navigate(getPagePath("artistOnboardingContract", language), {
      replace: true,
    });
  };

  if (loading) {
    return (
      <div className="authPage">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="authPage">
        <SeoHead
          title={t("invitation.title")}
          description=""
          path="/artist/invitation"
        />
        <Card className="authCard">
          <h1>{t("invitation.errorsTitle")}</h1>
          <p>{error ?? t("invitation.errors.invalid")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="authPage">
      <SeoHead
        title={t("invitation.title")}
        description=""
        path="/artist/invitation"
      />
      <h1>{t("invitation.welcome", { name: meta.stageName })}</h1>
      <form className="authForm" onSubmit={submit}>
        <p>{t("invitation.intro", { email: meta.email })}</p>
        <StyledInputPassword
          label={t("invitation.fields.password", { min: PASSWORD_MIN_LENGTH })}
          value={password}
          setValue={setPassword}
          required
          className="input"
          width="100%"
        />
        <StyledInputPassword
          label={t("invitation.fields.confirmPassword")}
          value={confirm}
          setValue={setConfirm}
          required
          className="input"
          width="100%"
        />
        <Checkbox
          checked={cgu}
          onChange={setCgu}
          label={t("invitation.fields.cgu")}
        />
        <Checkbox
          checked={privacy}
          onChange={setPrivacy}
          label={t("invitation.fields.privacy")}
        />
        <Button
          type="submit"
          label={t("invitation.submit")}
          style="blue"
          isLoading={submitting}
          width="100%"
        />
      </form>
    </div>
  );
};

export default ArtistInvitationLanding;
