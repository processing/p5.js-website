import { p5Version, p5SoundVersion } from "./p5-version";

export const contentTypes = [
  "contributor-docs",
  "examples",
  "libraries",
  "events",
  "people",
  "reference",
  "tutorials",
] as const;

export const sketchesPerPage = 12 as const;
export const eventsPerPage = 12 as const;

export const cdnLibraryUrl =
  import.meta.env?.PUBLIC_P5_LIBRARY_PATH ||
  (`https://cdn.jsdelivr.net/npm/p5@${p5Version}/lib/p5.min.js` as const);
export const fullDownloadUrl =
  `https://github.com/processing/p5.js/releases/download/v${p5Version}/p5.zip` as const;
export const libraryDownloadUrl =
  `https://github.com/processing/p5.js/releases/download/v${p5Version}/p5.js` as const;
export const minifiedLibraryDownloadUrl =
  `https://github.com/processing/p5.js/releases/download/v${p5Version}/p5.min.js` as const;
export const cdnSoundUrl =
  `https://cdn.jsdelivr.net/npm/p5.sound@${p5SoundVersion}` as const;
