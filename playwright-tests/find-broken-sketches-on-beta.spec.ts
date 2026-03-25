// A playwright test to load various reference page URLs, scroll through for any 
// sketches, and monitor the console, failing if errors are reported in the console 
// (with some allowed).
//
//How to run: with UI: npx playwright test --project=chromium --ui
//How to run: no UI: npx playwright test --project=chromium
//
//TODO: rate-limit so we don't hassle the server or more likely get ip-banned by cloudflare CDN
//TODO: prefetching gets in the way, when links don't have a trailing slash!
//TODO: which test browsers will have a problem with webgl or webgpu?  "Error creating webgl context at ..."
// It's not enough to LOAD the containing page, the browser has to scroll so the sketch is in viewport to get loaded. (and we have to wait a little, especially in the case of shader compilation)
// TODO: can we cause the browser to load and start all the sketches, without needing them to be in view? 
// TODO: can we detect and scroll directly to each sketch in turn (waiting 1sec once there), rather than just scrolling through?
// TODO: test that a bad initial link is correctly reported as such (this could also legitimately be that a ref page has been renamed/removed)

import { test, type Page, type ConsoleMessage, expect } from "@playwright/test";

type LogSeverity = "exception" | "error" | "other";
type LogMsg = { url: string, text: string, severity: LogSeverity };
type LogPolicy = "skipSilently" | "skipButMention" | "log";
type Config = {
  shouldLogNonErrorLogsInline: boolean,
  on404ConsoleMsg: LogPolicy
}

const config: Config = {
  shouldLogNonErrorLogsInline: false,
  on404ConsoleMsg: "skipButMention"
}

/**
 * Attaches listeners to capture console errors, uncaught exceptions. (also non-error console msgs)
 * @param page 
 * @param errorLog An array to store captured error messages from the console
 * @param nonErrorLog An array to store captured non-error messages from the console
 * @todo do we need to explicitly drop this event handler when we nav away from the page?
 */
function setupErrorTracking(page: Page, nonErrorLog: LogMsg[], errorLog: LogMsg[]): void {
  //1. get the console error and others (but I think this _doesn't_ get exceptions - later)
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      //TODO: generalise to allow filtering of error types we don't care about
      //is this an error we probably don't care about?
      if (msg.text().includes("Failed to load resource: the server responded with a status of 404") && config.on404ConsoleMsg !== "log") {
        if (config.on404ConsoleMsg === "skipButMention") {
          console.log("skipping (maybe) expected 404 - prefetch with no trailing slash?")
        }
      } else {
        //log error normally
        errorLog.push({ severity: "error", text: msg.text(), url: page.url() });
      }
    } else {
      //non error console log
      nonErrorLog.push({ severity: "other", url: page.url(), text: msg.text() });
      if (config.shouldLogNonErrorLogsInline) {
        console.log(`[Console non-error] ${msg.text()} at ${page.url()}`);
      }
    }
  }
  );
  //2. also register for exceptions
  page.on("pageerror", (err: Error) => {
    errorLog.push({ severity: "exception", text: err.message, url: page.url() });
  });
}

test("look for sketch console errors in ref pages", async ({ page }) => {
  test.setTimeout(120_000);
  const pathsToCheck: string[] = [
    "/reference/p5/filterColor/",
    "/reference/p5/createCanvas/",
    "/reference/p5/fill/",
    "/reference/p5/circle/",
    "/reference/p5/colorMode/",
    "/reference/p5/rectMode/",
    "/reference/p5/imageMode/",
    "/reference/p5/sphere/",
    "/reference/p5/box/",
    "/reference/p5/buildFilterShader/",
    "/reference/p5/p5.Shader/",
    "/reference/p5.Shader/setUniform/",
    "/reference/p5/createFilterShader/",
    "/reference/p5/emissiveMaterial/",
    "/reference/p5/loadImage/",
    "/reference/p5/p5.Image/",
    "/reference/p5/imageMode/",
  ];

  const allErrors: LogMsg[] = [];
  const nonErrors: LogMsg[] = [];

  setupErrorTracking(page, nonErrors, allErrors);

  for (const path of pathsToCheck) {
    const baseURL = "http://localhost:4321"; //"https://beta.p5js.org"
    const url = `${baseURL}${path}`;
    console.log("going to url: ", url)
    await page.goto(url);
    await page.waitForTimeout(500);
    await scrollToBottom(page);
    // Give p5.js setup() and draw() time to execute, and shader compilation!
    console.log("done scrolling to bottom.  waiting for 1500")

    //TODO: this is a weak point.  no idea how long it could take for everything to load (e.g. compile shader).  can we detect iframe's p5 setup completion? maybe with a small instrumentation change to p5?
    await page.waitForTimeout(1500);

    if (allErrors.length > 0) {
      console.error(`Errors on ${url}:`, allErrors);
      allErrors.length = 0; // Clear for next page
    } else {
      console.log(`no errors on ${url}`);
    }
  }

  //TODO: perhaps provide non-error console outputs for the url(s) which had errors, for more context.
  //Also take screenshots of them?

  expect(allErrors).toEqual([]);
});

// We need to scroll slowly or otherwise make sure all sketches come into viewport to start loading.  THEN we need to wait a bit!
// Modified (debugged) from damaon's solution at https://github.com/microsoft/playwright/issues/4302#issuecomment-1882853669
// There are other solutions we might consider at the same url https://github.com/microsoft/playwright/issues/4302
async function scrollToBottom(page: Page) {
  const [scrollY, scrollHeight] = await page.evaluate(() => [
    window.scrollY,
    window.document.documentElement.scrollHeight,
  ])
  console.log(`window.scrollY at start: ${scrollY} window scrollHeight: ${scrollHeight}`)

  //TODO: are we going to pay attn to initial scrollY or not?
  for (let i = 0; scrollY + i < scrollHeight; i += 300) {
    await page.evaluate((i) => {
      console.log("scrolling to: ", i)
      //should be scrolling to i + scrollY if we're paying attn to the latter
      window.scrollTo({ top: i, left: 0, behavior: 'smooth' })
    }, i)
    await sleep(0.1)
  }
}

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}