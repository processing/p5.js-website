import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import compress from "astro-compress";
import tailwind from "@astrojs/tailwind";

// Allow skipping compression step for faster test build times
// DO NOT SKIP COMPRESSION FOR DEPLOYMENT!
const shouldSkipCompress = Boolean(
  process.env.SKIP_BUILD_COMPRESS && process.env.SKIP_BUILD_COMPRESS.length > 0,
);

if (shouldSkipCompress) {
  console.log("WILL SKIP COMPRESS BUILD STEP");
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact({
      compat: true,
    }),
    mdx(),
    tailwind(),
    shouldSkipCompress ? null : compress(),
  ],
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  server: {
    watch: {
      ignored: ["src/scripts/**/*.ts"],
    },
  },
  vite: {
    rollupOptions: {
      external: ["/src/scripts/*"],
    },
  },
});
