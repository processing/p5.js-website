import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { generateEntryId } from "../shared";

export const pagesCollection = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: "./src/content/pages",
    generateId: generateEntryId,
  }),
  schema: () => z.object({
    title: z.string(),
  }),
});
