import { z, defineCollection } from "astro:content";

export const tutorialCollection = defineCollection({
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
    relatedExamples: z.array(z.string()).optional(),
    // related_examples: z.array(reference("examples")).optional(),
    relatedReferences: z.array(z.string()).optional(),
    // related_references: z.array(reference("reference")).optional(),
  }),
});
