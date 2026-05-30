import "./PartnersBand.scss";

import { useTranslation } from "react-i18next";

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
    <section className="partnersBand fi" data-section="partnersBand">
      <div className="inner">
        <p className="title">{t("home.partners.title")}</p>
        <ul className="list">
          {PARTNERS.map((partner) => (
            <li key={partner} className="item">
              {partner}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PartnersBand;
