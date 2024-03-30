import { z, defineCollection } from "astro:content";
import { relatedContent } from "../shared";

const paramSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.string(),
  optional: z.boolean().optional(),
});

const returnSchema = z.object({
  description: z.string(),
  type: z.string(),
});

const exampleSchema = z.string();

/**
 * Method schema for methods associated with a class in the Reference collection.
 */
const methodSchema = z.object({
  description: z.string(),
  path: z.string(),
});

/**
 * Content collection for the Reference pages of the site.
 */
export const referenceSchema = z.object({
  // Name of the reference item
  title: z.string(),
  // Module this item is within (for example: Color)
  module: z.string(),
  submodule: z.string().optional(),
  file: z.string(),
  description: z.string(),
  line: z.number().or(z.string().transform((v) => parseInt(v, 10))),
  params: z.array(paramSchema).optional(),
  itemtype: z.string().optional(),
  class: z.string().optional(),
  chainable: z.coerce.boolean().optional(),
  return: returnSchema.optional(),
  example: z.array(exampleSchema).optional(),
  relatedContent: relatedContent().optional(),
  methods: z.record(methodSchema).optional(),
});

export const referenceCollection = defineCollection({
  type: "content",
  schema: referenceSchema,
});
