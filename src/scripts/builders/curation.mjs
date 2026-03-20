import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { constants as FS } from "node:fs";
import { chromium } from "playwright";

const openProcessingEndpoint = "https://openprocessing.org/api/";
const curationIds = ["87649", "89576"];

const outDir = path.join("src", "cached-data");
const sketchesDir = path.join(outDir, "openprocessing-sketches"); // per-sketch JSON
const userDataDir = path.join(".cache", "playwright-openprocessing");

await mkdir(outDir, { recursive: true });
await mkdir(sketchesDir, { recursive: true });
await mkdir(userDataDir, { recursive: true });

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  slowMo: 50,
});

let page = context.pages()[0] ?? (await context.newPage());

async function exists(p) {
  try {
    await access(p, FS.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function gotoJson(url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(750);
  const text = await page.evaluate(() => document.body?.innerText ?? "");
  return JSON.parse(text);
}

function parseSketchSizeFromCodePayload(payload) {
  for (const tab of payload) {
    if (!tab?.code) continue;

    const match =
      /createCanvas\(\s*(\w+),\s*(\w+)\s*(?:,\s*(?:P2D|WEBGL)\s*)?\)/m.exec(tab.code);
    if (!match) continue;
    if (match[1] === "windowWidth" && match[2] === "windowHeight") {
      return { width: undefined, height: undefined };
    }

    const width = parseFloat(match[1]);
    const height = parseFloat(match[2]);
    if (width && height) return { width, height };
  }

  return { width: undefined, height: undefined };
}

for (const curationId of curationIds) {
  const curationOutPath = path.join(
    outDir,
    `openprocessing-curation-${curationId}-sketches.json`,
  );

  let curationPayload;

  if (await exists(curationOutPath)) {
    console.log(`Using cached: ${curationOutPath}`);
    const text = await readFile(curationOutPath, "utf8");
    curationPayload = JSON.parse(text);
  } else {
    const curationUrl = `${openProcessingEndpoint}curation/${curationId}/sketches`;
    console.log("Will open:", curationUrl);

    curationPayload = await gotoJson(curationUrl);

    await writeFile(
      curationOutPath,
      JSON.stringify(curationPayload, null, 2),
      "utf8",
    );
    console.log(`Wrote ${curationOutPath}`);
  }

  // Per-sketch details (GET /api/sketch/:id) + size (GET /api/sketch/:id/code)
  for (const item of curationPayload) {
    const id = item?.visualID;
    if (!id) continue;

    const sketchOutPath = path.join(sketchesDir, `${id}.json`);

    if (await exists(sketchOutPath)) {
      console.log(`  skip (cached): ${id}`);
      continue;
    }

    const sketchUrl = `${openProcessingEndpoint}sketch/${id}`;
    console.log("  sketch:", sketchUrl);

    try {
      const sketchPayload = await gotoJson(sketchUrl);
      


      // default (or non-p5js) => undefined size
      let width;
      let height;

      if (sketchPayload?.mode === "p5js") {
        try {
          const codeUrl = `${openProcessingEndpoint}sketch/${id}/code`;
          console.log("  code:", codeUrl);
          const codePayload = await gotoJson(codeUrl);
          const size = parseSketchSizeFromCodePayload(codePayload);
          width = size.width;
          height = size.height;
          console.log("SIZE", width, height)
        } catch (e) {
          // don't fail the whole sketch if size extraction fails
          console.error(`  failed size ${id}:`, e?.message ?? e);
        }
      }

      const { fileBase, ...rest } = sketchPayload || {};
      const merged = { ...rest, width, height };

      const sketchOutPath = path.join(sketchesDir, `${id}.json`);
      await writeFile(sketchOutPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
    } catch (e) {
      // keep going if one sketch fails
      console.error(`  failed sketch ${id}:`, e?.message ?? e);
    }
  }
}

console.log("Done. You can close the browser now.");