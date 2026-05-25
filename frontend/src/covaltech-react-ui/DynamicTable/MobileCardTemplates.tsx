import React, { ReactElement } from "react";
import { Column } from "./DynamicTable";
import "./MobileCardTemplates.scss";

/**
 * Enum for types of mobile card templates.
 */
export enum MobileCardTemplateType {
  Default = "Default",
  WithHeader = "WithHeader",
  WithoutHeader = "WithoutHeader",
  WithHeaderNumber2 = "WithHeader.2",
  WithHeaderNumber3 = "WithHeader.3",
  WithHeaderNumber4 = "WithHeader.4",
  WithHeaderTitleAbove = "WithHeaderTitleAbove",
}

/**
 * Props for the MobileCardTemplates component.
 */
interface MobileCardTemplateProps {
  record: any;
  columns: Column[];
  rowIndex: number;
  type: MobileCardTemplateType;
  onClick?: (record: any) => void;
  renderMobileCard?: (
    record: any,
    columns: Column[],
    rowIndex: number,
  ) => ReactElement;
}

/**
 * Renders the content of a column.
 * @param col - The column definition.
 * @param record - The data record.
 * @param rowIndex - The index of the row.
 * @returns If the column has a render function, the result of that function;
 * otherwise, the value of the column in the record.
 */
const renderColumnContent = (col: Column, record: any, rowIndex: number) => {
  return col.render
    ? col.render(record[col.dataIndex], record, rowIndex)
    : record[col.dataIndex];
};

/**
 * Filters columns to only include those that are visible on mobile and sorts them by mobile.order.
 * Columns without mobile.order are placed at the end.
 * @param columns - The array of columns.
 * @returns The filtered and sorted array of columns.
 */
const filterVisibleColumns = (columns: Column[]) => {
  return columns
    .filter((col) => col.mobile?.visible !== false)
    .sort((a, b) => {
      if (a.mobile?.order === undefined) return 1;
      if (b.mobile?.order === undefined) return -1;
      return a.mobile.order - b.mobile.order;
    });
};

/**
 * Wrapper component for mobile card templates.
 * @param className - The class name for the card.
 * @param onClick - The click handler for the card.
 * @param rowIndex - The index of the row.
 * @param record - The data record.
 * @param children - The child elements.
 * @returns The wrapped card component.
 */
const CardWrapper: React.FC<{
  className: string;
  onClick?: (record: any) => void;
  rowIndex: number;
  record: any;
  children: React.ReactNode;
}> = ({ className, onClick, rowIndex, record, children }) => (
  <div
    className={`card ${className}`}
    onClick={() => onClick?.(record)}
    key={rowIndex}
  >
    {children}
  </div>
);

/**
 * Component for rendering mobile card templates.
 * @param record - The data record.
 * @param columns - The array of columns.
 * @param rowIndex - The index of the row.
 * @param type - The type of mobile card template.
 * @param onClick - The click handler for the card.
 * @param renderMobileCard - Custom render function for the mobile card.
 * @returns The rendered mobile card template.
 */
const MobileCardTemplates: React.FC<MobileCardTemplateProps> = ({
  record,
  columns,
  rowIndex,
  type,
  onClick,
  renderMobileCard,
}) => {
  if (renderMobileCard) {
    return (
      <CardWrapper
        className="customMobileCard"
        onClick={onClick}
        record={record}
        rowIndex={rowIndex}
      >
        {renderMobileCard(record, columns, rowIndex)}
      </CardWrapper>
    );
  }

  const headerColumnCount = type.startsWith("WithHeader.")
    ? parseInt(type.split(".")[1], 10)
    : 2;

  const computeColumnsWithIndex = (columns: Column[]) => {
    // Compute top columns with their indexes
    const topColumnsWithIndex = columns
      .map((col, index) => ({ col, index })) // Map columns with their index
      .filter((item) => item.col.mobile?.order !== undefined) // Filter columns with mobile.order defined
      .sort((a, b) => a.col.mobile!.order! - b.col.mobile!.order!) // Sort by mobile.order
      .slice(0, headerColumnCount); // Limit to headerColumnCount

    // Get the indexes of the top columns
    const topColumnsIndexes = topColumnsWithIndex.map((item) => item.index);

    // Extract the topColumns array for logging or further use
    const topColumns = topColumnsWithIndex.map((item) => item.col);

    // Filter bottom columns based on their index (not on dataIndex)
    const bottomColumns = filterVisibleColumns(
      columns.filter((_, index) => !topColumnsIndexes.includes(index)),
    );

    return {
      topColumns,
      bottomColumns,
      topColumnsIndexes,
    };
  };

  switch (type) {
    /**
     * WithHeaderTitleAbove: header columns with title above value
     */
    case MobileCardTemplateType.WithHeaderTitleAbove: {
      const { topColumns, bottomColumns } = computeColumnsWithIndex(columns);

      return (
        <CardWrapper
          className="mobileCardWithHeaderTitleAbove"
          onClick={onClick}
          record={record}
          rowIndex={rowIndex}
        >
          <div className="rowHeader">
            {topColumns.map((col, colIndex) => (
              <div key={colIndex} className="col">
                {renderColumnContent(col, record, rowIndex)}
              </div>
            ))}
          </div>
          <div className="separator" />
          <div className="row">
            {bottomColumns.map((col, colIndex) => (
              <div key={colIndex} className="col">
                {col.mobile?.titleVisible !== false && col.title && (
                  <div className="title">{col.title}</div>
                )}
                <div className="content">
                  {renderColumnContent(col, record, rowIndex)}
                </div>
              </div>
            ))}
          </div>
        </CardWrapper>
      );
    }
    case MobileCardTemplateType.WithHeader:
    case MobileCardTemplateType.WithHeaderNumber2:
    case MobileCardTemplateType.WithHeaderNumber3:
    case MobileCardTemplateType.WithHeaderNumber4:
      const { topColumns, bottomColumns } = computeColumnsWithIndex(columns);

      return (
        <CardWrapper
          className="mobileCardWithHeader"
          onClick={onClick}
          record={record}
          rowIndex={rowIndex}
        >
          <div className="rowHeader">
            {topColumns.map((col, colIndex) => (
              <div key={colIndex} className="col">
                {renderColumnContent(col, record, rowIndex)}
              </div>
            ))}
          </div>
          <div className="separator" />
          <div className="row">
            {bottomColumns.map((col, colIndex) => (
              <div key={colIndex} className="col">
                <div className="content">
                  {renderColumnContent(col, record, rowIndex)}
                </div>
                {col.mobile?.titleVisible !== false && col.title && (
                  <div className="title">{col.title}</div>
                )}
              </div>
            ))}
          </div>
        </CardWrapper>
      );

    case MobileCardTemplateType.WithoutHeader:
      return (
        <CardWrapper
          className="mobileCardWithoutHeader"
          onClick={onClick}
          record={record}
          rowIndex={rowIndex}
        >
          <div className="row">
            {filterVisibleColumns(columns).map((col, colIndex) => (
              <div key={colIndex} className="col">
                <div className="content">
                  {renderColumnContent(col, record, rowIndex)}
                </div>
                {col.mobile?.titleVisible !== false && col.title && (
                  <div className="title">{col.title}</div>
                )}
              </div>
            ))}
          </div>
        </CardWrapper>
      );

    case MobileCardTemplateType.Default:
    default:
      return (
        <CardWrapper
          className="mobileCardDefault"
          onClick={onClick}
          record={record}
          rowIndex={rowIndex}
        >
          {filterVisibleColumns(columns).map((col, colIndex) => (
            <div key={colIndex} className="col card-content">
              {col.mobile?.titleVisible !== false &&
                col.title &&
                col.title !== "" && (
                  <span className="title">
                    <strong>{col.title}</strong>{" "}
                  </span>
                )}
              <span className="content">
                {renderColumnContent(col, record, rowIndex)}
              </span>
            </div>
          ))}
        </CardWrapper>
      );
  }
};

export default MobileCardTemplates;
