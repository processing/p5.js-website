import { readFileSync } from "fs";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

// Define handlers that catch the corresponding requests and returns the mock data.
const handlers = [
  http.get("https://cdnjs.cloudflare.com/ajax/libs/p5.js/*", () => {
    return HttpResponse.text(
      readFileSync("./assets/p5.min.js", { encoding: "utf-8" }),
    );
  }),
];

// This configures a Service Worker with the given request handlers.
export const server = setupServer(...handlers);
