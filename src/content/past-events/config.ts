import { z, defineCollection, reference } from "astro:content";

export const pastEventsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date({ coerce: true }),
      description: z.string().optional(),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().optional(),
      relatedPastEvents: z.array(reference("past-events")).optional(),
    }),
});
