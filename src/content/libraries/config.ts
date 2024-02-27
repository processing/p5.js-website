import { z, defineCollection } from "astro:content";

export const librariesCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    url: z.string().url(),
    featuredImage: z.object({
      url: z.string().url(),
      altText: z.string(),
    }),
    author: z.object({
      name: z.string(),
      url: z.string().url().optional(),
    }),
  }),
});
