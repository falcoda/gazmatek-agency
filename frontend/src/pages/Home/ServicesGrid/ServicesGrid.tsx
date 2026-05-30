import "./ServicesGrid.scss";

import { useTranslation } from "react-i18next";
import { FaHeadphones, FaMusic, FaSlidersH } from "react-icons/fa";

interface ServiceItem {
  key: "dj" | "live" | "production";
  icon: React.ReactNode;
}

const SERVICES: readonly ServiceItem[] = [
  { key: "dj", icon: <FaHeadphones aria-hidden /> },
  { key: "live", icon: <FaMusic aria-hidden /> },
  { key: "production", icon: <FaSlidersH aria-hidden /> },
] as const;

const ServicesGrid = () => {
  const { t } = useTranslation();

  return (
    <section className="servicesGrid" aria-labelledby="services-title">
      <header className="header">
        <h2 id="services-title" className="title">
          {t("home.services.title")}
        </h2>
        <p className="subtitle">{t("home.services.subtitle")}</p>
      </header>

      <ul className="list">
        {SERVICES.map(({ key, icon }) => (
          <li key={key} className="item fi">
            <div className="icon">{icon}</div>
            <h3 className="name">{t(`home.services.${key}.title`)}</h3>
            <p className="desc">{t(`home.services.${key}.description`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ServicesGrid;
