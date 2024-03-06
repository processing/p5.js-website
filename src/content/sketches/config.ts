import { z, defineCollection, reference } from "astro:content";
import { author, image } from "../shared";

/**
 * Content collection for the Sketches showcase section of the site.
 */
export const sketchesCollection = defineCollection({
  type: "data",
  schema: z.object({
    // Title of the sketch
    title: z.string(),
    // Short description of the sketch
    description: z.string().optional(),
    // Thumbail image to be shown in sketches overview page
    thumbnailImage: image(),
    // Other sketches related to this one (use their slug)
    relatedSketches: z.array(reference("sketches")).optional(),
    author: author(),
    // Information to embed the sketch from an external source
    embed: z.object({
      // Embed url to load in an iframe
      url: z.string().url(),
      // How wide to make the iframe
      width: z.number().int(),
      // How tall to make the iframe
      height: z.number().int(),
    }),
    license: z.object({
      // Name of the license
      name: z.string(),
      // Url to the text of the license itself
      url: z.string().url().optional(),
    }),
  }),
});
