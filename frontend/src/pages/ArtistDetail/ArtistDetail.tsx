import "./ArtistDetail.scss";

import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import BookingCta from "@/components/BookingCta/BookingCta";
import Bounded from "@/components/Bounded/Bounded";
import SeoHead from "@/components/SeoHead/SeoHead";
import { buildArtistDetailPath, getPagePath } from "@/config/pages";
import { SITE_URL } from "@/config/site";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import type { AppLanguage } from "@/i18n/config";
import { isSupportedLanguage } from "@/i18n/routing";
import {
  type ArtistDetailDto,
  fetchArtistBySlug,
} from "@/Utils/Services/Public/artistsApi";

import AvailabilityPreview from "./AvailabilityPreview/AvailabilityPreview";
import Bio from "./Bio/Bio";
import Gallery from "./Gallery/Gallery";
import HeroDetail from "./HeroDetail/HeroDetail";
import PriceCard from "./PriceCard/PriceCard";

const ArtistDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ slug: string; lang: string }>();
  const slug = params.slug;
  const language: AppLanguage | undefined = isSupportedLanguage(params.lang)
    ? params.lang
    : undefined;

  const [artist, setArtist] = useState<ArtistDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetchArtistBySlug(slug, language)
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setNotFound(true);
          setArtist(null);
        } else {
          setArtist(res);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, language]);

  useScrollAnimation();

  // Per-artist MusicGroup JSON-LD. `sameAs` (social links) is omitted because
  // the public artist DTO does not expose per-artist social links yet — add it
  // here once the DTO carries them. (#37)
  const artistJsonLd = useMemo(() => {
    if (!artist) return null;
    return {
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      name: artist.stageName,
      url: `${SITE_URL}${buildArtistDetailPath(artist.slug, language)}`,
      ...(artist.genre ? { genre: artist.genre } : {}),
      ...(artist.coverImageUrl ? { image: artist.coverImageUrl } : {}),
    };
  }, [artist, language]);

  if (loading) {
    return (
      <div className="artistDetail isLoading" aria-busy="true">
        <div className="skeleton isHero" />
        <div className="skeleton isBody" />
      </div>
    );
  }

  if (notFound || !artist) {
    return (
      <Bounded width="wide" className="artistDetail isMissing">
        <SeoHead
          title={t("artistDetail.notFoundTitle")}
          description={t("artistDetail.notFoundText")}
        />
        <h1>{t("artistDetail.notFoundTitle")}</h1>
        <p>{t("artistDetail.notFoundText")}</p>
        <Link
          to={getPagePath("artists", language)}
          className="backLink"
          onClick={(e) => {
            e.preventDefault();
            navigate(getPagePath("artists", language));
          }}
        >
          ← {t("artistDetail.backToCatalog")}
        </Link>
      </Bounded>
    );
  }

  return (
    <Bounded width="wide" className="artistDetail">
      <SeoHead
        title={t("seo.artistDetail.title", { name: artist.stageName })}
        description={t("seo.artistDetail.description", {
          name: artist.stageName,
        })}
        path={`/artists/${artist.slug}`}
        ogImage={artist.coverImageUrl ?? undefined}
        ogType="music.musician"
      />
      {/* Per-artist structured data so search engines understand the entity. (#37) */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(artistJsonLd)}
        </script>
      </Helmet>

      <HeroDetail artist={artist} />

      <div className="columns">
        <div className="main">
          <Bio bio={artist.bio} />
          <Gallery photos={artist.photos} />
          <AvailabilityPreview artistId={artist.id} artistSlug={artist.slug} />
        </div>
        <aside className="aside">
          <PriceCard artist={artist} language={language} />
        </aside>
      </div>

      <BookingCta
        artistSlug={artist.slug}
        artistName={artist.stageName}
        variant="sticky"
      />
    </Bounded>
  );
};

export default ArtistDetail;
