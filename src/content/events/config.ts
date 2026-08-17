import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { generateEntryId } from "../shared";

export const eventsCollection = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: "./src/content/events",
    generateId: generateEntryId,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Starting date
      date: z.coerce.date(),
      // Ending date, if multi-day
      dateTo: z.coerce.date().optional(),
      // Where the event takes place
      location: z.string().optional(),
      description: z.string().optional(),
      featuredImage: image(),
      featuredImageAlt: z.string(),
      relatedPastEvents: z.array(reference("events")).optional(),
    }),
});
