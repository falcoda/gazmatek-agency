import "./Hero.scss";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import BookingCta from "@/components/BookingCta/BookingCta";
import Bounded from "@/components/Bounded/Bounded";
import {
  fetchHomeStats,
  type HomeStats,
} from "@/Utils/Services/Public/statsApi";

const ROUND_DOWN_STEP = 10;

function formatRosterValue(count: number | undefined): string {
  if (count === undefined) return "—";
  if (count < ROUND_DOWN_STEP) return String(count);
  return `${Math.floor(count / ROUND_DOWN_STEP) * ROUND_DOWN_STEP}+`;
}

const Hero = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<HomeStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHomeStats().then((res) => {
      if (cancelled || !res) return;
      setStats(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="bg" aria-hidden>
        <div className="bgGrid" />
        <div className="bgGlow isFirst" />
        <div className="bgGlow isSecond" />
      </div>

      <Bounded width="narrow" className="content">
        <p className="eyebrow">{t("footer.tagline")}</p>
        <h1 id="hero-title" className="title">
          {t("home.hero.title")}
        </h1>
        <p className="subtitle">{t("home.hero.subtitle")}</p>
        <div className="cta">
          <BookingCta variant="primary" />
        </div>

        <ul className="stats" aria-label={t("home.hero.stats.aria")}>
          <li>
            <span className="statValue">
              {formatRosterValue(stats?.publishedArtists)}
            </span>
            <span className="statLabel">{t("home.hero.stats.artists")}</span>
          </li>
          <li>
            <span className="statValue">
              {formatRosterValue(stats?.producedEvents)}
            </span>
            <span className="statLabel">{t("home.hero.stats.events")}</span>
          </li>
          <li>
            <span className="statValue">24h</span>
            <span className="statLabel">{t("home.hero.stats.reply")}</span>
          </li>
        </ul>
      </Bounded>
    </section>
  );
};

export default Hero;
