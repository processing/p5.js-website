import { useEffect, useState } from "preact/hooks";
import { Dropdown, type DropdownOption } from "../Dropdown";

type AccessibilitySettingsProps = {
  options: DropdownOption[];
};

type PossibleA11ySettings =
  | "dark-theme"
  | "monochrome-theme"
  | "show-alt-text"
  | "reduced-motion";

export const AccessibilitySettings = ({
  options,
}: AccessibilitySettingsProps) => {
  const [selectedSettings, setSelectedSettings] = useState<
    PossibleA11ySettings[]
  >([]);

  // Load previously saved preferences from localStorage
  useEffect(() => {
    const storedSettings = [] as PossibleA11ySettings[];
    for (const setting of [
      "dark-theme",
      "monochrome-theme",
      "show-alt-text",
      "reduced-motion",
    ] as PossibleA11ySettings[]) {
      const storedSetting = localStorage.getItem(setting);
      if (storedSetting === "true") {
        storedSettings.push(setting);
      }
    }
    setSelectedSettings(storedSettings);
    document.body.classList.add(...storedSettings);
  }, []);

  const toggleSetting = (setting: PossibleA11ySettings) => {
    const newSettings = selectedSettings.includes(setting)
      ? selectedSettings.filter((value) => value !== setting)
      : [...selectedSettings, setting];
    setSelectedSettings(newSettings);
    localStorage.setItem(setting, newSettings.includes(setting).toString());
    document.body.classList.toggle(setting, newSettings.includes(setting));
  };

  return (
    <Dropdown
      options={options}
      dropdownLabel="Accessibility"
      onChange={(option) => toggleSetting(option.value as PossibleA11ySettings)}
      iconKind="settings"
      variant="radio"
      initialSelected={selectedSettings}
    />
  );
};
