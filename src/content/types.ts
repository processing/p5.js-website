import { referenceCollection } from "./reference/config";

type AstroBaseContentType = {
  id: string;
  slug: string;
  body: string;
  render: function;
  collection: string;
};

type WithAstroBase<T> = T & AstroBaseContentType;

export type ReferenceDocContentItem = WithAstroBase<
  z.infer<typeof referenceCollection>
>;
