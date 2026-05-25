import { StyledInputBase } from "../StyledInput";
import GrClose from "./grClose.svg?react";
import GrValid from "./grValid.svg?react";

interface StyledInputAddressProps {
  value: string;
  setValue: (value: string) => void;
  className?: string;
  isValid?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
  showValidityIcon?: boolean;
  width?: string | number;
}

const StyledInputAddress: React.FC<StyledInputAddressProps> = ({
  value,
  setValue,
  className,
  isValid,
  placeholder = "0x...",
  label,
  required,
  style,
  showValidityIcon = true,
  width,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
  };

  const handleReset = () => {
    setValue("");
  };

  return (
    <StyledInputBase
      label={label}
      value={value}
      setValue={setValue}
      type="text"
      style={style}
      className={className ?? ""}
      htmlFor="addressInput"
      width={width}
    >
      <div
        className={`wrappedInput ${value.length > 41 && !isValid ? "invalid" : ""} `}
      >
        <input
          placeholder={placeholder}
          type="text"
          id="addressInput"
          value={value}
          onChange={handleInputChange}
          required={required}
        />

        {value.length > 41 &&
          showValidityIcon &&
          (isValid ? (
            <div className="inputButton" data-testid="GrValid">
              <GrValid />
            </div>
          ) : (
            <button onClick={handleReset} className="inputButton">
              <GrClose className="inputIconValidate" />
            </button>
          ))}
      </div>
    </StyledInputBase>
  );
};

export default StyledInputAddress;
