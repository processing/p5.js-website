import type { AnyEntryMap, CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import memoize from "lodash/memoize";

const openProcessingEndpoint = "https://openprocessing.org/api/";
const curationId = "87649";
const newCurationId = "89576";

export type OpenProcessingCurationResponse = Array<{
  visualID: string;
  title: string;
  description: string;
  instructions: string;
  mode: string;
  createdOn: string;
  userID: string;
  submittedOn: string;
  fullname: string;
  curation?: string;
}>;

function normalizeCurationItems(arr: any[]): OpenProcessingCurationResponse {
  if (!Array.isArray(arr)) return [] as any;
  return arr.map((it) => ({
    ...it,
    visualID: String(it.visualID),
    userID: it.userID != null ? String(it.userID) : "",
  }));
}

async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    return await res.json();
  } catch {
    return fallback;
  }
}

export const getCurationSketches = memoize(async (limit?: number): Promise<OpenProcessingCurationResponse> => {
  const limitParam = limit ? `limit=${limit}` : "";
  const response1 = await fetch(`${openProcessingEndpoint}curation/${curationId}/sketches?${limitParam}`);
  if (!response1.ok) {
    console.error("getCurationSketches", response1.status, response1.statusText);
  }
  const payload1Raw = await safeJson<any[]>(response1, []);
  const payload1 = normalizeCurationItems(payload1Raw);

  const response2 = await fetch(`${openProcessingEndpoint}curation/${newCurationId}/sketches?${limitParam}`);
  if (!response2.ok) {
    console.error("getCurationSketches", response2.status, response2.statusText);
  }
  const payload2Raw = await safeJson<any[]>(response2, []);
  const payload2 = normalizeCurationItems(payload2Raw);

  const priorityIds = ["2690038", "2484739", "2688829", "2689119", "2690571", "2690405", "2684408", "2693274", "2693345", "2691712"];

  const prioritySketches = payload2
    .filter((sketch) => priorityIds.includes(String(sketch.visualID)))
    .sort((a, b) => priorityIds.indexOf(String(a.visualID)) - priorityIds.indexOf(String(b.visualID)));

  const finalSketches = [
    ...prioritySketches.map((sketch) => ({ ...sketch, curation: "2025" })),
    ...payload1.map((sketch) => ({ ...sketch, curation: "2024" })),
  ];

  return [...finalSketches] as OpenProcessingCurationResponse;
});

export type OpenProcessingSketchResponse = {
  visualID: string;
  title: string;
  description: string;
  instructions: string;
  license: string;
  userID: string;
  submittedOn: string;
  createdOn: string;
  mode: string;
};

export const getSketch = memoize(async (id: string): Promise<OpenProcessingSketchResponse> => {
  const curationSketches = await getCurationSketches();
  const memoizedSketch = curationSketches.find((el) => String(el.visualID) === String(id));
  if (memoizedSketch) {
    return {
      ...memoizedSketch,
      license: "",
    } as OpenProcessingSketchResponse;
  }

  const response = await fetch(`${openProcessingEndpoint}sketch/${id}`);
  if (!response.ok) {
    console.error("getSketch", id, response.status, response.statusText);
  }
  const payload = await safeJson<OpenProcessingSketchResponse>(response, {
    visualID: String(id),
    title: "",
    description: "",
    instructions: "",
    license: "",
    userID: "",
    submittedOn: "",
    createdOn: "",
    mode: "",
  } as OpenProcessingSketchResponse);
  return payload as OpenProcessingSketchResponse;
});

export const getSketchSize = memoize(async (id: string) => {
  const sketch = await getSketch(id);
  if (sketch.mode !== "p5js") {
    return { width: undefined, height: undefined };
  }

  const response = await fetch(`${openProcessingEndpoint}sketch/${id}/code`);
  if (!response.ok) {
    console.error("getSketchSize", id, response.status, response.statusText);
  }
  const payload = await safeJson<any[]>(response, []);

  for (const tab of payload) {
    if (!tab.code) continue;
    const match = /createCanvas\(\s*(\w+),\s*(\w+)\s*(?:,\s*(?:P2D|WEBGL)\s*)?\)/m.exec(tab.code);
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

export const makeSketchLinkUrl = (id: string) => `https://openprocessing.org/sketch/${id}`;

export const makeSketchEmbedUrl = (id: string) =>
  `https://openprocessing.org/sketch/${id}/embed/?plusEmbedFullscreen=true&plusEmbedInstructions=false`;

export const makeThumbnailUrl = (id: string) =>
  `https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail${id}@2x.jpg`;

export const getSketchThumbnailSource = async (id: string) => {
  const manualThumbs = import.meta.glob<ImageMetadata>("./images/*", { import: "default" });
  const key = `./images/${id}.png`;
  if (manualThumbs[key]) {
    const img = await manualThumbs[key]();
    return img;
  }
  return makeThumbnailUrl(id);
};

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
  if (!curationSketches.length) return result;
  let guard = 0;
  const cap = Math.min(num, curationSketches.length) * 10;
  while (result.length < Math.min(num, curationSketches.length) && guard++ < cap) {
    const randomIndex = Math.floor(Math.random() * curationSketches.length);
    if (!usedIndices.has(randomIndex)) {
      result.push(curationSketches[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }
  return result;
});
