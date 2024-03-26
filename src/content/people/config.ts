import { z, defineCollection } from "astro:content";

const displayTypes = ["featured", "gallery"] as const;

/**
 * Content collection for the People section of the site.
 *
 */
export const peopleCollection = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      // Name of the person
      name: z.string(),
      // Url to their personal website
      url: z.string().url().optional(),
      blurb: z.string().optional(),
      image: image(),
      imageAlt: z.string(),
      // How this person should be displayed on the people page
      displayed: z.enum(displayTypes),
    }),
});
