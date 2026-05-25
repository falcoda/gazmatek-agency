import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { StyledInputBase } from "../StyledInput";

const StyledInputPassword: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  invalid?: boolean;
  invalidMessage?: string;
  width?: string;
}> = ({
  label,
  placeholder,
  value,
  setValue,
  required,
  className,
  style,
  invalid,
  invalidMessage,
  width,
}) => {
  const [inputType, setInputType] = useState("password");

  const toggleVisibility = () => {
    setInputType(inputType === "password" ? "text" : "password");
  };

  return (
    <StyledInputBase
      label={label}
      value={value}
      setValue={setValue}
      type={inputType}
      style={style}
      className={className ?? ""}
      width={width}
    >
      <div className={`wrappedInput ${invalid ? "invalid" : ""}`}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? label}
          required={required}
        />
        <div className="inputButton" onClick={toggleVisibility}>
          {inputType === "password" ? <FiEyeOff /> : <FiEye />}
        </div>
      </div>
      {invalid && invalidMessage && (
        <span className="invalidMessage">{invalidMessage}</span>
      )}
    </StyledInputBase>
  );
};

export default StyledInputPassword;
