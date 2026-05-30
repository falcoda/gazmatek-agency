import "./ArtistCard.scss";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import TierIndicator, {
  tierFromLevel,
} from "@/components/TierIndicator/TierIndicator";
import { buildArtistDetailPath } from "@/config/pages";
import type { AppLanguage } from "@/i18n/config";
import type { ArtistSummaryDto } from "@/Utils/Services/Public/artistsApi";
import { ArtistSetType } from "@/Utils/Services/Public/pricingApi";

interface ArtistCardProps {
  artist: ArtistSummaryDto;
  language: AppLanguage | undefined;
}

const SET_TYPE_ORDER: ArtistSetType[] = [
  ArtistSetType.DJ,
  ArtistSetType.HYBRID,
  ArtistSetType.LIVE,
];

const SET_TYPE_I18N_KEY: Record<ArtistSetType, string> = {
  [ArtistSetType.DJ]: "artists.card.setType.dj",
  [ArtistSetType.HYBRID]: "artists.card.setType.hybrid",
  [ArtistSetType.LIVE]: "artists.card.setType.live",
};

const ArtistCard = ({ artist, language }: ArtistCardProps) => {
  const { t } = useTranslation();
  const tier = tierFromLevel(artist.level);

  const setTypes = SET_TYPE_ORDER.filter((type) =>
    artist.supportedSetTypes.includes(type),
  );

  return (
    <li className="artistCard fi">
      <Link to={buildArtistDetailPath(artist.slug, language)} className="link">
        <div className="poster">
          {artist.coverImageUrl ? (
            <img
              src={artist.coverImageUrl}
              alt={artist.stageName}
              loading="lazy"
              className="cover"
            />
          ) : (
            <div className="cover placeholder" aria-hidden="true">
              <span>{artist.stageName.charAt(0)}</span>
            </div>
          )}

          <div className="scrim" aria-hidden="true" />

          <div className="topRow">
            {setTypes.length > 0 ? (
              <ul className="setTypes">
                {setTypes.map((type) => (
                  <li key={type} className={`setType is-${type}`}>
                    {t(SET_TYPE_I18N_KEY[type])}
                  </li>
                ))}
              </ul>
            ) : (
              <span />
            )}
            <TierIndicator
              tier={tier}
              className="tierBadge"
              ariaLabel={t("artists.card.tierLabel")}
            />
          </div>

          <div className="caption">
            {artist.genre ? (
              <span className="genre">{artist.genre}</span>
            ) : null}
            <h3 className="name">{artist.stageName}</h3>
          </div>
        </div>

        <div className="footer">
          <span className="view">{t("artists.card.view")}</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </div>
      </Link>
    </li>
  );
};

export default ArtistCard;
