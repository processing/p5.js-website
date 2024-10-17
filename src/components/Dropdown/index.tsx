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
  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

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

  const handleOptionClick = (option: DropdownOption) => {
    if (variant === "dropdown") {
      setSelected(option.value);
      setIsOpen(false);
    }

    if (variant === "radio" && Array.isArray(selected)) {
      const newSelected = selected.includes(option.value)
        ? selected.filter((value) => value !== option.value)
        : [...selected, option.value];
      setSelected(newSelected);
    }
    onChange(option);
  };

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        optionRefs.current[0]?.focus();
      }, 0);
    }
  }, [isOpen]);

  const isSelected = (option: DropdownOption) => {
    if (variant === "dropdown") {
      return selected === option.value || selected === option.id;
    }
    return selected.includes(option.value);
  };

  // Checkmark SVG
  const checkmarkSVG = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="m 16.371092,6.6210937 c 0.513245,0.5203285 0.507123,1.3583198 -0.01367,1.8710938 L 9.8535158,14.896484 c -0.5147559,0.506589 -1.3407128,0.506589 -1.8554687,0 L 3.6425783,10.607422 C 3.1217848,10.094649 3.1156616,9.2566574 3.6289063,8.7363283 4.1416797,8.2155349 4.9796709,8.2094117 5.5,8.7226563 L 8.9257813,12.097656 14.5,6.6074219 c 0.519236,-0.5121001 1.35949,-0.5058647 1.871092,0.013672 z M 10,20 C 15.5228,20 20,15.5228 20,10 20,4.47715 15.5228,0 10,0 4.47715,0 0,4.47715 0,10 0,15.5228 4.47715,20 10,20 Z" fill="currentColor"></path>
    </svg>
  );

  const renderCollapsedDropdown = () => (
    <button
      className={styles.selected}
      onClick={handleDropdownClick}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      tabIndex={0}
    >
      <div className={styles.iconTop}>
        <Icon kind={iconKind} />
      </div>
      <span>
        {dropdownLabel ||
          options.find((option) => isSelected(option))?.label ||
          "Select..."}
      </span>
      <div className={styles.chevron}>
        <Icon kind="chevron-down" />
      </div>
    </button>
  );

  const renderExpandedDropdown = () => (
    <ul className={styles.options} role="listbox" tabIndex={-1}>
      {options.map((option, index) => (
        <li key={option.value} className={styles.option} role="option" aria-selected={isSelected(option)}>
          <div className={styles.icon}>
            {isSelected(option) ? checkmarkSVG : <Icon kind="option-unselected" />}
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
