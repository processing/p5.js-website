import { z, defineCollection } from "astro:content";

export const pagesCollection = defineCollection({
  type: "content",
  schema: () => z.object({}),
});
