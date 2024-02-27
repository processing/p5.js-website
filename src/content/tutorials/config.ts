import { z, defineCollection } from "astro:content";

export const tutorialCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    featured_image: z.string().optional(),
    related_examples: z.array(z.string()).optional(),
    // related_examples: z.array(reference("examples")).optional(),
    related_references: z.array(z.string()).optional(),
    // related_references: z.array(reference("reference")).optional(),
  }),
});
