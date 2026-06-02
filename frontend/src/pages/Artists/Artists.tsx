import "./Artists.scss";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import Bounded from "@/components/Bounded/Bounded";
import Section from "@/components/Section/Section";
import SeoHead from "@/components/SeoHead/SeoHead";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import {
  type ArtistListResponse,
  fetchArtists,
} from "@/Utils/Services/Public/artistsApi";

import ArtistGrid from "./ArtistGrid/ArtistGrid";
import Filters, { type ArtistsFiltersState } from "./Filters/Filters";

const PAGE_SIZE = 24;

const Artists = () => {
  const { t } = useTranslation();
  const language = useOptionalLanguage();

  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ArtistListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const filters = useMemo<ArtistsFiltersState>(
    () => ({
      genre: searchParams.get("genre") ?? "",
      date: searchParams.get("date") ?? "",
    }),
    [searchParams],
  );

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchArtists({
      genre: filters.genre || undefined,
      availableOn: filters.date || undefined,
      page,
      pageSize: PAGE_SIZE,
      lang: language,
    })
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page, language]);

  useScrollAnimation();

  const handleFiltersChange = (next: ArtistsFiltersState) => {
    const params = new URLSearchParams();
    if (next.genre) params.set("genre", next.genre);
    if (next.date) params.set("date", next.date);
    setSearchParams(params, { replace: false });
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams(), { replace: false });
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  return (
    <Section>
      <Bounded width="wide" className="artistsPage">
        <SeoHead
          title={t("seo.artists.title")}
          description={t("seo.artists.description")}
          path="/artists"
        />

        <header className="header">
          <h1>{t("artists.pageTitle")}</h1>
          <p>{t("artists.pageSubtitle")}</p>
        </header>

        <Filters
          value={filters}
          onChange={handleFiltersChange}
          onReset={handleReset}
        />

        <ArtistGrid
          data={data}
          loading={loading}
          language={language}
          onReset={handleReset}
          onPageChange={handlePageChange}
        />
      </Bounded>
    </Section>
  );
};

export default Artists;
