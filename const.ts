export const defaultLanguage = "en";

export const supportedLocales = [
  "en",
  "ar",
  "es",
  "hi",
  "ko",
  "pt-br",
  "sk",
  "zh",
];

export const nonDefaultSupportedLocales = supportedLocales.filter(
  (l) => l !== defaultLanguage,
);
