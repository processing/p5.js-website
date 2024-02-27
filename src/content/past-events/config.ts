import { z, defineCollection, reference } from "astro:content";

export const pastEventsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    featured_image: z
      .object({
        url: z.string().url(),
        alt_text: z.string(),
      })
      .optional(),
    related_past_events: z.array(reference("past-events")).optional(),
  }),
});
