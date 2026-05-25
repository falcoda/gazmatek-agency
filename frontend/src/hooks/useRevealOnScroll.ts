import { useEffect } from "react";

/**
 * Lightweight scroll-reveal for the marketing pages.
 *
 * Adds the `reveal--visible` class to every `.reveal` element once it enters
 * the viewport. Built on IntersectionObserver so it works regardless of which
 * element owns the scroll (the landing pages scroll inside their own
 * container, not the window). Honors `prefers-reduced-motion`.
 */
const useRevealOnScroll = () => {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );

    if (elements.length === 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add("reveal--visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
};

export default useRevealOnScroll;
