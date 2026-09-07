import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { generateEntryId } from "../shared";

export const bannerCollection = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: "./src/content/banner",
    generateId: generateEntryId,
  }),
  schema: () =>
    z.object({
      title: z.string(),
      // Accessible name for the banner landmark, announced by screen readers.
      label: z.string(),
      link: z.string(),
      hidden: z.boolean().optional(),
    }),
});
