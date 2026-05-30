export enum ArtistLevel {
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
  L4 = "L4",
}

export enum ArtistSetType {
  DJ = "dj",
  HYBRID = "hybrid",
  LIVE = "live",
}

export const LARGE_CAPACITY_THRESHOLD = 2000;

export const ARTIST_MULTIPLIERS_SMALL: Readonly<Record<ArtistLevel, number>> = {
  [ArtistLevel.L1]: 20,
  [ArtistLevel.L2]: 30,
  [ArtistLevel.L3]: 40,
  [ArtistLevel.L4]: 50,
};

export const ARTIST_MULTIPLIERS_LARGE: Readonly<Record<ArtistLevel, number>> = {
  [ArtistLevel.L1]: 30,
  [ArtistLevel.L2]: 40,
  [ArtistLevel.L3]: 50,
  [ArtistLevel.L4]: 60,
};

export const SET_TYPE_UPLIFT: Readonly<Record<ArtistSetType, number>> = {
  [ArtistSetType.DJ]: 1.0,
  [ArtistSetType.HYBRID]: 1.1,
  [ArtistSetType.LIVE]: 1.15,
};

export const FLOOR_MULTIPLIER_SMALL = 20;
export const FLOOR_MULTIPLIER_LARGE = 30;
export const CAP_MULTIPLIER_SMALL = 50;
export const CAP_MULTIPLIER_LARGE = 60;

// Belgian standard VAT rate (basis points to avoid floating-point issues).
export const VAT_RATE_BPS = 2100;
export const BPS_DIVISOR = 10_000;

// Maximum supported event duration in hours.
export const MAX_DURATION_HOURS = 24;

// Example inputs used to render the public pricing grid (illustrative only).
export const PRICING_GRID_EXAMPLE_TICKET_PRICES: readonly number[] = [
  10, 15, 20, 25, 30,
];
export const PRICING_GRID_EXAMPLE_CAPACITIES: readonly number[] = [
  500, 1000, 2500,
];

// Human-readable explanation of the grid pricing principle (FR).
export const PRICING_PRINCIPLE_FR =
  "Cachet plafond = Multiplicateur × Prix d'entrée. Le multiplicateur dépend de la capacité et du niveau de l'artiste.";
