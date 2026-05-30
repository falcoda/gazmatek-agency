import "./StyledInputSearch.scss";

import { StyledInputBase } from "../StyledInput";
import Search from "./search.svg?react";

interface StyledInputSearchProps {
  value: string;
  setValue: (value: string) => void;
  className?: string;
  isValid?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
  width?: string | number;
}

const StyledInputSearch: React.FC<StyledInputSearchProps> = ({
  value,
  setValue,
  className,
  isValid = true,
  placeholder,
  label,
  required,
  style,
  width,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue.trim());
  };

  return (
    <StyledInputBase
      label={label}
      value={value}
      setValue={setValue}
      type="text"
      style={style}
      className={`styledInputSearch ${className ?? ""}`.trim()}
      width={width}
    >
      <div className={`wrappedInput ${!isValid ? "invalid" : ""} `}>
        <input
          placeholder={placeholder}
          type="text"
          id="searchInput"
          value={value}
          onChange={handleInputChange}
          required={required}
        />
        <div className="inputIcon">
          <Search />
        </div>
      </div>
    </StyledInputBase>
  );
};

export default StyledInputSearch;
