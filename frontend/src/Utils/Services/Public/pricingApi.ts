import { API_ROUTES } from "@/config/apiRoutes";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

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

export interface PricingOption {
  id: string;
  label: string;
  priceCents: number;
}

export interface EstimateRequest {
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
  distanceKm: number;
}

export interface ArtistFeeRequest {
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

export async function postEstimate(
  body: EstimateRequest,
): Promise<PricingBreakdown | null> {
  return publicFetch<PricingBreakdown>(API_ROUTES.pricingEstimate, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function postArtistFee(
  body: ArtistFeeRequest,
): Promise<ArtistFeeResult | null> {
  return publicFetch<ArtistFeeResult>(API_ROUTES.pricingArtistFee, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface PricingGridDto {
  principle: string;
  largeCapacityThreshold: number;
  multipliers: {
    small: Record<"L1" | "L2" | "L3" | "L4", number>;
    large: Record<"L1" | "L2" | "L3" | "L4", number>;
  };
  bounds: {
    small: { floor: number; cap: number };
    large: { floor: number; cap: number };
  };
  setTypeUplift: Record<"dj" | "hybrid" | "live", number>;
  examples: Array<{
    capacity: number;
    rows: Array<{
      ticketPrice: number;
      grossRevenue: number;
      levels: Record<"L1" | "L2" | "L3" | "L4", number>;
      floor: number;
      cap: number;
    }>;
  }>;
}

export async function fetchPricingGrid(): Promise<PricingGridDto | null> {
  return publicFetch<PricingGridDto>(API_ROUTES.pricingGrid, { silent: true });
}
