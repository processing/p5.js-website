import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import compress from "astro-compress";
import tailwind from "@astrojs/tailwind";
import {
  supportedLocales,
  defaultLocale,
  nonDefaultSupportedLocales,
} from "./const";

// create a config object that maps all non-default
// languages to fallback to the default language
const fallbackLanguages = Object.fromEntries(
  nonDefaultSupportedLocales.map((l) => [l, defaultLocale]),
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
    defaultLocale,
    fallback: fallbackLanguages,
    locales: supportedLocales,
  },
  server: {
    watch: {
      ignored: ["src/scripts/*"],
    },
  },
});
