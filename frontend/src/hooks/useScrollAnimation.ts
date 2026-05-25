import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

interface StaggerGroup {
  itemsSelector: string;
  triggerSelector: string;
  offsetY?: number;
  duration?: number;
  stagger?: number;
}

// Add project-specific stagger groups here
const STAGGER_GROUPS: StaggerGroup[] = [];

const useScrollAnimation = (extraGroups: StaggerGroup[] = []) => {
  useEffect(() => {
    const fadeItems = gsap.utils.toArray<HTMLElement>(".fi");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      fadeItems.forEach((element) => element.classList.add("vis"));
      return;
    }

    const context = gsap.context(() => {
      // Generic fade-in for any element with class "fi"
      fadeItems.forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.2,
            ease: "none",
            onStart: () => element.classList.add("vis"),
            scrollTrigger: {
              trigger: element,
              start: "top 95%",
              once: true,
            },
          },
        );
      });

      // Stagger animations for grid groups
      [...STAGGER_GROUPS, ...extraGroups].forEach(
        ({
          itemsSelector,
          triggerSelector,
          offsetY = 10,
          duration = 0.22,
          stagger = 0.03,
        }) => {
          const items = gsap.utils.toArray<HTMLElement>(itemsSelector);
          if (!items.length) return;

          gsap.fromTo(
            items,
            { autoAlpha: 0, y: offsetY },
            {
              autoAlpha: 1,
              y: 0,
              duration,
              stagger,
              ease: "none",
              scrollTrigger: {
                trigger: triggerSelector,
                start: "top 92%",
                once: true,
              },
            },
          );
        },
      );
    });

    return () => context.revert();
  }, [extraGroups]);
};

export default useScrollAnimation;
