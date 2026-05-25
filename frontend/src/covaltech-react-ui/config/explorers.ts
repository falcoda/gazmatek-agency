export const SOCOTRA_EXPLORER = "https://socotra.juneoscan.io";
export const JUNEO_EXPLORER = "https://juneoscan.io";
export const BANANA_EXPLORER = "https://banana1.juneoscan.io";
export const BLUEBYTE_EXPLORER = "https://bluebyte1.juneoscan.io";
export const FUSION_EXPLORER = "https://fusion1.juneoscan.io";

export const EXPLORER_URLS = {
  SOCOTRA: SOCOTRA_EXPLORER,
  MAINNET: JUNEO_EXPLORER,
  BANANA: BANANA_EXPLORER,
  BLUEBYTE: BLUEBYTE_EXPLORER,
  FUSION: FUSION_EXPLORER,
} as const;

export type ExplorerUrl = (typeof EXPLORER_URLS)[keyof typeof EXPLORER_URLS];

export const getExplorerFromNetworkID = (networkID: number): ExplorerUrl => {
  switch (networkID) {
    case 45:
      return EXPLORER_URLS.MAINNET;
    case 46:
      return EXPLORER_URLS.SOCOTRA;
    case 47:
      return EXPLORER_URLS.BANANA;
    case 48:
      return EXPLORER_URLS.BLUEBYTE;
    case 49:
      return EXPLORER_URLS.FUSION;
    default:
      return EXPLORER_URLS.MAINNET;
  }
};
