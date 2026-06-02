import "./HomeFaq.scss";

import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import Bounded from "@/components/Bounded/Bounded";
import FaqAccordion, {
  type FaqItem,
} from "@/components/FaqAccordion/FaqAccordion";
import Section from "@/components/Section/Section";

const HomeFaq = () => {
  const { t } = useTranslation();

  const items: FaqItem[] = [
    { q: t("home.faq.q1.q"), a: t("home.faq.q1.a") },
    { q: t("home.faq.q2.q"), a: t("home.faq.q2.a") },
    { q: t("home.faq.q3.q"), a: t("home.faq.q3.a") },
    { q: t("home.faq.q4.q"), a: t("home.faq.q4.a") },
  ];

  // FAQPage JSON-LD built from the same localized Q/A pairs so the rich result
  // matches what users see. (#37)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <Section className="homeFaq fi" data-section="homeFaq">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <Bounded width="narrow" className="inner">
        <h2 className="title">{t("home.faq.title")}</h2>
        <p className="subtitle">{t("home.faq.subtitle")}</p>
        <FaqAccordion items={items} defaultOpenIndex={0} />
      </Bounded>
    </Section>
  );
};

export default HomeFaq;
