import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const homepageCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: "./src/content/homepage" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      heroText: z.string(),
      heroImages: z
        .array(
          z.object({
            image: image(),
            altText: z.string(),
            caption: z.string(),
            linkTarget: z.string(),
          }),
        )
        .nonempty(),
      referenceHeaderText: z.string(),
      examplesHeaderText: z.string(),
      communityHeaderText: z.string(),
      sketchIds: z.array(z.number()).length(6),
    }),
});
