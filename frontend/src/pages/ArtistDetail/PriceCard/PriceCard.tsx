import "./PriceCard.scss";

import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import TierIndicator, {
  tierFromLevel,
} from "@/components/TierIndicator/TierIndicator";
import { buildBookingUrl, getPagePath } from "@/config/pages";
import { Card } from "@/covaltech-react-ui";
import type { AppLanguage } from "@/i18n/config";
import { isSupportedLanguage } from "@/i18n/routing";
import type { ArtistDetailDto } from "@/Utils/Services/Public/artistsApi";

interface PriceCardProps {
  artist: ArtistDetailDto;
  language: AppLanguage | undefined;
}

const PriceCard = ({ artist, language }: PriceCardProps) => {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const activeLang: AppLanguage | undefined = isSupportedLanguage(lang)
    ? lang
    : language;

  const pricingPath = `${getPagePath("pricing", activeLang)}?artiste=${encodeURIComponent(artist.slug)}`;
  const bookingUrl = buildBookingUrl({ artistSlug: artist.slug }, activeLang);
  const tier = tierFromLevel(artist.level);

  return (
    <Card className="priceCard">
      <h2 id="price-card-title" className="title">
        {t("artistDetail.priceCard.title")}
      </h2>

      <div className="tierRow">
        <span className="tierLabel">{t("artistDetail.priceCard.tier")}</span>
        <TierIndicator tier={tier} />
      </div>

      <p className="hint">{t("artistDetail.priceCard.hint")}</p>

      <Link
        to={pricingPath}
        className="primary"
        aria-label={t("artistDetail.priceCard.estimate")}
      >
        {t("artistDetail.priceCard.estimate")}
      </Link>
      <Link
        to={bookingUrl}
        className="secondary"
        aria-label={t("bookingCta.withArtistAria", { name: artist.stageName })}
      >
        {t("artistDetail.priceCard.cta")}
      </Link>
    </Card>
  );
};

export default PriceCard;
