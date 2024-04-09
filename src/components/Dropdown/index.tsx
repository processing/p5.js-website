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
  initialSelected: string | string[];
  onChange: (option: DropdownOption) => void;
  iconKind: IconKind;
  variant?: "dropdown" | "radio";
  dropdownLabel?: string;
};

export const Dropdown = ({
  options,
  initialSelected,
  dropdownLabel,
  onChange,
  iconKind,
  variant = "dropdown",
}: DropdownProps) => {
  const [selected, setSelected] = useState(initialSelected);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<HTMLButtonElement[]>([]);

  // In order to support instant update of the selected option
  // the selected state can be updated in this component
  // There are instances where the parent component controls it
  // instead (asynchronous loading of localStorage setting, etc)
  // Support updating the selected option from the parent component
  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

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
    if (variant === "dropdown") {
      setSelected(option.value);
      setIsOpen(false);
    }

    // With a radio variant, multiple options can be selected
    if (variant === "radio" && Array.isArray(selected)) {
      const newSelected = selected.includes(option.value)
        ? selected.filter((value) => value !== option.value)
        : [...selected, option.value];
      setSelected(newSelected);
    }
    onChange(option);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
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
  const isSelected = (option: DropdownOption) => {
    if (variant === "dropdown") {
      return selected === option.value || selected === option.id;
    }
    return selected.includes(option.value);
  };

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
      <span>
        {dropdownLabel ||
          options.find((option) => isSelected(option))?.label ||
          "Select..."}
      </span>
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
            <span>{option.label}</span>
          </button>
        </li>
      ))}
      {variant === "radio" ? (
        <button onClick={() => setIsOpen(false)} className={styles.chevron}>
          <Icon kind="chevron-up" />
        </button>
      ) : (
        <div className={styles.chevron}>
          <Icon kind="chevron-up" />
        </div>
      )}
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
