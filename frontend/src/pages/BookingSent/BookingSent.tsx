import "./BookingSent.scss";

import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";

const BookingSent = () => {
  const { t } = useTranslation();
  const language = useOptionalLanguage();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="bookingSent">
      <SeoHead
        title={t("booking.sent.title")}
        description=""
        path="/booking/sent"
      />
      <h1>{t("booking.sent.title")}</h1>
      <p>
        {t("booking.sent.body")} {email ? <strong>{email}</strong> : null}
      </p>
      <Link to={getPagePath("main", language)} className="back">
        ← {t("notFound.back")}
      </Link>
    </div>
  );
};

export default BookingSent;
