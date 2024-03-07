import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import compress from "astro-compress";

import tailwind from "@astrojs/tailwind";

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

const defaultLanguage = "en";

const fallbackLanguages = Object.fromEntries(
  supportedLocales.filter((l) => l !== defaultLanguage).map((l) => [l, "en"]),
);

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact({
      compat: true,
    }),
    mdx(),
    tailwind(),
    compress(),
  ],
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  i18n: {
    defaultLocale: defaultLanguage,
    fallback: fallbackLanguages,
    locales: supportedLocales,
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
