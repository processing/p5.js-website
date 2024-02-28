import { z, defineCollection } from "astro:content";
import { image } from "../shared";

export const peopleCollection = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    url: z.string().url().optional(),
    blurb: z.string().optional(),
    image: image(),
  }),
});
