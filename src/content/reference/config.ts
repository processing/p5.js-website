import { z, defineCollection } from "astro:content";

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

export const referenceSchema = z.object({
  title: z.string(),
  module: z.string(),
  submodule: z.string().optional(),
  file: z.string(),
  description: z.string(),
  line: z.number(),
  params: z.array(paramSchema).optional(),
  itemtype: z.string().optional(),
  class: z.string().optional(),
  chainable: z.boolean().optional(),
  return: returnSchema.optional(),
  example: z.array(exampleSchema).optional(),
});

export const referenceCollection = defineCollection({
  type: "content",
  schema: referenceSchema,
});
