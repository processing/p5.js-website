import { z, defineCollection } from "astro:content";

export const peopleCollection = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    url: z.string().url().optional(),
    description: z.string().optional(),
    image: z.object({
      url: z.string().url(),
      altText: z.string(),
    }),
  }),
});
