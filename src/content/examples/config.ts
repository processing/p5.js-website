import { z, defineCollection } from "astro:content";
import { relatedContent } from "../shared";

/**
 * Content collection for the Examples section of the site.
 * Each file represents a single example.
 */
export const examplesCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      // Title of the example
      title: z.string(),
      oneLineDescription: z.string(),
      // Aria label used for the live example code
      arialabel: z.string().optional(),
      relatedContent: relatedContent().optional(),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().optional(),
    }),
});

type ImageType = {
  src: string;
  width: number;
  height: number;
  format: "png" | "jpg" | "jpeg" | "tiff" | "webp" | "gif" | "svg" | "avif";
};

export interface ExampleData {
  title: string;
  arialabel?: string;
  relatedContent?: {
    references?: string[];
    examples?: string[];
  };
  featuredImage: ImageType;
}
