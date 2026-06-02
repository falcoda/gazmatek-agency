import { getArtistById } from "@src/db/query/artist/getArtistById.types";
import { ARTIST_LEVELS } from "@src/helpers/constants/artist";
import { NotFoundError } from "@src/helpers/error/errors";
import { resolveOptionsCostCents } from "@src/services/bookings/bookingConstants";
import {
  ArtistFeeInput,
  ArtistFeeResult,
  computeArtistFee,
} from "@src/services/pricing/artistFeeService";
import {
  computeBookingTotal,
  type PricingBreakdown,
} from "@src/services/pricing/bookingTotal";
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
  PRICING_GRID_EXAMPLE_CAPACITIES,
  PRICING_GRID_EXAMPLE_TICKET_PRICES,
  PRICING_PRINCIPLE_FR,
  SET_TYPE_UPLIFT,
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

export type { PricingBreakdown };

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

    // Resolve option prices from the server-side catalogue so the preview can
    // never be lowered by a tampered client payload, and unknown ids are simply
    // ignored in the public estimate (the binding quote rejects them — see
    // BookingService.computeQuote / #20).
    const { optionsCostCents } = resolveOptionsCostCents(
      input.options.map((opt) => opt.id),
    );

    // Delegated to the single shared total computation (#40) so the public
    // estimate and the stored booking quote can never drift apart.
    return computeBookingTotal({
      level: artist.level as ArtistLevel,
      capacity: input.capacity,
      ticketPriceCents: input.ticketPriceCents,
      setType: input.setType,
      optionsCostCents,
    });
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
