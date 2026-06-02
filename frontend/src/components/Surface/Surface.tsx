import "./Surface.scss";

import type { ComponentPropsWithoutRef, ElementType } from "react";

type SurfaceProps = {
  /** Render element, defaults to <div> (use "li" inside semantic lists). */
  as?: ElementType;
} & ComponentPropsWithoutRef<"div">;

/**
 * Recessed card-like surface (background + border + radius + padding) for stat,
 * quote and step blocks that are rendered as semantic elements (e.g. <li>) and
 * therefore cannot use the covaltech <Card> component.
 */
const Surface = ({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: SurfaceProps) => {
  return (
    <Tag className={`surface ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
};

export default Surface;
