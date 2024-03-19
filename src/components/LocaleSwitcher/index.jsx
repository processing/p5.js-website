import { supportedLocales } from "../../../const";
import { reformUrlforNewLocale, getCurrentLocale } from "@pages/_utils";

export const LocaleSwitcher = () => (
  <div>
    <label for="locale-select">Choose your locale:</label>
    <select
      id="locale-select"
      onChange={(e) => {
        window.location.assign(
          reformUrlforNewLocale(window.location.pathname, e.target.value),
        );
      }}
    >
      {supportedLocales.map((locale) => (
        <option
          value={locale}
          selected={getCurrentLocale() === locale}
          key={locale}
        >
          {
            // displays the language associated with a
            // locale code in its own language
            new Intl.DisplayNames([locale], { type: "language" }).of(locale)
          }
        </option>
      ))}
    </select>
  </div>
);
