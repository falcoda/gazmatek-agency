import {
  ARTIST_MULTIPLIERS_LARGE,
  ARTIST_MULTIPLIERS_SMALL,
  ArtistLevel,
  ArtistSetType,
  CAP_MULTIPLIER_LARGE,
  CAP_MULTIPLIER_SMALL,
  FLOOR_MULTIPLIER_LARGE,
  FLOOR_MULTIPLIER_SMALL,
  LARGE_CAPACITY_THRESHOLD,
  SET_TYPE_UPLIFT,
} from "@src/services/pricing/pricingConstants";

export interface ArtistFeeInput {
  capacity: number;
  ticketPrice: number;
  level: ArtistLevel;
  setType: ArtistSetType;
}

export interface ArtistFeeResult {
  multiplier: number;
  recommended: number;
  range: [number, number];
  gross: number;
  pctGross: number;
}

export function computeArtistFee({
  capacity,
  ticketPrice,
  level,
  setType,
}: ArtistFeeInput): ArtistFeeResult {
  const isLarge = capacity >= LARGE_CAPACITY_THRESHOLD;

  const baseMult = isLarge
    ? ARTIST_MULTIPLIERS_LARGE[level]
    : ARTIST_MULTIPLIERS_SMALL[level];

  const uplift = SET_TYPE_UPLIFT[setType];
  const multiplier = Math.round(baseMult * uplift);

  const floorMult = isLarge ? FLOOR_MULTIPLIER_LARGE : FLOOR_MULTIPLIER_SMALL;
  const capMult = isLarge ? CAP_MULTIPLIER_LARGE : CAP_MULTIPLIER_SMALL;

  const recommended = Math.round(multiplier * ticketPrice);
  const floorFee = Math.round(floorMult * ticketPrice);
  const capFee = Math.round(capMult * ticketPrice);

  const gross = Math.round(capacity * ticketPrice);
  const pctGross = gross > 0 ? recommended / gross : 0;

  return {
    multiplier,
    recommended,
    range: [floorFee, capFee],
    gross,
    pctGross,
  };
}
