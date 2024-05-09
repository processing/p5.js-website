import { defineConfig, passthroughImageService } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import compress from "astro-compress";
import tailwind from "@astrojs/tailwind";
import serviceWorker from "astrojs-service-worker";

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
  image: {
    domains: ["openprocessing.org"],
    service: passthroughImageService()
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
