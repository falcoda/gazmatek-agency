export type BreakpointKeys =
  | "breakpoint-xl"
  | "breakpoint-lg"
  | "breakpoint-lg-2"
  | "breakpoint-lg-3"
  | "breakpoint-lg-4"
  | "breakpoint-md"
  | "breakpoint-md-2"
  | "breakpoint-md-3"
  | "breakpoint-md-4"
  | "breakpoint-sm"
  | "breakpoint-xs"
  | "breakpoint-disabled";

export const breakpoints: Record<BreakpointKeys, number> = {
  // Large breakpoint - Extra large screens (2560 and above)
  "breakpoint-xl": 2560,

  // Large breakpoint - Large screens (1920 to 2559)
  "breakpoint-lg": 1920,
  "breakpoint-lg-2": 1600,
  "breakpoint-lg-3": 1440,
  "breakpoint-lg-4": 1280,

  // Medium breakpoint - Medium screens (1024 to 1919)
  "breakpoint-md": 1024,
  "breakpoint-md-2": 992,
  "breakpoint-md-3": 768,
  "breakpoint-md-4": 640,

  // Small breakpoint - Small screens (576 to 1023)
  "breakpoint-sm": 576,

  // Extra small breakpoint - Extra small screens (393 to 575)
  "breakpoint-xs": 393,

  // disabled
  "breakpoint-disabled": 0,
};
