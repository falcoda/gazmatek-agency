import "./Container.scss";

import React, { forwardRef } from "react";

export interface ContainerProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, style }, ref) => {
    return (
      <div ref={ref} className={`container ${className ?? ""}`} style={style}>
        {children}
      </div>
    );
  },
);

Container.displayName = "Container";
export default Container;
