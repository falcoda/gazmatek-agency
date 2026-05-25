import "./Table.scss";

import React from "react";

interface TableProps {
  children: React.ReactNode; // Correctement typé comme React.ReactNode
}

const Table: React.FC<TableProps> = ({ children }) => {
  return <table className="table">{children}</table>;
};

export default Table;
