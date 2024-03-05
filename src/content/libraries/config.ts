import { z, defineCollection } from "astro:content";
import { author, image } from "../shared";

const categories = [
  "drawing",
  "color",
  "ui",
  "math",
  "physics",
  "algorithms",
  "3d",
  "ai-ml-cv",
  "animation",
  "filters",
  "language",
  "hardware",
  "sound",
  "data",
  "networking",
  "export",
  "utils",
] as const;

export const librariesCollection = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(categories),
    sourceUrl: z.string().url(),
    websiteUrl: z.string().url().optional(),
    // 1500x1000
    featuredImage: image(),
    author: author(),
    license: z.string().optional(),
    npm: z.string().optional(),
    npmFilePath: z.string().optional(),
  }),
});
