import { readFileSync } from "fs";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

/**
 * An array of handler functions that catch the corresponding
 * requests and return mock data.
 */
const handlers = [
  // Intercepts requests to download p5.js and returns the version
  // of p5.js committed in this repo as a mock
  // This means our test suite can run without depending on a specific
  // version of p5 being available on the CDN at the moment the tests are run.
  http.get("https://cdnjs.cloudflare.com/ajax/libs/p5.js/*", () => {
    return HttpResponse.text(
      readFileSync("./assets/p5.min.js", { encoding: "utf-8" }),
    );
  }),
];

/**
 * Sets up a Service Worker to catch network requests
 * during a test. See CodeEmbed.test.tsx for an example of how to use.
 */
export const server = setupServer(...handlers);
