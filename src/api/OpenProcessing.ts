// HELPER FUNCTIONS TO USE THE OPENPROCESSING API
// SEE https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#intro

import type { AnyEntryMap, CollectionEntry } from "astro:content";
import memoize from "lodash/memoize";

const openProcessingEndpoint = "https://openprocessing.org/api/";
/**
 * ID of the OpenProcessing Curation we pull sketches from.
 * Currently a placeholder (https://openprocessing.org/curation/78544/)
 */
const curationId = "87649";

/**
 * API Response from a call to the Curation Sketches endpoint
 *
 * see https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
 */
export type OpenProcessingCurationResponse = Array<{
  /** Sketch ID used for constructing URLs */
  visualID: string;
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
  const response = await fetch(
    `${openProcessingEndpoint}curation/${curationId}/sketches?${limitParam}`,
  );
  if(!response.ok){ //log error instead of throwing error to not cache result in memoize
    console.error('getCurationSketches', response.status, response.statusText)
  }
  const payload = await response.json();
  return payload as OpenProcessingCurationResponse;
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
  async (id: string): Promise<OpenProcessingSketchResponse> => {
    // check for memoized sketch in curation sketches
    const curationSketches = await getCurationSketches();
    const memoizedSketch = curationSketches.find((el) => el.visualID === id);
    if (memoizedSketch) {
      return {
        ...memoizedSketch,
        license: "",
      } as OpenProcessingSketchResponse;
    }

    // check for sketch data in Open Processing API
  const response = await fetch(`${openProcessingEndpoint}sketch/${id}`);
    if (!response.ok) {
      //log error instead of throwing error to not cache result in memoize
      console.error("getSketch", id, response.status, response.statusText);
  }
  const payload = await response.json();
  return payload as OpenProcessingSketchResponse;
});

/**
 * Note: this currently calls `/api/sketch/:id/code`
 * But only uses the width and height properties from this call
 * Width and height should instead be added to properties for `/api/sketch/:id` or `api/curation/:curationId/sketches` instead
 */
export const getSketchSize = memoize(async (id: string) => {
  const sketch = await getSketch(id)
  if (sketch.mode !== 'p5js') {
    return { width: undefined, height: undefined };
  }

  const response = await fetch(`${openProcessingEndpoint}sketch/${id}/code`);
  if(!response.ok){ //log error instead of throwing error to not cache result in memoize
    console.error('getSketchSize', id, response.status, response.statusText)
  }
  const payload = await response.json();

  for (const tab of payload) {
    if (!tab.code) continue;
    const match = /createCanvas\(\s*(\w+),\s*(\w+)\s*(?:,\s*(?:P2D|WEBGL)\s*)?\)/m.exec(tab.code);
    if (match) {
      if (match[1] === 'windowWidth' && match[2] === 'windowHeight') {
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

export const makeSketchLinkUrl = (id: string) =>
  `https://openprocessing.org/sketch/${id}`;

export const makeSketchEmbedUrl = (id: string) =>
  `https://openprocessing.org/sketch/${id}/embed/?plusEmbedFullscreen=true&plusEmbedInstructions=false`;

export const makeThumbnailUrl = (id: string) =>
  `https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail${id}@2x.jpg`;

export const getSketchThumbnailSource = async (id: string) => {
  const manualThumbs = import.meta.glob<ImageMetadata>('./images/*', { import: 'default' })
  const key = `./images/${id}.png`;
  if (manualThumbs[key]) {
    const img = await manualThumbs[key]()
    return img;
  }

  return makeThumbnailUrl(id)
}

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

  while (result.length < num) {
    const randomIndex = Math.floor(Math.random() * curationSketches.length);
    if (!usedIndices.has(randomIndex)) {
      result.push(curationSketches[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }

  return result;
});
