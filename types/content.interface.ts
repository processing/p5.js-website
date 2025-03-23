import { contentTypes } from "../src/globals/globals";
import { supportedLocales as localesWithSearchSupport } from "../src/i18n/const";

export type ContentType = (typeof contentTypes)[number];

export type SearchSupportedLocales = (typeof localesWithSearchSupport)[number];
