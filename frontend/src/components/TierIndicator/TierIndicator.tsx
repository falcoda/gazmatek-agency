import "./TierIndicator.scss";

import type { ArtistLevel } from "@/Utils/Services/Public/pricingApi";

export type ArtistTier = "tier1" | "tier2" | "tier3" | "tier4";

interface TierIndicatorProps {
  tier: ArtistTier;
  className?: string;
  ariaLabel?: string;
}

const TIER_LABEL: Record<ArtistTier, string> = {
  tier1: "€",
  tier2: "€€",
  tier3: "€€€",
  tier4: "€€€€",
};

/**
 * Visual price tier shown on artist surfaces in place of a numeric hourly rate.
 * Mapping is intentionally non-numeric — the actual event price is computed by
 * the simulator based on capacity / ticket price / level / set type.
 */
const TierIndicator = ({ tier, className, ariaLabel }: TierIndicatorProps) => {
  return (
    <span
      className={`tierIndicator is${tier.charAt(0).toUpperCase()}${tier.slice(1)} ${className ?? ""}`.trim()}
      aria-label={ariaLabel ?? TIER_LABEL[tier]}
      role="img"
    >
      {TIER_LABEL[tier]}
    </span>
  );
};

const LEVEL_TO_TIER: Record<ArtistLevel, ArtistTier> = {
  L1: "tier1",
  L2: "tier2",
  L3: "tier3",
  L4: "tier4",
};

export function tierFromLevel(level: ArtistLevel): ArtistTier {
  return LEVEL_TO_TIER[level];
}

export default TierIndicator;
