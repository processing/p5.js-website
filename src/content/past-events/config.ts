import { z, defineCollection, reference } from "astro:content";

export const pastEventsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Starting date
      date: z.date({ coerce: true }),
      // Ending date, if multi-day
      dateTo: z.date({ coerce: true }).optional(),
      // Where the event takes place
      location: z.string().optional(),
      description: z.string().optional(),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().optional(),
      relatedPastEvents: z.array(reference("past-events")).optional(),
    }),
});
