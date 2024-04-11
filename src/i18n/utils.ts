import { readFile } from "@scripts/utils";
import { supportedLocales, defaultLocale } from "./const";
import matter from "gray-matter";

/**
 * Checks if a collecion entry's slug begins with a locale prefix
 * (for example: 'es/')
 *
 * @param slug
 * @returns
 */
export const startsWithSupportedLocale = (slug: string) => {
  for (const loc of supportedLocales) {
    if (slug.startsWith(`${loc}/`)) return true;
  }
  return false;
};

/**
 * Splits the locale prefix out of a slug, and
 * returns the two as separate strings.
 * **Note: only handles absolute paths!**
 *
 * @param slug
 * @returns a tuple of the locale and the new slug
 */
export const splitLocaleFromPath = (path: string): [string, string] => {
  for (const loc of supportedLocales) {
    const localeRegex = new RegExp(`^/?${loc}(?:/|$)`, "i");
    const matched = path.match(localeRegex);
    if (matched !== null) return [loc, path.replace(localeRegex, "/")];
  }
  return [defaultLocale, path];
};

/**
 * Removes the default locale prefix from a slug (if its there)
 *
 * @param slug
 * @returns
 */
export const removeLocalePrefix = (prefixedPath: string): string =>
  splitLocaleFromPath(prefixedPath)[1];

/**
 * Turns a given url (of any locale) into a url within the given locale
 * **Note: only handles absolute paths!**
 *
 * @param url
 * @param newLocale
 * @returns
 */
export const reformUrlforNewLocale = (url: string, newLocale: string) => {
  const unPrefixedUrl = removeLocalePrefix(url);
  if (newLocale === defaultLocale) {
    return `${unPrefixedUrl}`;
  }
  return `/${newLocale}${unPrefixedUrl}`;
};

/**
 * Gets the current locale by parsing it out of the current url.
 * If no path is supplied, it will attempt to get it from window
 *
 * **Note: Can only be used client-side!**
 *
 * @returns
 */
export const getCurrentLocale = (path: undefined | string): string => {
  const [locale] = splitLocaleFromPath(path || window.location.pathname);
  return locale;
};

/**
 * Creates a regex that matches any of the supported locale codes
 * at the beginning of a path or slug. Also matches an optional `/`
 * before and an optional `/` after.
 */
export const localeMatchingRegex = () =>
  new RegExp(`^/?(?:${supportedLocales.join("|")})(?:/|$)`);

/**
 * Load a yaml file into an object
 * @param filePath Path to the yaml file
 * @returns GrayMatterFile<string> as Record<string, string>
 */
const loadYamlIntoObject = async (
  filePath: string,
): Promise<Record<string, string>> => {
  try {
    // Read the file with optional silent mode, this prevents
    // console.errors during build with missing yaml. Silent mode can be removed
    // after better translation coverage is achieved.
    let fileContents = await readFile(filePath, true);
    // Add fences so that graymatter can parse yaml into object.
    // This is an alternative to using
    // a dedicated yaml parser.
    fileContents = `---\n${fileContents}\n---`;
    return matter(fileContents).data as Record<string, string>;
  } catch (e) {
    throw new Error(`Failed to load yaml file: ${filePath}`);
  }
};

/**
 * Loads the translation files for a given locale and returns a function
 * that can be used to get the localized value of a key.
 * If the key is not found in the current locale, it will fallback to the
 * default locale.
 * If the key is not found in the default locale, it will return the key itself.
 * @param lang The locale/language code
 * @returns (key: string) => string - A function that takes a key and returns the localized value
 */
export const getUiTranslator = async (
  lang: (typeof supportedLocales)[number],
) => {
  const currentLocaleDict = await getTranslationObject(lang);
  const defaultLocaleDict = await getTranslationObject(defaultLocale);

  if (!currentLocaleDict || !defaultLocaleDict) {
    console.error("Failed to load translation files");
    return () => ""; // Return a dummy function to avoid further errors.
  }

  // Helper function to recursively find the translation.
  const findTranslation = (keys: string[], dict: Record<string, any>) => {
    return keys.reduce((acc, key) => {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, dict);
  };

  const t = (...args: string[]) => {
    // Try finding the translation in the current locale.
    let val = findTranslation(args, currentLocaleDict);

    // If not found in the current locale, try the default locale.
    if (val === undefined) {
      val = findTranslation(args, defaultLocaleDict);
    }

    // If still not found, log a warning and return the last key as a fallback.
    if (val === undefined) {
      // console.warn(`Translation key not found: ${args.join(".")}`);
      return args[args.length - 1];
    }

    return val;
  };

  return t;
};

export const getUiTranslationWithFallback = async (locale: string) => {
  const currentLocaleDict = await getTranslationObject(locale);
  const defaultLocaleDict = await getTranslationObject(defaultLocale);
  return { ...defaultLocaleDict, ...currentLocaleDict };
};

const getTranslationObject = async (
  locale: string,
): Promise<Record<string, any>> => {
  const translationObject = await loadYamlIntoObject(
    `src/content/ui/${locale}.yaml`,
  );
  return translationObject;
};
