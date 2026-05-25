import React from "react";

interface FormatNodeIDProps {
  nodeID: string;
  start?: number;
  end?: number;
  full?: boolean;
  className?: string;
  explorer: string;
}

const FormatNodeID: React.FC<FormatNodeIDProps> = ({
  nodeID,
  start = 7,
  end = 6,
  full = false,
  className,
  explorer,
}) => {
  function formatNodeId(): string {
    if (full) return nodeID;
    else if (nodeID) {
      const firstPart = nodeID.substring(0, start);
      const lastPart = nodeID.substring(nodeID.length - end);
      return `${firstPart}...${lastPart}`;
    } else {
      return "";
    }
  }

  return (
    <a
      className={`formatNodeID ${className ? className : ""}`}
      href={`${explorer}${explorer.endsWith("/") ? "" : "/"}validator/${nodeID}`}
      target="_blank"
      rel="noreferrer"
    >
      {formatNodeId()}
    </a>
  );
};

export default FormatNodeID;
