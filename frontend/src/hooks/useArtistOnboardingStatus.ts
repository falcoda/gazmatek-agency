import { useEffect, useState } from "react";

import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import {
  type ArtistMeDto,
  fetchArtistMe,
} from "@/Utils/Services/Authenticated/artistAreaApi";

interface ArtistOnboardingStatus {
  loading: boolean;
  /** Null until loaded; true once the engagement contract is signed. */
  onboardingComplete: boolean | null;
  me: ArtistMeDto | null;
}

/**
 * Reads `/api/artist/me` to determine whether the signed-in artist has finished
 * onboarding (engagement contract signed). Used to surface a resume-onboarding
 * banner / nav badge so the flow stays discoverable after the invitation. (#34)
 */
export function useArtistOnboardingStatus(): ArtistOnboardingStatus {
  const token = useArtistAuthStore((s) => s.token);
  const [me, setMe] = useState<ArtistMeDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchArtistMe()
      .then((res) => {
        if (!cancelled) setMe(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return {
    loading,
    onboardingComplete: me ? me.onboardingCompletedAt !== null : null,
    me,
  };
}
