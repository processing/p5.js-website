import { z, defineCollection } from "astro:content";
import { image } from "../shared";

const categories = ["getting-started", "webgl"] as const;

/**
 * Content collection for the Sketches showcase section of the site.
 */
export const tutorialsCollection = defineCollection({
  type: "content",
  schema: z.object({
    // Title of the tutorial
    title: z.string(),
    // People who wrote the tutorial
    authors: z.array(z.string()).optional(),
    description: z.string().optional(),
    category: z.enum(categories),
    // Image to use as a thumbnail for the tutorial
    featuredImage: image().optional(),
    // Examples related to this tutorial (use the slug of the example)
    relatedExamples: z.array(z.string()).optional(),
    // related_examples: z.array(reference("examples")).optional(),
    // Reference pages related to this tutorial (use the slug of the reference page)
    relatedReferences: z.array(z.string()).optional(),
    // related_references: z.array(reference("reference")).optional(),
  }),
});
