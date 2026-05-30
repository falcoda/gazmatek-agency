import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { loggerService, LogTag } from "@/Utils/LoggerService";

export interface BookingFormState {
  artistId: string;
  eventDate: string;
  eventTime: string;
  durationHours: number;
  locationAddress: string;
  context: string;
  options: string[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  step: number;
}

interface BookingFormStore extends BookingFormState {
  update: (patch: Partial<BookingFormState>) => void;
  reset: () => void;
}

const INITIAL: BookingFormState = {
  artistId: "",
  eventDate: "",
  eventTime: "20:00",
  durationHours: 1,
  locationAddress: "",
  context: "",
  options: [],
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  step: 0,
};

export const useBookingFormStore = create<BookingFormStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      update: (patch) => {
        loggerService.debug(LogTag.STORE, "BookingFormStore: update", patch);
        set((prev) => ({ ...prev, ...patch }));
      },
      reset: () => {
        loggerService.info(LogTag.STORE, "BookingFormStore: reset");
        set({ ...INITIAL });
      },
    }),
    {
      name: "gazmatek.bookingForm",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
