/**
 * S-47 — Catalogue centralisé des animations GSAP.
 * Une animation = une intention. Pas de freestyle dans les composants.
 */
export const ANIMATION_PRESETS = {
  HERO_INTRO: { duration: 0.8, ease: "power3.out", staggerMs: 80 },
  SECTION_REVEAL: { duration: 0.6, ease: "power2.out", translateY: 24 },
  CARD_STAGGER: { duration: 0.5, ease: "power2.out", staggerMs: 60 },
  CARD_HOVER: { duration: 0.2, ease: "power1.out", translateY: -4 },
  COUNTER: { duration: 1.2, ease: "power2.out" },
  ACCORDION: { duration: 0.3, ease: "power2.inOut" },
  MODAL_IN: { duration: 0.18, ease: "power2.out", scaleFrom: 0.95 },
  PAGE_TRANSITION: { duration: 0.35, ease: "power2.inOut" },
  NAVBAR_SCROLL: { duration: 0.2, ease: "power1.out" },
} as const;

export type AnimationPresetKey = keyof typeof ANIMATION_PRESETS;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
