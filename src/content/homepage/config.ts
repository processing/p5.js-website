import { z, defineCollection } from "astro:content";

export const homepageCollection = defineCollection({
  type: "data",
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
          }),
        )
        .nonempty(),
      referenceHeaderText: z.string(),
      examplesHeaderText: z.string(),
      communityHeaderText: z.string(),
      sketchIds: z.array(z.number()).length(6),
    }),
});
