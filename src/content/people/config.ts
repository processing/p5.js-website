import { z, defineCollection } from "astro:content";
import { image } from "../shared";

/**
 * Content collection for the People section of the site.
 *
 */
export const peopleCollection = defineCollection({
  type: "data",
  schema: z.object({
    // Name of the person
    name: z.string(),
    // Url to their personal website
    url: z.string().url().optional(),
    blurb: z.string().optional(),
    image: image(),
  }),
});
