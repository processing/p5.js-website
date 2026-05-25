import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { author } from "../shared";

export const categories = [
  "drawing",
  "color",
  "ui",
  "math",
  "physics",
  "algorithms",
  "3d",
  "ai-ml-cv",
  "animation",
  "shaders",
  "language",
  "hardware",
  "sound",
  "data",
  "teaching",
  "networking",
  "export",
  "utils",
] as const;

/**
 * Content collection for the Libraries section of the site.
 */
export const librariesCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: "./src/content/libraries" }),
  schema: ({ image }) =>
    z.object({
      // Name of the library
      name: z.string(),
      // Description of the library
      description: z.string(),
      // Which category the library falls in
      category: z.enum(categories),
      // Url to the source of the library (for example: on GitHub)
      sourceUrl: z.url(),
      // Url to a website for the library
      websiteUrl: z.url().optional(),
      // 1500x1000
      featuredImage: image(),
        // .refine(
        //   (img) => img.width >= 1500 && img.height >= 1000,
        //   {
        //     message: "Featured image must be 1500x1000",
        //   },
        // ),
      featuredImageAlt: z.string(),
      author: author()
        .transform((val) => [val])
        .or(z.array(author())),
      // What license is the library licensed with?
      license: z.string().optional(),
      npm: z.string().optional(),
      npmFilePath: z.string().optional(),
      featured: z.boolean().optional(),
    }),
});
