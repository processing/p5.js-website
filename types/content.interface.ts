import { contentTypes, localesWithSearchSupport } from "../src/globals/globals";

export type ContentType = (typeof contentTypes)[number];

export type SearchSupportedLocales = (typeof localesWithSearchSupport)[number];
