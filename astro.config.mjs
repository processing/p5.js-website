import { defineConfig, passthroughImageService } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import serviceWorker from "astrojs-service-worker";
import fast from "./src/scripts/fast-compress";
import mermaid from 'astro-mermaid';

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
  site: 'https://p5js.org',
  compressHTML: false,
  legacy: {
    collections: true
  },
  integrations: [
    mermaid({autoTheme: true}),
    preact({
      compat: true,
    }),
    mdx(),
    tailwind(),
    fast(),
    serviceWorker({
      workbox: {
        globPatterns: [
          "**/*.{css,js,jpg,json,png,svg,ico,woff,woff2}", // Cache all assets accept HTML
        ],
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith(".html"), // Caches HTML pages
            handler: "CacheFirst", // Tries the cache first, then falls back to network if offline
            options: {
              cacheName: "html-pages-cache",
              expiration: {
                maxEntries: 50, // Limits the number of HTML pages cached
                maxAgeSeconds: 24 * 60 * 60 * 7, // Cache for 1 week
              },
            },
          },
        ],
      },
    }),
  ],
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  trailingSlash: "always",
  build: {
    format: "directory",
    concurrency: 2
  },
  server: {
    watch: {
      ignored: ["src/scripts/**/*.ts"],
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@swc/html"]
    },
    rollupOptions: {
      external: ["/src/scripts/*"],
    },
  },
  image: {
    domains: ["openprocessing.org"],
    service: passthroughImageService()
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light-high-contrast',
    },
  },
});
