import "./CtaBanner.scss";

import { useTranslation } from "react-i18next";

import BookingCta from "@/components/BookingCta/BookingCta";

const CtaBanner = () => {
  const { t } = useTranslation();

  return (
    <section className="ctaBanner" aria-labelledby="cta-banner-title">
      <div className="inner fi">
        <h2 id="cta-banner-title" className="title">
          {t("home.ctaBanner.title")}
        </h2>
        <p className="subtitle">{t("home.ctaBanner.subtitle")}</p>
        <BookingCta variant="primary" />
      </div>
    </section>
  );
};

export default CtaBanner;
