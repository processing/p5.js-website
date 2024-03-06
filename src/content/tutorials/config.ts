import { z, defineCollection } from "astro:content";
import { image, relatedContent } from "../shared";

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
    relatedContent: relatedContent(),
  }),
});
