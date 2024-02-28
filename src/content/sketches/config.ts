import { z, defineCollection, reference } from "astro:content";
import { author, image } from "../shared";

export const sketchesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    thumbnailImage: image().optional(),
    relatedSketches: z.array(reference("sketches")).optional(),
    author: author(),
  }),
});
