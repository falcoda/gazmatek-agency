// Single source of truth for booking total computation (#40). Both the public
// pricing estimate (PricingService.estimate) and the stored quote
// (BookingService) call this, so the displayed price and the persisted price can
// never drift apart.

import { computeArtistFee } from "@src/services/pricing/artistFeeService";
import {
  ArtistLevel,
  ArtistSetType,
  BPS_DIVISOR,
  VAT_RATE_BPS,
} from "@src/services/pricing/pricingConstants";

export interface BookingTotalInput {
  level: ArtistLevel;
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  // Option prices are already resolved server-side from the catalogue (#20):
  // callers must never pass client-supplied prices here.
  optionsCostCents: number;
}

export interface PricingBreakdown {
  artistCostCents: number;
  travelCostCents: number;
  optionsCostCents: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
}

/**
 * Compute the full pricing breakdown for a booking. Travel is always zero for
 * now (the level grid is the only pricing driver) but kept in the breakdown for
 * a backward-compatible response shape.
 */
export function computeBookingTotal(
  input: BookingTotalInput,
): PricingBreakdown {
  const fee = computeArtistFee({
    capacity: input.capacity,
    ticketPrice: input.ticketPriceCents / 100,
    level: input.level,
    setType: input.setType,
  });

  const artistCostCents = Math.round(fee.recommended * 100);
  const travelCostCents = 0;
  const optionsCostCents = Math.max(0, input.optionsCostCents);

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
