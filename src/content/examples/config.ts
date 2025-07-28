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
          z.union([
            z.string(),
            z.object({
              description: z.string().default("Remixed by"),
              codeURL: z.string().optional(),
              codeLabel: z.string().optional(),
              attribution: z
                .array(
                  z.object({
                    name: z.string(),
                    URL: z.string().optional(),
                  })
                )
                .optional(),
              collectivelyAttributedSince: z.number().optional(),
            }),
          ])
        )
        .optional()
        .default([]),
    }),
});

