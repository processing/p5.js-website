import { z, defineCollection } from "astro:content";

export const textDetailCollection = defineCollection({
  type: "content",
  schema: () =>
    z.object({
      title: z.string(),
      link: z.string(),
      hidden: z.boolean().optional(),
    }),
});
