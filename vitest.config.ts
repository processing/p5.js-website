/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
import { getViteConfig } from "astro/config";
import preact from "@preact/preset-vite";

export default getViteConfig(defineConfig({
  // needed to ensure react 3rd party libraries work with preact
  plugins: [preact()],
  resolve: {
    mainFields: ["module"],
  },
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    environment: "jsdom",
    exclude: [
      ...configDefaults.exclude,
      'test/a11y/**',
    ],
  },
}));
