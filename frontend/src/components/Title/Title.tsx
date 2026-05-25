import "./Title.scss";

import React from "react";

interface TitleProps {
  children: React.ReactNode;
  className?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  onClick?: () => void;
}

const Title: React.FC<TitleProps> = ({
  children,
  className = "",
  level = "h2",
  onClick,
}) => {
  const Component = level;

  return (
    <Component className={`title ${className}`} onClick={onClick}>
      {children}
    </Component>
  );
};

export default Title;
