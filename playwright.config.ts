import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./test/a11y",
  testMatch: "**/*.spec.ts",
  outputDir: "./test-results",
  fullyParallel: true,
  reporter: [
    ["list"],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  // One engine, two viewports. axe-core inspects the DOM and computed styles,
  // which agree across engines, so a browser matrix mostly re-runs the same
  // assertions; a responsive layout can ship genuinely different markup per
  // breakpoint, so that is the axis worth covering.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      A11Y_TEST: "1",
    },
  },
});
