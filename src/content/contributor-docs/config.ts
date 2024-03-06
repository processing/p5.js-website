import { z, defineCollection } from "astro:content";

/**
 * Content collection for the Contribute section of the site.
 */
export const contributorDocsCollection = defineCollection({
  type: "content",
  // No frontmatter config is used so far.
  schema: z.object({}),
});
