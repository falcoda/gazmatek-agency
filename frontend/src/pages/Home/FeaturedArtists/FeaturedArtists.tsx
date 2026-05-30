import "./FeaturedArtists.scss";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getPagePath } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import {
  type ArtistSummaryDto,
  fetchArtists,
} from "@/Utils/Services/Public/artistsApi";

import ArtistCard from "../../Artists/ArtistCard/ArtistCard";

const FEATURED_LIMIT = 8;

const FeaturedArtists = () => {
  const { t } = useTranslation();
  const language = useOptionalLanguage();

  const [artists, setArtists] = useState<ArtistSummaryDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchArtists({ featured: true, limit: FEATURED_LIMIT, lang: language })
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setError(true);
          setArtists([]);
        } else {
          setArtists(res.data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  const catalogPath = getPagePath("artists", language);
  const hasArtists = !!artists && artists.length > 0;

  return (
    <section className="featuredArtists" aria-labelledby="featured-title">
      <header className="header">
        <h2 id="featured-title" className="title">
          {t("home.featured.title")}
        </h2>
        <p className="subtitle">{t("home.featured.subtitle")}</p>
      </header>

      {loading ? (
        <div className="grid" aria-busy="true">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="card isSkeleton" aria-hidden="true" />
          ))}
        </div>
      ) : !hasArtists ? (
        <div className="empty">
          <p>{error ? t("common.error") : t("home.featured.empty")}</p>
          <Link to={catalogPath} className="discoverLink">
            {t("home.featured.discoverAll")}
          </Link>
        </div>
      ) : (
        <ul className="grid" aria-label={t("home.featured.title")}>
          {artists!.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} language={language} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default FeaturedArtists;
