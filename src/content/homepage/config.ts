import { z, defineCollection } from "astro:content";

export const homepageCollection = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      heroText: z.string(),
      heroImageDesktop: image(),
      heroImageMobile: image(),
      heroImageAltText: z.string(),
      heroImageCaption: z.string(),
      referenceHeaderText: z.string(),
      examplesHeaderText: z.string(),
      communityHeaderText: z.string(),
      sketchIds: z.array(z.number()).length(6),
    }),
});
