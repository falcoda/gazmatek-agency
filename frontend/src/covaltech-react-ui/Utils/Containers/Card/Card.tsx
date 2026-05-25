import React, { forwardRef } from "react";
import "./Card.scss";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children }, ref) => {
    return (
      <div ref={ref} className={`card ${className ?? ""}`}>
        {children}
      </div>
    );
  },
);

export default Card;
