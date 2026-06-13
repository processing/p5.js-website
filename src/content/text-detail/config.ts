import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const textDetailCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: "./src/content/text-detail" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().optional(),
    }),
});
