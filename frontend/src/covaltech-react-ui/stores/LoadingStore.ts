// LoadingStore.ts
import { create } from "zustand";

export interface LoadingState {
  loadingStates: { [key: string]: boolean };
  setLoading: (key: string, isLoading: boolean) => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
  loadingStates: {},

  setLoading: (key, isLoading) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    })),
}));

export default useLoadingStore;
