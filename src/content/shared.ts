import { reference, z } from "astro:content";

/*
 * A zod type for an author.
 * has a name and an optional URL to link to
 */
export const author = () =>
  z.object({
    name: z.string(),
    url: z.string().url().optional(),
  });

/*
 * A zod type for related pages
 */
export const relatedContent = () =>
  z.object({
    // Reference pages related to this tutorial (use the slug of the reference page)
    references: z.array(reference("reference")).optional(),
    // Examples related to this tutorial (use the slug of the example)
    examples: z.array(reference("examples")).optional(),
  });
