import { z, defineCollection, reference } from "astro:content";

/**
 * Content collection for the Examples section of the site.
 * Each file represents a single example.
 */
export const examplesCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      // Title of the example
      title: z.string(),
      oneLineDescription: z.string(),
      // Aria label used for the live example code
      arialabel: z.string().optional(),
      relatedReference: z.array(reference("reference")).optional(),
      featuredImage: image(),
      featuredImageAlt: z.string().optional().default(""),
    }),
});
