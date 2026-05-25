import "./ContainerContent.scss";

import React from "react";

interface ContainerContentProps {
  className?: string;
  children: React.ReactNode;
  gradian?: boolean;
}

const ContainerContent: React.FC<ContainerContentProps> = ({
  className,
  children,
  gradian = false,
}) => {
  return (
    <div
      className={`containerContent ${className ?? ""} ${gradian ? "gradian" : ""}`}
    >
      {children}
    </div>
  );
};

export default ContainerContent;
