// Single source for artist level / set-type unions (Rule 4: no magic strings).
//
// Reuse-first policy: the canonical declarations are the native enums
// `ArtistLevel` and `ArtistSetType` in
// @src/services/pricing/pricingConstants. They are consumed directly by Zod
// (`z.enum(ArtistSetType)`) and by the pricing/booking services, so we
// re-export them from here instead of declaring competing `as const` objects.
// This module additionally exposes ready-to-iterate value arrays.

import {
  ArtistLevel,
  ArtistSetType,
} from "@src/services/pricing/pricingConstants";

export { ArtistLevel, ArtistSetType };

export const ARTIST_LEVELS = Object.values(ArtistLevel) as ArtistLevel[];
export const ARTIST_SET_TYPES = Object.values(ArtistSetType) as ArtistSetType[];
