import type { CollectionEntry } from "astro:content";

export type ReferenceDirectoryEntry = CollectionEntry<"reference">;

export type ReferenceSubcategory = {
  name?: string;
  entry?: ReferenceDirectoryEntry;
  entries: ReferenceDirectoryEntry[];
};

export type ReferenceCategory = {
  name: string;
  subcats: ReferenceSubcategory[];
};
