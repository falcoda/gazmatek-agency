import "./CtaBanner.scss";

import { useTranslation } from "react-i18next";

import BookingCta from "@/components/BookingCta/BookingCta";
import Bounded from "@/components/Bounded/Bounded";
import Section from "@/components/Section/Section";

const CtaBanner = () => {
  const { t } = useTranslation();

  return (
    <Section className="ctaBanner" aria-labelledby="cta-banner-title">
      <Bounded width="text" className="inner fi">
        <h2 id="cta-banner-title" className="title">
          {t("home.ctaBanner.title")}
        </h2>
        <p className="subtitle">{t("home.ctaBanner.subtitle")}</p>
        <BookingCta variant="primary" />
      </Bounded>
    </Section>
  );
};

export default CtaBanner;
