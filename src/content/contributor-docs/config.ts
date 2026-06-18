import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Content collection for the Contribute section of the site.
 */
export const contributorDocsCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: "./src/content/contributor-docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});
