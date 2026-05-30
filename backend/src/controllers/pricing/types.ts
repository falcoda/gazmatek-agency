import type { ArtistLevel, ArtistSetType } from "@src/helpers/constants/artist";
import type { ArtistFeeResult } from "@src/services/pricing/artistFeeService";
import type {
  PricingBreakdown,
  PricingGrid,
} from "@src/services/pricing/pricingService";

export interface EstimateRequestBody {
  artistId: string;
  durationHours: number;
  date: string;
  location: { lat?: number; lng?: number; address?: string };
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  options: { id: string; label: string; priceCents: number }[];
}

export interface ArtistFeeRequestBody {
  capacity: number;
  ticketPrice: number;
  level: ArtistLevel;
  setType: ArtistSetType;
}

export type EstimateResponse = PricingBreakdown;

export type ArtistFeeResponse = ArtistFeeResult;

export type GridResponse = PricingGrid;
