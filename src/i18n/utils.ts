import { supportedLocales, defaultLocale } from "./const";

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
