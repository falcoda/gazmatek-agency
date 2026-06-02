import "./PricingTeaser.scss";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Bounded from "@/components/Bounded/Bounded";
import PriceSimulator from "@/components/PriceSimulator/PriceSimulator";
import Section from "@/components/Section/Section";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import {
  type ArtistSummaryDto,
  fetchArtists,
} from "@/Utils/Services/Public/artistsApi";

const PricingTeaser = () => {
  const { t } = useTranslation();
  const language = useOptionalLanguage();
  const [artists, setArtists] = useState<ArtistSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchArtists({ pageSize: 50, lang: language })
      .then((res) => {
        if (cancelled) return;
        setArtists(res?.data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  return (
    <Section className="pricingTeaser fi" data-section="pricingTeaser">
      <Bounded width="wide" className="inner">
        <Bounded as="header" width="text" className="header">
          <h2 className="title">{t("home.pricingTeaser.title")}</h2>
          <p className="subtitle">{t("home.pricingTeaser.subtitle")}</p>
          <p className="counter">
            {t("home.pricingTeaser.counter", { count: artists.length })}
          </p>
        </Bounded>

        <PriceSimulator
          artists={artists}
          loading={loading}
          language={language}
        />
      </Bounded>
    </Section>
  );
};

export default PricingTeaser;
