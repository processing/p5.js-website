import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact({
      compat: true,
    }),
    mdx(),
    compress(),
  ],
  trailingSlash: "always",
  build: {
    format: "directory",
  },
});
