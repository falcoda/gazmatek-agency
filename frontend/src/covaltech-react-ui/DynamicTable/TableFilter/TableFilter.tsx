import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import Button from "../../Button/Button";
import Checkbox from "../../Checkbox/Checkbox"; // Import your existing Checkbox component
import StyledInputNumber from "../../StyledInput/StyledInputNumber/StyledInputNumber";
import Card from "../../Utils/Containers/Card/Card";
import { Column } from "../DynamicTable";
import "./TableFilter.scss";

export interface TableFilterProps {
  data: any[]; // Array of data objects to filter
  filterableColumns: Column[]; // Array of columns that can be filtered
  onFilterChange?: (filterColumn: string, filter: any) => void; // Callback to notify parent of filter changes
}

const TableFilter: React.FC<TableFilterProps> = ({
  data,
  filterableColumns,
  onFilterChange,
}) => {
  // Retrieve search params from URL for initial state
  const [searchParams, setSearchParams] = useSearchParams();

  // State for checkbox filters (map of column to array of selected values)
  const [checkboxFilters, setCheckboxFilters] = useState<
    Record<string, string[]>
  >(
    filterableColumns.reduce(
      (acc, col) => {
        if (col.filterType === "checkbox") {
          const param = searchParams.get(`filter_${col.dataIndex}`);
          acc[col.dataIndex] = param ? param.split(",") : [];
        }
        return acc;
      },
      {} as Record<string, string[]>,
    ),
  );

  // State for min/max filters (map of column to object with min and max)
  const [minMaxFilters, setMinMaxFilters] = useState<
    Record<string, { min?: number; max?: number }>
  >(
    filterableColumns.reduce(
      (acc, col) => {
        if (col.filterType === "minmax") {
          const min = searchParams.get(`filter_${col.dataIndex}_min`);
          const max = searchParams.get(`filter_${col.dataIndex}_max`);
          acc[col.dataIndex] = {
            min: min ? Number(min) : undefined,
            max: max ? Number(max) : undefined,
          };
        }
        return acc;
      },
      {} as Record<string, { min?: number; max?: number }>,
    ),
  );

  // ----- Handlers for checkbox filter -----
  const handleCheckboxChange = (
    column: string,
    value: string,
    checked: boolean,
  ) => {
    let updatedFilters: string[];
    if (checked) {
      updatedFilters = [...checkboxFilters[column], value];
    } else {
      updatedFilters = checkboxFilters[column].filter((val) => val !== value);
    }
    setCheckboxFilters((prev) => ({ ...prev, [column]: updatedFilters }));
  };

  const clearCheckboxFilter = (column: string, value: string) => {
    setCheckboxFilters((prev) => ({
      ...prev,
      [column]: prev[column].filter((val) => val !== value),
    }));
  };

  // ----- Handlers for min/max filter -----
  const handleMinChange = (column: string, value: string) => {
    setMinMaxFilters((prev) => ({
      ...prev,
      [column]: {
        ...prev[column],
        min: value ? Number(value) : undefined,
      },
    }));
  };

  const handleMaxChange = (column: string, value: string) => {
    setMinMaxFilters((prev) => ({
      ...prev,
      [column]: {
        ...prev[column],
        max: value ? Number(value) : undefined,
      },
    }));
  };

  // Clear all filters for a specific column
  const clearAllFiltersForColumn = (column: string) => {
    if (
      filterableColumns.find((col) => col.dataIndex === column)?.filterType ===
      "checkbox"
    ) {
      setCheckboxFilters((prev) => ({ ...prev, [column]: [] }));
    } else if (
      filterableColumns.find((col) => col.dataIndex === column)?.filterType ===
      "minmax"
    ) {
      setMinMaxFilters((prev) => ({ ...prev, [column]: {} }));
    }
  };

  // ----- Update URL and notify parent when filter changes -----
  useEffect(() => {
    filterableColumns.forEach((col) => {
      if (col.filterType === "checkbox") {
        if (checkboxFilters[col.dataIndex]?.length > 0) {
          searchParams.set(
            `filter_${col.dataIndex}`,
            checkboxFilters[col.dataIndex].join(","),
          );
        } else {
          searchParams.delete(`filter_${col.dataIndex}`);
        }
        onFilterChange &&
          onFilterChange(col.dataIndex, checkboxFilters[col.dataIndex]);
      } else if (col.filterType === "minmax") {
        if (minMaxFilters[col.dataIndex]?.min !== undefined) {
          searchParams.set(
            `filter_${col.dataIndex}_min`,
            (minMaxFilters[col.dataIndex]?.min ?? "").toString(),
          );
        } else {
          searchParams.delete(`filter_${col.dataIndex}_min`);
        }
        if (minMaxFilters[col.dataIndex]?.max !== undefined) {
          searchParams.set(
            `filter_${col.dataIndex}_max`,
            (minMaxFilters[col.dataIndex]?.max ?? "").toString(),
          );
        } else {
          searchParams.delete(`filter_${col.dataIndex}_max`);
        }
        onFilterChange &&
          onFilterChange(col.dataIndex, minMaxFilters[col.dataIndex]);
      }
    });
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkboxFilters, minMaxFilters]);

  return (
    <Card className="tableFilter">
      {/* ----- Display selected filters at the top ----- */}
      <div className="selectedFilters">
        {filterableColumns.map((col) => {
          if (
            col.filterType === "checkbox" &&
            checkboxFilters[col.dataIndex]?.length > 0
          ) {
            return checkboxFilters[col.dataIndex].map((filterValue, index) => (
              <div key={`${col.dataIndex}-${index}`} className="selectedFilter">
                <span>{filterValue}</span>
                <Button
                  className="clearFilterButton"
                  style="transparent"
                  onClick={() =>
                    clearCheckboxFilter(col.dataIndex, filterValue)
                  }
                  height={18}
                  width={18}
                >
                  &times;
                </Button>
              </div>
            ));
          } else if (
            col.filterType === "minmax" &&
            (minMaxFilters[col.dataIndex]?.min !== undefined ||
              minMaxFilters[col.dataIndex]?.max !== undefined)
          ) {
            return (
              <div key={col.dataIndex} className="selectedFilter">
                <span>
                  {col.title}:{" "}
                  {minMaxFilters[col.dataIndex]?.min !== undefined
                    ? `${minMaxFilters[col.dataIndex].min}`
                    : "0"}{" "}
                  -{" "}
                  {minMaxFilters[col.dataIndex]?.max !== undefined
                    ? `${minMaxFilters[col.dataIndex].max}`
                    : "∞"}
                </span>
                <Button
                  className="clearFilterButton"
                  style="transparent"
                  onClick={() => clearAllFiltersForColumn(col.dataIndex)}
                  height={18}
                  width={18}
                >
                  &times;
                </Button>
              </div>
            );
          }
          return null;
        })}
        {filterableColumns.some(
          (col) =>
            (col.filterType === "checkbox" &&
              checkboxFilters[col.dataIndex]?.length > 0) ||
            (col.filterType === "minmax" &&
              (minMaxFilters[col.dataIndex]?.min !== undefined ||
                minMaxFilters[col.dataIndex]?.max !== undefined)),
        ) && (
          <Button
            className="clearAllButton"
            onClick={() => {
              filterableColumns.forEach((col) =>
                clearAllFiltersForColumn(col.dataIndex),
              );
            }}
            style="danger"
            height={29.5}
            padding="5px 10px"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* ----- Render filter options for each column ----- */}
      {filterableColumns.map((col, index) => {
        // For checkbox filter: calculate frequency of each value
        const frequencyMap: Record<string, number> = {};
        if (col.filterType === "checkbox" && col.filterable) {
          data.forEach((item) => {
            const value = (col.dataIndex || col.filterableIndex || "")
              .split(".")
              .reduce((acc, key) => acc?.[key], item); // Resolve nested paths
            if (value !== undefined) {
              frequencyMap[value] = (frequencyMap[value] || 0) + 1;
            }
          });
        }
        // Sort options by frequency (descending)
        const sortedOptions =
          col.filterType === "checkbox" && col.filterable
            ? Object.keys(frequencyMap).sort(
                (a, b) => frequencyMap[b] - frequencyMap[a],
              )
            : [];

        // State to toggle display of all options or only top 5
        const [showAllOptions, setShowAllOptions] = useState(false);

        return (
          <div key={index} className="filterGroup">
            <h4>{col.title}</h4>
            {col.filterType === "checkbox" && (
              <div className="filterOptions">
                {(showAllOptions
                  ? sortedOptions
                  : sortedOptions.slice(0, 5)
                ).map((option, idx) => {
                  const isChecked =
                    checkboxFilters[col.dataIndex]?.includes(option);
                  return (
                    <div key={idx} className="filterOption">
                      <Checkbox
                        checked={isChecked}
                        onChange={(checked: boolean) =>
                          handleCheckboxChange(col.dataIndex, option, checked)
                        }
                      />
                      <span className="optionLabel">
                        {option} ({frequencyMap[option]})
                      </span>
                    </div>
                  );
                })}
                {sortedOptions.length > 4 && (
                  <Button
                    style="transparent"
                    className="toggleShowButton"
                    onClick={() => setShowAllOptions((prev) => !prev)}
                  >
                    {showAllOptions ? "- Voir moins" : "+ Voir plus"}
                  </Button>
                )}
              </div>
            )}
            {col.filterType === "minmax" && (
              <div className="minMaxFilter">
                <StyledInputNumber
                  value={
                    minMaxFilters[col.dataIndex]?.min !== undefined
                      ? (minMaxFilters[col.dataIndex]?.min ?? "").toString()
                      : ""
                  }
                  setValue={(value) =>
                    handleMinChange(col.dataIndex, value || "")
                  }
                />
                <StyledInputNumber
                  value={
                    minMaxFilters[col.dataIndex]?.max !== undefined
                      ? (minMaxFilters[col.dataIndex]?.max ?? "").toString()
                      : ""
                  }
                  setValue={(value) =>
                    handleMaxChange(col.dataIndex, value || "")
                  }
                />
                <Button
                  style="danger"
                  className="clearAllButton"
                  onClick={() => clearAllFiltersForColumn(col.dataIndex)}
                  padding="5px 10px"
                  height={34}
                >
                  <FaTrash />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
};

export default TableFilter;
