import "./Contact.scss";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

import Bounded from "@/components/Bounded/Bounded";
import Section from "@/components/Section/Section";
import SeoHead from "@/components/SeoHead/SeoHead";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SOCIAL_LINKS,
} from "@/config/socials";
import {
  Button,
  StyledInputEmail,
  StyledInputText,
  StyledInputTextArea,
} from "@/covaltech-react-ui";
import type { AppLanguage } from "@/i18n/config";
import { DEFAULT_LANGUAGE } from "@/i18n/config";
import { postContactMessage } from "@/Utils/Services/Public/contactApi";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LEN = 20;

const Contact = () => {
  const { t, i18n } = useTranslation();
  // Drives the language of the acknowledgement email the sender receives.
  const language = (i18n.resolvedLanguage ?? DEFAULT_LANGUAGE) as AppLanguage;
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (state: FormState) => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!state.name.trim()) next.name = t("contact.errors.nameRequired");
    if (!state.email.trim()) next.email = t("contact.errors.emailRequired");
    else if (!EMAIL_RE.test(state.email))
      next.email = t("contact.errors.emailInvalid");
    if (!state.subject.trim())
      next.subject = t("contact.errors.subjectRequired");
    if (!state.message.trim())
      next.message = t("contact.errors.messageRequired");
    else if (state.message.trim().length < MIN_MESSAGE_LEN)
      next.message = t("contact.errors.messageTooShort");
    return next;
  };

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    const res = await postContactMessage({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      locale: language,
      website: form.website,
    });
    setSubmitting(false);

    if (res) {
      toast.success(t("contact.form.success"));
      setForm(INITIAL_STATE);
    } else {
      toast.error(t("contact.form.error"));
    }
  };

  return (
    <Section>
      <Bounded width="wide" className="contactPage">
        <SeoHead
          title={t("seo.contact.title")}
          description={t("seo.contact.description")}
          path="/contact"
        />
        <Bounded as="header" width="text" className="header">
          <h1>{t("contact.title")}</h1>
          <p>{t("contact.subtitle")}</p>
        </Bounded>

        <div className="grid">
          <form className="contactForm" onSubmit={handleSubmit} noValidate>
            <div className="row row--split">
              <div className="field">
                <StyledInputText
                  label={t("contact.form.name")}
                  placeholder={t("contact.form.namePlaceholder")}
                  value={form.name}
                  setValue={(v) => handleChange("name", v)}
                  required
                  width="100%"
                />
                {errors.name ? <p className="error">{errors.name}</p> : null}
              </div>

              <div className="field">
                <StyledInputEmail
                  label={t("contact.form.email")}
                  placeholder={t("contact.form.emailPlaceholder")}
                  value={form.email}
                  setValue={(v) => handleChange("email", v)}
                  required
                  width="100%"
                />
                {errors.email ? <p className="error">{errors.email}</p> : null}
              </div>
            </div>

            <div className="field">
              <StyledInputText
                label={t("contact.form.subject")}
                placeholder={t("contact.form.subjectPlaceholder")}
                value={form.subject}
                setValue={(v) => handleChange("subject", v)}
                required
                width="100%"
              />
              {errors.subject ? (
                <p className="error">{errors.subject}</p>
              ) : null}
            </div>

            <div className="field field--message">
              <StyledInputTextArea
                label={t("contact.form.message")}
                placeholder={t("contact.form.messagePlaceholder")}
                value={form.message}
                setValue={(v) => handleChange("message", v)}
                required
                width="100%"
                style={{ minHeight: "200px", maxWidth: "100%" }}
              />
              {errors.message ? (
                <p className="error">{errors.message}</p>
              ) : null}
            </div>

            <div className="honeypot" aria-hidden="true">
              <StyledInputText
                label="Website"
                value={form.website}
                setValue={(v) => handleChange("website", v)}
              />
            </div>

            <Button
              type="submit"
              label={t("contact.form.submit")}
              style="blue"
              isLoading={submitting}
              width="100%"
            />
          </form>

          <aside className="contactCoordinates">
            <h2>{t("contact.coordinates.title")}</h2>
            <ul>
              <li>
                <span className="icon" aria-hidden>
                  <FaEnvelope />
                </span>
                <div className="meta">
                  <span className="metaLabel">
                    {t("contact.coordinates.email")}
                  </span>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </div>
              </li>
              <li>
                <span className="icon" aria-hidden>
                  <FaPhone />
                </span>
                <div className="meta">
                  <span className="metaLabel">
                    {t("contact.coordinates.phone")}
                  </span>
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}>
                    {CONTACT_PHONE}
                  </a>
                </div>
              </li>
              <li>
                <span className="icon" aria-hidden>
                  <FaMapMarkerAlt />
                </span>
                <div className="meta">
                  <span className="metaLabel">
                    {t("contact.coordinates.address")}
                  </span>
                  <address>
                    {CONTACT_ADDRESS.street}
                    <br />
                    {CONTACT_ADDRESS.postalCode} {CONTACT_ADDRESS.city}
                    <br />
                    {CONTACT_ADDRESS.country}
                  </address>
                </div>
              </li>
            </ul>
            <div className="socials">
              {Object.entries(SOCIAL_LINKS)
                .filter(([, url]) => url && url !== "#")
                .map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {platform}
                  </a>
                ))}
            </div>
          </aside>
        </div>
      </Bounded>
    </Section>
  );
};

export default Contact;
