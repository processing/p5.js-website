import type { z } from "astro/zod";
import { referenceSchema } from "./reference/config";
import type { ExampleData } from "./examples/config";

type AstroBaseContentType<T = unknown> = {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: T;
};

// Define the type for content items that include data according to referenceSchema
export type ReferenceDocContentItem = AstroBaseContentType<
  z.infer<typeof referenceSchema>
>;

// Define the type for content items that include data according to exampleSchema
export type ExampleDocContentItem = AstroBaseContentType<ExampleData>;
