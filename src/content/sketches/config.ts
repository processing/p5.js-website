import { z, defineCollection, reference } from "astro:content";
import { author, image } from "../shared";

export const sketchesCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    thumbnailImage: image(),
    relatedSketches: z.array(reference("sketches")).optional(),
    author: author(),
    embed: z.object({
      url: z.string().url(),
      width: z.number().int(),
      height: z.number().int(),
    }),
    license: z.object({
      name: z.string(),
      url: z.string().url().optional(),
    }),
  }),
});
