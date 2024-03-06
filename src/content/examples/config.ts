import { z, defineCollection } from "astro:content";
import { relatedContent } from "../shared";

/**
 * Content collection for the Examples section of the site.
 * Each file represents a single example.
 */
export const examplesCollection = defineCollection({
  type: "content",
  schema: z.object({
    // Title of the example
    title: z.string(),
    // Aria label used for the live example code
    arialabel: z.string().optional(),
    relatedContent: relatedContent(),
  }),
});
