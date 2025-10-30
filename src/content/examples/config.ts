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
      featured: z.boolean().optional(),
      relatedReference: z.array(reference("reference")).optional(),
      featuredImage: image(),
      featuredImageAlt: z.string().optional().default(""),

      // Optional list of remixes to add to license
      remix: z
        .array(
          z.object({
            description: z.string().default("Remixed by"),
            attribution: z
              .array(
                z.object({
                  name: z.string(),
                  URL: z.string().optional(),
                })
              )
              .optional(),
            code: z
              .array(
                z.object({
                  label: z.string(),
                  URL: z.string(),
                })
              )
              .optional(),
            // Collective attribution message either does not specify a year,
            // or specifies 2024. To add a new possible value, update:
            // 1) content/examples/config.ts to include new permitted values;
            // 2) and content/ui/*.yaml strings for attribution to include the text
            collectivelyAttributedSince: z.literal(2024).optional(),
          })
        )
        .optional()
        .default([]),
    }),
});

