import type { z } from "astro/zod";
import { referenceSchema } from "./reference/config";
import type { exampleSchema } from "./examples/config";
import type { CollectionEntry } from "astro:content";

type AstroBaseContentType<T = unknown> = {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: T;
};

// Define the type for content items that include data according to referenceSchema
export type ReferenceDocContentItem = AstroBaseContentType<
  z.infer<typeof referenceSchema>
>;

// Define the type for content items that include data according to exampleSchema
export type ExampleDocContentItem = AstroBaseContentType<
  z.infer<typeof exampleSchema>
>;

/**
 * Content Entry Types that can be displayed in a generic Archive page
 */
export type ArchiveCollectionEntry =
  | CollectionEntry<"contributor-docs">
  | CollectionEntry<"past-events">
  | CollectionEntry<"sketches">;
