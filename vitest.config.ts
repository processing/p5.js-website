/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import preact from "@preact/preset-vite";

export default getViteConfig({
  // needed to ensure react 3rd party libraries work with preact
  plugins: [preact()],
  resolve: {
    mainFields: ["module"],
  },
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    environment: "jsdom",
  },
});
