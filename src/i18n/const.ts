/**
 * The default language to render the language in.
 * ("en" stands for English.) Also used for fallback pages
 * when they don't exist in a locale.
 */
export const defaultLocale = "en";

/**
 * All other locales supported by the website.
 */
export const nonDefaultSupportedLocales = [
  "ar",
  "es",
  "hi",
  "ko",
  "sk",
  "pt-br",
  "zh-Hans",
];

/**
 * The list of locales (languages) the website
 * can be rendered in, including the default locale
 */
export const supportedLocales = [defaultLocale, ...nonDefaultSupportedLocales];
