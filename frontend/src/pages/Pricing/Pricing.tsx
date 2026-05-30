import "./Pricing.scss";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import PriceSimulator from "@/components/PriceSimulator/PriceSimulator";
import SeoHead from "@/components/SeoHead/SeoHead";
import { PRICING_QUERY_PARAM } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import {
  type ArtistSummaryDto,
  fetchArtists,
} from "@/Utils/Services/Public/artistsApi";

const Pricing = () => {
  const { t } = useTranslation();
  const language = useOptionalLanguage();

  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam =
    searchParams.get(PRICING_QUERY_PARAM) ??
    searchParams.get("artist") ??
    undefined;
  const legacyArtistId = searchParams.get("artistId") ?? undefined;

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

  const presetArtistId = useMemo(() => {
    if (slugParam) {
      const matched = artists.find((a) => a.slug === slugParam);
      return matched?.id;
    }
    return legacyArtistId;
  }, [artists, slugParam, legacyArtistId]);

  useEffect(() => {
    if (loading || !slugParam) return;
    const matched = artists.find((a) => a.slug === slugParam);
    if (!matched) {
      toast(t("pricing.errors.artistNotFound"), { icon: "ℹ️" });
      const next = new URLSearchParams(searchParams);
      next.delete(PRICING_QUERY_PARAM);
      next.delete("artist");
      setSearchParams(next, { replace: true });
    }
  }, [loading, slugParam, artists, searchParams, setSearchParams, t]);

  const handleArtistChange = (artistId: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    next.delete("artist");
    if (!artistId) {
      next.delete(PRICING_QUERY_PARAM);
    } else {
      const matched = artists.find((a) => a.id === artistId);
      if (matched) {
        next.set(PRICING_QUERY_PARAM, matched.slug);
      } else {
        next.delete(PRICING_QUERY_PARAM);
      }
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="pricingPage">
      <SeoHead
        title={t("seo.pricing.title")}
        description={t("seo.pricing.description")}
        path="/pricing"
      />
      <header className="header">
        <h1>{t("pricing.title")}</h1>
        <p>{t("pricing.subtitle")}</p>
      </header>

      <PriceSimulator
        artists={artists}
        loading={loading}
        language={language}
        presetArtistId={presetArtistId}
        onArtistChange={handleArtistChange}
      />
    </div>
  );
};

export default Pricing;
