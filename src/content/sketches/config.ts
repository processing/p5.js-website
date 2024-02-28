import { z, defineCollection, reference } from "astro:content";

export const sketchesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    thumbnailImage: z
      .object({
        url: z.string().url(),
        altText: z.string(),
      })
      .optional(),
    relatedSketches: z.array(reference("sketches")).optional(),
    author: z.object({
      name: z.string(),
      url: z.string().url().optional(),
    }),
  }),
});
