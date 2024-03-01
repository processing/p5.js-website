import { z, defineCollection } from "astro:content";

export const contributorDocsCollection = defineCollection({
  type: "content",
  schema: z.object({}),
});
