import { z, defineCollection, reference } from "astro:content";

export const eventsCollection = defineCollection({
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
      featuredImage: image(),
      featuredImageAlt: z.string(),
      relatedPastEvents: z.array(reference("events")).optional(),
    }),
});
