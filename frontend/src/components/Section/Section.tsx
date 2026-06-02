import "./Section.scss";

import type { ComponentPropsWithoutRef, ElementType } from "react";

type SectionProps = {
  /** Render element, defaults to <section>. */
  as?: ElementType;
} & ComponentPropsWithoutRef<"section">;

/**
 * Vertical rhythm + horizontal gutters shared by every public section.
 * Spans the full width (so backgrounds bleed edge to edge); wrap inner content
 * in <Bounded> to constrain it to a standard column width.
 */
const Section = ({
  as: Tag = "section",
  className = "",
  children,
  ...rest
}: SectionProps) => {
  return (
    <Tag className={`section ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
};

export default Section;
