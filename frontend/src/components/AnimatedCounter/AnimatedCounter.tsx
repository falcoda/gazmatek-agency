import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import {
  ANIMATION_PRESETS,
  prefersReducedMotion,
} from "@/hooks/animationPresets";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  value: number;
  /** Number of decimals to keep. Defaults to 0. */
  decimals?: number;
  /** Optional suffix appended after the formatted number (e.g. "+"). */
  suffix?: string;
  /** Optional prefix prepended before the formatted number (e.g. "€"). */
  prefix?: string;
  className?: string;
}

const formatCount = (raw: number, decimals: number, locale: string): string =>
  raw.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const AnimatedCounter = ({
  value,
  decimals = 0,
  suffix,
  prefix,
  className,
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);
  const locale =
    typeof navigator !== "undefined" ? navigator.language : "fr-BE";

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) {
      setDisplayed(value);
      return;
    }
    const obj = { val: 0 };
    const animation = gsap.to(obj, {
      val: value,
      duration: ANIMATION_PRESETS.COUNTER.duration,
      ease: ANIMATION_PRESETS.COUNTER.ease,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        setDisplayed(obj.val);
      },
    });
    return () => {
      animation.kill();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatCount(displayed, decimals, locale)}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
