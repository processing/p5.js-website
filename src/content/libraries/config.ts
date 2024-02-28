import { z, defineCollection } from "astro:content";
import { author, image } from "../shared";

const categories = ["core", "ar-vr"] as const;

export const librariesCollection = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.enum(categories),
    url: z.string().url(),
    featuredImage: image(),
    author: author(),
  }),
});
