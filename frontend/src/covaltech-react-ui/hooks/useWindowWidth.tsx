import { useEffect, useState } from "react";

import { breakpoints } from "../config/breakpoints";

export const getBreakpoint = (width: number) => {
  if (width <= breakpoints["breakpoint-xs"]) return "breakpoint-xs";
  if (width <= breakpoints["breakpoint-sm"]) return "breakpoint-sm";
  if (width <= breakpoints["breakpoint-md-4"]) return "breakpoint-md-4";
  if (width <= breakpoints["breakpoint-md-3"]) return "breakpoint-md-3";
  if (width <= breakpoints["breakpoint-md-2"]) return "breakpoint-md-2";
  if (width <= breakpoints["breakpoint-md"]) return "breakpoint-md";
  if (width <= breakpoints["breakpoint-lg-4"]) return "breakpoint-lg-4";
  if (width <= breakpoints["breakpoint-lg-3"]) return "breakpoint-lg-3";
  if (width <= breakpoints["breakpoint-lg-2"]) return "breakpoint-lg-2";
  if (width <= breakpoints["breakpoint-lg"]) return "breakpoint-lg";
  return "breakpoint-xl";
};

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [breakpoint, setBreakpoint] = useState(
    getBreakpoint(window.innerWidth),
  );

  const handleWindowResize = () => {
    const newWidth = window.innerWidth;
    const newBreakpoint = getBreakpoint(newWidth);
    if (newBreakpoint !== breakpoint) {
      setWindowWidth(newWidth);
      setBreakpoint(newBreakpoint);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [breakpoint]);

  const isMobile = windowWidth <= breakpoints["breakpoint-md-4"];
  const isTabelet = windowWidth <= breakpoints["breakpoint-md-2"];

  return { windowWidth, isMobile, isTabelet };
};

export default useWindowWidth;
