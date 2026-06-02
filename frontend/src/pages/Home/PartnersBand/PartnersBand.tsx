import "./PartnersBand.scss";

import { useTranslation } from "react-i18next";

import Bounded from "@/components/Bounded/Bounded";
import Section from "@/components/Section/Section";

const PARTNERS = [
  "BOTANIQUE",
  "FUSE",
  "MAGASIN 4",
  "C12",
  "PARADISO",
  "VK CONCERTS",
  "DECIBEL",
  "DOUR",
] as const;

const PartnersBand = () => {
  const { t } = useTranslation();

  return (
    <Section className="partnersBand fi" data-section="partnersBand">
      <Bounded width="wide" className="inner">
        <p className="title">{t("home.partners.title")}</p>
        <ul className="list">
          {PARTNERS.map((partner) => (
            <li key={partner} className="item">
              {partner}
            </li>
          ))}
        </ul>
      </Bounded>
    </Section>
  );
};

export default PartnersBand;
