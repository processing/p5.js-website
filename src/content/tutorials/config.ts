import { z, defineCollection } from "astro:content";
import { image } from "../shared";

const categories = ["getting-started", "webgl"] as const;

export const tutorialsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).optional(),
    description: z.string().optional(),
    category: z.enum(categories),
    featuredImage: image().optional(),
    relatedExamples: z.array(z.string()).optional(),
    // related_examples: z.array(reference("examples")).optional(),
    relatedReferences: z.array(z.string()).optional(),
    // related_references: z.array(reference("reference")).optional(),
  }),
});
