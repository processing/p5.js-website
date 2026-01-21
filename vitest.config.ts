import { getViteConfig } from "astro/config";
import { configDefaults } from 'vitest/config';
import preact from "@preact/preset-vite";

export default getViteConfig({
  // needed to ensure react 3rd party libraries work with preact
  plugins: [preact()],
  resolve: {
    mainFields: ["module"],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "DOM",
          environment: "jsdom",
          include: [
            "test/**/*"
          ],
          exclude: [
            ...configDefaults.exclude,
            "test/pages/*",
            "test/mocks/*",
            'test/a11y/**'
          ]
        }
      },
      {
        extends: true,
        test: {
          name: "node",
          include: [
            "test/pages/*"
          ]
        }
      }
    ]
  },
});
