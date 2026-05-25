import "./Slider.scss";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import Button from "../Button/Button";
import StyledInputNumber from "../StyledInput/StyledInputNumber/StyledInputNumber";

interface SliderProps {
  value: number | undefined;
  setValue: (value: number | undefined) => void;
  title: string;
  max: number;
  min?: number;
  className?: string;
  enableMaxButton?: boolean;
  enableNumberInput?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value,
  setValue,
  title,
  max,
  min = 0,
  className,
  enableMaxButton = false,
  enableNumberInput = false,
}) => {
  const [inputStrValue, setInputStrValue] = useState<string>(
    value ? value.toString() : "",
  );

  useEffect(() => {
    setInputStrValue(value ? value.toString() : "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Check if input is a valid number with either dot or comma
    const isValidInput = /^(\d+([.,]\d*)?)?$/.test(inputValue);

    if (!isValidInput) return; // Don't process invalid input

    // Replace comma with dot
    inputValue = inputValue.replace(/,/g, ".");

    const numericValue = inputValue !== "" ? Number(inputValue) : null;

    if (numericValue !== null) {
      if (numericValue > max) {
        setInputStrValue(max.toString());
        setValue(max);
        toast.error(`Time cannot exceed ${max} days`);
      } else {
        setInputStrValue(inputValue);
        setValue(numericValue);
      }
    } else {
      setValue(0);
    }
  };

  return (
    <div className={`sliderContainer ${className ? className : ""}`}>
      <span className="sliderTitle">
        <label htmlFor={`slider${className ? className : ""}`}>{title}</label>
        {enableMaxButton && (
          <Button
            onClick={() => {
              setValue(max);
              setInputStrValue(max.toString());
            }}
            label="MAX"
            style="transparent"
            className="maxButton"
            height={25}
            width={50}
          />
        )}
        {enableNumberInput && (
          <StyledInputNumber
            value={inputStrValue}
            setValue={(val) => {
              // Convert string|null to number|undefined for the parent setValue
              if (val === null || val === "") {
                setValue(undefined);
              } else {
                const num = Number(val);
                setValue(isNaN(num) ? undefined : num);
              }
            }}
            min={min.toString()}
            max={max.toString()}
            displayMaxButton={true}
            className="sliderInput"
          />
        )}
      </span>
      <div className="sliderContainer">
        <div className="sliderWrapper">
          <input
            type="range"
            id={`slider${className ? className : ""}`}
            name="slider"
            min={min}
            max={max}
            value={value}
            step={0.0001}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </div>
        <div className="sliderWrapper">
          <span className="sliderMinValue">{min}</span>
          <span className="sliderMaxValue">{max}</span>
        </div>
      </div>
    </div>
  );
};

export default Slider;
