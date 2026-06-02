import "./Process.scss";

import { useTranslation } from "react-i18next";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaCommentDots,
  FaSearch,
} from "react-icons/fa";

import Bounded from "@/components/Bounded/Bounded";
import Section from "@/components/Section/Section";
import Surface from "@/components/Surface/Surface";

const STEPS = [
  { key: "discover", icon: <FaSearch aria-hidden /> },
  { key: "brief", icon: <FaCommentDots aria-hidden /> },
  { key: "confirm", icon: <FaCalendarCheck aria-hidden /> },
  { key: "deliver", icon: <FaCheckCircle aria-hidden /> },
] as const;

const Process = () => {
  const { t } = useTranslation();

  return (
    <Section className="process fi" data-section="process">
      <Bounded width="wide" className="inner">
        <Bounded as="header" width="text" className="header">
          <p className="eyebrow">{t("home.process.eyebrow")}</p>
          <h2 className="title">{t("home.process.title")}</h2>
          <p className="subtitle">{t("home.process.subtitle")}</p>
        </Bounded>

        <ol className="steps">
          {STEPS.map((step, index) => (
            <Surface as="li" key={step.key} className="step fi">
              <div className="stepIndex">{`${index + 1}`.padStart(2, "0")}</div>
              <div className="stepIcon">{step.icon}</div>
              <h3 className="stepTitle">
                {t(`home.process.steps.${step.key}.title`)}
              </h3>
              <p className="stepDesc">
                {t(`home.process.steps.${step.key}.desc`)}
              </p>
            </Surface>
          ))}
        </ol>
      </Bounded>
    </Section>
  );
};

export default Process;
