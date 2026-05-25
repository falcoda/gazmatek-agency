import { create } from "zustand";

import {
  type CookieConsentPreferences,
  type CookieConsentRecord,
  readCookieConsent,
  writeCookieConsent,
} from "@/Utils/Consent/cookieConsent";
import { loggerService, LogTag } from "@/Utils/LoggerService";

/** Preferences applied when the visitor accepts every category. */
const ALL_GRANTED: CookieConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
};

/** Preferences applied when the visitor keeps only what is strictly required. */
const ESSENTIAL_ONLY: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

interface CookieConsentState {
  consent: CookieConsentRecord | null;
  isBannerOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookieConsentPreferences) => void;
  openBanner: () => void;
}

const storedConsent = readCookieConsent();

/** Persists a decision locally and updates the store. */
function commitConsent(
  set: (partial: Partial<CookieConsentState>) => void,
  preferences: CookieConsentPreferences,
): void {
  const record = writeCookieConsent(preferences);
  set({ consent: record, isBannerOpen: false });
}

export const useCookieConsentStore = create<CookieConsentState>((set) => ({
  consent: storedConsent,
  // Show the banner on first visit, or whenever no valid decision is stored.
  isBannerOpen: storedConsent === null,

  acceptAll: () => {
    loggerService.info(LogTag.STORE, "CookieConsentStore: acceptAll");
    commitConsent(set, ALL_GRANTED);
  },

  rejectAll: () => {
    loggerService.info(LogTag.STORE, "CookieConsentStore: rejectAll");
    commitConsent(set, ESSENTIAL_ONLY);
  },

  savePreferences: (preferences) => {
    loggerService.info(LogTag.STORE, "CookieConsentStore: savePreferences");
    commitConsent(set, preferences);
  },

  openBanner: () => {
    loggerService.info(LogTag.STORE, "CookieConsentStore: openBanner");
    set({ isBannerOpen: true });
  },
}));
