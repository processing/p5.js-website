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

      // Start of collective attribution
      collectivelyAttributedSince: z.number().optional(),

      // Optional list of remixes to add to license
      remix: z
        .array(
          z.union([
            z.string(),
            z.object({
              attributionURL: z.string().optional(),
              attributionLabel: z.string().optional(),
              remixURL: z.string().optional(),
              remixLabel: z.string().optional(),
            }),
          ])
        )
        .optional()
        .default([]),
    }),
});

/**
 * The `remix` field lets you add remix attributions in two ways:
 * 1. Full objects with all details.
 * 2. Short string keys that refer to predefined entries in `remixLookup`.
 * When rendering (in ExampleLayout.astro), these keys are replaced 
 * with their full details from `remixLookup`.
 */

type RemixEntry = {
  attributionURL: string;
  attributionLabel: string;
  remixURL: string;
  remixLabel: string;
};


// TODO instead of this emit a warning if there's multiple URLs used for the same person