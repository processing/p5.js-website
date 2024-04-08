import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import styles from "./styles.module.scss";
import { Icon, type IconKind } from "../Icon";

export type DropdownOption = {
  value: string;
  label: string;
  id?: string;
};

type DropdownProps = {
  options: DropdownOption[];
  initialSelected: string;
  onChange: (option: DropdownOption) => void;
  iconKind: IconKind;
  variant?: "dropdown" | "radio";
};

export const Dropdown = ({
  options,
  initialSelected,
  onChange,
  iconKind,
  variant = "dropdown",
}: DropdownProps) => {
  const [selected, setSelected] = useState(initialSelected);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const optionRefs = useRef<HTMLButtonElement[]>([]);

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  // Handle blur event, focus moving away from open dropdown
  const handleBlur = () => {
    setTimeout(() => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(document.activeElement)
      ) {
        setIsOpen(false);
      }
    }, 0);
  };

  // Handle option selection
  const handleOptionClick = (option: DropdownOption) => {
    setSelected(option.value);
    onChange(option);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = optionRefs.current.findIndex(
        (ref) => ref && ref === document.activeElement,
      );
      if (event.key === "ArrowDown") {
        const nextIndex = (currentIndex + 1) % optionRefs.current.length;
        optionRefs.current[nextIndex]?.focus();
      } else if (event.key === "ArrowUp") {
        const prevIndex =
          (currentIndex - 1 + optionRefs.current.length) %
          optionRefs.current.length;
        optionRefs.current[prevIndex]?.focus();
      }
    }
  };

  // Manage focus back to the button when the dropdown is closed
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        optionRefs.current[0]?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Determine if an option is selected
  const isSelected = (option: DropdownOption) =>
    selected === option.value || selected === option.id;

  // Render the collapsed dropdown button
  const renderCollapsedDropdown = () => (
    <button
      className={styles.selected}
      onClick={handleDropdownClick}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      tabIndex={0}
    >
      <div className={styles.icon}>
        <Icon kind={iconKind} />
      </div>
      {options.find((option) => isSelected(option))?.label || "Select..."}
      <div className={styles.chevron}>
        <Icon kind="chevron-down" className={styles.chevron} />
      </div>
    </button>
  );

  // Render the expanded dropdown options
  const renderExpandedDropdown = () => (
    <ul className={styles.options} role="listbox" tabIndex={-1}>
      {options.map((option, index) => (
        <li
          key={option.value}
          className={styles.option}
          role="option"
          aria-selected={isSelected(option)}
        >
          <div className={styles.icon}>
            <Icon
              kind={
                isSelected(option) ? "option-selected" : "option-unselected"
              }
            />
          </div>
          <button
            onClick={() => handleOptionClick(option)}
            ref={(el) => (optionRefs.current[index] = el as HTMLButtonElement)}
            onBlur={handleBlur}
          >
            {option.label}
          </button>
        </li>
      ))}
      <div className={styles.chevron}>
        <Icon kind="chevron-up" className={styles.chevron} />
      </div>
    </ul>
  );

  return (
    <div
      className={styles.container}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {isOpen ? renderExpandedDropdown() : renderCollapsedDropdown()}
    </div>
  );
};
