import React, { forwardRef } from "react";
import "./Card.scss";

type CardVariant = "base" | "dark";

interface CardProps {
  className?: string;
  variant?: CardVariant;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "base", children }, ref) => {
    return (
      <div ref={ref} className={`card card--${variant} ${className ?? ""}`}>
        {children}
      </div>
    );
  },
);

export default Card;
