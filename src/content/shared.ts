import { z } from "astro:content";

/*
 * A zod type for an image.
 * has a URL and alt text
 */
export const image = () =>
  z.object({
    url: z.string().url(),
    altText: z.string(),
  });

/*
 * A zod type for an author.
 * has a name and an optional URL to link to
 */
export const author = () =>
  z.object({
    name: z.string(),
    url: z.string().url().optional(),
  });
