import { z, defineCollection } from "astro:content";
import { image } from "../shared";

export const textDetailCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    featuredImage: image().optional(),
  }),
});
