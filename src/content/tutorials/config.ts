import { z, defineCollection } from "astro:content";
import { relatedContent } from "../shared";

export const categories = [
  "introduction",
  "drawing",
  "web-design",
  "accessibility",
  "criticalAI",
  "webgl",
  "advanced",
] as const;

/**
 * Content collection for the Sketches showcase section of the site.
 */
export const tutorialsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z
      .object({
        // Title of the tutorial
        title: z.string(),
        // People who wrote the tutorial
        authors: z.array(z.string()).optional(),
        // Optional note explaining more context about the authors
        authorsNote: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(categories),
        categoryIndex: z.number().optional(),
        // Image to use as a thumbnail for the tutorial
        featuredImage: image().optional(),
        featuredImageAlt: z.string().optional(),
        relatedContent: relatedContent().optional(),
      })
      .refine(
        (data) => {
          // Allow missing fields during development for quicker iteration
          if (import.meta.env.DEV) return true;
          return (
            data.authors !== undefined &&
            data.authors.length > 0 &&
            data.featuredImage !== undefined &&
            data.featuredImageAlt !== undefined &&
            data.featuredImageAlt.trim().length > 0 &&
            data.description !== undefined &&
            data.description.trim().length > 0
          );
        },
        {
          message:
            "Tutorials must include authors, featuredImage, featuredImageAlt, and description for production builds",
        },
      ),
});
