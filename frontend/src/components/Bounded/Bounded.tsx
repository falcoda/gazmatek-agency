import "./Bounded.scss";

import type { ComponentPropsWithoutRef, ElementType } from "react";

export type BoundedWidth = "wide" | "medium" | "narrow" | "text" | "compact";

type BoundedProps = {
  /** Centered column width — maps to the $container-* scale. */
  width?: BoundedWidth;
  /** Render element, defaults to <div>. */
  as?: ElementType;
} & ComponentPropsWithoutRef<"div">;

/**
 * Centered, max-width content column. The single source of truth for how wide
 * public content is allowed to grow. Pair with <Section> for page rhythm.
 */
const Bounded = ({
  width = "wide",
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: BoundedProps) => {
  return (
    <Tag className={`bounded bounded--${width} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
};

export default Bounded;
