import { z, defineCollection, reference } from "astro:content";

export const pastEventsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    featuredImage: z
      .object({
        url: z.string().url(),
        altText: z.string(),
      })
      .optional(),
    relatedPastEvents: z.array(reference("past-events")).optional(),
  }),
});
