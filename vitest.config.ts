/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import preact from "@preact/preset-vite";

export default getViteConfig({
  // needed to ensure react 3rd party libraries work with preact
  plugins: [preact() as any],
  resolve: {
    mainFields: ["module"],
  },
  // @ts-expect-error - vitest config not recognized by astro's getViteConfig
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
            "test/pages/*",
            "test/mocks/*"
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
