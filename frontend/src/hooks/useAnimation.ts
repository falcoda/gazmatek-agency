import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RefObject, useEffect } from "react";

import { useLoadingStore } from "@/covaltech-react-ui";
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

const useAnimation = () => {
  const { loadingStates } = useLoadingStore();

  const animateFadeIn = (
    element: HTMLElement | NodeListOf<Element>,
    duration: number,
    trigger: HTMLElement | NodeListOf<Element> | string,
  ) => {
    gsap.set(element, { opacity: 0 });
    gsap.fromTo(
      element,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: duration,
        stagger: 0.15,
        scrollTrigger: {
          trigger: trigger,
          toggleActions: "play none none reset",
          start: "top 80%",
        },
      },
    );
  };

  const animateFadeInWithMove = (
    element: HTMLElement | NodeListOf<Element> | HTMLElement[],
    duration: number,
    trigger: HTMLElement | NodeListOf<Element> | HTMLElement[] | string,
    start: string = "top 100%",
  ) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: start,
        toggleActions: "play play play reset",
      },
    });

    tl.set(element, { opacity: 0 }).fromTo(
      element,
      { opacity: 0, y: 100 },
      {
        y: 0,
        opacity: 1,
        duration: duration,
        stagger: 0.15,
      },
    );
  };

  const pinSection = (
    element: HTMLElement | Element | string,
    trigger: HTMLElement | Element | string,
  ) => {
    gsap.to(element, {
      scrollTrigger: {
        trigger: trigger,
        start: "top bottom",
        end: "bottom bottom",
        pin: true,
        markers: true,
      },
    });
  };

  interface AnimateWithScrollParams {
    element: HTMLElement | NodeListOf<Element> | string;
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
    scrub?: number;
    startTrigger?: string;
    endTrigger?: string;
  }

  const animateWithScroll = ({
    element,
    startX = 0,
    startY = 0,
    endX = 0,
    endY = 0,
    scrub = 1,
    startTrigger = "top bottom",
    endTrigger = "bottom top",
  }: AnimateWithScrollParams) => {
    gsap.fromTo(
      element,
      { x: startX, y: startY },
      {
        scrollTrigger: {
          trigger: element,
          start: startTrigger,
          end: endTrigger,
          scrub: scrub,
        },
        x: endX,
        y: endY,
      },
    );
  };

  const slideOutToLeft = (
    element: HTMLElement | NodeListOf<Element> | string,
    duration: number,
    onComplete?: () => void,
  ) => {
    gsap.to(element, {
      x: "-100%",
      opacity: 0,
      duration: duration,
      ease: "power2.in",
      onComplete: onComplete,
    });
  };

  const slideInFromRight = (
    element: HTMLElement | NodeListOf<Element> | string,
    duration: number,
    onComplete?: () => void, // Ajouter un argument facultatif pour la fonction de rappel
  ) => {
    gsap.fromTo(
      element,
      { x: "100%", opacity: 0 },
      {
        x: "0%",
        opacity: 1,
        duration: duration,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(element, { clearProps: "all" });
          if (onComplete) onComplete(); // Exécuter la fonction de rappel si elle est fournie
        },
      },
    );
  };

  const useHoverAnimation = (refs: React.RefObject<HTMLElement>[]) => {
    useEffect(() => {
      refs.forEach((ref) => {
        if (!ref.current) return;

        const barElement = ref.current;

        gsap.set(barElement, { scaleX: 0, transformOrigin: "left" });

        const handleMouseEnter = () => {
          gsap.to(barElement, {
            scaleX: 1,
            duration: 0.5,
            transformOrigin: "left",
          });
        };

        const handleMouseLeave = () => {
          gsap.to(barElement, {
            scaleX: 0,
            duration: 0.5,
            transformOrigin: "right",
          });
        };

        if (barElement.parentElement) {
          barElement.parentElement.addEventListener(
            "mouseenter",
            handleMouseEnter,
          );
          barElement.parentElement.addEventListener(
            "mouseleave",
            handleMouseLeave,
          );
        }
        return () => {
          if (barElement.parentElement) {
            barElement.parentElement.removeEventListener(
              "mouseenter",
              handleMouseEnter,
            );
            barElement.parentElement.removeEventListener(
              "mouseleave",
              handleMouseLeave,
            );
          }
        };
      });
    }, [refs]);
  };

  const scrollToSection = (sectionId: string, offset = 0, duration = 0.1) => {
    gsap.to(window, {
      scrollTo: {
        y: `#${sectionId}`,
        offsetY: offset,
      },
      duration: duration,
    });
  };

  const animateCarousel = (
    componentRef: RefObject<HTMLElement>, // ou RefObject<HTMLDivElement> si c'est spécifiquement un div
    sliderRef: RefObject<HTMLElement>, // même chose ici
    titleRef: RefObject<HTMLElement>, // et ici
    imgArray: string[],
    options = { duration: 1, ease: "power1.out" },
  ) => {
    useEffect(() => {
      if (loadingStates.agenda) return;
      const carouselItems = gsap.utils.toArray<HTMLElement>(".carouselItem");
      let totalWidth = 0;
      carouselItems.forEach((item) => {
        totalWidth += item.getBoundingClientRect().width;
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentRef.current,
          start: "top+=50% center",
          end: () => `+=${totalWidth}`,
          scrub: true,
        },
      });

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 1 },
        ).to(titleRef.current, { autoAlpha: 0, y: -20, duration: 1 }, "+=55%");
      }

      const containerWidth = componentRef.current
        ? componentRef.current.offsetWidth
        : 0;
      const totalTranslationPercent = -(totalWidth / containerWidth) * 100;
      gsap.to(sliderRef.current, {
        xPercent: totalTranslationPercent,
        scrollTrigger: {
          trigger: componentRef.current,
          start: () => "center center",
          pin: true,
          scrub: 1,
          end: () => `+=${totalWidth - containerWidth}`,
          refreshPriority: 1,
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars.trigger === componentRef.current) {
            trigger.kill();
          }
        });
      };
    }, [
      imgArray,
      componentRef,
      sliderRef,
      titleRef,
      options.duration,
      options.ease,
      loadingStates,
    ]);
  };

  const animateScrollingLine = (
    svgRef: RefObject<SVGPathElement>,
    options: {
      start?: string;
      end?: string;
      scrub?: number;
      duration?: number;
      markers?: boolean;
    },
  ) => {
    useEffect(() => {
      const length = svgRef.current?.getTotalLength();

      gsap.set(svgRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      const main = gsap.timeline({
        scrollTrigger: {
          trigger: svgRef.current,
          start: options.start || "top center",
          end: options.end || "bottom center",
          scrub: options.scrub || 1,
          markers: options.markers || false,
        },
      });

      main.to(svgRef.current, {
        strokeDashoffset: 0,
        duration: options.duration || 4,
      });

      return () => {
        if (main) main.kill();
      };
    }, [svgRef, options]);
  };

  const animateVerticalMovement = (
    selector: string,
    startY: string,
    endY: string,
  ) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: selector,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        // markers: true,
      },
    });

    tl.fromTo(
      selector,
      { y: startY },
      {
        y: endY,
        ease: "none",
      },
    );
  };

  return {
    animateFadeInWithMove,
    animateFadeIn,
    pinSection,
    animateWithScroll,
    slideInFromRight,
    slideOutToLeft,
    useHoverAnimation,
    scrollToSection,
    animateCarousel,
    animateScrollingLine,
    animateVerticalMovement,
  };
};

export default useAnimation;
