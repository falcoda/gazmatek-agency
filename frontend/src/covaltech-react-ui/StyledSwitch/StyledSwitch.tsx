import "./StyledSwitch.scss";

import React from "react";

interface StyledSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
  width?: string;
}

const StyledSwitch: React.FC<StyledSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  style,
  className,
  width,
}) => {
  const switchStyle = checked ? "switchOn" : "switchOff";

  return (
    <div
      className={`styledSwitch ${className ?? ""}`}
      style={{ ...style, width }}
    >
      {label && <label htmlFor={id}>{label}</label>}
      <label className={`toggleSwitch ${switchStyle}`}>
        <input
          type="checkbox"
          id={id}
          className="switchCheckbox"
          checked={checked}
          onChange={onChange}
        />
        <span className="switchLabel">
          <span className="switchHandle"></span>
        </span>
      </label>
    </div>
  );
};

export default StyledSwitch;
