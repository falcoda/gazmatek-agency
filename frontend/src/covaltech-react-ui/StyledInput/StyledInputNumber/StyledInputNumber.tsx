import { useEffect, useState } from "react";

import FormatNumber from "../../Utils/Format/FormatNumber/FormatNumber";
import { StyledInputBase } from "../StyledInput";

const StyledInputNumber: React.FC<{
  label?: string;
  value: string | null;
  setValue: (value: string | null) => void;
  className?: string;
  style?: React.CSSProperties;
  valid?: boolean;
  min?: string;
  max?: string;
  maxClick?: () => void;
  displayMaxButton?: boolean;
  displayedMaxAlias?: string;
  displayedMaxLabel?: string;
  balance?: string;
  wrapInputText?: string;
  width?: string | number;
  disabled?: boolean;
}> = ({
  label,
  value,
  setValue,
  className,
  style,
  valid = true,
  min,
  max,
  maxClick,
  displayMaxButton,
  displayedMaxAlias,
  displayedMaxLabel,
  balance,
  wrapInputText,
  width,
  disabled = false,
}) => {
  const [inputStrValue, setInputStrValue] = useState<string>(value || "");
  useEffect(() => {
    setInputStrValue(value || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Check if input is a valid number with either dot or comma
    const isValidInput = /^(\d+([.,]\d*)?)?$/.test(inputValue);

    if (!isValidInput) return; // Don't process invalid input

    // Replace comma with dot
    inputValue = inputValue.replace(/,/g, ".");

    setInputStrValue(inputValue);

    // if > max, set to max
    if (max && parseFloat(inputValue) > parseFloat(max)) {
      setValue(max);
      setInputStrValue(max);
      return;
    }

    if (inputValue !== "") {
      setValue(inputValue);
    } else {
      setValue(null);
      setInputStrValue("");
    }
  };

  const handleMaxClick = () => {
    maxClick?.();
    if (max) {
      setInputStrValue(max);
      setValue(max);
    }
  };

  return (
    <StyledInputBase
      label={label}
      value={value}
      setValue={setValue}
      style={style}
      type="number"
      className={className ?? ""}
      width={width}
    >
      <div className="balanceInput">
        <div
          className={`wrappedInput ${!valid ? "invalid" : ""} `}
          tabIndex={0}
        >
          <input
            placeholder="0"
            id={`amountInput`}
            min={min}
            max={max}
            type="text"
            value={inputStrValue}
            onChange={handleInputChange}
            step="0.01"
            tabIndex={-1}
            disabled={disabled}
          />
          {max && displayMaxButton && (
            <button className="inputButton maxButton" onClick={handleMaxClick}>
              MAX
            </button>
          )}
          {wrapInputText && (
            <span className="wrapInputText">{wrapInputText}</span>
          )}
        </div>
        {balance && (
          <div className="max">
            {displayedMaxLabel && (
              <span className="maxLabel">{displayedMaxLabel}:&nbsp;</span>
            )}

            <FormatNumber
              value={balance}
              toFixed={9}
              alias={displayedMaxAlias}
            />
          </div>
        )}
      </div>
    </StyledInputBase>
  );
};

export default StyledInputNumber;
