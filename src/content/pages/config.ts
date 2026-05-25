import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: "./src/content/pages" }),
  schema: () => z.object({
    title: z.string(),
  }),
});
