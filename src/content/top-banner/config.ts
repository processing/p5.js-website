import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { generateEntryId } from "../shared";

export const topBannerCollection = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: "./src/content/top-banner",
    generateId: generateEntryId,
  }),
  schema: () =>
    z.object({
      title: z.string(),
      link: z.string(),
      hidden: z.boolean().optional(),
      backgroundColor: z.string().optional(),
      color: z.string().optional(),
    }),
});
