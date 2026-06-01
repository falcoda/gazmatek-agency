import "./OurStory.scss";

import { useTranslation } from "react-i18next";

import AnimatedCounter from "@/components/AnimatedCounter/AnimatedCounter";

const FOUNDED_YEAR = 2016;

const OurStory = () => {
  const { t } = useTranslation();
  const yearsActive = new Date().getFullYear() - FOUNDED_YEAR;

  return (
    <section className="ourStory fi" data-section="ourStory">
      <div className="inner">
        <div className="copy">
          <h2 className="title">{t("home.ourStory.title")}</h2>
          <p className="paragraph">{t("home.ourStory.intro")}</p>
          <p className="paragraph">{t("home.ourStory.mission")}</p>
        </div>
        <ul className="stats">
          <li className="stat">
            <AnimatedCounter value={yearsActive} className="statValue" />
            <span className="statLabel">{t("home.ourStory.statYears")}</span>
          </li>
          <li className="stat">
            <AnimatedCounter value={180} suffix="+" className="statValue" />
            <span className="statLabel">{t("home.ourStory.statEvents")}</span>
          </li>
          <li className="stat">
            <AnimatedCounter value={40} suffix="+" className="statValue" />
            <span className="statLabel">{t("home.ourStory.statArtists")}</span>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default OurStory;
