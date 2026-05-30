import "./Process.scss";

import { useTranslation } from "react-i18next";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaCommentDots,
  FaSearch,
} from "react-icons/fa";

const STEPS = [
  { key: "discover", icon: <FaSearch aria-hidden /> },
  { key: "brief", icon: <FaCommentDots aria-hidden /> },
  { key: "confirm", icon: <FaCalendarCheck aria-hidden /> },
  { key: "deliver", icon: <FaCheckCircle aria-hidden /> },
] as const;

const Process = () => {
  const { t } = useTranslation();

  return (
    <section className="process fi" data-section="process">
      <div className="inner">
        <header className="header">
          <p className="eyebrow">{t("home.process.eyebrow")}</p>
          <h2 className="title">{t("home.process.title")}</h2>
          <p className="subtitle">{t("home.process.subtitle")}</p>
        </header>

        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.key} className="step fi">
              <div className="stepIndex">{`${index + 1}`.padStart(2, "0")}</div>
              <div className="stepIcon">{step.icon}</div>
              <h3 className="stepTitle">
                {t(`home.process.steps.${step.key}.title`)}
              </h3>
              <p className="stepDesc">
                {t(`home.process.steps.${step.key}.desc`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Process;
