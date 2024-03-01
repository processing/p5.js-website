import { z, defineCollection } from "astro:content";

export const examplesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    arialabel: z.string().optional(),
  }),
});
