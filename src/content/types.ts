import type { z } from "astro/zod";
import { referenceSchema } from "./reference/config";

type AstroBaseContentType = {
  id: string;
  slug: string;
  body: string;
  collection: string;
};

type WithAstroBase<T> = T & AstroBaseContentType;

export type ReferenceDocContentItem = WithAstroBase<
  z.infer<typeof referenceSchema>
>;
