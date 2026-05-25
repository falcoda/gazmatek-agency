// HeaderBannerStore.ts
import { create } from "zustand";

interface HeaderBannerState {
  visible: boolean;
  setVisible: (visible: boolean) => void;

  height: number;
  setHeight: (height: number) => void;
}

const useHeaderBannerStore = create<HeaderBannerState>((set) => ({
  visible: false,
  setVisible: (visible) => set({ visible }),

  height: 30,
  setHeight: (height) => set({ height }),
}));

export default useHeaderBannerStore;
