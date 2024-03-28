import { useEffect, useState } from "preact/hooks";

export const AccessibilitySettings = () => {
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMonochromeMode, setIsMonochromeMode] = useState(false);
  const [isShowAltText, setIsShowAltText] = useState(false);

  useEffect(() => {
    // Load previously saved preferences from localStorage
    const storedDarkMode = localStorage.getItem("darkMode");
    const storedMonochromeMode = localStorage.getItem("monochromeMode");
    const storedShowAltText = localStorage.getItem("showAltText");
    setIsDarkMode(storedDarkMode === "true");
    setIsMonochromeMode(storedMonochromeMode === "true");
    setIsShowAltText(storedShowAltText === "true");
  }, []);

  const toggleThemeClass = (themeClass: string, active: boolean) => {
    if (active) {
      document.body.classList.add(themeClass);
    } else {
      document.body.classList.remove(themeClass);
    }
  };

  // Save preferences to localStorage on change
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
    toggleThemeClass("dark-theme", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("monochromeMode", isMonochromeMode.toString());
    toggleThemeClass("monochrome-theme", isMonochromeMode);
  }, [isMonochromeMode]);

  useEffect(() => {
    localStorage.setItem("showAltText", isShowAltText.toString());
    toggleThemeClass("show-alt-text", isShowAltText);
  }, [isShowAltText]);

  if (open) {
    return (
      <div className="text-accent-type-color">
        <button onClick={() => setOpen(!open)}>Accessibility Settings</button>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            Dark Mode
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isMonochromeMode}
              onChange={() => setIsMonochromeMode(!isMonochromeMode)}
            />
            Monochrome Mode
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isShowAltText}
              onChange={() => setIsShowAltText(!isShowAltText)}
            />
            Show Alt Text
          </label>
        </div>
      </div>
    );
  }
  // If the settings are not open, return a button to open them
  return <button onClick={() => setOpen(!open)}>Accessibility Settings</button>;
};
