import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { generateEntryId } from "../shared";

export const textDetailCollection = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: "./src/content/text-detail",
    generateId: generateEntryId,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().optional(),
    }),
});
