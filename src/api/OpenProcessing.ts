// HELPER FUNCTIONS TO USE THE OPENPROCESSING API
// SEE https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#intro

import type { AnyEntryMap, CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import memoize from "lodash/memoize";

const openProcessingEndpoint = "https://openprocessing.org/api/";
/**
 * ID of the OpenProcessing Curation we pull sketches from.
 * Currently a placeholder (https://openprocessing.org/curation/78544/)
 */
const curationId = "87649";
const newCurationId = "89576";
const toId = (v: string | number) => String(v).trim();

/**
 * API Response from a call to the Curation Sketches endpoint
 *
 * see https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
 */
export type OpenProcessingCurationResponse = Array<{
  /** Sketch ID used for constructing URLs */
  visualID: number; // <-- corrected: was string before
  /** Title of sketch */
  title: string;
  /** Description of sketch */
  description: string;
  instructions: string;
  mode: string;
  createdOn: string;
  userID: string;
  submittedOn: string;
  /** Author's name */
  fullname: string;
}>;

/**
 * Get basic info for the sketches contained in a Curation
 * from the OpenProcessing API
 *
 * @param limit max number of sketches to return
 * @returns sketches
 */
export const getCurationSketches = memoize(async (
  limit?: number,
): Promise<OpenProcessingCurationResponse> => {
  const limitParam = limit ? `limit=${limit}` : "";
  const response1 = await fetch(
    `${openProcessingEndpoint}curation/${curationId}/sketches?${limitParam}`,
  );
  if (!response1.ok) {
    console.error("getCurationSketches", response1.status, response1.statusText);
  }
  const payload1: OpenProcessingCurationResponse = await response1.json();

  const response2 = await fetch(
    `${openProcessingEndpoint}curation/${newCurationId}/sketches?${limitParam}`,
  );
  if (!response2.ok) {
    console.error("getCurationSketches", response2.status, response2.statusText);
  }
  const payload2: OpenProcessingCurationResponse = await response2.json();

  // Selected Sketches from the 2025 curation
  const priorityIds = [
    "2690038",
    "2484739",
    "2688829",
    "2689119",
    "2690571",
    "2690405",
    "2684408",
    "2693274",
    "2693345",
    "2691712",
  ];

  const prioritySketches = payload2
    .filter((sketch) => priorityIds.includes(toId(sketch.visualID)))
    .sort(
      (a, b) =>
        priorityIds.indexOf(toId(a.visualID)) -
        priorityIds.indexOf(toId(b.visualID)),
    );

  const finalSketches = [
    ...prioritySketches.map((sketch) => ({ ...sketch, curation: "2025" as const })),
    ...payload1.map((sketch) => ({ ...sketch, curation: "2024" as const })),
  ];

  // Return as the base type; the extra `curation` tag is benign for consumers that ignore it
  return [...finalSketches] as unknown as OpenProcessingCurationResponse;
});

/**
 * API Response from a call to the Sketch endpoint
 *
 * see https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
 */
export type OpenProcessingSketchResponse = {
  /** Sketch ID used for constructing URLs */
  visualID: string;
  /** Title of sketch */
  title: string;
  /** Description of sketch */
  description: string;
  instructions: string;
  license: string;
  userID: string;
  submittedOn: string;
  createdOn: string;
  mode: string;
};

/**
 * Get info about a specific sketch from the OpenProcessing API
 * First checks if the sketch is in the memoized curated sketches and returns the data if so,
 * Otherwise calls OpenProcessing API for this specific sketch
 *
 * https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
 * @param id
 * @returns
 */
export const getSketch = memoize(
  async (id: string | number): Promise<OpenProcessingSketchResponse> => {
    const idStr = toId(id);

    // check for memoized sketch in curation sketches
    const curationSketches = await getCurationSketches();
    const memoizedSketch = curationSketches.find(
      (el) => toId(el.visualID) === idStr,
    );

    if (memoizedSketch) {
      // Normalize visualID to string to match OpenProcessingSketchResponse
      return {
        ...memoizedSketch,
        visualID: idStr,
        license: "",
      } as unknown as OpenProcessingSketchResponse;
    }

    // check for sketch data in Open Processing API
    const response = await fetch(`${openProcessingEndpoint}sketch/${idStr}`);
    if (!response.ok) {
      // log error instead of throwing error to not cache result in memoize
      console.error("getSketch", idStr, response.status, response.statusText);
    }
    const payload = await response.json();
    // Ensure visualID is a string for consistency
    if (payload && typeof payload.visualID !== "string") {
      payload.visualID = idStr;
    }
    return payload as OpenProcessingSketchResponse;
  },
);

/**
 * Note: this currently calls `/api/sketch/:id/code`
 * But only uses the width and height properties from this call
 * Width and height should instead be added to properties for `/api/sketch/:id` or `api/curation/:curationId/sketches` instead
 */
export const getSketchSize = memoize(async (id: string | number) => {
  const idStr = toId(id);
  const sketch = await getSketch(idStr);
  if (sketch.mode !== "p5js") {
    return { width: undefined, height: undefined };
  }

  const response = await fetch(`${openProcessingEndpoint}sketch/${idStr}/code`);
  if (!response.ok) {
    console.error("getSketchSize", idStr, response.status, response.statusText);
  }
  const payload = await response.json();

  for (const tab of payload) {
    if (!tab.code) continue;
    const match =
      /createCanvas\(\s*(\w+),\s*(\w+)\s*(?:,\s*(?:P2D|WEBGL)\s*)?\)/m.exec(
        tab.code,
      );
    if (match) {
      if (match[1] === "windowWidth" && match[2] === "windowHeight") {
        return { width: undefined, height: undefined };
      }

      const width = parseFloat(match[1]);
      const height = parseFloat(match[2]);
      if (width && height) {
        return { width, height };
      }
    }
  }
  return { width: undefined, height: undefined };
});

export const makeSketchLinkUrl = (id: string | number) =>
  `https://openprocessing.org/sketch/${toId(id)}`;

export const makeSketchEmbedUrl = (id: string | number) =>
  `https://openprocessing.org/sketch/${toId(id)}/embed/?plusEmbedFullscreen=true&plusEmbedInstructions=false`;

export const makeThumbnailUrl = (id: string | number) =>
  `https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail${toId(
    id,
  )}@2x.jpg`;

export const getSketchThumbnailSource = async (id: string | number) => {
  const idStr = toId(id);
  const manualThumbs = import.meta.glob<ImageMetadata>("./images/*", {
    import: "default",
  });
  const key = `./images/${idStr}.png`;
  if (manualThumbs[key]) {
    const img = await manualThumbs[key]();
    return img;
  }

  return makeThumbnailUrl(idStr);
};

/**
 * The size of the thumbnails generated by OpenProcessing in px
 */
export const thumbnailDimensions = 400;

export function isCurationResponse<C extends keyof AnyEntryMap>(
  item: OpenProcessingCurationResponse[number] | CollectionEntry<C>,
): item is OpenProcessingCurationResponse[number] {
  return "visualID" in (item as any);
}

export const getRandomCurationSketches = memoize(async (num = 4) => {
  const curationSketches = await getCurationSketches();
  const result: OpenProcessingCurationResponse = [];
  const usedIndices: Set<number> = new Set();

  while (result.length < num && curationSketches.length > 0) {
    const randomIndex = Math.floor(Math.random() * curationSketches.length);
    if (!usedIndices.has(randomIndex)) {
      result.push(curationSketches[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }

  return result;
});
