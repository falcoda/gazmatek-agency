import "./Dropdown.scss";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";

export type ValueList = {
  id: string;
  name: string;
};

interface DropdownProps {
  value: ValueList | undefined;
  setValue: (value: ValueList) => void;
  valueList: ValueList[];
  disabled?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  setValue,
  valueList,
  disabled,
  className,
}) => {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // when click on dropdown item
  const handleClickItem = () => {
    setIsComponentVisible(!isComponentVisible);
  };
  const { t } = useTranslation();

  // when click on toggle switch
  const setChain = (chain: ValueList) => {
    setValue(chain);

    setIsComponentVisible(false);
  };

  // when click outside dropdown
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target &&
      typeof target.className === "string" &&
      ref.current &&
      !ref.current.contains(target) &&
      target.className !== "dropdownMenuName" &&
      !target.className.includes("arrowDown") &&
      !target.className.includes("imgDropdown") &&
      !target.className.includes("dropdownName")
    ) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    // when click outside dropdown, close dropdown
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div
      className={`dropdownDiv ${disabled ? "dropdownDivDisabled" : ""} ${
        className ?? ""
      }`}
    >
      <div className="dropdown">
        <div
          className={`dropdownMenu ${
            isComponentVisible === true ? "active" : ""
          }`}
          tabIndex={0}
        >
          <div className="dropdownMenuName" onClick={() => handleClickItem()}>
            <div className="dropdownName">
              {value ? (
                <span>{value.name}</span>
              ) : (
                <span className="placeholderDropdown">
                  {t("contact.dropdownPlaceholder")}
                </span>
              )}
            </div>
            <FaChevronDown className="arrowDown" />
          </div>
          <div className="submenu" ref={ref}>
            {valueList.map((item) => (
              <div
                className="subDropdownMenu"
                key={item.id}
                onClick={() => setChain(item)}
              >
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
