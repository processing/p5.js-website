import { z, defineCollection } from "astro:content";

/**
 * Content collection for the Contribute section of the site.
 */
export const contributorDocsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});
