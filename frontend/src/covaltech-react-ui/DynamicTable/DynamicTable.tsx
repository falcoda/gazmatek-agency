import "./DynamicTable.scss";

import React, {
  memo,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Button from "../Button/Button";
import { breakpoints } from "../config/breakpoints";
import useWindowWidth from "../hooks/useWindowWidth";
import NoData from "../NoData/NoData";
import MobileCardTemplates, {
  MobileCardTemplateType,
} from "./MobileCardTemplates";
import PaginationControls from "./PaginationControls/PaginationControls";
import RowAmount from "./RowAmount/RowAmount";
import Sort from "./sort.svg?react";
import TableFilter from "./TableFilter/TableFilter";

export interface Column {
  title: string | ReactElement | undefined;
  dataIndex: string;
  colunmWidth?: string;
  sortable?: boolean; // Indiquate if the column is sortable
  onSort?: () => void; // Fonction to call when the column is sorted
  sortableClass?: string; // Class to apply to the button when the column is sorted
  filterable?: boolean; // Indicate if the column should have a filter
  filterType?: "checkbox" | "minmax"; // Type of filter to use (checkbox list or min/max for numbers)
  filterableIndex?: string; // Custom path for filtering (e.g., "metrics.cpu_usage")
  mobile?: {
    titleVisible?: boolean;
    visible: boolean;
    order?: number; // Ordre d'affichage en mode mobile
  };
  render?: (
    value: any,
    record: any,
    index: number,
  ) => ReactElement | string | number;
}

import usePaginationStore from "../stores/PaginationStore";

interface DynamicTableProps {
  data: any[];
  columns: Column[];
  onClick?: (record: any) => void;
  rowHeight?: number;
  maxRow?: number;
  mobile?: boolean;
  mobileBreakpoint?: number;
  className?: string;
  pagined?: boolean;
  scrollable?: boolean;
  renderMobileCard?: (
    record: any,
    columns: Column[],
    rowIndex: number,
  ) => ReactElement;
  mobileCardTemplateType?: MobileCardTemplateType;
  /**
   * Callback for server-side pagination. Called when the page or page size changes.
   * page: 1-based page index
   * pageSize: number of rows per page
   */
  onPaginate?: (page: number, pageSize: number) => void;
  tableId?: string; // unique id for the table for pagination store
  /**
   * Total number of items for server-side pagination (if known)
   */
  totalCount?: number;
}

const DynamicTable: React.FC<DynamicTableProps> = memo(
  ({
    data,
    columns,
    onClick,
    rowHeight = 55,
    maxRow,
    mobile,
    mobileBreakpoint = breakpoints["breakpoint-md-2"],
    className,
    pagined = false,
    scrollable = false,
    renderMobileCard,
    mobileCardTemplateType = MobileCardTemplateType.Default,
    tableId: propTableId,
    onPaginate,
    totalCount,
  }: DynamicTableProps) => {
    // Validation to ensure only one of `pagined` or `scrollable` is true
    if (pagined && scrollable) {
      console.error(
        "DynamicTable: `pagined` and `scrollable` cannot be true at the same time. Please choose one.",
      );
      return null; // Prevent rendering if both are true
    }

    const { windowWidth } = useWindowWidth();
    const isServerPaginated = pagined && typeof onPaginate === "function";
    const [sortState, setSortState] = useState<{
      column: string;
      direction: "asc" | "desc";
    } | null>(null);
    const [paginatedData, setPaginatedData] = useState(data);

    // Generate a unique ID for the table if not provided
    // This is used to manage pagination state in the store
    const uniqueIdRef = useRef<string | null>(null);
    if (!uniqueIdRef.current) {
      uniqueIdRef.current =
        propTableId ||
        `table-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    const tableId = uniqueIdRef.current;

    const { pagination, setCurrentPage, setPageSize, setPagination } =
      usePaginationStore();

    // Initialize current page and max rows from the store
    const currentPage = pagination[tableId]?.page || 1;
    let maxRows = pagination[tableId]?.pageSize;
    // If maxRow is passed as a prop, we set it in the store if it's different from the current value
    useEffect(() => {
      if (typeof maxRow === "number" && maxRow > 0 && maxRow !== maxRows) {
        setPageSize(tableId, maxRow);
      }
    }, [maxRow, tableId]);

    maxRows = pagination[tableId]?.pageSize || maxRow || 100;

    const handlePageChange = (page: number) => {
      setCurrentPage(tableId, page);
      if (onPaginate) {
        onPaginate(page, maxRows ?? 10);
      }
    };

    // Handle page size change for server-side pagination
    // Call onPaginate only if it's not the first render
    const handleMaxRowsChange = (rows: number) => {
      setPageSize(tableId, rows);
      setCurrentPage(tableId, 1); // Reset page to 1 when page size changes
      if (onPaginate) {
        onPaginate(1, rows);
      }
    };

    // Object to hold filters for each filterable column
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [filteredData, setFilteredData] = useState(data);

    // Update filter for a given column
    const handleFilterChange = (filterColumn: string, filterValue: any) => {
      setFilters((prev) => ({ ...prev, [filterColumn]: filterValue }));
    };

    // Extract filterable columns from the configuration
    // we will use this to show the filter component and to apply the filters
    const filterableColumns = columns.filter((col) => col.filterable);

    useEffect(() => {
      const applyFilters = () => {
        // If no filters are applied, show all data
        if (Object.keys(filters).length === 0) {
          setFilteredData(data);
          return;
        }

        let updatedData = [...data];

        // Apply filters from the `filters` state
        Object.keys(filters).forEach((filterColumn) => {
          const filterValue = filters[filterColumn];
          const column = columns.find((col) => col.dataIndex === filterColumn);

          if (!column) return;

          // Use `filterableIndex` if provided, otherwise fallback to `dataIndex`
          const filterPath = column.filterableIndex || column.dataIndex;

          // we check if the filterValue is an array and has a length greater than 0
          if (Array.isArray(filterValue) && filterValue.length !== 0) {
            // Checkbox filter
            updatedData = updatedData.filter((item) => {
              const value = filterPath
                .split(".")
                .reduce((acc, key) => acc?.[key], item);
              return filterValue.includes(value);
            });
          } else if (typeof filterValue === "object" && filterValue !== null) {
            // Min/Max filter
            const { min, max } = filterValue;

            // Check if both min and max are undefined
            // If both are undefined, we don't filter
            if (min === undefined && max === undefined) return;

            updatedData = updatedData.filter((item) => {
              const value = filterPath
                .split(".")
                .reduce((acc, key) => acc?.[key], item);
              if (value === undefined) return false;
              if (min !== undefined && value < min) return false;
              if (max !== undefined && value > max) return false;
              return true;
            });
          }
        });

        setFilteredData(updatedData);
      };

      applyFilters();
    }, [data, filters, columns]);

    useEffect(() => {
      setPaginatedData(paginatedData);
    }, [paginatedData]);

    useEffect(() => {
      if (!maxRows || !pagined || isServerPaginated) {
        setPaginatedData(filteredData);
        return;
      }
      setPaginatedData(
        filteredData.slice((currentPage - 1) * maxRows, currentPage * maxRows),
      );
    }, [filteredData, currentPage, isServerPaginated, maxRows, pagined]);

    const handleSort = (col: Column) => {
      if (col.sortable) {
        const direction = sortState?.direction === "asc" ? "desc" : "asc";
        setSortState({ column: col.dataIndex, direction });
        if (col.onSort) {
          col.onSort();
        }
      }
    };

    const getSortClass = (col: Column) => {
      if (sortState && sortState.column === col.dataIndex) {
        return `active ${sortState.direction === "asc" ? "asc" : "desc"}`;
      }
      return "";
    };

    const gridTemplateColumns = useMemo(() => {
      return columns.map((col) => col.colunmWidth || "1fr").join(" ");
    }, [columns]);

    const tableBodyStyle: React.CSSProperties = useMemo(() => {
      if (pagined) {
        return {};
      }
      return maxRows
        ? {
            maxHeight: `${maxRows * rowHeight - 2}px`,
            overflowY: scrollable ? "auto" : "unset",
          }
        : {};
    }, [maxRows, rowHeight]);

    // if the data is empty, we return a message
    if (data.length === 0) {
      return <NoData title="No Data" />;
    }

    // Mobile mode or not
    if (mobile && mobileBreakpoint >= windowWidth) {
      return (
        <div className="mobileTable">
          {paginatedData.map((record, rowIndex) => (
            <MobileCardTemplates
              key={rowIndex}
              record={record}
              columns={columns}
              rowIndex={rowIndex}
              type={mobileCardTemplateType}
              onClick={onClick}
              renderMobileCard={renderMobileCard}
            />
          ))}
          {pagined && maxRows && filteredData && (
            <div className="tableControllers">
              <RowAmount maxRows={maxRows} setMaxRows={handleMaxRowsChange} />
              <PaginationControls
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalCount={totalCount ? totalCount : filteredData.length}
                pageSize={maxRows}
                siblingCount={2}
              />
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="dynamicTableContainer">
          {filterableColumns.length > 0 && (
            <TableFilter
              data={data}
              filterableColumns={filterableColumns}
              onFilterChange={handleFilterChange}
            />
          )}
          <div className={`dynamicTable ${className ?? ""}`}>
            <header
              className="tableHeader"
              style={{ gridTemplateColumns: gridTemplateColumns }}
            >
              {columns.map((col, index) => (
                <span
                  key={index}
                  className={`col ${col.sortable ? "sortable" : ""}`}
                  onClick={() => col.sortable && handleSort(col)}
                >
                  {col.title}
                  {col.sortable && (
                    <Button
                      icon={<Sort />}
                      style="transparent"
                      // give asc or desc class to the button
                      className={`${col.sortableClass || ""} ${getSortClass(
                        col,
                      )}`}
                    />
                  )}
                </span>
              ))}
            </header>
            <section className="tableBody" style={tableBodyStyle}>
              {paginatedData.map((record, rowIndex) => (
                <div
                  className="tableRow"
                  key={rowIndex}
                  onClick={() => (onClick ? onClick(record) : undefined)}
                  style={{
                    gridTemplateColumns: gridTemplateColumns,
                    height: `${rowHeight}px`,
                    cursor: onClick ? "pointer" : "default",
                    // paddingRight: scrollable ? "13px" : "13px",
                  }}
                >
                  {columns.map((col, colIndex) => {
                    const value = col.dataIndex
                      .split(".")
                      .reduce((acc, key) => acc?.[key], record);
                    return (
                      <span key={colIndex} className="col">
                        {col.render
                          ? col.render(value, record, rowIndex)
                          : value}
                      </span>
                    );
                  })}
                </div>
              ))}
            </section>
            {pagined && maxRows && !scrollable && filteredData && (
              <div className="tableControllers">
                <RowAmount maxRows={maxRows} setMaxRows={handleMaxRowsChange} />
                <PaginationControls
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  totalCount={totalCount ? totalCount : filteredData.length}
                  pageSize={maxRows}
                  siblingCount={2}
                />
              </div>
            )}
          </div>
        </div>
      );
    }
  },
);

DynamicTable.displayName = "DynamicTable";

export default DynamicTable;
