import "./StyledInput.scss";

import React from "react";

// base component
interface StyledInputBaseProps<T> {
  label?: string | React.ReactNode;
  value: T;
  setValue: (value: T) => void;
  type: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  htmlFor?: string;
  width?: string | number;
}

export const StyledInputBase: React.FC<StyledInputBaseProps<any>> = ({
  label,
  children,
  className,
  style,
  htmlFor,
  width = "200px",
}) => {
  return (
    <div
      className={`styledInput ${className || ""}`}
      style={{ ...style, width }}
    >
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
    </div>
  );
};
