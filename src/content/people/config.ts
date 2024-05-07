import { z, defineCollection } from "astro:content";

const peopleCategories = ["lead", "mentor", "alumni", "contributor"] as const;

/**
 * Content collection for the People section of the site.
 *
 */
export const peopleCollection = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z
      .object({
        // Name of the person
        name: z.string(),
        // Url to their personal website
        url: z.string().optional(),
        image: image().optional(),
        imageAlt: z.string().optional(),
        blurb: z.string().optional(),
        // How this person should be displayed on the people page
        category: z.enum(peopleCategories),
        // The role that this person had with the project
        role: z.string().optional(),
        // The order in which this person should be displayed
        order: z.number().optional(),
      })
      .refine(
        (data) => {
          // If displayed is not contributor, image and imageAlt must be provided
          if (data.category !== "contributor") {
            return !!data.image && !!data.imageAlt;
          }
          return true; // Contributor doesn't need image and imageAlt
        },
        {
          message:
            "Image and imageAlt are required when displayed is not 'contributor'",
        },
      ),
});
