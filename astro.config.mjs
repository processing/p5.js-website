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
import {
  localeHrefModifier,
  devLocaleHrefModifier,
} from "./src/integrations/localeHrefModifier";

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
    devLocaleHrefModifier(),
    localeHrefModifier(),
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
  vite: {
    server: {
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const originalEnd = res.end;
          res.end = function (body, encoding) {
            console.log(req.url);
            if (req.url.endsWith(".html")) {
              const modifiedBody = "TEST";
              console.log(modifiedBody);
              originalEnd.call(this, modifiedBody, encoding);
            } else {
              originalEnd.call(this, body, encoding);
            }
          };
          next();
        });
      },
    },
  },
  server: {
    watch: {
      ignored: ["src/scripts/*"],
    },
  },
});
