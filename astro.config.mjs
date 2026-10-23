import { defineConfig, passthroughImageService } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
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

const isA11yTest = Boolean(process.env.A11Y_TEST);

// https://astro.build/config
export default defineConfig({
  site: 'https://p5js.org',
  compressHTML: false,
  devToolbar: {
    enabled: !isA11yTest,
  },
  integrations: [
    mermaid({autoTheme: true}),
    preact({
      compat: true,
    }),
    mdx(),
    fast(),
    serviceWorker({
      workbox: {
        // Only precache the shared styles, scripts and fonts. Images and search
        // indices are left out so a first visit doesn't download the whole site.
        globPatterns: ["**/*.{css,js,woff,woff2}"],
        clientsClaim: true,
        navigationPreload: true, // Don't wait for the service worker to start before fetching a page
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate", // Caches visited pages
            handler: "NetworkFirst", // Always tries the network first, uses the cached copy when offline
            options: {
              cacheName: "html-pages-cache",
              cacheableResponse: {
                statuses: [200],
              },
              expiration: {
                maxEntries: 50, // Limits the number of HTML pages cached
                maxAgeSeconds: 24 * 60 * 60 * 7, // Cache for 1 week
              },
            },
          },
          {
            // Only the search index for the language being searched gets cached
            urlPattern: ({ url }) => url.pathname.startsWith("/search-indices/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "search-indices-cache",
              cacheableResponse: {
                statuses: [200],
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
    plugins: [tailwindcss()]
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
