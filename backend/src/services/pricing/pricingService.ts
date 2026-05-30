import { getArtistById } from "@src/db/query/artist/getArtistById.types";
import { ARTIST_LEVELS } from "@src/helpers/constants/artist";
import { NotFoundError } from "@src/helpers/error/errors";
import {
  ArtistFeeInput,
  ArtistFeeResult,
  computeArtistFee,
} from "@src/services/pricing/artistFeeService";
import {
  ARTIST_MULTIPLIERS_LARGE,
  ARTIST_MULTIPLIERS_SMALL,
  ArtistLevel,
  ArtistSetType,
  BPS_DIVISOR,
  CAP_MULTIPLIER_LARGE,
  CAP_MULTIPLIER_SMALL,
  FLOOR_MULTIPLIER_LARGE,
  FLOOR_MULTIPLIER_SMALL,
  LARGE_CAPACITY_THRESHOLD,
  PRICING_GRID_EXAMPLE_CAPACITIES,
  PRICING_GRID_EXAMPLE_TICKET_PRICES,
  PRICING_PRINCIPLE_FR,
  SET_TYPE_UPLIFT,
  VAT_RATE_BPS,
} from "@src/services/pricing/pricingConstants";
import { Pool } from "pg";

export interface PricingOption {
  id: string;
  label: string;
  priceCents: number;
}

export interface EstimateInput {
  artistId: string;
  durationHours: number;
  date: string;
  location: { lat?: number; lng?: number; address?: string };
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  options: PricingOption[];
}

export interface PricingBreakdown {
  artistCostCents: number;
  travelCostCents: number;
  optionsCostCents: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
}

export interface PricingGridRow {
  ticketPrice: number;
  grossRevenue: number;
  levels: Record<ArtistLevel, number>;
  floor: number;
  cap: number;
}

export interface PricingGridExample {
  capacity: number;
  rows: PricingGridRow[];
}

export interface PricingGrid {
  principle: string;
  largeCapacityThreshold: number;
  multipliers: {
    small: Record<ArtistLevel, number>;
    large: Record<ArtistLevel, number>;
  };
  bounds: {
    small: { floor: number; cap: number };
    large: { floor: number; cap: number };
  };
  setTypeUplift: Record<ArtistSetType, number>;
  examples: PricingGridExample[];
}

export class PricingService {
  constructor(private db: Pool) {}

  async estimate(input: EstimateInput): Promise<PricingBreakdown> {
    const rows = await getArtistById.run({ artistId: input.artistId }, this.db);
    if (rows.length === 0) {
      throw new NotFoundError("Artist not found");
    }
    const artist = rows[0];

    // computeArtistFee works in euros (ticketPrice is a euro amount and
    // recommended is a euro amount). Convert from/to cents at the boundary.
    const fee = computeArtistFee({
      capacity: input.capacity,
      ticketPrice: input.ticketPriceCents / 100,
      level: artist.level as ArtistLevel,
      setType: input.setType,
    });

    const artistCostCents = Math.round(fee.recommended * 100);
    // Travel is no longer a per-artist field; the level grid is the only
    // pricing driver. Kept in the breakdown for backward-compatible response
    // shape but always zero until a new travel policy is wired in.
    const travelCostCents = 0;
    const optionsCostCents = input.options.reduce(
      (sum, opt) => sum + Math.max(0, opt.priceCents),
      0,
    );

    const subtotalCents = artistCostCents + travelCostCents + optionsCostCents;
    const vatCents = Math.round((subtotalCents * VAT_RATE_BPS) / BPS_DIVISOR);
    const totalCents = subtotalCents + vatCents;

    return {
      artistCostCents,
      travelCostCents,
      optionsCostCents,
      subtotalCents,
      vatCents,
      totalCents,
    };
  }

  computeArtistFee(input: ArtistFeeInput): ArtistFeeResult {
    return computeArtistFee(input);
  }

  getGrid(): PricingGrid {
    const examples: PricingGridExample[] = PRICING_GRID_EXAMPLE_CAPACITIES.map(
      (capacity) => {
        const rows: PricingGridRow[] = PRICING_GRID_EXAMPLE_TICKET_PRICES.map(
          (ticketPrice) => {
            const fees = ARTIST_LEVELS.map((level) =>
              computeArtistFee({
                capacity,
                ticketPrice,
                level,
                setType: ArtistSetType.DJ,
              }),
            );

            const levels = ARTIST_LEVELS.reduce<Record<ArtistLevel, number>>(
              (acc, level, idx) => {
                acc[level] = fees[idx].recommended;
                return acc;
              },
              {} as Record<ArtistLevel, number>,
            );

            return {
              ticketPrice,
              grossRevenue: capacity * ticketPrice,
              levels,
              floor: fees[0].range[0],
              cap: fees[fees.length - 1].range[1],
            };
          },
        );

        return { capacity, rows };
      },
    );

    return {
      principle: PRICING_PRINCIPLE_FR,
      largeCapacityThreshold: LARGE_CAPACITY_THRESHOLD,
      multipliers: {
        small: { ...ARTIST_MULTIPLIERS_SMALL },
        large: { ...ARTIST_MULTIPLIERS_LARGE },
      },
      bounds: {
        small: { floor: FLOOR_MULTIPLIER_SMALL, cap: CAP_MULTIPLIER_SMALL },
        large: { floor: FLOOR_MULTIPLIER_LARGE, cap: CAP_MULTIPLIER_LARGE },
      },
      setTypeUplift: { ...SET_TYPE_UPLIFT },
      examples,
    };
  }
}

export default PricingService;
