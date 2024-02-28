import { z, defineCollection } from "astro:content";
import { author, image } from "../shared";

export const librariesCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    featuredImage: image(),
    author: author(),
  }),
});
