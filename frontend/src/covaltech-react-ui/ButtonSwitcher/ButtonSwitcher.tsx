import "./ButtonSwitcher.scss";

import React, { useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Button from "../Button/Button";
export type ButtonSwitcherValue = {
  id: string;
  name: string;
};

interface ButtonSwitcherProps<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  datas: T[];
  className?: string;
  localStorageKey?: string;
  style?: React.CSSProperties;
  rows?: number;
  collumns?: number;
  width?: string;
  maxValue?: number; // Number of items to display at once
}

const ButtonSwitcher = <T extends ButtonSwitcherValue>({
  value,
  setValue,
  datas,
  className,
  localStorageKey,
  style,
  rows = 1,
  collumns,
  width = "fit-content",
  maxValue,
}: ButtonSwitcherProps<T>) => {
  const [startIdx, setStartIdx] = useState(0);
  const displayCount =
    maxValue && maxValue > 0 ? Math.min(maxValue, datas.length) : datas.length;

  // Keep startIdx in sync with value, centering selected if possible
  useEffect(() => {
    const idx = datas.findIndex((item) => item.id === value.id);
    if (idx === -1) return;
    // If not enough items to scroll, always start at 0
    if (displayCount >= datas.length) {
      setStartIdx(0);
      return;
    }
    // Try to center the selected value
    const half = Math.floor(displayCount / 2);
    let newStartIdx = idx - half;
    // Clamp to bounds
    if (newStartIdx < 0) newStartIdx = 0;
    if (newStartIdx > datas.length - displayCount)
      newStartIdx = datas.length - displayCount;
    setStartIdx(newStartIdx);
  }, [value, datas, displayCount]);

  const handleClick = useCallback(
    (item: T) => {
      setValue(item);
      if (localStorageKey && "id" in item) {
        localStorage.setItem(localStorageKey, item.id);
      }
    },
    [setValue, localStorageKey],
  );

  const onPrevious = () => {
    const idx = datas.findIndex((item) => item.id === value.id);
    if (idx > 0) {
      const newIdx = idx - 1;
      setValue(datas[newIdx]);
      if (localStorageKey && "id" in datas[newIdx]) {
        localStorage.setItem(localStorageKey, datas[newIdx].id);
      }
      // Center the window around the new selection if possible
      if (displayCount < datas.length) {
        let newStartIdx = newIdx - Math.floor(displayCount / 2);
        if (newStartIdx < 0) newStartIdx = 0;
        if (newStartIdx > datas.length - displayCount)
          newStartIdx = datas.length - displayCount;
        setStartIdx(newStartIdx);
      }
    }
  };

  const onNext = () => {
    const idx = datas.findIndex((item) => item.id === value.id);
    if (idx < datas.length - 1) {
      const newIdx = idx + 1;
      setValue(datas[newIdx]);
      if (localStorageKey && "id" in datas[newIdx]) {
        localStorage.setItem(localStorageKey, datas[newIdx].id);
      }
      // Center the window around the new selection if possible
      if (displayCount < datas.length) {
        let newStartIdx = newIdx - Math.floor(displayCount / 2);
        if (newStartIdx < 0) newStartIdx = 0;
        if (newStartIdx > datas.length - displayCount)
          newStartIdx = datas.length - displayCount;
        setStartIdx(newStartIdx);
      }
    }
  };

  // Only show a slice of datas if maxValue is set
  const visibleDatas = datas.slice(startIdx, startIdx + displayCount);

  return (
    <div
      className={`buttonSwitcher ${className ?? ""}`}
      style={{
        gridTemplateColumns: `${maxValue ? "auto" : ""} repeat(${collumns ?? visibleDatas.length}, 1fr) ${maxValue ? "auto" : ""}`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: width,
      }}
    >
      {maxValue && (
        <Button
          onClick={onPrevious}
          style="square"
          icon={<FaChevronLeft />}
          disabled={datas.length <= 1 || value.id === datas[0].id}
        />
      )}
      {visibleDatas.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item)}
          className={`buttonSetValue ${value.id === item.id ? "selected" : ""}`}
          style={{ ...style }}
        >
          {item.name}
        </button>
      ))}
      {maxValue && (
        <Button
          onClick={onNext}
          style="square"
          icon={<FaChevronRight />}
          disabled={
            datas.length <= 1 || value.id === datas[datas.length - 1].id
          }
        />
      )}
    </div>
  );
};

export default ButtonSwitcher;
