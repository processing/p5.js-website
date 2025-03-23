import { z, defineCollection } from "astro:content";
import { relatedContent } from "../shared";

// Categories, ordered in a (rough) general-to-specific sequence for easier
// reading. Some bits that we haven't finished revising are moved lower down
// until we revisit them.
export const categories = [
  "Shape",
  "Color",
  "Typography",
  "Image",
  "Transform",
  "Environment", // TODO: make new category for accessibility
  "3D",
  "Rendering",
  "Math",
  "IO",
  "Events",
  "DOM",
  "Data",
  "Structure", // TODO: move to top once revised
  "Constants",
  "Foundation",
] as const;

const paramSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
  optional: z.coerce.boolean().optional(),
});

const returnSchema = z.object({
  description: z.string(),
  type: z.string().optional(),
});

const exampleSchema = z.string();

/**
 * Method schema for methods associated with a class in the Reference collection.
 */
const methodSchema = z.object({
  description: z.string().optional(),
  path: z.string(),
});

/**
 * Property schema for properties associated with a class in the Reference collection.
 */
const propertySchema = z.object({
  description: z.string().optional(),
  path: z.string(),
});

/**
 * Content collection for the Reference pages of the site.
 */
export const referenceSchema = z.object({
  // Name of the reference item
  title: z.string(),
  // Module this item is within (for example: Color)
  module: z.string().optional().default('Shape'),
  submodule: z.string().optional(),
  file: z.string(),
  description: z.string().optional(),
  deprecated: z.string().optional(),
  line: z.number().or(z.string().transform((v) => parseInt(v, 10))),
  params: z.array(paramSchema).optional(),
  overloads: z.array(z.object({ params: z.array(paramSchema) })).optional(),
  itemtype: z.string().optional(),
  class: z.string().optional(),
  chainable: z.coerce.boolean().optional(),
  beta: z.coerce.boolean().optional(),
  return: returnSchema.optional(),
  example: z.array(exampleSchema).optional(),
  relatedContent: relatedContent().optional(),
  methods: z.record(methodSchema).optional(),
  properties: z.record(propertySchema).optional(),
  isConstructor: z
    .boolean()
    .or(z.number().transform((n: number) => !!n))
    .or(z.literal("true").transform(() => true))
    .or(z.literal("false").transform(() => false))
    .optional(),
});

export const referenceCollection = defineCollection({
  type: "content",
  schema: referenceSchema,
});
