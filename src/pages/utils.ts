import { supportedLocales } from "../../astro.config.mjs";

export const removeLocalePrefixfromSlug = (slug: string): [string, string] => {
  for (const loc of supportedLocales) {
    if (slug.startsWith(loc)) return [loc, slug.replace(loc, "")];
  }
  return ["", slug];
};
